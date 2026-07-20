import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth.css";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/button/Button";
import { registerUser } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      };
      
      const response = await registerUser(payload);
      if (!response.success) {
        setError(response.message || "Registration Failed");
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
        err.message ||
        "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">CodeMatch</h1>
        <p className="auth-subtitle">Create your account</p>

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
            label="Name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <Input
            label="Email Address"
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
            placeholder="Choose password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="auth-footer" style={{ marginTop: "16px", textAlign: "center", fontSize: "12px" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}