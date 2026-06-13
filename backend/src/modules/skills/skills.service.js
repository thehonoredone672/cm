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
  skillId
) => {
  const skill =
    await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
    });

  if (!skill) {
    throw new Error(
      "Skill not found"
    );
  }

  return prisma.userSkill.create({
    data: {
      userId,
      skillId,
    },
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
};