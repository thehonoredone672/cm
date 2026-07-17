const { z } = require("zod");

const createContestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(5),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum(["PRACTICE", "PUBLIC", "PRIVATE", "COLLEGE", "HACKATHON", "RECRUITMENT"]).default("PUBLIC"),
  problems: z.array(
    z.object({
      problemId: z.string().uuid(),
      points: z.number().default(100),
      order: z.number().default(0)
    })
  ).default([])
});

const updateContestSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(5).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(["PRACTICE", "PUBLIC", "PRIVATE", "COLLEGE", "HACKATHON", "RECRUITMENT"]).optional(),
  problems: z.array(
    z.object({
      problemId: z.string().uuid(),
      points: z.number().default(100),
      order: z.number().default(0)
    })
  ).optional()
});

const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(5)
});

module.exports = {
  createContestSchema,
  updateContestSchema,
  createAnnouncementSchema
};
