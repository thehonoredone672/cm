const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const reportsController = require("./reports.controller");

router.post("/", protect, reportsController.createReport);

module.exports = router;
