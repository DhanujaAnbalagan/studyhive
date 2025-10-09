const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    user_id: { type: String, default: "" }, // optional owner reference
    group_name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: { type: String, trim: true },
    max_members: { type: Number, default: 0 },
    privacy_type: { type: String, enum: ["Public", "Private"], default: "Public" },
    members: [{ type: String }], // array of user IDs or emails
  },
  { timestamps: true,
    collection: "groups_master",
   }
);

module.exports = mongoose.model("Group", groupSchema);
