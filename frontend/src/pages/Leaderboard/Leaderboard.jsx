import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getGlobalLeaderboard, getUserProfileStatistics, syncUserXP } from "../../services/leaderboardService";
import "../Problems/Problems.css";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search & filter states
  const [search, setSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  useEffect(() => {
    fetchLeaderboardData();
  }, [page]);

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        college: collegeSearch || undefined,
        department: deptSearch || undefined
      };
      const res = await getGlobalLeaderboard(params);
      setLeaderboard(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsData = async () => {
    try {
      const data = await getUserProfileStatistics();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeaderboardData();
  };

  const handleSyncXP = async () => {
    try {
      setSyncing(true);
      await syncUserXP();
      await fetchStatsData();
      await fetchLeaderboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Next level progress computation
  const xpProgress = stats ? (stats.user?.xp % 100) : 0;
  const nextLevelXp = stats ? (stats.user?.level * 100) : 100;
  const currentXpBase = stats ? (stats.user?.xp - xpProgress) : 0;

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1>Global Leaderboard & Rank Rankings</h1>
        <button className="lc-submit-btn" onClick={handleSyncXP} disabled={syncing}>
          {syncing ? "Syncing XP..." : "↻ Recalculate My Stats & XP"}
        </button>
      </div>

      {/* USER STATS PROFILE SUMMARY */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "24px", marginBottom: "32px" }}>
          
          {/* Rank Card & XP Progress */}
          <div className="stats-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyBetween: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="muted-text" style={{ fontSize: "12px", textTransform: "uppercase" }}>Current Profile Status</span>
                <span className="lc-tag" style={{ margin: 0, background: "var(--primary-dark)", color: "#fff" }}>Level {stats.user?.level}</span>
              </div>
              <h2 style={{ fontSize: "32px", margin: "10px 0", fontWeight: "800" }}>{stats.user?.xp} <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--text-secondary)" }}>XP</span></h2>
              
              {/* XP Progress bar */}
              <div style={{ background: "var(--background)", height: "8px", borderRadius: "4px", overflow: "hidden", margin: "16px 0 8px 0" }}>
                <div style={{ background: "var(--primary)", width: `${xpProgress}%`, height: "100%" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)" }}>
                <span>{xpProgress} XP / 100 XP to Level {stats.user?.level + 1}</span>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <div style={{ flex: 1, background: "var(--background)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Solved Challenges</span>
                <strong style={{ fontSize: "18px" }}>{stats.solvedCount}</strong>
              </div>
              <div style={{ flex: 1, background: "var(--background)", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Acceptance Rate</span>
                <strong style={{ fontSize: "18px" }}>{stats.acceptanceRate}%</strong>
              </div>
            </div>
          </div>

          {/* Badges and Difficulty distributions */}
          <div className="stats-card" style={{ padding: "24px" }}>
            <h3 className="lc-section-title" style={{ margin: "0 0 16px 0" }}>🏆 Earned Badges ({stats.badges?.length || 0})</h3>
            
            {stats.badges?.length === 0 ? (
              <span className="muted-text" style={{ fontSize: "13px" }}>Solve challenges and earn achievements to unlock badges!</span>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
                {stats.badges?.map(badge => (
                  <div key={badge.id} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>🏅</div>
                    <strong style={{ fontSize: "11px", display: "block", color: "var(--text-primary)" }}>{badge.badgeName}</strong>
                    <span className="muted-text" style={{ fontSize: "9px" }}>{new Date(badge.earnedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-light)", paddingTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <div>Easy: <strong style={{ color: "#22c55e" }}>{stats.easyCount}</strong></div>
              <div>Medium: <strong style={{ color: "#eab308" }}>{stats.mediumCount}</strong></div>
              <div>Hard: <strong style={{ color: "#ef4444" }}>{stats.hardCount}</strong></div>
            </div>
          </div>

        </div>
      )}

      {/* FILTER SEARCH FORM ROW */}
      <div className="problems-filters-row" style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "240px" }}>
          <input 
            type="text" 
            placeholder="Search student name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)" }}
          />
          <input 
            type="text" 
            placeholder="Filter college..." 
            value={collegeSearch}
            onChange={(e) => setCollegeSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)" }}
          />
          <input 
            type="text" 
            placeholder="Filter department..." 
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)" }}
          />
          <button type="submit" className="lc-run-btn" style={{ padding: "8px 14px" }}>Filter</button>
        </form>

      </div>

      {/* LEADERBOARD TABLE */}
      <div className="problems-list-container" style={{ background: "var(--surface)", borderRadius: "8px", border: "1.5px solid var(--border)", overflow: "hidden" }}>
        
        {loading ? (
          <div className="lc-spinner" style={{ padding: "40px" }}>
            <div className="lc-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <span className="muted-text">No leaderboard entries match search filters.</span>
          </div>
        ) : (
          <table className="problems-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background)", borderBottom: "1.5px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Rank</th>
                <th style={{ padding: "12px" }}>User</th>
                <th style={{ padding: "12px" }}>College / Institution</th>
                <th style={{ padding: "12px" }}>Department</th>
                <th style={{ padding: "12px" }}>Level</th>
                <th style={{ padding: "12px" }}>Score Points (XP)</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px" }}>
                    <strong style={{ fontSize: "14px", color: row.rank <= 3 ? "var(--primary)" : "var(--text-secondary)" }}>
                      #{row.rank}
                    </strong>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{row.name}</strong>
                    <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>{row.email}</span>
                  </td>
                  <td style={{ padding: "12px" }}>{row.college || "—"}</td>
                  <td style={{ padding: "12px" }}>{row.department || "—"}</td>
                  <td style={{ padding: "12px" }}>
                    <span className="lc-tag" style={{ margin: 0 }}>Level {row.level}</span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <strong>{row.xp} XP</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "12px", background: "var(--background)", borderTop: "1.5px solid var(--border)" }}>
            <button className="btn-table-action" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span style={{ display: "flex", alignItems: "center", fontSize: "13px" }}>Page {page} of {totalPages}</span>
            <button className="btn-table-action" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}

      </div>

    </motion.div>
  );
}
