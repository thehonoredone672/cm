const { z } = require("zod");

const createConversationSchema = z.object({
  userId: z
    .string()
    .min(1, "userId is required"),
});

const sendMessageSchema = z.object({
  text: z
    .string()
    .max(4000)
    .optional(),
  fileUrl: z
    .string()
    .optional(),
  fileType: z
    .string()
    .optional(),
  codeLanguage: z
    .string()
    .optional()
});

module.exports = {
  createConversationSchema,
  sendMessageSchema,
};
