"use strict";

const {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  toggleBookmark,
  toggleLike,
  getProblemsStatistics,
  createProblemDiscussion,
  getProblemDiscussions,
  createProblemReport,
  getProblemEditorial
} = require("./problems.service");

const createProblemHandler = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const problem = await createProblem(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

const getProblemsHandler = async (req, res, next) => {
  try {
    const { problems, pagination } = await getAllProblems(req.user.role, req.user.id, req.query);
    res.status(200).json({ success: true, data: problems, pagination });
  } catch (err) {
    next(err);
  }
};

const getProblemByIdHandler = async (req, res, next) => {
  try {
    const problem = await getProblemById(req.params.id, req.user.role, req.user.id);
    res.status(200).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

const updateProblemHandler = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const problem = await updateProblem(req.params.id, req.body);
    res.status(200).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

const deleteProblemHandler = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await deleteProblem(req.params.id);
    res.status(200).json({ success: true, message: "Problem deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const toggleBookmarkHandler = async (req, res, next) => {
  try {
    const result = await toggleBookmark(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const toggleLikeHandler = async (req, res, next) => {
  try {
    const { value } = req.body;
    const result = await toggleLike(req.params.id, req.user.id, value);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getProblemsStatisticsHandler = async (req, res, next) => {
  try {
    const statistics = await getProblemsStatistics(req.user.id);
    res.status(200).json({ success: true, data: statistics });
  } catch (err) {
    next(err);
  }
};

const createProblemDiscussionHandler = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const discussion = await createProblemDiscussion(req.params.id, req.user.id, title, content);
    res.status(201).json({ success: true, data: discussion });
  } catch (err) {
    next(err);
  }
};

const getProblemDiscussionsHandler = async (req, res, next) => {
  try {
    const discussions = await getProblemDiscussions(req.params.id);
    res.status(200).json({ success: true, data: discussions });
  } catch (err) {
    next(err);
  }
};

const createProblemReportHandler = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const report = await createProblemReport(req.params.id, req.user.id, reason);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

const getProblemEditorialHandler = async (req, res, next) => {
  try {
    const editorial = await getProblemEditorial(req.params.id);
    res.status(200).json({ success: true, data: editorial });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
