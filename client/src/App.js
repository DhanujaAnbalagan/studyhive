import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthChoice from "./components/auth/AuthChoice.jsx"
import Login from "./components/auth/Login.jsx";
import Signup from "./components/auth/Signup.jsx";
import Landing from "./components/dashboard/Landing.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Assignment from "./components/tasks/Assignment.jsx";
import TasksManager from "./components/tasks/TasksManager.jsx";
import Notes from "./components/notes/Notes.jsx"
import Profile from "./components/profile/Profile.jsx"
import ReportBug from "./components/profile/ReportBug.jsx"
import "./App.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthChoice />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/:userId" element={<Landing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/reportbug" element={<ReportBug />} />
          <Route path="/tasks" element={<TasksManager />} />
          <Route path="/assignments" element={<Assignment />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;