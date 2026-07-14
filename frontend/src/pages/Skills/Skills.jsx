import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllSkills,
  getMySkills,
  addSkill,
  removeSkill,
  updateSkill
} from "../../services/skillService";
import { getProjects } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";
import "./Skills.css";

// Framer Motion Animation Configs
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

export default function Skills() {
  const { user } = useAuth();
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Form states (Add/Edit)
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiency, setProficiency] = useState("INTERMEDIATE");
  const [yearsOfExp, setYearsOfExp] = useState(0);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skills, userSkills, userProjs] = await Promise.all([
        getAllSkills(),
        getMySkills(),
        getProjects()
      ]);
      setAllSkills(skills);
      setMySkills(userSkills);
      setProjects(userProjs);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to retrieve skills and projects.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Autocomplete filtered available skills
  const availableSkillsOptions = useMemo(() => {
    return allSkills.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      !mySkills.some(myS => myS.skillId === s.id)
    );
  }, [allSkills, mySkills, search]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = mySkills.length;
    const beginner = mySkills.filter(s => s.proficiency === "BEGINNER").length;
    const intermediate = mySkills.filter(s => s.proficiency === "INTERMEDIATE" || !s.proficiency).length;
    const advanced = mySkills.filter(s => s.proficiency === "ADVANCED" || s.proficiency === "EXPERT").length;
    
    // Last updated date calculation
    let lastUpdated = "—";
    if (mySkills.length > 0) {
      const dates = mySkills.map(s => new Date(s.createdAt || Date.now()));
      const latest = new Date(Math.max(...dates));
      lastUpdated = latest.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }

    // Most used skill (highest experience)
    let mostUsed = "—";
    if (mySkills.length > 0) {
      const sorted = [...mySkills].sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
      mostUsed = sorted[0].skill?.name || "—";
    }

    return { total, beginner, intermediate, advanced, lastUpdated, mostUsed };
  }, [mySkills]);

  // Dynamic recommendations based on user bio, department and projects
  const suggestedSkills = useMemo(() => {
    const defaultSuggestions = ["React", "TypeScript", "Python", "SQL", "Docker", "Node.js", "GraphQL"];
    const textContext = `${user?.bio || ""} ${user?.department || ""} ${projects.map(p => `${p.title} ${p.description}`).join(" ")}`.toLowerCase();
    
    // Find matching default skills that are mentioned but not in user's profile
    const recommendations = allSkills.filter(s => {
      const isAlreadyAdded = mySkills.some(myS => myS.skillId === s.id);
      const isRelevant = defaultSuggestions.some(def => def.toLowerCase() === s.name.toLowerCase()) || textContext.includes(s.name.toLowerCase());
      return !isAlreadyAdded && isRelevant;
    });

    return recommendations.slice(0, 4);
  }, [allSkills, mySkills, user, projects]);

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) {
      triggerToast("Please select a skill to add.");
      return;
    }
    setSaving(true);
    try {
      await addSkill(selectedSkillId, proficiency, yearsOfExp);
      triggerToast("Skill added successfully!");
      setSelectedSkillId("");
      setSearch("");
      setYearsOfExp(0);
      setProficiency("INTERMEDIATE");
      setShowForm(false);
      loadData();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to add skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSkill = (mySkill) => {
    setEditingSkillId(mySkill.skillId);
    setProficiency(mySkill.proficiency || "INTERMEDIATE");
    setYearsOfExp(mySkill.yearsOfExperience || 0);
    setSelectedSkillId(mySkill.skillId);
    setShowForm(true);
  };

  const handleUpdateSkillSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSkill(editingSkillId, proficiency, yearsOfExp);
      triggerToast("Skill updated successfully!");
      setEditingSkillId(null);
      setSelectedSkillId("");
      setYearsOfExp(0);
      setProficiency("INTERMEDIATE");
      setShowForm(false);
      loadData();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to update skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to remove this skill?")) return;
    try {
      await removeSkill(skillId);
      triggerToast("Skill removed successfully.");
      loadData();
    } catch (err) {
      triggerToast("Failed to remove skill.");
    }
  };

  if (loading) {
    return (
      <div className="skills-loading-wrapper">
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
      className="skills-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="skills-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>🛡️ {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Section */}
      <div className="skills-header-card">
        <div>
          <h1>My Technical Skills</h1>
          <p className="subtitle">Configure your developer expertise stack. Complete credentials profile to optimize matchmaking compatible suggestions.</p>
        </div>
        <div className="header-meta">
          <div className="meta-item">
            <span>Total Tally</span>
            <strong>{stats.total} Skills</strong>
          </div>
          <div className="meta-item">
            <span>Last Updated</span>
            <strong>{stats.lastUpdated}</strong>
          </div>
        </div>
      </div>

      {/* 2. Skill Statistics Widgets */}
      <div className="stats-dashboard-grid">
        <div className="stat-card">
          <span>Beginner Level</span>
          <strong>{stats.beginner}</strong>
        </div>
        <div className="stat-card">
          <span>Intermediate Level</span>
          <strong>{stats.intermediate}</strong>
        </div>
        <div className="stat-card">
          <span>Advanced / Expert</span>
          <strong>{stats.advanced}</strong>
        </div>
        <div className="stat-card highlight">
          <span>Primary Skill</span>
          <strong>{stats.mostUsed}</strong>
        </div>
      </div>

      <div className="skills-main-layout">
        
        {/* LEFT COLUMN: Skill forms & Recommendations */}
        <div className="skills-left-column">
          
          {/* 4. Add/Edit Skill Form */}
          <div className="skill-form-card">
            <h3>{editingSkillId ? "Edit Skill Settings" : "Add Technical Skill"}</h3>
            <form onSubmit={editingSkillId ? handleUpdateSkillSubmit : handleAddSkillSubmit} className="skills-form">
              
              {!editingSkillId && (
                <div style={{ position: "relative" }}>
                  <label>Search Existing Skill</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowForm(true);
                    }}
                    placeholder="Search e.g. React, Node.js..."
                    className="skill-search-input"
                  />
                  {search && availableSkillsOptions.length > 0 && (
                    <div className="search-dropdown">
                      {availableSkillsOptions.slice(0, 5).map(s => (
                        <div 
                          key={s.id} 
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedSkillId(s.id);
                            setSearch(s.name);
                          }}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editingSkillId && (
                <div>
                  <label>Skill</label>
                  <input type="text" value={mySkills.find(s => s.skillId === editingSkillId)?.skill?.name || ""} disabled className="skill-search-input" />
                </div>
              )}

              <div className="form-row">
                <div>
                  <label>Proficiency</label>
                  <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label>Years of Experience</label>
                  <input type="number" min="0" value={yearsOfExp} onChange={(e) => setYearsOfExp(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingSkillId ? "Save Changes" : "Register Skill"}
                </button>
                {editingSkillId && (
                  <button type="button" className="btn-secondary" onClick={() => {
                    setEditingSkillId(null);
                    setSelectedSkillId("");
                    setYearsOfExp(0);
                    setProficiency("INTERMEDIATE");
                  }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* 6. Suggested Skills based on matches */}
          <div className="suggested-skills-card">
            <h3>Suggested For You</h3>
            <p className="subtitle">Based on your matches profile, projects tags, and academic department:</p>
            <div className="suggested-list">
              {suggestedSkills.length === 0 ? (
                <span className="muted-text">No suggestions available right now. Your stack looks fully equipped!</span>
              ) : (
                suggestedSkills.map(s => (
                  <div key={s.id} className="suggested-item-row">
                    <strong>{s.name}</strong>
                    <button className="btn-add-suggested" onClick={() => {
                      setSelectedSkillId(s.id);
                      setSearch(s.name);
                      const el = document.querySelector(".skill-search-input");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}>+ Select</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 7. Skill Distribution (Proficiency Levels Chart Progress) */}
          <div className="distribution-card">
            <h3>Proficiency Distribution</h3>
            <div className="distribution-bars-list">
              <div>
                <div className="dist-header">
                  <span>Beginner</span>
                  <strong>{stats.beginner} skills</strong>
                </div>
                <div className="dist-bar-outer">
                  <div className="dist-bar-inner fill-beginner" style={{ width: `${stats.total > 0 ? (stats.beginner / stats.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="dist-header">
                  <span>Intermediate</span>
                  <strong>{stats.intermediate} skills</strong>
                </div>
                <div className="dist-bar-outer">
                  <div className="dist-bar-inner fill-intermediate" style={{ width: `${stats.total > 0 ? (stats.intermediate / stats.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="dist-header">
                  <span>Advanced & Expert</span>
                  <strong>{stats.advanced} skills</strong>
                </div>
                <div className="dist-bar-outer">
                  <div className="dist-bar-inner fill-advanced" style={{ width: `${stats.total > 0 ? (stats.advanced / stats.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Active Skills list */}
        <div className="skills-right-column">
          
          {/* 5. My Skills Card List */}
          <div className="my-skills-header-row">
            <h3>Registered Skills ({mySkills.length})</h3>
          </div>

          {mySkills.length === 0 ? (
            <div className="empty-skills-card">
              <span className="icon">🏷️</span>
              <h4>No registered skills</h4>
              <p>Configure your development tags on the left panel to populate your skill set.</p>
            </div>
          ) : (
            <motion.div 
              className="skills-cards-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {mySkills.map(myS => (
                <motion.div 
                  key={myS.id} 
                  className="skill-card-item"
                  variants={cardVariants}
                >
                  <div className="card-top-row">
                    <strong className="skill-title-name">{myS.skill?.name}</strong>
                    <span className={`proficiency-badge ${myS.proficiency?.toLowerCase() || "intermediate"}`}>
                      {myS.proficiency || "INTERMEDIATE"}
                    </span>
                  </div>

                  <div className="card-details-row">
                    <span>⏳ Experience: {myS.yearsOfExperience || 0} years</span>
                    <span>📅 Added: {new Date(myS.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <div className="card-actions-row">
                    <button className="btn-edit" onClick={() => handleEditSkill(myS)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleRemoveSkill(myS.skillId)}>Remove</button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>

      </div>
    </motion.div>
  );
}