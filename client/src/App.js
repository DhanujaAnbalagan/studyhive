// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthChoice from "./components/auth/AuthChoice.jsx";
import Login from "./components/auth/Login.jsx";
import Signup from "./components/auth/Signup.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import Landing from "./components/dashboard/Landing.jsx";
import Assignment from "./components/tasks/Assignment.jsx";
import TasksManager from "./components/tasks/TasksManager.jsx";
import Notes from "./components/notes/Notes.jsx";
import Materials from "./components/notes/Materials.jsx";
import Profile from "./components/profile/Profile.jsx";
import ReportBug from "./components/profile/ReportBug.jsx";
import PomodoroTimer from "./components/pomodoro/pomodorotimer.jsx";
import SessionHistory from "./components/pomodoro/sessionhistory.jsx";
import FeedbackForm from "./components/feedback/feedbackform.js";

import StudyBuddy from "./components/buddies/StudyBuddy.jsx";
import StudyGroup from "./components/groups/StudyGroup.jsx";
import QuizPool from "./components/quiz/QuizPool.jsx";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<AuthChoice />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/:userId" element={<Landing />} />
          <Route path="/dashboard" element={<Landing />} />
          <Route path="/quizzes" element={<QuizPool />} />
          <Route path="/assignments" element={<Assignment />} />
          <Route path="/tasks" element={<TasksManager />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reportbug" element={<ReportBug />} />
          <Route path="/pomodoro" element={<PomodoroTimer />} />
          <Route path="/session-history" element={<SessionHistory />} />
          <Route path="/feedback" element={<FeedbackForm />} />

          <Route path="/buddy" element={<StudyBuddy />} />
          <Route path="/group" element={<StudyGroup />} />
        </Route>
      </Routes>
    </Router>
  );
}
