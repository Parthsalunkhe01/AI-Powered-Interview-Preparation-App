const express = require("express");
const {
    registerUser,
    verifyEmail,
    resendOTP,
    loginUser,
    googleAuth,
    getUserProfile,
    forgotPassword,
    resetPassword,
    updateProfileImage,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ── Registration & Verification ──────────────────────────────────────────
router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);

// ── Standard Login ─────────────────────────────────────────────────────────
router.post("/login", loginUser);

// ── Google OAuth ───────────────────────────────────────────────────────────
router.post("/google", googleAuth);

// ── Protected Profile ──────────────────────────────────────────────────────
router.get("/profile", protect, getUserProfile);

// ── Password Reset ─────────────────────────────────────────────────────────
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ── Profile Image Upload ───────────────────────────────────────────────────
router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

// ── Profile Image Update ───────────────────────────────────────────────────
router.put("/profile/image", protect, updateProfileImage);

module.exports = router;
