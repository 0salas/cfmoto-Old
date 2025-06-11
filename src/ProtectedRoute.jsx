import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "./LoginContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(LoginContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
