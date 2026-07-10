const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const communityController = require("./community.controller");

router.get("/", protect, communityController.getPostsHandler);
router.post("/", protect, communityController.createPostHandler);
router.post("/:id/like", protect, communityController.toggleLikeHandler);
router.post("/:id/comments", protect, communityController.addCommentHandler);

module.exports = router;
