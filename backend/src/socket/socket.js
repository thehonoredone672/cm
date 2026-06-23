const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);
    console.log(
      `User Connected: ${socket.id}`
    );

    socket.on(
      "join_conversation",
      (conversationId) => {
        socket.join(
          conversationId
        );

        console.log(
          `Socket ${socket.id} joined conversation ${conversationId}`
        );
      }
    );

    socket.on(
      "send_message",
      (messageData) => {

        io.to(
          messageData.conversationId
        ).emit(
          "receive_message",
          messageData
        );

      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          `User Disconnected: ${socket.id}`
        );
      }
    );
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

module.exports = {
  initializeSocket,
  getIO,
};