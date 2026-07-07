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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div className="skeleton-loader" style={{ width: "100%", maxWidth: "600px", height: "200px", borderRadius: "12px" }}></div>
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || "Collaborator"}!</h1>
        <p>Here is a summary of your CodeMatch activity and team formations.</p>
      </div>

      {/* Profile Completion Widget */}
      <div className="completion-container">
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "180px" }}>
          <strong style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>Profile Completion</strong>
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
        <div className="stat-widget" onClick={() => navigate("/skills")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Skills</span>
            <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <span className="stat-widget__value">{stats.skillsCount}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/interests")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Interests</span>
            <svg width="24" height="24" fill="none" stroke="var(--warning)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="stat-widget__value">{stats.interestsCount}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/matches")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Matches</span>
            <svg width="24" height="24" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
          <span className="stat-widget__value">{stats.matchesCount}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/invites/received")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Pending Invites</span>
            <svg width="24" height="24" fill="none" stroke="var(--danger)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="stat-widget__value">{stats.pendingInvites}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/teams")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Teams Joined</span>
            <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="stat-widget__value">{stats.teamsJoinedCount}</span>
        </div>

        <div className="stat-widget" onClick={() => navigate("/chat")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-widget__title">Unread Messages</span>
            <svg width="24" height="24" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="stat-widget__value">{stats.unreadMessagesCount}</span>
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