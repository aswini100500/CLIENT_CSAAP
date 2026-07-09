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
import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import {
  calculateAttendanceDuration,
  getAttendanceDateValue,
  getCurrentIndiaDate,
} from "../../utils/attendanceTime";
import React from "react";

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

// Locked to the established design language
const panelClass =
  "bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-hidden transition-all hover:shadow-md";

const controlClass =
  "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium placeholder-slate-400 text-sm";

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

// Matched pastel backgrounds + text + soft border opacities
const getStatusMeta = (status) => {
  if (status === "Approved") {
    return {
      icon: CheckCircle,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    };
  }

  if (status === "Rejected") {
    return {
      icon: XCircle,
      className: "bg-rose-50 text-rose-700 border-rose-200/60",
    };
  }

  return {
    icon: AlertCircle,
    className: "bg-amber-50 text-amber-700 border-amber-200/60",
  };
};

const EmployeeTimesheet = () => {
  const { user } = useAuth();
  console.log("EmployeeTimesheet mounted, current user:", user);
  const slug = user.slug;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
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
      date: getAttendanceDateValue(item),
      totalHours,
      totalHoursLabel: formatDurationLabel(totalHours),
      timesheetDetails: item.timesheet_details?.trim() || "",
      status: item.timesheet_status || "Pending",
      reason: item.reason?.trim() || "",
      rawData: item,
    };
  };

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

  const filteredRecords = useMemo(() => {
    let nextRecords = [...records];

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
  }, [records, searchTerm, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [filteredRecords.length]);

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
      totalEmployees: new Set(records.map((item) => item.employeeId)).size,
      approved: records.filter((item) => item.status === "Approved").length,
      pending: records.filter((item) => item.status === "Pending").length,
      rejected: records.filter((item) => item.status === "Rejected").length,
    };
  }, [records]);

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

  const toggleSelectRecord = (id) => {
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
      const groupIds = group.records.map((r) => r.id);
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
      const idsToUpdate = Array.from(selectedIds);

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/bulk-status`,
        { ids: idsToUpdate, status },
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

    try {
      setActionLoadingId(record.id);
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/status/${record.id}`,
        { status },
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
    <div className="min-h-[calc(100vh-80px)] bg-transparent font-sans p-3 md:p-4">
      <div className="mx-auto max-w-7xl space-y-3">
        {/* Stats Cards synced to Mispunch sizing */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white p-3 rounded-2xl shadow-sm ring-1 ring-slate-200 flex items-center gap-3 transition-all hover:shadow-md">
            <div className="bg-indigo-50 p-2 rounded-full ring-1 ring-indigo-100 shrink-0">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-tight">
                {stats.totalEmployees}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Employees
              </p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm ring-1 ring-slate-200 flex items-center gap-3 transition-all hover:shadow-md">
            <div className="bg-emerald-50 p-2 rounded-full ring-1 ring-emerald-100 shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-tight">
                {stats.approved}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Approved
              </p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm ring-1 ring-slate-200 flex items-center gap-3 transition-all hover:shadow-md">
            <div className="bg-amber-50 p-2 rounded-full ring-1 ring-amber-100 shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-tight">
                {stats.pending}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Pending
              </p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm ring-1 ring-slate-200 flex items-center gap-3 transition-all hover:shadow-md">
            <div className="bg-rose-50 p-2 rounded-full ring-1 ring-rose-100 shrink-0">
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-tight">
                {stats.rejected}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Rejected
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className={`${panelClass} p-4`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
                <Calendar className="h-4 w-4 text-slate-500" />
                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(Number(event.target.value))
                  }
                  className="h-9 bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
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
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium cursor-pointer text-sm"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilter((current) => !current)}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200"
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
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium placeholder-slate-400 pl-11 text-sm"
                />
              </div>
              <button
                onClick={fetchTimesheetData}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleExport}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] shadow-sm"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {showFilter && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                Timesheet Status
              </p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setShowFilter(false);
                    }}
                    className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      selectedStatus === status
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ledger */}
        <div className={panelClass}>
          <div className="flex flex-col gap-2 border-b border-slate-100 bg-white px-5 py-3 md:flex-row md:items-center md:justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Timesheet Ledger
                </p>
                <h2 className="text-sm font-bold text-slate-900">
                  {monthNames[selectedMonth]} {selectedYear}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
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
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                title={areAllVisible ? "Collapse all" : "Expand all"}
              >
                <ListChevronsDownUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-50/50 px-5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                  {selectedCount}
                </span>
                <span className="text-xs font-bold text-indigo-900">
                  timesheet{selectedCount !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => bulkUpdateTimesheetStatus("Approved")}
                  disabled={bulkLoading}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-50 shadow-sm"
                  title="Approve All"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => bulkUpdateTimesheetStatus("Rejected")}
                  disabled={bulkLoading}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200/60 bg-rose-50 text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-50"
                  title="Reject All"
                >
                  <XCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={clearSelection}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition-all hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-50/50 p-4 min-h-100">
            {filteredRecords.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-slate-50">
                  <FileText className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No records found
                </h3>
                <p className="text-slate-500 text-sm max-w-sm font-medium">
                  No attendance entries with timesheet notes matched the current
                  filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedGroups.map((group) => {
                  const isOpen = openGroups[group.date] ?? false;

                  return (
                    <div key={group.date} className="space-y-2">
                      {/* Date Group Header */}
                      <div className="bg-white px-3 py-2.5 rounded-xl ring-1 ring-slate-200 flex items-center gap-3 transition-all hover:shadow-md">
                        <input
                          type="checkbox"
                          checked={group.records.every((r) =>
                            selectedIds.has(r.id),
                          )}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectDateGroup(group);
                          }}
                          className="h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 cursor-pointer"
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
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {formatFullDate(group.date)}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {group.date}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider">
                            {group.records.length} Entries
                          </span>
                        </button>
                      </div>

                      {/* Date Group Items transformed into cards */}
                      {isOpen && (
                        <div className="pl-4 md:pl-8 space-y-1.5">
                          {group.records.map((record) => (
                            <div
                              key={record.id}
                              className={`bg-white px-3 py-2.5 rounded-xl ring-1 transition-all flex flex-col xl:flex-row xl:items-center gap-3 ${
                                selectedIds.has(record.id)
                                  ? "ring-indigo-300 shadow-md bg-indigo-50/30"
                                  : "ring-slate-200 hover:ring-blue-300 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-50">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(record.id)}
                                  onChange={() => toggleSelectRecord(record.id)}
                                  className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 cursor-pointer"
                                />
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-1 ring-indigo-200/50 shrink-0">
                                  {record.employeeName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                                    {record.employeeName}
                                  </h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
                                  title="View Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                {record.status !== "Approved" && (
                                  <button
                                    onClick={(event) =>
                                      updateTimesheetStatus(
                                        record,
                                        "Approved",
                                        event,
                                      )
                                    }
                                    disabled={actionLoadingId === record.id}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {record.status !== "Rejected" && (
                                  <button
                                    onClick={(event) =>
                                      updateTimesheetStatus(
                                        record,
                                        "Rejected",
                                        event,
                                      )
                                    }
                                    disabled={actionLoadingId === record.id}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200/60 bg-rose-50 text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-50"
                                    title="Reject"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </button>
                                )}
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

          {/* Pagination */}
          {groupedRecords.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
              <p className="text-xs font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal rewritten to match dense/compact styling */}
        {showDetails && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
              {/* Compact Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold text-sm ring-1 ring-indigo-200/50 shrink-0">
                    {selectedRecord.employeeName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {selectedRecord.employeeName}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      ID {selectedRecord.employeeId} • {selectedRecord.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-slate-900"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              {/* Dense Body */}
              <div className="px-5 py-4 overflow-y-auto space-y-3 bg-slate-50/50 flex-1">
                {/* Key-value grid */}
                <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
                  <div className="grid grid-cols-2">
                    {/* ID */}
                    <div className="px-4 py-3 border-b border-slate-100 sm:border-r">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Employee ID
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {selectedRecord.employeeId}
                      </p>
                    </div>
                    {/* Logged Date */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Logged Date
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {formatFullDate(selectedRecord.date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status strip */}
                <div className="bg-white rounded-xl ring-1 ring-slate-200 px-4 py-3 flex flex-wrap items-center gap-2">
                  {renderStatusBadge(selectedRecord.status)}
                </div>

                {/* Timesheet Details */}
                <div className="bg-white rounded-xl ring-1 ring-slate-200 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Timesheet Details
                  </p>
                  <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-snug">
                    {selectedRecord.timesheetDetails ||
                      "No timesheet details recorded."}
                  </p>
                </div>
              </div>

              {/* Compact Footer */}
              <div className="border-t border-slate-100 bg-white px-5 py-2.5 flex items-center justify-end gap-1.5 shrink-0">
                {selectedRecord.status !== "Approved" && (
                  <button
                    onClick={(event) =>
                      updateTimesheetStatus(selectedRecord, "Approved", event)
                    }
                    disabled={actionLoadingId === selectedRecord.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-50 shadow-sm"
                    title="Approve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                {selectedRecord.status !== "Rejected" && (
                  <button
                    onClick={(event) =>
                      updateTimesheetStatus(selectedRecord, "Rejected", event)
                    }
                    disabled={actionLoadingId === selectedRecord.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200/60 bg-rose-50 text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-50"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTimesheet;
