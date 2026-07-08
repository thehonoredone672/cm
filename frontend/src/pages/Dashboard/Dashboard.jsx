import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../services/dashboardService";
import { getRecommendedTeams, getRecommendedProblems } from "../../services/recommendationService";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Recommendations state
  const [recTeams, setRecTeams] = useState([]);
  const [recProblems, setRecProblems] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      // Fetch recommendations
      const [teamsData, probsData] = await Promise.all([
        getRecommendedTeams(),
        getRecommendedProblems(),
      ]);
      setRecTeams(teamsData);
      setRecProblems(probsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div className="skeleton-loader" style={{ width: "100%", maxWidth: "800px", height: "300px", borderRadius: "12px" }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div style={{ background: "var(--danger-glow)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "16px", borderRadius: "var(--radius-sm)" }}>{error}</div>
      </div>
    );
  }

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getActivityClass = (type) => {
    return type.toLowerCase();
  };

  const cs = stats.codingSummary || { solvedCount: 0, submissionsCount: 0, successRate: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, heatmap: [] };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1>Welcome back, {user?.name || "Collaborator"}!</h1>
          <p>Explore recommended matches, stats analytics, and coding challenges.</p>
        </div>
        {user?.role === "ADMIN" && (
          <span style={{ fontSize: "12px", background: "rgba(229, 231, 235, 0.1)", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: "15px", fontWeight: "bold" }}>
            🛡 Admin Account
          </span>
        )}
      </div>

      {/* Admin Panel Metrics Card (Sprint 3.10) */}
      {user?.role === "ADMIN" && stats.adminStats && (
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--primary)", padding: "24px", borderRadius: "12px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 16px 0", color: "var(--text-primary)" }}>🛡 Admin Platform Analytics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", background: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Total Users</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>{stats.adminStats.totalUsers}</div>
            </div>
            <div style={{ padding: "16px", background: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Active Users (Submitters)</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>{stats.adminStats.activeUsers}</div>
            </div>
            <div style={{ padding: "16px", background: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Total Teams Created</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>{stats.adminStats.totalTeams}</div>
            </div>
            <div style={{ padding: "16px", background: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Total Coding Problems</span>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>{stats.adminStats.totalProblems}</div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Widget */}
      <div className="completion-container">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "180px" }}>
          <strong style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Profile Completion</strong>
          <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>{stats.profileCompletion}%</span>
        </div>
        <div className="completion-bar-outer">
          <div className="completion-bar-inner" style={{ width: `${stats.profileCompletion}%` }} />
        </div>
        {stats.profileCompletion < 100 && (
          <button 
            className="btn-primary" 
            onClick={() => navigate("/profile")}
            style={{ padding: "10px 20px" }}
          >
            Complete Profile
          </button>
        )}
      </div>

      {/* Grid of Stats Widgets */}
      <div className="dashboard-grid">
        <div className="stat-widget" onClick={() => navigate("/skills")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Skills Added</span>
            <span style={{ fontSize: "20px" }}>🏷️</span>
          </div>
          <span className="stat-widget__value">{stats.skillsCount}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/interests")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Interests</span>
            <span style={{ fontSize: "20px" }}>❤️</span>
          </div>
          <span className="stat-widget__value">{stats.interestsCount}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/matches")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Compatibilities</span>
            <span style={{ fontSize: "20px" }}>🤝</span>
          </div>
          <span className="stat-widget__value">{stats.matchesCount}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/teams")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Teams formed</span>
            <span style={{ fontSize: "20px" }}>👥</span>
          </div>
          <span className="stat-widget__value">{stats.teamsJoinedCount}</span>
        </div>
      </div>

      {/* Coding Summary and Heatmap Section (Sprint 3.9 & 3.10) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Coding Summary & Solves progress */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 20px 0" }}>Coding Summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>{cs.solvedCount}</div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Solved</span>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>{cs.submissionsCount}</div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Submissions</span>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--success)" }}>{cs.successRate}%</div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Success Rate</span>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span>Easy Problems Solved</span>
                <strong>{cs.easySolved}</strong>
              </div>
              <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${cs.solvedCount > 0 ? (cs.easySolved / cs.solvedCount) * 100 : 0}%`, background: "#22c55e", borderRadius: "3px" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span>Medium Problems Solved</span>
                <strong>{cs.mediumSolved}</strong>
              </div>
              <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${cs.solvedCount > 0 ? (cs.mediumSolved / cs.solvedCount) * 100 : 0}%`, background: "#f59e0b", borderRadius: "3px" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span>Hard Problems Solved</span>
                <strong>{cs.hardSolved}</strong>
              </div>
              <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${cs.solvedCount > 0 ? (cs.hardSolved / cs.solvedCount) * 100 : 0}%`, background: "#ef4444", borderRadius: "3px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Coding Activity timeline */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 20px 0" }}>Activity Timeline (7 Days)</h2>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: "120px", padding: "10px 0" }}>
            {cs.heatmap && cs.heatmap.map((h, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px",
                  height: `${Math.min(h.count * 15 + 10, 80)}px`,
                  background: h.count > 0 ? "var(--primary)" : "var(--border)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold"
                }}>
                  {h.count > 0 ? h.count : ""}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation Section (Sprint 3.8) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Recommended Teams */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 16px 0" }}>Recommended Teams</h2>
          {recTeams.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No recommended teams available right now.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recTeams.map((team) => (
                <div key={team.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "14px" }}>{team.name}</h4>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Leader: {team.leader}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "bold" }}>{team.compatibilityScore}% match</span>
                    <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => navigate("/teams")}>Join</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Problems */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 16px 0" }}>Recommended Coding Tasks</h2>
          {recProblems.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No recommended tasks. Great job!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recProblems.map((prob) => (
                <div key={prob.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "14px" }}>{prob.title}</h4>
                    <div style={{ display: "flex", gap: "6px", fontSize: "10px", marginTop: "2px" }}>
                      <span className={`lc-diff-badge lc-diff-badge--${prob.difficulty.toLowerCase()}`} style={{ padding: "0px 6px" }}>{prob.difficulty}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{prob.category}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "bold" }}>{prob.recommendationScore}% fit</span>
                    <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => navigate(`/problems/${prob.id}`)}>Solve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="timeline-card">
        <h2>Recent Activity Feed</h2>
        {stats.recentActivity.length === 0 ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "24px 0" }}>
            No recent activity logged. Start matching or invite others to see activities!
          </div>
        ) : (
          <div className="timeline-list">
            {stats.recentActivity.map((act) => (
              <div key={act.id} className="timeline-item">
                <div className={`timeline-dot ${getActivityClass(act.type)}`} />
                <div className="timeline-content">
                  <span className="timeline-text">{act.text}</span>
                  <div className="timeline-meta">
                    <span>{formatActivityDate(act.date)}</span>
                    <span style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: 700 }}>
                      {act.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}