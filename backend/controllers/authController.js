const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { sendPasswordResetEmail, sendOTPEmail } = require("../utils/emailService");

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a signed JWT for our platform */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/** Generate a 6-digit numeric OTP */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/** Build the standard user response object sent to the frontend */
const buildUserResponse = (user, token) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    authProvider: user.authProvider,
    isVerified: user.isVerified,
    hasBlueprint: !!user.interviewBlueprint,
    token,
});

// ─── Register (Email / Password) ────────────────────────────────────────────

//@desc   Register a new user
//@route  POST /api/auth/register
//@access Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // OTP Generation
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            authProvider: "local",
            isVerified: false, // Must verify email
            otpCode: otp,
            otpExpiry: otpExpiry,
        });

        // Send OTP via email
        try {
            await sendOTPEmail(user.email, otp, user.name);
        } catch (emailError) {
            console.error("Failed to send OTP email:", emailError.message);
            // Rollback: delete the user if the email fails to send
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: "Failed to send verification email. Please ensure the email is valid or try again later." });
        }

        // We do NOT return a token yet. The user must verify first.
        return res.status(201).json({
            message: "Registration successful. Please check your email for the verification code.",
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── Email Verification ──────────────────────────────────────────────────────

//@desc   Verify user email using OTP
//@route  POST /api/auth/verify-email
//@access Public
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Account is already verified." });
        }

        if (user.otpCode !== otp) {
            return res.status(400).json({ message: "Invalid verification code." });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
        }

        // Mark as verified
        user.isVerified = true;
        user.verifiedAt = new Date();
        user.otpCode = null;
        user.otpExpiry = null;
        await user.save();

        const token = generateToken(user._id);

        return res.status(200).json({
            message: "Email verified successfully!",
            ...buildUserResponse(user, token)
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── Resend OTP ─────────────────────────────────────────────────────────────

//@desc   Resend verification OTP
//@route  POST /api/auth/resend-otp
//@access Public
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Account is already verified." });
        }

        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        user.otpCode = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendOTPEmail(user.email, otp, user.name);

        return res.status(200).json({ message: "A new verification code has been sent to your email." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── Login (Email / Password) ────────────────────────────────────────────────

//@desc   Login user with email and password
//@route  POST /api/auth/login
//@access Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Google-only users have no password hash
        if (user.authProvider === "google" && !user.password) {
            return res.status(400).json({
                message: "This account uses Google Sign-In. Please continue with Google.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check verification status
        if (!user.isVerified) {
            return res.status(403).json({ 
                message: "Email not verified. Please verify your email to login.",
                isVerified: false,
                email: user.email
            });
        }

        user.lastLogin = new Date();
        await user.save();

        return res.json(buildUserResponse(user, generateToken(user._id)));
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── Google OAuth ────────────────────────────────────────────────────────────

//@desc   Authenticate with a Google ID token
//@route  POST /api/auth/google
//@access Public
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential token is required." });
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            console.error("Google token verification failed:", verifyError.message);
            return res.status(401).json({ message: "Invalid Google token. Please try again." });
        }

        const { sub: googleId, email, name, picture: profileImageUrl, email_verified } = payload;

        if (!email_verified) {
            return res.status(401).json({ message: "Your Google email is not verified." });
        }

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                if (!user.profileImageUrl && profileImageUrl) {
                    user.profileImageUrl = profileImageUrl;
                }
            }
            user.isVerified = true; // Google users are always verified
            user.lastLogin = new Date();
            await user.save();
        } else {
            user = await User.create({
                name,
                email,
                googleId,
                profileImageUrl: profileImageUrl || null,
                authProvider: "google",
                password: null,
                isVerified: true, // Google users are always verified
                lastLogin: new Date(),
            });
        }

        return res.status(200).json(buildUserResponse(user, generateToken(user._id)));

    } catch (error) {
        console.error("Google Auth error:", error.message);
        res.status(500).json({ message: "Google authentication failed. Please try again." });
    }
};

// ─── Get Profile ─────────────────────────────────────────────────────────────

//@desc   Get logged-in user profile
//@route  GET /api/auth/profile
//@access Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            ...user.toObject(),
            hasBlueprint: !!user.interviewBlueprint,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

//@desc   Send password reset email
//@route  POST /api/auth/forgot-password
//@access Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ message: "Email address is required." });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(200).json({
                message: "If this email is registered, you will receive a reset link shortly.",
            });
        }

        if (user.authProvider === "google" && !user.password) {
            return res.status(200).json({
                message: "If this email is registered, you will receive a reset link shortly.",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        await sendPasswordResetEmail(user.email, resetLink, user.name);

        return res.status(200).json({
            message: "If this email is registered, you will receive a reset link shortly.",
        });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

//@desc   Reset password using token from email
//@route  POST /api/auth/reset-password
//@access Public
const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: "This reset link is invalid or has expired. Please request a new one.",
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.status(200).json({
            message: "Password updated successfully. Please log in with your new password.",
        });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
};

/**
 * Update user's profile image
 * @route PUT /api/auth/profile/image
 * @access Private
 */
const updateProfileImage = async (req, res) => {
    try {
        const { profileImageUrl } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profileImageUrl = profileImageUrl || null;
        await user.save();

        return res.status(200).json({
            message: "Profile image updated successfully.",
            profileImageUrl: user.profileImageUrl,
        });
    } catch (error) {
        console.error("Update profile image error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { registerUser, verifyEmail, resendOTP, loginUser, googleAuth, getUserProfile, forgotPassword, resetPassword, updateProfileImage };