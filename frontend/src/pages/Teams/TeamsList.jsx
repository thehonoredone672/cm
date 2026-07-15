import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getTeams, 
  getAllTeams, 
  createTeam, 
  joinTeam, 
  deleteTeam, 
  toggleRecruitment 
} from "../../services/teamService";
import { getReceivedInvites, acceptInvite, rejectInvite } from "../../services/teamInviteService";
import { useAuth } from "../../context/AuthContext";
import "./Teams.css";

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

export default function TeamsList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core Data States
  const [myTeams, setMyTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form states
  const [search, setSearch] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createSkills, setCreateSkills] = useState("");
  const [createInterests, setCreateInterests] = useState("");
  const [createMaxMembers, setCreateMaxMembers] = useState(5);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTeamsData();
  }, []);

  const loadTeamsData = async () => {
    try {
      setLoading(true);
      const [mine, all, invitesData] = await Promise.all([
        getTeams(),
        getAllTeams(),
        getReceivedInvites()
      ]);
      setMyTeams(mine);
      setAllTeams(all);
      setInvites(invitesData.filter(i => i.status === "PENDING"));
    } catch (err) {
      console.error(err);
      triggerToast("Failed to sync team records.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Autocomplete / Filtered Available Teams
  const availableTeams = useMemo(() => {
    return allTeams.filter(t => 
      !myTeams.some(myT => myT.id === t.id) &&
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allTeams, myTeams, search]);

  // Recommended Teams based on user properties
  const recommendedTeams = useMemo(() => {
    return allTeams.filter(t => {
      const isAlreadyIn = myTeams.some(myT => myT.id === t.id);
      if (isAlreadyIn) return false;

      // Match skills overlap
      const userSkills = user?.skills?.map(s => s.skill.name.toLowerCase()) || [];
      const teamSkills = t.requiredSkills?.map(s => s.toLowerCase()) || [];
      const common = userSkills.filter(s => teamSkills.includes(s));
      return common.length > 0;
    }).slice(0, 3);
  }, [allTeams, myTeams, user]);

  // Statistics Computations
  const stats = useMemo(() => {
    const joined = myTeams.length;
    const created = myTeams.filter(t => t.leaderId === user?.id).length;
    const totalInvites = invites.length;
    
    return { joined, created, totalInvites };
  }, [myTeams, invites, user]);

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setSaving(true);
    try {
      const skillsArray = createSkills.split(",").map(s => s.trim()).filter(Boolean);
      const interestsArray = createInterests.split(",").map(i => i.trim()).filter(Boolean);

      await createTeam({
        name: createName.trim(),
        description: createDesc.trim(),
        maxMembers: Number(createMaxMembers),
        requiredSkills: skillsArray,
        requiredInterests: interestsArray
      });

      triggerToast("New team workspace launched.");
      setCreateName("");
      setCreateDesc("");
      setCreateSkills("");
      setCreateInterests("");
      setCreateMaxMembers(5);
      setShowCreateModal(false);
      loadTeamsData();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to create team.");
    } finally {
      setSaving(false);
    }
  };

  const handleJoinTeamSubmit = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setSaving(true);
    try {
      await joinTeam(joinCodeInput.trim().toUpperCase());
      triggerToast("Successfully joined team workspace.");
      setJoinCodeInput("");
      loadTeamsData();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Invalid join code.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRecruitment = async (teamId, currentStatus) => {
    try {
      await toggleRecruitment(teamId, !currentStatus);
      triggerToast(`Recruitment ${!currentStatus ? "opened" : "closed"}.`);
      loadTeamsData();
    } catch (e) {
      triggerToast("Failed to toggle recruitment status.");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team? All channels and message logs will be permanently deleted.")) return;
    try {
      await deleteTeam(teamId);
      triggerToast("Team deleted successfully.");
      loadTeamsData();
    } catch (e) {
      triggerToast("Failed to delete team.");
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await acceptInvite(inviteId);
      triggerToast("Invitation accepted. Connected to chat workspace.");
      loadTeamsData();
    } catch (e) {
      triggerToast("Failed to accept invite.");
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await rejectInvite(inviteId);
      triggerToast("Invitation declined.");
      loadTeamsData();
    } catch (e) {
      triggerToast("Failed to decline invite.");
    }
  };

  return (
    <motion.div 
      className="teams-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="teams-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>👥 {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Header */}
      <div className="teams-header-card">
        <div>
          <h1>My Teams Workspaces</h1>
          <p className="subtitle">Form teams, configure required skills stacks, and manage recruitment discoverability parameters.</p>
        </div>
        <div className="header-meta">
          <div className="meta-item">
            <span>Joined Workspaces</span>
            <strong>{stats.joined} Teams</strong>
          </div>
          <div className="meta-item">
            <span>Created Workspaces</span>
            <strong>{stats.created} Teams</strong>
          </div>
        </div>
      </div>

      {/* SECTION 2: Statistics */}
      <div className="stats-dashboard-grid">
        <div className="stat-card">
          <span>Joined Workspaces</span>
          <strong>{stats.joined} Active</strong>
        </div>
        <div className="stat-card">
          <span>Created Lead Workspaces</span>
          <strong>{stats.created} Led</strong>
        </div>
        <div className="stat-card">
          <span>Incoming Collaborations</span>
          <strong>{stats.totalInvites} Pending</strong>
        </div>
        <div className="stat-card highlight">
          <span>Open recruitment hubs</span>
          <strong>{allTeams.filter(t => t.isRecruiting).length} Recruiting</strong>
        </div>
      </div>

      {/* Main Split grid */}
      <div className="teams-main-layout">
        
        {/* LEFT COLUMN: Actions, Recommendations, Invites */}
        <div className="teams-left-column">
          
          {/* SECTION 3: Quick Actions */}
          <div className="quick-actions-card">
            <h3 className="section-title">⚡ Quick Action Triggers</h3>
            <div className="action-buttons-stack">
              <button className="btn-primary-action" onClick={() => setShowCreateModal(true)}>
                + Create Workspace
              </button>
              
              <form onSubmit={handleJoinTeamSubmit} className="join-team-inline-form">
                <input 
                  type="text" 
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Enter Join Code e.g. XY78WZ" 
                  style={{ textTransform: "uppercase" }}
                  required
                />
                <button type="submit" disabled={saving}>Join Team</button>
              </form>
            </div>
          </div>

          {/* SECTION 7: Invitations received */}
          {invites.length > 0 && (
            <div className="invites-card">
              <h3 className="section-title">✉ Received Invitations</h3>
              <div className="invites-list">
                {invites.map(invite => (
                  <div key={invite.id} className="invite-item-row">
                    <div>
                      <strong>Invite from {invite.sender?.name}</strong>
                      <p className="invite-msg">{invite.message || "Wants to collaborate on project builds."}</p>
                    </div>
                    <div className="invite-actions">
                      <button className="btn-accept" onClick={() => handleAcceptInvite(invite.id)}>Accept</button>
                      <button className="btn-reject" onClick={() => handleRejectInvite(invite.id)}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: Recommended Teams */}
          <div className="recommended-teams-card">
            <h3 className="section-title">👥 Suggested Teams</h3>
            <div className="rec-teams-list">
              {recommendedTeams.length === 0 ? (
                <span className="muted-text">No recommendations match your current skills tags.</span>
              ) : (
                recommendedTeams.map(t => (
                  <div key={t.id} className="rec-team-item">
                    <div>
                      <strong>{t.name}</strong>
                      <span className="members-lbl">{t._count?.members || 1} / {t.maxMembers || 5} Members</span>
                    </div>
                    <button className="btn-join-rec" onClick={() => triggerToast(`Use join code to join ${t.name}`)}>View</button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: My Teams & Available Teams */}
        <div className="teams-right-column">
          
          {/* SECTION 4: My Teams */}
          <div className="teams-section-header">
            <h3>My Active Teams ({myTeams.length})</h3>
          </div>

          {myTeams.length === 0 ? (
            <div className="empty-teams-card">
              <span className="icon">👥</span>
              <h4>No active workspaces</h4>
              <p>Form a team workspace or enter a code to join your team's workspace.</p>
            </div>
          ) : (
            <motion.div 
              className="teams-grid-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {myTeams.map(team => {
                const isLeader = team.leaderId === user?.id;
                
                return (
                  <motion.div 
                    key={team.id} 
                    className="team-card-item"
                    variants={cardVariants}
                  >
                    <div className="team-header-row" onClick={() => navigate(`/teams/${team.id}`)}>
                      <div className="team-avatar-box">
                        {team.name ? team.name[0].toUpperCase() : "T"}
                      </div>
                      <div>
                        <h4 className="team-title">{team.name}</h4>
                        <p className="team-desc">{team.description || "No project description statement configured."}</p>
                      </div>
                    </div>

                    <div className="team-metadata-grid">
                      <span>Leader: <strong>{team.leader?.name}</strong></span>
                      <span>Members: <strong>{team._count?.members || 1} / {team.maxMembers || 5}</strong></span>
                      <span>Join Code: <strong className="code-badge">{team.joinCode}</strong></span>
                    </div>

                    {/* Required skills chips */}
                    {team.requiredSkills && team.requiredSkills.length > 0 && (
                      <div className="skills-chips-row">
                        {team.requiredSkills.map(s => (
                          <span key={s} className="skill-chip">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="team-actions-row">
                      <button className="btn-open-workspace" onClick={() => navigate(`/teams/${team.id}`)}>
                        Open Workspace
                      </button>

                      {isLeader && (
                        <>
                          <button className="btn-toggle-recruitment" onClick={() => handleToggleRecruitment(team.id, team.isRecruiting)}>
                            {team.isRecruiting ? "Close Recruitment" : "Open Recruitment"}
                          </button>
                          <button className="btn-delete-team" onClick={() => handleDeleteTeam(team.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* SECTION 5: Available Teams (Discovery Browse) */}
          <div className="teams-section-header" style={{ marginTop: "24px" }}>
            <h3>Discover Available Teams</h3>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search available teams..." 
              className="available-search-input"
            />
          </div>

          <div className="available-teams-grid">
            {availableTeams.length === 0 ? (
              <span className="muted-text" style={{ fontSize: "12px" }}>No other recruiting teams found matching search.</span>
            ) : (
              availableTeams.map(team => (
                <div key={team.id} className="available-team-card">
                  <div>
                    <strong>{team.name}</strong>
                    <p className="available-desc">{team.description}</p>
                    <div className="meta-details">
                      <span>Creator: {team.leader?.name}</span>
                      <span>Members: {team._count?.members || 1} / {team.maxMembers}</span>
                    </div>
                    {team.requiredSkills && team.requiredSkills.length > 0 && (
                      <div className="skills-chips-row" style={{ marginTop: "8px" }}>
                        {team.requiredSkills.map(s => (
                          <span key={s} className="skill-chip">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="btn-apply" onClick={() => {
                    setJoinCodeInput(team.joinCode);
                    const el = document.querySelector(".join-team-inline-form input");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}>Apply / Join</button>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* CREATE TEAM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="create-modal-overlay">
            <motion.div 
              className="create-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3>Launch Team Workspace</h3>
              <form onSubmit={handleCreateTeamSubmit} className="modal-form">
                <div>
                  <label>Team Name</label>
                  <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} required />
                </div>
                <div>
                  <label>Project Description</label>
                  <textarea rows="3" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
                </div>
                <div className="form-group-row">
                  <div>
                    <label>Required Skills (comma separated)</label>
                    <input type="text" value={createSkills} onChange={(e) => setCreateSkills(e.target.value)} placeholder="React, Python" />
                  </div>
                  <div>
                    <label>Required Interests (comma separated)</label>
                    <input type="text" value={createInterests} onChange={(e) => setCreateInterests(e.target.value)} placeholder="AI, Cloud" />
                  </div>
                </div>
                <div>
                  <label>Maximum Member Count</label>
                  <input type="number" min="2" max="15" value={createMaxMembers} onChange={(e) => setCreateMaxMembers(Number(e.target.value))} />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Launching..." : "Launch Team"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
