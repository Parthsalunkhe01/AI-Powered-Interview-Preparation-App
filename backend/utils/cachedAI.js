const crypto = require("crypto");
const CachedContent = require("../models/CachedContent");
const { checkBudget, recordUsage } = require("./budgetGuard");

const AI_TIMEOUT_MS = 45000; // 45-second safe timeout for queued AI completions

/**
 * Builds a deterministic, normalized cache key from type + params.
 */
function buildCacheKey(type, params) {
    const normalized = JSON.stringify(params, Object.keys(params || {}).sort());
    const hash = crypto.createHash("md5").update(normalized).digest("hex");
    return `${type}:${hash}`;
}

/**
 * Core Cache-First wrapper. All AI calls in the system go through this.
 *
 * Execution order:
 *   1. MongoDB cache (instant, ~1ms)
 *   2. Groq AI with timeout + budget guard
 *   3. Structured fallback (always returns something meaningful)
 *
 * @param {object} opts
 * @param {string}   opts.cacheKey      - Unique cache key (use buildCacheKey())
 * @param {string}   opts.type          - "guide" | "question" | "feedback" | "resource"
 * @param {Function} opts.aiFn          - Async function that calls Groq and returns result
 * @param {Function} opts.fallbackFn    - Sync/async function that returns structured fallback
 * @param {number}   [opts.ttlDays=7]   - Cache TTL in days
 * @returns {{ data: any, source: "cache"|"ai"|"fallback" }}
 */
async function callAIWithCache({ cacheKey, type = "guide", aiFn, fallbackFn, ttlDays = 7 }) {
    // ── LAYER 1: Cache hit ────────────────────────────────────────────
    try {
        const cached = await CachedContent.findOneAndUpdate(
            { cacheKey },
            { $inc: { hitCount: 1 } },
            { new: true }
        );
        if (cached) {
            return { data: cached.content, source: "cache" };
        }
    } catch (dbErr) {
        console.warn("[CachedAI] Cache read error:", dbErr.message);
    }

    // ── LAYER 2: AI with budget + timeout ────────────────────────────
    const { allowed } = await checkBudget("groq");
    if (allowed && typeof aiFn === "function") {
        try {
            const aiResult = await Promise.race([
                aiFn(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("AI_TIMEOUT")), AI_TIMEOUT_MS)
                ),
            ]);

            if (aiResult) {
                recordUsage("groq");

                // Write to cache — fire and forget, don't block the response
                CachedContent.create({
                    cacheKey,
                    type,
                    content: aiResult,
                    source: "ai",
                    expiresAt: new Date(Date.now() + ttlDays * 86_400_000),
                }).catch(e => console.warn("[CachedAI] Cache write error:", e.message));

                return { data: aiResult, source: "ai" };
            }
        } catch (aiErr) {
            console.warn(`[CachedAI] AI failed (${cacheKey}):`, aiErr.message);
        }
    }

    // ── LAYER 3: Structured fallback — guaranteed output ─────────────
    const fallbackResult = typeof fallbackFn === "function" ? await fallbackFn() : {};
    return { data: fallbackResult, source: "fallback" };
}

/**
 * Parallel execution with concurrency limit.
 * Replaces sequential for-loops and avoids Promise.all overloading Groq.
 *
 * @param {Array<Function>} taskFns  - Array of async functions to execute
 * @param {number} limit             - Max concurrent tasks (default 3)
 */
async function parallelWithLimit(taskFns, limit = 3) {
    const results = [];
    for (let i = 0; i < taskFns.length; i += limit) {
        const batch = taskFns.slice(i, i + limit);
        const batchResults = await Promise.allSettled(batch.map(fn => fn()));
        results.push(
            ...batchResults.map(r => (r.status === "fulfilled" ? r.value : null))
        );
    }
    return results;
}

module.exports = { callAIWithCache, buildCacheKey, parallelWithLimit };
