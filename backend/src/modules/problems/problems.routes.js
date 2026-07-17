const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { createProblemSchema, updateProblemSchema } = require("./problems.validation");
const {
  createProblemHandler,
  getProblemsHandler,
  getProblemByIdHandler,
  updateProblemHandler,
  deleteProblemHandler,
  toggleBookmarkHandler,
  toggleLikeHandler,
  getProblemsStatisticsHandler,
  createProblemDiscussionHandler,
  getProblemDiscussionsHandler,
  createProblemReportHandler,
  getProblemEditorialHandler
} = require("./problems.controller");

const router = express.Router();

router.post("/", protect, validate(createProblemSchema), createProblemHandler);
router.get("/", protect, getProblemsHandler);
router.get("/statistics", protect, getProblemsStatisticsHandler);
router.get("/:id", protect, getProblemByIdHandler);
router.put("/:id", protect, validate(updateProblemSchema), updateProblemHandler);
router.delete("/:id", protect, deleteProblemHandler);
router.post("/:id/bookmark", protect, toggleBookmarkHandler);
router.post("/:id/like", protect, toggleLikeHandler);

router.post("/:id/discussions", protect, createProblemDiscussionHandler);
router.get("/:id/discussions", protect, getProblemDiscussionsHandler);
router.post("/:id/reports", protect, createProblemReportHandler);
router.get("/:id/editorial", protect, getProblemEditorialHandler);

module.exports = router;
