import { Server } from "socket.io";
import chatNamespaceHandler from "./chatNamespace.js";

export let chatNamespace;

const configSocketHandlers = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URI,
    },
  });

  chatNamespace = io.of("/chat");
  chatNamespaceHandler(chatNamespace);
  console.log("WebSockets configured");
};

export default configSocketHandlers;
