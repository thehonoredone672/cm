const {
  getCurrentUser,
  updateProfile,
  getAllUsers,
} = require("./users.service");

const profile = async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

const updateCurrentUser = async (req, res) => {
  const user = await updateProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
};

const getUsers = async (req, res) => {
  const users = await getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
};

const { getPlatformAdmins } = require("./users.service");

const getAdminsHandler = async (req, res, next) => {
  try {
    const admins = await getPlatformAdmins();
    res.status(200).json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  profile,
  updateCurrentUser,
  getUsers,
  getAdminsHandler,
};