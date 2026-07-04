const express =
  require("express");

const router =
  express.Router();

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const validate =
  require("../../middleware/validate");

const {
  createConversationSchema,
  sendMessageSchema,
} = require("./chat.validation");

const {
  createConversationHandler,
  getConversationsHandler,
  markSeenHandler,
  sendMessageHandler,
  getMessagesHandler,
  getTeammatesHandler,
} = require("./chat.controller");

router.get(
  "/teammates",
  protect,
  getTeammatesHandler
);

router.post(
  "/conversation",
  protect,
  validate(createConversationSchema),
  createConversationHandler
);

router.get(
  "/conversation",
  protect,
  getConversationsHandler
);

router.patch(
  "/conversation/:id/seen",
  protect,
  markSeenHandler
);

router.post(
  "/message/:id",
  protect,
  validate(sendMessageSchema),
  sendMessageHandler
);

router.get(
  "/message/:id",
  protect,
  getMessagesHandler
);

module.exports = router;
