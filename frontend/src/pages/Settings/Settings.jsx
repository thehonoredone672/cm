import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { 
  getSettingsProfile, 
  updateSettingsProfile, 
  getSettingsPreferences, 
  updateSettingsPreferences, 
  getSettingsPrivacy, 
  updateSettingsPrivacy, 
  getActiveSessions, 
  terminateActiveSession, 
  getLoginHistory, 
  deleteUserAccount 
} from "../../services/settingsService";
import "../Problems/Problems.css";

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Active Tab: "profile", "preferences", "privacy", "security", "danger"
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form States
  // Profile
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [leetcodeProfile, setLeetcodeProfile] = useState("");

  // Preferences
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("blue");
  const [fontSize, setFontSize] = useState(14);
  const [editorLanguage, setEditorLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorTabSize, setEditorTabSize] = useState(4);
  const [editorWordWrap, setEditorWordWrap] = useState(true);
  const [editorAutoSave, setEditorAutoSave] = useState(true);
  const [editorLineNumbers, setEditorLineNumbers] = useState(true);
  const [editorMinimap, setEditorMinimap] = useState(false);

  // Privacy
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showCollege, setShowCollege] = useState(true);
  const [showGithub, setShowGithub] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showTeams, setShowTeams] = useState(true);

  // Security/Sessions
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    fetchSettingsData();
  }, [activeTab]);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      if (activeTab === "profile") {
        const data = await getSettingsProfile();
        setName(data.name || "");
        setBio(data.bio || "");
        setProfileImage(data.profileImage || "");
        setCollege(data.college || "");
        setDepartment(data.department || "");
        setAcademicYear(data.academicYear || "");
        setGithubUrl(data.githubUrl || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setLeetcodeProfile(data.leetcodeProfile || "");
      } else if (activeTab === "preferences") {
        const data = await getSettingsPreferences();
        setTheme(data.theme || "dark");
        setAccentColor(data.accentColor || "blue");
        setFontSize(data.fontSize || 14);
        setEditorLanguage(data.editorLanguage || "javascript");
        setEditorTheme(data.editorTheme || "vs-dark");
        setEditorFontSize(data.editorFontSize || 14);
        setEditorTabSize(data.editorTabSize || 4);
        setEditorWordWrap(data.editorWordWrap ?? true);
        setEditorAutoSave(data.editorAutoSave ?? true);
        setEditorLineNumbers(data.editorLineNumbers ?? true);
        setEditorMinimap(data.editorMinimap ?? false);
      } else if (activeTab === "privacy") {
        const data = await getSettingsPrivacy();
        setPublicProfile(data.publicProfile ?? true);
        setShowEmail(data.showEmail ?? true);
        setShowCollege(data.showCollege ?? true);
        setShowGithub(data.showGithub ?? true);
        setShowStatistics(data.showStatistics ?? true);
        setShowProjects(data.showProjects ?? true);
        setShowTeams(data.showTeams ?? true);
      } else if (activeTab === "security") {
        const sess = await getActiveSessions();
        setSessions(sess || []);
        const hist = await getLoginHistory();
        setLoginHistory(hist || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettingsProfile({
        name, bio, profileImage, college, department, academicYear, githubUrl, linkedinUrl, leetcodeProfile
      });
      triggerToast("Profile settings saved successfully!");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettingsPreferences({
        theme, accentColor, fontSize, editorLanguage, editorTheme, editorFontSize, editorTabSize, editorWordWrap, editorAutoSave, editorLineNumbers, editorMinimap
      });
      triggerToast("Editor and preferences settings saved!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacySave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettingsPrivacy({
        publicProfile, showEmail, showCollege, showGithub, showStatistics, showProjects, showTeams
      });
      triggerToast("Privacy settings saved successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateSession = async (id) => {
    try {
      await terminateActiveSession(id);
      const sess = await getActiveSessions();
      setSessions(sess || []);
      triggerToast("Session terminated.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete your CodeMatch account? This cannot be undone.")) return;
    try {
      await deleteUserAccount();
      logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {toastMessage && (
        <div className="problems-toast">
          <span>✔️ {toastMessage}</span>
        </div>
      )}

      <h1>Account & Preference Settings</h1>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", marginTop: "24px" }}>
        
        {/* SIDEBAR TABS */}
        <div className="stats-card" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px", height: "fit-content" }}>
          <button 
            className={`lc-panel-tab ${activeTab === "profile" ? "lc-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("profile")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "6px" }}
          >
            👤 My Profile
          </button>
          <button 
            className={`lc-panel-tab ${activeTab === "preferences" ? "lc-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("preferences")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "6px" }}
          >
            💻 Preferences & IDE
          </button>
          <button 
            className={`lc-panel-tab ${activeTab === "privacy" ? "lc-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("privacy")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "6px" }}
          >
            🔒 Account Privacy
          </button>
          <button 
            className={`lc-panel-tab ${activeTab === "security" ? "lc-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("security")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "6px" }}
          >
            🛡️ Security & Sessions
          </button>
          <button 
            className={`lc-panel-tab ${activeTab === "danger" ? "lc-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("danger")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "6px", color: "#ef4444" }}
          >
            ⚠️ Danger Zone
          </button>
        </div>

        {/* ACTIVE SECTION CONTENT */}
        <div className="stats-card" style={{ padding: "24px" }}>
          {loading ? (
            <div className="lc-spinner" style={{ padding: "40px" }}>
              <div className="lc-spin" />
            </div>
          ) : (
            <>
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSave}>
                  <h3 className="lc-section-title">👤 Public Profile Settings</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                    <div>
                      <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} required />
                    </div>

                    <div>
                      <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Bio description</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px", height: "80px" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>College / Institution</label>
                        <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Department</label>
                        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Academic Year</label>
                        <input type="number" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>GitHub Profile URL</label>
                        <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>LinkedIn Profile URL</label>
                        <input type="text" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} />
                      </div>
                    </div>

                    <button type="submit" className="lc-submit-btn" disabled={saving} style={{ width: "fit-content", marginTop: "12px" }}>
                      {saving ? "Saving Profile..." : "Save Profile Settings"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "preferences" && (
                <form onSubmit={handlePreferencesSave}>
                  <h3 className="lc-section-title">💻 Preferences & Monaco IDE Settings</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>UI Dark/Light Theme</label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}>
                          <option value="dark">Dark Mode</option>
                          <option value="light">Light Mode</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Accent Accent Color</label>
                        <select value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}>
                          <option value="blue">Classic Blue</option>
                          <option value="emerald">Emerald Green</option>
                        </select>
                      </div>
                    </div>

                    <h4 style={{ margin: "16px 0 6px 0", fontSize: "13px" }}>Monaco Editor Config</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Default Language</label>
                        <select value={editorLanguage} onChange={(e) => setEditorLanguage(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}>
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="cpp">C++</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Editor Theme</label>
                        <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}>
                          <option value="vs-dark">VS Dark</option>
                          <option value="light">VS Light</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Font Size (px)</label>
                        <input type="number" value={editorFontSize} onChange={(e) => setEditorFontSize(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Tab Size</label>
                        <input type="number" value={editorTabSize} onChange={(e) => setEditorTabSize(e.target.value)} style={{ width: "100%", padding: "10px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "10px 0" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                        <input type="checkbox" checked={editorWordWrap} onChange={(e) => setEditorWordWrap(e.target.checked)} />
                        Word Wrap enabled
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                        <input type="checkbox" checked={editorLineNumbers} onChange={(e) => setEditorLineNumbers(e.target.checked)} />
                        Display line numbers
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                        <input type="checkbox" checked={editorMinimap} onChange={(e) => setEditorMinimap(e.target.checked)} />
                        Display editor Minimap
                      </label>
                    </div>

                    <button type="submit" className="lc-submit-btn" disabled={saving} style={{ width: "fit-content" }}>
                      {saving ? "Saving Config..." : "Save Preferences"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "privacy" && (
                <form onSubmit={handlePrivacySave}>
                  <h3 className="lc-section-title">🔒 Account Privacy Controls</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={publicProfile} onChange={(e) => setPublicProfile(e.target.checked)} />
                      Allow others to find my profile in Global Search indices
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} />
                      Show email address on my public profile page
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={showCollege} onChange={(e) => setShowCollege(e.target.checked)} />
                      Show college institution details publicly
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={showGithub} onChange={(e) => setShowGithub(e.target.checked)} />
                      Display GitHub links to peers
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" checked={showStatistics} onChange={(e) => setShowStatistics(e.target.checked)} />
                      Show problem solved statistics
                    </label>

                    <button type="submit" className="lc-submit-btn" disabled={saving} style={{ width: "fit-content", marginTop: "10px" }}>
                      Save Privacy Settings
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <div>
                  <h3 className="lc-section-title">🛡️ Active Login Sessions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", marginBottom: "32px" }}>
                    {sessions.length === 0 ? (
                      <span className="muted-text">No active sessions logs found.</span>
                    ) : (
                      sessions.map(s => (
                        <div key={s.id} style={{ padding: "12px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <strong>{s.os || "Unknown OS"} | {s.browser || "Unknown Browser"}</strong>
                            <span className="meta-details" style={{ display: "block", fontSize: "10px" }}>IP: {s.ipAddress || "Unknown"} | Last active: {new Date(s.lastActive).toLocaleString()}</span>
                          </div>
                          <button className="btn-table-action" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={() => handleTerminateSession(s.id)}>
                            Terminate
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <h3 className="lc-section-title">🕒 Login History (Last 15 records)</h3>
                  <div style={{ background: "var(--background)", borderRadius: "6px", overflow: "hidden", marginTop: "12px" }}>
                    <table className="problems-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1.5px solid var(--border)", textAlign: "left" }}>
                          <th style={{ padding: "10px" }}>Date</th>
                          <th style={{ padding: "10px" }}>IP Address</th>
                          <th style={{ padding: "10px" }}>Browser</th>
                          <th style={{ padding: "10px" }}>OS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginHistory.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ padding: "12px", textAlign: "center" }}>No logs found.</td>
                          </tr>
                        ) : (
                          loginHistory.map(h => (
                            <tr key={h.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                              <td style={{ padding: "10px" }}>{new Date(h.createdAt).toLocaleString()}</td>
                              <td style={{ padding: "10px" }}>{h.ipAddress || "—"}</td>
                              <td style={{ padding: "10px" }}>{h.browser || "—"}</td>
                              <td style={{ padding: "10px" }}>{h.os || "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "danger" && (
                <div style={{ border: "1.5px solid #ef4444", padding: "20px", borderRadius: "8px" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: "#ef4444" }}>⚠️ Danger Zone</h3>
                  <p className="muted-text" style={{ fontSize: "13px", marginBottom: "20px" }}>Permanently delete your CodeMatch developer profile and erase all solved challenge statistics. This action is irreversible.</p>

                  <button className="lc-submit-btn" style={{ background: "#ef4444" }} onClick={handleDeleteAccount}>
                    Delete Account Permanently 🗑️
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </motion.div>
  );
}
