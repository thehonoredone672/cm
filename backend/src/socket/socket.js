const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");

let io;

// userId -> Set of connected socket ids (a user can have multiple tabs/devices)
const onlineUsers = new Map();

const addOnlineSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);

  if (!sockets) return;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
  }
};

const broadcastOnlineUsers = () => {
  io.emit(
    "online_users",
    Array.from(onlineUsers.keys())
  );
};

const isParticipant = async (
  conversationId,
  userId
) => {
  const participant =
    await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

  return !!participant;
};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authenticate every socket connection using the same JWT used for REST.
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Not authorized"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      socket.userId = decoded.userId;

      next();
    } catch (error) {
      next(new Error("Not authorized"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;

    console.log(
      `Socket Connected: ${socket.id} (user ${userId})`
    );

    addOnlineSocket(userId, socket.id);
    broadcastOnlineUsers();

    socket.on("join_conversation", async (conversationId) => {
      try {
        const allowed = await isParticipant(
          conversationId,
          userId
        );

        if (!allowed) return;

        socket.join(conversationId);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("send_message", async ({ conversationId, text }) => {
      try {
        const { sendMessage } = require("../modules/chat/chat.service");

        await sendMessage(conversationId, userId, text);
      } catch (error) {
        socket.emit("chat_error", {
          message: error.message || "Failed to send message",
        });
      }
    });

    socket.on("typing", (conversationId) => {
      socket.to(conversationId).emit("typing", {
        conversationId,
        userId,
      });
    });

    socket.on("stop_typing", (conversationId) => {
      socket.to(conversationId).emit("stop_typing", {
        conversationId,
        userId,
      });
    });

    socket.on("seen", async (conversationId) => {
      try {
        const allowed = await isParticipant(
          conversationId,
          userId
        );

        if (!allowed) return;

        await prisma.conversationParticipant.updateMany({
          where: {
            conversationId,
            userId,
          },

          data: {
            lastReadAt: new Date(),
          },
        });

        io.to(conversationId).emit("seen", {
          conversationId,
          userId,
          seenAt: new Date(),
        });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("disconnect", () => {
      console.log(
        `Socket Disconnected: ${socket.id} (user ${userId})`
      );

      removeOnlineSocket(userId, socket.id);
      broadcastOnlineUsers();
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized"
    );
  }

  return io;
};

const getOnlineUserIds = () =>
  Array.from(onlineUsers.keys());

module.exports = {
  initializeSocket,
  getIO,
  getOnlineUserIds,
};
