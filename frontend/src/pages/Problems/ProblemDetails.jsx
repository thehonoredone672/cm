import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getProblemDetails, 
  toggleBookmark, 
  toggleLike, 
  getProblemDiscussions, 
  createProblemDiscussion, 
  reportProblem, 
  getProblemEditorial 
} from "../../services/problemService";
import { getSubmissions } from "../../services/submissionService";
import { useAuth } from "../../context/AuthContext";
import "./Problems.css";

const DIFF_LABEL = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const DIFF_CLASS = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };

const VERDICT_META = {
  ACCEPTED: { label: "Accepted", class: "accepted" },
  WRONG_ANSWER: { label: "Wrong Answer", class: "wrong_answer" },
  RUNTIME_ERROR: { label: "Runtime Error", class: "runtime_error" },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit Exceeded", class: "time_limit_exceeded" },
  COMPILATION_ERROR: { label: "Compilation Error", class: "compilation_error" },
  MEMORY_LIMIT_EXCEEDED: { label: "Memory Limit Exceeded", class: "memory_limit_exceeded" }
};

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core States
  const [problem, setProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Discussions States
  const [discussions, setDiscussions] = useState([]);
  const [discTitle, setDiscTitle] = useState("");
  const [discContent, setDiscContent] = useState("");
  const [showDiscModal, setShowDiscModal] = useState(false);

  // Report State
  const [reportReason, setReportReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  // Editorial State
  const [editorial, setEditorial] = useState(null);
  const [showEditorialModal, setShowEditorialModal] = useState(false);

  useEffect(() => {
    fetchProblemAndSubresources();
  }, [id]);

  const fetchProblemAndSubresources = async () => {
    try {
      setLoading(true);
      const data = await getProblemDetails(id);
      setProblem(data);

      const discData = await getProblemDiscussions(id);
      setDiscussions(discData || []);

      const edData = await getProblemEditorial(id);
      setEditorial(edData);

      const subsData = await getSubmissions(id, { limit: 5 }).catch(() => null);
      setSubmissions(subsData?.data || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load problem details.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBookmarkToggle = async () => {
    if (!problem) return;
    try {
      const result = await toggleBookmark(problem.id);
      triggerToast(result.bookmarked ? "Problem bookmarked." : "Bookmark removed.");
      // Refresh
      const updated = await getProblemDetails(id);
      setProblem(updated);
    } catch (e) {
      triggerToast("Failed to toggle bookmark.");
    }
  };

  const handleLikeToggle = async (targetValue) => {
    if (!problem) return;
    try {
      await toggleLike(problem.id, targetValue);
      triggerToast(targetValue === "LIKE" ? "Liked problem." : targetValue === "DISLIKE" ? "Disliked problem." : "Removed feedback.");
      const updated = await getProblemDetails(id);
      setProblem(updated);
    } catch (e) {
      triggerToast("Failed to update feedback.");
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!discTitle.trim() || !discContent.trim()) return;
    try {
      await createProblemDiscussion(id, discTitle.trim(), discContent.trim());
      triggerToast("Discussion posted.");
      setDiscTitle("");
      setDiscContent("");
      setShowDiscModal(false);
      // Refresh discussions
      const discData = await getProblemDiscussions(id);
      setDiscussions(discData || []);
    } catch (err) {
      triggerToast("Failed to post discussion thread.");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await reportProblem(id, reportReason.trim());
      triggerToast("Problem report submitted.");
      setReportReason("");
      setShowReportModal(false);
    } catch (err) {
      triggerToast("Failed to submit report.");
    }
  };

  const examples = useMemo(() => {
    if (!problem) return [];
    try {
      return typeof problem.examples === "string"
        ? JSON.parse(problem.examples)
        : (problem.examples || []);
    } catch {
      return [];
    }
  }, [problem]);

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

  if (!problem) {
    return (
      <div className="lc-problems" style={{ padding: "40px 0", textAlign: "center" }}>
        <h3>Problem Not Found</h3>
        <p>{errorMessage || "Failed to retrieve this problem."}</p>
        <button className="lc-admin-p-btn" onClick={() => navigate("/problems")}>
          ← Back to Problem Browser
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="lc-problems" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ maxWidth: "1280px" }}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div className="problems-toast" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span>✔️ {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="lc-problems__hero" style={{ borderBottom: "1px solid var(--border)", marginBottom: "20px" }}>
        <button className="lc-admin-p-btn" onClick={() => navigate("/problems")} style={{ marginBottom: "12px" }}>
          ← Back to Problems Browser
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>{problem.title}</h1>
            <span className="problems-category-cell">Category: {problem.category}</span>
          </div>
          <span className={`lc-diff-badge lc-diff-badge--${DIFF_CLASS[problem.difficulty]}`}>
            {DIFF_LABEL[problem.difficulty]}
          </span>
        </div>
      </div>

      {/* THREE COLUMN LAYOUT */}
      <div className="problems-details-three-columns" style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1fr", gap: "24px" }}>
        
        {/* LEFT COLUMN: Problem Navigation, Description, Examples, Hints */}
        <div className="problem-details-column left-col" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="stats-card">
            <h3 className="lc-section-title">📝 Challenge Context</h3>
            <p className="lc-desc-text" style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
              Analyze the statement in the center panel, check constraints carefully, and prepare your solution templates.
            </p>
          </div>

          {problem.constraints && (
            <div className="lc-constraints" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "16px" }}>
              <h3 className="lc-section-title">⚠️ Constraints</h3>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                {problem.constraints.split("\n").filter(Boolean).map((c, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Related problems */}
          <div className="stats-card">
            <h3 className="lc-section-title">🔗 Related Problems</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(!problem.relatedProblems || problem.relatedProblems.length === 0) ? (
                <span className="muted-text" style={{ fontSize: "12px" }}>No related problems found.</span>
              ) : (
                (Array.isArray(problem.relatedProblems) ? problem.relatedProblems : []).map(rp => (
                  <div key={rp.id} className="team-item-row" style={{ cursor: "pointer", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }} onClick={() => navigate(`/problems/${rp.id}`)}>
                    <div>
                      <strong style={{ fontSize: "12px", color: "var(--primary)" }}>{rp.title}</strong>
                      <span className="meta-details" style={{ display: "block", fontSize: "10px" }}>{rp.category} | {rp.difficulty}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Problem Statement, Input/Output formats, Examples, Explanations */}
        <div className="problem-details-column center-col" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="stats-card" style={{ padding: "24px" }}>
            <h3 className="lc-section-title">❓ Problem Statement</h3>
            <div className="lc-desc-text" style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-primary)", marginBottom: "20px" }}>
              {problem.description}
            </div>

            {/* Examples list */}
            {examples.length > 0 && (
              <div>
                <h4 className="lc-section-title" style={{ marginTop: "24px" }}>Examples</h4>
                {examples.map((ex, idx) => (
                  <div key={idx} className="lc-example" style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px", marginBottom: "12px" }}>
                    <strong style={{ fontSize: "11px", display: "block", marginBottom: "8px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Example {idx + 1}</strong>
                    <div style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-primary)" }}>
                      <div><strong>Input: </strong> {ex.input}</div>
                      <div style={{ marginTop: "4px" }}><strong>Output: </strong> {ex.output}</div>
                      {ex.explanation && (
                        <div style={{ marginTop: "8px", fontStyle: "italic", color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                          <strong>Explanation: </strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tags and Company associations */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px", borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
              <div>
                <span className="lc-tag-label" style={{ fontSize: "11px" }}>Topic Tags</span>
                <div className="lc-tags" style={{ marginTop: "6px" }}>
                  {(Array.isArray(problem.tags) ? problem.tags : []).map(t => (
                    <span key={t} className="lc-tag" style={{ cursor: "pointer" }} onClick={() => navigate(`/problems?tag=${t}`)}>{t}</span>
                  ))}
                </div>
              </div>

              {Array.isArray(problem.companies) && problem.companies.length > 0 && (
                <div>
                  <span className="lc-tag-label" style={{ fontSize: "11px" }}>Asked by Companies</span>
                  <div className="company-chips-row" style={{ marginTop: "6px" }}>
                    {problem.companies.map(c => (
                      <span key={c} className="company-chip" style={{ cursor: "pointer" }} onClick={() => navigate(`/problems?company=${c}`)}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Editorial Preview */}
          <div className="stats-card">
            <h3 className="lc-section-title">📚 Official Editorial</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "13px" }}>Solution & Approach Walkthrough</strong>
                <span className="meta-details" style={{ display: "block", fontSize: "11px", marginTop: "2px" }}>
                  {editorial?.isLocked ? "🔒 Locked (Pro Member)" : "🔓 Unlocked & Available"}
                </span>
              </div>
              <button className="btn-table-action" onClick={() => setShowEditorialModal(true)}>Read Editorial</button>
            </div>
          </div>

          {/* Discussions Preview */}
          <div className="stats-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 className="lc-section-title" style={{ margin: 0 }}>💬 Discussions ({discussions.length})</h3>
              <button className="btn-table-action" onClick={() => setShowDiscModal(true)}>New Thread</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {discussions.length === 0 ? (
                <span className="muted-text" style={{ fontSize: "12px" }}>No discussions yet. Share your thoughts or solution!</span>
              ) : (
                discussions.slice(0, 3).map(disc => (
                  <div key={disc.id} style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
                    <strong style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                      {disc.isPinned && "📌 "}{disc.title}
                    </strong>
                    <div className="meta-details" style={{ fontSize: "10px", marginTop: "2px" }}>
                      <span>By {disc.user?.name} | {new Date(disc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Quick Actions, Problem Statistics */}
        <div className="problem-details-column right-col" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Quick Actions Card */}
          <div className="stats-card" style={{ padding: "20px" }}>
            <h3 className="lc-section-title">⚡ Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                className="lc-submit-btn" 
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => navigate(`/problems/${problem.id}/solve`)}
              >
                Start Solving 🚀
              </button>
              
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  className={`btn-table-action ${problem.isBookmarked ? "active-like" : ""}`} 
                  onClick={handleBookmarkToggle}
                  style={{ flex: 1, padding: "8px" }}
                >
                  {problem.isBookmarked ? "⭐ Bookmarked" : "☆ Bookmark"}
                </button>
                <button 
                  className={`btn-table-action ${problem.likeStatus === 1 ? "active-like" : ""}`}
                  onClick={() => handleLikeToggle(problem.likeStatus === 1 ? "NONE" : "LIKE")}
                  style={{ flex: 1, padding: "8px" }}
                >
                  👍 Like ({problem.likesCount})
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  className="btn-table-action" 
                  onClick={() => setShowReportModal(true)}
                  style={{ flex: 1, padding: "8px" }}
                >
                  🚩 Report
                </button>
                <button 
                  className="btn-table-action" 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    triggerToast("Problem link copied to clipboard!");
                  }}
                  style={{ flex: 1, padding: "8px" }}
                >
                  🔗 Share
                </button>
              </div>
            </div>
          </div>

          {/* Problem Statistics Card */}
          <div className="stats-card">
            <h3 className="lc-section-title">📈 Statistics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Acceptance Rate:</span>
                <strong>{problem.acceptanceRate}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Total Attempts:</span>
                <strong>{problem.attemptsCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Unique Solves:</span>
                <strong>{problem.solvesCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Difficulty Score:</span>
                <strong>{problem.difficulty}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Time Limit:</span>
                <strong>{problem.timeLimit || "2000 ms"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Memory Limit:</span>
                <strong>{problem.memoryLimit || "256 MB"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Author:</span>
                <strong>{problem.author || "System Admin"}</strong>
              </div>
            </div>
          </div>

          {/* Submission History Section */}
          <div className="stats-card">
            <h3 className="lc-section-title">🕒 Recent Submissions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(submissions || []).length === 0 ? (
                <span className="muted-text" style={{ fontSize: "12px" }}>No submissions yet.</span>
              ) : (
                (submissions || []).slice(0, 5).map(sub => {
                  const statusMetaVal = VERDICT_META[sub.status] || { label: sub.status, class: "runtime_error" };
                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => navigate(`/submissions/${sub.id}`)}
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        borderBottom: "1px solid var(--border-light)", 
                        paddingBottom: "6px", 
                        cursor: "pointer" 
                      }}
                      className="team-item-row"
                    >
                      <div>
                        <span className={`status-badge ${statusMetaVal.class}`} style={{ fontSize: "10px", padding: "1px 4px", borderRadius: "3px" }}>
                          {statusMetaVal.label}
                        </span>
                        <span className="meta-details" style={{ display: "block", fontSize: "10px", marginTop: "2px" }}>
                          {sub.language} • {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "700" }}>
                        {sub.executionTime ? `${Math.round(sub.executionTime * 1000)} ms` : "—"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* DISCUSSIONS SUBMIT MODAL */}
      <AnimatePresence>
        {showDiscModal && (
          <div className="create-modal-overlay">
            <motion.div className="create-modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3>Create Discussion Thread</h3>
              <form onSubmit={handlePostDiscussion} className="modal-form">
                <div>
                  <label>Thread Title</label>
                  <input type="text" value={discTitle} onChange={(e) => setDiscTitle(e.target.value)} placeholder="e.g. Elegant O(N) Python solution using stack" required />
                </div>
                <div>
                  <label>Body Content</label>
                  <textarea rows="4" value={discContent} onChange={(e) => setDiscContent(e.target.value)} placeholder="Explain your code logic or ask questions..." required />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Post Thread</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowDiscModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT SUBMIT MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <div className="create-modal-overlay">
            <motion.div className="create-modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3>Report Problem</h3>
              <form onSubmit={handleReportSubmit} className="modal-form">
                <div>
                  <label>Reason / Description of Issue</label>
                  <textarea rows="3" value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="e.g. Wrong testcase expected output, typo in description..." required />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Submit Report</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDITORIAL CONTENT READ MODAL */}
      <AnimatePresence>
        {showEditorialModal && (
          <div className="create-modal-overlay">
            <motion.div className="create-modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3>Problem Solution Editorial</h3>
              <div style={{ margin: "16px 0", fontSize: "13px", lineHeight: "1.6", maxHeight: "300px", overflowY: "auto", background: "var(--background)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {editorial?.content ? (
                  <div style={{ whiteSpace: "pre-wrap" }}>{editorial.content}</div>
                ) : (
                  <span className="muted-text">No editorial content available yet for this problem.</span>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditorialModal(false)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
