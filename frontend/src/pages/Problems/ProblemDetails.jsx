import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getProblemDetails } from "../../services/problemService";
import { runCode, submitCode, getSubmissions } from "../../services/submissionService";
import "./Problems.css";

const DEFAULT_STARTER_CODE = {
  javascript: `function solve(input) {\n  // Write your code here\n  return input;\n}`,
  python: `def solve(input_str):\n    # Write your code here\n    return input_str`,
  cpp: `#include <string>\nusing namespace std;\n\nstring solve(string input) {\n    // Write your code here\n    return input;\n}`,
  c: `#include <stdio.h>\n#include <string.h>\n\nchar* solve(char* input) {\n    // Write your code here\n    return input;\n}`,
  java: `public class Solution {\n    public static String solve(String input) {\n        // Write your code here\n        return input;\n    }\n}`
};

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tab navigation in left pane: "description" | "submissions"
  const [leftTab, setLeftTab] = useState("description");
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Editor states
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [theme, setTheme] = useState("vs-dark"); // "vs-dark" | "light"
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Run / Submit states
  const [executing, setExecuting] = useState(false);
  const [execType, setExecType] = useState(null); // "run" | "submit"
  const [execResult, setExecResult] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [testCaseTab, setTestCaseTab] = useState(0);

  useEffect(() => {
    fetchProblemDetails();
  }, [id]);

  useEffect(() => {
    if (problem) {
      // Load saved draft or fall back to starter code from DB or default
      const savedCode = localStorage.getItem(`draft_${id}_${language}`);
      if (savedCode) {
        setCode(savedCode);
      } else {
        const dbStarterCode = problem.starterCode?.[language] || DEFAULT_STARTER_CODE[language];
        setCode(dbStarterCode);
      }
    }
  }, [id, language, problem]);

  const fetchProblemDetails = async () => {
    try {
      setLoading(true);
      const data = await getProblemDetails(id);
      setProblem(data);
      // default language
      setLanguage("javascript");
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load problem details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const data = await getSubmissions(id);
      setPastSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
    // Auto-save draft
    localStorage.setItem(`draft_${id}_${language}`, value || "");
  };

  const handleResetCode = () => {
    if (!window.confirm("Are you sure you want to reset your code to the default starter template?")) return;
    const dbStarterCode = problem?.starterCode?.[language] || DEFAULT_STARTER_CODE[language];
    setCode(dbStarterCode);
    localStorage.removeItem(`draft_${id}_${language}`);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === "vs-dark" ? "light" : "vs-dark");
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleRunCode = async () => {
    if (executing) return;

    try {
      setExecuting(true);
      setExecType("run");
      setExecResult(null);
      setDrawerOpen(true);

      const result = await runCode(id, code, language);
      setExecResult(result);
      setTestCaseTab(0);
    } catch (err) {
      console.error(err);
      setExecResult({
        success: false,
        status: "RUNTIME_ERROR",
        errorMessage: err.response?.data?.message || "Execution request failed."
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (executing) return;

    try {
      setExecuting(true);
      setExecType("submit");
      setExecResult(null);
      setDrawerOpen(true);

      const result = await submitCode(id, code, language);
      setExecResult(result.executionResult);
      setTestCaseTab(0);
      
      // If we are on submissions tab, reload
      if (leftTab === "submissions") {
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
      setExecResult({
        success: false,
        status: "RUNTIME_ERROR",
        errorMessage: err.response?.data?.message || "Submission request failed."
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleLeftTabChange = (tab) => {
    setLeftTab(tab);
    if (tab === "submissions") {
      fetchSubmissions();
    }
  };

  if (loading) {
    return (
      <div className="problems-page" style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2>Loading problem environment...</h2>
      </div>
    );
  }

  if (errorMessage && !problem) {
    return (
      <div className="problems-page">
        <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)" }}>{errorMessage}</div>
        <button className="btn-secondary" onClick={() => navigate("/problems")} style={{ marginTop: "12px" }}>Back to Problems</button>
      </div>
    );
  }

  // Parse constraints and examples from JSON
  const parsedExamples = typeof problem.examples === "string" ? JSON.parse(problem.examples) : problem.examples || [];
  const parsedStarterCode = typeof problem.starterCode === "string" ? JSON.parse(problem.starterCode) : problem.starterCode || {};

  return (
    <div className={`split-layout ${isFullscreen ? "fullscreen-mode" : ""}`} style={isFullscreen ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, height: "100vh", margin: 0, padding: "12px" } : {}}>
      
      {/* LEFT PANE: DESCRIPTION & PAST SUBMISSIONS */}
      <div className="left-pane">
        <div className="pane-tabs">
          <button 
            className={`pane-tab ${leftTab === "description" ? "active" : ""}`}
            onClick={() => handleLeftTabChange("description")}
          >
            Description
          </button>
          <button 
            className={`pane-tab ${leftTab === "submissions" ? "active" : ""}`}
            onClick={() => handleLeftTabChange("submissions")}
          >
            Submissions
          </button>
        </div>

        <div className="pane-content">
          {leftTab === "description" ? (
            <>
              <h2>{problem.title}</h2>
              <div className="problem-meta-row">
                <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Category: <strong>{problem.category}</strong>
                </span>
              </div>

              <div className="problem-description">
                {problem.description}
              </div>

              {parsedExamples.length > 0 && (
                <div>
                  <h3>Examples</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {parsedExamples.map((ex, idx) => (
                      <div key={idx} className="example-box">
                        <div><strong>Example {idx + 1}:</strong></div>
                        <div><strong>Input:</strong> <code>{ex.input}</code></div>
                        <div><strong>Output:</strong> <code>{ex.output}</code></div>
                        {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {problem.constraints && (
                <div>
                  <h3>Constraints</h3>
                  <ul className="constraints-list">
                    {problem.constraints.split("\n").map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="submissions-section">
              <h2>My Submissions</h2>
              {submissionsLoading ? (
                <div style={{ padding: "20px 0" }}>Loading past submissions...</div>
              ) : pastSubmissions.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-secondary)" }}>
                  You haven't submitted any solutions yet.
                </div>
              ) : (
                <div className="submissions-list" style={{ marginTop: "16px" }}>
                  {pastSubmissions.map((sub) => (
                    <div key={sub.id} className="submission-item">
                      <div>
                        <span className={`submission-status ${sub.status.toLowerCase()}`}>
                          {sub.status === "ACCEPTED" ? "Accepted" : sub.status.replace("_", " ")}
                        </span>
                        <div className="submission-meta" style={{ marginTop: "4px" }}>
                          <span>Language: <strong>{sub.language}</strong></span>
                          {sub.executionTime !== null && <span>Runtime: <strong>{Math.round(sub.executionTime * 1000)} ms</strong></span>}
                          {sub.memoryUsage !== null && <span>Memory: <strong>{sub.memoryUsage} MB</strong></span>}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", textAlign: "right" }}>
                        <div>{sub.testCasesPassed} / {sub.totalTestCases} passed</div>
                        <div>{new Date(sub.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: MONACO EDITOR & TERMINAL RESULTS */}
      <div className="right-pane">
        
        {/* Monaco Editor Container */}
        <div className="editor-container">
          <div className="editor-header">
            <select 
              className="editor-select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>

            <div className="editor-controls">
              <button className="editor-btn" onClick={handleThemeToggle} title="Toggle Dark/Light theme">
                {theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button className="editor-btn" onClick={handleResetCode} title="Reset to starter template">
                Reset
              </button>
              <button className="editor-btn" onClick={handleFullscreenToggle} title="Fullscreen Mode">
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>

          <div className="monaco-wrapper">
            <Editor
              height="100%"
              language={language === "cpp" || language === "c" ? "cpp" : language}
              theme={theme}
              value={code}
              onChange={handleEditorChange}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible"
                },
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>
        </div>

        {/* Results / Drawer Container */}
        {drawerOpen && (
          <div className="results-drawer">
            <div className="drawer-header">
              <span>Execution Results ({execType === "run" ? "Run Code" : "Submit Code"})</span>
              <button 
                onClick={() => setDrawerOpen(false)} 
                style={{ background: "transparent", fontSize: "14px", color: "var(--text-secondary)", border: "none", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div className="drawer-content">
              {executing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
                  <div style={{ width: "30px", height: "30px", border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <span>Running test cases locally...</span>
                </div>
              ) : execResult ? (
                <div>
                  {execResult.status === "COMPILATION_ERROR" ? (
                    <div className="terminal-error">
                      <strong>Compilation Error:</strong>
                      <pre style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>{execResult.errorMessage}</pre>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", gap: "16px", marginBottom: "12px", alignItems: "center" }}>
                        <span className={`submission-status ${execResult.status.toLowerCase()}`}>
                          {execResult.status === "ACCEPTED" ? "Success (Accepted)" : execResult.status.replace("_", " ")}
                        </span>
                        {execResult.executionTime !== undefined && (
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                            Runtime: <strong>{Math.round(execResult.executionTime * 1000)} ms</strong>
                          </span>
                        )}
                        {execResult.memoryUsage !== undefined && (
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                            Memory: <strong>{execResult.memoryUsage} MB</strong>
                          </span>
                        )}
                      </div>

                      {execResult.results && execResult.results.length > 0 && (
                        <div>
                          <div className="testcase-tab-header">
                            {execResult.results.map((res, idx) => (
                              <button 
                                key={idx}
                                className={`testcase-tab ${testCaseTab === idx ? "active" : ""}`}
                                onClick={() => setTestCaseTab(idx)}
                                style={res.status !== "ACCEPTED" ? { borderColor: "var(--danger)", color: "var(--danger)" } : {}}
                              >
                                Case {idx + 1} {res.status !== "ACCEPTED" && "❌"}
                              </button>
                            ))}
                          </div>

                          <div className="example-box" style={{ marginTop: "10px" }}>
                            <div><strong>Input:</strong> <code>{execResult.results[testCaseTab]?.input}</code></div>
                            <div><strong>Expected Output:</strong> <code>{execResult.results[testCaseTab]?.expectedOutput}</code></div>
                            {execResult.results[testCaseTab]?.status === "ACCEPTED" ? (
                              <div className="terminal-success"><strong>Output:</strong> <code>{execResult.results[testCaseTab]?.output}</code></div>
                            ) : execResult.results[testCaseTab]?.status === "WRONG_ANSWER" ? (
                              <div className="terminal-error" style={{ margin: 0, padding: "4px" }}>
                                <strong>Output:</strong> <code>{execResult.results[testCaseTab]?.output}</code>
                              </div>
                            ) : (
                              <div className="terminal-error" style={{ margin: 0, padding: "4px" }}>
                                <strong>Error:</strong> {execResult.results[testCaseTab]?.error || "Runtime Error"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: "var(--text-secondary)" }}>No run logs yet. Click Run or Submit to test your code.</div>
              )}
            </div>
          </div>
        )}

        {/* Panel Footer */}
        <div className="results-footer">
          <button 
            className="editor-btn" 
            onClick={handleRunCode}
            disabled={executing}
          >
            Run Code
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmitCode}
            disabled={executing}
            style={{ padding: "8px 20px" }}
          >
            Submit
          </button>
        </div>

      </div>
    </div>
  );
}
