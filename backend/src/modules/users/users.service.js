const prisma = require("../../config/prisma");

const updateProfile = async (
  userId,
  data
) => {
  const user =
    await prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });

  const {
    password,
    ...safeUser
  } = user;

  return safeUser;
};

const getAllUsers = async () => {
  const users =
    await prisma.user.findMany({
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

  return users.map(
    ({
      password,
      ...user
    }) => user
  );
};

module.exports = {
  updateProfile,
  getAllUsers,
};