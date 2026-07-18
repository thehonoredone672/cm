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

      {/* PROBLEMS LIST CARDS GRID */}
      <div className="problems-cards-grid">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="lc-card lc-skeleton-card">
              <div className="lc-skeleton-cell" style={{ width: "30%", height: "16px", marginBottom: "12px" }} />
              <div className="lc-skeleton-cell" style={{ width: "80%", height: "24px", marginBottom: "16px" }} />
              <div className="lc-skeleton-cell" style={{ width: "40%", height: "14px", marginBottom: "20px" }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <div className="lc-skeleton-cell" style={{ width: "20%", height: "18px" }} />
                <div className="lc-skeleton-cell" style={{ width: "25%", height: "18px" }} />
              </div>
            </div>
          ))
        ) : problems.length === 0 ? (
          <div className="lc-empty-grid">
            <span style={{ fontSize: "48px" }}>🔍</span>
            <h3>No coding challenges found</h3>
            <p>Try refining your filters or adjusting your search terms.</p>
          </div>
        ) : (
          problems.map(prob => {
            const hasLiked = prob.likeStatus === 1;
            const hasDisliked = prob.likeStatus === -1;

            return (
              <div key={prob.id} className="lc-card" onClick={() => navigate(`/problems/${prob.id}`)}>
                <div className="lc-card-header">
                  <div className="lc-card-header-left">
                    <span className={`lc-diff-badge lc-diff-badge--${DIFF_CLASS[prob.difficulty] || "easy"}`}>
                      {DIFF_LABEL[prob.difficulty] || prob.difficulty}
                    </span>
                    <span className="lc-card-category">{prob.category}</span>
                  </div>
                  <div className="lc-card-status-indicator">
                    {prob.solveStatus === "SOLVED" && (
                      <span className="status-badge solved" title="Solved">✔ Solved</span>
                    )}
                    {prob.solveStatus === "ATTEMPTED" && (
                      <span className="status-badge attempted" title="Attempted">● Attempted</span>
                    )}
                  </div>
                </div>

                <h3 className="lc-card-title">{prob.title}</h3>

                <div className="lc-card-stats-row">
                  <div className="lc-card-stat">
                    <span>Acceptance:</span>
                    <strong>{prob.acceptanceRate}%</strong>
                  </div>
                  <div className="lc-card-stat">
                    <span>Feedback:</span>
                    <strong>👍 {prob.likesCount} / 👎 {prob.dislikesCount}</strong>
                  </div>
                </div>

                <div className="lc-card-tags-row">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {(prob.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} className="lc-tag">{tag}</span>
                    ))}
                  </div>
                  {prob.companies && prob.companies.length > 0 && (
                    <div className="lc-company-tags-container" style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                      {prob.companies.slice(0, 2).map(c => (
                        <span key={c} className="company-chip">{c}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lc-card-footer" onClick={(e) => e.stopPropagation()}>
                  <div className="like-dislike-row">
                    <button 
                      className="bookmark-btn" 
                      onClick={(e) => handleToggleBookmark(e, prob.id)}
                      title="Bookmark problem"
                    >
                      {prob.isBookmarked ? "⭐" : "☆"}
                    </button>
                    <button 
                      className={`like-action-btn ${hasLiked ? "active-like" : ""}`}
                      onClick={(e) => handleToggleLike(e, prob.id, prob.likeStatus, hasLiked ? "NONE" : "LIKE")}
                      title="Like problem"
                    >
                      👍
                    </button>
                    <button 
                      className={`like-action-btn ${hasDisliked ? "active-dislike" : ""}`}
                      onClick={(e) => handleToggleLike(e, prob.id, prob.likeStatus, hasDisliked ? "NONE" : "DISLIKE")}
                      title="Dislike problem"
                    >
                      👎
                    </button>
                  </div>
                  <button className="btn-table-action" onClick={() => navigate(`/problems/${prob.id}`)}>
                    Solve ➔
                  </button>
                </div>
              </div>
            );
          })
        )}
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
