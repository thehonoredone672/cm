const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const careersController = require("./careers.controller");

router.get("/", protect, careersController.getJobListingsHandler);
router.post("/", protect, adminOnly, careersController.createJobListingHandler);
router.post("/:id/apply", protect, careersController.applyOrSaveJobHandler);
router.get("/tracker", protect, careersController.getApplicationTrackerHandler);

module.exports = router;
