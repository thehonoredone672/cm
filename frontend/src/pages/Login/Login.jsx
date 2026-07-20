import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "../../styles/auth.css";

import { useAuth } from "../../context/AuthContext";

import Input from "../../components/common/Input/Input";
import Button from "../../components/common/button/Button";

import { loginUser } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const response = await loginUser(form);
      if (!response.success) {
        setError("Login Failed");
        return;
      }

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      login(user);

      navigate("/", { replace: true });

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
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

        {error && (
          <div className="auth-error-banner" style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            marginBottom: "16px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

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

        <p className="auth-footer" style={{ marginTop: "16px", textAlign: "center", fontSize: "12px" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>Sign Up</Link>
        </p>

      </div>
    </div>
  );
}