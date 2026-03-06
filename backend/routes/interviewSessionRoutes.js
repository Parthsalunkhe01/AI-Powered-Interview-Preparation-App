const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

const {
    createInterviewSession,
    getMyInterviewSessions,
    getInterviewSessionById,
    saveAnswers,
    saveFeedback,
    submitAnswer,
    generateAISessionFeedback,
} = require("../controllers/interviewSessionController");

router.post("/", protect, createInterviewSession);
router.get("/my-sessions", protect, getMyInterviewSessions);
router.get("/:id", protect, getInterviewSessionById);
router.put("/:id/answers", protect, saveAnswers);
router.put("/:id/feedback", protect, saveFeedback);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/generate-feedback", protect, generateAISessionFeedback);

module.exports = router;
