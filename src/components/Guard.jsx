import React from "react";
import PropTypes from "prop-types";
import { usePermission } from "../hooks/usePermission";

const Guard = ({
  permission,
  anyOf = [],
  allOf = [],
  fallback = null,
  children,
}) => {
  const { has, hasAny, hasAll } = usePermission();

  let isAllowed = false;

  if (permission) {
    isAllowed = has(permission);
  } else if (anyOf.length > 0) {
    isAllowed = hasAny(anyOf);
  } else if (allOf.length > 0) {
    isAllowed = hasAll(allOf);
  }

  return isAllowed ? <>{children}</> : <>{fallback}</>;
};

Guard.propTypes = {
  permission: PropTypes.string,
  anyOf: PropTypes.arrayOf(PropTypes.string),
  allOf: PropTypes.arrayOf(PropTypes.string),
  fallback: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default Guard;
export { Guard };
