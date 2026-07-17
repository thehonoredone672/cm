const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getGlobalLeaderboardHandler,
  getUserProfileStatisticsHandler,
  syncUserXPHandler
} = require("./leaderboard.controller");

const router = express.Router();

router.get("/", protect, getGlobalLeaderboardHandler);
router.get("/stats", protect, getUserProfileStatisticsHandler);
router.post("/sync", protect, syncUserXPHandler);

module.exports = router;
