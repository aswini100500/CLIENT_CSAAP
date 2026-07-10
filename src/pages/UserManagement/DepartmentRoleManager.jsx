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
    <div className="p-6 lg:p-10 bg-[#FDFDFF] min-h-screen relative font-sans">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "1rem",
            background: "#333",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
          },
        }}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Building2 className="text-blue-600" size={32} />
          Corporate Structure
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-sm">
          Manage company departments and define both departmental and global
          roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                {editingDeptId ? <Edit2 size={20} /> : <Building2 size={20} />}
              </div>
              <h2 className="text-lg font-black text-slate-800">
                {editingDeptId ? "Edit Department" : "Add Department"}
              </h2>
            </div>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g., Software Development"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDept || !deptName.trim()}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none"
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
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 tracking-tight">
                Active Departments
              </h2>
            </div>
            <div className="p-2">
              {isDeptsLoading ? (
                <div className="py-10 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-blue-600"
                    size={24}
                  />
                </div>
              ) : departments.length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-slate-400">
                  No departments found.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group border border-transparent hover:border-slate-100"
                    >
                      <span className="text-sm font-bold text-slate-700 ml-2">
                        {dept.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditDept(dept)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
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
          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                {editingRoleId ? <Edit2 size={20} /> : <Shield size={20} />}
              </div>
              <h2 className="text-lg font-black text-slate-800">
                {editingRoleId ? "Edit Role" : "Add System Role"}
              </h2>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-4">
              {!editingRoleId && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Assign to Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-50 focus:border-amber-300 outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="font-bold text-amber-600">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Tech Lead"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-50 focus:border-amber-300 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingRole || !roleName.trim()}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none"
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
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-800 tracking-tight">
                Active Roles
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-200">
                Total: {roles.length}
              </span>
            </div>

            <div className="p-2 max-h-125 overflow-y-auto">
              {isRolesLoading ? (
                <div className="py-10 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-amber-500"
                    size={24}
                  />
                </div>
              ) : roles.length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-slate-400">
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
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group border border-transparent hover:border-slate-100"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 ml-2">
                            {getRoleName(role)}
                          </p>
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ml-2 mt-0.5 flex items-center gap-1 ${isGlobal ? "text-amber-500" : "text-slate-400"}`}
                          >
                            {isGlobal ? (
                              <Globe size={10} />
                            ) : (
                              <Building2 size={10} />
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
