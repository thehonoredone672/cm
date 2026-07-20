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
    .nullable()
    .optional(),
  fileUrl: z
    .string()
    .nullable()
    .optional(),
  fileType: z
    .string()
    .nullable()
    .optional(),
  codeLanguage: z
    .string()
    .nullable()
    .optional()
});

module.exports = {
  createConversationSchema,
  sendMessageSchema,
};
