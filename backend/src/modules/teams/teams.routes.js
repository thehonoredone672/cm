const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { createTeamSchema, updateTeamSchema, joinTeamSchema } = require("./teams.validation");
const {
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
} = require("./teams.controller");

const router = express.Router();

router.post("/", protect, validate(createTeamSchema), createTeamHandler);
router.get("/", protect, getTeamsHandler);
router.get("/all", protect, getAllTeamsHandler);
router.get("/:id", protect, getTeamDetailsHandler);
router.post("/join", protect, validate(joinTeamSchema), joinTeamHandler);
router.post("/:id/leave", protect, leaveTeamHandler);
router.post("/:id/remove/:userId", protect, removeMemberHandler);
router.put("/:id", protect, validate(updateTeamSchema), updateTeamHandler);
router.put("/:id/members/:userId/role", protect, updateMemberRoleHandler);
router.post("/:id/invite", protect, inviteMemberHandler);
router.delete("/:id", protect, deleteTeamHandler);
router.post("/:id/transfer", protect, transferOwnershipHandler);
router.post("/:id/recruitment", protect, toggleRecruitmentHandler);

// Sub-resources
router.post("/:id/announcements", protect, createTeamAnnouncementHandler);
router.delete("/:id/announcements/:announcementId", protect, deleteTeamAnnouncementHandler);
router.post("/:id/tasks", protect, createTeamTaskHandler);
router.put("/:id/tasks/:taskId", protect, updateTeamTaskHandler);
router.delete("/:id/tasks/:taskId", protect, deleteTeamTaskHandler);
router.post("/:id/files", protect, createTeamFileHandler);
router.delete("/:id/files/:fileId", protect, deleteTeamFileHandler);
router.post("/:id/resources", protect, createTeamResourceHandler);
router.delete("/:id/resources/:resourceId", protect, deleteTeamResourceHandler);

module.exports = router;

