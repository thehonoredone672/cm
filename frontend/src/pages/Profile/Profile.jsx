import { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "../../services/userService";
import { getDashboardStats } from "../../services/dashboardService";
import Projects from "./Projects";
import "./Profile.css";

const initialState = {
  name: "",
  bio: "",
  college: "",
  department: "",
  academicYear: "",
  githubUrl: "",
  linkedinUrl: "",
};

export default function Profile() {
  const [form, setForm] = useState(initialState);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // "info" or "projects"

  // Dynamic user solved stats
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadProfileAndStats();
  }, []);

  async function loadProfileAndStats() {
    try {
      setLoading(true);
      const [data, dbStats] = await Promise.all([
        getCurrentUser(),
        getDashboardStats()
      ]);

      setForm({
        name: data.name || "",
        bio: data.bio || "",
        college: data.college || "",
        department: data.department || "",
        academicYear: data.academicYear || "",
        githubUrl: data.githubUrl || "",
        linkedinUrl: data.linkedinUrl || "",
      });
      setEmail(data.email || "");
      setStats(dbStats);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        college: form.college,
        department: form.department,
        academicYear:
          form.academicYear === ""
            ? null
            : Number(form.academicYear),
        githubUrl: form.githubUrl || null,
        linkedinUrl: form.linkedinUrl || null,
      };

      const updated = await updateCurrentUser(payload);
      setForm(prev => ({
        ...prev,
        ...updated
      }));
      setMessage("Profile settings saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  }

  const initials = (name) => {
    return name ? name.slice(0, 2).toUpperCase() : "U";
  };

  if (loading) {
    return <div className="profile-page">Loading user profile...</div>;
  }

  return (
    <div className="profile-page">
      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1.5px solid var(--border)", width: "100%" }}>
        <button
          onClick={() => setActiveTab("info")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "info" ? "3px solid var(--primary)" : "3px solid transparent",
            fontWeight: "bold",
            color: activeTab === "info" ? "var(--primary)" : "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          My Profile & Settings
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "projects" ? "3px solid var(--primary)" : "3px solid transparent",
            fontWeight: "bold",
            color: activeTab === "projects" ? "var(--primary)" : "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          My Projects
        </button>
      </div>

      {activeTab === "info" ? (
        <div className="profile-layout">
          
          {/* Left Column: Visual Profile Card Preview */}
          <div className="profile-preview-card">
            <div className="profile-avatar-large">
              {initials(form.name)}
            </div>
            <h2>{form.name || "User Name"}</h2>
            <div className="email">{email}</div>
            <p className="bio">{form.bio || "No biography added yet. Click edit to add your bio details."}</p>

            <div className="info-list">
              <div className="info-row">
                <span>Solves Streak:</span>
                <strong>{stats?.codingSummary?.streak || 0} days</strong>
              </div>
              <div className="info-row">
                <span>Total Solved:</span>
                <strong>{stats?.codingSummary?.solvedCount || 0} problems</strong>
              </div>
              <div className="info-row" style={{ paddingLeft: "8px", fontSize: "12px" }}>
                <span>Easy Solves:</span>
                <strong>{stats?.codingSummary?.easySolved || 0}</strong>
              </div>
              <div className="info-row" style={{ paddingLeft: "8px", fontSize: "12px" }}>
                <span>Medium Solves:</span>
                <strong>{stats?.codingSummary?.mediumSolved || 0}</strong>
              </div>
              <div className="info-row" style={{ paddingLeft: "8px", fontSize: "12px" }}>
                <span>Hard Solves:</span>
                <strong>{stats?.codingSummary?.hardSolved || 0}</strong>
              </div>
              <div className="info-row" style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: "8px", marginTop: "4px" }}>
                <span>Department:</span>
                <strong>{form.department || "Not specified"}</strong>
              </div>
              <div className="info-row">
                <span>College:</span>
                <strong>{form.college || "Not specified"}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Form Editor */}
          <div className="profile-edit-card">
            <h3>Edit Profile Details</h3>
            {message && (
              <div className="profile-message" style={{ background: message.includes("successfully") ? "var(--success-glow)" : "var(--danger-glow)", color: message.includes("successfully") ? "var(--success)" : "var(--danger)" }}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>Display Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>Academic Year</label>
                  <input type="number" name="academicYear" value={form.academicYear} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label>Biography</label>
                <textarea rows="3" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>College Name</label>
                  <input name="college" value={form.college} onChange={handleChange} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>Department</label>
                  <input name="department" value={form.department} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>GitHub Profile Link</label>
                  <input name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="https://github.com/..." />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label>LinkedIn Profile Link</label>
                  <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                </div>
              </div>

              <button className="btn-primary" disabled={saving} style={{ padding: "12px", marginTop: "10px" }}>
                {saving ? "Saving Changes..." : "Save Settings"}
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div style={{ width: "100%" }}>
          <Projects />
        </div>
      )}
    </div>
  );
}