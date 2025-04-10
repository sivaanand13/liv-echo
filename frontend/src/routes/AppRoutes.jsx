import { Routes, Route } from "react-router";
import PrivateRoute from "./PrivateRoute";
import Account from "../features/account/Account";
import Landing from "../features/landing/Landing";
import SignUp from "../features/auth/Signup";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/account" element={<PrivateRoute />}>
        <Route path="/account" element={<Account />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
