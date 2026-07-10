import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import { usePermission } from "../hooks/usePermission";

const RoutePermissionGuard = ({
  permission,
  redirectTo = "/employee/dashboard",
}) => {
  const { hasAccess } = usePermission();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const isAllowed = permissions.some((p) => hasAccess(p));

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

RoutePermissionGuard.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  redirectTo: PropTypes.string,
};

export default RoutePermissionGuard;
