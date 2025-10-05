import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../common/Navbar.jsx";
import {
  MdAssignment, MdCalendarToday, MdBook, MdAdd, MdDelete,
  MdSearch, MdEdit, MdClose, MdSave
} from "react-icons/md";
import "../../App.css";

const API = "http://localhost:5000/api/assignments";

const safeJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  const txt = await res.text();
  if (ct.includes("application/json")) return { ok: res.ok, data: JSON.parse(txt || "{}") };
  return { ok: res.ok, data: { message: txt || res.statusText } };
};

const toArray = (s) =>
  (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const fromArray = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const todayStr = new Date().toISOString().split("T")[0];

  // ---------- ADD form ----------
  const [form, setForm] = useState({
    name: "",
    subject: "",
    dueDate: "",
    type: "Homework",
    status: "Not started",
    priority: "Medium",
    resourceLinks: "",     // comma separated string
    groupMembers: "",      // comma separated string
    notes: "",
    tags: "",              // comma separated string
    submissionUrl: "",
  });

  // ---------- EDIT form ----------
  const [editForm, setEditForm] = useState({
    name: "", subject: "", dueDate: "",
    type: "Homework", status: "Not started", priority: "Medium",
    resourceLinks: "", groupMembers: "", notes: "", tags: "", submissionUrl: ""
  });

  const fetchAssignments = useCallback(async (q = "") => {
    try {
      setLoading(true);
      const url = q ? `${API}?q=${encodeURIComponent(q)}` : API;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const { ok, data } = await safeJson(res);
      if (ok) setAssignments(data);
      else alert(data.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssignments(search.trim());
  };

  // ---------- ADD ----------
  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    const selected = new Date(`${form.dueDate}T00:00:00`);
    const today = new Date(); today.setHours(0,0,0,0);
    if (isNaN(selected.getTime())) return setError("Please choose a valid due date.");
    if (selected < today) return setError("Due date cannot be in the past.");

    const payload = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      dueDate: selected.toISOString(),
      type: form.type,
      status: form.status,
      priority: form.priority,
      resourceLinks: toArray(form.resourceLinks),
      groupMembers: toArray(form.groupMembers),
      notes: form.notes,
      tags: toArray(form.tags),
      submissionUrl: form.submissionUrl.trim(),
    };

    // optimistic
    const optimistic = { _id: `temp-${Date.now()}`, ...payload };
    setAssignments((prev) => [optimistic, ...prev]);

    // reset
    setForm({
      name: "", subject: "", dueDate: "",
      type: "Homework", status: "Not started", priority: "Medium",
      resourceLinks: "", groupMembers: "", notes: "", tags: "", submissionUrl: ""
    });

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const { ok, data } = await safeJson(res);
    if (!ok) {
      setAssignments((prev) => prev.filter((a) => a._id !== optimistic._id));
      return alert(data.message || "Failed to add assignment");
    }
    setAssignments((prev) => [data, ...prev.filter((a) => a._id !== optimistic._id)]);
  };

  // ---------- EDIT ----------
  const startEdit = (a) => {
    setEditingId(a._id);
    setEditForm({
      name: a.name || "",
      subject: a.subject || "",
      dueDate: new Date(a.dueDate).toISOString().split("T")[0],
      type: a.type || "Homework",
      status: a.status || "Not started",
      priority: a.priority || "Medium",
      resourceLinks: fromArray(a.resourceLinks),
      groupMembers: fromArray(a.groupMembers),
      notes: a.notes || "",
      tags: fromArray(a.tags),
      submissionUrl: a.submissionUrl || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "", subject: "", dueDate: "",
      type: "Homework", status: "Not started", priority: "Medium",
      resourceLinks: "", groupMembers: "", notes: "", tags: "", submissionUrl: ""
    });
  };

  const saveEdit = async (id) => {
    setError("");
    const selected = new Date(`${editForm.dueDate}T00:00:00`);
    const today = new Date(); today.setHours(0,0,0,0);
    if (isNaN(selected.getTime())) return setError("Please choose a valid due date.");
    if (selected < today) return setError("Due date cannot be in the past.");

    const payload = {
      name: editForm.name.trim(),
      subject: editForm.subject.trim(),
      dueDate: selected.toISOString(),
      type: editForm.type,
      status: editForm.status,
      priority: editForm.priority,
      resourceLinks: toArray(editForm.resourceLinks),
      groupMembers: toArray(editForm.groupMembers),
      notes: editForm.notes,
      tags: toArray(editForm.tags),
      submissionUrl: editForm.submissionUrl.trim(),
    };

    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const { ok, data } = await safeJson(res);
    if (!ok) return alert(data.message || "Failed to update");

    setAssignments((prev) => prev.map((x) => (x._id === id ? data : x)));
    cancelEdit();
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    const keep = assignments;
    setAssignments((p) => p.filter((a) => a._id !== id));
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const { ok, data } = await safeJson(res);
    if (!ok) { setAssignments(keep); alert(data.message || "Failed to delete assignment"); }
  };

  return (
    <div className="full-page-container">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div className="top-navbar enhanced-topbar">
          <div className="page-header">
            <div className="page-title">
              <span className="page-icon page-icon-primary"><MdAssignment /></span>
              <div>
                <h1>Assignments</h1>
                <p className="page-subtitle"></p>
              </div>
            </div>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
              <input
                className="input-lg"
                placeholder="Search "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary btn-lg" type="submit"><MdSearch /> Search</button>
            </form>
          </div>
        </div>

        <div className="dashboard-page">
          {/* Add Form */}
          <div className="form-card">
            <form onSubmit={handleAdd} style={{ display:"grid", gap:14 }}>
              <div className="form-grid-assign">
                <div className="input-group">
                  <label><MdAssignment /> Assignment name</label>
                  <input
                    className="input-lg"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Deadlock Assignment"
                    required
                  />
                </div>

                <div className="input-group">
                  <label><MdBook /> Subject</label>
                  <input
                    className="input-lg"
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g., Operating Systems"
                    required
                  />
                </div>

                <div className="input-group">
                  <label><MdCalendarToday /> Due date</label>
                  <input
                    className="input-lg"
                    type="date"
                    min={todayStr}
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    required
                  />
                  {error && <small style={{ color: "#ef4444" }}>{error}</small>}
                </div>

                <button type="submit" className="btn btn-primary btn-lg">
                  <MdAdd /> Add Assignment
                </button>
              </div>

              {/* New optional fields row */}
              <div className="form-grid-task" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
                <div className="input-group">
                  <label>Type</label>
                  <select
                    className="input-lg"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option>Homework</option>
                    <option>Project</option>
                    <option>Lab</option>
                    <option>Quiz</option>
                    <option>Exam</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Status</label>
                  <select
                    className="input-lg"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Not started</option>
                    <option>In progress</option>
                    <option>Done</option>
                    <option>Submitted</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Priority</label>
                  <select
                    className="input-lg"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              {/* Free-form optional fields */}
              <div className="form-grid-task" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="input-group">
                  <label>Resource links (comma-separated)</label>
                  <input
                    className="input-lg"
                    type="text"
                    placeholder=""
                    value={form.resourceLinks}
                    onChange={(e) => setForm({ ...form, resourceLinks: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Group members (comma-separated)</label>
                  <input
                    className="input-lg"
                    type="text"
                    placeholder=""
                    value={form.groupMembers}
                    onChange={(e) => setForm({ ...form, groupMembers: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-task" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="input-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    className="input-lg"
                    type="text"
                    placeholder="os, scheduling, cpu"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Submission URL</label>
                  <input
                    className="input-lg"
                    type="url"
                    placeholder=""
                    value={form.submissionUrl}
                    onChange={(e) => setForm({ ...form, submissionUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Notes</label>
                <textarea
                  className="input-lg"
                  rows={3}
                  placeholder="Anything to remember…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </form>
          </div>

          {/* List */}
          {loading ? (
            <p>Loading…</p>
          ) : (
            <div className="card-list grid-3">
              {assignments.map((a) => (
                <div key={a._id} className="card pretty-card">
                  {editingId === a._id ? (
                    <>
                      <div className="card-content" style={{ display: "grid", gap: 8 }}>
                        <input className="input-lg" value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        <input className="input-lg" value={editForm.subject}
                          onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} />
                        <input className="input-lg" type="date" min={todayStr}
                          value={editForm.dueDate}
                          onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />

                        <div className="form-grid-task" style={{ gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                          <select className="input-lg" value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                            <option>Homework</option><option>Project</option><option>Lab</option>
                            <option>Quiz</option><option>Exam</option><option>Other</option>
                          </select>
                          <select className="input-lg" value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                            <option>Not started</option><option>In progress</option>
                            <option>Done</option><option>Submitted</option>
                          </select>
                          <select className="input-lg" value={editForm.priority}
                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                            <option>Low</option><option>Medium</option>
                            <option>High</option><option>Urgent</option>
                          </select>
                        </div>

                        <input className="input-lg" placeholder="Resource links (comma-separated)"
                          value={editForm.resourceLinks}
                          onChange={(e) => setEditForm({ ...editForm, resourceLinks: e.target.value })} />
                        <input className="input-lg" placeholder="Group members (comma-separated)"
                          value={editForm.groupMembers}
                          onChange={(e) => setEditForm({ ...editForm, groupMembers: e.target.value })} />
                        <input className="input-lg" placeholder="Tags (comma-separated)"
                          value={editForm.tags}
                          onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
                        <input className="input-lg" type="url" placeholder="Submission URL"
                          value={editForm.submissionUrl}
                          onChange={(e) => setEditForm({ ...editForm, submissionUrl: e.target.value })} />
                        <textarea className="input-lg" rows={3} placeholder="Notes"
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <button className="btn btn-primary btn-lg" onClick={() => saveEdit(a._id)}>
                          <MdSave /> Save
                        </button>
                        <button className="btn btn-danger btn-lg" onClick={cancelEdit}>
                          <MdClose /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="card-content">
                        <h3 className="card-title">{a.name}</h3>
                        <div className="meta-row" style={{ gap: 6 }}>
                          <span className="chip chip-info">{a.subject}</span>
                          <span className="chip chip-date">
                            <MdCalendarToday /> {new Date(a.dueDate).toLocaleDateString()}
                          </span>
                          {a.type && <span className="chip">{a.type}</span>}
                          {a.status && <span className="chip">{a.status}</span>}
                          {a.priority && <span className="chip">{a.priority}</span>}
                        </div>
                        {!!(a.tags || []).length && (
                          <div className="meta-row" style={{ marginTop: 6 }}>
                            {(a.tags || []).slice(0, 5).map((t, i) => (
                              <span key={`${t}-${i}`} className="chip chip-info">{t}</span>
                            ))}
                            {(a.tags || []).length > 5 && <span className="chip">+{a.tags.length - 5}</span>}
                          </div>
                        )}
                        {(a.submissionUrl || a.resourceLinks?.length) && (
                          <div className="meta-row" style={{ marginTop: 6 }}>
                            {a.submissionUrl && (
                              <a className="chip" href={a.submissionUrl} target="_blank" rel="noreferrer">
                                Submission
                              </a>
                            )}
                            {!!a.resourceLinks?.length && (
                              <span className="chip">{a.resourceLinks.length} resource link(s)</span>
                            )}
                            {!!a.groupMembers?.length && (
                              <span className="chip">{a.groupMembers.length} group member(s)</span>
                            )}
                          </div>
                        )}
                        {a.notes && <p style={{ marginTop: 8 }}>{a.notes}</p>}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary btn-icon" onClick={() => startEdit(a)}>
                          <MdEdit />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(a._id)}>
                          <MdDelete />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {!assignments.length && (
                <div className="empty-state">
                  <p>No assignments yet. Add your first one! ✨</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Assignment;
