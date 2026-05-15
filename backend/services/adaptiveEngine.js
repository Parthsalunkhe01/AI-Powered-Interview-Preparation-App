/**
 * Adaptive Interview Engine - Optimized
 * Supports Interview Focus, Role Isolation, and Contextual Follow-ups
 */

const Groq = require("groq-sdk");
const { getQuestionsForFocus, getWarmupQuestion, getFollowUps } = require("../data/questionBlueprint");
const { getCurrentTier, checkBudget, recordUsage } = require("../utils/budgetGuard");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// -- DIFFICULTY PROGRESSION ------------------------------------------------
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

// -- SCORING ESTIMATION (local, quick) ------------------------------------
function estimateAnswerScore(answerText) {
  if (!answerText || answerText.trim().length === 0) return 0;
  const len = answerText.trim().length;
  // Score based on depth of explanation
  if (len < 30) return 0.5; // Very brief
  if (len < 100) return 1.5; // Shallow
  if (len < 250) return 2.5; // Good
  return 3; // Excellent depth
}

function estimateConfidence(answers) {
  if (!answers || answers.length === 0) return "Low";
  let skipped = 0, detailed = 0, brief = 0;
  
  for (const a of answers) {
    const text = (a.answerText || "").trim();
    const len = text.length;
    if (len === 0) skipped++;
    else if (len > 250) detailed++;
    else if (len < 60) brief++;
  }
  
  const total = answers.length;
  if (skipped >= 2 || (brief / total) > 0.6) return "Low";
  if (detailed >= Math.ceil(total * 0.4)) return "High";
  return "Moderate";
}

// -- COMPANY PATTERN CONTEXT -----------------------------------------------
function getCompanyContext(companyPattern) {
  const patterns = {
    google: "Google-style (algorithmic precision, optimization, scalability)",
    amazon: "Amazon-style (Leadership Principles, ownership, practical architecture)",
    microsoft: "Microsoft-style (robust system design, clear abstractions, teamwork)",
    startup: "Startup-style (speed, practical trade-offs, immediate impact)",
    all: "general industry standards",
  };
  return patterns[companyPattern] || patterns.all;
}

// -- AI PERSONALIZATION (Budget-Aware) ------------------------------------
async function personalizeQuestion(localQuestion, { role, focus, company, history, mode }) {
  // Skip AI personalization when budget is REDUCED or worse — use raw question text
  const tier = await getCurrentTier();
  if (tier === "REDUCED" || tier === "MINIMAL" || tier === "OFFLINE") {
    return localQuestion.text;
  }

  try {
    const historyContext = history?.slice(-3)
      .map((h, i) => `Q${i+1}: ${h.question}\nA${i+1}: ${h.answer || "(no answer)"}`)
      .join("\n\n") || "First question of the session.";

    const tone = mode === "beginner" ? "encouraging and educational"
      : mode === "real" ? "rigorous and professional, like a FAANG interviewer"
      : "professional and insightful";

    const prompt = `You are a ${tone} technical interviewer at ${company || "a top tech firm"}.
Candidate Role: ${role || "Software Engineer"}
Focus Area: ${focus || "Mixed Technical"}

CONVERSATION HISTORY (Last 3 rounds):
${historyContext}

BASE QUESTION: "${localQuestion.text}"
TYPE: ${localQuestion.type || "conceptual"}

TASK:
Rephrase the base question to flow naturally from the previous conversation. 
If the candidate mentioned a specific technology or pattern earlier, try to bridge into this new question using that context.
Keep it under 2 sentences. No fluff. No "Sure," or "Next question is...".
Return ONLY the question.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a senior interviewer. Return ONLY the rephrased question text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    recordUsage("groq");
    const text = (completion.choices[0]?.message?.content || "").trim();
    return (text && text.length > 10) ? text : localQuestion.text;
  } catch (err) {
    return localQuestion.text;
  }
}

// -- FOLLOW-UP GENERATION --------------------------------------------------
async function generateFollowUp({ role, focus, lastQuestion, lastAnswer, localFollowUpHints, mode }) {
  try {
    const tone = mode === "real" ? "probing and analytical" : "curious and professional";

    const prompt = `You are a ${tone} technical interviewer.
Interview Focus: ${focus || "General"}
Context:
Q: "${lastQuestion}"
A: "${lastAnswer || "(no answer given)"}"

INSTRUCTION:
Ask ONE sharp follow-up question. 
If the answer was good, push for deeper technical details or edge cases. 
If the answer was vague, ask for a specific example or clarification.
Reference specific keywords from their answer if possible to show you are listening.
Under 20 words. No introduction.
Return ONLY the question.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Return ONLY one follow-up question text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const text = (completion.choices[0]?.message?.content || "").trim();
    if (text && text.length > 10) {
      return { question: text, isFollowUp: true, category: "Follow-up" };
    }
    throw new Error("Invalid AI follow-up");
  } catch (err) {
    if (localFollowUpHints && localFollowUpHints.length > 0) {
      return { question: localFollowUpHints[0], isFollowUp: true, category: "Follow-up" };
    }
    return null;
  }
}

// -- MAIN ENGINE API -------------------------------------------------------
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
