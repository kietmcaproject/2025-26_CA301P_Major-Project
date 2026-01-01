// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true, trim: true },
    bloodType: { type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"], default: null },
    role: { type: String, enum: ["donor","hospital","recipient","user"], default: "user" },
    // Optional hospital identifier for hospital accounts
    hospitalId: { type: String, default: null },
    available: { type: Boolean, default: false },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    // Profile image stored as base64 string
    profileImage: { type: String, default: null },
    // Address for hospital/recipient profiles
    address: { type: String, default: null },
    // Donor rewards and perks
    perks: [
      {
        type: {
          type: String,
          enum: ["health_checkup"],
          default: "health_checkup"
        },
        title: String,
        description: String,
        benefitDate: Date, // Date when perk becomes available
        expiryDate: Date, // 7 days after successful donation
        status: {
          type: String,
          enum: ["available", "used", "expired"],
          default: "available"
        },
        usedAt: Date,
        donationDate: Date, // Reference to when donation was completed
        claimedAt: String // Hospital name/ID where perk was used
      }
    ],
    lastHealthCheckupDate: Date, // Track last checkup date (90-day eligibility)
    totalDonations: { type: Number, default: 0 } // Track total donations for rewards
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
