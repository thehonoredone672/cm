const express = require("express");

const {
  protect,
} = require("../../middleware/authMiddleware");

const {
  updateCurrentUser,
  getUsers,
  getCurrentUser,
} = require("./users.controller");

const router = express.Router();

router.get(
  "/",
  protect,
  getUsers
);

router.get(
  "/profile",
  protect,
  getCurrentUser
);

router.patch(
  "/me",
  protect,
  updateCurrentUser
);

module.exports = router;