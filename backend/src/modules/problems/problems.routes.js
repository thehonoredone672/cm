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
} = require("./problems.controller");

const router = express.Router();

router.post("/", protect, validate(createProblemSchema), createProblemHandler);
router.get("/", protect, getProblemsHandler);
router.get("/:id", protect, getProblemByIdHandler);
router.put("/:id", protect, validate(updateProblemSchema), updateProblemHandler);
router.delete("/:id", protect, deleteProblemHandler);

module.exports = router;
