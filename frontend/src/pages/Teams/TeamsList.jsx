import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeams, createTeam, joinTeam } from "../../services/teamService";
import "./Teams.css";

export default function TeamsList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to fetch teams.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;

    try {
      setCreateLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const newTeam = await createTeam({
        name: createName.trim(),
        description: createDesc.trim() || undefined,
      });
      setCreateName("");
      setCreateDesc("");
      setSuccessMessage(`Team "${newTeam.name}" created successfully!`);
      // Refresh teams list
      fetchTeams();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to create team.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setJoinLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const membership = await joinTeam(joinCode.trim().toUpperCase());
      setJoinCode("");
      setSuccessMessage(`Successfully joined team "${membership.team.name}"!`);
      fetchTeams();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to join team.");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h1>My Teams</h1>
      </div>

      {successMessage && <div style={{ background: "rgba(22, 163, 74, 0.1)", border: "1px solid var(--success)", color: "var(--success)", padding: "12px", borderRadius: "var(--radius-sm)" }}>{successMessage}</div>}
      {errorMessage && <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)" }}>{errorMessage}</div>}

      <div className="teams-layout">
        <div className="teams-main">
          {loading ? (
            <div className="team-card skeleton" style={{ height: "150px" }}>
              <h2 style={{ background: "var(--border)", height: "24px", width: "50%", borderRadius: "4px" }}></h2>
              <p style={{ background: "var(--border)", height: "16px", width: "80%", borderRadius: "4px" }}></p>
            </div>
          ) : teams.length === 0 ? (
            <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              <h3>No teams joined yet</h3>
              <p>Create a team or join an existing one using a code to start collaborating!</p>
            </div>
          ) : (
            teams.map((team) => (
              <div 
                key={team.id} 
                className="team-card"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <div className="team-card__header">
                  <div>
                    <h3 className="team-card__title">{team.name}</h3>
                    <p className="team-card__desc">{team.description || "No description provided."}</p>
                  </div>
                  <span className="team-badge">Member</span>
                </div>
                <div className="team-card__meta">
                  <span>Leader: <strong>{team.leader.name}</strong></span>
                  <span>Members: <strong>{team._count?.members || 1}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="teams-sidebar">
          {/* Join Team Card */}
          <div className="sidebar-card">
            <h3>Join a Team</h3>
            <form onSubmit={handleJoinTeam} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter Join Code (e.g. AB12CD)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  style={{ textTransform: "uppercase" }}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={joinLoading || !joinCode.trim()}
              >
                {joinLoading ? "Joining..." : "Join"}
              </button>
            </form>
          </div>

          {/* Create Team Card */}
          <div className="sidebar-card">
            <h3>Create a Team</h3>
            <form onSubmit={handleCreateTeam} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="What is your team working on?"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows="3"
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={createLoading || !createName.trim()}
              >
                {createLoading ? "Creating..." : "Create Team"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
