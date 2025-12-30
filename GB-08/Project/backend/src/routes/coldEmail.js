import express from "express";
import { uploadResume } from "../middleware/upload.js";
import {
  parseResume,
  extractJD,
  generateEmail,
  sendEmail,
} from "../controllers/coldEmail.js";

const router = express.Router();

// Parse resume file
router.post("/parse-resume", uploadResume.single("resume"), parseResume);

// Extract job description from URL
router.post("/extract-jd", extractJD);

// Generate cold email
router.post("/generate-email", generateEmail);

// Send email with optional resume attachment
router.post("/send-email", uploadResume.single("resume"), sendEmail);

export default router;

