import { io } from "socket.io-client";
import { getAuth } from "firebase/auth";
let BACKEND_URI;
if (import.meta.env.VITE_ENV_TYPE == "dev") {
  BACKEND_URI = import.meta.env.VITE_BACKEND_URI_DEV;
} else {
  BACKEND_URI = import.meta.env.VITE_BACKEND_URI_PROD;
}

const curSockets = {};

export const connectSocket = async (namespace) => {
  if (!curSockets[namespace]) {
    const auth = getAuth();
    const user = auth.currentUser;
    const socket_URL = `${BACKEND_URI}${namespace}`;
    console.log("Trying to connect to:", socket_URL);
    const socket = io(socket_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token: await user.getIdToken(),
      },
    });

    socket.on("connect_error", (e) => {
      console.error("Socket connection error:", e);
    });

    socket.on("connect_timeout", () => {
      console.log("Scoket connect attempt timed out");
    });

    socket.on("connect", () => {
      console.log(`Connected to socket ${namespace}`);
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected from socket ${namespace}`);
    });

    curSockets[namespace] = socket;
  }
  console.log(curSockets[namespace]);
  return curSockets[namespace];
};

export const disconnectSocket = async (namespace) => {
  if (!curSockets[namespace]) {
    console.log("No socket with name space " + namespace);
    return;
  }
  curSockets[namespace].disconnect();
  delete curSockets[namespace];
  console.log(`Closed  socket ${namespace}`);
};

export default {
  connectSocket,
  disconnectSocket,
};
