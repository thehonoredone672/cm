"use strict";

const {
  createSolution,
  updateSolution,
  deleteSolution,
  getSolutionsForProblem,
  getSolutionById,
  setSolutionVisibility
} = require("./solutions.service");

const checkAdmin = (req, res) => {
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Forbidden: Admin access only." });
    return false;
  }
  return true;
};

const createSolutionHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    const solution = await createSolution(req.user.id, req.body);
    res.status(201).json({ success: true, data: solution });
  } catch (err) {
    next(err);
  }
};

const updateSolutionHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    const solution = await updateSolution(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: solution });
  } catch (err) {
    next(err);
  }
};

const deleteSolutionHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    await deleteSolution(req.params.id);
    res.status(200).json({ success: true, message: "Solution deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const getSolutionsForProblemHandler = async (req, res, next) => {
  try {
    const { problemId } = req.query;
    if (!problemId) {
      return res.status(400).json({ success: false, message: "problemId query parameter is required." });
    }
    const solutions = await getSolutionsForProblem(problemId, req.user.role, req.user.id);
    res.status(200).json({ success: true, data: solutions });
  } catch (err) {
    next(err);
  }
};

const getSolutionByIdHandler = async (req, res, next) => {
  try {
    const solution = await getSolutionById(req.params.id, req.user.role, req.user.id);
    res.status(200).json({ success: true, data: solution });
  } catch (err) {
    next(err);
  }
};

const publishSolutionHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    const solution = await setSolutionVisibility(req.params.id, "PUBLIC");
    res.status(200).json({ success: true, data: solution });
  } catch (err) {
    next(err);
  }
};

const hideSolutionHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    const solution = await setSolutionVisibility(req.params.id, "PRIVATE");
    res.status(200).json({ success: true, data: solution });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSolutionHandler,
  updateSolutionHandler,
  deleteSolutionHandler,
  getSolutionsForProblemHandler,
  getSolutionByIdHandler,
  publishSolutionHandler,
  hideSolutionHandler
};
