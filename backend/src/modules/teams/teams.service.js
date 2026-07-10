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
        role: "LEADER",
      },
    });

    await tx.conversation.create({
      data: {
        teamId: team.id,
        name: team.name,
        participants: {
          create: [{ userId }],
        },
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
    include: { members: true },
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

  return prisma.$transaction(async (tx) => {
    const member = await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId,
      },
      include: {
        team: true,
      },
    });

    let conv = await tx.conversation.findUnique({
      where: { teamId: team.id },
    });

    if (!conv) {
      const allUserIds = [...team.members.map((m) => m.userId), userId];
      await tx.conversation.create({
        data: {
          teamId: team.id,
          name: team.name,
          participants: {
            create: allUserIds.map((uId) => ({ userId: uId })),
          },
        },
      });
    } else {
      await tx.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId: conv.id,
            userId,
          },
        },
        update: {},
        create: {
          conversationId: conv.id,
          userId,
        },
      });
    }

    return member;
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

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    const conv = await tx.conversation.findUnique({
      where: { teamId },
    });

    if (conv) {
      await tx.conversationParticipant.deleteMany({
        where: {
          conversationId: conv.id,
          userId,
        },
      });
    }

    return deleted;
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

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    const conv = await tx.conversation.findUnique({
      where: { teamId },
    });

    if (conv) {
      await tx.conversationParticipant.deleteMany({
        where: {
          conversationId: conv.id,
          userId,
        },
      });
    }

    return deleted;
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

const updateMemberRole = async (leaderId, teamId, userId, newRole) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  if (!team) throw new Error("Team not found");

  // Only leader or admin can promote/demote (except leader role itself cannot be modified without transfer)
  const isLeader = team.leaderId === leaderId;
  const callerMember = team.members.find((m) => m.userId === leaderId);
  const isAdmin = callerMember && callerMember.role === "ADMIN";

  if (!isLeader && !isAdmin) {
    throw new Error("Only the leader or an admin can update roles");
  }

  const targetMember = team.members.find((m) => m.userId === userId);
  if (!targetMember) throw new Error("User is not a member of this team");

  if (userId === team.leaderId) {
    throw new Error("Cannot change the role of the team leader");
  }

  return prisma.teamMember.update({
    where: {
      teamId_userId: { teamId, userId },
    },
    data: {
      role: newRole,
    },
  });
};

const inviteToTeamByEmail = async (senderId, teamId, email) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) throw new Error("Team not found");

  const targetUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!targetUser) {
    throw new Error(`User with email "${email}" not found on CodeMatch.`);
  }

  // Trigger invite notifications
  try {
    const { createNotification } = require("../notifications/notifications.service");
    await createNotification(
      targetUser.id,
      "TEAM_INVITE",
      `Team Invite: ${team.name}`,
      `You have been invited to join the team "${team.name}". Join code: ${team.joinCode}`,
      `/teams`
    );
  } catch (err) {
    console.error("Failed to trigger team invite notification", err);
  }

  return { success: true, message: "Invite sent successfully" };
};

module.exports = {
  createTeam,
  getTeamsForUser,
  getTeamById,
  joinTeam,
  leaveTeam,
  removeMember,
  updateTeam,
  updateMemberRole,
  inviteToTeamByEmail,
};
