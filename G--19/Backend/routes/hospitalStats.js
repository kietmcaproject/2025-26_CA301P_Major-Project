import express from "express";
import User from "../models/User.js";
import Request from "../models/Request.js";
import DonationSchedule from "../models/DonationSchedule.js";

const router = express.Router();

/* ---------------------------------------------------
    GET REAL ACTIVE DONORS + AVG MATCH TIME
----------------------------------------------------*/
router.get("/stats", async (req, res) => {
  try {
    /* ------------------------------
       1️⃣ ACTIVE DONORS NEARBY
    -------------------------------*/

    // donors who have available = true AND have a location set
    const activeDonors = await User.countDocuments({
      role: "donor",
      available: true,
      "location.latitude": { $exists: true },
      "location.longitude": { $exists: true }
    });

    /* ------------------------------
       2️⃣ AVERAGE MATCH TIME
       request.createdAt → first schedule.date 
       Formula: minutes difference
    -------------------------------*/

    const schedules = await DonationSchedule.find().populate("requestId");

    let totalMinutes = 0;
    let count = 0;

    schedules.forEach((s) => {
      if (!s.requestId) return;

      const created = new Date(s.requestId.createdAt);
      const matched = new Date(s.createdAt);

      const diffMin = Math.floor((matched - created) / 1000 / 60);

      if (diffMin >= 0) {
        totalMinutes += diffMin;
        count++;
      }
    });

    const avgMatchTime = count > 0 ? Math.floor(totalMinutes / count) : 0;

    return res.json({
      success: true,
      donorsNearby: activeDonors,
      avgMatchTime,
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
