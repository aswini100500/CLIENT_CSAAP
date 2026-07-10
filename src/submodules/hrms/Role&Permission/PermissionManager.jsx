import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import {
  Key,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  X,
  CheckSquare,
  Square,
  Layers,
  Info,
  Search,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { store } from "../../../store/store";

const API_URL = import.meta.env.VITE_ACCOUNTING_URL;

const getAuthHeaders = () => {
  const token = store.getState().user?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

const fetcher = (url) =>
  axios.get(url, getAuthHeaders()).then((res) => res.data);

const PermissionManager = () => {
  const permissionsApiUrl = `${API_URL}/api/tenant/permissions`;
  const rolesApiUrl = `${API_URL}/api/tenant/departments/roles`;

  const { data: permsData, isLoading: isPermsLoading } = useSWR(
    permissionsApiUrl,
    fetcher,
  );
  const { data: rolesData, isLoading: isRolesLoading } = useSWR(
    rolesApiUrl,
    fetcher,
  );

  const permissions = permsData?.data || [];
  const roles = rolesData?.data || [];

  const [formData, setFormData] = useState({
    module: "",
    action: "",
    code: "",
    description: "",
  });
  const [editingPermId, setEditingPermId] = useState(null);

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [assignedCodes, setAssignedCodes] = useState([]);

  const [masterSearch, setMasterSearch] = useState("");
  const [matrixSearch, setMatrixSearch] = useState("");

  const [isSubmittingPerm, setIsSubmittingPerm] = useState(false);
  const [isLoadingRolePerms, setIsLoadingRolePerms] = useState(false);
  const [isSavingRolePerms, setIsSavingRolePerms] = useState(false);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      acc[perm.module] = acc[perm.module] || [];
      acc[perm.module].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  const filteredMasterPermissions = useMemo(() => {
    if (!masterSearch) return groupedPermissions;
    const search = masterSearch.toLowerCase();
    return Object.keys(groupedPermissions).reduce((acc, module) => {
      const moduleMatch = module.toLowerCase().includes(search);
      const filteredPerms = groupedPermissions[module].filter(
        (perm) =>
          perm.action.toLowerCase().includes(search) ||
          perm.code.toLowerCase().includes(search) ||
          (perm.description && perm.description.toLowerCase().includes(search)),
      );

      if (moduleMatch || filteredPerms.length > 0) {
        acc[module] = moduleMatch ? groupedPermissions[module] : filteredPerms;
      }
      return acc;
    }, {});
  }, [groupedPermissions, masterSearch]);

  const filteredMatrixPermissions = useMemo(() => {
    const activeModules = Object.keys(groupedPermissions).filter(
      (module) => selectedModule === "All" || module === selectedModule,
    );

    if (!matrixSearch) {
      return activeModules.reduce((acc, module) => {
        acc[module] = groupedPermissions[module];
        return acc;
      }, {});
    }

    const search = matrixSearch.toLowerCase();
    return activeModules.reduce((acc, module) => {
      const moduleMatch = module.toLowerCase().includes(search);
      const filteredPerms = groupedPermissions[module].filter(
        (perm) =>
          perm.action.toLowerCase().includes(search) ||
          perm.code.toLowerCase().includes(search) ||
          (perm.description && perm.description.toLowerCase().includes(search)),
      );

      if (moduleMatch || filteredPerms.length > 0) {
        acc[module] = moduleMatch ? groupedPermissions[module] : filteredPerms;
      }
      return acc;
    }, {});
  }, [groupedPermissions, matrixSearch, selectedModule]);

  useEffect(() => {
    if (!editingPermId && formData.module && formData.action) {
      const autoCode = `${formData.module.toLowerCase().replace(/\s+/g, "")}.${formData.action.toLowerCase().replace(/\s+/g, "")}`;
      setFormData((prev) => ({ ...prev, code: autoCode }));
    }
  }, [formData.module, formData.action, editingPermId]);

  useEffect(() => {
    if (!selectedRoleId) {
      setAssignedCodes([]);
      setSelectedModule("All");
      return;
    }
    setSelectedModule("All");

    const fetchRolePerms = async () => {
      setIsLoadingRolePerms(true);
      try {
        const res = await axios.get(
          `${permissionsApiUrl}/role/${selectedRoleId}`,
          getAuthHeaders(),
        );
        setAssignedCodes(res.data.permissions || []);
      } catch (error) {
        toast.error("Failed to load role permissions.");
      } finally {
        setIsLoadingRolePerms(false);
      }
    };
    fetchRolePerms();
  }, [selectedRoleId, permissionsApiUrl]);

  const handlePermSubmit = async (e) => {
    e.preventDefault();
    if (!formData.module || !formData.action || !formData.code) {
      return toast.error("Module, action, and code are required.");
    }

    setIsSubmittingPerm(true);
    const toastId = toast.loading(
      editingPermId ? "Updating permission..." : "Adding permission...",
    );

    try {
      if (editingPermId) {
        await axios.put(
          `${permissionsApiUrl}/${editingPermId}`,
          formData,
          getAuthHeaders(),
        );
        toast.success("Permission updated!", { id: toastId });
      } else {
        await axios.post(permissionsApiUrl, formData, getAuthHeaders());
        toast.success("Permission added!", { id: toastId });
      }

      setFormData({ module: "", action: "", code: "", description: "" });
      setEditingPermId(null);
      mutate(permissionsApiUrl);

      if (editingPermId && selectedRoleId)
        mutate(`${permissionsApiUrl}/role/${selectedRoleId}`);
    } catch (error) {
      const msg =
        error.response?.status === 409
          ? "This code already exists."
          : "Failed to save permission.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmittingPerm(false);
    }
  };

  const handleEditPerm = (perm) => {
    setFormData({
      module: perm.module,
      action: perm.action,
      code: perm.code,
      description: perm.description || "",
    });
    setEditingPermId(perm.id);
  };

  const cancelEditPerm = () => {
    setFormData({ module: "", action: "", code: "", description: "" });
    setEditingPermId(null);
  };

  const handleDeletePerm = async (id) => {
    if (
      !window.confirm(
        "WARNING: This will permanently remove this permission from all roles. Continue?",
      )
    )
      return;

    const toastId = toast.loading("Deleting permission...");
    try {
      await axios.delete(`${permissionsApiUrl}/${id}`, getAuthHeaders());
      toast.success("Permission deleted.", { id: toastId });
      mutate(permissionsApiUrl);
      if (selectedRoleId) {
        const res = await axios.get(
          `${permissionsApiUrl}/role/${selectedRoleId}`,
          getAuthHeaders(),
        );
        setAssignedCodes(res.data.permissions || []);
      }
    } catch (error) {
      toast.error("Failed to delete permission.", { id: toastId });
    }
  };

  const handleToggleCode = (code) => {
    setAssignedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSaveRolePerms = async () => {
    if (!selectedRoleId) return toast.error("Please select a role first.");

    setIsSavingRolePerms(true);
    const toastId = toast.loading("Saving role permissions...");

    try {
      await axios.put(
        `${permissionsApiUrl}/role/${selectedRoleId}`,
        { permissions: assignedCodes },
        getAuthHeaders(),
      );
      toast.success("Role permissions saved successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to save role permissions.", { id: toastId });
    } finally {
      setIsSavingRolePerms(false);
    }
  };

  const handleSelectAllInModule = (moduleName, customCodes = null) => {
    const moduleCodes =
      customCodes || groupedPermissions[moduleName].map((p) => p.code);
    const allAssigned = moduleCodes.every((code) =>
      assignedCodes.includes(code),
    );

    if (allAssigned) {
      setAssignedCodes((prev) =>
        prev.filter((code) => !moduleCodes.includes(code)),
      );
    } else {
      setAssignedCodes((prev) => [...new Set([...prev, ...moduleCodes])]);
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
          <Key className="text-indigo-600" size={32} />
          Access & Permissions
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-sm">
          Define system capabilities and assign them to specific company roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                {editingPermId ? <Edit2 size={20} /> : <Layers size={20} />}
              </div>
              <h2 className="text-lg font-black text-slate-800">
                {editingPermId ? "Edit Master Key" : "New Master Key"}
              </h2>
            </div>

            <form onSubmit={handlePermSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Module
                  </label>
                  <input
                    type="text"
                    value={formData.module}
                    onChange={(e) =>
                      setFormData({ ...formData, module: e.target.value })
                    }
                    placeholder="e.g., Projects"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Action
                  </label>
                  <input
                    type="text"
                    value={formData.action}
                    onChange={(e) =>
                      setFormData({ ...formData, action: e.target.value })
                    }
                    placeholder="e.g., Create"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                  Unique Code{" "}
                  <span className="text-indigo-400 font-normal italic lowercase">
                    Auto-generated
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., projects.create"
                  required
                  className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What does this allow the user to do?"
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPerm}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                >
                  {isSubmittingPerm ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingPermId ? (
                    <Save size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingPermId ? "Update Key" : "Create Key"}
                </button>
                {editingPermId && (
                  <button
                    type="button"
                    onClick={cancelEditPerm}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all active:scale-95"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 tracking-tight">
                  Master Directory
                </h2>
                <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {permissions.length} Keys
                </div>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search directory..."
                  value={masterSearch}
                  onChange={(e) => setMasterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all"
                />
              </div>
            </div>
            <div className="p-3 max-h-100 overflow-y-auto">
              {isPermsLoading ? (
                <div className="py-10 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-indigo-600"
                    size={24}
                  />
                </div>
              ) : Object.keys(filteredMasterPermissions).length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-slate-400">
                  {masterSearch
                    ? "No matches found."
                    : "No permissions created yet."}
                </div>
              ) : (
                Object.keys(filteredMasterPermissions).map((module) => (
                  <div key={module} className="mb-4 last:mb-0">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">
                      {module}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {filteredMasterPermissions[module].map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              {perm.action}
                            </p>
                            <p className="text-[9px] font-mono text-indigo-400 mt-0.5">
                              {perm.code}
                            </p>
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditPerm(perm)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeletePerm(perm.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-4xl shadow-sm border border-slate-100 flex flex-col h-full min-h-150">
          <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col gap-6 bg-slate-50/30 rounded-t-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    Role Policy Matrix
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Assign permissions to roles
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-50 focus:border-amber-300 outline-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="" disabled>
                      -- Select a Role --
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}{" "}
                        {role.department_name
                          ? `(${role.department_name})`
                          : "(Global)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-48">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    disabled={!selectedRoleId}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="All">All Modules</option>
                    {Object.keys(groupedPermissions)
                      .sort()
                      .map((module) => (
                        <option key={module} value={module}>
                          {module}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div
              className={`relative transition-all ${selectedRoleId ? "opacity-100" : "opacity-50 pointer-events-none"}`}
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search permissions by action, code, or description..."
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-amber-50 focus:border-amber-300 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-slate-50/10">
            {!selectedRoleId ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 pt-10">
                <Shield size={64} className="mb-4" />
                <h3 className="text-lg font-black">Select a Role</h3>
                <p className="text-sm font-medium">
                  Choose a role from the dropdown to edit its permissions.
                </p>
              </div>
            ) : isLoadingRolePerms ? (
              <div className="py-20 text-center">
                <Loader2
                  className="animate-spin mx-auto text-amber-500"
                  size={32}
                />
              </div>
            ) : Object.keys(filteredMatrixPermissions).length === 0 ? (
              <div className="py-20 text-center font-bold text-slate-400">
                {matrixSearch
                  ? "No matching permissions found."
                  : "No master permissions available. Create some first!"}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(filteredMatrixPermissions).map((module) => {
                  const moduleCodes = filteredMatrixPermissions[module].map(
                    (p) => p.code,
                  );
                  const allAssigned = moduleCodes.every((code) =>
                    assignedCodes.includes(code),
                  );
                  const someAssigned = moduleCodes.some((code) =>
                    assignedCodes.includes(code),
                  );

                  return (
                    <div
                      key={module}
                      className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                    >
                      <div
                        className={`p-4 border-b flex justify-between items-center cursor-pointer transition-colors ${someAssigned ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50/50 border-slate-100"}`}
                        onClick={() =>
                          handleSelectAllInModule(module, moduleCodes)
                        }
                      >
                        <h3
                          className={`text-sm font-black uppercase tracking-widest ${someAssigned ? "text-indigo-900" : "text-slate-600"}`}
                        >
                          Module: {module}
                        </h3>
                        <button
                          type="button"
                          className={`flex items-center gap-2 text-xs font-bold transition-colors ${allAssigned ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          {allAssigned ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                          Select All
                        </button>
                      </div>

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filteredMatrixPermissions[module].map((perm) => {
                          const isChecked = assignedCodes.includes(perm.code);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"}`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCode(perm.code)}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-bold ${isChecked ? "text-indigo-900" : "text-slate-700"}`}
                                >
                                  {perm.action}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                                  {perm.code}
                                </span>
                                {perm.description && (
                                  <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-start gap-1">
                                    <Info
                                      size={12}
                                      className="shrink-0 mt-0.5"
                                    />{" "}
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white rounded-b-4xl flex justify-end items-center gap-4">
            <span className="text-xs font-bold text-slate-400">
              {assignedCodes.length} permissions granted
            </span>
            <button
              onClick={handleSaveRolePerms}
              disabled={!selectedRoleId || isSavingRolePerms}
              className="py-3 px-8 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              {isSavingRolePerms ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Role Matrix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;
