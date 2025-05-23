import React, { useState, useEffect, createContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../components/Loading";
import chatSocket from "../sockets/namespaces/chatSocket.js";
import axios from "../utils/requests/axios.js";
import userUtils from "../features/users/userUtils.js";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [serverUser, setServerUser] = useState(null);
  const [user, setUser] = useState(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const auth = getAuth();

  async function refreshAccount() {
    try {
      const profile = await userUtils.fetchUserByUID(currentUser.uid);
      setServerUser(profile);
      // console.log("refreshing account: ", profile);
      setUser((prev) => {
        return { ...prev, ...profile };
      });
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    let unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingUser(true);
      if (user) {
        setCurrentUser(user);
        setUser(user);
        // console.log(user);
        let chatSocketRef;
        try {
          chatSocketRef = await chatSocket.connect();
        } catch (e) {
          console.log(e);
        }

        let server = null;
        try {
          server = (await axios.get(`users/`, {})).data.data;
        } catch (e) {
          console.log("fetch server user failed: ", e);
        }
        if (server) {
          setServerUser(server);
          setUser({ ...user, ...server });
          // console.log("server user: ", server);
        }

        chatSocketRef?.on("accountUpdated", (newUser) => {
          // console.log("accountUpdated:", newUser);
          setServerUser(newUser);
          setUser({ ...auth.currentUser, ...newUser });
          console.log("AuthContext updated");
        });
      } else {
        setCurrentUser(null);
        setServerUser(null);
        setUser(null);
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
  }, [currentUser]);

  if (loadingUser) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, serverUser, user, setUser, refreshAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
