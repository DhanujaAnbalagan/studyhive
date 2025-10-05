const ReportBug = require("../models/ReportBug");

// @desc    Submit a new bug report
// @route   POST /api/report-bug
exports.createReport = async (req, res) => {
  try {
    const report = new ReportBug(req.body);
    await report.save();
    res.status(201).json({ message: "Bug report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Error submitting report", error: error.message });
  }
};

// @desc    Get all bug reports (for admin dashboard)
// @route   GET /api/report-bug
exports.getAllReports = async (req, res) => {
  try {
    const reports = await ReportBug.find().sort({ reportedAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

// @desc    Update bug report status (mark as resolved, etc.)
// @route   PUT /api/report-bug/:id
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await ReportBug.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Status updated", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};
