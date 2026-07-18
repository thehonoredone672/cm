import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getSubmissionDetail } from "../../services/submissionService";
import "../Problems/Problems.css";

const VERDICT_META = {
  ACCEPTED: { label: "Accepted", class: "accepted", icon: "✓" },
  WRONG_ANSWER: { label: "Wrong Answer", class: "wrong_answer", icon: "✗" },
  RUNTIME_ERROR: { label: "Runtime Error", class: "runtime_error", icon: "⚠" },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit Exceeded", class: "time_limit_exceeded", icon: "⌛" },
  COMPILATION_ERROR: { label: "Compilation Error", class: "compilation_error", icon: "⊘" },
  MEMORY_LIMIT_EXCEEDED: { label: "Memory Limit Exceeded", class: "memory_limit_exceeded", icon: "🔴" }
};

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getSubmissionDetail(id);
      setSubmission(data);
    } catch (err) {
      console.error("[SubmissionDetail] Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!submission?.code) return;
    navigator.clipboard.writeText(submission.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="teams-loading-wrapper">
        <div className="skeleton-item hero-skeleton" style={{ height: "60px", marginBottom: "20px" }} />
        <div className="skeleton-item card-skeleton" style={{ height: "200px", marginBottom: "20px" }} />
        <div className="skeleton-item card-skeleton" style={{ height: "300px" }} />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="lc-problems" style={{ padding: "40px 0", textAlign: "center" }}>
        <h3>Submission Not Found</h3>
        <p>We could not find details for submission with ID: {id}</p>
        <button className="lc-admin-p-btn" onClick={() => navigate("/submissions/history")}>
          ← Back to Submissions History
        </button>
      </div>
    );
  }

  const meta = VERDICT_META[submission.status] || { label: submission.status, class: "runtime-error", icon: "?" };

  return (
    <motion.div 
      className="lc-problems"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "24px" }}>
        <div>
          <button className="lc-admin-p-btn" onClick={() => navigate("/submissions/history")} style={{ marginBottom: "8px" }}>
            ← Back to History
          </button>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            Submission details for: {submission.problem?.title}
          </h2>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
            Submission ID: {submission.id} • Submitted at {new Date(submission.createdAt).toLocaleString()}
          </span>
        </div>
        <span className={`status-badge ${meta.class}`} style={{ fontSize: "14px", padding: "6px 12px", borderRadius: "6px" }}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
        
        {/* Left Column: Code viewer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="stats-card" style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 className="lc-section-title" style={{ margin: 0 }}>💻 Submitted Source Code</h3>
              <button className="btn-table-action" onClick={handleCopyCode}>
                {copied ? "Copied! ✓" : "Copy Code"}
              </button>
            </div>
            <pre style={{ 
              background: "var(--background)", 
              border: "1.5px solid var(--border)", 
              borderRadius: "8px", 
              padding: "16px", 
              overflow: "auto", 
              fontFamily: "'JetBrains Mono', Courier, monospace", 
              fontSize: "12px", 
              color: "var(--text-primary)", 
              flex: 1,
              maxHeight: "600px"
            }}>
              <code>{submission.code}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Execution stats and errors */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Execution Statistics */}
          <div className="stats-card" style={{ padding: "20px" }}>
            <h3 className="lc-section-title">📊 Execution Statistics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Verdict:</span>
                <span className={`status-badge ${meta.class}`} style={{ fontSize: "11px" }}>{meta.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Programming Language:</span>
                <strong style={{ textTransform: "uppercase" }}>{submission.language}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Passed Test Cases:</span>
                <strong>{submission.testCasesPassed} / {submission.totalTestCases}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Runtime:</span>
                <strong>{submission.executionTime ? `${Math.round(submission.executionTime * 1000)} ms` : "—"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Memory Usage:</span>
                <strong>{submission.memoryUsage ? `${submission.memoryUsage} MB` : "—"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted-text">Code Size:</span>
                <strong>{submission.code ? `${new Blob([submission.code]).size} bytes` : "0 bytes"}</strong>
              </div>
            </div>
          </div>

          {/* Compilation/Runtime Error Logs */}
          {submission.errorMessage && (
            <div className="lc-constraints" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1.5px solid #ef4444", borderRadius: "8px", padding: "16px" }}>
              <h3 className="lc-section-title" style={{ color: "#ef4444" }}>⚠️ Error Messages / logs</h3>
              <pre style={{ 
                fontFamily: "monospace", 
                fontSize: "11px", 
                color: "#ef4444", 
                whiteSpace: "pre-wrap", 
                wordBreak: "break-all",
                background: "rgba(239, 68, 68, 0.02)",
                padding: "8px",
                borderRadius: "4px"
              }}>
                {submission.errorMessage}
              </pre>
            </div>
          )}

          {/* Test Case Breakdown details info */}
          {submission.status !== "ACCEPTED" && !submission.errorMessage && (
            <div className="stats-card" style={{ padding: "16px" }}>
              <h3 className="lc-section-title">🔍 Execution Details</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
                This solution failed on test case <strong>{submission.testCasesPassed + 1}</strong>.
                Verify execution limits, input constraints, and return statements.
              </p>
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
