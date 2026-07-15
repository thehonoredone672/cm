import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllInterests,
  getMyInterests,
  addInterest,
  removeInterest,
  updateInterest,
  createInterest
} from "../../services/interestService";
import { getMatches } from "../../services/matchService";
import { getRecommendedTeams } from "../../services/recommendationService";
import { useAuth } from "../../context/AuthContext";
import "./Interests.css";

const INTEREST_CATEGORIES = [
  "Programming", "Artificial Intelligence", "Web Development", "Mobile Development",
  "Game Development", "Cyber Security", "Cloud Computing", "DevOps", "Data Science",
  "Machine Learning", "Blockchain", "IoT", "UI/UX", "Competitive Programming",
  "Open Source", "Research", "Hackathons", "Startup", "Other"
];

// Framer Motion Animation Variants
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

export default function Interests() {
  const { user } = useAuth();
  const [allInterests, setAllInterests] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [matchingStudents, setMatchingStudents] = useState([]);
  const [recommendedTeams, setRecommendedTeams] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Form / Add / Create states
  const [selectedCategoryId, setSelectedCategoryId] = useState("Programming");
  const [newInterestName, setNewInterestName] = useState("");
  const [selectedInterestId, setSelectedInterestId] = useState("");
  const [matchingWeight, setMatchingWeight] = useState(3); // 1-5 Scale
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [editingInterestId, setEditingInterestId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [all, mine, matchesData, teamsData] = await Promise.all([
        getAllInterests(),
        getMyInterests(),
        getMatches(),
        getRecommendedTeams()
      ]);

      setAllInterests(all);
      setMyInterests(mine);
      setMatchingStudents(matchesData.slice(0, 3));
      setRecommendedTeams(teamsData.slice(0, 2));
    } catch (err) {
      console.error(err);
      triggerToast("Failed to retrieve interests telemetry.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search filter options
  const searchResults = useMemo(() => {
    return allInterests.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) &&
      !myInterests.some(myI => myI.interestId === i.id)
    );
  }, [allInterests, myInterests, search]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = myInterests.length;
    
    // Find top category
    let topCat = "—";
    if (total > 0) {
      const counts = {};
      myInterests.forEach(mi => {
        const cat = mi.interest?.category || "Other";
        counts[cat] = (counts[cat] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      topCat = sorted[0][0];
    }

    // Cumulative matching weights score
    const totalWeight = myInterests.reduce((acc, curr) => acc + (curr.matchingWeight || 1), 0);
    const maxPotentialWeight = total * 5;
    const impactPercent = maxPotentialWeight > 0 ? Math.round((totalWeight / maxPotentialWeight) * 100) : 0;

    // Last Updated Date
    let lastUpdated = "—";
    if (total > 0) {
      const dates = myInterests.map(i => new Date(i.createdAt || Date.now()));
      const latest = new Date(Math.max(...dates));
      lastUpdated = latest.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }

    return { total, topCat, impactPercent, lastUpdated };
  }, [myInterests]);

  // Recommended interests based on current profile details
  const recommendedInterests = useMemo(() => {
    const relevantDefaults = ["Distributed Systems", "Data Structures", "Next.js", "Serverless Architecture", "UX Research", "Compiler Design"];
    return allInterests.filter(i => 
      !myInterests.some(myI => myI.interestId === i.id) &&
      (relevantDefaults.includes(i.name) || i.category === stats.topCat)
    ).slice(0, 4);
  }, [allInterests, myInterests, stats.topCat]);

  // Filtered My Interests by category selector
  const filteredMyInterests = useMemo(() => {
    if (selectedCategoryFilter === "ALL") return myInterests;
    return myInterests.filter(mi => mi.interest?.category === selectedCategoryFilter);
  }, [myInterests, selectedCategoryFilter]);

  const handleAddInterestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterestId) {
      triggerToast("Please select an interest to add.");
      return;
    }
    setSaving(true);
    try {
      await addInterest(selectedInterestId, matchingWeight);
      triggerToast("Interest registered!");
      setSelectedInterestId("");
      setSearch("");
      setMatchingWeight(3);
      loadData();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to register interest.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewInterest = async (e) => {
    e.preventDefault();
    if (!newInterestName.trim()) return;
    setSaving(true);
    try {
      const created = await createInterest(newInterestName.trim(), selectedCategoryId);
      await addInterest(created.id, matchingWeight);
      triggerToast(`Created and added "${newInterestName}" to profile.`);
      setNewInterestName("");
      setSelectedInterestId("");
      setSearch("");
      loadData();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to create interest.");
    } finally {
      setSaving(false);
    }
  };

  const handleWeightUpdate = async (interestId, weight) => {
    try {
      await updateInterest(interestId, weight);
      triggerToast("Matching weight updated.");
      loadData();
    } catch (e) {
      triggerToast("Failed to update weight.");
    }
  };

  const handleRemoveInterest = async (interestId) => {
    if (!window.confirm("Remove this interest from your profile?")) return;
    try {
      await removeInterest(interestId);
      triggerToast("Interest removed.");
      loadData();
    } catch (e) {
      triggerToast("Failed to remove interest.");
    }
  };

  return (
    <motion.div 
      className="interests-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="interests-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>❤️ {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Section */}
      <div className="interests-header-card">
        <div>
          <h1>My Portfolio Interests</h1>
          <p className="subtitle">List field concepts or development paradigms you focus on. These immediately skew matching affinities and team placements.</p>
        </div>
        <div className="header-meta">
          <div className="meta-item">
            <span>Interests Count</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="meta-item">
            <span>Last Synced</span>
            <strong>{stats.lastUpdated}</strong>
          </div>
        </div>
      </div>

      {/* 2. Statistics Panel */}
      <div className="stats-dashboard-grid">
        <div className="stat-card">
          <span>Active Interests</span>
          <strong>{stats.total} Categories</strong>
        </div>
        <div className="stat-card">
          <span>Top Category Domain</span>
          <strong>{stats.topCat}</strong>
        </div>
        <div className="stat-card">
          <span>Recommendation Index</span>
          <strong>{Math.min(stats.total * 15 + 20, 100)}% Match</strong>
        </div>
        <div className="stat-card highlight">
          <span>Matching Weight Index</span>
          <strong>{stats.impactPercent}% Affinity</strong>
        </div>
      </div>

      <div className="interests-main-layout">
        
        {/* LEFT COLUMN: Search, Add, Recommendations */}
        <div className="interests-left-column">
          
          {/* 3 & 4. Search and Add / Create Interest Form */}
          <div className="interest-builder-card">
            <h3>Add Developer Interest</h3>
            <form onSubmit={handleAddInterestSubmit} className="interests-builder-form">
              
              <div style={{ position: "relative" }}>
                <label>Search Existing Interests</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search e.g. Node.js, AI, Startup..."
                  className="interest-search-input"
                />
                {search && searchResults.length > 0 && (
                  <div className="search-dropdown">
                    {searchResults.slice(0, 5).map(i => (
                      <div 
                        key={i.id} 
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedInterestId(i.id);
                          setSearch(i.name);
                        }}
                      >
                        {i.name} ({i.category})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group-row">
                <div>
                  <label>Affinities Weight (1-5)</label>
                  <select value={matchingWeight} onChange={(e) => setMatchingWeight(Number(e.target.value))}>
                    <option value="1">1 - Minimal Impact</option>
                    <option value="2">2 - Low Impact</option>
                    <option value="3">3 - Standard Impact</option>
                    <option value="4">4 - High Impact</option>
                    <option value="5">5 - Primary Focus</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Registering..." : "Add to Profile"}
              </button>
            </form>

            {/* Create Custom Interest */}
            <div className="create-custom-divider">
              <span>OR Create New Topic Node</span>
            </div>

            <form onSubmit={handleCreateNewInterest} className="interests-builder-form">
              <div>
                <label>Topic Title</label>
                <input 
                  type="text" 
                  value={newInterestName} 
                  onChange={(e) => setNewInterestName(e.target.value)} 
                  placeholder="e.g. Distributed Databases" 
                  className="interest-search-input"
                  required
                />
              </div>

              <div>
                <label>Assign Category</label>
                <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                  {INTEREST_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-secondary" disabled={saving}>
                Create & Add Interest
              </button>
            </form>
          </div>

          {/* 7. Recommended Interests Card */}
          <div className="suggested-interests-card">
            <h3>Suggested Topic Nodes</h3>
            <p className="subtitle">Based on your primary category and profile keywords:</p>
            <div className="suggested-list">
              {recommendedInterests.length === 0 ? (
                <span className="muted-text">No suggested topics. Your profile looks fully customized!</span>
              ) : (
                recommendedInterests.map(i => (
                  <div key={i.id} className="suggested-item-row">
                    <div>
                      <strong>{i.name}</strong>
                      <span className="cat-lbl">{i.category}</span>
                    </div>
                    <button className="btn-add-suggested" onClick={() => {
                      setSelectedInterestId(i.id);
                      setSearch(i.name);
                      const el = document.querySelector(".interest-search-input");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}>+ Select</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 8. Matching Preview using REAL backend engine */}
          <div className="matching-preview-card">
            <h3>Compatibility Previews</h3>
            <p className="subtitle">Real-time compatibilities generated by matching backend engine:</p>
            
            <div className="matching-preview-list">
              <strong className="preview-lbl">Top Matching Students:</strong>
              {matchingStudents.length === 0 ? (
                <span className="muted-text">Add more interest tags to preview compatible students.</span>
              ) : (
                matchingStudents.map(student => (
                  <div key={student.id} className="preview-item">
                    <span>{student.name}</span>
                    <strong>{student.compatibilityScore}% match</strong>
                  </div>
                ))
              )}

              <strong className="preview-lbl" style={{ marginTop: "12px", display: "block" }}>Recommended Teams:</strong>
              {recommendedTeams.length === 0 ? (
                <span className="muted-text">No active team recommendation matches found.</span>
              ) : (
                recommendedTeams.map(team => (
                  <div key={team.id} className="preview-item">
                    <span>{team.name}</span>
                    <strong>{team.compatibilityScore}% match</strong>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Filter Categories & Active interests */}
        <div className="interests-right-column">
          
          {/* 5. Category Filters Card */}
          <div className="category-filters-card">
            <h3>Filter Domain Categories</h3>
            <div className="category-scroll-grid">
              <button 
                className={`category-filter-btn ${selectedCategoryFilter === "ALL" ? "active" : ""}`}
                onClick={() => setSelectedCategoryFilter("ALL")}
              >
                All Topics ({myInterests.length})
              </button>
              {INTEREST_CATEGORIES.map(cat => {
                const count = myInterests.filter(mi => mi.interest?.category === cat).length;
                if (count === 0) return null;
                return (
                  <button 
                    key={cat} 
                    className={`category-filter-btn ${selectedCategoryFilter === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategoryFilter(cat)}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. My Interests Card list */}
          <div className="my-interests-header-row">
            <h3>My Registered Interests ({filteredMyInterests.length})</h3>
          </div>

          {filteredMyInterests.length === 0 ? (
            <div className="empty-interests-card">
              <span className="icon">❤️</span>
              <h4>No registered interests found</h4>
              <p>Add developer topic interests from the left panel to display them here.</p>
            </div>
          ) : (
            <motion.div 
              className="interests-cards-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredMyInterests.map(mi => (
                <motion.div 
                  key={mi.id} 
                  className="interest-card-item"
                  variants={cardVariants}
                >
                  <div className="card-top-row">
                    <strong className="interest-title-name">{mi.interest?.name}</strong>
                    <span className="category-badge">{mi.interest?.category}</span>
                  </div>

                  <div className="card-details-row">
                    <span>📅 Registered: {new Date(mi.createdAt || Date.now()).toLocaleDateString()}</span>
                    <span>🎯 Affinities weight impact: {mi.matchingWeight || 1} / 5</span>
                  </div>

                  {/* Matching weight adjust triggers */}
                  <div className="weight-adjust-row">
                    <span>Affinities Weight:</span>
                    <div className="weight-dots">
                      {[1, 2, 3, 4, 5].map(w => (
                        <button 
                          key={w} 
                          type="button" 
                          className={`weight-dot-btn ${w <= (mi.matchingWeight || 1) ? "active" : ""}`}
                          onClick={() => handleWeightUpdate(mi.interestId, w)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="card-actions-row">
                    <button className="btn-delete" onClick={() => handleRemoveInterest(mi.interestId)}>Remove Topic</button>
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