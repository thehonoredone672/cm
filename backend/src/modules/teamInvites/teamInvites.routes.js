const express = require("express");

const {
  protect,
} = require("../../middleware/authMiddleware");

const validate = require("../../middleware/validate");

const {
  sendInviteSchema,
} = require("./teamInvites.validation");

const {
  sendInviteHandler,
  getSentInvitesHandler,
  getReceivedInvitesHandler,
  acceptInviteHandler,
  rejectInviteHandler,
} = require("./teamInvites.controller");

const router = express.Router();

router.post(
  "/",
  protect,
  validate(sendInviteSchema),
  sendInviteHandler
);

router.get(
  "/sent",
  protect,
  getSentInvitesHandler
);

router.get(
  "/received",
  protect,
  getReceivedInvitesHandler
);

router.patch(
  "/:id/accept",
  protect,
  acceptInviteHandler
);

router.patch(
  "/:id/reject",
  protect,
  rejectInviteHandler
);

module.exports = router;