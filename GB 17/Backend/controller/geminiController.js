const geminiModel = require('../services/gemini');
const Question = require("../models/questionModel");   // adjust if your model name differs
const Submission = require("../models/submissionModel"); // adjust if different
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper function to build context dynamically from MongoDB
async function buildContext(message) {
    let context = "";

    const problemMatch = message.match(/problem\s*(\d+)/i);
    if (problemMatch) {
        const problemID = parseInt(problemMatch[1]);
        const question = await Question.findOne({ questionID: problemID });

        if (question) {
            context += `Problem ${problemID}: ${question.title}\n`;
            context += `Description: ${question.description}\n`;
            if (question.inputFormat) context += `Input Format: ${question.inputFormat}\n`;
            if (question.outputFormat) context += `Output Format: ${question.outputFormat}\n`;
            if (question.example) context += `Example: ${question.example}\n`;
        }
    }

    const submissionMatch = message.match(/my\s*code|submission/i);
    if (submissionMatch) {
        const submission = await Submission.findOne().sort({ _id: -1 });
        if (submission) {
            context += `\nUser's last submission for Problem ${submission.problemID}:\nLanguage: ${submission.language}\nCode:\n${submission.code}\n`;
        }
    }

    return context;
}

exports.chatWithGemini = async (req, res) => {
    console.log("🔍 Incoming body:", req.body);

    const { message, problemId } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    try {
        // --- Build context dynamically ---
        let context = "";

        // If problem ID is sent, fetch problem details
        if (problemId) {
            const question = await Question.findOne({ questionID: problemId });
            if (problemId && !question) {
                context = `The user is working on Problem ${problemId} but it was not found in the database. The question they asked is: ${message}`;
            }
            if (question) {
                context += `
You are helping the user solve this coding problem:

Title: ${question.title}
Description: ${question.description}
Input Format: ${question.inputFormat}
Output Format: ${question.outputFormat}
Example: ${question.example}

Now, the user is asking: ${message}
        `;
            }
        } else {
            context = `The user is asking a general coding question: ${message}`;
        }

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
            {
                contents: [{ parts: [{ text: context }] }],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY,
                },
            }
        );

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        res.json({ reply });
    } catch (error) {
        console.error("🔥 Gemini API error:", error.response?.data || error.message);
        res.status(500).json({
            error: "Gemini API Error",
            details: error.response?.data || error.message,
        });
    }
};

// Handler for AI Learn
const handleLearn = async (req, res) => {
    try {
        const problemId = parseInt(req.params.problemId);
        const path = require("path");
        const problems = require(path.join(__dirname, "../../problems.json"));
        const problem = problems.find(p => p.id === problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // Prompt for Gemini API (focus on solving)
        const prompt = `You are an expert competitive programmer and educator. Help a student solve the following coding problem step-by-step.\n\nTitle: ${problem.title}\nDescription: ${problem.description}\nConstraints: ${problem.constraints}\nInput Format: ${problem.inputFormat}\nOutput Format: ${problem.outputFormat}\nExamples: ${problem.example.map(e => `Input: ${e.input} Output: ${e.output}`).join(' | ')}\n\nYour response should include:\n1. Problem analysis and intuition\n2. Step-by-step hints to reach the solution\n3. Common mistakes to avoid\n4. Visual explanation (describe in words)\n5. Final solution approach\n6. Python code\n7. Complexity analysis`;

        // Call Gemini API
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ guide: text });
    } catch (error) {
        console.error("Error generating AI guide:", error);
        res.status(500).json({ message: "Failed to generate AI guide" });
    }
};

const generateLearningPath = async (req, res) => {
    try {
        const { topic, level, goal } = req.params


        // Prompt for Gemini API
        const prompt = `You are an data structure and algorithms expert. Write a detailed learning path for the ${topic}.\n and goal is ${goal}\n the level is ${level}`;

        // Call Gemini API
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // console.log(text)

        res.status(200).json({ geminiData: text });
    } catch (error) {
        console.error("Error generating editorial:", error);
        res.status(500).json({ message: "Failed to generate editorial" });
    }
};

// Handler for Editorial
const handleEditorial = async (req, res) => {
    try {
        // const problemId = parseInt(req.params.problemId);
        const problems = require('../assest/problems.json');
        const id = parseInt(problemId, 10);
        const problem = problems.find(p => p.id === problemId);
        if (!problem) {
            // const problem = problems.find(p => p.id === id);
            return res.status(404).json({ message: "Problem not found" });
        }

        // Prompt for Gemini API
        const prompt = `You are an expert competitive programmer. Write a detailed editorial for the following problem.\n\nTitle: ${problem.title}\nDescription: ${problem.description}\nConstraints: ${problem.constraints}\nInput Format: ${problem.inputFormat}\nOutput Format: ${problem.outputFormat}\nExamples: ${problem.example.map(e => `Input: ${e.input} Output: ${e.output}`).join(' | ')}\n\nEditorial should include: 1. Problem analysis, 2. Step-by-step solution approach, 3. Code snippets (in Python), 4. Edge cases, 5. Complexity analysis.`;

        // Call Gemini API
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ editorial: text });
    } catch (error) {
        console.error("Error generating editorial:", error);
        res.status(500).json({ message: "Failed to generate editorial" });
    }
};

// Export all handlers. `chatWithGemini` was assigned to `exports.chatWithGemini` above,
// so reference it here to ensure it's included when the module is required.
module.exports = {
    chatWithGemini: exports.chatWithGemini,
    generateLearningPath,
    handleLearn,
    handleEditorial
};