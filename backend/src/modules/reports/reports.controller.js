const reportsService = require("./reports.service");

const createReport = async (req, res, next) => {
  try {
    const report = await reportsService.fileReport(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Report filed successfully. Administrators will review it.",
      data: report
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReport
};
