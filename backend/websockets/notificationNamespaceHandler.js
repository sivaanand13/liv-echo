import firebaseUtils from "../firebase/firebaseUtils.js";

const notificationsNamespaceHandler = (notificationNamespace) => {
  notificationNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      socket.user = await firebaseUtils.verifyAuthToken(token);
      next();
    } catch (e) {
      console.error("Notification socket auth error:", e);
      next(new Error("Authentication failed"));
    }
  });

  notificationNamespace.on("connection", (socket) => {
    const uid = socket.user.uid;
    socket.join(uid);
    console.log(`Notification socket connected: ${uid}`);

    socket.on("disconnect", () => {
      console.log(`Notification socket disconnected: ${uid}`);
    });
  });
};

export default notificationsNamespaceHandler;
