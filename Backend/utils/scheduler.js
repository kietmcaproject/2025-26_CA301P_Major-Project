import cron from "node-cron";
import DonationSchedule from "../models/DonationSchedule.js";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { sendEmail } from "./email.js";

/**
 * Initialize donation completion scheduler
 * Checks every minute if any scheduled donations should be marked as completed
 * @param {Server} io - Socket.io instance for broadcasting updates
 */
export const initializeDonationScheduler = (io) => {
  // Run every minute to check for completed donations
  cron.schedule("* * * * *", async () => {
    try {
      // Get all pending donations with full details
      const pendingSchedules = await DonationSchedule.find({
        status: "pending",
      })
        .populate("donorId")
        .populate({
          path: "requestId",
          populate: {
            path: "requestedBy",
            select: "email name"
          }
        });

      const now = new Date();

      for (const schedule of pendingSchedules) {
        if (!schedule.date || !schedule.time) continue;

        // Parse date and time in IST
        // Format: date = "12-12-2025" (DD-MM-YYYY), time = "05:30" (HH:MM 24-hour)
        const [day, month, year] = schedule.date.split("-").map(Number);
        const [hours, minutes] = schedule.time.split(":").map(Number);

        // Create a date object in UTC, then adjust for IST (UTC+5:30)
        const scheduledDate = new Date(year, month - 1, day, hours - 5, minutes - 30);

        // Check if scheduled time has passed
        if (now >= scheduledDate) {
          console.log(`⏰ Completing donation schedule: ${schedule._id}`);

          // Update schedule status to completed
          const updatedSchedule = await DonationSchedule.findByIdAndUpdate(
            schedule._id,
            { status: "completed" },
            { new: true }
          );

          // Update associated request with successful confirmation
          if (schedule.requestId) {
            const updatedRequest = await Request.findByIdAndUpdate(
              schedule.requestId._id,
              {
                confirmationStatus: "Successful",
                status: "Fulfilled",
              },
              { new: true }
            );

            // Get donor and hospital details for email
            const donor = schedule.donorId;
            const request = schedule.requestId;
            const hospital = request.requestedBy;
            const hospitalEmail = hospital?.email;

            // Send email to donor
            if (donor?.email) {
              const donorEmailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #dc2626; margin-bottom: 20px;">✅ Donation Scheduled Successfully</h2>
                  <p>Dear <strong>${donor.fullName}</strong>,</p>
                  <p>Your blood donation has been confirmed and scheduled successfully!</p>
                  
                  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #16a34a; margin-top: 0;">Donation Details</h3>
                    <p><strong>Hospital:</strong> ${request.hospital || 'Not Specified'}</p>
                    <p><strong>Blood Type:</strong> ${request.bloodType}</p>
                    <p><strong>Units Needed:</strong> ${request.unitsNeeded}</p>
                    <p><strong>Scheduled Date:</strong> ${schedule.date}</p>
                    <p><strong>Scheduled Time:</strong> ${schedule.time}</p>
                    <p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Successful</span></p>
                  </div>
                  
                  <p>Thank you for saving lives! Your donation is crucial and will help someone in need.</p>
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    This is an automated message from Pulse Bank. Please do not reply to this email.
                  </p>
                </div>
              `;

              await sendEmail(
                donor.email,
                "✅ Donation Confirmed & Scheduled Successfully",
                donorEmailHTML
              );
            }

            // Send email to hospital
            if (hospitalEmail) {
              const hospitalEmailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #dc2626; margin-bottom: 20px;">✅ Donor Confirmed for Scheduled Donation</h2>
                  <p>Dear Hospital Administrator,</p>
                  <p>A donor has confirmed and scheduled their blood donation according to your request.</p>
                  
                  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #16a34a; margin-top: 0;">Donation Details</h3>
                    <p><strong>Donor Name:</strong> ${donor.fullName}</p>
                    <p><strong>Donor Contact:</strong> ${donor.phone || 'Not Provided'}</p>
                    <p><strong>Blood Type Requested:</strong> ${request.bloodType}</p>
                    <p><strong>Units Needed:</strong> ${request.unitsNeeded}</p>
                    <p><strong>Scheduled Date:</strong> ${schedule.date}</p>
                    <p><strong>Scheduled Time:</strong> ${schedule.time}</p>
                    <p><strong>Donation Status:</strong> <span style="color: #22c55e; font-weight: bold;">Confirmed & Scheduled</span></p>
                  </div>
                  
                  <p>The donor will arrive at the scheduled time and date. Please ensure all necessary preparations are in place.</p>
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    This is an automated message from Pulse Bank. Please do not reply to this email.
                  </p>
                </div>
              `;

              await sendEmail(
                hospitalEmail,
                "✅ Donor Confirmed for Your Blood Request",
                hospitalEmailHTML
              );
            }

            // Emit socket event to notify both dashboards
            if (io) {
              io.emit("donation_completed", {
                scheduleId: schedule._id,
                requestId: schedule.requestId._id,
                donorId: schedule.donorId._id,
                confirmationStatus: "Successful",
                status: "Fulfilled",
                completedAt: new Date(),
              });

              console.log(
                `✅ Donation completed and status updated via socket: ${schedule._id}`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in donation scheduler:", error);
    }
  });

  console.log("✅ Donation completion scheduler initialized");
};
