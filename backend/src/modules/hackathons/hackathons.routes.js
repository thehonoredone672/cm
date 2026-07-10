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

module.exports = router;
