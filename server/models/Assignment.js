const mongoose = require("mongoose");

const urlRegex =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;

const assignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },

    // NEW FIELDS (all optional)
    type: {
      type: String,
      enum: ["Homework", "Project", "Lab", "Quiz", "Exam", "Other"],
      default: "Homework",
    },
    status: {
      type: String,
      enum: ["Not started", "In progress", "Done", "Submitted"],
      default: "Not started",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    resourceLinks: {
      type: [String],
      validate: {
        validator: (arr) => arr.every((u) => urlRegex.test(u)),
        message: "One or more resource links are not valid URLs",
      },
      default: [],
    },
    groupMembers: { type: [String], default: [] }, // names/emails as you prefer
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },
    submissionUrl: {
      type: String,
      validate: {
        validator: (u) => !u || urlRegex.test(u),
        message: "submissionUrl must be a valid URL",
      },
      default: "",
    },
  },
  { timestamps: true, collection: "assignments_transaction" }
);

// quick search index
assignmentSchema.index({
  name: "text",
  subject: "text",
  tags: "text",
  type: "text",
  status: "text",
});

module.exports = mongoose.model("Assignment", assignmentSchema);
