const express =
  require("express");

const router =
  express.Router();

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const {
  createConversationHandler,
  getConversationsHandler,
  sendMessageHandler,
  getMessagesHandler,
} = require("./chat.controller");

router.post(
  "/conversation",
  protect,
  createConversationHandler
);

router.get(
  "/conversation",
  protect,
  getConversationsHandler
);

router.post(
  "/message/:id",
  protect,
  sendMessageHandler
);

router.get(
  "/message/:id",
  protect,
  getMessagesHandler
);

module.exports = router;