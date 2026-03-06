const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    "communication": "Detailed analysis of how they explain concepts...",
    "technicalReasoning": "Detailed analysis of their logic and problem-solving..."
  },
  "companyExpectations": ["What ${company} typically looks for..."]
}

Guidelines:
1. Be specific. Don't just say "Good communication." Say "Effectively used analogies to explain complex distributed systems concepts."
2. Analyze the "Why" behind their answers.
3. Be professional but honest.
4. Ensure the JSON is valid and contains no other text.`;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            generationConfig: {
                temperature: 0.7,
                response_mime_type: "application/json",
            },
        });

        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || "";

        // Safety check for empty response
        if (!text) {
            throw new Error("Empty response from AI feedback engine.");
        }

        // Clean the response: remove markdown code blocks if they exist
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
        // Fallback structured feedback in case of AI failure
        return {
            strengths: ["Completed the interview session."],
            improvementAreas: ["AI feedback was temporarily unavailable for detailed analysis."],
            qualitativeAnalysis: {
                communication: "Communication analysis pending.",
                technicalReasoning: "Technical reasoning analysis pending."
            },
            companyExpectations: ["Company-specific expectations could not be retrieved at this moment."]
        };
    }
};

module.exports = {
    generateFeedback,
};
