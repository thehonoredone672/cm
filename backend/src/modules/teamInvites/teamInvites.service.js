const prisma = require("../../config/prisma");

const sendInvite = async (
  senderId,
  receiverId,
  message
) => {
  if (senderId === receiverId) {
    throw new Error(
      "You cannot invite yourself."
    );
  }

  const receiver =
    await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });

  if (!receiver) {
    throw new Error(
      "Receiver not found."
    );
  }

  const existing =
    await prisma.teamInvite.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

  if (existing) {
    throw new Error(
      "Invite already sent."
    );
  }

  return prisma.teamInvite.create({
    data: {
      senderId,
      receiverId,
      message,
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
};

const getSentInvites =
  async (userId) => {
    return prisma.teamInvite.findMany({
      where: {
        senderId: userId,
      },

      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };

const getReceivedInvites =
  async (userId) => {
    return prisma.teamInvite.findMany({
      where: {
        receiverId: userId,
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };

const acceptInvite =
  async (inviteId, userId) => {
    const invite =
      await prisma.teamInvite.findUnique({
        where: {
          id: inviteId,
        },
      });

    if (!invite) {
      throw new Error(
        "Invite not found."
      );
    }

    if (
      invite.receiverId !==
      userId
    ) {
      throw new Error(
        "Unauthorized."
      );
    }

    return prisma.teamInvite.update({
      where: {
        id: inviteId,
      },

      data: {
        status:
          "ACCEPTED",
      },
    });
  };

const rejectInvite =
  async (inviteId, userId) => {
    const invite =
      await prisma.teamInvite.findUnique({
        where: {
          id: inviteId,
        },
      });

    if (!invite) {
      throw new Error(
        "Invite not found."
      );
    }

    if (
      invite.receiverId !==
      userId
    ) {
      throw new Error(
        "Unauthorized."
      );
    }

    return prisma.teamInvite.update({
      where: {
        id: inviteId,
      },

      data: {
        status:
          "REJECTED",
      },
    });
  };

module.exports = {
  sendInvite,
  getSentInvites,
  getReceivedInvites,
  acceptInvite,
  rejectInvite,
};