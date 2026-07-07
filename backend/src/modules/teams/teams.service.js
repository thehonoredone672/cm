const prisma = require("../../config/prisma");

const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createTeam = async (userId, data) => {
  let joinCode = generateJoinCode();
  let codeExists = await prisma.team.findUnique({ where: { joinCode } });
  while (codeExists) {
    joinCode = generateJoinCode();
    codeExists = await prisma.team.findUnique({ where: { joinCode } });
  }

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: data.name,
        description: data.description || null,
        joinCode,
        leaderId: userId,
      },
    });

    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId,
      },
    });

    return team;
  });
};

const getTeamsForUser = async (userId) => {
  return prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getTeamById = async (id, userId) => {
  const member = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId,
    },
  });

  if (!member) {
    throw new Error("You are not a member of this team");
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  return team;
};

const joinTeam = async (userId, joinCode) => {
  const team = await prisma.team.findUnique({
    where: { joinCode },
  });

  if (!team) {
    throw new Error("Invalid join code");
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId,
      },
    },
  });

  if (existingMember) {
    throw new Error("You are already a member of this team");
  }

  return prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId,
    },
    include: {
      team: true,
    },
  });
};

const leaveTeam = async (userId, teamId) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.leaderId === userId) {
    throw new Error("The team leader cannot leave the team. You must delete the team or transfer leadership.");
  }

  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });
};

const removeMember = async (leaderId, teamId, userId) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.leaderId !== leaderId) {
    throw new Error("Only the team leader can remove members");
  }

  if (userId === leaderId) {
    throw new Error("You cannot remove yourself. Leave or delete the team.");
  }

  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("User is not a member of this team");
  }

  return prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });
};

const updateTeam = async (leaderId, teamId, data) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.leaderId !== leaderId) {
    throw new Error("Only the team leader can update team settings");
  }

  return prisma.team.update({
    where: { id: teamId },
    data: {
      name: data.name ?? undefined,
      description: data.description !== undefined ? data.description : undefined,
    },
  });
};

module.exports = {
  createTeam,
  getTeamsForUser,
  getTeamById,
  joinTeam,
  leaveTeam,
  removeMember,
  updateTeam,
};
