import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

// Connect to database
connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

