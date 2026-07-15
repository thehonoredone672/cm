import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getTeamDetails, 
  leaveTeam, 
  removeMember, 
  updateTeam, 
  updateMemberRole, 
  inviteToTeamByEmail,
  createTeamAnnouncement,
  deleteTeamAnnouncement,
  createTeamTask,
  updateTeamTask,
  deleteTeamTask,
  createTeamFile,
  deleteTeamFile,
  createTeamResource,
  deleteTeamResource
} from "../../services/teamService";
import { useAuth } from "../../context/AuthContext";
import "./Teams.css";

export default function TeamDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core Data States
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Edit / Settings Modal States
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [editMaxMembers, setEditMaxMembers] = useState(5);
  const [copied, setCopied] = useState(false);

  // Sub-resource builders
  const [inviteEmail, setInviteEmail] = useState("");
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState(2); // MB

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceLink, setResourceLink] = useState("");

  // Tabs status
  const [activeTab, setActiveTab] = useState("MEMBERS"); // MEMBERS, TASKS, ANNOUNCEMENTS, FILES, LOGS

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const data = await getTeamDetails(id);
      setTeam(data);
      setEditName(data.name);
      setEditDesc(data.description || "");
      setEditSkills(data.requiredSkills?.join(", ") || "");
      setEditInterests(data.requiredInterests?.join(", ") || "");
      setEditMaxMembers(data.maxMembers || 5);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load workspace details.");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg, isError = false) => {
    if (isError) setErrorMessage(msg);
    else setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3500);
  };

  const handleCopyCode = () => {
    if (!team) return;
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    triggerToast("Workspace Join Code copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    try {
      await leaveTeam(id);
      navigate("/teams");
    } catch (err) {
      triggerToast("Failed to leave team workspace.", true);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm("Remove this member from workspace?")) return;
    try {
      await removeMember(id, memberUserId);
      triggerToast("Member removed from workspace.");
      fetchTeamDetails();
    } catch (err) {
      triggerToast("Failed to remove member.", true);
    }
  };

  const handleUpdateTeamSettings = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = editSkills.split(",").map(s => s.trim()).filter(Boolean);
      const interestsArray = editInterests.split(",").map(i => i.trim()).filter(Boolean);

      await updateTeam(id, {
        name: editName.trim(),
        description: editDesc.trim(),
        maxMembers: Number(editMaxMembers),
        requiredSkills: skillsArray,
        requiredInterests: interestsArray
      });

      triggerToast("Workspace settings updated.");
      setEditMode(false);
      fetchTeamDetails();
    } catch (err) {
      triggerToast("Failed to update workspace.", true);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await inviteToTeamByEmail(id, inviteEmail.trim());
      triggerToast(`Invite triggered successfully to "${inviteEmail}"`);
      setInviteEmail("");
    } catch (err) {
      triggerToast("Failed to transmit invite.", true);
    }
  };

  // Roles promotion
  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    try {
      await updateMemberRole(id, userId, newRole);
      triggerToast("Member workspace privileges updated.");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to update member role.", true);
    }
  };

  // Announcement triggers
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    try {
      await createTeamAnnouncement(id, { title: annTitle, content: annContent });
      triggerToast("Announcement posted successfully.");
      setAnnTitle("");
      setAnnContent("");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to post announcement.", true);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteTeamAnnouncement(id, annId);
      triggerToast("Announcement deleted.");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to delete announcement.", true);
    }
  };

  // Task triggers
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await createTeamTask(id, {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        assigneeId: taskAssignee || null,
        dueDate: taskDueDate || null
      });
      triggerToast("Task board card generated.");
      setTaskTitle("");
      setTaskDesc("");
      setTaskPriority("MEDIUM");
      setTaskAssignee("");
      setTaskDueDate("");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to create task.", true);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTeamTask(id, taskId, { status: newStatus });
      triggerToast(`Task updated to ${newStatus}`);
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to update task status.", true);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTeamTask(id, taskId);
      triggerToast("Task deleted.");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to delete task.", true);
    }
  };

  // Files triggers
  const handleFileUploadSim = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    try {
      await createTeamFile(id, {
        name: fileName,
        fileType: fileType,
        fileSize: fileSize * 1024 * 1024, // bytes
        fileUrl: "https://codematch-shared-bucket.s3.amazonaws.com/mockfile"
      });
      triggerToast("File uploaded successfully.");
      setFileName("");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to upload file.", true);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await deleteTeamFile(id, fileId);
      triggerToast("File removed.");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to remove file.", true);
    }
  };

  // Resources triggers
  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceLink.trim()) return;
    try {
      await createTeamResource(id, { title: resourceTitle, url: resourceLink });
      triggerToast("Project link pinned.");
      setResourceTitle("");
      setResourceLink("");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to pin link.", true);
    }
  };

  const handleDeleteResource = async (resId) => {
    if (!window.confirm("Unpin this resource link?")) return;
    try {
      await deleteTeamResource(id, resId);
      triggerToast("Resource unpinned.");
      fetchTeamDetails();
    } catch (e) {
      triggerToast("Failed to unpin link.", true);
    }
  };

  // Compute tasks lists per column
  const tasksByColumn = useMemo(() => {
    if (!team) return { todo: [], inProgress: [], completed: [] };
    const todo = team.tasks?.filter(t => t.status === "TODO") || [];
    const inProgress = team.tasks?.filter(t => t.status === "IN_PROGRESS") || [];
    const completed = team.tasks?.filter(t => t.status === "COMPLETED") || [];
    return { todo, inProgress, completed };
  }, [team]);

  // Statistics computations
  const stats = useMemo(() => {
    if (!team) return { membersCount: 0, openTasks: 0, completedTasks: 0, filesCount: 0, resourceCount: 0 };
    return {
      membersCount: team.members?.length || 1,
      openTasks: team.tasks?.filter(t => t.status !== "COMPLETED").length || 0,
      completedTasks: team.tasks?.filter(t => t.status === "COMPLETED").length || 0,
      filesCount: team.files?.length || 0,
      resourceCount: team.resources?.length || 0
    };
  }, [team]);

  if (loading) {
    return (
      <div className="teams-loading-wrapper">
        <div className="skeleton-item hero-skeleton" />
        <div className="skeleton-grid">
          <div className="skeleton-item card-skeleton" />
          <div className="skeleton-item card-skeleton" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="matches-error-wrapper">
        <div className="error-card">
          <span className="icon">📡</span>
          <h3>Workspace Not Found</h3>
          <p>{errorMessage || "Failed to load team workspace."}</p>
          <button className="btn-primary" onClick={() => navigate("/teams")}>Back to Workspaces</button>
        </div>
      </div>
    );
  }

  const isLeader = team.leaderId === user?.id;

  return (
    <motion.div 
      className="teams-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {successMessage && (
          <motion.div className="teams-toast" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span>✔️ {successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div className="teams-toast error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ borderColor: "#ef4444", color: "#ef4444" }}>
            <span>❌ {errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Team Header */}
      <div className="teams-header-card">
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="team-avatar-box" style={{ width: "64px", height: "64px", fontSize: "24px" }}>
            {team.name ? team.name[0].toUpperCase() : "T"}
          </div>
          <div>
            <h1>{team.name} Workspace</h1>
            <p className="subtitle">{team.description || "Configure active tasks and collaborate in this workspace."}</p>
          </div>
        </div>

        <div className="header-meta">
          <div className="meta-item">
            <span>Join Code</span>
            <strong className="code-badge" onClick={handleCopyCode} style={{ cursor: "pointer" }}>{team.joinCode} 📋</strong>
          </div>
          <div className="meta-item">
            <span>Recruiting Status</span>
            <strong>{team.isRecruiting ? "Recruiting" : "Closed"}</strong>
          </div>
        </div>
      </div>

      {/* SECTION 9: Quick Statistics Panel */}
      <div className="stats-dashboard-grid">
        <div className="stat-card">
          <span>Active Members</span>
          <strong>{stats.membersCount}</strong>
        </div>
        <div className="stat-card">
          <span>Open Tasks</span>
          <strong>{stats.openTasks}</strong>
        </div>
        <div className="stat-card">
          <span>Completed Tasks</span>
          <strong>{stats.completedTasks}</strong>
        </div>
        <div className="stat-card highlight">
          <span>Shared Files</span>
          <strong>{stats.filesCount} Uploads</strong>
        </div>
      </div>

      {/* Primary Split View Layout */}
      <div className="teams-main-layout">
        
        {/* LEFT COLUMN: Pinned Links, Sidebar Preview Chat, Actions */}
        <div className="teams-left-column">
          
          {/* SECTION 7: Pinned Resource Links */}
          <div className="quick-actions-card">
            <h3 className="section-title">📌 Pinned Resources</h3>
            <div className="resources-list-stack">
              {team.resources?.length === 0 ? (
                <span className="muted-text" style={{ fontSize: "12px", display: "block", marginBottom: "10px" }}>No pinned links yet. Pin your Figma, Google Drive or GitHub.</span>
              ) : (
                team.resources.map(res => (
                  <div key={res.id} className="team-item-row" style={{ marginBottom: "8px" }}>
                    <div>
                      <a href={res.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: "600", fontSize: "13px" }}>
                        🔗 {res.title}
                      </a>
                    </div>
                    {isLeader && (
                      <button className="btn-add-suggested" onClick={() => handleDeleteResource(res.id)}>Unpin</button>
                    )}
                  </div>
                ))
              )}

              {isLeader && (
                <form onSubmit={handleResourceSubmit} className="join-team-inline-form" style={{ marginTop: "12px" }}>
                  <input type="text" placeholder="Title" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} required />
                  <input type="url" placeholder="https://" value={resourceLink} onChange={(e) => setResourceLink(e.target.value)} required />
                  <button type="submit">Pin</button>
                </form>
              )}
            </div>
          </div>

          {/* SECTION 10: Embedded Chat Preview */}
          <div className="quick-actions-card">
            <h3 className="section-title">💬 Team Channels Preview</h3>
            <div className="team-chat-preview-box" style={{ background: "var(--background)", borderRadius: "8px", padding: "16px", border: "1px solid var(--border)" }}>
              <span className="muted-text" style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}>Chat with teammates in full screen channel logs.</span>
              <button className="btn-primary-action" onClick={() => navigate("/chat")} style={{ padding: "8px", fontSize: "12px" }}>
                Open Team Chat Channel
              </button>
            </div>
          </div>

          {/* Direct Invite Form */}
          {isLeader && (
            <div className="quick-actions-card">
              <h3 className="section-title">✉ Invite Members</h3>
              <form onSubmit={handleSendInvite} className="join-team-inline-form">
                <input 
                  type="email" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                  placeholder="teammate@codematch.com" 
                  required 
                />
                <button type="submit">Invite</button>
              </form>
            </div>
          )}

          {/* Workspace settings */}
          <div className="quick-actions-card">
            <h3 className="section-title">⚙ Workspace Controls</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {isLeader ? (
                <>
                  <button className="btn-toggle-recruitment" onClick={() => setEditMode(true)} style={{ width: "100%", padding: "10px" }}>
                    Configure Metadata
                  </button>
                  <button className="btn-delete-team" onClick={() => navigate("/teams")} style={{ width: "100%", padding: "10px" }}>
                    Leave Workspace
                  </button>
                </>
              ) : (
                <button className="btn-delete-team" onClick={handleLeaveTeam} style={{ width: "100%", padding: "10px" }}>
                  Leave Workspace
                </button>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Tab views (Members, Tasks Kanban, Announcements, Files, Logs) */}
        <div className="teams-right-column">
          
          {/* Navigation tabs */}
          <div className="category-scroll-grid" style={{ marginBottom: "16px" }}>
            <button className={`category-filter-btn ${activeTab === "MEMBERS" ? "active" : ""}`} onClick={() => setActiveTab("MEMBERS")}>
              Members ({team.members?.length})
            </button>
            <button className={`category-filter-btn ${activeTab === "TASKS" ? "active" : ""}`} onClick={() => setActiveTab("TASKS")}>
              Kanban Board ({team.tasks?.length || 0})
            </button>
            <button className={`category-filter-btn ${activeTab === "ANNOUNCEMENTS" ? "active" : ""}`} onClick={() => setActiveTab("ANNOUNCEMENTS")}>
              Announcements ({team.announcements?.length || 0})
            </button>
            <button className={`category-filter-btn ${activeTab === "FILES" ? "active" : ""}`} onClick={() => setActiveTab("FILES")}>
              Files ({team.files?.length || 0})
            </button>
            <button className={`category-filter-btn ${activeTab === "LOGS" ? "active" : ""}`} onClick={() => setActiveTab("LOGS")}>
              Activity Log ({team.activities?.length || 0})
            </button>
          </div>

          {/* TAB 1: MEMBERS */}
          {activeTab === "MEMBERS" && (
            <div className="teams-grid-list">
              {team.members.map(memberUser => {
                const isSelf = memberUser.userId === user?.id;
                const isMemberLeader = team.leaderId === memberUser.userId;
                const currentRole = memberUser.role || "MEMBER";
                
                return (
                  <div key={memberUser.id} className="team-card-item" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div className="conn-avatar">
                        {memberUser.user?.name ? memberUser.user.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px" }}>
                          {memberUser.user?.name} {isSelf && "(You)"}
                        </strong>
                        <span className="role-lbl" style={{ margin: "2px 0 0 0", fontSize: "11px" }}>
                          {isMemberLeader ? "LEADER" : currentRole}
                        </span>
                        
                        {/* Skills chips */}
                        {memberUser.user?.skills && memberUser.user.skills.length > 0 && (
                          <div className="skills-chips-row" style={{ marginTop: "6px" }}>
                            {memberUser.user.skills.slice(0, 3).map(s => (
                              <span key={s.id} className="skill-chip">{s.skill?.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {isLeader && !isMemberLeader && (
                        <button className="btn-toggle-recruitment" onClick={() => handleRoleChange(memberUser.userId, currentRole)} style={{ padding: "4px 8px", fontSize: "11px" }}>
                          {currentRole === "ADMIN" ? "Demote" : "Promote"}
                        </button>
                      )}
                      {isLeader && !isMemberLeader && (
                        <button className="btn-delete-team" onClick={() => handleRemoveMember(memberUser.userId)} style={{ padding: "4px 8px", fontSize: "11px" }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TASKS KANBAN BOARD */}
          {activeTab === "TASKS" && (
            <div className="kanban-layout-stack" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Task creation form */}
              <div className="quick-actions-card" style={{ padding: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "13px" }}>Create Task Card</h4>
                <form onSubmit={handleTaskSubmit} className="modal-form">
                  <div className="form-group-row">
                    <input type="text" placeholder="Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
                    <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </select>
                  </div>
                  <div className="form-group-row">
                    <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
                      <option value="">Assign Member (Optional)</option>
                      {team.members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                      ))}
                    </select>
                    <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary-action" style={{ padding: "8px" }}>Create Task</button>
                </form>
              </div>

              {/* Kanban columns grid */}
              <div className="kanban-columns-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                
                {/* Column 1: TODO */}
                <div className="kanban-column" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "12px" }}>
                  <h4 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px", margin: "0 0 10px 0", fontSize: "13px" }}>To Do ({tasksByColumn.todo.length})</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {tasksByColumn.todo.map(task => (
                      <div key={task.id} className="available-team-card" style={{ flexDirection: "column", alignItems: "stretch", padding: "12px" }}>
                        <strong>{task.title}</strong>
                        <span className="available-desc" style={{ fontSize: "11px" }}>Priority: {task.priority}</span>
                        {task.assignee && <span className="meta-details" style={{ fontSize: "10px" }}>Assigned: {task.assignee.name}</span>}
                        
                        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                          <button className="btn-add-suggested" onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}>Start →</button>
                          <button className="btn-delete-team" onClick={() => handleDeleteTask(task.id)} style={{ padding: "2px 6px" }}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: IN_PROGRESS */}
                <div className="kanban-column" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "12px" }}>
                  <h4 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px", margin: "0 0 10px 0", fontSize: "13px" }}>In Progress ({tasksByColumn.inProgress.length})</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {tasksByColumn.inProgress.map(task => (
                      <div key={task.id} className="available-team-card" style={{ flexDirection: "column", alignItems: "stretch", padding: "12px" }}>
                        <strong>{task.title}</strong>
                        <span className="available-desc" style={{ fontSize: "11px" }}>Priority: {task.priority}</span>
                        {task.assignee && <span className="meta-details" style={{ fontSize: "10px" }}>Assigned: {task.assignee.name}</span>}

                        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                          <button className="btn-add-suggested" onClick={() => handleUpdateTaskStatus(task.id, "TODO")}>← Back</button>
                          <button className="btn-add-suggested" onClick={() => handleUpdateTaskStatus(task.id, "COMPLETED")}>Done →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: COMPLETED */}
                <div className="kanban-column" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "12px" }}>
                  <h4 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px", margin: "0 0 10px 0", fontSize: "13px" }}>Completed ({tasksByColumn.completed.length})</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {tasksByColumn.completed.map(task => (
                      <div key={task.id} className="available-team-card" style={{ flexDirection: "column", alignItems: "stretch", padding: "12px" }}>
                        <strong style={{ textDecoration: "line-through", color: "var(--text-muted)" }}>{task.title}</strong>
                        <span className="available-desc" style={{ fontSize: "11px" }}>Priority: {task.priority}</span>

                        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                          <button className="btn-add-suggested" onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}>← Reopen</button>
                          <button className="btn-delete-team" onClick={() => handleDeleteTask(task.id)} style={{ padding: "2px 6px" }}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENTS */}
          {activeTab === "ANNOUNCEMENTS" && (
            <div className="announcements-stack-view" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="quick-actions-card">
                <h4 style={{ margin: "0 0 12px 0", fontSize: "13px" }}>Post Announcement</h4>
                <form onSubmit={handleAnnouncementSubmit} className="modal-form">
                  <input type="text" placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
                  <textarea rows="3" placeholder="Message content" value={annContent} onChange={(e) => setAnnContent(e.target.value)} required />
                  <button type="submit" className="btn-primary-action" style={{ padding: "8px" }}>Publish Announcement</button>
                </form>
              </div>

              <div className="teams-grid-list">
                {team.announcements?.length === 0 ? (
                  <span className="muted-text" style={{ fontSize: "12px" }}>No announcements posted in this workspace yet.</span>
                ) : (
                  team.announcements.map(ann => (
                    <div key={ann.id} className="team-card-item">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "14px" }}>📢 {ann.title}</strong>
                        {isLeader && (
                          <button className="btn-delete-team" onClick={() => handleDeleteAnnouncement(ann.id)} style={{ padding: "2px 6px", fontSize: "10px" }}>
                            Delete
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "6px 0 10px 0", lineHeight: "1.4" }}>
                        {ann.content}
                      </p>
                      <span className="meta-details" style={{ fontSize: "10px" }}>
                        Posted: {new Date(ann.createdAt).toLocaleDateString()} | Author: {ann.creator?.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FILES */}
          {activeTab === "FILES" && (
            <div className="files-stack-view" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="quick-actions-card">
                <h4 style={{ margin: "0 0 12px 0", fontSize: "13px" }}>Share Files Simulation</h4>
                <form onSubmit={handleFileUploadSim} className="modal-form">
                  <div className="form-group-row">
                    <input type="text" placeholder="File Name e.g. project-specs" value={fileName} onChange={(e) => setFileName(e.target.value)} required />
                    <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                      <option value="PDF">PDF Document</option>
                      <option value="ZIP">ZIP Archive</option>
                      <option value="IMAGE">Image File</option>
                      <option value="DOC">Word Doc</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary-action" style={{ padding: "8px" }}>Upload Simulated File</button>
                </form>
              </div>

              <div className="available-teams-grid">
                {team.files?.length === 0 ? (
                  <span className="muted-text" style={{ fontSize: "12px" }}>No files uploaded yet.</span>
                ) : (
                  team.files.map(f => (
                    <div key={f.id} className="available-team-card">
                      <div>
                        <strong>📁 {f.name}</strong>
                        <div className="meta-details" style={{ marginTop: "4px" }}>
                          <span>Size: {Math.round(f.fileSize / (1024 * 1024))} MB</span>
                          <span>Uploaded by: {f.uploadedBy?.name}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <a href={f.fileUrl} target="_blank" rel="noreferrer" className="btn-apply" style={{ textDecoration: "none", display: "inline-block", fontSize: "11px", padding: "4px 8px" }}>
                          Download
                        </a>
                        {isLeader && (
                          <button className="btn-delete-team" onClick={() => handleDeleteFile(f.id)} style={{ padding: "4px 8px", fontSize: "11px" }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LOGS */}
          {activeTab === "LOGS" && (
            <div className="quick-actions-card">
              <h4 style={{ margin: "0 0 16px 0", fontSize: "13px" }}>Workspace Activity Timeline</h4>
              <div className="activity-timeline-feed" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {team.activities?.length === 0 ? (
                  <span className="muted-text" style={{ fontSize: "12px" }}>No timeline events recorded.</span>
                ) : (
                  team.activities.map(act => (
                    <div key={act.id} className="connection-item-row" style={{ gap: "10px", padding: "8px 12px" }}>
                      <span style={{ fontSize: "14px" }}>⚡</span>
                      <div>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                          <strong>{act.user?.name}</strong> {act.details}
                        </span>
                        <span className="meta-details" style={{ display: "block", fontSize: "10px", marginTop: "2px" }}>
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SETTINGS EDIT MODAL */}
      <AnimatePresence>
        {editMode && (
          <div className="create-modal-overlay">
            <motion.div className="create-modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3>Configure Workspace Settings</h3>
              <form onSubmit={handleUpdateTeamSettings} className="modal-form">
                <div>
                  <label>Team Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div>
                  <label>Project Description</label>
                  <textarea rows="3" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                </div>
                <div className="form-group-row">
                  <div>
                    <label>Required Skills (comma separated)</label>
                    <input type="text" value={editSkills} onChange={(e) => setEditSkills(e.target.value)} placeholder="React, Go" />
                  </div>
                  <div>
                    <label>Required Interests (comma separated)</label>
                    <input type="text" value={editInterests} onChange={(e) => setEditInterests(e.target.value)} placeholder="AI, Ops" />
                  </div>
                </div>
                <div>
                  <label>Maximum Member Count</label>
                  <input type="number" min="2" max="15" value={editMaxMembers} onChange={(e) => setEditMaxMembers(Number(e.target.value))} />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Save Settings</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
