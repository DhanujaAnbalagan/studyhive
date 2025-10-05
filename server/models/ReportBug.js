const mongoose = require("mongoose");

const reportBugSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // optional: if non-logged users can report
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  issueType: {
    type: String,
    enum: [
      "Bug / Error",
      "Feature Request",
      "UI/UX Problem",
      "Performance Issue",
      "Security Concern",
      "Other"
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  stepsToReproduce: {
    type: String,
    trim: true,
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Low",
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open",
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
},
  {
    timestamps: true,
    collection: "bugs_transaction"
  });

module.exports = mongoose.model("ReportBug", reportBugSchema);
