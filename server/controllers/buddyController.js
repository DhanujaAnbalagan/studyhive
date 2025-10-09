const Buddy = require("../models/Buddy");

// ✅ Create a new buddy
exports.createBuddy = async (req, res) => {
  try {
    const {
      user_id,
      email,
      preferred_subjects,
      availability,
      gender_preference,
      study_date,
      time_period,
      study_mode,
    } = req.body;

    if (!email || !preferred_subjects || !availability?.length) {
      return res
        .status(400)
        .json({ message: "Email, subject, and availability are required." });
    }

    const buddy = new Buddy({
      user_id,
      email,
      preferred_subjects,
      availability,
      gender_preference,
      study_date,
      time_period,
      study_mode,
    });

    await buddy.save();
    res.status(201).json({ message: "Buddy added successfully", buddy });
  } catch (err) {
    console.error("❌ Error creating buddy:", err);
    res.status(500).json({ message: err.message || "Server error creating buddy" });
  }
};

// ✅ Get all buddies
exports.getAllBuddies = async (req, res) => {
  try {
    const buddies = await Buddy.find().sort({ createdAt: -1 });
    res.json(buddies);
  } catch (err) {
    console.error("❌ Error fetching buddies:", err);
    res.status(500).json({ message: "Server error fetching buddies" });
  }
};

// ✅ Search buddies by subject
exports.searchBuddies = async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = subject
      ? { preferred_subjects: new RegExp(subject, "i") }
      : {};
    const buddies = await Buddy.find(filter).sort({ createdAt: -1 });
    res.json(buddies);
  } catch (err) {
    console.error("❌ Error searching buddies:", err);
    res.status(500).json({ message: "Server error searching buddies" });
  }
};

// ✅ Update buddy
exports.updateBuddy = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Buddy.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Buddy not found" });
    res.json({ message: "Buddy updated successfully", buddy: updated });
  } catch (err) {
    console.error("❌ Error updating buddy:", err);
    res.status(500).json({ message: "Server error updating buddy" });
  }
};

// ✅ Delete buddy
exports.deleteBuddy = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Buddy.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Buddy not found" });
    res.json({ message: "Buddy deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting buddy:", err);
    res.status(500).json({ message: "Server error deleting buddy" });
  }
};
