const mongoose = require('mongoose')
require('dotenv').config();

// prefer mongo_url but accept common names
const url = process.env.mongo_url || process.env.MONGO_URL || process.env.MONGO_URI;

const mongoConnection = async () => {
  try {
    const mongoUrl = process.env.mongo_url || process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("❌ MongoDB URL not found in .env file");
    }

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = mongoConnection;