const careersService = require("./careers.service");

const getJobListingsHandler = async (req, res, next) => {
  try {
    const list = await careersService.getJobListings(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const createJobListingHandler = async (req, res, next) => {
  try {
    const job = await careersService.createJobListing(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

const applyOrSaveJobHandler = async (req, res, next) => {
  try {
    const status = req.body.status || "APPLIED";
    const app = await careersService.applyOrSaveJob(req.params.id, req.user.id, status);
    res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

const getApplicationTrackerHandler = async (req, res, next) => {
  try {
    const list = await careersService.getApplicationTracker(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobListingsHandler,
  createJobListingHandler,
  applyOrSaveJobHandler,
  getApplicationTrackerHandler
};
