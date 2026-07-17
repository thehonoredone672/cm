import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getContestDetails, registerForContest } from "../../services/contestService";
import "../Problems/Problems.css";

export default function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetchContest();
  }, [id]);

  useEffect(() => {
    if (!contest) return;
    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (now < start) {
        const diff = start - now;
        setTimeLeft(`Starts in: ${formatTime(diff)}`);
      } else if (now > end) {
        setTimeLeft("Contest Completed");
      } else {
        const diff = end - now;
        setTimeLeft(`Active! Ends in: ${formatTime(diff)}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const data = await getContestDetails(id);
      setContest(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms) => {
    const secs = Math.floor(ms / 1000);
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs}h ${mins}m ${s}s`;
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegister = async () => {
    try {
      await registerForContest(id);
      triggerToast("Registered successfully!");
      fetchContest();
    } catch (e) {
      triggerToast("Failed to register.");
    }
  };

  if (loading) {
    return (
      <div className="teams-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="lc-problems" style={{ padding: "40px", textAlign: "center" }}>
        <h3>Contest Not Found</h3>
        <button className="lc-admin-p-btn" onClick={() => navigate("/contests")}>
          ← Back to Arena
        </button>
      </div>
    );
  }

  const isStarted = new Date() >= new Date(contest.startTime);
  const isEnded = new Date() > new Date(contest.endTime);

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {toastMessage && (
        <div className="problems-toast">
          <span>✔️ {toastMessage}</span>
        </div>
      )}

      <button className="lc-admin-p-btn" onClick={() => navigate("/contests")} style={{ marginBottom: "16px" }}>
        ← Back to Arena
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
        
        {/* LEFT COLUMN: Rules & Details */}
        <div className="stats-card" style={{ padding: "24px" }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>{contest.title}</h1>
          <div className="lc-tag" style={{ margin: "0 0 20px 0" }}>Contest Type: {contest.type}</div>

          <h3 className="lc-section-title" style={{ marginTop: "20px" }}>Description</h3>
          <p style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--text-secondary)" }}>{contest.description}</p>

          <h3 className="lc-section-title" style={{ marginTop: "24px" }}>Contest Rules</h3>
          <ul style={{ paddingLeft: "20px", fontSize: "13px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
            <li>Every correct submission awards points specific to the problem.</li>
            <li>Penalty is computed based on elapsed time from start plus 20 minutes for every incorrect submission.</li>
            <li>Collaborating or sharing solution keys violates CodeMatch Code of Conduct.</li>
          </ul>
        </div>

        {/* RIGHT COLUMN: Registrations/Status & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="stats-card" style={{ textAlign: "center", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--primary)" }}>⏱️ {timeLeft}</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", margin: "20px 0", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Start:</span>
                <strong>{new Date(contest.startTime).toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">End:</span>
                <strong>{new Date(contest.endTime).toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Registrations:</span>
                <strong>{contest.registrationsCount} players</strong>
              </div>
            </div>

            {isEnded ? (
              <button className="lc-submit-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate(`/contests/${id}/dashboard`)}>
                View Leaderboard & Standings 🏁
              </button>
            ) : isStarted ? (
              contest.isRegistered ? (
                <button className="lc-submit-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate(`/contests/${id}/dashboard`)}>
                  Enter Contest Arena 🚀
                </button>
              ) : (
                <button className="lc-submit-btn" style={{ width: "100%", justifyContent: "center" }} onClick={handleRegister}>
                  Register & Enter 🚀
                </button>
              )
            ) : (
              contest.isRegistered ? (
                <button className="lc-submit-btn" style={{ width: "100%", justifyContent: "center", background: "#22c55e" }} disabled>
                  ✓ Registered
                </button>
              ) : (
                <button className="lc-submit-btn" style={{ width: "100%", justifyContent: "center" }} onClick={handleRegister}>
                  Register Now 📋
                </button>
              )
            )}
          </div>

        </div>

      </div>

    </motion.div>
  );
}
