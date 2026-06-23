const prisma = require("../../config/prisma");

const applyToTeamRequest = async (
  applicantId,
  teamRequestId
) => {
  const existingApplication =
    await prisma.application.findFirst({
      where: {
        applicantId,
        teamRequestId,
      },
    });

  if (existingApplication) {
    throw new Error(
      "Already applied to this team request"
    );
  }

  return prisma.application.create({
    data: {
      applicantId,
      teamRequestId,
    },

    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      teamRequest: true,
    },
  });
};

const getMyApplications =
  async (userId) => {
    return prisma.application.findMany({
      where: {
        applicantId: userId,
      },

      include: {
        teamRequest: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };

const getApplicationsForTeamRequest =
  async (teamRequestId) => {
    return prisma.application.findMany({
      where: {
        teamRequestId,
      },

      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  };

const updateApplicationStatus =
  async (
    applicationId,
    status,
    currentUserId
  ) => {

    const application =
      await prisma.application.findUnique({
        where: {
          id: applicationId,
        },

        include: {
          teamRequest: true,
        },
      });

    if (!application) {
      throw new Error(
        "Application not found"
      );
    }

    if (
      application.teamRequest.creatorId !==
      currentUserId
    ) {
      throw new Error(
        "Not authorized"
      );
    }

    return prisma.application.update({
      where: {
        id: applicationId,
      },

      data: {
        status,
      },
    });
  };


module.exports = {
  applyToTeamRequest,
  getMyApplications,
  getApplicationsForTeamRequest,
  updateApplicationStatus,
};