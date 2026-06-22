const express =
  require("express");

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const {
  applyHandler,
  myApplicationsHandler,
  teamApplicationsHandler,
  updateStatusHandler,
} = require(
  "./applications.controller"
);

const router =
  express.Router();

router.post(
  "/",
  protect,
  applyHandler
);

router.get(
  "/my",
  protect,
  myApplicationsHandler
);

router.get(
  "/team/:id",
  protect,
  teamApplicationsHandler
);

router.patch(
  "/:id",
  protect,
  updateStatusHandler
);

module.exports = router;