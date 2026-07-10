const resourcesService = require("./resources.service");

const getResourcesHandler = async (req, res, next) => {
  try {
    const list = await resourcesService.getResources(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const createResourceHandler = async (req, res, next) => {
  try {
    const item = await resourcesService.createResource(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const toggleBookmarkHandler = async (req, res, next) => {
  try {
    const result = await resourcesService.toggleBookmark(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResourcesHandler,
  createResourceHandler,
  toggleBookmarkHandler
};
