const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Sanitize question text
 */
const sanitizeQuestion = (text) => {
    if (!text) return "";
    return text
        .replace(/^(Question:|Interviewer:|Q:|Next Question:)\s*/i, "")
        .replace(/["]/g, "")
        .trim();
};

/**
 * Check similarity between two strings to prevent near-duplicate questions
 */
const isTooSimilar = (a, b) => {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

    const na = normalize(a);
    const nb = normalize(b);

    if (na === nb) return true;

    const wordsA = new Set(na.split(" "));
    const wordsB = nb.split(" ");

    const overlap = wordsB.filter((w) => wordsA.has(w)).length;

    const similarity = overlap / Math.max(wordsA.size, wordsB.length);

    return similarity > 0.75;
};

/**
 * Build the first question prompt
 */
const buildFirstQuestionPrompt = ({ company, type, blueprint }) => {
    const skills = blueprint?.skills || ["problem solving"];
    const role = blueprint?.targetRole || "Software Engineer";
    const level = blueprint?.experienceLevel || "mid-level";
    const firstSkill = skills[0];

    return `You are a senior engineer at ${company} conducting a realistic ${type} interview 
for a ${level} ${role} position.

Focus the opening discussion on the skill: ${firstSkill}

Guidelines:
• Ask a natural interview question about real experience
• Sound like a real human interviewer
• Avoid generic textbook questions
• Do not introduce yourself
• Ask only ONE question
• Maximum 2 sentences

Good examples:
• "Walk me through a project where you used ${firstSkill} in production — what was the hardest part?"
• "What's the most challenging system you've built using ${firstSkill}?"
• "Describe a time ${firstSkill} caused a serious problem in a system you worked on."

Return ONLY the interview question.`;
};

/**
 * Build follow-up question prompt
 */
const buildFollowUpPrompt = ({ company, type, blueprint, history }) => {

    const skills = blueprint?.skills?.join(", ") || "general software engineering";
    const role = blueprint?.targetRole || "Software Engineer";
    const level = blueprint?.experienceLevel || "mid-level";

    const coveredTopics = history.map((h) => h.question).join("\n- ");

    const lastExchange = history[history.length - 1];

    const lastAnswer = lastExchange?.answer || "(no answer given)";

    const historyText = history
        .slice(-6)
        .map(
            (h, i) =>
                `[Q${i + 1}] Interviewer: ${h.question}\n[A${i + 1}] Candidate: ${h.answer || "(skipped)"}`
        )
        .join("\n\n");

    return `You are a senior software engineer at ${company} conducting a realistic ${type} interview for a ${level} ${role} role.

Topics that should appear during the interview:
${skills}

Conversation so far:
${historyText}

The candidate just said:
"${lastAnswer}"

Questions already asked (never repeat):
- ${coveredTopics}

Your task:
Continue the interview like a real human interviewer.

Natural interviewer behaviors:
• React briefly to the candidate answer
• Ask deeper technical questions
• Challenge assumptions when appropriate
• Sometimes move to another skill
• Occasionally present real-world scenarios

Question styles you may use:
• Deeper probing — "What part of that system was hardest to scale?"
• Scenario — "Suppose traffic suddenly increases 10x — what breaks first?"
• Topic shift — "Let's switch gears slightly — how comfortable are you with X?"
• Debugging — "Imagine this system suddenly starts failing in production — how would you investigate?"

Rules:
• Ask ONLY one question
• Max 2 sentences
• Do NOT repeat previous questions
• Do NOT rephrase earlier questions
• Do NOT mention interview rules
• Do NOT add labels like "Question:" or "Interviewer:"

Return ONLY the next interview question.`;
};

/**
 * Generate first interview question
 */
const generateFirstQuestion = async ({ company, type, blueprint }) => {

    const prompt = buildFirstQuestionPrompt({ company, type, blueprint });

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 120,
        },
    });

    const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        result?.text ||
        "";

    const question = sanitizeQuestion(text);

    if (!question) {
        throw new Error("Empty response from Gemini");
    }

    return question;
};

/**
 * Generate follow-up question with retry if duplicate
 */
const generateFollowUpQuestion = async ({ company, type, blueprint, history }) => {

    if (!history || history.length === 0) {
        return generateFirstQuestion({ company, type, blueprint });
    }

    const prompt = buildFollowUpPrompt({ company, type, blueprint, history });

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        generationConfig: {
            temperature: 0.95,
            maxOutputTokens: 150,
        },
    });

    const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        result?.text ||
        "";

    const nextQuestion = sanitizeQuestion(text);

    if (!nextQuestion) {
        throw new Error("Empty response from Gemini");
    }

    const previousQuestions = history.map((h) => h.question);

    const isDuplicate = previousQuestions.some((q) => isTooSimilar(q, nextQuestion));

    if (isDuplicate) {

        const retrySkills = blueprint?.skills || [];

        const unusedSkill =
            retrySkills.find(
                (skill) =>
                    !previousQuestions.some((q) =>
                        q.toLowerCase().includes(skill.toLowerCase())
                    )
            ) || retrySkills[Math.floor(Math.random() * retrySkills.length)];

        const retryPrompt = `${prompt}

IMPORTANT: Your previous question was too similar to an earlier one.

Now shift the interview to the skill "${unusedSkill}" and ask a completely different type of question.

Prefer:
• system design scenario
• debugging situation
• architecture discussion
• scalability challenge

Ask one concise question.`;

        const retryResult = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: retryPrompt,
            generationConfig: {
                temperature: 1.0,
                maxOutputTokens: 150,
            },
        });

        const retryText =
            retryResult?.candidates?.[0]?.content?.parts?.[0]?.text ||
            retryResult?.text ||
            "";

        return sanitizeQuestion(retryText) || nextQuestion;
    }

    return nextQuestion;
};

module.exports = {
    generateFirstQuestion,
    generateFollowUpQuestion,
};