import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { 
  getProblemDetails, 
  getProblemsStatistics 
} from "../../services/problemService";
import { 
  runCode, 
  submitCode, 
  runCustomCode,
  getCodeDraft,
  saveCodeDraft,
  getEditorSettings,
  saveEditorSettings,
  getLanguagePreference,
  saveLanguagePreference
} from "../../services/submissionService";
import { motion, AnimatePresence } from "framer-motion";
import "./Problems.css";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python",     label: "Python 3"   },
  { id: "cpp",        label: "C++"        },
  { id: "c",          label: "C"          },
  { id: "java",       label: "Java"       },
];

const STARTER = {
  javascript: `function solve(input) {\n  // Write your solution here\n  return input;\n}`,
  python: `def solve(input_str: str) -> str:\n    # Write your solution here\n    return input_str`,
  cpp: `#include <string>\nusing namespace std;\n\nstring solve(string input) {\n    // Write your solution here\n    return input;\n}`,
  c: `#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nchar* solve(char* input) {\n    // Write your solution here\n    return input;\n}`,
  java: `public class Solution {\n    public static String solve(String input) {\n        // Write your solution here\n        return input;\n    }\n}`,
};

const STATUS_META = {
  ACCEPTED:             { label: "Accepted",              icon: "✓", cls: "accepted"             },
  WRONG_ANSWER:         { label: "Wrong Answer",          icon: "✗", cls: "wrong_answer"         },
  RUNTIME_ERROR:        { label: "Runtime Error",         icon: "⚠", cls: "runtime_error"        },
  TIME_LIMIT_EXCEEDED:  { label: "Time Limit Exceeded",   icon: "⌛", cls: "time_limit_exceeded"  },
  COMPILATION_ERROR:    { label: "Compilation Error",     icon: "⊘", cls: "compilation_error"    },
  MEMORY_LIMIT_EXCEEDED: { label: "Memory Limit Exceeded", icon: "🔴", cls: "runtime_error"      },
};

