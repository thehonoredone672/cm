const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { createSolutionSchema, updateSolutionSchema } = require("./solutions.validation");
const {
  createSolutionHandler,
  updateSolutionHandler,
  deleteSolutionHandler,
  getSolutionsForProblemHandler,
  getSolutionByIdHandler,
  publishSolutionHandler,
  hideSolutionHandler
} = require("./solutions.controller");

const router = express.Router();

router.post("/", protect, validate(createSolutionSchema), createSolutionHandler);
router.put("/:id", protect, validate(updateSolutionSchema), updateSolutionHandler);
router.delete("/:id", protect, deleteSolutionHandler);
router.get("/", protect, getSolutionsForProblemHandler);
router.get("/:id", protect, getSolutionByIdHandler);
router.post("/:id/publish", protect, publishSolutionHandler);
router.post("/:id/hide", protect, hideSolutionHandler);

module.exports = router;
