"use strict";

const { registerUser, loginUser } = require("./auth.service");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    // Pass to global error handler so it returns proper JSON (not HTML 500)
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    // "Invalid credentials" should be a 401, not a 500
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { password, ...safeUser } = req.user;
    res.status(200).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };