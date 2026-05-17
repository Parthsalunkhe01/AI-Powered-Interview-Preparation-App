const Groq = require("groq-sdk");
const { estimateConfidence, isSkippedAnswer } = require("./adaptiveEngine");

const ai = new Groq({ apiKey: process.env.GROQ_API_KEY });

// -- LAYERED SCORING RUBRIC ---------------------------------------------------
// Garbage: 0-15 | Weak: 15-40 | Average: 40-65 | Good: 65-85 | Excellent: 85-100

const buildAssessmentPrompt = ({ role, experience, mode, history }) => {
  const historyText = history
    .map((h, i) => {
        let entry = `Q${i + 1} [${h.category || "General"}]: ${h.question}\n`;
        const hasRealAnswer = !isSkippedAnswer(h.answer) || (h.code && h.code.trim().length > 10);
        if (h.answer && !isSkippedAnswer(h.answer)) entry += `A${i + 1} (Text): ${h.answer}\n`;
        if (h.code && h.code.trim().length > 10)    entry += `A${i + 1} (Code [${h.language || "javascript"}]):\n${h.code}\n`;
        if (h.image)                                 entry += `A${i + 1} (Diagram): [Attached]\n`;
        if (!hasRealAnswer)                          entry += `A${i + 1}: (SKIPPED — no answer provided)\n`;
        return entry;
    })
    .join("\n\n");

  const questionCount = history.length;

  return `You are a professional senior technical interviewer evaluating a ${experience || "entry-level"} ${role || "Software Engineer"} candidate in ${mode || "standard"} mode.

Interview transcript (${questionCount} questions total):
${historyText}

CRITICAL EVALUATION RULES:
- Evaluate based on TECHNICAL ACCURACY, DEPTH OF EXPLANATION, CODE QUALITY (if applicable).
- Weak answer (too brief, missing core concepts): 0-40
- Average answer (shows basic understanding, lacks depth): 40-60
- Good interview-level answer (correct concepts, clear reasoning): 60-80
- Excellent answer (demonstrates mastery, edge cases, trade-offs): 80-100
- SKIPPED answer: ALWAYS score 0, status "Skipped" — DO NOT give partial credit for knowing the topic.

Per-question scoring:
- Skipped/empty: 0, status: "Skipped"
- Meaningless/Wrong: 5-25, status: "Incorrect"
- Very brief/Weak: 25-45, status: "Weak"
- Adequate but shallow: 45-65, status: "Average"
- Good with reasoning: 65-85, status: "Good"
- Excellent depth: 86-100, status: "Excellent"

IMPORTANT: You MUST return EXACTLY ${questionCount} entries in "questionFeedback" — one for each question (index 0 to ${questionCount - 1}).

Return ONLY valid JSON (no markdown, no extra text):
{
  "technicalScore": <0-100 int>,
  "communicationScore": <0-100 int>,
  "problemSolvingScore": <0-100 int>,
  "conceptCoverageScore": <0-100 int>,
  "strengths": ["<only genuine strengths, max 3, empty array if none>"],
  "weakAreas": ["<specific gaps, max 4>"],
  "suggestedTopics": ["topic1", "topic2", "topic3"],
  "hiringReadiness": "<NotReady|Progressing|Ready|Excellent>",
  "oneLiner": "<honest one-sentence summary>",
  "questionFeedback": [
    { "index": 0, "questionScore": <0-100>, "status": "<Excellent|Good|Average|Weak|Incorrect|Skipped>", "note": "<specific feedback>" }
  ],
  "performanceCategory": "<Weak|Average|Good|Excellent>"
}`;
};

