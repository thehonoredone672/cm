const express =
  require("express");

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const {
  createInterestHandler,
  getInterestsHandler,
  addInterestHandler,
  getUserInterestsHandler,
  removeInterestHandler,
  updateInterestHandler,
} = require(
  "./interests.controller"
);

const router =
  express.Router();

router.post(
  "/",
  createInterestHandler
);

router.get(
  "/",
  getInterestsHandler
);

router.post(
  "/user",
  protect,
  addInterestHandler
);

router.get(
  "/user",
  protect,
  getUserInterestsHandler
);

router.patch(
  "/user/:interestId",
  protect,
  updateInterestHandler
);

router.delete(
  "/user/:interestId",
  protect,
  removeInterestHandler
);

module.exports = router;