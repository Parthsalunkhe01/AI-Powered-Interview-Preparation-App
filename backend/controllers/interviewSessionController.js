const InterviewSession = require("../models/InterviewSession");
const Question = require("../models/Question");
const Blueprint = require("../models/InterviewBlueprint");
const InterviewResult = require("../models/InterviewResult");

const { selectNextQuestion, estimateAnswerScore } = require("../services/adaptiveEngine");
const { generateStructuredFeedback } = require("../services/aiFeedbackEngine");
const { generateGuideContent } = require("../utils/guideGenerator");
const { fetchAndVerifyResources, fetchStaticResourcesOnly } = require("./resourceController");
const { parallelWithLimit } = require("../utils/cachedAI");

// @desc   Create a new interview session
// @route  POST /api/interview-sessions
// @access Private
exports.createInterviewSession = async (req, res) => {
    try {
        const { mode, focus, questionLimit } = req.body;

        const blueprint = await Blueprint.findOne({ user: req.user._id });

        const session = await InterviewSession.create({
            user: req.user._id,
            company: blueprint?.targetCompanies?.[0] || blueprint?.companies?.[0] || "General",
            type: focus || "mixed",
            role: blueprint?.targetRole || "Software Engineer",
            experience: blueprint?.experienceLevel || "Entry",
            mode: mode || "standard",
            focus: focus || "mixed",
            difficulty: "adaptive",
            questionLimit: questionLimit || 5,
            blueprint: blueprint?._id,
            usedLocalIds: [],
            questionMeta: [],
        });

        res.status(201).json({ success: true, session });
    } catch (error) {
        console.error("CREATE_SESSION_ERROR:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc   Get all interview sessions for logged-in user
// @route  GET /api/interview-sessions/my-sessions
// @access Private
exports.getMyInterviewSessions = async (req, res) => {
    try {
        const sessions = await InterviewSession.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate("question");
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc   Get a single interview session by ID
// @route  GET /api/interview-sessions/:id
// @access Private
exports.getInterviewSessionById = async (req, res) => {
    try {
        const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id })
            .populate({ path: "question", options: { sort: { createdAt: 1 } } })
            .exec();

        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }
        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc   Save answers for an interview session
// @route  PUT /api/interview-sessions/:id/answers
// @access Private
exports.saveAnswers = async (req, res) => {
    try {
        const { answers } = req.body;
        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: "answers must be an array." });
        }
        const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user.id });
        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }
        session.answers = answers;
        await session.save();
        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

const { saveBase64Image } = require("../utils/imageHandler");

