const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { getDashboardStatsHandler } = require("./dashboard.controller");

const router = express.Router();

router.get("/stats", protect, getDashboardStatsHandler);

module.exports = router;
