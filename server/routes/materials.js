const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const auth = require("../middleware/authMiddleware"); // your existing protector
const ctrl = require("../controllers/materialsController");

const router = express.Router();

// Ensure uploads dir exists
const UP_DIR = path.join(process.cwd(), "uploads", "materials");
fs.mkdirSync(UP_DIR, { recursive: true });

// Multer config (disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UP_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ts = Date.now();
    cb(null, `${ts}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET list/search
router.get("/", auth, ctrl.listMaterials);

// CREATE
router.post("/upload", auth, upload.single("file"), ctrl.uploadMaterial);

// UPDATE (file optional)
router.put("/:id", auth, upload.single("file"), ctrl.updateMaterial);

// DELETE
router.delete("/:id", auth, ctrl.deleteMaterial);

module.exports = router;
