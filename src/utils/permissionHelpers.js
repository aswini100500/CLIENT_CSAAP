export const checkPermission = (assignedPermissions, targetPermission) => {
  if (!assignedPermissions || assignedPermissions.length === 0) return false;

  if (assignedPermissions.includes("*")) return true;

  const targetParts = targetPermission.split(".");

  return assignedPermissions.some((assigned) => {
    const assignedParts = assigned.split(".");

    while (
      assignedParts.length > 0 &&
      assignedParts[assignedParts.length - 1] === "*"
    ) {
      assignedParts.pop();
    }

    if (assignedParts.length === 0) return true;

    if (assignedParts.length > targetParts.length) return false;

    for (let i = 0; i < assignedParts.length; i++) {
      if (assignedParts[i] !== targetParts[i]) return false;
    }

    return true;
  });
};