// -- RULE-BASED FALLBACK -------------------------------------------------------
function computeRuleBasedScores(history) {
  const scores = history.map(h => {
    const txt  = (h.answer || "").trim();
    const code = (h.code   || "").trim();
    // isSkippedAnswer covers "skip", "//skip", "java", single-word non-answers
    if (isSkippedAnswer(txt) && !code) return 0;
    const len = (isSkippedAnswer(txt) ? 0 : txt.length) + (code.length * 1.5);
    if (len < 20)  return 20;
    if (len < 100) return 45;
    if (len < 300) return 65;
    if (len < 600) return 82;
    return 92;
  });

  const avg      = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const answered = history.filter(h => !isSkippedAnswer(h.answer || "") || (h.code && h.code.trim().length > 10)).length;
  const skipped  = history.length - answered;

  let hiringReadiness = "NotReady";
  if (avg >= 85) hiringReadiness = "Excellent";
  else if (avg >= 70) hiringReadiness = "Ready";
  else if (avg >= 45) hiringReadiness = "Progressing";

  const questionFeedback = history.map((h, i) => {
    const s      = scores[i];
    const status = s === 0 ? "Skipped"
                 : s < 30  ? "Incorrect"
                 : s < 50  ? "Weak"
                 : s < 70  ? "Average"
                 : s < 88  ? "Good"
                 : "Excellent";
    return {
      index:         i,
      questionScore: s,
      status,
      note: s === 0 ? "Question was skipped"
          : s < 30  ? "Answer too brief"
          : s < 50  ? "Weak answer — missing depth"
          : s < 70  ? "Average answer"
          : s < 88  ? "Good answer with reasonable detail"
          : "Strong and detailed answer",
    };
  });

  return {
    technicalScore:      avg,
    communicationScore:  Math.max(0, avg - (skipped * 5)),
    problemSolvingScore: avg,
    conceptCoverageScore: avg,
    strengths:   avg >= 50 && answered > 0 ? ["Attempted questions"] : [],
    weakAreas:   [
      ...(skipped > 0 ? [`${skipped} question(s) skipped`] : []),
      ...(avg < 60    ? ["Provide more detailed explanations"] : ["Focus on edge cases"]),
    ],
    suggestedTopics: ["Technical Fundamentals", "Industry Best Practices"],
    hiringReadiness,
    oneLiner:    `Candidate answered ${answered}/${history.length} questions. Rule-based score: ${avg}/100.`,
    questionFeedback,
    performanceCategory: avg < 30 ? "Weak" : avg < 60 ? "Average" : avg < 85 ? "Good" : "Excellent",
    _usedFallback: true,
  };
}

