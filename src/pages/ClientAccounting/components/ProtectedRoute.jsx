import React from "react";

import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { userId, loadingAuth } = useUser();

  if (loadingAuth) return null;

  if (!userId) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
