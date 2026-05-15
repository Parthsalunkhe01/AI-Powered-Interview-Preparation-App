const mongoose = require("mongoose");

const interviewResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    topics: {
      type: [String],
      default: [],
    },
    topicDetails: [{
      topic: String,
      domain: String,
      score: Number
    }],
    categories: {
      type: [String],
      default: [],
    },
    domainScores: {
      type: Map,
      of: Number,
      default: {}, // e.g. { "dsa": 85, "system_design": 60 }
    },
    timeTaken: {
      type: Number, // Stored in seconds
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewResult", interviewResultSchema);
