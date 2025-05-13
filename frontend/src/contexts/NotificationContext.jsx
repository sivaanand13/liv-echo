import { createContext, useContext, useEffect, useState } from "react";
import { connectSocket } from "../sockets/socketManager";
import { getAuth } from "firebase/auth";
import axios from "../utils/requests/axios";
import { AuthContext } from "./AuthContext";

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { refreshAccount } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const socket = await connectSocket("notifications");

        const res = await axios.get("notifications/get-notifications");
        console.log("res/noti", res);
        if (res.status === 200) {
          setNotifications(res.data.data);
        }

        socket.on("notification", (notify) => {
          setNotifications((prev) => {
            const alreadyExists = prev.some((n) => n._id === notify._id);
            if (alreadyExists) return prev;
            return [notify, ...prev];
          });
          try {
            refreshAccount();
          } catch (e) {}
        });
        setSocket(socket);
      }
    });

    return () => {
      unsubscribe();
      if (socket) {
        socket.off("notification");
        socket.disconnect();
      }
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.patch(`notifications/mark-read/${id}`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
