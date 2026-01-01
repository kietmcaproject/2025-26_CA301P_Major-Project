import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

// Send email function
export const sendEmail = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: `Pulse Bank 🩸 <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message,
    });

    console.log("📩 Email Sent To:", to);
    return true;
  } catch (error) {
    console.log("❌ Email Error:", error.message);
    return false;
  }
};

// Format location information for email
export const formatLocationForEmail = (location, name = "Location") => {
  if (!location) return "";
  
  const { latitude, longitude, address } = location;
  
  if (!latitude || !longitude) {
    if (address) {
      return `
        <p><strong>${name}:</strong></p>
        <p>${address}</p>
      `;
    }
    return "";
  }
  
  const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  const appleMapsLink = `maps://maps.apple.com/?q=${latitude},${longitude}`;
  
  return `
    <p><strong>${name}:</strong></p>
    <p>${address || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</p>
    <p style="margin-top: 8px;">
      <a href="${googleMapsLink}" style="color: #FF6B6B; text-decoration: none; margin-right: 10px;">📍 View on Google Maps</a>
      <a href="${appleMapsLink}" style="color: #FF6B6B; text-decoration: none;">📍 View on Apple Maps</a>
    </p>
  `;
};

// Format donor location for email
export const formatDonorLocation = (donor) => {
  if (!donor) return "";
  
  const { fullName, location, address } = donor;
  
  if (!location || (!location.latitude && !location.longitude && !address)) {
    return "";
  }
  
  return `
    <div style="background-color: #fff5f5; padding: 12px; border-left: 4px solid #FF6B6B; margin: 10px 0; border-radius: 4px;">
      <p><strong>🩸 Donor Location:</strong></p>
      <p><strong>Name:</strong> ${fullName}</p>
      ${address ? `<p><strong>Address:</strong> ${address}</p>` : ""}
      ${location.latitude && location.longitude ? `
        <p><strong>Coordinates:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
        <p style="margin-top: 8px;">
          <a href="https://maps.google.com/?q=${location.latitude},${location.longitude}" style="color: #FF6B6B; text-decoration: none;">📍 View on Google Maps</a>
        </p>
      ` : ""}
    </div>
  `;
};

// Format hospital location for email
export const formatHospitalLocation = (hospital) => {
  if (!hospital) return "";
  
  const { fullName, location, address, phone } = hospital;
  
  if (!location || (!location.latitude && !location.longitude && !address)) {
    return "";
  }
  
  return `
    <div style="background-color: #f0f8ff; padding: 12px; border-left: 4px solid #4A90E2; margin: 10px 0; border-radius: 4px;">
      <p><strong>🏥 Hospital Location:</strong></p>
      <p><strong>Name:</strong> ${fullName}</p>
      ${address ? `<p><strong>Address:</strong> ${address}</p>` : ""}
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      ${location.latitude && location.longitude ? `
        <p><strong>Coordinates:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
        <p style="margin-top: 8px;">
          <a href="https://maps.google.com/?q=${location.latitude},${location.longitude}" style="color: #4A90E2; text-decoration: none;">📍 View on Google Maps</a>
        </p>
      ` : ""}
    </div>
  `;
};

// Format recipient location for email
export const formatRecipientLocation = (recipient) => {
  if (!recipient) return "";
  
  const { fullName, location, address } = recipient;
  
  if (!location || (!location.latitude && !location.longitude && !address)) {
    return "";
  }
  
  return `
    <div style="background-color: #f0fff4; padding: 12px; border-left: 4px solid #48BB78; margin: 10px 0; border-radius: 4px;">
      <p><strong>👤 Recipient Location:</strong></p>
      <p><strong>Name:</strong> ${fullName}</p>
      ${address ? `<p><strong>Address:</strong> ${address}</p>` : ""}
      ${location.latitude && location.longitude ? `
        <p><strong>Coordinates:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
        <p style="margin-top: 8px;">
          <a href="https://maps.google.com/?q=${location.latitude},${location.longitude}" style="color: #48BB78; text-decoration: none;">📍 View on Google Maps</a>
        </p>
      ` : ""}
    </div>
  `;
};
