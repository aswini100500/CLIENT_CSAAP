import axios from "axios";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  FileText,
  Filter,
  ListChevronsDownUp,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import {
  calculateAttendanceDuration,
  getAttendanceDateValue,
  getCurrentIndiaDate,
} from "../utils/attendanceTime";

const currentIndiaDate = getCurrentIndiaDate();
const [currentIndiaYear, currentIndiaMonth] = currentIndiaDate
  .split("-")
  .map(Number);

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const statusOptions = ["all", "Pending", "Approved", "Rejected"];

const getProjectKey = (projectId, projectBranch) =>
  `${projectId ?? ""}::${(projectBranch || "").trim().toLowerCase()}`;

const isProjectManagerAssignment = (assignment) => {
  const globalRoleAssigned = (
    assignment.globalrole_assigned || ""
  ).toLowerCase();
  const globalRole = (assignment.assigned_global_role || "")
    .trim()
    .toLowerCase();
  const projectRole = (assignment.project_role || "").trim().toLowerCase();

  return (
    (globalRoleAssigned === "yes" && globalRole === "manager") ||
    projectRole.includes("manager") ||
    projectRole.includes("admin")
  );
};

const normalizeDepartment = (value = "") => value.trim().toLowerCase();

const getEmployeeRecordId = (employee) =>
  employee?.id ??
  employee?.employee_id ??
  employee?.employeeid ??
  employee?.employeeProfileId;

const panelClass =
  "bg-white rounded-2xl border border-(--border-soft) shadow-[0_4px_20px_-4px_rgba(0,166,81,0.05)] overflow-hidden transition-all duration-300";

const formatDurationLabel = (value = "") => {
  if (!value) return "0h 0m";
  if (typeof value === "string" && value.includes("h")) return value;
  const [hours = "0", minutes = "0"] = String(value).split(":");
  return `${Number(hours)}h ${Number(minutes)}m`;
};

const formatFullDate = (dateValue) => {
  if (!dateValue) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateValue}T12:00:00+05:30`));
};

const groupRecordsByDate = (records) => {
  const grouped = new Map();

  records.forEach((record) => {
    const key = `${record.date}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        date: record.date,
        records: [],
      });
    }

    grouped.get(key).records.push(record);
  });

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      records: group.records.sort(
        (a, b) =>
          a.employeeName.localeCompare(b.employeeName) ||
          String(b.id).localeCompare(String(a.id)),
      ),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

const getStatusMeta = (status) => {
  if (status === "Approved") {
    return {
      icon: CheckCircle,
      className: "bg-[#ecfdf5] text-(--brand-strong) border-(--border-strong)",
    };
  }

  if (status === "Rejected") {
    return {
      icon: XCircle,
      className: "bg-[#fef2f2] text-[#ef4444] border-[#fecaca]",
    };
  }

  return {
    icon: AlertCircle,
    className: "bg-[#fffbeb] text-[#d97706] border-[#fef3c7]",
  };
};

