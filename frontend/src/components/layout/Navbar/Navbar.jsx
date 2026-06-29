import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__left">
        <h2>CodeMatch</h2>
      </div>

      <div className="navbar__right">
        <span>Guest</span>
      </div>
    </header>
  );
}