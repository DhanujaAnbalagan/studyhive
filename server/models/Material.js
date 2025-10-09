const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    tags: { type: [String], default: [] },         // stored as array
    text: { type: String, default: "" },           // rich notes / description
    color: { type: String, default: "ink" },       // matches client radio keys

    fileName: { type: String },
    fileUrl: { type: String },                     // /uploads/materials/xxx.ext
    mimeType: { type: String },
    size: { type: Number },
  },
  { timestamps: true, collection: "materials_transaction" }
);

// simple text search over common fields
materialSchema.index({ title: "text", subject: "text", text: "text", tags: "text" });

module.exports = mongoose.model("Material", materialSchema);
