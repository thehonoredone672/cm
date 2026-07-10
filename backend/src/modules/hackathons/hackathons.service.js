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

module.exports = {
  getHackathons,
  createHackathon,
  deleteHackathon
};
