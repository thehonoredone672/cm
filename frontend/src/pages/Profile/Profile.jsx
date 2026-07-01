import { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "../../services/userService";
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
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>

        {message && <div className="profile-message">{message}</div>}

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

          <label>GitHub</label>
          <input
            name="githubUrl"
            value={form.githubUrl}
            onChange={handleChange}
          />

          <label>LinkedIn</label>
          <input
            name="linkedinUrl"
            value={form.linkedinUrl}
            onChange={handleChange}
          />

          <label>Portfolio</label>
          <input
            name="portfolioUrl"
            value={form.portfolioUrl}
            onChange={handleChange}
          />

          <button disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>

        </form>
      </div>
    </div>
  );
}