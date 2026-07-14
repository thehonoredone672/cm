import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProblems } from "../../services/problemService";
import { useAuth } from "../../context/AuthContext";
import "./Problems.css";

const DIFF_LABEL = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const DIFF_CLASS = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ProblemList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");
  const [catFilter, setCatFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProblems();
      setProblems(data);
    } catch (err) {
      console.error("[ProblemList] load:", err);
      showToast("Failed to retrieve coding problems. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Compute Categories from seeded data
  const categories = ["ALL", ...new Set(problems.map((p) => p.category).filter(Boolean))];

  // Filtering Logic
  const filtered = problems.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "ALL" || p.difficulty === diffFilter;
    const matchCat = catFilter === "ALL" || p.category === catFilter;
    const matchStatus = statusFilter === "ALL" || p.solveStatus === statusFilter;
    return matchSearch && matchDiff && matchCat && matchStatus;
  });

  // Calculate Progress Stats
  const totalCounts = {
    EASY: problems.filter((p) => p.difficulty === "EASY").length,
    MEDIUM: problems.filter((p) => p.difficulty === "MEDIUM").length,
    HARD: problems.filter((p) => p.difficulty === "HARD").length,
    TOTAL: problems.length
  };

  const solvedCounts = {
    EASY: problems.filter((p) => p.difficulty === "EASY" && p.solveStatus === "SOLVED").length,
    MEDIUM: problems.filter((p) => p.difficulty === "MEDIUM" && p.solveStatus === "SOLVED").length,
    HARD: problems.filter((p) => p.difficulty === "HARD" && p.solveStatus === "SOLVED").length,
    TOTAL: problems.filter((p) => p.solveStatus === "SOLVED").length
  };

  const calculatePct = (solved, total) => {
    if (!total) return 0;
    return Math.round((solved / total) * 100);
  };

  return (
    <motion.div
      className="lc-problems"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toast Alert Notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="problems-toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span>⚠️ {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="lc-problems__hero">
        <div>
          <h1>Code Challenges & Practice</h1>
          <p>Sharpen your algorithmic skills, view completion statistics, and prepare for technical whiteboard interviews.</p>
        </div>
        {user?.role === "ADMIN" && (
          <button
            className="lc-admin-p-btn"
            onClick={() => navigate("/problems/admin")}
          >
            ⚙ Admin Manager
          </button>
        )}
      </div>

      {/* Modern SaaS Completion Stats Dashboard */}
      <div className="problems-stats-dashboard">
        {/* Overall Completion Circle */}
        <div className="stats-card overall-progress-card">
          <div className="progress-circle-wrapper">
            <svg className="progress-ring" width="80" height="80">
              <circle
                className="progress-ring__circle-bg"
                stroke="#2a2a2a"
                strokeWidth="6"
                fill="transparent"
                r="34"
                cx="40"
                cy="40"
              />
              <circle
                className="progress-ring__circle"
                stroke="var(--primary)"
                strokeWidth="6"
                fill="transparent"
                r="34"
                cx="40"
                cy="40"
                style={{
                  strokeDasharray: `${2 * Math.PI * 34}`,
                  strokeDashoffset: `${2 * Math.PI * 34 * (1 - calculatePct(solvedCounts.TOTAL, totalCounts.TOTAL) / 100)}`
                }}
              />
            </svg>
            <div className="progress-ring-text">
              <span className="pct-num">{calculatePct(solvedCounts.TOTAL, totalCounts.TOTAL)}%</span>
              <span className="lbl">Done</span>
            </div>
          </div>
          <div>
            <h3>Overall Solved</h3>
            <p className="stats-metric-text">{solvedCounts.TOTAL} / {totalCounts.TOTAL} Problems</p>
          </div>
        </div>

        {/* Easy statistics progress */}
        <div className="stats-card difficulty-progress-card">
          <div className="diff-header">
            <span className="lbl-easy">🟢 Easy Solved</span>
            <span>{solvedCounts.EASY} / {totalCounts.EASY}</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill fill-easy"
              style={{ width: `${calculatePct(solvedCounts.EASY, totalCounts.EASY)}%` }}
            />
          </div>
          <span className="pct-label">{calculatePct(solvedCounts.EASY, totalCounts.EASY)}% complete</span>
        </div>

        {/* Medium statistics progress */}
        <div className="stats-card difficulty-progress-card">
          <div className="diff-header">
            <span className="lbl-medium">🟡 Medium Solved</span>
            <span>{solvedCounts.MEDIUM} / {totalCounts.MEDIUM}</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill fill-medium"
              style={{ width: `${calculatePct(solvedCounts.MEDIUM, totalCounts.MEDIUM)}%` }}
            />
          </div>
          <span className="pct-label">{calculatePct(solvedCounts.MEDIUM, totalCounts.MEDIUM)}% complete</span>
        </div>

        {/* Hard statistics progress */}
        <div className="stats-card difficulty-progress-card">
          <div className="diff-header">
            <span className="lbl-hard">🔴 Hard Solved</span>
            <span>{solvedCounts.HARD} / {totalCounts.HARD}</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill fill-hard"
              style={{ width: `${calculatePct(solvedCounts.HARD, totalCounts.HARD)}%` }}
            />
          </div>
          <span className="pct-label">{calculatePct(solvedCounts.HARD, totalCounts.HARD)}% complete</span>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="lc-filters">
        <div className="lc-search">
          <svg className="lc-search__icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            placeholder="Search problems by name or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="lc-select" value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select className="lc-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
          ))}
        </select>

        <select className="lc-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="SOLVED">Solved</option>
          <option value="ATTEMPTED">Attempted</option>
          <option value="UNSOLVED">Todo / Unsolved</option>
        </select>
      </div>

      {/* Problems List Table */}
      <div className="problems-table-container">
        <table className="lc-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Status</th>
              <th>Problem Name</th>
              <th>Difficulty</th>
              <th>Category</th>
              <th>Tags</th>
              <th style={{ width: 140, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="lc-skeleton-row">
                  <td><div className="lc-skeleton-cell" style={{ width: 24, height: 24, borderRadius: "50%" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "60%" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: 60 }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: 80 }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "80%" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: 80, marginLeft: "auto" }} /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="lc-empty">
                    <span style={{ fontSize: 32 }}>🔍</span>
                    <h3>No Problems Found</h3>
                    <p>No results match your selected filter criteria. Clear filters or try a different search phrase.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((prob) => (
                <motion.tr
                  key={prob.id}
                  variants={itemVariants}
                  whileHover={{ backgroundColor: "var(--border-light)" }}
                  onClick={() => navigate(`/problems/${prob.id}`)}
                >
                  <td>
                    <div className="prob-status-indicator">
                      {prob.solveStatus === "SOLVED" && (
                        <span className="status-badge solved" title="Solved">✔</span>
                      )}
                      {prob.solveStatus === "ATTEMPTED" && (
                        <span className="status-badge attempted" title="Attempted">●</span>
                      )}
                      {prob.solveStatus === "UNSOLVED" && (
                        <span className="status-badge unsolved" title="Todo">○</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="lc-prob-title-text">{prob.title}</div>
                  </td>
                  <td>
                    <span className={`lc-diff-badge lc-diff-badge--${DIFF_CLASS[prob.difficulty]}`}>
                      {DIFF_LABEL[prob.difficulty]}
                    </span>
                  </td>
                  <td>
                    <span className="problems-category-cell">{prob.category || "—"}</span>
                  </td>
                  <td>
                    <div className="lc-tags">
                      {(prob.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="lc-tag">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-table-action">
                      Solve ➔
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}
