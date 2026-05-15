const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        answerText: {
            type: String,
            default: "",
        },
        code: {
            type: String,
            default: "",
        },
        language: {
            type: String,
            default: "javascript",
        },
        image: {
            type: String, // URL or base64
            default: "",
        },
    },
    { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: "mixed",
        },
        role: String,
        experience: String,

        // Interview focus: what topic category the session targets
        focus: {
            type: String,
            default: "mixed",
        },

        // Interview mode: determines difficulty progression and AI tone
        mode: {
            type: String,
            enum: ["beginner", "standard", "real"],
            default: "standard",
        },

        // Kept for backward compat — now fully adaptive
        difficulty: {
            type: String,
            default: "adaptive",
        },

        questionLimit: {
            type: Number,
            default: 5,
        },

        blueprint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterviewBlueprint",
        },

        question: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
            },
        ],

        answers: [answerSchema],

        // Track which local question IDs have been used (prevents repeats)
        usedLocalIds: {
            type: [String],
            default: [],
        },

        // Store the last local question ID for follow-up logic
        lastLocalQuestionId: {
            type: String,
            default: null,
        },

        // Question metadata (category, tags, difficulty per question)
        questionMeta: {
            type: [Object],
            default: [],
        },

        feedback: {
            type: Object,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
