import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
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
        <h2>Gathering live statistics...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)" }}>{error}</div>
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || "Collaborator"}!</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>Here is a summary of your CodeMatch activity and team formations.</p>
      </div>

      {/* Profile Completion Widget */}
      <div className="completion-container">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "160px" }}>
          <strong style={{ fontSize: "15px" }}>Profile Completion</strong>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary)" }}>{stats.profileCompletion}%</span>
        </div>
        <div className="completion-bar-outer">
          <div className="completion-bar-inner" style={{ width: `${stats.profileCompletion}%` }} />
        </div>
        {stats.profileCompletion < 100 && (
          <button 
            className="btn-secondary" 
            onClick={() => navigate("/profile")}
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Complete Profile
          </button>
        )}
      </div>

      {/* Grid of Stats Widgets */}
      <div className="dashboard-grid">
        <div className="stat-widget" onClick={() => navigate("/skills")} style={{ cursor: "pointer" }}>
          <span className="stat-widget__title">Skills Added</span>
          <span className="stat-widget__value">{stats.skillsCount}</span>
        </div>

        <div className="stat-widget warning" onClick={() => navigate("/interests")} style={{ cursor: "pointer" }}>
          <span className="stat-widget__title">Interests Added</span>
          <span className="stat-widget__value">{stats.interestsCount}</span>
        </div>

        <div className="stat-widget success" onClick={() => navigate("/matches")} style={{ cursor: "pointer" }}>
          <span className="stat-widget__title">Recommended Matches</span>
          <span className="stat-widget__value">{stats.matchesCount}</span>
        </div>

        <div className="stat-widget danger" onClick={() => navigate("/invites/received")} style={{ cursor: "pointer" }}>
          <span className="stat-widget__title">Pending Invites</span>
          <span className="stat-widget__value">{stats.pendingInvites}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/teams")} style={{ cursor: "pointer" }}>
          <span className="stat-widget__title">Teams Joined</span>
          <span className="stat-widget__value">{stats.teamsJoinedCount}</span>
        </div>

        <div className="stat-widget success" onClick={() => navigate("/chat")} style={{ cursor: "pointer" }}>
          <span className="stat-widget__title">Unread Messages</span>
          <span className="stat-widget__value">{stats.unreadMessagesCount}</span>
        </div>
      </div>

      {/* Timeline of Recent Activity */}
      <div className="timeline-card">
        <h2>Recent Activity Feed</h2>
        {stats.recentActivity.length === 0 ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>
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