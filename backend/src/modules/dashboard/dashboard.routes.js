const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { getDashboardStatsHandler, getLeaderboardHandler } = require("./dashboard.controller");

const router = express.Router();

router.get("/stats", protect, getDashboardStatsHandler);
router.get("/leaderboard", protect, getLeaderboardHandler);

module.exports = router;
