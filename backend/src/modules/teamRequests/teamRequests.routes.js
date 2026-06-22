const express =
  require("express");

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const {
  createTeamRequestHandler,
  getTeamRequestsHandler,
  getMyTeamRequestsHandler,
  getTeamRequestHandler,
} = require(
  "./teamRequests.controller"
);

const router =
  express.Router();

router.post(
  "/",
  protect,
  createTeamRequestHandler
);

router.get(
  "/",
  protect,
  getTeamRequestsHandler
);

router.get(
  "/my",
  protect,
  getMyTeamRequestsHandler
);

router.get(
  "/:id",
  protect,
  getTeamRequestHandler
);

module.exports = router;