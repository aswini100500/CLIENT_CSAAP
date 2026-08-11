import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import {
  Briefcase,
  MapPin,
  User,
  UserPlus,
  Trash2,
  Loader2,
  Search,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  Building,
  Crown,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_ACCOUNTING_URL;

const fetcher = ([url, token]) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const getEmployeeId = (emp) => {
  if (!emp) return "";
  const id =
    emp.id ??
    emp.employee_id ??
    emp.employeeId ??
    emp.employeeid ??
    emp.employeeProfileId;
  return id ? id.toString() : "";
};

const ProjectAssignment = () => {
  const { token, companyId } = useAuth();
  const API_BASE_URL =
    import.meta.env.VITE_CSAAP_URL || "https://csaapnodeapi.csaap.com";
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const [employees, setEmployees] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [departmentRoles, setDepartmentRoles] = useState([]);
  const [globalRoles, setGlobalRoles] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [assignmentMode, setAssignmentMode] = useState("manager");

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedProjectNames, setSelectedProjectNames] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  const assignmentsApiUrl = `${API_BASE_URL}/api/tenant/project-assignments`;
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useSWR(
    token ? [assignmentsApiUrl, token] : null,
    fetcher,
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const csaapToken = token;
        if (!csaapToken) {
          console.error("No authorization token found");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/tenant/hrms/all-employees`,
          {
            headers: { Authorization: `Bearer ${csaapToken}` },
          },
        );

        const employeesData = response.data.data || response.data || [];
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees.");
      }
    };
    if (token) {
      fetchEmployees();
    }
  }, [token]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const csaapToken = token;
        if (!csaapToken) {
          console.error("No authorization token found");
          return;
        }

        const activeCompanyId = companyId || 1;
        const response = await axios.get(
          `${API_BASE_URL}/api/tenant/clprojects`,
          {
            params: { company_id: activeCompanyId },
            headers: { Authorization: `Bearer ${csaapToken}` },
          },
        );

        const projects = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];

        const allProjectsData = projects
          .map((project) => ({
            id: project.id,
            name: project.project_name || project.name || "Unnamed Project",
            property_type: "clproject",
            display_type: "Client Project",
            locality: project.locality || "",
            city: project.city || "",
            branch: project.project_code || "Main",
            composite_key: `clproject:${project.id}`,
            location: [project?.locality, project?.city]
              .filter(Boolean)
              .join(", "),
          }))
          .filter((project) => project.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllProjects(allProjectsData);

        if (allProjectsData.length === 0) {
          toast.error("No projects found");
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        toast.error("Failed to load projects");
        setAllProjects([]);
      }
    };
    if (token) {
      fetchProjects();
    }
  }, [token, companyId]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const csaapToken = token;
        if (!csaapToken) {
          console.error("No authorization token found");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/tenant/departments`,
          {
            headers: { Authorization: `Bearer ${csaapToken}` },
          },
        );

        const departmentsData = response.data.data || response.data || [];
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to load departments.");
      }
    };
    if (token) {
      fetchDepartments();
    }
  }, [token]);

  const fetchGlobalRoles = async () => {
    try {
      const csaapToken = token;
      if (!csaapToken) {
        console.error("No authorization token found");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/tenant/departments/roles`,
        {
          headers: { Authorization: `Bearer ${csaapToken}` },
        },
      );

      const roles = response.data.data || response.data || [];
      setGlobalRoles(roles);
      if (roles.length > 0) {
        setSelectedRoleId(roles[0].id);
        setSelectedRoleName(roles[0].role_name);
      } else {
        setSelectedRoleId("");
        setSelectedRoleName("");
      }
    } catch (error) {
      console.error("Error fetching global roles:", error);
      toast.error("Failed to load global roles.");
    }
  };

  const fetchDepartmentRoles = async (departmentId) => {
    try {
      if (!departmentId) return;

      const csaapToken = token;
      if (!csaapToken) {
        console.error("No authorization token found");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/tenant/departments/roles?department=${departmentId}`,
        {
          headers: { Authorization: `Bearer ${csaapToken}` },
        },
      );

      const roles = response.data.data || response.data || [];
      setDepartmentRoles(roles);
      if (roles.length > 0) {
        setSelectedRoleId(roles[0].id);
        setSelectedRoleName(roles[0].role_name);
      } else {
        setSelectedRoleId("");
        setSelectedRoleName("");
      }
    } catch (error) {
      console.error("Error fetching department roles:", error);
      toast.error("Failed to load department roles.");
      setDepartmentRoles([]);
      setSelectedRoleId("");
      setSelectedRoleName("");
    }
  };

  useEffect(() => {
    if (token) {
      if (assignmentMode === "manager") {
        fetchGlobalRoles();
      } else {
        if (!selectedDepartmentId) {
          setDepartmentRoles([]);
          setSelectedRoleId("");
          setSelectedRoleName("");
          return;
        }
        fetchDepartmentRoles(selectedDepartmentId);
      }
    }
  }, [selectedDepartmentId, assignmentMode, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeDropdownOpen(false);
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setIsProjectDropdownOpen(false);
      }
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target)
      ) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueProjectNames = useMemo(() => {
    const names = allProjects.map((p) => p.name).filter(Boolean);
    return [...new Set(names)];
  }, [allProjects]);

  const availableBranches = useMemo(() => {
    if (selectedProjectNames.length === 0) return [];

    const branches = allProjects
      .filter((p) => selectedProjectNames.includes(p.name))
      .map((p) => {
        const branchName = p.branch || p.locality || "Main";
        return {
          projectName: p.name,
          branchName: branchName,
          value: `${p.name}|${branchName}`,
        };
      });

    const unique = [];
    const seen = new Set();
    for (const b of branches) {
      if (!seen.has(b.value)) {
        seen.add(b.value);
        unique.push(b);
      }
    }
    return unique;
  }, [selectedProjectNames, allProjects]);

  useEffect(() => {
    const availableValues = availableBranches.map((b) => b.value);
    setSelectedBranches((prev) =>
      prev.filter((val) => availableValues.includes(val)),
    );
  }, [availableBranches]);

  const handleEmployeeToggle = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id],
    );
  };

  const handleProjectToggle = (name) => {
    setSelectedProjectNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleBranchToggle = (val) => {
    setSelectedBranches((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    if (
      selectedEmployeeIds.length === 0 ||
      selectedProjectNames.length === 0 ||
      selectedBranches.length === 0
    ) {
      return toast.error(
        "Please select at least one employee, project, and location.",
      );
    }
    if (!selectedRoleName) {
      return toast.error("Please select a role for this assignment.");
    }

    setIsAssigning(true);
    const toastId = toast.loading(`Preparing allocations...`);

    const validProjects = allProjects.filter((p) => {
      const branchName = p.branch || p.locality || "Main";
      const comboValue = `${p.name}|${branchName}`;
      return (
        selectedProjectNames.includes(p.name) &&
        selectedBranches.includes(comboValue)
      );
    });

    if (validProjects.length === 0) {
      setIsAssigning(false);
      return toast.error(
        "No valid Project/Location combinations found in the database.",
        { id: toastId },
      );
    }

    try {
      const assignmentPromises = [];

      selectedEmployeeIds.forEach((empId) => {
        const selectedEmp = employees.find(
          (emp) => getEmployeeId(emp) === empId,
        );

        validProjects.forEach((proj) => {
          let payload;

          if (assignmentMode === "manager") {
            payload = {
              employeeid: getEmployeeId(selectedEmp),
              employeename: selectedEmp?.name || selectedEmp?.employee_name,
              projectid: parseInt(proj.id),
              projectname: proj.name,
              projectbranch: proj.branch || proj.locality || "Main",
              project_type: proj.property_type,
              project_role: selectedRoleName,
              project_role_id: selectedRoleId,
              globalrole_assigned: "yes",
              assigned_global_role: selectedRoleName,
              grade: "0",
            };
          } else {
            payload = {
              employeeid: getEmployeeId(selectedEmp),
              employeename: selectedEmp?.name || selectedEmp?.employee_name,
              projectid: parseInt(proj.id),
              projectname: proj.name,
              projectbranch: proj.branch || proj.locality || "Main",
              project_type: proj.property_type,
              project_role: selectedRoleName,
              project_role_id: selectedRoleId,
              department_id: parseInt(selectedDepartmentId),
              globalrole_assigned: "no",
              assigned_global_role: null,
              grade: "0",
            };
          }

          assignmentPromises.push(
            axios.post(assignmentsApiUrl, payload, getAuthHeaders()),
          );
        });
      });

      toast.loading(
        `Processing ${assignmentPromises.length} assignment(s)...`,
        { id: toastId },
      );

      const results = await Promise.allSettled(assignmentPromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Assignment ${index + 1} failed:`, result.reason);
          console.error("Error response data:", result.reason?.response?.data);
          console.error("Error status:", result.reason?.response?.status);
        } else {
        }
      });

      if (failed > 0) {
        toast.error(
          `Assigned ${successful}, failed ${failed}. Check console for details.`,
          { id: toastId },
        );
      } else {
        toast.success(`Successfully assigned ${successful} record(s)!`, {
          id: toastId,
        });
      }

      setSelectedEmployeeIds([]);
      setSelectedProjectNames([]);
      setSelectedBranches([]);
      setSelectedDepartmentId("");
      setSelectedRoleId("");
      setSelectedRoleName("");
      setIsEmployeeDropdownOpen(false);
      setIsProjectDropdownOpen(false);
      setIsBranchDropdownOpen(false);

      mutate(assignmentsApiUrl);
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to process assignments.", { id: toastId });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this assignment?"))
      return;
    const toastId = toast.loading("Removing assignment...");
    try {
      await axios.delete(`${assignmentsApiUrl}/${id}`, getAuthHeaders());
      toast.success("Assignment removed.", { id: toastId });
      mutate(assignmentsApiUrl);
    } catch (error) {
      toast.error("Failed to remove assignment.", { id: toastId });
    }
  };

  const assignments = assignmentsData?.data || [];

  const filteredAssignments = assignments.filter((a) => {
    const search = searchTerm.toLowerCase();
    return (
      (a.employeename && a.employeename.toLowerCase().includes(search)) ||
      (a.projectname && a.projectname.toLowerCase().includes(search)) ||
      (a.projectbranch && a.projectbranch.toLowerCase().includes(search)) ||
      (a.project_role && a.project_role.toLowerCase().includes(search)) ||
      (a.assigned_global_role &&
        a.assigned_global_role.toLowerCase().includes(search))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
          <ShieldCheck className="text-[var(--brand)]" size={28} />
          Project Allocations
        </h1>
        <p className="app-subtitle mt-1">
          Assign Global Managers or allocate staff to department roles across multiple projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="app-panel p-6 sm:p-8 bg-white sticky top-8">
            <div className="flex bg-[var(--bg-subtle)] p-1 rounded-xl mb-6 border border-[var(--border-soft)]">
              <button
                type="button"
                onClick={() => {
                  setAssignmentMode("manager");
                  setSelectedDepartmentId("");
                  setSelectedRoleId("");
                  setSelectedRoleName("");
                }}
                className={`flex-1 py-2.5 text-[11px] flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === "manager" ? "bg-white text-[var(--brand-strong)] shadow-sm" : "text-[var(--text-soft)] hover:text-[var(--text-strong)]"}`}
              >
                <Crown size={14} /> Assign Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignmentMode("team");
                  setSelectedRoleId("");
                  setSelectedRoleName("");
                }}
                className={`flex-1 py-2.5 text-[11px] flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-lg transition-all ${assignmentMode === "team" ? "bg-white text-[var(--brand-strong)] shadow-sm" : "text-[var(--text-soft)] hover:text-[var(--text-strong)]"}`}
              >
                <UserPlus size={14} /> Assign Team
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-5">
              <div className="space-y-2">
                <label className="app-label block mb-1.5">
                  Select Employee(s)
                </label>
                <div className="relative" ref={employeeDropdownRef}>
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] z-10"
                    size={16}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)
                    }
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm font-bold text-[var(--text-strong)] outline-none transition-all flex items-center justify-between ${isEmployeeDropdownOpen ? "border-[var(--brand)] ring-4 ring-[var(--brand-ring)]" : "border-[var(--border-soft)]"}`}
                  >
                    <span className="truncate">
                      {selectedEmployeeIds.length === 0
                        ? "-- Select Employees --"
                        : `${selectedEmployeeIds.length} Employee(s) Selected`}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[var(--text-soft)] transition-transform ${isEmployeeDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isEmployeeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--border-soft)] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                      <label className="flex items-center gap-3 p-2 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer border-b border-[var(--border-soft)] mb-1">
                        <input
                          type="checkbox"
                          checked={
                            selectedEmployeeIds.length === employees.length &&
                            employees.length > 0
                          }
                          onChange={(e) => {
                            e.target.checked
                              ? setSelectedEmployeeIds(
                                  employees.map(getEmployeeId),
                                )
                              : setSelectedEmployeeIds([]);
                          }}
                          className="w-4 h-4 rounded border-[var(--border-soft)] text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer accent-[var(--brand)]"
                        />
                        <span className="text-xs font-black text-[var(--brand-strong)] uppercase tracking-widest">
                          Select All
                        </span>
                      </label>

                      {employees.map((emp) => {
                        const empId = getEmployeeId(emp);
                        return (
                          <label
                            key={empId}
                            className="flex items-center gap-3 p-2 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEmployeeIds.includes(empId)}
                              onChange={() => handleEmployeeToggle(empId)}
                              className="w-4 h-4 rounded border-[var(--border-soft)] text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer accent-[var(--brand)]"
                            />
                            <span className="text-sm font-bold text-[var(--text-strong)]">
                              {emp.name || emp.employee_name || "Employee"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="app-label block mb-1.5">
                  1. Select Project(s)
                </label>
                <div className="relative" ref={projectDropdownRef}>
                  <Building
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] z-10"
                    size={16}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setIsProjectDropdownOpen(!isProjectDropdownOpen)
                    }
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm font-bold text-[var(--text-strong)] outline-none transition-all flex items-center justify-between ${isProjectDropdownOpen ? "border-[var(--brand)] ring-4 ring-[var(--brand-ring)]" : "border-[var(--border-soft)]"}`}
                  >
                    <span className="truncate">
                      {selectedProjectNames.length === 0
                        ? "-- Select Projects --"
                        : `${selectedProjectNames.length} Project(s) Selected`}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[var(--text-soft)] transition-transform ${isProjectDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--border-soft)] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                      <label className="flex items-center gap-3 p-2 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer border-b border-[var(--border-soft)] mb-1">
                        <input
                          type="checkbox"
                          checked={
                            selectedProjectNames.length ===
                              uniqueProjectNames.length &&
                            uniqueProjectNames.length > 0
                          }
                          onChange={(e) => {
                            e.target.checked
                              ? setSelectedProjectNames([...uniqueProjectNames])
                              : setSelectedProjectNames([]);
                          }}
                          className="w-4 h-4 rounded border-[var(--border-soft)] text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer accent-[var(--brand)]"
                        />
                        <span className="text-xs font-black text-[var(--brand-strong)] uppercase tracking-widest">
                          Select All
                        </span>
                      </label>

                      {uniqueProjectNames.map((name) => (
                        <label
                          key={name}
                          className="flex items-center gap-3 p-2 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProjectNames.includes(name)}
                            onChange={() => handleProjectToggle(name)}
                            className="w-4 h-4 rounded border-[var(--border-soft)] text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer accent-[var(--brand)]"
                          />
                          <span className="text-sm font-bold text-[var(--text-strong)]">
                            {name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="app-label block mb-1.5">
                  2. Select Location(s)
                </label>
                <div className="relative" ref={branchDropdownRef}>
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] z-10"
                    size={16}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setIsBranchDropdownOpen(!isBranchDropdownOpen)
                    }
                    disabled={
                      selectedProjectNames.length === 0 ||
                      availableBranches.length === 0
                    }
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm font-bold text-[var(--text-strong)] outline-none transition-all flex items-center justify-between disabled:opacity-50 disabled:bg-[var(--bg-subtle)] ${isBranchDropdownOpen ? "border-[var(--brand)] ring-4 ring-[var(--brand-ring)]" : "border-[var(--border-soft)]"}`}
                  >
                    <span className="truncate">
                      {selectedBranches.length === 0
                        ? "-- Select Locations --"
                        : `${selectedBranches.length} Location(s) Selected`}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[var(--text-soft)] transition-transform ${isBranchDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isBranchDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--border-soft)] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                      <label className="flex items-center gap-3 p-2 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer border-b border-[var(--border-soft)] mb-1">
                        <input
                          type="checkbox"
                          checked={
                            selectedBranches.length ===
                              availableBranches.length &&
                            availableBranches.length > 0
                          }
                          onChange={(e) => {
                            e.target.checked
                              ? setSelectedBranches(
                                  availableBranches.map((b) => b.value),
                                )
                              : setSelectedBranches([]);
                          }}
                          className="w-4 h-4 rounded border-[var(--border-soft)] text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer accent-[var(--brand)]"
                        />
                        <span className="text-xs font-black text-[var(--brand-strong)] uppercase tracking-widest">
                          Select All
                        </span>
                      </label>

                      {availableBranches.map((branchObj) => (
                        <label
                          key={branchObj.value}
                          className="flex items-center gap-3 p-2 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBranches.includes(branchObj.value)}
                            onChange={() => handleBranchToggle(branchObj.value)}
                            className="w-4 h-4 rounded border-[var(--border-soft)] text-[var(--brand)] focus:ring-[var(--brand)] cursor-pointer accent-[var(--brand)]"
                          />
                          <span className="text-sm font-bold text-[var(--text-strong)]">
                            {branchObj.projectName}{" "}
                            <span className="text-[var(--text-soft)] font-medium">
                              ({branchObj.branchName})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProjectNames.length > 0 &&
                  availableBranches.length === 0 && (
                    <p className="text-xs text-rose-500 font-bold ml-1 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> No locations found for selected projects.
                    </p>
                  )}
              </div>

              {assignmentMode === "manager" && (
                <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border-soft)] rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="app-label block mb-1.5">
                      Assign Global Role
                    </label>
                    <div className="relative">
                      <Globe
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                        size={16}
                      />
                      <select
                        value={selectedRoleId}
                        onChange={(e) => {
                          const roleId = e.target.value;
                          const role = globalRoles.find(
                            (r) => r.id === parseInt(roleId),
                          );
                          setSelectedRoleId(roleId);
                          setSelectedRoleName(role?.role_name || "");
                        }}
                        required
                        className="app-input w-full pl-11 cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          -- Choose Global Role --
                        </option>
                        {globalRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {assignmentMode === "team" && (
                <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border-soft)] rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="app-label block mb-1.5">
                      Department
                    </label>
                    <div className="relative">
                      <Building
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                        size={16}
                      />
                      <select
                        value={selectedDepartmentId}
                        onChange={(e) => {
                          setSelectedDepartmentId(e.target.value);
                          setSelectedRoleId("");
                          setSelectedRoleName("");
                        }}
                        required
                        className="app-input w-full pl-11 cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          -- Choose Department --
                        </option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="app-label block mb-1.5">
                      Project Role
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                        size={16}
                      />
                      <select
                        value={selectedRoleId}
                        onChange={(e) => {
                          const roleId = e.target.value;
                          const role = departmentRoles.find(
                            (r) => r.id === parseInt(roleId),
                          );
                          setSelectedRoleId(roleId);
                          setSelectedRoleName(role?.role_name || "");
                        }}
                        required
                        disabled={
                          !selectedDepartmentId || departmentRoles.length === 0
                        }
                        className="app-input w-full pl-11 cursor-pointer appearance-none disabled:opacity-50 disabled:bg-[var(--bg-subtle)]"
                      >
                        <option value="" disabled>
                          -- Choose Role --
                        </option>
                        {departmentRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)] pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    isAssigning ||
                    selectedEmployeeIds.length === 0 ||
                    selectedProjectNames.length === 0 ||
                    selectedBranches.length === 0 ||
                    !selectedRoleName
                  }
                  className="app-btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isAssigning ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : assignmentMode === "manager" ? (
                    <Crown size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {assignmentMode === "manager"
                    ? "Confirm Project Manager(s)"
                    : "Allocate Team Member(s)"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="app-panel overflow-hidden w-full flex flex-col h-full bg-white">
            <div className="p-6 border-b border-[var(--border-soft)] bg-[var(--bg-subtle)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="app-heading">
                  Active Allocations
                </h2>
                <p className="app-subtitle mt-0.5 text-xs">
                  Total: {filteredAssignments.length} Records
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                  size={14}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff or projects..."
                  className="app-input w-full pl-9"
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full block flex-1 bg-white">
              <table className="w-full min-w-150">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-soft)]">
                    <th className="px-4 py-3 text-left text-[10px] font-black text-[var(--text-soft)] uppercase tracking-widest">
                      Employee & Project Role
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-[var(--text-soft)] uppercase tracking-widest">
                      Global Role
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-[var(--text-soft)] uppercase tracking-widest">
                      Assigned Project
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-[var(--text-soft)] uppercase tracking-widest">
                      Location
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-[var(--text-soft)] uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)]">
                  {isAssignmentsLoading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <Loader2
                          className="animate-spin mx-auto text-[var(--brand)]"
                          size={32}
                        />
                      </td>
                    </tr>
                  ) : filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="w-16 h-16 bg-[var(--bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-3 border border-[var(--border-soft)]">
                          <Briefcase className="text-[var(--brand-strong)] opacity-60" size={24} />
                        </div>
                        <p className="text-[var(--text-soft)] font-bold text-sm">
                          No assignments found.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedAssignments.map((assignment) => {
                      const isGlobal = assignment.globalrole_assigned === "yes";
                      const isManager =
                        isGlobal ||
                        assignment.project_role
                          ?.toLowerCase()
                          .includes("manager");

                      return (
                        <tr
                          key={assignment.id}
                          className={`hover:bg-[var(--bg-subtle)] transition-colors ${isManager ? "bg-amber-50/10" : ""}`}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border uppercase shrink-0 ${isManager ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-[var(--brand-soft)] text-[var(--brand-strong)] border-[var(--border-strong)]"}`}
                              >
                                {assignment.employeename?.[0] || "E"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-[var(--text-strong)]">
                                    {assignment.employeename}
                                  </p>
                                </div>
                                <p className="text-[9px] text-[var(--text-soft)] font-bold uppercase tracking-widest mt-0.5">
                                  Project Role:{" "}
                                  {assignment.project_role || "None"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            {isGlobal && assignment.assigned_global_role ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                <Globe size={10} />{" "}
                                {assignment.assigned_global_role}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-widest">
                                -
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-bold text-[var(--text-strong)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-md border border-[var(--border-soft)]">
                              {assignment.projectname}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-soft)]">
                              <MapPin size={12} className="text-[var(--text-faint)]" />{" "}
                              {assignment.projectbranch}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleRemove(assignment.id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-100 hover:border-rose-600 flex items-center gap-1.5"
                              >
                                <Trash2 size={12} /> Unassign
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--border-soft)] flex items-center justify-between bg-[var(--bg-subtle)]">
                <span className="text-[10px] font-black text-[var(--text-soft)] uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="app-btn-secondary px-3 !min-h-[34px] !py-1 flex items-center gap-1 text-[10px] font-black"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="app-btn-secondary px-3 !min-h-[34px] !py-1 flex items-center gap-1 text-[10px] font-black"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssignment;
