const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Clean question text
const sanitizeQuestion = (text) => {
  if (!text) return "";
  return text
    .replace(/^(Question:|Interviewer:|Q:|Next Question:)\s*/i, "")
    .replace(/["]/g, "")
    .trim();
};

// ✅ First Question Prompt
const buildFirstQuestionPrompt = ({ company, type, blueprint }) => {
  const skills = blueprint?.skills || ["problem solving"];
  const role = blueprint?.targetRole || "Software Engineer";
  const level = blueprint?.experienceLevel || "mid-level";
  const firstSkill = skills[0];

  return `You are a senior interviewer at ${company} conducting a ${type} interview.

Ask ONE professional real-world question about ${firstSkill} for a ${level} ${role}.

Rules:
- Only one question
- Max 2 sentences
- No explanation
- No markdown

Return ONLY the question.`;
};

// ✅ Follow-up Prompt
const buildFollowUpPrompt = ({ company, type, blueprint, history }) => {
  const skills = blueprint?.skills?.join(", ") || "software engineering";
  const role = blueprint?.targetRole || "Software Engineer";
  const level = blueprint?.experienceLevel || "mid-level";

  const historyText = history
    .slice(-5)
    .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
    .join("\n\n");

  return `You are a senior interviewer at ${company}.

Continue interview for ${level} ${role}.

Previous conversation:
${historyText}

Ask next logical question based on discussion.

Rules:
- One question only
- Max 2 sentences
- No repetition
- No explanation

Return ONLY the question.`;
};

// ✅ GROQ CALL FUNCTION
const callGroq = async (prompt) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "Return ONLY plain text. No markdown. No JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.9,
  });

  return completion.choices[0]?.message?.content || "";
};

// ✅ FIRST QUESTION
const generateFirstQuestion = async ({ company, type, blueprint }) => {
  const prompt = buildFirstQuestionPrompt({ company, type, blueprint });

  const text = await callGroq(prompt);
  const question = sanitizeQuestion(text);

  if (!question) throw new Error("Empty response from Groq");

  return question;
};

// ✅ FOLLOW-UP QUESTION
const generateFollowUpQuestion = async ({ company, type, blueprint, history }) => {
  if (!history || history.length === 0) {
    return generateFirstQuestion({ company, type, blueprint });
  }

  const prompt = buildFollowUpPrompt({ company, type, blueprint, history});

  const text = await callGroq(prompt);
  const question = sanitizeQuestion(text);

  if (!question) throw new Error("Empty response from Groq");

  return question;
};

module.exports = {
  generateFirstQuestion,
  generateFollowUpQuestion,
};