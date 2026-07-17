import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  getSolutionsForProblem, 
  createSolution, 
  updateSolution, 
  deleteSolution, 
  publishSolution, 
  hideSolution 
} from "../../services/solutionService";
import { getProblemDetails } from "../../services/problemService";
import "../Problems/Problems.css";

const LANGUAGES = ["javascript", "python", "cpp", "c", "java", "go", "rust", "typescript"];

export default function AdminSolutions() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  // Core States
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Form States
  const [editingSolutionId, setEditingSolutionId] = useState(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [approach, setApproach] = useState("");
  const [stepExplanation, setStepExplanation] = useState("");
  const [timeComplexity, setTimeComplexity] = useState("O(N)");
  const [spaceComplexity, setSpaceComplexity] = useState("O(1)");
  const [code, setCode] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setEditingSolutionId(null);
    setTitle("");
    setLanguage("javascript");
    setApproach("");
    setStepExplanation("");
    setTimeComplexity("O(N)");
    setSpaceComplexity("O(1)");
    setCode("");
    setVisibility("PRIVATE");
  };

  const handleEditClick = (sol) => {
    setEditingSolutionId(sol.id);
    setTitle(sol.title);
    setLanguage(sol.language);
    setApproach(sol.approach?.description || "");
    setStepExplanation(sol.explanation?.steps || "");
    setTimeComplexity(sol.complexity?.time || "O(N)");
    setSpaceComplexity(sol.complexity?.space || "O(1)");
    setCode(sol.code);
    setVisibility(sol.visibility);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      problemId,
      title,
      language,
      approach,
      stepExplanation,
      timeComplexity,
      spaceComplexity,
      code,
      visibility
    };

    try {
      if (editingSolutionId) {
        await updateSolution(editingSolutionId, payload);
      } else {
        await createSolution(payload);
      }
      handleResetForm();
      const updated = await getSolutionsForProblem(problemId);
      setSolutions(updated || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this official solution?")) return;
    try {
      await deleteSolution(id);
      const updated = await getSolutionsForProblem(problemId);
      setSolutions(updated || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleVisibility = async (sol) => {
    try {
      if (sol.visibility === "PUBLIC") {
        await hideSolution(sol.id);
      } else {
        await publishSolution(sol.id);
      }
      const updated = await getSolutionsForProblem(problemId);
      setSolutions(updated || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="teams-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
      </div>
    );
  }

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <button className="lc-admin-p-btn" onClick={() => navigate("/problems/admin")} style={{ marginBottom: "8px" }}>
            ← Back to Admin Console
          </button>
          <h1>Official Solutions: {problem?.title}</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        
        {/* LEFT COLUMN: Solutions list */}
        <div>
          <div className="stats-card" style={{ marginBottom: "20px" }}>
            <h3 className="lc-section-title">Deployed Solutions ({solutions.length})</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {solutions.length === 0 ? (
                <span className="muted-text">No solutions added yet.</span>
              ) : (
                solutions.map(sol => (
                  <div key={sol.id} style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{sol.title}</strong>
                        <span className="meta-details" style={{ display: "block", fontSize: "11px" }}>
                          Language: <span style={{ textTransform: "capitalize" }}>{sol.language}</span> | Complexity: {sol.complexity?.time}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn-table-action" onClick={() => handleToggleVisibility(sol)}>
                          {sol.visibility === "PUBLIC" ? "🔒 Hide" : "🔓 Publish"}
                        </button>
                        <button className="btn-table-action" onClick={() => handleEditClick(sol)}>Edit</button>
                        <button className="btn-table-action" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={() => handleDelete(sol.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Add/Edit Form */}
        <div>
          <div className="stats-card">
            <h3 className="lc-section-title">{editingSolutionId ? "📝 Edit Solution" : "✨ Add Official Solution"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div>
                <label>Solution Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Optimal two pointer solution" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label>Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: "8px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px", width: "100%" }}>
                    {LANGUAGES.map(l => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Visibility</label>
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value)} style={{ padding: "8px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px", width: "100%" }}>
                    <option value="PRIVATE">PRIVATE (Only solved users)</option>
                    <option value="PUBLIC">PUBLIC (Everyone)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label>Time Complexity</label>
                  <input type="text" value={timeComplexity} onChange={(e) => setTimeComplexity(e.target.value)} required />
                </div>
                <div>
                  <label>Space Complexity</label>
                  <input type="text" value={spaceComplexity} onChange={(e) => setSpaceComplexity(e.target.value)} required />
                </div>
              </div>

              <div>
                <label>Algorithm Concept Explanation</label>
                <textarea rows="3" value={approach} onChange={(e) => setApproach(e.target.value)} placeholder="Explain the high-level intuition..." required />
              </div>

              <div>
                <label>Step-by-step Implementation Steps</label>
                <textarea rows="3" value={stepExplanation} onChange={(e) => setStepExplanation(e.target.value)} placeholder="List out step 1, step 2..." required />
              </div>

              <div>
                <label>Solution Source Code</label>
                <textarea rows="5" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste the boilerplate solution code here..." required style={{ fontFamily: "monospace" }} />
              </div>

              <div className="modal-actions" style={{ marginTop: "14px" }}>
                <button type="submit" className="btn-primary">{editingSolutionId ? "Update" : "Create"}</button>
                {editingSolutionId && (
                  <button type="button" className="btn-secondary" onClick={handleResetForm}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
