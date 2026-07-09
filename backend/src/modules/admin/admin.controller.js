const adminService = require("./admin.service");
const skillService = require("../skills/skills.service");
const interestService = require("../interests/interests.service");

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await adminService.toggleBlockUser(req.params.id);
    res.status(200).json({ success: true, message: `User block status toggled.`, data: user });
  } catch (err) {
    next(err);
  }
};

const changeRole = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserRole(req.params.id);
    res.status(200).json({ success: true, message: `User role toggled.`, data: user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const getTeams = async (req, res, next) => {
  try {
    const teams = await adminService.getTeams();
    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    await adminService.deleteTeam(req.params.id);
    res.status(200).json({ success: true, message: "Team disbanded successfully." });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getReports();
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await adminService.resolveReport(req.params.id, status);
    res.status(200).json({ success: true, message: `Report set to ${status}.`, data: report });
  } catch (err) {
    next(err);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const skill = await skillService.createSkill(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: "Skill deleted." });
  } catch (err) {
    next(err);
  }
};

const createInterest = async (req, res, next) => {
  try {
    const interest = await interestService.createInterest(req.body);
    res.status(201).json({ success: true, data: interest });
  } catch (err) {
    next(err);
  }
};

const deleteInterest = async (req, res, next) => {
  try {
    await prisma.interest.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: "Interest deleted." });
  } catch (err) {
    next(err);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const list = await adminService.getAnnouncements();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const ann = await adminService.createAnnouncement(title, content);
    res.status(201).json({ success: true, data: ann });
  } catch (err) {
    next(err);
  }
};

const toggleAnnouncement = async (req, res, next) => {
  try {
    const ann = await adminService.toggleAnnouncement(req.params.id);
    res.status(200).json({ success: true, data: ann });
  } catch (err) {
    next(err);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await adminService.deleteAnnouncement(req.params.id);
    res.status(200).json({ success: true, message: "Announcement deleted." });
  } catch (err) {
    next(err);
  }
};

const getMaintenance = async (req, res, next) => {
  try {
    const status = await adminService.getMaintenanceMode();
    res.status(200).json({ success: true, data: { active: status } });
  } catch (err) {
    next(err);
  }
};

const setMaintenance = async (req, res, next) => {
  try {
    const { active } = req.body;
    await adminService.setMaintenanceMode(active);
    res.status(200).json({ success: true, message: `Maintenance mode is now ${active ? "enabled" : "disabled"}.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getUsers,
  blockUser,
  changeRole,
  deleteUser,
  getTeams,
  deleteTeam,
  getReports,
  resolveReport,
  createSkill,
  deleteSkill,
  createInterest,
  deleteInterest,
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  getMaintenance,
  setMaintenance
};
