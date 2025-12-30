import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: [true, "Each question must belong to a round"],
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    topics: {
      type: [String],
      default: [],
      validate: {
        validator: function (topics) {
          return topics.every((t) => typeof t === "string" && t.trim().length > 0);
        },
        message: "Topics must be an array of non-empty strings",
      },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      // default should match enum values (lowercase)
      default: "medium",
    },
    userAnswer: {
      type: String,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "CreatedBy (user ID) is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Optional index for better query performance
questionSchema.index({ round: 1, difficulty: 1 });

const Question = mongoose.model("Question", questionSchema);

export default Question;
