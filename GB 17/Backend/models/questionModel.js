const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionID: Number,
  title: String,
  description: String,
  inputFormat: String,
  outputFormat: String,
  example: String,
});

module.exports = mongoose.model("Question", questionSchema);