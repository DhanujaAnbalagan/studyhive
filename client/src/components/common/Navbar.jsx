import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdAssignment,
  MdChecklistRtl,
  MdSettings,
  MdNotes,
} from "react-icons/md";
import "../../App.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage if not passed as prop
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "240px",
    background: "#0e0e0e",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: "25px 20px",
    gap: "10px",
    boxSizing: "border-box",
  };

  const brandStyle = {
    fontSize: "24px",
    fontWeight: "700",
    textDecoration: "none",
    color: "white",
    marginBottom: "35px",
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#7a5cff" : "#ccc",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    borderRadius: "8px",
    width: "100%",
    transition: "all 0.2s ease",
    background:
      location.pathname === path ? "rgba(122, 92, 255, 0.15)" : "transparent",
  });

  const linkHover = (e, enter) => {
    e.target.style.background = enter
      ? "rgba(255,255,255,0.1)"
      : "transparent";
  };

  const logoutStyle = {
    marginTop: "auto",
    width: "100%",
    background: "transparent",
    border: "2px solid #7a5cff",
    borderRadius: "8px",
    padding: "10px 0",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const dashboardPath = user ? `/dashboard/${user._id}` : "/dashboard";

  return (
    <aside style={sidebarStyle}>
      <Link to={dashboardPath} style={brandStyle}>
        StudyHive
      </Link>

      <Link
        to={dashboardPath}
        style={linkStyle(dashboardPath)}
        onMouseEnter={(e) => linkHover(e, true)}
        onMouseLeave={(e) => linkHover(e, false)}
      >
        <MdDashboard /> Dashboard
      </Link>

      <Link
        to="/notes"
        style={linkStyle("/notes")}
        onMouseEnter={(e) => linkHover(e, true)}
        onMouseLeave={(e) => linkHover(e, false)}
      >
        <MdNotes /> Notes
      </Link>

      <Link
        to="/tasks"
        style={linkStyle("/tasks")}
        onMouseEnter={(e) => linkHover(e, true)}
        onMouseLeave={(e) => linkHover(e, false)}
      >
        <MdChecklistRtl /> Tasks
      </Link>

      <Link
        to="/assignments"
        style={linkStyle("/assignments")}
        onMouseEnter={(e) => linkHover(e, true)}
        onMouseLeave={(e) => linkHover(e, false)}
      >
        <MdAssignment /> Assignments
      </Link>

      <Link
        to="/profile"
        style={linkStyle("/profile")}
        onMouseEnter={(e) => linkHover(e, true)}
        onMouseLeave={(e) => linkHover(e, false)}
      >
        <MdSettings /> Profile
      </Link>

      <button
        style={logoutStyle}
        onClick={handleLogout}
        onMouseEnter={(e) => (e.target.style.background = "#7a5cff")}
        onMouseLeave={(e) => (e.target.style.background = "transparent")}
      >
        Logout
      </button>
    </aside>
  );
};

export default Navbar;
