import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../context/SocketContext";
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification, 
  deleteAllNotifications, 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from "../../services/notificationService";
import "../Problems/Problems.css";

const TYPE_EMOJI = {
  CHAT: "💬",
  TEAM: "👥",
  CONTEST: "📅",
  SUBMISSION: "💻",
  SYSTEM: "📢"
};

export default function NotificationCenter() {
  const { socket } = useSocket();

  // Core Lists States
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Settings preferences states
  const [showSettings, setShowSettings] = useState(false);
  const [prefChat, setPrefChat] = useState(true);
  const [prefTeams, setPrefTeams] = useState(true);
  const [prefContests, setPrefContests] = useState(true);
  const [prefProblems, setPrefProblems] = useState(true);
  const [prefAnnounce, setPrefAnnounce] = useState(true);

  // Filters & searches
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRead, setFilterRead] = useState(""); // "" (all), "true" (read), "false" (unread)

  useEffect(() => {
    fetchNotificationsList();
  }, [page, filterType, filterRead]);

  // Set up realtime Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    socket.on("notification:read", (updatedNotif) => {
      setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
    });

    socket.on("notification:delete", (payload) => {
      setNotifications(prev => prev.filter(n => n.id !== payload.id));
    });

    socket.on("notification:update", (payload) => {
      if (payload.isAllRead) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } else if (payload.isAllDeleted) {
        setNotifications([]);
      }
    });

    return () => {
      socket.off("notification:new");
      socket.off("notification:read");
      socket.off("notification:delete");
      socket.off("notification:update");
    };
  }, [socket]);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchNotificationsList = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        type: filterType || undefined,
        isRead: filterRead || undefined,
        search: search || undefined
      };
      const res = await getNotifications(params);
      setNotifications(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      if (prefs) {
        setPrefChat(prefs.chat ?? true);
        setPrefTeams(prefs.teams ?? true);
        setPrefContests(prefs.contests ?? true);
        setPrefProblems(prefs.problems ?? true);
        setPrefAnnounce(prefs.announcements ?? true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotificationsList();
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to clear all your notifications?")) return;
    try {
      await deleteAllNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await updateNotificationPreferences({
        chat: prefChat,
        teams: prefTeams,
        contests: prefContests,
        problems: prefProblems,
        announcements: prefAnnounce,
        marketing: true
      });
      setShowSettings(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Group notifications dynamically: Today, Yesterday, This Week, Earlier
  const groupedNotifications = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: []
    };

    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay()); // start of week Sunday

    notifications.forEach(n => {
      const notifDate = new Date(n.createdAt);
      const notifDateStr = notifDate.toDateString();

      if (notifDateStr === todayStr) {
        groups.Today.push(n);
      } else if (notifDateStr === yesterdayStr) {
        groups.Yesterday.push(n);
      } else if (notifDate >= startOfWeek) {
        groups["This Week"].push(n);
      } else {
        groups.Earlier.push(n);
      }
    });

    return groups;
  }, [notifications]);

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Inbox Notifications</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-table-action" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
          {notifications.length > 0 && (
            <>
              <button className="btn-table-action" onClick={handleMarkAllRead}>✓ Mark All Read</button>
              <button className="btn-table-action" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={handleDeleteAll}>🗑️ Clear All</button>
            </>
          )}
        </div>
      </div>

      {/* FILTER OPTIONS */}
      <div className="problems-filters-row" style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "240px" }}>
          <input 
            type="text" 
            placeholder="Search keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)" }}
          />
          <button type="submit" className="lc-run-btn" style={{ padding: "8px 14px" }}>Search</button>
        </form>

        <select 
          value={filterType} 
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          style={{ padding: "8px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
        >
          <option value="">All Types</option>
          <option value="CHAT">Chat messages</option>
          <option value="TEAM">Teams invites</option>
          <option value="CONTEST">Contests updates</option>
          <option value="SUBMISSION">Compiler verdicts</option>
          <option value="SYSTEM">System Broadcasts</option>
        </select>

        <select 
          value={filterRead} 
          onChange={(e) => { setFilterRead(e.target.value); setPage(1); }}
          style={{ padding: "8px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
        >
          <option value="">All Read/Unread</option>
          <option value="false">Unread Only</option>
          <option value="true">Read Only</option>
        </select>
      </div>

      {/* GROUPED LISTS */}
      {loading ? (
        <div className="lc-spinner" style={{ padding: "40px" }}>
          <div className="lc-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="stats-card" style={{ padding: "40px", textAlign: "center" }}>
          <span className="muted-text">Your notifications inbox is completely clear! ✨</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {Object.entries(groupedNotifications).map(([groupTitle, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={groupTitle}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", borderBottom: "1px solid var(--border)", paddingBottom: "6px", marginBottom: "12px", color: "var(--text-secondary)" }}>
                  {groupTitle}
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {list.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`stats-card ${!notif.isRead ? "active-border" : ""}`}
                      style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: !notif.isRead ? "4px solid var(--primary)" : "none" }}
                    >
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "20px" }}>{TYPE_EMOJI[notif.type] || "🔔"}</span>
                        <div>
                          <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{notif.title}</strong>
                          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>{notif.message}</p>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        {!notif.isRead && (
                          <button className="btn-table-action" onClick={() => handleMarkRead(notif.id)}>Mark Read</button>
                        )}
                        <button className="btn-table-action" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={() => handleDelete(notif.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "12px", marginTop: "16px" }}>
          <button className="btn-table-action" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "13px" }}>Page {page} of {totalPages}</span>
          <button className="btn-table-action" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}

      {/* PREFERENCES SETTINGS MODAL */}
      <AnimatePresence>
        {showSettings && (
          <div className="create-modal-overlay" style={{ zIndex: 1100 }}>
            <motion.div className="create-modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3>Notification Inbox Settings</h3>
              <form onSubmit={handleSavePreferences} className="modal-form" style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={prefChat} onChange={(e) => setPrefChat(e.target.checked)} />
                    Enable Chat Messages notifications
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={prefTeams} onChange={(e) => setPrefTeams(e.target.checked)} />
                    Enable Team Invites & Requests
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={prefContests} onChange={(e) => setPrefContests(e.target.checked)} />
                    Enable Contest Timers & Start times
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={prefProblems} onChange={(e) => setPrefProblems(e.target.checked)} />
                    Enable Problem Solved & verdicts
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={prefAnnounce} onChange={(e) => setPrefAnnounce(e.target.checked)} />
                    Enable System Announcements & Broadcasts
                  </label>
                </div>

                <div className="modal-actions" style={{ marginTop: "24px" }}>
                  <button type="submit" className="btn-primary">Save Preferences</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
