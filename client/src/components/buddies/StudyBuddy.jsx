import React, { Component } from "react";
import axios from "axios";
import Navbar from "../common/Navbar.jsx";
import "../../App.css";

const API = "http://localhost:5000/api";

class StudyBuddy extends Component {
  state = {
    buddies: [],
    // form fields
    user_id: "",
    email: "",
    preferred_subjects: "",
    availability: [],
    gender_preference: "Both",
    study_date: "",
    time_period: "",
    study_mode: "",
    // ui
    editingId: null,
    searchQuery: "",
    loading: false,
  };

  get auth() {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  componentDidMount() {
    this.fetchBuddies();
  }

  fetchBuddies = async () => {
    try {
      this.setState({ loading: true });
      const res = await axios.get(`${API}/buddies`);
      this.setState({ buddies: res.data });
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to fetch buddies");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  handleAvailability = (e) => {
    const { value, checked } = e.target;
    this.setState((s) => ({
      availability: checked
        ? [...s.availability, value]
        : s.availability.filter((v) => v !== value),
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const {
      user_id,
      email,
      preferred_subjects,
      availability,
      gender_preference,
      study_date,
      time_period,
      study_mode,
      editingId,
    } = this.state;

    if (!email || !preferred_subjects || availability.length === 0) {
      return alert("Please fill Email, Subject and at least one Availability.");
    }

    const payload = {
      user_id: user_id || undefined,
      email,
      preferred_subjects,
      availability,
      gender_preference,
      study_date: study_date || undefined,
      time_period,
      study_mode,
    };

    try {
      if (editingId) {
        await axios.put(`${API}/buddies/${editingId}`, payload, this.auth);
      } else {
        await axios.post(`${API}/buddies`, payload, this.auth);
      }
      this.resetForm();
      this.fetchBuddies();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save buddy");
    }
  };

  resetForm = () => {
    this.setState({
      user_id: "",
      email: "",
      preferred_subjects: "",
      availability: [],
      gender_preference: "Both",
      study_date: "",
      time_period: "",
      study_mode: "",
      editingId: null,
    });
  };

  handleEdit = (b) => {
    this.setState({
      user_id: b.user_id || "",
      email: b.email || "",
      preferred_subjects: b.preferred_subjects || "",
      availability: b.availability || [],
      gender_preference: b.gender_preference || "Both",
      study_date: b.study_date ? String(b.study_date).slice(0, 10) : "",
      time_period: b.time_period || "",
      study_mode: b.study_mode || "",
      editingId: b._id,
    });
  };

  handleDelete = async (id) => {
    if (!window.confirm("Delete this buddy entry?")) return;
    try {
      await axios.delete(`${API}/buddies/${id}`, this.auth);
      this.fetchBuddies();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete");
    }
  };

  handleSearch = async () => {
    const q = this.state.searchQuery.trim();
    if (!q) return this.fetchBuddies();
    try {
      const res = await axios.get(
        `${API}/buddies/search?subject=${encodeURIComponent(q)}`
      );
      this.setState({ buddies: res.data });
    } catch (e) {
      alert(e?.response?.data?.message || "Search failed");
    }
  };

  render() {
    const {
      buddies,
      user_id,
      email,
      preferred_subjects,
      availability,
      gender_preference,
      study_date,
      time_period,
      study_mode,
      editingId,
      searchQuery,
      loading,
    } = this.state;

    return (
      <div className="full-page-container">
        <Navbar />
        <main className="main-content">
          <div className="top-navbar">
            <h1>Study Buddy Finder</h1>
          </div>

          <div className="dashboard-page">
            {/* Add / Edit form */}
            <form onSubmit={this.handleSubmit} className="form-card" style={{ display: "grid", gap: 12 }}>
              <div className="form-row" style={{ display:"grid", gridTemplateColumns: "1fr 1fr 1fr", gap:12 }}>
                <input
                  className="input-lg"
                  name="user_id"
                  value={user_id}
                  placeholder="Your User ID (optional)"
                  onChange={this.handleChange}
                />
                <input
                  className="input-lg"
                  type="email"
                  name="email"
                  value={email}
                  placeholder="Email"
                  onChange={this.handleChange}
                  required
                />
                <select
                  className="input-lg"
                  name="preferred_subjects"
                  value={preferred_subjects}
                  onChange={this.handleChange}
                  required
                >
                  <option value="">Select Subject</option>
                  {[
                    "DSA","Machine Learning","Fullstack","Computer Network","Operating Systems",
                    "DBMS","Data Science","C","C++","Java","Python","JavaScript","Aptitude"
                  ].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="page-subtitle" style={{ marginBottom: 6 }}>Availability</p>
                <div className="options-group" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {["Mornings","Evenings","Weekdays","Weekends"].map((opt) => (
                    <label key={opt} style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input
                        type="checkbox"
                        value={opt}
                        checked={availability.includes(opt)}
                        onChange={this.handleAvailability}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="page-subtitle" style={{ marginBottom: 6 }}>Gender Preference</p>
                <div className="options-group" style={{ display:"flex", gap:12 }}>
                  {["Male","Female","Both"].map((opt) => (
                    <label key={opt} style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input
                        type="radio"
                        name="gender_preference"
                        value={opt}
                        checked={gender_preference === opt}
                        onChange={this.handleChange}
                      />
                      {opt === "Both" ? "Both are preferable" : opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row" style={{ display:"grid", gridTemplateColumns: "1fr 1fr 1fr", gap:12 }}>
                <input
                  className="input-lg"
                  type="date"
                  name="study_date"
                  value={study_date}
                  onChange={this.handleChange}
                />
                <select
                  className="input-lg"
                  name="time_period"
                  value={time_period}
                  onChange={this.handleChange}
                >
                  <option value="">Time Period</option>
                  {["1 Day","1 Week","1 Month","3 Months"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="options-group" style={{ display:"flex", gap:12, alignItems:"center" }}>
                  {["In Person","Online","Hybrid"].map((opt) => (
                    <label key={opt} style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input
                        type="radio"
                        name="study_mode"
                        value={opt}
                        checked={study_mode === opt}
                        onChange={this.handleChange}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <button type="submit" className="btn btn-primary btn-lg">
                  {editingId ? "Update Buddy" : "Add Buddy"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary btn-lg" onClick={this.resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Search */}
            <div className="form-card" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="input-lg"
                type="text"
                placeholder="Search by subject (e.g., DBMS)"
                value={searchQuery}
                onChange={(e) => this.setState({ searchQuery: e.target.value })}
              />
              <button className="btn btn-secondary" onClick={this.handleSearch}>Search</button>
            </div>

            {/* Results */}
            {loading ? (
              <div className="skeleton-list" />
            ) : (
              <div className="card-list">
                {buddies.length === 0 ? (
                  <div className="empty-state">No results found</div>
                ) : (
                  buddies.map((b) => (
                    <div className="card" key={b._id}>
                      <div className="item-main">
                        <div className="item-title">
                          {(b.user_id || "User")} — {b.preferred_subjects}
                        </div>
                        <div className="item-sub">{b.email}</div>
                        <div className="item-sub">{(b.availability || []).join(", ")}</div>
                        <div className="item-sub">
                          {b.gender_preference} • {b.time_period} • {b.study_mode}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <a
                          className="btn btn-primary"
                          href={`mailto:${b.email}?subject=Study Buddy - ${encodeURIComponent(
                            b.preferred_subjects || ""
                          )}`}
                        >
                          Contact
                        </a>
                        <button className="btn btn-secondary" onClick={() => this.handleEdit(b)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => this.handleDelete(b._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
}

export default StudyBuddy;
