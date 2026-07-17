"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const {
  createConversation, getUserConversations,
  markAsRead, sendMessage, getMessages,
  getTeammates, deleteMessage, editMessage,
  pinMessage, addReaction, removeReaction,
  pinConversation
} = require("./chat.service");

const createConversationHandler = asyncHandler(async (req, res) => {
  const conversation = await createConversation(req.user.id, req.body.userId);
  res.status(201).json({ success: true, data: conversation });
});

const getConversationsHandler = asyncHandler(async (req, res) => {
  const conversations = await getUserConversations(req.user.id);
  res.status(200).json({ success: true, data: conversations });
});

const pinConversationHandler = asyncHandler(async (req, res) => {
  const { isPinned } = req.body;
  const result = await pinConversation(req.user.id, req.params.id, isPinned);
  res.status(200).json({ success: true, data: result });
});

const markSeenHandler = asyncHandler(async (req, res) => {
  const result = await markAsRead(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: result });
});

const sendMessageHandler = asyncHandler(async (req, res) => {
  const { text, fileUrl, fileType, codeLanguage } = req.body;
  const message = await sendMessage(req.params.id, req.user.id, text, fileUrl, fileType, codeLanguage);
  res.status(201).json({ success: true, data: message });
});

const getMessagesHandler = asyncHandler(async (req, res) => {
  const { limit, before } = req.query;
  const messages = await getMessages(req.params.id, req.user.id, { limit, before });
  res.status(200).json({ success: true, data: messages });
});

const getTeammatesHandler = asyncHandler(async (req, res) => {
  const teammates = await getTeammates(req.user.id);
  res.status(200).json({ success: true, data: teammates });
});

const editMessageHandler = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const message = await editMessage(req.params.messageId, req.user.id, text);
  res.status(200).json({ success: true, data: message });
});

const deleteMessageHandler = asyncHandler(async (req, res) => {
  const result = await deleteMessage(req.params.messageId, req.user.id);
  res.status(200).json({ success: true, data: result });
});

const pinMessageHandler = asyncHandler(async (req, res) => {
  const { isPinned } = req.body;
  const message = await pinMessage(req.params.messageId, req.user.id, isPinned);
  res.status(200).json({ success: true, data: message });
});

const addReactionHandler = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const reaction = await addReaction(req.params.messageId, req.user.id, emoji);
  res.status(201).json({ success: true, data: reaction });
});

const removeReactionHandler = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const result = await removeReaction(req.params.messageId, req.user.id, emoji);
  res.status(200).json({ success: true, data: result });
});

module.exports = {
  createConversationHandler, getConversationsHandler,
  markSeenHandler, sendMessageHandler, getMessagesHandler,
  getTeammatesHandler, deleteMessageHandler, editMessageHandler,
  pinMessageHandler, addReactionHandler, removeReactionHandler,
  pinConversationHandler
};
