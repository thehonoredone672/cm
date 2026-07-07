const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { runCodeHandler, submitCodeHandler, getProblemSubmissionsHandler } = require("./submissions.controller");

const router = express.Router();

router.post("/run", protect, runCodeHandler);
router.post("/submit", protect, submitCodeHandler);
router.get("/problem/:problemId", protect, getProblemSubmissionsHandler);

module.exports = router;
