import React, { useState } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import {
  Building2,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  X,
  Globe,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_CSAAP_URL?.replace(/\/$/, "");

const fetcher = ([url, token]) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const getRoleName = (role) => role.role_name || role.name || "";
const getRoleDepartmentId = (role) =>
  role.department_id || role.departmentId || "";
const getRoleDepartmentName = (role) =>
  role.department_name || role.departmentName || "Global";

const DepartmentRoleManager = () => {
  const { token } = useAuth();
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const deptsApiUrl = `${API_URL}/api/tenant/departments`;
  const rolesApiUrl = `${API_URL}/api/tenant/departments/roles`;

  const { data: deptsData, isLoading: isDeptsLoading } = useSWR(
    token ? [deptsApiUrl, token] : null,
    fetcher,
  );
  const { data: rolesData, isLoading: isRolesLoading } = useSWR(
    token ? [rolesApiUrl, token] : null,
    fetcher,
  );

  const departments = deptsData?.data || [];
  const roles = rolesData?.data || [];

  const [deptName, setDeptName] = useState("");
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return toast.error("Department name is required.");

    setIsSubmittingDept(true);
    const toastId = toast.loading(
      editingDeptId ? "Updating department..." : "Adding department...",
    );

    try {
      if (editingDeptId) {
        await axios.put(
          `${deptsApiUrl}/${editingDeptId}`,
          { name: deptName },
          getAuthHeaders(),
        );
        toast.success("Department updated successfully!", { id: toastId });
      } else {
        await axios.post(deptsApiUrl, { name: deptName }, getAuthHeaders());
        toast.success("Department added successfully!", { id: toastId });
      }

      setDeptName("");
      setEditingDeptId(null);
      mutate(deptsApiUrl);
      mutate(rolesApiUrl);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("This department already exists.", { id: toastId });
      } else {
        toast.error("Failed to save department.", { id: toastId });
      }
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleEditDept = (dept) => {
    setDeptName(dept.name);
    setEditingDeptId(dept.id);
  };

  const cancelEditDept = () => {
    setDeptName("");
    setEditingDeptId(null);
  };

  const handleDeleteDept = async (id) => {
    if (
      !window.confirm(
        "WARNING: Deleting this department will also delete all roles inside it. Are you sure?",
      )
    )
      return;

    const toastId = toast.loading("Deleting department...");
    try {
      await axios.delete(`${deptsApiUrl}/${id}`, getAuthHeaders());
      toast.success("Department deleted.", { id: toastId });
      mutate(deptsApiUrl);
      mutate(rolesApiUrl);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete department.",
        { id: toastId },
      );
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return toast.error("Role name is required.");

    setIsSubmittingRole(true);
    const toastId = toast.loading(
      editingRoleId ? "Updating role..." : "Adding role...",
    );

    try {
      if (editingRoleId) {
        await axios.put(
          `${rolesApiUrl}/${editingRoleId}`,
          { role_name: roleName },
          getAuthHeaders(),
        );
        toast.success("Role updated successfully!", { id: toastId });
      } else {
        const payload = {
          department_id: selectedDeptId === "" ? null : selectedDeptId,
          role_name: roleName,
        };
        await axios.post(rolesApiUrl, payload, getAuthHeaders());
        toast.success("Role added successfully!", { id: toastId });
      }

      setRoleName("");
      setSelectedDeptId("");
      setEditingRoleId(null);
      mutate(rolesApiUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save role.", {
        id: toastId,
      });
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleEditRole = (role) => {
    setRoleName(getRoleName(role));
    setEditingRoleId(role.id);
  };

  const cancelEditRole = () => {
    setRoleName("");
    setSelectedDeptId("");
    setEditingRoleId(null);
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    const toastId = toast.loading("Deleting role...");
    try {
      await axios.delete(`${rolesApiUrl}/${id}`, getAuthHeaders());
      toast.success("Role deleted.", { id: toastId });
      mutate(rolesApiUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete role.", {
        id: toastId,
      });
    }
  };

  return (
    <div className="erp-root min-h-screen p-6 bg-[var(--bg-app)] relative">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "1rem",
            background: "var(--text-strong)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
          },
        }}
      />

      <div className="mb-8">
        <h1 className="app-title flex items-center gap-3">
          <Building2 className="text-[var(--brand)]" size={28} />
          Corporate Structure
        </h1>
        <p className="app-subtitle mt-1">
          Manage company departments and define both departmental and global roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="app-panel p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand-strong)]">
                {editingDeptId ? <Edit2 size={20} /> : <Building2 size={20} />}
              </div>
              <h2 className="app-heading">
                {editingDeptId ? "Edit Department" : "Add Department"}
              </h2>
            </div>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="app-label block mb-1.5">
                  Department Name
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g., Software Development"
                  required
                  className="app-input w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDept || !deptName.trim()}
                  className="app-btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmittingDept ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingDeptId ? (
                    <Save size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingDeptId ? "Update" : "Add Department"}
                </button>
                {editingDeptId && (
                  <button
                    type="button"
                    onClick={cancelEditDept}
                    className="app-btn-secondary px-4 !min-h-[44px]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="app-panel overflow-hidden flex-1 bg-white">
            <div className="p-6 border-b border-[var(--border-soft)] bg-[var(--bg-subtle)]">
              <h2 className="app-heading">
                Active Departments
              </h2>
            </div>
            <div className="p-2">
              {isDeptsLoading ? (
                <div className="py-10 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-[var(--brand)]"
                    size={24}
                  />
                </div>
              ) : departments.length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-[var(--text-faint)]">
                  No departments found.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-3 hover:bg-[var(--bg-subtle)] rounded-xl transition-colors group border border-transparent hover:border-[var(--border-soft)]"
                    >
                      <span className="text-sm font-bold text-[var(--text-strong)] ml-2">
                        {dept.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditDept(dept)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDept(dept.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="app-panel p-6 sm:p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand-strong)]">
                {editingRoleId ? <Edit2 size={20} /> : <Shield size={20} />}
              </div>
              <h2 className="app-heading">
                {editingRoleId ? "Edit Role" : "Add System Role"}
              </h2>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-4">
              {!editingRoleId && (
                <div className="space-y-2">
                  <label className="app-label block mb-1.5">
                    Assign to Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="app-input w-full cursor-pointer"
                  >
                    <option value="" className="font-bold text-[var(--brand-strong)]">
                      Global Role (No Department)
                    </option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="app-label block mb-1.5">
                  Role Name
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Tech Lead"
                  required
                  className="app-input w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingRole || !roleName.trim()}
                  className="app-btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmittingRole ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingRoleId ? (
                    <Save size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingRoleId ? "Update Role" : "Create Role"}
                </button>
                {editingRoleId && (
                  <button
                    type="button"
                    onClick={cancelEditRole}
                    className="app-btn-secondary px-4 !min-h-[44px]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="app-panel overflow-hidden flex-1 bg-white">
            <div className="p-6 border-b border-[var(--border-soft)] bg-[var(--bg-subtle)] flex justify-between items-center">
              <h2 className="app-heading">
                Active Roles
              </h2>
              <span className="text-[10px] font-bold text-[var(--brand-strong)] bg-white px-2 py-1 rounded-md border border-[var(--border-soft)]">
                Total: {roles.length}
              </span>
            </div>

            <div className="p-2 max-h-125 overflow-y-auto">
              {isRolesLoading ? (
                <div className="py-10 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-[var(--brand)]"
                    size={24}
                  />
                </div>
              ) : roles.length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-[var(--text-faint)]">
                  No roles found.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {roles.map((role) => {
                    const roleDeptId = getRoleDepartmentId(role);
                    const isGlobal =
                      !roleDeptId && getRoleDepartmentName(role) === "Global";
                    const deptName =
                      departments.find(
                        (d) => String(d.id) === String(roleDeptId),
                      )?.name || getRoleDepartmentName(role);

                    return (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-3 hover:bg-[var(--bg-subtle)] rounded-xl transition-colors group border border-transparent hover:border-[var(--border-soft)]"
                      >
                        <div>
                          <p className="text-sm font-bold text-[var(--text-strong)] ml-2">
                            {getRoleName(role)}
                          </p>
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ml-2 mt-0.5 flex items-center gap-1 ${isGlobal ? "text-amber-600" : "text-[var(--text-soft)]"}`}
                          >
                            {isGlobal ? (
                              <Globe size={10} className="text-amber-500" />
                            ) : (
                              <Building2 size={10} className="text-[var(--brand-strong)]" />
                            )}
                            {deptName}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Name"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Role"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentRoleManager;
