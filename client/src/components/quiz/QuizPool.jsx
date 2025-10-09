import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../common/Navbar.jsx";
import "../../App.css";

const API = "/api/quiz";
const headers = { "Content-Type": "application/json" };

// Safe fetch helper
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { ok: res.ok, data };
    } catch {
      console.error("⚠️ Non-JSON response:", text);
      return { ok: false, data: { message: text || "Invalid JSON response" } };
    }
  } catch (err) {
    console.error("⚠️ Network error:", err);
    return { ok: false, data: { message: err.message || "Network error" } };
  }
};

const emptyQ = () => ({
  question: "",
  options: ["", ""],
  answerIndex: 0,
  explanation: "",
});

export default function QuizPool() {
  // ===== STATES =====
  const [setTitle, setSetTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [qs, setQs] = useState([emptyQ()]);
  const [publishing, setPublishing] = useState(false);

  const [q, setQ] = useState("");
  const [fSubject, setFSubject] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sets, setSets] = useState([]);
  const [openKey, setOpenKey] = useState(null);
  const [openQuestions, setOpenQuestions] = useState([]);
  const limit = 10;
  const [activeSection, setActiveSection] = useState("find");

  // ===== REPORT STATES =====
  const [reportOpen, setReportOpen] = useState(null);
  const [reportData, setReportData] = useState({
    reason: "",
    details: "",
    categories: [],
    reporterName: "",
    reporterEmail: "",
  });

  // ===== VALIDATION =====
  const validate = () => {
    if (!setTitle.trim()) return "Set title required.";
    if (!subject.trim()) return "Subject required.";
    if (!qs.length) return "Add at least one question.";
    for (let i = 0; i < qs.length; i++) {
      const Q = qs[i];
      if (!Q.question.trim()) return `Question ${i + 1} needs text.`;
      if (Q.options.length < 2) return `Question ${i + 1} needs at least 2 options.`;
    }
    return "";
  };

  // ===== FETCH SETS =====
  const fetchSets = useCallback(async () => {
    const params = new URLSearchParams({ q, fSubject, page, limit });
    const { ok, data } = await safeFetch(`${API}/sets?${params}`, { headers });
    if (!ok) return alert(data.message);
    setSets(data.items || []);
    setTotal(data.total || 0);
  }, [q, fSubject, page]);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  // ===== PUBLISH NEW SET =====
  const publishSet = async () => {
    const err = validate();
    if (err) return alert(err);
    setPublishing(true);
    try {
      const payload = {
        setTitle: setTitle.trim(),
        subject: subject.trim(),
        difficulty,
        questions: qs.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          answerIndex: q.answerIndex,
          explanation: q.explanation.trim(),
        })),
      };

      const { ok, data } = await safeFetch(`${API}/sets`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!ok) throw new Error(data.message);
      alert("✅ Quiz set created successfully!");
      setSetTitle("");
      setSubject("");
      setQs([emptyQ()]);
      fetchSets();
    } catch (err) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  };

  // ===== OPEN ONE SET =====
  const openSet = async (setKey) => {
    if (openKey === setKey) {
      setOpenKey(null);
      setOpenQuestions([]);
      return;
    }
    const { ok, data } = await safeFetch(`${API}/sets/${setKey}`, { headers });
    if (!ok) return alert(data.message);
    setOpenKey(setKey);
    setOpenQuestions(data.items || []);
  };

  // ===== REMOVE A QUESTION =====
  const removeQuestion = async (id) => {
    if (!window.confirm("Remove this question?")) return;
    const { ok, data } = await safeFetch(`${API}/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!ok) return alert(data.message);
    setOpenQuestions((p) => p.filter((x) => x._id !== id));
  };

  // ===== REMOVE AN ENTIRE SET =====
  const removeSet = async (id) => {
    if (!window.confirm("Delete this entire quiz set?")) return;
    const { ok, data } = await safeFetch(`${API}/sets/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!ok) return alert(data.message);
    alert("✅ Quiz set deleted successfully!");
    fetchSets();
  };

  // ===== REPORT SUBMIT =====
  const submitReport = async (questionId) => {
    if (!reportData.reason) return alert("Please select a reason for the report.");

    const { ok, data } = await safeFetch(`${API}/report`, {
      method: "POST",
      headers,
      body: JSON.stringify({ questionId, ...reportData }),
    });

    if (!ok) return alert(data.message);
    alert("✅ Report submitted successfully!");
    setReportOpen(null);
    setReportData({
      reason: "",
      details: "",
      categories: [],
      reporterName: "",
      reporterEmail: "",
    });
  };

  // ===== HELPERS FOR CREATE SECTION =====
  const addQ = () => setQs((p) => [...p, emptyQ()]);
  const delQ = (i) => setQs((p) => p.filter((_, idx) => idx !== i));
  const setQP = (i, patch) => setQs((p) => p.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const addOpt = (i) =>
    setQs((p) => p.map((q, idx) => (idx === i ? { ...q, options: [...q.options, ""] } : q)));
  const updOpt = (qi, oi, val) =>
    setQs((p) =>
      p.map((q, idx) =>
        idx === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q
      )
    );
  const rmOpt = (qi, oi) =>
    setQs((p) =>
      p.map((q, idx) =>
        idx === qi
          ? {
              ...q,
              options: q.options.length > 2 ? q.options.filter((_, j) => j !== oi) : q.options,
              answerIndex: q.answerIndex >= oi ? Math.max(0, q.answerIndex - 1) : q.answerIndex,
            }
          : q
      )
    );

  // ===== RENDER =====
  return (
    <div className="full-page-container">
      <Navbar />
      <main className="main-content">
        <div className="top-navbar">
          <h1>Quiz Sets</h1>
        </div>

        {/* SIDEBAR LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px" }}>
          {/* Sidebar */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            <button
              className={`btn ${activeSection === "find" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveSection("find")}
            >
              Find Quiz Sets
            </button>
            <button
              className={`btn ${activeSection === "create" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveSection("create")}
            >
              Create Quiz Set
            </button>
          </aside>

          {/* MAIN AREA */}
          <section className="dashboard-page" style={{ display: "grid", gap: "20px" }}>
            {/* ===== FIND QUIZ SETS ===== */}
            {activeSection === "find" && (
              <div className="form-card" style={{ display: "grid", gap: 12 }}>
                <h3>Find Quiz Sets</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: 10 }}>
                  <input
                    className="input-lg"
                    placeholder="Search title..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <input
                    className="input-lg"
                    placeholder="Filter subject..."
                    value={fSubject}
                    onChange={(e) => setFSubject(e.target.value)}
                  />
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      setPage(1);
                      fetchSets();
                    }}
                  >
                    Search
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="chip">Total sets: {total}</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-secondary"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Prev
                    </button>
                    <span className="chip">
                      Page {page}/{totalPages}
                    </span>
                    <button
                      className="btn btn-secondary"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* QUIZ SETS LIST */}
                <div className="card-list">
                  {sets.map((s) => (
                    <div
                      key={s._id}
                      className="card pretty-card"
                      style={{ flexDirection: "column", gap: 6, position: "relative" }}
                    >
                      <div
                        className="item-title"
                        onClick={() => openSet(s._id)}
                        style={{ cursor: "pointer" }}
                      >
                        {s.subject} · <b>{s.setTitle}</b> · <i>{s.difficulty}</i>
                      </div>
                      <div className="item-sub">
                        {s.questions?.length || 0} questions · Updated{" "}
                        {new Date(s.updatedAt).toLocaleString()}
                      </div>

                      {/* DELETE SET BUTTON */}
                      <button
                        className="btn btn-danger"
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          padding: "5px 10px",
                        }}
                        onClick={() => removeSet(s._id)}
                      >
                        Delete Set
                      </button>

                      {/* EXPANDED QUESTIONS */}
                      {openKey === s._id && (
                        <div style={{ display: "grid", gap: 6 }}>
                          {openQuestions.map((q) => (
                            <div
                              key={q._id}
                              className="card pretty-card"
                              style={{ flexDirection: "column", gap: 8 }}
                            >
                              <b>{q.question}</b>
                              <ul>
                                {q.options.map((o, i) => (
                                  <li key={i}>
                                    {o}
                                    {i === q.answerIndex && " ✅"}
                                  </li>
                                ))}
                              </ul>
                              <small>{q.explanation || "No explanation"}</small>

                              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => removeQuestion(q._id)}
                                >
                                  Delete Question
                                </button>
                                <button
                                  className="btn btn-warning"
                                  onClick={() => setReportOpen(q._id)}
                                >
                                  Report Question
                                </button>
                              </div>

                              {/* REPORT FORM */}
                              {reportOpen === q._id && (
                                <div
                                  className="report-form"
                                  style={{
                                    border: "1px solid #ddd",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    marginTop: "8px",
                                    background: "#fff8e1",
                                  }}
                                >
                                  <h4>Report This Question</h4>

                                  {/* Radio Buttons */}
                                  <label><b>Reason:</b></label>
                                  <div style={{ display: "flex", gap: "10px" }}>
                                    {["Incorrect Answer", "Offensive Content", "Duplicate Question"].map((r) => (
                                      <label key={r}>
                                        <input
                                          type="radio"
                                          name={`reason-${q._id}`}
                                          value={r}
                                          checked={reportData.reason === r}
                                          onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                                        />
                                        {" "}{r}
                                      </label>
                                    ))}
                                  </div>

                                  {/* Multi-Choice */}
                                  <label><b>Category:</b></label>
                                  <div style={{ display: "flex", gap: "10px" }}>
                                    {["Grammar", "Math Error", "Clarity", "Relevance"].map((c) => (
                                      <label key={c}>
                                        <input
                                          type="checkbox"
                                          value={c}
                                          checked={reportData.categories.includes(c)}
                                          onChange={(e) => {
                                            const selected = reportData.categories.includes(c)
                                              ? reportData.categories.filter((x) => x !== c)
                                              : [...reportData.categories, c];
                                            setReportData({ ...reportData, categories: selected });
                                          }}
                                        />
                                        {" "}{c}
                                      </label>
                                    ))}
                                  </div>

                                  {/* Textbox */}
                                  <textarea
                                    placeholder="Additional details..."
                                    className="input-lg"
                                    style={{ width: "100%", minHeight: "80px", marginTop: "10px" }}
                                    value={reportData.details}
                                    onChange={(e) => setReportData({ ...reportData, details: e.target.value })}
                                  />

                                  {/* Reporter Info */}
                                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                    <input
                                      className="input-lg"
                                      placeholder="Your name"
                                      value={reportData.reporterName}
                                      onChange={(e) => setReportData({ ...reportData, reporterName: e.target.value })}
                                    />
                                    <input
                                      className="input-lg"
                                      placeholder="Your email"
                                      value={reportData.reporterEmail}
                                      onChange={(e) => setReportData({ ...reportData, reporterEmail: e.target.value })}
                                    />
                                  </div>

                                  <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                                    <button className="btn btn-primary" onClick={() => submitReport(q._id)}>
                                      Submit Report
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setReportOpen(null)}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {!sets.length && <div className="empty-state">No sets found.</div>}
                </div>
              </div>
            )}

            {/* ===== CREATE QUIZ SET ===== */}
            {activeSection === "create" && (
              <div className="form-card">
                <h3>Create a Quiz Set</h3>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10 }}>
                  <input
                    className="input-lg"
                    value={setTitle}
                    onChange={(e) => setSetTitle(e.target.value)}
                    placeholder="Set title"
                  />
                  <input
                    className="input-lg"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                  />
                  <select
                    className="input-lg"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                  <button className="btn btn-primary btn-lg" onClick={publishSet} disabled={publishing}>
                    {publishing ? "Publishing..." : "Publish"}
                  </button>
                </div>

                <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                  {qs.map((Q, idx) => (
                    <div key={idx} className="card pretty-card" style={{ flexDirection: "column", gap: 8 }}>
                      <input
                        className="input-lg"
                        placeholder={`Question ${idx + 1}`}
                        value={Q.question}
                        onChange={(e) => setQP(idx, { question: e.target.value })}
                      />
                      {Q.options.map((o, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 6 }}>
                          <input
                            type="radio"
                            name={`ans-${idx}`}
                            checked={Q.answerIndex === i}
                            onChange={() => setQP(idx, { answerIndex: i })}
                          />
                          <input
                            className="input-lg"
                            placeholder={`Option ${i + 1}`}
                            value={o}
                            onChange={(e) => updOpt(idx, i, e.target.value)}
                          />
                          <button className="btn btn-danger btn-sm" onClick={() => rmOpt(idx, i)}>
                            ×
                          </button>
                        </div>
                      ))}
                      <button className="btn btn-secondary btn-sm" onClick={() => addOpt(idx)}>
                        Add Option
                      </button>
                      <textarea
                        className="input-lg"
                        placeholder="Explanation (optional)"
                        value={Q.explanation}
                        onChange={(e) => setQP(idx, { explanation: e.target.value })}
                      />
                      <button className="btn btn-danger btn-sm" onClick={() => delQ(idx)}>
                        Delete Question
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-lg" onClick={addQ}>
                    + Add Another Question
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
