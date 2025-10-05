import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../common/Navbar.jsx";
import {
  MdPlaylistAddCheck, MdAdd, MdDelete, MdSearch, MdEdit, MdClose, MdSave,
  MdPushPin, MdOutlinePushPin, MdAlarm, MdLabel
} from "react-icons/md";
import "../../App.css";

const API = "http://localhost:5000/api/tasks";

const safeJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  const txt = await res.text();
  if (ct.includes("application/json")) return { ok: res.ok, data: JSON.parse(txt || "{}") };
  return { ok: res.ok, data: { message: txt || res.statusText } };
};
const wordCount = (s = "") => s.trim().split(/\s+/).filter(Boolean).length;

const PRIORITIES = ["low", "medium", "high", "urgent"];
const REPEATS = ["none", "daily", "weekly", "monthly"];

/* Fixed palette choices */
const COLORS = {
  blue:  "#3b82f6",
  green: "#22c55e",
  red:   "#ef4444",
  black: "#111827"
};

const TasksManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Search
  const [search, setSearch] = useState("");

  // Add form (date-only reminder + 4 radio colors)
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [remDate, setRemDate] = useState("");               // <— DATE ONLY
  const [repeat, setRepeat] = useState("none");
  const [checklist, setChecklist] = useState([]);           // {label, done}
  const [subtaskInput, setSubtaskInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [notes, setNotes] = useState("");
  const [colorKey, setColorKey] = useState("blue");         // <— radio: blue/green/red/black
  const [error, setError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({
    name: "", priority: "medium", tags: [], reminderAt: null, repeat: "none",
    checklist: [], pinned: false, notes: "", color: COLORS.blue,
  });
  const [editError, setEditError] = useState("");

  const fetchTasks = useCallback(async (q = "") => {
    try {
      setLoading(true);
      const url = q ? `${API}?q=${encodeURIComponent(q)}` : API;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const { ok, data } = await safeJson(res);
      if (ok) setTasks(data);
      else alert(data.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks(search.trim());
  };

  // Add tag chip
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  // Subtasks
  const addSubtask = () => {
    const s = subtaskInput.trim();
    if (!s) return;
    setChecklist([...checklist, { label: s, done: false }]);
    setSubtaskInput("");
  };
  const toggleSubtask = (idx) => {
    setChecklist((prev) => prev.map((c, i) => (i === idx ? { ...c, done: !c.done } : c)));
  };
  const removeSubtask = (idx) => {
    setChecklist((prev) => prev.filter((_, i) => i !== idx));
  };

  // Build reminder ISO (date only -> midnight)
  const buildReminderISO = () => {
    if (!remDate) return null;
    return new Date(`${remDate}T00:00:00`).toISOString();
  };

  const addTask = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) return;
    if (wordCount(trimmed) > 10) {
      setError("Task name must be 10 words or fewer.");
      return;
    }

    const payload = { name: trimmed };
    if (priority) payload.priority = priority;
    if (tags.length) payload.tags = tags;
    const reminderAt = buildReminderISO();
    if (reminderAt) payload.reminderAt = reminderAt;
    if (repeat) payload.repeat = repeat;
    if (checklist.length) payload.checklist = checklist;
    if (notes.trim()) payload.notes = notes.trim();
    if (pinned) payload.pinned = true;
    payload.color = COLORS[colorKey] || COLORS.blue;

    // optimistic
    const optimistic = { _id: `temp-${Date.now()}`, completed: false, ...payload };
    setTasks((prev) => [optimistic, ...prev]);

    // reset form
    setName(""); setPriority("medium"); setTags([]); setTagInput("");
    setRemDate(""); setRepeat("none");
    setChecklist([]); setSubtaskInput(""); setPinned(false);
    setNotes(""); setColorKey("blue");

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const { ok, data } = await safeJson(res);
    if (!ok) {
      setTasks((prev) => prev.filter((t) => t._id !== optimistic._id));
      setError(data.message || "Failed to add task");
      return;
    }
    setTasks((prev) => [data, ...prev.filter((t) => t._id !== optimistic._id)]);
  };

  const toggleCompleted = async (id) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t)));
    const res = await fetch(`${API}/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    const { ok, data } = await safeJson(res);
    if (!ok) await fetchTasks();
    else setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
  };

  const togglePinnedQuick = async (t) => {
    const id = t._id;
    setTasks((prev) => prev.map((x) => (x._id === id ? { ...x, pinned: !x.pinned } : x)));
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pinned: !t.pinned }),
    });
    const { ok, data } = await safeJson(res);
    if (!ok) await fetchTasks();
    else setTasks((prev) => prev.map((x) => (x._id === id ? data : x)));
  };

  const deleteTask = async (id) => {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t._id !== id));
    const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const { ok } = await safeJson(res);
    if (!ok) setTasks(prev);
  };

  // ----- Editing -----
  const startEdit = (t) => {
    setEditingId(t._id);
    setEdit({
      name: t.name || "",
      priority: t.priority || "medium",
      tags: Array.isArray(t.tags) ? t.tags : [],
      reminderAt: t.reminderAt ? new Date(t.reminderAt).toISOString() : null, // stored ISO
      repeat: t.repeat || "none",
      checklist: Array.isArray(t.checklist) ? t.checklist : [],
      pinned: !!t.pinned,
      notes: t.notes || "",
      color: t.color || COLORS.blue,   // hex
    });
    setEditError("");
  };
  const cancelEdit = () => { setEditingId(null); setEditError(""); };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmed = edit.name.trim();
    if (!trimmed) return setEditError("Task name required");
    if (wordCount(trimmed) > 10) return setEditError("Task name must be 10 words or fewer.");

    const payload = {
      name: trimmed,
      priority: edit.priority,
      tags: edit.tags,
      repeat: edit.repeat,
      checklist: edit.checklist,
      pinned: edit.pinned,
      notes: edit.notes,
      color: edit.color,
      reminderAt: edit.reminderAt || null,
    };

    const res = await fetch(`${API}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const { ok, data } = await safeJson(res);
    if (!ok) return setEditError(data.message || "Failed to update task");

    setTasks((prev) => prev.map((t) => (t._id === editingId ? data : t)));
    setEditingId(null);
  };

  const addEditTag = (value) => {
    const t = value.trim();
    if (!t) return;
    if (!edit.tags.includes(t)) setEdit((e) => ({ ...e, tags: [...e.tags, t] }));
  };

  return (
    <div className="full-page-container">
      <Navbar />
      <main className="main-content">
        <div className="top-navbar enhanced-topbar">
          <div className="page-header">
            <div className="page-title">
              <span className="page-icon page-icon-success"><MdPlaylistAddCheck /></span>
              <div>
                <h1>To-Do List</h1>
                <p className="page-subtitle"></p>
              </div>
            </div>

            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
              <input
                className="input-lg"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary btn-lg" type="submit"><MdSearch /> Search</button>
            </form>
          </div>
        </div>

        <div className="dashboard-page">
          {/* Add form */}
          <div className="form-card">
            <form onSubmit={addTask} className="form-grid-task" style={{ gridTemplateColumns: "1fr auto" }}>
              <input
                className="input-lg"
                type="text"
                placeholder="Task name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-lg">
                <MdAdd /> Add Task
              </button>
            </form>

            {error && <small style={{ color: "#ef4444" }}>{error}</small>}

            {/* Optional controls */}
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: 14 }}>
              {/* Priority */}
              <div className="input-group">
                <label>Priority</label>
                <select className="input-lg" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Repeat */}
              <div className="input-group">
                <label>Repeat</label>
                <select className="input-lg" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
                  {REPEATS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Reminder (DATE ONLY) */}
              <div className="input-group">
                <label><MdAlarm /> Reminder date</label>
                <input className="input-lg" type="date" value={remDate} onChange={(e) => setRemDate(e.target.value)} />
              </div>

              {/* Colour (4 radio options) */}
              <div className="input-group" style={{ display: "grid", gap: 8 }}>
                <label>Colour</label>
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  {Object.entries(COLORS).map(([key, hex]) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="task-color"
                        value={key}
                        checked={colorKey === key}
                        onChange={() => setColorKey(key)}
                      />
                      <span
                        title={key}
                        style={{
                          width: 18, height: 18, borderRadius: 999, background: hex,
                          display: "inline-block", border: "2px solid #e5e7eb"
                        }}
                      />
                      <small style={{ textTransform: "capitalize" }}>{key}</small>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pinned */}
              <div className="input-group" style={{ display: "flex", alignItems: "end" }}>
                <label>Pin</label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                  {pinned ? "Pinned" : "Not pinned"}
                </label>
              </div>

              {/* Labels / Tags */}
              <div className="input-group" style={{ gridColumn: "1/-1" }}>
                <label><MdLabel /> Labels</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input-lg"
                    placeholder="Type a label and press Add"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  />
                  <button className="btn btn-primary btn-lg" type="button" onClick={addTag}>Add</button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {tags.map((t) => (
                    <span key={t} className="chip chip-info" style={{ cursor: "pointer" }} onClick={() => removeTag(t)}>
                      {t} ✕
                    </span>
                  ))}
                </div>
              </div>

              {/* Subtasks */}
              <div className="input-group" style={{ gridColumn: "1/-1" }}>
                <label>Subtasks</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input-lg"
                    placeholder="Subtask"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubtask(); } }}
                  />
                  <button className="btn btn-primary btn-lg" type="button" onClick={addSubtask}>Add</button>
                </div>
                <div style={{ marginTop: 8 }}>
                  {checklist.map((c, i) => (
                    <div key={i} className="checkbox-row" style={{ justifyContent: "space-between" }}>
                      <label className="checkbox-row" style={{ gap: 8 }}>
                        <input type="checkbox" checked={c.done} onChange={() => toggleSubtask(i)} />
                        <span style={{ textDecoration: c.done ? "line-through" : "none" }}>{c.label}</span>
                      </label>
                      <button className="btn btn-danger btn-icon" type="button" onClick={() => removeSubtask(i)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="input-group" style={{ gridColumn: "1/-1" }}>
                <label>Notes</label>
                <textarea
                  className="input-lg"
                  rows={3}
                  placeholder="Any extra notes…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <p>Loading…</p>
          ) : (
            <div className="card-list stack">
              {tasks.map((t) => (
                <div
                  key={t._id}
                  className={`card pretty-card task-card ${t.completed ? "is-complete" : ""}`}
                  style={{ borderLeft: `6px solid ${t.color || "#e5e7eb"}` }}
                >
                  {editingId === t._id ? (
                    // ---------- EDIT MODE ----------
                    <div style={{ width: "100%", display: "grid", gap: 12 }}>
                      <input
                        className="input-lg"
                        value={edit.name}
                        onChange={(e) => setEdit((x) => ({ ...x, name: e.target.value }))}
                        placeholder="Task name"
                      />

                      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                        <div className="input-group">
                          <label>Priority</label>
                          <select
                            className="input-lg"
                            value={edit.priority}
                            onChange={(e) => setEdit((x) => ({ ...x, priority: e.target.value }))}
                          >
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>

                        <div className="input-group">
                          <label>Repeat</label>
                          <select
                            className="input-lg"
                            value={edit.repeat}
                            onChange={(e) => setEdit((x) => ({ ...x, repeat: e.target.value }))}
                          >
                            {REPEATS.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>

                        {/* Reminder (DATE ONLY) */}
                        <div className="input-group">
                          <label><MdAlarm /> Reminder date</label>
                          <input
                            className="input-lg"
                            type="date"
                            value={edit.reminderAt ? new Date(edit.reminderAt).toISOString().slice(0,10) : ""}
                            onChange={(e) => {
                              const val = e.target.value; // "YYYY-MM-DD"
                              setEdit((x) => ({ ...x, reminderAt: val ? new Date(`${val}T00:00:00`).toISOString() : null }));
                            }}
                          />
                        </div>

                        {/* Colour radios (4 fixed choices) */}
                        <div className="input-group">
                          <label>Colour</label>
                          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                            {Object.entries(COLORS).map(([key, hex]) => (
                              <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input
                                  type="radio"
                                  name={`edit-color-${editingId}`}
                                  value={key}
                                  checked={(edit.color || COLORS.blue) === hex}
                                  onChange={() => setEdit((x) => ({ ...x, color: hex }))}
                                />
                                <span
                                  title={key}
                                  style={{ width: 18, height: 18, borderRadius: 999, background: hex, display: "inline-block", border: "2px solid #e5e7eb" }}
                                />
                                <small style={{ textTransform: "capitalize" }}>{key}</small>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="input-group" style={{ gridColumn: "1/-1" }}>
                          <label><MdLabel /> Labels</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              className="input-lg"
                              placeholder="Type a label and press Add"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addEditTag(e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                            <button
                              className="btn btn-primary btn-lg"
                              type="button"
                              onClick={(e) => {
                                const inp = e.currentTarget.previousSibling;
                                addEditTag(inp.value || "");
                                inp.value = "";
                              }}
                            >
                              Add
                            </button>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                            {edit.tags.map((tg, i) => (
                              <span
                                key={`${tg}-${i}`}
                                className="chip chip-info"
                                style={{ cursor: "pointer" }}
                                onClick={() => setEdit((x) => ({ ...x, tags: x.tags.filter((y, j) => !(j === i && y === tg)) }))}
                              >
                                {tg} ✕
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="input-group" style={{ gridColumn: "1/-1" }}>
                          <label>Subtasks</label>
                          <div style={{ display: "grid", gap: 6 }}>
                            {edit.checklist.map((c, i) => (
                              <div key={i} className="checkbox-row" style={{ justifyContent: "space-between" }}>
                                <label className="checkbox-row" style={{ gap: 8, flex: 1 }}>
                                  <input
                                    type="checkbox"
                                    checked={!!c.done}
                                    onChange={() =>
                                      setEdit((x) => ({
                                        ...x,
                                        checklist: x.checklist.map((ci, idx) =>
                                          idx === i ? { ...ci, done: !ci.done } : ci
                                        ),
                                      }))
                                    }
                                  />
                                  <input
                                    className="input-lg"
                                    value={c.label}
                                    onChange={(e) =>
                                      setEdit((x) => ({
                                        ...x,
                                        checklist: x.checklist.map((ci, idx) =>
                                          idx === i ? { ...ci, label: e.target.value } : ci
                                        ),
                                      }))
                                    }
                                  />
                                </label>
                                <button
                                  className="btn btn-danger btn-icon"
                                  onClick={() =>
                                    setEdit((x) => ({ ...x, checklist: x.checklist.filter((_, idx) => idx !== i) }))
                                  }
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="btn btn-primary btn-lg"
                              onClick={() => setEdit((x) => ({ ...x, checklist: [...x.checklist, { label: "", done: false }] }))}
                            >
                              Add subtask
                            </button>
                          </div>
                        </div>

                        <div className="input-group">
                          <label>Pinned</label>
                          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={!!edit.pinned}
                              onChange={(e) => setEdit((x) => ({ ...x, pinned: e.target.checked }))}
                            />
                            {edit.pinned ? "Pinned" : "Not pinned"}
                          </label>
                        </div>

                        <div className="input-group" style={{ gridColumn: "1/-1" }}>
                          <label>Notes</label>
                          <textarea
                            className="input-lg"
                            rows={3}
                            value={edit.notes}
                            onChange={(e) => setEdit((x) => ({ ...x, notes: e.target.value }))}
                          />
                        </div>
                      </div>

                      {editError && <small style={{ color: "#ef4444" }}>{editError}</small>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary btn-lg" onClick={saveEdit}><MdSave /> Save</button>
                        <button className="btn btn-danger btn-lg" onClick={cancelEdit}><MdClose /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // ---------- VIEW MODE ----------
                    <>
                      <label className="checkbox-row" style={{ flex: 1 }}>
                        <input type="checkbox" checked={!!t.completed} onChange={() => toggleCompleted(t._id)} />
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="task-name" style={{ fontWeight: 700 }}>{t.name}</span>
                            <span className="chip" title="Priority">{t.priority}</span>
                            {t.repeat !== "none" && <span className="chip chip-info">repeat: {t.repeat}</span>}
                            {t.reminderAt && (
                              <span className="chip chip-date">
                                <MdAlarm /> {new Date(t.reminderAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {!!t.tags?.length && (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {t.tags.map((tg, i) => <span key={`${tg}-${i}`} className="chip chip-info">{tg}</span>)}
                            </div>
                          )}
                          {t.notes && <small style={{ color: "#6b7280" }}>{t.notes}</small>}
                          {!!t.checklist?.length && (
                            <div style={{ display: "grid", gap: 4 }}>
                              {t.checklist.map((c, i) => (
                                <div key={i} className="checkbox-row" style={{ gap: 8, opacity: c.done ? 0.7 : 1 }}>
                                  <input type="checkbox" checked={!!c.done} readOnly />
                                  <span style={{ textDecoration: c.done ? "line-through" : "none" }}>{c.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          className="btn btn-primary btn-icon"
                          title={t.pinned ? "Unpin" : "Pin"}
                          onClick={() => togglePinnedQuick(t)}
                        >
                          {t.pinned ? <MdPushPin /> : <MdOutlinePushPin />}
                        </button>
                        <button className="btn btn-primary btn-icon" onClick={() => startEdit(t)}><MdEdit /></button>
                        <button className="btn btn-danger btn-icon" onClick={() => deleteTask(t._id)}><MdDelete /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {!tasks.length && <div className="empty-state"><p>No tasks yet. Add your first one! ✨</p></div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TasksManager;
