import React, { useState, useEffect, createContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../components/Loading";
import chatSocket from "../sockets/namespaces/chatSocket.js";
import axios from "../utils/requests/axios.js";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [serverUser, setServerUser] = useState(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const auth = getAuth();
  useEffect(() => {
    let unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        console.log(user);
        try {
          await chatSocket.connect();
        } catch (e) {
          console.log(e);
        }
        try {
          const server = (await axios.get(`users/`, {})).data.data;
          setServerUser(server);
          console.log("server user: ", server);
        } catch (e) {
          console.log(e);
        }
      } else {
        setCurrentUser(null);
        try {
          await chatSocket.disconnect();
        } catch (e) {
          console.log(e);
        }
      }

      setLoadingUser(false);
    });
    return () => {
      unsubscribe();
      chatSocket.disconnect();
    };
  }, []);

  if (loadingUser) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, serverUser }}>
      {children}
    </AuthContext.Provider>
  );
}
