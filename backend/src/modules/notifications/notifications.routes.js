const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getNotificationsHandler,
  markAllReadHandler,
  markReadHandler,
} = require("./notifications.controller");

const router = express.Router();

router.get("/", protect, getNotificationsHandler);
router.patch("/read", protect, markAllReadHandler);
router.patch("/:id/read", protect, markReadHandler);

module.exports = router;
