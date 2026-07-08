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
} = require("./teams.controller");

const router = express.Router();

router.post("/", protect, validate(createTeamSchema), createTeamHandler);
router.get("/", protect, getTeamsHandler);
router.get("/:id", protect, getTeamDetailsHandler);
router.post("/join", protect, validate(joinTeamSchema), joinTeamHandler);
router.post("/:id/leave", protect, leaveTeamHandler);
router.post("/:id/remove/:userId", protect, removeMemberHandler);
router.put("/:id", protect, validate(updateTeamSchema), updateTeamHandler);
router.put("/:id/members/:userId/role", protect, updateMemberRoleHandler);
router.post("/:id/invite", protect, inviteMemberHandler);

module.exports = router;

