import express from "express";
import {
  createRound,
  getRoundsByInterview,
  updateRound,
  deleteRound,
  getRoundById,
} from "../controllers/round.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ROUTES for Rounds
 * Base path suggestion: /api/rounds or /api/interview/:interviewId/rounds
 */

// ✅ Create a new round for an interview
router.post("/interview/:interviewId/round", protect, createRound);

// ✅ Get all rounds for a particular interview
router.get("/interview/:interviewId/rounds", protect, getRoundsByInterview);

// ✅ Get details of a specific round
router.get("/:roundId", protect, getRoundById);

// ✅ Update round (partial or full)
router.put("/:roundId", protect, updateRound);

// ✅ Delete round (and its questions)
router.delete("/:roundId", protect, deleteRound);

export default router;
