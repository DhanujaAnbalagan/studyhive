import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar.jsx";
import "../../App.css";

export default function PomodoroTimer() {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work"); // "work" or "break"
  const [startTime, setStartTime] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [tag, setTag] = useState("General");
  const [notes, setNotes] = useState("");
  const [streak, setStreak] = useState(0);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isRunning && time > 0) {
      timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    } else if (time === 0 && isRunning) {
      handleSwitchMode();
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  // Save session
  const saveSession = async () => {
    if (!startTime) return;

    const sessionData = {
      mode,
      duration: 25 * 60 - time, // actual time spent
      startTime,
      endTime: new Date(),
      tag,
      notes,
    };

    setSessions((prev) => [...prev, sessionData]);

    try {
      await fetch("http://localhost:5000/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  const handleSwitchMode = async () => {
    await saveSession();

    if (mode === "work") {
      setMode("break");
      setTime(5 * 60);
      setStreak((prev) => prev + 1);
    } else {
      setMode("work");
      setTime(25 * 60);
    }

    setIsRunning(false);
    setStartTime(null);
  };

  const handleStartPause = () => {
    if (!isRunning && !startTime) setStartTime(new Date());
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const duration = parseInt(e.target.duration.value) || 25;
    const tagValue = e.target.tag.value || "General";
    const notesValue = e.target.notes.value || "";

    setTime(duration * 60);
    setTag(tagValue);
    setNotes(notesValue);
    setStartTime(new Date());
    setIsRunning(true);
  };

  return (
    <div className="full-page-container">
      <Navbar />
      <main className="main-content" style={{ marginLeft: "50px", padding: "40px" }}>
        <div className="pomodoro-card">
          <h1 className="page-title">
            {mode === "work" ? "Work Session" : "Break Time"}
          </h1>
          <h2 className="timer-display">{formatTime(time)}</h2>

          {/* Session setup form */}
          <form className="session-form" onSubmit={handleFormSubmit}>
            <label>Session Tag</label>
            <input
              type="text"
              name="tag"
              placeholder="e.g., DSA Practice"
              defaultValue={tag}
            />

            <label>Duration (minutes)</label>
            <input type="number" name="duration" min="5" max="60" defaultValue={25} />

            <label>Notes</label>
            <textarea name="notes" placeholder="What will you focus on?" />

            <button type="submit" className="primary-btn">
              Start New Session
            </button>
          </form>

          {/* Timer controls */}
          <div className="timer-controls">
            <button onClick={handleStartPause} className="primary-btn">
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={handleSwitchMode} className="secondary-btn">
              Skip
            </button>
          </div>

          <p className="streak">🔥 Current Streak: {streak} work sessions</p>

          {/* Recent sessions table */}
          <div className="recent-sessions">
            <h3>Recent Sessions</h3>
            {sessions.length > 0 ? (
              <table className="session-table">
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Duration</th>
                    <th>Tag</th>
                    <th>Notes</th>
                    <th>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(-5).map((s, i) => (
                    <tr key={i}>
                      <td>{s.mode}</td>
                      <td>{Math.round(s.duration / 60)} mins</td>
                      <td>{s.tag}</td>
                      <td>{s.notes || "—"}</td>
                      <td>{new Date(s.endTime).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No sessions yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
