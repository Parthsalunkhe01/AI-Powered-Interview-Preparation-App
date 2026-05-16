const Groq = require("groq-sdk");
const { jsonrepair } = require("jsonrepair");
const { conceptExplainPrompt, questionAnswerPrompt, resourcePrompt } = require("../utils/prompts");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ GENERATE INTERVIEW QUESTIONS
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an AI that returns ONLY valid JSON. No markdown, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    let rawText = completion.choices[0]?.message?.content;

    if (!rawText) {
      return res.status(500).json({ message: "No response from Groq." });
    }

    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      try {
        data = JSON.parse(jsonrepair(cleanedText));
      } catch (repairErr) {
        console.error("JSON Parse/Repair Error:", cleanedText);
        return res.status(500).json({
          message: "Invalid JSON returned by AI and repair failed",
          raw: cleanedText,
        });
      }
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// ✅ GENERATE CONCEPT EXPLANATION
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const prompt = conceptExplainPrompt(question);

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON. No markdown or extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    let rawText = completion.choices[0]?.message?.content;

    if (!rawText) {
      return res.status(500).json({ message: "No response from Groq." });
    }

    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      try {
        data = JSON.parse(jsonrepair(cleanedText));
      } catch (repairErr) {
        return res.status(500).json({ message: "Invalid JSON from AI", raw: cleanedText });
      }
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

// generateResources has been decoupled and moved to resourceController.js

// ─────────────────────────────────────────────────────────────────────────────
// ✅ BATCH ANSWER GENERATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely parse an AI response string into an array of answer objects.
 * Returns null if parsing fails.
 */
const parseBatchResponse = (rawText) => {
  if (!rawText) return null;
  const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.warn("  [BATCH_PARSE_ERROR] standard JSON.parse failed, attempting repair...");
    try {
        const { jsonrepair } = require("jsonrepair");
        parsed = JSON.parse(jsonrepair(cleaned));
        console.log("    ✅ JSON successfully repaired.");
    } catch (repairErr) {
        console.error("    ❌ Repair failed:", repairErr.message);
        return null;
    }
  }

  // Handle various JSON response structures commonly returned by models
  let result = null;
  if (Array.isArray(parsed)) result = parsed;
  else if (parsed?.answers && Array.isArray(parsed.answers)) result = parsed.answers;
  else if (parsed?.questions && Array.isArray(parsed.questions)) result = parsed.questions;
  else if (parsed && typeof parsed === "object") result = [parsed];

  // Validate that we actually got useful data objects
  if (result && Array.isArray(result) && result.length > 0) {
    return result.filter(item => item && (item.explanation || item.answer || item.question));
  }
  
  return null;
};

/**
 * Call Groq API for a single batch of questions.
 * Returns the raw text response or throws on API failure.
 */
const callGroqForBatch = async (batch, role, topics, performanceLevel = "average") => {
  const { detailedAnswerBatchPrompt } = require("../utils/prompts");
  const prompt = detailedAnswerBatchPrompt(batch, role, topics, performanceLevel);

  console.log(`  [AI_REQ] Outgoing prompt for ${batch.length} questions (User Level: ${performanceLevel})...`);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // Production model — 128k context, handles trimmed prompt
    messages: [
      {
        role: "system",
        content: "Return ONLY a valid JSON array. No markdown. No conversational filler.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 1500, // Prompt ~2k tokens + 1500 output = safely within 8192 context
  });

  return completion.choices[0]?.message?.content || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ GENERATE DETAILED ANSWERS - BATCH PROCESSING
// ─────────────────────────────────────────────────────────────────────────────
const generateDetailedAnswers = async (req, res) => {
  try {
    const { questions, role, topics, performanceLevel } = req.body;

    // Validate input
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Invalid questions input. Expected a non-empty array." });
    }

    const resolvedRole = role || "Software Engineer";
    const resolvedTopics = topics || "General Software Engineering";
    const resolvedLevel = performanceLevel || "average";
    const BATCH_SIZE = 1; // Process one by one to avoid TPM limits with large prompts

    // Split into batches
    const batches = [];
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      batches.push(questions.slice(i, i + BATCH_SIZE));
    }

    console.log(`\n📦 generate-answers: ${questions.length} topics (Level: ${resolvedLevel})`);

    const allRawAnswers = [];

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];
      let batchSuccess = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 3;

      while (!batchSuccess && attempts < MAX_ATTEMPTS) {
        attempts++;
        try {
          const rawText = await callGroqForBatch(batch, resolvedRole, resolvedTopics, resolvedLevel);
          const parsed = parseBatchResponse(rawText);
          if (parsed && parsed.length > 0) {
            allRawAnswers.push(...parsed);
            batchSuccess = true;
          }
        } catch (err) {
          console.error(`    [Attempt ${attempts}] API Error:`, err.message);
          if (err.message.includes("429")) {
            console.warn("    [RATE_LIMIT] 429 hit. Waiting 15s...");
            await new Promise(r => setTimeout(r, 15000));
          }
        }
      }

      // Refill delay
      if (batchIdx < batches.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Map AI answers back to original questions
    const detailedQuestions = questions.map((qObj, idx) => {
      const qText = typeof qObj === "string" ? qObj : qObj.question;

      let aiAns = allRawAnswers.find((r) => {
        if (!r || !r.question) return false;
        const aiQ = String(r.question).toLowerCase();
        const userQ = String(qText).toLowerCase();
        return aiQ.includes(userQ.substring(0, 20)) || userQ.includes(aiQ.substring(0, 20));
      });

      if (!aiAns && allRawAnswers[idx]) aiAns = allRawAnswers[idx];

      return {
        question: qText,
        type: qObj.type || "concept",
        difficulty: qObj.difficulty || "medium",
        importance: aiAns?.importance || "Medium",
        duration: aiAns?.duration || "3-5 mins",
        companyTags: aiAns?.companyTags || [],
        detailedAnswer: {
          idealInterviewAnswer: aiAns?.idealInterviewAnswer || "A concise industry-standard summary.",
          explanation: aiAns?.explanation || "Detailed conceptual breakdown.",
          architectureDiagram: aiAns?.architectureDiagram || null,
          howToDrawStepByStep: aiAns?.howToDrawStepByStep || [],
          detailedSections: aiAns?.detailedSections || [],
          productionConcerns: aiAns?.productionConcerns || [],
          realWorldExample: aiAns?.realWorldExample || "General industry implementation.",
          interviewerTip: aiAns?.interviewerTip || "Focus on trade-offs.",
          commonMistakes: aiAns?.commonMistakes || [],
          possibleFollowUps: aiAns?.possibleFollowUps || [],
          suggestedTechStack: aiAns?.suggestedTechStack || "Standard enterprise stack.",
          codeExample: aiAns?.codeExample || null,
          keyInsights: aiAns?.keyInsights || {
             coreConcepts: [],
             scalabilityConcepts: [],
             interviewKeywords: []
          }
        },
      };
    });

    return res.json({ answers: detailedQuestions });

  } catch (error) {
    console.error("CRITICAL ERROR in generateDetailedAnswers:", error);
    return res.status(500).json({
      error: "An internal error occurred during answer generation",
      message: error.message,
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
  generateDetailedAnswers,
};