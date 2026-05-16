const InterviewResult = require("../models/InterviewResult");

// ── Topic Sanitizer ───────────────────────────────────────────────────────────
// Filters out junk topic names: difficulty labels, single words that are
// clearly not domain topics (e.g. "Easy", "Medium", "Two Sum", "1", "null").
const JUNK_TOPICS = new Set([
    "easy", "medium", "hard", "beginner", "intermediate", "advanced",
    "true", "false", "null", "undefined", "none", "n/a", "na",
    "question", "answer", "topic", "general", "other", "misc",
    "two sum", "three sum", "fizzbuzz", "hello world",
]);

function isValidTopic(topic) {
    if (!topic || typeof topic !== "string") return false;
    const t = topic.trim().toLowerCase();
    if (t.length < 3) return false;             // too short
    if (/^\d+$/.test(t)) return false;          // pure number
    if (JUNK_TOPICS.has(t)) return false;        // known junk
    if (/^(easy|medium|hard)\s/i.test(t)) return false; // "Easy Arrays" etc.
    return true;
}

// ── Decision Helpers ──────────────────────────────────────────────────────────

const BENCHMARK = { dsa: 65, android: 60, system_design: 55, database: 62, java: 60, hr: 70, behavioral: 65, arrays: 58 };

function getStatus(score, benchmark) {
    const delta = score - benchmark;
    if (delta <= -15) return { label: "CRITICAL", color: "rose" };
    if (delta < 0) return { label: "NEEDS WORK", color: "amber" };
    return { label: "READY", color: "emerald" };
}

// ── Action Generator (Strict Quality Rules) ──────────────────────────────────

function generateSpecificAction(topic, severity, isDomainTask = false) {
    if (isDomainTask) {
        return `Revise ${topic} core lifecycle and architectural patterns (20 mins)`;
    }
    if (severity === "high") {
        return `Solve 2 Easy and 1 Medium problem on "${topic}" (45 mins)`;
    }
    if (severity === "medium") {
        return `Attempt 2 Medium problems on "${topic}" using the two-pointer or sliding window technique (30 mins)`;
    }
    return `Quickly review 3 common interview questions on "${topic}" (15 mins)`;
}

// ── Main Logic ───────────────────────────────────────────────────────────────

exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const results = await InterviewResult.find({ userId }).sort({ createdAt: 1 });

        if (!results || results.length === 0) {
            return res.status(200).json({ success: true, data: { totalInterviews: 0 } });
        }

        const scores = results.map(r => r.score);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        
        // 1. Domain Map
        const domainMap = {};
        const topicMap = {};
        results.forEach(r => {
            // Mongoose Maps are serialised as plain objects; iterate via Object.entries
            const domainScoresObj = r.domainScores
                ? (r.domainScores instanceof Map
                    ? Object.fromEntries(r.domainScores)
                    : r.domainScores.toObject ? r.domainScores.toObject() : r.domainScores)
                : {};
            if (Object.keys(domainScoresObj).length > 0) {
                for (const [d, s] of Object.entries(domainScoresObj)) {
                    if (!domainMap[d]) domainMap[d] = { total: 0, count: 0 };
                    domainMap[d].total += (typeof s === 'number' ? s : 0);
                    domainMap[d].count += 1;
                }
            }
            if (r.topicDetails && r.topicDetails.length > 0) {
                r.topicDetails.forEach(td => {
                    if (!isValidTopic(td.topic)) return; // skip junk topics
                    const key = td.topic.trim();
                    if (!topicMap[key]) topicMap[key] = { total: 0, count: 0, domain: td.domain };
                    topicMap[key].total += (td.score ?? 0);
                    topicMap[key].count += 1;
                });
            } else if (r.topics && r.topics.length > 0) {
                // Fallback: no granular tag data — seed topicMap from AI-suggested topics
                // using session's overall score so Signal Areas have real data
                r.topics.forEach(topic => {
                    if (!isValidTopic(topic)) return;
                    const key = topic.trim();
                    if (!topicMap[key]) topicMap[key] = { total: 0, count: 0, domain: "General" };
                    topicMap[key].total += (r.score || 0);
                    topicMap[key].count += 1;
                });
            }
        });

        // 2. Domain Performance + Weakest Find
        const domainPerformance = Object.entries(domainMap).map(([d, stats]) => {
            const score = Math.round(stats.total / stats.count);
            const benchmark = BENCHMARK[d.toLowerCase()] || 60;
            return { domain: d.toUpperCase(), score, benchmark, delta: score - benchmark };
        }).sort((a, b) => a.delta - b.delta);

        const weakest = domainPerformance[0];

        // 3. Improvement Areas (Capped at 5)
        const flatWeak = Object.entries(topicMap)
            .map(([topic, stats]) => ({
                topic,
                avgScore: Math.round(stats.total / stats.count),
                domain: stats.domain
            }))
            .filter(t => t.avgScore < 60)
            .map(t => ({
                ...t,
                severity: t.avgScore < 35 ? "high" : t.avgScore < 50 ? "medium" : "low"
            }))
            .sort((a, b) => {
                // Primary sort: high severity first
                if (a.severity === "high" && b.severity !== "high") return -1;
                if (b.severity === "high" && a.severity !== "high") return 1;
                // Secondary sort: lowest score first
                return a.avgScore - b.avgScore;
            })
            .slice(0, 5);

        // 4. MAIN FOCUS CARD logic
        const mainFocus = weakest ? {
            domain: weakest.domain,
            score: weakest.score,
            status: getStatus(weakest.score, weakest.benchmark),
            gap: Math.abs(weakest.delta),
            impact: `Your ${weakest.domain} performance is currently the primary drag on your overall readiness.`,
            actions: [
                generateSpecificAction(`${weakest.domain} Fundamentals`, "high", true),
                generateSpecificAction(flatWeak.find(w => w.domain === weakest.domain)?.topic || "Core Concepts", "high"),
                `Attempt 1 Medium-difficulty Mock Interview focused on ${weakest.domain}`
            ],
            expectedImprovement: `Focusing here will likely boost your aggregate score by +${Math.round(Math.abs(weakest.delta) * 0.3)}%`
        } : null;

        // 5. DAILY ACTION PLAN (Capped at 3)
        // Deduplicate from Main Focus actions if possible
        const actionPlan = flatWeak
            .filter(w => !mainFocus?.actions?.some(a => a.includes(w.topic)))
            .slice(0, 3)
            .map(w => ({
                task: generateSpecificAction(w.topic, w.severity),
                topic: w.topic,
                time: w.severity === "high" ? "45m" : "20m"
            }));

        // 6. Insight text (used by Dashboard AI Strategic Insight card)
        const topWeakTopic = flatWeak[0]?.topic;
        const insight = topWeakTopic
            ? `You're currently falling behind on "${topWeakTopic}". Prioritize it in your next 2 sessions to see a measurable score jump.`
            : avgScore >= 70
            ? `Solid foundation across all domains. Push for harder problems and system design depth to move into the top 10%.`
            : `Complete more interview sessions to unlock a personalized AI breakdown of your strengths and gaps.`;

        res.status(200).json({
            success: true,
            data: {
                avgScore,
                totalInterviews: results.length,
                status: getStatus(avgScore, 65),
                history: results.map((r, i) => ({ index: i + 1, score: r.score, timeTaken: r.timeTaken || 0 })),
                insight,
                mainFocus,
                weaknesses: flatWeak,
                strengths: Object.entries(topicMap)
                    .map(([topic, stats]) => ({ topic, score: Math.round(stats.total / stats.count) }))
                    .filter(t => t.score >= 75)
                    .slice(0, 4),
                actionPlan,
                recruiterSummary: `Candidate shows ${avgScore >= 70 ? "strong" : "developing"} potential. Primary technical gap identified in ${weakest?.domain || "core domains"}.`
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
