const express = require("express");
const router = express.Router();
const { createFeedback, getAllFeedback } = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createFeedback);
router.get("/", authMiddleware, getAllFeedback);

module.exports = router;
