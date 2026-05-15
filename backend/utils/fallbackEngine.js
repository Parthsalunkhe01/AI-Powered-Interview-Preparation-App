/**
 * Structured Fallback Engine
 *
 * Produces domain-specific, high-quality fallback content using the
 * question's category/tags — NOT generic placeholder text.
 *
 * Used when: Groq is down | rate-limited | timed out | budget exhausted.
 */

// ── Domain Templates ──────────────────────────────────────────────────────────
const DOMAIN_TEMPLATES = {
    dsa: {
        idealAnswer: (q) =>
            `To solve this, I'd start by identifying the right data structure. ` +
            `For "${q}", the typical approach is: [1] Clarify constraints and edge cases, ` +
            `[2] Design a brute-force solution to establish baseline O(n²) or O(n), ` +
            `[3] Optimize using the appropriate data structure (HashMap, Stack, Two-Pointer, etc.), ` +
            `[4] Walk through an example, and [5] State the final time and space complexity.`,
        coreBreakdown:
            `• Overview: Decompose the problem — identify input/output, constraints, and patterns.\n` +
            `• Challenges: Handling duplicates, cycles, or empty inputs without crashes.\n` +
            `• Impact: Efficient algorithms directly reduce server cost and response latency at scale.`,
        keyInsights: `• Time Complexity (Big O) — always state it\n• Space vs. Time trade-off\n• Edge cases: empty array, single element, negatives`,
        productionInsight: `At companies like Google and Meta, DSA problems are evaluated not just for correctness but for how well candidates communicate their reasoning. An O(n log n) solution with clear narration beats a silent O(n) solution.`,
        mistakes: `• Not narrating thought process — interviewers evaluate reasoning, not just code\n• Skipping edge case discussion\n• Forgetting to mention time/space complexity at the end`,
        suggestedStack: `Language: Java / Python / JavaScript\nVisualization: LeetCode, VisuAlgo\nReference: GeeksforGeeks, NeetCode.io`,
        followUps: `• What's the space complexity of your solution?\n• Can you optimize it further if memory is unlimited?`,
    },

    system_design: {
        idealAnswer: (q) =>
            `I'd approach "${q}" using the RESHADED framework: Requirements → Estimation → ` +
            `Storage → High-Level Design → APIs → Data Model → Evaluation. ` +
            `First, I'd clarify functional requirements (what it must do) and non-functional ones (scale, latency, availability). ` +
            `Then estimate traffic (e.g., 10M users → ~115 req/s peak), choose between SQL/NoSQL based on read-write ratio, ` +
            `and design the system with horizontal scaling and a CDN for static content.`,
        coreBreakdown:
            `• Overview: Define scope first. What does the system need to do in the next 3 years?\n` +
            `• Challenges: CAP theorem trade-offs — consistency vs. availability in distributed systems.\n` +
            `• Impact: A well-designed system handles 10x traffic spikes without code changes.`,
        keyInsights: `• CAP Theorem: choose 2 of 3 (Consistency, Availability, Partition Tolerance)\n• Horizontal vs. Vertical Scaling\n• Database sharding, indexing, and read replicas`,
        productionInsight: `Netflix uses a microservices architecture with 700+ services. Their Chaos Engineering practice (Chaos Monkey) proactively kills services to ensure resilience. Every system is designed to fail gracefully.`,
        mistakes: `• Jumping to implementation without clarifying requirements\n• Ignoring failure scenarios (what happens when a DB node goes down?)\n• Choosing a database without justifying the trade-off`,
        suggestedStack: `Load Balancer: NGINX / AWS ALB\nCache: Redis\nDB: PostgreSQL (relational) or DynamoDB (NoSQL at scale)\nQueue: Kafka / RabbitMQ`,
        followUps: `• How would you handle 100x the current traffic?\n• What happens if the primary database goes down?`,
    },

    database: {
        idealAnswer: (q) =>
            `For "${q}", I'd first identify whether the data is relational (structured) or document-based (flexible). ` +
            `SQL databases like PostgreSQL are ideal when ACID compliance and complex joins are required. ` +
            `NoSQL (MongoDB, DynamoDB) suits high-write, schema-flexible scenarios. ` +
            `Key considerations: proper indexing strategy, query optimization using EXPLAIN ANALYZE, ` +
            `and caching hot queries with Redis.`,
        coreBreakdown:
            `• Overview: Choose DB type based on access patterns — read-heavy vs. write-heavy.\n` +
            `• Challenges: N+1 query problem, missing indexes, unoptimized JOINs on large tables.\n` +
            `• Impact: Proper indexing can reduce query time from seconds to milliseconds.`,
        keyInsights: `• ACID properties (Atomicity, Consistency, Isolation, Durability)\n• B-Tree vs. Hash indexes\n• Normalization vs. Denormalization trade-offs`,
        productionInsight: `Uber migrated from PostgreSQL to MySQL with custom sharding for their trip data. The key lesson: index design must mirror query patterns, not the data model.`,
        mistakes: `• Fetching more columns than needed (SELECT * kills performance)\n• Missing composite indexes for multi-column WHERE clauses\n• Not using connection pooling in Node.js (use Mongoose pool settings)`,
        suggestedStack: `Relational: PostgreSQL / MySQL\nDocument: MongoDB\nCache Layer: Redis\nORM: Prisma / Mongoose / TypeORM`,
        followUps: `• How would you optimize a slow JOIN query?\n• When would you choose NoSQL over SQL?`,
    },

    android: {
        idealAnswer: (q) =>
            `For "${q}" in Android, I'd follow the MVVM architecture pattern with a ViewModel handling UI state ` +
            `and a Repository for data access. Using Kotlin Coroutines with Flow for async operations ensures ` +
            `no blocking on the main thread. The UI layer (Fragment/Compose) only observes LiveData/StateFlow, ` +
            `keeping it lifecycle-aware and preventing memory leaks.`,
        coreBreakdown:
            `• Overview: Android architecture = Separation of Concerns (UI ≠ Business Logic ≠ Data).\n` +
            `• Challenges: Activity/Fragment lifecycle management, preventing memory leaks with context references.\n` +
            `• Impact: Proper MVVM means UI survives rotation without re-fetching data.`,
        keyInsights: `• Activity/Fragment Lifecycle: know every callback\n• ViewModelScope vs. LifecycleScope for Coroutines\n• Jetpack Compose: recomposition and state hoisting`,
        productionInsight: `Google's own apps (Gmail, Maps) use Jetpack Compose with unidirectional data flow. State is hoisted to the ViewModel; the UI is purely a function of that state — similar to React.`,
        mistakes: `• Storing context in ViewModel (causes memory leaks)\n• Running network calls on the main thread\n• Not cancelling coroutines when Fragment is destroyed`,
        suggestedStack: `Language: Kotlin\nUI: Jetpack Compose / XML\nArch: MVVM + Repository\nAsync: Coroutines + Flow\nDI: Hilt`,
        followUps: `• How does the ViewModel survive configuration changes?\n• What's the difference between LiveData and StateFlow?`,
    },

    hr: {
        idealAnswer: (q) =>
            `I'd answer using the STAR method: Situation → Task → Action → Result. ` +
            `For "${q}", I'd pick a specific project scenario that demonstrates ownership, collaboration, or problem-solving. ` +
            `Example: "In my final year project, our team hit a critical API failure 2 days before submission (Situation). ` +
            `My task was to restore functionality (Task). I redesigned the data layer to use local fallback storage (Action), ` +
            `which we later presented as a resilience feature (Result — score: 98/100)."`,
        coreBreakdown:
            `• Overview: Behavioral questions test how you handle real pressure, not hypotheticals.\n` +
            `• Challenges: Candidates give vague answers without measurable outcomes.\n` +
            `• Impact: Interviewers remember specific, quantified stories — not generic "I'm a team player."`,
        keyInsights: `• STAR Method: Situation, Task, Action, Result\n• Quantify results: "reduced load time by 40%" > "improved performance"\n• Show ownership: use "I" not always "we"`,
        productionInsight: `Amazon's 14 Leadership Principles are evaluated through behavioral questions. Every answer should map to at least one principle: Ownership, Bias for Action, Customer Obsession, etc.`,
        mistakes: `• Answering hypothetically instead of with real examples\n• Giving team credit without showing personal impact\n• Forgetting the Result — always close the loop`,
        suggestedStack: `Frameworks: STAR, SOAR (Situation, Obstacle, Action, Result)\nPrep: Mirror practice, record yourself\nResource: "Cracking the PM / SWE Interview" by Gayle McDowell`,
        followUps: `• What would you do differently in that situation?\n• How did that experience change how you approach team conflicts?`,
    },

    backend: {
        idealAnswer: (q) =>
            `For "${q}", I'd design a RESTful API following best practices: ` +
            `versioned endpoints (/api/v1/), proper HTTP status codes, JWT-based authentication, ` +
            `and middleware for rate limiting. The service layer handles business logic independently of the controller, ` +
            `making it testable. For high-traffic endpoints, I'd add Redis caching with a TTL strategy ` +
            `and use connection pooling to manage DB connections efficiently.`,
        coreBreakdown:
            `• Overview: Good backend = clean separation of Routes → Controller → Service → Repository.\n` +
            `• Challenges: Preventing N+1 queries, handling concurrent writes without race conditions.\n` +
            `• Impact: A well-structured backend scales horizontally without architectural rework.`,
        keyInsights: `• Stateless API design (JWT, not sessions) for horizontal scaling\n• Idempotency in POST/PUT endpoints\n• Circuit Breaker pattern for external API calls`,
        productionInsight: `Stripe's API is the gold standard. Every endpoint is versioned, every error has a unique code, and every action is idempotent. Their API has stayed backward-compatible for 10+ years.`,
        mistakes: `• Business logic inside route handlers (controllers should be thin)\n• Not validating request body (use Zod or Joi)\n• Missing error handling for async/await (always wrap in try-catch or use a global error handler)`,
        suggestedStack: `Runtime: Node.js / Express\nAuth: JWT + bcrypt\nCache: Redis\nValidation: Zod\nDB: MongoDB (Mongoose) or PostgreSQL (Prisma)`,
        followUps: `• How would you make this endpoint idempotent?\n• How do you handle database transactions in Node.js?`,
    },

    default: {
        idealAnswer: (q) =>
            `For "${q}", I'd structure my answer by: [1] Defining the problem scope clearly, ` +
            `[2] Discussing key design choices and trade-offs, [3] Walking through my solution step-by-step, ` +
            `and [4] Addressing edge cases and failure scenarios. ` +
            `The key principle is always to explain the "why" behind each decision, not just the "what."`,
        coreBreakdown:
            `• Overview: Start with the high-level approach before diving into details.\n` +
            `• Challenges: Balancing completeness with clarity in a time-constrained interview.\n` +
            `• Impact: Structured answers demonstrate engineering maturity beyond technical knowledge.`,
        keyInsights: `• Always clarify requirements before answering\n• Think out loud — reasoning matters as much as the answer\n• Mention trade-offs for every design decision`,
        productionInsight: `Senior engineers at FAANG companies are evaluated more on their ability to break down ambiguous problems than on memorized solutions. The process is the product.`,
        mistakes: `• Rushing to an answer without thinking aloud\n• Ignoring edge cases and error handling\n• Not asking clarifying questions before diving in`,
        suggestedStack: `Approach: Problem Definition → Design → Implementation → Testing\nTools: Whiteboard / Excalidraw for diagrams`,
        followUps: `• What would you do if the requirements changed mid-implementation?\n• How would you test this solution?`,
    },
};

