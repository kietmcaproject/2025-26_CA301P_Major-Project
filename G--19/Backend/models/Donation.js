import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hospital: {
      type: String,
      required: true,
      trim: true,
    },

    units: {
      type: Number,
      required: true,
      min: 1,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Completed", "Pending", "Cancelled"],
      default: "Completed",
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Index for fast history lookups
donationSchema.index({ donorId: 1 });

export default mongoose.model("Donation", donationSchema);
