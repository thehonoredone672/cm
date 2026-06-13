const express =
  require("express");

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const {
  getMatchesHandler,
} = require(
  "./matches.controller"
);

const router =
  express.Router();

router.get(
  "/",
  protect,
  getMatchesHandler
);

module.exports = router;