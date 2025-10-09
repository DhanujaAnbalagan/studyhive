const Session = require("../models/Session");

exports.createSession = async (req, res) => {
  try {
    const session = await Session.create({ ...req.body, user: req.user.userId });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Error saving session", error: err.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sessions" });
  }
};
