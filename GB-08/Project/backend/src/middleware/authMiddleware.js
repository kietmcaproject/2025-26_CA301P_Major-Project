import jwt from "jsonwebtoken";
import {User} from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    let token;

    // Read token from cookie or Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({ message: "Not authorized, token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded)
    req.user = await User.findById(decoded.userId).select("-password");
    console.log("re.user",req.user)
    if (!req.user)
      return res.status(404).json({ message: "User not found" });

    next();
  } catch (error) {
  console.error("Auth middleware error:", error);
  res.status(401).json({ message: "Invalid or expired token" });
}

};
