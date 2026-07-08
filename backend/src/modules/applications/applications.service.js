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

  const app = await prisma.application.create({
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

  // Trigger Team Application notification
  try {
    const { createNotification } = require("../notifications/notifications.service");
    await createNotification(
      app.teamRequest.creatorId,
      "TEAM_APPLICATION",
      "New Team Application",
      `${app.applicant.name} applied to your team request "${app.teamRequest.title}".`,
      "/dashboard"
    );
  } catch (err) {
    console.error("Failed to trigger application notification", err);
  }

  return app;
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
          applicant: true,
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

    const updated = await prisma.application.update({
      where: {
        id: applicationId,
      },

      data: {
        status,
      },
    });

    // Trigger notification to applicant
    try {
      const { createNotification } = require("../notifications/notifications.service");
      await createNotification(
        application.applicantId,
        "TEAM_APPLICATION",
        `Application ${status.toLowerCase()}`,
        `Your application for "${application.teamRequest.title}" was ${status.toLowerCase()}.`,
        "/dashboard"
      );
    } catch (err) {
      console.error("Failed to trigger application update notification", err);
    }

    return updated;
  };


module.exports = {
  applyToTeamRequest,
  getMyApplications,
  getApplicationsForTeamRequest,
  updateApplicationStatus,
};