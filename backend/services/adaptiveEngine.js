/**
 * Adaptive Interview Engine — Redesigned
 * Supports Interview Focus (android/dsa/system_design/database/java/hr/mixed)
 * Company-inspired patterns (google/amazon/microsoft/startup)
 */

const Groq = require("groq-sdk");
const { getQuestionsForFocus, getWarmupQuestion, getFollowUps } = require("../data/questionBlueprint");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── DIFFICULTY PROGRESSION ────────────────────────────────────────────────
function calculateDifficulty(questionIndex, runningScore, mode = "standard") {
  const modeOffset = { beginner: -0.5, standard: 0, real: 0.6 }[mode] || 0;
  const baseCurve = [1, 1.5, 2, 2.5, 3];
  let base = baseCurve[Math.min(questionIndex, 4)] + modeOffset;

  if (questionIndex >= 2) {
    if (runningScore < 35) base = Math.max(1, base - 0.6);
    else if (runningScore > 72) base = Math.min(3, base + 0.5);
  }
  return Math.round(Math.max(1, Math.min(3, base)));
}

// ─── SCORING ESTIMATION (local, quick) ────────────────────────────────────
function estimateAnswerScore(answerText) {
  if (!answerText || answerText.trim().length === 0) return 0;
  const len = answerText.trim().length;
  if (len < 20) return 0.3;
  if (len < 60) return 1;
  if (len < 150) return 2;
  return 3;
}

function estimateConfidence(answers) {
  if (!answers || answers.length === 0) return "Low";
  let skipped = 0, detailed = 0;
  for (const a of answers) {
    const text = a.answerText || "";
    if (text.trim().length === 0) skipped++;
    else if (text.trim().length > 180) detailed++;
  }
  if (skipped >= 2) return "Low";
  if (detailed >= Math.ceil(answers.length * 0.6)) return "High";
  return "Moderate";
}

// ─── COMPANY PATTERN CONTEXT ───────────────────────────────────────────────
function getCompanyContext(companyPattern) {
  const patterns = {
    google: "Google-style (emphasis on problem solving, algorithmic thinking, optimization)",
    amazon: "Amazon-style (emphasis on behavioral ownership, scalability, practical engineering)",
    microsoft: "Microsoft-style (emphasis on system thinking, architecture, collaboration)",
    startup: "Startup-style (emphasis on practical implementation, speed, real-world delivery)",
    all: "general tech industry",
  };
  return patterns[companyPattern] || patterns.all;
}

// ─── AI PERSONALIZATION ────────────────────────────────────────────────────
async function personalizeQuestion(localQuestion, { role, focus, company, history, mode }) {
  try {
    const historyContext = history?.slice(-2)
      .map((h, i) => `Q${i+1}: ${h.question}\nA${i+1}: ${h.answer || "(no answer)"}`)
      .join("\n\n") || "This is the first question.";

    const tone = mode === "beginner" ? "supportive and educational"
      : mode === "real" ? "strict and direct, like a real technical interview"
      : "professional and conversational";

    const prompt = `You are a ${tone} interviewer.
Role being interviewed: ${role || "Software Engineer"}
Interview focus: ${focus || "Mixed"}
Session context (last exchanges):
${historyContext}

Base question: "${localQuestion.text}"
Question type: ${localQuestion.type || "conceptual"}

Lightly rephrase this question to feel natural and in-context. Keep the same topic, difficulty, and intent. Under 2 sentences. No fluff.
Return ONLY the rephrased question. No explanation.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Return ONLY plain text. One question. No markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 120,
    });

    const text = (completion.choices[0]?.message?.content || "").trim();
    if (text && text.length > 10 && text.length < 400) {
      return text.endsWith("?") ? text : text + "?";
    }
    return localQuestion.text;
  } catch (err) {
    console.warn("[AdaptiveEngine] Personalization failed:", err.message);
    return localQuestion.text;
  }
}

// ─── FOLLOW-UP GENERATION ──────────────────────────────────────────────────
async function generateFollowUp({ role, focus, lastQuestion, lastAnswer, localFollowUpHints, mode }) {
  try {
    const tone = mode === "beginner" ? "supportive and guiding"
      : mode === "real" ? "strict and probing"
      : "professional and curious";

    const prompt = `You are a ${tone} technical interviewer.
Interview focus: ${focus || "General"}
Candidate just answered this question:
"${lastQuestion}"
Their answer: "${lastAnswer || "(no answer given)"}"

Ask ONE sharp follow-up question that:
1. Probes a gap in their answer OR extends the concept naturally
2. Is direct and concise (under 2 sentences)
3. Reveals whether they truly understand or just memorized

Return ONLY the follow-up question. No explanation.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Return ONLY one follow-up question as plain text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const text = (completion.choices[0]?.message?.content || "").trim();
    if (text && text.length > 10 && text.length < 300) {
      return { question: text.endsWith("?") ? text : text + "?", isFollowUp: true, category: "Follow-up" };
    }
    throw new Error("Invalid AI follow-up response");
  } catch (err) {
    console.warn("[AdaptiveEngine] Follow-up AI failed:", err.message);
    if (localFollowUpHints && localFollowUpHints.length > 0) {
      return { question: localFollowUpHints[0], isFollowUp: true, category: "Follow-up" };
    }
    return null;
  }
}

