const Groq = require("groq-sdk");

const ai = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate structured qualitative feedback for an interview session
 */
const generateFeedback = async ({ company, type, role, experience, history }) => {
    if (!history || history.length === 0) {
        throw new Error("No interview history available for analysis.");
    }

    const historyText = history
        .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer || "(no answer provided)"}`)
        .join("\n\n");

    const prompt = `You are an expert technical recruiter and senior lead engineer at ${company}. 
You are reviewing a candidate's completed ${type} interview for a ${experience || ""} ${role || "Software Engineer"} role.

Interview Data:
Company: ${company}
Type: ${type}
Role: ${role || "Software Engineer"} (Level: ${experience || "N/A"})

Interview Transcript:
${historyText}

Your task is to provide a deep, structured qualitative analysis of the candidate's performance. 
Focus on technical depth, problem-solving approach, clarity of communication, and conceptual understanding.

Return the response as a valid JSON object with EXACTLY the following format:
{
  "strengths": ["string", "string"],
  "improvementAreas": ["string", "string"],
  "qualitativeAnalysis": {
    "communication": "Detailed analysis...",
    "technicalReasoning": "Detailed analysis..."
  },
  "companyExpectations": ["What ${company} typically looks for..."],
  "score": 0,
  "topics": ["string", "string"],
  "correctAnswers": 0
}

Guidelines:
1. Be specific.
2. Analyze deeply.
3. Be professional.
4. "score" must be a Number from 0 to 100 representing technical accuracy.
5. "correctAnswers" must be a Number representing how many questions they successfully answered.
6. Return ONLY JSON. No text, no markdown.`;

    try {
        const result = await ai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Return ONLY valid JSON. No markdown, no explanation."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        const text = result?.choices?.[0]?.message?.content || "";

        // Safety check
        if (!text) {
            throw new Error("Empty response from AI feedback engine.");
        }

        // Clean response
        const cleanedText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        try {
            return JSON.parse(cleanedText);
        } catch (parseError) {
            console.warn("Standard JSON.parse failed, attempting repair:", parseError);
            const { jsonrepair } = require("jsonrepair");
            return JSON.parse(jsonrepair(cleanedText));
        }

    } catch (error) {
        console.error("AI_FEEDBACK_ENGINE_ERROR:", error);

        // Fallback response
        return {
            strengths: ["Completed the interview session."],
            improvementAreas: ["AI feedback was temporarily unavailable for detailed analysis."],
            qualitativeAnalysis: {
                communication: "Communication analysis pending.",
                technicalReasoning: "Technical reasoning analysis pending."
            },
            companyExpectations: ["Company-specific expectations could not be retrieved at this moment."],
            score: 0,
            topics: ["Session Analysis Partial"],
            correctAnswers: 0
        };
    }
};

module.exports = {
    generateFeedback,
};