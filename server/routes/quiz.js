const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");

// ✅ Health check
router.get("/test", (req, res) => {
  res.json({ ok: true, from: "quiz routes" });
});

// ✅ Create a new quiz set
router.post("/sets", async (req, res) => {
  try {
    const { setTitle, subject, difficulty, questions } = req.body;
    if (!setTitle || !subject || !questions?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const quiz = new Quiz({
      setTitle,
      subject,
      difficulty: difficulty || "Medium",
      questions,
    });

    await quiz.save();
    res.status(201).json({ message: "Quiz set created", quiz });
  } catch (err) {
    console.error("❌ Error creating quiz set:", err);
    res.status(500).json({ message: "Server error creating quiz set" });
  }
});

// ✅ Get all quiz sets (with filters)
router.get("/sets", async (req, res) => {
  try {
    const { q = "", fSubject = "", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (q) filter.setTitle = new RegExp(q, "i");
    if (fSubject) filter.subject = new RegExp(fSubject, "i");

    const total = await Quiz.countDocuments(filter);
    const items = await Quiz.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ items, total });
  } catch (err) {
    console.error("❌ Error fetching quiz sets:", err);
    res.status(500).json({ message: "Server error fetching quiz sets" });
  }
});

// ✅ Get one quiz set (with questions)
router.get("/sets/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz set not found" });
    res.json({ items: quiz.questions });
  } catch (err) {
    console.error("❌ Error fetching quiz set:", err);
    res.status(500).json({ message: "Server error fetching quiz set" });
  }
});

// ✅ DELETE an entire quiz set (⚠ must be ABOVE the question delete route)
router.delete("/sets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz set not found" });
    }

    await Quiz.findByIdAndDelete(id);

    res.json({ message: "✅ Quiz set deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting quiz set:", err);
    res.status(500).json({ message: "Server error deleting quiz set" });
  }
});

// ✅ DELETE a single question from a set
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findOne({ "questions._id": id });
    if (!quiz) return res.status(404).json({ message: "Question not found" });

    quiz.questions = quiz.questions.filter((q) => q._id.toString() !== id);
    await quiz.save();

    res.json({ message: "Question removed" });
  } catch (err) {
    console.error("❌ Error deleting question:", err);
    res.status(500).json({ message: "Server error deleting question" });
  }
});

const Report = require("../models/Report");

// ✅ REPORT a question
router.post("/report", async (req, res) => {
  try {
    const { questionId, reason, details, categories, reporterName, reporterEmail } = req.body;

    if (!questionId || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const report = new Report({
      questionId,
      reason,
      details,
      categories,
      reporterName,
      reporterEmail,
    });

    await report.save();

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (err) {
    console.error("❌ Error submitting report:", err);
    res.status(500).json({ message: "Server error submitting report" });
  }
});


module.exports = router;
