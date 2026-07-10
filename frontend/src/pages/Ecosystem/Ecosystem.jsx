import { useEffect, useState } from "react";
import { getProjects } from "../../services/projectService";
import { getDashboardStats } from "../../services/dashboardService";
import api from "../../api/axios";
import "./Ecosystem.css";

export default function Ecosystem() {
  const [activeTab, setActiveTab] = useState("hackathons");

  // --- Dynamic Database States ---
  const [hackathons, setHackathons] = useState([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);

  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [dbStats, setDbStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // --- Forum Board State ---
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("");
  const [commentsInput, setCommentsInput] = useState({});

  // --- Library State ---
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // --- Careers State ---
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [tracker, setTracker] = useState([]);
  const [loadingTracker, setLoadingTracker] = useState(true);

  // --- Resume Builder State ---
  const [resumeForm, setResumeForm] = useState({
    name: "",
    email: "",
    bio: "",
    skills: "",
    education: "",
    projects: [],
    template: "minimal"
  });

  // --- Sync Portals State ---
  const [githubUser, setGithubUser] = useState("");
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [linkedProfiles, setLinkedProfiles] = useState({ github: "", leetcode: "" });
  const [githubRepos, setGithubRepos] = useState([]);
  const [leetcodeStats, setLeetcodeStats] = useState(null);

  // --- AI Co-pilot State ---
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("function solve(input) {\n  // Write optimal code here\n}");
  const [codeLang, setCodeLang] = useState("javascript");
  const [codeAudit, setCodeAudit] = useState(null);

  // --- Live Pair Programming State ---
  const [editorCode, setEditorCode] = useState(`// Welcome to Live Collaborative Programming!\nfunction pairProgram(developerA, developerB) {\n  console.log("Collaborating on code...");\n  return developerA.skills + developerB.skills;\n}`);
  const [audioActive, setAudioActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  // --- Portfolio State ---
  const [resumeData, setResumeData] = useState(null);
  const [portfolioLink, setPortfolioLink] = useState("");

  useEffect(() => {
    fetchHackathons();
    fetchLeaderboard();
    fetchAdmins();
    fetchStats();
    fetchPosts();
    fetchResources();
    fetchJobs();
    fetchTracker();
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

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await api.get("/posts");
      setPosts(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const res = await api.get("/resources");
      setResources(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await api.get("/careers");
      setJobs(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchTracker = async () => {
    try {
      setLoadingTracker(true);
      const res = await api.get("/careers/tracker");
      setTracker(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTracker(false);
    }
  };

  // --- Form & Action Handlers ---

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    try {
      const tagsArray = postTags.split(",").map(t => t.trim()).filter(Boolean);
      await api.post("/posts", { title: postTitle, content: postContent, tags: tagsArray });
      setPostTitle("");
      setPostContent("");
      setPostTags("");
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentPost = async (postId) => {
    const text = commentsInput[postId];
    if (!text || !text.trim()) return;
    try {
      await api.post(`/posts/${postId}/comments`, { content: text });
      setCommentsInput(prev => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkResource = async (resId) => {
    try {
      await api.post(`/resources/${resId}/bookmark`);
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyJob = async (jobId, status = "APPLIED") => {
    try {
      await api.post(`/careers/${jobId}/apply`, { status });
      fetchJobs();
      fetchTracker();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoFillResume = async () => {
    try {
      const profileRes = await api.get("/users/profile");
      const u = profileRes.data.data;
      const projectsRes = await getProjects();

      setResumeForm({
        name: u.name || "",
        email: u.email || "",
        bio: u.bio || "",
        skills: u.skills?.map(s => s.skill.name).join(", ") || "React, Node.js, Prisma, SQL",
        education: u.college ? `${u.college} - Year ${u.academicYear || 1}` : "University of Tech",
        projects: projectsRes,
        template: "minimal"
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkProfiles = (e) => {
    e.preventDefault();
    setLinkedProfiles({ github: githubUser, leetcode: leetcodeUser });
    if (githubUser) {
      setGithubRepos([
        { name: "codematch-platform", stars: 12, fork: false },
        { name: "algorithmic-solutions", stars: 4, fork: false },
        { name: "react-monochrome-ui", stars: 32, fork: false }
      ]);
    }
    if (leetcodeUser) {
      setLeetcodeStats({ easy: 15, medium: 24, hard: 6 });
    }
  };

  const handleAIQuery = async (type) => {
    setAiLoading(true);
    setAiResponse("");
    try {
      if (type === "team") {
        const res = await api.get("/ai/team-recommendation");
        const list = res.data.data;
        if (list.length === 0) {
          setAiResponse("🤖 [AI Advisor]: No other student profiles found in the database. Complete your skill tags to receive recommendations.");
        } else {
          const lines = list.map(p => `- **${p.name}** (Score: ${p.compatibilityScore}%). Recommends missing skills: ${p.missingSkills.join(", ") || "None"}`).join("\n");
          setAiResponse(`🤖 [AI Team Advisor]: Based on your profile skills, we recommend matching with:\n\n${lines}`);
        }
      } else if (type === "resume") {
        const res = await api.get("/ai/resume-audit");
        const aud = res.data.data;
        const suggestions = aud.suggestions.map(s => `- ${s}`).join("\n");
        setAiResponse(`🤖 [AI Resume Auditor]: Profile Rating: **${aud.rating}** (Score: ${aud.score}/100)\n\n**Suggestions:**\n${suggestions || "- Your profile looks solid!"}\n\n**Skill Gaps identified:** ${aud.skillGaps.join(", ")}`);
      }
    } catch (e) {
      setAiResponse("Failed to query AI advisor.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAuditCode = async () => {
    setAiLoading(true);
    setCodeAudit(null);
    try {
      const res = await api.post("/ai/explain-code", { code: codeSnippet, language: codeLang });
      setCodeAudit(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const generatePortfolio = async () => {
    try {
      const projects = await getProjects();
      const featured = projects.filter(p => p.featured);
      setResumeData({
        title: "Developer Portfolio Resume",
        projects: featured.length > 0 ? featured : projects,
        skills: ["React", "Node.js", "PostgreSQL", "Algorithm Solving"],
        stats: { solvedCount: dbStats?.codingSummary?.solvedCount || 0, streak: dbStats?.codingSummary?.streak || 0 }
      });
      setPortfolioLink(`${window.location.origin}/portfolio/public_share_token_99`);
    } catch (e) {
      console.error(e);
    }
  };

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

  return (
    <div className="ecosystem-page">
      
      {/* Page Header */}
      <div className="ecosystem-header">
        <h1>Developer Ecosystem Hub</h1>
        <p>Dynamic contests, community discussion forums, bookmarks, and automated AI code assistant utilities.</p>
      </div>

      {/* Tabs Row */}
      <div className="ecosystem-tabs">
        <button className={activeTab === "hackathons" ? "active" : ""} onClick={() => setActiveTab("hackathons")}>📅 Hackathons</button>
        <button className={activeTab === "gamification" ? "active" : ""} onClick={() => setActiveTab("gamification")}>🏆 Leaderboards</button>
        <button className={activeTab === "community" ? "active" : ""} onClick={() => setActiveTab("community")}>💬 Forum Board</button>
        <button className={activeTab === "library" ? "active" : ""} onClick={() => setActiveTab("library")}>📚 Library</button>
        <button className={activeTab === "careers" ? "active" : ""} onClick={() => setActiveTab("careers")}>💼 Careers</button>
        <button className={activeTab === "resume" ? "active" : ""} onClick={() => setActiveTab("resume")}>📄 Resume Builder</button>
        <button className={activeTab === "portals" ? "active" : ""} onClick={() => setActiveTab("portals")}>🔗 Sync Profiles</button>
        <button className={activeTab === "ai" ? "active" : ""} onClick={() => setActiveTab("ai")}>🤖 AI Co-pilot</button>
        <button className={activeTab === "collaboration" ? "active" : ""} onClick={() => setActiveTab("collaboration")}>💻 Live Dev</button>
        <button className={activeTab === "portfolio" ? "active" : ""} onClick={() => setActiveTab("portfolio")}>📄 Portfolio Builder</button>
      </div>

      {/* Tab Panels */}
      <div className="ecosystem-content">

        {/* 1. Hackathons Tab */}
        {activeTab === "hackathons" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px" }}>Upcoming Hackathons</h2>
            {loadingHackathons ? (
              <div className="skeleton-loader" style={{ height: "120px" }} />
            ) : hackathons.length === 0 ? (
              <div style={{ padding: "20px", color: "var(--text-secondary)", fontSize: "13px" }}>No active hackathons found.</div>
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
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Coding Streak: {dbStats?.codingSummary?.streak || 0} Days</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>Solve one algorithmic problem daily to grow your streak!</p>
                </div>
              </div>

              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Earned Achievements</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {badges.map(b => (
                    <div key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", background: b.earned ? "var(--background)" : "transparent", opacity: b.earned ? 1 : 0.5, border: "1px solid var(--border)", borderRadius: "8px" }}>
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

        {/* 3. Forum Board (Community Discussions) */}
        {activeTab === "community" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "32px" }}>
            
            {/* Posts feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", margin: 0 }}>Community Forum Feed</h2>
              
              {loadingPosts ? (
                <div className="skeleton-loader" style={{ height: "120px" }} />
              ) : posts.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No community discussions posted yet.</div>
              ) : (
                posts.map(p => (
                  <div key={p.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Posted by {p.author.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>{p.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px 0" }}>{p.content}</p>
                    
                    <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                      {p.tags.map(t => (
                        <span key={t} style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>#{t}</span>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                      <button onClick={() => handleLikePost(p.id)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
                        👍 {p.likes?.length || 0} Likes
                      </button>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>💬 {p.comments?.length || 0} Comments</span>
                    </div>

                    {/* Comments listing */}
                    <div style={{ marginTop: "16px", background: "var(--background)", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {p.comments?.map(c => (
                        <div key={c.id} style={{ fontSize: "12px", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }}>
                          <strong>{c.author?.name || "User"}:</strong> <span style={{ color: "var(--text-secondary)" }}>{c.content}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                        <input
                          type="text"
                          value={commentsInput[p.id] || ""}
                          onChange={(e) => setCommentsInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="Add comment..."
                          style={{ flex: 1, padding: "6px 10px", fontSize: "12px" }}
                        />
                        <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "11px", width: "auto" }} onClick={() => handleCommentPost(p.id)}>Send</button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Create Post panel */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px", height: "fit-content" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Post to Community</h3>
              <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Discussion Title</label>
                  <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Topic name..." style={{ width: "100%" }} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Content Text</label>
                  <textarea rows="4" value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Explain details..." style={{ width: "100%", background: "var(--background)", border: "1.5px solid var(--border)", color: "white", padding: "10px", borderRadius: "8px", outline: "none", fontSize: "13px" }} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Tags (comma-separated)</label>
                  <input type="text" value={postTags} onChange={(e) => setPostTags(e.target.value)} placeholder="e.g. react, logic, help" style={{ width: "100%" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Publish Post</button>
              </form>
            </div>

          </div>
        )}

        {/* 4. Library (Learning Resources) */}
        {activeTab === "library" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", margin: 0 }}>Resource Library</h2>
            
            {loadingResources ? (
              <div className="skeleton-loader" style={{ height: "120px" }} />
            ) : resources.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No tutorials or articles listed.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {resources.map(res => (
                  <div key={res.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ background: "var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>{res.category}</span>
                        <button onClick={() => handleBookmarkResource(res.id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>
                          {res.isBookmarked ? "⭐" : "☆"}
                        </button>
                      </div>
                      <h3 style={{ margin: "12px 0 6px 0", fontSize: "15px" }}>{res.title}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.4 }}>{res.description}</p>
                    </div>
                    <a href={res.link} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", textAlign: "center" }}>Open Reference</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Careers (Job Listings & Tracker) */}
        {activeTab === "careers" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "32px" }}>
            
            {/* Job Listings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", margin: 0 }}>internships & Jobs openings</h2>
              
              {loadingJobs ? (
                <div className="skeleton-loader" style={{ height: "120px" }} />
              ) : jobs.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No openings found.</div>
              ) : (
                jobs.map(j => (
                  <div key={j.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "15px" }}>{j.title}</strong>
                      <span style={{ background: "var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>{j.type}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      {j.company} — 📍 {j.location}
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4, margin: "0 0 16px 0" }}>{j.description}</p>
                    
                    <div style={{ display: "flex", gap: "10px" }}>
                      <a href={j.link} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>Read Description</a>
                      <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", width: "auto" }} onClick={() => handleApplyJob(j.id, "APPLIED")} disabled={j.applicationStatus === "APPLIED"}>
                        {j.applicationStatus === "APPLIED" ? "Applied ✔" : "Apply Now"}
                      </button>
                      <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => handleApplyJob(j.id, "SAVED")} disabled={j.applicationStatus === "SAVED"}>
                        {j.applicationStatus === "SAVED" ? "Saved ⭐" : "Save Job"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Application Tracker */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Application Tracker</h3>
              {loadingTracker ? (
                <div className="skeleton-loader" style={{ height: "60px" }} />
              ) : tracker.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>You haven't tracked any jobs yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {tracker.map(t => (
                    <div key={t.id} style={{ padding: "10px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "12px", display: "block" }}>{t.job.title}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.job.company}</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: t.status === "APPLIED" ? "#22c55e" : "#f59e0b" }}>{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 6. Resume Builder */}
        {activeTab === "resume" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
            
            {/* Editor & Prefill form */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>📄 Developer Resume Builder</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Auto-fill your details from your profile metrics and export to a clean print layout.
              </p>
              
              <button className="btn-secondary" style={{ padding: "10px", marginBottom: "20px" }} onClick={handleAutoFillResume}>
                ⚡ Auto-fill from Profile & Solves
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", marginBottom: "4px" }}>Full Name</label>
                  <input type="text" value={resumeForm.name} onChange={(e) => setResumeForm({ ...resumeForm, name: e.target.value })} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", marginBottom: "4px" }}>Email ID</label>
                  <input type="text" value={resumeForm.email} onChange={(e) => setResumeForm({ ...resumeForm, email: e.target.value })} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", marginBottom: "4px" }}>Biography Statement</label>
                  <textarea rows="3" value={resumeForm.bio} onChange={(e) => setResumeForm({ ...resumeForm, bio: e.target.value })} style={{ width: "100%", background: "var(--background)", color: "white", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", marginBottom: "4px" }}>Core Technical Skills</label>
                  <input type="text" value={resumeForm.skills} onChange={(e) => setResumeForm({ ...resumeForm, skills: e.target.value })} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", marginBottom: "4px" }}>Education History</label>
                  <input type="text" value={resumeForm.education} onChange={(e) => setResumeForm({ ...resumeForm, education: e.target.value })} style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            {/* Live Preview Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div id="resume-print-area" style={{ background: "white", color: "#111", padding: "30px", borderRadius: "8px", border: "1.5px solid #111", fontFamily: "Georgia, serif" }}>
                <h2 style={{ margin: "0 0 4px 0", fontSize: "22px", textAlign: "center", borderBottom: "2px solid #111", paddingBottom: "8px" }}>{resumeForm.name || "YOUR NAME"}</h2>
                <div style={{ fontSize: "11px", textAlign: "center", marginBottom: "20px" }}>{resumeForm.email || "email@address.com"}</div>
                
                <h4 style={{ margin: "0 0 6px 0", borderBottom: "1px solid #111", fontSize: "13px" }}>SUMMARY</h4>
                <p style={{ fontSize: "12px", margin: "0 0 16px 0", lineHeight: 1.4 }}>{resumeForm.bio || "No summary provided."}</p>

                <h4 style={{ margin: "0 0 6px 0", borderBottom: "1px solid #111", fontSize: "13px" }}>SKILLS</h4>
                <p style={{ fontSize: "12px", margin: "0 0 16px 0" }}>{resumeForm.skills || "No skills listed."}</p>

                <h4 style={{ margin: "0 0 6px 0", borderBottom: "1px solid #111", fontSize: "13px" }}>EDUCATION</h4>
                <p style={{ fontSize: "12px", margin: "0 0 16px 0" }}>{resumeForm.education || "No education history."}</p>

                <h4 style={{ margin: "0 0 6px 0", borderBottom: "1px solid #111", fontSize: "13px" }}>ALGORITHMIC PROBLEM SOLVES</h4>
                <p style={{ fontSize: "12px", margin: "0 0 16px 0" }}>
                  Solved **{dbStats?.codingSummary?.solvedCount || 0}** challenges on CodeMatch (Easy: {dbStats?.codingSummary?.easySolved || 0}, Medium: {dbStats?.codingSummary?.mediumSolved || 0}, Hard: {dbStats?.codingSummary?.hardSolved || 0}).
                </p>
              </div>
              <button className="btn-primary" style={{ padding: "12px" }} onClick={() => window.print()}>
                🖨 Print Resume / Export PDF
              </button>
            </div>

          </div>
        )}

        {/* 7. Linked Profiles Tab */}
        {activeTab === "portals" && (
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
                          <span style={{ fontSize: "20px", fontWeight: "bold" }}>{leetcodeStats?.easy || 0}</span>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>Easy</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#f59e0b" }}>{leetcodeStats?.medium || 0}</span>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>Medium</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ef4444" }}>{leetcodeStats?.hard || 0}</span>
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

        {/* 8. AI Co-pilot Hub Tab */}
        {activeTab === "ai" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
              <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>🤖 Co-Pilot Assistant</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>Ask CodeMatch AI helper for resume evaluations, project feedback, or team recommendations based on your local metrics.</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }} onClick={() => handleAIQuery("team")}>👥 Recommed Teammates</button>
                  <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }} onClick={() => handleAIQuery("resume")}>📄 Audit Resume Profile</button>
                </div>
                {aiLoading && <div className="skeleton-loader" style={{ height: "60px", borderRadius: "8px" }} />}
                {aiResponse && (
                  <pre style={{ padding: "16px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                    {aiResponse}
                  </pre>
                )}
              </div>

              {/* Code Optimizer audit */}
              <div style={{ borderTop: "1.5px solid var(--border)", marginTop: "24px", paddingTop: "20px" }}>
                <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>💡 Code Explanation & Complexity Audit</h3>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <select value={codeLang} onChange={(e) => setCodeLang(e.target.value)} style={{ padding: "6px" }}>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                  </select>
                  <button className="btn-primary" style={{ padding: "6px 12px", width: "auto" }} onClick={handleAuditCode}>Audit Code Complexity</button>
                </div>
                <textarea rows="4" value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} style={{ width: "100%", fontFamily: "monospace", padding: "10px", background: "var(--background)", color: "white", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }} />
                {codeAudit && (
                  <div style={{ marginTop: "12px", padding: "14px", background: "var(--background)", borderRadius: "8px", fontSize: "12px" }}>
                    <div><strong>Explanation:</strong> {codeAudit.explanation}</div>
                    <div style={{ margin: "6px 0" }}>
                      <strong>Complexity:</strong> Time: <code style={{ color: "#f59e0b" }}>{codeAudit.complexity.time}</code>, Space: <code style={{ color: "#f59e0b" }}>{codeAudit.complexity.space}</code>
                    </div>
                    <strong>Suggestions:</strong>
                    <ul>
                      {codeAudit.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>

            </div>

            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>AI Agent Configuration</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>Uses skill similarity vectors from database user interest indices to calculate teammates compatibility recommendations.</p>
              <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                <input type="checkbox" defaultChecked /> Enable AI onboarding notifications
              </label>
              <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" defaultChecked /> Sync solvers statistics with AI models
              </label>
            </div>
          </div>
        )}

        {/* 9. Live Pair Programming Tab */}
        {activeTab === "collaboration" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
            {/* Editor Canvas */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ background: "var(--background)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-secondary)" }}>collaborative_editor.js</span>
                <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "bold" }}>● LIVE</span>
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
            </div>

            {/* Call panel controls */}
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

              {(videoActive || screenSharing) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                  <div style={{ aspectRatio: "4/3", background: "#333", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px" }}>
                    <span>You (Camera)</span>
                  </div>
                  <div style={{ aspectRatio: "4/3", background: "#222", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px" }}>
                    <span>Teammate (Waiting)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 10. Portfolio Builder Tab */}
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
              <div style={{ background: "var(--surface)", border: "1.5px dashed var(--border)", padding: "48px", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)" }}>
                Click 'Generate' to preview your resume details card.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
