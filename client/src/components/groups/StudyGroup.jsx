import React, { Component } from "react";
import axios from "axios";
import Navbar from "../common/Navbar.jsx";
import "../../App.css";

const API = "http://localhost:5000/api";

class StudyGroup extends Component {
  state = {
    groups: [],
    // form fields
    group_name: "",
    subject: "",
    description: "",
    max_members: "",
    privacy_type: "Public",
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
    this.fetchGroups();
  }

  fetchGroups = async () => {
    try {
      this.setState({ loading: true });
      const res = await axios.get(`${API}/groups`);
      this.setState({ groups: res.data });
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to fetch groups");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = async (e) => {
    e.preventDefault();
    const { group_name, subject, description, max_members, privacy_type, editingId } = this.state;

    if (!group_name || !subject) return alert("Please enter Group Name and Subject.");

    const payload = {
      group_name,
      subject,
      description,
      max_members: max_members ? Number(max_members) : undefined,
      privacy_type,
    };

    try {
      if (editingId) {
        await axios.put(`${API}/groups/${editingId}`, payload, this.auth);
      } else {
        await axios.post(`${API}/groups`, payload, this.auth);
      }
      this.resetForm();
      this.fetchGroups();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save group");
    }
  };

  resetForm = () => {
    this.setState({
      group_name: "",
      subject: "",
      description: "",
      max_members: "",
      privacy_type: "Public",
      editingId: null,
    });
  };

  handleEdit = (g) => {
    this.setState({
      group_name: g.group_name || "",
      subject: g.subject || "",
      description: g.description || "",
      max_members: g.max_members || "",
      privacy_type: g.privacy_type || "Public",
      editingId: g._id,
    });
  };

  handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await axios.delete(`${API}/groups/${id}`, this.auth);
      this.fetchGroups();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete");
    }
  };

  handleSearch = async () => {
    const q = this.state.searchQuery.trim();
    if (!q) return this.fetchGroups();
    try {
      const res = await axios.get(`${API}/groups/search?q=${encodeURIComponent(q)}`);
      this.setState({ groups: res.data });
    } catch (e) {
      alert(e?.response?.data?.message || "Search failed");
    }
  };

  join = async (id) => {
    try {
      await axios.post(`${API}/groups/${id}/join`, {}, this.auth);
      this.fetchGroups(); // refresh members count
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to join group");
    }
  };

  render() {
    const {
      groups,
      group_name,
      subject,
      description,
      max_members,
      privacy_type,
      editingId,
      searchQuery,
      loading,
    } = this.state;

    return (
      <div className="full-page-container">
        <Navbar />
        <main className="main-content">
          <div className="top-navbar">
            <h1>Study Group Creator / Finder</h1>
          </div>

          <div className="dashboard-page">
            {/* Add / Edit form */}
            <form onSubmit={this.handleSubmit} className="form-card" style={{ display:"grid", gap:12 }}>
              <div className="form-row" style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr", gap:12 }}>
                <input
                  className="input-lg"
                  name="group_name"
                  value={group_name}
                  placeholder="Group name"
                  onChange={this.handleChange}
                  required
                />
                <input
                  className="input-lg"
                  name="subject"
                  value={subject}
                  placeholder="Subject (e.g., DBMS)"
                  onChange={this.handleChange}
                  required
                />
                <select
                  className="input-lg"
                  name="privacy_type"
                  value={privacy_type}
                  onChange={this.handleChange}
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <textarea
                className="input-lg"
                style={{ minHeight: 90 }}
                name="description"
                value={description}
                placeholder="Short description (optional)"
                onChange={this.handleChange}
              />

              <div className="form-row" style={{ display:"grid", gridTemplateColumns:"200px auto", gap:12 }}>
                <input
                  className="input-lg"
                  type="number"
                  min="1"
                  name="max_members"
                  value={max_members}
                  placeholder="Max members (optional)"
                  onChange={this.handleChange}
                />
                <div style={{ display:"flex", gap:8 }}>
                  <button type="submit" className="btn btn-primary btn-lg">
                    {editingId ? "Update Group" : "Create Group"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary btn-lg" onClick={this.resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Search */}
            <div className="form-card" style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input
                className="input-lg"
                type="text"
                placeholder="Search groups by subject/name/description"
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
                {groups.length === 0 ? (
                  <div className="empty-state">No groups found</div>
                ) : (
                  groups.map((g) => (
                    <div className="card" key={g._id}>
                      <div className="item-main">
                        <div className="item-title">{g.group_name} — {g.subject}</div>
                        <div className="item-sub">{g.description || "No description"}</div>
                        <div className="item-sub">
                          {(g.members?.length || 0)} member(s)
                          {g.max_members ? ` / ${g.max_members}` : ""} • {g.privacy_type || "Public"}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button className="btn btn-primary" onClick={() => this.join(g._id)}>Join</button>
                        <button className="btn btn-secondary" onClick={() => this.handleEdit(g)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => this.handleDelete(g._id)}>Delete</button>
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

export default StudyGroup;
