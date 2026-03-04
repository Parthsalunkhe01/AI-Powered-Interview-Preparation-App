const mongoose = require("mongoose");

const InterviewBlueprintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetRole: {
        type: String,
        required: true
    },
    experienceLevel: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        default: []
    },
    companies: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("InterviewBlueprint", InterviewBlueprintSchema);