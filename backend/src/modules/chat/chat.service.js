const prisma = require("../../config/prisma");

const {
  getIO,
} = require("../../socket/socket");

const isParticipant = async (
  conversationId,
  userId
) => {
  const participant =
    await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

  return !!participant;
};

/*
|--------------------------------------------------------------------------
| Teammates
|--------------------------------------------------------------------------
| Chat is only available between users who have an ACCEPTED team invite
| between them (in either direction).
*/

const isTeammate = async (
  user1Id,
  user2Id
) => {
  const invite =
    await prisma.teamInvite.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          {
            senderId: user1Id,
            receiverId: user2Id,
          },
          {
            senderId: user2Id,
            receiverId: user1Id,
          },
        ],
      },
    });

  return !!invite;
};

const getTeammates = async (userId) => {
  const invites =
    await prisma.teamInvite.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  const teammates = invites.map((invite) =>
    invite.senderId === userId
      ? invite.receiver
      : invite.sender
  );

  const uniqueTeammates = Array.from(
    new Map(
      teammates.map((teammate) => [
        teammate.id,
        teammate,
      ])
    ).values()
  );

  return uniqueTeammates;
};

const createConversation = async (
  user1Id,
  user2Id
) => {
  if (user1Id === user2Id) {
    throw new Error(
      "You cannot start a conversation with yourself."
    );
  }

  const allowed = await isTeammate(
    user1Id,
    user2Id
  );

  if (!allowed) {
    throw new Error(
      "Chat is only available with accepted teammates."
    );
  }

  const existingConversation =
    await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: user1Id },
            },
          },
          {
            participants: {
              some: { userId: user2Id },
            },
          },
        ],
      },

      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

  if (existingConversation) {
    return existingConversation;
  }

  return prisma.conversation.create({
    data: {
      participants: {
        create: [
          {
            userId: user1Id,
          },
          {
            userId: user2Id,
          },
        ],
      },
    },

    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

const getUserConversations =
  async (userId) => {
    const conversations =
      await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },

        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },

          messages: {
            orderBy: {
              createdAt: "desc",
            },

            take: 1,
          },
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    const conversationsWithMeta = await Promise.all(
      conversations.map(async (conversation) => {
        const self = conversation.participants.find(
          (participant) => participant.userId === userId
        );

        const lastReadAt = self?.lastReadAt || null;

        const unreadCount =
          await prisma.message.count({
            where: {
              conversationId: conversation.id,
              senderId: { not: userId },
              createdAt: lastReadAt
                ? { gt: lastReadAt }
                : undefined,
            },
          });

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    return conversationsWithMeta;
  };

const markAsRead = async (
  conversationId,
  userId
) => {
  const allowed = await isParticipant(
    conversationId,
    userId
  );

  if (!allowed) {
    throw new Error(
      "Not authorized"
    );
  }

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId,
    },

    data: {
      lastReadAt: new Date(),
    },
  });

  const io = getIO();

  io.to(conversationId).emit("seen", {
    conversationId,
    userId,
    seenAt: new Date(),
  });

  return { conversationId, userId };
};

const sendMessage = async (
  conversationId,
  senderId,
  text
) => {

  const allowed =
    await isParticipant(
      conversationId,
      senderId
    );

  if (!allowed) {
    throw new Error(
      "Not authorized"
    );
  }

  const message =
    await prisma.message.create({
      data: {
        conversationId,
        senderId,
        text,
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const io = getIO();

  io.to(conversationId).emit(
    "receive_message",
    message
  );

  return message;
};

const getMessages = async (
  conversationId,
  userId
) => {
  const allowed =
    await isParticipant(
      conversationId,
      userId
    );

  if (!allowed) {
    throw new Error(
      "Not authorized"
    );
  }

  return prisma.message.findMany({
    where: {
      conversationId,
    },

    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });
};

module.exports = {
  isParticipant,
  isTeammate,
  getTeammates,
  createConversation,
  getUserConversations,
  markAsRead,
  sendMessage,
  getMessages,
};
