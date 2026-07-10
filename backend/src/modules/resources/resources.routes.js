const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const resourcesController = require("./resources.controller");

router.get("/", protect, resourcesController.getResourcesHandler);
router.post("/", protect, adminOnly, resourcesController.createResourceHandler);
router.post("/:id/bookmark", protect, resourcesController.toggleBookmarkHandler);

module.exports = router;
