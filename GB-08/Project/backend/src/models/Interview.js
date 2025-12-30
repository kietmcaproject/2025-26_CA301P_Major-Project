import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    //  Reference to the user who created the interview
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    //  Basic Details
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
    },
    role: {
      type: String,
      required: [true, "Role/Position is required"],
      trim: true,
    },
    date: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      trim: true,
    },

    // 💼 Status: draft, interviewing, completed, offer, rejected
    status: {
      type: String,
      enum: ["draft", "pending", "interviewing", "offer", "rejected", "completed"],
      default: "draft",
    },

    // 💰 Optional salary
    salary: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Simple pattern for numbers or salary strings
          return !v || /^[0-9,.\-\sa-zA-Z]+$/.test(v);
        },
        message: "Invalid salary format",
      },
    },

    // 🤝 HR Contact Information
    hr: {
      name: { type: String, trim: true },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Invalid HR email address"],
      },
      phone: {
        type: String,
        trim: true,
        match: [/^\d{10}$/, "Phone number must be 10 digits"],
      },
    },

    // 📝 Feedback Section
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"],
    },
    nextSteps: {
      type: String,
      trim: true,
      maxlength: [1000, "Next Steps cannot exceed 1000 characters"],
    },

    // 🔗 Relation to rounds (each round may have multiple questions)
    rounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Round",
      },
    ],

    // 🕒 Flags for draft & completion
    isDraft: {
      type: Boolean,
      default: true,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate entries for same company + role + date per user
interviewSchema.index(
  { user: 1, company: 1, role: 1, date: 1 },
  { unique: true, partialFilterExpression: { date: { $type: "date" } } }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
