import { useEffect, useState } from "react";
import { getProjects } from "../../services/projectService";
import { getDashboardStats } from "../../services/dashboardService";
import api from "../../api/axios";
import "./Ecosystem.css";

export default function Ecosystem() {
  const [activeTab, setActiveTab] = useState("hackathons");

  // --- Core Stats & Admins ---
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [dbStats, setDbStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // --- Tab 1: Hackathons ---
  const [hackathons, setHackathons] = useState([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [scoreboard, setScoreboard] = useState([]);
  const [teamIdInput, setTeamIdInput] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [gradeScore, setGradeScore] = useState("");
  const [gradeWinner, setGradeWinner] = useState(false);
  const [gradeTeamId, setGradeTeamId] = useState("");

  // --- Tab 2: Gamification ---
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  // --- Tab 3: Community Forum ---
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("");
  const [commentsInput, setCommentsInput] = useState({});

  // --- Tab 4: Library Resources ---
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // --- Tab 5: Careers Hub ---
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [tracker, setTracker] = useState([]);
  const [loadingTracker, setLoadingTracker] = useState(true);

  // --- Tab 6: Colleges Hub (Sprint 11.1) ---
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [collegeName, setCollegeName] = useState("");
  const [collegeDomain, setCollegeDomain] = useState("");
  const [collegeAnalytics, setCollegeAnalytics] = useState(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");

  // --- Tab 7: Event Management (Sprint 11.3) ---
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState("WORKSHOP");
  const [eventDate, setEventDate] = useState("");
  const [eventSpeaker, setEventSpeaker] = useState("");
  const [eventLink, setEventLink] = useState("");

  // --- Tab 8: Mentor Platform (Sprint 11.4) ---
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [mentorTitle, setMentorTitle] = useState("");
  const [mentorCompany, setMentorCompany] = useState("");
  const [mentorBio, setMentorBio] = useState("");
  const [mentorSkills, setMentorSkills] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  // --- Tab 9: Company & Recruitment (Sprint 11.5 / 11.6) ---
  const [recruitmentDrives, setRecruitmentDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [driveTitle, setDriveTitle] = useState("");
  const [driveDate, setDriveDate] = useState("");
  const [driveCollegeId, setDriveCollegeId] = useState("");

  // --- Tab 10: Certificates Shelf (Sprint 11.7) ---
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [validationCode, setValidationCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);

  // --- Tab 11: AI Assistant (Phase 8) ---
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("function solve(input) {\n  const lines = input.split('\\n');\n  return lines.reverse().join(',');\n}");
  const [codeLang, setCodeLang] = useState("javascript");
  const [codeAudit, setCodeAudit] = useState(null);

  // --- Tab 12: Live Dev Collaboration ---
  const [editorCode, setEditorCode] = useState(`// Welcome to Live Dev Collaboration!\nfunction solve(input) {\n  return input;\n}`);
  const [audioActive, setAudioActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  // --- Tab 13: Portfolio builder ---
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
    fetchColleges();
    fetchEvents();
    fetchMentors();
    fetchDrives();
    fetchCertificates();
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

  const fetchColleges = async () => {
    try {
      setLoadingColleges(true);
      const res = await api.get("/colleges");
      setColleges(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingColleges(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await api.get("/events");
      setEvents(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchMentors = async () => {
    try {
      setLoadingMentors(true);
      const res = await api.get("/mentors");
      setMentors(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMentors(false);
    }
  };

  const fetchDrives = async () => {
    try {
      setLoadingDrives(true);
      const res = await api.get("/recruitment/drives");
      setRecruitmentDrives(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrives(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoadingCertificates(true);
      const res = await api.get("/certificates");
      setCertificates(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCertificates(false);
    }
  };

  // --- Tab 1: Hackathon Submissions & Scoreboard ---

  const handleRegisterHackathonTeam = async (hackId) => {
    if (!teamIdInput) return;
    try {
      await api.post(`/hackathons/${hackId}/register`, { teamId: teamIdInput });
      alert("Team registered successfully!");
      setTeamIdInput("");
      fetchHackathons();
    } catch (e) {
      alert(e.response?.data?.message || "Registration failed");
    }
  };

  const handleSubmitHackathonProject = async (hackId) => {
    if (!teamIdInput || !projectTitle) return;
    try {
      await api.post(`/hackathons/${hackId}/submit`, {
        teamId: teamIdInput,
        projectTitle,
        projectDesc,
        projectLink
      });
      alert("Project submitted successfully!");
      setProjectTitle("");
      setProjectDesc("");
      setProjectLink("");
      setTeamIdInput("");
    } catch (e) {
      alert(e.response?.data?.message || "Submission failed");
    }
  };

  const handleGradeHackathonProject = async (hackId) => {
    if (!gradeTeamId || !gradeScore) return;
    try {
      await api.post(`/hackathons/${hackId}/grade`, {
        teamId: gradeTeamId,
        score: gradeScore,
        isWinner: gradeWinner
      });
      alert("Project graded successfully!");
      setGradeTeamId("");
      setGradeScore("");
      setGradeWinner(false);
      handleViewScoreboard(hackId);
    } catch (e) {
      alert(e.response?.data?.message || "Grading failed");
    }
  };

  const handleViewScoreboard = async (hackId) => {
    try {
      const res = await api.get(`/hackathons/${hackId}/scoreboard`);
      setScoreboard(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- Tab 3: Forum Board Handlers ---

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

  // --- Tab 4: Library Bookmark Handler ---

  const handleBookmarkResource = async (resId) => {
    try {
      await api.post(`/resources/${resId}/bookmark`);
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Tab 5: Careers Handlers ---

  const handleApplyJob = async (jobId, status = "APPLIED") => {
    try {
      await api.post(`/careers/${jobId}/apply`, { status });
      fetchJobs();
      fetchTracker();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Tab 6: College Registration & Analytics Handlers ---

  const handleRegisterCollege = async (e) => {
    e.preventDefault();
    if (!collegeName) return;
    try {
      await api.post("/colleges/register", { name: collegeName, domain: collegeDomain });
      setCollegeName("");
      setCollegeDomain("");
      fetchColleges();
      alert("College registered successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleViewCollegeAnalytics = async (collegeId) => {
    try {
      setSelectedCollegeId(collegeId);
      const res = await api.get(`/colleges/${collegeId}/analytics`);
      setCollegeAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Tab 7: Event Scheduling & Attendance Handlers ---

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDesc || !eventDate) return;
    try {
      await api.post("/events", {
        title: eventTitle,
        description: eventDesc,
        type: eventType,
        date: eventDate,
        speaker: eventSpeaker,
        link: eventLink
      });
      setEventTitle("");
      setEventDesc("");
      setEventDate("");
      setEventSpeaker("");
      setEventLink("");
      fetchEvents();
      alert("Event scheduled successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      fetchEvents();
      alert("Registered for event successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleMarkAttendance = async (eventId, userId) => {
    if (!userId) return;
    try {
      await api.post(`/events/${eventId}/attendance`, { userId });
      fetchEvents();
      fetchCertificates();
      alert("Attendance marked! Certificate generated.");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  // --- Tab 8: Mentor Platform Bookings ---

  const handleRegisterMentor = async (e) => {
    e.preventDefault();
    if (!mentorTitle || !mentorCompany || !mentorBio) return;
    try {
      const skillsArr = mentorSkills.split(",").map(s => s.trim()).filter(Boolean);
      await api.post("/mentors/profile", {
        title: mentorTitle,
        company: mentorCompany,
        bio: mentorBio,
        skills: skillsArr
      });
      setMentorTitle("");
      setMentorCompany("");
      setMentorBio("");
      setMentorSkills("");
      fetchMentors();
      alert("Mentor profile activated!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookMentorship = async (e) => {
    e.preventDefault();
    if (!selectedMentorId || !bookingTime) return;
    try {
      await api.post(`/mentors/${selectedMentorId}/book`, { scheduledAt: bookingTime });
      setBookingTime("");
      setSelectedMentorId("");
      alert("Session booked successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  // --- Tab 9: Recruitment Portal Drives & Shortlists ---

  const handleRegisterCompany = async (e) => {
    e.preventDefault();
    if (!companyName || !companyDesc || !companyWebsite) return;
    try {
      await api.post("/recruitment/company", {
        name: companyName,
        description: companyDesc,
        website: companyWebsite
      });
      setCompanyName("");
      setCompanyDesc("");
      setCompanyWebsite("");
      alert("Company profile registered successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!driveTitle || !driveDate) return;
    try {
      await api.post("/recruitment/drives", {
        title: driveTitle,
        date: driveDate,
        collegeId: driveCollegeId || null
      });
      setDriveTitle("");
      setDriveDate("");
      setDriveCollegeId("");
      fetchDrives();
      alert("Recruitment drive scheduled!");
    } catch (err) {
      alert(err.response?.data?.message || "Scheduling failed");
    }
  };

  const handleApplyToDrive = async (driveId) => {
    try {
      await api.post(`/recruitment/drives/${driveId}/apply`);
      fetchDrives();
      alert("Applied to drive successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    }
  };

  const handleAdvanceCandidate = async (appId, status, score) => {
    try {
      await api.patch(`/recruitment/applications/${appId}`, { status, score });
      fetchDrives();
      alert(`Candidate status advanced to ${status}.`);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Tab 10: Certificates Shelf Validation ---

  const handleValidateCertificate = async (e) => {
    e.preventDefault();
    if (!validationCode) return;
    try {
      setValidationResult(null);
      const res = await api.get(`/certificates/validate/${validationCode}`);
      setValidationResult(res.data.data);
    } catch (err) {
      alert("Verification failed: Certificate code not found.");
    }
  };

  // --- Tab 11: AI Assistant Handlers ---

  const handleAIQuery = async (type) => {
    setAiLoading(true);
    setAiResponse("");
    try {
      if (type === "team") {
        const res = await api.get("/ai/team-recommendation");
        const list = res.data.data;
        if (list.length === 0) {
          setAiResponse("🤖 [AI Team Advisor]: No other profiles registered. List your technical skills details to query matching suggestions.");
        } else {
          const lines = list.map(p => `- **${p.name}** (Compatibility: ${p.compatibilityScore}%). Recommends missing skills: ${p.missingSkills.join(", ") || "None"}`).join("\n");
          setAiResponse(`🤖 [AI Team Advisor]: Complementary partner matches calculated:\n\n${lines}`);
        }
      } else if (type === "resume") {
        const res = await api.get("/ai/resume-audit");
        const aud = res.data.data;
        const suggestions = aud.suggestions.map(s => `- ${s}`).join("\n");
        setAiResponse(`🤖 [AI Resume Auditor]: Verified Score: **${aud.score}/100** (Rating: ${aud.rating})\n\n**Review Pointers:**\n${suggestions || "- Complete profiles."}\n\n**Missing Gaps:** ${aud.skillGaps.join(", ")}`);
      }
    } catch (e) {
      setAiResponse("Failed to connect to AI logic helper.");
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

  // --- Tab 13: Portfolio builder ---

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
        <h1>Platform Ecosystem Hub</h1>
        <p>Dynamic contests, community forums, mentorship booking, company hiring drives, and automated certificate shelves.</p>
      </div>

      {/* Tabs Row */}
      <div className="ecosystem-tabs">
        <button className={activeTab === "hackathons" ? "active" : ""} onClick={() => setActiveTab("hackathons")}>📅 Hackathons</button>
        <button className={activeTab === "gamification" ? "active" : ""} onClick={() => setActiveTab("gamification")}>🏆 Leaderboards</button>
        <button className={activeTab === "community" ? "active" : ""} onClick={() => setActiveTab("community")}>💬 Forum Board</button>
        <button className={activeTab === "library" ? "active" : ""} onClick={() => setActiveTab("library")}>📚 Library</button>
        <button className={activeTab === "careers" ? "active" : ""} onClick={() => setActiveTab("careers")}>💼 Careers</button>
        <button className={activeTab === "colleges" ? "active" : ""} onClick={() => setActiveTab("colleges")}>🏢 Campus Hub</button>
        <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>🎙️ Events</button>
        <button className={activeTab === "mentors" ? "active" : ""} onClick={() => setActiveTab("mentors")}>👥 Mentors Desk</button>
        <button className={activeTab === "recruitment" ? "active" : ""} onClick={() => setActiveTab("recruitment")}>💼 Recruitment</button>
        <button className={activeTab === "certificates" ? "active" : ""} onClick={() => setActiveTab("certificates")}>📜 Certificates</button>
        <button className={activeTab === "ai" ? "active" : ""} onClick={() => setActiveTab("ai")}>🤖 AI Co-pilot</button>
        <button className={activeTab === "collaboration" ? "active" : ""} onClick={() => setActiveTab("collaboration")}>💻 Live Dev</button>
        <button className={activeTab === "portfolio" ? "active" : ""} onClick={() => setActiveTab("portfolio")}>📄 Portfolio</button>
      </div>

      {/* Tab Panels */}
      <div className="ecosystem-content">

        {/* 1. Hackathons Tab */}
        {activeTab === "hackathons" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "28px" }}>
            
            {/* Left listings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", margin: 0 }}>Upcoming Hackathons</h2>
              {loadingHackathons ? (
                <div className="skeleton-loader" style={{ height: "100px" }} />
              ) : hackathons.map(h => (
                <div key={h.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>{h.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.4 }}>{h.description}</p>
                  
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => { setSelectedHackathon(h); handleViewScoreboard(h.id); }}>
                      ⚙️ Team Submissions & Scoreboard
                    </button>
                    <a href={h.link} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px", width: "auto" }}>Register External</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Right panels: Actions on Selected Hackathon */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {selectedHackathon ? (
                <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Submissions: {selectedHackathon.title}</h3>
                  
                  {/* Team register */}
                  <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Team ID to Register</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input type="text" value={teamIdInput} onChange={(e) => setTeamIdInput(e.target.value)} placeholder="e.g. team-uuid" />
                      <button className="btn-primary" style={{ width: "auto" }} onClick={() => handleRegisterHackathonTeam(selectedHackathon.id)}>Register Team</button>
                    </div>
                  </div>

                  {/* Project Submit */}
                  <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>Submit Hackathon Project</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Project Title..." />
                      <input type="text" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Brief description..." />
                      <input type="text" value={projectLink} onChange={(e) => setProjectLink(e.target.value)} placeholder="GitHub link / Demo link..." />
                      <button className="btn-primary" onClick={() => handleSubmitHackathonProject(selectedHackathon.id)}>Submit Project Files</button>
                    </div>
                  </div>

                  {/* Grading Panel (Admin / Faculty) */}
                  <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>Judging & Grading Panel</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="text" value={gradeTeamId} onChange={(e) => setGradeTeamId(e.target.value)} placeholder="Team ID..." />
                      <input type="number" value={gradeScore} onChange={(e) => setGradeScore(e.target.value)} placeholder="Score (0-100)..." />
                      <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="checkbox" checked={gradeWinner} onChange={(e) => setGradeWinner(e.target.checked)} /> Mark as winner
                      </label>
                      <button className="btn-secondary" onClick={() => handleGradeHackathonProject(selectedHackathon.id)}>Grade Submission</button>
                    </div>
                  </div>

                  {/* Scoreboard */}
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>🏆 Scoreboard</h4>
                    {scoreboard.length === 0 ? (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>No submissions graded yet.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {scoreboard.map(sb => (
                          <div key={sb.id} style={{ padding: "8px", background: "var(--background)", borderRadius: "6px", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                            <span>Team: {sb.team?.name || "Unknown"} {sb.isWinner && "👑"}</span>
                            <strong>{sb.score || 0} pts</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", padding: "30px", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  Select a hackathon from the left to view submissions, register teams, and load the scoreboard.
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
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "8px", margin: 0 }}>Internships & Job Openings</h2>
              {loadingJobs ? (
                <div className="skeleton-loader" style={{ height: "120px" }} />
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

            {/* Tracker */}
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

        {/* 6. Campus Hub (Colleges & Analytics) */}
        {activeTab === "colleges" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
            
            {/* List colleges */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", margin: 0 }}>Registered Colleges & Institutions</h2>
              {loadingColleges ? (
                <div className="skeleton-loader" style={{ height: "100px" }} />
              ) : colleges.map(col => (
                <div key={col.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>{col.name}</h3>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Domain: {col.domain || "None"}</span>
                  </div>
                  <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleViewCollegeAnalytics(col.id)}>
                    📊 View Analytics Report
                  </button>
                </div>
              ))}
            </div>

            {/* Right panels: College Analytics & Registration Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Analytics preview */}
              {collegeAnalytics ? (
                <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>📊 Performance: {collegeAnalytics.collegeName}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Verified Students:</span>
                      <strong>{collegeAnalytics.verifiedStudents}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Faculty Members:</span>
                      <strong>{collegeAnalytics.facultyCount}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Cumulative Solves:</span>
                      <strong>{collegeAnalytics.totalSolves} problems</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Hired & Placed Candidates:</span>
                      <strong>{collegeAnalytics.placedCount} students</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", padding: "30px", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  Select an institution to inspect academic performance and statistics reports.
                </div>
              )}

              {/* College Register */}
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Register College (Admin only)</h3>
                <form onSubmit={handleRegisterCollege} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Institution Name</label>
                    <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="e.g. Stanford University" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Auto-verification Email Domain</label>
                    <input type="text" value={collegeDomain} onChange={(e) => setCollegeDomain(e.target.value)} placeholder="e.g. stanford.edu" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Register Institution</button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* 7. Events (Workshops & Webinars) */}
        {activeTab === "events" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
            
            {/* Events listings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", margin: 0 }}>Events, Workshops & Webinars</h2>
              {loadingEvents ? (
                <div className="skeleton-loader" style={{ height: "100px" }} />
              ) : events.map(ev => (
                <div key={ev.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>{ev.title}</h3>
                    <span style={{ background: "var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>{ev.type}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    🗣 Speaker: {ev.speaker || "Guest speaker"} — 📅 Date: {new Date(ev.date).toLocaleDateString()}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4, margin: "0 0 16px 0" }}>{ev.description}</p>
                  
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px", width: "auto" }} onClick={() => handleRegisterEvent(ev.id)} disabled={ev.isRegistered}>
                      {ev.isRegistered ? "Registered ✔" : "Register for Event"}
                    </button>
                    {ev.isRegistered && (
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => {
                        const uid = prompt("Enter Student User ID to verify attendance:");
                        if (uid) handleMarkAttendance(ev.id, uid);
                      }}>
                        📝 Verify Attendance (Faculty/Staff)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule Event Form */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px", height: "fit-content" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Schedule Event (Faculty/Admin)</h3>
              <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Event Title</label>
                  <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Topic name..." required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Description</label>
                  <input type="text" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} placeholder="What will be covered..." required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Event Type</label>
                    <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="WEBINAR">Webinar</option>
                      <option value="TECH_EVENT">Technical Event</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Date & Time</label>
                    <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Speaker / Instructor</label>
                  <input type="text" value={eventSpeaker} onChange={(e) => setEventSpeaker(e.target.value)} placeholder="e.g. Alice Vance" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Webinar Link</label>
                  <input type="text" value={eventLink} onChange={(e) => setEventLink(e.target.value)} placeholder="https://zoom.us/..." />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Schedule Event</button>
              </form>
            </div>

          </div>
        )}

        {/* 8. Mentors Desk (Mentor Listings & Session Booking) */}
        {activeTab === "mentors" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
            
            {/* List Mentors */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", margin: 0 }}>Registered Mentors & Advisors</h2>
              {loadingMentors ? (
                <div className="skeleton-loader" style={{ height: "100px" }} />
              ) : mentors.map(m => (
                <div key={m.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>{m.user?.name}</h3>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>⭐ {m.rating} Rating</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    🏢 {m.title} at {m.company}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4, margin: "0 0 16px 0" }}>{m.bio}</p>
                  
                  <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {m.skills?.map(s => (
                      <span key={s} style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>{s}</span>
                    ))}
                  </div>

                  <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px", width: "auto" }} onClick={() => setSelectedMentorId(m.id)}>
                    📅 Book Mentorship Session
                  </button>
                </div>
              ))}
            </div>

            {/* Right panels: Booking Form & Mentor registration */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Session Booking Form */}
              {selectedMentorId ? (
                <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Schedule Session</h3>
                  <form onSubmit={handleBookMentorship} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Date & Time Slot</label>
                      <input type="datetime-local" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Confirm Booking Slot</button>
                  </form>
                </div>
              ) : (
                <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", padding: "30px", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  Select a mentor from the left to schedule a mentorship session.
                </div>
              )}

              {/* Mentor Registration Form */}
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Register as Mentor</h3>
                <form onSubmit={handleRegisterMentor} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Professional Title</label>
                    <input type="text" value={mentorTitle} onChange={(e) => setMentorTitle(e.target.value)} placeholder="e.g. Senior Tech Lead" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Current Company</label>
                    <input type="text" value={mentorCompany} onChange={(e) => setMentorCompany(e.target.value)} placeholder="e.g. Google" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Short Bio</label>
                    <input type="text" value={mentorBio} onChange={(e) => setMentorBio(e.target.value)} placeholder="Brief introduction..." required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Expertise Skills (comma separated)</label>
                    <input type="text" value={mentorSkills} onChange={(e) => setMentorSkills(e.target.value)} placeholder="e.g. React, C++, System Design" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Activate Mentor Profile</button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* 9. Recruitment (Drives & Candidates) */}
        {activeTab === "recruitment" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
            
            {/* List Recruitment Drives */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", margin: 0 }}>Active Recruitment Drives</h2>
              {loadingDrives ? (
                <div className="skeleton-loader" style={{ height: "100px" }} />
              ) : recruitmentDrives.map(drv => (
                <div key={drv.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>{drv.title}</h3>
                    <span style={{ background: "var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>{drv.status}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    🏢 Company: {drv.company?.name} — 📅 Date: {new Date(drv.date).toLocaleDateString()}
                  </div>

                  {/* Applicants listing */}
                  <div style={{ margin: "16px 0", background: "var(--background)", padding: "12px", borderRadius: "8px" }}>
                    <strong style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}>drive applicants:</strong>
                    {drv.candidates?.length === 0 ? (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>No applications submitted yet.</span>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {drv.candidates.map(cand => (
                          <div key={cand.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                            <span>{cand.user?.name} (Score: {cand.score || "N/A"})</span>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <span style={{ marginRight: "8px", fontWeight: "bold" }}>{cand.status}</span>
                              <button className="btn-secondary" style={{ padding: "2px 6px", fontSize: "10px" }} onClick={() => handleAdvanceCandidate(cand.id, "INTERVIEWING", 85)}>Interview</button>
                              <button className="btn-primary" style={{ padding: "2px 6px", fontSize: "10px", width: "auto" }} onClick={() => handleAdvanceCandidate(cand.id, "OFFERED", 95)}>Offer</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px", width: "auto" }} onClick={() => handleApplyToDrive(drv.id)}>
                    ✍ Apply to Recruitment Drive
                  </button>
                </div>
              ))}
            </div>

            {/* Recruiter Configuration Forms */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Schedule recruitment drive */}
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Schedule Hiring Drive</h3>
                <form onSubmit={handleCreateDrive} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Drive Title / Role</label>
                    <input type="text" value={driveTitle} onChange={(e) => setDriveTitle(e.target.value)} placeholder="e.g. Graduate Intake 2026" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Date & Time</label>
                    <input type="datetime-local" value={driveDate} onChange={(e) => setDriveDate(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Target College ID (Optional)</label>
                    <input type="text" value={driveCollegeId} onChange={(e) => setDriveCollegeId(e.target.value)} placeholder="college-uuid" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Schedule Drive</button>
                </form>
              </div>

              {/* Company Profile Register */}
              <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Register Recruiter Company</h3>
                <form onSubmit={handleRegisterCompany} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Company Name</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Stark Industries" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Website URL</label>
                    <input type="text" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://..." required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Description</label>
                    <input type="text" value={companyDesc} onChange={(e) => setCompanyDesc(e.target.value)} placeholder="About the company..." required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Register Company Portal</button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* 10. Certificates Tab (Verify & Validation Shelf) */}
        {activeTab === "certificates" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
            
            {/* List my certificates */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "18px", borderBottom: "1.5px solid var(--border)", paddingBottom: "10px", margin: 0 }}>My Earned Certificates</h2>
              {loadingCertificates ? (
                <div className="skeleton-loader" style={{ height: "100px" }} />
              ) : certificates.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>You haven't earned any certificates yet. Complete an event workshop to automatically generate certificates!</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {certificates.map(c => (
                    <div key={c.id} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "14px" }}>{c.title}</strong>
                        <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Issued by: {c.issuedBy}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                        <code style={{ fontSize: "10px", background: "var(--background)", padding: "2px 6px", borderRadius: "4px" }}>{c.verificationCode}</code>
                        {c.qrCodeUrl && <img src={c.qrCodeUrl} alt="Verification QR" style={{ width: "40px", height: "40px" }} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Validation verification panel */}
            <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "24px", borderRadius: "12px", height: "fit-content" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>🔍 Certificate Validation Portal</h3>
              <form onSubmit={handleValidateCertificate} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>Verification Code</label>
                  <input type="text" value={validationCode} onChange={(e) => setValidationCode(e.target.value)} placeholder="e.g. CERT-1234" required />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px" }}>Validate Certificate Integrity</button>
              </form>

              {validationResult && (
                <div style={{ padding: "14px", background: "var(--success-glow)", border: "1.5px solid var(--success)", borderRadius: "8px", fontSize: "13px" }}>
                  <div style={{ color: "var(--success)", fontWeight: "bold", marginBottom: "6px" }}>✓ Certificate Verified & Authentic</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span>Title: {validationResult.title}</span>
                    <span>Recipient: {validationResult.user?.name}</span>
                    <span>Issuer: {validationResult.issuedBy}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 11. AI Co-pilot Hub Tab */}
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
                <input type="checkbox" defaultChecked /> Enable AI onboarding 
              </label>
              <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" defaultChecked /> Sync solvers statistics with AI models
              </label>
            </div>
          </div>
        )}

        {/* 12. Live Dev Tab */}
        {activeTab === "collaboration" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
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

        {/* 13. Portfolio Builder Tab */}
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
