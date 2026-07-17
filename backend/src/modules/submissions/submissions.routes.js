const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  runCodeHandler,
  runCustomTestCaseHandler,
  submitCodeHandler,
  getProblemSubmissionsHandler,
  getLatestSubmissionsHandler,
  getCodeDraftHandler,
  saveCodeDraftHandler,
  getEditorSettingsHandler,
  saveEditorSettingsHandler,
  getLanguagePreferenceHandler,
  saveLanguagePreferenceHandler,
  getUserSubmissionsHandler,
  getSubmissionDetailHandler,
  getSubmissionsStatisticsHandler
} = require("./submissions.controller");

const router = express.Router();

router.post("/run", protect, runCodeHandler);
router.post("/run-custom", protect, runCustomTestCaseHandler);
router.post("/submit", protect, submitCodeHandler);
router.get("/latest", protect, getLatestSubmissionsHandler);
router.get("/problem/:problemId", protect, getProblemSubmissionsHandler);

router.get("/draft", protect, getCodeDraftHandler);
router.post("/draft", protect, saveCodeDraftHandler);

router.get("/settings", protect, getEditorSettingsHandler);
router.post("/settings", protect, saveEditorSettingsHandler);

router.get("/pref", protect, getLanguagePreferenceHandler);
router.post("/pref", protect, saveLanguagePreferenceHandler);

router.get("/", protect, getUserSubmissionsHandler);
router.get("/stats", protect, getSubmissionsStatisticsHandler);
router.get("/:id", protect, getSubmissionDetailHandler);

module.exports = router;
