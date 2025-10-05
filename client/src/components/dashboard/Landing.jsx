import React, { useEffect, useState, useCallback } from "react";
import { MdTimer, MdFlashOn, MdAssignmentTurnedIn, MdGroup, MdOutlineDone } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../common/Navbar.jsx";
import "../../App.css";
import { useParams, useNavigate } from "react-router-dom";

const API_ASSIGNMENTS = "http://localhost:5000/api/assignments";
const API_TASKS = "http://localhost:5000/api/tasks";

const safeJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (ct.includes("application/json")) return { ok: res.ok, data: JSON.parse(text || "{}") };
  return { ok: res.ok, data: { message: text || res.statusText } };
};

const DashboardCard = ({ title, value, description, icon }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <span className="card-title">{title}</span>
      {icon}
    </div>
    <div className="card-content">
      <span className="value">{value}</span>
      <span className="description">{description}</span>
    </div>
  </div>
);

const AssignmentItem = ({ id, name, subject, dueDate, onDelete }) => (
  <div className="assignment-item">
    <div className="assignment-details">
      <h4 className="name">{name}</h4>
      <span className="subject">{subject}</span>
    </div>
    <span className="assignment-due-date">Due: {new Date(dueDate).toLocaleDateString()}</span>
    <button onClick={() => onDelete(id)} className="delete-btn">
      <FaTrashAlt />
    </button>
  </div>
);

const Landing = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { ok, data } = await safeJson(res);
      if (ok) setUser(data);
      else console.error(data.message || "Failed to load user profile");
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }, [token]);


  const fetchAssignments = useCallback(async () => {
    const res = await fetch(API_ASSIGNMENTS, { headers: { Authorization: `Bearer ${token}` } });
    const { ok, data } = await safeJson(res);
    if (ok) setAssignments(data);
    else console.error(data.message || "Failed to fetch assignments");
  }, [token]);

  const fetchTasks = useCallback(async () => {
    const res = await fetch(API_TASKS, { headers: { Authorization: `Bearer ${token}` } });
    const { ok, data } = await safeJson(res);
    if (ok) setTasks(data);
    else console.error(data.message || "Failed to fetch tasks");
  }, [token]);

  useEffect(() => {
    fetchUser();
    fetchAssignments();
    fetchTasks();
  }, [fetchUser, fetchAssignments, fetchTasks]);


  // Delete assignment from the widget (keeps everything in sync)
  const handleDeleteAssignment = async (id) => {
    const res = await fetch(`${API_ASSIGNMENTS}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const { ok, data } = await safeJson(res);
    if (!ok) return alert(data.message || "Failed to delete assignment");
    setAssignments((prev) => prev.filter((a) => a._id !== id));
  };

  // Filter: assignments due in ≤ 2 days (including today)
  const upcomingAssignments = assignments.filter((a) => {
    if (!a.dueDate) return false;
    const due = new Date(a.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  });

  const firstFiveTasks = tasks.slice(0, 5);

  return (
    <div className="full-page-container">
      <Navbar />
      <main className="main-content" style={{ marginLeft: "240px", padding: "30px" }}>

        <div className="top-navbar">
          <h1>Welcome{user ? `, ${user.username}` : ""}!</h1>
        </div>

        <div className="dashboard-page">
          {/* Study Progress Section */}
          <div className="study-progress">
            <DashboardCard
              title="Today's Pomodoros"
              value=""
              description=""
              icon={<MdTimer />}
            />
            <DashboardCard
              title="Study Streak"
              value=""
              description=""
              icon={<MdFlashOn />}
            />
            <DashboardCard
              title="Assignments"
              value={assignments.length}
              description=""
              icon={<MdAssignmentTurnedIn />}
            />
            <DashboardCard
              title="Study Buddies"
              value=""
              description=""
              icon={<MdGroup />}
            />
          </div>

          {/* Tasks + Upcoming Assignments */}
          <div className="dashboard-widgets">
            {/* To-Do (first 5 tasks) */}
            <div className="upcoming-tasks-container">
              <h3>To-Do List</h3>
              <p>Your top priorities for today.</p>
              <div className="tasks-list">
                {firstFiveTasks.length ? (
                  firstFiveTasks.map((t) => (
                    <div key={t._id} className="task-item">
                      <span className="task-name" style={{ textDecoration: t.completed ? "line-through" : "none" }}>
                        {t.name}
                      </span>
                      <MdOutlineDone className="task-done-icon" />
                    </div>
                  ))
                ) : (
                  <p>No tasks to display.</p>
                )}
                <div className="task-actions">
                  <Link to="/tasks">
                    <button>Go to To-Do List</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Assignments (≤ 2 days) */}
            <div className="upcoming-assignments-container">
              <h3>Upcoming Assignments</h3>
              <p>Due within 2 days</p>
              <div className="assignments-list">
                {upcomingAssignments.length ? (
                  upcomingAssignments.map((a) => (
                    <AssignmentItem
                      key={a._id}
                      id={a._id}
                      name={a.name}
                      subject={a.subject}
                      dueDate={a.dueDate}
                      onDelete={handleDeleteAssignment}
                    />
                  ))
                ) : (
                  <p>No upcoming assignments.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
