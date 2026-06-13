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

router.delete(
  "/user/:interestId",
  protect,
  removeInterestHandler
);

module.exports = router;