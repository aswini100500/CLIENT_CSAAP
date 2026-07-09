import { checkPermission } from "../utils/permissionHelpers";
import useAuth from "./useAuth";

/**
 * React Hook to check user permissions in Builder ERP.
 * Pulls permission scopes directly from the unified authentication state.
 */
export const usePermission = () => {
  const { user, permissions } = useAuth();

  const checkIsAdmin = () => {
    if (!user) return false;
    const roleVal = String(user.role || "").toLowerCase().trim();
    return (
      roleVal === "admin" || 
      roleVal === "superadmin" || 
      roleVal === "super_admin" || 
      user.isSuperAdmin === true || 
      user.isGlobal === true
    );
  };

  const isUserAdmin = checkIsAdmin();
  const assignedPermissions = permissions || [];

  // Normalize all permission strings to lowercase trim
  const normalizedPermissions = assignedPermissions.map(p => 
    String(p).toLowerCase().trim()
  );

  /**
   * Checks if the user has permission for a specific scope.
   * Supports prefix hierarchies (e.g. "hrms.employee" matches "hrms.employee.add").
   */
  const has = (permissionCode) => {
    if (isUserAdmin) return true;
    if (!permissionCode) return false;
    return checkPermission(normalizedPermissions, String(permissionCode).toLowerCase().trim());
  };

  /**
   * Checks if the user has ANY permission that belongs under a parent namespace/area.
   * e.g. "hrms.attendance.daily_punch.qr.view" starts with "hrms.attendance." and proves area access.
   */
  const hasAreaAccess = (areaCode) => {
    if (isUserAdmin) return true;
    if (!areaCode) return false;
    const target = String(areaCode).toLowerCase().trim();
    const prefix = target + ".";
    return normalizedPermissions.some((assigned) => 
      assigned === target || assigned.startsWith(prefix)
    );
  };

  /**
   * Combined check: checks if the user has standard permission OR area access (loose navigation/layout gate).
   */
  const hasAccess = (permissionCode) => {
    if (isUserAdmin) return true;
    return has(permissionCode) || hasAreaAccess(permissionCode);
  };

  /**
   * Checks if the user has ALL of the specified permissions.
   */
  const hasAll = (permissionCodes = []) => {
    if (isUserAdmin) return true;
    return permissionCodes.every((code) => has(code));
  };

  /**
   * Checks if the user has ANY of the specified permissions.
   */
  const hasAny = (permissionCodes = []) => {
    if (isUserAdmin) return true;
    return permissionCodes.some((code) => has(code));
  };

  return {
    has,
    hasAreaAccess,
    hasAccess,
    hasAll,
    hasAny,
    assignedPermissions: normalizedPermissions,
  };
};

export default usePermission;
