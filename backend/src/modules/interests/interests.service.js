const prisma = require("../../config/prisma");

const createInterest = async (name) => {
  const existingInterest =
    await prisma.interest.findUnique({
      where: {
        name,
      },
    });

  if (existingInterest) {
    return existingInterest;
  }

  return prisma.interest.create({
    data: {
      name,
    },
  });
};

const getAllInterests = async () => {
  return prisma.interest.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

const addInterestToUser = async (
  userId,
  interestId
) => {
  const interest =
    await prisma.interest.findUnique({
      where: {
        id: interestId,
      },
    });

  if (!interest) {
    throw new Error("Interest not found");
  }

  const existing =
    await prisma.userInterest.findFirst({
      where: {
        userId,
        interestId,
      },
    });

  if (existing) {
    throw new Error(
      "Interest already added"
    );
  }

  return prisma.userInterest.create({
    data: {
      userId,
      interestId,
    },
  });
};

const getUserInterests =
  async (userId) => {
    return prisma.userInterest.findMany({
      where: {
        userId,
      },

      include: {
        interest: true,
      },
    });
  };

const removeInterestFromUser =
  async (
    userId,
    interestId
  ) => {
    return prisma.userInterest.deleteMany({
      where: {
        userId,
        interestId,
      },
    });
  };

module.exports = {
  createInterest,
  getAllInterests,
  addInterestToUser,
  getUserInterests,
  removeInterestFromUser,
};