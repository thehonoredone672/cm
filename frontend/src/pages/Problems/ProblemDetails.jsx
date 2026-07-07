import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getProblemDetails } from "../../services/problemService";
import { runCode, submitCode, getSubmissions } from "../../services/submissionService";
import "./Problems.css";

// ─── Constants ─────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python",     label: "Python 3"   },
  { id: "cpp",        label: "C++"        },
  { id: "c",          label: "C"          },
  { id: "java",       label: "Java"       },
];

const STARTER = {
  javascript: `/**
 * @param {string} input
 * @return {string}
 */
function solve(input) {
  // Write your solution here
  return input;
}`,
  python: `def solve(input_str: str) -> str:
    # Write your solution here
    return input_str`,
  cpp: `#include <string>
using namespace std;

string solve(string input) {
    // Write your solution here
    return input;
}`,
  c: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

char* solve(char* input) {
    // Write your solution here
    return input;
}`,
  java: `public class Solution {
    public static String solve(String input) {
        // Write your solution here
        return input;
    }
}`,
};

const DIFF_CLASS = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };

const STATUS_META = {
  ACCEPTED:             { label: "Accepted",              icon: "✓", cls: "accepted"             },
  WRONG_ANSWER:         { label: "Wrong Answer",          icon: "✗", cls: "wrong_answer"         },
  RUNTIME_ERROR:        { label: "Runtime Error",         icon: "⚠", cls: "runtime_error"        },
  TIME_LIMIT_EXCEEDED:  { label: "Time Limit Exceeded",   icon: "⌛", cls: "time_limit_exceeded"  },
  COMPILATION_ERROR:    { label: "Compilation Error",     icon: "⊘", cls: "compilation_error"    },
};

// ─── Timer Hook ─────────────────────────────────────────────────────────────────

function useTimer(active) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (active) ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, [active]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// ─── ProblemDetails ──────────────────────────────────────────────────────────────

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem,  setProblem]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const [language, setLanguage] = useState("javascript");
  const [code,     setCode]     = useState(STARTER.javascript);
  const [theme,    setTheme]    = useState("vs-dark");

  const [leftTab,      setLeftTab]      = useState("description");
  const [submissions,  setSubmissions]  = useState([]);
  const [loadingSubs,  setLoadingSubs]  = useState(false);

  const [executing,    setExecuting]    = useState(false);
  const [execMode,     setExecMode]     = useState(null);
  const [execResult,   setExecResult]   = useState(null);
  const [consoleOpen,  setConsoleOpen]  = useState(false);
  const [selectedCase, setSelectedCase] = useState(0);

  const timerLabel = useTimer(!loading && !!problem);

  // ── Load problem ─────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProblemDetails(id);
        setProblem(data);
      } catch (err) {
        setError("Failed to load problem. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Code per language (localStorage) ─────────────────────────────────────────

  useEffect(() => {
    const saved = localStorage.getItem(`lc_${id}_${language}`);
    setCode(saved || STARTER[language] || "");
  }, [id, language]);

  const handleCodeChange = useCallback(
    (val) => {
      const v = val || "";
      setCode(v);
      localStorage.setItem(`lc_${id}_${language}`, v);
    },
    [id, language]
  );

  const handleReset = () => {
    if (!window.confirm("Reset to starter code? Unsaved changes will be lost.")) return;
    const starter = STARTER[language] || "";
    setCode(starter);
    localStorage.removeItem(`lc_${id}_${language}`);
  };

  // ── Submissions tab ───────────────────────────────────────────────────────────

  const loadSubs = async () => {
    try {
      setLoadingSubs(true);
      const data = await getSubmissions(id);
      setSubmissions(data);
    } catch (err) {
      console.error("[ProblemDetails] loadSubs:", err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleLeftTab = (tab) => {
    setLeftTab(tab);
    if (tab === "submissions" && submissions.length === 0) loadSubs();
  };

  // ── Run ───────────────────────────────────────────────────────────────────────

  const handleRun = async () => {
    if (executing) return;
    try {
      setExecuting(true);
      setExecMode("run");
      setExecResult(null);
      setConsoleOpen(true);
      setSelectedCase(0);
      const result = await runCode(id, code, language);
      setExecResult(result);
    } catch (err) {
      setExecResult({
        success: false,
        status: "RUNTIME_ERROR",
        errorMessage: err.response?.data?.message || "Execution failed. Check your network.",
        results: [],
      });
    } finally {
      setExecuting(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (executing) return;
    try {
      setExecuting(true);
      setExecMode("submit");
      setExecResult(null);
      setConsoleOpen(true);
      setSelectedCase(0);
      const data = await submitCode(id, code, language);
      // Backend returns { submission, executionResult }
      const result = data.executionResult ?? data;
      setExecResult(result);
      if (leftTab === "submissions") loadSubs();
    } catch (err) {
      setExecResult({
        success: false,
        status: "RUNTIME_ERROR",
        errorMessage: err.response?.data?.message || "Submission failed. Check your network.",
        results: [],
      });
    } finally {
      setExecuting(false);
    }
  };

  // ── Parse helpers ─────────────────────────────────────────────────────────────

  const examples = (() => {
    if (!problem) return [];
    try {
      return typeof problem.examples === "string"
        ? JSON.parse(problem.examples)
        : (problem.examples || []);
    } catch { return []; }
  })();

  const monacoLang = { javascript: "javascript", python: "python", cpp: "cpp", c: "cpp", java: "java" }[language] || "javascript";

  // Show only public results when running; show all when submitting (server controls what's public)
  const visibleResults = execResult?.results || [];

  const statusMeta = execResult ? (STATUS_META[execResult.status] || { label: execResult.status, icon: "?", cls: "runtime_error" }) : null;

  // ── Loading / Error ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="lc-workspace" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="lc-spin" style={{ width: 40, height: 40, borderWidth: 4 }} />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="lc-problems" style={{ paddingTop: 40, maxWidth: 600, margin: "0 auto" }}>
        <div className="lc-console-error">{error || "Problem not found."}</div>
        <button className="lc-run-btn" style={{ marginTop: 16 }} onClick={() => navigate("/problems")}>
          ← Back to Problems
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="lc-workspace">

      {/* ─── LEFT: Description panel ────────────────────────────── */}
      <div className="lc-desc-panel">

        <div className="lc-panel-tabs">
          {["description", "submissions"].map((tab) => (
            <button
              key={tab}
              className={`lc-panel-tab${leftTab === tab ? " lc-panel-tab--active" : ""}`}
              onClick={() => handleLeftTab(tab)}
            >
              {tab === "description" ? "Description" : "Submissions"}
            </button>
          ))}
        </div>

        <div className="lc-desc-scroll">
          {leftTab === "description" ? (
            <>
              {/* Header */}
              <div className="lc-prob-header">
                <h2>{problem.title}</h2>
                <div className="lc-meta-row">
                  <span className={`lc-diff-badge lc-diff-badge--${DIFF_CLASS[problem.difficulty] || "easy"}`}>
                    {problem.difficulty}
                  </span>
                  {problem.category && <span className="lc-tag">{problem.category}</span>}
                </div>
              </div>

              {/* Description */}
              <div className="lc-desc-text">{problem.description}</div>

              {/* Examples */}
              {examples.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 className="lc-section-title">Examples</h3>
                  {examples.map((ex, i) => (
                    <div key={i} className="lc-example">
                      <div className="lc-example__label">Example {i + 1}</div>
                      <div className="lc-example__row">
                        <span className="lc-example__key">Input:</span>
                        <code>{ex.input}</code>
                      </div>
                      <div className="lc-example__row">
                        <span className="lc-example__key">Output:</span>
                        <code>{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div className="lc-example__explanation">{ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && (
                <div className="lc-constraints">
                  <h3 className="lc-section-title">Constraints</h3>
                  <ul>
                    {problem.constraints.split("\n").filter(Boolean).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {(problem.tags || []).length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div className="lc-tag-label">Tags</div>
                  <div className="lc-tags" style={{ marginTop: 8 }}>
                    {problem.tags.map((tag) => (
                      <span key={tag} className="lc-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Submissions tab */
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>My Submissions</h3>
              {loadingSubs ? (
                <div className="lc-spinner" style={{ height: 120 }}>
                  <div className="lc-spin" /> Loading submissions…
                </div>
              ) : submissions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 14 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
                  No submissions yet. Submit your solution to see results here.
                </div>
              ) : (
                submissions.map((sub) => {
                  const sm = STATUS_META[sub.status] || { label: sub.status, icon: "?", cls: "runtime_error" };
                  return (
                    <div key={sub.id} className="lc-sub-row">
                      <div>
                        <div className={`lc-sub-status lc-sub-status--${sm.cls}`}>
                          {sm.icon} {sm.label}
                        </div>
                        <div className="lc-sub-meta" style={{ marginTop: 4 }}>
                          <span>{sub.language}</span>
                          <span>{sub.testCasesPassed} / {sub.totalTestCases} passed</span>
                          {sub.executionTime != null && (
                            <span>{(sub.executionTime * 1000).toFixed(0)} ms</span>
                          )}
                          {sub.memoryUsage != null && <span>{sub.memoryUsage} MB</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>
                        {new Date(sub.createdAt).toLocaleString([], {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Editor + Console ──────────────────────────────── */}
      <div className="lc-editor-panel">

        {/* Editor toolbar */}
        <div className="lc-editor-header">
          <select
            className="lc-lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>

          <button className="lc-editor-btn" onClick={handleReset}>↺ Reset</button>
          <button
            className="lc-editor-btn"
            onClick={() => setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"))}
          >
            {theme === "vs-dark" ? "☀ Light" : "🌙 Dark"}
          </button>
          <button
            className={`lc-editor-btn${consoleOpen ? " lc-editor-btn--active" : ""}`}
            onClick={() => setConsoleOpen((o) => !o)}
          >
            {consoleOpen ? "▼ Console" : "▲ Console"}
          </button>

          <div className="lc-timer">⏱ {timerLabel}</div>
        </div>

        {/* Monaco Editor */}
        <div className="lc-monaco">
          <Editor
            height="100%"
            language={monacoLang}
            theme={theme}
            value={code}
            onChange={handleCodeChange}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 14, bottom: 14 },
              lineNumbers: "on",
              wordWrap: "off",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderLineHighlight: "line",
            }}
          />
        </div>

        {/* Sliding console drawer */}
        <div className={`lc-console${consoleOpen ? " lc-console--visible" : " lc-console--hidden"}`}>
          <div className="lc-console__header">
            <span className="lc-console__title">
              {execMode === "run" ? "▶ Test Results" : execMode === "submit" ? "✓ Submit Results" : "Console"}
            </span>
            {execResult && !executing && statusMeta && (
              <span className={`lc-console__badge lc-console__badge--${statusMeta.cls}`}>
                {statusMeta.icon} {statusMeta.label}
              </span>
            )}
            <button className="lc-console__close" onClick={() => setConsoleOpen(false)}>✕</button>
          </div>

          <div className="lc-console__body">
            {/* Running state */}
            {executing ? (
              <div className="lc-spinner">
                <div className="lc-spin" />
                <span>
                  {execMode === "run"
                    ? "Running against sample test cases…"
                    : "Submitting and evaluating all test cases…"}
                </span>
              </div>
            ) : !execResult ? (
              <div className="lc-console__hint">
                <div style={{ fontSize: 28, marginBottom: 8 }}>💡</div>
                <div>Click <strong>Run Code</strong> to test against sample cases, or <strong>Submit</strong> to evaluate all test cases.</div>
              </div>
            ) : (
              <>
                {/* Compilation error */}
                {execResult.status === "COMPILATION_ERROR" ? (
                  <div>
                    <div className="lc-verdict lc-verdict--compilation_error">⊘ Compilation Error</div>
                    <div className="lc-console-error">{execResult.errorMessage}</div>
                  </div>
                ) : (
                  <>
                    {/* Verdict row */}
                    <div className={`lc-verdict lc-verdict--${statusMeta?.cls || "runtime_error"}`}>
                      {statusMeta?.icon} {statusMeta?.label}
                    </div>

                    {/* Stats */}
                    <div className="lc-verdict-stats">
                      {visibleResults.length > 0 && (
                        <div className="lc-verdict-stat">
                          Test Cases <strong>{visibleResults.filter((r) => r.status === "ACCEPTED").length} / {visibleResults.length}</strong>
                        </div>
                      )}
                      {execResult.executionTime > 0 && (
                        <div className="lc-verdict-stat">
                          Runtime <strong>{(execResult.executionTime * 1000).toFixed(1)} ms</strong>
                        </div>
                      )}
                      {execResult.memoryUsage > 0 && (
                        <div className="lc-verdict-stat">
                          Memory <strong>{execResult.memoryUsage} MB</strong>
                        </div>
                      )}
                    </div>

                    {/* Runtime/error message (not for ACCEPTED or WRONG_ANSWER) */}
                    {execResult.errorMessage &&
                      execResult.status !== "ACCEPTED" &&
                      execResult.status !== "WRONG_ANSWER" && (
                        <div className="lc-console-error" style={{ marginBottom: 14 }}>
                          {execResult.errorMessage}
                        </div>
                      )}

                    {/* Test case tabs */}
                    {visibleResults.length > 0 && (
                      <>
                        <div className="lc-tc-tabs">
                          {visibleResults.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedCase(i)}
                              className={[
                                "lc-tc-tab",
                                selectedCase === i ? "lc-tc-tab--active" : "",
                                r.status === "ACCEPTED" ? "lc-tc-tab--pass" : "lc-tc-tab--fail",
                              ].join(" ")}
                            >
                              {r.status === "ACCEPTED" ? "✓" : "✗"} Case {i + 1}
                            </button>
                          ))}
                        </div>

                        {visibleResults[selectedCase] && (
                          <div className="lc-tc-grid">
                            {/* Input */}
                            <div className="lc-tc-cell">
                              <label>Input</label>
                              <code>{visibleResults[selectedCase].input ?? "(none)"}</code>
                            </div>
                            {/* Expected */}
                            <div className="lc-tc-cell">
                              <label>Expected Output</label>
                              <code>
                                {visibleResults[selectedCase].expected ??
                                 visibleResults[selectedCase].expectedOutput ??
                                 "(none)"}
                              </code>
                            </div>
                            {/* Actual */}
                            <div className={`lc-tc-cell${
                              visibleResults[selectedCase].status === "ACCEPTED"
                                ? " lc-tc-cell--pass"
                                : " lc-tc-cell--fail"
                            }`}>
                              <label>Your Output</label>
                              <code>
                                {visibleResults[selectedCase].status === "ACCEPTED" ||
                                 visibleResults[selectedCase].status === "WRONG_ANSWER"
                                  ? (visibleResults[selectedCase].output || "(empty)")
                                  : (visibleResults[selectedCase].error || visibleResults[selectedCase].output || "(error)")}
                              </code>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer action buttons */}
        <div className="lc-editor-footer">
          <button
            className="lc-run-btn"
            onClick={handleRun}
            disabled={executing}
          >
            ▶ Run Code
          </button>
          <button
            className="lc-submit-btn"
            onClick={handleSubmit}
            disabled={executing}
          >
            {executing && execMode === "submit" ? (
              <>
                <span className="lc-spin" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "#fff" }} />
                Submitting…
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Submit
              </>
            )}
          </button>

          {executing && execMode === "run" && (
            <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
              <span className="lc-spin" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Running…
            </div>
          )}

          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
            {execResult && !executing && (
              <span className={`lc-footer-verdict lc-footer-verdict--${statusMeta?.cls}`}>
                {statusMeta?.icon} {statusMeta?.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
