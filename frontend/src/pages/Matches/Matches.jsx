import { useEffect, useState } from "react";
import "./Matches.css";

import InviteModal from "../../components/InviteModal/InviteModal";
import { getMatches } from "../../services/matchService";
import { useAuth } from "../../context/AuthContext";

export default function Matches() {
  const { user: currentUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    const filtered = matches.filter((match) =>
      match.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMatches(filtered);
  }, [search, matches]);

  async function loadMatches() {
    try {
      const data = await getMatches();
      setMatches(data);
      setFilteredMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getScoreClass(score) {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "average";
    return "poor";
  }

  function openInviteModal(user) {
    setSelectedMatch(user);
    setInviteOpen(true);
  }

  function closeInviteModal(didSend) {
    setInviteOpen(false);
    setSelectedMatch(null);
    if (didSend === true) {
      loadMatches();
    }
  }

  if (loading) {
    return (
      <div className="matches-page">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div className="skeleton-loader" style={{ width: "100%", height: "240px", borderRadius: "12px" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <h1>Recommended Matches</h1>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
          <svg 
            width="18" 
            height="18" 
            fill="none" 
            stroke="var(--text-secondary)" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 16px auto", opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A3.318 3.318 0 0112 22.5a3.318 3.318 0 01-3-3.263v-.11m0-1.109c-.5-.91-.786-1.957-.786-3.07v-.003c0-1.113.285-2.16.786-3.07M9 18.176a9.38 9.38 0 00-2.625.372 9.337 9.337 0 01-4.121-.952 4.125 4.125 0 017.533-2.493M9 18.176v-.003a3.308 3.308 0 01-3-3.07v-.003c0-1.113.285-2.16.786-3.07" />
          </svg>
          <h3>No students found</h3>
          <p>Try refining your search keyword.</p>
        </div>
      ) : (
        <div className="match-grid">
          {filteredMatches.map((user) => (
            <div className="match-card" key={user.id}>
              <div>
                <div className="match-top">
                  <div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <p style={{ marginTop: "8px", fontStyle: user.bio ? "normal" : "italic" }}>
                      {user.bio || "No bio added."}
                    </p>
                  </div>

                  <div className={`score ${getScoreClass(user.compatibilityScore)}`}>
                    {user.compatibilityScore}%
                  </div>
                </div>

                <div className="info">
                  <strong>College</strong>
                  <span>{user.college || "-"}</span>
                </div>

                <div className="info">
                  <strong>Department</strong>
                  <span>{user.department || "-"}</span>
                </div>

                <div className="info">
                  <strong>Academic Year</strong>
                  <span>{user.academicYear || "-"}</span>
                </div>

                <div className="section">
                  <h4>Common Skills</h4>
                  <div className="chips">
                    {user.commonSkills.length === 0 ? (
                      <span className="chip empty">None</span>
                    ) : (
                      user.commonSkills.map((skill) => (
                        <span key={skill} className="chip">{skill}</span>
                      ))
                    )}
                  </div>
                </div>

                <div className="section">
                  <h4>Common Interests</h4>
                  <div className="chips">
                    {user.commonInterests.length === 0 ? (
                      <span className="chip empty">None</span>
                    ) : (
                      user.commonInterests.map((interest) => (
                        <span key={interest} className="chip">{interest}</span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="match-footer">
                {!user.inviteStatus || user.inviteStatus.status === "REJECTED" ? (
                  <button
                    className="primary-btn"
                    onClick={() => openInviteModal(user)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Invite
                  </button>
                ) : user.inviteStatus.status === "PENDING" ? (
                  <button className="secondary-btn pending" disabled>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {user.inviteStatus.senderId === currentUser?.id ? "Invite Pending" : "Received Invite"}
                  </button>
                ) : (
                  <button className="secondary-btn accepted" disabled>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Teammates
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMatch && (
        <InviteModal
          open={inviteOpen}
          onClose={closeInviteModal}
          receiver={selectedMatch}
        />
      )}
    </div>
  );
}
