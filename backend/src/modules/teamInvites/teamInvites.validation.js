const { z } = require("zod");

const sendInviteSchema = z.object({
  receiverId: z
    .string()
    .min(1, "receiverId is required"),

  message: z
    .string()
    .max(1000)
    .optional(),
});

module.exports = {
  sendInviteSchema,
};
