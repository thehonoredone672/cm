import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeamDetails, leaveTeam, removeMember, updateTeam } from "../../services/teamService";
import { useAuth } from "../../context/AuthContext";
import "./Teams.css";

export default function TeamDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const data = await getTeamDetails(id);
      setTeam(data);
      setEditName(data.name);
      setEditDesc(data.description || "");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to load team details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!team) return;
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setSuccessMessage("Join code copied to clipboard!");
    setTimeout(() => {
      setCopied(false);
      setSuccessMessage("");
    }, 3000);
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;

    try {
      await leaveTeam(id);
      navigate("/teams");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to leave team.");
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;

    try {
      await removeMember(id, memberUserId);
      setSuccessMessage("Member removed successfully.");
      fetchTeamDetails();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to remove member.");
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setUpdateLoading(true);
      setErrorMessage("");
      const updated = await updateTeam(id, {
        name: editName.trim(),
        description: editDesc.trim() || "",
      });
      setTeam(prev => ({
        ...prev,
        name: updated.name,
        description: updated.description,
      }));
      setEditMode(false);
      setSuccessMessage("Team settings updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to update team.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teams-page">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div className="skeleton-loader" style={{ width: "100%", height: "200px", borderRadius: "12px" }}></div>
        </div>
      </div>
    );
  }

  if (errorMessage && !team) {
    return (
      <div className="teams-page">
        <div style={{ background: "var(--danger-glow)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "16px", borderRadius: "var(--radius-sm)" }}>{errorMessage}</div>
        <button className="btn-secondary" onClick={() => navigate("/teams")} style={{ marginTop: "12px" }}>Back to Teams</button>
      </div>
    );
  }

  const isLeader = team.leaderId === user?.id;

  return (
    <div className="teams-page">
      <div>
        <button className="btn-secondary" onClick={() => navigate("/teams")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Teams
        </button>
      </div>

      {successMessage && <div style={{ background: "var(--success-glow)", border: "1px solid var(--success)", color: "var(--success)", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "14px" }}>{successMessage}</div>}
      {errorMessage && <div style={{ background: "var(--danger-glow)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "14px" }}>{errorMessage}</div>}

      <div className="team-details-header">
        <div className="team-details-header__top">
          {editMode ? (
            <form onSubmit={handleUpdateTeam} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
              <div className="form-group">
                <label>Team Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)} 
                  rows="3"
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn-primary" disabled={updateLoading}>{updateLoading ? "Saving..." : "Save Settings"}</button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h1 style={{ fontSize: "28px", margin: "0 0 8px 0", fontWeight: 800, letterSpacing: "-0.5px" }}>{team.name}</h1>
                <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "15px", lineHeight: 1.5 }}>{team.description || "No description provided."}</p>
              </div>
              <div>
                {isLeader ? (
                  <button className="btn-secondary" onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                ) : (
                  <button className="btn-danger" onClick={handleLeaveTeam} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Leave
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!editMode && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px", gap: "16px" }}>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Created: <strong>{new Date(team.createdAt).toLocaleDateString()}</strong> | Leader: <strong>{team.leader.name}</strong>
            </div>

            <div className="join-code-container" onClick={handleCopyCode} style={{ cursor: "pointer" }} title="Click to copy join code">
              <span className="join-code-label">Join Code</span>
              <span className="join-code-value">{team.joinCode}</span>
              {copied ? (
                <svg width="14" height="14" fill="none" stroke="var(--success)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="members-section">
        <h2>Team Members ({team.members.length})</h2>
        <div className="members-grid">
          {team.members.map((membership) => {
            const isMemberLeader = team.leaderId === membership.userId;
            const isSelf = membership.userId === user?.id;
            return (
              <div key={membership.id} className="member-card">
                <div className="member-info">
                  <div className="member-name">
                    {membership.user.name} {isSelf && "(You)"}
                    {isMemberLeader && <span className="leader-tag">Leader</span>}
                  </div>
                  <div className="member-email">{membership.user.email}</div>
                </div>

                {isLeader && !isMemberLeader && (
                  <button 
                    className="btn-danger" 
                    onClick={() => handleRemoveMember(membership.userId)}
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
