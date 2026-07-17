import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getContests, registerForContest } from "../../services/contestService";
import "../Problems/Problems.css";

export default function ContestList() {
  const navigate = useNavigate();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchContestsList();
  }, []);

  const fetchContestsList = async () => {
    try {
      setLoading(true);
      const data = await getContests();
      setContests(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegister = async (e, id) => {
    e.stopPropagation();
    try {
      await registerForContest(id);
      triggerToast("Successfully registered for contest!");
      fetchContestsList();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Registration failed.");
    }
  };

  const activeContests = contests.filter(c => c.status === "ACTIVE");
  const upcomingContests = contests.filter(c => c.status === "UPCOMING");
  const completedContests = contests.filter(c => c.status === "COMPLETED");

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

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {toastMessage && (
        <div className="problems-toast">
          <span>✔️ {toastMessage}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>CodeMatch Arena: Contests</h1>
      </div>

      {/* ACTIVE CONTESTS */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", marginBottom: "16px", color: "#22c55e" }}>
          🟢 Running Contests
        </h2>
        {activeContests.length === 0 ? (
          <div className="stats-card" style={{ padding: "20px", textAlign: "center" }}>
            <span className="muted-text">No contests currently active.</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {activeContests.map(c => (
              <div 
                key={c.id} 
                className="stats-card" 
                style={{ cursor: "pointer", borderLeft: "4px solid #22c55e", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onClick={() => navigate(`/contests/${c.id}`)}
              >
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>{c.title}</h3>
                  <p className="muted-text" style={{ fontSize: "12px", margin: "0 0 12px 0" }}>{c.description}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Ends: {new Date(c.endTime).toLocaleString()}</span>
                  <button className="lc-submit-btn" style={{ padding: "6px 12px", fontSize: "11px" }}>Enter Arena</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING CONTESTS */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", marginBottom: "16px", color: "var(--primary)" }}>
          📅 Upcoming Contests
        </h2>
        {upcomingContests.length === 0 ? (
          <div className="stats-card" style={{ padding: "20px", textAlign: "center" }}>
            <span className="muted-text">No upcoming contests scheduled.</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {upcomingContests.map(c => (
              <div 
                key={c.id} 
                className="stats-card" 
                style={{ cursor: "pointer", borderLeft: "4px solid var(--primary)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onClick={() => navigate(`/contests/${c.id}`)}
              >
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>{c.title}</h3>
                  <p className="muted-text" style={{ fontSize: "12px", margin: "0 0 12px 0" }}>{c.description}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Starts: {new Date(c.startTime).toLocaleString()}</span>
                  {c.isRegistered ? (
                    <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "600" }}>✓ Registered</span>
                  ) : (
                    <button className="btn-table-action" onClick={(e) => handleRegister(e, c.id)} style={{ padding: "6px 12px", fontSize: "11px" }}>Register</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED CONTESTS */}
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: "700", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", marginBottom: "16px", color: "var(--text-muted)" }}>
          🏁 Completed Contests
        </h2>
        {completedContests.length === 0 ? (
          <div className="stats-card" style={{ padding: "20px", textAlign: "center" }}>
            <span className="muted-text">No completed contests found.</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {completedContests.map(c => (
              <div 
                key={c.id} 
                className="stats-card" 
                style={{ cursor: "pointer", borderLeft: "4px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onClick={() => navigate(`/contests/${c.id}`)}
              >
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>{c.title}</h3>
                  <p className="muted-text" style={{ fontSize: "12px", margin: "0 0 12px 0" }}>{c.description}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Ended: {new Date(c.endTime).toLocaleDateString()}</span>
                  <button className="btn-table-action" style={{ padding: "6px 12px", fontSize: "11px" }}>View Standings</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}
