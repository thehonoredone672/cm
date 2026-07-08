import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProblems } from "../../services/problemService";
import { getSubmissions } from "../../services/submissionService";
import { useAuth } from "../../context/AuthContext";
import "./Problems.css";

const DIFF_LABEL = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const DIFF_CLASS = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };

export default function ProblemList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");
  const [catFilter, setCatFilter] = useState("ALL");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProblems();
      setProblems(data);
    } catch (err) {
      console.error("[ProblemList] load:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = problems.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "ALL" || p.difficulty === diffFilter;
    const matchCat = catFilter === "ALL" || p.category === catFilter;
    return matchSearch && matchDiff && matchCat;
  });

  const categories = ["ALL", ...new Set(problems.map((p) => p.category).filter(Boolean))];

  const counts = {
    EASY: problems.filter((p) => p.difficulty === "EASY").length,
    MEDIUM: problems.filter((p) => p.difficulty === "MEDIUM").length,
    HARD: problems.filter((p) => p.difficulty === "HARD").length,
  };

  return (
    <div className="lc-problems">
      <div className="lc-problems__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h1>Problem Set</h1>
          <p>Practice your skills and prepare for coding challenges.</p>
        </div>
        {user?.role === "ADMIN" && (
          <button 
            className="lc-submit-btn" 
            onClick={() => navigate("/problems/admin")}
            style={{ padding: "10px 20px" }}
          >
            ⚙ Admin Panel
          </button>
        )}
      </div>

      {/* Stats pills */}
      <div className="lc-stats">
        <span className="lc-stat-pill lc-stat-pill--easy">🟢 Easy: {counts.EASY}</span>
        <span className="lc-stat-pill lc-stat-pill--medium">🟡 Medium: {counts.MEDIUM}</span>
        <span className="lc-stat-pill lc-stat-pill--hard">🔴 Hard: {counts.HARD}</span>
      </div>

      {/* Filters */}
      <div className="lc-filters">
        <div className="lc-search">
          <svg className="lc-search__icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search by title or tag…"
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
      </div>

      {/* Table */}
      <table className="lc-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Title</th>
            <th>Difficulty</th>
            <th>Tags</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [1,2,3,4,5].map((i) => (
              <tr key={i} className="lc-skeleton-row">
                <td><div className="lc-skeleton-cell" style={{ width: 20 }} /></td>
                <td><div className="lc-skeleton-cell" style={{ width: "70%" }} /></td>
                <td><div className="lc-skeleton-cell" style={{ width: 60 }} /></td>
                <td><div className="lc-skeleton-cell" style={{ width: "80%" }} /></td>
                <td><div className="lc-skeleton-cell" style={{ width: 80 }} /></td>
              </tr>
            ))
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="lc-empty">
                  <div style={{ fontSize: 36, marginBottom: 10 }}>??</div>
                  <div>No problems match your filters.</div>
                </div>
              </td>
            </tr>
          ) : (
            filtered.map((prob, idx) => (
              <tr key={prob.id} onClick={() => navigate(`/problems/${prob.id}`)}>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{idx + 1}</td>
                <td>
                  <div className="lc-prob-title">
                    {solvedIds.has(prob.id) && <span className="lc-solved-check">?</span>}
                    {prob.title}
                  </div>
                </td>
                <td>
                  <span className={`lc-diff-badge lc-diff-badge--${DIFF_CLASS[prob.difficulty]}`}>
                    {DIFF_LABEL[prob.difficulty]}
                  </span>
                </td>
                <td>
                  <div className="lc-tags">
                    {(prob.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="lc-tag">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="lc-acceptance">{prob.category || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
