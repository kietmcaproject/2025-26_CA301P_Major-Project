import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    bloodType: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
    },

    hospital: {
      type: String,
      required: true,
      trim: true,
    },

    // For recipient requests: the hospital they selected to send this request to
    destinationHospital: {
      type: String,
      default: null,
      trim: true,
    },

    urgency: {
      type: String,
      enum: ["HIGH", "MODERATE", "LOW"],
      default: "LOW",
    },

    locationKm: {
      type: Number,
      required: true,
    },
    // Optional exact coordinates for hospital location
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // Flag to indicate this request was created by a recipient (not a hospital)
    isRecipientRequest: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Pending", "Fulfilled", "Cancelled"],
      default: "Pending",
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Only if request is tied to a user
    },

    recipientName: {
      type: String,
      default: null,
    },

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // User who confirmed the request
    },

    confirmationStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected"],
      default: "Pending",
    },

    confirmationNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Sorting urgent requests faster
requestSchema.index({ urgency: 1, createdAt: -1 });

export default mongoose.model("Request", requestSchema);
