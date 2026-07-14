const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const eventsController = require("./events.controller");

router.get("/", protect, eventsController.getEventsHandler);
router.post("/", protect, eventsController.createEventHandler); // Admin or Faculty
router.post("/:id/register", protect, eventsController.registerForEventHandler);
router.post("/:id/attendance", protect, eventsController.markAttendanceHandler);

module.exports = router;
