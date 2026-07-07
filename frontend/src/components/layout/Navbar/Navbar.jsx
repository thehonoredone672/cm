import { useAuth } from "../../../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="navbar" style={{ padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="navbar__left">
        <h2 style={{ margin: 0 }}>CodeMatch</h2>
      </div>

      <div className="navbar__right">
        {isAuthenticated && user ? (
          <div className="navbar__user" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <NotificationDropdown />
            <span className="navbar__username" style={{ fontWeight: 600 }}>{user.name}</span>
            <button 
              className="logout-btn" 
              onClick={logout}
              style={{
                background: "var(--danger)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: 500
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <span>Guest</span>
        )}
      </div>
    </header>
  );
}