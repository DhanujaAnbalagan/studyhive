const Assignment = require("../models/Assignment");

// GET /api/assignments?q=<query>
exports.getAssignments = async (req, res) => {
  try {
    const { q } = req.query;
    const base = { userId: req.user.userId };

    let filter = base;
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter = {
        ...base,
        $or: [
          { name: regex },
          { subject: regex },
          { type: regex },
          { status: regex },
          { tags: regex },
          { groupMembers: regex },
        ],
      };
    }

    const assignments = await Assignment.find(filter).sort({ dueDate: 1, createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/assignments
exports.addAssignment = async (req, res) => {
  try {
    const {
      name, subject, dueDate,
      type, status, priority,
      resourceLinks = [], groupMembers = [],
      notes = "", tags = [], submissionUrl = ""
    } = req.body;

    if (!name || !subject || !dueDate) {
      return res.status(400).json({ message: "name, subject and dueDate are required" });
    }

    const due = new Date(dueDate);
    const today = new Date(); today.setHours(0,0,0,0);
    if (isNaN(due.getTime()) || due < today) {
      return res.status(400).json({ message: "Due date cannot be in the past" });
    }

    const doc = new Assignment({
      userId: req.user.userId,
      name: name.trim(),
      subject: subject.trim(),
      dueDate: due,
      type, status, priority,
      resourceLinks, groupMembers, notes, tags, submissionUrl
    });

    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/assignments/:id
exports.updateAssignment = async (req, res) => {
  try {
    const {
      name, subject, dueDate,
      type, status, priority,
      resourceLinks, groupMembers,
      notes, tags, submissionUrl
    } = req.body;

    if (dueDate) {
      const d = new Date(dueDate);
      const today = new Date(); today.setHours(0,0,0,0);
      if (isNaN(d.getTime()) || d < today) {
        return res.status(400).json({ message: "Due date cannot be in the past" });
      }
    }

    const update = {
      ...(name !== undefined && { name: name.trim() }),
      ...(subject !== undefined && { subject: subject.trim() }),
      ...(dueDate !== undefined && { dueDate }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(resourceLinks !== undefined && { resourceLinks }),
      ...(groupMembers !== undefined && { groupMembers }),
      ...(notes !== undefined && { notes }),
      ...(tags !== undefined && { tags }),
      ...(submissionUrl !== undefined && { submissionUrl }),
    };

    const item = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: "Assignment not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
