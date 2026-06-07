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
// Each entry targets ONE precise topic. Keys are matched against the full question text.
// All videoIds are manually verified working YouTube videos.
const STATIC_RESOURCE_POOL = [
    {
        keys: ["sorting", "merge sort", "quick sort", "bubble sort", "insertion sort", "heap sort", "counting sort"],
        videos: [
            { title: "Sorting Algorithms Explained Visually", url: "https://www.youtube.com/watch?v=RfXt_qHDEPw", videoId: "RfXt_qHDEPw", thumbnail: "https://img.youtube.com/vi/RfXt_qHDEPw/hqdefault.jpg" },
            { title: "Merge Sort vs Quick Sort", url: "https://www.youtube.com/watch?v=es2T6KY45cA", videoId: "es2T6KY45cA", thumbnail: "https://img.youtube.com/vi/es2T6KY45cA/hqdefault.jpg" },
        ],
        articles: [
            { title: "Sorting Algorithms — GeeksforGeeks", url: "https://www.geeksforgeeks.org/sorting-algorithms/" },
            { title: "Merge Sort vs Quick Sort — Baeldung", url: "https://www.baeldung.com/cs/merge-sort-vs-quicksort" },
        ],
    },
    {
        keys: ["linked list", "node", "pointer", "singly", "doubly", "cycle detection", "floyd"],
        videos: [
            { title: "Linked Lists — CS Dojo", url: "https://www.youtube.com/watch?v=WwfhLC16bis", videoId: "WwfhLC16bis", thumbnail: "https://img.youtube.com/vi/WwfhLC16bis/hqdefault.jpg" },
            { title: "Floyd's Cycle Detection Algorithm", url: "https://www.youtube.com/watch?v=gBTe7lFR3vc", videoId: "gBTe7lFR3vc", thumbnail: "https://img.youtube.com/vi/gBTe7lFR3vc/hqdefault.jpg" },
        ],
        articles: [
            { title: "Linked List — GeeksforGeeks", url: "https://www.geeksforgeeks.org/data-structures/linked-list/" },
            { title: "Linked List Problems — LeetCode", url: "https://leetcode.com/tag/linked-list/" },
        ],
    },
    {
        keys: ["binary tree", "tree", "bst", "binary search tree", "traversal", "inorder", "preorder", "depth", "bfs", "dfs"],
        videos: [
            { title: "Binary Tree Algorithms — freeCodeCamp", url: "https://www.youtube.com/watch?v=fAAZixBzIAI", videoId: "fAAZixBzIAI", thumbnail: "https://img.youtube.com/vi/fAAZixBzIAI/hqdefault.jpg" },
            { title: "BFS vs DFS — Graph Traversal", url: "https://www.youtube.com/watch?v=pcKY4hjDrxk", videoId: "pcKY4hjDrxk", thumbnail: "https://img.youtube.com/vi/pcKY4hjDrxk/hqdefault.jpg" },
        ],
        articles: [
            { title: "Binary Tree — GeeksforGeeks", url: "https://www.geeksforgeeks.org/binary-tree-data-structure/" },
            { title: "Tree Traversals — Programiz", url: "https://www.programiz.com/dsa/tree-traversal" },
        ],
    },
    {
        // Graph algorithms — BFS, DFS, shortest path, Dijkstra
        keys: ["graph", "dijkstra", "topological", "shortest path", "connected component", "union find", "minimum spanning", "prim", "kruskal", "adjacency"],
        videos: [
            { title: "Graph Algorithms — freeCodeCamp", url: "https://www.youtube.com/watch?v=EgI5nU9etnU", videoId: "EgI5nU9etnU", thumbnail: "https://img.youtube.com/vi/EgI5nU9etnU/hqdefault.jpg" },
            { title: "BFS vs DFS — Graph Traversal", url: "https://www.youtube.com/watch?v=pcKY4hjDrxk", videoId: "pcKY4hjDrxk", thumbnail: "https://img.youtube.com/vi/pcKY4hjDrxk/hqdefault.jpg" },
        ],
        articles: [
            { title: "Graph Data Structure — GeeksforGeeks", url: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/" },
            { title: "NeetCode Graph Problems", url: "https://neetcode.io/roadmap" },
        ],
    },
    {
        // Two pointers, sliding window, binary search techniques
        keys: ["two pointer", "sliding window", "binary search", "subarray", "palindrome", "longest", "substring", "contiguous", "window", "pointer technique"],
        videos: [
            { title: "Two Pointers Technique — NeetCode", url: "https://www.youtube.com/watch?v=On03HWe2tZM", videoId: "On03HWe2tZM", thumbnail: "https://img.youtube.com/vi/On03HWe2tZM/hqdefault.jpg" },
            { title: "Sliding Window Technique Explained", url: "https://www.youtube.com/watch?v=MK-NZ4hN7rs", videoId: "MK-NZ4hN7rs", thumbnail: "https://img.youtube.com/vi/MK-NZ4hN7rs/hqdefault.jpg" },
        ],
        articles: [
            { title: "Two Pointer Technique — GeeksforGeeks", url: "https://www.geeksforgeeks.org/two-pointers-technique/" },
            { title: "Sliding Window Problems — LeetCode", url: "https://leetcode.com/tag/sliding-window/" },
        ],
    },
    {
        // Merge/sort linked lists — specific high-precision pool to avoid meme garbage
        keys: ["merge sorted", "merge two", "merge k", "sorted list", "multiple sorted", "single sorted", "sorted linked"],
        videos: [
            { title: "Merge Two Sorted Lists — NeetCode", url: "https://www.youtube.com/watch?v=XIdigk956u0", videoId: "XIdigk956u0", thumbnail: "https://img.youtube.com/vi/XIdigk956u0/hqdefault.jpg" },
            { title: "Linked Lists — CS Dojo", url: "https://www.youtube.com/watch?v=WwfhLC16bis", videoId: "WwfhLC16bis", thumbnail: "https://img.youtube.com/vi/WwfhLC16bis/hqdefault.jpg" },
        ],
        articles: [
            { title: "Merge K Sorted Lists — GeeksforGeeks", url: "https://www.geeksforgeeks.org/merge-k-sorted-linked-lists/" },
            { title: "LeetCode — Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
        ],
    },
    {
        // Generic DSA fallback — hash maps, stacks, queues, heaps, recursion, backtracking
        keys: ["hash map", "hash table", "hashing", "two sum", "stack", "queue", "heap", "priority queue",
               "recursion", "backtracking", "data structure", "algorithm"],
        videos: [
            { title: "Data Structures & Algorithms Full Course", url: "https://www.youtube.com/watch?v=8hly31xKli0", videoId: "8hly31xKli0", thumbnail: "https://img.youtube.com/vi/8hly31xKli0/hqdefault.jpg" },
            { title: "Hash Tables Explained", url: "https://www.youtube.com/watch?v=shs0KM3wKv8", videoId: "shs0KM3wKv8", thumbnail: "https://img.youtube.com/vi/shs0KM3wKv8/hqdefault.jpg" },
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
            { title: "Dynamic Programming — Memoization & Tabulation", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", videoId: "oBt53YbR9Kk", thumbnail: "https://img.youtube.com/vi/oBt53YbR9Kk/hqdefault.jpg" },
        ],
        articles: [
            { title: "DP Patterns — GeeksforGeeks", url: "https://www.geeksforgeeks.org/dynamic-programming/" },
            { title: "FreeCodeCamp: Memoization in JS", url: "https://www.freecodecamp.org/news/memoization-in-javascript-and-react/" },
        ],
    },
    {
        keys: ["system design", "scalability", "distributed system", "microservice", "load balanc", "sharding", "caching", "cdn", "cap theorem"],
        videos: [
            { title: "System Design for Beginners — ByteByteGo", url: "https://www.youtube.com/watch?v=i53Gi_K3o7I", videoId: "i53Gi_K3o7I", thumbnail: "https://img.youtube.com/vi/i53Gi_K3o7I/hqdefault.jpg" },
            { title: "Microservices Explained — in 5 minutes", url: "https://www.youtube.com/watch?v=SqcY0GlETPk", videoId: "SqcY0GlETPk", thumbnail: "https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg" },
        ],
        articles: [
            { title: "ByteByteGo System Design", url: "https://bytebytego.com/" },
            { title: "System Design Primer — GitHub", url: "https://github.com/donnemartin/system-design-primer" },
        ],
    },
    {
        keys: ["database", "sql", "nosql", "mongodb", "postgresql", "indexing", "join", "acid", "transaction", "query optim"],
        videos: [
            { title: "Database Design Course — freeCodeCamp", url: "https://www.youtube.com/watch?v=4Z9KEBexzcM", videoId: "4Z9KEBexzcM", thumbnail: "https://img.youtube.com/vi/4Z9KEBexzcM/hqdefault.jpg" },
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
            { title: "Java Multithreading & Concurrency — Amigoscode", url: "https://www.youtube.com/watch?v=T-D1KVIuvjA", videoId: "T-D1KVIuvjA", thumbnail: "https://img.youtube.com/vi/T-D1KVIuvjA/hqdefault.jpg" },
        ],
        articles: [
            { title: "Oracle Java Documentation", url: "https://docs.oracle.com/en/java/" },
            { title: "Java Concurrency — Baeldung", url: "https://www.baeldung.com/java-concurrency" },
        ],
    },
    {
        // Android Activity Lifecycle — granular match beats the generic Android pool
        keys: ["activity", "lifecycle", "oncreate", "onresume", "onpause", "onstop", "ondestroy", "onstart", "configuration change", "screen rotation", "rotate", "orientation", "saveinstancestate", "ui state", "preserve state"],
        videos: [
            { title: "Activities & the Activity Lifecycle — Android Basics", url: "https://www.youtube.com/watch?v=SJw3Nu_h8kk", videoId: "SJw3Nu_h8kk", thumbnail: "https://img.youtube.com/vi/SJw3Nu_h8kk/hqdefault.jpg" },
            { title: "Android Development with Kotlin — Full Course", url: "https://www.youtube.com/watch?v=BCSlZIUj18Y", videoId: "BCSlZIUj18Y", thumbnail: "https://img.youtube.com/vi/BCSlZIUj18Y/hqdefault.jpg" },
        ],
        articles: [
            { title: "Activity Lifecycle — Android Developers", url: "https://developer.android.com/guide/components/activities/activity-lifecycle" },
            { title: "Handle Configuration Changes — Android Developers", url: "https://developer.android.com/guide/topics/resources/runtime-changes" },
        ],
    },
    {
        // Android Fragments & Intents
        keys: ["fragment", "intent", "intent filter", "explicit intent", "implicit intent", "navigation", "back stack", "bundle", "broadcast", "broadcastreceiver"],
        videos: [
            { title: "Fragments — Android Fundamentals", url: "https://www.youtube.com/watch?v=-vAI7RSPxOA", videoId: "-vAI7RSPxOA", thumbnail: "https://img.youtube.com/vi/-vAI7RSPxOA/hqdefault.jpg" },
            { title: "Intents & Intent Filters — Android Basics", url: "https://www.youtube.com/watch?v=2hIY1xuImuQ", videoId: "2hIY1xuImuQ", thumbnail: "https://img.youtube.com/vi/2hIY1xuImuQ/hqdefault.jpg" },
        ],
        articles: [
            { title: "Fragments Guide — Android Developers", url: "https://developer.android.com/guide/fragments" },
            { title: "Intents & Intent Filters — Android Developers", url: "https://developer.android.com/guide/components/intents-filters" },
        ],
    },
    {
        // Android ViewModel, LiveData, Coroutines — MVVM architecture
        keys: ["viewmodel", "livedata", "coroutine", "flow", "stateflow", "mvvm", "repository", "hilt", "dagger", "room", "jetpack", "architecture", "lifecycle-aware"],
        videos: [
            { title: "ViewModel Explained — Android Architecture Component", url: "https://www.youtube.com/watch?v=orH4K6qBzvE", videoId: "orH4K6qBzvE", thumbnail: "https://img.youtube.com/vi/orH4K6qBzvE/hqdefault.jpg" },
            { title: "Kotlin Coroutines — What Is A Coroutine?", url: "https://www.youtube.com/watch?v=ShNhJ3wMpvQ", videoId: "ShNhJ3wMpvQ", thumbnail: "https://img.youtube.com/vi/ShNhJ3wMpvQ/hqdefault.jpg" },
        ],
        articles: [
            { title: "ViewModel Overview — Android Developers", url: "https://developer.android.com/topic/libraries/architecture/viewmodel" },
            { title: "Kotlin Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" },
        ],
    },
    {
        // Android Push Notifications — Firebase Cloud Messaging
        keys: ["push notification", "fcm", "firebase", "cloud messaging", "notification", "terminated state", "background service", "foreground service", "workmanager", "service", "notification channel"],
        videos: [
            { title: "Firebase Push Notification (Cloud Messaging) in Kotlin", url: "https://www.youtube.com/watch?v=crJaLpCiNfI", videoId: "crJaLpCiNfI", thumbnail: "https://img.youtube.com/vi/crJaLpCiNfI/hqdefault.jpg" },
            { title: "Android Services — Background Tasks", url: "https://www.youtube.com/watch?v=jzZsG8n2R9A", videoId: "jzZsG8n2R9A", thumbnail: "https://img.youtube.com/vi/jzZsG8n2R9A/hqdefault.jpg" },
        ],
        articles: [
            { title: "Firebase Cloud Messaging — Android Guide", url: "https://firebase.google.com/docs/cloud-messaging/android/client" },
            { title: "Create Notifications — Android Developers", url: "https://developer.android.com/develop/ui/views/notifications/build-notification" },
        ],
    },
    {
        // Generic Android (fallback when no specific Android sub-topic matches)
        keys: ["android", "kotlin", "compose", "jetpack compose", "room database", "shared preferences", "datastore", "permission", "storage"],
        videos: [
            { title: "Android Development with Kotlin — Full Course", url: "https://www.youtube.com/watch?v=BCSlZIUj18Y", videoId: "BCSlZIUj18Y", thumbnail: "https://img.youtube.com/vi/BCSlZIUj18Y/hqdefault.jpg" },
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
            { title: "REST API Design Best Practices", url: "https://www.youtube.com/watch?v=lsMQRaeKNDk", videoId: "lsMQRaeKNDk", thumbnail: "https://img.youtube.com/vi/lsMQRaeKNDk/hqdefault.jpg" },
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
            { title: "Docker Tutorial for Beginners — TechWorld with Nana", url: "https://www.youtube.com/watch?v=pU9Q6oiQNd0", videoId: "pU9Q6oiQNd0", thumbnail: "https://img.youtube.com/vi/pU9Q6oiQNd0/hqdefault.jpg" },
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
            { title: "STAR Method — Behavioral Interview Questions", url: "https://www.youtube.com/watch?v=HW29067qVWk", videoId: "HW29067qVWk", thumbnail: "https://img.youtube.com/vi/HW29067qVWk/hqdefault.jpg" },
            { title: "Tell Me About Yourself — Best Answer", url: "https://www.youtube.com/watch?v=kayOhGRcNt4", videoId: "kayOhGRcNt4", thumbnail: "https://img.youtube.com/vi/kayOhGRcNt4/hqdefault.jpg" },
        ],
        articles: [
            { title: "STAR Method Guide — Indeed", url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique" },
            { title: "Amazon Leadership Principles", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles" },
        ],
    },
    {
        keys: ["overfitting", "underfitting", "bias variance", "regularization", "dropout", "early stopping"],
        videos: [
            { title: "Overfitting and Underfitting in ML", url: "https://www.youtube.com/watch?v=dBLZg-RqoLg", videoId: "dBLZg-RqoLg", thumbnail: "https://img.youtube.com/vi/dBLZg-RqoLg/hqdefault.jpg" },
            { title: "Regularization Explained — L1 L2", url: "https://www.youtube.com/watch?v=Q81RR3yKn30", videoId: "Q81RR3yKn30", thumbnail: "https://img.youtube.com/vi/Q81RR3yKn30/hqdefault.jpg" },
        ],
        articles: [
            { title: "Overfitting in ML — EliteDataScience", url: "https://elitedatascience.com/overfitting-in-machine-learning" },
            { title: "Bias-Variance Tradeoff — MLMastery", url: "https://machinelearningmastery.com/gentle-introduction-to-the-bias-variance-trade-off-in-machine-learning/" },
        ],
    },
    {
        keys: ["imbalanced", "class imbalance", "smote", "class_weight", "oversampling", "undersampling", "class 0", "class 1", "logistic regression"],
        videos: [
            { title: "Handling Imbalanced Datasets in ML", url: "https://www.youtube.com/watch?v=JnlM4yLFNuo", videoId: "JnlM4yLFNuo", thumbnail: "https://img.youtube.com/vi/JnlM4yLFNuo/hqdefault.jpg" },
            { title: "SMOTE Explained — Imbalanced Data", url: "https://www.youtube.com/watch?v=FheTDyCwRdE", videoId: "FheTDyCwRdE", thumbnail: "https://img.youtube.com/vi/FheTDyCwRdE/hqdefault.jpg" },
        ],
        articles: [
            { title: "Imbalanced Classification — MLMastery", url: "https://machinelearningmastery.com/what-is-imbalanced-classification/" },
            { title: "SMOTE for Imbalanced Data — Analytics Vidhya", url: "https://www.analyticsvidhya.com/blog/2020/10/overcoming-class-imbalance-using-smote-techniques/" },
        ],
    },
    {
        keys: ["gradient descent", "sgd", "adam", "optimizer", "learning rate", "convergence", "loss function"],
        videos: [
            { title: "Gradient Descent — 3Blue1Brown", url: "https://www.youtube.com/watch?v=IHZwWFHWa-w", videoId: "IHZwWFHWa-w", thumbnail: "https://img.youtube.com/vi/IHZwWFHWa-w/hqdefault.jpg" },
            { title: "Adam Optimizer Explained", url: "https://www.youtube.com/watch?v=JXQT_vxqwIs", videoId: "JXQT_vxqwIs", thumbnail: "https://img.youtube.com/vi/JXQT_vxqwIs/hqdefault.jpg" },
        ],
        articles: [
            { title: "Gradient Descent — MLMastery", url: "https://machinelearningmastery.com/gradient-descent-for-machine-learning/" },
            { title: "Optimizers Explained — Ruder.io", url: "https://ruder.io/optimizing-gradient-descent/" },
        ],
    },
    {
        keys: ["missing values", "imputation", "nan", "fillna", "missing data", "data preprocessing"],
        videos: [
            { title: "Handling Missing Data in ML", url: "https://www.youtube.com/watch?v=P_iMSYQnqac", videoId: "P_iMSYQnqac", thumbnail: "https://img.youtube.com/vi/P_iMSYQnqac/hqdefault.jpg" },
            { title: "Missing Value Imputation with Pandas", url: "https://www.youtube.com/watch?v=9yl6-HEY7_s", videoId: "9yl6-HEY7_s", thumbnail: "https://img.youtube.com/vi/9yl6-HEY7_s/hqdefault.jpg" },
        ],
        articles: [
            { title: "Handling Missing Values — Towards Data Science", url: "https://towardsdatascience.com/6-different-ways-to-compensate-for-missing-values-data-imputation-with-examples-6022d9ca0779" },
            { title: "Missing Data Strategies — Kaggle", url: "https://www.kaggle.com/code/alexisbcook/missing-values" },
        ],
    },
    {
        keys: ["precision", "recall", "f1", "auc", "roc", "confusion matrix", "evaluation metric"],
        videos: [
            { title: "Precision, Recall, F1-Score Explained", url: "https://www.youtube.com/watch?v=jJ7ff7Gcq34", videoId: "jJ7ff7Gcq34", thumbnail: "https://img.youtube.com/vi/jJ7ff7Gcq34/hqdefault.jpg" },
            { title: "ROC Curve and AUC Explained", url: "https://www.youtube.com/watch?v=4jRBRDbJemM", videoId: "4jRBRDbJemM", thumbnail: "https://img.youtube.com/vi/4jRBRDbJemM/hqdefault.jpg" },
        ],
        articles: [
            { title: "Precision vs Recall — Google Developers", url: "https://developers.google.com/machine-learning/crash-course/classification/precision-and-recall" },
            { title: "ROC and AUC — MLMastery", url: "https://machinelearningmastery.com/roc-curves-and-precision-recall-curves-for-classification-in-python/" },
        ],
    },
    {
        keys: ["neural network", "deep learning", "backpropagation", "forward propagation", "activation function", "cnn", "rnn", "lstm"],
        videos: [
            { title: "Neural Networks Explained — 3Blue1Brown", url: "https://www.youtube.com/watch?v=aircAruvnKk", videoId: "aircAruvnKk", thumbnail: "https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg" },
            { title: "Backpropagation — 3Blue1Brown", url: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", videoId: "Ilg3gGewQ5U", thumbnail: "https://img.youtube.com/vi/Ilg3gGewQ5U/hqdefault.jpg" },
        ],
        articles: [
            { title: "Neural Networks — 3Blue1Brown (text)", url: "https://www.3blue1brown.com/topics/neural-networks" },
            { title: "Backpropagation — Brilliant.org", url: "https://brilliant.org/wiki/backpropagation/" },
        ],
    },
    {
        keys: ["random forest", "decision tree", "ensemble", "bagging", "xgboost", "gradient boosting", "feature importance"],
        videos: [
            { title: "Random Forest Algorithm Explained", url: "https://www.youtube.com/watch?v=J4Wdy0Wc_xQ", videoId: "J4Wdy0Wc_xQ", thumbnail: "https://img.youtube.com/vi/J4Wdy0Wc_xQ/hqdefault.jpg" },
            { title: "XGBoost — Gradient Boosting Explained", url: "https://www.youtube.com/watch?v=OtD8wVaFm6E", videoId: "OtD8wVaFm6E", thumbnail: "https://img.youtube.com/vi/OtD8wVaFm6E/hqdefault.jpg" },
        ],
        articles: [
            { title: "Random Forest — Towards Data Science", url: "https://towardsdatascience.com/understanding-random-forest-58381e0602d2" },
            { title: "XGBoost Documentation", url: "https://xgboost.readthedocs.io/en/stable/" },
        ],
    },
    {
        keys: ["transformer", "attention", "self-attention", "bert", "gpt", "nlp", "word embedding", "word2vec", "tfidf", "tokeniz"],
        videos: [
            { title: "Transformers — Attention is All You Need", url: "https://www.youtube.com/watch?v=SZorAJ4I-sA", videoId: "SZorAJ4I-sA", thumbnail: "https://img.youtube.com/vi/SZorAJ4I-sA/hqdefault.jpg" },
            { title: "Word Embeddings — Word2Vec", url: "https://www.youtube.com/watch?v=viZrOnJclY0", videoId: "viZrOnJclY0", thumbnail: "https://img.youtube.com/vi/viZrOnJclY0/hqdefault.jpg" },
        ],
        articles: [
            { title: "Illustrated Transformer — Jay Alammar", url: "https://jalammar.github.io/illustrated-transformer/" },
            { title: "Word2Vec Explained — Towards Data Science", url: "https://towardsdatascience.com/introduction-to-word-embedding-and-word2vec-652d0c2060fa" },
        ],
    },
    {
        keys: ["supervised", "unsupervised", "reinforcement", "classification", "regression", "clustering",
               "machine learning", "machine", "learning", "ml", "ai", "svm", "cross validation", "hyperparameter",
               "feature engineering", "feature scaling", "normalization", "standardization",
               "pca", "dimensionality reduction", "data drift", "model deploy",
               "fine-tuning", "fine tuning", "transfer learning", "pre-trained", "pretrained",
               "from scratch", "training from", "train from", "foundation model", "llm"],
        videos: [
            { title: "Machine Learning — Stanford CS229", url: "https://www.youtube.com/watch?v=jGwO_UgTS7I", videoId: "jGwO_UgTS7I", thumbnail: "https://img.youtube.com/vi/jGwO_UgTS7I/hqdefault.jpg" },
            { title: "ML Algorithms Overview", url: "https://www.youtube.com/watch?v=E0Hmnixke2g", videoId: "E0Hmnixke2g", thumbnail: "https://img.youtube.com/vi/E0Hmnixke2g/hqdefault.jpg" },
        ],
        articles: [
            { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
            { title: "Fine-tuning vs Training from Scratch — Hugging Face", url: "https://huggingface.co/docs/transformers/training" },
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
    // Additional interview verbs that cause false substring matches
    // NOTE: intentionally NOT including technical terms like model, machine, learning,
    // data, class, test, design, code — those are meaningful interview keywords
    "detect","prevent","fix","wrong",
    "prefer","difference","compare","advantages",
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
// Builds a precise, topic-focused search query from the interview question.
// Goal: produce queries like "overfitting machine learning explained" or
// "merge sort vs quick sort tutorial" — NOT generic keyword soup.
function buildSearchQuery(topic, role = "") {
    let text = topic;

    // Strip leading context clauses
    const commaIdx = text.search(/,\s*(write|find|implement|calculate|explain|design|describe|how|what|given|can you|now)/i);
    if (commaIdx > 0 && commaIdx < text.length * 0.6) {
        text = text.slice(commaIdx + 1).trim();
    }

    // Strip common leading phrases
    text = text
        .replace(/^(as you('ve)?|given your|considering your|based on|now that|since you|you've|as we|having|in light of)[^,]*,\s*/i, "")
        .replace(/^(please |can you |could you |would you |how would you )/i, "")
        .trim();

    // Extract keywords from the cleaned text
    const kws = extractKeywords(text);

    if (kws.length >= 2) {
        // Use top 6 keywords + "interview tutorial explained" suffix for precision
        const query = kws.slice(0, 6).join(" ");
        return `${query} interview tutorial explained`.trim();
    }

    // Fallback: use first 80 chars + tutorial suffix
    return `${text.slice(0, 80).trim()} tutorial explained`;

}

// ── Relevance Scoring ─────────────────────────────────────────────────────────
// Scores a static pool entry against the question keywords.
// Denominator is capped at 5 so long conversational questions (10+ keywords)
// are not over-penalized — 1 strong hit still reaches the 0.2 threshold.
// SPECIFICITY BONUS: Pools with fewer keys are more specific. When they match,
// they get a bonus so "overfitting" pool beats the generic "ML" pool.
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
    const baseScore = hits / Math.min(questionKeywords.length, 5);
    // Specificity bonus: smaller pools (≤10 keys) are topic-specific.
    // They get a strong boost so "overfitting" pool beats the generic "ML" pool.
    const specificityBonus = (hits > 0 && entry.keys.length <= 10) ? 0.5 : 0;
    return baseScore + specificityBonus;
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

// ── Title Relevance Guard ─────────────────────────────────────────────────────
// Rejects live API videos whose titles share zero meaningful words with the
// question keywords. This blocks garbage like "It's a Trap — Normal Forms"
// from appearing for a "merge sorted linked lists" question.
// Fail-open: if keywords are empty or title is missing, the video is KEPT.
function isTitleRelevant(videoTitle, questionKeywords) {
    if (!videoTitle || !questionKeywords || questionKeywords.length === 0) return true;
    const titleLower = videoTitle.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const titleWords = new Set(titleLower.split(/\s+/).filter(w => w.length > 2));
    // Accept if ANY question keyword appears in title (substring match)
    return questionKeywords.some(kw =>
        kw.length > 2 && (titleLower.includes(kw) || [...titleWords].some(tw => tw.includes(kw) || kw.includes(tw)))
    );
}

const Groq = require("groq-sdk");
const { resourceSemanticFilterPrompt } = require("../utils/prompts");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Uses Groq AI to strictly filter candidate resources for relevance.
 * Respects the daily Groq budget — skips AI call if quota is exhausted.
 */
async function filterWithAI(question, candidates) {
    if (!candidates.length) return { videos: [], articles: [] };

    // Check Groq budget before making the call
    const { allowed, reason } = await checkBudget("groq");
    if (!allowed) {
        console.warn(`[Resources] ⚠️ Groq budget exhausted (${reason}) — skipping AI filter, using top raw results.`);
        return {
            videos:   candidates.filter(c => c.type === "video").slice(0, 2),
            articles: candidates.filter(c => c.type === "article").slice(0, 2),
        };
    }

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

        recordUsage("groq");
        const rawText = completion.choices[0]?.message?.content;
        if (!rawText) return { videos: [], articles: [] };

        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const filtered = JSON.parse(cleanedText);

        console.log(`[Resources] ✅ Groq AI filter selected ${(filtered.videos||[]).length} videos, ${(filtered.articles||[]).length} articles.`);
        return {
            videos:   filtered.videos   || [],
            articles: filtered.articles || [],
        };
    } catch (error) {
        console.error("[Resources] ❌ Groq AI Filtering Error:", error.message);
        // Fallback: return top raw results without AI filtering
        return {
            videos:   candidates.filter(c => c.type === "video").slice(0, 2),
            articles: candidates.filter(c => c.type === "article").slice(0, 2),
        };
    }
}

const RESOURCE_CACHE_VERSION = "v12"; // Bumped: removed technical terms from stopwords, expanded ML/behavioral pools

// ── Startup API Key Diagnostics ───────────────────────────────────────────────
// Log missing keys immediately on boot so misconfiguration is obvious in logs.
(function warnMissingKeys() {
    if (!process.env.YOUTUBE_API_KEY) console.error("[ResourceController] ❌ YOUTUBE_API_KEY is NOT set — YouTube search will always return [].");
    else console.log("[ResourceController] ✅ YOUTUBE_API_KEY present.");

    if (!process.env.SERPER_API_KEY) console.error("[ResourceController] ❌ SERPER_API_KEY is NOT set — Serper search will always return [].");
    else console.log("[ResourceController] ✅ SERPER_API_KEY present.");

    if (!process.env.GROQ_API_KEY) console.error("[ResourceController] ❌ GROQ_API_KEY is NOT set — AI filtering will be skipped.");
    else console.log("[ResourceController] ✅ GROQ_API_KEY present.");
})();

// ── Safe DB / Budget Helpers ──────────────────────────────────────────────────
/**
 * Executes a DB fn with a 4s timeout. Returns defaultValue if it throws or times out.
 * This ensures a flaky MongoDB Atlas connection never blocks live API calls.
 */
async function safeDB(fn, defaultValue) {
    try {
        return await Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("DB_TIMEOUT")), 4000))
        ]);
    } catch (e) {
        console.warn("[ResourceController] DB op skipped:", e.message);
        return defaultValue;
    }
}

/**
 * Checks API budget with a 3s timeout. Defaults to allowed=true if DB is unreachable.
 * This ensures YouTube/Serper are always attempted when API keys are present.
 */
async function safeBudget(apiType) {
    try {
        return await Promise.race([
            checkBudget(apiType),
            new Promise(resolve => setTimeout(() => resolve({ allowed: true, tier: "FULL" }), 3000))
        ]);
    } catch {
        return { allowed: true, tier: "FULL" };
    }
}

/**
 * Race-safe cache writer. Uses updateOne + upsert:true so concurrent requests
 * for the same cacheKey never trigger E11000 duplicate key errors.
 * The last writer simply overwrites — all writes carry identical data anyway.
 */
async function safeUpsertCache(cacheKey, content, source, ttlMs) {
    return safeDB(() => CachedContent.updateOne(
        { cacheKey },
        { $set: { type: "resource", content, source, expiresAt: new Date(Date.now() + ttlMs) } },
        { upsert: true }
    ), null);
}

// ── YouTube oEmbed Dead-Video Filter ─────────────────────────────────────────
// Uses the free YouTube oEmbed endpoint (no API key required) to verify that
// each video actually exists. Dead / deleted / private videos return HTTP 404.
// Runs in parallel with a 4s timeout per video — if the check times out or
// throws, the video is conservatively KEPT (fail-open) to avoid dropping good
// results due to transient network issues.
async function isVideoAlive(videoId) {
    if (!videoId) return false;
    try {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch%3Fv%3D${videoId}&format=json`;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(timer);
        return res.ok; // 200 = alive, 404 = dead
    } catch {
        return true; // Timeout or network error — keep the video (fail-open)
    }
}

/**
 * Filters an array of video objects, removing any whose YouTube video ID is
 * dead (returns 404 from oEmbed). Runs all checks in parallel.
 * @param {Array<{videoId: string}>} videos
 * @returns {Promise<Array>}
 */
async function filterDeadVideos(videos) {
    if (!videos || videos.length === 0) return [];
    const results = await Promise.all(
        videos.map(async (v) => {
            const alive = await isVideoAlive(v.videoId);
            if (!alive) {
                console.warn(`[Resources] ⚠️ Dead video detected and removed: ${v.videoId} — "${v.title}"`);
            }
            return alive ? v : null;
        })
    );
    return results.filter(Boolean);
}

// ── Core Resource Fetcher ─────────────────────────────────────────────────────
/**
 * Fetches semantically relevant resources for a given question.
 *
 * Priority:
 *   1. MongoDB TTL cache  → source: "cache"   (instant, zero API cost)
 *   2. YouTube + Serper live search + AI filter + dead-video filter → source: "api"
 *   3. Static pool keyword match → source: "static"  (last resort, APIs returned 0)
 *
 * Every DB operation uses safeDB() — if MongoDB drops the connection,
 * the function skips cache and goes straight to live API search.
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

    // ── Layer 1: DB Cache (non-blocking) ──────────────────────────────
    const cached = await safeDB(() => CachedContent.findOne({ cacheKey }), null);
    if (cached) {
        console.log("[Resources] ✅ CACHE HIT:", cacheKey);
        safeDB(() => CachedContent.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } }), null);
        return {
            source:   "cache",
            videos:   cached.content.videos   || [],
            articles: cached.content.articles || [],
            keywords: questionKeywords,
        };
    }

    // ── Layer 2: YouTube + Serper Live Search + AI Filtering ─────────────────
    // Budget checks are non-blocking — if DB is down, default to allowed=true
    // so live API calls are ALWAYS attempted when keys are present.
    const semanticQuery = buildSearchQuery(topic, role);
    console.log(`[Resources] Layer 2 — live API search for: "${semanticQuery}"`);

    const [ytBudget, serperBudget] = await Promise.all([
        safeBudget("youtube"),
        safeBudget("serper"),
    ]);
    console.log(`[Resources] Budget — YouTube: ${ytBudget.allowed ? "✅ ALLOWED" : `❌ BLOCKED (${ytBudget.reason})`}, Serper: ${serperBudget.allowed ? "✅ ALLOWED" : `❌ BLOCKED (${serperBudget.reason})`}`);

    const [rawVideos, rawArticles] = await Promise.all([
        ytBudget.allowed
            ? searchWithYouTube(semanticQuery, 12)
                .then(r => {
                    console.log(`[Resources] YouTube returned ${r.length} results for "${semanticQuery}"`);
                    if (r.length > 0) recordUsage("youtube");
                    return r;
                })
                .catch(e => { console.error("[Resources] ❌ YouTube search FAILED:", e.message); return []; })
            : (console.warn("[Resources] ⚠️ YouTube budget exhausted — skipping live search"), Promise.resolve([])),
        serperBudget.allowed
            ? searchWithSerper(semanticQuery, 12)
                .then(r => {
                    console.log(`[Resources] Serper returned ${r.length} results for "${semanticQuery}"`);
                    if (r.length > 0) recordUsage("serper");
                    return r;
                })
                .catch(e => { console.error("[Resources] ❌ Serper search FAILED:", e.message); return []; })
            : (console.warn("[Resources] ⚠️ Serper budget exhausted — skipping live search"), Promise.resolve([])),
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
    //
    // ⚠️ IMPORTANT: Static pool intentionally does NOT filter by seenVideoIds /
    // seenLinks. The pool has only 2 videos per topic — when 2+ questions share
    // the same pool entry and both miss cache, cross-question dedup causes the
    // second question to silently return empty. Each question gets its own copy
    // of the static resources. Live API results (Layer 2) still dedup normally
    // because they have many alternatives to pick from.
    if (apiCandidates.length === 0) {
        console.warn("[Resources] ⚠️ Layer 3 — Both APIs returned 0 results. Using static pool fallback.");
        const staticMatch = matchStaticPool(questionKeywords);
        if (staticMatch) {
            const staticVideos = staticMatch.videos
                .filter(v => v.url && extractVideoId(v.url))   // no seenVideoIds check here
                .slice(0, 2)
                .map(v => ({
                    title:     v.title,
                    url:       v.url,
                    videoId:   v.videoId || extractVideoId(v.url),
                    thumbnail: resolveThumbnail(v.videoId || extractVideoId(v.url), v.thumbnail),
                }));

            const staticArticles = staticMatch.articles
                .filter(a => a.url && isValidUrl(a.url))       // no seenLinks check here
                .slice(0, 2);

            if (staticVideos.length > 0 || staticArticles.length > 0) {
                const staticResult = { videos: staticVideos, articles: staticArticles };
                safeUpsertCache(cacheKey, staticResult, "static", 7 * 86_400_000);
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

    // Map resolved videos first (before dedup/slice) so we have videoIds for the dead-video check
    // Also apply title relevance guard — rejects videos whose title shares zero keywords with question
    const mappedVideos = resolvedVideos
        .filter(v => v.url && extractVideoId(v.url) && !seenVideoIds.has(extractVideoId(v.url)))
        .filter(v => isTitleRelevant(v.title, questionKeywords))
        .map(v => {
            const videoId = extractVideoId(v.url);
            return {
                title:     v.title,
                url:       v.url,
                videoId:   videoId,
                thumbnail: resolveThumbnail(videoId, v.thumbnail || null),
            };
        });

    // Strip any dead / deleted YouTube videos before caching
    const liveVideos = await filterDeadVideos(mappedVideos);
    const videos = liveVideos.slice(0, 2);

    const articles = resolvedArticles
        .filter(a => a.url && isValidUrl(a.url) && !seenLinks.has(a.url))
        .slice(0, 2);

    videos.forEach(v => seenVideoIds.add(v.videoId));
    articles.forEach(a => seenLinks.add(a.url));

    const result = { videos, articles };

    if (videos.length > 0 || articles.length > 0) {
        safeUpsertCache(cacheKey, result, "ai", 14 * 86_400_000);
    }

    console.log(`[Resources] ✅ Done — ${videos.length} videos, ${articles.length} articles (source: api)`);

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

/**
 * fetchStaticResourcesOnly — Zero-latency resource lookup for PDF export.
 *
 * Skips ALL external API calls (YouTube, Serper, Groq filter, MongoDB).
 * Returns results directly from the curated STATIC_RESOURCE_POOL via keyword matching.
 * Perfect for PDF export where speed matters more than live search freshness.
 *
 * @param {string}  topic        - Question text
 * @param {Set}     seenLinks    - URLs already used (dedup across questions)
 * @param {Set}     seenVideoIds - Video IDs already used (dedup across questions)
 * @returns {{ source: "static"|"empty", videos: [], articles: [] }}
 */
function fetchStaticResourcesOnly(topic, seenLinks = new Set(), seenVideoIds = new Set()) {
    const keywords = extractKeywords(topic);
    const match    = matchStaticPool(keywords);

    if (!match) {
        return { source: "empty", videos: [], articles: [], keywords };
    }

    const videos = match.videos
        .filter(v => v.url && extractVideoId(v.url) && !seenVideoIds.has(extractVideoId(v.url)))
        .slice(0, 2)
        .map(v => {
            const videoId = v.videoId || extractVideoId(v.url);
            seenVideoIds.add(videoId);
            return {
                title:     v.title,
                url:       v.url,
                videoId,
                thumbnail: resolveThumbnail(videoId, v.thumbnail),
            };
        });

    const articles = match.articles
        .filter(a => a.url && isValidUrl(a.url) && !seenLinks.has(a.url))
        .slice(0, 2)
        .map(a => { seenLinks.add(a.url); return a; });

    return {
        source:   videos.length > 0 || articles.length > 0 ? "static" : "empty",
        videos,
        articles,
        keywords,
    };
}

exports.fetchStaticResourcesOnly = fetchStaticResourcesOnly;

