const express = require("express");
const router = express.Router();
const {
  createReport,
  getAllReports,
  updateReportStatus,
} = require("../controllers/reportBugController");

router.post("/", createReport);
router.get("/", getAllReports);
router.put("/:id", updateReportStatus);

module.exports = router;
