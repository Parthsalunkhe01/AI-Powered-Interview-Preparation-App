require('dotenv').config({ path: 'B:/Mini_Project_SET/backend/.env' });
const { GoogleGenAI } = require("@google/genai");

async function listModels() {
    try {

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.list();
        // The object seems to have hidden properties or is a special wrapper.
        // Let's try to convert to a plain array if possible or use Object.getOwnPropertyNames
        console.log("Sample:", JSON.stringify(Object.values(response)[0]?.slice(0, 3), null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
