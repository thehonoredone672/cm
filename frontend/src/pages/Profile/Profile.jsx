import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, updateCurrentUser } from "../../services/userService";
import { getDashboardStats } from "../../services/dashboardService";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projectService";
import { getAllSkills, getMySkills, addSkill, removeSkill } from "../../services/skillService";
import { getAllInterests, getMyInterests, addInterest, removeInterest } from "../../services/interestService";
import { getLatestSubmissions } from "../../services/submissionService";
import ProfileHeader from "./components/ProfileHeader";
import ProfileCompletion from "./components/ProfileCompletion";
import StatsGrid from "./components/StatsGrid";
import SocialLinks from "./components/SocialLinks";
import QuickInfo from "./components/QuickInfo";
import EditProfileForm from "./components/EditProfileForm";
import ChipManager from "./components/ChipManager";
import SolvesStats from "./components/SolvesStats";
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

const safeFetch = async (promise, fallback) => {
  try {
    return await promise;
  } catch (err) {
    console.error("Fetch failed:", err);
    return fallback;
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
    profileImage: "",
    createdAt: null
  });

  // Projects state
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
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
  
  const [allInterests, setAllInterests] = useState([]);
  const [myInterests, setMyInterests] = useState([]);

  // Dashboard & solved stats state
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadProfileDetails();
  }, []);

  const loadProfileDetails = async () => {
    try {
      setLoading(true);
      const [u, dbStats, projs, skillsAll, skillsMy, interestsAll, interestsMy, subs] = await Promise.all([
        safeFetch(getCurrentUser(), {}),
        safeFetch(getDashboardStats(), {}),
        safeFetch(getProjects(), []),
        safeFetch(getAllSkills(), []),
        safeFetch(getMySkills(), []),
        safeFetch(getAllInterests(), []),
        safeFetch(getMyInterests(), []),
        safeFetch(getLatestSubmissions(), [])
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
        profileImage: u.profileImage || "",
        createdAt: u.createdAt || null
      });

      setStats(dbStats);
      setProjects(projs);
      setAllSkills(skillsAll);
      setMySkills(skillsMy);
      setAllInterests(interestsAll);
      setMyInterests(interestsMy);
      setSubmissions(subs);

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

  const recentActivities = useMemo(() => {
    const list = [];
    if (Array.isArray(submissions)) {
      submissions.forEach(sub => {
        list.push({
          id: `sub-${sub.id}`,
          title: `${sub.status === "ACCEPTED" ? "Accepted" : "Attempted"} ${sub.problem?.title || "coding challenge"}`,
          meta: `Language: ${sub.language} | Runtime: ${sub.executionTime || 0}ms`,
          date: sub.createdAt
        });
      });
    }
    if (Array.isArray(mySkills)) {
      mySkills.forEach(ms => {
        list.push({
          id: `skill-${ms.id}`,
          title: `Added ${ms.skill?.name || "technical"} Skill`,
          meta: `Proficiency: ${ms.proficiency || "Intermediate"} | Exp: ${ms.yearsOfExperience || 0} years`,
          date: ms.createdAt
        });
      });
    }
    if (Array.isArray(projects)) {
      projects.forEach(p => {
        list.push({
          id: `proj-${p.id}`,
          title: `Showcased Project: ${p.title}`,
          meta: p.techStack ? p.techStack.join(", ") : "",
          date: p.createdAt
        });
      });
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [submissions, mySkills, projects]);

  if (loading) {
    return (
      <div className="profile-loading-wrapper">
        <div className="skeleton-item hero-skeleton" style={{ height: "200px", borderRadius: "12px", marginBottom: "24px" }} />
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

      <ProfileHeader
        profile={profile}
        onEdit={() => {
          const el = document.getElementById("profile-form-anchor");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        onShare={() => {
          navigator.clipboard.writeText(window.location.href);
          triggerToast("Profile link copied to clipboard!");
        }}
      />

      <div className="profile-layout-grid">
        
        {/* LEFT COLUMN: Identity & Quick Metrics */}
        <div className="profile-left-column">
          
          <ProfileCompletion
            completionPercentage={calculateCompletion()}
            missingItems={missingList}
          />

          <StatsGrid stats={{
            solvedCount: cs.solvedCount,
            matchesCount: stats?.matchesCount || 0,
            teamsJoinedCount: stats?.teamsJoinedCount || 0,
            projectsCount: projects.length
          }} />

          <SocialLinks
            githubUrl={profile.githubUrl}
            linkedinUrl={profile.linkedinUrl}
          />

          <QuickInfo
            stats={stats}
            codingSummary={cs}
          />

        </div>

        {/* RIGHT COLUMN: Settings Form & Dynamic Skills/Projects Sections */}
        <div className="profile-right-column">
          
          <EditProfileForm
            profile={profile}
            onProfileChange={handleProfileChange}
            onProfileSubmit={handleProfileSubmit}
            saving={saving}
          />

          <ChipManager
            title="Technical Skills"
            subtitle="Add skill tags to feed the matchmaking compatible engine."
            items={mySkills}
            options={allSkills}
            onAddItem={handleAddSkill}
            onRemoveItem={handleRemoveSkill}
            searchPlaceholder="Search skills to add..."
            itemKey="skillId"
            itemName="skill"
          />

          <ChipManager
            title="Developer Interests"
            subtitle="List fields or tech frameworks you want to collaborate on."
            items={myInterests}
            options={allInterests}
            onAddItem={handleAddInterest}
            onRemoveItem={handleRemoveInterest}
            searchPlaceholder="Search interests..."
            itemKey="interestId"
            itemName="interest"
          />

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