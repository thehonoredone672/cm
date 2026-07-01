const prisma = require("../../config/prisma");

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      interests: {
        include: {
          interest: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password, ...safeUser } = user;

  return safeUser;
};

const updateProfile = async (userId, data) => {
  // Only include fields that actually exist in your Prisma User model
  const updateData = {
    name: data.name ?? undefined,
    bio: data.bio ?? null,
    college: data.college ?? null,
    department: data.department ?? null,
    academicYear:
      data.academicYear === "" ||
      data.academicYear === undefined ||
      data.academicYear === null
        ? null
        : Number(data.academicYear),
  };

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });

  const { password, ...safeUser } = user;

  return safeUser;
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      interests: {
        include: {
          interest: true,
        },
      },
    },
  });

  return users.map(({ password, ...user }) => user);
};

module.exports = {
  getCurrentUser,
  updateProfile,
  getAllUsers,
};