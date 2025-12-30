import Question from "../models/Questions.js";
import Round from "../models/Round.js";
import mongoose from "mongoose";

/**
 * @desc Create a new question under a specific round
 * @route POST /api/questions
 * @access Private
 */
export const createQuestion = async (req, res, next) => {
  try {
    const { roundId, questionText, topics, difficulty, userAnswer, feedback, isPublic } = req.body;

    // ✅ Validation
    if (!roundId || !questionText) {
      const errors = {};
      if (!roundId) errors.roundId = "Round ID is required";
      if (!questionText) errors.question = "Question text is required";
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // ✅ Check if round exists
    const round = await Round.findById(roundId);
    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    // ✅ Normalize topics to array format
    let topicsArray = [];
    if (topics) {
      if (typeof topics === 'string') {
        // If it's a comma-separated string, split it
        topicsArray = topics.split(',').map(t => t.trim()).filter(t => t.length > 0);
      } else if (Array.isArray(topics)) {
        topicsArray = topics.filter(t => t && typeof t === 'string' && t.trim().length > 0);
      }
    }

    // ✅ Create question
    const question = await Question.create({
      round: roundId,
      questionText,
      topics: topicsArray,
      difficulty,
      userAnswer,
      feedback,
      isPublic,
      createdBy: req.user?._id || new mongoose.Types.ObjectId("000000000000000000000000"), // fallback for now
    });

    // ✅ CRITICAL FIX: Push question ID to round's questions array
    round.questions.push(question._id);
    await round.save();

    res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return next(error);
  }
};

/**
 * @desc Get all questions for a specific round
 * @route GET /api/questions/round/:roundId
 * @access Private
 */
export const getQuestionsByRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;

    const questions = await Question.find({ round: roundId }).sort({ createdAt: -1 });

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found for this round" });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return next(error);
  }
};

/**
 * @desc Update an existing question
 * @route PUT /api/questions/:id
 * @access Private
 */
export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Only allow the creator to update (optional: check req.user)
    Object.assign(question, updates);
    await question.save();

    res.status(200).json({ message: "Question updated successfully", question });
  } catch (error) {
    console.error("Error updating question:", error);
    return next(error);
  }
};

/**
 * @desc Delete a question
 * @route DELETE /api/questions/:id
 * @access Private
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await question.deleteOne();

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return next(error);
  }
};

/**
 * @desc Get all questions created by logged-in user
 * @route GET /api/questions/my
 * @access Private
 */
export const getMyQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ createdBy: req.user._id }).populate("round");

    if (!questions.length) {
      return res.status(404).json({ message: "You haven’t added any questions yet" });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return next(error);
  }
};
