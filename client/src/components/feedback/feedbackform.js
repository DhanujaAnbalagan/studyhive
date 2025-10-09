// src/components/feedback/FeedbackForm.jsx
import React, { Component } from "react";
import axios from "axios";
import Navbar from "../common/Navbar.jsx"; // ← add sidebar
import "../../App.css";

class FeedbackForm extends Component {
  state = {
    user_name: "",
    email: "",
    phone: "",
    password: "",
    rating: "",
    comments: "",
    userType: "",
    features: [],
    feedbackDate: new Date().toISOString().split("T")[0],
    studyTime: "",
    satisfaction: 5,
    themeColor: "#4CAF50",
    subjects: [],
    recommend: false,
    attachment: null,
    emotion: "😊",
    feedbackCategory: "",
    feedbacks: [],
    editId: null,
    searchQuery: "",
  };

  componentDidMount() {
    this.getFeedbacks();
  }

  getFeedbacks = () => {
    axios
      .get("http://localhost:5000/feedback")
      .then((res) => this.setState({ feedbacks: res.data }))
      .catch((err) => console.error("Error fetching feedbacks:", err));
  };

  handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      let array = [...this.state[name]];
      if (checked) array.push(value);
      else array = array.filter((item) => item !== value);
      this.setState({ [name]: array });
    } else if (type === "file") {
      this.setState({ attachment: e.target.files[0]?.name || null });
    } else {
      this.setState({ [name]: value });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { editId, feedbacks, ...data } = this.state;

    if (editId) {
      axios
        .put(`http://localhost:5000/feedback/${editId}`, data) // ← fixed
        .then(() => {
          this.resetForm();
          this.getFeedbacks();
        })
        .catch((err) => console.error("Error updating feedback:", err));
    } else {
      axios
        .post("http://localhost:5000/feedback", data)
        .then(() => {
          this.resetForm();
          this.getFeedbacks();
        })
        .catch((err) => console.error("Error submitting feedback:", err));
    }
  };

  resetForm = () => {
    this.setState({
      user_name: "",
      email: "",
      phone: "",
      password: "",
      rating: "",
      comments: "",
      userType: "",
      features: [],
      feedbackDate: new Date().toISOString().split("T")[0],
      studyTime: "",
      satisfaction: 5,
      themeColor: "#4CAF50",
      subjects: [],
      recommend: false,
      attachment: null,
      emotion: "😊",
      feedbackCategory: "",
      editId: null,
    });
  };

  handleEdit = (fb) => this.setState({ ...fb, editId: fb._id });

  handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      axios
        .delete(`http://localhost:5000/feedback/${id}`) // ← fixed
        .then(() => this.getFeedbacks())
        .catch((err) => console.error("Error deleting feedback:", err));
    }
  };

  filteredFeedbacks = () => {
    const { feedbacks, searchQuery } = this.state;
    return feedbacks.filter(
      (f) =>
        f.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.userType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  render() {
    const {
      user_name,
      email,
      phone,
      password,
      rating,
      comments,
      userType,
      features,
      feedbackDate,
      studyTime,
      satisfaction,
      themeColor,
      subjects,
      recommend,
      emotion,
      feedbackCategory,
      editId,
      searchQuery,
    } = this.state;

    const satisfactionEmojis = ["😡", "😞", "😐", "😊", "🤩"];
    const satisfactionEmoji =
      satisfactionEmojis[Math.floor((satisfaction - 1) / 2)];

    return (
      <div className="full-page-container">
        {/* Sidebar */}
        <Navbar />

        {/* Main */}
        <main className="main-content">
          <div className="top-navbar enhanced-topbar">
            <h1>Feedback</h1>
          </div>

          <div className="dashboard-page">
            <div className="feedback-container">
              <h2>📋 StudyHive Feedback Portal</h2>

              <form className="feedback-form" onSubmit={this.handleSubmit}>
                <div className="form-section">
                  <h3>👤 Personal Information</h3>
                  <div className="form-row">
                    <input
                      type="text"
                      name="user_name"
                      value={user_name}
                      placeholder="Full Name"
                      onChange={this.handleChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      placeholder="Email Address"
                      onChange={this.handleChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      placeholder="Phone Number (10 digits)"
                      onChange={this.handleChange}
                      required
                      pattern="[0-9]{10}"
                    />
                    <input
                      type="password"
                      name="password"
                      value={password}
                      placeholder="Password"
                      onChange={this.handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>🎓 User Details</h3>
                  <label>User Type:</label>
                  <div className="radio-group">
                    {["Student", "Teacher", "Other"].map((type) => (
                      <label key={type}>
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={userType === type}
                          onChange={this.handleChange}
                        />{" "}
                        {type}
                      </label>
                    ))}
                  </div>

                  <label>Feedback Category:</label>
                  <select
                    name="feedbackCategory"
                    value={feedbackCategory}
                    onChange={this.handleChange}
                  >
                    <option value="">Select Category</option>
                    <option value="UI/UX">UI / UX</option>
                    <option value="Performance">Performance</option>
                    <option value="Features">Features</option>
                    <option value="Support">Support</option>
                    <option value="Other">Other</option>
                  </select>

                  <label>Study Time (HH:MM):</label>
                  <input
                    type="time"
                    name="studyTime"
                    value={studyTime}
                    onChange={this.handleChange}
                  />

                  <label>Theme Color Preference:</label>
                  <input
                    type="color"
                    name="themeColor"
                    value={themeColor}
                    onChange={this.handleChange}
                  />
                </div>

                <div className="form-section">
                  <h3>💡 Feedback Details</h3>

                  <label>Emotion:</label>
                  <div className="emotion-group">
                    {["🤩", "😊", "😐", "😞", "😡"].map((emo) => (
                      <span
                        key={emo}
                        className={`emotion-option ${
                          emotion === emo ? "selected" : ""
                        }`}
                        onClick={() => this.setState({ emotion: emo })}
                      >
                        {emo}
                      </span>
                    ))}
                  </div>

                  <label>Features Liked:</label>
                  <div className="checkbox-group">
                    {["Pomodoro", "Dashboard", "Notes", "StudyGroups"].map(
                      (f) => (
                        <label key={f}>
                          <input
                            type="checkbox"
                            name="features"
                            value={f}
                            checked={features.includes(f)}
                            onChange={this.handleChange}
                          />{" "}
                          {f}
                        </label>
                      )
                    )}
                  </div>

                  <label>Subjects:</label>
                  <div className="checkbox-group">
                    {[
                      "Math",
                      "Science",
                      "History",
                      "English",
                      "Programming",
                      "Art",
                    ].map((s) => (
                      <label key={s}>
                        <input
                          type="checkbox"
                          name="subjects"
                          value={s}
                          checked={subjects.includes(s)}
                          onChange={this.handleChange}
                        />{" "}
                        {s}
                      </label>
                    ))}
                  </div>

                  <div className="form-row">
                    <div>
                      <label>Date of Feedback:</label>
                      <input
                        type="date"
                        name="feedbackDate"
                        value={feedbackDate}
                        onChange={this.handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label>Upload File (optional):</label>
                      <input
                        type="file"
                        name="attachment"
                        onChange={this.handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>⭐ Rating & Comments</h3>

                  <label>Rating:</label>
                  <select
                    name="rating"
                    value={rating}
                    onChange={this.handleChange}
                    required
                  >
                    <option value="">Select Rating</option>
                    <option value="1">⭐ Poor</option>
                    <option value="2">⭐⭐ Fair</option>
                    <option value="3">⭐⭐⭐ Good</option>
                    <option value="4">⭐⭐⭐⭐ Very Good</option>
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  </select>

                  <label>
                    Satisfaction Level: {satisfaction}/10 {satisfactionEmoji}
                  </label>
                  <input
                    type="range"
                    name="satisfaction"
                    min="1"
                    max="10"
                    value={satisfaction}
                    onChange={this.handleChange}
                  />

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="recommend"
                      checked={recommend}
                      onChange={this.handleChange}
                    />{" "}
                    Would you recommend StudyHive to others?
                  </label>

                  <label>Comments ({comments.length}/300):</label>
                  <textarea
                    name="comments"
                    value={comments}
                    maxLength="300"
                    placeholder="Please share your thoughts and suggestions..."
                    onChange={this.handleChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  {editId ? "Update Feedback" : "Submit Feedback"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={this.resetForm}
                    className="cancel-btn"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              <div className="feedback-list-section">
                <h3>📑 Submitted Feedbacks</h3>
                <input
                  type="text"
                  placeholder="Search feedbacks..."
                  value={searchQuery}
                  onChange={(e) =>
                    this.setState({ searchQuery: e.target.value })
                  }
                  className="search-bar"
                />
                {this.filteredFeedbacks().length === 0 ? (
                  <p className="no-feedback">No feedback submitted yet.</p>
                ) : (
                  <table className="feedback-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Emotion</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.filteredFeedbacks().map((f) => (
                        <tr key={f._id}>
                          <td>{f.user_name}</td>
                          <td>{f.email}</td>
                          <td>{f.userType}</td>
                          <td>{f.feedbackCategory}</td>
                          <td
                            style={{
                              color: f.rating >= 4 ? "green" : "orange",
                            }}
                          >
                            {"⭐".repeat(f.rating)}
                          </td>
                          <td>{f.emotion}</td>
                          <td>
                            {f.feedbackDate
                              ? new Date(f.feedbackDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <button
                              onClick={() => this.handleEdit(f)}
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => this.handleDelete(f._id)}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default FeedbackForm;
