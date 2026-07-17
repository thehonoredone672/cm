const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { createContestSchema, updateContestSchema, createAnnouncementSchema } = require("./contests.validation");
const {
  createContestHandler,
  getContestsHandler,
  getContestByIdHandler,
  updateContestHandler,
  deleteContestHandler,
  registerForContestHandler,
  getContestLeaderboardHandler,
  createContestAnnouncementHandler,
  getContestAnnouncementsHandler
} = require("./contests.controller");

const router = express.Router();

router.post("/", protect, validate(createContestSchema), createContestHandler);
router.get("/", protect, getContestsHandler);
router.get("/:id", protect, getContestByIdHandler);
router.put("/:id", protect, validate(updateContestSchema), updateContestHandler);
router.delete("/:id", protect, deleteContestHandler);

router.post("/:id/register", protect, registerForContestHandler);
router.get("/:id/leaderboard", protect, getContestLeaderboardHandler);

router.post("/:id/announcements", protect, validate(createAnnouncementSchema), createContestAnnouncementHandler);
router.get("/:id/announcements", protect, getContestAnnouncementsHandler);

module.exports = router;
