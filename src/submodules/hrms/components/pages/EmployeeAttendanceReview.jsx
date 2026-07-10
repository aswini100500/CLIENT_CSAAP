import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  ListChevronsDownUp,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import useAuth from "../../../../hooks/useAuth";
import {
  calculateAttendanceDuration,
  getAttendanceDateValue,
  getCurrentIndiaDate,
} from "../../utils/attendanceTime";

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


const panelClass =
  "app-panel overflow-hidden transition-colors duration-200 hover:border-(--border-strong)";

const formatDurationLabel = (value = "") => {
  if (!value) return "—";
  if (typeof value === "string" && value.includes("h")) return value;
  const [hours = "0", minutes = "0"] = String(value).split(":");
  return `${Number(hours)}h ${Number(minutes)}m`;
};

const formatTimeOnly = (dateTimeValue) => {
  if (!dateTimeValue) return "—";
  const timePart = String(dateTimeValue).includes(" ")
    ? String(dateTimeValue).split(" ")[1]
    : String(dateTimeValue);
  const [h = "0", m = "0"] = timePart.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
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


const EmployeeAttendanceReview = () => {
  const { user } = useAuth();
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
  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);

  const itemsPerPage = 10;
  const availableYears = [
    currentIndiaYear + 1,
    currentIndiaYear,
    currentIndiaYear - 1,
  ];
  const monthQuery = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

  const normalizeRecord = (item) => {
    const totalHours = item.leave_time
      ? item.total_hours ||
        calculateAttendanceDuration(item.mispunch_time, item.leave_time) ||
        "00:00:00"
      : "";

    return {
      id: item.id,
      employeeId: item.employee_id,
      employeeName: item.employee_name || "Unknown",
      date: getAttendanceDateValue(item),
      punchIn: item.mispunch_time || "",
      leaveTime: item.leave_time || "",
      totalHours,
      totalHoursLabel: formatDurationLabel(totalHours),
      mispunchStatus: item.mispunch_status || "Pending",
      reason: item.reason?.trim() || "",
      shiftName: item.shift_name || "General",
      shiftStart: item.shift_start || "",
      shiftEnd: item.shift_end || "",
      isLate: !!item.is_late,
      isHalfDay: !!item.is_half_day,
      isEarlyLeave: !!item.is_early_leave,
      latitude: item.latitude,
      longitude: item.longitude,
      rawData: item,
    };
  };

  const fetchAttendanceReviewData = useCallback(async () => {
    try {
      setLoading(true);

      if (!slug) {
        setRecords([]);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/mispunches/${slug}`,
        { params: { month: monthQuery } },
      );

      const attendanceRows = response.data?.data || [];

      setRecords(attendanceRows.map(normalizeRecord));
    } catch (error) {
      console.error("Attendance review fetch error:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [monthQuery, slug]);

  useEffect(() => {
    fetchAttendanceReviewData();
  }, [fetchAttendanceReviewData]);

  const filteredRecords = useMemo(() => {
    let nextRecords = [...records];

    if (searchTerm.trim()) {
      const searchValue = searchTerm.toLowerCase();
      nextRecords = nextRecords.filter(
        (item) =>
          item.employeeName.toLowerCase().includes(searchValue) ||
          String(item.employeeId).includes(searchTerm) ||
          item.reason.toLowerCase().includes(searchValue),
      );
    }

    if (selectedStatus !== "all") {
      nextRecords = nextRecords.filter(
        (item) => item.mispunchStatus === selectedStatus,
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilter &&
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter]);

  const stats = useMemo(() => {
    return {
      totalEmployees: new Set(records.map((item) => item.employeeId)).size,
      approved: records.filter((item) => item.mispunchStatus === "Approved")
        .length,
      pending: records.filter((item) => item.mispunchStatus === "Pending")
        .length,
      rejected: records.filter((item) => item.mispunchStatus === "Rejected")
        .length,
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

  const bulkUpdateMispunchStatus = async (status) => {
    const actionLabel = status === "Approved" ? "approve" : "reject";
    const confirmed = window.confirm(
      `Do you want to ${actionLabel} ${selectedCount} selected attendance status(es)?`,
    );
    if (!confirmed) return;

    try {
      setBulkLoading(true);
      const idsToUpdate = Array.from(selectedIds);

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/mispunches/bulk-status`,
        { ids: idsToUpdate, status },
      );

      setRecords((current) =>
        current.map((item) =>
          selectedIds.has(item.id) ? { ...item, mispunchStatus: status } : item,
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

  const updateMispunchStatus = async (record, status, event) => {
    event?.stopPropagation?.();

    const actionLabel = status === "Approved" ? "approve" : "reject";
    const confirmed = window.confirm(
      `Do you want to ${actionLabel} the attendance status for ${record.employeeName} on ${record.date}?`,
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(record.id);
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/mispunches/status/${record.id}`,
        { status },
      );

      const updatedRecord = response.data?.data
        ? normalizeRecord(response.data.data)
        : { ...record, mispunchStatus: status };

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
        "Punch In",
        "Leave Time",
        "Attendance Status",
        "Reason",
      ],
      ...filteredRecords.map((item) => [
        item.date,
        item.employeeId,
        item.employeeName,
        formatTimeOnly(item.punchIn),
        formatTimeOnly(item.leaveTime),
        item.mispunchStatus,
        `"${String(item.reason).replace(/"/g, '""')}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `employee-attendance-review-${monthQuery}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="app-shell flex min-h-[calc(100vh-100px)] items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-(--border-soft) border-t-(--brand)" />
          <div>
            <p className="app-heading">
              Loading attendance review records
            </p>
            <p className="text-[13px] text-(--text-soft) font-medium">
              Syncing attendance notes for {monthNames[selectedMonth]}{" "}
              {selectedYear}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-[calc(100vh-80px)] font-sans p-3 md:p-4">
      <div className="mx-auto max-w-6xl space-y-3">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="app-panel p-3 flex items-center gap-3 transition-all">
            <div className="bg-(--brand-soft) border border-(--border-soft) p-2 rounded-xl shrink-0">
              <Users className="w-4 h-4 text-(--brand)" />
            </div>
            <div>
              <p className="text-xl font-black text-(--text-strong) leading-tight">
                {stats.totalEmployees}
              </p>
              <p className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider">
                Total Workforce
              </p>
            </div>
          </div>
          <div className="app-panel p-3 flex items-center gap-3 transition-all">
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100 shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-(--text-strong) leading-tight">
                {stats.approved}
              </p>
              <p className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider">
                Approved Entries
              </p>
            </div>
          </div>
          <div className="app-panel p-3 flex items-center gap-3 transition-all">
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-100 shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-black text-(--text-strong) leading-tight">
                {stats.pending}
              </p>
              <p className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider">
                Pending Review
              </p>
            </div>
          </div>
          <div className="app-panel p-3 flex items-center gap-3 transition-all">
            <div className="bg-rose-50 p-2 rounded-xl border border-rose-100 shrink-0">
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xl font-black text-(--text-strong) leading-tight">
                {stats.rejected}
              </p>
              <p className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider">
                Rejected Entries
              </p>
            </div>
          </div>
        </div>


        <div className="app-panel p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex items-center rounded-xl border border-(--border-soft) bg-white px-3 transition-all focus-within:border-(--brand) focus-within:ring-4 focus-within:ring-(--brand-ring)">
                <Calendar className="h-4 w-4 text-(--text-faint)" />
                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(Number(event.target.value))
                  }
                  className="h-9 flex-1 appearance-none bg-transparent pr-8 text-[13px] font-medium text-(--text-body) outline-none cursor-pointer"
                >
                  {monthNames.map((name, index) => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 pointer-events-none text-(--text-faint)" />
              </div>
              <div className="relative flex items-center rounded-xl border border-(--border-soft) bg-white px-3 transition-all focus-within:border-(--brand) focus-within:ring-4 focus-within:ring-(--brand-ring)">
                <select
                  value={selectedYear}
                  onChange={(event) =>
                    setSelectedYear(Number(event.target.value))
                  }
                  className="h-9 flex-1 appearance-none bg-transparent pr-8 text-[13px] font-medium text-(--text-body) outline-none cursor-pointer"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 pointer-events-none text-(--text-faint)" />
              </div>
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilter((current) => !current)}
                className="app-btn-secondary inline-flex h-9 min-h-0 items-center gap-2 px-3 text-[13px]"
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
                  placeholder="Search employee, ID, or reason"
                  className="app-input w-full px-4 py-2 pl-11 text-[13px]"
                />
              </div>
              <button
                onClick={fetchAttendanceReviewData}
                className="app-icon-button inline-flex h-9 w-9 shrink-0 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong)"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleExport}
                className="app-btn-primary inline-flex h-9 min-h-0 items-center justify-center gap-2 px-4 text-[13px] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {showFilter && (
            <div
              ref={filterPanelRef}
              className="app-panel-muted mt-3 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <p className="modal-section-title mb-3 block uppercase tracking-wider">
                Attendance Status
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
                        ? "border-transparent bg-(--brand) text-white shadow-[0_10px_20px_rgba(0,166,81,0.16)]"
                        : "border-(--border-soft) bg-white text-(--text-soft) hover:border-(--border-strong) hover:text-(--brand)"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>


        <div className="app-panel overflow-hidden">
          <div className="app-section-bar flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl border border-(--border-soft) bg-(--brand-soft) p-2 text-(--brand) shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-soft)">
                  Attendance Review Ledger
                </p>
                <h2 className="text-sm font-bold text-(--text-strong)">
                  {monthNames[selectedMonth]} {selectedYear}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-(--text-soft)">
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
                className="app-icon-button inline-flex h-8 w-8 shrink-0 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong)"
                title={areAllVisible ? "Collapse all" : "Expand all"}
              >
                <ListChevronsDownUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-(--border-soft) bg-(--brand-soft) px-5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-(--brand) px-1.5 text-[10px] font-bold text-white">
                  {selectedCount}
                </span>
                <span className="text-xs font-bold text-(--text-strong)">
                  selected
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => bulkUpdateMispunchStatus("Approved")}
                  disabled={
                    bulkLoading ||
                    !Array.from(selectedIds).some(
                      (id) =>
                        records.find((record) => record.id === id)?.reason,
                    )
                  }
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                  title="Approve All"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => bulkUpdateMispunchStatus("Rejected")}
                  disabled={
                    bulkLoading ||
                    !Array.from(selectedIds).some(
                      (id) =>
                        records.find((record) => record.id === id)?.reason,
                    )
                  }
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200/60 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-50"
                  title="Reject All"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={clearSelection}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="bg-(--bg-subtle)/45 p-4 min-h-100">
            {filteredRecords.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-white rounded-2xl border border-(--border-soft) flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-(--text-faint)" />
                </div>
                <h3 className="app-heading mb-1">
                  No records matching your search
                </h3>
                <p className="text-(--text-soft) text-[13px] max-w-sm font-medium">
                  We couldn't find any attendance entries for the current filter
                  settings.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedGroups.map((group) => {
                  const isOpen = openGroups[group.date] ?? false;

                  return (
                    <div key={group.date} className="space-y-2">

                      <div className="app-panel px-3 py-2.5 flex items-center gap-3 transition-all">
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
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--border-soft) bg-(--bg-subtle) text-(--text-soft)">
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
                              <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                                {group.date}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-(--border-soft) bg-(--bg-subtle) text-(--text-soft) uppercase tracking-wider">
                            {group.records.length} Entries
                          </span>
                        </button>
                      </div>


                      {isOpen && (
                        <div className="pl-4 md:pl-8 space-y-1.5">
                          {group.records.map((record) => (
                            <div
                              key={record.id}
                              className="app-panel px-3 py-2.5 transition-all flex flex-col xl:flex-row xl:items-center gap-3 hover:bg-(--bg-subtle)"
                            >
                              <div className="flex items-center gap-3 min-w-50">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(record.id)}
                                  onChange={() => toggleSelectRecord(record.id)}
                                  className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 cursor-pointer"
                                />
                                <div className="w-8 h-8 rounded-lg border border-(--border-soft) bg-(--bg-subtle) flex items-center justify-center text-(--brand) font-bold text-xs shrink-0">
                                  {record.employeeName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-(--text-strong) text-sm leading-tight">
                                    {record.employeeName}
                                  </h3>
                                  <p className="text-[10px] font-bold text-(--text-faint) uppercase tracking-wider">
                                    ID: {record.employeeId}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 min-w-55">
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="font-mono">
                                    {formatTimeOnly(record.punchIn)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                                  <span className="font-mono">
                                    {formatTimeOnly(record.leaveTime)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-600 truncate">
                                  {record.reason ||
                                    "No attendance remarks documented."}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {record.isLate && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 border-orange-200/60 bg-orange-50 text-orange-700">
                                    Late
                                  </span>
                                )}
                                {record.isHalfDay && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 border-amber-200/60 bg-amber-50 text-amber-700">
                                    Half Day
                                  </span>
                                )}
                                {record.isEarlyLeave && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 border-rose-200/60 bg-rose-50 text-rose-700">
                                    Early Leave
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 border-t xl:border-t-0 pt-2 xl:pt-0 border-slate-100 mt-1 xl:mt-0">
                                <button
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setShowDetails(true);
                                  }}
                                  className="app-icon-button inline-flex h-8 w-8 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong)"
                                  title="View Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                {record.reason &&
                                  record.mispunchStatus !== "Approved" && (
                                    <button
                                      onClick={(event) =>
                                        updateMispunchStatus(
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
                                {record.reason &&
                                  record.mispunchStatus !== "Rejected" && (
                                    <button
                                      onClick={(event) =>
                                        updateMispunchStatus(
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


          {groupedRecords.length > itemsPerPage && (
            <div className="app-section-bar flex items-center justify-between border-t border-(--border-soft) px-5 py-3">
              <p className="text-xs font-bold text-(--text-soft)">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="app-icon-button inline-flex h-8 w-8 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="app-icon-button inline-flex h-8 w-8 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>


        {showDetails && selectedRecord && (
          <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="app-modal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

              <div className="flex items-center justify-between px-5 py-3 border-b border-(--border-soft) bg-white z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-(--border-soft) bg-(--brand-soft) flex items-center justify-center text-(--brand) font-bold text-sm shrink-0">
                    {selectedRecord.employeeName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-(--text-strong) leading-tight">
                      {selectedRecord.employeeName}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                      ID {selectedRecord.employeeId} • {selectedRecord.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="app-icon-button inline-flex h-8 w-8 items-center justify-center border-(--border-soft) bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>


              <div className="px-5 py-4 overflow-y-auto space-y-3 bg-(--bg-subtle)/45 flex-1 custom-scrollbar">
                <div className="app-panel overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-3">
                    <div className="px-4 py-3 border-b border-slate-100 sm:border-r">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Employee ID
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {selectedRecord.employeeId}
                      </p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 sm:border-r">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Punch In
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {formatTimeOnly(selectedRecord.punchIn)}
                      </p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Leave Time
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {formatTimeOnly(selectedRecord.leaveTime)}
                      </p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 sm:border-r">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Duration
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedRecord.totalHoursLabel}
                      </p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 sm:border-r">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Shift
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedRecord.shiftName}
                      </p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Logged Date
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {formatFullDate(selectedRecord.date)}
                      </p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 sm:col-span-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Shift Timing
                      </p>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {selectedRecord.shiftStart
                          ? `${selectedRecord.shiftStart} - ${selectedRecord.shiftEnd}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {(selectedRecord.isLate ||
                  selectedRecord.isHalfDay ||
                  selectedRecord.isEarlyLeave) && (
                  <div className="app-panel px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Attendance Chips
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.isLate && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 border-orange-200/60 bg-orange-50 text-orange-700">
                          Late
                        </span>
                      )}
                      {selectedRecord.isHalfDay && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 border-amber-200/60 bg-amber-50 text-amber-700">
                          Half Day
                        </span>
                      )}
                      {selectedRecord.isEarlyLeave && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 border-rose-200/60 bg-rose-50 text-rose-700">
                          Early Leave
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {selectedRecord.reason && (
                  <div className="app-panel px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {selectedRecord.isLate ? "Late Reason" : "Reason"}
                    </p>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-snug">
                      {selectedRecord.reason}
                    </p>
                  </div>
                )}

                {selectedRecord.latitude && selectedRecord.longitude && (
                  <div className="app-panel px-4 py-3 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Location
                    </p>
                    <span className="text-sm font-bold text-slate-700 font-mono ml-auto">
                      {Number(selectedRecord.latitude).toFixed(6)},{" "}
                      {Number(selectedRecord.longitude).toFixed(6)}
                    </span>
                  </div>
                )}
              </div>


              <div className="border-t border-(--border-soft) bg-white px-5 py-2.5 flex items-center justify-end gap-1.5 shrink-0">
                {selectedRecord.reason &&
                  selectedRecord.mispunchStatus !== "Approved" && (
                    <button
                      onClick={(event) =>
                        updateMispunchStatus(selectedRecord, "Approved", event)
                      }
                      disabled={actionLoadingId === selectedRecord.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-50 shadow-sm"
                      title="Approve"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                {selectedRecord.reason &&
                  selectedRecord.mispunchStatus !== "Rejected" && (
                    <button
                      onClick={(event) =>
                        updateMispunchStatus(selectedRecord, "Rejected", event)
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
                  className="app-btn-secondary inline-flex h-8 min-h-0 items-center justify-center px-3 text-xs"
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

export default EmployeeAttendanceReview;
