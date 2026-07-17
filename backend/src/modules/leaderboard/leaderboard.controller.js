"use strict";

const {
  getGlobalLeaderboard,
  getUserProfileStatistics,
  syncUserStatsAndXP
} = require("./leaderboard.service");

const getGlobalLeaderboardHandler = async (req, res, next) => {
  try {
    const data = await getGlobalLeaderboard(req.query);
    res.status(200).json({ success: true, data: data.leaderboard, pagination: data.pagination });
  } catch (err) {
    next(err);
  }
};

const getUserProfileStatisticsHandler = async (req, res, next) => {
  try {
    const stats = await getUserProfileStatistics(req.user.id);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

const syncUserXPHandler = async (req, res, next) => {
  try {
    const synced = await syncUserStatsAndXP(req.user.id);
    res.status(200).json({ success: true, data: synced });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGlobalLeaderboardHandler,
  getUserProfileStatisticsHandler,
  syncUserXPHandler
};