// ─── MAIN ENGINE API ───────────────────────────────────────────────────────
async function selectNextQuestion({
  role, focus = "mixed", company = "General", mode = "standard",
  history = [], usedQuestionIds = [], lastLocalQuestionId = null,
}) {
  const questionIndex = history.length;
  const answeredHistory = history.filter(h => h.answer);
  const totalScore = answeredHistory.reduce((sum, h) => sum + estimateAnswerScore(h.answer), 0);
  const maxScore = answeredHistory.length * 3;
  const runningScorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 50;

  const difficultyLevel = calculateDifficulty(questionIndex, runningScorePercent, mode);

  // Q0: Always a warmup
  if (questionIndex === 0) {
    const warmup = getWarmupQuestion(role, usedQuestionIds);
    if (warmup) {
      const questionText = await personalizeQuestion(warmup, { role, focus, company, history, mode });
      return {
        question: questionText, category: warmup.category,
        difficulty: warmup.difficulty, type: warmup.type || "conceptual",
        isFollowUp: false, localId: warmup.id, tags: warmup.tags || [],
      };
    }
  }

  // Q2+: Maybe generate follow-up (45% chance)
  if (questionIndex >= 2 && lastLocalQuestionId && history.length > 0) {
    const lastHistoryItem = history[history.length - 1];
    const followUpHints = getFollowUps(lastLocalQuestionId);
    const shouldFollowUp = followUpHints.length > 0 && Math.random() < 0.45;

    if (shouldFollowUp) {
      const followUp = await generateFollowUp({
        role, focus,
        lastQuestion: lastHistoryItem.question,
        lastAnswer: lastHistoryItem.answer,
        localFollowUpHints: followUpHints,
        mode,
      });
      if (followUp) {
        return { ...followUp, localId: lastLocalQuestionId + "_followup", difficulty: difficultyLevel, tags: ["Follow-up"], type: "follow_up" };
      }
    }
  }

  // Default: Pick from question bank for the given focus
  const localQuestions = getQuestionsForFocus(focus, difficultyLevel, 5, usedQuestionIds, role);
  const localQ = localQuestions[0];

  if (!localQ) {
    return {
      question: `Can you describe a real project where you applied ${focus || role} concepts and what challenges you faced?`,
      category: "General", difficulty: difficultyLevel, type: "behavioral",
      isFollowUp: false, localId: `fallback-${Date.now()}`, tags: ["General"],
    };
  }

  const questionText = await personalizeQuestion(localQ, { role, focus, company, history, mode });
  return {
    question: questionText, category: localQ.category,
    difficulty: localQ.difficulty, type: localQ.type || "conceptual",
    isFollowUp: false, localId: localQ.id, tags: localQ.tags || [],
  };
}

module.exports = {
  selectNextQuestion,
  estimateAnswerScore,
  estimateConfidence,
  calculateDifficulty,
};
