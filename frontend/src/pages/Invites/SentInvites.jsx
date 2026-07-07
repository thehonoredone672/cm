import { useEffect, useState } from "react";
import { getSentInvites } from "../../services/teamInviteService";
import "./Invites.css";

export default function SentInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    try {
      setLoading(true);
      const data = await getSentInvites();
      setInvites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="invites-page">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <div className="skeleton-loader" style={{ width: "100%", height: "160px", borderRadius: "12px" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="invites-page">
      <h1>Sent Invites</h1>

      {invites.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 16px auto", opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <h3>Outbox Empty</h3>
          <p>You haven't sent any collaboration invites yet.</p>
        </div>
      ) : (
        invites.map((invite) => (
          <div className="invite-card" key={invite.id}>
            <div className="invite-header">
              <div>
                <h2>{invite.receiver.name}</h2>
                <p>{invite.receiver.email}</p>
              </div>
              <span className={`status ${invite.status.toLowerCase()}`}>
                {invite.status}
              </span>
            </div>

            <p className="message">
              {invite.message || "No message attached."}
            </p>
          </div>
        ))
      )}
    </div>
  );
}