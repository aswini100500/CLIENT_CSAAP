import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const authState = queryClient.getQueryData(['authUser']);
  
  if (!authState?.isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const { user } = authState;

  if (allowedRoles?.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />; 
  }

  return <Outlet />;
};

export default RequireAuth;