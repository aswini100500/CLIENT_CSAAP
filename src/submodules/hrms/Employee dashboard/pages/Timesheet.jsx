import axios from "axios";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
  Clock,
  Zap,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useAuth from "../../../../hooks/useAuth";
import {
  calculateAttendanceDuration,
  formatAttendanceTime24,
  getCurrentIndiaDate,
} from "../../utils/attendanceTime";

const currentIndiaDate = getCurrentIndiaDate();
const [currentIndiaYear] = currentIndiaDate.split("-").map(Number);

const MONTHS = [
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

const STATUS_OPTIONS = ["all", "Approved", "Pending", "Rejected"];
const MONTH_OPTIONS = ["all", ...MONTHS];

const panelClass =
  "bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-hidden transition-all hover:shadow-md";

const formatDateLabel = (dateString) => {
  if (!dateString) return "N/A";
  const parsed = new Date(`${dateString}T12:00:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const renderDateCard = (dateString) => {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T12:00:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return null;

  const day = parsed.getDate().toString().padStart(2, "0");
  const month = parsed
    .toLocaleString("en-IN", { month: "short" })
    .toUpperCase();

  return (
    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 ring-1 ring-indigo-100 transition-transform group-hover:scale-105">
      <span className="text-lg font-black leading-none text-indigo-700">
        {day}
      </span>
      <span className="mt-0.5 text-[9px] font-bold tracking-widest text-indigo-400">
        {month}
      </span>
    </div>
  );
};

const formatDurationLabel = (value = "") => {
  if (!value) return "N/A";
  if (typeof value === "string" && value.includes("h")) return value;
  const [hours = "0", minutes = "0"] = String(value).split(":");
  return `${Number(hours)}h ${Number(minutes)}m`;
};

const getMonthKey = (dateString) => {
  if (!dateString) return "";
  const value = String(dateString).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(0, 7) : "";
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return "Unknown month";
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTHS[month - 1] || "Unknown"} ${year}`;
};

const isOvertimeValue = (value) =>
  Boolean(value && value !== "00:00:00" && value !== "0:00:00");

const groupRecordsByMonth = (records) => {
  const grouped = new Map();

  records.forEach((record) => {
    const monthKey = record.monthKey || "unknown";
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, {
        monthKey,
        monthLabel: formatMonthLabel(monthKey),
        records: [],
      });
    }
    grouped.get(monthKey).records.push(record);
  });

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      records: group.records.sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};

