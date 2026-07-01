const {
  updateProfile,
  getAllUsers,
} = require("./users.service");

const updateCurrentUser = async (req, res) => {
  const user = await updateProfile(
    req.user.id,
    req.body
  );

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

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

module.exports = {
  updateCurrentUser,
  getUsers,
  getCurrentUser,
};