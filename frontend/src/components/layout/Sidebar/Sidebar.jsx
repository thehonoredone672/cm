import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getReceivedInvites } from "../../../services/teamInviteService";
import { useAuth } from "../../../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadPendingCount() {
    try {
      const invites = await getReceivedInvites();
      const pending = invites.filter((invite) => invite.status === "PENDING").length;
      setPendingCount(pending);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="sidebar-text">Dashboard</span>
          </div>
        </NavLink>

        <NavLink to="/skills" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="sidebar-text">Skills</span>
          </div>
        </NavLink>

        <NavLink to="/interests" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="sidebar-text">Interests</span>
          </div>
        </NavLink>

        <NavLink to="/matches" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="sidebar-text">Matches</span>
          </div>
        </NavLink>

        <NavLink to="/invites/received" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content" style={{ width: "100%", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="sidebar-text">Invites</span>
            </div>
            {pendingCount > 0 && <span className="sidebar-badge">{pendingCount}</span>}
          </div>
        </NavLink>

        <NavLink to="/invites/sent" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="sidebar-text">Sent</span>
          </div>
        </NavLink>

        <NavLink to="/teams" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="sidebar-text">Teams</span>
          </div>
        </NavLink>

        <NavLink to="/problems" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="sidebar-text">Problems</span>
          </div>
        </NavLink>

        <NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="sidebar-text">Chat</span>
          </div>
        </NavLink>

        <NavLink to="/ecosystem" className={({ isActive }) => isActive ? "active" : ""}>
          <div className="sidebar-link-content">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="sidebar-text">Ecosystem</span>
          </div>
        </NavLink>

        {user?.role === "ADMIN" && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>
            <div className="sidebar-link-content">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="sidebar-text">Admin Panel</span>
            </div>
          </NavLink>
        )}
      </div>

      <div className="sidebar-footer">
        {user ? (
          <NavLink to="/profile" className={({ isActive }) => `sidebar-profile-link${isActive ? " active" : ""}`}>
            <div className="sidebar-profile-avatar">
              {user.name ? user.name[0].toUpperCase() : "?"}
            </div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{user.name}</span>
              <span className="sidebar-profile-email">{user.email}</span>
            </div>
          </NavLink>
        ) : (
          <div className="sidebar-profile-link guest">
            <div className="sidebar-profile-avatar">G</div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">Guest User</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
