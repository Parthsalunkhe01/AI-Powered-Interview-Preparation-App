const mongoose = require("mongoose");

const InterviewBlueprintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetRole: {
        type: String,
        required: [true, 'Target role is required'],
        trim: true,
        minlength: [2, 'Role must be at least 2 characters'],
        maxlength: [100, 'Role must not exceed 100 characters'],
        match: [/^[a-zA-Z0-9\s.\-&/]+$/, 'Role contains invalid characters']
    },
    experienceLevel: {
        type: String,
        required: [true, 'Experience level is required'],
        enum: {
            values: ['Entry', 'Mid-Level', 'Senior', 'Lead'],
            message: '{VALUE} is not a supported experience level'
        }
    },
    skills: {
        type: [String],
        validate: {
            validator: function (v) {
                return Array.isArray(v) && v.length > 0 && v.every(s => s.trim().length > 0);
            },
            message: 'At least one valid skill must be provided'
        }
    },
    companies: {
        type: [String],
        validate: {
            validator: function (v) {
                return Array.isArray(v) && v.length > 0 && v.every(c => /^[a-zA-Z0-9\s.\-&/]+$/.test(c));
            },
            message: 'Please provide valid target companies (no special characters)'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("InterviewBlueprint", InterviewBlueprintSchema);