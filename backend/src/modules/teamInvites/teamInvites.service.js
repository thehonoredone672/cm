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

  if (!receiver || receiver.role === "ADMIN") {
    throw new Error(
      "Receiver not found."
    );
  }

  const existing = await prisma.teamInvite.findFirst({
    where: {
      OR: [
        { senderId, receiverId, status: { in: ["PENDING", "ACCEPTED"] } },
        { senderId: receiverId, receiverId: senderId, status: { in: ["PENDING", "ACCEPTED"] } }
      ]
    }
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      throw new Error("You are already connected as teammates.");
    }
    throw new Error("A pending invitation already exists between you.");
  }

  const invite = await prisma.teamInvite.create({
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



  return invite;
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

    return prisma.$transaction(async (tx) => {
      const updatedInvite = await tx.teamInvite.update({
        where: {
          id: inviteId,
        },

        data: {
          status:
            "ACCEPTED",
        },
        include: {
          sender: { select: { name: true } },
          receiver: { select: { name: true } },
        }
      });



      return updatedInvite;
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