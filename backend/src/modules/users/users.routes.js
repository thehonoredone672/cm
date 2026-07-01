const express = require("express");

const { protect } = require("../../middleware/authMiddleware");

const {
  profile,
  updateCurrentUser,
  getUsers,
} = require("./users.controller");

const router = express.Router();

router.get("/profile", protect, profile);

router.get("/", protect, getUsers);

router.patch("/me", protect, updateCurrentUser);

module.exports = router;