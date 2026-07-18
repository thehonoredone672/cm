import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await loginUser(form);
      if (!response.success) {
        alert("Login Failed");
        return;
      }

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      login(user);

      navigate("/", { replace: true });

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