const { z } = require("zod");

const exampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

const starterCodeSchema = z.object({
  javascript: z.string().optional(),
  python: z.string().optional(),
  cpp: z.string().optional(),
  java: z.string().optional(),
  c: z.string().optional(),
});

const testCaseInputSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isPublic: z.boolean().default(false),
});

const createProblemSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().min(5, "Description is too short"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).default([]),
  constraints: z.string().optional(),
  starterCode: starterCodeSchema,
  examples: z.array(exampleSchema).default([]),
  testCases: z.array(testCaseInputSchema).min(1, "At least one testcase is required"),
});

const updateProblemSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  category: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  tags: z.array(z.string()).optional(),
  constraints: z.string().optional(),
  starterCode: starterCodeSchema.optional(),
  examples: z.array(exampleSchema).optional(),
  testCases: z.array(testCaseInputSchema).optional(),
});

module.exports = {
  createProblemSchema,
  updateProblemSchema,
};
