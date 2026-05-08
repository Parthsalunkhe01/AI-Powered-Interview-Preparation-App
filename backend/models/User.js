const mongoose = require("mongoose")

const USerSchema = new mongoose.Schema(
    {
        name : { type: String, required: true},
        email: { type: String, required: true, unique: true},
        // password is optional for Google-OAuth-only accounts
        password: { type: String, default: null },
        profileImageUrl: { type: String, default: null},

        // Verification fields
        isVerified: { type: Boolean, default: false },
        otpCode: { type: String, default: null },
        otpExpiry: { type: Date, default: null },
        verifiedAt: { type: Date, default: null },

        // Google OAuth fields
        googleId: { type: String, default: null, index: true },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },

        // Last login tracking
        lastLogin: { type: Date, default: null },

        // Password reset fields
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },

        interviewBlueprint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterviewBlueprint"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", USerSchema);