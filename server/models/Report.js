const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    reason: { type: String, required: true },
    details: { type: String },
    categories: [String], // multi-choice selections
    reporterName: { type: String },
    reporterEmail: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
