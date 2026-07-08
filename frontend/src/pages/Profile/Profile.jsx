import { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "../../services/userService";
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
  portfolioUrl: "",
};

export default function Profile() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // "info" or "projects"

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getCurrentUser();

      setForm({
        name: data.name || "",
        bio: data.bio || "",
        college: data.college || "",
        department: data.department || "",
        academicYear: data.academicYear || "",
        githubUrl: data.githubUrl || "",
        linkedinUrl: data.linkedinUrl || "",
        portfolioUrl: data.portfolioUrl || "",
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load profile");
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

      setForm({
        ...form,
        ...updated,
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page" style={{ flexDirection: "column", gap: "24px" }}>
      
      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1.5px solid var(--border)", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
        <button
          onClick={() => setActiveTab("info")}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "info" ? "3px solid var(--primary)" : "3px solid transparent",
            fontWeight: "bold",
            color: activeTab === "info" ? "var(--primary)" : "var(--text-secondary)",
            cursor: "pointer"
          }}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "projects" ? "3px solid var(--primary)" : "3px solid transparent",
            fontWeight: "bold",
            color: activeTab === "projects" ? "var(--primary)" : "var(--text-secondary)",
            cursor: "pointer"
          }}
        >
          My Projects
        </button>
      </div>

      {activeTab === "info" ? (
        <div className="profile-card" style={{ margin: "0 auto" }}>
          <h2>My Profile</h2>

          {message && <div className="profile-message" style={{ color: message.includes("success") ? "#22c55e" : "var(--danger)" }}>{message}</div>}

          <form onSubmit={handleSubmit}>

            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <label>Bio</label>
            <textarea
              rows="4"
              name="bio"
              value={form.bio}
              onChange={handleChange}
            />

            <label>College</label>
            <input
              name="college"
              value={form.college}
              onChange={handleChange}
            />

            <label>Department</label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
            />

            <label>Academic Year</label>
            <input
              type="number"
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
            />

            <label>GitHub Link</label>
            <input
              name="githubUrl"
              value={form.githubUrl}
              onChange={handleChange}
            />

            <label>LinkedIn Link</label>
            <input
              name="linkedinUrl"
              value={form.linkedinUrl}
              onChange={handleChange}
            />

            <button className="btn-primary" disabled={saving} style={{ padding: "12px" }}>
              {saving ? "Saving..." : "Save Profile"}
            </button>

          </form>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
          <Projects />
        </div>
      )}
    </div>
  );
}