import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {

  const { logout } =
    useContext(AuthContext);

  return (

    <div className="container">

      <h1>CodeMatch Dashboard</h1>

      <p>
        Login Successful
      </p>

      <button
        onClick={logout}
      >
        Logout
      </button>

    </div>

  );

}

export default Dashboard;