import { useEffect, useState } from "react";
import { getReceivedInvites, acceptInvite, rejectInvite } from "../../services/teamInviteService";
import "./Invites.css";

export default function ReceivedInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    try {
      setLoading(true);
      const data = await getReceivedInvites();
      setInvites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id) {
    try {
      await acceptInvite(id);
      loadInvites();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject(id) {
    try {
      await rejectInvite(id);
      loadInvites();
    } catch (err) {
      console.error(err);
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
      <h1>Received Invites</h1>

      {invites.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 16px auto", opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <h3>Inbox Empty</h3>
          <p>You haven't received any collaboration invites yet.</p>
        </div>
      ) : (
        invites.map((invite) => (
          <div className="invite-card" key={invite.id}>
            <div className="invite-header">
              <div>
                <h2>{invite.sender.name}</h2>
                <p>{invite.sender.email}</p>
              </div>
              <span className={`status ${invite.status.toLowerCase()}`}>
                {invite.status}
              </span>
            </div>

            <p className="message">
              {invite.message || "No message attached."}
            </p>

            {invite.status === "PENDING" && (
              <div className="actions">
                <button
                  className="accept-btn"
                  onClick={() => handleAccept(invite.id)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Accept
                </button>

                <button
                  className="reject-btn"
                  onClick={() => handleReject(invite.id)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Decline
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}