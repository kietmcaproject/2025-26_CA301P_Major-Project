import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// =============================
// REGISTER USER
// =============================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, bloodType, role, hospitalId, location, address } = req.body;

    // Basic validation for all users
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Hospitals MUST provide location
    if (role === "hospital") {
      if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({
          success: false,
          message: "Hospital location (latitude and longitude) is required",
          required_fields: ["location.latitude", "location.longitude"]
        });
      }
    }

    // Donors MUST have bloodType
    if (role === "donor" && !bloodType) {
      return res.status(400).json({
        success: false,
        message: "Blood type is required for donors",
      });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      bloodType: role === "donor" ? bloodType : null,
      role: role || "user",
      hospitalId: role === "hospital" ? (hospitalId || null) : null,
      location: role === "hospital" ? location : undefined,
      address: role === "hospital" ? address : undefined,
    });

    // 🔥 Generate JWT after successful registration
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return token + user (Frontend requires token)
    res.json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        bloodType: user.bloodType,
        role: user.role,
        hospitalId: user.hospitalId || null,
        location: user.location || null,
        address: user.address || null,
        profileImage: user.profileImage || null,
        perks: user.perks || [],
        totalDonations: user.totalDonations || 0,
        lastHealthCheckupDate: user.lastHealthCheckupDate || null,
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// =============================
// LOGIN USER
// =============================
export const loginUser = async (req, res) => {
  try {
    const { email, password, hospitalId } = req.body;

    // Instrumentation: log incoming login attempts for debugging
    try {
      console.log(`[auth] login attempt - email=${email} ip=${req.ip} time=${new Date().toISOString()}`);
    } catch (e) {
      // ignore logging errors
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[auth] login failed - user not found for email=${email}`);
      return res.status(400).json({ success: false, message: `User not found for email: ${email}` });
    }

    // For hospital accounts: hospitalId must be provided and must match stored value
    if (user.role === "hospital") {
      if (!hospitalId) {
        console.warn(`[auth] login failed - missing hospitalId for hospital email=${email}`);
        return res.status(400).json({ success: false, message: "Hospital ID is required for hospital login" });
      }
      if (!user.hospitalId || String(user.hospitalId) !== String(hospitalId)) {
        console.warn(`[auth] login failed - hospitalId mismatch for email=${email} provided=${hospitalId} stored=${user.hospitalId}`);
        return res.status(400).json({ success: false, message: "Hospital ID does not match our records" });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[auth] login failed - incorrect password for email=${email}`);
      return res.status(400).json({ success: false, message: "Incorrect password for provided email" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        bloodType: user.bloodType,
        role: user.role,
        hospitalId: user.hospitalId || null,
        location: user.location || null,
        address: user.address || null,
        profileImage: user.profileImage || null,
        perks: user.perks || [],
        totalDonations: user.totalDonations || 0,
        lastHealthCheckupDate: user.lastHealthCheckupDate || null,
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// =============================
// GET USER PROFILE
// =============================
export const getUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// =============================
// UPDATE PROFILE (basic)
// Accepts body: { userId, fullName, email, phone, bloodType, profileImage, address }
// If `userId` is not provided, returns 400. This is a simple endpoint used by frontend profile pages.
export const updateProfile = async (req, res) => {
  try {
    const { userId, fullName, email, phone, bloodType, profileImage, address } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "userId required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (typeof bloodType !== 'undefined') user.bloodType = bloodType || null;
    if (typeof profileImage !== 'undefined') user.profileImage = profileImage;
    if (typeof address !== 'undefined') user.address = address;

    await user.save();

    const safe = user.toObject();
    delete safe.password;

    // Ensure perks array is included
    if (!safe.perks) safe.perks = [];
    if (!safe.totalDonations) safe.totalDonations = 0;
    if (!safe.lastHealthCheckupDate) safe.lastHealthCheckupDate = null;

    res.json({ success: true, message: "Profile updated", user: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
