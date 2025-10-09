const Feedback = require("../models/Feedback");

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      user: req.user?.userId || null,
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback" });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback" });
  }
};
