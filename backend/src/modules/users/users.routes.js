const express = require("express");

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const {
  updateCurrentUser,
  getUsers,
} = require(
  "./users.controller"
);

const router =
  express.Router();

router.get(
  "/",
  protect,
  getUsers
);

router.patch(
  "/me",
  protect,
  updateCurrentUser
);

module.exports = router;