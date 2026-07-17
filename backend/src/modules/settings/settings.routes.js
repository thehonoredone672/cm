const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getSettingsProfileHandler,
  updateSettingsProfileHandler,
  getSettingsPreferencesHandler,
  updateSettingsPreferencesHandler,
  getSettingsPrivacyHandler,
  updateSettingsPrivacyHandler,
  getActiveSessionsHandler,
  terminateActiveSessionHandler,
  getLoginHistoryHandler,
  deleteUserAccountHandler
} = require("./settings.controller");

const router = express.Router();

router.get("/profile", protect, getSettingsProfileHandler);
router.put("/profile", protect, updateSettingsProfileHandler);

router.get("/preferences", protect, getSettingsPreferencesHandler);
router.put("/preferences", protect, updateSettingsPreferencesHandler);

router.get("/privacy", protect, getSettingsPrivacyHandler);
router.put("/privacy", protect, updateSettingsPrivacyHandler);

router.get("/sessions", protect, getActiveSessionsHandler);
router.delete("/sessions/:id", protect, terminateActiveSessionHandler);

router.get("/login-history", protect, getLoginHistoryHandler);

router.delete("/danger/delete", protect, deleteUserAccountHandler);

module.exports = router;
