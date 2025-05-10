import { Server } from "socket.io";
import chatNamespaceHandler from "./chatNamespace.js";
import notificationsNamespaceHandler from "./notificationNamespaceHandler.js";

export let chatNamespace;
export let notificationsNamespace;

let corsOrigins = ["*"]; // [process.env.FRONTEND_URI];

const configSocketHandlers = (server) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigins,
    },
  });

  chatNamespace = io.of("/chat");
  chatNamespaceHandler(chatNamespace);

  notificationsNamespace = io.of("/notifications");
  notificationsNamespaceHandler(notificationsNamespace);

  console.log("WebSockets configured");
};

export default configSocketHandlers;
