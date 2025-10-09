require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple health check
app.get("/api/test", (req, res) => res.json({ ok: true, where: "server" }));

// Helper to log mounts
const mount = (path, router) => {
  console.log("→ Mounting", path);
  app.use(path, router);
};

// ROUTES (order matters: BEFORE the 404 handler)
mount("/api/auth", require("./routes/auth"));
mount("/api/notes", require("./routes/notes"));
mount("/api/assignments", require("./routes/assignment"));
mount("/api/tasks", require("./routes/task"));
mount("/api/report", require("./routes/reportBug"));
mount("/api/sessions", require("./routes/session"));
mount("/api/feedback", require("./routes/feedback"));
mount("/api/buddies", require("./routes/buddies"));
mount("/api/groups", require("./routes/groups"));
mount("/api/quiz", require("./routes/quiz"));
app.use("/api/materials", require("./routes/materials"));

// 404 (keep last)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
