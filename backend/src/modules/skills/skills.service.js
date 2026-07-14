const prisma = require("../../config/prisma");

const createSkill = async (name) => {
  const existingSkill =
    await prisma.skill.findUnique({
      where: {
        name,
      },
    });

  if (existingSkill) {
    return existingSkill;
  }

  return prisma.skill.create({
    data: {
      name,
    },
  });
};

const getAllSkills = async () => {
  return prisma.skill.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

const addSkillToUser = async (
  userId,
  skillId,
  { proficiency = "INTERMEDIATE", yearsOfExperience = 0 } = {}
) => {
  const skill =
    await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
    });

  if (!skill) {
    throw new Error("Skill not found");
  }

  const existing =
    await prisma.userSkill.findFirst({
      where: {
        userId,
        skillId,
      },
    });

  if (existing) {
    throw new Error(
      "Skill already added"
    );
  }

  return prisma.userSkill.create({
    data: {
      userId,
      skillId,
      proficiency,
      yearsOfExperience: Number(yearsOfExperience),
    },
  });
};

const updateUserSkill = async (userId, skillId, { proficiency, yearsOfExperience } = {}) => {
  const existing = await prisma.userSkill.findFirst({
    where: { userId, skillId }
  });
  if (!existing) {
    throw new Error("User skill association not found");
  }

  return prisma.userSkill.update({
    where: { id: existing.id },
    data: {
      proficiency: proficiency !== undefined ? proficiency : undefined,
      yearsOfExperience: yearsOfExperience !== undefined ? Number(yearsOfExperience) : undefined
    }
  });
};

const getUserSkills = async (
  userId
) => {
  return prisma.userSkill.findMany({
    where: {
      userId,
    },

    include: {
      skill: true,
    },
  });
};

const removeSkillFromUser = async (
  userId,
  skillId
) => {
  return prisma.userSkill.deleteMany({
    where: {
      userId,
      skillId,
    },
  });
};

module.exports = {
  createSkill,
  getAllSkills,
  addSkillToUser,
  getUserSkills,
  removeSkillFromUser,
  updateUserSkill
};