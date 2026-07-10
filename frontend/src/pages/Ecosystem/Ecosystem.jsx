import { useEffect, useState } from "react";
import { getProjects } from "../../services/projectService";
import { getDashboardStats } from "../../services/dashboardService";
import api from "../../api/axios";
import "./Ecosystem.css";

export default function Ecosystem() {
  const [activeTab, setActiveTab] = useState("hackathons");

  // Dynamic DB data
  const [hackathons, setHackathons] = useState([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);

  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [dbStats, setDbStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchHackathons();
    fetchLeaderboard();
    fetchAdmins();
    fetchStats();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoadingHackathons(true);
      const res = await api.get("/hackathons");
      setHackathons(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHackathons(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaders(true);
      const res = await api.get("/dashboard/leaderboard");
      setLeaders(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeaders(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const res = await api.get("/users/admins");
      setAdmins(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await getDashboardStats();
      setDbStats(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Badges (dynamically calculated based on solves)
  const solvedCount = dbStats?.codingSummary?.solvedCount || 0;
  const easySolved = dbStats?.codingSummary?.easySolved || 0;
  const mediumSolved = dbStats?.codingSummary?.mediumSolved || 0;
  const hardSolved = dbStats?.codingSummary?.hardSolved || 0;

  const badges = [
    { name: "Code Warrior", desc: "Solve 1 Easy Problem", icon: "⚔️", earned: easySolved >= 1 },
    { name: "Algorithmic Expert", desc: "Solve 1 Medium Problem", icon: "🧠", earned: mediumSolved >= 1 },
    { name: "Master Ninja", desc: "Solve 1 Hard Problem", icon: "🥷", earned: hardSolved >= 1 },
    { name: "Streak Hero", desc: "Solve at least 1 problem total", icon: "🔥", earned: solvedCount >= 1 },
    { name: "Collaborator", desc: "Join or build a team", icon: "🤝", earned: (dbStats?.teamsJoinedCount || 0) >= 1 }
  ];

  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Resume builder state
  const [resumeData, setResumeData] = useState(null);
  const [portfolioLink, setPortfolioLink] = useState("");

  // External profile state
  const [githubUser, setGithubUser] = useState("");
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [linkedProfiles, setLinkedProfiles] = useState({ github: "", leetcode: "" });

  // Collaborative canvas state
  const [editorCode, setEditorCode] = useState(`// Welcome to Live Collaborative Programming!\nfunction pairProgram(developerA, developerB) {\n  console.log("Collaborating on code...");\n  return developerA.skills + developerB.skills;\n}`);
  const [sharedCursors, setSharedCursors] = useState([
    { name: "Partner (Elena)", line: 3, ch: 12, color: "#f59e0b" }
  ]);
  const [audioActive, setAudioActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const handleAIQuery = (type) => {
    setAiLoading(true);
    setAiResponse("");
    setTimeout(() => {
      if (type === "team") {
        setAiResponse("🤖 [AI Recommendation]: Based on your profile interests in React/Javascript, we recommend partnering with Elena Rostova (Python backend developer) or joining team 'A's Elite Hackers' to build code evaluation runtimes.");
      } else if (type === "skills") {
        setAiResponse("🤖 [AI Skill Advisor]: To level up, you should target 'Data Structures & Algorithms' and learn basic 'Containerization (Docker)' since you have projects in Node.js.");
      } else if (type === "resume") {
        setAiResponse("🤖 [AI Resume Auditor]: Your profile has 2 featured projects. Suggestions: 1. Add specific performance stats (e.g. 'reduced latency by 30%'). 2. List college course projects or hackathons explicitly.");
      }
      setAiLoading(false);
    }, 1200);
  };

  const generatePortfolio = async () => {
    try {
      const projects = await getProjects();
      const featured = projects.filter(p => p.featured);
      setResumeData({
        title: "Developer Portfolio Resume",
        projects: featured.length > 0 ? featured : projects,
        skills: ["React", "Node.js", "PostgreSQL", "Algorithm Solving"],
        stats: { solvedCount: 18, streak: 7 }
      });
      setPortfolioLink(`${window.location.origin}/portfolio/public_share_token_99`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLinkProfiles = (e) => {
    e.preventDefault();
    setLinkedProfiles({ github: githubUser, leetcode: leetcodeUser });
  };

  return (
    <div className="ecosystem-page">
      
      {/* Page Header */}
      <div className="ecosystem-header">
        <h1>Developer Ecosystem & Hub</h1>
        <p>Participate in hackathons, review AI metrics, pair program live, and share your developer portfolio.</p>
      </div>

      {/* Tabs */}
      <div className="ecosystem-tabs">
        <button className={activeTab === "hackathons" ? "active" : ""} onClick={() => setActiveTab("hackathons")}>📅 Hackathons & Contests</button>
        <button className={activeTab === "gamification" ? "active" : ""} onClick={() => setActiveTab("gamification")}>🏆 Leaderboard & Badges</button>
        <button className={activeTab === "ai" ? "active" : ""} onClick={() => setActiveTab("ai")}>🤖 AI Co-pilot Hub</button>
        <button className={activeTab === "profiles" ? "active" : ""} onClick={() => setActiveTab("profiles")}>🔗 Linked Profiles</button>
        <button className={activeTab === "collaboration" ? "active" : ""} onClick={() => setActiveTab("collaboration")}>💻 Live Pair Programming</button>
        <button className={activeTab === "portfolio" ? "active" : ""} onClick={() => setActiveTab("portfolio")}>📄 Portfolio Builder</button>
      </div>

      {/* Tab Contents */}
      <div className="ecosystem-content">
        {activeTab === "hackathons" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px" }}>Upcoming Hackathons</h2>
            
            {loadingHackathons ? (
              <div className="skeleton-loader" style={{ height: "120px" }} />
            ) : hackathons.length === 0 ? (
              <div style={{ padding: "20px", color: "var(--text-secondary)", fontSize: "13px" }}>No active hackathons found. Check back later!</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {hackathons.map(h => (
                  <div key={h.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ background: "var(--primary-glow)", color: "var(--primary)", fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "12px" }}>Active Hackathon</span>
                      <h3 style={{ margin: "12px 0 6px 0", fontSize: "16px" }}>{h.title}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.4 }}>{h.description}</p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "auto" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>📅 {new Date(h.date).toLocaleDateString()}</span>
                      <a href={h.link} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>Register</a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Administrators list */}
            <div style={{ marginTop: "32px", background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>🛡️ Platform Support & Administrators</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Contact administrators below to request system upgrades, report guidelines violations, or get match support.
              </p>
              {loadingAdmins ? (
                <div className="skeleton-loader" style={{ height: "40px" }} />
              ) : admins.length === 0 ? (
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No administrator accounts seeded.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {admins.map(adm => (
                    <div key={adm.id} style={{ padding: "14px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}>
                      <strong style={{ display: "block", marginBottom: "4px" }}>{adm.name}</strong>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", color: "var(--text-secondary)", fontSize: "12px" }}>
                        <span>Email: {adm.email}</span>
                        <span>ID: <code style={{ fontSize: "10px", background: "var(--border)", padding: "1px 4px", borderRadius: "3px" }}>{adm.id}</code></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Gamification Tab */}
        {activeTab === "gamification" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px" }}>
            {/* Ranks Leaderboard */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>🔥 Global Solves Leaderboard</h2>
              {loadingLeaders ? (
                <div className="skeleton-loader" style={{ height: "120px" }} />
              ) : leaders.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No leaderboard data found.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-secondary)", textAlign: "left" }}>
                      <th style={{ padding: "8px" }}>Rank</th>
                      <th style={{ padding: "8px" }}>Developer</th>
                      <th style={{ padding: "8px" }}>Solves</th>
                      <th style={{ padding: "8px" }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((l, idx) => (
                      <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 8px", fontWeight: "bold", color: idx === 0 ? "#f59e0b" : "var(--text-primary)" }}>#{idx + 1}</td>
                        <td style={{ padding: "10px 8px" }}>{l.name}</td>
                        <td style={{ padding: "10px 8px", fontWeight: "bold" }}>{l.solves} solves</td>
                        <td style={{ padding: "10px 8px" }}><span style={{ background: "var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>{l.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Badges and streaks */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "20px" }}>
                <span style={{ fontSize: "40px" }}>🔥</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Coding Streak: 7 Days</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>Solve one algorithmic problem daily to grow your streak!</p>
                </div>
              </div>

              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Earned Achievements</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {badges.map(b => (
                    <div key={b.name} style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", padding: "8px", background: b.earned ? "var(--background)" : "transparent", opacity: b.earned ? 1 : 0.5, border: "1px solid var(--border)", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "24px" }}>{b.icon}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "13px" }}>{b.name}</h4>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>{b.desc}</p>
                        </div>
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "bold", color: b.earned ? "#22c55e" : "var(--text-muted)" }}>{b.earned ? "Earned" : "Locked"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. AI Co-pilot Hub Tab */}
        {activeTab === "ai" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>🤖 Co-Pilot Assistant</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>Ask CodeMatch AI helper for resume evaluations, project feedback, or team recommendations based on your local metrics.</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }} onClick={() => handleAIQuery("team")}>👥 Recommed Teammates</button>
                  <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }} onClick={() => handleAIQuery("skills")}>💡 Suggest Skills</button>
                  <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }} onClick={() => handleAIQuery("resume")}>📄 Audit Resume Profile</button>
                </div>
                {aiLoading && <div className="skeleton-loader" style={{ height: "60px", borderRadius: "8px" }} />}
                {aiResponse && (
                  <div style={{ padding: "16px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                    {aiResponse}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>AI Agent Configuration</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>Configured model: GPT-4-Turbo. Uses Jaccard Similarity matrix vectors from database user interests to calculate teammates match recommendations.</p>
              <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                <input type="checkbox" defaultChecked /> Enable AI onboarding notifications
              </label>
              <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" defaultChecked /> Sync solvers statistics with AI models
              </label>
            </div>
          </div>
        )}

        {/* 4. Linked Profiles Tab */}
        {activeTab === "profiles" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>🔗 Sync Portals</h2>
              <form onSubmit={handleLinkProfiles} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>GitHub Username</label>
                  <input type="text" value={githubUser} onChange={(e) => setGithubUser(e.target.value)} placeholder="e.g. torvalds" style={{ width: "100%", padding: "10px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>LeetCode Username</label>
                  <input type="text" value={leetcodeUser} onChange={(e) => setLeetcodeUser(e.target.value)} placeholder="e.g. lc_user" style={{ width: "100%", padding: "10px" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "12px" }}>Sync External Accounts</button>
              </form>
            </div>

            {/* Rendering Stats & GitHub visual graph mock */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Contributions Overview</h3>
              {linkedProfiles.github || linkedProfiles.leetcode ? (
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {linkedProfiles.github && (
                    <div>
                      <h4 style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>GitHub Contributions ({linkedProfiles.github})</h4>
                      {/* GitHub contributions graph mock */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: "3px", width: "100%", maxWidth: "320px", background: "var(--background)", padding: "10px", borderRadius: "6px" }}>
                        {Array.from({ length: 70 }).map((_, i) => (
                          <div key={i} style={{ width: "12px", height: "12px", borderRadius: "2px", background: i % 7 === 0 ? "#22c55e" : (i % 5 === 0 ? "#16a34a" : (i % 3 === 0 ? "#15803d" : "var(--border)")) }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {linkedProfiles.leetcode && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                      <h4 style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>LeetCode Solving Analytics ({linkedProfiles.leetcode})</h4>
                      <div style={{ display: "flex", gap: "20px" }}>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "20px", fontWeight: "bold" }}>142</span>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>Easy</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#f59e0b" }}>68</span>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>Medium</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ef4444" }}>12</span>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>Hard</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "20px" }}>Link your accounts to see visual coding graphs.</div>
              )}
            </div>
          </div>
        )}

        {/* 5. Live Pair Programming Tab */}
        {activeTab === "collaboration" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
            {/* Editor Canvas */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ background: "var(--background)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-secondary)" }}>collaborative_editor.js</span>
                <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "bold" }}>● LIVE (Elena is editing)</span>
              </div>
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                style={{
                  width: "100%",
                  height: "220px",
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  fontFamily: "monospace",
                  padding: "16px",
                  border: "none",
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.5
                }}
              />
              <div style={{ padding: "8px 16px", background: "var(--background)", borderTop: "1px solid var(--border)", fontSize: "11px", color: "var(--text-muted)" }}>
                Active Cursors: <span style={{ color: "#f59e0b", fontWeight: "bold" }}>Elena Rostova (Line 3)</span>
              </div>
            </div>

            {/* Call panel controls placeholder */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", margin: 0 }}>📞 Live Collaboration Controls</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>Initiate audio/video calls or screensharing to facilitate pair programming sessions with your partner.</p>
              
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className={audioActive ? "btn-danger" : "btn-primary"} style={{ padding: "10px 16px", fontSize: "12px" }} onClick={() => setAudioActive(!audioActive)}>
                  {audioActive ? "🔇 Mute Microphone" : "🎙 Activate Microphone"}
                </button>
                <button className={videoActive ? "btn-danger" : "btn-primary"} style={{ padding: "10px 16px", fontSize: "12px" }} onClick={() => setVideoActive(!videoActive)}>
                  {videoActive ? "📷 Stop Video Stream" : "📷 Start Video Stream"}
                </button>
                <button className="btn-secondary" style={{ padding: "10px 16px", fontSize: "12px" }} onClick={() => setScreenSharing(!screenSharing)}>
                  {screenSharing ? "❌ Stop Screen Share" : "🖥 Share Screen"}
                </button>
              </div>

              {/* WebRTC Video simulation block */}
              {(videoActive || screenSharing) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                  <div style={{ aspectRatio: "4/3", background: "#333", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", position: "relative" }}>
                    <span>You (Camera)</span>
                  </div>
                  <div style={{ aspectRatio: "4/3", background: "#222", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", position: "relative" }}>
                    <span>Elena Rostova (Joined)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Portfolio Builder Tab */}
        {activeTab === "portfolio" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ fontSize: "18px", margin: 0 }}>📄 Developer Portfolio Builder</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>Compile your completed problems counts, linked developer projects stack, and streaks data into a clean, shareable developer resume portfolio card.</p>
              <button className="btn-primary" style={{ padding: "12px" }} onClick={generatePortfolio}>Generate Shareable Portfolio</button>
              {portfolioLink && (
                <div style={{ marginTop: "10px" }}>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Your Public Share Link</label>
                  <input readOnly value={portfolioLink} onClick={(e) => e.target.select()} style={{ width: "100%", padding: "10px", fontFamily: "monospace", fontSize: "12px" }} />
                </div>
              )}
            </div>

            {/* Generated Portfolio Card View */}
            {resumeData ? (
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--primary)", padding: "24px", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{resumeData.title}</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Verified Developer Profile</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>🔥 Streak: {resumeData.stats.streak} days</span>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Solved Problems: {resumeData.stats.solvedCount}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "13px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "6px" }}>Skills Summary</h4>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {resumeData.skills.map(s => (
                      <span key={s} style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "6px" }}>Projects Handled</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {resumeData.projects.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No projects listed.</p>
                    ) : (
                      resumeData.projects.map(p => (
                        <div key={p.id} style={{ padding: "8px", background: "var(--background)", borderRadius: "6px" }}>
                          <strong style={{ fontSize: "13px" }}>{p.title}</strong>
                          <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>{p.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", padding: "48px", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)" }}>
                Click 'Generate' to preview your resume details card.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
