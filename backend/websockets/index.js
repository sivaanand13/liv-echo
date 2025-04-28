import { Server } from "socket.io";
import chatNamespaceHandler from "./chatNamespace.js";

export let chatNamespace;

let corsOrigins = ["*"]; // [process.env.FRONTEND_URI];

const configSocketHandlers = (server) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigins,
    },
  });

  chatNamespace = io.of("/chat");
  chatNamespaceHandler(chatNamespace);
  console.log("WebSockets configured");
};

export default configSocketHandlers;
