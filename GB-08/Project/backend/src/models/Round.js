import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: [true, "Interview reference is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    roundName: {
      type: String,
      required: [true, "Round name is required"],
      trim: true,
      maxlength: [100, "Round name cannot exceed 100 characters"],
    },

    roundNumber: {
      type: Number,
      min: [1, "Round number must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Round number must be an integer",
      },
    },

    interviewerName: {
      type: String,
      trim: true,
      maxlength: [100, "Interviewer name cannot exceed 100 characters"],
    },

    date: {
      type: Date,
      default: Date.now,
    },

    duration: {
      type: String,
      trim: true,
      maxlength: [20, "Duration should be short (e.g., 45 min, 1 hr)"],
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: [500, "Feedback cannot exceed 500 characters"],
    },

    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Round = mongoose.model("Round", roundSchema);
export default Round;
