const { z } = require("zod");

const createConversationSchema = z.object({
  userId: z
    .string()
    .min(1, "userId is required"),
});

const sendMessageSchema = z.object({
  text: z
    .string()
    .min(1, "Message text cannot be empty")
    .max(4000),
});

module.exports = {
  createConversationSchema,
  sendMessageSchema,
};
