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
        let highestScore = 0;
        let lowestScore = 100;
        
        const domainMap = {}; // { domainName: { total: 0, count: 0 } }
        const topicMap = {}; // { topicName: { totalScore: 0, count: 0, domain: "" } }
        const history = [];

        results.forEach(result => {
            totalScore += result.score;
            totalTime += result.timeTaken;
            if (result.score > highestScore) highestScore = result.score;
            if (result.score < lowestScore) lowestScore = result.score;
            
            history.push({
                date: result.createdAt,
                score: result.score
            });

            // 1. Process Domains
            if (result.domainScores) {
                for (const [domain, score] of result.domainScores.entries()) {
                    if (!domainMap[domain]) domainMap[domain] = { total: 0, count: 0 };
                    domainMap[domain].total += score;
                    domainMap[domain].count += 1;
                }
            } else if (result.categories && result.categories.length > 0) {
                result.categories.forEach(cat => {
                    const c = cat.toLowerCase();
                    if (!domainMap[c]) domainMap[c] = { total: 0, count: 0 };
                    domainMap[c].total += result.score;
                    domainMap[c].count += 1;
                });
            }

            // 2. Process Topic Details
            if (result.topicDetails && result.topicDetails.length > 0) {
                result.topicDetails.forEach(td => {
                    if (!topicMap[td.topic]) topicMap[td.topic] = { totalScore: 0, count: 0, domain: td.domain };
                    topicMap[td.topic].totalScore += td.score;
                    topicMap[td.topic].count += 1;
                });
            } else if (result.topics && Array.isArray(result.topics)) {
                // Fallback for legacy
                result.topics.forEach(topic => {
                    const t = topic.trim();
                    if (!t) return;
                    if (!topicMap[t]) topicMap[t] = { totalScore: 0, count: 0, domain: "General" };
                    topicMap[t].totalScore += result.score;
                    topicMap[t].count += 1;
                });
            }
        });

        const avgScore = Math.round(totalScore / totalInterviews);

        const topicPerformance = [];
        const groupedStrengths = {}; // { domain: [topics] }
        const groupedWeaknesses = {};

        for (const [topic, stats] of Object.entries(topicMap)) {
            const avgTopicScore = Math.round(stats.totalScore / stats.count);
            const domain = stats.domain || "General";
            
            topicPerformance.push({ topic, avgScore: avgTopicScore, domain });

            if (avgTopicScore < 60) {
                if (!groupedWeaknesses[domain]) groupedWeaknesses[domain] = [];
                groupedWeaknesses[domain].push(topic);
            } else if (avgTopicScore >= 75) {
                if (!groupedStrengths[domain]) groupedStrengths[domain] = [];
                groupedStrengths[domain].push(topic);
            }
        }

        const domainPerformance = [];
        for (const [domain, stats] of Object.entries(domainMap)) {
            domainPerformance.push({
                domain: domain.toUpperCase(),
                score: Math.round(stats.total / stats.count)
            });
        }

        const summary = {
            strong: Object.values(groupedStrengths).flat().slice(0, 3),
            weak: Object.values(groupedWeaknesses).flat().slice(0, 3),
            recommendation: Object.values(groupedWeaknesses).flat().length > 0 
                ? `Focus your next practice sessions on ${Object.values(groupedWeaknesses).flat().slice(0, 2).join(" and ")}.`
                : "Mastery achieved! Try 'Real' difficulty for advanced simulation."
        };

        res.status(200).json({
            success: true,
            data: {
                totalInterviews,
                avgScore,
                highestScore,
                lowestScore: lowestScore === 100 ? 0 : lowestScore,
                totalTime,
                topicPerformance: topicPerformance.sort((a,b) => b.avgScore - a.avgScore),
                domainPerformance: domainPerformance.sort((a,b) => b.score - a.score),
                groupedStrengths,
                groupedWeaknesses,
                history,
                summary,
                insight: `Strong showing in ${Object.values(groupedStrengths).flat().slice(0, 2).join(", ") || "core areas"}.`
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
