import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, updateCurrentUser } from "../../services/userService";
import { getDashboardStats } from "../../services/dashboardService";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projectService";
import { getAllSkills, getMySkills, addSkill, removeSkill } from "../../services/skillService";
import { getAllInterests, getMyInterests, addInterest, removeInterest } from "../../services/interestService";
import "./Profile.css";

// Framer Motion animation configs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Profile fields state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    educationType: "COLLEGE",
    schoolName: "",
    standard: "",
    college: "",
    department: "",
    academicYear: "",
    company: "",
    position: "",
    profession: "",
    githubUrl: "",
    linkedinUrl: "",
    profileImage: ""
  });

  // Projects state
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectLive, setProjectLive] = useState("");
  const [projectStack, setProjectStack] = useState("");
  const [projectFeatured, setProjectFeatured] = useState(false);

  // Skills & Interests state
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState("");
  
  const [allInterests, setAllInterests] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [interestSearch, setInterestSearch] = useState("");

  // Dashboard & solved stats state
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadProfileDetails();
  }, []);

  const loadProfileDetails = async () => {
    try {
      setLoading(true);
      const [u, dbStats, projs, skillsAll, skillsMy, interestsAll, interestsMy] = await Promise.all([
        getCurrentUser(),
        getDashboardStats(),
        getProjects(),
        getAllSkills(),
        getMySkills(),
        getAllInterests(),
        getMyInterests()
      ]);

      setProfile({
        name: u.name || "",
        email: u.email || "",
        bio: u.bio || "",
        educationType: u.educationType || "COLLEGE",
        schoolName: u.schoolName || "",
        standard: u.standard || "",
        college: u.college || "",
        department: u.department || "",
        academicYear: u.academicYear || "",
        company: u.company || "",
        position: u.position || "",
        profession: u.profession || "",
        githubUrl: u.githubUrl || "",
        linkedinUrl: u.linkedinUrl || "",
        profileImage: u.profileImage || ""
      });

      setStats(dbStats);
      setProjects(projs);
      setAllSkills(skillsAll);
      setMySkills(skillsMy);
      setAllInterests(interestsAll);
      setMyInterests(interestsMy);

    } catch (err) {
      console.error(err);
      triggerToast("Failed to retrieve profile credentials.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleProfileChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...profile,
        standard: profile.standard === "" ? null : Number(profile.standard),
        academicYear: profile.academicYear === "" ? null : Number(profile.academicYear)
      };
      await updateCurrentUser(payload);
      triggerToast("Developer profile settings updated successfully.");
      
      // Reload stats to verify completion rate changes
      const dbStats = await getDashboardStats();
      setStats(dbStats);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Profile save failed.");
    } finally {
      setSaving(false);
    }
  };

  // --- Skills management ---
  const handleAddSkill = async (skillId) => {
    try {
      await addSkill(skillId);
      const skillsMy = await getMySkills();
      setMySkills(skillsMy);
      triggerToast("Skill added.");
    } catch (e) {
      triggerToast(e.response?.data?.message || "Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await removeSkill(skillId);
      const skillsMy = await getMySkills();
      setMySkills(skillsMy);
      triggerToast("Skill removed.");
    } catch (e) {
      triggerToast(e.response?.data?.message || "Failed to remove skill");
    }
  };

  // --- Interests management ---
  const handleAddInterest = async (interestId) => {
    try {
      await addInterest(interestId);
      const interestsMy = await getMyInterests();
      setMyInterests(interestsMy);
      triggerToast("Interest added.");
    } catch (e) {
      triggerToast(e.response?.data?.message || "Failed to add interest");
    }
  };

  const handleRemoveInterest = async (interestId) => {
    try {
      await removeInterest(interestId);
      const interestsMy = await getMyInterests();
      setMyInterests(interestsMy);
      triggerToast("Interest removed.");
    } catch (e) {
      triggerToast(e.response?.data?.message || "Failed to remove interest");
    }
  };

  // --- Projects management ---
  const handleEditProject = (p) => {
    setEditingProjectId(p.id);
    setProjectTitle(p.title);
    setProjectDesc(p.description);
    setProjectGithub(p.githubUrl || "");
    setProjectLive(p.liveDemoUrl || "");
    setProjectStack(p.techStack ? p.techStack.join(", ") : "");
    setProjectFeatured(p.featured || false);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      triggerToast("Project deleted.");
      const projs = await getProjects();
      setProjects(projs);
    } catch (e) {
      triggerToast("Failed to delete project.");
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectTitle || !projectDesc) return;
    const payload = {
      title: projectTitle,
      description: projectDesc,
      githubUrl: projectGithub || null,
      liveDemoUrl: projectLive || null,
      techStack: projectStack.split(",").map(s => s.trim()).filter(Boolean),
      featured: projectFeatured
    };

    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
        triggerToast("Project updated successfully!");
      } else {
        await createProject(payload);
        triggerToast("New project registered!");
      }
      setProjectTitle("");
      setProjectDesc("");
      setProjectGithub("");
      setProjectLive("");
      setProjectStack("");
      setProjectFeatured(false);
      setEditingProjectId(null);
      setShowProjectForm(false);
      const projs = await getProjects();
      setProjects(projs);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to save project.");
    }
  };

  // --- Dynamically Calculate Profile Completion ---
  const calculateCompletion = () => {
    let score = 0;
    const fields = [
      profile.bio,
      profile.githubUrl,
      profile.linkedinUrl,
      profile.profileImage,
      mySkills.length > 0,
      myInterests.length > 0,
      projects.length > 0
    ];
    fields.forEach(f => {
      if (f) score++;
    });
    return Math.round((score / fields.length) * 100);
  };

  const missingList = [];
  if (!profile.bio) missingList.push("Bio");
  if (!profile.githubUrl) missingList.push("GitHub Link");
  if (!profile.linkedinUrl) missingList.push("LinkedIn Link");
  if (mySkills.length === 0) missingList.push("Skills Tags");
  if (myInterests.length === 0) missingList.push("Interests");
  if (projects.length === 0) missingList.push("Projects");

  const cs = stats?.codingSummary || { solvedCount: 0, submissionsCount: 0, successRate: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };

  const filteredSkillsOptions = allSkills.filter(s => 
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !mySkills.some(myS => myS.skillId === s.id)
  );

  const filteredInterestsOptions = allInterests.filter(i => 
    i.name.toLowerCase().includes(interestSearch.toLowerCase()) &&
    !myInterests.some(myI => myI.interestId === i.id)
  );

  if (loading) {
    return (
      <div className="profile-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
        <div className="skeleton-grid">
          <div className="skeleton-item card-skeleton" />
          <div className="skeleton-item card-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="profile-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>💬 {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profile-layout-grid">
        
        {/* LEFT COLUMN: Identity & Quick Metrics */}
        <div className="profile-left-column">
          
          {/* 1. Profile Header Card */}
          <div className="profile-header-card">
            <div className="profile-avatar-large">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : "U"}
            </div>
            <h2>{profile.name}</h2>
            <span className="profile-email-lbl">{profile.email}</span>
            <span className="profile-role-badge">{profile.profession || "Developer"}</span>
            <p className="profile-bio-text">{profile.bio || "Write a brief description in your biography settings."}</p>
            
            <div className="college-row">
              {profile.college ? (
                <span>🏫 {profile.college} — Year {profile.academicYear || "1"}</span>
              ) : (
                <span className="muted-text">Institution not configured</span>
              )}
            </div>

            <div className="profile-actions-row">
              <button className="btn-primary" onClick={() => {
                const el = document.getElementById("profile-form-anchor");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>Edit Profile</button>
              <button className="btn-secondary" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                triggerToast("Profile link copied to clipboard!");
              }}>Share Profile</button>
            </div>
          </div>

          {/* 2. Profile Completion Tracker */}
          <div className="completion-card">
            <div className="completion-card-header">
              <h3>Profile Completion</h3>
              <span className="completion-pct-badge">{calculateCompletion()}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${calculateCompletion()}%` }} />
            </div>

            {missingList.length > 0 ? (
              <div className="missing-fields-container">
                <span className="missing-title">Add missing credentials to optimize compatibilities matches:</span>
                <div className="missing-badges-row">
                  {missingList.map((item, idx) => (
                    <span key={idx} className="missing-badge">{item}</span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="profile-complete-status">✔ Developer identity fully complete!</span>
            )}
          </div>

          {/* Social Links Card */}
          <div className="social-links-card">
            <h3>Social Links</h3>
            <div className="social-links-list">
              {profile.githubUrl ? (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="social-link-item">
                  <span>🐈 GitHub Profile</span>
                  <span className="arrow">➔</span>
                </a>
              ) : (
                <span className="social-link-item inactive">🐈 GitHub: not configured</span>
              )}
              {profile.linkedinUrl ? (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="social-link-item">
                  <span>💼 LinkedIn Profile</span>
                  <span className="arrow">➔</span>
                </a>
              ) : (
                <span className="social-link-item inactive">💼 LinkedIn: not configured</span>
              )}
            </div>
          </div>

          {/* 9. Matching Summary */}
          <div className="matching-summary-card">
            <h3>Match Summary</h3>
            <div className="match-metrics-list">
              <div className="metric-row">
                <span>Total Matches calculated:</span>
                <strong>{stats?.matchesCount || 0} peers</strong>
              </div>
              <div className="metric-row">
                <span>Streaks Solved:</span>
                <strong>{cs.streak || 0} days</strong>
              </div>
            </div>
          </div>

          {/* 10. Team Information */}
          <div className="team-info-card">
            <h3>Team Directory</h3>
            <div className="team-metrics-list">
              <div className="metric-row">
                <span>Joined Teams:</span>
                <strong>{stats?.teamsJoinedCount || 0}</strong>
              </div>
              <div className="metric-row">
                <span>Pending Invites:</span>
                <strong>{stats?.pendingInvites || 0}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Settings Form & Dynamic Skills/Projects Sections */}
        <div className="profile-right-column">
          
          {/* 3. Personal Information Form */}
          <div className="profile-settings-card" id="profile-form-anchor">
            <h3>Personal Information Settings</h3>
            <form onSubmit={handleProfileSubmit} className="profile-form-grid">
              <div className="form-group-row">
                <div>
                  <label>Display Name</label>
                  <input type="text" name="name" value={profile.name} onChange={handleProfileChange} required />
                </div>
                <div>
                  <label>Profession Title</label>
                  <input type="text" name="profession" value={profile.profession} onChange={handleProfileChange} placeholder="e.g. Frontend Engineer" />
                </div>
              </div>

              <div>
                <label>Bio Statement</label>
                <textarea rows="3" name="bio" value={profile.bio} onChange={handleProfileChange} placeholder="A short description about your skills..." />
              </div>

              <div className="form-group-row">
                <div>
                  <label>Education Type</label>
                  <select name="educationType" value={profile.educationType} onChange={handleProfileChange}>
                    <option value="SCHOOL">School</option>
                    <option value="COLLEGE">College</option>
                    <option value="EMPLOYED">Employed</option>
                    <option value="SELF_LEARNER">Self Learner</option>
                  </select>
                </div>
                {profile.educationType === "SCHOOL" && (
                  <div>
                    <label>School Name</label>
                    <input type="text" name="schoolName" value={profile.schoolName} onChange={handleProfileChange} />
                  </div>
                )}
                {profile.educationType === "COLLEGE" && (
                  <div>
                    <label>College Name</label>
                    <input type="text" name="college" value={profile.college} onChange={handleProfileChange} />
                  </div>
                )}
                {profile.educationType === "EMPLOYED" && (
                  <div>
                    <label>Company Name</label>
                    <input type="text" name="company" value={profile.company} onChange={handleProfileChange} />
                  </div>
                )}
              </div>

              <div className="form-group-row">
                <div>
                  <label>Department / Stream</label>
                  <input type="text" name="department" value={profile.department} onChange={handleProfileChange} placeholder="e.g. Computer Science" />
                </div>
                <div>
                  <label>Academic Year / Std</label>
                  <input type="number" name="academicYear" value={profile.academicYear} onChange={handleProfileChange} />
                </div>
              </div>

              <div className="form-group-row">
                <div>
                  <label>GitHub Profile Url</label>
                  <input type="url" name="githubUrl" value={profile.githubUrl} onChange={handleProfileChange} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label>LinkedIn Profile Url</label>
                  <input type="url" name="linkedinUrl" value={profile.linkedinUrl} onChange={handleProfileChange} placeholder="https://linkedin.com/in/..." />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving profile..." : "Save Profile Details"}
              </button>
            </form>
          </div>

          {/* 5. Core Technical Skills */}
          <div className="skills-interests-card">
            <h3>Technical Skills</h3>
            <p className="subtitle">Add skill tags to feed the matchmaking compatible engine.</p>
            
            {/* Added Skills */}
            <div className="chips-row">
              {mySkills.length === 0 ? (
                <span className="muted-text" style={{ fontSize: "12px" }}>No skills selected.</span>
              ) : (
                mySkills.map(s => (
                  <span key={s.id} className="skill-chip" onClick={() => handleRemoveSkill(s.skillId)}>
                    {s.skill?.name} <span className="close-x">×</span>
                  </span>
                ))
              )}
            </div>

            {/* Search Skill Options */}
            <div style={{ marginTop: "14px" }}>
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills to add..."
                className="chip-search-input"
              />
              {skillSearch && (
                <div className="chips-dropdown">
                  {filteredSkillsOptions.slice(0, 5).map(s => (
                    <div key={s.id} className="dropdown-item" onClick={() => { handleAddSkill(s.id); setSkillSearch(""); }}>
                      + {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interests Card */}
          <div className="skills-interests-card">
            <h3>Developer Interests</h3>
            <p className="subtitle">List fields or tech frameworks you want to collaborate on.</p>

            {/* Added Interests */}
            <div className="chips-row">
              {myInterests.length === 0 ? (
                <span className="muted-text" style={{ fontSize: "12px" }}>No interests selected.</span>
              ) : (
                myInterests.map(i => (
                  <span key={i.id} className="interest-chip" onClick={() => handleRemoveInterest(i.interestId)}>
                    {i.interest?.name} <span className="close-x">×</span>
                  </span>
                ))
              )}
            </div>

            {/* Search Interests */}
            <div style={{ marginTop: "14px" }}>
              <input
                type="text"
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                placeholder="Search interests..."
                className="chip-search-input"
              />
              {interestSearch && (
                <div className="chips-dropdown">
                  {filteredInterestsOptions.slice(0, 5).map(i => (
                    <div key={i.id} className="dropdown-item" onClick={() => { handleAddInterest(i.id); setInterestSearch(""); }}>
                      + {i.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 8. Coding Statistics */}
          <div className="coding-statistics-card">
            <h3>Solves Statistics Dashboard</h3>
            <div className="stats-dashboard-grid">
              <div className="stat-card">
                <span>Success Rate</span>
                <strong>{cs.successRate}%</strong>
              </div>
              <div className="stat-card">
                <span>Solved Count</span>
                <strong>{cs.solvedCount} problems</strong>
              </div>
              <div className="stat-card">
                <span>Submissions</span>
                <strong>{cs.submissionsCount} submissions</strong>
              </div>
            </div>

            <div className="stats-breakdown-row">
              <div className="diff-stat-item">
                <span className="lbl-easy">🟢 Easy:</span>
                <strong>{cs.easySolved} solves</strong>
              </div>
              <div className="diff-stat-item">
                <span className="lbl-medium">🟡 Medium:</span>
                <strong>{cs.mediumSolved} solves</strong>
              </div>
              <div className="diff-stat-item">
                <span className="lbl-hard">🔴 Hard:</span>
                <strong>{cs.hardSolved} solves</strong>
              </div>
            </div>
          </div>

          {/* 7. Projects Shelf Card */}
          <div className="projects-shelf-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>Developer Projects Showcase</h3>
              <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setShowProjectForm(!showProjectForm)}>
                {showProjectForm ? "Cancel Form" : "+ Add Project"}
              </button>
            </div>

            {/* Project Edit/Add form */}
            {showProjectForm && (
              <form onSubmit={handleProjectSubmit} className="project-builder-form">
                <h4>{editingProjectId ? "Edit Project details" : "Register new Showcase Project"}</h4>
                <div className="form-group-row">
                  <div>
                    <label>Project Title</label>
                    <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label>Tech Stack (comma separated)</label>
                    <input type="text" value={projectStack} onChange={(e) => setProjectStack(e.target.value)} placeholder="React, Node.js, Prisma" />
                  </div>
                </div>

                <div>
                  <label>Description</label>
                  <textarea rows="3" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} required />
                </div>

                <div className="form-group-row">
                  <div>
                    <label>GitHub Repository Url</label>
                    <input type="url" value={projectGithub} onChange={(e) => setProjectGithub(e.target.value)} placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label>Live Demo Url</label>
                    <input type="url" value={projectLive} onChange={(e) => setProjectLive(e.target.value)} placeholder="https://my-demo.com" />
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer", margin: "6px 0" }}>
                  <input type="checkbox" checked={projectFeatured} onChange={(e) => setProjectFeatured(e.target.checked)} /> Highlight project on dashboard (Featured)
                </label>

                <button type="submit" className="btn-primary" style={{ padding: "10px", marginTop: "10px" }}>
                  {editingProjectId ? "Save Changes" : "Register Project Showcase"}
                </button>
              </form>
            )}

            {/* Projects cards list */}
            <div className="projects-grid">
              {projects.length === 0 ? (
                <div className="empty-projects-state">No showcase projects registered. Highlight your best work!</div>
              ) : (
                projects.map(p => (
                  <div key={p.id} className="project-card-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 className="project-title">
                          {p.title}
                          {p.featured && <span className="featured-badge">Featured</span>}
                        </h4>
                        <p className="project-desc">{p.description}</p>
                      </div>
                      <div className="project-actions-row">
                        <button className="btn-edit" onClick={() => handleEditProject(p)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteProject(p.id)}>Delete</button>
                      </div>
                    </div>

                    <div className="project-tech-chips-row">
                      {p.techStack?.map(t => (
                        <span key={t} className="tech-chip">{t}</span>
                      ))}
                    </div>

                    <div className="project-links-row">
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer">GitHub ➔</a>}
                      {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" rel="noreferrer">Live Demo ➔</a>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}