// ── Category Normalizer ──────────────────────────────────────────────────────
function normalizeCategory(category = "") {
    const c = category.toLowerCase().replace(/[\s-]+/g, "_");
    if (c.includes("dsa") || c.includes("algorithm") || c.includes("data_struct")) return "dsa";
    if (c.includes("system")) return "system_design";
    if (c.includes("database") || c.includes("sql") || c.includes("nosql")) return "database";
    if (c.includes("android") || c.includes("mobile") || c.includes("kotlin")) return "android";
    if (c.includes("hr") || c.includes("behavioral") || c.includes("soft")) return "hr";
    if (c.includes("backend") || c.includes("api") || c.includes("server")) return "backend";
    return "default";
}

// ── Main Export ──────────────────────────────────────────────────────────────
/**
 * Returns a fully structured fallback for any question + category.
 * Never returns empty strings or generic placeholders.
 *
 * @param {string} questionText  - The interview question
 * @param {string} category      - e.g. "DSA", "System Design", "HR"
 */
function getStructuredFallback(questionText = "this topic", category = "General") {
    const key = normalizeCategory(category);
    const template = DOMAIN_TEMPLATES[key] || DOMAIN_TEMPLATES.default;

    return {
        idealAnswer:      typeof template.idealAnswer === "function"
            ? template.idealAnswer(questionText)
            : template.idealAnswer,
        coreBreakdown:    template.coreBreakdown,
        keyInsights:      template.keyInsights,
        productionInsight: template.productionInsight,
        mistakes:         template.mistakes,
        suggestedStack:   template.suggestedStack,
        followUps:        template.followUps,
        _source:          "structured_fallback",
    };
}

module.exports = { getStructuredFallback, normalizeCategory };
