const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const challengesController = require("./challenges.controller");

router.get("/daily", protect, challengesController.getDailyChallengeHandler);

module.exports = router;
