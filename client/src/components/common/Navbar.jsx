import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard, MdTimer, MdGroup, MdGroups, MdAssignment, MdChecklist,
  MdDescription, MdFeedback, MdPerson,
} from "react-icons/md";
import "../../App.css";

const navClass = ({ isActive }) => (isActive ? "active" : "");

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.username || "User";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="logo">StudyHive</div>

      <div className="user-info">
        <div className="user-name">👋 {name}</div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li><NavLink to="/dashboard" className={navClass}><MdDashboard /><span>Dashboard</span></NavLink></li>
          <li><NavLink to="/pomodoro" className={navClass}><MdTimer /><span>Pomodoro Timer</span></NavLink></li>
          <li><NavLink to="/buddy" className={navClass}><MdGroup /><span>Study Buddy</span></NavLink></li>
          <li><NavLink to="/group" className={navClass}><MdGroups /><span>Study Group</span></NavLink></li>
          <li><NavLink to="/assignments" className={navClass}><MdAssignment /><span>Assignments</span></NavLink></li>
          <li><NavLink to="/tasks" className={navClass}><MdChecklist /><span>To-Do List</span></NavLink></li>
          <li><NavLink to="/materials" className={navClass}><MdDescription /><span>Notes</span></NavLink></li>
          <li><NavLink to="/feedback" className={navClass}><MdFeedback /><span>Feedback</span></NavLink></li>
          <li><NavLink to="/profile" className={navClass}><MdPerson /><span>Profile</span></NavLink></li>
          <li><NavLink to="/quizzes" className={({isActive}) => isActive ? "active" : ""}>
    <MdAssignment /> <span>Quiz Pool</span>
  </NavLink>
</li>

        </ul>
      </nav>

      <button className="logout-btn" onClick={logout}>Logout</button>
    </aside>
  );
}