// @desc   Submit an answer and receive the next adaptive question
// @route  POST /api/interview-sessions/:id/answer
// @access Private
exports.submitAnswer = async (req, res) => {
    try {
        const { questionId, answer, code, language, image: base64Image } = req.body;

        const session = await InterviewSession.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate("question");

        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }

        // Process image if provided (convert base64 to URL)
        let imageUrl = "";
        if (base64Image && base64Image.startsWith("data:image/")) {
            imageUrl = await saveBase64Image(base64Image);
        } else if (base64Image) {
            imageUrl = base64Image; // Already a URL
        }

        // Save this answer
        if (questionId) {
            const existingIdx = session.answers.findIndex(
                a => a.questionId.toString() === questionId.toString()
            );
            if (existingIdx >= 0) {
                session.answers[existingIdx].answerText = answer || "";
                session.answers[existingIdx].code = code || "";
                session.answers[existingIdx].language = language || "javascript";
                session.answers[existingIdx].image = imageUrl || "";
            } else {
                session.answers.push({ 
                    questionId, 
                    answerText: answer || "",
                    code: code || "",
                    language: language || "javascript",
                    image: imageUrl || "",
                });
            }
        }

        // Build Q&A history
        const answerMap = {};
        session.answers.forEach(a => { 
            answerMap[a.questionId.toString()] = {
                text: a.answerText,
                code: a.code,
                image: a.image
            }; 
        });

        // IMPORTANT: questionMeta[0] = Q2's meta, [1] = Q3's meta, etc.
        // Q1 (idx=0) was generated before session started — no meta entry.
        const history = session.question.map((q, idx) => ({
            question: q.question,
            answer: answerMap[q._id.toString()]?.text || "",
            code: answerMap[q._id.toString()]?.code || "",
            image: answerMap[q._id.toString()]?.image || "",
            category: idx > 0 ? (session.questionMeta?.[idx - 1]?.category || "General") : "General",
        }));

        // Check if interview is complete
        const limit = session.questionLimit || 5;
        if (history.length >= limit) {
            await session.save();
            return res.status(200).json({
                success: true, isComplete: true, totalAnswered: history.length,
            });
        }

        // Get focus from session (new field) or fall back to type
        const focus = session.focus || session.type || "mixed";
        const role = session.role || "Software Engineer";
        const mode = session.mode || "standard";

        // Select next question
        const nextQData = await selectNextQuestion({
            role, focus, company: session.company || "General", mode,
            history,
            usedQuestionIds: session.usedLocalIds || [],
            lastLocalQuestionId: session.lastLocalQuestionId || null,
        });

        // Duplicate prevention
        const isDuplicate = session.question.some(
            q => q.question.toLowerCase().trim() === nextQData.question.toLowerCase().trim()
        );

        if (isDuplicate) {
            const retry = await selectNextQuestion({
                role, focus, company: session.company || "General", mode,
                history,
                usedQuestionIds: [...(session.usedLocalIds || []), nextQData.localId],
                lastLocalQuestionId: null,
            });
            Object.assign(nextQData, retry);
        }

        // Persist new question
        const newQuestionDoc = await Question.create({
            session: session._id,
            question: nextQData.question,
            answer: "",
        });

        if (!Array.isArray(session.question)) session.question = [];
        session.question.push(newQuestionDoc._id);

        // Update tracking
        if (!Array.isArray(session.usedLocalIds)) session.usedLocalIds = [];
        if (nextQData.localId && !nextQData.isFollowUp) {
            session.usedLocalIds.push(nextQData.localId);
        }
        session.lastLocalQuestionId = nextQData.localId || session.lastLocalQuestionId;

        if (!Array.isArray(session.questionMeta)) session.questionMeta = [];
        session.questionMeta.push({
            category: nextQData.category,
            difficulty: nextQData.difficulty,
            type: nextQData.type,
            tags: nextQData.tags,
            isFollowUp: nextQData.isFollowUp,
        });

        session.markModified("usedLocalIds");
        session.markModified("questionMeta");
        await session.save();

        res.status(200).json({
            success: true,
            isComplete: false,
            nextQuestion: nextQData.question,
            questionId: newQuestionDoc._id,
            category: nextQData.category,
            difficulty: nextQData.difficulty,
            type: nextQData.type || "conceptual",
            tags: nextQData.tags || [],
            isFollowUp: nextQData.isFollowUp || false,
            questionNumber: history.length + 1,
            totalQuestions: limit,
        });

    } catch (error) {
        console.error("SUBMIT_ANSWER_ERROR:", error);
        res.status(500).json({ message: "Failed to generate next question", error: error.message });
    }
};

