const {
  createTeamRequest,
  getAllTeamRequests,
  getMyTeamRequests,
  getTeamRequestById,
} = require("./teamRequests.service");

const createTeamRequestHandler =
  async (req, res) => {
    const teamRequest =
      await createTeamRequest(
        req.user.id,
        req.body
      );

    res.status(201).json({
      success: true,
      data: teamRequest,
    });
  };

const getTeamRequestsHandler =
  async (req, res) => {
    const requests =
      await getAllTeamRequests();

    res.status(200).json({
      success: true,
      data: requests,
    });
  };

const getMyTeamRequestsHandler =
  async (req, res) => {
    const requests =
      await getMyTeamRequests(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: requests,
    });
  };

const getTeamRequestHandler =
  async (req, res) => {
    const request =
      await getTeamRequestById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Team request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  };

module.exports = {
  createTeamRequestHandler,
  getTeamRequestsHandler,
  getMyTeamRequestsHandler,
  getTeamRequestHandler,
};