import express from "express";
import {
  createInterview,
  updateInterview,
  deleteInterview,
  getUserInterviews,
  getInterviewById,
  //saveInterviewAsDraft,
   submitInterview,
} from "../controllers/interview.js"
import { getAISuggestions } from "../controllers/interviewAI.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ All routes are protected (user must be logged in)
router.use(protect);

/**
 * @route   POST /api/interviews
 * @desc    Create a new interview (either draft or final)
 * @access  Private
 */
router.post("/", createInterview);

/**
 * @route   GET /api/interviews
 * @desc    Get all interviews of logged-in user
 * @access  Private
 */
router.get("/", getUserInterviews);

/**
 * @route   PATCH /api/interviews/:id/submit
 * @desc    Submit final interview details
 * @access  Private
 * NOTE: Must be before /:id route to avoid route conflicts
 */
router.patch("/:id/submit", submitInterview);

/**
 * @route   GET /api/interviews/:id
 * @desc    Get single interview details by ID
 * @access  Private
 */
router.get("/:id", getInterviewById);

/**
 * @route   PUT /api/interviews/:id
 * @desc    Update interview details
 * @access  Private
 */
router.put("/:id", updateInterview);

/**
 * @route   POST /api/interviews/:id/ai-suggestions
 * @desc    Get AI-powered interview improvement suggestions
 * @access  Private
 */
router.post("/:id/ai-suggestions", getAISuggestions);

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Delete interview and all related data (rounds/questions)
 * @access  Private
 */
router.delete("/:id", deleteInterview);

export default router;
