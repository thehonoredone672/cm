const communityService = require("./community.service");

const getPostsHandler = async (req, res, next) => {
  try {
    const posts = await communityService.getPosts();
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

const createPostHandler = async (req, res, next) => {
  try {
    const post = await communityService.createPost(req.user.id, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

const toggleLikeHandler = async (req, res, next) => {
  try {
    const result = await communityService.toggleLike(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const addCommentHandler = async (req, res, next) => {
  try {
    const comment = await communityService.addComment(req.params.id, req.user.id, req.body.content);
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPostsHandler,
  createPostHandler,
  toggleLikeHandler,
  addCommentHandler
};