// -- MAIN FEEDBACK GENERATOR --------------------------------------------------
const generateStructuredFeedback = async ({ role, experience, history, mode, answers }) => {
  if (!history || history.length === 0) {
    throw new Error("No interview history available for analysis.");
  }

  const confidence = estimateConfidence(answers || []);
  const ruleScores = computeRuleBasedScores(history);

  // ── GROUND-TRUTH answer map ──────────────────────────────────────────────
  // Computed deterministically BEFORE calling the AI.
  // Every skipped question will be hard-overridden AFTER the AI responds,
  // regardless of what score the AI assigns. This is the core fix.
  const answerMap = history.map((h, i) => {
    const txt  = (h.answer || "").trim();
    const code = (h.code   || "").trim();
    const hasRealText = !isSkippedAnswer(txt);
    const hasRealCode = code.length > 10 && !isSkippedAnswer(code);
    return { index: i, isSkipped: !hasRealText && !hasRealCode };
  });

  const totalAnswered = answerMap.filter(a => !a.isSkipped).length;

  // ── ALL-SKIP FAST PATH ───────────────────────────────────────────────────
  // If every question was skipped: return 0 immediately. No AI call, no cost.
  if (totalAnswered === 0) {
    console.log(`[FeedbackEngine] All ${history.length} answers skipped → score: 0`);
    return {
      overallScore:        0,
      technicalScore:      0,
      communicationScore:  0,
      problemSolvingScore: 0,
      conceptCoverageScore: 0,
      confidence:          "Low",
      strengths:           [],
      weakAreas:           ["No answers provided for any question"],
      suggestedTopics:     ["Practice answering out loud", "Review core fundamentals", "Build confidence"],
      hiringReadiness:     "NotReady",
      oneLiner:            `Candidate skipped all ${history.length} questions — no technical assessment possible.`,
      questionFeedback:    history.map((_, i) => ({
        index: i, questionScore: 0, status: "Skipped", note: "No answer provided.",
      })),
      performanceCategory: "Weak",
      score:               0,
      correctAnswers:      0,
      topics:              [],
      _usedFallback:       false,
    };
  }

  // ── PARTIAL SKIP: run AI on answered questions ────────────────────────────
  const answeredRatio = totalAnswered / history.length;

  try {
    const prompt = buildAssessmentPrompt({ role, experience, mode, history });

    const result = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a highly accurate technical evaluator. Return ONLY valid JSON." },
        { role: "user",   content: prompt },
      ],
      temperature: 0.1,
      max_tokens:  2400, // Enough for 15 questions × ~100 tokens each
    });

    let rawText = result.choices[0]?.message?.content || "{}";
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!cleaned) throw new Error("Empty AI response");

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const { jsonrepair } = require("jsonrepair");
      parsed = JSON.parse(jsonrepair(cleaned));
    }

    if (typeof parsed.technicalScore !== "number") throw new Error("Invalid AI response structure");

    const clamp = (v, min, max) => Math.min(max, Math.max(min, Math.round(v)));

    // ── HARD OVERRIDE per-question ───────────────────────────────────────────
    // Post-process AI output: any question our answerMap marked as "skipped"
    // is FORCE-SET to 0 — the AI's value is discarded.
    const rawAiQF = parsed.questionFeedback || [];
    const questionFeedback = history.map((_, i) => {
      const meta = answerMap[i];
      if (meta.isSkipped) {
        // Force 0 — never trust AI on skipped questions
        return { index: i, questionScore: 0, status: "Skipped", note: "No answer provided." };
      }
      const aiEntry = rawAiQF.find(qf => qf.index === i) || rawAiQF[i];
      if (aiEntry) {
        return { ...aiEntry, index: i, questionScore: clamp(aiEntry.questionScore ?? 0, 0, 100) };
      }
      // AI missed this entry — fall back to rule-based
      return ruleScores.questionFeedback[i] || { index: i, questionScore: 0, status: "Skipped", note: "No data." };
    });

    // ── SCALE dimension scores by answered ratio ─────────────────────────────
    // Prevents "skipped 4/5 questions but got Technical: 50" scenarios.
    // If only 1/5 questions answered, AI scores are scaled to 20%.
    const techScore = clamp(parsed.technicalScore      * answeredRatio, 0, 100);
    const commScore = clamp(parsed.communicationScore  * answeredRatio, 0, 100);
    const psScore   = clamp(parsed.problemSolvingScore * answeredRatio, 0, 100);
    const ccScore   = clamp((parsed.conceptCoverageScore || parsed.technicalScore) * answeredRatio, 0, 100);

    const overallScore = clamp(
      (techScore * 0.35) + (commScore * 0.20) + (psScore * 0.25) + (ccScore * 0.20),
      0, 100
    );

    console.log(`[FeedbackEngine] answered=${totalAnswered}/${history.length}, ratio=${answeredRatio.toFixed(2)}, overall=${overallScore}`);

    return {
      overallScore,
      technicalScore:      techScore,
      communicationScore:  commScore,
      problemSolvingScore: psScore,
      conceptCoverageScore: ccScore,
      confidence,
      strengths:           overallScore < 45 ? [] : (parsed.strengths || []).slice(0, 3),
      weakAreas:           (parsed.weakAreas || []).slice(0, 4),
      suggestedTopics:     (parsed.suggestedTopics || []).slice(0, 5),
      hiringReadiness:     parsed.hiringReadiness || ruleScores.hiringReadiness,
      oneLiner:            parsed.oneLiner || ruleScores.oneLiner,
      questionFeedback,
      performanceCategory: parsed.performanceCategory || ruleScores.performanceCategory,
      score:               overallScore,
      correctAnswers:      totalAnswered,
      topics:              parsed.suggestedTopics || [],
      _usedFallback:       false,
    };

  } catch (error) {
    console.error("[FeedbackEngine] AI failed, using rule-based fallback:", error.message);
    const scaledTech = Math.round(ruleScores.technicalScore      * answeredRatio);
    const scaledComm = Math.round(ruleScores.communicationScore  * answeredRatio);
    const scaledPS   = Math.round(ruleScores.problemSolvingScore * answeredRatio);
    const scaledCC   = Math.round(ruleScores.conceptCoverageScore * answeredRatio);
    const overallScore = Math.round(
      (scaledTech * 0.35) + (scaledComm * 0.20) + (scaledPS * 0.25) + (scaledCC * 0.20)
    );
    return {
      ...ruleScores,
      technicalScore:      scaledTech,
      communicationScore:  scaledComm,
      problemSolvingScore: scaledPS,
      conceptCoverageScore: scaledCC,
      overallScore,
      confidence,
      score:          overallScore,
      correctAnswers: totalAnswered,
      topics:         ruleScores.suggestedTopics,
    };
  }
};

module.exports = { generateStructuredFeedback };
