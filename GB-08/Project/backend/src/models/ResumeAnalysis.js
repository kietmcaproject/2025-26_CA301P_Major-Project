// src/models/ResumeAnalysis.js
import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  type: { type: String },
  title: { type: String },
  url: { type: String },
  provider: { type: String },
}, { _id: false });

const SkillGapSchema = new mongoose.Schema({
  skill: { type: String },
  importance: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  resources: [ResourceSchema],
}, { _id: false });

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    resumeHash: { type: String, required: true, index: true },
    resumeFilePath: { type: String }, // stored file path if uploaded
    resumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
    atsScore: { type: Number, min: 0, max: 100 },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    missingKeywords: [{ type: String }],
    suggestedBullets: [{ type: String }],
    skillGaps: [SkillGapSchema],
    provider: { type: String, default: "gemini" },
  },
  { timestamps: true }
);

const ResumeAnalysis = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);
export default ResumeAnalysis;
