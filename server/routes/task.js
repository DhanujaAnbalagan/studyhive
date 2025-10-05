const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getTasks, addTask, updateTask, toggleTask, deleteTask } = require("../controllers/taskController");

router.get("/", auth, getTasks);
router.post("/", auth, addTask);
router.put("/:id", auth, updateTask);
router.patch("/:id", auth, toggleTask); // toggle completed
router.delete("/:id", auth, deleteTask);

module.exports = router;
