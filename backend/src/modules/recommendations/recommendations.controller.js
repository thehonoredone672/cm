"use strict";

const {
  getRecommendedTeams,
  getRecommendedProblems,
} = require("./recommendations.service");

const getRecommendedTeamsHandler = async (req, res, next) => {
  try {
    const teams = await getRecommendedTeams(req.user.id);
    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
};

const getRecommendedProblemsHandler = async (req, res, next) => {
  try {
    const problems = await getRecommendedProblems(req.user.id);
    res.status(200).json({ success: true, data: problems });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecommendedTeamsHandler,
  getRecommendedProblemsHandler,
};
