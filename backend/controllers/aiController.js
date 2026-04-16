const Groq = require("groq-sdk");
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
      console.error("JSON Parse Error:", cleanedText);
      return res.status(500).json({
        message: "Invalid JSON returned by AI",
        raw: cleanedText,
      });
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
      console.error("JSON Parse Error:", cleanedText);
      return res.status(500).json({
        message: "Invalid JSON returned by AI",
        raw: cleanedText,
      });
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
    console.error("  [BATCH_PARSE_ERROR] JSON parse failed:", e.message);
    return null;
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
const callGroqForBatch = async (batch, role, topics) => {
  const { detailedAnswerBatchPrompt } = require("../utils/prompts");
  const prompt = detailedAnswerBatchPrompt(batch, role, topics);

  console.log(`  [AI_REQ] Outgoing prompt for ${batch.length} questions...`);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "Return ONLY a valid JSON array. No text before or after the JSON. No markdown code blocks.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
    max_tokens: 3000,
  });

  const responseText = completion.choices[0]?.message?.content || null;
  if (responseText) {
    console.log(`  [AI_RES] Received ${responseText.length} characters.`);
  }
  return responseText;
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ GENERATE DETAILED ANSWERS - BATCH PROCESSING
// ─────────────────────────────────────────────────────────────────────────────
const generateDetailedAnswers = async (req, res) => {
  try {
    const { questions, role, topics } = req.body;

    // Validate input
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Invalid questions input. Expected a non-empty array." });
    }

    const resolvedRole = role || "Software Engineer";
    const resolvedTopics = topics || "General Software Engineering";
    const BATCH_SIZE = 3;

    // Split into batches of 3
    const batches = [];
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      batches.push(questions.slice(i, i + BATCH_SIZE));
    }

    console.log(`\n📦 generate-answers: ${questions.length} question(s) → ${batches.length} batch(es) of max ${BATCH_SIZE}`);

    // Process each batch sequentially
    const allRawAnswers = [];

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];
      let batchSuccess = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 3;

      while (!batchSuccess && attempts < MAX_ATTEMPTS) {
        attempts++;
        console.log(`  → Batch ${batchIdx + 1}/${batches.length} (Attempt ${attempts}/${MAX_ATTEMPTS}): sending ${batch.length} question(s)...`);

        try {
          const rawText = await callGroqForBatch(batch, resolvedRole, resolvedTopics);
          
          if (!rawText) {
            console.warn(`    [Attempt ${attempts}] Empty response.`);
          } else {
            const parsed = parseBatchResponse(rawText);
            if (!parsed || parsed.length === 0) {
              console.warn(`    [Attempt ${attempts}] Invalid JSON or zero usable results.`);
            } else {
              console.log(`    ✅ Batch ${batchIdx + 1} Success! Got ${parsed.length} answer(s).`);
              allRawAnswers.push(...parsed);
              batchSuccess = true;
            }
          }
        } catch (err) {
          console.error(`    [Attempt ${attempts}] API Error:`, err.message);
        }

        if (!batchSuccess && attempts < MAX_ATTEMPTS) {
          const backoff = attempts * 500;
          console.log(`    [RETRY] Cooling down for ${backoff}ms before next attempt...`);
          await new Promise(r => setTimeout(r, backoff));
        }
      }

      if (!batchSuccess) {
          console.error(`  ❌ [CRITICAL] Batch ${batchIdx + 1} failed after ${MAX_ATTEMPTS} attempts.`);
      }

      // Small delay between successful batches to avoid rate limits
      if (batchIdx < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`\n✅ Total raw answers collected: ${allRawAnswers.length} for ${questions.length} question(s).`);

    // Map AI answers back to original questions using fuzzy match + index fallback
    const detailedQuestions = questions.map((qObj, idx) => {
      const qText = typeof qObj === "string" ? qObj : qObj.question;

      // 1) Try fuzzy text match
      let aiAns = allRawAnswers.find((r) => {
        if (!r || !r.question) return false;
        const aiQ = String(r.question).toLowerCase();
        const userQ = String(qText).toLowerCase();
        return (
          aiQ.includes(userQ.substring(0, 30)) ||
          userQ.includes(aiQ.substring(0, 30))
        );
      });

      // 2) Positional fallback
      if (!aiAns && allRawAnswers[idx]) {
        aiAns = allRawAnswers[idx];
      }

      return {
        question: qText,
        type: qObj.type || "concept",
        difficulty: qObj.difficulty || "medium",
        detailedAnswer: {
          explanation:
            aiAns?.explanation ||
            aiAns?.answer ||
            "AI explanation could not be generated for this question.",
          keyInsights: Array.isArray(aiAns?.keyInsights)
            ? aiAns.keyInsights
            : Array.isArray(aiAns?.keyPoints)
            ? aiAns.keyPoints
            : [],
          interviewerTip:
            aiAns?.interviewerTip ||
            aiAns?.tip ||
            "Focus on explaining the concept clearly with real-world examples.",
          codeExample: aiAns?.codeExample || aiAns?.code || aiAns?.example || null,
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