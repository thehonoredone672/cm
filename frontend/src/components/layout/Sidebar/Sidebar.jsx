import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/">Dashboard</NavLink>

      <NavLink to="/profile">Profile</NavLink>

      <NavLink to="/skills">Skills</NavLink>

      <NavLink to="/interests">Interests</NavLink>

      <NavLink to="/matches">Matches</NavLink>

      <NavLink to="/teams">Teams</NavLink>

      <NavLink to="/problems">Problems</NavLink>

      <NavLink to="/chat">Chat</NavLink>
    </aside>
  );
}