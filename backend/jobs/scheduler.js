const cron = require("node-cron");
const CachedContent = require("../models/CachedContent");
const ApiUsage = require("../models/ApiUsage");
const { buildCacheKey } = require("../utils/cachedAI");
const { checkBudget } = require("../utils/budgetGuard");

// ── Focus areas and roles to pre-warm ────────────────────────────────────────
const PREWARM_FOCUSES = ["dsa", "system_design", "database", "behavioral", "backend", "android"];
const PREWARM_ROLES   = ["Backend Developer", "Android Developer", "Software Engineer"];
const RESOURCE_TOPICS = [
    "binary search tree", "system design scalability", "database indexing",
    "multithreading java", "REST API design", "dynamic programming",
    "react hooks", "microservices architecture", "sql joins", "big o notation",
    "recursion problems", "object oriented design", "android lifecycle",
    "behavioural interview star method", "graph traversal bfs dfs",
];

let isRunning = false; // Prevent overlapping jobs

// ── Job 1: Pre-warm Question Cache (2 AM daily) ───────────────────────────────
async function prewarmQuestionCache() {
    if (isRunning) return;
    isRunning = true;
    console.log("[CRON][2AM] Starting question cache pre-warm...");

    const { getQuestionsForFocus } = require("../data/questionBlueprint");
    let cached = 0;

    try {
        for (const focus of PREWARM_FOCUSES) {
            for (const role of PREWARM_ROLES) {
                const key = buildCacheKey("question", { focus, role, difficulty: 2 });
                const exists = await CachedContent.findOne({ cacheKey: key });
                if (!exists) {
                    const questions = getQuestionsForFocus(focus, 2, 10, [], role);
                    if (questions.length > 0) {
                        await CachedContent.create({
                            cacheKey: key,
                            type: "question",
                            content: questions,
                            source: "precomputed",
                            expiresAt: new Date(Date.now() + 30 * 86_400_000), // 30 days
                        }).catch(() => {});
                        cached++;
                    }
                }
            }
        }
        console.log(`[CRON][2AM] Question pre-warm complete. ${cached} new entries cached.`);
    } catch (err) {
        console.error("[CRON][2AM] Question pre-warm failed:", err.message);
    } finally {
        isRunning = false;
    }
}

// ── Job 2: Pre-fetch Resource Pool (3 AM daily) ───────────────────────────────
async function prewarmResourcePool() {
    console.log("[CRON][3AM] Starting resource pool pre-fetch...");
    const { fetchAndVerifyResources } = require("../controllers/resourceController");
    let fetched = 0;

    const seenLinks    = new Set();
    const seenVideoIds = new Set();

    for (const topic of RESOURCE_TOPICS) {
        try {
            const key = buildCacheKey("resource", { kw: topic.toLowerCase() });
            const exists = await CachedContent.findOne({ cacheKey: key });
            if (!exists) {
                const { allowed } = await checkBudget("youtube");
                if (!allowed) {
                    console.log("[CRON][3AM] Budget exhausted, stopping resource pre-fetch.");
                    break;
                }
                await fetchAndVerifyResources(topic, seenLinks, seenVideoIds);
                fetched++;
                // Gentle delay between fetches to avoid rate spikes
                await new Promise(r => setTimeout(r, 1500));
            }
        } catch (err) {
            console.warn(`[CRON][3AM] Failed to prefetch "${topic}":`, err.message);
        }
    }

    console.log(`[CRON][3AM] Resource pre-fetch complete. ${fetched} new topics cached.`);
}

// ── Job 3: Purge Stale Cache (Sunday 4 AM weekly) ────────────────────────────
async function purgeStaleCache() {
    console.log("[CRON][SUN 4AM] Purging expired cache entries...");
    try {
        // MongoDB TTL index handles expiry automatically, but this cleans
        // any entries that may have slipped through (hitCount = 0, old entries)
        const cutoff = new Date(Date.now() - 45 * 86_400_000); // 45 days
        const result = await CachedContent.deleteMany({
            createdAt: { $lt: cutoff },
            hitCount: 0,
        });
        console.log(`[CRON][SUN 4AM] Purged ${result.deletedCount} stale zero-hit entries.`);
    } catch (err) {
        console.error("[CRON][SUN 4AM] Purge failed:", err.message);
    }
}

// ── Job 4: Log Daily Budget Status (Every 6 hours) ───────────────────────────
async function logBudgetStatus() {
    try {
        const today = new Date().toISOString().split("T")[0];
        const usage = await ApiUsage.findOne({ date: today });
        if (usage) {
            const groqPct = Math.round((usage.groqCalls / 180) * 100);
            const ytPct   = Math.round((usage.youtubeCalls / 80) * 100);
            console.log(`[BUDGET] ${today} — Groq: ${usage.groqCalls}/180 (${groqPct}%) | YouTube: ${usage.youtubeCalls}/80 (${ytPct}%) | Serper: ${usage.serperCalls}/80`);
        }
    } catch (err) { /* silent */ }
}

// ── Scheduler Bootstrap ───────────────────────────────────────────────────────
function startScheduler() {
    // Pre-warm question cache at 2:00 AM daily
    cron.schedule("0 2 * * *", prewarmQuestionCache, { timezone: "Asia/Kolkata" });

    // Pre-fetch resource pool at 3:00 AM daily
    cron.schedule("0 3 * * *", prewarmResourcePool, { timezone: "Asia/Kolkata" });

    // Purge stale cache at 4:00 AM every Sunday
    cron.schedule("0 4 * * 0", purgeStaleCache, { timezone: "Asia/Kolkata" });

    // Log budget status every 6 hours
    cron.schedule("0 */6 * * *", logBudgetStatus);

    console.log("[SCHEDULER] Background jobs registered: pre-warm (2AM), resources (3AM), purge (Sun 4AM), budget-log (every 6h).");
}

module.exports = { startScheduler };
