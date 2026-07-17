const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getPlatformStatisticsHandler,
  getSystemHealthHandler,
  getAdminActivitiesHandler,
  logAdminActivityHandler
} = require("./admin-dashboard.controller");

const router = express.Router();

router.get("/stats", protect, getPlatformStatisticsHandler);
router.get("/health", protect, getSystemHealthHandler);
router.get("/activities", protect, getAdminActivitiesHandler);
router.post("/activities", protect, logAdminActivityHandler);

module.exports = router;
