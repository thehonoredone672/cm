"use strict";

const prisma = require("../../config/prisma");
const { getIO } = require("../../socket/socket");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isParticipant = async (conversationId, userId) => {
  const row = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });
  return !!row;
};

const isTeammate = async (user1Id, user2Id) => {
  const invite = await prisma.teamInvite.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    },
  });
  return !!invite;
};

// ─── Teammates ────────────────────────────────────────────────────────────────

const getTeammates = async (userId) => {
  const invites = await prisma.teamInvite.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      receiver: { select: { id: true, name: true, email: true } },
    },
  });

  const teammates = invites.map((inv) =>
    inv.senderId === userId ? inv.receiver : inv.sender
  );

  return Array.from(new Map(teammates.map((t) => [t.id, t])).values());
};

// ─── Conversations ────────────────────────────────────────────────────────────

const createConversation = async (user1Id, user2Id) => {
  if (user1Id === user2Id) throw new Error("Cannot start a conversation with yourself.");

  const allowed = await isTeammate(user1Id, user2Id);
  if (!allowed) throw new Error("Chat is only available with accepted teammates.");

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user1Id } } },
        { participants: { some: { userId: user2Id } } },
      ],
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user1Id }, { userId: user2Id }],
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });
};

const getUserConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const withMeta = await Promise.all(
    conversations.map(async (conv) => {
      const self = conv.participants.find((p) => p.userId === userId);
      const lastReadAt = self?.lastReadAt ?? null;

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          isDeleted: false,
          ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
        },
      });

      return { ...conv, unreadCount };
    })
  );

  return withMeta;
};

// ─── Messages ─────────────────────────────────────────────────────────────────

const getMessages = async (conversationId, userId, { limit = 50, before } = {}) => {
  const allowed = await isParticipant(conversationId, userId);
  if (!allowed) throw new Error("Not authorized.");

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: Number(limit),
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return messages;
};

const sendMessage = async (conversationId, senderId, text, fileUrl = null, fileType = null) => {
  const allowed = await isParticipant(conversationId, senderId);
  if (!allowed) throw new Error("Not authorized.");

  const msgText = text ? text.trim() : (fileUrl ? "Sent an attachment" : "");
  if (!msgText && !fileUrl) throw new Error("Message cannot be empty.");

  const message = await prisma.message.create({
    data: { conversationId, senderId, text: msgText, fileUrl, fileType },
    include: { sender: { select: { id: true, name: true } } },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Emit to all participant user rooms so they receive it even with chat closed
  try {
    const io = getIO();
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
    });
    for (const p of participants) {
      io.to(p.userId).emit("receive_message", message);
    }
  } catch (err) {
    console.error("[chat.service] Socket emit failed:", err.message);
  }

  // Push notification to recipients
  try {
    const { createNotification } = require("../notifications/notifications.service");
    const recipients = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: senderId } },
    });
    for (const r of recipients) {
      await createNotification(
        r.userId, "CHAT",
        `New message from ${message.sender.name}`,
        text.length > 60 ? text.slice(0, 60) + "\u2026" : text,
        "/chat"
      );
    }
  } catch (err) {
    console.error("[chat.service] Notification failed:", err.message);
  }

  return message;
};

const deleteMessage = async (messageId, userId) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found.");
  if (message.senderId !== userId) throw new Error("Not authorized.");

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, text: "This message was deleted." },
    include: { sender: { select: { id: true, name: true } } },
  });

  try {
    const io = getIO();
    io.to(message.conversationId).emit("message_deleted", {
      messageId,
      conversationId: message.conversationId,
    });
  } catch (err) {
    console.error("[chat.service] Delete emit failed:", err.message);
  }

  return updated;
};

const markAsRead = async (conversationId, userId) => {
  const allowed = await isParticipant(conversationId, userId);
  if (!allowed) throw new Error("Not authorized.");

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });

  try {
    const io = getIO();
    io.to(conversationId).emit("seen", {
      conversationId, userId, seenAt: new Date(),
    });
  } catch (err) {
    console.error("[chat.service] Seen emit failed:", err.message);
  }

  return { conversationId, userId };
};

module.exports = {
  isParticipant, getTeammates, createConversation,
  getUserConversations, getMessages, sendMessage,
  deleteMessage, markAsRead,
};
