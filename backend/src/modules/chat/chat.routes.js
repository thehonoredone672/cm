"use strict";

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { createConversationSchema, sendMessageSchema } = require("./chat.validation");
const {
  createConversationHandler, getConversationsHandler, markSeenHandler,
  sendMessageHandler, getMessagesHandler, getTeammatesHandler, deleteMessageHandler,
  editMessageHandler, addReactionHandler, removeReactionHandler
} = require("./chat.controller");

router.get("/teammates", protect, getTeammatesHandler);
router.post("/conversation", protect, validate(createConversationSchema), createConversationHandler);
router.get("/conversation", protect, getConversationsHandler);
router.patch("/conversation/:id/seen", protect, markSeenHandler);

router.post("/message/:id", protect, validate(sendMessageSchema), sendMessageHandler);
router.get("/message/:id", protect, getMessagesHandler);
router.put("/message/:conversationId/:messageId", protect, editMessageHandler);
router.delete("/message/:conversationId/:messageId", protect, deleteMessageHandler);
router.post("/message/:conversationId/:messageId/reactions", protect, addReactionHandler);
router.delete("/message/:conversationId/:messageId/reactions", protect, removeReactionHandler);

module.exports = router;
