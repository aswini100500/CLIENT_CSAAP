import { checkPermission } from "../utils/permissionHelpers";
import useAuth from "./useAuth";


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


  const normalizedPermissions = assignedPermissions.map(p => 
    String(p).toLowerCase().trim()
  );


  const has = (permissionCode) => {
    if (isUserAdmin) return true;
    if (!permissionCode) return false;
    return checkPermission(normalizedPermissions, String(permissionCode).toLowerCase().trim());
  };


  const hasAreaAccess = (areaCode) => {
    if (isUserAdmin) return true;
    if (!areaCode) return false;
    const target = String(areaCode).toLowerCase().trim();
    const prefix = target + ".";
    return normalizedPermissions.some((assigned) => 
      assigned === target || assigned.startsWith(prefix)
    );
  };


  const hasAccess = (permissionCode) => {
    if (isUserAdmin) return true;
    return has(permissionCode) || hasAreaAccess(permissionCode);
  };


  const hasAll = (permissionCodes = []) => {
    if (isUserAdmin) return true;
    return permissionCodes.every((code) => has(code));
  };


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
