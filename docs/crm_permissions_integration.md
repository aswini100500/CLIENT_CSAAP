# CRM Permission & Gating Integration Architecture

This document describes the design, structural patterns, and implementation flow used to integrate the **Role-Based Access Control (RBAC)** permissions engine into the CRM submodule of BuilderERP.

Use this document as a blueprint and code standard whenever implementing permissions or gating in new modules.

---

## 1. Core Philosophy & Gating Strategies

The gating system relies on two distinct check methods exposed by the `usePermission` hook:

### A. Layout Gates (Loose / Child-Proves-Parent Check)
* **API Hook Method:** `hasAccess(namespaceCode)`
* **Matching Nature:** Returns `true` if the user is assigned the exact namespace, a wildcard (e.g. `crm.leads.*`), or **any child permission** under that namespace (e.g. `crm.leads.new_leads.assign` matches `crm.leads`).
* **Use Case:** Top-level sidebars, route protect guards, and tab docks. Ensures users are never locked out of navigating into sections where they have active sub-permissions.

### B. Action Gates (Strict / Positive Prefix-Matching)
* **API Hook Method:** `has(permissionKey)`
* **Matching Nature:** Returns `true` only if the user's assigned scope is a direct prefix of the targeted leaf key (e.g. `crm.leads.new_leads` matches `crm.leads.new_leads.assign`, but `crm.leads.new_leads.assign` does **NOT** match `crm.leads.new_leads.delete`).
* **Use Case:** Action buttons, form submissions, delete actions, and modals. Ensures granular database write protection.

---

## 2. The 5-Level Gating Flow (Top to Bottom)

The integration is structured into five sequential layers of gating, flowing from global navigation down to local modal buttons.

```
[ Level 1: Sidebar Gate ]    --> EmployeeSidebar.jsx   (uses hasAccess)
          │
[ Level 2: Route Guard ]     --> EmployeeRoutes.jsx    (uses hasAccess)
          │
[ Level 3: Tab/Dock Gate ]   --> LeadTabsDock.jsx      (uses hasAccess)
          │
[ Level 4: Page Action Gate ]--> LeadList.jsx          (dynamic memoized checks)
          │
[ Level 5: Component Gate ]  --> LeadQueueTable.jsx    (renders callback props)
```

### Level 1: Sidebar Gating (`EmployeeSidebar.jsx`)
Determines if high-level CRM module options appear in the main navigation sidebar.
* **Logic:** Filter children using `hasAccess(permissionCode)` on parent keys.
* **Code pattern:**
  ```javascript
  const crmChildren = [
    { id: "crm_upload", permission: "crm.upload", label: "Lead Upload" },
    { id: "crm_management", permission: "crm.leads", label: "Lead Management" }
  ].filter(child => hasPermission(child.permission));
  ```

### Level 2: Route Gating (`EmployeeRoutes.jsx`)
Protects against manual browser URL entry. Protects entire routing subtrees using a route guard.
* **Logic:** Protect nested routes using `RoutePermissionGuard` with the parent namespace.
* **Code pattern:**
  ```javascript
  <Route element={<RoutePermissionGuard permission="crm.leads" />}>
    <Route path="crm/lead-management" element={<LeadList />} />
    <Route path="crm/sales-pipeline" element={<SalesPipeline />} />
  </Route>
  ```

### Level 3: Tab/Dock Gating (`LeadTabsDock.jsx`)
Controls visible workflows tabs once a user has entered the module.
* **Logic:** Filter tabs using `hasAccess()` for specific tab keys.
* **Code pattern:**
  ```javascript
  const filteredTabs = tabs.filter((tab) => {
    if (tab.key === "new") return hasAccess("crm.leads.new_leads");
    if (tab.key === "assigned") return hasAccess("crm.leads.assigned");
    if (tab.key === "followup") return hasAccess("crm.leads.followup");
    return true;
  });
  ```

### Level 4: Page Action Gating (`LeadList.jsx`)
Calculates allowed operations dynamically on the parent page based on the currently selected tab.
* **Logic:** Use `useMemo` triggered by the active tab state to compute boolean permission flags.
* **Code pattern:**
  ```javascript
  const canAssign = useMemo(() => {
    if (activeTab === "new") return has("crm.leads.new_leads.assign");
    if (activeTab === "assigned") return has("crm.leads.assigned.assign");
    return false;
  }, [activeTab, has]);
  ```

### Level 5: Component / UI Button Gating (`LeadQueueTable.jsx` & Modals)
Conditionally shows/hides individual control buttons inside tables, panels, or modals.
* **Logic:** Pass the click-handler function to the child component **only if** the permission flag is true; otherwise pass `undefined`.
* **Parent Page:**
  ```javascript
  <LeadQueueTable
    onAssignLead={canAssign ? handleAssignLead : undefined}
  />
  ```
* **Child Table Component:**
  ```javascript
  {onAssignLead && (
    <button onClick={onAssignLead}>Assign</button>
  )}
  ```

---

## 3. CRM Key Mapping & Operations Directory

The following matrix maps every layout view and action inside the CRM module to its targeted permission keys:

