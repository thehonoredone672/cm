const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const collegesController = require("./colleges.controller");

router.get("/", protect, collegesController.getCollegesHandler);
router.post("/register", protect, adminOnly, collegesController.registerCollegeHandler);
router.get("/:id/analytics", protect, collegesController.getCollegeAnalyticsHandler);

module.exports = router;
