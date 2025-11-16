import express from 'express';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

console.log('Starting server...');

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend')));

app.post("/api/chat", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const chatPrompt = `
            You are "Care Guide," a helpful and empathetic medical chatbot.
            Your role is to provide clear, general health information.
            You must follow these rules:
            1.  answer should be 2-3 sentences maximum.
            2.  Answer only about things related to health and medical information.
            3.  If the user seems to be in a medical-S.O.S,
                or danger, tell them to contact local emergency services immediately.
            4.  Keep your answers concise and easy to understand.
            5.  **NO MARKDOWN.** Do not use bold (**), asterisks (*), or any other markdown formatting.

            User's question: "${prompt}"
        `;

        const result = await model.generateContent(chatPrompt);
        const response = await result.response;
        const aiResponse = response.text();

        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Frontend is being served from: ${path.join(__dirname, '../frontend')}`);
});