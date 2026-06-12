const {
  registerUser,
  loginUser,
} = require("./auth.service");

const register =
  async (req, res) => {
    const {
      name,
      email,
      password,
    } = req.body;

    const result =
      await registerUser(
        name,
        email,
        password
      );

    res.status(201).json({
      success: true,
      data: result,
    });
  };

const login =
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    const result =
      await loginUser(
        email,
        password
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  };

const getMe = async (
  req,
  res
) => {
  const {
    password,
    ...safeUser
  } = req.user;

  res.status(200).json({
    success: true,
    data: safeUser,
  });
};

module.exports = {
  register,
  login,
  getMe,
};