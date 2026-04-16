require('dotenv').config({ path: 'B:/Mini_Project_SET/backend/.env' });

const Groq = require("groq-sdk");

async function listModels() {
    try {
        const ai = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Groq doesn't support models.list(), so we simulate it
        const availableModels = [
            "llama3-70b-8192",
            "llama3-8b-8192",
            "mixtral-8x7b-32768"
        ];

        console.log("Available Groq Models (Sample):");
        console.log(JSON.stringify(availableModels.slice(0, 3), null, 2));

        // Optional: test one model (like your Gemini test)
        const response = await ai.chat.completions.create({
            model: availableModels[0],
            messages: [
                {
                    role: "user",
                    content: "Hello"
                }
            ]
        });

        console.log("\nTest Response:");
        console.log(response.choices[0].message.content);

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();