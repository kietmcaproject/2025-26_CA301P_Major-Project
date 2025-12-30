import express from "express";
import { registerUser, loginUser, logoutUser,getCurrentUser } from "../controllers/user.js";
import  {protect}  from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);

export default router;
