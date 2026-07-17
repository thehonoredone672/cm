const { z } = require("zod");

const createSolutionSchema = z.object({
  problemId: z.string().uuid(),
  title: z.string().min(3).max(100),
  language: z.string(),
  approach: z.string().min(5),
  stepExplanation: z.string().min(5),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  code: z.string(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE")
});

const updateSolutionSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  language: z.string().optional(),
  approach: z.string().min(5).optional(),
  stepExplanation: z.string().min(5).optional(),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  code: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional()
});

module.exports = {
  createSolutionSchema,
  updateSolutionSchema
};
