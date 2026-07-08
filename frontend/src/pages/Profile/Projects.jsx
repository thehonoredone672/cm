import { useEffect, useState } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projectService";
import "./Profile.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal / Form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [techStack, setTechStack] = useState("");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (proj) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setDescription(proj.description);
    setGithubUrl(proj.githubUrl || "");
    setLiveDemoUrl(proj.liveDemoUrl || "");
    setTechStack(proj.techStack ? proj.techStack.join(", ") : "");
    setFeatured(proj.featured || false);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setGithubUrl("");
    setLiveDemoUrl("");
    setTechStack("");
    setFeatured(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim()) {
      setError("Title and Description are required.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      githubUrl: githubUrl.trim() || null,
      liveDemoUrl: liveDemoUrl.trim() || null,
      techStack: techStack.split(",").map(s => s.trim()).filter(Boolean),
      featured,
    };

    try {
      if (editingId) {
        await updateProject(editingId, payload);
        setSuccess("Project updated successfully!");
      } else {
        await createProject(payload);
        setSuccess("Project added successfully!");
      }
      handleResetForm();
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      setSuccess("Project deleted.");
      loadProjects();
    } catch (err) {
      setError("Failed to delete project.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {error && <div style={{ color: "var(--danger)", background: "var(--danger-glow)", padding: 10, borderRadius: 6, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ color: "#22c55e", fontWeight: "bold" }}>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Project Form */}
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", padding: "20px", borderRadius: "12px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-primary)" }}>
            {editingId ? "Edit Project" : "Add Project"}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: 4 }}>Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: 4 }}>Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px", resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: 4 }}>GitHub Repository Link</label>
              <input
                type="url"
                value={githubUrl}
                placeholder="https://github.com/..."
                onChange={(e) => setGithubUrl(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: 4 }}>Live Demo Link</label>
              <input
                type="url"
                value={liveDemoUrl}
                placeholder="https://my-demo-app.com"
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: 4 }}>Tech Stack (Comma-separated)</label>
              <input
                type="text"
                value={techStack}
                placeholder="react, nodejs, postgresql"
                onChange={(e) => setTechStack(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px" }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginTop: 4 }}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Feature this project on my profile
            </label>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: "12px" }}>
                {editingId ? "Save Changes" : "Create Project"}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={handleResetForm} style={{ padding: "12px" }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Projects List */}
        <div>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-primary)" }}>My Projects</h3>
          {loading ? (
            <div className="skeleton-loader" style={{ height: 200 }} />
          ) : projects.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No projects added yet. Share your best work!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {projects.map((p) => (
                <div key={p.id} style={{ padding: "16px", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                        {p.title}
                        {p.featured && <span style={{ fontSize: "10px", background: "#f59e0b", color: "#fff", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>Featured</span>}
                      </h4>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0" }}>{p.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ padding: "4px 8px", fontSize: 11, background: "transparent", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", color: "var(--text-primary)" }} onClick={() => handleEdit(p)}>Edit</button>
                      <button style={{ padding: "4px 8px", fontSize: 11, background: "transparent", border: "1px solid #ef4444", borderRadius: 6, cursor: "pointer", color: "#ef4444" }} onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "8px 0" }}>
                    {p.techStack.map((tech) => (
                      <span key={tech} style={{ fontSize: 11, background: "var(--background)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 4, color: "var(--text-secondary)" }}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px", fontSize: "12px", marginTop: "10px" }}>
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: "bold", textDecoration: "none" }}>GitHub ↗</a>}
                    {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: "bold", textDecoration: "none" }}>Live Demo ↗</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
