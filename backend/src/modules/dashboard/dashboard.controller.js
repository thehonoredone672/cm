const { getDashboardStats, getSolvesLeaderboard } = require("./dashboard.service");

const getDashboardStatsHandler = async (req, res, next) => {
  try {
    const stats = await getDashboardStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

const getLeaderboardHandler = async (req, res, next) => {
  try {
    const list = await getSolvesLeaderboard();
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStatsHandler,
  getLeaderboardHandler,
};