export default function ProblemSolve() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core Data States
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Editor configuration preferences
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER.javascript);
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState("off");
  const [minimap, setMinimap] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Execution console states
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState(null);
  const [consoleTab, setConsoleTab] = useState("results"); // "custom-input" or "results"
  const [customInput, setCustomInput] = useState("");
  const [selectedCase, setSelectedCase] = useState(0);

  // Auto-save timer reference
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    fetchProblemDetailsAndPreferences();
  }, [id]);

  const fetchProblemDetailsAndPreferences = async () => {
    try {
      setLoading(true);
      const data = await getProblemDetails(id);
      setProblem(data);

      // Fetch user preferred language
      const langPref = await getLanguagePreference().catch(() => null);
      const selectedLang = langPref?.language || "javascript";
      setLanguage(selectedLang);

      // Fetch editor settings
      const settings = await getEditorSettings().catch(() => null);
      if (settings) {
        setTheme(settings.theme || "vs-dark");
        setFontSize(settings.fontSize || 14);
        setWordWrap(settings.wordWrap || "off");
        setMinimap(settings.minimap ?? false);
        setAutoSaveEnabled(settings.autoSave ?? true);
      }

      // Fetch saved draft for this language
      const draft = await getCodeDraft(id, selectedLang).catch(() => null);
      if (draft && draft.code) {
        setCode(draft.code);
      } else {
        setCode(STARTER[selectedLang]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load problem workspace details.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save CodeDraft debounced
  const triggerAutoSave = (updatedCode, currentLang) => {
    if (!autoSaveEnabled) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveCodeDraft(id, currentLang, updatedCode);
        console.log("Draft code autosaved.");
      } catch (e) {
        console.error("Draft autosave failed", e);
      }
    }, 2000);
  };

  // Language switch triggers preferences update & boilerplate swap
  const handleLanguageChange = async (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    try {
      await saveLanguagePreference(selectedLang);
      // Try restoring code draft for new language
      const draft = await getCodeDraft(id, selectedLang).catch(() => null);
      if (draft && draft.code) {
        setCode(draft.code);
      } else {
        setCode(STARTER[selectedLang]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettingsUpdate = async (updatedFields) => {
    try {
      const payload = {
        theme: updatedFields.theme !== undefined ? updatedFields.theme : theme,
        fontSize: updatedFields.fontSize !== undefined ? updatedFields.fontSize : fontSize,
        wordWrap: updatedFields.wordWrap !== undefined ? updatedFields.wordWrap : wordWrap,
        minimap: updatedFields.minimap !== undefined ? updatedFields.minimap : minimap,
        autoSave: updatedFields.autoSave !== undefined ? updatedFields.autoSave : autoSaveEnabled
      };
      await saveEditorSettings(payload);
    } catch (e) {
      console.error("Failed to update editor settings preference", e);
    }
  };

  // Run code against public test cases
  const handleRunCode = async () => {
    if (executing) return;
    try {
      setExecuting(true);
      setExecResult(null);
      setConsoleTab("results");
      setSelectedCase(0);

      const result = await runCode(id, code, language);
      setExecResult(result);
    } catch (err) {
      setExecResult({
        success: false,
        status: "RUNTIME_ERROR",
        errorMessage: err.displayMessage || "Execution failed."
      });
    } finally {
      setExecuting(false);
    }
  };

  // Run code against custom user inputs
  const handleRunCustomCode = async () => {
    if (executing) return;
    try {
      setExecuting(true);
      setExecResult(null);
      setConsoleTab("results");
      setSelectedCase(0);

      const result = await runCustomCode(code, language, customInput);
      setExecResult({
        success: result.success,
        status: result.status === "SUCCESS" ? "ACCEPTED" : result.status,
        errorMessage: result.errorMessage,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsage,
        results: [
          {
            input: customInput,
            output: result.output || "(empty output)",
            expected: "N/A (Custom Run)",
            status: result.status === "SUCCESS" ? "ACCEPTED" : result.status,
          }
        ]
      });
    } catch (err) {
      setExecResult({
        success: false,
        status: "RUNTIME_ERROR",
        errorMessage: err.displayMessage || "Execution failed."
      });
    } finally {
      setExecuting(false);
    }
  };

  // Submit solution
  const handleSubmitCode = async () => {
    if (executing) return;
    try {
      setExecuting(true);
      setExecResult(null);
      setConsoleTab("results");
      setSelectedCase(0);

      const data = await submitCode(id, code, language);
      setExecResult(data.executionResult ?? data);
      triggerToast(data.executionResult?.status === "ACCEPTED" ? "Success: Problem Solved! 🎉" : "Incorrect solution.");
    } catch (err) {
      setExecResult({
        success: false,
        status: "RUNTIME_ERROR",
        errorMessage: err.displayMessage || "Evaluation failed."
      });
    } finally {
      setExecuting(false);
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

  const monacoLang = { javascript: "javascript", python: "python", cpp: "cpp", c: "cpp", java: "java" }[language] || "javascript";
  const statusMeta = execResult ? (STATUS_META[execResult.status] || { label: execResult.status, icon: "?", cls: "runtime_error" }) : null;

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
        <h3>Workspace Not Found</h3>
        <p>{errorMessage || "Failed to retrieve this problem details."}</p>
        <button className="lc-admin-p-btn" onClick={() => navigate("/problems")}>
          ← Back to Problem Browser
        </button>
      </div>
    );
  }

  return (
    <div className="problems-solve-ide-workspace" style={{ display: "grid", gridTemplateColumns: "1.1fr 1.5fr 1fr", height: "calc(100vh - 100px)", background: "var(--background)" }}>
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div className="problems-toast" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ zIndex: 1100 }}>
            <span>✔️ {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: Problem description, examples, constraints */}
      <div className="ide-panel-left" style={{ borderRight: "1px solid var(--border)", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px", background: "var(--surface)" }}>
        
        <button className="lc-admin-p-btn" onClick={() => navigate(`/problems/${id}`)} style={{ width: "fit-content" }}>
          ← Back to Problem Details
        </button>

        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-primary)" }}>{problem.title}</h2>
          <span className={`lc-diff-badge lc-diff-badge--${DIFF_CLASS[problem.difficulty]}`} style={{ fontSize: "11px" }}>
            {DIFF_LABEL[problem.difficulty]}
          </span>
        </div>

        <div className="lc-desc-text" style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-primary)" }}>
          {problem.description}
        </div>

        {/* Examples */}
        {examples.length > 0 && (
          <div>
            <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>Examples</h4>
            {examples.slice(0, 2).map((ex, idx) => (
              <div key={idx} style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "10px", borderRadius: "6px", marginBottom: "8px", fontSize: "12px" }}>
                <div><strong>Input:</strong> {ex.input}</div>
                <div style={{ marginTop: "3px" }}><strong>Output:</strong> {ex.output}</div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <div className="lc-constraints" style={{ background: "var(--background)", borderRadius: "6px", padding: "12px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-secondary)", margin: "0 0 6px 0" }}>Constraints</h4>
            <ul style={{ margin: 0, paddingLeft: "14px", fontSize: "11px", color: "var(--text-secondary)" }}>
              {problem.constraints.split("\n").filter(Boolean).map((c, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>{c}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* CENTER PANEL: Monaco editor & config options */}
      <div className="ide-panel-center" style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--background)" }}>
        
        {/* Editor controls headers */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <select 
              value={language} 
              onChange={handleLanguageChange}
              style={{ padding: "4px 8px", background: "var(--background)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px" }}
            >
              {LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>

            <select
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                handleSettingsUpdate({ theme: e.target.value });
              }}
              style={{ padding: "4px 8px", background: "var(--background)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px" }}
            >
              <option value="vs-dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Font size selectors */}
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Size:</span>
            <select 
              value={fontSize} 
              onChange={(e) => {
                setFontSize(Number(e.target.value));
                handleSettingsUpdate({ fontSize: Number(e.target.value) });
              }}
              style={{ padding: "2px 4px", background: "var(--background)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "11px" }}
            >
              {[12, 14, 16, 18].map(sz => (
                <option key={sz} value={sz}>{sz}px</option>
              ))}
            </select>

            {/* Word wrap selector */}
            <button 
              className={`btn-table-action ${wordWrap === "on" ? "active-like" : ""}`}
              onClick={() => {
                const updated = wordWrap === "on" ? "off" : "on";
                setWordWrap(updated);
                handleSettingsUpdate({ wordWrap: updated });
              }}
              style={{ padding: "2px 6px", fontSize: "11px" }}
            >
              Wrap
            </button>
          </div>
        </div>

        {/* Monaco Editor Panel */}
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language={monacoLang}
            theme={theme}
            value={code}
            onChange={(val) => {
              setCode(val);
              triggerAutoSave(val, language);
            }}
            options={{
              fontSize: fontSize,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: minimap },
              wordWrap: wordWrap,
              automaticLayout: true,
              lineNumbers: "on"
            }}
          />
        </div>

        {/* Action Run Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "12px", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          <button 
            className="lc-run-btn" 
            onClick={handleRunCode}
            disabled={executing}
          >
            {executing ? "Executing..." : "▶ Run Code"}
          </button>
          <button 
            className="lc-submit-btn" 
            onClick={handleSubmitCode}
            disabled={executing}
          >
            Submit Solution 🚀
          </button>
        </div>

      </div>

      {/* RIGHT PANEL: Custom input / execution console results */}
      <div className="ide-panel-right" style={{ display: "flex", flexDirection: "column", background: "var(--surface)" }}>
        
        {/* Toggle headers tabs */}
        <div style={{ display: "flex", background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
          <button 
            className={`lc-panel-tab ${consoleTab === "results" ? "lc-panel-tab--active" : ""}`}
            onClick={() => setConsoleTab("results")}
            style={{ flex: 1, padding: "12px" }}
          >
            Execution Results
          </button>
          <button 
            className={`lc-panel-tab ${consoleTab === "custom-input" ? "lc-panel-tab--active" : ""}`}
            onClick={() => setConsoleTab("custom-input")}
            style={{ flex: 1, padding: "12px" }}
          >
            Custom Input
          </button>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          
          {consoleTab === "custom-input" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
              <span className="lc-tag-label" style={{ fontSize: "11px" }}>Standard Input (Stdin)</span>
              <textarea 
                rows="8" 
                value={customInput} 
                onChange={(e) => setCustomInput(e.target.value)} 
                placeholder="Type custom test input here..."
                style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px", resize: "none", fontSize: "12px" }}
              />
              <button className="btn-table-action" onClick={handleRunCustomCode} disabled={executing}>
                Run Custom Input
              </button>
            </div>
          ) : (
            // Results logs
            <div>
              {executing ? (
                <div className="lc-spinner" style={{ height: "200px" }}>
                  <div className="lc-spin" />
                  <span>Evaluating source code...</span>
                </div>
              ) : !execResult ? (
                <div className="lc-console__hint" style={{ padding: "40px 0" }}>
                  <span>No execution results to show. Click Run or Submit.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  {/* Status Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="lc-tag-label" style={{ fontSize: "11px" }}>Evaluation Status</span>
                    {statusMeta && (
                      <span className={`lc-console__badge lc-console__badge--${statusMeta.cls}`}>
                        {statusMeta.icon} {statusMeta.label}
                      </span>
                    )}
                  </div>

                  {execResult.status === "COMPILATION_ERROR" ? (
                    <div>
                      <strong style={{ fontSize: "12px", color: "#ef4444" }}>Compile Errors:</strong>
                      <div className="lc-console-error" style={{ marginTop: "6px" }}>{execResult.errorMessage}</div>
                    </div>
                  ) : (
                    <>
                      {/* Metric outputs */}
                      <div className="lc-verdict-stats" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
                        <div className="lc-verdict-stat">
                          Time <strong>{execResult.executionTime ? `${Math.round(execResult.executionTime * 1000)} ms` : "—"}</strong>
                        </div>
                        <div className="lc-verdict-stat">
                          Memory <strong>{execResult.memoryUsage ? `${execResult.memoryUsage} MB` : "—"}</strong>
                        </div>
                      </div>

                      {/* Display test case results list if present */}
                      {execResult.results && execResult.results.length > 0 && (
                        <>
                          <div className="lc-tc-tabs">
                            {execResult.results.map((res, i) => (
                              <button 
                                key={i}
                                className={`lc-tc-tab ${selectedCase === i ? "lc-tc-tab--active" : ""} ${res.status === "ACCEPTED" ? "lc-tc-tab--pass" : "lc-tc-tab--fail"}`}
                                onClick={() => setSelectedCase(i)}
                              >
                                Case {i + 1}
                              </button>
                            ))}
                          </div>

                          {execResult.results[selectedCase] && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "var(--background)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px" }}>
                              <div>
                                <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Input</span>
                                <code style={{ color: "var(--text-primary)" }}>{execResult.results[selectedCase].input}</code>
                              </div>
                              <div style={{ marginTop: "6px" }}>
                                <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Expected Output</span>
                                <code style={{ color: "var(--text-primary)" }}>{execResult.results[selectedCase].expected}</code>
                              </div>
                              <div style={{ marginTop: "6px" }}>
                                <span className="muted-text" style={{ fontSize: "10px", display: "block" }}>Your Output</span>
                                <code style={{ color: execResult.results[selectedCase].status === "ACCEPTED" ? "#22c55e" : "#ef4444" }}>
                                  {execResult.results[selectedCase].output || "(empty)"}
                                </code>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
