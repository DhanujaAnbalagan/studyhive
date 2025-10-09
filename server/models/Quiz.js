const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answerIndex: Number,
  explanation: String,
});

const quizSchema = new mongoose.Schema(
  {
    setTitle: { type: String, required: true },
    subject: { type: String, required: true },
    difficulty: { type: String, default: "Medium" },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
