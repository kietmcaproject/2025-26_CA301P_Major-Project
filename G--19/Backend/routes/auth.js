import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get user profile (optional, used after login)
router.get("/me", getUser);

// Update profile (simple endpoint)
router.post("/update-profile", updateProfile);

export default router;
