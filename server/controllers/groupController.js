const Group = require("../models/Group");

// ✅ Create new study group
exports.createGroup = async (req, res) => {
  try {
    const { group_name, subject, description, max_members, privacy_type, user_id } = req.body;

    if (!group_name || !subject)
      return res.status(400).json({ message: "Group name and subject are required." });

    const group = new Group({
      user_id,
      group_name,
      subject,
      description,
      max_members,
      privacy_type,
      members: [],
    });

    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (err) {
    console.error("❌ Error creating group:", err);
    res.status(500).json({ message: err.message || "Server error creating group" });
  }
};

// ✅ Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error("❌ Error fetching groups:", err);
    res.status(500).json({ message: "Server error fetching groups" });
  }
};

// ✅ Search groups (by name, subject, description)
exports.searchGroups = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { group_name: new RegExp(q, "i") },
            { subject: new RegExp(q, "i") },
            { description: new RegExp(q, "i") },
          ],
        }
      : {};
    const groups = await Group.find(filter).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error("❌ Error searching groups:", err);
    res.status(500).json({ message: "Server error searching groups" });
  }
};

// ✅ Update group
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Group.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group updated successfully", group: updated });
  } catch (err) {
    console.error("❌ Error updating group:", err);
    res.status(500).json({ message: "Server error updating group" });
  }
};

// ✅ Delete group
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Group.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting group:", err);
    res.status(500).json({ message: "Server error deleting group" });
  }
};

// ✅ Join a group
exports.joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.body.user_id || "guest"; // fallback if not logged in
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.max_members && group.members.length >= group.max_members)
      return res.status(400).json({ message: "Group is full." });

    if (group.members.includes(user_id))
      return res.status(400).json({ message: "Already joined this group." });

    group.members.push(user_id);
    await group.save();

    res.json({ message: "Joined group successfully", group });
  } catch (err) {
    console.error("❌ Error joining group:", err);
    res.status(500).json({ message: "Server error joining group" });
  }
};
