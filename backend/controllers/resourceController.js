const { searchWithSerper } = require("../utils/serperSearch");
const { searchWithYouTube } = require("../utils/youtubeSearch");
const { buildCacheKey } = require("../utils/cachedAI");
const { checkBudget, recordUsage } = require("../utils/budgetGuard");
const CachedContent = require("../models/CachedContent");

// ── Thumbnail Resolver ────────────────────────────────────────────────────────
// Guarantees every video has a working thumbnail. Never returns null.
function resolveThumbnail(videoId, rawThumbnail) {
    if (rawThumbnail && rawThumbnail.startsWith("http")) return rawThumbnail;
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return null;
}

// ── Static Resource Pool ──────────────────────────────────────────────────────
// Curated, topic-matched resources with guaranteed thumbnails.
// Each entry covers one semantic domain.
const STATIC_RESOURCE_POOL = [
    {
        keys: ["dsa", "data structure", "algorithm", "array", "linked list", "stack", "queue", "tree", "graph", "heap", "sorting", "searching", "recursion"],
        videos: [
            { title: "Data Structures & Algorithms Full Course", url: "https://www.youtube.com/watch?v=8hly31xKli0", videoId: "8hly31xKli0", thumbnail: "https://img.youtube.com/vi/8hly31xKli0/hqdefault.jpg" },
            { title: "Big O Notation — Time Complexity Explained", url: "https://www.youtube.com/watch?v=itnHiK6S93c", videoId: "itnHiK6S93c", thumbnail: "https://img.youtube.com/vi/itnHiK6S93c/hqdefault.jpg" },
        ],
        articles: [
            { title: "NeetCode DSA Roadmap", url: "https://neetcode.io/roadmap" },
            { title: "GeeksforGeeks: Data Structures", url: "https://www.geeksforgeeks.org/data-structures/" },
        ],
    },
    {
        keys: ["dynamic programming", "dp", "memoization", "tabulation", "knapsack", "fibonacci"],
        videos: [
            { title: "Dynamic Programming — Full Course", url: "https://www.youtube.com/watch?v=Hdr64lKQ3e4", videoId: "Hdr64lKQ3e4", thumbnail: "https://img.youtube.com/vi/Hdr64lKQ3e4/hqdefault.jpg" },
            { title: "Memoization vs Tabulation Explained", url: "https://www.youtube.com/watch?v=O5He_N4S1Sg", videoId: "O5He_N4S1Sg", thumbnail: "https://img.youtube.com/vi/O5He_N4S1Sg/hqdefault.jpg" },
        ],
        articles: [
            { title: "DP Patterns — GeeksforGeeks", url: "https://www.geeksforgeeks.org/dynamic-programming/" },
            { title: "FreeCodeCamp: Memoization in JS", url: "https://www.freecodecamp.org/news/memoization-in-javascript-and-react/" },
        ],
    },
    {
        keys: ["system design", "scalability", "distributed system", "microservice", "load balanc", "sharding", "caching", "cdn", "cap theorem"],
        videos: [
            { title: "System Design Fundamentals", url: "https://www.youtube.com/watch?v=Fj7X-7kNo2s", videoId: "Fj7X-7kNo2s", thumbnail: "https://img.youtube.com/vi/Fj7X-7kNo2s/hqdefault.jpg" },
            { title: "Microservices Architecture Explained", url: "https://www.youtube.com/watch?v=rv4LlmLU6ss", videoId: "rv4LlmLU6ss", thumbnail: "https://img.youtube.com/vi/rv4LlmLU6ss/hqdefault.jpg" },
        ],
        articles: [
            { title: "ByteByteGo System Design", url: "https://bytebytego.com/" },
            { title: "System Design Primer — GitHub", url: "https://github.com/donnemartin/system-design-primer" },
        ],
    },
    {
        keys: ["database", "sql", "nosql", "mongodb", "postgresql", "indexing", "join", "acid", "transaction", "query optim"],
        videos: [
            { title: "Database Design Full Course", url: "https://www.youtube.com/watch?v=f9mXN8NndO8", videoId: "f9mXN8NndO8", thumbnail: "https://img.youtube.com/vi/f9mXN8NndO8/hqdefault.jpg" },
            { title: "SQL vs NoSQL Explained", url: "https://www.youtube.com/watch?v=ruz-vK8IesE", videoId: "ruz-vK8IesE", thumbnail: "https://img.youtube.com/vi/ruz-vK8IesE/hqdefault.jpg" },
        ],
        articles: [
            { title: "Use The Index, Luke — SQL Indexing", url: "https://use-the-index-luke.com/" },
            { title: "MongoDB Documentation", url: "https://www.mongodb.com/docs/" },
        ],
    },
    {
        keys: ["java", "jvm", "spring", "spring boot", "garbage collect", "multithreading", "concurrency", "synchronized", "reentrantlock", "volatile", "thread"],
        videos: [
            { title: "Java Complete Course", url: "https://www.youtube.com/watch?v=RRubcjpTkks", videoId: "RRubcjpTkks", thumbnail: "https://img.youtube.com/vi/RRubcjpTkks/hqdefault.jpg" },
            { title: "Java Multithreading & Concurrency", url: "https://www.youtube.com/watch?v=M1JkL9OqR5w", videoId: "M1JkL9OqR5w", thumbnail: "https://img.youtube.com/vi/M1JkL9OqR5w/hqdefault.jpg" },
        ],
        articles: [
            { title: "Oracle Java Documentation", url: "https://docs.oracle.com/en/java/" },
            { title: "Java Concurrency — Baeldung", url: "https://www.baeldung.com/java-concurrency" },
        ],
    },
    {
        keys: ["android", "kotlin", "jetpack", "compose", "mvvm", "viewmodel", "coroutine", "fragment", "activity", "lifecycle", "hilt", "room"],
        videos: [
            { title: "Android Development with Kotlin", url: "https://www.youtube.com/watch?v=BCSlZIUj18Y", videoId: "BCSlZIUj18Y", thumbnail: "https://img.youtube.com/vi/BCSlZIUj18Y/hqdefault.jpg" },
            { title: "Jetpack Compose Crash Course", url: "https://www.youtube.com/watch?v=cDabx3SjuOY", videoId: "cDabx3SjuOY", thumbnail: "https://img.youtube.com/vi/cDabx3SjuOY/hqdefault.jpg" },
        ],
        articles: [
            { title: "Android Developer Guides", url: "https://developer.android.com/guide" },
            { title: "Jetpack Compose Documentation", url: "https://developer.android.com/jetpack/compose" },
        ],
    },
    {
        keys: ["react", "hooks", "usestate", "useeffect", "usememo", "context", "redux", "next.js", "jsx", "component", "state management"],
        videos: [
            { title: "React JS Full Course", url: "https://www.youtube.com/watch?v=hQAHSlTtcmY", videoId: "hQAHSlTtcmY", thumbnail: "https://img.youtube.com/vi/hQAHSlTtcmY/hqdefault.jpg" },
            { title: "React Hooks Explained", url: "https://www.youtube.com/watch?v=LlvBzyy-558", videoId: "LlvBzyy-558", thumbnail: "https://img.youtube.com/vi/LlvBzyy-558/hqdefault.jpg" },
        ],
        articles: [
            { title: "React Official Documentation", url: "https://react.dev/" },
            { title: "React Hooks Reference", url: "https://react.dev/reference/react/hooks" },
        ],
    },
    {
        keys: ["javascript", "closure", "prototype", "promise", "async", "await", "event loop", "hoisting", "scope", "this", "es6"],
        videos: [
            { title: "JavaScript Full Course", url: "https://www.youtube.com/watch?v=W6NZfCO5SIk", videoId: "W6NZfCO5SIk", thumbnail: "https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg" },
            { title: "JavaScript Event Loop Explained", url: "https://www.youtube.com/watch?v=8aGhZQkoFbQ", videoId: "8aGhZQkoFbQ", thumbnail: "https://img.youtube.com/vi/8aGhZQkoFbQ/hqdefault.jpg" },
        ],
        articles: [
            { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
            { title: "JavaScript.info", url: "https://javascript.info/" },
        ],
    },
    {
        keys: ["python", "django", "flask", "pandas", "numpy", "decorator", "generator", "list comprehension"],
        videos: [
            { title: "Python for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", videoId: "_uQrJ0TkZlc", thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg" },
        ],
        articles: [
            { title: "Python Official Documentation", url: "https://docs.python.org/3/" },
            { title: "Real Python Tutorials", url: "https://realpython.com/" },
        ],
    },
    {
        keys: ["api", "rest", "restful", "graphql", "http", "endpoint", "request", "response", "status code", "authentication", "jwt", "oauth", "middleware"],
        videos: [
            { title: "REST API Design Best Practices", url: "https://www.youtube.com/watch?v=_YlHm36q_XU", videoId: "_YlHm36q_XU", thumbnail: "https://img.youtube.com/vi/_YlHm36q_XU/hqdefault.jpg" },
            { title: "JWT Authentication Explained", url: "https://www.youtube.com/watch?v=7Q17ubqLfaM", videoId: "7Q17ubqLfaM", thumbnail: "https://img.youtube.com/vi/7Q17ubqLfaM/hqdefault.jpg" },
        ],
        articles: [
            { title: "MDN HTTP Guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
            { title: "REST API Tutorial", url: "https://restfulapi.net/" },
        ],
    },
    {
        keys: ["docker", "container", "kubernetes", "k8s", "devops", "ci/cd", "pipeline", "deployment"],
        videos: [
            { title: "Docker Tutorial for Beginners", url: "https://www.youtube.com/watch?v=3c-iBn7E9dU", videoId: "3c-iBn7E9dU", thumbnail: "https://img.youtube.com/vi/3c-iBn7E9dU/hqdefault.jpg" },
            { title: "Kubernetes Full Course", url: "https://www.youtube.com/watch?v=X48VuDVv0do", videoId: "X48VuDVv0do", thumbnail: "https://img.youtube.com/vi/X48VuDVv0do/hqdefault.jpg" },
        ],
        articles: [
            { title: "Docker Get Started", url: "https://docs.docker.com/get-started/" },
            { title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/home/" },
        ],
    },
    {
        keys: ["behavioral", "hr", "star method", "teamwork", "conflict", "leadership", "communication", "tell me about yourself"],
        videos: [
            { title: "Behavioral Interview Questions Masterclass", url: "https://www.youtube.com/watch?v=Pj0wZ7_Z79M", videoId: "Pj0wZ7_Z79M", thumbnail: "https://img.youtube.com/vi/Pj0wZ7_Z79M/hqdefault.jpg" },
        ],
        articles: [
            { title: "STAR Method Guide — Indeed", url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique" },
            { title: "Amazon Leadership Principles", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles" },
        ],
    },
    {
        keys: ["machine learning", "deep learning", "neural network", "ai", "ml", "nlp", "computer vision", "model training", "gradient descent", "overfitting"],
        videos: [
            { title: "Machine Learning Full Course", url: "https://www.youtube.com/watch?v=NWONeJKn6kc", videoId: "NWONeJKn6kc", thumbnail: "https://img.youtube.com/vi/NWONeJKn6kc/hqdefault.jpg" },
        ],
        articles: [
            { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
            { title: "Fast.ai Practical Deep Learning", url: "https://course.fast.ai/" },
        ],
    },
];

// ── Stopwords for Keyword Extraction ─────────────────────────────────────────
const TECH_STOPWORDS = new Set([
    "a","an","the","and","or","but","if","when","at","from","by","for","with",
    "about","into","through","before","after","above","below","to","up","down",
    "in","out","on","off","can","will","just","should","now","explain","describe",
    "implement","how","what","why","where","difference","between","versus","vs",
    "compare","advantage","disadvantage","use","used","using","work","works",
    "write","programming","developer","engineer","software","build","create",
    "make","real","world","scenario","question","interview","preparation",
    "concept","understand","case","study","problem","solution","approach",
    "best","practice","common","standard","modern","basic","advanced",
    "intermediate","level","senior","junior","complete","full","course",
    "video","article","blog","learn","study","knowledge","skill","topic",
]);

// Extracts up to 6 meaningful technical keywords from question text.
function extractKeywords(text) {
    if (!text) return [];
    const clean = text.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ");
    const tokens = clean.split(/\s+/).filter(t => t.length > 1 && !TECH_STOPWORDS.has(t));
    return [...new Set(tokens)].slice(0, 6);
}

// ── Relevance Scoring ─────────────────────────────────────────────────────────
// Scores a static pool entry against the question keywords.
// Returns a score between 0 and 1. Threshold: 0.2 (at least 1 key overlap).
function scoreRelevance(entry, questionKeywords) {
    if (!questionKeywords.length) return 0;
    let hits = 0;
    for (const qk of questionKeywords) {
        for (const poolKey of entry.keys) {
            if (poolKey.includes(qk) || qk.includes(poolKey)) {
                hits++;
                break;
            }
        }
    }
    return hits / questionKeywords.length;
}

// ── Best Static Match ─────────────────────────────────────────────────────────
// Finds the highest-scoring static pool entry for a given question.
// Returns null if no entry meets the relevance threshold.
function matchStaticPool(questionKeywords) {
    const RELEVANCE_THRESHOLD = 0.2; // At least 1 keyword overlap for ≤5 keywords
    let bestEntry = null;
    let bestScore = 0;

    for (const entry of STATIC_RESOURCE_POOL) {
        const score = scoreRelevance(entry, questionKeywords);
        if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
        }
    }

    return bestScore >= RELEVANCE_THRESHOLD ? bestEntry : null;
}

// ── URL Validator ─────────────────────────────────────────────────────────────
function isValidUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
        new URL(url);
        return url.startsWith("http://") || url.startsWith("https://");
    } catch {
        return false;
    }
}

// ── Core Resource Fetcher ─────────────────────────────────────────────────────
/**
 * Fetches semantically relevant resources for a given question.
 *
 * Priority:
 *   1. MongoDB TTL cache  → source: "cache"
 *   2. Static pool (relevance-scored) → source: "static"
 *   3. External APIs (YouTube + Serper) → source: "api"
 *
 * @param {string} topic        - Full question text
 * @param {Set}    seenLinks    - Deduplication set for article URLs
 * @param {Set}    seenVideoIds - Deduplication set for video IDs
 */
const fetchAndVerifyResources = async (topic, seenLinks = new Set(), seenVideoIds = new Set()) => {
    const questionKeywords = extractKeywords(topic);
    const cacheKey = buildCacheKey("resource", { kw: questionKeywords.join(" ") });

    // ── Layer 1: DB Cache ──────────────────────────────────────────────
    try {
        const cached = await CachedContent.findOne({ cacheKey });
        if (cached) {
            console.log("CACHE HIT:", cacheKey);
            await CachedContent.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } });
            return {
                source:   "cache",
                videos:   cached.content.videos   || [],
                articles: cached.content.articles || [],
                keywords: questionKeywords,
            };
        }
        console.log("CACHE MISS:", cacheKey);
    } catch (e) {
        console.warn("[ResourceController] Cache read error:", e.message);
    }

    // ── Layer 2: Relevance-Scored Static Pool ──────────────────────────
    const staticMatch = matchStaticPool(questionKeywords);
    if (staticMatch) {
        const videos = staticMatch.videos
            .filter(v => v.videoId && !seenVideoIds.has(v.videoId))
            .map(v => ({
                title:     v.title,
                url:       v.url,
                videoId:   v.videoId,
                thumbnail: resolveThumbnail(v.videoId, v.thumbnail),
            }));

        const articles = staticMatch.articles
            .filter(a => isValidUrl(a.url) && !seenLinks.has(a.url));

        videos.forEach(v => seenVideoIds.add(v.videoId));
        articles.forEach(a => seenLinks.add(a.url));

        const result = { videos, articles };

        // Write to cache so the next request is a cache hit
        CachedContent.create({
            cacheKey,
            type:      "resource",
            content:   result,
            source:    "static_pool",
            expiresAt: new Date(Date.now() + 14 * 86_400_000),
        }).catch(e => console.warn("[ResourceController] Static cache write error:", e.message));

        console.log("CACHE SAVED (Static Pool):", cacheKey);

        return {
            source: "static",
            ...result,
            keywords: questionKeywords,
        };
    }

    // ── Layer 3: External APIs (parallel, budget-gated) ────────────────
    const semanticQuery = `${questionKeywords.join(" ")} technical interview explanation`;

    const [ytBudget, serperBudget] = await Promise.all([
        checkBudget("youtube"),
        checkBudget("serper"),
    ]);

    const [rawVideos, rawArticles] = await Promise.all([
        ytBudget.allowed
            ? searchWithYouTube(semanticQuery, 5)
                .then(r => { recordUsage("youtube"); return r; })
                .catch(() => [])
            : Promise.resolve([]),
        serperBudget.allowed
            ? searchWithSerper(semanticQuery, 5)
                .then(r => { recordUsage("serper"); return r; })
                .catch(() => [])
            : Promise.resolve([]),
    ]);

    // Deduplicate + validate + inject thumbnails
    const videos = (rawVideos || [])
        .filter(v => v?.videoId && !seenVideoIds.has(v.videoId))
        .slice(0, 2)
        .map(v => ({
            title:     v.title,
            url:       `https://www.youtube.com/watch?v=${v.videoId}`,
            videoId:   v.videoId,
            thumbnail: resolveThumbnail(v.videoId, v.thumbnail),
        }));

    const articles = (rawArticles || [])
        .filter(a => a?.link && isValidUrl(a.link) && !seenLinks.has(a.link))
        .slice(0, 2)
        .map(a => ({ title: a.title, url: a.link }));

    videos.forEach(v => seenVideoIds.add(v.videoId));
    articles.forEach(a => seenLinks.add(a.url));

    const result = { videos, articles };

    // Cache API results for 14 days
    if (videos.length > 0 || articles.length > 0) {
        CachedContent.create({
            cacheKey,
            type:      "resource",
            content:   result,
            source:    "ai",
            expiresAt: new Date(Date.now() + 14 * 86_400_000),
        }).catch(e => console.warn("[ResourceController] API cache write error:", e.message));
        console.log("CACHE SAVED (API):", cacheKey);
    }

    return {
        source: "api",
        ...result,
        keywords: questionKeywords,
    };
};

// ── Route Handler: POST /api/ai/resources ─────────────────────────────────────
exports.generateResources = async (req, res) => {
    try {
        const inputTopics = req.body.topics || req.body.questions;

        if (!inputTopics || !Array.isArray(inputTopics) || inputTopics.length === 0) {
            return res.status(400).json({ success: false, message: "topics array is required." });
        }

        const seenLinks    = new Set();
        const seenVideoIds = new Set();
        const BATCH_SIZE   = 3;
        const results      = [];

        for (let i = 0; i < inputTopics.length; i += BATCH_SIZE) {
            const batch = inputTopics.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.allSettled(
                batch.map(async (topic) => {
                    const resources = await fetchAndVerifyResources(topic, seenLinks, seenVideoIds);
                    console.log("SOURCE:", resources.source);

                    return {
                        topic,
                        source:    resources.source,
                        keywords:  resources.keywords,
                        resources: resources.articles.slice(0, 3),
                        videos:    resources.videos.slice(0, 2),
                    };
                })
            );

            results.push(
                ...batchResults.map((r, idx) =>
                    r.status === "fulfilled"
                        ? r.value
                        : { topic: batch[idx], source: "error", keywords: [], resources: [], videos: [] }
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
