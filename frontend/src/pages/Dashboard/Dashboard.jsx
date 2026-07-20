import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { getDashboardStats } from "../../services/dashboardService";
import { getMatches } from "../../services/matchService";
import { getReceivedInvites, acceptInvite, rejectInvite } from "../../services/teamInviteService";
import { getLatestSubmissions } from "../../services/submissionService";
import { getProblems } from "../../services/problemService";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core Data States
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [invites, setInvites] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [
          statsData,
          matchesData,
          invitesData,
          subsData,
          hacksData
        ] = await Promise.all([
          getDashboardStats(),
          getMatches(),
          getReceivedInvites(),
          getLatestSubmissions(),
          getProblems()
        ]);

        setStats(statsData);
        setMatches(Array.isArray(matchesData) ? matchesData.slice(0, 3) : []);
        setInvites(Array.isArray(invitesData) ? invitesData.filter((i) => i.status === "PENDING") : []);
        setSubmissions(Array.isArray(subsData) ? subsData : []);


      // Fetch hackathons from backend
      const response = await api.get("/hackathons");
      if (response?.data?.success) {
        setHackathons(Array.isArray(response.data.data) ? response.data.data.slice(0, 2) : []);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to synchronize dashboard metrics. Reconnecting...");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await acceptInvite(inviteId);
      triggerToast("Invitation accepted successfully!");
      loadDashboardData();
    } catch (e) {
      triggerToast(e.response?.data?.message || "Could not accept invitation");
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await rejectInvite(inviteId);
      triggerToast("Invitation rejected.");
      loadDashboardData();
    } catch (e) {
      triggerToast(e.response?.data?.message || "Could not reject invitation");
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="dashboard-loading-wrapper">
        <div className="skeleton-grid">
          <div className="skeleton-item hero-skeleton" />
          <div className="skeleton-item stats-skeleton" />
          <div className="skeleton-item stats-skeleton" />
          <div className="skeleton-item stats-skeleton" />
          <div className="skeleton-item feed-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-wrapper">
        <div className="error-card">
          <span style={{ fontSize: "36px" }}>📡</span>
          <h3>Sync Interrupted</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadDashboardData}>Retry Synchronization</button>
        </div>
      </div>
    );
  }

  // Profile completion missing checklist
  const missingChecklist = [];
  if (stats?.userDetails) {
    const ud = stats.userDetails;
    if (!ud.bio) missingChecklist.push({ label: "Add Bio Statement", path: "/profile" });
    if (!ud.githubUrl) missingChecklist.push({ label: "Link GitHub Username", path: "/profile" });
    if (!ud.linkedinUrl) missingChecklist.push({ label: "Link LinkedIn URL", path: "/profile" });
    if (!ud.hasSkills) missingChecklist.push({ label: "Define Tech Skills", path: "/profile" });
    if (!ud.hasInterests) missingChecklist.push({ label: "Set Interests Tags", path: "/profile" });
    if (!ud.hasProjects) missingChecklist.push({ label: "Showcase Projects", path: "/profile" });
  }

  const cs = stats?.codingSummary || { solvedCount: 0, submissionsCount: 0, successRate: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };

  return (
    <motion.div 
      className="dashboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="dashboard-toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span>💬 {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Welcome Section & Admin Status */}
      <div className="dashboard-header-container">
        <div className="welcome-avatar-wrapper">
          <div className="welcome-avatar-circle">
            {user?.name ? user.name[0].toUpperCase() : "C"}
          </div>
          <div>
            <span className="time-greeting">{getGreeting()},</span>
            <h1 className="welcome-name">{user?.name || "Collaborator"}</h1>
            <p className="welcome-bio">{user?.bio || "Set a profile biography to let matches know your skillsets."}</p>
            <div className="welcome-meta-tags">
              <span className="role-tag">{user?.role || "STUDENT"}</span>
              {user?.college && <span className="college-tag">🏫 {user.college}</span>}
            </div>
          </div>
        </div>

        {user?.role === "ADMIN" && (
          <motion.div 
            className="admin-badge-container"
            whileHover={{ scale: 1.02 }}
          >
            <span className="shield-icon">🛡️</span>
            <div>
              <strong>Administrator Access</strong>
              <p>System settings unlocked</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Admin Panel Statistics */}
      {user?.role === "ADMIN" && stats?.adminStats && (
        <motion.div 
          className="admin-dashboard-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="section-title">🛡️ System Platform Metrics</h2>
          <div className="stats-cards-grid">
            <motion.div className="stats-card-item" variants={cardVariants}>
              <span className="stats-card-label">Global Accounts</span>
              <span className="stats-card-value">{stats.adminStats.totalUsers}</span>
            </motion.div>
            <motion.div className="stats-card-item" variants={cardVariants}>
              <span className="stats-card-label">Active Submitters</span>
              <span className="stats-card-value highlight">{stats.adminStats.activeUsers}</span>
            </motion.div>
            <motion.div className="stats-card-item" variants={cardVariants}>
              <span className="stats-card-label">Total Teams</span>
              <span className="stats-card-value">{stats.adminStats.totalTeams}</span>
            </motion.div>
            <motion.div className="stats-card-item" variants={cardVariants}>
              <span className="stats-card-label">Problem Sets</span>
              <span className="stats-card-value">{stats.adminStats.totalProblems}</span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main Grid: Statistics & Progress Dashboard */}
      <div className="dashboard-grid-layout">
        
        {/* Left Side: Stats cards & Quick Actions */}
        <div className="dashboard-left-panel">
          
          {/* 3. Statistics Cards Grid (8 Cards) */}
          <div className="stats-cards-grid">
            <div className="stats-card-item clickable" onClick={() => navigate("/profile")}>
              <span className="stats-card-icon">📂</span>
              <span className="stats-card-label">Projects</span>
              <span className="stats-card-value">{stats?.projectsCount || 0}</span>
            </div>
            <div className="stats-card-item clickable" onClick={() => navigate("/profile")}>
              <span className="stats-card-icon">🏷️</span>
              <span className="stats-card-label">Skills</span>
              <span className="stats-card-value">{stats?.skillsCount || 0}</span>
            </div>
            <div className="stats-card-item clickable" onClick={() => navigate("/profile")}>
              <span className="stats-card-icon">❤️</span>
              <span className="stats-card-label">Interests</span>
              <span className="stats-card-value">{stats?.interestsCount || 0}</span>
            </div>
            <div className="stats-card-item clickable" onClick={() => navigate("/matches")}>
              <span className="stats-card-icon">🤝</span>
              <span className="stats-card-label">Matches</span>
              <span className="stats-card-value">{stats?.matchesCount || 0}</span>
            </div>
            <div className="stats-card-item clickable" onClick={() => navigate("/teams")}>
              <span className="stats-card-icon">👥</span>
              <span className="stats-card-label">Teams</span>
              <span className="stats-card-value">{stats?.teamsJoinedCount || 0}</span>
            </div>
            <div className="stats-card-item clickable" onClick={() => navigate("/problems")}>
              <span className="stats-card-icon">⚔️</span>
              <span className="stats-card-label">Solved</span>
              <span className="stats-card-value highlight">{cs.solvedCount}</span>
            </div>
            <div className="stats-card-item clickable" onClick={() => navigate("/ecosystem")}>
              <span className="stats-card-icon">✍️</span>
              <span className="stats-card-label">Applications</span>
              <span className="stats-card-value">{stats?.applicationsCount || 0}</span>
            </div>
            <div className="stats-card-item clickable" onClick={() => navigate("/chat")}>
              <span className="stats-card-icon">💬</span>
              <span className="stats-card-label">Messages</span>
              <span className="stats-card-value">{stats?.messagesCount || 0}</span>
            </div>
          </div>

          {/* 4. Quick Actions Panel */}
          <div className="quick-actions-section">
            <h3 className="section-title">⚡ Quick Actions</h3>
            <div className="actions-buttons-row">
              <button onClick={() => navigate("/profile")}>Edit Profile</button>
              <button onClick={() => navigate("/matches")}>Find Matches</button>
              <button onClick={() => navigate("/problems")}>Browse Problems</button>
              <button onClick={() => navigate("/teams")}>Create Team</button>
              <button onClick={() => navigate("/chat")}>View Chat</button>
            </div>
          </div>

          {/* 8. Recent Problem Solving Submissions */}
          <div className="recent-submissions-section">
            <h3 className="section-title">⚔️ Recent Submissions</h3>
            {submissions.length === 0 ? (
              <div className="empty-sub-card">No recent code submissions. Visit the problems board to start practicing.</div>
            ) : (
              <div className="submissions-list">
                {submissions.map(sub => (
                  <div key={sub.id} className="sub-item-card" onClick={() => navigate(`/problems/${sub.problemId}`)}>
                    <div>
                      <strong className="prob-title">{sub.problem?.title || "Problem Code"}</strong>
                      <div className="sub-meta-row">
                        <span>Language: {sub.language}</span>
                        {sub.executionTime && <span>Runtime: {sub.executionTime}ms</span>}
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`verdict-badge ${sub.status.toLowerCase()}`}>{sub.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Profile completion progress, Recommended matching, Team invites */}
        <div className="dashboard-right-panel">
          
          {/* 2. Profile Completion Widget */}
          <div className="completion-card">
            <div className="completion-card-header">
              <h3>Profile Completion</h3>
              <span className="completion-pct-badge">{stats?.profileCompletion}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${stats?.profileCompletion}%` }} />
            </div>

            {/* List missing fields */}
            {missingChecklist.length > 0 ? (
              <div className="missing-fields-container">
                <span className="missing-title">Complete your profile to increase match rates:</span>
                <div className="missing-badges-row">
                  {missingChecklist.map((item, idx) => (
                    <span key={idx} className="missing-badge" onClick={() => navigate(item.path)}>
                      {item.label} ➔
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="profile-complete-status">✔ Your profile is fully complete! Maximum matchmaking compatibility enabled.</span>
            )}
          </div>

          {/* Coding Progress Widget */}
          <div className="completion-card coding-progress-card">
            <div className="completion-card-header">
              <h3>Coding Progress</h3>
              <span className="completion-pct-badge">{cs.solvedCount} Solved</span>
            </div>
            
            <div className="progress-details-grid" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Easy Progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ color: "#22c55e", fontWeight: "600" }}>Easy</span>
                  <span>{cs.easySolved}</span>
                </div>
                <div className="progress-bar-container" style={{ height: "6px" }}>
                  <div className="progress-bar-fill" style={{ width: `${cs.solvedCount > 0 ? (cs.easySolved / cs.solvedCount) * 100 : 0}%`, background: "#22c55e" }} />
                </div>
              </div>

              {/* Medium Progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ color: "#ffb800", fontWeight: "600" }}>Medium</span>
                  <span>{cs.mediumSolved}</span>
                </div>
                <div className="progress-bar-container" style={{ height: "6px" }}>
                  <div className="progress-bar-fill" style={{ width: `${cs.solvedCount > 0 ? (cs.mediumSolved / cs.solvedCount) * 100 : 0}%`, background: "#ffb800" }} />
                </div>
              </div>

              {/* Hard Progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ color: "#ef4444", fontWeight: "600" }}>Hard</span>
                  <span>{cs.hardSolved}</span>
                </div>
                <div className="progress-bar-container" style={{ height: "6px" }}>
                  <div className="progress-bar-fill" style={{ width: `${cs.solvedCount > 0 ? (cs.hardSolved / cs.solvedCount) * 100 : 0}%`, background: "#ef4444" }} />
                </div>
              </div>

              {/* Success Rate */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "4px" }}>
                <span className="muted-text" style={{ fontSize: "12px" }}>Success Rate:</span>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{cs.successRate}%</strong>
              </div>
            </div>
          </div>

          {/* 7. Pending Team Invitations Received */}
          {invites.length > 0 && (
            <div className="pending-invites-section">
              <h3 className="section-title">🤝 Pending Team Invites</h3>
              <div className="invites-list">
                {invites.map(invite => (
                  <div key={invite.id} className="invite-card-item">
                    <div>
                      <strong>Invite from {invite.sender?.name}</strong>
                      <p className="invite-desc">{invite.message || "Wants to collaborate on code challenges."}</p>
                    </div>
                    <div className="invite-actions-row">
                      <button className="btn-accept" onClick={() => handleAcceptInvite(invite.id)}>Accept</button>
                      <button className="btn-reject" onClick={() => handleRejectInvite(invite.id)}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Recommended Students Matches */}
          <div className="recommended-students-section">
            <h3 className="section-title">👥 Recommended Peers</h3>
            {matches.length === 0 ? (
              <div className="empty-matches-card">No recommended profile matches. Expand your skills profile tags list to find peers.</div>
            ) : (
              <div className="matches-list">
                {matches.map(match => (
                  <div key={match.id} className="match-card-item">
                    <div className="match-avatar">
                      {match.name ? match.name[0].toUpperCase() : "M"}
                    </div>
                    <div className="match-details">
                      <strong>{match.name}</strong>
                      <span className="match-score">🎯 {match.compatibilityScore}% Compatibility</span>
                      <div className="match-skills-row">
                        {match.skills?.slice(0, 3).map(s => (
                          <span key={s} className="skill-bubble">{s}</span>
                        ))}
                      </div>
                    </div>
                    <button className="btn-view-profile" onClick={() => navigate("/matches")}>View</button>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* 10. Upcoming Events & Hackathons */}
          <div className="upcoming-events-section">
            <h3 className="section-title">📅 Upcoming Hackathons</h3>
            {hackathons.length === 0 ? (
              <div className="empty-hacks-card">No registered upcoming hackathons. Visit the Ecosystem to register.</div>
            ) : (
              <div className="hackathons-list">
                {hackathons.map(h => (
                  <div key={h.id} className="hackathon-card-item" onClick={() => navigate("/ecosystem")}>
                    <strong>{h.title}</strong>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      <span>📅 {new Date(h.date).toLocaleDateString()}</span>
                      <span style={{ color: "var(--primary)", fontWeight: "bold" }}>Registered</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}