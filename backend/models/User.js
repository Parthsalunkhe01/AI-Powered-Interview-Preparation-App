const mongoose = require("mongoose")

const USerSchema = new mongoose.Schema(
    {
        name : { type: String, required: true},
        email: { type: String, required: true, unique: true},
        password: { type: String, required: true},
        profileImageUrl: { type: String, default: null},
        interviewBlueprint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterviewBlueprint"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User",USerSchema);