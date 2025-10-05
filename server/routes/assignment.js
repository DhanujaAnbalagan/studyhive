const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

router.get("/", auth, getAssignments);
router.post("/", auth, addAssignment);
router.put("/:id", auth, updateAssignment);
router.delete("/:id", auth, deleteAssignment);

module.exports = router;