| Scope | UI Target / Tab | Gate Level | Check Method | Permission Key |
| :--- | :--- | :--- | :--- | :--- |
| **Global CRM** | Sidebar folder & Routes | Sidebar & Route Guard | `hasAccess` | `crm.leads`, `crm.upload`, `crm.customers`, `crm.quotation` |
| **Leads Dock** | **New Leads** Tab | Tab Dock | `hasAccess` | `crm.leads.new_leads` |
| **Leads Dock** | **Assigned** Tab | Tab Dock | `hasAccess` | `crm.leads.assigned` |
| **Leads Dock** | **Follow-up** Tab | Tab Dock | `hasAccess` | `crm.leads.followup` |
| **Leads Dock** | **Interested** Tab | Tab Dock | `hasAccess` | `crm.leads.interested` |
| **Leads Dock** | **Accepted** Tab | Tab Dock | `hasAccess` | `crm.leads.accepted` |
| **Leads Dock** | **Rejected** Tab | Tab Dock | `hasAccess` | `crm.leads.rejected` |
| **Leads Actions**| "Add Lead" Button | Dock Action | `has` | `crm.leads.create` |
| **Leads Actions**| "Export" CSV Button | Dock Action | `has` | `crm.leads.export` |
| **New Leads** | "Assign" Action | Page Action | `has` | `crm.leads.new_leads.assign` |
| **New Leads** | "Delete" Action | Page Action | `has` | `crm.leads.new_leads.delete` |
| **Assigned** | "Log Interaction" Action | Page Action | `has` | `crm.leads.assigned.interaction` |
| **Assigned** | "Transfer" Action | Page Action | `has` | `crm.leads.assigned.transfer` |
| **Follow-up** | "Log Interaction" Action | Page Action | `has` | `crm.leads.followup.interaction` |
| **Follow-up** | "Transfer" Action | Page Action | `has` | `crm.leads.followup.transfer` |
| **Interested** | "Log Interaction" Action | Page Action | `has` | `crm.leads.interested.interaction` |
| **Accepted** | "Create Payment Slab" Action| Page Action | `has` | `crm.leads.accepted.payment_slab.create` |
| **Accepted** | "View Payment Slabs" Action | Page Action | `has` | `crm.leads.accepted.payment_slab.view` |
| **Accepted** | "Create Project" Action | Page Action | `has` | `crm.leads.accepted.project.create` |
| **Accepted** | "Project Setup" Action | Page Action | `has` | `crm.leads.accepted.project.setup` |
| **Accepted** | "Customer Profile Setup" | Page Action | `has` | `crm.leads.accepted.customer.setup` |
| **Lead Upload** | "Import Leads" Action | Action Gate | `has` | `crm.upload.create` |
| **Quotation** | "Save & Export PDF" Action | Action Gate | `has` | `crm.quotation.create` |
| **Customers** | "Export CSV" Action | Action Gate | `has` | `crm.customers.export` |
| **Customers** | "Quick View / Profile" Action| Action Gate | `has` | `crm.customers.profile.view` |
| **Customers** | "Payment Ledger" Action | Action Gate | `has` | `crm.customers.ledger.view` |

---

## 4. Developer Cheat-Sheet: Implementing Permissions in a New Module

Follow these steps when implementing permissions for any new submodule:

1. **Register Layout Paths:** Protect routing entries in [EmployeeRoutes.jsx](file:///d:/Saroj/builder-erp-workspace/builder-erp-frontend/src/submodules/hrms/routes/EmployeeRoutes.jsx) using `RoutePermissionGuard` with a parent namespace (e.g. `billing`).
2. **Register Sidebar Links:** Map sidebar options in [EmployeeSidebar.jsx](file:///d:/Saroj/builder-erp-workspace/builder-erp-frontend/src/components/EmployeeSidebar.jsx) using `hasAccess("billing")`.
3. **Configure Tab/Sub-view Docks:** If the page has workflows tabs, filter the tabs array dynamically in the Dock component using `hasAccess("billing.invoices")`, etc.
4. **Derive Page Actions Dynamically:** In the parent list/container page, use `has` checks (combined with `useMemo` if actions change depending on the active tab) to verify granular user rights.
5. **Restrict Children Elements via Props:** Pass callbacks conditionally to tables and modals (`onEdit={canEdit ? handleEdit : undefined}`). Render action items in children only when props are defined.

---

## 5. Architectural Best Practice: Namespace Gating vs `.view` Keys

When implementing permissions for new submodules, **avoid creating or checking redundant `.view` leaf keys** (e.g. `crm.leads.view` or `hrms.self_service.tasks.view`) for general page access.

### Why?
1. **Loose Matching / Child-Proves-Parent Benefit**: The layout gating helper `hasAccess(namespace)` uses prefix/loose-matching under the hood. If a user is assigned any specific sub-action key (e.g. `crm.leads.create` or `hrms.self_service.tasks.update`), checking the parent namespace (e.g. `crm.leads` or `hrms.self_service.tasks`) will automatically evaluate to `true` and grant access to the layout/route.
2. **Avoiding Lockouts**: If a layout strictly checks `crm.leads.view`, a user who was granted `crm.leads.create` but was *not* explicitly granted `crm.leads.view` will be locked out of the entire page and sidebar link, despite having write permissions.
3. **Admin Simplicity**: Restricting layout checks to parent namespaces reduces the number of keys admins must assign, keeping role management simple and clear.
