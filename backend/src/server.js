require("dotenv").config();

const http = require("http");

const app = require("./app");

const connectDatabase =
  require("./config/database");

const {
  initializeSocket,
} = require("./socket/socket");

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {

  await connectDatabase();

  const server =
    http.createServer(app);

  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
};

startServer();