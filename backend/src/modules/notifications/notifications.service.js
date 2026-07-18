const prisma = require("../../config/prisma");
const { getIO } = require("../../socket/socket");

const createNotification = async (userId, type, title, message, link = null) => {
  try {
    // Check if user has settings preference
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    // Map type to preference field
    const typeMapping = {
      CHAT: "chat",
      TEAM: "teams",
      TEAM_APPLICATION: "teams",
      TEAM_INVITE: "teams",
      CONTEST: "contests",
      SUBMISSION: "problems",
      PROBLEM: "problems",
      LEADERBOARD: "leaderboard",
      SYSTEM: "announcements",
      ANNOUNCEMENT: "announcements",
    };

    const prefField = typeMapping[type] || "announcements";
    if (preferences[prefField] === false) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    // Socket emit
    try {
      const io = getIO();
      io.to(userId).emit("notification:new", notification);
    } catch (socketErr) {
      console.error("Failed to emit realtime notification", socketErr.message);
    }

    return notification;
  } catch (err) {
    console.error("Failed to create notification", err.message);
    return null;
  }
};

const getNotificationsForUser = async (userId, query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const where = { userId };

  if (query.isRead !== undefined) {
    where.isRead = query.isRead === "true";
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { message: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const markRead = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) throw new Error("Notification not found");
  if (notification.userId !== userId) throw new Error("Unauthorized");

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  try {
    const io = getIO();
    io.to(userId).emit("notification:read", updated);
  } catch (err) {
    console.error("Failed to emit notification:read via socket", err.message);
  }

  return updated;
};

const markAllRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  try {
    const io = getIO();
    io.to(userId).emit("notification:update", { isAllRead: true });
  } catch (err) {
    console.error("Failed to emit notification:update via socket", err.message);
  }

  return { success: true };
};

const deleteNotification = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) throw new Error("Notification not found");
  if (notification.userId !== userId) throw new Error("Unauthorized");

  await prisma.notification.delete({
    where: { id },
  });

  try {
    const io = getIO();
    io.to(userId).emit("notification:delete", { id });
  } catch (err) {
    console.error("Failed to emit notification:delete via socket", err.message);
  }

  return { id };
};

const deleteAllNotifications = async (userId) => {
  await prisma.notification.deleteMany({
    where: { userId },
  });

  try {
    const io = getIO();
    io.to(userId).emit("notification:update", { isAllDeleted: true });
  } catch (err) {
    console.error("Failed to emit notification:update via socket", err.message);
  }

  return { success: true };
};

const getNotificationPreferences = async (userId) => {
  let preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!preferences) {
    preferences = await prisma.notificationPreference.create({
      data: { userId },
    });
  }

  return preferences;
};

const updateNotificationPreferences = async (userId, data) => {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
};
