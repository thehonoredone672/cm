const { getDashboardStats } = require("./dashboard.service");

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

module.exports = {
  getDashboardStatsHandler,
};
