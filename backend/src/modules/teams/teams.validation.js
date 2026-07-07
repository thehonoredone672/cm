const { z } = require("zod");

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().max(500).optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").optional(),
  description: z.string().max(500).optional(),
});

const joinTeamSchema = z.object({
  joinCode: z.string().min(1, "Join code is required"),
});

module.exports = {
  createTeamSchema,
  updateTeamSchema,
  joinTeamSchema,
};
