import { useEffect, useState } from "react";
import "./Invites.css";

import {
  getSentInvites,
} from "../../services/teamInviteService";

export default function SentInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    try {
      setLoading(true);

      const data =
        await getSentInvites();

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
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="invites-page">

      <h1>Sent Invites</h1>

      {invites.length === 0 ? (
        <div className="empty-state">
          No invitations sent.
        </div>
      ) : (
        invites.map((invite) => (
          <div
            className="invite-card"
            key={invite.id}
          >
            <div className="invite-header">

              <div>
                <h2>
                  {invite.receiver.name}
                </h2>

                <p>
                  {invite.receiver.email}
                </p>
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

          </div>
        ))
      )}
    </div>
  );
}