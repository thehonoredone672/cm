import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/auth.css";

import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";

import { loginUser } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await loginUser(form);

     console.log("===============");
     console.log("Login Response");
     console.log(data);
     console.log("===============");

      alert("Login Successful");

      navigate("/");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1 className="auth-title">
          CodeMatch
        </h1>

        <p className="auth-subtitle">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>

          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

        </form>

      </div>
    </div>
  );
}