const Groq = require("groq-sdk");
const { jsonrepair } = require("jsonrepair");
const { callAIWithCache, buildCacheKey } = require("./cachedAI");
const { getStructuredFallback } = require("./fallbackEngine");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * High-Fidelity Guide Generator — Cache-First.
 *
 * Priority:
 *   1. MongoDB cache (free, instant)
 *   2. Groq AI with 8s timeout + budget guard
 *   3. Domain-specific structured fallback (never empty)
 *
 * @param {string} question     - The interview question text
 * @param {string} answer       - The candidate's answer (or empty string)
 * @param {string} category     - Domain category (DSA, System Design, etc.)
 */
async function generateGuideContent(question, answer = "", category = "General") {
    const cacheKey = buildCacheKey("guide", {
        // Normalize: first 120 chars of question + whether answer was given
        q: question.slice(0, 120).toLowerCase().trim(),
        hasAnswer: (answer || "").trim().length > 30,
    });

    const { data } = await callAIWithCache({
        cacheKey,
        type: "guide",
        ttlDays: 7,

        aiFn: async () => {
            const prompt = `
You are a Senior Technical Architect and Interview Coach. Generate a premium coaching guide.

QUESTION: ${question}
CANDIDATE_RESPONSE: ${answer || "Skipped"}

STRICT REQUIREMENTS (return valid JSON with FLAT STRINGS only — no nested objects/arrays):
1. "idealAnswer": (4-6 lines) A polished response sounding like an experienced candidate.
2. "coreBreakdown": Narrative + sections for Project Overview, Challenges, and Impact.
3. "keyInsights": 2-4 bullet points of key technical concepts (e.g., "• Big O\\n• Memoization").
4. "productionInsight": How a company like Netflix, Amazon, or Uber handles this in production.
5. "mistakes": 2-4 specific, contextual mistakes candidates commonly make.
6. "suggestedStack": Appropriate tech stack (Frontend/Backend/DB format).
7. "followUps": 2 natural follow-up interview questions.

Return ONLY this JSON (no markdown, no extra text):
{
  "idealAnswer": "...",
  "coreBreakdown": "Narrative...\\n\\n• Overview: ...\\n• Challenges: ...\\n• Impact: ...",
  "keyInsights": "• Concept 1\\n• Concept 2",
  "productionInsight": "Real world: ...",
  "mistakes": "• Mistake 1\\n• Mistake 2",
  "suggestedStack": "Frontend: ...\\nBackend: ...\\nDB: ...",
  "followUps": "• Follow up 1\\n• Follow up 2"
}`;

            const completion = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 1800,
            });

            const raw = completion.choices[0]?.message?.content || "{}";
            const cleaned = raw
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
                .trim();

            let parsed;
            try { parsed = JSON.parse(cleaned); }
            catch { parsed = JSON.parse(jsonrepair(cleaned)); }

            // Validate shape — must have at least idealAnswer
            if (!parsed?.idealAnswer) throw new Error("Invalid AI response shape");

            const s = (v) => (typeof v === "string" ? v : "");
            return {
                idealAnswer:       s(parsed.idealAnswer),
                coreBreakdown:     s(parsed.coreBreakdown),
                keyInsights:       s(parsed.keyInsights),
                productionInsight: s(parsed.productionInsight),
                mistakes:          s(parsed.mistakes),
                suggestedStack:    s(parsed.suggestedStack),
                followUps:         s(parsed.followUps),
            };
        },

        fallbackFn: () => getStructuredFallback(question, category),
    });

    return data;
}

module.exports = { generateGuideContent };
