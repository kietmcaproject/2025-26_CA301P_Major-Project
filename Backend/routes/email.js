import express from "express";
import { 
  sendEmail,
  formatDonorLocation,
  formatHospitalLocation,
  formatRecipientLocation 
} from "../utils/email.js";
import User from "../models/User.js";
import Request from "../models/Request.js";

const router = express.Router();

/**
 * POST /email/send-donation-scheduled
 * Send emails to hospital, donor, and recipient when a donor schedules a donation
 */
router.post("/send-donation-scheduled", async (req, res) => {
  try {
    const {
      requestId,
      donorId,
      donorName,
      donorEmail,
      hospital,
      bloodType,
      units,
      recipientName,
      recipientEmail,
      isRecipientRequest,
    } = req.body;

    // Get request details for more info
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Get donor details
    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Get recipient/patient details (if recipient request)
    let recipientUser = null;
    if (isRecipientRequest && request.requestedBy) {
      recipientUser = await User.findById(request.requestedBy);
    }

    const emailsSent = [];

    // 1. Send email to DONOR
    const donorEmailBody = `
      <h2>🩸 Blood Donation Scheduled</h2>
      <p>Hi ${donorName},</p>
      <p>Thank you for confirming your blood donation!</p>
      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Request Details:</strong></p>
        <p>Blood Type: <strong>${bloodType}</strong></p>
        <p>Units Needed: <strong>${units}</strong></p>
        <p>Hospital: <strong>${hospital || "Not specified"}</strong></p>
      </div>
      
      ${request.location ? `
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4A90E2;">
          <p><strong>🏥 Hospital Location:</strong></p>
          <p>${request.location.latitude && request.location.longitude ? 
            `<a href="https://maps.google.com/?q=${request.location.latitude},${request.location.longitude}" style="color: #4A90E2; text-decoration: none;">
              📍 ${request.location.latitude.toFixed(4)}, ${request.location.longitude.toFixed(4)} - View on Maps
            </a>` 
            : 'Location available'}
          </p>
        </div>
      ` : ""}
      
      <p>Please proceed to complete your donation scheduling on the PulseBank dashboard.</p>
      <p>Your contribution saves lives. Thank you for being a hero! 🦸‍♂️</p>
      <p>Best regards,<br>PulseBank Team</p>
    `;

    try {
      await sendEmail(
        donorEmail,
        "Blood Donation Scheduled - PulseBank",
        donorEmailBody
      );
      emailsSent.push(`Donor email sent to ${donorEmail}`);
    } catch (err) {
      console.error("Error sending donor email:", err);
    }

    // 2. Send email to RECIPIENT (if recipient request)
    if (isRecipientRequest && recipientUser && recipientUser.email) {
      const donorLocationHtml = donor && donor.location ? `
        <div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #FF6B6B;">
          <p><strong>🩸 Donor Location:</strong></p>
          ${donor.address ? `<p>${donor.address}</p>` : ""}
          ${donor.location.latitude && donor.location.longitude ? `
            <p><a href="https://maps.google.com/?q=${donor.location.latitude},${donor.location.longitude}" style="color: #FF6B6B; text-decoration: none;">
              📍 View Donor Location on Maps
            </a></p>
          ` : ""}
        </div>
      ` : "";
      
      const hospitalLocationHtml = request.location ? `
        <div style="background-color: #f0f8ff; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #4A90E2;">
          <p><strong>🏥 Hospital Location:</strong></p>
          ${request.location.latitude && request.location.longitude ? `
            <p><a href="https://maps.google.com/?q=${request.location.latitude},${request.location.longitude}" style="color: #4A90E2; text-decoration: none;">
              📍 View Hospital Location on Maps
            </a></p>
          ` : ""}
        </div>
      ` : "";

      const recipientEmailBody = `
        <h2>🎉 Donor Found for Your Blood Request!</h2>
        <p>Hi ${recipientUser.fullName || "Patient"},</p>
        <p>Great news! A compatible donor has confirmed to help with your blood request.</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donation Details:</strong></p>
          <p>Donor Name: <strong>${donorName}</strong></p>
          <p>Blood Type: <strong>${bloodType}</strong></p>
          <p>Units: <strong>${units}</strong></p>
          <p>Hospital: <strong>${hospital || "Not specified"}</strong></p>
        </div>
        
        ${donorLocationHtml}
        ${hospitalLocationHtml}
        
        <p>Your blood request is being processed. The hospital will contact you soon with more details.</p>
        <p>Thank you for trusting PulseBank. We're committed to helping you! 💪</p>
        <p>Best regards,<br>PulseBank Team</p>
      `;

      try {
        await sendEmail(
          recipientUser.email,
          "Donor Found for Your Blood Request - PulseBank",
          recipientEmailBody
        );
        emailsSent.push(`Recipient email sent to ${recipientUser.email}`);
      } catch (err) {
        console.error("Error sending recipient email:", err);
      }
    }

    // 3. Send email to HOSPITAL
    if (hospital) {
      // Find hospital by name
      const hospitalUser = await User.findOne({
        fullName: hospital,
        role: "hospital",
      });

      if (hospitalUser && hospitalUser.email) {
        const donorLocationHtml = donor && donor.location ? `
          <div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #FF6B6B;">
            <p><strong>🩸 Donor Location:</strong></p>
            <p><strong>Name:</strong> ${donor.fullName}</p>
            ${donor.address ? `<p><strong>Address:</strong> ${donor.address}</p>` : ""}
            ${donor.location.latitude && donor.location.longitude ? `
              <p><strong>Coordinates:</strong> ${donor.location.latitude.toFixed(4)}, ${donor.location.longitude.toFixed(4)}</p>
              <p><a href="https://maps.google.com/?q=${donor.location.latitude},${donor.location.longitude}" style="color: #FF6B6B; text-decoration: none;">
                📍 View Donor Location on Maps
              </a></p>
            ` : ""}
          </div>
        ` : "";

        const recipientLocationHtml = recipientUser && recipientUser.location ? `
          <div style="background-color: #f0fff4; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #48BB78;">
            <p><strong>👤 Recipient Location:</strong></p>
            <p><strong>Name:</strong> ${recipientUser.fullName}</p>
            ${recipientUser.address ? `<p><strong>Address:</strong> ${recipientUser.address}</p>` : ""}
            ${recipientUser.location.latitude && recipientUser.location.longitude ? `
              <p><strong>Coordinates:</strong> ${recipientUser.location.latitude.toFixed(4)}, ${recipientUser.location.longitude.toFixed(4)}</p>
              <p><a href="https://maps.google.com/?q=${recipientUser.location.latitude},${recipientUser.location.longitude}" style="color: #48BB78; text-decoration: none;">
                📍 View Recipient Location on Maps
              </a></p>
            ` : ""}
          </div>
        ` : "";

        const hospitalLocationHtml = hospitalUser && hospitalUser.location ? `
          <div style="background-color: #f0f8ff; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #4A90E2;">
            <p><strong>🏥 Hospital Location:</strong></p>
            ${hospitalUser.address ? `<p><strong>Address:</strong> ${hospitalUser.address}</p>` : ""}
            ${hospitalUser.phone ? `<p><strong>Phone:</strong> ${hospitalUser.phone}</p>` : ""}
            ${hospitalUser.location.latitude && hospitalUser.location.longitude ? `
              <p><strong>Coordinates:</strong> ${hospitalUser.location.latitude.toFixed(4)}, ${hospitalUser.location.longitude.toFixed(4)}</p>
              <p><a href="https://maps.google.com/?q=${hospitalUser.location.latitude},${hospitalUser.location.longitude}" style="color: #4A90E2; text-decoration: none;">
                📍 View Hospital Location on Maps
              </a></p>
            ` : ""}
          </div>
        ` : "";

        const hospitalEmailBody = `
          <h2>🏥 Blood Donation Confirmed</h2>
          <p>Hi ${hospital},</p>
          <p>A donor has confirmed availability for a blood donation request.</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Donation Details:</strong></p>
            <p>Donor: <strong>${donorName}</strong></p>
            <p>Donor Email: <strong>${donorEmail}</strong></p>
            <p>Blood Type: <strong>${bloodType}</strong></p>
            <p>Units Needed: <strong>${units}</strong></p>
            ${isRecipientRequest ? `<p>Recipient: <strong>${recipientName || "Not specified"}</strong></p>` : ""}
            <p>Request ID: <strong>${requestId}</strong></p>
          </div>
          
          ${donorLocationHtml}
          ${recipientLocationHtml}
          ${hospitalLocationHtml}
          
          <p>Please coordinate with the donor for donation timing and delivery arrangements.</p>
          <p>Thank you for your role in saving lives!</p>
          <p>Best regards,<br>PulseBank Team</p>
        `;

        try {
          await sendEmail(
            hospitalUser.email,
            "Blood Donation Confirmed - Action Required",
            hospitalEmailBody
          );
          emailsSent.push(`Hospital email sent to ${hospitalUser.email}`);
        } catch (err) {
          console.error("Error sending hospital email:", err);
        }
      }
    }

    res.json({
      success: true,
      message: "Notification emails sent successfully",
      emailsSent,
    });
  } catch (err) {
    console.error("Error in send-donation-scheduled:", err);
    res.status(500).json({
      message: "Error sending emails",
      error: err.message,
    });
  }
});

export default router;
