const { z } = require("zod");

const updatePreferencesSchema = z.object({
  chat: z.boolean().optional(),
  teams: z.boolean().optional(),
  contests: z.boolean().optional(),
  problems: z.boolean().optional(),
  leaderboard: z.boolean().optional(),
  announcements: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

module.exports = {
  updatePreferencesSchema,
};
