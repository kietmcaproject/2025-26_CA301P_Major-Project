const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  problemID: Number,
  email: String,
  language: String,
  code: String,
});

module.exports = mongoose.model("Submission", submissionSchema);