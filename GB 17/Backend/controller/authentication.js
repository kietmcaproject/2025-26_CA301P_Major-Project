const mongoose = require("mongoose");
const signupModel = require("../models/signup");
const profile = require('../models/profile')
const bcrypt = require("bcryptjs");
const { setUser } = require("../config/token");

async function signUp(req, res) {
  try {
    const { name, email, password, agreeToTerms, subscribeNewsletter } =
      req.body;

    if (!name || !email || !password || !agreeToTerms) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const isExist = await signupModel.findOne({ email: email });

    if (isExist) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await signupModel.create({
      name,
      email,
      password: hashedPassword,
      agreeToTerms,
      subscribeNewsletter,
    });

    const userProfile = await profile.create({
      name,
      email,
    });

    await newUser.save();
    await userProfile.save();

    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser._id });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const user = await signupModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAuthentic = await bcrypt.compare(password, user.password);
    if (!isAuthentic) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Token expiration
    const expiresIn = rememberMe ? "7d" : "12h"; 
    const token = setUser(user, expiresIn);

    const isProd = process.env.NODE_ENV === "production";
    const cookieMaxAge = rememberMe
      ? 7 * 24 * 60 * 60 * 1000 // 7 days
      :12* 60 * 60 * 1000;         // 1 hour

    // Set AUTH token cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: cookieMaxAge,
    });

    res.status(200).json({ message: "Login successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function logout(req,res) {
  res.clearCookie('authToken',{path:'/'});
  res.status(200).json({message:'Logout successful'});
}


module.exports = { signUp, login, logout };
