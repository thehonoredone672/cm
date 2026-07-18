const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { updatePreferencesSchema } = require("./notifications.validation");
const {
  getNotificationsHandler,
  markAllReadHandler,
  markReadHandler,
  deleteNotificationHandler,
  deleteAllNotificationsHandler,
  getNotificationPreferencesHandler,
  updateNotificationPreferencesHandler,
} = require("./notifications.controller");

const router = express.Router();

router.get("/", protect, getNotificationsHandler);
router.patch("/read", protect, markAllReadHandler);
router.patch("/:id/read", protect, markReadHandler);

router.delete("/", protect, deleteAllNotificationsHandler);
router.delete("/:id", protect, deleteNotificationHandler);

router.get("/preferences", protect, getNotificationPreferencesHandler);
router.put("/preferences", protect, validate(updatePreferencesSchema), updateNotificationPreferencesHandler);

module.exports = router;
