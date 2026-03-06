require("dotenv").config();
const express = require("express");
const cors = require("cors");

const path = require("path");

const connectDB = require("./config/db");

const authRoute = require("./routes/authRoute");
const sessionRoute = require("./routes/sessionRoute");
const questionRoute = require("./routes/questionRoute");
const { protect } = require('./middlewares/authMiddleware');

const { generateInterviewQuestions, generateConceptExplanation } = require('./controllers/aiController');

const blueprintRoutes = require("./routes/blueprintRoutes");
const interviewSessionRoutes = require("./routes/interviewSessionRoutes");

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ["content-type", "Authorization"]
    })
);

connectDB()

//Middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoute);
app.use("/api/sessions", sessionRoute);
app.use("/api/questions", questionRoute);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);
app.use("/api/blueprint", blueprintRoutes);
app.use("/api/interview-sessions", interviewSessionRoutes);

//Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

