import { useEffect, useState } from "react";
import "./Invites.css";

import {
  getReceivedInvites,
  acceptInvite,
  rejectInvite,
} from "../../services/teamInviteService";

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
      setInvites(data);
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
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="invites-page">

      <h1>Received Invites</h1>

      {invites.length === 0 ? (
        <div className="empty-state">
          No invitations received.
        </div>
      ) : (
        invites.map((invite) => (
          <div
            className="invite-card"
            key={invite.id}
          >
            <div className="invite-header">
              <div>
                <h2>{invite.sender.name}</h2>
                <p>{invite.sender.email}</p>
              </div>

              <span
                className={`status ${invite.status.toLowerCase()}`}
              >
                {invite.status}
              </span>
            </div>

            <p className="message">
              {invite.message || "No message"}
            </p>

            {invite.status === "PENDING" && (
              <div className="actions">

                <button
                  className="accept-btn"
                  onClick={() =>
                    handleAccept(invite.id)
                  }
                >
                  Accept
                </button>

                <button
                  className="reject-btn"
                  onClick={() =>
                    handleReject(invite.id)
                  }
                >
                  Reject
                </button>

              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}