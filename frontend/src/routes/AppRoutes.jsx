import { Routes, Route, Navigate } from "react-router";
import PrivateRoute from "./PrivateRoute";
import Account from "../features/account/Account";
import Landing from "../features/landing/Landing";
import SignUp from "../features/auth/SignUp";
import SignIn from "../features/auth/SignIn";
import DirectMessages from "../features/dms/DirectMessages";
import GroupChats from "../features/group-chat/GroupChats";
import UserSearch from "../features/users/UserSearch";
import NotFound from "../components/NotFound";
import UserProfile from "../features/users/UserProfile";
import CreatePost from "../features/posts/CreatePost";
import PostFeed from "../features/posts/PostFeed";
import SearchPosts from "../features/posts/SearchPosts";
import SinglePost from "../features/posts/SinglePost";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/account" element={<Account />} />
        <Route path="/dms" element={<DirectMessages />} />
        <Route path="/group-chats" element={<GroupChats />} />
        <Route path="/users/search" element={<UserSearch />} />
        <Route path="/users/:userUID" element={<UserProfile />} />
        <Route path="/chats" element={<Account />} />
        <Route path="/posts" element={<PostFeed />} />
        <Route path="/posts/create" element={<CreatePost />} />
        <Route path="/posts/search" element={<SearchPosts />} />
        <Route path="/posts/:postId" element={<SinglePost />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
