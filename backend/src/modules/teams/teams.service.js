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
        maxMembers: data.maxMembers ? Number(data.maxMembers) : 5,
        requiredSkills: data.requiredSkills || [],
        requiredInterests: data.requiredInterests || [],
        isRecruiting: data.isRecruiting !== undefined ? data.isRecruiting : true,
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
              skills: { include: { skill: true } }
            },
          },
        },
      },
      announcements: {
        include: {
          creator: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      files: {
        include: {
          uploadedBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      activities: {
        include: {
          user: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      },
      resources: {
        orderBy: { createdAt: "desc" }
      }
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
      maxMembers: data.maxMembers !== undefined ? Number(data.maxMembers) : undefined,
      requiredSkills: data.requiredSkills ?? undefined,
      requiredInterests: data.requiredInterests ?? undefined,
      isRecruiting: data.isRecruiting !== undefined ? data.isRecruiting : undefined,
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

 

  return { success: true, message: "Invite sent successfully" };
};

const getAllTeams = async () => {
  return prisma.team.findMany({
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

const deleteTeam = async (leaderId, teamId) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });
  if (!team) throw new Error("Team not found");
  if (team.leaderId !== leaderId) {
    throw new Error("Only the team leader can delete the team");
  }

  return prisma.$transaction(async (tx) => {
    const convs = await tx.conversation.findMany({
      where: { teamId }
    });
    const convIds = convs.map(c => c.id);

    await tx.conversationParticipant.deleteMany({
      where: { conversationId: { in: convIds } }
    });

    await tx.message.deleteMany({
      where: { conversationId: { in: convIds } }
    });

    await tx.conversation.deleteMany({
      where: { teamId }
    });

    await tx.teamMember.deleteMany({
      where: { teamId }
    });

    return tx.team.delete({
      where: { id: teamId }
    });
  });
};

const transferOwnership = async (leaderId, teamId, newLeaderId) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true }
  });
  if (!team) throw new Error("Team not found");
  if (team.leaderId !== leaderId) {
    throw new Error("Only the team leader can transfer ownership");
  }

  const isMember = team.members.some(m => m.userId === newLeaderId);
  if (!isMember) {
    throw new Error("The target user must be a member of the team");
  }

  return prisma.$transaction(async (tx) => {
    await tx.teamMember.update({
      where: { teamId_userId: { teamId, userId: leaderId } },
      data: { role: "MEMBER" }
    });
    await tx.teamMember.update({
      where: { teamId_userId: { teamId, userId: newLeaderId } },
      data: { role: "LEADER" }
    });
    return tx.team.update({
      where: { id: teamId },
      data: { leaderId: newLeaderId }
    });
  });
};

const toggleRecruitment = async (leaderId, teamId, isRecruiting) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });
  if (!team) throw new Error("Team not found");
  if (team.leaderId !== leaderId) {
    throw new Error("Only the team leader can toggle recruitment status");
  }

  return prisma.team.update({
    where: { id: teamId },
    data: { isRecruiting }
  });
};

const createTeamAnnouncement = async (userId, teamId, data) => {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member) throw new Error("Unauthorized");

  return prisma.$transaction(async (tx) => {
    const ann = await tx.teamAnnouncement.create({
      data: {
        teamId,
        creatorId: userId,
        title: data.title,
        content: data.content,
        isPinned: data.isPinned || false
      },
      include: { creator: { select: { id: true, name: true } } }
    });

    await tx.teamActivity.create({
      data: {
        teamId,
        userId,
        action: "ANNOUNCEMENT_CREATED",
        details: `posted a new announcement: "${data.title}"`
      }
    });

    return ann;
  });
};

const deleteTeamAnnouncement = async (userId, teamId, announcementId) => {
  const ann = await prisma.teamAnnouncement.findUnique({
    where: { id: announcementId }
  });
  if (!ann) throw new Error("Announcement not found");

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member || (member.role !== "LEADER" && member.role !== "ADMIN" && ann.creatorId !== userId)) {
    throw new Error("Unauthorized");
  }

  return prisma.teamAnnouncement.delete({
    where: { id: announcementId }
  });
};

const createTeamTask = async (userId, teamId, data) => {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member) throw new Error("Unauthorized");

  return prisma.$transaction(async (tx) => {
    const task = await tx.teamTask.create({
      data: {
        teamId,
        title: data.title,
        description: data.description || null,
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId || null
      },
      include: { assignee: { select: { id: true, name: true } } }
    });

    await tx.teamActivity.create({
      data: {
        teamId,
        userId,
        action: "TASK_CREATED",
        details: `created a new task: "${data.title}"`
      }
    });

    return task;
  });
};

const updateTeamTask = async (userId, teamId, taskId, data) => {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member) throw new Error("Unauthorized");

  const existing = await prisma.teamTask.findUnique({ where: { id: taskId } });
  if (!existing) throw new Error("Task not found");

  return prisma.$transaction(async (tx) => {
    const task = await tx.teamTask.update({
      where: { id: taskId },
      data: {
        title: data.title ?? undefined,
        description: data.description !== undefined ? data.description : undefined,
        status: data.status ?? undefined,
        priority: data.priority ?? undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        assigneeId: data.assigneeId !== undefined ? data.assigneeId : undefined
      },
      include: { assignee: { select: { id: true, name: true } } }
    });

    if (data.status && data.status !== existing.status) {
      await tx.teamActivity.create({
        data: {
          teamId,
          userId,
          action: "TASK_UPDATED",
          details: `moved task "${task.title}" to ${data.status}`
        }
      });
    }

    return task;
  });
};

const deleteTeamTask = async (userId, teamId, taskId) => {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member) throw new Error("Unauthorized");

  return prisma.teamTask.delete({
    where: { id: taskId }
  });
};

const createTeamFile = async (userId, teamId, data) => {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member) throw new Error("Unauthorized");

  return prisma.$transaction(async (tx) => {
    const file = await tx.teamFile.create({
      data: {
        teamId,
        name: data.name,
        fileUrl: data.fileUrl,
        fileSize: Number(data.fileSize),
        fileType: data.fileType,
        uploadedById: userId
      },
      include: { uploadedBy: { select: { id: true, name: true } } }
    });

    await tx.teamActivity.create({
      data: {
        teamId,
        userId,
        action: "FILE_UPLOADED",
        details: `uploaded a shared file: "${data.name}"`
      }
    });

    return file;
  });
};

const deleteTeamFile = async (userId, teamId, fileId) => {
  const file = await prisma.teamFile.findUnique({
    where: { id: fileId }
  });
  if (!file) throw new Error("File not found");

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member || (member.role !== "LEADER" && member.role !== "ADMIN" && file.uploadedById !== userId)) {
    throw new Error("Unauthorized");
  }

  return prisma.teamFile.delete({
    where: { id: fileId }
  });
};

const createTeamResource = async (userId, teamId, data) => {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member) throw new Error("Unauthorized");

  return prisma.teamResource.create({
    data: {
      teamId,
      title: data.title,
      url: data.url
    }
  });
};

const deleteTeamResource = async (userId, teamId, resourceId) => {
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });
  if (!member || (member.role !== "LEADER" && member.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  return prisma.teamResource.delete({
    where: { id: resourceId }
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
  updateMemberRole,
  inviteToTeamByEmail,
  getAllTeams,
  deleteTeam,
  transferOwnership,
  toggleRecruitment,
  
  createTeamAnnouncement,
  deleteTeamAnnouncement,
  createTeamTask,
  updateTeamTask,
  deleteTeamTask,
  createTeamFile,
  deleteTeamFile,
  createTeamResource,
  deleteTeamResource
};
