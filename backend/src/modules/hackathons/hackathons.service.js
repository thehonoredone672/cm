const prisma = require("../../config/prisma");

const getHackathons = async () => {
  return prisma.hackathon.findMany({
    orderBy: { date: "asc" }
  });
};

const createHackathon = async (data) => {
  if (!data.title || !data.description || !data.date || !data.link) {
    throw new Error("Missing required fields: title, description, date, link");
  }

  return prisma.hackathon.create({
    data: {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      link: data.link
    }
  });
};

const deleteHackathon = async (id) => {
  return prisma.hackathon.delete({
    where: { id }
  });
};

const registerTeamForHackathon = async (hackathonId, teamId) => {
  return prisma.hackathonRegistration.create({
    data: { hackathonId, teamId }
  });
};

const submitProject = async (hackathonId, teamId, projectTitle, projectDesc, projectLink) => {
  return prisma.hackathonRegistration.update({
    where: { hackathonId_teamId: { hackathonId, teamId } },
    data: { projectTitle, projectDesc, projectLink }
  });
};

const gradeProject = async (hackathonId, teamId, score, isWinner) => {
  return prisma.hackathonRegistration.update({
    where: { hackathonId_teamId: { hackathonId, teamId } },
    data: { score: Number(score), isWinner }
  });
};

const getHackathonLeaderboard = async (hackathonId) => {
  return prisma.hackathonRegistration.findMany({
    where: { hackathonId },
    include: {
      team: {
        select: { id: true, name: true, members: { include: { user: { select: { name: true } } } } }
      }
    },
    orderBy: { score: "desc" }
  });
};

module.exports = {
  getHackathons,
  createHackathon,
  deleteHackathon,
  registerTeamForHackathon,
  submitProject,
  gradeProject,
  getHackathonLeaderboard
};
