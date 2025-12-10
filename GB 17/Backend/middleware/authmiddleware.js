const jwt = require("jsonwebtoken");
const secret = "mdkdfjdhfkjhd@#$%&safh8840505312@!$%#^&*";

const authMiddleware = (req, res, next) => {
  // Option 1: Get token from Authorization header but it is not in my project I am using cookie based auth
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Option 2: Get token from cookie if no auth header
  if (!token && req.cookies?.authToken) {
    token = req.cookies.authToken;
  }

  // If still no token → reject
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach decoded token payload to request
    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token: Malformed" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid token: Expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
