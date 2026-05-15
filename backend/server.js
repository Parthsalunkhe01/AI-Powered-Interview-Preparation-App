require("dotenv").config();
const express = require("express");
const cors = require("cors");

const path = require("path");

const connectDB = require("./config/db");

const authRoute = require("./routes/authRoute");
const sessionRoute = require("./routes/sessionRoute");
const questionRoute = require("./routes/questionRoute");
const { protect } = require('./middlewares/authMiddleware');

const { generateInterviewQuestions, generateConceptExplanation, generateDetailedAnswers } = require('./controllers/aiController');
const { generateResources } = require('./controllers/resourceController');

const blueprintRoutes = require("./routes/blueprintRoutes");
const interviewSessionRoutes = require("./routes/interviewSessionRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { startScheduler } = require("./jobs/scheduler");
const ApiUsage = require("./models/ApiUsage");

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ["content-type", "Authorization", "Cache-Control", "Pragma", "Expires"]
    })
);

connectDB().then(() => {
    // Start background cron jobs after DB is connected
    startScheduler();
});

//Middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

//Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoute);
app.use("/api/sessions", sessionRoute);
app.use("/api/questions", questionRoute);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);
app.post("/api/ai/resources", protect, generateResources);
app.post("/api/ai/generate-answers", protect, generateDetailedAnswers);
app.use("/api/blueprint", blueprintRoutes);
app.use("/api/interview-sessions", interviewSessionRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/analytics", analyticsRoutes);

// Budget Status Route — monitor daily API usage
app.get("/api/budget/status", protect, async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const usage = await ApiUsage.findOne({ date: today }) || { groqCalls: 0, youtubeCalls: 0, serperCalls: 0 };
        const { DAILY_LIMITS } = require("./utils/budgetGuard");
        const groqPct   = Math.round((usage.groqCalls   / DAILY_LIMITS.groqCalls)    * 100);
        const ytPct     = Math.round((usage.youtubeCalls / DAILY_LIMITS.youtubeCalls) * 100);
        const serperPct = Math.round((usage.serperCalls  / DAILY_LIMITS.serperCalls)  * 100);
        const tier = groqPct >= 95 ? "OFFLINE" : groqPct >= 85 ? "MINIMAL" : groqPct >= 60 ? "REDUCED" : "FULL";
        res.json({
            date: today, tier,
            groq:    { used: usage.groqCalls,    limit: DAILY_LIMITS.groqCalls,    pct: groqPct },
            youtube: { used: usage.youtubeCalls, limit: DAILY_LIMITS.youtubeCalls, pct: ytPct },
            serper:  { used: usage.serperCalls,  limit: DAILY_LIMITS.serperCalls,  pct: serperPct },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

