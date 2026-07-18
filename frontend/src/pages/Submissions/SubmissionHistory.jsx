import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUserSubmissions, getSubmissionDetail, getSubmissionsStatistics } from "../../services/submissionService";
import "../Problems/Problems.css";

const VERDICT_CLASS = {
  ACCEPTED: "accepted",
  WRONG_ANSWER: "wrong_answer",
  RUNTIME_ERROR: "runtime_error",
  TIME_LIMIT_EXCEEDED: "time_limit_exceeded",
  COMPILATION_ERROR: "compilation_error",
  MEMORY_LIMIT_EXCEEDED: "runtime_error"
};

export default function SubmissionHistory() {
  const navigate = useNavigate();

  // Core List States
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [problemSearch, setProblemSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [selectedVerdict, setSelectedVerdict] = useState("");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  // Selection Compare Mode States
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]); // Array of 2 submission IDs
  const [compareData, setCompareData] = useState([]); // Array of 2 detailed submission objects

  // Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    fetchSubmissionsAndStats();
  }, [page, selectedLang, selectedVerdict, sortOrder]);

  const fetchSubmissionsAndStats = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        problem: problemSearch || undefined,
        language: selectedLang || undefined,
        verdict: selectedVerdict || undefined,
        sort: sortOrder
      };
      const res = await getUserSubmissions(params);
      setSubmissions(res.data || []);
      setTotalPages(res.pagination?.pages || 1);

      const statsData = await getSubmissionsStatistics();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubmissionsAndStats();
  };

  const handleOpenDetail = (id) => {
    navigate(`/submissions/${id}`);
  };

  // Compare mode selections
  const handleToggleCompareCheckbox = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(item => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        // Limit to 2 max
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const handleStartCompare = async () => {
    if (selectedForCompare.length !== 2) return;
    try {
      const detail1 = await getSubmissionDetail(selectedForCompare[0]);
      const detail2 = await getSubmissionDetail(selectedForCompare[1]);
      setCompareData([detail1, detail2]);
      setCompareMode(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseCompare = () => {
    setCompareMode(false);
    setCompareData([]);
    setSelectedForCompare([]);
  };

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>My Submissions History</h1>

      {/* STATISTICS CARDS */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div className="stats-card">
            <span className="muted-text" style={{ fontSize: "11px" }}>Total Submissions</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px" }}>{stats.totalSubmissions}</h2>
          </div>
          <div className="stats-card">
            <span className="muted-text" style={{ fontSize: "11px" }}>Accepted Solutions</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#22c55e" }}>{stats.acceptedSubmissions}</h2>
          </div>
          <div className="stats-card">
            <span className="muted-text" style={{ fontSize: "11px" }}>Acceptance Rate</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px" }}>{stats.acceptanceRate}%</h2>
          </div>
          <div className="stats-card">
            <span className="muted-text" style={{ fontSize: "11px" }}>Avg Runtime</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px" }}>{stats.averageRuntime} ms</h2>
          </div>
          <div className="stats-card">
            <span className="muted-text" style={{ fontSize: "11px" }}>Avg Memory</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px" }}>{stats.averageMemory} MB</h2>
          </div>
          <div className="stats-card">
            <span className="muted-text" style={{ fontSize: "11px" }}>Solved Challenges</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "var(--primary)" }}>{stats.solvedProblemsCount}</h2>
          </div>
        </div>
      )}

      {/* FILTER CONTROLS BAR */}
      <div className="problems-filters-row" style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "240px" }}>
          <input 
            type="text" 
            placeholder="Search problem title..." 
            value={problemSearch}
            onChange={(e) => setProblemSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)" }}
          />
          <button type="submit" className="lc-run-btn" style={{ padding: "8px 14px" }}>Search</button>
        </form>

        <select 
          value={selectedLang} 
          onChange={(e) => { setSelectedLang(e.target.value); setPage(1); }}
          style={{ padding: "8px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
        >
          <option value="">All Languages</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python 3</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
        </select>

        <select 
          value={selectedVerdict} 
          onChange={(e) => { setSelectedVerdict(e.target.value); setPage(1); }}
          style={{ padding: "8px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
        >
          <option value="">All Verdicts</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="WRONG_ANSWER">Wrong Answer</option>
          <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
          <option value="RUNTIME_ERROR">Runtime Error</option>
          <option value="COMPILATION_ERROR">Compilation Error</option>
        </select>

        <select 
          value={sortOrder} 
          onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
          style={{ padding: "8px", background: "var(--surface)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
        >
          <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
          <option value="RUNTIME">Best Runtime</option>
          <option value="MEMORY">Best Memory</option>
          <option value="SCORE">Highest Score</option>
        </select>

        {selectedForCompare.length === 2 && (
          <button className="lc-submit-btn" onClick={handleStartCompare}>
            Compare Selected ({selectedForCompare.length}) 📊
          </button>
        )}
      </div>

      {/* SUBMISSIONS LIST TABLE */}
      <div className="problems-list-container" style={{ background: "var(--surface)", borderRadius: "8px", border: "1.5px solid var(--border)", overflow: "hidden" }}>
        
        {loading ? (
          <div className="lc-spinner" style={{ padding: "40px" }}>
            <div className="lc-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <span className="muted-text">No submissions match the search parameters.</span>
          </div>
        ) : (
          <table className="problems-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background)", borderBottom: "1.5px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Compare</th>
                <th style={{ padding: "12px" }}>Problem</th>
                <th style={{ padding: "12px" }}>Language</th>
                <th style={{ padding: "12px" }}>Verdict</th>
                <th style={{ padding: "12px" }}>Score</th>
                <th style={{ padding: "12px" }}>Runtime</th>
                <th style={{ padding: "12px" }}>Memory</th>
                <th style={{ padding: "12px" }}>Submitted At</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px" }}>
                    <input 
                      type="checkbox" 
                      checked={selectedForCompare.includes(sub.id)}
                      disabled={!selectedForCompare.includes(sub.id) && selectedForCompare.length >= 2}
                      onChange={() => handleToggleCompareCheckbox(sub.id)}
                    />
                  </td>
                  <td style={{ padding: "12px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{sub.problem?.title}</strong>
                    <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>{sub.problem?.difficulty}</span>
                  </td>
                  <td style={{ padding: "12px", textTransform: "capitalize" }}>{sub.language}</td>
                  <td style={{ padding: "12px" }}>
                    <span className={`status-tag status-tag--${VERDICT_CLASS[sub.status] || "runtime_error"}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{sub.testCasesPassed} / {sub.totalTestCases}</td>
                  <td style={{ padding: "12px" }}>{sub.executionTime ? `${Math.round(sub.executionTime * 1000)} ms` : "—"}</td>
                  <td style={{ padding: "12px" }}>{sub.memoryUsage ? `${sub.memoryUsage} MB` : "—"}</td>
                  <td style={{ padding: "12px" }}>{new Date(sub.createdAt).toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>
                    <button className="btn-table-action" onClick={() => handleOpenDetail(sub.id)}>View Details</button>
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



      {/* COMPARE MODE SIDE-BY-SIDE MODAL */}
      <AnimatePresence>
        {compareMode && compareData.length === 2 && (
          <div className="create-modal-overlay" style={{ zIndex: 1100 }}>
            <motion.div className="create-modal-content" style={{ maxWidth: "1100px", width: "95%" }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "16px" }}>
                <h3>Compare Submissions</h3>
                <button className="btn-table-action" onClick={handleCloseCompare}>Close Comparison</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                
                {/* Submission 1 column */}
                <div style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "16px", borderRadius: "8px" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>Submission A</h4>
                  <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                    <div><strong>Verdict:</strong> <span className={`status-tag status-tag--${VERDICT_CLASS[compareData[0].status]}`}>{compareData[0].status}</span></div>
                    <div><strong>Language:</strong> {compareData[0].language}</div>
                    <div><strong>Runtime:</strong> {compareData[0].executionTime ? `${Math.round(compareData[0].executionTime * 1000)} ms` : "—"}</div>
                    <div><strong>Memory:</strong> {compareData[0].memoryUsage ? `${compareData[0].memoryUsage} MB` : "—"}</div>
                    <div><strong>Passed Cases:</strong> {compareData[0].testCasesPassed} / {compareData[0].totalTestCases}</div>
                  </div>
                  <pre style={{ border: "1px solid var(--border)", padding: "10px", borderRadius: "6px", overflowX: "auto", maxHeight: "300px", fontSize: "11px", fontFamily: "monospace" }}>
                    <code>{compareData[0].code}</code>
                  </pre>
                </div>

                {/* Submission 2 column */}
                <div style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "16px", borderRadius: "8px" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>Submission B</h4>
                  <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                    <div><strong>Verdict:</strong> <span className={`status-tag status-tag--${VERDICT_CLASS[compareData[1].status]}`}>{compareData[1].status}</span></div>
                    <div><strong>Language:</strong> {compareData[1].language}</div>
                    <div><strong>Runtime:</strong> {compareData[1].executionTime ? `${Math.round(compareData[1].executionTime * 1000)} ms` : "—"}</div>
                    <div><strong>Memory:</strong> {compareData[1].memoryUsage ? `${compareData[1].memoryUsage} MB` : "—"}</div>
                    <div><strong>Passed Cases:</strong> {compareData[1].testCasesPassed} / {compareData[1].totalTestCases}</div>
                  </div>
                  <pre style={{ border: "1px solid var(--border)", padding: "10px", borderRadius: "6px", overflowX: "auto", maxHeight: "300px", fontSize: "11px", fontFamily: "monospace" }}>
                    <code>{compareData[1].code}</code>
                  </pre>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
