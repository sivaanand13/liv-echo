import { Routes, Route } from "react-router";
import PrivateRoute from "./PrivateRoute";
import Account from "../features/account/Account";
import Landing from "../features/landing/Landing";
import SignUp from "../features/auth/SignUp";
import SignIn from "../features/auth/SignIn";
import DirectMessages from "../features/dms/DirectMessages";
import GroupChats from "../features/group-chat/GroupChats";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route element={<PrivateRoute />}>
        <Route path="/account" element={<Account />} />
        <Route path="/dms" element={<DirectMessages />} />
        <Route path="/group-chats" element={<GroupChats />} />

        <Route path="/chats" element={<Account />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
