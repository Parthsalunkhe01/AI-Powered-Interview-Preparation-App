const InterviewResult = require("../models/InterviewResult");

/**
 * Handle GET /api/analytics
 * Extracts all interview results for the authenticated user and computes
 * comprehensive mathematical aggregations for the React frontend dashboards.
 */
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch user history securely sorted ascending by created date for historical graphs
        const results = await InterviewResult.find({ userId }).sort({ createdAt: 1 });

        if (!results || results.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalInterviews: 0,
                    avgScore: 0,
                    totalTime: 0,
                    topicPerformance: [],
                    weakTopics: [],
                    strongTopics: [],
                    history: [],
                    insight: "Start your first interview to see your analytics!"
                }
            });
        }

        const totalInterviews = results.length;
        
        let totalScore = 0;
        let totalTime = 0;
        const topicMap = {}; // { topicName: { totalScore: 0, count: 0 } }
        const history = [];

        results.forEach(result => {
            totalScore += result.score;
            totalTime += result.timeTaken;
            
            history.push({
                date: result.createdAt,
                score: result.score
            });

            if (result.topics && Array.isArray(result.topics)) {
                result.topics.forEach(topic => {
                    const t = topic.trim();
                    if (!t) return;
                    if (!topicMap[t]) {
                        topicMap[t] = { totalScore: 0, count: 0 };
                    }
                    topicMap[t].totalScore += result.score;
                    topicMap[t].count += 1;
                });
            }
        });

        const avgScore = Math.round(totalScore / totalInterviews);

        // Map topicPerformance & isolate strong vs weak boundaries
        const topicPerformance = [];
        const weakTopics = [];
        const strongTopics = [];

        for (const [topic, stats] of Object.entries(topicMap)) {
            const avgTopicScore = Math.round(stats.totalScore / stats.count);
            topicPerformance.push({ topic, avgScore: avgTopicScore });

            if (avgTopicScore < 50) {
                weakTopics.push(topic);
            } else if (avgTopicScore >= 70) {
                strongTopics.push(topic);
            }
        }

        // Auto-generate AI insight string locally mapping array structures natively
        let insight = "Keep up the consistent interview practice!";
        
        if (weakTopics.length > 0 && strongTopics.length > 0) {
            insight = `You are performing strongly in ${strongTopics.slice(0, 2).join(" & ")}. However, you are struggling in ${weakTopics.slice(0, 2).join(" & ")}. Focus your next revision there!`;
        } else if (weakTopics.length > 0) {
            insight = `You are currently struggling in ${weakTopics.join(", ")}. Dedicate some time entirely to foundational concepts here.`;
        } else if (strongTopics.length > 0) {
            insight = `Incredible! You are highly proficient in ${strongTopics.join(", ")}. Keep tackling harder difficulty stages.`;
        }

        res.status(200).json({
            success: true,
            data: {
                totalInterviews,
                avgScore,
                totalTime,
                topicPerformance,
                weakTopics,
                strongTopics,
                history,
                insight
            }
        });

    } catch (error) {
        console.error("ANALYTICS_ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate user analytics.",
            error: error.message
        });
    }
};
