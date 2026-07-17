import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getProblems, 
  getProblemsStatistics, 
  toggleBookmark, 
  toggleLike 
} from "../../services/problemService";
import { useAuth } from "../../context/AuthContext";
import "./Problems.css";

const DIFF_LABEL = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const DIFF_CLASS = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };

export default function ProblemList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Data States
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [statistics, setStatistics] = useState({ totalProblems: 0, solvedProblems: 0, attempted: 0, successRate: 0, bookmarks: 0 });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Search, Filters & Pagination States
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");
  const [catFilter, setCatFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [search, diffFilter, catFilter, statusFilter, sortOrder, currentPage, pageSize]);

  const fetchStatistics = async () => {
    try {
      const data = await getProblemsStatistics();
      if (data) {
        setStatistics(data);
      }
    } catch (err) {
      console.error("[ProblemList] fetchStatistics failed:", err);
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await getProblems({
        search: search.trim() || undefined,
        difficulty: diffFilter !== "ALL" ? diffFilter : undefined,
        category: catFilter !== "ALL" ? catFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        sort: sortOrder,
        page: currentPage,
        limit: pageSize
      });

      if (res.success) {
        setProblems(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("[ProblemList] fetchProblems failed:", err);
      showToast("Failed to fetch coding problems.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleBookmark = async (e, problemId) => {
    e.stopPropagation();
    try {
      const result = await toggleBookmark(problemId);
      showToast(result.bookmarked ? "Problem bookmarked." : "Bookmark removed.");
      fetchProblems();
      fetchStatistics();
    } catch (err) {
      showToast("Failed to toggle bookmark.");
    }
  };

  const handleToggleLike = async (e, problemId, currentStatus, targetValue) => {
    e.stopPropagation();
    // targetValue: "LIKE", "DISLIKE", or "NONE"
    try {
      await toggleLike(problemId, targetValue);
      showToast(targetValue === "LIKE" ? "Liked problem." : targetValue === "DISLIKE" ? "Disliked problem." : "Removed feedback.");
      fetchProblems();
    } catch (err) {
      showToast("Failed to update feedback.");
    }
  };

  const categories = useMemo(() => {
    // Return standard categories list or dynamic check
    return ["ALL", "Algorithms", "Data Structures", "Strings", "Recursion", "Dynamic Programming", "Math", "Arrays"];
  }, []);

  return (
    <motion.div
      className="lc-problems"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="problems-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>✔️ {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lc-problems__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Code Challenges & Practice</h1>
          <p>Practice algorithmic problems, view completion statistics, and prepare for whiteboard technical rounds.</p>
        </div>
        {user?.role === "ADMIN" && (
          <button className="lc-admin-p-btn" onClick={() => navigate("/problems/admin")}>
            ⚙ Admin Panel
          </button>
        )}
      </div>

      {/* STATISTICS DASHBOARD CARD STATS */}
      <div className="problems-stats-dashboard">
        <div className="stats-card overall-progress-card">
          <div className="progress-circle-wrapper">
            <svg className="progress-ring" width="80" height="80">
              <circle className="progress-ring__circle-bg" stroke="#2a2a2a" strokeWidth="5" fill="transparent" r="32" cx="40" cy="40" />
              <circle 
                className="progress-ring__circle" 
                stroke="var(--primary)" 
                strokeWidth="5" 
                fill="transparent" 
                r="32" 
                cx="40" 
                cy="40" 
                style={{
                  strokeDasharray: `${2 * Math.PI * 32}`,
                  strokeDashoffset: `${2 * Math.PI * 32 * (1 - statistics.successRate / 100)}`
                }}
              />
            </svg>
            <div className="progress-ring-text">
              <span className="pct-num">{statistics.successRate}%</span>
              <span className="lbl">Rate</span>
            </div>
          </div>
          <div>
            <h3>Practice Progress</h3>
            <p className="stats-metric-text">{statistics.solvedProblems} Solved</p>
          </div>
        </div>

        <div className="stats-card difficulty-progress-card">
          <div className="diff-header">
            <span>Total Problems</span>
            <strong>{statistics.totalProblems}</strong>
          </div>
          <span className="pct-label">Available public challenges</span>
        </div>

        <div className="stats-card difficulty-progress-card">
          <div className="diff-header">
            <span>Attempted / Todo</span>
            <strong>{statistics.attempted}</strong>
          </div>
          <span className="pct-label">Problems with submissions</span>
        </div>

        <div className="stats-card difficulty-progress-card">
          <div className="diff-header">
            <span>Bookmarks</span>
            <strong>{statistics.bookmarks}</strong>
          </div>
          <span className="pct-label">Pinned for reviews</span>
        </div>
      </div>

      {/* FILTERS & SEARCH CONTROLS */}
      <div className="lc-filters">
        <div className="lc-search" style={{ flex: 1.5 }}>
          <input 
            type="text" 
            placeholder="Search problems by title, tag, or company..." 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }} 
          />
        </div>

        <select className="lc-select" value={diffFilter} onChange={(e) => {
          setDiffFilter(e.target.value);
          setCurrentPage(1);
        }}>
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select className="lc-select" value={catFilter} onChange={(e) => {
          setCatFilter(e.target.value);
          setCurrentPage(1);
        }}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === "ALL" ? "All Categories" : cat}</option>
          ))}
        </select>

        <select className="lc-select" value={statusFilter} onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}>
          <option value="ALL">All Statuses</option>
          <option value="SOLVED">Solved</option>
          <option value="ATTEMPTED">Attempted</option>
          <option value="UNSOLVED">Todo / Unsolved</option>
          <option value="BOOKMARKED">Bookmarked Only</option>
        </select>

        <select className="lc-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NEWEST">Newest</option>
          <option value="OLDEST">Oldest</option>
          <option value="DIFFICULTY">Difficulty Order</option>
          <option value="ACCEPTANCE">Acceptance Rate</option>
          <option value="POPULARITY">Popularity (Likes)</option>
          <option value="ALPHABETICAL">Alphabetical</option>
        </select>
      </div>

      {/* PROBLEMS LIST TABLE */}
      <div className="problems-table-container">
        <table className="lc-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>Status</th>
              <th>Problem Name</th>
              <th style={{ width: 100 }}>Difficulty</th>
              <th>Category</th>
              <th>Tags / Companies</th>
              <th style={{ width: 110 }}>Acceptance</th>
              <th style={{ width: 120 }}>Popularity</th>
              <th style={{ width: 120 }}>Feedback</th>
              <th style={{ width: 80, textAlign: "right" }}>Solve</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="lc-skeleton-row">
                  <td><div className="lc-skeleton-cell" style={{ width: "20px", height: "20px", borderRadius: "50%" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "60%" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "50px" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "60px" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "80px" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "40px" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "30px" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "60px" }} /></td>
                  <td><div className="lc-skeleton-cell" style={{ width: "50px", marginLeft: "auto" }} /></td>
                </tr>
              ))
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="lc-empty">
                    <span style={{ fontSize: "36px" }}>🔍</span>
                    <h3>No coding problems found</h3>
                    <p>Try refining your filters or adjusting the search keywords.</p>
                  </div>
                </td>
              </tr>
            ) : (
              problems.map(prob => {
                const hasLiked = prob.likeStatus === 1;
                const hasDisliked = prob.likeStatus === -1;

                return (
                  <tr key={prob.id} onClick={() => navigate(`/problems/${prob.id}`)}>
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
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="lc-prob-title-text">{prob.title}</span>
                        {prob.companies && prob.companies.length > 0 && (
                          <div className="company-chips-row">
                            {prob.companies.map(c => (
                              <span key={c} className="company-chip">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`lc-diff-badge lc-diff-badge--${DIFF_CLASS[prob.difficulty]}`}>
                        {DIFF_LABEL[prob.difficulty]}
                      </span>
                    </td>
                    <td>
                      <span className="problems-category-cell">{prob.category}</span>
                    </td>
                    <td>
                      <div className="lc-tags">
                        {prob.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="lc-tag">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="problems-category-cell" style={{ fontWeight: "700" }}>{prob.acceptanceRate}%</span>
                    </td>
                    <td>
                      <span className="popularity-tally">👍 {prob.likesCount} | 👎 {prob.dislikesCount}</span>
                    </td>
                    <td>
                      <div className="like-dislike-row" onClick={(e) => e.stopPropagation()}>
                        {/* Bookmark Button */}
                        <button 
                          className="bookmark-btn" 
                          onClick={(e) => handleToggleBookmark(e, prob.id)}
                          title="Bookmark problem"
                        >
                          {prob.isBookmarked ? "⭐" : "☆"}
                        </button>
                        {/* Like Button */}
                        <button 
                          className={`like-action-btn ${hasLiked ? "active-like" : ""}`}
                          onClick={(e) => handleToggleLike(e, prob.id, prob.likeStatus, hasLiked ? "NONE" : "LIKE")}
                          title="Like problem"
                        >
                          👍
                        </button>
                        {/* Dislike Button */}
                        <button 
                          className={`like-action-btn ${hasDisliked ? "active-dislike" : ""}`}
                          onClick={(e) => handleToggleLike(e, prob.id, prob.likeStatus, hasDisliked ? "NONE" : "DISLIKE")}
                          title="Dislike problem"
                        >
                          👎
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn-table-action">
                        Solve ➔
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {pagination.pages > 1 && (
        <div className="problems-pagination-row">
          <button 
            className="pagination-btn" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} problems)
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className="pagination-info">Show:</span>
            <select 
              className="limit-selector" 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <button 
              className="pagination-btn" 
              disabled={currentPage === pagination.pages} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </motion.div>
  );
}
