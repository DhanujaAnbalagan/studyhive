// src/components/notes/Materials.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar.jsx";
import axios from "axios";
import {
  MdDescription, MdSearch, MdAdd, MdDelete, MdEdit, MdSave, MdClose, MdAttachFile,
} from "react-icons/md";
import "../../App.css";

const API = "http://localhost:5000/api/materials";

const PALETTE = {
  ink: "rgb(17, 24, 39)",
  blue: "#2563eb",
  violet: "#7c3aed",
  teal: "#0d9488",
  amber: "#d97706",
  rose: "#e11d48",
};

export default function Materials() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // UI state
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // list
  const [materials, setMaterials] = useState([]);

  // add form
  const [form, setForm] = useState({
    title: "",
    subject: "",
    tags: "",
    text: "",
    color: "ink",
    file: null,
    fileName: "",
  });

  // edit form
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    subject: "",
    tags: "",
    text: "",
    color: "ink",
    file: null,
    fileName: "",
  });

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fetchMaterials = useCallback(
    async (q = "") => {
      try {
        setLoading(true);
        setError("");
        const url = q ? `${API}?q=${encodeURIComponent(q)}` : API;
        const { data } = await axios.get(url, auth);
        setMaterials(Array.isArray(data) ? data : data.items || []);
      } catch (e) {
        console.error(e);
        alert("Failed to fetch materials");
      } finally {
        setLoading(false);
      }
    },
    [token] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const onFilePick = (e, which = "add") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      if (which === "add") setForm((f) => ({ ...f, file: null, fileName: "" }));
      else setEditForm((f) => ({ ...f, file: null, fileName: "" }));
      return;
    }
    if (which === "add") setForm((f) => ({ ...f, file, fileName: file.name }));
    else setEditForm((f) => ({ ...f, file, fileName: file.name }));
  };

  const clearAddFile = () => setForm((f) => ({ ...f, file: null, fileName: "" }));

  // CREATE
  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) return setError("Authentication error. Please log in again.");
    if (!form.title.trim()) return setError("Please provide a title.");
    if (!form.file) return setError("Please upload a file.");

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("subject", form.subject.trim());
    fd.append("tags", form.tags.trim()); // server can split by comma
    fd.append("text", form.text);
    fd.append("color", form.color);
    fd.append("file", form.file);

    // optimistic item
    const optimistic = {
      _id: `temp-${Date.now()}`,
      title: form.title,
      subject: form.subject,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      text: form.text,
      color: form.color,
      fileName: form.fileName,
      createdAt: new Date().toISOString(),
    };
    setMaterials((prev) => [optimistic, ...prev]);

    // reset UI
    setForm({ title: "", subject: "", tags: "", text: "", color: "ink", file: null, fileName: "" });

    try {
      const { data } = await axios.post(`${API}/upload`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      // replace optimistic with real
      setMaterials((prev) => [data, ...prev.filter((m) => m._id !== optimistic._id)]);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Error uploading file. Please try again.");
      // revert optimistic
      setMaterials((prev) => prev.filter((m) => m._id !== optimistic._id));
    }
  };

  // EDIT
  const startEdit = (m) => {
    setEditingId(m._id);
    setEditForm({
      title: m.title || "",
      subject: m.subject || "",
      tags: (m.tags || []).join(", "),
      text: m.text || "",
      color: m.color || "ink",
      file: null,
      fileName: "",
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", subject: "", tags: "", text: "", color: "ink", file: null, fileName: "" });
  };
  const saveEdit = async (id) => {
    const fd = new FormData();
    fd.append("title", editForm.title.trim());
    fd.append("subject", editForm.subject.trim());
    fd.append("tags", editForm.tags.trim());
    fd.append("text", editForm.text);
    fd.append("color", editForm.color);
    if (editForm.file) fd.append("file", editForm.file);

    try {
      const { data } = await axios.put(`${API}/${id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setMaterials((prev) => prev.map((m) => (m._id === id ? data : m)));
      cancelEdit();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Update failed");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    const keep = materials;
    setMaterials((p) => p.filter((m) => m._id !== id));
    try {
      await axios.delete(`${API}/${id}`, auth);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Delete failed");
      setMaterials(keep);
    }
  };

  const ColorPicker = ({ value, onChange }) => (
    <div className="options-group" style={{ marginTop: 4 }}>
      {Object.entries(PALETTE).map(([key, hex]) => (
        <label key={key} style={{ alignItems: "center" }}>
          <input
            type="radio"
            name="color"
            value={key}
            checked={value === key}
            onChange={(e) => onChange(e.target.value)}
          />
          <span
            style={{
              width: 18, height: 18, borderRadius: 999, background: hex, display: "inline-block",
              marginLeft: 6, marginRight: 6,
            }}
          />
          {key}
        </label>
      ))}
    </div>
  );


  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(search.trim());
  };

  return (
    <div className="full-page-container">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div className="top-navbar">
          <div className="page-header">
            <div className="page-title">
              <span className="page-icon"><MdDescription /></span>
              <div>
                <h1>Notes Library</h1>
                <p className="page-subtitle">Upload files, keep rich notes, and find them fast.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
              <input
                className="input-lg"
                placeholder="Search by title / subject / tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary btn-lg" type="submit">
                <MdSearch /> Search
              </button>
              <button
                className="btn btn-secondary btn-lg"
                type="button"
                onClick={() => navigate("/notes")}
                title="Notes Summarizer"
              >
                Open Summarizer
              </button>
            </form>
          </div>
        </div>

        <div className="dashboard-page">
          {/* Add form */}
          {error && (
            <div className="card" style={{ padding: 12, borderLeft: "4px solid #ef4444", color: "#b91c1c" }}>
              {error}
            </div>
          )}

          <div className="form-card">
            <form onSubmit={handleAdd} style={{ display: "grid", gap: 14 }}>
              <div className="form-grid-task" style={{ gridTemplateColumns: "1.2fr 1fr 1fr auto" }}>
                <input
                  className="input-lg"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <input
                  className="input-lg"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
                <input
                  className="input-lg"
                  placeholder="tags (comma-separated)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <label className="btn btn-secondary btn-lg" style={{ cursor: "pointer" }}>
                  <MdAttachFile /> {form.fileName || "Choose file"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.rtf,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={(e) => onFilePick(e, "add")}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <div className="input-group">
                <label>Notes</label>
                <textarea
                  className="input-lg"
                  rows={3}
                  placeholder="Optional details / highlights…"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Color</label>
                <ColorPicker
                  value={form.color}
                  onChange={(color) => setForm((f) => ({ ...f, color }))}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-lg" type="submit">
                  <MdAdd /> Add Note
                </button>
                {form.fileName && (
                  <button className="btn btn-secondary btn-lg" type="button" onClick={clearAddFile}>
                    Clear file
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          {loading ? (
            <div className="skeleton-list" />
          ) : (
            <div className="card-list">
              {!materials.length && <div className="empty-state">No notes yet. Add your first one! ✨</div>}

              {materials.map((m) => (
                <div
                  key={m._id}
                  className="card pretty-card"
                  style={{ borderLeft: `6px solid ${PALETTE[m.color] || PALETTE.ink}` }}
                >
                  {editingId === m._id ? (
                    <>
                      <div style={{ display: "grid", gap: 8 }}>
                        <input
                          className="input-lg"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                        <input
                          className="input-lg"
                          value={editForm.subject}
                          onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        />
                        <input
                          className="input-lg"
                          placeholder="tags (comma-separated)"
                          value={editForm.tags}
                          onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                        />
                        <textarea
                          className="input-lg"
                          rows={3}
                          placeholder="Notes"
                          value={editForm.text}
                          onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                        />
                        <div className="finder-search" style={{ gap: 12 }}>
                          <ColorPicker
                            value={editForm.color}
                            onChange={(color) => setEditForm((f) => ({ ...f, color }))}
                          />
                          <label className="btn btn-secondary btn-lg" style={{ cursor: "pointer" }}>
                            <MdAttachFile /> {editForm.fileName || "Replace file"}
                            <input type="file" onChange={(e) => onFilePick(e, "edit")} style={{ display: "none" }} />
                          </label>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <button className="btn btn-primary btn-lg" onClick={() => saveEdit(m._id)}>
                          <MdSave /> Save
                        </button>
                        <button className="btn btn-danger btn-lg" onClick={cancelEdit}>
                          <MdClose /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="item-main">
                        <div className="item-title">{m.title}</div>
                        <div className="item-sub">
                          <span className="chip chip-info">{m.subject}</span>
                          {" "}
                          {(m.tags || []).slice(0, 6).map((t, i) => (
                            <span key={i} className="chip" style={{ marginLeft: 6 }}>{t}</span>
                          ))}
                        </div>
                        {m.text && <p style={{ marginTop: 6 }}>{m.text}</p>}
                        <div className="item-sub" style={{ marginTop: 6 }}>
                          {m.fileUrl && (
                            <a className="chip" href={m.fileUrl} target="_blank" rel="noreferrer">
                              Open file
                            </a>
                          )}
                          <span className="chip chip-date" style={{ marginLeft: 6 }}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary btn-icon" onClick={() => startEdit(m)}>
                          <MdEdit />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(m._id)}>
                          <MdDelete />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
