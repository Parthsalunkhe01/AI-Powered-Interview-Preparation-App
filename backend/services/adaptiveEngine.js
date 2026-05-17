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

// -- SKIP DETECTION -------------------------------------------------------
// Detects whether an answer is a genuine skip/no-answer vs actual content.
const SKIP_PATTERNS = /^(skip|skipped|none|n\/a|\/\/skip|\.\.\.|no answer|-|na|java|kotlin|react|python|javascript)$/i;

function isSkippedAnswer(text) {
  if (!text || text.trim().length === 0) return true;
  
  // Clean markdown code fence blocks if any
  let cleaned = text.replace(/```[a-zA-Z0-9-]*\n/g, "").replace(/```/g, "").trim().toLowerCase();
  
  // Split into lines to evaluate line-by-line
  const lines = cleaned.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  // Filter out comments, language tags, and skip patterns
  const actualLines = lines.filter(line => {
    // 1. Check if the line matches standard skip pattern words
    if (SKIP_PATTERNS.test(line)) return false;
    
    // 2. Check if the line is just a code comment starting with //, #, /*, *
    if (line.startsWith("//") || line.startsWith("#") || line.startsWith("/*") || line.startsWith("*")) {
      // If the comment itself contains a skip word or is empty, it's a skip!
      const commentContent = line.replace(/^\/\/|^\#|^\/\*|^\*/, "").replace(/\*\/$/, "").trim();
      if (commentContent === "" || SKIP_PATTERNS.test(commentContent)) return false;
    }
    
    // 3. Otherwise, it is actual content
    return true;
  });
  
  // If no actual lines are left, then it is a skipped answer!
  if (actualLines.length === 0) return true;
  
  // As a secondary check, if the total cleaned length is very short (< 15 characters)
  // and has no sentence punctuation, treat it as a skip.
  const joinedText = actualLines.join(" ");
  if (joinedText.length < 15 && !/[.?!,]/.test(joinedText)) return true;
  
  return false;
}

// -- SCORING ESTIMATION (local, quick) ------------------------------------
function estimateAnswerScore(answerText) {
  if (isSkippedAnswer(answerText)) return 0; // treat trivial/skip answers as 0
  const len = answerText.trim().length;
  if (len < 30)  return 0.5; // Very brief
  if (len < 100) return 1.5; // Shallow
  if (len < 250) return 2.5; // Good
  return 3;                  // Excellent depth
}

function estimateConfidence(answers) {
  if (!answers || answers.length === 0) return "Low";
  let skipped = 0, detailed = 0, brief = 0;
  
  for (const a of answers) {
    const text = (a.answerText || "").trim();
    if (isSkippedAnswer(text)) { skipped++; continue; }
    const len = text.length;
    if (len > 250) detailed++;
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
  // Skip AI personalization when budget is REDUCED or worse
  const tier = await getCurrentTier();
  if (tier === "REDUCED" || tier === "MINIMAL" || tier === "OFFLINE") {
    return localQuestion.text;
  }

  // Only personalize if we have meaningful history (non-skip answers)
  const meaningfulHistory = (history || []).filter(h => !isSkippedAnswer(h.answer));
  if (meaningfulHistory.length === 0) {
    // No real answers yet — just return the base question as-is (no hallucinated bridges)
    return localQuestion.text;
  }

  try {
    // Only show last 2 REAL answers — no skip noise in context
    const historyContext = meaningfulHistory.slice(-2)
      .map((h, i) => `Q${i+1}: ${h.question}\nA${i+1}: ${h.answer}`)
      .join("\n\n");

    const tone = mode === "beginner" ? "encouraging and supportive"
      : mode === "real" ? "rigorous and professional, like a FAANG interviewer"
      : "professional and conversational";

    const prompt = `You are a ${tone} technical interviewer at ${company || "a top tech firm"}.
Candidate Role: ${role || "Software Engineer"}
Focus: ${focus || "General"}
Experience Level: Entry

RECENT MEANINGFUL EXCHANGES:
${historyContext}

BASE QUESTION: "${localQuestion.text}"

TASK: Rephrase the base question to flow naturally. Keep it SHORT (max 1 sentence), clear, and directly technical.
Do NOT reference previous questions unless genuinely relevant.
Do NOT use phrases like "Based on our earlier discussion...", "Now that we've discussed...", "Can you elaborate on how you would skip".
Return ONLY the question text. No introduction, no trailing text.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Return ONLY the rephrased interview question. No preamble, no explanation." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 120,
    });

    recordUsage("groq");
    const text = (completion.choices[0]?.message?.content || "").trim();
    // Reject output that references "skip" or is too long (hallucination)
    if (text && text.length > 10 && text.length < 300 && !SKIP_PATTERNS.test(text.split(" ")[0])) {
      return text;
    }
    return localQuestion.text;
  } catch (err) {
    return localQuestion.text;
  }
}

// -- FOLLOW-UP GENERATION --------------------------------------------------
async function generateFollowUp({ role, focus, lastQuestion, lastAnswer, localFollowUpHints, mode }) {
  // CRITICAL: Never generate follow-ups on skipped/empty answers.
  // This prevents nonsensical questions like "Can you elaborate on how you'd skip..."
  if (isSkippedAnswer(lastAnswer)) {
    return null;
  }

  try {
    const tone = mode === "real" ? "probing and analytical" : "curious and professional";

    const prompt = `You are a ${tone} technical interviewer.
Focus: ${focus || "General"}

Q: "${lastQuestion}"
A: "${lastAnswer}"

Ask ONE sharp follow-up question that probes deeper into the candidate's answer.
If they gave a good answer, push for edge cases or implementation details.
If vague, ask for a specific example.
Max 20 words. Return ONLY the question.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Return ONLY one follow-up question. No preamble." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 80,
    });

    const text = (completion.choices[0]?.message?.content || "").trim();
    if (text && text.length > 10 && text.length < 200 && !isSkippedAnswer(text)) {
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

  // Q2+: Maybe generate follow-up (30% chance, only if last answer was substantive)
  if (questionIndex >= 2 && lastLocalQuestionId && history.length > 0) {
    const lastHistoryItem = history[history.length - 1];
    const lastAnswerText  = lastHistoryItem.answer || "";

    // Only follow up if the previous answer had real content (not skipped)
    const answerIsSubstantive = !isSkippedAnswer(lastAnswerText) && lastAnswerText.trim().length > 30;
    const followUpHints = getFollowUps(lastLocalQuestionId);
    const shouldFollowUp = answerIsSubstantive && followUpHints.length > 0 && Math.random() < 0.30;

    if (shouldFollowUp) {
      const followUp = await generateFollowUp({
        role, focus,
        lastQuestion: lastHistoryItem.question,
        lastAnswer:   lastAnswerText,
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
  isSkippedAnswer,
};
