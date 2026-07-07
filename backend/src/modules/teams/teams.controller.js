const {
  createTeam,
  getTeamsForUser,
  getTeamById,
  joinTeam,
  leaveTeam,
  removeMember,
  updateTeam,
} = require("./teams.service");

const createTeamHandler = async (req, res, next) => {
  try {
    const team = await createTeam(req.user.id, req.body);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

const getTeamsHandler = async (req, res, next) => {
  try {
    const teams = await getTeamsForUser(req.user.id);
    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
};

const getTeamDetailsHandler = async (req, res, next) => {
  try {
    const team = await getTeamById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

const joinTeamHandler = async (req, res, next) => {
  try {
    const teamMember = await joinTeam(req.user.id, req.body.joinCode);
    res.status(200).json({ success: true, message: "Joined team successfully", data: teamMember });
  } catch (err) {
    next(err);
  }
};

const leaveTeamHandler = async (req, res, next) => {
  try {
    await leaveTeam(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Left team successfully" });
  } catch (err) {
    next(err);
  }
};

const removeMemberHandler = async (req, res, next) => {
  try {
    await removeMember(req.user.id, req.params.id, req.params.userId);
    res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

const updateTeamHandler = async (req, res, next) => {
  try {
    const team = await updateTeam(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, message: "Team updated successfully", data: team });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTeamHandler,
  getTeamsHandler,
  getTeamDetailsHandler,
  joinTeamHandler,
  leaveTeamHandler,
  removeMemberHandler,
  updateTeamHandler,
};
