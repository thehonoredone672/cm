const { z } = require("zod");

const updateProfileSchema = z.object({
  bio: z.string().optional(),

  githubUrl: z.string().optional(),

  linkedinUrl: z.string().optional(),

  educationType: z.string().optional(),

  schoolName: z.string().optional(),

  standard: z.number().optional(),

  college: z.string().optional(),

  department: z.string().optional(),

  academicYear: z.number().optional(),

  company: z.string().optional(),

  position: z.string().optional(),

  profession: z.string().optional(),
});

module.exports = {
  updateProfileSchema,
};