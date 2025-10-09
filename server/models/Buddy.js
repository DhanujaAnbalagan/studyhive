const mongoose = require("mongoose");

const buddySchema = new mongoose.Schema(
  {
    // user_id is optional for now, so you can add manually
    user_id: { type: String, default: "" },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },

    preferred_subjects: {
      type: String,
      required: [true, "Preferred subject is required"],
      trim: true,
    },

    availability: {
      type: [String],
      required: [true, "At least one availability must be selected"],
    },

    gender_preference: {
      type: String,
      enum: ["Male", "Female", "Both"],
      default: "Both",
    },

    study_date: { type: Date },
    time_period: { type: String, default: "" },
    study_mode: { type: String, enum: ["In Person", "Online", "Hybrid"], default: "Online" },
  },
  { timestamps: true,
    collection: "buddies_transcation",
   }
);

module.exports = mongoose.model("Buddy", buddySchema);
