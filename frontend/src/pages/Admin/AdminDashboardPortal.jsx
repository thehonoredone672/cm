import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getPlatformStatistics, getSystemHealth, getAdminActivities } from "../../services/adminDashboardService";
import "../Problems/Problems.css";

export default function AdminDashboardPortal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      setErrorMsg("Access Denied: You do not have administrator permissions to view this portal.");
      setLoading(false);
      return;
    }

    fetchAdminDashboardData();
  }, [user]);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await getPlatformStatistics();
      setStats(statsData);

      const healthData = await getSystemHealth();
      setHealth(healthData);

      const actData = await getAdminActivities({ page: 1, limit: 10 });
      setActivities(actData.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMsg("Access Denied: Admin authorization required.");
      } else {
        setErrorMsg("Failed to load dashboard metrics.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teams-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
        <div className="skeleton-grid">
          <div className="skeleton-item card-skeleton" />
          <div className="skeleton-item card-skeleton" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="lc-problems" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>⚠️ {errorMsg}</h2>
        <button className="lc-admin-p-btn" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1>Platform Operations Console</h1>
          <p className="muted-text" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Overview statistics and telemetry updates for CodeMatch systems.</p>
        </div>
        <button className="lc-submit-btn" onClick={fetchAdminDashboardData}>
          ↻ Refresh Console
        </button>
      </div>

      {/* SYSTEM TELEMETRY HEALTH PANELS */}
      {health && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          
          <div className="stats-card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }}>💾</span>
            <div>
              <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Database Status</span>
              <strong style={{ fontSize: "14px", color: health.database?.status === "HEALTHY" ? "#22c55e" : "#ef4444" }}>
                {health.database?.status} ({health.database?.latency})
              </strong>
            </div>
          </div>

          <div className="stats-card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }}>⚙️</span>
            <div>
              <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Backend Server</span>
              <strong style={{ fontSize: "14px", color: "#22c55e" }}>
                ONLINE (Uptime: {health.backend?.uptime})
              </strong>
            </div>
          </div>

          <div className="stats-card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }}>🖥️</span>
            <div>
              <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Judge0 Sandbox</span>
              <strong style={{ fontSize: "14px", color: "#22c55e" }}>
                CONNECTED
              </strong>
            </div>
          </div>

          <div className="stats-card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }}>⚡</span>
            <div>
              <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Socket.IO server</span>
              <strong style={{ fontSize: "14px", color: "#22c55e" }}>
                ACTIVE
              </strong>
            </div>
          </div>

        </div>
      )}

      {/* CORE SUMMARY STATS CARDS */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          
          <div className="stats-card" style={{ padding: "16px" }}>
            <span className="muted-text" style={{ fontSize: "11px" }}>Total Users</span>
            <h2 style={{ margin: "4px 0", fontSize: "28px" }}>{stats.users?.total}</h2>
            <span className="meta-details" style={{ fontSize: "10px" }}>Admins: {stats.users?.admins} | Students: {stats.users?.students}</span>
          </div>

          <div className="stats-card" style={{ padding: "16px" }}>
            <span className="muted-text" style={{ fontSize: "11px" }}>Total Problems</span>
            <h2 style={{ margin: "4px 0", fontSize: "28px" }}>{stats.problems?.total}</h2>
            <span className="meta-details" style={{ fontSize: "10px" }}>Solutions: {stats.problems?.solutions}</span>
          </div>

          <div className="stats-card" style={{ padding: "16px" }}>
            <span className="muted-text" style={{ fontSize: "11px" }}>Code Submissions</span>
            <h2 style={{ margin: "4px 0", fontSize: "28px" }}>{stats.submissions?.total}</h2>
            <span className="meta-details" style={{ fontSize: "10px" }}>Accepted: {stats.submissions?.accepted}</span>
          </div>

          <div className="stats-card" style={{ padding: "16px" }}>
            <span className="muted-text" style={{ fontSize: "11px" }}>Contests Scheduled</span>
            <h2 style={{ margin: "4px 0", fontSize: "28px" }}>{stats.contests?.total}</h2>
            <span className="meta-details" style={{ fontSize: "10px" }}>Active: {stats.contests?.running} | Completed: {stats.contests?.completed}</span>
          </div>

        </div>
      )}

      {/* QUICK ACTIONS & AUDIT LOGS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
        
        {/* Audit trail activity log */}
        <div className="stats-card" style={{ padding: "24px" }}>
          <h3 className="lc-section-title" style={{ margin: "0 0 16px 0" }}>📜 Operations Audit Trail (Latest Logs)</h3>
          
          <div style={{ background: "var(--background)", borderRadius: "6px", overflow: "hidden" }}>
            <table className="problems-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Operator</th>
                  <th style={{ padding: "10px" }}>Action</th>
                  <th style={{ padding: "10px" }}>Module</th>
                  <th style={{ padding: "10px" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "16px", textAlign: "center" }}>No admin operations logged yet.</td>
                  </tr>
                ) : (
                  activities.map(act => (
                    <tr key={act.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "10px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600" }}>{act.user?.name}</span>
                      </td>
                      <td style={{ padding: "10px" }}>{act.action}</td>
                      <td style={{ padding: "10px" }}>
                        <span className="lc-tag" style={{ margin: 0 }}>{act.module}</span>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ fontSize: "10px" }}>{new Date(act.createdAt).toLocaleTimeString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick action triggers panel */}
        <div className="stats-card" style={{ padding: "24px", height: "fit-content" }}>
          <h3 className="lc-section-title" style={{ margin: "0 0 16px 0" }}>⚡ Quick Operations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button className="lc-submit-btn" style={{ justifyContent: "center" }} onClick={() => navigate("/problems/admin")}>
              Create Coding Problem 💻
            </button>
            <button className="lc-submit-btn" style={{ justifyContent: "center", background: "var(--primary-dark)" }} onClick={() => navigate("/contests")}>
              Create Contest Agenda 📅
            </button>
           
          </div>
        </div>

      </div>

    </motion.div>
  );
}
