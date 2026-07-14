const prisma = require("../../config/prisma");

const getEvents = async (userId) => {
  const events = await prisma.event.findMany({
    include: {
      registrations: { where: { userId } }
    },
    orderBy: { date: "asc" }
  });

  return events.map(e => {
    const { registrations, ...clean } = e;
    return {
      ...clean,
      isRegistered: registrations.length > 0,
      attended: registrations[0]?.attended || false
    };
  });
};

const createEvent = async (data) => {
  if (!data.title || !data.description || !data.type || !data.date) {
    throw new Error("Missing required event details: title, description, type, date");
  }

  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      date: new Date(data.date),
      speaker: data.speaker || null,
      link: data.link || null
    }
  });
};

const registerForEvent = async (eventId, userId) => {
  return prisma.eventRegistration.create({
    data: { eventId, userId }
  });
};

const trackAttendanceAndIssueCertificate = async (eventId, userId) => {
  // Update registration to mark as attended
  await prisma.eventRegistration.update({
    where: { eventId_userId: { eventId, userId } },
    data: { attended: true }
  });

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  
  // Issue Certificate (Sprint 11.7)
  const verificationCode = `CERT-${eventId.slice(0, 4)}-${userId.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  return prisma.certificate.create({
    data: {
      userId,
      title: `Attendance Certificate for ${event.title}`,
      issuedBy: event.speaker || "CodeMatch Platform",
      verificationCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${verificationCode}`
    }
  });
};

module.exports = {
  getEvents,
  createEvent,
  registerForEvent,
  trackAttendanceAndIssueCertificate
};
