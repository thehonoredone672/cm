const collegesService = require("./colleges.service");

const getCollegesHandler = async (req, res, next) => {
  try {
    const list = await collegesService.getColleges();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const registerCollegeHandler = async (req, res, next) => {
  try {
    const college = await collegesService.registerCollege(req.body.name, req.body.domain);
    res.status(201).json({ success: true, data: college });
  } catch (err) {
    next(err);
  }
};

const getCollegeAnalyticsHandler = async (req, res, next) => {
  try {
    const stats = await collegesService.getCollegeAnalytics(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCollegesHandler,
  registerCollegeHandler,
  getCollegeAnalyticsHandler
};
