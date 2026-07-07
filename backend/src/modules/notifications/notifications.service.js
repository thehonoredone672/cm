const prisma = require("../../config/prisma");
const { getIO } = require("../../socket/socket");

const createNotification = async (userId, type, title, message, link = null) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });

  try {
    const io = getIO();
    io.to(userId).emit("new_notification", notification);
  } catch (err) {
    console.error("Failed to emit notification via socket", err);
  }

  return notification;
};

const getNotificationsForUser = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
};

const markAllRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

const markRead = async (id, userId) => {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif) throw new Error("Notification not found");
  if (notif.userId !== userId) throw new Error("Unauthorized");

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  markAllRead,
  markRead,
};
