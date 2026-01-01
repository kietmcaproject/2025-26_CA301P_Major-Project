import DonationSchedule from "../models/DonationSchedule.js";
import Request from "../models/Request.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import { sendEmail } from "../utils/email.js";

/* ---------------------------------------------
   1️⃣ DONOR CREATES DONATION SCHEDULE
----------------------------------------------*/
export const scheduleDonation = async (req, res) => {
  try {
    const { donorId, requestId, donorLocation, contact, date, time, notes } = req.body;

    if (!donorId || !requestId || !donorLocation || !contact || !date || !time) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const schedule = await DonationSchedule.create({
      donorId,
      requestId,
      donorLocation,
      contact,
      date,
      time,
      notes,
      status: "pending",
      hospitalResponse: "none"
    });

    const donor = await User.findById(donorId);
    const request = await Request.findById(requestId);

    const hospitalUser = await User.findOne({ fullName: request.hospital });

    // Format donor location HTML
    const donorLocationHtml = donor && donor.location ? `
      <div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #FF6B6B;">
        <p><strong>🩸 Donor Location:</strong></p>
        ${donor.address ? `<p><strong>Address:</strong> ${donor.address}</p>` : ""}
        ${donor.location.latitude && donor.location.longitude ? `
          <p><strong>Coordinates:</strong> ${donor.location.latitude.toFixed(4)}, ${donor.location.longitude.toFixed(4)}</p>
          <p><a href="https://maps.google.com/?q=${donor.location.latitude},${donor.location.longitude}" style="color: #FF6B6B; text-decoration: none;">
            📍 View on Google Maps
          </a></p>
        ` : ""}
      </div>
    ` : "";

    // Format hospital location HTML
    const hospitalLocationHtml = hospitalUser && hospitalUser.location ? `
      <div style="background-color: #f0f8ff; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #4A90E2;">
        <p><strong>🏥 Hospital Location:</strong></p>
        ${hospitalUser.address ? `<p><strong>Address:</strong> ${hospitalUser.address}</p>` : ""}
        ${hospitalUser.phone ? `<p><strong>Phone:</strong> ${hospitalUser.phone}</p>` : ""}
        ${hospitalUser.location.latitude && hospitalUser.location.longitude ? `
          <p><strong>Coordinates:</strong> ${hospitalUser.location.latitude.toFixed(4)}, ${hospitalUser.location.longitude.toFixed(4)}</p>
          <p><a href="https://maps.google.com/?q=${hospitalUser.location.latitude},${hospitalUser.location.longitude}" style="color: #4A90E2; text-decoration: none;">
            📍 View on Google Maps
          </a></p>
        ` : ""}
      </div>
    ` : "";

    /* EMAIL TO DONOR */
    await sendEmail(
      donor.email,
      "Blood Donation Schedule Confirmation",
      `
      <h2>❤️ Donation Successfully Scheduled</h2>
      <p>Hello <b>${donor.fullName}</b>,</p>
      <p>Your donation schedule:</p>
      <ul>
        <li><b>Date:</b> ${date}</li>
        <li><b>Time:</b> ${time}</li>
        <li><b>Hospital:</b> ${request.hospital}</li>
        <li><b>Contact:</b> ${contact}</li>
      </ul>
      
      ${donorLocationHtml}
      ${hospitalLocationHtml}
      
      <p>Please arrive 10-15 minutes early. Thank you for saving lives! 🦸‍♂️</p>
      `
    );

    /* EMAIL TO HOSPITAL */
    if (hospitalUser) {
      await sendEmail(
        hospitalUser.email,
        "New Donor Scheduled a Donation",
        `
        <h2>🩸 New Donation Schedule</h2>
        <p>A donor has offered to donate blood.</p>
        <ul>
          <li>Donor: <b>${donor.fullName}</b></li>
          <li>Date: <b>${date}</b></li>
          <li>Time: <b>${time}</b></li>
          <li>Contact: <b>${contact}</b></li>
          <li>Blood Type: <b>${request.bloodType}</b></li>
          <li>Units Needed: <b>${request.unitsNeeded}</b></li>
        </ul>
        
        ${donorLocationHtml}
        ${hospitalLocationHtml}
        
        <p>Please confirm or reject this schedule from your dashboard.</p>
        `
      );
    }

    // SOCKET NOTIFICATION
    const io = req.app.locals.io;
    if (io && hospitalUser) {
      io.to(hospitalUser._id.toString()).emit("new_schedule", {
        scheduleId: schedule._id,
        donorName: donor.fullName,
        date,
        time,
        contact,
      });
    }

    return res.json({ success: true, schedule });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ---------------------------------------------
   2️⃣ HOSPITAL ACCEPT / REJECT SCHEDULE
----------------------------------------------*/
export const updateScheduleStatus = async (req, res) => {
  try {
    const { scheduleId, action } = req.body; 

    const schedule = await DonationSchedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    schedule.hospitalResponse = action;
    schedule.status = action === "accepted" ? "accepted" : "rejected";
    await schedule.save();

    // Fetch donor and request for location info
    const donor = await User.findById(schedule.donorId);
    const request = await Request.findById(schedule.requestId);
    const hospital = await User.findOne({ fullName: request.hospital });

    // Format hospital location HTML
    const hospitalLocationHtml = hospital && hospital.location ? `
      <div style="background-color: #f0f8ff; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #4A90E2;">
        <p><strong>🏥 Hospital Location:</strong></p>
        ${hospital.address ? `<p><strong>Address:</strong> ${hospital.address}</p>` : ""}
        ${hospital.phone ? `<p><strong>Phone:</strong> ${hospital.phone}</p>` : ""}
        ${hospital.location.latitude && hospital.location.longitude ? `
          <p><strong>Coordinates:</strong> ${hospital.location.latitude.toFixed(4)}, ${hospital.location.longitude.toFixed(4)}</p>
          <p><a href="https://maps.google.com/?q=${hospital.location.latitude},${hospital.location.longitude}" style="color: #4A90E2; text-decoration: none;">
            📍 View on Google Maps
          </a></p>
        ` : ""}
      </div>
    ` : "";

    /* -------------------------
       🔴 SOCKET TO DONOR ONLY
    -------------------------- */
    const io = req.app.locals.io;
    if (io) {
      io.to(schedule.donorId.toString()).emit("schedule_status_updated", {
        scheduleId,
        status: schedule.status,
      });
    }

    // Send email update with location info
    let emailContent = "";
    if (action === "accepted") {
      emailContent = `
        <h2>✅ Donation Schedule Accepted</h2>
        <p>Great news! The hospital has accepted your donation schedule.</p>
        <p>Your donation details:</p>
        <ul>
          <li><b>Date:</b> ${schedule.date}</li>
          <li><b>Time:</b> ${schedule.time}</li>
          <li><b>Hospital:</b> ${request.hospital}</li>
        </ul>
        ${hospitalLocationHtml}
        <p>Please arrive 10-15 minutes early. Thank you for your contribution! 🦸‍♂️</p>
      `;
    } else {
      emailContent = `
        <h2>❌ Donation Schedule Rejected</h2>
        <p>Unfortunately, the hospital has rejected your donation schedule.</p>
        <p>Please try scheduling another time or contact the hospital directly.</p>
        ${hospitalLocationHtml}
      `;
    }

    await sendEmail(
      donor.email,
      `Donation Schedule ${action === "accepted" ? "Accepted" : "Rejected"}`,
      emailContent
    );

    return res.json({ success: true, schedule });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



/* ---------------------------------------------
   3️⃣ HOSPITAL MARKS DONATION COMPLETED
----------------------------------------------*/
export const markDonationCompleted = async (req, res) => {
  try {
    const { scheduleId } = req.body;

    const schedule = await DonationSchedule.findById(scheduleId).populate("requestId");
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    schedule.status = "completed";
    await schedule.save();

    await Donation.create({
      donorId: schedule.donorId,
      units: schedule.requestId.unitsNeeded,
      location: schedule.donorLocation,
      date: new Date(),
    });

    // Update donor with new perk
    const donor = await User.findById(schedule.donorId);
    if (donor) {
      // Add perk for successful donation
      const benefitDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Valid for 7 days

      const newPerk = {
        type: "health_checkup",
        title: "Free Health Checkup",
        description: "Complimentary blood test, BP and sugar test at any hospital partner",
        benefitDate: benefitDate,
        expiryDate: expiryDate,
        status: "available",
        donationDate: new Date(),
        claimedAt: null
      };

      if (!donor.perks) donor.perks = [];
      donor.perks.push(newPerk);
      
      // Update donation count and last checkup eligibility
      donor.totalDonations = (donor.totalDonations || 0) + 1;
      donor.lastHealthCheckupDate = new Date();

      await donor.save();
    }

    const request = await Request.findById(schedule.requestId._id);
    request.status = "Fulfilled";
    await request.save();

    // Broadcast request fulfilled status to all dashboards
    const io = req.app.locals.io;
    if (io) {
      io.emit("request_fulfilled", {
        requestId: request._id,
        status: "Fulfilled",
        donorId: schedule.donorId,
        bloodType: request.bloodType,
        unitsNeeded: request.unitsNeeded,
        hospital: request.hospital,
      });
    }

    return res.json({ success: true, message: "Donation completed", schedule });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* ---------------------------------------------
   4️⃣ GET SCHEDULES FOR A HOSPITAL
----------------------------------------------*/
export const getHospitalSchedules = async (req, res) => {
  try {
    const { hospital } = req.params;

    const schedules = await DonationSchedule.find()
      .populate("donorId", "fullName email")
      .populate("requestId");

    // Filter schedules for only this hospital
    const filtered = schedules.filter(s => s.requestId?.hospital === hospital);

    return res.json({ success: true, schedules: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* -----------------------------------------------
   GET DONOR SCHEDULES
   GET /schedule/donor/:donorId
-----------------------------------------------*/
export const getDonorSchedules = async (req, res) => {
  try {
    const { donorId } = req.params;

    if (!donorId) {
      return res.status(400).json({ success: false, message: "Donor ID is required" });
    }

    const schedules = await DonationSchedule.find({ donorId })
      .populate("requestId");

    return res.json({ success: true, schedules: schedules || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