const TimesheetRecordModal = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Timesheet entry
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {formatDateLabel(record.date)}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {record.timesheetStatus || "Pending"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-white hover:text-slate-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-px bg-slate-100 md:grid-cols-2">
          <div className="bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Summary
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Punch in</span>
                <span className="font-mono font-bold text-slate-900">
                  {record.punchIn || "N/A"}
                </span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Punch out</span>
                <span className="font-mono font-bold text-slate-900">
                  {record.punchOut || "N/A"}
                </span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Total hours</span>
                <span className="font-mono font-bold text-slate-900">
                  {record.totalHoursLabel}
                </span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Timesheet status</span>
                <span className="font-bold text-slate-900">
                  {record.timesheetStatus || "Pending"}
                </span>
              </p>

              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Shift</span>
                <span className="font-bold text-slate-900">
                  {record.shiftStart && record.shiftEnd
                    ? `${record.shiftStart} - ${record.shiftEnd}`
                    : "N/A"}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Notes
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Timesheet details
                </p>
                <p className="mt-1 leading-6">
                  {record.timesheetDetails || "No timesheet note available."}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Overtime
                </p>
                <p className="mt-1 leading-6">
                  {isOvertimeValue(record.overtime)
                    ? `${record.overtime}${record.otApproved ? " · Approved" : ""}`
                    : "No overtime recorded."}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  OT claim
                </p>
                <p className="mt-1 leading-6">
                  {record.otClaimed ? "Claimed" : "Not claimed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Timesheet = ({ hideHeader = false }) => {
  const { user } = useAuth();
  const employeeId = user?.employee_id || user?.employeeProfileId || user?.id;

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentIndiaYear);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openGroups, setOpenGroups] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);

  const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;

  const normalizeRecord = useCallback(
    (item) => {
      const date = String(item.date || "").slice(0, 10);
      const monthKey = getMonthKey(date);
      const punchIn = formatAttendanceTime24(item.punch_in);
      const punchOut = formatAttendanceTime24(item.punch_out);
      const totalHours =
        item.total_hours ||
        calculateAttendanceDuration(item.punch_in, item.punch_out);

      return {
        id: `${date}-${item.punch_in || ""}-${item.punch_out || ""}`,
        date,
        monthKey,
        employeeId,
        department: item.department || item.employee_department || "",
        punchIn,
        punchOut,
        totalHours,
        totalHoursLabel: formatDurationLabel(totalHours),
        isHalfDay: Number(item.is_half_day || 0) === 1,
        isLate: Number(item.is_late || 0) === 1,
        isEarlyLeave: Number(item.is_early_leave || 0) === 1,
        timesheetDetails: String(item.timesheet_details || "").trim(),
        timesheetStatus: item.timesheet_status || "Pending",
        shiftStart: item.shift_start || "",
        shiftEnd: item.shift_end || "",
        overtime: item.overtime || "",
        otClaimed: Number(item.employee_ot_claim || 0) === 1,
        otApproved: Number(item.ot_approved || 0) === 1,
        otEligible: Boolean(item.ot_eligible),
        isExempt: Boolean(item.isExempt),
        exemptionType: item.exemptionType || "",
      };
    },
    [employeeId],
  );

  const fetchTimesheetData = useCallback(async () => {
    try {
      setLoading(true);

      if (!employeeId) {
        setRecords([]);
        return;
      }

      const response = await axios.get(
        `${API_BASE}/api/attendance/timesheet/${employeeId}`,
      );

      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setRecords(rows.map(normalizeRecord).filter((item) => item.date));
    } catch (error) {
      console.error("Timesheet fetch error:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, employeeId, normalizeRecord]);

  useEffect(() => {
    fetchTimesheetData();
  }, [fetchTimesheetData]);

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

  const years = useMemo(() => {
    const yearSet = new Set([
      currentIndiaYear - 1,
      currentIndiaYear,
      currentIndiaYear + 1,
    ]);
    records.forEach((record) => {
      if (record.date) yearSet.add(Number(record.date.slice(0, 4)));
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [records]);

  const filteredRecords = useMemo(() => {
    let nextRecords = [...records];

    nextRecords = nextRecords.filter(
      (record) => Number(record.date.slice(0, 4)) === Number(selectedYear),
    );

    if (selectedMonth !== "all") {
      nextRecords = nextRecords.filter(
        (record) =>
          MONTHS[Number(record.date.slice(5, 7)) - 1] === selectedMonth,
      );
    }

    if (selectedStatus !== "all") {
      nextRecords = nextRecords.filter(
        (record) => record.timesheetStatus === selectedStatus,
      );
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      nextRecords = nextRecords.filter((record) => {
        return (
          record.date.toLowerCase().includes(query) ||
          record.timesheetDetails.toLowerCase().includes(query) ||
          record.punchIn.toLowerCase().includes(query) ||
          record.punchOut.toLowerCase().includes(query) ||
          record.timesheetStatus.toLowerCase().includes(query)
        );
      });
    }

    return nextRecords.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, searchTerm, selectedMonth, selectedStatus, selectedYear]);

  useEffect(() => {
    setCurrentPage(1);
    setOpenGroups({});
  }, [searchTerm, selectedMonth, selectedStatus, selectedYear]);

  const groupedRecords = useMemo(
    () => groupRecordsByMonth(filteredRecords),
    [filteredRecords],
  );

  useEffect(() => {
    setOpenGroups((current) => {
      const next = {};
      groupedRecords.forEach((group, index) => {
        next[group.monthKey] = current[group.monthKey] ?? index === 0;
      });
      return next;
    });
  }, [groupedRecords]);

  const stats = useMemo(() => {
    return {
      entries: filteredRecords.length,
      approved: filteredRecords.filter(
        (item) => item.timesheetStatus === "Approved",
      ).length,
      pending: filteredRecords.filter(
        (item) => item.timesheetStatus === "Pending",
      ).length,
      otClaimed: filteredRecords.filter((item) => item.otClaimed).length,
    };
  }, [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(groupedRecords.length / 6));
  const currentGroups = groupedRecords.slice(
    (currentPage - 1) * 6,
    currentPage * 6,
  );
  const allVisibleOpen =
    currentGroups.length > 0 &&
    currentGroups.every((group) => openGroups[group.monthKey]);

  const handleExport = () => {
    const csvContent = [
      [
        "Date",
        "Punch In",
        "Punch Out",
        "Total Hours",
        "Timesheet Status",
        "Timesheet Details",
        "Overtime",
        "OT Claimed",
        "OT Approved",
        "Exempt",
        "Exemption Type",
      ],
      ...filteredRecords.map((record) => [
        record.date,
        record.punchIn,
        record.punchOut,
        record.totalHours || "",
        record.timesheetStatus,
        `"${String(record.timesheetDetails).replace(/"/g, '""')}"`,
        record.overtime || "",
        record.otClaimed ? "Yes" : "No",
        record.otApproved ? "Yes" : "No",
        record.isExempt ? "Yes" : "No",
        record.exemptionType || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timesheet-${selectedYear}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center bg-transparent font-sans">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-900" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Loading Timesheet
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Please wait while we fetch your records
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-sans p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        {!hideHeader && (
          <>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      Timesheet
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                {
                  label: "Records",
                  value: stats.entries,
                  icon: FileText,
                  tone: "emerald",
                },
                {
                  label: "Approved",
                  value: stats.approved,
                  icon: Users,
                  tone: "emerald",
                },
                {
                  label: "Pending",
                  value: stats.pending,
                  icon: Users,
                  tone: "amber",
                },
                {
                  label: "OT Claimed",
                  value: stats.otClaimed,
                  icon: Users,
                  tone: "rose",
                },
              ].map((stat) => {
                const toneClasses = {
                  indigo: "bg-emerald-50 text-indigo-600 ring-indigo-100",
                  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
                  amber: "bg-amber-50 text-amber-600 ring-amber-100",
                  rose: "bg-rose-50 text-rose-600 ring-rose-100",
                };

                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md"
                  >
                    <div
                      className={`shrink-0 rounded-full p-2 ring-1 ${toneClasses[stat.tone]}`}
                    >
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xl font-black leading-tight text-slate-900">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className={`${panelClass} p-4`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
                <Calendar className="h-4 w-4 text-slate-500" />
                <select
                  value={selectedYear}
                  onChange={(event) =>
                    setSelectedYear(Number(event.target.value))
                  }
                  className="h-9 flex-1 appearance-none bg-transparent pl-3 pr-8 text-sm font-medium text-slate-700 outline-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
              </div>

              <button
                ref={filterButtonRef}
                onClick={() => setShowFilter((current) => !current)}
                className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all ${
                  showFilter
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative min-w-72">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search date, note, or status"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-4 text-sm font-semibold text-white transition-all hover:from-emerald-600 hover:to-emerald-700"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {showFilter && (
            <div
              ref={filterPanelRef}
              className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Month
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MONTH_OPTIONS.map((month) => (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          setShowFilter(false);
                        }}
                        className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                          selectedMonth === month
                            ? "border-emerald-200 bg-emerald-600 text-white shadow-md shadow-emerald-50"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                        }`}
                      >
                        {month === "all" ? "All Months" : month}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowFilter(false);
                        }}
                        className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                          selectedStatus === status
                            ? "border-emerald-200 bg-emerald-600 text-white shadow-md shadow-emerald-50"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                        }`}
                      >
                        {status === "all" ? "All" : status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={panelClass}>
          <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-slate-100 bg-white px-5 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="shrink-0 rounded-lg bg-blue-50 p-2 text-emerald-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Timesheet Ledger
                </p>
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedMonth === "all" ? "All Months" : selectedMonth}{" "}
                  {selectedYear}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                {currentGroups.length}/{groupedRecords.length} groups
              </span>
              <button
                onClick={() => {
                  const next = {};
                  currentGroups.forEach((group) => {
                    next[group.monthKey] = !allVisibleOpen;
                  });
                  setOpenGroups(next);
                }}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                title={allVisibleOpen ? "Collapse all" : "Expand all"}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {groupedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-slate-50/50 px-6 py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-sm">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                No Records Found
              </h3>
              <p className="mb-6 max-w-sm text-sm font-medium text-slate-500">
                We couldn't find any timesheet entries for the current filters.
              </p>
              <button
                onClick={() => {
                  setSelectedYear(currentIndiaYear);
                  setSelectedMonth("all");
                  setSelectedStatus("all");
                  setSearchTerm("");
                }}
                className="inline-flex h-11 items-center rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-white transition-all hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-50"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-px bg-slate-100">
              {currentGroups.map((group) => {
                const isOpen = openGroups[group.monthKey];

                return (
                  <div key={group.monthKey} className="bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroups((current) => ({
                          ...current,
                          [group.monthKey]: !current[group.monthKey],
                        }))
                      }
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {group.monthLabel}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {group.records.length} entries
                          </p>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="space-y-2 border-t border-slate-100 bg-slate-50/50 p-4">
                        {group.records.map((record) => (
                          <button
                            key={record.id}
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="group flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:bg-slate-50/50 xl:flex-row xl:items-center xl:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              {renderDateCard(record.date)}
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-slate-900">
                                  {formatDateLabel(record.date)}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                      record.timesheetStatus === "Approved"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : record.timesheetStatus === "Rejected"
                                          ? "border-rose-200 bg-rose-50 text-rose-700"
                                          : "border-amber-200 bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    {record.timesheetStatus || "Pending"}
                                  </span>

                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                                    {record.totalHoursLabel}
                                  </span>

                                  {isOvertimeValue(record.overtime) && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                      <Zap className="h-2.5 w-2.5 text-emerald-400" />
                                      OT {record.overtime}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="min-w-0 flex-1 xl:max-w-[48%]">
                              <p className="truncate text-sm font-medium text-slate-600">
                                {record.timesheetDetails ||
                                  "No timesheet note available."}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {groupedRecords.length > 6 && (
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
      </div>

      {selectedRecord && (
        <TimesheetRecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default Timesheet;