// @desc   Generate AI feedback for a completed session
// @route  POST /api/interview-sessions/:id/generate-feedback
// @access Private
exports.generateAISessionFeedback = async (req, res) => {
    try {
        const session = await InterviewSession.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate("question");

        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }

        const answerMap = {};
        session.answers.forEach(a => { answerMap[a.questionId.toString()] = a.answerText; });

        // IMPORTANT: questionMeta[0] = Q2's meta, [1] = Q3's meta etc.
        // Q1 (idx=0) was generated BEFORE the session started, it has no meta entry.
        // So for question at idx, its meta is questionMeta[idx-1] (idx >= 1).
        const history = session.question.map((q, idx) => ({
            question: q.question,
            answer: answerMap[q._id.toString()] || "",
            category: idx > 0 ? (session.questionMeta?.[idx - 1]?.category || "General") : "General",
            type: idx > 0 ? (session.questionMeta?.[idx - 1]?.type || "conceptual") : "conceptual",
        }));

        const feedbackData = await generateStructuredFeedback({
            role: session.role,
            experience: session.experience,
            mode: session.mode,
            focus: session.focus || session.type,
            history,
            answers: session.answers,
        });

        // Save analytics (Strict de-dupe by sessionId)
        const duplicateCheck = await InterviewResult.findOne({
            sessionId: session._id
        });

        if (!duplicateCheck) {
            // Calculate domain scores for this session
            // Note: questionMeta[0]=Q2's meta, [1]=Q3's, etc. Use idx-1 to correct.
            const domainTotals = {};
            const domainCounts = {};
            
            feedbackData.questionFeedback?.forEach(qf => {
                const meta = qf.index > 0 ? session.questionMeta?.[qf.index - 1] : null;
                const domain = (meta?.category || "General").toLowerCase();
                
                if (!domainTotals[domain]) {
                    domainTotals[domain] = 0;
                    domainCounts[domain] = 0;
                }
                domainTotals[domain] += (qf.questionScore || 0);
                domainCounts[domain] += 1;
            });

            const domainScores = {};
            for (const domain in domainTotals) {
                domainScores[domain] = Math.round(domainTotals[domain] / domainCounts[domain]);
            }

            const uniqueCategories = [...new Set(
                session.question.map((_, idx) =>
                    idx > 0 ? session.questionMeta?.[idx - 1]?.category : null
                ).filter(Boolean)
            )];

            const topicDetails = [];
            feedbackData.questionFeedback?.forEach(qf => {
                const meta = qf.index > 0 ? session.questionMeta?.[qf.index - 1] : null;
                const domain = meta?.category || "General";
                const score = qf.questionScore || 0;
                
                meta?.tags?.forEach(tag => {
                    topicDetails.push({ topic: tag, domain, score });
                });
            });

            try {
                await InterviewResult.create({
                    userId: req.user._id,
                    score: feedbackData.overallScore || 0,
                    totalQuestions: history.length,
                    correctAnswers: feedbackData.correctAnswers || 0,
                    topics: feedbackData.topics || feedbackData.suggestedTopics || [],
                    topicDetails: topicDetails,
                    categories: uniqueCategories,
                    domainScores: domainScores,
                    timeTaken: Math.max(0, Math.floor((new Date() - session.createdAt) / 1000)),
                    sessionId: session._id,
                });
            } catch (createErr) {
                // If it's a duplicate key error, someone else already saved it (race condition)
                if (createErr.code === 11000) {
                    console.log(`  [Analytics]: Result for session ${session._id} already exists, skipping create.`);
                } else {
                    throw createErr;
                }
            }
        }

        res.status(200).json({ success: true, feedback: feedbackData });

    } catch (error) {
        console.error("GENERATE_FEEDBACK_ERROR:", error);
        res.status(500).json({
            success: false, message: "Failed to generate feedback", error: error.message,
        });
    }
};

