const Task = require("../models/Task");

const wordCount = (s = "") => s.trim().split(/\s+/).filter(Boolean).length;

const validPriority = new Set(["low", "medium", "high", "urgent"]);
const validRepeat = new Set(["none", "daily", "weekly", "monthly"]);

function normalizeTaskPayload(body) {
  const out = {};
  if (body.name !== undefined) {
    if (!body.name.trim()) throw new Error("Task name required");
    if (wordCount(body.name) > 10) throw new Error("Task name must be 10 words or fewer");
    out.name = body.name.trim();
  }
  if (body.priority !== undefined) {
    if (!validPriority.has(body.priority)) throw new Error("Invalid priority");
    out.priority = body.priority;
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) throw new Error("tags must be an array");
    out.tags = body.tags.filter(Boolean).map(String);
  }
  if (body.reminderAt !== undefined && body.reminderAt !== null && body.reminderAt !== "") {
    const d = new Date(body.reminderAt);
    if (isNaN(d.getTime())) throw new Error("Invalid reminderAt");
    out.reminderAt = d;
  } else if (body.reminderAt === null) {
    out.reminderAt = null;
  }
  if (body.repeat !== undefined) {
    if (!validRepeat.has(body.repeat)) throw new Error("Invalid repeat value");
    out.repeat = body.repeat;
  }
  if (body.checklist !== undefined) {
    if (!Array.isArray(body.checklist)) throw new Error("checklist must be an array");
    out.checklist = body.checklist.map(it => ({
      label: String(it?.label || "").trim(),
      done: !!it?.done,
    })).filter(it => it.label.length > 0);
  }
  if (body.notes !== undefined) out.notes = String(body.notes || "").trim();
  if (body.pinned !== undefined) out.pinned = !!body.pinned;
  if (body.color !== undefined) out.color = String(body.color || "").trim();
  if (body.completed !== undefined) out.completed = !!body.completed;
  return out;
}

// GET /api/tasks?q=&priority=&tag=&pinned=true|false&completed=true|false&repeat=
exports.getTasks = async (req, res) => {
  try {
    const { q, priority, tag, pinned, completed, repeat } = req.query;
    const filter = { userId: req.user.userId };

    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { notes: { $regex: q, $options: "i" } }];
    if (priority && validPriority.has(priority)) filter.priority = priority;
    if (tag) filter.tags = tag;
    if (repeat && validRepeat.has(repeat)) filter.repeat = repeat;
    if (pinned === "true") filter.pinned = true;
    if (pinned === "false") filter.pinned = false;
    if (completed === "true") filter.completed = true;
    if (completed === "false") filter.completed = false;

    const tasks = await Task.find(filter).sort({ pinned: -1, createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (err) {
    console.error("getTasks error:", err);
    return res.status(500).json({ message: "Error fetching tasks" });
  }
};

// POST /api/tasks
exports.addTask = async (req, res) => {
  try {
    if (!req.body?.name) return res.status(400).json({ message: "Task name required" });
    const base = normalizeTaskPayload(req.body);
    const task = await Task.create({
      userId: req.user.userId,
      completed: false,
      priority: "medium",
      repeat: "none",
      ...base,
    });
    return res.status(201).json(task);
  } catch (err) {
    const msg = err?.message || "Error creating task";
    console.error("addTask error:", msg);
    return res.status(400).json({ message: msg });
  }
};

// PUT /api/tasks/:id  (edit any field)
exports.updateTask = async (req, res) => {
  try {
    const update = normalizeTaskPayload(req.body);
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: update },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Task not found" });
    return res.status(200).json(updated);
  } catch (err) {
    const msg = err?.message || "Error updating task";
    console.error("updateTask error:", msg);
    return res.status(400).json({ message: msg });
  }
};

// PATCH /api/tasks/:id (toggle completed)
exports.toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.completed = !task.completed;
    await task.save();
    return res.status(200).json(task);
  } catch (err) {
    console.error("toggleTask error:", err);
    return res.status(500).json({ message: "Error updating task" });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    return res.status(200).json({ success: true, id: req.params.id });
  } catch (err) {
    console.error("deleteTask error:", err);
    return res.status(500).json({ message: "Error deleting task" });
  }
};
