const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  createProjectHandler,
  getProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  deleteProjectHandler,
} = require("./projects.controller");

const router = express.Router();

router.post("/", protect, createProjectHandler);
router.get("/", protect, getProjectsHandler);
router.get("/:id", protect, getProjectByIdHandler);
router.put("/:id", protect, updateProjectHandler);
router.delete("/:id", protect, deleteProjectHandler);

module.exports = router;