const DailyWorkReport = ({ hideHeader = false }) => {
  const { user, token: authToken, companyId } = useAuth();
  const slug = user?.slug;
  const token = authToken;
  const employeeId = user?.employeeProfileId || user?.employee_id || user?.id;
  const roleName = user?.role || "";
  const normalizedRole = roleName.toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const isHrManager = normalizedRole === "hr manager";
  const isDepartmentReviewer =
    normalizedRole === "hr" ||
    normalizedRole === "manager" ||
    normalizedRole.includes("manager");
  const canViewAllReports = isAdmin || isHrManager;
  const SUPERADMIN_API_BASE = import.meta.env.VITE_ACCOUNTING_URL;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectScopeLoading, setProjectScopeLoading] = useState(false);
  const [managedProjects, setManagedProjects] = useState([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(currentIndiaMonth - 1);
  const [selectedYear, setSelectedYear] = useState(currentIndiaYear);
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [employeeDepts, setEmployeeDepts] = useState({});
  const [departmentEmployeeIds, setDepartmentEmployeeIds] = useState([]);
  const [projects, setProjects] = useState([]);

  const itemsPerPage = 10;
  const availableYears = [
    currentIndiaYear + 1,
    currentIndiaYear,
    currentIndiaYear - 1,
  ];
  const monthQuery = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

  const normalizeRecord = (item) => {
    const totalHours =
      item.total_hours ||
      calculateAttendanceDuration(item.mispunch_time, item.leave_time) ||
      "00:00:00";

    return {
      id: item.id,
      employeeId: item.employee_id,
      employeeName: item.employee_name || "Unknown",
      department: item.department || item.employee_department || "",
      date: getAttendanceDateValue(item),
      totalHours,
      totalHoursLabel: formatDurationLabel(totalHours),
      timesheetDetails: item.timesheet_details?.trim() || "",
      status: item.timesheet_status || "Pending",
      reason: item.reason?.trim() || "",
      rawData: item,
    };
  };

  // Updated fetchProjectScope to use the new project fetching logic
  useEffect(() => {
    const fetchProjectScope = async () => {
      const activeCompanyId = companyId || user?.company_id;
      if (!activeCompanyId || !employeeId || !token) {
        setManagedProjects([]);
        setProjects([]);
        return;
      }

      setProjectScopeLoading(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch client projects
        const projRes = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/clprojects`,
          {
            params: { company_id: activeCompanyId },
            headers,
          }
        );

        const projectsData = Array.isArray(projRes.data?.data)
          ? projRes.data.data
          : Array.isArray(projRes.data)
          ? projRes.data
          : [];

        const allProjects = projectsData
          .map((project) => {
            const property_type = project.project_code || "custom_project";
            return {
              id: project.id,
              name: project.project_name || project.name || "Unnamed Project",
              property_type: property_type,
              display_type: project.project_code || property_type,
              locality: project.locality || "",
              city: project.city || "",
              composite_key: `${property_type}:${project.id}`,
              location: [project?.locality, project?.city].filter(Boolean).join(", "),
            };
          })
          .filter((project) => project && project.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setProjects(allProjects);

        if (allProjects.length === 0) {
          console.warn("No projects found");
          setManagedProjects([]);
          setProjectScopeLoading(false);
          return;
        }

        // 2. Fetch employees
        const employeesRes = await axios
          .get(`https://csaapnodeapi.csaap.com/api/tenant/hrms/all-employees`, { headers })
          .catch(() => ({ data: [] }));

        const employees = employeesRes.data?.data || employeesRes.data || [];

        // Find current employee
        const currentEmployee = employees.find(
          (employee) =>
            String(getEmployeeRecordId(employee)) === String(employeeId),
        );
        const currentDepartment = normalizeDepartment(
          currentEmployee?.department || user?.department || "",
        );

        // 3. Fetch assignments once
        const assignmentsRes = await axios.get(
          `https://csaapnodeapi.csaap.com/api/tenant/project-assignments`,
          { headers }
        ).catch(() => ({ data: { data: [] } }));

        const allAssignments = assignmentsRes.data?.data || assignmentsRes.data || [];

        // Consolidate all authorized employees across projects
        const allAuthorizedEmployeeIds = new Set();
        const consolidatedDepts = {};
        const nextManagedProjects = [];

        const departmentIds =
          isDepartmentReviewer && !canViewAllReports && currentDepartment
            ? employees
              .filter(
                (employee) =>
                  normalizeDepartment(employee?.department || "") ===
                  currentDepartment,
              )
              .map((employee) => String(getEmployeeRecordId(employee)))
              .filter(Boolean)
            : [];

        allProjects.forEach((project) => {
          // Filter assignments matching this project
          const assignments = allAssignments.filter(
            (a) =>
              String(a.projectid) === String(project.id) &&
              String(a.projectbranch || "").trim().toLowerCase() === String(project.property_type).trim().toLowerCase()
          );

          const isManagerOfThisProject = assignments.some(
            (assignment) =>
              String(assignment.employeeid) === String(employeeId) &&
              isProjectManagerAssignment(assignment),
          );

          if (isManagerOfThisProject || canViewAllReports) {
            assignments.forEach((a) => {
              const id = String(a.employeeid);
              allAuthorizedEmployeeIds.add(id);
              if (a.department) {
                consolidatedDepts[id] = a.department.trim();
              }
            });

            nextManagedProjects.push({
              key: getProjectKey(project.id, project.property_type),
              id: project.id,
              name: project.name,
              branch: project.property_type,
              employeeIds: assignments.map((a) => String(a.employeeid)),
            });
          }
        });

        setEmployeeDepts(consolidatedDepts);
        setDepartmentEmployeeIds(Array.from(new Set(departmentIds)));
        setManagedProjects(nextManagedProjects);
        setSelectedProjectKey("");
      } catch (error) {
        console.error("Error loading daily report project scope", error);
        setManagedProjects([]);
        setDepartmentEmployeeIds([]);
        setSelectedProjectKey("");
      } finally {
        setProjectScopeLoading(false);
      }
    };

    fetchProjectScope();
  }, [
    companyId,
    user?.company_id,
    employeeId,
    token,
    user?.department,
    isDepartmentReviewer,
    canViewAllReports,
  ]);

  const fetchTimesheetData = useCallback(async () => {
    try {
      setLoading(true);

      if (!slug) {
        setRecords([]);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/${slug}`,
        { params: { month: monthQuery } },
      );

      const timesheetRows = response.data?.data || [];

      setRecords(timesheetRows.map(normalizeRecord));
    } catch (error) {
      console.error("Timesheet fetch error:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [monthQuery, slug]);

  useEffect(() => {
    fetchTimesheetData();
    setSelectedIds(new Set());
  }, [fetchTimesheetData]);

  const selectedManagedProject = useMemo(
    () =>
      managedProjects.find((project) => project.key === selectedProjectKey) ||
      null,
    [managedProjects, selectedProjectKey],
  );

  const filteredRecords = useMemo(() => {
    let nextRecords = [...records];

    // Filter by project if selected, otherwise show consolidated managed employees
    if (selectedProjectKey) {
      const selectedProject = managedProjects.find(
        (p) => p.key === selectedProjectKey,
      );
      if (selectedProject) {
        const scopedEmployeeIds = new Set(selectedProject.employeeIds);
        nextRecords = nextRecords.filter((item) =>
          scopedEmployeeIds.has(String(item.employeeId)),
        );
      }
    } else {
      // Show all employees from all managed projects
      const allManagedIds = new Set();
      managedProjects.forEach((p) =>
        p.employeeIds.forEach((id) => allManagedIds.add(id)),
      );

      // Only filter if we've actually loaded some projects or if we're certain there are none
      const allDepartmentIds = new Set(departmentEmployeeIds);
      const allowedEmployeeIds = new Set(allManagedIds);
      allDepartmentIds.forEach((id) => allowedEmployeeIds.add(id));

      if (
        !canViewAllReports &&
        !projectScopeLoading &&
        allowedEmployeeIds.size === 0
      ) {
        nextRecords = [];
      } else if (!canViewAllReports && allowedEmployeeIds.size > 0) {
        nextRecords = nextRecords.filter((item) =>
          allowedEmployeeIds.has(String(item.employeeId)),
        );
      }
      // If the user can view all reports or scope is still loading, don't filter the records list yet.
    }

    if (selectedDepartment !== "all") {
      nextRecords = nextRecords.filter((item) => {
        const dept = item.department || employeeDepts[String(item.employeeId)];
        return dept && dept.toLowerCase() === selectedDepartment.toLowerCase();
      });
    }

    if (searchTerm.trim()) {
      const searchValue = searchTerm.toLowerCase();
      nextRecords = nextRecords.filter(
        (item) =>
          item.employeeName.toLowerCase().includes(searchValue) ||
          String(item.employeeId).includes(searchTerm) ||
          item.timesheetDetails.toLowerCase().includes(searchValue),
      );
    }

    if (selectedStatus !== "all") {
      nextRecords = nextRecords.filter(
        (item) => item.status === selectedStatus,
      );
    }

    return nextRecords.sort(
      (a, b) =>
        a.employeeName.localeCompare(b.employeeName) ||
        b.date.localeCompare(a.date),
    );
  }, [
    records,
    searchTerm,
    selectedStatus,
    selectedManagedProject,
    selectedDepartment,
    employeeDepts,
    managedProjects,
    departmentEmployeeIds,
    canViewAllReports,
    projectScopeLoading,
  ]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [filteredRecords.length]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedProjectKey]);

  useEffect(() => {
    setOpenGroups((current) => {
      const nextState = {};
      groupRecordsByDate(filteredRecords).forEach((group, index) => {
        nextState[group.date] = current[group.date] ?? index === 0;
      });
      return nextState;
    });
  }, [filteredRecords]);

  const stats = useMemo(() => {
    return {
      totalEmployees: new Set(filteredRecords.map((item) => item.employeeId))
        .size,
      approved: filteredRecords.filter((item) => item.status === "Approved")
        .length,
      pending: filteredRecords.filter((item) => item.status === "Pending")
        .length,
      rejected: filteredRecords.filter((item) => item.status === "Rejected")
        .length,
    };
  }, [filteredRecords]);

  const departments = useMemo(() => {
    const depts = new Set();
    Object.values(employeeDepts).forEach((d) => {
      if (d) depts.add(d.trim());
    });
    return ["all", ...Array.from(depts).sort()];
  }, [employeeDepts]);

  const groupedRecords = useMemo(
    () => groupRecordsByDate(filteredRecords),
    [filteredRecords],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(groupedRecords.length / itemsPerPage),
  );
  const paginatedGroups = groupedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const areAllVisible =
    paginatedGroups.length > 0 &&
    paginatedGroups.every((group) => openGroups[group.date]);

  const selectedCount = selectedIds.size;

  const canReviewRecord = (record) => {
    if (String(record.employeeId) === String(employeeId)) return false;
    if (isHrManager) return false;
    if (isAdmin) return true;
    if (departmentEmployeeIds.includes(String(record.employeeId))) return true;

    // Check if employee is in any of the managed projects
    return managedProjects.some((p) =>
      p.employeeIds.includes(String(record.employeeId)),
    );
  };

  const getReviewPayload = () => ({
    reviewedBy: employeeId,
    reviewedByName: user?.name,
    reviewedByRole: user?.role,
    ...(selectedManagedProject
      ? {
        projectId: selectedManagedProject.id,
        projectBranch: selectedManagedProject.branch,
      }
      : {}),
  });

  const toggleSelectRecord = (id) => {
    const record = records.find((item) => item.id === id);
    if (record && !canReviewRecord(record)) return;

    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectDateGroup = (group) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const groupIds = group.records.filter(canReviewRecord).map((r) => r.id);
      const allSelected = groupIds.every((id) => next.has(id));
      groupIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdateTimesheetStatus = async (status) => {
    const actionLabel = status === "Approved" ? "approve" : "reject";
    const confirmed = window.confirm(
      `Do you want to ${actionLabel} ${selectedCount} selected timesheet(s)?`,
    );
    if (!confirmed) return;

    try {
      setBulkLoading(true);
      const idsToUpdate = records
        .filter((item) => selectedIds.has(item.id) && canReviewRecord(item))
        .map((item) => item.id);

      if (idsToUpdate.length === 0) {
        alert("No selected timesheets are inside your project approval scope.");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/bulk-status`,
        { ids: idsToUpdate, status, ...getReviewPayload() },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      setRecords((current) =>
        current.map((item) =>
          selectedIds.has(item.id) ? { ...item, status } : item,
        ),
      );

      setSelectedIds(new Set());
    } catch (error) {
      console.error(`Failed to bulk ${actionLabel} timesheets`, error);
      alert(`Some timesheets could not be ${actionLabel}d. Please try again.`);
    } finally {
      setBulkLoading(false);
    }
  };

  const updateTimesheetStatus = async (record, status, event) => {
    event?.stopPropagation?.();

    const actionLabel = status === "Approved" ? "approve" : "reject";
    const confirmed = window.confirm(
      `Do you want to ${actionLabel} the timesheet for ${record.employeeName} on ${record.date}?`,
    );
    if (!confirmed) return;

    if (!canReviewRecord(record)) {
      alert(
        "You can only review daily reports from your assigned project employees.",
      );
      return;
    }

    try {
      setActionLoadingId(record.id);
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/status/${record.id}`,
        { status, ...getReviewPayload() },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const updatedRecord = response.data?.data
        ? normalizeRecord(response.data.data)
        : { ...record, status };

      setRecords((current) =>
        current.map((item) => (item.id === record.id ? updatedRecord : item)),
      );

      if (selectedRecord?.id === record.id) {
        setSelectedRecord(updatedRecord);
      }
    } catch (error) {
      console.error(`Failed to ${actionLabel} timesheet`, error);
      alert(`Unable to ${actionLabel} this timesheet right now.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Date",
        "Employee ID",
        "Employee Name",
        "Timesheet Status",
        "Timesheet Details",
      ],
      ...filteredRecords.map((item) => [
        item.date,
        item.employeeId,
        item.employeeName,
        item.status,
        `"${String(item.timesheetDetails).replace(/"/g, '""')}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `employee-timesheet-${monthQuery}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStatusBadge = (status) => {
    const { icon: Icon, className } = getStatusMeta(status);

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${className}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center font-sans bg-transparent">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <div>
            <p className="text-lg font-bold text-slate-900">
              Loading timesheet records
            </p>
            <p className="text-sm text-slate-500 font-medium">
              Syncing attendance notes for {monthNames[selectedMonth]}{" "}
              {selectedYear}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans bg-transparent">
      {/* Stats Cards */}
      {!hideHeader && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
            <div className="bg-(--brand-soft) p-2.5 rounded-xl border border-(--border-strong) shrink-0">
              <Users className="w-5 h-5 text-(--brand)" />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-(--text-strong) leading-tight">
                {stats.totalEmployees}
              </p>
              <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">
                Employees
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
            <div className="bg-(--brand-soft) p-2.5 rounded-xl border border-(--border-strong) shrink-0">
              <CheckCircle className="w-5 h-5 text-(--brand)" />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-(--brand-strong) leading-tight">
                {stats.approved}
              </p>
              <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">
                Approved
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
            <div className="bg-[#fffbeb] p-2.5 rounded-xl border border-[#fef3c7] shrink-0">
              <AlertCircle className="w-5 h-5 text-[#d97706]" />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-[#d97706] leading-tight">
                {stats.pending}
              </p>
              <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">
                Pending
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
            <div className="bg-[#fef2f2] p-2.5 rounded-xl border border-[#fecaca] shrink-0">
              <XCircle className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-[#ef4444] leading-tight">
                {stats.rejected}
              </p>
              <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">
                Rejected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={`${panelClass} p-4`}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-(--border-soft) bg-white px-3 focus-within:ring-2 focus-within:ring-(--brand-ring) transition-all">
              <Calendar className="h-4 w-4 text-(--brand)" />
              <select
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(Number(event.target.value))
                }
                className="h-9 bg-transparent text-sm font-semibold text-(--text-body) outline-none cursor-pointer"
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={selectedYear}
              onChange={(event) =>
                setSelectedYear(Number(event.target.value))
              }
              className="h-9 px-3 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand-ring) transition-all text-(--text-body) font-semibold cursor-pointer text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {(projects.length > 0 || projectScopeLoading) && (
              <select
                value={selectedProjectKey}
                onChange={(event) => {
                  setSelectedProjectKey(event.target.value);
                  setSelectedIds(new Set());
                }}
                disabled={projectScopeLoading}
                className="h-9 max-w-65 px-3 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand-ring) transition-all text-(--text-body) font-semibold cursor-pointer text-sm disabled:opacity-60"
                title="Project approval scope"
              >
                <option value="">All Managed Projects</option>
                {projectScopeLoading ? (
                  <option value="">Loading project scope...</option>
                ) : managedProjects.length > 0 ? (
                  managedProjects.map((project) => (
                    <option key={project.key} value={project.key}>
                      {project.name}{" "}
                      {project.branch ? `(${project.branch})` : ""}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No managed projects found</option>
                )}
              </select>
            )}
            <button
              onClick={() => setShowFilter((current) => !current)}
              className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all ${showFilter
                  ? "border-(--brand) bg-(--brand-soft) text-(--brand)"
                  : "border-(--border-soft) bg-white text-(--text-body) hover:bg-slate-50"
                }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative min-w-65">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search employee, ID, or timesheet"
                className="w-full px-4 py-2 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand-ring) transition-all text-(--text-body) font-medium placeholder-slate-400 pl-11 text-sm"
              />
            </div>
            <button
              onClick={fetchTimesheetData}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--border-soft) bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-(--brand) to-(--brand-strong) px-4 text-sm font-bold text-white transition-all hover:opacity-95 active:scale-[0.98] shadow-sm shadow-(--brand)/10"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="mt-3 rounded-xl border border-(--border-soft) bg-(--bg-app) p-4 space-y-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-2">
                Department
              </p>
              <div className="flex flex-wrap gap-1.5">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${selectedDepartment === dept
                        ? "border-(--brand) bg-(--brand-soft) text-(--brand) shadow-sm font-extrabold"
                        : "border-(--border-soft) bg-white text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    {dept === "all" ? "All Departments" : dept}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-2">
                Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${selectedStatus === status
                        ? "border-(--brand) bg-(--brand-soft) text-(--brand) shadow-sm font-extrabold"
                        : "border-(--border-soft) bg-white text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    {status === "all" ? "All Status" : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ledger */}
      <div className={panelClass}>
        <div className="flex flex-col gap-2 border-b border-(--border-soft) bg-white px-5 py-3 md:flex-row md:items-center md:justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-(--brand-soft) text-(--brand) border border-(--border-strong) rounded-xl shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                Timesheet Ledger
              </p>
              <h2 className="text-sm font-bold text-(--text-strong)">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {paginatedGroups.length}/{groupedRecords.length} groups
            </span>
            <button
              onClick={() =>
                setOpenGroups((current) => {
                  const nextState = { ...current };
                  paginatedGroups.forEach((group) => {
                    nextState[group.date] = !areAllVisible;
                  });
                  return nextState;
                })
              }
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--border-soft) bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
              title={areAllVisible ? "Collapse all" : "Expand all"}
            >
              <ListChevronsDownUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-strong) bg-(--brand-soft)/40 px-5 py-2.5 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-(--brand) px-1.5 text-[10px] font-extrabold text-white">
                {selectedCount}
              </span>
              <span className="text-xs font-bold text-(--text-strong)">
                timesheet{selectedCount !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => bulkUpdateTimesheetStatus("Approved")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-(--brand) text-white transition-all hover:bg-(--brand-strong) shadow-sm shadow-(--brand)/10"
                title="Approve Selected"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => bulkUpdateTimesheetStatus("Rejected")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition-all hover:bg-rose-100"
                title="Reject Selected"
              >
                <XCircle className="h-4 w-4" />
              </button>
              <button
                onClick={clearSelection}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-(--border-soft) bg-white px-3 text-[10px] font-bold text-slate-600 transition-all hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="bg-(--bg-app)/40 p-4 min-h-100">
          {filteredRecords.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-(--brand-soft) border border-(--border-strong) rounded-xl flex items-center justify-center mb-4 ring-4 ring-[#f0fdf4]">
                <FileText className="w-7 h-7 text-(--brand)" />
              </div>
              <h3 className="text-base font-bold text-(--text-strong) mb-1">
                No records found
              </h3>
              <p className="text-slate-500 text-sm max-w-sm font-medium">
                No attendance entries matched the current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedGroups.map((group) => {
                const isOpen = openGroups[group.date] ?? false;
                const reviewableGroupRecords =
                  group.records.filter(canReviewRecord);

                return (
                  <div key={group.date} className="space-y-2">
                    <div className="bg-white px-3 py-2.5 rounded-xl border border-(--border-soft) flex items-center gap-3 transition-all hover:shadow-sm">
                      <input
                        type="checkbox"
                        checked={
                          reviewableGroupRecords.length > 0 &&
                          reviewableGroupRecords.every((r) =>
                            selectedIds.has(r.id),
                          )
                        }
                        disabled={reviewableGroupRecords.length === 0}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectDateGroup(group);
                        }}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-(--brand) focus:ring-(--brand-ring) cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                      <button
                        onClick={() =>
                          setOpenGroups((current) => ({
                            ...current,
                            [group.date]: !isOpen,
                          }))
                        }
                        className="flex flex-1 items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--border-soft) bg-(--bg-app) text-(--text-soft)">
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-(--text-strong)">
                              {formatFullDate(group.date)}
                            </p>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                              {group.date}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-(--border-soft) bg-(--brand-soft) text-(--brand) uppercase tracking-wider">
                          {group.records.length} Entries
                        </span>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="pl-4 md:pl-8 space-y-2">
                        {group.records.map((record) => (
                          <div
                            key={record.id}
                            className={`bg-white px-3 py-2.5 rounded-xl border transition-all flex flex-col xl:flex-row xl:items-center gap-3 ${selectedIds.has(record.id) ? "border-(--brand) bg-(--brand-soft)/10 shadow-sm" : "border-(--border-soft) hover:border-(--border-strong) hover:shadow-sm"}`}
                          >
                            <div className="flex items-center gap-3 min-w-50">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(record.id)}
                                disabled={!canReviewRecord(record)}
                                onChange={() => toggleSelectRecord(record.id)}
                                className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-(--brand) focus:ring-(--brand-ring) cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                              />
                              <div className="w-8 h-8 rounded-xl bg-(--brand-soft) text-(--brand) border border-(--border-strong) flex items-center justify-center font-bold text-xs shrink-0">
                                {record.employeeName.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-(--text-strong) text-sm leading-tight">
                                  {record.employeeName}
                                </h3>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                  ID: {record.employeeId}
                                </p>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-600 truncate">
                                {record.timesheetDetails ||
                                  "No details recorded."}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {renderStatusBadge(record.status)}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 border-t xl:border-t-0 pt-2 xl:pt-0 border-slate-100 mt-1 xl:mt-0">
                              <button
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setShowDetails(true);
                                }}
                                className="p-1.5 bg-(--brand-soft) text-(--brand) border border-(--border-strong) hover:bg-(--brand) hover:text-white rounded-lg transition-all shadow-sm"
                                title="View Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {canReviewRecord(record) ||
                                String(record.employeeId) ===
                                String(employeeId) ||
                                canViewAllReports ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) =>
                                      updateTimesheetStatus(
                                        record,
                                        "Approved",
                                        e,
                                      )
                                    }
                                    disabled={
                                      actionLoadingId === record.id ||
                                      record.status !== "Pending" ||
                                      !canReviewRecord(record)
                                    }
                                    className={`p-1.5 rounded-lg transition-all border ${record.status !== "Pending" || !canReviewRecord(record)
                                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                                      }`}
                                    title={
                                      record.status !== "Pending"
                                        ? `Already ${record.status}`
                                        : String(record.employeeId) ===
                                          String(employeeId)
                                          ? "Self-approval not allowed"
                                          : !canReviewRecord(record)
                                            ? "Permission denied"
                                            : "Approve"
                                    }
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      updateTimesheetStatus(
                                        record,
                                        "Rejected",
                                        e,
                                      )
                                    }
                                    disabled={
                                      actionLoadingId === record.id ||
                                      record.status !== "Pending" ||
                                      !canReviewRecord(record)
                                    }
                                    className={`p-1.5 rounded-lg transition-all border ${record.status !== "Pending" || !canReviewRecord(record)
                                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                        : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white"
                                      }`}
                                    title={
                                      record.status !== "Pending"
                                        ? `Already ${record.status}`
                                        : String(record.employeeId) ===
                                          String(employeeId)
                                          ? "Self-rejection not allowed"
                                          : !canReviewRecord(record)
                                            ? "Permission denied"
                                            : "Reject"
                                    }
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-(--border-soft) bg-white px-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-9 w-9 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? "bg-(--brand) text-white shadow-sm shadow-(--brand)/20" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-(--border-soft) bg-white px-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-(--border-soft) shadow-[0_8px_32px_rgba(0,166,81,0.08)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="border-b border-(--border-soft) px-6 py-4 flex items-center justify-between bg-(--bg-app)">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-(--brand-soft) text-(--brand) border border-(--border-strong) rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-(--text-strong)">
                    Timesheet Details
                  </h2>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                    {formatFullDate(selectedRecord.date)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-semibold transition-all p-1"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-(--bg-app) p-4 rounded-xl border border-(--border-soft)">
                  <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-widest mb-1">
                    Employee
                  </p>
                  <p className="font-bold text-(--text-strong)">
                    {selectedRecord.employeeName}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    ID: {selectedRecord.employeeId}
                  </p>
                </div>
                <div className="bg-(--bg-app) p-4 rounded-xl border border-(--border-soft) flex flex-col justify-center">
                  <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-widest mb-1.5">
                    Status
                  </p>
                  {renderStatusBadge(selectedRecord.status)}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                  Detailed Report
                </p>
                <div className="bg-white p-4 rounded-xl border border-(--border-soft) text-sm text-(--text-body) leading-relaxed min-h-30">
                  {selectedRecord.timesheetDetails ||
                    "No detailed report submitted."}
                </div>
              </div>
            </div>
            <div className="border-t border-(--border-soft) px-6 py-4 bg-(--bg-app) flex items-center justify-between">
              <button
                onClick={() => setShowDetails(false)}
                className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Close
              </button>
              {(canReviewRecord(selectedRecord) ||
                String(selectedRecord.employeeId) === String(employeeId) ||
                canViewAllReports) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        updateTimesheetStatus(selectedRecord, "Rejected", e);
                        setShowDetails(false);
                      }}
                      disabled={
                        selectedRecord.status !== "Pending" ||
                        !canReviewRecord(selectedRecord)
                      }
                      className={`px-5 py-2 text-sm font-bold rounded-xl transition-all border ${selectedRecord.status !== "Pending" || !canReviewRecord(selectedRecord)
                          ? "bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed opacity-60"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                        }`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={(e) => {
                        updateTimesheetStatus(selectedRecord, "Approved", e);
                        setShowDetails(false);
                      }}
                      disabled={
                        selectedRecord.status !== "Pending" ||
                        !canReviewRecord(selectedRecord)
                      }
                      className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${selectedRecord.status !== "Pending" || !canReviewRecord(selectedRecord)
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed opacity-60"
                          : "bg-linear-to-r from-(--brand) to-(--brand-strong) text-white hover:opacity-95 shadow-sm shadow-(--brand)/20"
                        }`}
                    >
                      Approve
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyWorkReport;
