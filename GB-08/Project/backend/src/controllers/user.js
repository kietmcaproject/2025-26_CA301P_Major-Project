import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// 📝 Register new user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({
        message: "User already exists",
        errors: { email: "Email is already registered" },
      });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user and include password explicitly
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        errors: { email: "No account found with this email" },
      });
    }

    // 2️⃣ Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        errors: { password: "Incorrect password" },
      });
    }

    // 3️⃣ Generate JWT token
    const token = generateToken(user._id);

    // 4️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set to true in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: 'localhost'
    });

    // 5️⃣ Send response
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
 
      },
      token,
    });
  } catch (error) {
    return next(error);
  }
};

// 🚪 Logout user
export const logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

// GET LOGGED-IN USER DETAILS
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    console.log("user from request ", req.user )
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

