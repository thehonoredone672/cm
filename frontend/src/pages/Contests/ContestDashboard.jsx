import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getContestDetails, getContestLeaderboard, getContestAnnouncements } from "../../services/contestService";
import "../Problems/Problems.css";

export default function ContestDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("problems"); // "problems", "leaderboard", "announcements"

  useEffect(() => {
    fetchContestData();
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchContestData = async () => {
    try {
      setLoading(true);
      const data = await getContestDetails(id);
      setContest(data);

      const leadData = await getContestLeaderboard(id);
      setLeaderboard(leadData || []);

      const annData = await getContestAnnouncements(id);
      setAnnouncements(annData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const leadData = await getContestLeaderboard(id);
      setLeaderboard(leadData || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="teams-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
      </div>
    );
  }

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <button className="lc-admin-p-btn" onClick={() => navigate(`/contests/${id}`)} style={{ marginBottom: "8px" }}>
            ← Back to Contest Lobby
          </button>
          <h1>Arena: {contest?.title}</h1>
        </div>
        <span className="lc-tag" style={{ border: "1.5px solid #22c55e", color: "#22c55e", padding: "6px 12px" }}>
          Active Session
        </span>
      </div>

      {/* DASHBOARD TABS */}
      <div style={{ display: "flex", borderBottom: "1.5px solid var(--border)", marginBottom: "20px" }}>
        <button 
          className={`lc-panel-tab ${activeTab === "problems" ? "lc-panel-tab--active" : ""}`}
          onClick={() => setActiveTab("problems")}
          style={{ padding: "12px 24px" }}
        >
          💻 Challenge Problems
        </button>
        <button 
          className={`lc-panel-tab ${activeTab === "leaderboard" ? "lc-panel-tab--active" : ""}`}
          onClick={() => setActiveTab("leaderboard")}
          style={{ padding: "12px 24px" }}
        >
          🏆 Leaderboard Standing
        </button>
        <button 
          className={`lc-panel-tab ${activeTab === "announcements" ? "lc-panel-tab--active" : ""}`}
          onClick={() => setActiveTab("announcements")}
          style={{ padding: "12px 24px" }}
        >
          📢 Announcements ({announcements.length})
        </button>
      </div>

      {/* ACTIVE TAB CONTENT */}
      {activeTab === "problems" && (
        <div style={{ background: "var(--surface)", borderRadius: "8px", border: "1.5px solid var(--border)", overflow: "hidden" }}>
          <table className="problems-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background)", borderBottom: "1.5px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>#</th>
                <th style={{ padding: "12px" }}>Problem</th>
                <th style={{ padding: "12px" }}>Category</th>
                <th style={{ padding: "12px" }}>Points</th>
                <th style={{ padding: "12px" }}>Difficulty</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {contest?.problems?.map((cp, idx) => (
                <tr key={cp.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px" }}>{idx + 1}</td>
                  <td style={{ padding: "12px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{cp.problem?.title}</strong>
                  </td>
                  <td style={{ padding: "12px" }}>{cp.problem?.category}</td>
                  <td style={{ padding: "12px" }}>{cp.points} pts</td>
                  <td style={{ padding: "12px" }}>{cp.problem?.difficulty}</td>
                  <td style={{ padding: "12px" }}>
                    <button className="lc-submit-btn" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => navigate(`/problems/${cp.problemId}/solve`)}>
                      Solve Challenge 🚀
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div style={{ background: "var(--surface)", borderRadius: "8px", border: "1.5px solid var(--border)", overflow: "hidden" }}>
          <table className="problems-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background)", borderBottom: "1.5px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Rank</th>
                <th style={{ padding: "12px" }}>User</th>
                <th style={{ padding: "12px" }}>Solved</th>
                <th style={{ padding: "12px" }}>Score</th>
                <th style={{ padding: "12px" }}>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>
                    <span className="muted-text">No solved submissions yet.</span>
                  </td>
                </tr>
              ) : (
                leaderboard.map((row) => (
                  <tr key={row.rank} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "12px" }}><strong>#{row.rank}</strong></td>
                    <td style={{ padding: "12px" }}>{row.user?.name}</td>
                    <td style={{ padding: "12px" }}>{row.solved}</td>
                    <td style={{ padding: "12px" }}>{row.score} pts</td>
                    <td style={{ padding: "12px" }}>{row.penalty} mins</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "announcements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {announcements.length === 0 ? (
            <div className="stats-card" style={{ padding: "20px", textAlign: "center" }}>
              <span className="muted-text">No announcements posted for this contest.</span>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="stats-card" style={{ padding: "20px" }}>
                <strong style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>{ann.title}</strong>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>{ann.content}</p>
                <span className="meta-details" style={{ fontSize: "10px", marginTop: "10px", display: "block" }}>
                  Posted At: {new Date(ann.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </motion.div>
  );
}
