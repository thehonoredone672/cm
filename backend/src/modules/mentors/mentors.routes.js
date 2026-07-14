const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const mentorsController = require("./mentors.controller");

router.get("/", protect, mentorsController.getMentorsHandler);
router.post("/profile", protect, mentorsController.registerAsMentorHandler);
router.post("/:id/book", protect, mentorsController.bookSessionHandler);
router.post("/bookings/:id/feedback", protect, mentorsController.submitSessionFeedbackHandler);

module.exports = router;
