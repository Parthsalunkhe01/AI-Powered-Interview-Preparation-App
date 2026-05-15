const { searchWithSerper } = require("../utils/serperSearch");
const { searchWithYouTube } = require("../utils/youtubeSearch");
const { getVerifiedLink } = require("../utils/resourceMapper");
const { buildCacheKey } = require("../utils/cachedAI");
const { checkBudget, recordUsage } = require("../utils/budgetGuard");
const CachedContent = require("../models/CachedContent");

// ── Static Resource Pool ─────────────────────────────────────────────────────
// Zero-cost fallback: curated, topic-matched resources loaded from resourceMapper.
// Covers the most common interview topics without any API call.
const STATIC_RESOURCE_POOL = {
    dsa:           { videos: [{ title: "Data Structures & Algorithms Full Course", url: "https://www.youtube.com/watch?v=8hly31xKli0", videoId: "8hly31xKli0" }], articles: [{ title: "NeetCode DSA Roadmap", url: "https://neetcode.io/roadmap" }] },
    system_design: { videos: [{ title: "System Design Fundamentals", url: "https://www.youtube.com/watch?v=Fj7X-7kNo2s", videoId: "Fj7X-7kNo2s" }], articles: [{ title: "ByteByteGo System Design", url: "https://bytebytego.com/" }] },
    database:      { videos: [{ title: "Database Design Full Course", url: "https://www.youtube.com/watch?v=f9mXN8NndO8", videoId: "f9mXN8NndO8" }], articles: [{ title: "Use The Index, Luke", url: "https://use-the-index-luke.com/" }] },
    java:          { videos: [{ title: "Java Complete Course", url: "https://www.youtube.com/watch?v=RRubcjpTkks", videoId: "RRubcjpTkks" }], articles: [{ title: "Oracle Java Docs", url: "https://docs.oracle.com/en/java/" }] },
    android:       { videos: [{ title: "Android Development with Kotlin", url: "https://www.youtube.com/watch?v=BCSlZIUj18Y", videoId: "BCSlZIUj18Y" }], articles: [{ title: "Android Developer Guides", url: "https://developer.android.com/guide" }] },
    react:         { videos: [{ title: "React JS Full Course", url: "https://www.youtube.com/watch?v=hQAHSlTtcmY", videoId: "hQAHSlTtcmY" }], articles: [{ title: "React Official Docs", url: "https://react.dev/" }] },
    javascript:    { videos: [{ title: "JavaScript Full Course", url: "https://www.youtube.com/watch?v=W6NZfCO5SIk", videoId: "W6NZfCO5SIk" }], articles: [{ title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }] },
    python:        { videos: [{ title: "Python for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", videoId: "_uQrJ0TkZlc" }], articles: [{ title: "Python Official Docs", url: "https://docs.python.org/3/" }] },
    algorithms:    { videos: [{ title: "Algorithms Full Course", url: "https://www.youtube.com/watch?v=8hly31xKli0", videoId: "8hly31xKli0" }], articles: [{ title: "GeeksforGeeks Algorithms", url: "https://www.geeksforgeeks.org/fundamentals-of-algorithms/" }] },
    caching:       { videos: [{ title: "Redis Caching Explained", url: "https://www.youtube.com/watch?v=U3RkDLOx4SM", videoId: "U3RkDLOx4SM" }], articles: [{ title: "Redis Documentation", url: "https://redis.io/docs/" }] },
    docker:        { videos: [{ title: "Docker Tutorial for Beginners", url: "https://www.youtube.com/watch?v=3c-iBn7E9dU", videoId: "3c-iBn7E9dU" }], articles: [{ title: "Docker Get Started", url: "https://docs.docker.com/get-started/" }] },
    behavioral:    { videos: [{ title: "Behavioral Interview Questions", url: "https://www.youtube.com/watch?v=Pj0wZ7_Z79M", videoId: "Pj0wZ7_Z79M" }], articles: [{ title: "STAR Method Guide", url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique" }] },
};

// ── Stopwords for Keyword Extraction ────────────────────────────────────────
const TECH_STOPWORDS = new Set([
    "a","an","the","and","or","but","if","when","at","from","by","for","with",
    "about","into","through","before","after","above","below","to","up","down",
    "in","out","on","off","can","will","just","should","now","explain","describe",
    "implement","optimize","how","what","why","where","difference","between",
    "versus","vs","compare","advantage","disadvantage","use","used","using",
    "work","works","write","code","programming","developer","engineer","software",
    "system","design","build","create","make","real","world","scenario","question",
    "interview","preparation","concept","understand","case","study","problem",
    "solution","approach","best","practice","common","standard","modern","basic",
    "advanced","intermediate","level","senior","junior","complete","full","course",
    "video","article","blog","learn","study","knowledge","skill","topic",
]);

function extractKeywords(text) {
    if (!text) return "";
    const clean = text.toLowerCase().replace(/[^a-z0-9+# ]/g, " ");
    const tokens = clean.split(/\s+/).filter(t => t.length > 1 && !TECH_STOPWORDS.has(t));
    return [...new Set(tokens)].slice(0, 5).join(" ");
}

// ── Static Pool Matcher ──────────────────────────────────────────────────────
function matchStaticPool(keywords) {
    const kw = keywords.toLowerCase();
    for (const [key, resources] of Object.entries(STATIC_RESOURCE_POOL)) {
        if (kw.includes(key)) return resources;
    }
    return null;
}

// ── Core Resource Fetcher: Single-Pass + Cache ────────────────────────────────
/**
 * Fetches resources for a topic. Priority:
 *   1. MongoDB TTL cache (14-day)
 *   2. Static resource pool (zero API cost)
 *   3. External APIs (YouTube + Serper) — parallel, single pass, budget-gated
 *
 * @param {string} topic        - Question text or topic keyword
 * @param {Set}    seenLinks    - Deduplication set for article URLs
 * @param {Set}    seenVideoIds - Deduplication set for video IDs
 */
const fetchAndVerifyResources = async (topic, seenLinks = new Set(), seenVideoIds = new Set()) => {
    const keywords = extractKeywords(topic);
    const cacheKey = buildCacheKey("resource", { kw: keywords });

    // ── Layer 1: DB Cache ──────────────────────────────────────────────
    try {
        const cached = await CachedContent.findOneAndUpdate(
            { cacheKey },
            { $inc: { hitCount: 1 } },
            { new: true }
        );
        if (cached) {
            return { videos: cached.content.videos || [], articles: cached.content.articles || [], keywords: keywords.split(" ") };
        }
    } catch (e) {
        console.warn("[ResourceController] Cache read error:", e.message);
    }

    // ── Layer 2: Static Pool (Zero API Cost) ───────────────────────────
    const staticMatch = matchStaticPool(keywords);
    if (staticMatch) {
        const videos   = staticMatch.videos.filter(v => !seenVideoIds.has(v.videoId));
        const articles = staticMatch.articles.filter(a => !seenLinks.has(a.url));
        videos.forEach(v => seenVideoIds.add(v.videoId));
        articles.forEach(a => seenLinks.add(a.url));
        return { videos, articles, keywords: keywords.split(" ") };
    }

    // ── Layer 3: External APIs (parallel, budget-gated, single pass) ───
    const ytQuery     = `${keywords} technical explained interview`.trim();
    const serperQuery = `${keywords} technical tutorial guide`.trim();

    const [ytBudget, serperBudget] = await Promise.all([
        checkBudget("youtube"),
        checkBudget("serper"),
    ]);

    const [rawVideos, rawArticles] = await Promise.all([
        ytBudget.allowed     ? searchWithYouTube(ytQuery, 5).then(r => { recordUsage("youtube"); return r; }).catch(() => []) : Promise.resolve([]),
        serperBudget.allowed ? searchWithSerper(serperQuery, 5).then(r => { recordUsage("serper"); return r; }).catch(() => []) : Promise.resolve([]),
    ]);

    // Deduplicate
    const videos   = (rawVideos   || []).filter(v => v?.videoId && !seenVideoIds.has(v.videoId)).slice(0, 2);
    const articles = (rawArticles || []).filter(a => a?.link  && !seenLinks.has(a.link)).slice(0, 2)
        .map(a => ({ title: a.title, url: a.link }));

    videos.forEach(v => seenVideoIds.add(v.videoId));
    articles.forEach(a => seenLinks.add(a.url));

    const result = {
        videos:   videos.map(v => ({ title: v.title, url: `https://youtube.com/watch?v=${v.videoId}`, videoId: v.videoId })),
        articles,
    };

    // Cache result for 14 days (fire-and-forget)
    if (videos.length > 0 || articles.length > 0) {
        CachedContent.create({
            cacheKey,
            type: "resource",
            content: result,
            source: "ai",
            expiresAt: new Date(Date.now() + 14 * 86_400_000),
        }).catch(e => console.warn("[ResourceController] Cache write error:", e.message));
    }

    return { ...result, keywords: keywords.split(" ") };
};

// ── Static Verified Link (topic-only fallback, no API) ─────────────────────
function getStaticResource(topic) {
    const kw = extractKeywords(topic);
    const ytUrl  = getVerifiedLink(kw, "video")  || "https://www.youtube.com/results?search_query=" + encodeURIComponent(kw + " interview");
    const artUrl = getVerifiedLink(kw, "blog")   || "https://www.geeksforgeeks.org/?s=" + encodeURIComponent(kw);
    return {
        videos:   [{ title: `${kw} — Video Tutorial`, url: ytUrl, videoId: null }],
        articles: [{ title: `${kw} — Technical Guide`, url: artUrl }],
    };
}

// ── Route Handler: POST /api/ai/resources ─────────────────────────────────────
exports.generateResources = async (req, res) => {
    try {
        const inputTopics = req.body.topics || req.body.questions;

        if (!inputTopics || !Array.isArray(inputTopics) || inputTopics.length === 0) {
            return res.status(400).json({ success: false, message: "topics array is required." });
        }

        const seenLinks    = new Set();
        const seenVideoIds = new Set();

        // Parallel fetch with concurrency limit of 3 (budget-friendly)
        const BATCH_SIZE = 3;
        const results = [];

        for (let i = 0; i < inputTopics.length; i += BATCH_SIZE) {
            const batch = inputTopics.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.allSettled(
                batch.map(async (topic) => {
                    const resources = await fetchAndVerifyResources(topic, seenLinks, seenVideoIds);
                    return {
                        topic,
                        keywords:  resources.keywords,
                        resources: resources.articles.slice(0, 2),
                        videos:    resources.videos.slice(0, 2),
                    };
                })
            );
            results.push(
                ...batchResults.map((r, idx) =>
                    r.status === "fulfilled"
                        ? r.value
                        : { topic: batch[idx], keywords: [], resources: [], videos: [] }
                )
            );
        }

        return res.status(200).json({ success: true, data: results });

    } catch (error) {
        console.error("❌ Resource Controller Fatal Error:", error.message);
        return res.status(200).json({ success: true, data: [] });
    }
};

exports.fetchAndVerifyResources = fetchAndVerifyResources;
exports.getStaticResource = getStaticResource;
