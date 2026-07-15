const {
  createTeam,
  getTeamsForUser,
  getTeamById,
  joinTeam,
  leaveTeam,
  removeMember,
  updateTeam,
  updateMemberRole,
  inviteToTeamByEmail,
  getAllTeams,
  deleteTeam,
  transferOwnership,
  toggleRecruitment,
  createTeamAnnouncement,
  deleteTeamAnnouncement,
  createTeamTask,
  updateTeamTask,
  deleteTeamTask,
  createTeamFile,
  deleteTeamFile,
  createTeamResource,
  deleteTeamResource
} = require("./teams.service");

const createTeamHandler = async (req, res, next) => {
  try {
    const team = await createTeam(req.user.id, req.body);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

const getTeamsHandler = async (req, res, next) => {
  try {
    const teams = await getTeamsForUser(req.user.id);
    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
};

const getTeamDetailsHandler = async (req, res, next) => {
  try {
    const team = await getTeamById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

const joinTeamHandler = async (req, res, next) => {
  try {
    const teamMember = await joinTeam(req.user.id, req.body.joinCode);
    res.status(200).json({ success: true, message: "Joined team successfully", data: teamMember });
  } catch (err) {
    next(err);
  }
};

const leaveTeamHandler = async (req, res, next) => {
  try {
    await leaveTeam(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Left team successfully" });
  } catch (err) {
    next(err);
  }
};

const removeMemberHandler = async (req, res, next) => {
  try {
    await removeMember(req.user.id, req.params.id, req.params.userId);
    res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

const updateTeamHandler = async (req, res, next) => {
  try {
    const team = await updateTeam(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, message: "Team updated successfully", data: team });
  } catch (err) {
    next(err);
  }
};

const updateMemberRoleHandler = async (req, res, next) => {
  try {
    const { role } = req.body;
    const member = await updateMemberRole(req.user.id, req.params.id, req.params.userId, role);
    res.status(200).json({ success: true, message: "Member role updated successfully", data: member });
  } catch (err) {
    next(err);
  }
};

const inviteMemberHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await inviteToTeamByEmail(req.user.id, req.params.id, email);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

const getAllTeamsHandler = async (req, res, next) => {
  try {
    const teams = await getAllTeams();
    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
};

const deleteTeamHandler = async (req, res, next) => {
  try {
    await deleteTeam(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Team deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const transferOwnershipHandler = async (req, res, next) => {
  try {
    const { newLeaderId } = req.body;
    const team = await transferOwnership(req.user.id, req.params.id, newLeaderId);
    res.status(200).json({ success: true, message: "Leadership transferred successfully", data: team });
  } catch (err) {
    next(err);
  }
};

const toggleRecruitmentHandler = async (req, res, next) => {
  try {
    const { isRecruiting } = req.body;
    const team = await toggleRecruitment(req.user.id, req.params.id, isRecruiting);
    res.status(200).json({ success: true, message: "Recruitment status updated", data: team });
  } catch (err) {
    next(err);
  }
};

const createTeamAnnouncementHandler = async (req, res, next) => {
  try {
    const ann = await createTeamAnnouncement(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: ann });
  } catch (err) {
    next(err);
  }
};

const deleteTeamAnnouncementHandler = async (req, res, next) => {
  try {
    await deleteTeamAnnouncement(req.user.id, req.params.id, req.params.announcementId);
    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    next(err);
  }
};

const createTeamTaskHandler = async (req, res, next) => {
  try {
    const task = await createTeamTask(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

const updateTeamTaskHandler = async (req, res, next) => {
  try {
    const task = await updateTeamTask(req.user.id, req.params.id, req.params.taskId, req.body);
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

const deleteTeamTaskHandler = async (req, res, next) => {
  try {
    await deleteTeamTask(req.user.id, req.params.id, req.params.taskId);
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

const createTeamFileHandler = async (req, res, next) => {
  try {
    const file = await createTeamFile(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};

const deleteTeamFileHandler = async (req, res, next) => {
  try {
    await deleteTeamFile(req.user.id, req.params.id, req.params.fileId);
    res.status(200).json({ success: true, message: "File deleted" });
  } catch (err) {
    next(err);
  }
};

const createTeamResourceHandler = async (req, res, next) => {
  try {
    const resource = await createTeamResource(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

const deleteTeamResourceHandler = async (req, res, next) => {
  try {
    await deleteTeamResource(req.user.id, req.params.id, req.params.resourceId);
    res.status(200).json({ success: true, message: "Resource link deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTeamHandler,
  getTeamsHandler,
  getTeamDetailsHandler,
  joinTeamHandler,
  leaveTeamHandler,
  removeMemberHandler,
  updateTeamHandler,
  updateMemberRoleHandler,
  inviteMemberHandler,
  getAllTeamsHandler,
  deleteTeamHandler,
  transferOwnershipHandler,
  toggleRecruitmentHandler,
  
  createTeamAnnouncementHandler,
  deleteTeamAnnouncementHandler,
  createTeamTaskHandler,
  updateTeamTaskHandler,
  deleteTeamTaskHandler,
  createTeamFileHandler,
  deleteTeamFileHandler,
  createTeamResourceHandler,
  deleteTeamResourceHandler
};

