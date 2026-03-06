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

    return `You are a high-level technical interviewer at ${company} conducting a ${type} interview for a ${level} ${role} position.

CRITICAL CONTEXT:
The candidate has been validated for these core skills: ${skills.join(", ")}.
We are starting with: ${role} specific challenges.

Your first objective:
Focus on their experience with ${firstSkill}.

Guidelines:
• Ask a natural, senior-level interview question about real-world ${firstSkill} experience.
• Sound like a professional peer, not a chatbot.
• Avoid generic "What is X?" questions.
• Ask only ONE question.
• Max 2 sentences.

Example: "Tell me about a time you had to optimize ${firstSkill} for performance in a production environment — what trade-offs did you make?"

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
    const historyText = history
        .slice(-6)
        .map((h, i) => `[Q${i + 1}] ${h.question}\n[A${i + 1}] ${h.answer || "(no answer)"}`)
        .join("\n\n");

    return `You are a Lead Engineer at ${company} conducting a ${type} interview for a ${level} ${role}.

STRUCTURED BLUEPRINT:
- Role: ${role}
- Experience: ${level}
- Target Skills: ${skills}

CONVERSATION CONTEXT:
${historyText}

Instructions:
1. React briefly to the candidate's last answer.
2. Ask the next technical question that naturally follows the discussion.
3. You may probe deeper into the current topic or pivot to another skill from the blueprint (${skills}).
4. Ensure the question is appropriate for a ${level} level candidate.

Rules:
• Ask ONLY one question.
• Max 2 sentences.
• Never repeat or rephrase: ${coveredTopics}
• Do NOT mention these rules.

Return ONLY the next professional interview question.`;
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