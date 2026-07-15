import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMatches } from "../../services/matchService";
import { getRecommendedTeams } from "../../services/recommendationService";
import { useAuth } from "../../context/AuthContext";
import InviteModal from "../../components/InviteModal/InviteModal";
import "./Matches.css";

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

export default function Matches() {
  const { user: currentUser } = useAuth();
  
  // Data States
  const [matches, setMatches] = useState([]);
  const [recommendedTeams, setRecommendedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Invite Modal Configuration
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Expanded Matches Breakdown State
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [educationTypeFilter, setEducationTypeFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [minMatchPct, setMinMatchPct] = useState(15);
  const [sortBy, setSortBy] = useState("HIGHEST_MATCH"); // HIGHEST_MATCH, NEWEST, RECENTLY_ACTIVE

  useEffect(() => {
    loadMatchesData();
  }, []);

  const loadMatchesData = async () => {
    try {
      setLoading(true);
      setError("");
      const [matchesData, teamsData] = await Promise.all([
        getMatches(),
        getRecommendedTeams()
      ]);
      setMatches(matchesData);
      setRecommendedTeams(teamsData.slice(0, 3));
    } catch (err) {
      console.error(err);
      setError("Failed to load match recommendation telemetry.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Autocomplete/Options List from matches for filter dropdowns
  const collegesList = useMemo(() => ["", ...new Set(matches.map(m => m.college).filter(Boolean))], [matches]);
  const departmentsList = useMemo(() => ["", ...new Set(matches.map(m => m.department).filter(Boolean))], [matches]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = matches.length;
    
    // Average Match Score
    const avgScore = total > 0 
      ? Math.round(matches.reduce((acc, curr) => acc + curr.compatibilityScore, 0) / total) 
      : 0;

    // Highest Match
    const highest = total > 0 
      ? Math.max(...matches.map(m => m.compatibilityScore)) 
      : 0;

    // Connected & Pending counts
    const connected = matches.filter(m => m.inviteStatus?.status === "ACCEPTED").length;
    const pending = matches.filter(m => m.inviteStatus?.status === "PENDING").length;

    // Last Updated Date
    const lastUpdated = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit" });

    return { total, avgScore, highest, connected, pending, lastUpdated };
  }, [matches]);

  // Connected/Mutual matches list
  const recentConnections = useMemo(() => {
    return matches.filter(m => m.inviteStatus?.status === "ACCEPTED").slice(0, 4);
  }, [matches]);

  // Filter & Sort Logic
  const filteredAndSortedMatches = useMemo(() => {
    let result = matches.filter(m => {
      const matchName = m.name.toLowerCase().includes(search.toLowerCase());
      
      const matchSkill = !skillFilter || m.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
      const matchInterest = !interestFilter || m.interests.some(i => i.toLowerCase().includes(interestFilter.toLowerCase()));
      
      const matchCollege = !collegeFilter || (m.college || "").toLowerCase() === collegeFilter.toLowerCase();
      const matchDept = !deptFilter || (m.department || "").toLowerCase() === deptFilter.toLowerCase();
      const matchYear = !academicYearFilter || String(m.academicYear) === academicYearFilter;
      const matchEd = !educationTypeFilter || m.educationType === educationTypeFilter;
      
      // Common languages used check
      const matchLang = !languageFilter || (m.mutual?.commonLanguages || []).some(l => l.toLowerCase().includes(languageFilter.toLowerCase())) ||
        m.skills.some(s => s.toLowerCase().includes(languageFilter.toLowerCase()));

      const matchPct = m.compatibilityScore >= minMatchPct;

      return matchName && matchSkill && matchInterest && matchCollege && matchDept && matchYear && matchEd && matchLang && matchPct;
    });

    // Sorting
    if (sortBy === "HIGHEST_MATCH") {
      result.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } else if (sortBy === "NEWEST") {
      result.sort((a, b) => b.profileCompletion - a.profileCompletion);
    } else if (sortBy === "RECENTLY_ACTIVE") {
      result.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    }

    return result;
  }, [matches, search, skillFilter, interestFilter, collegeFilter, deptFilter, academicYearFilter, educationTypeFilter, languageFilter, minMatchPct, sortBy]);

  const handleOpenInvite = (match) => {
    setSelectedMatch(match);
    setInviteOpen(true);
  };

  const handleCloseInvite = (didSend) => {
    setInviteOpen(false);
    setSelectedMatch(null);
    if (didSend) {
      triggerToast("Collaboration invitation transmitted successfully.");
      loadMatchesData();
    }
  };

  if (loading) {
    return (
      <div className="matches-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
        <div className="skeleton-grid">
          <div className="skeleton-item card-skeleton" />
          <div className="skeleton-item card-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-error-wrapper">
        <div className="error-card">
          <span className="icon">📡</span>
          <h3>Telemetry Offline</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadMatchesData}>Re-sync Matches</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="matches-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="matches-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>💬 {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Header */}
      <div className="matches-header-card">
        <div>
          <h1>Student Discovery</h1>
          <p className="subtitle">Discover matching peers based on technical skills, Interests weights, and coding problem milestones.</p>
        </div>
        <div className="header-meta">
          <div className="meta-item">
            <span>Average Fit</span>
            <strong>{stats.avgScore}% Match</strong>
          </div>
          <div className="meta-item">
            <span>Last Scanned</span>
            <strong>{stats.lastUpdated}</strong>
          </div>
        </div>
      </div>

      {/* SECTION 2: Statistics */}
      <div className="stats-dashboard-grid">
        <div className="stat-card">
          <span>Discovered Matches</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Highest Fit Affinity</span>
          <strong>{stats.highest}% Match</strong>
        </div>
        <div className="stat-card">
          <span>Pending Invitations</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="stat-card highlight">
          <span>Connected Peers</span>
          <strong>{stats.connected} Collaborators</strong>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="matches-main-layout">
        
        {/* LEFT COLUMN: Filters, Suggested Teams, Recent Connections */}
        <div className="matches-left-column">
          
          {/* SECTION 3 & 4: Filters and Search */}
          <div className="filters-card">
            <h3 className="section-title">🔍 Discovery Filters</h3>
            
            {/* Live Search */}
            <div className="search-row-container">
              <input
                type="text"
                placeholder="Search student names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-search-input"
              />
            </div>

            <div className="filters-inputs-grid">
              <div>
                <label>Filter Skill</label>
                <input type="text" placeholder="e.g. React" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
              </div>
              <div>
                <label>Filter Interest</label>
                <input type="text" placeholder="e.g. AI" value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)} />
              </div>
              <div>
                <label>Programming Language</label>
                <input type="text" placeholder="e.g. Python" value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} />
              </div>
              <div>
                <label>College</label>
                <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}>
                  {collegesList.map(c => (
                    <option key={c} value={c}>{c === "" ? "All Institutions" : c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Department</label>
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  {departmentsList.map(d => (
                    <option key={d} value={d}>{d === "" ? "All Departments" : d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Academic Year</label>
                <select value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
                  <option value="">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
              <div>
                <label>Education Type</label>
                <select value={educationTypeFilter} onChange={(e) => setEducationTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="SCHOOL">School Student</option>
                  <option value="COLLEGE">College Student</option>
                  <option value="EMPLOYED">Professional</option>
                  <option value="SELF_LEARNER">Self-Learner</option>
                </select>
              </div>
              <div>
                <label>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="HIGHEST_MATCH">Highest Compatibility</option>
                  <option value="NEWEST">Most Complete Profile</option>
                  <option value="RECENTLY_ACTIVE">Recently Active (Streak)</option>
                </select>
              </div>
            </div>

            {/* Match percentage slider */}
            <div className="slider-container" style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                <span>Minimum Match Percentage</span>
                <strong>{minMatchPct}%</strong>
              </div>
              <input
                type="range"
                min="15"
                max="95"
                value={minMatchPct}
                onChange={(e) => setMinMatchPct(Number(e.target.value))}
                className="match-range-slider"
              />
            </div>
          </div>

          {/* SECTION 8: Suggested Teams */}
          <div className="suggested-teams-card">
            <h3 className="section-title">👥 Suggested Teams</h3>
            <div className="teams-list">
              {recommendedTeams.length === 0 ? (
                <span className="muted-text">No matching team recommendations available right now.</span>
              ) : (
                recommendedTeams.map(team => (
                  <div key={team.id} className="team-item-row">
                    <div>
                      <strong>{team.name}</strong>
                      <span className="compatibility-lbl">🎯 {team.compatibilityScore}% Compatibility Match</span>
                    </div>
                    <button className="btn-add-suggested" onClick={() => triggerToast(`Navigating to join ${team.name}`)}>Join</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 9: Recent Connections */}
          <div className="recent-connections-card">
            <h3 className="section-title">🤝 Recent Connections</h3>
            <div className="connections-list">
              {recentConnections.length === 0 ? (
                <span className="muted-text">You have no accepted connections yet. Send invites to get started!</span>
              ) : (
                recentConnections.map(conn => (
                  <div key={conn.id} className="connection-item-row">
                    <div className="conn-avatar">
                      {conn.name ? conn.name[0].toUpperCase() : "C"}
                    </div>
                    <div>
                      <strong>{conn.name}</strong>
                      <span>{conn.department || "Developer"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Recommended Students Cards list */}
        <div className="matches-right-column">
          
          <div className="results-header-row">
            <h3>Discovered Peers ({filteredAndSortedMatches.length})</h3>
          </div>

          {filteredAndSortedMatches.length === 0 ? (
            <div className="empty-matches-card">
              <span className="icon">🔍</span>
              <h4>No matches found</h4>
              <p>Try clearing filters or expanding search phrases to find compatible students.</p>
            </div>
          ) : (
            <motion.div 
              className="matches-list-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredAndSortedMatches.map(match => {
                const isExpanded = expandedMatchId === match.id;
                
                return (
                  <motion.div 
                    key={match.id} 
                    className="match-card-item"
                    variants={cardVariants}
                  >
                    
                    <div className="match-card-header-row">
                      <div className="match-avatar-circle">
                        {match.name ? match.name[0].toUpperCase() : "U"}
                      </div>
                      
                      <div className="match-primary-details">
                        <div className="title-and-score">
                          <h4>{match.name}</h4>
                          <span className={`score-badge ${match.compatibilityScore >= 75 ? 'excellent' : match.compatibilityScore >= 50 ? 'good' : 'average'}`}>
                            {match.compatibilityScore}% Fit
                          </span>
                        </div>
                        <span className="role-lbl">{match.bio || "No profile bio statement configured."}</span>
                        <div className="edu-badges-row">
                          {match.college && <span className="edu-badge">🏫 {match.college}</span>}
                          {match.department && <span className="edu-badge">💻 {match.department}</span>}
                          {match.academicYear && <span className="edu-badge">Year {match.academicYear}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Skills and Interests chips lists */}
                    <div className="chips-section">
                      <strong>Skills:</strong>
                      <div className="chips-row">
                        {match.skills.slice(0, 5).map(s => (
                          <span key={s} className="skill-chip">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 7: Mutual Interests/Mutuals list */}
                    <div className="mutual-interests-section">
                      <strong>Mutual Interests:</strong>
                      <div className="mutuals-row">
                        {(match.mutual?.commonInterests || []).length > 0 ? (
                          match.mutual.commonInterests.map(i => (
                            <span key={i} className="mutual-chip">🤝 {i}</span>
                          ))
                        ) : (
                          <span className="no-mutuals-text">No shared interests tags.</span>
                        )}
                      </div>
                    </div>

                    {/* Expand breakdown toggles */}
                    <button className="btn-expand-breakdown" onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}>
                      {isExpanded ? "Hide Match Breakdown ▲" : "Show Match Breakdown ▼"}
                    </button>

                    {/* SECTION 6: Match Breakdown expand drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          className="breakdown-drawer-container"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="breakdown-grid">
                            <div>
                              <span>Skills Match:</span>
                              <strong>{match.breakdown?.skill}%</strong>
                              <div className="bar"><div className="fill" style={{ width: `${match.breakdown?.skill}%` }} /></div>
                            </div>
                            <div>
                              <span>Interests Match:</span>
                              <strong>{match.breakdown?.interest}%</strong>
                              <div className="bar"><div className="fill" style={{ width: `${match.breakdown?.interest}%` }} /></div>
                            </div>
                            <div>
                              <span>Projects Match:</span>
                              <strong>{match.breakdown?.project}%</strong>
                              <div className="bar"><div className="fill" style={{ width: `${match.breakdown?.project}%` }} /></div>
                            </div>
                            <div>
                              <span>Coding Match:</span>
                              <strong>{match.breakdown?.coding}%</strong>
                              <div className="bar"><div className="fill" style={{ width: `${match.breakdown?.coding}%` }} /></div>
                            </div>
                            <div>
                              <span>Education Match:</span>
                              <strong>{match.breakdown?.education}%</strong>
                              <div className="bar"><div className="fill" style={{ width: `${match.breakdown?.education}%` }} /></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions footer row */}
                    <div className="match-card-footer">
                      
                      {/* Connection button state */}
                      {!match.inviteStatus || match.inviteStatus.status === "REJECTED" ? (
                        <button className="btn-primary" onClick={() => handleOpenInvite(match)}>
                          ✉ Connect
                        </button>
                      ) : match.inviteStatus.status === "PENDING" ? (
                        <button className="btn-secondary pending" disabled>
                          ⏳ Invite Pending
                        </button>
                      ) : (
                        <button className="btn-secondary accepted" disabled>
                          ✔ Connected
                        </button>
                      )}

                      <button className="btn-secondary" onClick={() => triggerToast(`Initiated chat dialog with ${match.name}`)}>
                        💬 Message
                      </button>

                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          )}

        </div>

      </div>

      {selectedMatch && (
        <InviteModal
          open={inviteOpen}
          onClose={handleCloseInvite}
          receiver={selectedMatch}
        />
      )}
    </motion.div>
  );
}
