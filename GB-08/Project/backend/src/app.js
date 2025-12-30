import dotenv from "dotenv";

// Load environment variables at the very beginning
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.js";
import interviewRoutes from "./routes/interview.js";
import questionRoutes from "./routes/question.js";
import roundRoutes from "./routes/round.js";
import resumeRoutes from "./routes/resume.js";
import coldEmailRoutes from "./routes/coldEmail.js";
import errorHandler from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
// import { requestLogger } from "./middleware/requestLogger.js";
const app = express();

// Define allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000'
];


// ✅ Configure CORS properly - MUST be before any routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers for all requests
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS requests - MUST return early with 200
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request received for:', req.url);
    console.log('Requested method:', req.headers['access-control-request-method']);
    // Build headers object for OPTIONS response
    const corsHeaders = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With, Origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'Set-Cookie',
      'Access-Control-Max-Age': '86400',
      'Content-Length': '0'
    };
    
    // Only set Allow-Origin if origin is in allowed list
    if (ALLOWED_ORIGINS.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }
    
    // Explicitly write headers and send 200 with no body for OPTIONS
    res.writeHead(200, corsHeaders);
    return res.end();
  }
  
  next();
});

// Additional middleware to check request origin for debugging
app.use((req, res, next) => {
  console.log('Request from origin:', req.headers.origin);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  next();
});

// ✅ Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// ✅ Debug logging
console.log("Allowed origins:", ALLOWED_ORIGINS);
console.log("Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'
});

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/rounds", roundRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/cold-email", coldEmailRoutes);
app.get("/", (req, res) => res.send("Backend running..."));

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Start the server
const PORT = process.env.PORT || 8000;

// Don't start the server if we're being imported (for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
  });
}

export default app;
