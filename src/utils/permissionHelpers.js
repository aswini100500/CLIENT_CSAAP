/**
 * Evaluates permission scopes using a pure positive prefix-matching strategy.
 * Supports standard wildcards (*) and prefix namespace overrides.
 * 
 * Examples:
 * - User has "hrms.employee" -> Matches "hrms.employee.add", "hrms.employee.delete", etc.
 * - User has "hrms.employee.read" -> Only matches "hrms.employee.read"
 * - User has "*" -> Matches everything.
 */
export const checkPermission = (assignedPermissions, targetPermission) => {
  if (!assignedPermissions || assignedPermissions.length === 0) return false;

  // Universal admin override
  if (assignedPermissions.includes('*')) return true;

  const targetParts = targetPermission.split('.');

  return assignedPermissions.some((assigned) => {
    const assignedParts = assigned.split('.');

    // Strip trailing wildcard — "hrms.job.*" is equivalent to prefix "hrms.job"
    while (assignedParts.length > 0 && assignedParts[assignedParts.length - 1] === '*') {
      assignedParts.pop();
    }

    // After stripping, if nothing remains, it was just "*" which is handled above
    if (assignedParts.length === 0) return true;

    // Either side can be a prefix of the other:
    //   assigned "hrms.job"  matches target "hrms.job.create"  (parent grants child)
    //   assigned "hrms.job"  matches target "hrms.job"          (exact match)
    //   assigned "hrms.job"  matches target "hrms"             (child proves parent area access)
    // But we only want: assigned is a prefix of target OR exact match
    // i.e., "hrms.job" should NOT match target "hrms" (having job access ≠ having all of hrms)
    
    // Assigned scope (after wildcard strip) cannot be more specific than target
    if (assignedParts.length > targetParts.length) return false;

    // Verify all parts of the assigned scope match the target
    for (let i = 0; i < assignedParts.length; i++) {
      if (assignedParts[i] !== targetParts[i]) return false;
    }
    
    return true; // Successfully matched prefix
  });
};
