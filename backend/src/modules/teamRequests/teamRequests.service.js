const prisma = require("../../config/prisma");

const createTeamRequest = async (
  userId,
  data
) => {
  return prisma.teamRequest.create({
    data: {
      creatorId: userId,
      title: data.title,
      description: data.description,
      duration: data.duration,
    },

    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getAllTeamRequests =
  async () => {
    return prisma.teamRequest.findMany({
      include: {
        creator: {
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

const getMyTeamRequests =
  async (userId) => {
    return prisma.teamRequest.findMany({
      where: {
        creatorId: userId,
      },

      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  };

const getTeamRequestById =
  async (id) => {
    return prisma.teamRequest.findUnique({
      where: {
        id,
      },

      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  };

module.exports = {
  createTeamRequest,
  getAllTeamRequests,
  getMyTeamRequests,
  getTeamRequestById,
};