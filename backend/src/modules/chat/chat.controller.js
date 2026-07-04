const asyncHandler =
  require("../../utils/asyncHandler");

const {
  createConversation,
  getUserConversations,
  markAsRead,
  sendMessage,
  getMessages,
  getTeammates,
} = require("./chat.service");

const createConversationHandler =
  asyncHandler(
    async (req, res) => {
      const conversation =
        await createConversation(
          req.user.id,
          req.body.userId
        );

      res.status(201).json({
        success: true,
        data: conversation,
      });
    }
  );

const getConversationsHandler =
  asyncHandler(
    async (req, res) => {
      const conversations =
        await getUserConversations(
          req.user.id
        );

      res.status(200).json({
        success: true,
        data: conversations,
      });
    }
  );

const markSeenHandler =
  asyncHandler(
    async (req, res) => {
      const result =
        await markAsRead(
          req.params.id,
          req.user.id
        );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

const sendMessageHandler =
  asyncHandler(
    async (req, res) => {
      const message =
        await sendMessage(
          req.params.id,
          req.user.id,
          req.body.text
        );

      res.status(201).json({
        success: true,
        data: message,
      });
    }
  );

const getMessagesHandler =
  asyncHandler(
    async (req, res) => {
      const messages =
        await getMessages(
          req.params.id,
          req.user.id
        );

      res.status(200).json({
        success: true,
        data: messages,
      });
    }
  );

const getTeammatesHandler =
  asyncHandler(
    async (req, res) => {
      const teammates =
        await getTeammates(
          req.user.id
        );

      res.status(200).json({
        success: true,
        data: teammates,
      });
    }
  );

module.exports = {
  createConversationHandler,
  getConversationsHandler,
  markSeenHandler,
  sendMessageHandler,
  getMessagesHandler,
  getTeammatesHandler,
};
