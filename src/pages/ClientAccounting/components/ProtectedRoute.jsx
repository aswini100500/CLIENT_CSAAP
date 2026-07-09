
// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useUser } from "../context/UserContext";

// const ProtectedRoute = ({ children }) => {
//   const { userId, loadingAuth } = useUser();

//   // WAIT until sessionStorage is restored
//   if (loadingAuth) return null; // or a loading spinner

//   // Once ready, check login
//   if (!userId) return <Navigate to="/login" replace />;

//   return children;
// };

// export default ProtectedRoute;


import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { userId, loadingAuth } = useUser();

  // Note: Token is now stored in HTTP-only cookie and cannot be accessed by JavaScript
  // We rely on the userId from context which is set during login

  // WAIT until sessionStorage is restored
  if (loadingAuth) return null; // or a loading spinner

  // Once ready, check login based on userId from context
  // The cookie will be automatically sent with API requests
  if (!userId) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
