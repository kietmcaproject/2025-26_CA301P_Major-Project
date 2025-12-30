import { parseFileBuffer } from "../utils/fileParser.js";
import { openAIResumeService } from "../services/openAIResumeService.js";
import { grokResumeService } from "../services/grokResumeService.js";

// Prefer OpenAI by default. Grok is only used when explicitly enabled via USE_GROK='true'.
// This keeps all Grok code in the repo but ensures we default to OpenAI so the
// existing frontend behavior that expects OpenAI-like responses continues to work.
const useGrok = process.env.USE_GROK === 'true';
if (useGrok) {
  console.log('Using Grok/Groq service for resume analysis (opt-in).');
} else {
  console.log('Using OpenAI service for resume analysis (default).');
}

const service = useGrok ? grokResumeService : openAIResumeService;
console.log('Selected resume analysis service:', useGrok ? 'Grok/Groq (grokResumeService)' : 'OpenAI (openAIResumeService)');

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
      const mime = req.file?.mimetype;
      text = await parseFileBuffer(buffer, mime);
    }

  const suggestions = await service.generateResumeSuggestions(text);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to analyze resume" 
    });
  }
};

// Using the same function name as used in the route
export const analyzeResumeWithJD = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    const { text: resumeText, jobDescription } = req.body;

    if ((!buffer && !resumeText) || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Please provide both resume (file or text) and job description"
      });
    }

    let text = resumeText;
    if (buffer) {
      const mime = req.file?.mimetype;
      text = await parseFileBuffer(buffer, mime);
    }

  // Using analyzeResumeAgainstJD from the selected service (Grok or OpenAI)
  const analysis = await service.analyzeResumeAgainstJD(text, jobDescription);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Resume-JD analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze resume against job description"
    });
  }
};

export const parseResume = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const mimeType = req.file.mimetype;
    let text = await parseFileBuffer(buffer, mimeType);

    // Post-process and format extracted text for display in textarea
    if (text && typeof text === 'string') {
      // Normalize bullet characters and spacing
      text = text
        .replace(/[\u2022\u25CF\u25A0\-]+\s*/g, '• ') // normalize various bullets/dashes to a single bullet
        .replace(/\s+\n/g, '\n')                        // trim trailing spaces before newlines
        .replace(/\n{3,}/g, '\n\n')                     // collapse excessive blank lines
        .replace(/[ \t]{2,}/g, ' ')                       // collapse multiple spaces/tabs
        .replace(/\s+$/gm, '')                            // trim end-of-line spaces
        .trim();

      // Ensure section breaks are visible (add an extra newline after common headings)
      const sectionHeadings = [
        'Education', 'Experience', 'Work Experience', 'Projects', 'Publications', 'Research', 'Skills', 'Certifications', 'Achievements', 'Awards', 'Summary', 'Profile'
      ];
      for (const h of sectionHeadings) {
        const re = new RegExp(`(^|\n)\s*${h}\s*:?\s*(\n|$)`, 'gi');
        text = text.replace(re, (m, p1) => `${p1}${h.toUpperCase()}\n`);
      }
    }

    // Extract simple contact basics
    const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/)?.[0] || null;
    const phone = text.match(/\+?\d[\d\s\-()]{8,}\d/)?.[0] || null;

    res.json({ success: true, resumeText: text, basicInfo: { email, phone } });
  } catch (error) {
    console.error('Parse resume error:', error);
    res.status(500).json({ success: false, error: 'Failed to parse resume' });
  }
};
