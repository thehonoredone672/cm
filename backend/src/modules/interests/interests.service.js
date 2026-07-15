const prisma = require("../../config/prisma");

const createInterest = async (name, category = "Programming") => {
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
      category,
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
  interestId,
  matchingWeight = 1
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
      matchingWeight: Number(matchingWeight),
    },
  });
};

const updateUserInterest = async (userId, interestId, matchingWeight) => {
  const existing = await prisma.userInterest.findFirst({
    where: { userId, interestId }
  });
  if (!existing) {
    throw new Error("User interest association not found");
  }

  return prisma.userInterest.update({
    where: { id: existing.id },
    data: {
      matchingWeight: Number(matchingWeight)
    }
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
  updateUserInterest
};