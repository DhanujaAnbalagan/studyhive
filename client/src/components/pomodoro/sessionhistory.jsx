import { useEffect, useState } from "react";
import Navbar from "../common/Navbar.jsx";
import "../../App.css";

export default function SessionHistory({ organized = true }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.warn("Unexpected data format:", data);
          setSessions([]);
          return;
        }
        // Sort sessions by latest first
        data.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
        setSessions(data);
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
        setError("Unable to load sessions.");
      })
      .finally(() => setLoading(false));
  }, []);

  // While loading
  if (loading) {
    return (
      <div className="full-page-container">
        <Navbar />
        <main className="main-content" style={{ marginLeft: "240px", padding: "40px" }}>
          <h2>Loading your sessions...</h2>
        </main>
      </div>
    );
  }

  // Handle fetch error
  if (error) {
    return (
      <div className="full-page-container">
        <Navbar />
        <main className="main-content" style={{ marginLeft: "240px", padding: "40px" }}>
          <h2>{error}</h2>
        </main>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="full-page-container">
        <Navbar />
        <main className="main-content" style={{ marginLeft: "240px", padding: "40px" }}>
          <h2>No sessions recorded yet.</h2>
          <p>Start a Pomodoro session to see your history here.</p>
        </main>
      </div>
    );
  }

  // Group sessions into Today / Yesterday / Older
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Older: [] };

  sessions.forEach((s) => {
    const d = new Date(s.endTime);
    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      groups.Today.push(s);
    } else if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      groups.Yesterday.push(s);
    } else {
      groups.Older.push(s);
    }
  });

  return (
    <div className="full-page-container">
      <Navbar />
      <main className="main-content" style={{ marginLeft: "240px", padding: "40px" }}>
        <h1 style={{ marginBottom: "20px" }}>Session History</h1>

        {Object.entries(groups).map(([groupName, groupSessions]) =>
          groupSessions.length > 0 ? (
            <div key={groupName} className="session-group">
              <h2 style={{ marginTop: "20px", marginBottom: "10px" }}>{groupName}</h2>
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
                  {groupSessions.map((s, idx) => (
                    <tr key={idx} className={s.mode === "work" ? "work-row" : "break-row"}>
                      <td>{s.mode}</td>
                      <td>{Math.round(s.duration / 60)} mins</td>
                      <td>{s.tag || "—"}</td>
                      <td>{s.notes || "—"}</td>
                      <td>{new Date(s.endTime).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null
        )}
      </main>
    </div>
  );
}
