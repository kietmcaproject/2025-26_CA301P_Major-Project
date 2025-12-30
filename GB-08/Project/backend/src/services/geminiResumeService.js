// src/services/geminiResumeService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResumeAI(resumeText, jobDescription) {
  if (!resumeText) throw new Error("resumeText required");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
You are an ATS expert.
Compare this resume vs this job description.
Return ONLY valid JSON. No text outside JSON.

RESUME:
${resumeText}

JOB_DESCRIPTION:
${jobDescription || "Not provided"}

JSON format to return:
{
  "atsScore": number (0-100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "skillGaps": string[],
  "recommendations": string[] // short, actionable, < 12 words each
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const json = JSON.parse(text);
    return json;
  } catch (err) {
    throw new Error("Gemini returned non-JSON. " + err.message);
  }
}
