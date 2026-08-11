import React, { useState } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import {
  Key,
  Search,
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
  Loader2,
  Layers,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { hrmsPermissions } from "../../utils/hrmsPermissions";
import useAuth from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_CSAAP_URL?.replace(/\/$/, "");

const fetcher = ([url, token]) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const getPermissionCode = (permission) =>
  permission.code ||
  `${permission.module.toLowerCase()}.${permission.action.toLowerCase()}`;

const getRoleName = (role) => role.role_name || role.name || "Untitled Role";
const EMPTY_ARRAY = [];

const PermissionManager = () => {
  const { token } = useAuth();
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const permissionsApiUrl = `${API_URL}/api/tenant/permissions`;
  const rolesApiUrl = `${API_URL}/api/tenant/departments/roles`;

  const { data: permsData, isLoading: isPermsLoading } = useSWR(
    token ? [permissionsApiUrl, token] : null,
    fetcher,
  );
  const { data: rolesData } = useSWR(
    token ? [rolesApiUrl, token] : null,
    fetcher,
  );

  const permissions = permsData?.data || EMPTY_ARRAY;
  const roles = rolesData?.data || EMPTY_ARRAY;

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

  const groupedPermissions = React.useMemo(() => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  const filteredMasterPermissions = React.useMemo(() => {
    if (!masterSearch) return groupedPermissions;
    const search = masterSearch.toLowerCase();
    return Object.keys(groupedPermissions).reduce((acc, module) => {
      const filtered = groupedPermissions[module].filter(
        (perm) =>
          perm.action.toLowerCase().includes(search) ||
          perm.code.toLowerCase().includes(search) ||
          perm.description?.toLowerCase().includes(search),
      );
      if (filtered.length > 0) acc[module] = filtered;
      return acc;
    }, {});
  }, [groupedPermissions, masterSearch]);

  const filteredMatrixPermissions = React.useMemo(() => {
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
      const filtered = groupedPermissions[module].filter(
        (perm) =>
          perm.action.toLowerCase().includes(search) ||
          perm.code.toLowerCase().includes(search) ||
          perm.description?.toLowerCase().includes(search),
      );
      if (filtered.length > 0) acc[module] = filtered;
      return acc;
    }, {});
  }, [groupedPermissions, matrixSearch, selectedModule]);

  React.useEffect(() => {
    if (!editingPermId && formData.module && formData.action) {
      const generated = `${formData.module.toLowerCase()}.${formData.action.toLowerCase()}`;
      setFormData((prev) => ({ ...prev, code: generated }));
    }
  }, [formData.module, formData.action, editingPermId]);

  React.useEffect(() => {
    if (!selectedRoleId) return;
    setSelectedModule("All");

    const fetchRolePerms = async () => {
      setIsLoadingRolePerms(true);
      try {
        const response = await axios.get(
          `${permissionsApiUrl}/role/${selectedRoleId}`,
          getAuthHeaders(),
        );
        setAssignedCodes(response.data?.permissions || []);
      } catch (error) {
        console.error("Failed to fetch role permissions", error);
        toast.error("Failed to load role permissions.");
      } finally {
        setIsLoadingRolePerms(false);
      }
    };
    fetchRolePerms();
  }, [selectedRoleId, permissionsApiUrl]);

  const handlePermSubmit = async (e) => {
    e.preventDefault();
    if (!formData.module || !formData.action) {
      return toast.error("Module and Action are required.");
    }

    setIsSubmittingPerm(true);
    const toastId = toast.loading(
      editingPermId ? "Updating permission..." : "Adding permission...",
    );

    try {
      const payload = {
        module: formData.module,
        action: formData.action,
        code: formData.code,
        description: formData.description,
      };

      if (editingPermId) {
        await axios.put(
          `${permissionsApiUrl}/${editingPermId}`,
          payload,
          getAuthHeaders(),
        );
        toast.success("Permission updated successfully!", { id: toastId });
      } else {
        await axios.post(permissionsApiUrl, payload, getAuthHeaders());
        toast.success("Permission created successfully!", { id: toastId });
      }
      setFormData({ module: "", action: "", code: "", description: "" });
      setEditingPermId(null);
      mutate(permissionsApiUrl);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save permission.",
        { id: toastId },
      );
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
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete permission.",
        { id: toastId },
      );
    }
  };

  const handleSeedHrmsPermissions = async () => {
    if (
      !window.confirm(
        "This will add all HRMS permissions to the database. Continue?",
      )
    )
      return;
    setIsSubmittingPerm(true);
    const toastId = toast.loading("Seeding HRMS permissions...");
    try {
      let successCount = 0;
      for (const perm of hrmsPermissions) {
        try {
          await axios.post(permissionsApiUrl, perm, getAuthHeaders());
          successCount++;
        } catch (err) {
          console.warn(`Failed to seed ${perm.code}`, err);
        }
      }
      toast.success(`Successfully seeded ${successCount} HRMS permissions!`, {
        id: toastId,
      });
      mutate(permissionsApiUrl);
    } catch (error) {
      toast.error("An error occurred during seeding.", { id: toastId });
    } finally {
      setIsSubmittingPerm(false);
    }
  };

  const handleToggleCode = (code) => {
    setAssignedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSaveRolePerms = async () => {
    if (!selectedRoleId) return toast.error("Select a role first.");

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
      toast.error(
        error.response?.data?.message || "Failed to save role permissions.",
        { id: toastId },
      );
    } finally {
      setIsSavingRolePerms(false);
    }
  };

  const handleSelectAllInModule = (moduleName, customCodes = null) => {
    const moduleCodes =
      customCodes || groupedPermissions[moduleName].map(getPermissionCode);
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
          <Key className="text-[var(--brand)]" size={28} />
          Access & Permissions
        </h1>
        <p className="app-subtitle mt-1">
          Define system capabilities and assign them to specific company roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="app-panel p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand-strong)]">
                  {editingPermId ? <Edit2 size={20} /> : <Layers size={20} />}
                </div>
                <h2 className="app-heading">
                  {editingPermId ? "Edit Master Key" : "New Master Key"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSeedHrmsPermissions}
                disabled={isSubmittingPerm}
                className="px-3 py-1.5 bg-[var(--brand-soft)] hover:bg-[var(--border-strong)] text-[var(--brand-strong)] text-xs font-bold rounded-lg transition-colors border border-[var(--border-soft)]"
                title="Seed HRMS Permissions"
              >
                Seed HRMS
              </button>
            </div>

            <form onSubmit={handlePermSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="app-label block mb-1.5">
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
                    className="app-input w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="app-label block mb-1.5">
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
                    className="app-input w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="app-label flex justify-between mb-1.5">
                  Unique Code{" "}
                  <span className="text-[var(--brand-strong)] font-normal italic lowercase">
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
                  className="app-input w-full !bg-[var(--bg-subtle)] !border-[var(--border-soft)] !text-[var(--text-strong)]"
                />
              </div>

              <div className="space-y-2">
                <label className="app-label block mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What does this allow the user to do?"
                  rows="2"
                  className="app-input w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPerm}
                  className="app-btn-primary flex-1 flex items-center justify-center gap-2"
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
                    className="app-btn-secondary px-4 !min-h-[44px]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="app-panel overflow-hidden flex-1 bg-white">
            <div className="p-5 border-b border-[var(--border-soft)] bg-[var(--bg-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="app-heading">
                  Master Directory
                </h2>
                <div className="text-[10px] font-bold text-[var(--brand-strong)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-full border border-[var(--border-soft)]">
                  {permissions.length} Keys
                </div>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search directory..."
                  value={masterSearch}
                  onChange={(e) => setMasterSearch(e.target.value)}
                  className="app-input w-full pl-9"
                />
              </div>
            </div>
            <div className="p-3 max-h-100 overflow-y-auto">
              {isPermsLoading ? (
                <div className="py-10 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-[var(--brand)]"
                    size={24}
                  />
                </div>
              ) : Object.keys(filteredMasterPermissions).length === 0 ? (
                <div className="py-10 text-center text-sm font-bold text-[var(--text-faint)]">
                  {masterSearch
                    ? "No matches found."
                    : "No permissions created yet."}
                </div>
              ) : (
                Object.keys(filteredMasterPermissions).map((module) => (
                  <div key={module} className="mb-4 last:mb-0">
                    <h3 className="text-[10px] font-black text-[var(--text-soft)] uppercase tracking-widest mb-2 px-2">
                      {module}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {filteredMasterPermissions[module].map((perm) => {
                        const code = getPermissionCode(perm);
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between p-2 hover:bg-[var(--bg-subtle)] rounded-lg group transition-colors"
                          >
                            <div>
                              <p className="text-xs font-bold text-[var(--text-strong)]">
                                {perm.action}
                              </p>
                              <p className="text-[9px] font-mono text-[var(--brand-strong)] mt-0.5">
                                {code}
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
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 app-panel flex flex-col h-full min-h-150 overflow-hidden bg-white">
          <div className="p-6 sm:p-8 border-b border-[var(--border-soft)] flex flex-col gap-6 bg-[var(--bg-subtle)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="app-heading">
                  Role Policy Matrix
                </h2>
                <p className="app-subtitle mt-0.5 text-xs">
                  Assign permissions to roles
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="app-input w-full cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Select a Role --
                    </option>
                    {roles.map((role) => {
                      const isGlobal =
                        !role.department_id &&
                        role.department_name === "Global";
                      return (
                        <option key={role.id} value={role.id}>
                          {getRoleName(role)}{" "}
                          {isGlobal
                            ? "(Global)"
                            : `(${role.department_name || "Department"})`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="w-full sm:w-48">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    disabled={!selectedRoleId}
                    className="app-input w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search permissions by action, code, or description..."
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                className="app-input w-full pl-12"
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-[var(--bg-app)]/50">
            {!selectedRoleId ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-faint)] opacity-80 pt-10">
                <Layers size={64} className="mb-4 text-[var(--brand-strong)] opacity-30" />
                <h3 className="text-lg font-bold text-[var(--text-strong)]">Select a Role</h3>
                <p className="text-sm text-[var(--text-soft)]">
                  Choose a role from the dropdown to edit its permissions.
                </p>
              </div>
            ) : isLoadingRolePerms ? (
              <div className="py-20 text-center">
                <Loader2
                  className="animate-spin mx-auto text-[var(--brand)]"
                  size={32}
                />
              </div>
            ) : Object.keys(filteredMatrixPermissions).length === 0 ? (
              <div className="py-20 text-center font-bold text-[var(--text-soft)]">
                {matrixSearch
                  ? "No matching permissions found."
                  : "No master permissions available. Create some first!"}
              </div>
            ) : (
              <div className="space-y-8">
                {(() => {
                  const allModules = Object.keys(filteredMatrixPermissions);
                  return allModules.map((module) => {
                    const moduleCodes =
                      filteredMatrixPermissions[module].map(getPermissionCode);
                    return (
                      <div key={module} className="bg-white p-5 rounded-2xl border border-[var(--border-soft)] shadow-sm">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border-soft)]">
                          <input
                            type="checkbox"
                            checked={moduleCodes.every((code) =>
                              assignedCodes.includes(code),
                            )}
                            onChange={() =>
                              handleSelectAllInModule(module, moduleCodes)
                            }
                            className="w-4 h-4 cursor-pointer accent-[var(--brand)]"
                          />
                          <h3 className="text-sm font-bold text-[var(--text-strong)]">
                            {module}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                          {filteredMatrixPermissions[module].map((perm) => {
                            const code = getPermissionCode(perm);
                            return (
                              <label
                                key={perm.id}
                                className="flex items-start gap-3 p-3 hover:bg-[var(--bg-subtle)] rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[var(--border-strong)]"
                              >
                                <input
                                  type="checkbox"
                                  checked={assignedCodes.includes(code)}
                                  onChange={() => handleToggleCode(code)}
                                  className="w-4 h-4 mt-1 cursor-pointer accent-[var(--brand)]"
                                />
                                <div>
                                  <p className="text-sm font-bold text-[var(--text-strong)]">
                                    {perm.action}
                                  </p>
                                  <p className="text-xs text-[var(--brand-strong)] font-mono">
                                    {code}
                                  </p>
                                  {perm.description && (
                                    <p className="text-xs text-[var(--text-soft)] mt-1">
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
                  });
                })()}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[var(--border-soft)] bg-white flex justify-end items-center gap-4">
            <span className="text-xs font-bold text-[var(--text-soft)]">
              {assignedCodes.length} permissions granted
            </span>
            <button
              onClick={handleSaveRolePerms}
              disabled={!selectedRoleId || isSavingRolePerms}
              className="app-btn-primary py-3 px-8 flex items-center justify-center gap-2"
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
