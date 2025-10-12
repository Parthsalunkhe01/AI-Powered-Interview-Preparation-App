const { GoogleGenAI } = require("@google/genai");
const { marked } = require("marked");
const { conceptExplainPrompt, questionAnswerPrompt} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateInterviewQuestions = async (req,res) => {
    try{
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

        if(!role || !experience || !topicsToFocus || !numberOfQuestions){
            return res.status(400).json({message:"Missing required fields."});
        }

        const prompts = questionAnswerPrompt(role,experience,topicsToFocus,numberOfQuestions);;

        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompts,
        });

        let rawText = result.text;

        const cleanedText = rawText
        .replace(/^```json\s*/, "") // Remove starting ```json or ```
        .replace(/```$/, "")              // Remove ending ```
        .trim();
        const data = JSON.parse(cleanedText);
        res.status(200).json(data)
    }catch(error){
        res.status(500).json({
            message: "Failed to generate questions",
            error: error.message,
        });
    }
};

const generateConceptExplanation = async (req,res) => {
    try {
        const { question } = req.body;

        if(!question){
            return res.status(400).json({message:"Missing required fields."});
        }

        const prompt = conceptExplainPrompt(question);
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
        return res.status(500).json({ message: "No valid response from Gemini." });
        }

        const cleanedText = rawText
        .replace(/^```json\s*/, "") // Remove ```json
        .replace(/^```\s*/, "")     // Remove ``` (in case it's just triple backticks)
        .replace(/```$/, "")        // Remove closing ```
        .trim();
        const data = JSON.parse(cleanedText);

        //const htmlExplanation = marked.parse(data.explanation);

        res.status(200).json(data);// This is clean and renderable
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate questions",
            error: error.message,
        });
    }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation};