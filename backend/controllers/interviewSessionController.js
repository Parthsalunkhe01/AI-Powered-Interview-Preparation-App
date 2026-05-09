const InterviewSession = require("../models/InterviewSession");
const Question = require("../models/Question");
const Blueprint = require("../models/InterviewBlueprint");
const InterviewResult = require("../models/InterviewResult");

const { selectNextQuestion, estimateAnswerScore } = require("../services/adaptiveEngine");
const { generateStructuredFeedback } = require("../services/aiFeedbackEngine");

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

        const history = session.question.map((q, idx) => ({
            question: q.question,
            answer: answerMap[q._id.toString()]?.text || "",
            code: answerMap[q._id.toString()]?.code || "",
            image: answerMap[q._id.toString()]?.image || "",
            category: session.questionMeta?.[idx]?.category || "General",
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

        const history = session.question.map((q, idx) => ({
            question: q.question,
            answer: answerMap[q._id.toString()] || "",
            category: session.questionMeta?.[idx]?.category || "General",
            type: session.questionMeta?.[idx]?.type || "conceptual",
        }));

        const feedbackData = await generateStructuredFeedback({
            role: session.role,
            experience: session.experience,
            mode: session.mode,
            focus: session.focus || session.type,
            history,
            answers: session.answers,
        });

        // Save analytics (de-dupe by 10s window)
        const tenSecondsAgo = new Date(Date.now() - 10000);
        const duplicateCheck = await InterviewResult.findOne({
            userId: req.user._id,
            createdAt: { $gte: tenSecondsAgo },
        });

        if (!duplicateCheck) {
            await InterviewResult.create({
                userId: req.user._id,
                score: feedbackData.overallScore || 0,
                totalQuestions: history.length,
                correctAnswers: feedbackData.correctAnswers || 0,
                topics: feedbackData.topics || feedbackData.suggestedTopics || [],
                timeTaken: Math.max(0, Math.floor((new Date() - session.createdAt) / 1000)),
            });
        }

        res.status(200).json({ success: true, feedback: feedbackData });

    } catch (error) {
        console.error("GENERATE_FEEDBACK_ERROR:", error);
        res.status(500).json({
            success: false, message: "Failed to generate feedback", error: error.message,
        });
    }
};
