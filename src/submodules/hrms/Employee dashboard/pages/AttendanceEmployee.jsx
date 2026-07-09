import axios from "axios";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Filter,
  Gift,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import {
  calculateAttendanceDuration,
  formatAttendanceTime24,
  getAttendanceDateValue,
  getCurrentIndiaDate,
} from "../../utils/attendanceTime";

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

const DailyAttendanceModal = ({ record, onClose }) => {
  if (!record) return null;

  const raw = record.rawData || {};
  const overtime = raw.overtime || "";
  const hasOvertime =
    overtime && overtime !== "00:00:00" && overtime !== "0:00:00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Daily attendance
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {record.date ? formatDateLabel(record.date) : "Attendance record"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {raw.employee_name || "Employee"} {raw.employee_id ? ` · ID ${raw.employee_id}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-white hover:text-slate-900 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-px bg-slate-100 md:grid-cols-2">
          <div className="bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Summary
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-slate-900">{record.status}</span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Shift</span>
                <span className="font-bold text-slate-900">{record.shift || "General"}</span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Total hours</span>
                <span className="font-mono font-bold text-slate-900">{record.totalHours || "N/A"}</span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Check in</span>
                <span className="font-mono font-bold text-slate-900">
                  {record.checkInTime || "N/A"}
                </span>
              </p>
              <p className="flex items-start justify-between gap-4">
                <span className="text-slate-500">Check out</span>
                <span className="font-mono font-bold text-slate-900">
                  {record.checkOutTime || "N/A"}
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
                  Timesheet
                </p>
                <p className="mt-1 leading-6">
                  {record.timesheetDetails || "No timesheet note available."}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Late reason
                </p>
                <p className="mt-1 leading-6">
                  {record.reason || "No late reason added."}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Overtime
                </p>
                <p className="mt-1 leading-6">
                  {hasOvertime
                    ? `${overtime}${Number(raw.ot_approved || 0) === 1 ? " · Approved" : ""}`
                    : "No overtime recorded."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonthlyAttendanceOverview = ({ monthData, year, onClose }) => {
  if (!monthData) return null;

  const records = Object.entries(monthData.attendance)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, entry]) => ({ date, entry }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Monthly overview
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {monthData.monthName} {year}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {[
                `${monthData.summary.present} present`,
                `${monthData.summary.absent} absent`,
                `${monthData.summary.halfDay} half day`,
                `${monthData.summary.late} late`,
              ].join(" · ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-white hover:text-slate-900 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-px bg-slate-100 md:grid-cols-4">
          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Present
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {monthData.summary.present}
            </p>
          </div>
          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Absent
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-700">
              {monthData.summary.absent}
            </p>
          </div>
          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Half day
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {monthData.summary.halfDay}
            </p>
          </div>
          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Late
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-700">
              {monthData.summary.late}
            </p>
          </div>
        </div>

        <div className="max-h-[calc(90vh-190px)] overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {records.length ? (
              records.map(({ date, entry }) => (
                <div
                  key={date}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {formatDateLabel(date)}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        {entry.status} · {entry.shift || "General"}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-700">
                      {entry.totalHours || "N/A"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 md:col-span-2">
                No attendance records were captured for this month yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UTILS ---
const currentIndiaDate = getCurrentIndiaDate();
const [currentIndiaYear] = currentIndiaDate.split("-").map(Number);

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

const EmployeeYearlyAttendance = () => {
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentIndiaYear);
  const [holidayDates, setHolidayDates] = useState([]);

  // Filters
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");

  // Modal States
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] =
    useState(null);
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);

  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);

  const { user } = useAuth();
  const slug = user.slug;
  // Fallback to ID if no specific employee ID logic is present in your auth state
  const employeeId = user.employee_id || user.id;
  const companyScopeId = user.company_id || user.id;
  const holidayDateSet = new Set(holidayDates);

  const availableYears = [
    currentIndiaYear + 1,
    currentIndiaYear,
    currentIndiaYear - 1,
  ];

  // Design tokens
  const panelClass =
    "bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-hidden transition-all hover:shadow-md";
  const filterChipBase =
    "rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all";

  const getDaysInMonth = (year, monthIndex) =>
    new Date(year, monthIndex + 1, 0).getDate();
  const getIndiaDateValue = (dateString) =>
    new Date(`${dateString}T12:00:00+05:30`);
  const isSunday = (dateString) =>
    getIndiaDateValue(dateString).getUTCDay() === 0;
  const isHoliday = (dateString) => holidayDateSet.has(dateString);
  const isFutureDate = (dateString) => dateString > currentIndiaDate;

  useEffect(() => {
    if (slug && employeeId) {
      fetchYearlyData(selectedYear);
    }
  }, [selectedYear, slug, employeeId]);

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

  const fetchYearlyData = async (year) => {
    if (!slug || !employeeId) return;
    try {
      setLoading(true);

      // The proper, single API call for the whole year
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/${slug}/employee/${employeeId}/year/${year}`,
      );

      const allYearRecords = res.data.data || [];
      const holidaysRes = await axios
        .get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday`, {
          params: {
            company_id: companyScopeId,
            slug,
          },
        })
        .catch(() => null);
      const holidays = Array.isArray(holidaysRes?.data)
        ? holidaysRes.data
        : Array.isArray(holidaysRes?.data?.data)
          ? holidaysRes.data.data
          : [];
      const fetchedHolidayDates = holidays
        .map((holiday) => String(holiday?.date || "").slice(0, 10))
        .filter(Boolean);
      setHolidayDates(fetchedHolidayDates);
      const fetchedHolidaySet = new Set(fetchedHolidayDates);

      // 1. Initialize empty buckets for all 12 months
      const processedYear = monthNames.map((monthName, monthIndex) => ({
        monthIndex,
        monthName,
        daysInMonth: getDaysInMonth(year, monthIndex),
        attendance: {},
        summary: { present: 0, absent: 0, halfDay: 0, late: 0 },
      }));

      // 2. Iterate through the flat array and distribute records into the correct month buckets
      allYearRecords.forEach((record) => {
        const date = getAttendanceDateValue(record); // format expected: YYYY-MM-DD
        if (!date) return;
        if (fetchedHolidaySet.has(date) || isSunday(date) || isFutureDate(date)) return;

        // Extract month from date string (0-indexed for our array)
        const recordMonthIndex = parseInt(date.split("-")[1], 10) - 1;

        // Safety check just in case backend sends garbage dates
        if (recordMonthIndex < 0 || recordMonthIndex > 11) return;

        const isHalfDay = Number(record.is_half_day || 0);
        const isLate = Number(record.is_late || 0);

        // Slot it in
        processedYear[recordMonthIndex].attendance[date] =
          createAttendanceEntryFromRecord(record);

        // Update basic counts
        if (isHalfDay) processedYear[recordMonthIndex].summary.halfDay++;
        else processedYear[recordMonthIndex].summary.present++;

        if (isLate) processedYear[recordMonthIndex].summary.late++;
      });

      // 3. Calculate absents for each month based on elapsed working days
      processedYear.forEach((monthData) => {
        let elapsedWorkingDays = 0;
        for (let day = 1; day <= monthData.daysInMonth; day++) {
          const dateStr = `${year}-${String(monthData.monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          // If it's not a Sunday, holiday, or future date, it was a required working day
          if (!isSunday(dateStr) && !fetchedHolidaySet.has(dateStr) && !isFutureDate(dateStr)) {
            elapsedWorkingDays++;
          }
        }

        const recordedDays = Object.keys(monthData.attendance).length;
        monthData.summary.absent = Math.max(
          elapsedWorkingDays - recordedDays,
          0,
        );
      });

      setYearData(processedYear);
    } catch (error) {
      console.error("Yearly Attendance fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAttendanceEntryFromRecord = (record) => {
    const isHalfDay = Number(record.is_half_day || 0);
    const checkInTime =
      formatAttendanceTime24(record.mispunch_time) !== "N/A"
        ? formatAttendanceTime24(record.mispunch_time)
        : "";
    const checkOutTime =
      formatAttendanceTime24(record.leave_time) !== "N/A"
        ? formatAttendanceTime24(record.leave_time)
        : "";
    let totalHours =
      record.total_hours ||
      calculateAttendanceDuration(record.mispunch_time, record.leave_time);

    if (
      totalHours &&
      typeof totalHours === "string" &&
      totalHours.includes(":")
    ) {
      const [hours, minutes] = totalHours.split(":");
      if (hours && minutes) totalHours = `${hours}h ${minutes}m`;
    }

    return {
      attendance_id: record.id,
      status: isHalfDay ? "Half Day" : "Present",
      shift: record.shift_name || "General",
      checkInTime,
      checkOutTime,
      totalHours: totalHours !== "N/A" ? totalHours : "",
      timesheetDetails: record.timesheet_details || "",
      reason: record.reason || "",
      date: getAttendanceDateValue(record),
      rawData: record,
    };
  };

  const getStatusBadge = (status, totalHours = "") => {
    const hoursLabel =
      totalHours && totalHours !== "N/A" ? (
        <span className="text-[10px] font-bold text-slate-500 font-mono">
          {totalHours}
        </span>
      ) : null;

    switch (status) {
      case "Present":
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="inline-flex min-w-8 items-center justify-center rounded-lg border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
              P
            </span>
            {hoursLabel}
          </div>
        );
      case "Absent":
        return (
          <span className="inline-flex min-w-8 items-center justify-center rounded-lg border border-rose-200/60 bg-rose-50 px-1.5 py-0.5 text-[11px] font-bold text-rose-700">
            A
          </span>
        );
      case "Half Day":
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="inline-flex min-w-8 items-center justify-center rounded-lg border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
              H
            </span>
            {hoursLabel}
          </div>
        );
      case "Muted":
        return (
          <span className="text-base font-semibold text-slate-300 leading-none">
            -
          </span>
        );
      case "Holiday":
        return (
          <span
            className="inline-flex items-center justify-center rounded-full border border-violet-200/70 bg-violet-50 p-1 text-violet-700"
            title="Holiday"
            aria-label="Holiday"
          >
            <Gift className="h-4 w-4 text-violet-500" />
          </span>
        );
      case "Disabled":
        return null;
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Year", "Month", "Date", "Status", "Shift", "Total Hours"],
      ...yearData.flatMap((month) =>
        Object.entries(month.attendance).map(([date, att]) => [
          selectedYear,
          month.monthName,
          date,
          att.status,
          att.shift,
          att.totalHours,
        ]),
      ),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my_attendance_${selectedYear}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-900" />
          <h3 className="text-lg font-bold text-slate-900">
            Loading Attendance Report
          </h3>
        </div>
      </div>
    );
  }

  // Define static 31 columns for the monthly grid
  const dayColumns = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen w-full mx-auto p-4 md:p-8 bg-transparent font-sans">
      <div className="mx-auto max-w-full space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Attendance Report
                </h1>
              </div>
              <p className="text-slate-500 text-xs font-medium ml-1">
                Monthly and per-day attendance summary for {selectedYear}.
              </p>
            </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              label: "Present",
              value: yearData.reduce((acc, m) => acc + m.summary.present, 0),
              icon: UserCheck,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              label: "Absent",
              value: yearData.reduce((acc, m) => acc + m.summary.absent, 0),
              icon: UserX,
              color: "text-rose-600",
              bg: "bg-rose-50",
              border: "border-rose-100",
            },
            {
              label: "Half Day",
              value: yearData.reduce((acc, m) => acc + m.summary.halfDay, 0),
              icon: AlertCircle,
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-100",
            },
            {
              label: "Late Arrival",
              value: yearData.reduce((acc, m) => acc + m.summary.late, 0),
              icon: Clock,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl bg-white border ${stat.border} shadow-sm transition-all duration-200 group`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-1.5 rounded-lg ${stat.bg} ${stat.color} transition-transform shrink-0`}
                >
                  <stat.icon className="w-3.5 h-3.5" />
                </div>
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-[0.16em] flex-1">
                  {stat.label}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Panel */}
        <div className={`${panelClass} p-3 md:p-4 bg-white`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="group relative flex items-center rounded-2xl border border-slate-200 bg-slate-50/50 px-3 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white focus-within:border-indigo-500 transition-all cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="h-10 flex-1 appearance-none bg-transparent pr-9 pl-2.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover:translate-y-0.5 transition-transform" />
              </div>

              <button
                ref={filterButtonRef}
                onClick={() => setShowFilter(!showFilter)}
                className={`relative inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-bold tracking-tight transition-all active:scale-95 ${
                  showFilter
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                }`}
              >
                <Filter
                  className={`w-3.5 h-3.5 transition-transform ${showFilter ? "rotate-180" : ""}`}
                />
                <span>Filters</span>
                {(selectedStatus !== "all" || selectedShift !== "all") && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-black ring-4 ring-emerald-500/20">
                    {(selectedStatus !== "all" ? 1 : 0) +
                      (selectedShift !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchYearlyData(selectedYear)}
                className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 active:scale-90"
                title="Refresh Records"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button
                onClick={exportToCSV}
                className="inline-flex h-10 items-center gap-2.5 rounded-2xl bg-emerald-500 px-4 text-xs font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 shadow-lg shadow-emerald-500/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div
              ref={filterPanelRef}
              className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Attendance Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "Present", "Absent", "Half Day"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowFilter(false);
                        }}
                        className={`${filterChipBase} ${selectedStatus === status ? "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                      >
                        {status === "all" ? "All" : status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Working Shift
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "all",
                      "Morning Shift",
                      "Evening Shift",
                      "Night Shift",
                    ].map((shift) => (
                      <button
                        key={shift}
                        onClick={() => {
                          setSelectedShift(shift);
                          setShowFilter(false);
                        }}
                        className={`${filterChipBase} ${selectedShift === shift ? "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                      >
                        {shift === "all" ? "All Shifts" : shift}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 12-Month Matrix */}
        <div
          className={`${panelClass} flex h-[calc(100vh-320px)] flex-col bg-slate-50 overflow-hidden`}
        >
          <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-30 bg-slate-50">
              <tr>
                <th className="sticky left-0 z-40 min-w-32 border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                  Month
                </th>
                {dayColumns.map((day) => (
                  <th
                    key={`head-${day}`}
                    className="min-w-15 border-b border-slate-200 bg-slate-50 px-2 py-3 text-center"
                  >
                    <span className="text-sm font-bold text-slate-900">
                      {day}
                    </span>
                  </th>
                ))}
                <th className="sticky right-0 z-40 min-w-24 border-b border-l border-slate-200 bg-slate-50 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                  Summary / View
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {yearData.map((monthData) => {
                return (
                  <tr
                    key={`row-${monthData.monthIndex}`}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    {/* Month Name Column */}
                    <td className="sticky left-0 z-20 min-w-32 border-b border-r border-slate-100 px-4 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                      <div className="font-bold text-slate-900">
                        {monthData.monthName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium">
                        {monthData.summary.present} Present ·{" "}
                        {monthData.summary.absent} Absent
                      </div>
                    </td>

                    {/* Day Matrix Columns */}
                    {dayColumns.map((day) => {
                      const isValidDay = day <= monthData.daysInMonth;
                      const dateStr = isValidDay
                        ? `${selectedYear}-${String(monthData.monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        : null;

                      // Filter checks
                      const dayRecord = isValidDay
                        ? monthData.attendance[dateStr]
                        : null;
                      const isSundayDate = isValidDay
                        ? isSunday(dateStr)
                        : false;
                      const isHolidayDate = isValidDay
                        ? isHoliday(dateStr)
                        : false;
                      const isFuture = isValidDay
                        ? isFutureDate(dateStr)
                        : false;

                      // Apply UI filters logically - if filters fail, treat as absent visual logic but muted
                      let isVisibleByFilter = true;
                      if (dayRecord) {
                        if (
                          selectedStatus !== "all" &&
                          dayRecord.status !== selectedStatus
                        )
                          isVisibleByFilter = false;
                        if (
                          selectedShift !== "all" &&
                          dayRecord.shift !== selectedShift
                        )
                          isVisibleByFilter = false;
                      } else if (
                        selectedStatus !== "all" &&
                        selectedStatus !== "Absent"
                      ) {
                        isVisibleByFilter = false;
                      }

                      return (
                        <td
                          key={`cell-${monthData.monthIndex}-${day}`}
                          className="min-w-15 border-b border-r border-slate-100 px-1 py-2 text-center last:border-r-0"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 h-full min-h-10">
                            {!isValidDay ? (
                              getStatusBadge("Disabled")
                            ) : isSundayDate || isFuture ? (
                              getStatusBadge("Muted")
                            ) : isHolidayDate ? (
                              getStatusBadge("Holiday")
                            ) : !isVisibleByFilter ? (
                              <div className="opacity-20">
                                {dayRecord
                                  ? getStatusBadge(
                                      dayRecord.status,
                                      dayRecord.totalHours,
                                    )
                                  : getStatusBadge("Absent")}
                              </div>
                            ) : dayRecord ? (
                              <button
                                onClick={() =>
                                  setSelectedAttendanceRecord(dayRecord)
                                }
                                className="rounded-xl transition-all hover:scale-105 p-1"
                              >
                                {getStatusBadge(
                                  dayRecord.status,
                                  dayRecord.totalHours,
                                )}
                              </button>
                            ) : (
                              getStatusBadge("Absent")
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Actions Column */}
                    <td className="sticky right-0 z-20 whitespace-nowrap border-b border-l border-slate-100 px-4 py-3 bg-white group-hover:bg-slate-50">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMonthData(monthData);
                            setShowTimesheet(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-900"
                          title="Monthly Report"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {selectedAttendanceRecord && (
        <DailyAttendanceModal
          record={selectedAttendanceRecord}
          onClose={() => setSelectedAttendanceRecord(null)}
        />
      )}
      {showTimesheet && (
        <MonthlyAttendanceOverview
          monthData={selectedMonthData}
          year={selectedYear}
          onClose={() => setShowTimesheet(false)}
        />
      )}
    </div>
  );
};

export default EmployeeYearlyAttendance;
