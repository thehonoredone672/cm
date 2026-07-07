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
  
  // Settings edit state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

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
    setSuccessMessage("Join code copied to clipboard!");
    setTimeout(() => setSuccessMessage(""), 3000);
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
        <h2>Loading Team details...</h2>
      </div>
    );
  }

  if (errorMessage && !team) {
    return (
      <div className="teams-page">
        <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)" }}>{errorMessage}</div>
        <button className="btn-secondary" onClick={() => navigate("/teams")} style={{ marginTop: "12px" }}>Back to Teams</button>
      </div>
    );
  }

  const isLeader = team.leaderId === user?.id;

  return (
    <div className="teams-page">
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button className="btn-secondary" onClick={() => navigate("/teams")} style={{ padding: "6px 12px" }}>← Back</button>
      </div>

      {successMessage && <div style={{ background: "rgba(22, 163, 74, 0.1)", border: "1px solid var(--success)", color: "var(--success)", padding: "12px", borderRadius: "var(--radius-sm)" }}>{successMessage}</div>}
      {errorMessage && <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)" }}>{errorMessage}</div>}

      <div className="team-details-header">
        <div className="team-details-header__top">
          {editMode ? (
            <form onSubmit={handleUpdateTeam} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
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
                  rows="2"
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="btn-primary" disabled={updateLoading}>{updateLoading ? "Saving..." : "Save Settings"}</button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h1 style={{ fontSize: "28px", margin: "0 0 8px 0" }}>{team.name}</h1>
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>{team.description || "No description provided."}</p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {isLeader ? (
                  <button className="btn-secondary" onClick={() => setEditMode(true)}>Settings</button>
                ) : (
                  <button className="btn-danger" onClick={handleLeaveTeam}>Leave Team</button>
                )}
              </div>
            </>
          )}
        </div>

        {!editMode && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px" }}>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Created: <strong>{new Date(team.createdAt).toLocaleDateString()}</strong> | Leader: <strong>{team.leader.name}</strong>
            </div>

            <div className="join-code-container" onClick={handleCopyCode} style={{ cursor: "pointer" }} title="Click to copy join code">
              <span className="join-code-label">Join Code</span>
              <span className="join-code-value">{team.joinCode}</span>
              <span style={{ fontSize: "12px", color: "var(--primary)" }}>📋</span>
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
                    className="btn-secondary" 
                    onClick={() => handleRemoveMember(membership.userId)}
                    style={{ padding: "4px 8px", fontSize: "12px", borderColor: "var(--danger)", color: "var(--danger)" }}
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
