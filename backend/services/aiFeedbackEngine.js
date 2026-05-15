const Groq = require("groq-sdk");
const { estimateConfidence } = require("./adaptiveEngine");

const ai = new Groq({ apiKey: process.env.GROQ_API_KEY });

// -- LAYERED SCORING RUBRIC ----------------------------------------------------
// Garbage: 0-15 | Weak: 15-40 | Average: 40-65 | Good: 65-85 | Excellent: 85-100

const buildAssessmentPrompt = ({ role, experience, mode, history }) => {
  const historyText = history
    .map((h, i) => {
        let entry = `Q${i + 1} [${h.category || "General"}]: ${h.question}\n`;
        if (h.answer) entry += `A${i + 1} (Text): ${h.answer}\n`;
        if (h.code) entry += `A${i + 1} (Code [${h.language || 'javascript'}]): \n${h.code}\n`;
        if (h.image) entry += `A${i + 1} (Diagram): [Attached Image Path: ${h.image}]\n`;
        if (!h.answer && !h.code && !h.image) entry += `A${i + 1}: (skipped/no answer)\n`;
        return entry;
    })
    .join("\n\n");

  return `You are a professional senior technical interviewer evaluating a ${experience || "entry-level"} ${role || "Software Engineer"} candidate in ${mode || "standard"} mode.

Interview transcript:
${historyText}

CRITICAL EVALUATION RULES:
- Evaluate based on TECHNICAL ACCURACY, DEPTH OF EXPLANATION, CODE QUALITY (if applicable), and ARCHITECTURAL REASONING (for diagrams).
- Weak answer (too brief, missing core concepts): 0-40
- Average answer (shows basic understanding, lacks depth): 40-60
- Good interview-level answer (correct concepts, clear reasoning): 60-80
- Strong detailed answer (demonstrates mastery, explains why, mentions trade-offs): 80-90
- Excellent industry-level answer (deep technical mastery, edge cases, scalability, clear examples): 90-100

IMPORTANT: 
- Do NOT artificially cap scores at 60 or 70. 
- If the candidate provides a high-quality, industry-level response with solid code/diagram references, give them 90+.
- Evaluate UNDERSTANDING and EXPLANATION QUALITY.

Per-question scoring (questionScore field, 0-100 each, status field):
- Skipped/empty: 0, status: "Skipped"
- Meaningless/Wrong: 5-25, status: "Incorrect"
- Very brief/Weak: 25-45, status: "Weak"
- Adequate but shallow: 45-65, status: "Average"
- Good with reasoning: 65-85, status: "Good"
- Excellent depth & expertise: 86-100, status: "Excellent"

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
  "performanceCategory": "<Weak|Average|Good|Excellent>"
}`;
};

// -- RULE-BASED FALLBACK -------------------------------------------------------
function computeRuleBasedScores(history) {
  const scores = history.map(h => {
    const txt = (h.answer || "").trim();
    const code = (h.code || "").trim();
    if (!txt && !code) return 0;
    const len = txt.length + (code.length * 1.5); // Code counts more
    if (len < 20) return 20;
    if (len < 100) return 45;
    if (len < 300) return 65;
    if (len < 600) return 82;
    return 92;
  });

  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const answered = history.filter(h => (h.answer && h.answer.trim().length > 0) || (h.code && h.code.trim().length > 0)).length;
  const skipped = history.length - answered;

  let hiringReadiness = "NotReady";
  if (avg >= 85) hiringReadiness = "Excellent";
  else if (avg >= 70) hiringReadiness = "Ready";
  else if (avg >= 45) hiringReadiness = "Progressing";

  const questionFeedback = history.map((h, i) => {
    const s = scores[i];
    const status = s === 0 ? "Skipped" 
                 : s < 30 ? "Incorrect" 
                 : s < 50 ? "Weak" 
                 : s < 70 ? "Average" 
                 : s < 88 ? "Good" 
                 : "Excellent";
    return {
      index: i,
      questionScore: s,
      status,
      note: s === 0 ? "Question was skipped"
        : s < 30 ? "Answer too brief"
        : s < 50 ? "Weak answer - missing depth"
        : s < 70 ? "Average answer"
        : s < 88 ? "Good answer with reasonable detail"
        : "Strong and detailed answer",
    };
  });

  return {
    technicalScore: avg,
    communicationScore: Math.max(0, avg - (skipped * 5)),
    problemSolvingScore: avg,
    conceptCoverageScore: avg,
    strengths: avg >= 50 && answered > 0 ? ["Attempted questions"] : [],
    weakAreas: [
      ...(skipped > 0 ? [`${skipped} question(s) skipped`] : []),
      ...(avg < 60 ? ["Provide more detailed explanations"] : ["Focus on edge cases"]),
    ],
    suggestedTopics: ["Technical Fundamentals", "Industry Best Practices"],
    hiringReadiness,
    oneLiner: `Candidate answered ${answered}/${history.length} questions. Rule-based score: ${avg}/100.`,
    questionFeedback,
    performanceCategory: avg < 30 ? "Weak" : avg < 60 ? "Average" : avg < 85 ? "Good" : "Excellent",
    _usedFallback: true,
  };
}

// -- MAIN FEEDBACK GENERATOR ---------------------------------------------------
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
        { role: "system", content: "You are a highly accurate technical evaluator. Return ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1400,
    });

    let rawText = result.choices[0]?.message?.content || "{}";
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    if (!cleaned) throw new Error("Empty AI response");

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const { jsonrepair } = require("jsonrepair");
      parsed = JSON.parse(jsonrepair(cleaned));
    }

    if (typeof parsed.technicalScore !== "number") throw new Error("Invalid AI response structure");

    const clamp = (v, min, max) => Math.min(max, Math.max(min, Math.round(v)));
    const techScore = clamp(parsed.technicalScore, 0, 100);
    const commScore = clamp(parsed.communicationScore, 0, 100);
    const psScore = clamp(parsed.problemSolvingScore, 0, 100);
    const ccScore = clamp(parsed.conceptCoverageScore || parsed.technicalScore, 0, 100);

    const overallScore = clamp(
      (techScore * 0.35) + (commScore * 0.20) + (psScore * 0.25) + (ccScore * 0.20),
      0, 100
    );

    const strengths = overallScore < 45 ? [] : (parsed.strengths || []).slice(0, 3);

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
      correctAnswers: history.filter(h => (h.answer && h.answer.trim().length > 50) || (h.code && h.code.trim().length > 20)).length,
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
      correctAnswers: history.filter(h => (h.answer && h.answer.trim().length > 50) || (h.code && h.code.trim().length > 20)).length,
      topics: ruleScores.suggestedTopics,
    };
  }
};

module.exports = { generateStructuredFeedback };
