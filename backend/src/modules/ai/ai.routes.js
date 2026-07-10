const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const aiController = require("./ai.controller");

router.get("/resume-audit", protect, aiController.auditResumeHandler);
router.get("/team-recommendation", protect, aiController.getTeamRecommendationHandler);
router.post("/explain-code", protect, aiController.explainCodeHandler);

module.exports = router;
