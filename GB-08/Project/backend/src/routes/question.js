import express from "express";
import {
  createQuestion,
  getQuestionsByRound,
  updateQuestion,
  deleteQuestion,
  getMyQuestions,
} from "../controllers/question.js";

// Optional: import authentication middleware (to protect routes)
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/questions
 * @desc Create a new question under a specific round
 * @access Private
 */
router.post("/", protect, createQuestion);

/**
 * @route GET /api/questions/round/:roundId
 * @desc Get all questions for a specific round
 * @access Private
 */
router.get("/round/:roundId", protect, getQuestionsByRound);

/**
 * @route GET /api/questions/my
 * @desc Get all questions created by the logged-in user
 * @access Private
 */
router.get("/my", protect, getMyQuestions);

/**
 * @route PUT /api/questions/:id
 * @desc Update a specific question
 * @access Private
 */
router.put("/:id", protect, updateQuestion);

/**
 * @route DELETE /api/questions/:id
 * @desc Delete a specific question
 * @access Private
 */
router.delete("/:id", protect, deleteQuestion);

export default router;
