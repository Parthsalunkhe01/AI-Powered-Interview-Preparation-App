const ApiUsage = require("../models/ApiUsage");

/**
 * Daily API budget limits — tuned to stay safely under free-tier quotas.
 * Groq free tier: ~14,400 requests/day, 6000 tokens/min
 * YouTube Data API: 10,000 units/day (1 unit per search request)
 * Serper: varies by plan
 */
const DAILY_LIMITS = {
    groqCalls:    180,   // Hard stop at 180 (leaves buffer below Groq limits)
    groqTokens:   90000, // Token ceiling per day
    youtubeCalls: 90,    // YouTube: 10,000 units/day; each search = ~100 units → 90 safe calls
    serperCalls:  900,   // Serper free tier: 2500 credits/month → generous daily ceiling
};

/**
 * Degradation tiers based on groqCalls usage percent:
 *   0–60%  → FULL   : AI personalization ON, all features active
 *  60–85%  → REDUCED: Skip AI personalization, use cached/local questions
 *  85–95%  → MINIMAL: AI only for feedback scoring, all else from cache/fallback
 *  95–100% → OFFLINE: Pure local fallback for everything
 */
function getDegradationTier(usage) {
    const pct = (usage.groqCalls / DAILY_LIMITS.groqCalls) * 100;
    if (pct >= 95) return "OFFLINE";
    if (pct >= 85) return "MINIMAL";
    if (pct >= 60) return "REDUCED";
    return "FULL";
}

function getToday() {
    return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

/**
 * Check if a specific API is within budget.
 * @param {"groq"|"youtube"|"serper"} apiType
 * @param {number} cost  number of units this call costs (default 1)
 * @returns {{ allowed: boolean, tier: string, reason?: string }}
 */
async function checkBudget(apiType, cost = 1) {
    try {
        const today = getToday();
        const usage = await ApiUsage.findOne({ date: today }) || 
            { groqCalls: 0, groqTokens: 0, youtubeCalls: 0, serperCalls: 0 };

        const tier = getDegradationTier(usage);

        const fieldMap = { groq: "groqCalls", youtube: "youtubeCalls", serper: "serperCalls" };
        const field = fieldMap[apiType];
        const currentUsage = usage[field] || 0;
        const limit = DAILY_LIMITS[field];

        if (currentUsage + cost > limit) {
            return { allowed: false, tier, reason: "DAILY_LIMIT_EXCEEDED" };
        }

        return { allowed: true, tier };
    } catch (err) {
        // If DB fails, allow the call (fail open — better than blocking users)
        console.warn("[BudgetGuard] DB check failed, failing open:", err.message);
        return { allowed: true, tier: "FULL" };
    }
}

/**
 * Record that an API call was made. Fire-and-forget.
 * @param {"groq"|"youtube"|"serper"} apiType
 * @param {number} tokenCount  (only relevant for groq)
 */
function recordUsage(apiType, tokenCount = 0) {
    const today = getToday();
    const inc = { groq: { groqCalls: 1, groqTokens: tokenCount }, youtube: { youtubeCalls: 1 }, serper: { serperCalls: 1 } }[apiType] || {};
    ApiUsage.findOneAndUpdate({ date: today }, { $inc: inc }, { upsert: true, new: true })
        .catch(err => console.warn("[BudgetGuard] Usage record failed:", err.message));
}

/**
 * Get current tier without making an API call — used for routing decisions.
 */
async function getCurrentTier() {
    try {
        const usage = await ApiUsage.findOne({ date: getToday() }) || { groqCalls: 0 };
        return getDegradationTier(usage);
    } catch {
        return "FULL";
    }
}

module.exports = { checkBudget, recordUsage, getCurrentTier, DAILY_LIMITS };
