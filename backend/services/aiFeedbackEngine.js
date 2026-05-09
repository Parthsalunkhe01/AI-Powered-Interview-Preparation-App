const Groq = require("groq-sdk");
const { estimateConfidence } = require("./adaptiveEngine");

const ai = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── LAYERED SCORING RUBRIC ────────────────────────────────────────────────────
// Garbage: 0-15 | Weak: 20-40 | Average: 45-65 | Good: 70-85 | Excellent: 85-100

const buildAssessmentPrompt = ({ role, experience, mode, history }) => {
  const historyText = history
    .map((h, i) => `Q${i + 1} [${h.category || "General"}]: ${h.question}\nA${i + 1}: ${h.answer || "(skipped/no answer)"}`)
    .join("\n\n");

  return `You are a STRICT senior technical interviewer evaluating a ${experience || "entry-level"} ${role || "Software Engineer"} candidate in ${mode || "standard"} mode.

Interview transcript:
${historyText}

CRITICAL EVALUATION RULES:
- Garbage/nonsense answers: score 0-15 ONLY
- Vague/weak answers with no concepts: score 20-40
- Average student answers (some concepts, poor depth): score 45-65
- Good answers (correct concepts, decent reasoning): score 70-85
- Excellent industry-level answers (deep understanding, examples, edge cases): score 86-100
- Do NOT give strengths for bad answers — set strengths to [] if overall performance is poor
- Strengths ONLY appear when: concepts are explained correctly, reasoning exists, examples are relevant
- Copied/keyword-stuffed answers with no real understanding should score 25-45 MAX
- Evaluate UNDERSTANDING and EXPLANATION QUALITY, not just answer length
- Be honest and precise — this platform's credibility depends on accurate scores

Per-question scoring (questionScore field, 0-100 each, status field):
- Skipped/empty: 0, status: "Skipped"
- Meaningless/Wrong: 5-15, status: "Incorrect"
- Very brief/Weak: 20-35, status: "Weak"
- Adequate but shallow: 40-60, status: "Average"
- Good with reasoning: 65-80, status: "Good"
- Excellent depth: 82-100, status: "Excellent"

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "technicalScore": <0-100 int>,
  "communicationScore": <0-100 int>,
  "problemSolvingScore": <0-100 int>,
  "conceptCoverageScore": <0-100 int>,
  "strengths": ["<only list genuine strengths, max 3, empty array if none>"],
  "weakAreas": ["<specific gaps with referenced concepts, max 4>"],
  "suggestedTopics": ["topic1", "topic2", "topic3"],
  "hiringReadiness": "<NotReady|Progressing|Ready|Excellent>",
  "oneLiner": "<honest one-sentence summary>",
  "questionFeedback": [
    { "index": 0, "questionScore": <0-100>, "status": "<Excellent|Good|Average|Weak|Incorrect|Skipped>", "note": "<specific honest feedback>" }
  ],
  "performanceCategory": "<Garbage|Weak|Average|Good|Excellent>"
}`;
};

// ── RULE-BASED FALLBACK ───────────────────────────────────────────────────────
function computeRuleBasedScores(history) {
  const scores = history.map(h => {
    const txt = (h.answer || "").trim();
    if (!txt) return 0;
    if (txt.length < 20) return 10;
    if (txt.length < 60) return 25;
    if (txt.length < 150) return 42;
    if (txt.length < 300) return 58;
    return 65;
  });

  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const answered = history.filter(h => h.answer && h.answer.trim().length > 0).length;
  const skipped = history.length - answered;

  let hiringReadiness = "NotReady";
  if (avg >= 80) hiringReadiness = "Excellent";
  else if (avg >= 60) hiringReadiness = "Ready";
  else if (avg >= 35) hiringReadiness = "Progressing";

  const questionFeedback = history.map((h, i) => {
    const s = scores[i];
    const status = s === 0 ? "Skipped" 
                 : s < 20 ? "Incorrect" 
                 : s < 45 ? "Weak" 
                 : s < 65 ? "Average" 
                 : s < 85 ? "Good" 
                 : "Excellent";
    return {
      index: i,
      questionScore: s,
      status,
      note: s === 0 ? "Question was skipped"
        : s < 20 ? "Answer too brief — no concepts demonstrated"
        : s < 45 ? "Weak answer — missing key concepts and reasoning"
        : s < 65 ? "Average answer — some understanding shown but lacks depth"
        : "Adequate answer with reasonable detail",
    };
  });

  return {
    technicalScore: avg,
    communicationScore: Math.max(0, avg - (skipped * 8)),
    problemSolvingScore: avg,
    conceptCoverageScore: avg,
    strengths: avg >= 55 && answered > 0 ? ["Completed the session"] : [],
    weakAreas: [
      ...(skipped > 0 ? [`${skipped} question(s) skipped — answer all questions`] : []),
      ...(avg < 50 ? ["Needs deeper understanding of core concepts", "Practice explaining concepts clearly"] : ["Expand answers with concrete examples"]),
    ],
    suggestedTopics: ["Core technical fundamentals", "Structured answer delivery", "Concept depth practice"],
    hiringReadiness,
    oneLiner: `Candidate answered ${answered}/${history.length} questions. Rule-based score: ${avg}/100.`,
    questionFeedback,
    performanceCategory: avg < 20 ? "Garbage" : avg < 45 ? "Weak" : avg < 65 ? "Average" : avg < 85 ? "Good" : "Excellent",
    _usedFallback: true,
  };
}

