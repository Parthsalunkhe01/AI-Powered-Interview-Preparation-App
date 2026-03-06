const InterviewSession = require("../models/InterviewSession");
const Question = require("../models/Question");
const Blueprint = require("../models/InterviewBlueprint");
const { generateFirstQuestion, generateFollowUpQuestion } = require("../services/aiInterviewEngine");
const { generateFeedback } = require("../services/aiFeedbackEngine");

//@desc   Create a new interview session
//@route  POST /api/interview-sessions
//@access Private
exports.createInterviewSession = async (req, res) => {
    try {
        const { company, type, questions, difficulty, questionLimit } = req.body;

        // Fetch user blueprint for context
        const blueprint = await Blueprint.findOne({ user: req.user._id });

        const session = await InterviewSession.create({
            user: req.user._id,
            company: company || blueprint?.targetCompanies?.[0] || blueprint?.company || "General",
            type: type || "technical",
            role: req.body.role || blueprint?.targetRole || "",
            experience: req.body.experience || blueprint?.experienceLevel || "",
            difficulty: difficulty || "medium",
            questionLimit: questionLimit || 5,
            blueprint: blueprint?._id,
        });

        // If questions are provided, create Question docs and link them
        if (Array.isArray(questions) && questions.length > 0) {
            const questionDocs = await Promise.all(
                questions.map((q) =>
                    Question.create({
                        session: session._id,
                        question: q.question,
                        answer: q.answer,
                    })
                )
            );
            session.question = questionDocs.map((q) => q._id);
            await session.save();
        }

        res.status(201).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

//@desc   Get all interview sessions for logged-in user
//@route  GET /api/interview-sessions/my-sessions
//@access Private
exports.getMyInterviewSessions = async (req, res) => {
    try {
        const sessions = await InterviewSession.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate("questions");

        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

//@desc   Get a single interview session by ID
//@route  GET /api/interview-sessions/:id
//@access Private
exports.getInterviewSessionById = async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.id)
            .populate({
                path: "question",
                options: { sort: { isPinned: -1, createdAt: 1 } },
            })
            .exec();

        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

//@desc   Save answers for an interview session
//@route  PUT /api/interview-sessions/:id/answers
//@access Private
exports.saveAnswers = async (req, res) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: "answers must be an array." });
        }

        const session = await InterviewSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }

        if (session.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to update this session." });
        }

        session.answers = answers;
        await session.save();

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

//@desc   Save feedback for an interview session
//@route  PUT /api/interview-sessions/:id/feedback
//@access Private
exports.saveFeedback = async (req, res) => {
    try {
        const { feedback } = req.body;

        const session = await InterviewSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }

        if (session.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to update this session." });
        }

        session.feedback = feedback || "";
        await session.save();

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

//@desc   Generate AI feedback for a completed session
//@route  POST /api/interview-sessions/:id/generate-feedback
//@access Private
exports.generateAISessionFeedback = async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.id).populate("question");
        if (!session) {
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }

        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to access this session feedback." });
        }

        const answerMap = {};
        session.answers.forEach((a) => {
            answerMap[a.questionId.toString()] = a.answerText;
        });

        const history = session.question.map((q) => ({
            question: q.question,
            answer: answerMap[q._id.toString()] || "",
        }));

        const feedbackData = await generateFeedback({
            company: session.company,
            type: session.type,
            role: session.role,
            experience: session.experience,
            history,
        });

        res.status(200).json({
            success: true,
            feedback: feedbackData,
        });
    } catch (error) {
        console.error("GENERATE_FEEDBACK_ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate AI feedback",
            error: error.message,
        });
    }
};

//@desc   Submit an answer and receive the next AI-generated interview question
//@route  POST /api/interview-sessions/:id/answer
//@access Private
exports.submitAnswer = async (req, res) => {
    console.log("Submit Answer Request Body:", req.body);
    try {
        const { questionId, answer } = req.body;

        // 1. Find the session (populate existing questions for history)
        const session = await InterviewSession.findById(req.params.id).populate("question");
        if (!session) {
            console.error("Submit Answer: Session not found", req.params.id);
            return res.status(404).json({ success: false, message: "Interview session not found." });
        }

        // 2. Ownership check
        if (session.user.toString() !== req.user._id.toString()) {
            console.error("Submit Answer: Unauthorized access", session.user, req.user._id);
            return res.status(401).json({ message: "Not authorized to update this session." });
        }

        // 3. Save the candidate's answer if a questionId was supplied
        if (questionId) {
            session.answers.push({ questionId, answerText: answer || "" });
        }

        // 4. Fetch user blueprint for AI context
        const blueprint = await Blueprint.findOne({ user: req.user._id });

        // populate role/experience if missing (first time)
        if (!session.role && blueprint) {
            session.role = blueprint.targetRole;
            session.experience = blueprint.experienceLevel;
        }

        // 5. Build Q&A history for the AI prompt
        const answerMap = {};
        session.answers.forEach((a) => {
            answerMap[a.questionId.toString()] = a.answerText;
        });

        const history = session.question.map((q) => ({
            question: q.question,
            answer: answerMap[q._id.toString()] || "",
        }));

        // 6. Check if we should conclude the interview
        const limit = session.questionLimit || 5;
        if (history.length >= limit) {
            console.log(`Interview complete (${limit} questions reached).`);
            return res.status(200).json({
                success: true,
                isComplete: true
            });
        }

        // 7. Generate next question
        let nextQuestionText;
        if (history.length === 0 || !questionId) {
            console.log("Generating first question...");
            nextQuestionText = await generateFirstQuestion({
                company: session.company,
                type: session.type,
                blueprint,
            });
        } else {
            console.log("Generating follow-up question...");
            nextQuestionText = await generateFollowUpQuestion({
                company: session.company,
                type: session.type,
                blueprint,
                history,
            });
        }

        // 7.5 Duplicate Prevention Logic
        const isDuplicate = session.question.some(
            (q) => q.question.toLowerCase().trim() === nextQuestionText.toLowerCase().trim()
        );

        if (isDuplicate) {
            console.warn("Duplicate question detected. Modifying to avoid loop.");
            nextQuestionText += " Also, could you specifically mention any trade-offs you considered?";
        }

        // 8. Persist the new AI question as a Question document
        const newQuestionDoc = await Question.create({
            session: session._id,
            question: nextQuestionText,
            answer: "",
        });

        if (!Array.isArray(session.question)) {
            session.question = [];
        }

        session.question.push(newQuestionDoc._id);
        await session.save();

        res.status(200).json({
            success: true,
            isComplete: false,
            nextQuestion: nextQuestionText,
            questionId: newQuestionDoc._id,
        });
    } catch (error) {
        console.error("SUBMIT_ANSWER_ERROR:", error);
        res.status(500).json({
            message: "AI generation failed",
            error: error.message
        });
    }
};
