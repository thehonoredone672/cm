const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getRecommendedTeamsHandler,
  getRecommendedProblemsHandler,
} = require("./recommendations.controller");

const router = express.Router();

router.get("/teams", protect, getRecommendedTeamsHandler);
router.get("/problems", protect, getRecommendedProblemsHandler);

module.exports = router;
