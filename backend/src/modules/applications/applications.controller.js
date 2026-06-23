const asyncHandler = require("../../utils/asyncHandler");

const {
  applyToTeamRequest,
  getMyApplications,
  getApplicationsForTeamRequest,
  updateApplicationStatus,
} = require("./applications.service");

const applyHandler = asyncHandler(
  async (req, res) => {
  const { teamRequestId } =
    req.body;

  const application =
    await applyToTeamRequest(
      req.user.id,
      teamRequestId
    );
res.status(201).json({
  success: true,
  data: application,
});
}
);

const myApplicationsHandler = asyncHandler(
  async (req, res) => {
    const applications =
      await getMyApplications(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: applications,
    });
  }
);

const teamApplicationsHandler = asyncHandler(
  async (req, res) => {
    const applications =
      await getApplicationsForTeamRequest(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: applications,
    });
  }
);

const updateStatusHandler = asyncHandler(
  async (req, res) => {
    const application =
      await updateApplicationStatus(
        req.params.id,
        req.body.status,
        req.user.id
        );

    res.status(200).json({
      success: true,
      data: application,
    });
  }
);

module.exports = {
  applyHandler,
  myApplicationsHandler,
  teamApplicationsHandler,
  updateStatusHandler,
};