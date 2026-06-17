const { createServer } = require("node:http");
const { Server } = require("socket.io");
const app = require("./app");
const { HOST, PORT } = require("./config/env");
const { registerChatSocket } = require("./socket/chat.socket");

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

registerChatSocket(io);

httpServer.listen(PORT, HOST, () => {
  console.log(`Server started at http://${HOST}:${PORT}`);
});