// @desc   Export detailed preparation guide for PDF
// @route  GET /api/interview-sessions/:id/export-guide
// @access Private
exports.exportInterviewGuide = async (req, res) => {
    // Hard server-side timeout — prevents the request from hanging indefinitely
    const EXPORT_TIMEOUT_MS = 120_000; // 2 minutes
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("EXPORT_TIMEOUT")), EXPORT_TIMEOUT_MS)
    );

    try {
        const exportWork = async () => {
            const session = await InterviewSession.findOne({
                _id: req.params.id,
                user: req.user._id,
            }).populate("question");

            if (!session) {
                return res.status(404).json({ success: false, message: "Session not found." });
            }

            const result = await InterviewResult.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
            console.log(`  [PDF_EXPORT]: Session ${session._id}, ${session.question?.length || 0} questions, result: ${!!result}`);

            // 1. Summary Data
            let mainFocus = "General";
            if (result?.topicDetails?.length > 0) {
                const sorted = [...result.topicDetails].sort((a, b) => (a.score || 0) - (b.score || 0));
                mainFocus = sorted[0]?.domain || sorted[0]?.topic || "General";
            }

            const summary = {
                role:        session.role || "Software Engineer",
                experience:  session.experience || "Entry",
                date:        new Date(session.createdAt).toLocaleDateString(),
                score:       result?.score || 0,
                status:      result?.score >= 75 ? "Ready" : result?.score >= 50 ? "Progressing" : "Needs Work",
                strongAreas: result?.categories?.slice(0, 2) || [],
                mainFocus,
                oneLiner: result?.score >= 70
                    ? "You have a solid technical foundation. Focus on polishing edge cases."
                    : "Focus on closing fundamentals gaps in your weakest domain."
            };

            // 2. Generate content per question
            // Resources use the static pool (instant — no extra API calls during export)
            // so the export stays fast regardless of YouTube/Serper quota status.
            const seenLinks    = new Set();
            const seenVideoIds = new Set();

            console.log(`  [PDF_EXPORT]: Generating coaching content (parallel, max 2 concurrent)...`);

            const questionTasks = (session.question || []).map((q, idx) => async () => {
                const qText    = q?.question || (typeof q === "string" ? q : "Technical Question");
                const qId      = q?._id?.toString();
                const answer   = session.answers?.find(a => a.questionId?.toString() === qId);
                const category = idx > 0 ? (session.questionMeta?.[idx - 1]?.category || "General") : "General";

                try {
                    // Run guide coaching (Groq) + static resource lookup in parallel
                    const [coaching, resources] = await Promise.all([
                        generateGuideContent(qText, answer?.answerText || "", category),
                        fetchStaticResourcesOnly(qText, seenLinks, seenVideoIds),
                    ]);

                    console.log(`  [PDF_EXPORT]: ✅ Q${idx + 1} done`);
                    return {
                        number:            idx + 1,
                        question:          qText,
                        idealAnswer:       coaching.idealAnswer,
                        coreBreakdown:     coaching.coreBreakdown,
                        keyInsights:       coaching.keyInsights,
                        productionInsight: coaching.productionInsight,
                        mistakes:          coaching.mistakes,
                        suggestedStack:    coaching.suggestedStack,
                        followUps:         coaching.followUps,
                        videos:   (resources.videos   || []).slice(0, 2).map(v => ({ title: v.title, url: v.url || `https://youtube.com/watch?v=${v.videoId}` })),
                        articles: (resources.articles || []).slice(0, 2).map(a => ({ title: a.title, url: a.url || a.link })),
                    };
                } catch (innerErr) {
                    console.error(`  [PDF_EXPORT]: ⚠️ Q${idx + 1} error:`, innerErr.message);
                    return {
                        number: idx + 1, question: qText,
                        idealAnswer: "Consult industry best practices for this topic.",
                        coreBreakdown: "", keyInsights: "", productionInsight: "",
                        mistakes: "", suggestedStack: "", followUps: "",
                        videos: [], articles: [],
                    };
                }
            });

            // Limit to 2 concurrent (was 3) — reduces Groq rate-limit pressure
            const questions = await parallelWithLimit(questionTasks, 2);

            const filename = `Interview_Guide_${(session.role || "Dev").replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
            console.log(`  [PDF_EXPORT]: ✅ Export complete — ${questions.length} questions`);

            return res.status(200).json({
                success: true,
                filename,
                data: {
                    summary,
                    questions,
                    finalAdvice: [
                        "Speak out loud during coding tasks to show your thought process.",
                        "Always mention Big O complexity for your solutions.",
                        "Review trade-offs between different architectural approaches."
                    ]
                }
            });
        };

        await Promise.race([exportWork(), timeoutPromise]);

    } catch (error) {
        if (error.message === "EXPORT_TIMEOUT") {
            console.error("[PDF_EXPORT]: ⏱️ Export timed out after 120s");
            return res.status(504).json({
                success: false,
                message: "The guide is taking longer than expected. Please try again in a moment — your session data is safe."
            });
        }
        console.error("EXPORT_GUIDE_ERROR:", error.stack || error.message);
        res.status(500).json({ success: false, message: "Failed to export guide.", error: error.message });
    }
};
