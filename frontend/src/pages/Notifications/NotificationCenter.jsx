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
import "./NotificationCenter.css";

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

    const handleNewNotification = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    };

    const handleNotificationRead = (updatedNotif) => {
      setNotifications((prev) => prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)));
    };

    const handleNotificationDelete = (payload) => {
      setNotifications((prev) => prev.filter((n) => n.id !== payload.id));
    };

    const handleNotificationUpdate = (payload) => {
      if (payload.isAllRead) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } else if (payload.isAllDeleted) {
        setNotifications([]);
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:read", handleNotificationRead);
    socket.on("notification:delete", handleNotificationDelete);
    socket.on("notification:update", handleNotificationUpdate);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:read", handleNotificationRead);
      socket.off("notification:delete", handleNotificationDelete);
      socket.off("notification:update", handleNotificationUpdate);
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
      const data = await getNotifications(params);
      const safeData = Array.isArray(data) ? data : [];
      setNotifications(safeData);
      setTotalPages(1); // Assume single page or compute based on standard response
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
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
    startOfWeek.setDate(now.getDate() - now.getDay());

    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    safeNotifications.forEach(n => {
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

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <motion.div className="notification-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="notification-center__header">
        <h1>Notifications Center</h1>
        <div className="notification-center__actions">
          <button className="btn-secondary" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
          {safeNotifications.length > 0 && (
            <>
              <button className="btn-primary" onClick={handleMarkAllRead}>✓ Mark All Read</button>
              <button className="btn-danger" onClick={handleDeleteAll}>🗑️ Clear All</button>
            </>
          )}
        </div>
      </div>

      <div className="notification-center__filters">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input 
            type="text" 
            placeholder="Search keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">Search</button>
        </form>

        <select 
          value={filterType} 
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="filter-select"
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
          className="filter-select"
        >
          <option value="">All Read/Unread</option>
          <option value="false">Unread Only</option>
          <option value="true">Read Only</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : safeNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔔</div>
          <h3>Your notifications inbox is completely clear!</h3>
          <p>No new notifications match your current filters.</p>
        </div>
      ) : (
        <div className="grouped-list">
          {Object.entries(groupedNotifications).map(([groupTitle, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={groupTitle} className="notification-group">
                <h3 className="group-title">{groupTitle}</h3>
                <div className="notif-items">
                  {list.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notif-card ${!notif.isRead ? "unread" : ""}`}
                    >
                      <div className="notif-card__body">
                        <span className="notif-card__icon">{TYPE_EMOJI[notif.type] || "🔔"}</span>
                        <div className="notif-card__content">
                          <strong className="notif-card__title">{notif.title}</strong>
                          <p className="notif-card__message">{notif.message}</p>
                          <span className="notif-card__time">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="notif-card__actions">
                        {!notif.isRead && (
                          <button className="btn-read" onClick={() => handleMarkRead(notif.id)}>Mark Read</button>
                        )}
                        <button className="btn-delete" onClick={() => handleDelete(notif.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showSettings && (
          <div className="modal-overlay">
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3>Notification Settings</h3>
              <form onSubmit={handleSavePreferences}>
                <div className="preference-items">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={prefChat} onChange={(e) => setPrefChat(e.target.checked)} />
                    Enable Chat Messages notifications
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={prefTeams} onChange={(e) => setPrefTeams(e.target.checked)} />
                    Enable Team Invites & Requests
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={prefContests} onChange={(e) => setPrefContests(e.target.checked)} />
                    Enable Contest Timers & Start times
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={prefProblems} onChange={(e) => setPrefProblems(e.target.checked)} />
                    Enable Problem Solved & verdicts
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={prefAnnounce} onChange={(e) => setPrefAnnounce(e.target.checked)} />
                    Enable System Announcements & Broadcasts
                  </label>
                </div>

                <div className="modal-actions">
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
