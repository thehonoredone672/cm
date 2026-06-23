const asyncHandler =
  require("../../utils/asyncHandler");

const {
  createConversation,
  getUserConversations,
  sendMessage,
  getMessages,
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

module.exports = {
  createConversationHandler,
  getConversationsHandler,
  sendMessageHandler,
  getMessagesHandler,
};