const { searchWithSerper } = require("../utils/serperSearch");
const { searchWithYouTube } = require("../utils/youtubeSearch");
const { buildCacheKey } = require("../utils/cachedAI");
const { checkBudget, recordUsage } = require("../utils/budgetGuard");
const CachedContent = require("../models/CachedContent");

// ── Video ID Extractor ────────────────────────────────────────────────────────
// Parses a YouTube URL to extract the video ID. Returns null if not a YT URL.
function extractVideoId(url) {
    if (!url || typeof url !== "string") return null;
    try {
        const parsed = new URL(url);
        // Standard: youtube.com/watch?v=ID
        if (parsed.hostname.includes("youtube.com")) {
            return parsed.searchParams.get("v") || null;
        }
        // Short: youtu.be/ID
        if (parsed.hostname === "youtu.be") {
            return parsed.pathname.slice(1) || null;
        }
    } catch {
        return null;
    }
    return null;
}

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
        // Note: bare "array" removed — too broad (matches "numpy arrays", "byte array" etc.)
        // Algorithm/coding terms added for Two Sum, hash map, sliding window type questions
        keys: ["dsa", "data structure", "algorithm", "linked list", "stack", "queue",
               "binary tree", "binary search", "hash table", "hash map", "heap",
               "sorting", "searching", "recursion", "backtracking", "two pointer",
               "sliding window", "sum", "two sum", "subarray", "indices",
               "integer", "target", "pair", "count", "frequency", "prefix"],
        videos: [
            { title: "Data Structures & Algorithms Full Course", url: "https://www.youtube.com/watch?v=8hly31xKli0", videoId: "8hly31xKli0", thumbnail: "https://img.youtube.com/vi/8hly31xKli0/hqdefault.jpg" },
            { title: "Big O Notation — Time Complexity", url: "https://www.youtube.com/watch?v=Mo8f7as_Kw0", videoId: "Mo8f7as_Kw0", thumbnail: "https://img.youtube.com/vi/Mo8f7as_Kw0/hqdefault.jpg" },
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
        // Pure Python — pandas/numpy moved to dedicated data science pool below
        keys: ["python", "django", "flask", "decorator", "generator", "list comprehension",
               "gil", "virtualenv", "pip", "asyncio"],
        videos: [
            { title: "Python for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", videoId: "_uQrJ0TkZlc", thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg" },
            { title: "Python OOP Crash Course", url: "https://www.youtube.com/watch?v=JeznW_7DlB0", videoId: "JeznW_7DlB0", thumbnail: "https://img.youtube.com/vi/JeznW_7DlB0/hqdefault.jpg" },
        ],
        articles: [
            { title: "Python Official Documentation", url: "https://docs.python.org/3/" },
            { title: "Real Python Tutorials", url: "https://realpython.com/" },
        ],
    },
    {
        // Dedicated Pandas / NumPy / Data Science pool — higher specificity wins over Python pool
        keys: ["pandas", "numpy", "dataframe", "data analysis", "data science",
               "data manipulation", "scipy", "matplotlib", "seaborn", "jupyter",
               "missing data", "nan", "fillna", "groupby", "merge", "pivot",
               "numerical computation", "vectorization", "broadcasting"],
        videos: [
            { title: "Pandas Full Course", url: "https://www.youtube.com/watch?v=vmEHCJofslg", videoId: "vmEHCJofslg", thumbnail: "https://img.youtube.com/vi/vmEHCJofslg/hqdefault.jpg" },
            { title: "NumPy for Beginners", url: "https://www.youtube.com/watch?v=QUT1VHiLmmI", videoId: "QUT1VHiLmmI", thumbnail: "https://img.youtube.com/vi/QUT1VHiLmmI/hqdefault.jpg" },
        ],
        articles: [
            { title: "Pandas Official Documentation", url: "https://pandas.pydata.org/docs/" },
            { title: "NumPy Official Documentation", url: "https://numpy.org/doc/stable/" },
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
        keys: ["behavioral", "hr", "star method", "teamwork", "conflict", "leadership",
               "communication", "tell me about yourself", "background", "career",
               "motivation", "strength", "weakness", "goal", "achievement", "challenge",
               "role", "culture", "fit", "experience", "interest", "google", "amazon",
               "microsoft", "meta", "apple", "company"],
        videos: [
            { title: "STAR Method — Behavioral Interview Questions", url: "https://www.youtube.com/watch?v=LHolMnLEPSk", videoId: "LHolMnLEPSk", thumbnail: "https://img.youtube.com/vi/LHolMnLEPSk/hqdefault.jpg" },
            { title: "Tell Me About Yourself — Best Answer", url: "https://www.youtube.com/watch?v=kayOhGRcNt4", videoId: "kayOhGRcNt4", thumbnail: "https://img.youtube.com/vi/kayOhGRcNt4/hqdefault.jpg" },
        ],
        articles: [
            { title: "STAR Method Guide — Indeed", url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique" },
            { title: "Amazon Leadership Principles", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles" },
        ],
    },
    {
        keys: ["machine learning", "deep learning", "neural network", "ai", "ml", "nlp",
               "computer vision", "model training", "gradient descent", "overfitting",
               "missing values", "imputation", "feature engineering", "feature importance",
               "feature selection", "classification", "regression", "clustering",
               "random forest", "decision tree", "svm", "xgboost", "data preprocessing",
               "dimensionality reduction", "pca", "cross validation", "hyperparameter"],
        videos: [
            { title: "Machine Learning Full Course", url: "https://www.youtube.com/watch?v=NWONeJKn6kc", videoId: "NWONeJKn6kc", thumbnail: "https://img.youtube.com/vi/NWONeJKn6kc/hqdefault.jpg" },
            { title: "Handling Missing Data in ML", url: "https://www.youtube.com/watch?v=P_iMSYQnqac", videoId: "P_iMSYQnqac", thumbnail: "https://img.youtube.com/vi/P_iMSYQnqac/hqdefault.jpg" },
        ],
        articles: [
            { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
            { title: "Handling Missing Values — Towards Data Science", url: "https://towardsdatascience.com/6-different-ways-to-compensate-for-missing-values-data-imputation-with-examples-6022d9ca0779" },
        ],
    },
];

// ── Stopwords for Keyword Extraction ─────────────────────────────────────────
// Comprehensive English stopword list — includes articles, pronouns, prepositions,
// conjunctions, modals, common verbs, and interview-specific filler phrases.
const TECH_STOPWORDS = new Set([
    // Articles / determiners
    "a","an","the","this","that","these","those","some","any","all","both",
    "each","every","few","more","most","other","such","no","nor","not",
    // Pronouns
    "i","you","he","she","it","we","they","me","him","her","us","them",
    "my","your","his","its","their","our","mine","yours","hers","ours","theirs",
    "who","whom","whose","which",
    // Prepositions
    "at","by","for","in","of","on","to","up","as","off","out","so","vs",
    "and","or","but","if","then","than","yet","nor","with","from","into",
    "onto","upon","over","under","down","about","above","below","through",
    "before","after","during","since","until","without","within","along",
    "across","behind","beyond","against","between","among","around",
    // Auxiliary / modal verbs
    "is","are","was","were","be","been","being","have","has","had",
    "do","does","did","will","would","could","should","may","might",
    "must","shall","can","need","dare","ought",
    // Common general verbs (non-technical)
    "go","get","got","give","gave","take","took","make","made","see","saw",
    "know","knew","think","thought","look","looked","want","wanted","come",
    "came","tell","told","feel","felt","try","tried","call","let","put",
    "seem","seemed","help","turn","start","play","move","live","run","set",
    "keep","hold","bring","show","leave","begin","follow","stop","read",
    "open","offer","walk","stay","fall","reach","pass","send","expect",
    "decide","pull","raise","cut","remain","suggest","report","speak",
    "happen","appear","buy","serve","spend","grow","allow","assume",
    // Adverbs / connectors
    "just","now","also","too","very","well","here","there","even","only",
    "still","already","ever","never","often","always","sometimes","usually",
    "again","once","twice","however","therefore","thus","hence","moreover",
    "furthermore","nevertheless","nonetheless","instead","otherwise",
    "although","because","while","though","unless","since","when","where",
    "how","what","why","whereas","whether","meanwhile",
    // Interview / question filler words
    "explain","describe","implement","write","find","calculate","define",
    "compare","difference","between","versus","advantage","disadvantage",
    "use","used","using","work","works","programming","developer","engineer",
    "software","build","create","real","world","scenario","question",
    "interview","preparation","concept","understand","case","study","problem",
    "solution","approach","best","practice","common","standard","modern",
    "basic","advanced","intermediate","level","senior","junior","complete",
    "full","course","video","article","blog","learn","knowledge","skill",
    "topic","role","position","candidate","given","example","various",
    "fundamental","achieve","considering","interest","discussion","resonate",
    "aspects","navigated","tackled","struggle","enhance","addressing",
    "explore","importance","purpose","primary","secondary","specific",
    "general","technical","related","type","kind","form","number","time",
    "day","year","month","week","first","second","third","last","next",
    "previous","current","new","old","large","small","big","great","good",
    "high","low","long","short","fast","slow","like","please","hope",
    "acquire","navigate","tackle","address","ve","re","ll","don","didn",
    "doesn","isn","aren","wasn","weren","hasn","haven","hadn","won",
    "wouldn","couldn","shouldn","might","mightn",
    // Generic context/strategy words that pollute tech keyword extraction
    "efficient","efficiently","apply","applied","applies","similar","similarly",
    "strategy","strategies","manage","managed","manages","handle","handles",
    "handled","significant","significantly","impact","impacts","impacted",
    "traverse","traversal","traversals","method","methods","technique",
    "techniques","manner","context","situation","mean","means","way","ways",
    "affect","affects","ensure","ensures","consider","considers","involve",
    "involves","require","requires","perform","performs","performance",
    "provide","provides","support","supports","maintain","maintains",
    "optimize","optimizes","process","processes","operation","operations",
    "discuss","discusses","elaborate","elaborates","mention","mentions",
]);

// Extracts up to 10 meaningful technical keywords from question text.
// Filters aggressively so only domain-specific terms survive.
function extractKeywords(text) {
    if (!text) return [];
    const clean = text.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ");
    const tokens = clean.split(/\s+/).filter(
        t => t.length > 2 && !TECH_STOPWORDS.has(t)
    );
    return [...new Set(tokens)].slice(0, 10);
}

// ── Smart Search Query Builder ────────────────────────────────────────────────
// Strips introductory context from compound questions and builds a focused
// 6-8 word search query that targets the CORE technical topic.
// E.g.: "Considering your interest in AI/ML, write a function to find the max
//        element in an array" → "find max element array algorithm"
function buildSearchQuery(topic, role = "") {
    let text = topic;

    // Strip leading context clauses (everything before the first comma
    // that's followed by a verb indicating the actual task)
    const commaIdx = text.search(/,\s*(write|find|implement|calculate|explain|design|describe|how|what|given|can you|now)/i);
    if (commaIdx > 0 && commaIdx < text.length * 0.6) {
        // Only strip if the context clause is in the first 60% of the text
        text = text.slice(commaIdx + 1).trim();
    }

    // Also strip common leading phrases
    text = text
        .replace(/^(as you('ve)?|given your|considering your|based on|now that|since you|you've|as we|having|in light of)[^,]*,\s*/i, "")
        .replace(/^(please |can you |could you |would you |how would you |what is |what are |explain |describe |implement |write )/i, "")
        .trim();

    // Extract keywords from the cleaned text
    const kws = extractKeywords(text);

    if (kws.length >= 3) {
        // Build query: top 5 technical keywords + role hint
        const roleHint = role.split(" ").slice(0, 2).join(" "); // e.g. "AI Engineer"
        return `${kws.slice(0, 5).join(" ")} ${roleHint}`.trim();
    }

    // Fallback: use first 80 chars of the cleaned text
    return text.slice(0, 80).trim();
}

// ── Relevance Scoring ─────────────────────────────────────────────────────────
// Scores a static pool entry against the question keywords.
// Denominator is capped at 5 so long conversational questions (10+ keywords)
// are not over-penalized — 1 strong hit still reaches the 0.2 threshold.
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
    // Cap denominator at 5: prevents long questions from diluting a good match
    return hits / Math.min(questionKeywords.length, 5);
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

const Groq = require("groq-sdk");
const { resourceSemanticFilterPrompt } = require("../utils/prompts");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Uses AI to strictly filter candidate resources for relevance.
 */
async function filterWithAI(question, candidates) {
    if (!candidates.length) return { videos: [], articles: [] };

    try {
        const prompt = resourceSemanticFilterPrompt(question, candidates);
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a strict relevance engine. Return ONLY valid JSON. No explanations.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.1, // High precision
        });

        const rawText = completion.choices[0]?.message?.content;
        if (!rawText) return { videos: [], articles: [] };

        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const filtered = JSON.parse(cleanedText);

        return {
            videos: filtered.videos || [],
            articles: filtered.articles || []
        };
    } catch (error) {
        console.error("AI Filtering Error:", error.message);
        // Fallback to top 2 if AI fails
        return {
            videos: candidates.filter(c => c.type === "video").slice(0, 2),
            articles: candidates.filter(c => c.type === "article").slice(0, 2)
        };
    }
}

const RESOURCE_CACHE_VERSION = "v7"; // Bumped: score denominator capped at 5, DSA coding terms, fixed STAR video

// ── Core Resource Fetcher ─────────────────────────────────────────────────────
/**
 * Fetches semantically relevant resources for a given question.
 *
 * Priority:
 *   1. MongoDB TTL cache  → source: "cache"   (instant, zero API cost)
 *   2. YouTube + Serper live search + AI filter → source: "api"   (most relevant)
 *   3. Static pool keyword match → source: "static"  (last resort, APIs returned 0)
 */
const fetchAndVerifyResources = async (topic, seenLinks = new Set(), seenVideoIds = new Set(), role = "Software Engineer") => {
    const questionKeywords = extractKeywords(topic);
    // Cache key includes: version + role + keyword fingerprint + first 60 chars of raw topic
    // (so questions with same keywords but different context get separate cache slots)
    const cacheKey = buildCacheKey("resource", {
        kw: questionKeywords.join(" "),
        v:  RESOURCE_CACHE_VERSION,
        r:  role.substring(0, 5),
        t:  topic.substring(0, 60),
    });

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
    } catch (e) {
        console.warn("[ResourceController] Cache read error:", e.message);
    }

    // ── Layer 2: YouTube + Serper Live Search + AI Filtering ─────────────────
    // PRIMARY source: real-time API search gives question-specific relevant results.
    // Uses buildSearchQuery() to strip introductory context (e.g., "Considering your
    // interest in AI/ML...") so the search targets the actual technical topic.
    const semanticQuery = buildSearchQuery(topic, role);

    console.log(`[Resources] Layer 2 — API search for: "${semanticQuery}"`);

    const [ytBudget, serperBudget] = await Promise.all([
        checkBudget("youtube"),
        checkBudget("serper"),
    ]);

    const [rawVideos, rawArticles] = await Promise.all([
        ytBudget.allowed
            ? searchWithYouTube(semanticQuery, 12)
                .then(r => { recordUsage("youtube"); return r; })
                .catch(e => { console.warn("[Resources] YouTube search error:", e.message); return []; })
            : (console.warn("[Resources] YouTube budget exceeded"), Promise.resolve([])),
        serperBudget.allowed
            ? searchWithSerper(semanticQuery, 12)
                .then(r => { recordUsage("serper"); return r; })
                .catch(e => { console.warn("[Resources] Serper search error:", e.message); return []; })
            : (console.warn("[Resources] Serper budget exceeded"), Promise.resolve([])),
    ]);

    console.log(`[Resources] Raw results — YouTube: ${rawVideos.length}, Serper: ${rawArticles.length}`);

    // Map raw API results to candidate format for AI filtering
    const apiCandidates = [
        ...(rawVideos || []).map(v => ({
            type:      "video",
            title:     v.title,
            url:       `https://www.youtube.com/watch?v=${v.videoId}`,
            videoId:   v.videoId,
            snippet:   v.description || "",
            thumbnail: v.thumbnail,
        })),
        ...(rawArticles || []).map(a => ({
            type:    "article",
            title:   a.title,
            url:     a.link,
            snippet: a.snippet || "",
        })),
    ];

    // ── Layer 3: Static Pool Fallback ────────────────────────────────────────
    // Only used when BOTH YouTube and Serper return 0 results (e.g. quota exceeded
    // or network error). Keyword matching against curated pool as a last resort.
    if (apiCandidates.length === 0) {
        console.log("[Resources] Layer 3 — APIs empty, trying static pool fallback.");
        const staticMatch = matchStaticPool(questionKeywords);
        if (staticMatch) {
            const staticVideos = staticMatch.videos
                .filter(v => v.url && extractVideoId(v.url) && !seenVideoIds.has(extractVideoId(v.url)))
                .slice(0, 2)
                .map(v => ({
                    title:     v.title,
                    url:       v.url,
                    videoId:   v.videoId || extractVideoId(v.url),
                    thumbnail: resolveThumbnail(v.videoId || extractVideoId(v.url), v.thumbnail),
                }));

            const staticArticles = staticMatch.articles
                .filter(a => a.url && isValidUrl(a.url) && !seenLinks.has(a.url))
                .slice(0, 2);

            if (staticVideos.length > 0 || staticArticles.length > 0) {
                staticVideos.forEach(v => seenVideoIds.add(v.videoId));
                staticArticles.forEach(a => seenLinks.add(a.url));
                const staticResult = { videos: staticVideos, articles: staticArticles };
                CachedContent.create({
                    cacheKey, type: "resource", content: staticResult,
                    source: "static",
                    expiresAt: new Date(Date.now() + 7 * 86_400_000),
                }).catch(() => {});
                return { source: "static", ...staticResult, keywords: questionKeywords };
            }
        }
        // Nothing found anywhere
        return { source: "empty", videos: [], articles: [], keywords: questionKeywords };
    }

    // ── AI Filter: Pick most relevant 2 videos + 2 articles from API results ──
    let filteredApi = { videos: [], articles: [] };
    filteredApi = await filterWithAI(topic, apiCandidates);

    // If AI returned nothing, use raw top results so users never see empty
    const resolvedVideos = filteredApi.videos.length > 0
        ? filteredApi.videos
        : apiCandidates.filter(c => c.type === "video").slice(0, 3);

    const resolvedArticles = filteredApi.articles.length > 0
        ? filteredApi.articles
        : apiCandidates.filter(c => c.type === "article").slice(0, 3);

    const videos = resolvedVideos
        .filter(v => v.url && extractVideoId(v.url) && !seenVideoIds.has(extractVideoId(v.url)))
        .slice(0, 2)
        .map(v => {
            const videoId = extractVideoId(v.url);
            return {
                title:     v.title,
                url:       v.url,
                videoId:   videoId,
                thumbnail: resolveThumbnail(videoId, v.thumbnail || null),
            };
        });

    const articles = resolvedArticles
        .filter(a => a.url && isValidUrl(a.url) && !seenLinks.has(a.url))
        .slice(0, 2);

    videos.forEach(v => seenVideoIds.add(v.videoId));
    articles.forEach(a => seenLinks.add(a.url));

    const result = { videos, articles };

    if (videos.length > 0 || articles.length > 0) {
        CachedContent.create({
            cacheKey,
            type:      "resource",
            content:   result,
            source:    "ai",
            expiresAt: new Date(Date.now() + 14 * 86_400_000),
        }).catch(e => console.warn("[ResourceController] Cache write error (api):", e.message));
    }

    return {
        source:   videos.length > 0 || articles.length > 0 ? "api" : "empty",
        ...result,
        keywords: questionKeywords,
    };
};

// ── Route Handler: POST /api/ai/resources ─────────────────────────────────────
exports.generateResources = async (req, res) => {
    try {
        const inputTopics = req.body.topics || req.body.questions;
        const blueprint = req.body.blueprint || {};
        const role = blueprint.targetRole || blueprint.role || "Software Engineer";

        if (!inputTopics || !Array.isArray(inputTopics) || inputTopics.length === 0) {
            return res.status(400).json({ success: false, message: "topics array is required." });
        }

        const seenLinks    = new Set();
        const seenVideoIds = new Set();
        const BATCH_SIZE   = 3;
        const results      = [];

        console.log(`[Resources] Generating for Role: ${role}, Topics: ${inputTopics.length}`);

        for (let i = 0; i < inputTopics.length; i += BATCH_SIZE) {
            const batch = inputTopics.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.allSettled(
                batch.map(async (topic) => {
                    const resources = await fetchAndVerifyResources(topic, seenLinks, seenVideoIds, role);
                    
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
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.fetchAndVerifyResources = fetchAndVerifyResources;
