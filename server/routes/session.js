const express = require("express");
const router = express.Router();
const { createSession, getSessions } = require("../controllers/sessionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createSession);
router.get("/", authMiddleware, getSessions);

module.exports = router;
