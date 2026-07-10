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
  const updateData = {
    name: data.name ?? undefined,
    bio: data.bio === "" ? null : (data.bio ?? undefined),
    profileImage: data.profileImage === "" ? null : (data.profileImage ?? undefined),
    githubUrl: data.githubUrl === "" ? null : (data.githubUrl ?? undefined),
    linkedinUrl: data.linkedinUrl === "" ? null : (data.linkedinUrl ?? undefined),
    educationType: data.educationType === "" ? null : (data.educationType ?? undefined),
    schoolName: data.schoolName === "" ? null : (data.schoolName ?? undefined),
    standard:
      data.standard === "" || data.standard === undefined || data.standard === null
        ? null
        : Number(data.standard),
    college: data.college === "" ? null : (data.college ?? undefined),
    department: data.department === "" ? null : (data.department ?? undefined),
    academicYear:
      data.academicYear === "" || data.academicYear === undefined || data.academicYear === null
        ? null
        : Number(data.academicYear),
    company: data.company === "" ? null : (data.company ?? undefined),
    position: data.position === "" ? null : (data.position ?? undefined),
    profession: data.profession === "" ? null : (data.profession ?? undefined),
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

const getPlatformAdmins = async () => {
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true }
  });
};

module.exports = {
  getCurrentUser,
  updateProfile,
  getAllUsers,
  getPlatformAdmins,
};