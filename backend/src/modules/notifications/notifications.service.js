"use strict";

const prisma = require("../../config/prisma");
const { getIO } = require("../../socket/socket");

const emitSocketEvent = (userId, eventName, data) => {
  try {
    const io = getIO();
    io.to(userId).emit(eventName, data);
  } catch (err) {
    console.error(`Failed to emit socket event ${eventName}`, err);
  }
};

const createNotification = async (userId, type, title, message, link = null) => {
  // Check user preference before writing
  let preferences = await prisma.notificationPreference.findUnique({
    where: { userId }
  });

  if (!preferences) {
    preferences = await prisma.notificationPreference.create({
      data: { userId }
    });
  }

  // Map type to preference field
  const prefMap = {
    CHAT: "chat",
    TEAM: "teams",
    CONTEST: "contests",
    SUBMISSION: "problems",
    SYSTEM: "announcements"
  };

  const prefField = prefMap[type] || "announcements";
  if (preferences[prefField] === false) {
    // User disabled this notification type
    return null;
  }

  const notification = await prisma.notification.create({
    data: { userId, type, title, message, link }
  });

  emitSocketEvent(userId, "notification:new", notification);
  return notification;
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
      { message: { contains: query.search, mode: "insensitive" } }
    ];
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.notification.count({ where })
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

const markRead = async (id, userId) => {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif) throw new Error("Notification not found");
  if (notif.userId !== userId) throw new Error("Unauthorized");

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  emitSocketEvent(userId, "notification:read", updated);
  return updated;
};

const markAllRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });

  emitSocketEvent(userId, "notification:update", { isAllRead: true });
  return { success: true };
};

const deleteNotification = async (id, userId) => {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif) throw new Error("Notification not found");
  if (notif.userId !== userId) throw new Error("Unauthorized");

  await prisma.notification.delete({ where: { id } });

  emitSocketEvent(userId, "notification:delete", { id });
  return { id };
};

const deleteAllNotifications = async (userId) => {
  await prisma.notification.deleteMany({ where: { userId } });
  emitSocketEvent(userId, "notification:update", { isAllDeleted: true });
  return { success: true };
};

// ─── Preferences ────────────────────────────────────────────────────────────────

const getNotificationPreferences = async (userId) => {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId }
  });
  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId }
    });
  }
  return prefs;
};

const updateNotificationPreferences = async (userId, data) => {
  const { chat, teams, contests, problems, leaderboard, announcements, marketing } = data;
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: { chat, teams, contests, problems, leaderboard, announcements, marketing },
    create: { userId, chat, teams, contests, problems, leaderboard, announcements, marketing }
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
  updateNotificationPreferences
};
