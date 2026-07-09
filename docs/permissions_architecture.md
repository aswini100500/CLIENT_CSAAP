# BuilderERP Permission & Gating Architecture

This document describes the design, key structures, and frontend integration levels of the **BuilderERP Permission and Gating Architecture**. 

It details how the positive prefix-matching engine, the child-proves-parent gateway, and the global admin overrides work together to provide a secure, scalable, and highly maintainable Role-Based Access Control (RBAC) system.

---

## 1. Core Architecture & Philosophy

The permission system is built on two complementary checking paradigms:

1. **Strict Positive Prefix-Matching (Action Gates)**: Permissions flow **downward** from parents to children.
2. **Child-Proves-Parent Matching (Layout Gates)**: Permissions flow **upward** to verify a user belongs in a general area.

```
                  [ hrms ]                    <-- Global Category
                     │
             [ hrms.attendance ]              <-- Parent Module (Lobby)
                     │
        [ hrms.attendance.daily_punch ]       <-- Submodule Area (Desk)
            ┌────────┴────────┐
         [ view ]        [ generate ]         <-- Leaf Keys (Drawer Actions)
```

---

## 2. Key Structures & Naming Conventions

To keep matches predictable, permission keys are structured using **dot-separated namespaces**:

$$\text{domain} \;\mathbf{.}\; \text{module} \;\mathbf{.}\; \text{submodule} \;\mathbf{.}\; \text{leaf\_action}$$

### Key Conventions

* **Category/Wildcard Keys**: Appending `.*` grants all access under that tree.
  * *Example:* `hrms.attendance.*` allows all submodules, tabs, and action keys under the Attendance module.
* **Navigation/View Leaf Keys**: Use `.view` for low-level visual entry points.
  * *Example:* `hrms.attendance.daily_punch.qr.view`
* **Modification/Action Leaf Keys**: Use explicit verbs (`.create`, `.edit`, `.delete`, `.export`, `.generate`).
  * *Example:* `hrms.attendance.daily_punch.qr.generate`

---

## 3. Hook API Reference (`usePermission`)

The React hook `usePermission` in `src/hooks/usePermission.js` exposes five distinct checks:

| Function | Check Strategy | Intended Use Case |
| :--- | :--- | :--- |
| **`has(permission)`** | **Strict check** (Assigned is a prefix of target). | Action buttons, DB modifications, deleting resources. |
| **`hasAreaAccess(area)`** | **Loose check** (Checks if assigned is a child under this area). | General folders, sidebar folders. |
| **`hasAccess(permission)`** | **Combined check** (`has \|\| hasAreaAccess`). | Layout route guards, top-level layout pages. |
| **`hasAll([...])`** | Evaluates if **all** listed permission keys pass `has()`. | Complex multi-operation views. |
| **`hasAny([...])`** | Evaluates if **any** listed permission keys pass `has()`. | Cross-functional workspaces. |

---

## 4. Gating Integration Levels

Integrating permissions in the frontend is separated into **Five Levels** of granularity:

### Level 1: Sidebar Gating (`EmployeeSidebar.jsx`)
Determines if high-level folders and dashboard links are rendered in the navigation panel.
* **Method**: Use `hasAccess(permissionCode)` internally.
* **Example**:
  ```javascript
  const sidebarItems = [
    {
      id: "hr_attendance",
      permission: "hrms.attendance", // Checks if user has attendance or any sub-action
      label: "Attendance",
      path: "/employee/hr/attendanceuser",
    }
  ].filter(child => hasAccess(child.permission));
  ```

### Level 2: Route Gating (`RoutePermissionGuard.jsx` / `EmployeeRoutes.jsx`)
Blocks manual URL entries and protects entire routing subtrees.
* **Method**: Wrap routes using `RoutePermissionGuard` which evaluates `hasAccess(permission)`.
* **Example**:
  ```javascript
  <Route element={<RoutePermissionGuard permission="hrms.attendance" />}>
    <Route path="hr/attendanceuser" element={<AttendanceTabs />} />
  </Route>
  ```

### Level 3: Layout Tab Gating (`AttendanceCloudsat.jsx` / `AttendanceTabs.jsx`)
Controls which workflow tabs are visible to a user once they are inside a module.
* **Method**: Filter the tabs array with `hasAccess`.
* **Example**:
  ```javascript
  const filteredTabs = tabs.filter(tab => {
    if (tab.id === "mispunch") {
      return hasAccess("hrms.attendance.daily_punch");
    }
    return true; // Keep other standard tabs visible
  });
  ```

### Level 4: Component / UI Panel Gating (`Attendance2.jsx`)
Hides entire sections, cards, or read layouts if the user has no view rights for that component.
* **Method**: Evaluate standard `has` checks for the specific leaf view key.
* **Example**:
  ```javascript
  const canViewQr = has("hrms.attendance.daily_punch.qr.view");
  
  return (
    <div>
      {canViewQr ? <QrCard /> : <AccessDeniedPlaceholder />}
    </div>
  );
  ```

### Level 5: Modal & Button Gating (`GeofenceExemptionsModal.jsx` / Forms)
Guards direct actions (Create, Edit, Delete) to prevent unauthorized database writes.
* **Method**: Wrap buttons with strict `has` checks.
* **Example**:
  ```javascript
  const canCreate = has("hrms.attendance.daily_punch.geofence.create");
  
  return (
    <div>
      {canCreate && <button onClick={openForm}>Add Exemption</button>}
    </div>
  );
  ```

---

## 5. Global Admin Overrides (Automatic Bypass)

To ensure administrators are never locked out of shared layouts and dashboard components:

1. The hook extracts the active user profile from `sessionStorage` (inspecting `adminUser`, `user`, `hrmsUserData`, or `employeeUser`).
2. It detects if the user is a super-admin or global administrator by checking:
   * Presence of `sessionStorage.getItem("adminUser")`.
   * Roles matching `admin`, `superadmin`, or `super_admin`.
   * Explicit boolean flags like `parsed.isSuperAdmin === true` or `parsed.isGlobal === true`.
3. If `isUserAdmin` is true, **all checks automatically return `true` immediately**, bypassing key checking entirely.
