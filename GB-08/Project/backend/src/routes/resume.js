import express from "express";
import { uploadResume } from "../middleware/upload.js";
import { analyzeResume, analyzeResumeWithJD, parseResume } from "../controllers/resume.js";
import skillResources from "./resume/skillResources.js";

const router = express.Router();

// Route for basic resume analysis
router.post("/analyze", uploadResume.single("resume"), analyzeResume);

// Route for resume analysis with job description
router.post("/analyze-with-jd", uploadResume.single("resume"), analyzeResumeWithJD);

// Route to parse uploaded resume and return text
router.post('/parse', uploadResume.single('resume'), parseResume);

// Add skill resources route
router.use('/', skillResources);

export default router;
