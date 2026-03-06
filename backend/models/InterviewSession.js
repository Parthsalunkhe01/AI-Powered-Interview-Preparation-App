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
            enum: ["technical", "behavioural", "mixed"],
            required: true,
        },
        role: String,
        experience: String,
        question: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
            },
        ],
        answers: [answerSchema],
        feedback: {
            type: Object,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
