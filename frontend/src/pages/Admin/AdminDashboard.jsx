import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Stats / Overview state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userBlockFilter, setUserBlockFilter] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Teams state
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [loadingAnn, setLoadingAnn] = useState(false);

  // Maintenance state
  const [maintenance, setMaintenance] = useState(false);

  // Status message state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsersList();
    } else if (activeTab === "teams") {
      fetchTeamsList();
    } else if (activeTab === "reports") {
      fetchReportsList();
    } else if (activeTab === "settings") {
      fetchAnnouncementsList();
      fetchMaintenanceMode();
    }
  }, [activeTab, userPage, userSearch, userRoleFilter, userBlockFilter]);

  const fetchOverviewStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load overview statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get("/admin/users", {
        params: {
          search: userSearch,
          role: userRoleFilter,
          isBlocked: userBlockFilter,
          page: userPage,
          limit: 8
        }
      });
      setUsers(res.data.data.users);
      setUserTotal(res.data.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTeamsList = async () => {
    try {
      setLoadingTeams(true);
      const res = await api.get("/admin/teams");
      setTeams(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchReportsList = async () => {
    try {
      setLoadingReports(true);
      const res = await api.get("/admin/reports");
      setReports(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchAnnouncementsList = async () => {
    try {
      setLoadingAnn(true);
      const res = await api.get("/admin/announcements");
      setAnnouncements(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnn(false);
    }
  };

  const fetchMaintenanceMode = async () => {
    try {
      const res = await api.get("/admin/maintenance");
      setMaintenance(res.data.data.active);
    } catch (err) {
      console.error(err);
    }
  };

  const showFeedback = (success, error) => {
    if (success) {
      setSuccessMsg(success);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  // Actions
  const handleToggleBlock = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/block`);
      showFeedback(res.data.message);
      fetchUsersList();
    } catch (err) {
      showFeedback("", "Failed to update user block status.");
    }
  };

  const handleToggleRole = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`);
      showFeedback(res.data.message);
      fetchUsersList();
    } catch (err) {
      showFeedback("", "Failed to update user role.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This will remove all their data.")) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      showFeedback(res.data.message);
      fetchUsersList();
    } catch (err) {
      showFeedback("", "Failed to delete user.");
    }
  };

  const handleDisbandTeam = async (id) => {
    if (!window.confirm("Are you sure you want to disband this team?")) return;
    try {
      const res = await api.delete(`/admin/teams/${id}`);
      showFeedback(res.data.message);
      fetchTeamsList();
    } catch (err) {
      showFeedback("", "Failed to disband team.");
    }
  };

  const handleResolveReport = async (id, status) => {
    try {
      const res = await api.put(`/admin/reports/${id}`, { status });
      showFeedback(res.data.message);
      fetchReportsList();
    } catch (err) {
      showFeedback("", "Failed to resolve report.");
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    try {
      await api.post("/admin/announcements", { title: annTitle, content: annContent });
      setAnnTitle("");
      setAnnContent("");
      showFeedback("Announcement published.");
      fetchAnnouncementsList();
    } catch (err) {
      showFeedback("", "Failed to create announcement.");
    }
  };

  const handleToggleAnnouncement = async (id) => {
    try {
      await api.put(`/admin/announcements/${id}/toggle`);
      fetchAnnouncementsList();
    } catch (err) {
      showFeedback("", "Failed to toggle announcement.");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      fetchAnnouncementsList();
    } catch (err) {
      showFeedback("", "Failed to delete announcement.");
    }
  };

  const handleToggleMaintenance = async () => {
    const nextVal = !maintenance;
    try {
      const res = await api.post("/admin/maintenance", { active: nextVal });
      setMaintenance(nextVal);
      showFeedback(res.data.message);
    } catch (err) {
      showFeedback("", "Failed to toggle maintenance mode.");
    }
  };

  return (
    <div className="admin-page">
      {/* Admin header */}
      <div className="admin-header">
        <h1>🛡️ Administration Control Panel</h1>
        <p>Manage platform configurations, monitor server stats, review user reports, and moderate content.</p>
      </div>

      {/* Feedback Messages */}
      {successMsg && <div className="feedback success">{successMsg}</div>}
      {errorMsg && <div className="feedback error">{errorMsg}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>📊 System Overview</button>
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>👥 Users Manager</button>
        <button className={activeTab === "teams" ? "active" : ""} onClick={() => setActiveTab("teams")}>🛡️ Teams Moderation</button>
        <button className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}>⚠️ Filed Reports</button>
        <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>⚙️ Settings & Broadcasts</button>
      </div>

      <div className="admin-content">
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {loadingStats ? (
              <div className="skeleton-loader" style={{ height: "200px" }} />
            ) : stats ? (
              <>
                {/* Stats cards */}
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <span className="title">Registered Users</span>
                    <span className="value">{stats.totalUsers}</span>
                  </div>
                  <div className="admin-stat-card">
                    <span className="title">Active Submitters</span>
                    <span className="value">{stats.activeUsers}</span>
                  </div>
                  <div className="admin-stat-card">
                    <span className="title">Teams Formed</span>
                    <span className="value">{stats.totalTeams}</span>
                  </div>
                  <div className="admin-stat-card">
                    <span className="title">Platform Challenges</span>
                    <span className="value">{stats.totalProblems}</span>
                  </div>
                </div>

                {/* System Diagnostics */}
                <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>💻 Diagnostics & Server Resources</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "13px" }}>
                    <div>
                      <div className="diag-row"><span>Node.js Version:</span> <strong>{stats.systemOverview.nodeVersion}</strong></div>
                      <div className="diag-row"><span>Server Uptime:</span> <strong>{stats.systemOverview.uptimeSeconds} seconds</strong></div>
                    </div>
                    <div>
                      <div className="diag-row"><span>Heap Memory Used:</span> <strong>{stats.systemOverview.memoryUsedMB} MB</strong></div>
                      <div className="diag-row"><span>Heap Memory Total:</span> <strong>{stats.systemOverview.memoryTotalMB} MB</strong></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>Failed to load stats.</div>
            )}
          </div>
        )}

        {/* 2. Users Manager Tab */}
        {activeTab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Filter and search controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "10px" }}>
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                style={{ padding: "8px 14px", width: "100%" }}
              />
              <select value={userRoleFilter} onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }} style={{ padding: "8px 14px" }}>
                <option value="">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select value={userBlockFilter} onChange={(e) => { setUserBlockFilter(e.target.value); setUserPage(1); }} style={{ padding: "8px 14px" }}>
                <option value="">All Statuses</option>
                <option value="false">Active Only</option>
                <option value="true">Blocked Only</option>
              </select>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <div className="skeleton-loader" style={{ height: "200px" }} />
            ) : users.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No users match filter query.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-secondary)", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>Name</th>
                      <th style={{ padding: "10px" }}>Email</th>
                      <th style={{ padding: "10px" }}>Role</th>
                      <th style={{ padding: "10px" }}>Status</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 10px", fontWeight: "bold" }}>{u.name}</td>
                        <td style={{ padding: "12px 10px" }}>{u.email}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ fontSize: "11px", background: u.role === "ADMIN" ? "#f59e0b" : "var(--border)", color: u.role === "ADMIN" ? "#fff" : "var(--text-secondary)", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ fontSize: "11px", color: u.isBlocked ? "#ef4444" : "#22c55e", fontWeight: "bold" }}>
                            {u.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right", display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleToggleRole(u.id)}>Toggle Role</button>
                          <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: u.isBlocked ? "#22c55e" : "#ef4444" }} onClick={() => handleToggleBlock(u.id)}>
                            {u.isBlocked ? "Unblock" : "Block"}
                          </button>
                          <button className="btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {userTotal > 8 && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "center" }}>
                    <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} disabled={userPage === 1} onClick={() => setUserPage(userPage - 1)}>Prev</button>
                    <span style={{ fontSize: "13px", alignSelf: "center" }}>Page {userPage}</span>
                    <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} disabled={users.length < 8} onClick={() => setUserPage(userPage + 1)}>Next</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Teams Moderation Tab */}
        {activeTab === "teams" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loadingTeams ? (
              <div className="skeleton-loader" style={{ height: "200px" }} />
            ) : teams.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No teams have been created yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-secondary)", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>Team Name</th>
                      <th style={{ padding: "10px" }}>Leader</th>
                      <th style={{ padding: "10px" }}>Members</th>
                      <th style={{ padding: "10px" }}>Join Code</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map(t => (
                      <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 10px", fontWeight: "bold" }}>{t.name}</td>
                        <td style={{ padding: "12px 10px" }}>{t.leader.name} ({t.leader.email})</td>
                        <td style={{ padding: "12px 10px" }}>{t._count.members}</td>
                        <td style={{ padding: "12px 10px", fontFamily: "monospace" }}>{t.joinCode}</td>
                        <td style={{ padding: "12px 10px", textAlign: "right" }}>
                          <button className="btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleDisbandTeam(t.id)}>Disband Team</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Filed Reports Tab */}
        {activeTab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loadingReports ? (
              <div className="skeleton-loader" style={{ height: "200px" }} />
            ) : reports.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No user reports have been filed.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-secondary)", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>Reporter</th>
                      <th style={{ padding: "10px" }}>Target Type</th>
                      <th style={{ padding: "10px" }}>Target ID</th>
                      <th style={{ padding: "10px" }}>Reason</th>
                      <th style={{ padding: "10px" }}>Status</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 10px" }}>{r.reporter.name}</td>
                        <td style={{ padding: "12px 10px", fontWeight: "bold" }}>{r.targetType}</td>
                        <td style={{ padding: "12px 10px", fontFamily: "monospace", fontSize: "11px" }}>{r.targetId}</td>
                        <td style={{ padding: "12px 10px" }}>{r.reason}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ fontSize: "11px", color: r.status === "PENDING" ? "#f59e0b" : "#22c55e", fontWeight: "bold" }}>{r.status}</span>
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right", display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          {r.status === "PENDING" ? (
                            <>
                              <button className="btn-primary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleResolveReport(r.id, "RESOLVED")}>Resolve</button>
                              <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleResolveReport(r.id, "DISMISSED")}>Dismiss</button>
                            </>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Settings & Announcements Tab */}
        {activeTab === "settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
            
            {/* Maintenance Mode & Configuration */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>⚙️ Maintenance Settings</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.4 }}>
                  Toggling Maintenance Mode will block student access, showing a clean system status notice page. Useful for migrations or patching.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button className={maintenance ? "btn-danger" : "btn-primary"} style={{ padding: "10px 18px" }} onClick={handleToggleMaintenance}>
                    {maintenance ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
                  </button>
                  <strong style={{ fontSize: "12px", color: maintenance ? "#ef4444" : "var(--text-muted)" }}>
                    {maintenance ? "System Offline" : "System Online"}
                  </strong>
                </div>
              </div>

              {/* Announcements List */}
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Active Broadcast Banners</h3>
                {loadingAnn ? (
                  <div className="skeleton-loader" style={{ height: "80px" }} />
                ) : announcements.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No announcements active.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {announcements.map(ann => (
                      <div key={ann.id} style={{ padding: "10px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", justifyBetween: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: "13px" }}>{ann.title}</strong>
                          <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>{ann.content}</p>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleToggleAnnouncement(ann.id)}>
                            {ann.active ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => handleDeleteAnnouncement(ann.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Create Announcement Form */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>📢 Broadcast System Announcement</h3>
              <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Announcement Title</label>
                  <input type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="e.g. Server Maintenance tonight" required style={{ width: "100%", padding: "10px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Content Details</label>
                  <textarea rows="4" value={annContent} onChange={(e) => setAnnContent(e.target.value)} placeholder="Enter details..." required style={{ width: "100%", padding: "10px" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "12px", marginTop: "10px" }}>Broadcast Banner</button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
