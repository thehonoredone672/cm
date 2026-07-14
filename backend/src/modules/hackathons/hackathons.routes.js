const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const hackathonsService = require("./hackathons.service");

// Public for logged-in users to list hackathons
router.get("/", protect, async (req, res, next) => {
  try {
    const list = await hackathonsService.getHackathons();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Admin-only creation
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const hack = await hackathonsService.createHackathon(req.body);
    res.status(201).json({ success: true, data: hack });
  } catch (err) {
    next(err);
  }
});

// Admin-only deletion
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    await hackathonsService.deleteHackathon(req.params.id);
    res.status(200).json({ success: true, message: "Hackathon deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// Register a team for a hackathon
router.post("/:id/register", protect, async (req, res, next) => {
  try {
    const reg = await hackathonsService.registerTeamForHackathon(req.params.id, req.body.teamId);
    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
});

// Submit a hackathon project
router.post("/:id/submit", protect, async (req, res, next) => {
  try {
    const sub = await hackathonsService.submitProject(
      req.params.id,
      req.body.teamId,
      req.body.projectTitle,
      req.body.projectDesc,
      req.body.projectLink
    );
    res.status(200).json({ success: true, data: sub });
  } catch (err) {
    next(err);
  }
});

// Grade project (Admin / Faculty)
router.post("/:id/grade", protect, async (req, res, next) => {
  try {
    const grade = await hackathonsService.gradeProject(
      req.params.id,
      req.body.teamId,
      req.body.score,
      req.body.isWinner
    );
    res.status(200).json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
});

// Fetch hackathon scoreboard
router.get("/:id/scoreboard", protect, async (req, res, next) => {
  try {
    const board = await hackathonsService.getHackathonLeaderboard(req.params.id);
    res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
