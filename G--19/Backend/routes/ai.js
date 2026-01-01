import express from "express";
import User from "../models/User.js";
import Request from "../models/Request.js";

const router = express.Router();

// Blood compatibility mapping
const compatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

// Distance formula
function calcDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 99999;

  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// AI MATCHING ENDPOINT
router.get("/match/:requestId", async (req, res) => {
  try {
    const reqId = req.params.requestId;
    const reqData = await Request.findById(reqId);

    if (!reqData) return res.json({ success: false, message: "Request not found" });

    const donors = await User.find({ role: "donor", available: true });

    // Filter by compatibility
    const compatibleDonors = donors.filter(d =>
      compatibility[reqData.bloodType].includes(d.bloodType)
    );

    // Score donors
    const hospitalLat = 28.6139; // <-- You can fetch actual hospital lat/lng later
    const hospitalLng = 77.2090;

    const scored = compatibleDonors.map(d => {
      const distance = calcDistance(
        hospitalLat,
        hospitalLng,
        d.location?.latitude,
        d.location?.longitude
      );

      return {
        donorId: d._id,
        name: d.fullName,
        bloodType: d.bloodType,
        distance,
        score: (1000 / (distance + 1)) + (reqData.urgency === "HIGH" ? 50 : 0)
      };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      bestMatches: scored.slice(0, 5) // top 5 suggestions
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
