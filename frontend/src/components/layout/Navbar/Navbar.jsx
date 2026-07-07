import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  return (
    <header className="navbar">
      <div className="navbar__left">
        <h2>CodeMatch</h2>
      </div>

      <div className="navbar__right">
        {/* Theme Toggle Button */}
        <button 
          className="theme-toggle-btn" 
          onClick={() => setIsDark(!isDark)}
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {isAuthenticated && user ? (
          <div className="navbar__user">
            <NotificationDropdown />
            <span className="navbar__username">{user.name}</span>
            <button className="logout-btn" onClick={logout} title="Sign Out">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <span className="guest-badge">Guest</span>
        )}
      </div>
    </header>
  );
}