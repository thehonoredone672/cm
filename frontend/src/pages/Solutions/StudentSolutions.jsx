import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getSolutionsForProblem } from "../../services/solutionService";
import { getProblemDetails } from "../../services/problemService";
import "../Problems/Problems.css";

export default function StudentSolutions() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Collapsed sections tracker per solution ID
  const [collapsedExplanations, setCollapsedExplanations] = useState({});

  useEffect(() => {
    fetchProblemAndSolutions();
  }, [problemId]);

  const fetchProblemAndSolutions = async () => {
    try {
      setLoading(true);
      const prob = await getProblemDetails(problemId);
      setProblem(prob);

      const data = await getSolutionsForProblem(problemId);
      setSolutions(data || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Solutions are locked. You must solve this problem first to view the official solution.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (id, codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExplanationCollapse = (id) => {
    setCollapsedExplanations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="teams-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="lc-problems" style={{ padding: "40px 0", textAlign: "center" }}>
        <h3>🔒 Solutions Locked</h3>
        <p style={{ margin: "10px 0 20px 0", fontSize: "14px", color: "var(--text-secondary)" }}>{errorMessage}</p>
        <button className="lc-submit-btn" onClick={() => navigate(`/problems/${problemId}/solve`)}>
          Start Solving to Unlock 🚀
        </button>
      </div>
    );
  }

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button className="lc-admin-p-btn" onClick={() => navigate(`/problems/${problemId}`)} style={{ marginBottom: "16px" }}>
        ← Back to Problem Details
      </button>

      <h1>Official Solutions: {problem?.title}</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "20px" }}>
        {solutions.length === 0 ? (
          <div className="stats-card" style={{ padding: "40px", textAlign: "center" }}>
            <span className="muted-text">No official solutions found for this problem yet. Check back later!</span>
          </div>
        ) : (
          solutions.map(sol => (
            <div key={sol.id} className="stats-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>{sol.title}</h2>
                  <span className="meta-details" style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    Language: {sol.language}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", fontSize: "12px" }}>
                  <div className="lc-tag" style={{ margin: 0 }}>Time: {sol.complexity?.time}</div>
                  <div className="lc-tag" style={{ margin: 0 }}>Space: {sol.complexity?.space}</div>
                </div>
              </div>

              {/* Intuition section */}
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "14px" }}>Intuition & Algorithm Concept</h4>
                <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-secondary)" }}>{sol.approach?.description}</p>
              </div>

              {/* Collapsible details section */}
              <div style={{ marginBottom: "20px" }}>
                <button 
                  className="btn-table-action" 
                  onClick={() => toggleExplanationCollapse(sol.id)}
                  style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "12px" }}
                >
                  {collapsedExplanations[sol.id] ? "▼ Show Step-by-Step Details" : "▲ Hide Step-by-Step Details"}
                </button>

                {!collapsedExplanations[sol.id] && (
                  <div style={{ marginTop: "12px", background: "var(--background)", padding: "14px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "13px" }}>Implementation Steps</h4>
                    <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                      {sol.explanation?.steps}
                    </p>
                  </div>
                )}
              </div>

              {/* Code section */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "13px" }}>Solution Code</strong>
                  <button className="btn-table-action" onClick={() => handleCopyCode(sol.id, sol.code)}>
                    {copiedId === sol.id ? "Copied! ✓" : "Copy Code 📋"}
                  </button>
                </div>
                <pre style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", overflowX: "auto", fontFamily: "monospace", fontSize: "12px", color: "var(--text-primary)" }}>
                  <code>{sol.code}</code>
                </pre>
              </div>

            </div>
          ))
        )}
      </div>

    </motion.div>
  );
}
