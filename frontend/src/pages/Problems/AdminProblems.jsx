import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProblems, createProblem, updateProblem, deleteProblem } from "../../services/problemService";
import { useAuth } from "../../context/AuthContext";
import "./Problems.css";

export default function AdminProblems() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editor/Create Modal Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [tags, setTags] = useState("");
  const [constraints, setConstraints] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [visibility, setVisibility] = useState("PUBLIC");

  // Code templates
  const [jsStarter, setJsStarter] = useState("function solve(input) {\n  return input;\n}");
  const [pyStarter, setPyStarter] = useState("def solve(input_str: str) -> str:\n    return input_str");

  // Examples (JSON format or structured inputs)
  const [examplesText, setExamplesText] = useState('[\n  {\n    "input": "test",\n    "output": "test",\n    "explanation": "Simple fallback explanation"\n  }\n]');

  // Test Cases
  const [testCasesText, setTestCasesText] = useState('[\n  {\n    "input": "hello",\n    "expectedOutput": "hello",\n    "isPublic": true\n  }\n]');

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/problems");
      return;
    }
    load();
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProblems();
      setProblems(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load problems.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setCategory(p.category);
    setDifficulty(p.difficulty);
    setTags(p.tags ? p.tags.join(", ") : "");
    setConstraints(p.constraints || "");
    setStatus(p.status || "PUBLISHED");
    setVisibility(p.visibility || "PUBLIC");
    setJsStarter(p.starterCode?.javascript || "");
    setPyStarter(p.starterCode?.python || "");
    setExamplesText(JSON.stringify(p.examples || [], null, 2));
    // Load test cases
    if (p.testCases) {
      setTestCasesText(JSON.stringify(p.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isPublic: tc.isPublic
      })), null, 2));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setDifficulty("EASY");
    setTags("");
    setConstraints("");
    setStatus("PUBLISHED");
    setVisibility("PUBLIC");
    setJsStarter("function solve(input) {\n  return input;\n}");
    setPyStarter("def solve(input_str: str) -> str:\n    return input_str");
    setExamplesText('[\n  {\n    "input": "test",\n    "output": "test",\n    "explanation": "Simple fallback explanation"\n  }\n]');
    setTestCasesText('[\n  {\n    "input": "hello",\n    "expectedOutput": "hello",\n    "isPublic": true\n  }\n]');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim() || !category.trim()) {
      setError("Title, Description, and Category are required.");
      return;
    }

    let parsedExamples = [];
    let parsedTestCases = [];
    try {
      parsedExamples = JSON.parse(examplesText);
      parsedTestCases = JSON.parse(testCasesText);
    } catch (err) {
      setError("Examples or Test Cases JSON is invalid. Please format correctly.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      difficulty,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      constraints: constraints.trim() || null,
      status,
      visibility,
      starterCode: {
        javascript: jsStarter,
        python: pyStarter,
      },
      examples: parsedExamples,
      testCases: parsedTestCases,
    };

    try {
      if (editingId) {
        await updateProblem(editingId, payload);
        setSuccess("Problem updated successfully!");
      } else {
        await createProblem(payload);
        setSuccess("Problem created successfully!");
      }
      handleResetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save problem.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      setError("");
      setSuccess("");
      await deleteProblem(id);
      setSuccess("Problem deleted successfully.");
      load();
    } catch (err) {
      setError("Failed to delete problem.");
    }
  };

  return (
    <div className="lc-problems admin-problems">
      <div className="lc-problems__hero">
        <h1>Admin Control Panel</h1>
        <p>Manage platform challenges, starter code, visibility, and test cases.</p>
      </div>

      {error && <div className="lc-console-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ color: "#22c55e", fontWeight: "bold", marginBottom: 16 }}>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        
        {/* Creation/Edit Form */}
        <div className="lc-constraints" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
          <h3 className="lc-section-title">{editingId ? "Edit Challenge" : "Create New Challenge"}</h3>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Category</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Description</label>
              <textarea 
                rows="4"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Visibility</label>
                <select 
                  value={visibility} 
                  onChange={(e) => setVisibility(e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Tags (Comma-separated)</label>
              <input 
                type="text" 
                value={tags} 
                placeholder="strings, arrays, dynamic-programming"
                onChange={(e) => setTags(e.target.value)} 
                style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Constraints (One per line)</label>
              <textarea 
                rows="2"
                value={constraints} 
                onChange={(e) => setConstraints(e.target.value)} 
                style={{ width: "100%", padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>JS Starter Code</label>
              <textarea 
                rows="3"
                value={jsStarter} 
                onChange={(e) => setJsStarter(e.target.value)} 
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12, padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Python Starter Code</label>
              <textarea 
                rows="3"
                value={pyStarter} 
                onChange={(e) => setPyStarter(e.target.value)} 
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12, padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Examples (JSON Array)</label>
              <textarea 
                rows="3"
                value={examplesText} 
                onChange={(e) => setExamplesText(e.target.value)} 
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12, padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Test Cases (JSON Array)</label>
              <textarea 
                rows="3"
                value={testCasesText} 
                onChange={(e) => setTestCasesText(e.target.value)} 
                style={{ width: "100%", fontFamily: "monospace", fontSize: 12, padding: "8px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" className="lc-submit-btn" style={{ padding: "10px 24px" }}>
                {editingId ? "Update Problem" : "Create Problem"}
              </button>
              {editingId && (
                <button type="button" className="lc-run-btn" onClick={handleResetForm} style={{ padding: "10px 20px" }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Problems List */}
        <div>
          <h3 className="lc-section-title">Existing Challenges</h3>
          {loading ? (
            <div className="lc-spinner" style={{ height: "200px" }}><div className="lc-spin" /></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "800px", overflowY: "auto" }}>
              {problems.map((p) => (
                <div key={p.id} className="lc-sub-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "var(--text-primary)" }}>{p.title}</h4>
                    <div style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
                      <span className={`lc-diff-badge lc-diff-badge--${p.difficulty.toLowerCase()}`} style={{ padding: "1px 6px" }}>{p.difficulty}</span>
                      <span style={{ color: "var(--text-muted)" }}>{p.category}</span>
                      <span style={{ color: p.status === "DRAFT" ? "#ef4444" : "#22c55e" }}>{p.status}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="lc-editor-btn" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="lc-editor-btn" style={{ color: "#ef4444" }} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
