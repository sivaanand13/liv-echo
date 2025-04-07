import { Navigate, Outlet } from "react-router";
import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
const PrivateRoute = () => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? <Outlet /> : <Navigate to="/signin" replace={true} />;
};

export default PrivateRoute;
