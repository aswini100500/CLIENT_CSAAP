import React from "react";
import axios from "axios";
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Gift,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import {
  calculateAttendanceDuration,
  formatAttendanceTime24,
  getAttendanceDateValue,
  getCurrentIndiaDate,
} from "../../utils/attendanceTime";
import {
  exportAttendanceToCsv,
  exportAttendanceToExcel,
} from "../../utils/attendanceExportUtils";
import DailyAttendanceModal from "../Attendance/DailyAttendanceModal";
import AttendanceAuditModal from "../Attendance/AttendanceAuditModal";
import MonthlyAttendanceOverview from "../Attendance/MonthlyAttendanceOverview";

const currentIndiaDate = getCurrentIndiaDate();
const [currentIndiaYear, currentIndiaMonth] = currentIndiaDate
  .split("-")
  .map(Number);

const EmployeeAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [holidayDates, setHolidayDates] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(currentIndiaMonth - 1);
  const [selectedYear, setSelectedYear] = useState(currentIndiaYear);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] =
    useState(null);
  const [selectedAttendanceEmployee, setSelectedAttendanceEmployee] =
    useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [recordActionState, setRecordActionState] = useState({
    timesheet: "",
    overtime: "",
  });
  const [selectedPostApplied, setSelectedPostApplied] = useState("all");
  const [availablePostApplied, setAvailablePostApplied] = useState([]);
  const [companyQR, setCompanyQR] = useState(null);

  const filterPanelRef = useRef(null);
  const filterButtonRef = useRef(null);
  const { user, token } = useAuth();
  const slug = user.slug;
  const companyScopeId = user.company_id || user.id;
  const holidayDateSet = new Set(holidayDates);

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

  const availableYears = [
    currentIndiaYear + 1,
    currentIndiaYear,
    currentIndiaYear - 1,
  ];
  const availableMonths = monthNames.map((_, index) => index);

  const panelClass =
    "app-panel overflow-hidden transition-colors duration-200 hover:border-(--border-strong)";
  const controlClass =
    "app-input h-11 px-4 transition-all text-(--text-body) font-medium placeholder:text-(--text-faint)";
  const filterChipBase =
    "rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all";

  const designationColorClasses = [
    "border-sky-200/60 bg-sky-50 text-sky-700",
    "border-emerald-200/60 bg-emerald-50 text-emerald-700",
    "border-amber-200/60 bg-amber-50 text-amber-700",
    "border-rose-200/60 bg-rose-50 text-rose-700",
    "border-violet-200/60 bg-violet-50 text-violet-700",
    "border-cyan-200/60 bg-cyan-50 text-cyan-700",
  ];

  const createEmployeeSummary = (employee) => ({
    employee_id: employee.id ?? employee.employee_id,
    employee_name: employee.name || employee.employee_name || "Unknown",
    department: employee.department || "N/A",
    branch_id: employee.branch_id || employee.branchId || null,
    branch_name: employee.branch_name || employee.branchName || "",
    company_id: Number(
      employee.company_id ?? employee.companyId ?? user.company_id ?? user.id,
    ),
    companyName:
      employee.companyName ||
      employee.company_name ||
      user.companyName ||
      user.company ||
      "",
    slug: employee.slug || employee.company_slug || slug || "",
    postApplied:
      employee.postApplied ||
      employee.designation ||
      employee.post_applied ||
      "N/A",
    shiftName:
      employee.employeeShift ||
      employee.shift_name ||
      employee.shiftName ||
      "General",
    shiftStart: employee.shift_start || employee.shiftStart || "",
    shiftEnd: employee.shift_end || employee.shiftEnd || "",
    otAllowed: Boolean(
      employee.ot_allowed === 1 ||
      employee.ot_allowed === true ||
      employee.ot_allowed === "1",
    ),
    attendance: {},
    summary: {
      present: 0,
      absent: 0,
      halfDay: 0,
      late: 0,
    },
  });

  const filterEmployeesByCompanyScope = (employees) => {
    if (!Array.isArray(employees)) return [];

    let filteredEmployees = employees;

    if (
      slug &&
      filteredEmployees.some(
        (employee) => employee.slug || employee.company_slug,
      )
    ) {
      filteredEmployees = filteredEmployees.filter(
        (employee) =>
          String(employee.slug || employee.company_slug || "") === String(slug),
      );
    }

    if (
      companyScopeId &&
      filteredEmployees.some(
        (employee) => employee.company_id || employee.companyId,
      )
    ) {
      filteredEmployees = filteredEmployees.filter(
        (employee) =>
          Number(employee.company_id || employee.companyId) ===
          Number(companyScopeId),
      );
    }

    return filteredEmployees;
  };

  const createAttendanceEntryFromRecord = (record) => {
    const isHalfDay = Number(record.is_half_day || 0);
    const isLate = Number(record.is_late || 0);
    const isEarlyLeave = Number(record.is_early_leave || 0);
    let totalHours =
      record.total_hours ||
      calculateAttendanceDuration(record.mispunch_time, record.leave_time);

    if (
      totalHours &&
      typeof totalHours === "string" &&
      totalHours.includes(":")
    ) {
      const [hours, minutes] = totalHours.split(":");
      if (hours && minutes) {
        totalHours = `${hours}h ${minutes}m`;
      }
    }

    return {
      attendance_id: record.id,
      status: isHalfDay ? "Half Day" : "Present",
      shift: record.shift_name || "General",
      branch_id: record.branch_id || null,
      branch_name: record.branch_name || "",
      total_break_seconds: Number(record.total_break_seconds || 0),
      checkInTime:
        formatAttendanceTime24(record.mispunch_time) !== "N/A"
          ? formatAttendanceTime24(record.mispunch_time)
          : "",
      checkOutTime:
        formatAttendanceTime24(record.leave_time) !== "N/A"
          ? formatAttendanceTime24(record.leave_time)
          : "",
      totalHours: totalHours !== "N/A" ? totalHours : "",
      timesheetDetails: record.timesheet_details || "",
      date: getAttendanceDateValue(record),
      is_late: isLate,
      is_early_leave: isEarlyLeave,
      is_half_day: isHalfDay,
      reason: record.reason || "",
      employee_id: record.employee_id || "",
      employee_name: record.employee_name || "Unknown",
      company_id: Number(record.company_id || user.company_id || user.id || 0),
      company: record.company || user.companyName || user.company || "",
      slug: record.slug || slug || "",
      postApplied:
        record.post_applied ||
        record.postApplied ||
        record.designation ||
        "N/A",
      shift_name: record.shift_name || "General",
      shift_start: record.shift_start || "",
      shift_end: record.shift_end || "",
      rawData: record,
    };
  };

  const createAbsentAttendanceDraft = (employee, date) => ({
    attendance_id: null,
    status: "Absent",
    shift: employee.shiftName || "General",
    branch_id: employee.branch_id || null,
    branch_name: employee.branch_name || "",
    total_break_seconds: 0,
    checkInTime: "",
    checkOutTime: "",
    totalHours: "",
    timesheetDetails: "",
    date,
    is_late: 0,
    is_early_leave: 0,
    is_half_day: 0,
    reason: "",
    employee_id: employee.employee_id || "",
    employee_name: employee.employee_name || "Unknown",
    company_id: Number(employee.company_id || user.company_id || user.id || 0),
    company:
      employee.companyName || user.companyName || user.company || slug || "",
    slug: employee.slug || slug || "",
    postApplied: employee.postApplied || "N/A",
    shift_name: employee.shiftName || "General",
    shift_start: employee.shiftStart || "",
    shift_end: employee.shiftEnd || "",
    latitude: companyQR?.latitude || 0,
    longitude: companyQR?.longitude || 0,
    attendanceDate: date,
    attendance_date: date,
    rawData: null,
    createdFromAbsent: true,
  });

  const patchEmployeeAttendanceRecord = (employee, updatedRecord) => {
    if (!employee) return employee;
    const updatedEmployeeId =
      updatedRecord?.employee_id ?? updatedRecord?.rawData?.employee_id;

    if (String(employee.employee_id) !== String(updatedEmployeeId)) {
      return employee;
    }

    const updatedDate =
      updatedRecord?.date ||
      getAttendanceDateValue(updatedRecord?.rawData || updatedRecord);

    if (!updatedDate) {
      return employee;
    }

    return {
      ...employee,
      attendance: {
        ...employee.attendance,
        [updatedDate]: updatedRecord,
      },
    };
  };

  const applyAttendanceRecordUpdate = (updatedRecord) => {
    if (!updatedRecord?.id) return;

    const updatedEntry = createAttendanceEntryFromRecord(updatedRecord);

    const patchEmployeeRecord = (employee) => {
      if (!employee) return employee;
      if (String(employee.employee_id) !== String(updatedRecord.employee_id)) {
        return employee;
      }

      return {
        ...employee,
        attendance: {
          ...employee.attendance,
          [updatedEntry.date]: updatedEntry,
        },
      };
    };

    setAttendanceData((current) => current.map(patchEmployeeRecord));
    setSelectedEmployee((current) => patchEmployeeRecord(current));
    setSelectedAttendanceEmployee((current) => patchEmployeeRecord(current));
    setSelectedAttendanceRecord(updatedEntry);
  };

  const fetchBranches = async () => {
    if (!companyScopeId && !slug) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/branch`,
        {
          params: {
            company_id: companyScopeId || undefined,
            company_slug: slug || undefined,
          },
        },
      );
      if (response.data?.success && Array.isArray(response.data.data)) {
        setBranches(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [slug, companyScopeId]);

  useEffect(() => {
    if (slug) {
      fetchAttendanceData(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth, slug, selectedBranchId]);

  useEffect(() => {
    let filtered = [...attendanceData];

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employee_id.toString().includes(searchTerm),
      );
    }

    if (selectedBranchId !== "all") {
      filtered = filtered.filter((emp) => {
        const empBranchMatch =
          String(emp.branch_id) === String(selectedBranchId);
        const dayBranchMatch = Object.values(emp.attendance).some(
          (d) =>
            String(d.branch_id || d.rawData?.branch_id) ===
            String(selectedBranchId),
        );
        return empBranchMatch || dayBranchMatch;
      });
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((emp) => {
        if (selectedStatus === "Absent") {
          return emp.summary.absent > 0;
        }

        return Object.values(emp.attendance).some(
          (day) => day.status === selectedStatus,
        );
      });
    }

    if (selectedShift !== "all") {
      filtered = filtered.filter((emp) =>
        Object.values(emp.attendance).some(
          (day) => day.shift === selectedShift,
        ),
      );
    }

    if (selectedPostApplied !== "all") {
      filtered = filtered.filter(
        (emp) => emp.postApplied === selectedPostApplied,
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    attendanceData,
    selectedBranchId,
    selectedStatus,
    selectedShift,
    selectedPostApplied,
  ]);

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

  const fetchAttendanceData = async (year, month) => {
    if (!slug) return;
    try {
      setLoading(true);
      const monthValue = `${year}-${String(month + 1).padStart(2, "0")}`;
      const branchQueryParam =
        selectedBranchId !== "all" ? `&branch_id=${selectedBranchId}` : "";

      const [attendanceRes, employeesRes, qrRes, holidaysRes] =
        await Promise.all([
          axios.get(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/${slug}?month=${monthValue}${branchQueryParam}`,
          ),
          axios.get(
            "https://csaapnodeapi.csaap.com/api/tenant/hrms/all-employees",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
          slug
            ? axios
                .get(
                  `${import.meta.env.VITE_HRMS_BASE_URL}/api/qr/company/${companyScopeId}/${slug}`,
                )
                .catch(() => null)
            : Promise.resolve(null),
          slug && companyScopeId
            ? axios
                .get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday`, {
                  params: {
                    company_id: companyScopeId,
                    slug,
                  },
                })
                .catch(() => null)
            : Promise.resolve(null),
        ]);
      if (qrRes?.data?.success) {
        setCompanyQR(qrRes.data.data);
      }
      const holidays = Array.isArray(holidaysRes?.data)
        ? holidaysRes.data
        : Array.isArray(holidaysRes?.data?.data)
          ? holidaysRes.data.data
          : [];
      const fetchedHolidayDates = holidays
        .map((holiday) => String(holiday?.date || "").slice(0, 10))
        .filter(Boolean);
      setHolidayDates(fetchedHolidayDates);
      const records = attendanceRes.data.data || [];
      const employees = filterEmployeesByCompanyScope(
        employeesRes.data.data || [],
      );
      const processedData = groupAttendanceByEmployeeAndDate(
        records,
        employees,
        year,
        month,
        new Set(fetchedHolidayDates),
      );
      setAttendanceData(processedData);
      setFilteredData(processedData);
      const posts = new Set();
      processedData.forEach((emp) => {
        if (emp.postApplied && emp.postApplied !== "N/A") {
          posts.add(emp.postApplied);
        }
      });
      setAvailablePostApplied(Array.from(posts));
    } catch (error) {
      console.error("Attendance fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupAttendanceByEmployeeAndDate = (
    data,
    employees,
    yearFilter,
    monthFilter,
    holidaySet = new Set(),
  ) => {
    const grouped = {};

    employees.forEach((employee) => {
      const employeeId = employee.id ?? employee.employee_id;
      if (!employeeId) return;

      grouped[employeeId] = createEmployeeSummary(employee);
    });

    data.forEach((record) => {
      const employeeId = record.employee_id;
      const date = getAttendanceDateValue(record);
      if (!date) return;
      if (holidaySet.has(date) || isSunday(date) || isFutureDate(date)) return;
      if (!grouped[employeeId]) {
        grouped[employeeId] = createEmployeeSummary(record);
      }

      if (grouped[employeeId].attendance[date]) return;

      const entry = createAttendanceEntryFromRecord(record);
      const isHalfDay = Number(record.is_half_day || 0);
      const isLate = Number(record.is_late || 0);
      grouped[employeeId].attendance[date] = entry;
      if (isHalfDay) grouped[employeeId].summary.halfDay++;
      else grouped[employeeId].summary.present++;
      if (isLate) grouped[employeeId].summary.late++;
    });

    const workingDatesInMonth = generateMonthDatesFor(
      yearFilter,
      monthFilter,
    ).filter((date) => !isSunday(date) && !holidaySet.has(date));
    const elapsedWorkingDays = workingDatesInMonth.filter(
      (date) => !isFutureDate(date),
    ).length;

    return Object.values(grouped).map((employee) => {
      const recordedDays = Object.keys(employee.attendance).length;

      return {
        ...employee,
        summary: {
          ...employee.summary,
          absent: Math.max(elapsedWorkingDays - recordedDays, 0),
        },
      };
    });
  };

  const handleViewTimesheet = (employee) => {
    setSelectedEmployee(employee);
    setShowTimesheet(true);
    setSelectedAttendanceRecord(null);
    setShowAuditModal(false);
  };

  const handleViewAttendanceRecord = (employee, record) => {
    if (!record) return;
    setSelectedAttendanceEmployee(employee);
    setSelectedAttendanceRecord(record);
    setShowTimesheet(false);
    setShowAuditModal(false);
  };

  const handleOpenAbsentAudit = (employee, date) => {
    if (!employee || !date) return;

    setSelectedAttendanceEmployee(employee);
    setSelectedAttendanceRecord(createAbsentAttendanceDraft(employee, date));
    setShowTimesheet(false);
    setShowAuditModal(true);
  };

  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    setShowTimesheet(false);
  };

  const handleAuditSaved = (updatedRecord) => {
    if (updatedRecord?.isDeleted) {
      fetchAttendanceData(selectedYear, selectedMonth);
      setShowAuditModal(false);
      return;
    }

    if (!updatedRecord?.id) return;

    const updatedEntry = createAttendanceEntryFromRecord(updatedRecord);
    const patchEmployee = (employee) =>
      patchEmployeeAttendanceRecord(employee, updatedEntry);

    setAttendanceData((current) => current.map(patchEmployee));
    setSelectedEmployee((current) => patchEmployee(current));
    setSelectedAttendanceEmployee((current) => patchEmployee(current));
    setSelectedAttendanceRecord(updatedEntry);
    setShowAuditModal(false);
  };

  const getIndiaDateValue = (dateString) =>
    new Date(`${dateString}T12:00:00+05:30`);

  const isSunday = (dateString) =>
    getIndiaDateValue(dateString).getUTCDay() === 0;
  const isHoliday = (dateString) => holidayDateSet.has(dateString);
  const isFutureDate = (dateString) => dateString > currentIndiaDate;

  const getIndiaWeekdayShort = (dateString) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    }).format(getIndiaDateValue(dateString));

  const generateMonthDatesFor = (year, month) => {
    const dates = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const monthValue = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      dates.push(`${year}-${monthValue}-${dayStr}`);
    }
    return dates;
  };

  const generateMonthDates = () => {
    return generateMonthDatesFor(selectedYear, selectedMonth);
  };

  const getStatusBadge = (status, totalHours = "", isEarlyLeave = false) => {
    const earlyLeaveFlag =
      typeof isEarlyLeave === "object" && isEarlyLeave !== null
        ? Boolean(
            isEarlyLeave.is_early_leave === 1 ||
              isEarlyLeave.is_early_leave === true ||
              isEarlyLeave.isEarlyLeave === true ||
              isEarlyLeave.rawData?.is_early_leave === 1 ||
              isEarlyLeave.rawData?.is_early_leave === true,
          )
        : Boolean(
            isEarlyLeave === true ||
              isEarlyLeave === 1 ||
              isEarlyLeave === "1",
          );

    const isZeroHours =
      !totalHours ||
      totalHours === "N/A" ||
      totalHours === "00:00:00" ||
      totalHours === "00:00" ||
      totalHours === "0h 0m" ||
      totalHours === "0m";

    const hoursLabel =
      !isZeroHours ? (
        <span
          className={`text-[10px] font-bold font-mono ${
            earlyLeaveFlag ? "text-rose-600" : "text-slate-500"
          }`}
        >
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
      default:
        return null;
    }
  };

  const getShiftBadge = (shift) => {
    if (!shift) return null;
    const shiftLower = shift.toLowerCase();
    if (shiftLower.includes("morning")) {
      return (
        <span className="inline-flex items-center rounded-full border border-sky-200/60 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700">
          {shift}
        </span>
      );
    } else if (shiftLower.includes("evening")) {
      return (
        <span className="inline-flex items-center rounded-full border border-violet-200/60 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
          {shift}
        </span>
      );
    } else if (shiftLower.includes("night")) {
      return (
        <span className="inline-flex items-center rounded-full border border-teal-200/60 bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
          {shift}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
          {shift}
        </span>
      );
    }
  };

  const getDesignationBadgeClass = (designation = "") => {
    const normalized = designation.trim().toLowerCase();

    if (!normalized || normalized === "n/a") {
      return "border-slate-200 bg-slate-50 text-slate-500";
    }

    const colorIndex =
      normalized.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      designationColorClasses.length;

    return designationColorClasses[colorIndex];
  };

  const formatDurationLabel = (value = "") => {
    if (!value) return "0h 0m";

    if (typeof value === "string" && value.includes("h")) {
      return value;
    }

    const [hours = "0", minutes = "0"] = String(value).split(":");
    return `${Number(hours)}h ${Number(minutes)}m`;
  };

  const formatCoordinateLabel = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) return String(value);
    return numeric.toFixed(6);
  };

  const durationToMinutes = (value = "") => {
    if (!value) return 0;

    if (typeof value === "string" && value.includes("h")) {
      const match = value.match(/(\d+)h\s*(\d+)?m?/);
      if (!match) return 0;
      return Number(match[1] || 0) * 60 + Number(match[2] || 0);
    }

    const [hours = "0", minutes = "0", seconds = "0"] =
      String(value).split(":");
    return (
      Number(hours || 0) * 60 +
      Number(minutes || 0) +
      Math.floor(Number(seconds || 0) / 60)
    );
  };

  const sumDurationLabels = (values = []) => {
    const totalMinutes = values.reduce(
      (acc, value) => acc + durationToMinutes(value),
      0,
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatShiftWindow = (record) => {
    const start = formatAttendanceTime24(record?.rawData?.shift_start || "");
    const end = formatAttendanceTime24(record?.rawData?.shift_end || "");

    if (start !== "N/A" && end !== "N/A") return `${start} - ${end}`;
    return record?.shift || "General";
  };

  const getDayFlagBadges = (record) => {
    const flags = [];

    if (record?.status === "Present") {
      flags.push({
        label: "Present",
        className: "border-emerald-200/60 bg-emerald-50 text-emerald-700",
      });
    }

    if (record?.is_half_day === 1) {
      flags.push({
        label: "Half day",
        className: "border-amber-200/60 bg-amber-50 text-amber-700",
      });
    }

    if (record?.is_late === 1) {
      flags.push({
        label: "Late",
        className: "border-amber-200/60 bg-amber-50 text-amber-700",
      });
    }

    if (record?.is_early_leave === 1) {
      flags.push({
        label: "Early leave",
        className: "border-rose-200/60 bg-rose-50 text-rose-700",
      });
    }

    if (
      record?.rawData?.overtime &&
      durationToMinutes(record.rawData.overtime) > 0
    ) {
      flags.push({
        label: `OT ${formatDurationLabel(record.rawData.overtime)}`,
        className: "border-sky-200/60 bg-sky-50 text-sky-700",
      });
    }

    if (Number(record?.rawData?.employee_ot_claim || 0) === 1) {
      flags.push({
        label:
          Number(record?.rawData?.ot_approved || 0) === 1
            ? "OT approved"
            : "OT claimed",
        className:
          Number(record?.rawData?.ot_approved || 0) === 1
            ? "border-emerald-200/60 bg-emerald-50 text-emerald-700"
            : "border-violet-200/60 bg-violet-50 text-violet-700",
      });
    }

    return flags;
  };

  const selectedAttendanceFlags = selectedAttendanceRecord
    ? getDayFlagBadges(selectedAttendanceRecord)
    : [];
  const hasOvertimeRecord =
    durationToMinutes(selectedAttendanceRecord?.rawData?.overtime || "") > 0;
  const timesheetDecision =
    selectedAttendanceRecord?.rawData?.timesheet_status || "Pending";

  const hasOtClaim =
    Number(selectedAttendanceRecord?.rawData?.employee_ot_claim || 0) === 1;
  const isOtApproved =
    Number(selectedAttendanceRecord?.rawData?.ot_approved || 0) === 1;

  const getReviewStatusCardClass = (label, value) => {
    if (label === "Timesheet") {
      if (value === "Approved") {
        return "border-emerald-200/60 bg-emerald-50";
      }
      if (value === "Rejected") {
        return "border-rose-200/60 bg-rose-50";
      }
      return "border-amber-200/60 bg-amber-50";
    }

    if (label === "OT claim") {
      return value === "Submitted"
        ? "border-sky-200/60 bg-sky-50"
        : "border-slate-200 bg-slate-50";
    }

    if (label === "OT decision") {
      return value === "Approved"
        ? "border-emerald-200/60 bg-emerald-50"
        : "border-slate-200 bg-slate-50";
    }

    return "border-slate-200 bg-white";
  };

  const getReviewStatusValueClass = (label, value) => {
    if (label === "Timesheet") {
      if (value === "Approved") return "text-emerald-700";
      if (value === "Rejected") return "text-rose-700";
      return "text-amber-700";
    }

    if (label === "OT claim") {
      return value === "Submitted" ? "text-sky-700" : "text-slate-600";
    }

    if (label === "OT decision") {
      return value === "Approved" ? "text-emerald-700" : "text-slate-600";
    }

    return "text-slate-900";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedFilteredData = [...filteredData].sort((a, b) =>
    String(a.employee_name || "").localeCompare(
      String(b.employee_name || ""),
      undefined,
      { sensitivity: "base" },
    ),
  );
  const currentItems = sortedFilteredData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const showingStart = filteredData.length === 0 ? 0 : indexOfFirstItem + 1;
  const showingEnd = Math.min(indexOfLastItem, filteredData.length);
  const selectedEmployeeRecords = selectedEmployee
    ? Object.entries(selectedEmployee.attendance).sort(([dateA], [dateB]) =>
        dateB.localeCompare(dateA),
      )
    : [];
  const selectedEmployeeEntries = selectedEmployeeRecords.map(
    ([, data]) => data,
  );
  const selectedEmployeeMetrics = selectedEmployee
    ? {
        totalDays: generateMonthDates().filter((date) => !isSunday(date))
          .length,
        elapsedDays: generateMonthDates().filter(
          (date) => !isSunday(date) && !isFutureDate(date),
        ).length,
        daysLeft: generateMonthDates().filter(
          (date) => !isSunday(date) && isFutureDate(date),
        ).length,
        recordedDays: selectedEmployeeEntries.length,
        presentDays: selectedEmployeeEntries.length,
        absentDays: selectedEmployee.summary.absent,
        halfDays: selectedEmployee.summary.halfDay,
        lateDays: selectedEmployee.summary.late,
        earlyLeaves: selectedEmployeeEntries.filter(
          (entry) => entry.is_early_leave === 1,
        ).length,
        totalHours: sumDurationLabels(
          selectedEmployeeEntries.map((entry) => entry.totalHours),
        ),
        totalOvertime: sumDurationLabels(
          selectedEmployeeEntries.map((entry) => entry.rawData?.overtime || ""),
        ),
        notesLogged: selectedEmployeeEntries.filter((entry) =>
          entry.timesheetDetails?.trim(),
        ).length,
        otClaims: selectedEmployeeEntries.filter(
          (entry) => Number(entry.rawData?.employee_ot_claim || 0) === 1,
        ).length,
        otApproved: selectedEmployeeEntries.filter(
          (entry) => Number(entry.rawData?.ot_approved || 0) === 1,
        ).length,
      }
    : null;
  const selectedEmployeePrimaryStats = selectedEmployeeMetrics
    ? [
        {
          label: "Total Working Days",
          value: selectedEmployeeMetrics.totalDays || 0,
        },
        {
          label: "Days Present",
          value: selectedEmployeeMetrics.presentDays || 0,
        },
        {
          label: "Half-Day Logs",
          value: selectedEmployeeMetrics.halfDays || 0,
        },
        {
          label: "Days Absent",
          value: selectedEmployeeMetrics.absentDays || 0,
        },
      ]
    : [];
  const selectedEmployeeMixStats = selectedEmployeeMetrics
    ? [
        {
          label: "Present",
          value: Math.max(
            Number(selectedEmployeeMetrics.presentDays || 0) -
              Number(selectedEmployeeMetrics.halfDays || 0),
            0,
          ),
          tone: "bg-emerald-500",
          color: "#10b981",
        },
        {
          label: "Absent",
          value: selectedEmployeeMetrics.absentDays || 0,
          tone: "bg-rose-500",
          color: "#f43f5e",
        },
        {
          label: "Half-Day",
          value: selectedEmployeeMetrics.halfDays || 0,
          tone: "bg-amber-500",
          color: "#f59e0b",
        },
        {
          label: "Remaining",
          value: selectedEmployeeMetrics.daysLeft || 0,
          tone: "bg-sky-500",
          color: "#0ea5e9",
        },
      ]
        .filter((stat) => Number(stat.value) > 0)
        .filter(
          (stat) => !(stat.label === "Days left" && Number(stat.value) === 0),
        )
    : [];
  const selectedEmployeeMixTotal = selectedEmployeeMetrics?.totalDays || 0;
  const selectedEmployeeMixChartBackground =
    selectedEmployeeMixStats.length > 0 && selectedEmployeeMixTotal > 0
      ? (() => {
          let cumulative = 0;
          const stops = selectedEmployeeMixStats.map((stat) => {
            const start = cumulative;
            const portion =
              (Number(stat.value || 0) /
                Number(selectedEmployeeMixTotal || 1)) *
              100;
            cumulative += portion;
            return `${stat.color} ${start}% ${cumulative}%`;
          });
          return `conic-gradient(${stops.join(", ")})`;
        })()
      : "conic-gradient(#e2e8f0 0% 100%)";
  const selectedEmployeeSignalStats = selectedEmployeeMetrics
    ? [
        {
          label: "Timesheet Entries",
          value: selectedEmployeeMetrics.notesLogged || 0,
        },
        {
          label: "Late Arrivals",
          value: selectedEmployeeMetrics.lateDays || 0,
        },
        {
          label: "Early Departures",
          value: selectedEmployeeMetrics.earlyLeaves || 0,
        },
        {
          label: "OT Requested",
          value: selectedEmployeeMetrics.otClaims || 0,
        },
        {
          label: "OT Authorized",
          value: selectedEmployeeMetrics.otApproved || 0,
        },
      ]
    : [];

  const exportToCSV = () => {
    const recordsToExport = filteredData.flatMap((emp) =>
      Object.values(emp.attendance).map((att) => ({
        ...att,
        employee_id: emp.employee_id,
        name: emp.employee_name,
        department: emp.department,
        branch_name: att.branch_name || emp.branch_name || "Unassigned",
        total_break_seconds: att.total_break_seconds || 0,
      })),
    );
    exportAttendanceToCsv(
      recordsToExport,
      `attendance_${selectedYear}_${monthNames[selectedMonth]}.csv`,
    );
  };

  const exportToExcel = () => {
    const recordsToExport = filteredData.flatMap((emp) =>
      Object.values(emp.attendance).map((att) => ({
        ...att,
        employee_id: emp.employee_id,
        name: emp.employee_name,
        department: emp.department,
        branch_name: att.branch_name || emp.branch_name || "Unassigned",
        total_break_seconds: att.total_break_seconds || 0,
      })),
    );
    exportAttendanceToExcel(
      recordsToExport,
      `attendance_${selectedYear}_${monthNames[selectedMonth]}.xlsx`,
    );
  };

  const refreshData = () => {
    fetchAttendanceData(selectedYear, selectedMonth);
  };

  const getMonthYearLabel = () => {
    return `${monthNames[selectedMonth]} ${selectedYear}`;
  };

  const handleRecordOvertimeAction = async (approved) => {
    if (!selectedAttendanceRecord?.attendance_id) return;

    try {
      setRecordActionState((current) => ({
        ...current,
        overtime: approved ? "approve" : "reject",
      }));

      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/approve-overtime/${selectedAttendanceRecord.attendance_id}`,
        { approved },
      );

      if (response?.data?.data) {
        applyAttendanceRecordUpdate(response.data.data);
      } else {
        await fetchAttendanceData(selectedYear, selectedMonth);
      }
    } catch (error) {
      console.error("Error updating overtime status:", error);
      alert(`Failed to ${approved ? "approve" : "reject"} overtime`);
    } finally {
      setRecordActionState((current) => ({
        ...current,
        overtime: "",
      }));
    }
  };

  const handleRecordTimesheetAction = async (status) => {
    if (!selectedAttendanceRecord?.attendance_id) return;

    try {
      setRecordActionState((current) => ({
        ...current,
        timesheet: status.toLowerCase(),
      }));

      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/timesheet-status/${selectedAttendanceRecord.attendance_id}`,
        { status },
      );

      if (response?.data?.data) {
        applyAttendanceRecordUpdate(response.data.data);
      } else {
        await fetchAttendanceData(selectedYear, selectedMonth);
      }
    } catch (error) {
      console.error("Error updating timesheet status:", error);
      alert(`Failed to ${status.toLowerCase()} timesheet`);
    } finally {
      setRecordActionState((current) => ({
        ...current,
        timesheet: "",
      }));
    }
  };

  if (loading) {
    return (
      <div className="app-shell min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-425 items-center justify-center px-6">
          <div className="space-y-4 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-(--brand)" />
            <div>
              <h3 className="app-heading">Loading Attendance Data</h3>
              <p className="mt-1 text-[13px] font-medium text-(--text-soft)">
                Please wait while we fetch the latest records
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen p-4 font-sans md:p-6">
      <div className="mx-auto max-w-425">
        <div className="app-panel mb-6 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex items-center rounded-xl border border-(--border-soft) bg-white px-3 transition-all focus-within:border-(--brand) focus-within:ring-4 focus-within:ring-(--brand-ring)">
                <Calendar className="w-4 h-4 text-(--text-faint)" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="h-11 flex-1 appearance-none bg-transparent pr-8 text-[13px] font-medium text-(--text-body) outline-none cursor-pointer"
                >
                  {availableMonths.map((monthIndex) => (
                    <option key={monthIndex} value={monthIndex}>
                      {monthNames[monthIndex]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-4 h-4 text-(--text-faint) pointer-events-none" />
              </div>

              <div className="relative flex items-center rounded-xl border border-(--border-soft) bg-white px-3 transition-all focus-within:border-(--brand) focus-within:ring-4 focus-within:ring-(--brand-ring)">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="h-11 flex-1 appearance-none bg-transparent pr-8 text-[13px] font-medium text-(--text-body) outline-none cursor-pointer"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-4 h-4 text-(--text-faint) pointer-events-none" />
              </div>

              {/* Branch Filter Dropdown */}
              <div className="relative flex items-center rounded-xl border border-(--border-soft) bg-white px-3 transition-all focus-within:border-(--brand) focus-within:ring-4 focus-within:ring-(--brand-ring)">
                <Building2 className="w-4 h-4 text-(--text-faint)" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="h-11 flex-1 appearance-none bg-transparent pr-8 text-[13px] font-medium text-(--text-body) outline-none cursor-pointer"
                >
                  <option value="all">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name} {branch.branch_code ? `(${branch.branch_code})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-4 h-4 text-(--text-faint) pointer-events-none" />
              </div>

              <button
                ref={filterButtonRef}
                onClick={() => setShowFilter(!showFilter)}
                className={`inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-all ${
                  showFilter
                    ? "border-transparent text-white shadow-[0_10px_20px_rgba(0,166,81,0.18)]"
                    : "border-(--border-soft) bg-white text-(--text-body) hover:border-(--border-strong) hover:bg-white hover:text-(--brand)"
                }`}
                style={
                  showFilter
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(selectedStatus !== "all" ||
                  selectedShift !== "all" ||
                  selectedBranchId !== "all" ||
                  selectedPostApplied !== "all") && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-current ring-1 ring-current/20">
                    {(selectedStatus !== "all" ? 1 : 0) +
                      (selectedShift !== "all" ? 1 : 0) +
                      (selectedBranchId !== "all" ? 1 : 0) +
                      (selectedPostApplied !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 lg:max-w-2xl lg:flex-row lg:items-center lg:justify-end">
              <div className="relative flex-1 lg:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${controlClass} pl-11`}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshData}
                  className="app-icon-button inline-flex h-11 w-11 shrink-0 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong)"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={exportToCSV}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-[0.98]"
                  title="Export records to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="app-btn-primary inline-flex h-11 items-center gap-1.5 px-3 text-xs font-bold active:scale-[0.98]"
                  title="Export records to Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          {showFilter && (
            <div
              ref={filterPanelRef}
              className="app-panel-muted mt-5 p-5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="modal-section-title block uppercase tracking-wider">
                    Branch Scope
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedBranchId("all");
                        setShowFilter(false);
                      }}
                      className={`${filterChipBase} ${
                        selectedBranchId === "all"
                          ? "border-transparent bg-(--brand) text-white shadow-[0_10px_20px_rgba(0,166,81,0.16)]"
                          : "border-(--border-soft) bg-white text-(--text-soft) hover:border-(--border-strong) hover:text-(--brand)"
                      }`}
                    >
                      All Branches
                    </button>
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBranchId(String(b.id));
                          setShowFilter(false);
                        }}
                        className={`${filterChipBase} ${
                          String(selectedBranchId) === String(b.id)
                            ? "border-transparent bg-(--brand) text-white shadow-[0_10px_20px_rgba(0,166,81,0.16)]"
                            : "border-(--border-soft) bg-white text-(--text-soft) hover:border-(--border-strong) hover:text-(--brand)"
                        }`}
                      >
                        {b.branch_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="modal-section-title block uppercase tracking-wider">
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
                        className={`${filterChipBase} ${
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

                <div className="space-y-3">
                  <label className="modal-section-title block uppercase tracking-wider">
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
                        className={`${filterChipBase} ${
                          selectedShift === shift
                            ? "border-transparent bg-(--brand) text-white shadow-[0_10px_20px_rgba(0,166,81,0.16)]"
                            : "border-(--border-soft) bg-white text-(--text-soft) hover:border-(--border-strong) hover:text-(--brand)"
                        }`}
                      >
                        {shift === "all" ? "All Shifts" : shift}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="modal-section-title block uppercase tracking-wider">
                    Designation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedPostApplied("all");
                        setShowFilter(false);
                      }}
                      className={`${filterChipBase} ${
                        selectedPostApplied === "all"
                          ? "border-transparent bg-(--brand) text-white shadow-[0_10px_20px_rgba(0,166,81,0.16)]"
                          : "border-(--border-soft) bg-white text-(--text-soft) hover:border-(--border-strong) hover:text-(--brand)"
                      }`}
                    >
                      All Posts
                    </button>
                    {availablePostApplied.map((post) => (
                      <button
                        key={post}
                        onClick={() => {
                          setSelectedPostApplied(post);
                          setShowFilter(false);
                        }}
                        className={`${filterChipBase} ${
                          selectedPostApplied === post
                            ? "border-transparent bg-(--brand) text-white shadow-[0_10px_20px_rgba(0,166,81,0.16)]"
                            : "border-(--border-soft) bg-white text-(--text-soft) hover:border-(--border-strong) hover:text-(--brand)"
                        }`}
                      >
                        {post}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
                <button
                  onClick={() => {
                    setSelectedBranchId("all");
                    setSelectedStatus("all");
                    setSelectedShift("all");
                    setSelectedPostApplied("all");
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="app-panel overflow-hidden max-h-[calc(100vh-130px)] flex flex-col bg-(--bg-subtle)/45">
          <div className="app-section-bar flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-(--border-soft) bg-(--brand-soft) p-2.5 text-(--brand) shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-0.5">
                  Attendance Records
                </p>
                <h2 className="app-heading">{getMonthYearLabel()}</h2>
              </div>
            </div>
            <div className="rounded-lg border border-(--border-soft) bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-(--text-soft)">
              Showing{" "}
              <span className="mx-0.5 text-(--text-strong)">
                {currentItems.length}
              </span>{" "}
              of{" "}
              <span className="mx-0.5 text-(--text-strong)">
                {filteredData.length}
              </span>{" "}
              Employees
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center bg-(--bg-subtle)/45 px-6 py-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-(--border-soft) bg-white shadow-sm">
                <Users className="w-7 h-7 text-(--text-faint)" />
              </div>
              <h3 className="mb-2 app-heading">No Records Found</h3>
              <p className="mb-6 max-w-sm text-[13px] font-medium text-(--text-soft)">
                We couldn't find any attendance data for {getMonthYearLabel()}{" "}
                with current filters.
              </p>
              <button
                onClick={() => {
                  setSelectedYear(currentIndiaYear);
                  setSelectedMonth(currentIndiaMonth - 1);
                  setSelectedBranchId("all");
                  setSelectedStatus("all");
                  setSelectedShift("all");
                  setSelectedPostApplied("all");
                  setSearchTerm("");
                }}
                className="app-btn-primary inline-flex h-11 items-center"
              >
                Reset Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto custom-scrollbar bg-white">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-30 bg-white">
                    <tr>
                      <th className="sticky left-0 z-40 min-w-15 border-b border-r border-(--border-soft) bg-white px-4 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) shadow-sm">
                        #
                      </th>
                      <th className="sticky left-15 z-40 min-w-70 border-b border-r border-(--border-soft) bg-white px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) shadow-sm">
                        Employee Info
                      </th>
                      {generateMonthDates().map((date) => (
                        <th
                          key={date}
                          className="min-w-17.5 border-b border-(--border-soft) bg-white px-3 py-2.5 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <span className="mb-0.5 text-sm font-bold text-(--text-strong)">
                              {getIndiaDateValue(date).getUTCDate()}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                              {getIndiaWeekdayShort(date)}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="sticky right-0 z-40 border-b border-l border-(--border-soft) bg-white px-5 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) shadow-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {currentItems.map((employee, index) => {
                      const serialNumber = indexOfFirstItem + index + 1;

                      return (
                        <tr
                          key={employee.employee_id}
                          onClick={() =>
                            setSelectedRowId((current) =>
                              current === employee.employee_id
                                ? null
                                : employee.employee_id,
                            )
                          }
                          aria-selected={selectedRowId === employee.employee_id}
                          className={`group cursor-pointer transition-colors ${
                            selectedRowId === employee.employee_id
                              ? "bg-(--bg-subtle)"
                              : "hover:bg-(--bg-subtle)/70"
                          }`}
                        >
                          <td
                            className={`sticky left-0 z-20 min-w-15 whitespace-nowrap border-b border-r border-(--bg-subtle) px-4 py-3 text-center transition-colors ${
                              selectedRowId === employee.employee_id
                                ? "bg-(--bg-subtle)"
                                : "bg-white group-hover:bg-(--bg-subtle)/70"
                            }`}
                          >
                            <span className="text-[13px] font-medium text-(--text-soft)">
                              {serialNumber}
                            </span>
                          </td>
                          <td
                            className={`sticky left-15 z-20 min-w-70 whitespace-nowrap border-b border-r border-(--bg-subtle) px-5 py-3 transition-colors ${
                              selectedRowId === employee.employee_id
                                ? "bg-(--bg-subtle)"
                                : "bg-white group-hover:bg-(--bg-subtle)/70"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-xl border border-(--border-soft) bg-(--bg-subtle) flex items-center justify-center text-(--brand) font-bold text-sm shrink-0">
                                {employee.employee_name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="truncate text-[14px] font-bold text-(--text-strong)">
                                  {employee.employee_name}
                                </h4>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <p
                                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${getDesignationBadgeClass(
                                      employee.postApplied,
                                    )}`}
                                  >
                                    {employee.postApplied}
                                  </p>
                                  {employee.branch_name && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                                      <Building2 className="h-2.5 w-2.5" />
                                      {employee.branch_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {generateMonthDates().map((date) => {
                            const dayData = employee.attendance[date];
                            const sunday = isSunday(date);
                            const holiday = isHoliday(date);
                            const futureDate = isFutureDate(date);

                            return (
                              <td
                                key={date}
                                className="min-w-17.5 border-b border-r border-(--bg-subtle) px-1 py-3 text-center last:border-r-0"
                              >
                                <div className="flex flex-col items-center justify-center gap-1.5 h-full min-h-10">
                                  {sunday || futureDate ? (
                                    getStatusBadge("Muted")
                                  ) : holiday ? (
                                    getStatusBadge("Holiday")
                                  ) : dayData ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewAttendanceRecord(
                                          employee,
                                          dayData,
                                        );
                                      }}
                                      className="rounded-xl p-1 transition-all hover:bg-(--bg-subtle) focus:outline-none focus:ring-2 focus:ring-(--brand-ring)"
                                      title={`View ${employee.employee_name}'s attendance for ${date}`}
                                    >
                                      {getStatusBadge(
                                        dayData.status || "Absent",
                                        dayData.totalHours || "",
                                        dayData.is_early_leave ||
                                          dayData.rawData?.is_early_leave,
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenAbsentAudit(employee, date);
                                      }}
                                      className="rounded-xl p-1 transition-all hover:bg-(--bg-subtle) focus:outline-none focus:ring-2 focus:ring-(--brand-ring)"
                                      title={`Create attendance audit for ${employee.employee_name} on ${date}`}
                                    >
                                      {getStatusBadge("Absent")}
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          <td
                            className={`sticky right-0 z-20 whitespace-nowrap border-b border-l border-(--bg-subtle) px-5 py-3 transition-colors ${
                              selectedRowId === employee.employee_id
                                ? "bg-(--bg-subtle)"
                                : "bg-white group-hover:bg-(--bg-subtle)/70"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTimesheet(employee);
                                }}
                                className="app-icon-button flex h-10 w-10 items-center justify-center text-(--text-soft) hover:border-(--border-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong)"
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

              <div className="app-section-bar border-t border-(--border-soft) px-4 py-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-(--text-soft)">
                      Page{" "}
                      <span className="text-(--text-strong)">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="text-(--text-strong)">{totalPages}</span>
                    </p>
                    <p className="text-[13px] font-medium text-(--text-soft)">
                      Showing{" "}
                      <span className="font-bold text-(--text-strong)">
                        {showingStart}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-(--text-strong)">
                        {showingEnd}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-(--text-strong)">
                        {filteredData.length}
                      </span>{" "}
                      employees
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="app-input h-10 pl-4 pr-10 text-[13px] font-medium cursor-pointer appearance-none w-full sm:w-40"
                      >
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="app-icon-button flex h-10 w-10 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) disabled:pointer-events-none disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1 mx-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2)
                              pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                                  currentPage === pageNum
                                    ? "bg-(--brand) text-white shadow-[0_10px_20px_rgba(0,166,81,0.16)]"
                                    : "border border-transparent text-(--text-soft) hover:border-(--border-soft) hover:bg-white"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="app-icon-button flex h-10 w-10 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) disabled:pointer-events-none disabled:opacity-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedAttendanceRecord && !showAuditModal && (
        <DailyAttendanceModal
          selectedAttendanceRecord={selectedAttendanceRecord}
          selectedAttendanceEmployee={selectedAttendanceEmployee}
          selectedAttendanceFlags={selectedAttendanceFlags}
          hasOvertimeRecord={hasOvertimeRecord}
          hasOtClaim={hasOtClaim}
          isOtApproved={isOtApproved}
          timesheetDecision={timesheetDecision}
          recordActionState={recordActionState}
          formatDurationLabel={formatDurationLabel}
          formatCoordinateLabel={formatCoordinateLabel}
          getReviewStatusCardClass={getReviewStatusCardClass}
          getReviewStatusValueClass={getReviewStatusValueClass}
          onClose={() => {
            setSelectedAttendanceRecord(null);
            setSelectedAttendanceEmployee(null);
          }}
          onRecordOvertimeAction={handleRecordOvertimeAction}
          onRecordTimesheetAction={handleRecordTimesheetAction}
          onOpenAudit={handleOpenAuditModal}
        />
      )}

      {showAuditModal && selectedAttendanceRecord && (
        <AttendanceAuditModal
          attendanceRecord={selectedAttendanceRecord}
          onClose={() => {
            setShowAuditModal(false);
            if (!selectedAttendanceRecord?.id) {
              setSelectedAttendanceRecord(null);
            }
          }}
          onSaved={handleAuditSaved}
        />
      )}

      {showTimesheet && selectedEmployee && (
        <MonthlyAttendanceOverview
          selectedEmployee={selectedEmployee}
          selectedEmployeeRecords={selectedEmployeeRecords}
          selectedEmployeeMetrics={selectedEmployeeMetrics}
          selectedEmployeePrimaryStats={selectedEmployeePrimaryStats}
          selectedEmployeeMixStats={selectedEmployeeMixStats}
          selectedEmployeeMixTotal={selectedEmployeeMixTotal}
          selectedEmployeeMixChartBackground={
            selectedEmployeeMixChartBackground
          }
          selectedEmployeeSignalStats={selectedEmployeeSignalStats}
          monthYearLabel={getMonthYearLabel()}
          getShiftBadge={getShiftBadge}
          getIndiaWeekdayShort={getIndiaWeekdayShort}
          formatShiftWindow={formatShiftWindow}
          formatDurationLabel={formatDurationLabel}
          getDayFlagBadges={getDayFlagBadges}
          onViewRecord={handleViewAttendanceRecord}
          onClose={() => setShowTimesheet(false)}
        />
      )}
    </div>
  );
};

export default EmployeeAttendance;
