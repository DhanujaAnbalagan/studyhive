const fs = require("fs");
const path = require("path");
const Material = require("../models/Material");


// GET /api/materials?q=
exports.listMaterials = async (req, res) => {
  const userId = req.user.userId; // from auth middleware
  const q = (req.query.q || "").trim();

  // You asked for a shared library? If you want *all users*, remove "userId"
  const filter = { userId };
  if (q) {
    filter.$or = [
      { title:   { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { text:    { $regex: q, $options: "i" } },
      { tags:    { $elemMatch: { $regex: q, $options: "i" } } },
    ];
  }

  const items = await Material.find(filter).sort({ createdAt: -1 });
  res.json(items);
};

exports.uploadMaterial = async (req, res) => {
  try {
    const { title, subject, tags, text, color } = req.body;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newMaterial = new Material({
      title,
      subject,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      text,
      color,
      fileUrl: req.file?.path,
      fileName: req.file?.originalname,
      userId,
    });

    await newMaterial.save();
    res.status(201).json(newMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// PUT /api/materials/:id
exports.updateMaterial = async (req, res) => {
  const userId = req.user.userId
  const { id } = req.params;

  const material = await Material.findOne({ _id: id, userId });
  if (!material) return res.status(404).json({ message: "Not found" });

  const { title, subject, tags, text, color } = req.body;

  if (typeof title   === "string") material.title   = title.trim();
  if (typeof subject === "string") material.subject = subject.trim();
  if (typeof text    === "string") material.text    = text;
  if (typeof color   === "string") material.color   = color;

  if (typeof tags === "string") {
    material.tags = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  }

  if (req.file) {
    // delete old file if present
    if (material.fileUrl && material.fileUrl.startsWith("/uploads/")) {
      const abs = path.join(process.cwd(), material.fileUrl.replace(/^\//, ""));
      fs.promises.stat(abs).then(() => fs.promises.unlink(abs)).catch(() => {});
    }
    material.fileName = req.file.originalname;
    material.fileUrl  = `/uploads/materials/${req.file.filename}`;
    material.mimeType = req.file.mimetype;
    material.size     = req.file.size;
  }

  await material.save();
  res.json(material);
};

// DELETE /api/materials/:id
exports.deleteMaterial = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  const doc = await Material.findOneAndDelete({ _id: id, userId });
  if (!doc) return res.status(404).json({ message: "Not found" });

  if (doc.fileUrl && doc.fileUrl.startsWith("/uploads/")) {
    const abs = path.join(process.cwd(), doc.fileUrl.replace(/^\//, ""));
    fs.promises.stat(abs).then(() => fs.promises.unlink(abs)).catch(() => {});
  }

  res.json({ message: "Deleted" });
};
