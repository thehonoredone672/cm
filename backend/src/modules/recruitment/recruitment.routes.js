const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const recruitmentController = require("./recruitment.controller");

router.get("/drives", protect, recruitmentController.getRecruitmentDrivesHandler);
router.post("/company", protect, recruitmentController.registerCompanyHandler);
router.post("/drives", protect, recruitmentController.createRecruitmentDriveHandler);
router.post("/drives/:id/apply", protect, recruitmentController.applyToRecruitmentDriveHandler);
router.patch("/applications/:id", protect, recruitmentController.advanceCandidateStatusHandler);

module.exports = router;
