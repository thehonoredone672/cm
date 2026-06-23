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

const createConversation = async (
  user1Id,
  user2Id
) => {
  const existingConversation =
    await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [user1Id, user2Id],
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
    return prisma.conversation.findMany({
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
  createConversation,
  getUserConversations,
  sendMessage,
  getMessages,
};