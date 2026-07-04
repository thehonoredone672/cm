import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import { getReceivedInvites } from "../../../services/teamInviteService";

export default function Sidebar() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadPendingCount();

    // Keep the badge reasonably fresh without needing a socket event
    // for every invite action.
    const interval = setInterval(loadPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadPendingCount() {
    try {
      const invites = await getReceivedInvites();

      const pending = invites.filter(
        (invite) => invite.status === "PENDING"
      ).length;

      setPendingCount(pending);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <aside className="sidebar">
      <NavLink to="/">Dashboard</NavLink>

      <NavLink to="/profile">Profile</NavLink>

      <NavLink to="/skills">Skills</NavLink>

      <NavLink to="/interests">Interests</NavLink>

      <NavLink to="/matches">Matches</NavLink>

      <NavLink to="/invites/received">
        Invites
        {pendingCount > 0 && (
          <span className="sidebar-badge">{pendingCount}</span>
        )}
      </NavLink>

      <NavLink to="/invites/sent">Sent Invites</NavLink>

      <NavLink to="/teams">Teams</NavLink>

      <NavLink to="/problems">Problems</NavLink>

      <NavLink to="/chat">Chat</NavLink>
    </aside>
  );
}
