const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },

    // Optional controls
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    tags: [{ type: String, trim: true }],
    reminderAt: { type: Date },
    repeat: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    checklist: [checklistItemSchema],
    notes: { type: String, trim: true },
    pinned: { type: Boolean, default: false },
    color: { type: String, trim: true }, // e.g. "#8b5cf6"
  },
  {
    timestamps: true,
    collection: "tasks_transaction",
  }
);

// Helpful indexes
taskSchema.index({ userId: 1, pinned: -1, priority: 1, createdAt: -1 });
taskSchema.index({ userId: 1, tags: 1 });
taskSchema.index({ userId: 1, name: "text", notes: "text" });

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
