const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mode: { type: String, enum: ["work", "break"], required: true },
  duration: { type: Number, required: true }, // seconds
  startTime: Date,
  endTime: Date,
  tag: String,
  notes: String,
}, {
  timestamps: true,
  collection: 'timelogs_transaction',
});

module.exports = mongoose.model("Session", sessionSchema);
