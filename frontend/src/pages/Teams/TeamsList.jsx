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

  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="teams-page">
      <div className="teams-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h1>My Teams</h1>
        
        {/* Team Search Input */}
        <input
          type="text"
          placeholder="🔍 Search teams by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: "1.5px solid var(--border)",
            background: "var(--background)",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
            width: "240px"
          }}
        />
      </div>

      {successMessage && <div style={{ background: "var(--success-glow)", border: "1px solid var(--success)", color: "var(--success)", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "14px" }}>{successMessage}</div>}
      {errorMessage && <div style={{ background: "var(--danger-glow)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "14px" }}>{errorMessage}</div>}

      <div className="teams-layout">
        <div className="teams-main">
          {loading ? (
            <div className="team-card skeleton" style={{ height: "150px" }}></div>
          ) : filteredTeams.length === 0 ? (
            <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 16px auto", opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <h3>No teams match search</h3>
              <p>Create a team or join an existing one using a code to start collaborating!</p>
            </div>
          ) : (
            filteredTeams.map((team) => (
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
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {createLoading ? "Creating..." : "Create Team"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
