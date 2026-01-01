import express from "express";
import {
  scheduleDonation,
  updateScheduleStatus,
  markDonationCompleted,
  getDonorSchedules
} from "../controllers/scheduleController.js";

const router = express.Router();

// Donor creates schedule
router.post("/create", scheduleDonation);

// Hospital accepts/rejects
router.post("/update-status", updateScheduleStatus);

// Mark donation completed
router.post("/complete", markDonationCompleted);

// Get donor schedules
router.get("/donor/:donorId", getDonorSchedules);

export default router;
