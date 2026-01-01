import Request from "../models/Request.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";

/* Utility: Haversine distance (km) */
function haversineKm(lat1, lon1, lat2, lon2) {
  function toRad(x) { return (x * Math.PI) / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/* Blood compatibility simple check */
function isCompatible(requestBlood, donorBlood) {
  if (!requestBlood || !donorBlood) return false;
  if (requestBlood === donorBlood) return true;

  // Simplified compatibility table: donors -> recipients
  const compat = {
    "O-": ["A+","A-","B+","B-","AB+","AB-","O+","O-"],
    "O+": ["A+","B+","AB+","O+"],
    "A-": ["A+","A-","AB+","AB-"],
    "A+": ["A+","AB+"],
    "B-": ["B+","B-","AB+","AB-"],
    "B+": ["B+","AB+"],
    "AB-": ["AB+","AB-"],
    "AB+": ["AB+"],
  };

  const donorsReceivers = compat[donorBlood] || [];
  return donorsReceivers.includes(requestBlood);
}

// Create request and notify donors
export const addRequest = async (req, res) => {
  try {
    const { bloodType, unitsNeeded, hospital, urgency, locationKm, requestedBy, recipientName, location, isRecipientRequest } = req.body;
    if (!bloodType || !unitsNeeded || !urgency || !locationKm || !requestedBy) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const payload = {
      bloodType,
      unitsNeeded,
      hospital: hospital || null,
      urgency,
      locationKm,
      requestedBy,
      recipientName,
      isRecipientRequest: !!isRecipientRequest,
      status: "Pending",
      confirmationStatus: "Pending",
    };

    // if a precise hospital location is provided, store it
    if (location && location.latitude != null && location.longitude != null) {
      payload.location = { latitude: location.latitude, longitude: location.longitude };
    }

    const newRequest = await Request.create(payload);

    // Broadcast request_created to all dashboards for real-time updates
    const io = req.app.locals.io;
    if (io) {
      io.emit("request_created", {
        _id: newRequest._id,
        bloodType,
        unitsNeeded,
        hospital,
        urgency,
        locationKm,
        location: newRequest.location || null,
        recipientName: newRequest.recipientName || null,
        isRecipientRequest: newRequest.isRecipientRequest || false,
        status: "Pending",
        createdAt: newRequest.createdAt,
      });
    }

    // Also notify matching donors via socket.io
    const onlineMap = req.app.get("onlineMap") || new Map();

    // find available donors with blood compatibility
    const donors = await User.find({
      role: "donor",
      available: true,
      bloodType: { $exists: true, $ne: null }
    });

    // For each donor compute compatibility (only send to donors who can donate the requested blood type)
    const matches = [];
    for (const d of donors) {
      if (!d.bloodType) continue;
      if (!isCompatible(bloodType, d.bloodType)) continue;
      matches.push(d);
    }

    // Notify only donors that are online
    for (const donor of matches) {
      const socketId = onlineMap.get(donor._id.toString());
      if (socketId) {
        io.to(socketId).emit("new_request", {
          requestId: newRequest._id,
          bloodType,
          unitsNeeded,
          hospital,
          urgency,
          locationKm,
        });
      }
    }

    res.json({ success: true, message: "Blood request created successfully", request: newRequest });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Confirm or reject a request
export const confirmRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, confirmedBy, notes } = req.body;

    if (!["Confirmed", "Rejected"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action. Must be 'Confirmed' or 'Rejected'" });
    }

    const request = await Request.findByIdAndUpdate(
      requestId,
      {
        confirmationStatus: action,
        confirmedBy,
        confirmationNotes: notes || null,
      },
      { new: true }
    ).populate("requestedBy", "email name");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Broadcast confirmation update via socket.io
    const io = req.app.locals.io;
    if (io) {
      io.emit("request_confirmed", {
        _id: request._id,
        confirmationStatus: request.confirmationStatus,
        confirmedBy: request.confirmedBy,
        confirmationNotes: request.confirmationNotes,
      });
    }

    // Get donor info from confirmedBy and hospital info from request creator
    const donor = await User.findById(confirmedBy, "email fullName bloodType location address phone");
    const hospital = request.requestedBy; // Hospital is the one who created the request
    const bloodType = request.bloodType;
    const units = request.unitsNeeded;

    if (action === "Confirmed" && hospital && donor) {
      // Format location information
      const donorLocationHtml = donor && donor.location ? `
        <div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #FF6B6B;">
          <p><strong>🩸 Donor Location:</strong></p>
          <p><strong>Name:</strong> ${donor.fullName}</p>
          ${donor.address ? `<p><strong>Address:</strong> ${donor.address}</p>` : ""}
          ${donor.phone ? `<p><strong>Phone:</strong> ${donor.phone}</p>` : ""}
          ${donor.location.latitude && donor.location.longitude ? `
            <p><strong>Coordinates:</strong> ${donor.location.latitude.toFixed(4)}, ${donor.location.longitude.toFixed(4)}</p>
            <p><a href="https://maps.google.com/?q=${donor.location.latitude},${donor.location.longitude}" style="color: #FF6B6B; text-decoration: none;">
              📍 View on Google Maps
            </a></p>
          ` : ""}
        </div>
      ` : "";

      const hospitalLocationHtml = request.location ? `
        <div style="background-color: #f0f8ff; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #4A90E2;">
          <p><strong>🏥 Hospital Location:</strong></p>
          ${hospital.address ? `<p><strong>Address:</strong> ${hospital.address}</p>` : ""}
          ${hospital.phone ? `<p><strong>Phone:</strong> ${hospital.phone}</p>` : ""}
          ${request.location.latitude && request.location.longitude ? `
            <p><strong>Coordinates:</strong> ${request.location.latitude.toFixed(4)}, ${request.location.longitude.toFixed(4)}</p>
            <p><a href="https://maps.google.com/?q=${request.location.latitude},${request.location.longitude}" style="color: #4A90E2; text-decoration: none;">
              📍 View on Google Maps
            </a></p>
          ` : ""}
        </div>
      ` : "";

      // Send confirmation email to hospital
      const confirmEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #2ecc71; text-align: center;">✅ Donation Request Confirmed</h2>
          <hr style="border: none; border-top: 2px solid #e0e0e0;">
          
          <p>Dear <strong>${hospital.name}</strong>,</p>
          
          <p>Great news! A donor has confirmed their willingness to donate blood for your request.</p>
          
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2ecc71; margin: 15px 0;">
            <p><strong>Donor Details:</strong></p>
            <p>📝 Name: ${donor.fullName}</p>
            <p>📧 Email: ${donor.email}</p>
            <p>🩸 Blood Type Required: <strong>${bloodType}</strong></p>
            <p>🩸 Units Needed: <strong>${units}</strong></p>
            <p>📅 Next Step: Donor will select a convenient date and time for the donation.</p>
          </div>
          
          ${donorLocationHtml}
          ${hospitalLocationHtml}
          
          <p>Please keep an eye on your dashboard for further updates when the donor schedules their donation.</p>
          
          <hr style="border: none; border-top: 2px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message from PulseBank. Please do not reply to this email.</p>
        </div>
      `;

      await sendEmail(
        hospital.email,
        "Blood Donation Request Confirmed",
        confirmEmailHtml
      );
    } else if (action === "Rejected" && hospital && donor) {
      // Format location information
      const donorLocationHtml = donor && donor.location ? `
        <div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #FF6B6B;">
          <p><strong>🩸 Donor Location:</strong></p>
          <p><strong>Name:</strong> ${donor.fullName}</p>
          ${donor.address ? `<p><strong>Address:</strong> ${donor.address}</p>` : ""}
          ${donor.location.latitude && donor.location.longitude ? `
            <p><strong>Coordinates:</strong> ${donor.location.latitude.toFixed(4)}, ${donor.location.longitude.toFixed(4)}</p>
          ` : ""}
        </div>
      ` : "";

      // Send rejection email to hospital
      const rejectionReason = notes || "No reason provided";

      const rejectionEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #e74c3c; text-align: center;">❌ Donation Request Declined</h2>
          <hr style="border: none; border-top: 2px solid #e0e0e0;">
          
          <p>Dear <strong>${hospital.name}</strong>,</p>
          
          <p>Unfortunately, the donor has declined to proceed with the blood donation for your request.</p>
          
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #e74c3c; margin: 15px 0;">
            <p><strong>Request Details:</strong></p>
            <p>📝 Donor Name: ${donor.fullName}</p>
            <p>🩸 Blood Type: <strong>${bloodType}</strong></p>
            <p>🩸 Units Needed: <strong>${units}</strong></p>
            <p><strong>Reason for Decline:</strong> ${rejectionReason}</p>
          </div>
          
          ${donorLocationHtml}
          
          <p>Please contact other potential donors or create a new request for additional donors to respond to.</p>
          
          <hr style="border: none; border-top: 2px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message from PulseBank. Please do not reply to this email.</p>
        </div>
      `;

      await sendEmail(
        hospital.email,
        "Blood Donation Request Declined",
        rejectionEmailHtml
      );
    }

    res.json({ success: true, message: `Request ${action.toLowerCase()}`, request });
  } catch (err) {
    console.error("Error in confirmRequest:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
