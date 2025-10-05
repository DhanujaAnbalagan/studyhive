require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected!" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes")); 
app.use("/api/assignments", require("./routes/assignment"));
app.use("/api/tasks", require("./routes/task"));
app.use('/api/report', require('./routes/reportBug'));


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
