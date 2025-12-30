import Round from "../models/Round.js";
import Interview from "../models/Interview.js";
import Question from "../models/Questions.js";

/**
 * ✅ Create a new round for a specific interview
 */
export const createRound = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id; // from auth middleware
    const { roundName, roundNumber, interviewerName, date, duration, feedback } = req.body;

    // Validate interview existence
    const interview = await Interview.findOne({ _id: interviewId, user: userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found or unauthorized access" });
    }

    // Basic validation
    if (!roundName) {
      return res.status(400).json({
        message: "Validation failed",
        errors: { name: "Round name is required" },
      });
    }

    // ✅ Create new round with feedback
    const round = await Round.create({
      interview: interviewId,
      user: userId,
      roundName,
      roundNumber,
      interviewerName,
      date,
      duration,
      feedback: feedback || "", // ✅ CRITICAL FIX: Include feedback field
      status: "draft",
    });

    // Push round into interview reference
    interview.rounds.push(round._id);
    await interview.save();

    res.status(201).json({
      message: "Round created successfully (saved as draft)",
      round,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 🧾 Get all rounds for a specific interview
 */
export const getRoundsByInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const rounds = await Round.find({ interview: interviewId, user: userId })
      .populate("questions")
      .sort({ roundNumber: 1 });

    res.status(200).json({ rounds });
  } catch (error) {
    return next(error);
  }
};

/**
 * ✏️ Update a round (partial or final)
 */
export const updateRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const round = await Round.findOne({ _id: roundId, user: userId });
    if (!round) {
      return res.status(404).json({ message: "Round not found or unauthorized" });
    }

    // Merge new data (partial update)
    Object.assign(round, updateData);

    // Optional: validate roundNumber > 0
    if (round.roundNumber && round.roundNumber < 1) {
      return res.status(400).json({ message: "Round number must be >= 1" });
    }

    await round.save();

    res.status(200).json({
      message: "Round updated successfully",
      round,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * ❌ Delete a round and its questions
 */
export const deleteRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const userId = req.user._id;

    const round = await Round.findOne({ _id: roundId, user: userId });
    if (!round) {
      return res.status(404).json({ message: "Round not found or unauthorized" });
    }

    // Delete all associated questions first
    await Question.deleteMany({ _id: { $in: round.questions } });

    // Remove reference from parent interview
    await Interview.updateOne(
      { _id: round.interview },
      { $pull: { rounds: roundId } }
    );

    await Round.findByIdAndDelete(roundId);

    res.status(200).json({ message: "Round and its questions deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

/**
 * 🔍 Get a single round (with questions)
 */
export const getRoundById = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const userId = req.user._id;

    const round = await Round.findOne({ _id: roundId, user: userId }).populate("questions");
    if (!round) {
      return res.status(404).json({ message: "Round not found or unauthorized" });
    }

    res.status(200).json({ round });
  } catch (error) {
    return next(error);
  }
};
