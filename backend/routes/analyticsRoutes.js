const express = require("express");
const { getUserAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getUserAnalytics);

module.exports = router;
