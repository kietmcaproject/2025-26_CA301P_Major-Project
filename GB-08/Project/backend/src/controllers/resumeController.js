import { parseFileBuffer } from "../utils/fileParser.js";
import { generateResumeSuggestions, analyzeResumeAgainstJD } from "../services/openAIResumeService.js";

export const analyzeResume = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    const resumeText = req.body.text;

    if (!buffer && !resumeText) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide either a resume file or text content" 
      });
    }

    let text = resumeText;
    if (buffer) {
      text = await parseFileBuffer(buffer);
    }

    const suggestions = await generateResumeSuggestions(text);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to analyze resume" 
    });
  }
};

export const analyzeResumeWithJD = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    const { resumeText, jobDescription } = req.body;

    if ((!buffer && !resumeText) || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Please provide both resume (file or text) and job description"
      });
    }

    let text = resumeText;
    if (buffer) {
      text = await parseFileBuffer(buffer);
    }

    const analysis = await analyzeResumeAgainstJD(text, jobDescription);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Resume-JD analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze resume against job description"
    });
  }
};