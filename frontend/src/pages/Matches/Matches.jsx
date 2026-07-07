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
        <h2>Loading Matches...</h2>
      </div>
    );
  }

  return (
    <div className="matches-page">

      <div className="matches-header">
        <h1>Recommended Matches</h1>

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {filteredMatches.length === 0 ? (
        <div className="empty-state">
          No matching students found.
        </div>
      ) : (
        <div className="match-grid">

          {filteredMatches.map((user) => (
            <div
              className="match-card"
              key={user.id}
            >
              <div className="match-top">

                <div>
                  <h2>{user.name}</h2>

                  <p>{user.email}</p>

                  <p>{user.bio || "No bio added."}</p>
                </div>

                <div
                  className={`score ${getScoreClass(
                    user.compatibilityScore
                  )}`}
                >
                  {user.compatibilityScore}%
                </div>

              </div>

              <div className="info">
                <strong>College</strong>
                <span>
                  {user.college || "-"}
                </span>
              </div>

              <div className="info">
                <strong>Department</strong>
                <span>
                  {user.department || "-"}
                </span>
              </div>

              <div className="info">
                <strong>Academic Year</strong>
                <span>
                  {user.academicYear || "-"}
                </span>
              </div>

              <div className="section">
                <h4>Common Skills</h4>

                <div className="chips">

                  {user.commonSkills.length === 0 ? (
                    <span className="chip empty">
                      None
                    </span>
                  ) : (
                    user.commonSkills.map((skill) => (
                      <span
                        key={skill}
                        className="chip"
                      >
                        {skill}
                      </span>
                    ))
                  )}

                </div>
              </div>

              <div className="section">
                <h4>Common Interests</h4>

                <div className="chips">

                  {user.commonInterests.length === 0 ? (
                    <span className="chip empty">
                      None
                    </span>
                  ) : (
                    user.commonInterests.map((interest) => (
                      <span
                        key={interest}
                        className="chip"
                      >
                        {interest}
                      </span>
                    ))
                  )}

                </div>
              </div>

              <div className="match-footer">

                <button className="primary-btn">
                  View Profile
                </button>

                {!user.inviteStatus || user.inviteStatus.status === "REJECTED" ? (
                  <button
                    className="secondary-btn"
                    onClick={() => openInviteModal(user)}
                  >
                    Invite
                  </button>
                ) : user.inviteStatus.status === "PENDING" ? (
                  <button
                    className="secondary-btn pending"
                    disabled
                  >
                    {user.inviteStatus.senderId === currentUser?.id ? "Invite Pending" : "Received Invite"}
                  </button>
                ) : (
                  <button
                    className="secondary-btn accepted"
                    disabled
                  >
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