// ── MAIN FEEDBACK GENERATOR ───────────────────────────────────────────────────
const generateStructuredFeedback = async ({ role, experience, history, mode, answers }) => {
  if (!history || history.length === 0) {
    throw new Error("No interview history available for analysis.");
  }

  const confidence = estimateConfidence(answers || []);
  const ruleScores = computeRuleBasedScores(history);

  try {
    const prompt = buildAssessmentPrompt({ role, experience, mode, history });

    const result = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a strict technical interviewer. Return ONLY valid JSON. No markdown. No explanation. Be honest — do not inflate scores." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1400,
    });

    const text = (result?.choices?.[0]?.message?.content || "").trim()
      .replace(/```json/g, "").replace(/```/g, "").trim();

    if (!text) throw new Error("Empty AI response");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const { jsonrepair } = require("jsonrepair");
      parsed = JSON.parse(jsonrepair(text));
    }

    if (typeof parsed.technicalScore !== "number") throw new Error("Invalid AI response structure");

    // Enforce score sanity — no inflation
    const clamp = (v, min, max) => Math.min(max, Math.max(min, Math.round(v)));
    const techScore = clamp(parsed.technicalScore, 0, 100);
    const commScore = clamp(parsed.communicationScore, 0, 100);
    const psScore = clamp(parsed.problemSolvingScore, 0, 100);
    const ccScore = clamp(parsed.conceptCoverageScore || parsed.technicalScore, 0, 100);

    const overallScore = clamp(
      (techScore * 0.35) + (commScore * 0.20) + (psScore * 0.25) + (ccScore * 0.20),
      0, 100
    );

    // Enforce honest strengths — empty array for poor performance
    const strengths = overallScore < 45 ? [] : (parsed.strengths || []).slice(0, 3);

    // Per-question scores clamped
    const questionFeedback = (parsed.questionFeedback || ruleScores.questionFeedback).map(qf => ({
      ...qf,
      questionScore: clamp(qf.questionScore ?? (qf.score != null ? qf.score * 25 : 0), 0, 100),
    }));

    return {
      overallScore,
      technicalScore: techScore,
      communicationScore: commScore,
      problemSolvingScore: psScore,
      conceptCoverageScore: ccScore,
      confidence,
      strengths,
      weakAreas: (parsed.weakAreas || []).slice(0, 4),
      suggestedTopics: (parsed.suggestedTopics || []).slice(0, 5),
      hiringReadiness: parsed.hiringReadiness || ruleScores.hiringReadiness,
      oneLiner: parsed.oneLiner || ruleScores.oneLiner,
      questionFeedback,
      performanceCategory: parsed.performanceCategory || ruleScores.performanceCategory,
      score: overallScore,
      correctAnswers: history.filter(h => h.answer && h.answer.trim().length > 50).length,
      topics: parsed.suggestedTopics || [],
      _usedFallback: false,
    };

  } catch (error) {
    console.error("[FeedbackEngine] AI failed, using rule-based fallback:", error.message);
    const overallScore = Math.round(
      (ruleScores.technicalScore * 0.35) +
      (ruleScores.communicationScore * 0.20) +
      (ruleScores.problemSolvingScore * 0.25) +
      (ruleScores.conceptCoverageScore * 0.20)
    );

    return {
      ...ruleScores,
      overallScore,
      confidence,
      score: overallScore,
      correctAnswers: history.filter(h => h.answer && h.answer.trim().length > 50).length,
      topics: ruleScores.suggestedTopics,
    };
  }
};

module.exports = { generateStructuredFeedback };