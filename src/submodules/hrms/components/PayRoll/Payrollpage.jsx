import axios from "axios";
import {
  AlertCircle,
  Banknote,
  Calculator,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Play,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { usePermission } from "../../../../hooks/usePermission";

import { downloadPayrollReportPDF } from "./docs/PayrollReportDocument";
import { downloadIndividualPayslip } from "./docs/PayslipDocument";
import AttendanceCalendarModal from "./AttendanceCalendarModal";
import EmployeeDetailsModal from "./EmployeeDetailsModal";
import { downloadBankTransferFile, downloadPayrollExcel } from "./exportDocs";
import PayrollConfigModal from "./PayrollConfigModal";
import PayrollEditModal from "./PayrollEditModal";
import PayrollSkeleton from "./PayrollSkeleton";
import PayrollStatusBadge from "./PayrollStatusBadge";
import { formatINR, getUiPresentDays, mapPayslipPayload } from "./payrollUtils";

const MONTH_NAMES = [
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

const normalizeAttendanceRatio = (value) => {
  if (value === null || value === undefined || value === "") return 1;
  const ratio = parseFloat(value);
  if (Number.isNaN(ratio)) return 1;
  return Math.min(1, Math.max(0, ratio));
};

const PayrollPage = () => {
  const { user } = useAuth();
  const { has } = usePermission();
  const canProcess = has("hrms.payroll.process");
  const canEdit = has("hrms.payroll.edit");
  const canConfig = has("hrms.payroll.config");
  const canDownload = has("hrms.payroll.download");
  const companyId = user?.id;
  const companySlug = user?.slug;

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payrollExists, setPayrollExists] = useState(false);
  const [payrollRun, setPayrollRun] = useState(null);
  const [initiating, setInitiating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [finalizingPayroll, setFinalizingPayroll] = useState(false);
  const [revertingPayroll, setRevertingPayroll] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [processingEntryId, setProcessingEntryId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [processingBulkAction, setProcessingBulkAction] = useState(null);

  const [tdsValues, setTdsValues] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [attendanceCalendarEmployee, setAttendanceCalendarEmployee] =
    useState(null);
  const [attendanceCalendarData, setAttendanceCalendarData] = useState(null);
  const [attendanceCalendarLoading, setAttendanceCalendarLoading] =
    useState(false);
  const [attendanceCalendarError, setAttendanceCalendarError] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [payrollStatuses, setPayrollStatuses] = useState({});
  const [payrollConfig, setPayrollConfig] = useState({
    ot_multiplier: 1.5,
    fixed_ot_rate: 200.0,
    is_ot_rate_fixed: true,
    fixed_denominator_days: 30,
    is_denominator_fixed: true,
    hours_per_day: 8.0,
    saturday_off: true,
    sunday_off: true,
    late_penalty: false,
    sandwich_leave: false,
  });

  const entriesPerPage = 10;

  const yearRange = [];
  for (let y = 2020; y <= now.getFullYear() + 1; y++) yearRange.push(y);

  const fetchPayrollConfig = useCallback(async () => {
    if (!companySlug) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll-policies`,
        {
          params: { company_id: companyId, company_slug: companySlug },
        },
      );
      if (res.data.success && res.data.data) {
        setPayrollConfig(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching payroll config:", err);
    }
  }, [companyId, companySlug]);

  const fetchPayrollData = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/records`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
            company_id: companyId,
            company_slug: companySlug,
          },
        },
      );
      if (res.data.success) {
        setEmployees(res.data.data || []);
        setPayrollExists(res.data.payroll_exists || false);
        setPayrollRun(res.data.payroll_run || null);
        setSelectedEntries([]);
      } else {
        setError("Failed to fetch payroll data.");
      }
    } catch (err) {
      console.error("Error fetching payroll data:", err);
      setError("Could not load payroll data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [companyId, companySlug, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPayrollData();
    fetchPayrollConfig();
  }, [fetchPayrollData, fetchPayrollConfig]);

  useEffect(() => {
    if (!showActionMenu) return;
    const close = () => setShowActionMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showActionMenu]);

  const payrollRecords = useMemo(
    () =>
      employees.map((emp) => {
        if (payrollExists) {
          const basic = parseFloat(emp.basic) || 0;
          const hra = parseFloat(emp.hra) || 0;
          const ta = parseFloat(emp.ta) || 0;
          const da = parseFloat(emp.da) || 0;
          const specialAllowance = parseFloat(emp.special_allowance) || 0;
          let otherComps = [];
          let extraEarns = [];
          let extraDeds = [];

          try {
            otherComps =
              typeof emp.other_components === "string"
                ? JSON.parse(emp.other_components || "[]")
                : emp.other_components || [];
            extraEarns =
              typeof emp.extra_earnings === "string"
                ? JSON.parse(emp.extra_earnings || "[]")
                : emp.extra_earnings || [];
            extraDeds =
              typeof emp.extra_deductions === "string"
                ? JSON.parse(emp.extra_deductions || "[]")
                : emp.extra_deductions || [];
          } catch {
            otherComps = [];
            extraEarns = [];
            extraDeds = [];
          }

          let initialEarnings = 0;
          otherComps.forEach((c) => {
            if (c.type === "earning")
              initialEarnings += parseFloat(c.amount) || 0;
          });

          const baseGross =
            basic + hra + ta + da + specialAllowance + initialEarnings;
          const otPay = parseFloat(emp.ot_pay) || 0;

          let extraEarningsTotal = 0;
          let extraDeductionsTotal = 0;

          extraEarns.forEach(
            (c) => (extraEarningsTotal += parseFloat(c.amount) || 0),
          );
          extraDeds.forEach(
            (c) => (extraDeductionsTotal += parseFloat(c.amount) || 0),
          );

          const gross = baseGross + otPay + extraEarningsTotal;
          const attendanceRatio = normalizeAttendanceRatio(
            emp.attendance_ratio,
          );
          const proratedEarnings = {
            attendanceRatio,
            basic: basic * attendanceRatio,
            hra: hra * attendanceRatio,
            ta: ta * attendanceRatio,
            da: da * attendanceRatio,
            specialAllowance: specialAllowance * attendanceRatio,
            otherEarnings: initialEarnings * attendanceRatio,
            baseGross: baseGross * attendanceRatio,
          };

          return {
            ...emp,
            id: emp.employee_id,
            name: emp.employee_name,
            payroll: {
              annualCTC: parseFloat(emp.ctc) * 12 || 0,
              monthlyCTC: parseFloat(emp.ctc) || 0,
              basic,
              hra,
              ta,
              da,
              specialAllowance,
              baseGross,
              lopDays: parseInt(emp.unpaid_leave_days) || 0,
              lopDeduction: parseFloat(emp.lop_deduction) || 0,
              halfDayDeduction: parseFloat(emp.half_day_deduction) || 0,
              otHoursDecimal: parseFloat(emp.total_ot_hours) || 0,
              otPay,
              gross,
              epf: parseFloat(emp.epf) || 0,
              esi: parseFloat(emp.esi) || 0,
              pt: parseFloat(emp.pt) || 0,
              lwf: parseFloat(emp.lwf) || 0,
              tds: 0,
              totalDeductions: parseFloat(emp.total_deductions) || 0,
              netSalary: parseFloat(emp.net_payable) || 0,
              daysPresent: parseInt(emp.days_present) || 0,
              lateDays: parseInt(emp.late_days) || 0,
              halfDays: parseInt(emp.half_days) || 0,
              uiPresentDays: getUiPresentDays({
                days_present: emp.days_present,
                late_days: emp.late_days,
                half_days: emp.half_days,
              }),
              leaveDays: parseInt(emp.approved_leave_days) || 0,
              paymentStatus: emp.payment_status || "pending",
              taxRegime: emp.tax_regime || "NEW",
              otherComponents: otherComps,
              extraEarnings: extraEarns,
              extraDeductions: extraDeds,
              proratedEarnings,
            },
          };
        }

        const payroll = emp.draft_payroll || {};
        const attendanceRatio = normalizeAttendanceRatio(emp.attendance_ratio);
        const basic = parseFloat(payroll.basic) || 0;
        const hra = parseFloat(payroll.hra) || 0;
        const ta = parseFloat(payroll.ta) || 0;
        const da = parseFloat(payroll.da) || 0;
        const specialAllowance = parseFloat(payroll.specialAllowance) || 0;

        let initialEarnings = 0;
        (payroll.otherComponents || []).forEach((c) => {
          if (c.type === "earning")
            initialEarnings += parseFloat(c.amount) || 0;
        });

        const baseGross =
          basic + hra + ta + da + specialAllowance + initialEarnings;
        const proratedEarnings = {
          attendanceRatio,
          basic: basic * attendanceRatio,
          hra: hra * attendanceRatio,
          ta: ta * attendanceRatio,
          da: da * attendanceRatio,
          specialAllowance: specialAllowance * attendanceRatio,
          otherEarnings: initialEarnings * attendanceRatio,
          baseGross: baseGross * attendanceRatio,
        };

        const tds = tdsValues[emp.id] ?? payroll.tds ?? 0;
        const totalDeductions =
          (payroll.totalDeductions || 0) - (payroll.tds || 0) + tds;
        const netSalary = (payroll.gross || 0) - totalDeductions;

        return {
          ...emp,
          payroll: {
            ...payroll,
            tds,
            totalDeductions,
            netSalary,
            uiPresentDays: getUiPresentDays(payroll),
            proratedEarnings,
          },
        };
      }),
    [employees, tdsValues, payrollExists],
  );

  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return payrollRecords;
    return payrollRecords.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.department?.toLowerCase().includes(term) ||
        r.jobTitle?.toLowerCase().includes(term) ||
        String(r.id).includes(term),
    );
  }, [payrollRecords, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredRecords.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  const totals = useMemo(
    () =>
      payrollRecords.reduce(
        (acc, r) => {
          if (r.payroll.paymentStatus?.toLowerCase() === "failed") {
            return {
              ...acc,
              totalEmployees: acc.totalEmployees + 1,
              totalFailed: acc.totalFailed + 1,
            };
          }
          return {
            totalGross: acc.totalGross + r.payroll.gross,
            totalDeductions: acc.totalDeductions + r.payroll.totalDeductions,
            totalNet: acc.totalNet + r.payroll.netSalary,
            totalEmployees: acc.totalEmployees + 1,
            totalFailed: acc.totalFailed,
          };
        },
        {
          totalGross: 0,
          totalDeductions: 0,
          totalNet: 0,
          totalEmployees: 0,
          totalFailed: 0,
        },
      ),
    [payrollRecords],
  );

  const handleTdsChange = (empId, value) => {
    setTdsValues((prev) => ({ ...prev, [empId]: parseFloat(value) || 0 }));
  };

  const closeAttendanceCalendar = () => {
    setAttendanceCalendarEmployee(null);
    setAttendanceCalendarData(null);
    setAttendanceCalendarLoading(false);
    setAttendanceCalendarError("");
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleOpenAttendanceCalendar = async (record) => {
    if (!companyId || !companySlug || !record?.id) return;

    setAttendanceCalendarEmployee(record);
    setAttendanceCalendarData(null);
    setAttendanceCalendarError("");
    setAttendanceCalendarLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/attendance-calendar`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
            company_id: companyId,
            company_slug: companySlug,
            employee_id: record.id,
          },
        },
      );

      if (res.data.success) {
        setAttendanceCalendarData(res.data);
      } else {
        setAttendanceCalendarError("Could not load attendance calendar.");
      }
    } catch (err) {
      console.error("Error loading attendance calendar:", err);
      setAttendanceCalendarError("Could not load attendance calendar.");
    } finally {
      setAttendanceCalendarLoading(false);
    }
  };

  const handleInitiatePayroll = async () => {
    if (!canProcess) {
      alert("You do not have permission to initiate payroll");
      return;
    }
    if (initiating || payrollExists) return;
    try {
      setInitiating(true);
      const entries = payrollRecords.map((r) => ({
        employee_id: r.id,
        employee_name: r.name,
        department: r.department || null,
        job_title: r.jobTitle || null,
        gross_base: r.payroll.baseGross,
        ctc: r.payroll.monthlyCTC,
        basic: r.payroll.basic,
        hra: r.payroll.hra,
        ta: r.payroll.ta,
        da: r.payroll.da,
        special_allowance: r.payroll.specialAllowance,
        epf: r.payroll.epf,
        esi: r.payroll.esi,
        pt: r.payroll.pt,
        days_present: r.payroll.daysPresent,
        late_days: r.payroll.lateDays,
        half_days: r.payroll.halfDays,
        total_ot_hours: r.payroll.otHoursDecimal,
        approved_leave_days: r.payroll.leaveDays,
        unpaid_leave_days: r.payroll.lopDays,
        lop_deduction: r.payroll.lopDeduction,
        half_day_deduction: r.payroll.halfDayDeduction,
        ot_pay: r.payroll.otPay,
        gross_earnings: r.payroll.gross,
        total_deductions: r.payroll.totalDeductions,
        net_payable: r.payroll.netSalary,
        lwf: r.payroll.lwf,
        tax_regime: r.payroll.taxRegime,
        other_components: r.payroll.otherComponents,
        extra_earnings: r.payroll.extraEarnings,
        extra_deductions: r.payroll.extraDeductions,
        attendance_ratio: r.payroll.proratedEarnings?.attendanceRatio,
      }));

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/initiate`,
        {
          month: selectedMonth,
          year: selectedYear,
          company_id: companyId,
          company_slug: companySlug,
          entries,
        },
      );

      if (res.data.success) {
        showSuccess("Payroll initiated successfully!");
        fetchPayrollData();
      } else {
        setError("Failed to initiate payroll.");
      }
    } catch (err) {
      console.error("Error initiating payroll:", err);
      if (err.response?.status === 409) {
        setError("Payroll already exists for this period.");
        fetchPayrollData();
      } else {
        setError("Could not initiate payroll. Please try again.");
      }
    } finally {
      setInitiating(false);
    }
  };

  const handleApprovePayroll = async () => {
    if (!canProcess) {
      alert("You do not have permission to approve payroll");
      return;
    }
    if (!payrollExists || !payrollRun || approving) return;
    try {
      setApproving(true);
      const res = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/approve`,
        {
          run_id: payrollRun.id,
        },
      );
      if (res.data.success) {
        showSuccess("Payroll approved!");
        setShowApproveModal(false);
        fetchPayrollData();
      } else {
        setError("Failed to approve payroll.");
      }
    } catch (err) {
      console.error("Error approving payroll:", err);
      setError("Could not approve payroll. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const handleFinalizePayroll = async () => {
    if (!canProcess) {
      alert("You do not have permission to finalize payroll");
      return;
    }
    if (!payrollExists || !payrollRun || finalizingPayroll) return;
    try {
      setFinalizingPayroll(true);
      const res = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/finalize-run`,
        {
          run_id: payrollRun.id,
        },
      );
      if (res.data.success) {
        showSuccess("Payroll run finalized!");
        setShowFinalizeModal(false);
        fetchPayrollData();
      } else {
        setError("Failed to finalize payroll run.");
      }
    } catch (err) {
      console.error("Error finalizing payroll:", err);
      setError("Could not finalize payroll. Please try again.");
    } finally {
      setFinalizingPayroll(false);
    }
  };

  const handleRevertPayrollToDraft = async () => {
    if (!canProcess) {
      alert("You do not have permission to revert payroll");
      return;
    }
    if (!payrollExists || !payrollRun || revertingPayroll) return;
    try {
      setRevertingPayroll(true);
      const res = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/revert-to-draft`,
        {
          run_id: payrollRun.id,
        },
      );
      if (res.data.success) {
        showSuccess("Payroll moved back to draft.");
        setShowRevertModal(false);
        fetchPayrollData();
      } else {
        setError("Failed to move payroll back to draft.");
      }
    } catch (err) {
      console.error("Error reverting payroll to draft:", err);
      setError("Could not move payroll back to draft. Please try again.");
    } finally {
      setRevertingPayroll(false);
    }
  };

  const handleDiscardPayroll = async () => {
    if (!canProcess) {
      alert("You do not have permission to discard payroll");
      return;
    }
    if (!payrollExists || !payrollRun || discarding) return;

    try {
      setDiscarding(true);
      const res = await axios.delete(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/run/${payrollRun.id}`,
      );
      if (res.data.success) {
        showSuccess("Payroll run discarded!");
        setShowDiscardModal(false);
        fetchPayrollData();
      } else {
        setError("Failed to discard payroll run.");
      }
    } catch (err) {
      console.error("Error discarding payroll:", err);
      setError("Could not discard payroll. Please try again.");
    } finally {
      setDiscarding(false);
    }
  };

  const handleEntryStatus = async (employeeId, status) => {
    if (!canProcess) {
      alert("You do not have permission to update entry status");
      return;
    }
    if (!payrollExists || !payrollRun || processingEntryId) return;
    try {
      setProcessingEntryId(employeeId);
      setProcessingAction(status);
      const res = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/entry-status`,
        {
          run_id: payrollRun.id,
          employee_id: employeeId,
          status: status,
        },
      );
      if (res.data.success) {
        showSuccess(`Entry marked as ${status}!`);
        fetchPayrollData();
      } else {
        setError(`Failed to mark entry as ${status}.`);
      }
    } catch (err) {
      console.error("Error updating entry status:", err);
      setError(`Could not mark entry as ${status}. Please try again.`);
    } finally {
      setProcessingEntryId(null);
      setProcessingAction(null);
    }
  };

  const handleBulkEntryStatus = async (status) => {
    if (!canProcess) {
      alert("You do not have permission to update bulk entry status");
      return;
    }
    if (
      !payrollExists ||
      !payrollRun ||
      processingBulkAction ||
      selectedEntries.length === 0
    )
      return;
    try {
      setProcessingBulkAction(status);
      const res = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/bulk-entry-status`,
        {
          run_id: payrollRun.id,
          employee_ids: selectedEntries,
          status: status,
        },
      );
      if (res.data.success) {
        showSuccess(`Selected entries marked as ${status}!`);
        setSelectedEntries([]);
        fetchPayrollData();
      } else {
        setError(`Failed to mark selected entries as ${status}.`);
      }
    } catch (err) {
      console.error("Error updating bulk entry status:", err);
      setError(
        `Could not mark selected entries as ${status}. Please try again.`,
      );
    } finally {
      setProcessingBulkAction(null);
    }
  };

  const isAllCurrentPageSelected =
    currentData.length > 0 &&
    currentData.every((r) => selectedEntries.includes(r.id));
  const toggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      setSelectedEntries((prev) =>
        prev.filter((id) => !currentData.find((r) => r.id === id)),
      );
    } else {
      const newSelections = currentData
        .filter((r) => !selectedEntries.includes(r.id))
        .map((r) => r.id);
      setSelectedEntries((prev) => [...prev, ...newSelections]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedEntries((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  return (
    <div className="erp-root app-shell p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {successMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl border border-emerald-700 shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle size={16} />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="app-title">Payroll Management</h1>
            <p className="app-subtitle mt-1">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear} •{" "}
              {totals.totalEmployees} employees
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="app-input py-1.5 px-3 pr-8 relative bg-white min-h-9.5 text-xs font-semibold"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="app-input py-1.5 px-3 pr-8 relative bg-white min-h-9.5 text-xs font-semibold"
            >
              {yearRange.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={fetchPayrollData}
              className="app-btn-secondary min-h-9.5 h-9.5 py-1 px-3 flex items-center gap-1.5"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            {canProcess &&
              payrollExists &&
              payrollRun?.status !== "PAID" &&
              !loading && (
                <button
                  onClick={() => setShowDiscardModal(true)}
                  disabled={discarding}
                  className="app-btn-secondary border-red-200 text-red-600 hover:bg-red-50 min-h-9.5 h-9.5 py-1 px-3 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Discard this payroll run"
                >
                  {discarding ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  Discard
                </button>
              )}
          </div>
        </div>

        {(canConfig || canDownload) && (
          <div className="app-panel p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {canConfig && (
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="app-btn-secondary min-h-9.5 h-9.5 py-1 px-3 flex items-center gap-1.5"
                  >
                    <Calculator size={16} className="text-(--text-soft)" />{" "}
                    Config
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {canDownload && (
                  <>
                    <button
                      onClick={() => {
                        downloadPayrollExcel(payrollRecords);
                        showSuccess("Excel downloaded!");
                      }}
                      className="app-btn-secondary min-h-9.5 h-9.5 py-1 px-3 flex items-center gap-1.5"
                    >
                      <FileSpreadsheet size={16} className="text-(--brand)" />{" "}
                      Excel
                    </button>
                    <button
                      onClick={() => {
                        downloadPayrollReportPDF(
                          payrollRecords,
                          selectedMonth,
                          selectedYear,
                          user?.name,
                        );
                        showSuccess("PDF downloaded!");
                      }}
                      className="app-btn-secondary min-h-9.5 h-9.5 py-1 px-3 flex items-center gap-1.5"
                    >
                      <FileText size={16} className="text-rose-500" /> PDF
                    </button>
                    <button
                      onClick={() => {
                        downloadBankTransferFile(payrollRecords);
                        showSuccess("Bank transfer file downloaded!");
                      }}
                      className="app-btn-secondary min-h-9.5 h-9.5 py-1 px-3 flex items-center gap-1.5"
                    >
                      <Banknote size={16} className="text-emerald-600" />{" "}
                      Transfer File
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="app-grid-5 gap-4">
          <div className="app-panel p-4">
            <p className="app-label flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Users size={12} className="text-(--brand)" /> Total Employees
            </p>
            <p className="text-[26px] font-extrabold leading-none text-(--text-strong) mt-2.5">
              {totals.totalEmployees}
            </p>
            {totals.totalFailed > 0 && (
              <p className="text-xs font-bold text-rose-600 mt-2">
                {totals.totalFailed} Failed
              </p>
            )}
          </div>
          <div className="app-panel p-4">
            <p className="app-label text-[11px] uppercase tracking-wider">
              Gross Payroll
            </p>
            <p className="text-[26px] font-extrabold leading-none text-(--text-strong) mt-2.5">
              {formatINR(totals.totalGross)}
            </p>
          </div>
          <div className="app-panel p-4">
            <p className="app-label text-[11px] uppercase tracking-wider">
              Total Deductions
            </p>
            <p className="text-[26px] font-extrabold leading-none text-rose-700 mt-2.5">
              {formatINR(totals.totalDeductions)}
            </p>
            <p className="text-[11px] text-(--text-faint) mt-2">
              EPF, ESI, Professional Tax, TDS
            </p>
          </div>
          <div className="app-panel p-4">
            <p className="app-label text-[11px] uppercase tracking-wider">
              Net Payable
            </p>
            <p className="text-[26px] font-extrabold leading-none text-emerald-800 mt-2.5">
              {formatINR(totals.totalNet)}
            </p>
          </div>
          {(() => {
            const status = payrollExists
              ? payrollRun?.status || "DRAFT"
              : "NOT_INITIATED";
            const statusMap = {
              NOT_INITIATED: {
                label: "Not Initiated",
                color: "text-slate-500",
                dot: "bg-slate-400",
                sub: "Payroll has not been started",
              },
              DRAFT: {
                label: "Draft",
                color: "text-amber-600",
                dot: "bg-amber-500",
                sub: "Review and edit before approving",
              },
              PROCESSING: {
                label: "Processing",
                color: "text-blue-600",
                dot: "bg-blue-500",
                sub: "Payroll is being verified",
              },
              APPROVED: {
                label: "Approved",
                color: "text-emerald-600",
                dot: "bg-emerald-500",
                sub: "Mark entries as paid/failed",
              },
              PAID: {
                label: "Finalized",
                color: "text-emerald-800",
                dot: "bg-emerald-600",
                sub: "Payroll run is complete",
              },
            };
            const s = statusMap[status] || statusMap.NOT_INITIATED;
            return (
              <div className="app-panel p-4">
                <p className="app-label text-[11px] uppercase tracking-wider flex items-center gap-1">
                  Status
                </p>
                <p
                  className={`text-[22px] font-extrabold leading-none mt-2.5 flex items-center ${s.color}`}
                >
                  {s.label}
                </p>
                <p className="text-[11px] text-(--text-soft) font-medium mt-2">
                  {s.sub}
                </p>
              </div>
            );
          })()}
        </div>

        <div className="app-panel p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-soft)"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name, department, or ID..."
              className="app-input w-full pl-10 pr-3 py-2 text-xs"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {searchTerm && (
            <button
              className="app-btn-secondary py-1 px-3 min-h-9.5 h-9.5 flex items-center gap-1.5"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              <X size={14} /> Clear
            </button>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {canProcess &&
              !payrollExists &&
              employees.length > 0 &&
              !loading && (
                <button
                  onClick={handleInitiatePayroll}
                  disabled={initiating}
                  className="app-btn-primary flex items-center gap-1.5 h-9.5 min-h-9.5 py-1 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  {initiating ? "Initiating..." : "Initiate Payroll"}
                </button>
              )}
            {canProcess &&
              payrollExists &&
              payrollRun?.status === "DRAFT" &&
              !loading && (
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={approving}
                  className="app-btn-primary flex items-center gap-1.5 h-9.5 min-h-9.5 py-1 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {approving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {approving ? "Approving..." : "Approve Payroll"}
                </button>
              )}
            {canProcess &&
              payrollExists &&
              payrollRun?.status === "APPROVED" &&
              !loading &&
              selectedEntries.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkEntryStatus("paid")}
                    disabled={processingBulkAction !== null}
                    className="app-btn-secondary border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-9.5 min-h-9.5 py-1 px-3 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {processingBulkAction === "paid" ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Banknote size={16} />
                    )}
                    Mark As Paid
                  </button>
                  <button
                    onClick={() => handleBulkEntryStatus("failed")}
                    disabled={processingBulkAction !== null}
                    className="app-btn-secondary border-red-300 text-red-700 hover:bg-red-50 h-9.5 min-h-9.5 py-1 px-3 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {processingBulkAction === "failed" ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    Mark As Failed
                  </button>
                </>
              )}
            {canProcess &&
              payrollExists &&
              payrollRun?.status === "APPROVED" &&
              !loading && (
                <>
                  <button
                    onClick={() => setShowRevertModal(true)}
                    disabled={revertingPayroll}
                    className="app-btn-secondary border-amber-300 text-amber-700 hover:bg-amber-50 h-9.5 min-h-9.5 py-1 px-3 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {revertingPayroll ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Edit size={16} />
                    )}
                    {revertingPayroll ? "Returning..." : "Return to Draft"}
                  </button>
                  <button
                    onClick={() => setShowFinalizeModal(true)}
                    disabled={
                      finalizingPayroll ||
                      payrollRecords.some(
                        (r) =>
                          (r.payroll.paymentStatus ||
                            payrollStatuses[r.id] ||
                            "pending") === "pending",
                      )
                    }
                    title={
                      payrollRecords.some(
                        (r) =>
                          (r.payroll.paymentStatus ||
                            payrollStatuses[r.id] ||
                            "pending") === "pending",
                      )
                        ? "All entries must be marked as paid or failed"
                        : ""
                    }
                    className="app-btn-primary flex items-center gap-1.5 h-9.5 min-h-9.5 py-1 px-3 disabled:bg-slate-400 disabled:opacity-60 disabled:border-slate-300 disabled:cursor-not-allowed"
                  >
                    {finalizingPayroll ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {finalizingPayroll ? "Finalizing..." : "Finalize Payroll"}
                  </button>
                </>
              )}
          </div>
        </div>

        {error && (
          <div className="bg-rose-50/50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="font-semibold">{error}</span>
            <button
              onClick={fetchPayrollData}
              className="ml-auto text-sm font-semibold underline hover:text-rose-900 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="app-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-(--border-soft)">
              <thead className="bg-(--bg-subtle)/50">
                <tr>
                  {payrollExists && payrollRun?.status === "APPROVED" && (
                    <th className="px-4 py-3 w-12 text-left text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-(--brand) focus:ring-(--brand-ring) cursor-pointer"
                        checked={isAllCurrentPageSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-(--text-soft) uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-(--border-soft)">
                {loading ? (
                  <PayrollSkeleton />
                ) : currentData.length > 0 ? (
                  currentData.map((record) => {
                    const { payroll } = record;

                    const isSelected = selectedEntries.includes(record.id);
                    const currentStatus = !payrollExists
                      ? "configured"
                      : payroll.paymentStatus ||
                        payrollStatuses[record.id] ||
                        "pending";
                    const isFailed = currentStatus === "failed";

                    return (
                      <tr
                        key={record.id}
                        className={`transition-colors duration-150 ${isFailed ? "" : "hover:bg-(--bg-subtle)/30"} ${isSelected ? "bg-emerald-50/40" : ""}`}
                      >
                        {payrollExists && payrollRun?.status === "APPROVED" && (
                          <td
                            className={`px-4 py-3 align-top text-left ${isFailed ? "opacity-50" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-(--brand) focus:ring-(--brand-ring) cursor-pointer"
                              checked={isSelected}
                              onChange={() => toggleSelect(record.id)}
                            />
                          </td>
                        )}

                        <td
                          className={`px-4 py-3 align-top ${isFailed ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 h-10 w-10 bg-(--brand-soft) border border-(--border-soft) rounded-xl flex items-center justify-center">
                              <span className="text-(--brand-strong) font-bold text-lg">
                                {record.name?.charAt(0) || "E"}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-(--text-strong)">
                                {record.name}
                              </div>
                              <div className="text-xs text-(--text-soft) font-medium">
                                #{record.id} • {record.department || "No Dept"}
                              </div>
                              {record.jobTitle && (
                                <div className="text-[11px] text-(--text-faint) font-semibold mt-0.5">
                                  {record.jobTitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td
                          className={`px-4 py-3 align-top ${isFailed ? "opacity-50" : ""}`}
                        >
                          <div className="text-xs space-y-0.5 font-medium text-(--text-body)">
                            <div className="flex items-center gap-1">
                              <Calendar
                                size={12}
                                className="text-(--text-faint)"
                              />
                              Present:{" "}
                              <span className="font-bold text-(--text-strong)">
                                {payroll.uiPresentDays}
                              </span>
                            </div>
                            {payroll.halfDays > 0 && (
                              <div className="text-orange-600 font-semibold">
                                Half Day: {payroll.halfDays}
                              </div>
                            )}
                            {payroll.lopDays > 0 && (
                              <div className="text-rose-600 font-semibold">
                                LOP: {payroll.lopDays} day
                                {payroll.lopDays > 1 ? "s" : ""}
                              </div>
                            )}
                            {payroll.otHoursDecimal > 0 && (
                              <div className="text-purple-600 flex items-center gap-1 font-semibold">
                                <Clock size={12} />
                                OT: {payroll.otHoursDecimal.toFixed(1)}h
                              </div>
                            )}
                            {payroll.uiPresentDays === 0 &&
                              payroll.lopDays === 0 &&
                              payroll.otHoursDecimal === 0 && (
                                <div className="text-(--text-faint) italic">
                                  No records
                                </div>
                              )}
                            <button
                              type="button"
                              className="mt-2 inline-flex items-center gap-1 rounded-xl border border-(--border-soft) bg-white px-2.5 py-1.5 text-xs font-semibold text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-50 transition-colors shadow-sm"
                              onClick={() =>
                                handleOpenAttendanceCalendar(record)
                              }
                              disabled={
                                attendanceCalendarLoading &&
                                attendanceCalendarEmployee?.id === record.id
                              }
                            >
                              <Eye size={12} />
                              {attendanceCalendarLoading &&
                              attendanceCalendarEmployee?.id === record.id
                                ? "Loading..."
                                : "Details"}
                            </button>
                          </div>
                        </td>

                        <td
                          className={`px-4 py-3 align-top text-right ${isFailed ? "opacity-50" : ""}`}
                        >
                          <div className="text-xs space-y-0.5 font-medium text-(--text-soft)">
                            {payroll.basic > 0 && (
                              <div>Basic: {formatINR(payroll.basic)}</div>
                            )}
                            {payroll.hra > 0 && (
                              <div>HRA: {formatINR(payroll.hra)}</div>
                            )}
                            {payroll.ta > 0 && (
                              <div>TA: {formatINR(payroll.ta)}</div>
                            )}
                            {payroll.da > 0 && (
                              <div>DA: {formatINR(payroll.da)}</div>
                            )}
                            {payroll.specialAllowance > 0 && (
                              <div>
                                Special: {formatINR(payroll.specialAllowance)}
                              </div>
                            )}

                            {payroll.otherComponents
                              ?.filter((c) => c.type === "earning")
                              .map(
                                (comp, idx) =>
                                  comp.amount > 0 && (
                                    <div key={`o-earn-${idx}`}>
                                      {comp.name}: +{formatINR(comp.amount)}
                                    </div>
                                  ),
                              )}

                            {payroll.baseGross === payroll.gross ? (
                              <div className="font-bold text-(--text-strong) pt-0.5 mt-0.5 border-t border-(--border-soft)">
                                Gross: {formatINR(payroll.gross)}
                              </div>
                            ) : (
                              <>
                                <div className="font-bold text-(--text-strong) pt-0.5 mt-0.5 border-t border-(--border-soft)">
                                  Base Gross: {formatINR(payroll.baseGross)}
                                </div>

                                {payroll.extraEarnings?.map(
                                  (comp, idx) =>
                                    comp.amount > 0 && (
                                      <div key={`e-earn-${idx}`}>
                                        {comp.name}: +{formatINR(comp.amount)}
                                      </div>
                                    ),
                                )}

                                {payroll.otPay > 0 && (
                                  <div
                                    className={`pt-0.5 mt-0.5 text-purple-750 font-semibold`}
                                  >
                                    OT Pay: +{formatINR(payroll.otPay || 0)}
                                  </div>
                                )}

                                <div className="font-bold text-(--text-strong) pt-0.5 mt-0.5 border-t border-(--border-soft)">
                                  Revised Gross: {formatINR(payroll.gross)}
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        <td
                          className={`px-4 py-3 align-top text-right ${isFailed ? "opacity-50" : ""}`}
                        >
                          <div className="text-xs space-y-0.5 font-medium text-(--text-soft)">
                            {payroll.epf > 0 && (
                              <div>EPF: {formatINR(payroll.epf)}</div>
                            )}
                            {payroll.esi > 0 && (
                              <div>ESI: {formatINR(payroll.esi)}</div>
                            )}
                            {payroll.pt > 0 && (
                              <div>PT: {formatINR(payroll.pt)}</div>
                            )}
                            {payroll.lwf > 0 && (
                              <div>LWF: {formatINR(payroll.lwf)}</div>
                            )}

                            {payroll.otherComponents
                              ?.filter((c) => c.type === "deduction")
                              .map(
                                (comp, idx) =>
                                  comp.amount > 0 && (
                                    <div key={`o-ded-${idx}`}>
                                      {comp.name}: {formatINR(comp.amount)}
                                    </div>
                                  ),
                              )}

                            {payroll.extraDeductions?.map(
                              (comp, idx) =>
                                comp.amount > 0 && (
                                  <div key={`e-ded-${idx}`}>
                                    {comp.name}: {formatINR(comp.amount)}
                                  </div>
                                ),
                            )}

                            <div className="mt-0.5">
                              TDS:{" "}
                              {formatINR(
                                tdsValues[record.id] || payroll.tds || 0,
                              )}
                            </div>

                            {payroll.lopDeduction > 0 && (
                              <div className="text-rose-600 font-semibold">
                                LOP: {formatINR(payroll.lopDeduction)}
                              </div>
                            )}
                            {payroll.halfDayDeduction > 0 && (
                              <div className="text-rose-600 font-semibold">
                                Half-day: {formatINR(payroll.halfDayDeduction)}
                              </div>
                            )}
                            <div className="font-bold text-rose-700 pt-0.5 mt-0.5 border-t border-(--border-soft)">
                              Total: {formatINR(payroll.totalDeductions)}
                            </div>
                          </div>
                        </td>

                        <td
                          className={`px-4 py-3 align-top text-right ${isFailed ? "opacity-50" : ""}`}
                        >
                          <div className="font-bold text-(--text-strong) text-sm">
                            {formatINR(payroll.netSalary)}
                          </div>
                          <div className="text-[11px] text-(--text-faint) font-semibold mt-0.5">
                            CTC {formatINR(payroll.monthlyCTC)}/mo
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top text-center">
                          <PayrollStatusBadge status={currentStatus} />
                        </td>

                        <td className="px-4 py-3 align-top text-right">
                          <div className="flex items-center justify-end gap-2 text-left">
                            <button
                              className="app-btn-secondary min-h-8 h-8 px-2.5 py-1 text-xs flex items-center gap-1"
                              onClick={() => setSelectedEmployee(record)}
                            >
                              <Eye size={14} /> View
                            </button>

                            {canEdit &&
                              payrollExists &&
                              payrollRun?.status === "DRAFT" && (
                                <button
                                  className="app-btn-secondary min-h-8 h-8 px-2.5 py-1 text-xs flex items-center gap-1"
                                  onClick={() => setEditingPayroll(record.id)}
                                >
                                  <Edit size={14} /> Edit
                                </button>
                              )}

                            {canProcess &&
                              payrollExists &&
                              payrollRun?.status === "APPROVED" &&
                              payroll.paymentStatus === "pending" && (
                                <>
                                  <button
                                    className="app-btn-secondary min-h-8 h-8 px-2.5 py-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs flex items-center gap-1 disabled:opacity-60"
                                    onClick={() =>
                                      handleEntryStatus(record.id, "paid")
                                    }
                                    disabled={processingEntryId === record.id}
                                  >
                                    {processingEntryId === record.id &&
                                    processingAction === "paid" ? (
                                      <RefreshCw
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Banknote size={14} />
                                    )}{" "}
                                    Paid
                                  </button>
                                  <button
                                    className="app-btn-secondary min-h-8 h-8 px-2.5 py-1 border-red-300 text-red-700 hover:bg-red-50 text-xs flex items-center gap-1 disabled:opacity-60"
                                    onClick={() =>
                                      handleEntryStatus(record.id, "failed")
                                    }
                                    disabled={processingEntryId === record.id}
                                  >
                                    {processingEntryId === record.id &&
                                    processingAction === "failed" ? (
                                      <RefreshCw
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <X size={14} />
                                    )}{" "}
                                    Failed
                                  </button>
                                </>
                              )}

                            {canProcess &&
                              payrollExists &&
                              payrollRun?.status === "APPROVED" &&
                              payroll.paymentStatus !== "pending" && (
                                <button
                                  className="app-btn-secondary border-gray-300 text-gray-700 hover:bg-gray-50 text-xs min-h-8 h-8 flex items-center gap-1 disabled:opacity-60"
                                  onClick={() =>
                                    handleEntryStatus(record.id, "pending")
                                  }
                                  disabled={processingEntryId === record.id}
                                >
                                  {processingEntryId === record.id &&
                                  processingAction === "pending" ? (
                                    <>
                                      <RefreshCw
                                        size={14}
                                        className="animate-spin"
                                      />{" "}
                                      Undo
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw size={14} /> Undo
                                    </>
                                  )}
                                </button>
                              )}

                            {payrollExists &&
                              payrollRun?.status === "PAID" &&
                              payroll.paymentStatus === "paid" && (
                                <button
                                  className="app-btn-secondary text-(--brand) hover:text-(--brand-strong) border-(--border-soft) text-xs min-h-8 h-8 flex items-center gap-1"
                                  onClick={() => {
                                    const { employeeRecord, payrollRecord } =
                                      mapPayslipPayload(record);
                                    downloadIndividualPayslip(
                                      employeeRecord,
                                      payrollRecord,
                                    );
                                    showSuccess("Payslip downloaded!");
                                  }}
                                >
                                  <Download size={14} /> Payslip
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={
                        payrollExists && payrollRun?.status === "APPROVED"
                          ? "8"
                          : "7"
                      }
                      className="px-4 py-8 text-center text-(--text-soft) font-medium"
                    >
                      {employees.length === 0 && !loading
                        ? "No employee records found for this period."
                        : "No employees match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredRecords.length > 0 && (
            <div className="px-4 py-3 bg-(--bg-panel) border-t border-(--border-soft) flex flex-col sm:flex-row items-center justify-between text-xs text-(--text-soft)">
              <div className="mb-2 sm:mb-0 font-medium">
                Showing{" "}
                <span className="font-bold text-(--text-strong)">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-(--text-strong)">
                  {Math.min(
                    startIndex + entriesPerPage,
                    filteredRecords.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-(--text-strong)">
                  {filteredRecords.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="app-btn-secondary h-8 w-8 p-0 flex items-center justify-center disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 bg-white border border-(--border-strong) text-(--brand) rounded-xl font-bold">
                  {currentPage}
                </span>
                <button
                  className="app-btn-secondary h-8 w-8 p-0 flex items-center justify-center disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedEmployee && (
          <EmployeeDetailsModal
            employee={selectedEmployee}
            payroll={selectedEmployee.payroll}
            onClose={() => setSelectedEmployee(null)}
          />
        )}

        {attendanceCalendarEmployee && (
          <AttendanceCalendarModal
            employee={attendanceCalendarEmployee}
            monthName={MONTH_NAMES[selectedMonth - 1]}
            year={selectedYear}
            data={attendanceCalendarData}
            loading={attendanceCalendarLoading}
            error={attendanceCalendarError}
            onClose={closeAttendanceCalendar}
          />
        )}

        {showConfigModal && (
          <PayrollConfigModal
            config={payrollConfig}
            onSave={async (newConfig) => {
              try {
                const res = await axios.put(
                  `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll-policies`,
                  {
                    ...newConfig,
                    company_slug: companySlug,
                  },
                );
                if (res.data.success) {
                  setPayrollConfig(res.data.data);
                  setShowConfigModal(false);
                  showSuccess("Configuration updated!");

                  if (!payrollExists) {
                    fetchPayrollData();
                  }
                }
              } catch (error) {
                console.error("Error updating payroll config:", error);
                setError("Failed to update configuration. Please try again.");
              }
            }}
            onCancel={() => setShowConfigModal(false)}
          />
        )}

        {editingPayroll &&
          (() => {
            const rec = payrollRecords.find((r) => r.id === editingPayroll);
            if (!rec) return null;
            return (
              <PayrollEditModal
                employee={rec}
                payroll={rec.payroll}
                tds={tdsValues[editingPayroll] || 0}
                onTdsChange={(val) => handleTdsChange(editingPayroll, val)}
                onSave={async (updatedFields) => {
                  if (updatedFields) {
                    try {
                      const payload = {
                        month: selectedMonth,
                        year: selectedYear,
                        company_id: companyId,
                        company_slug: companySlug,
                        employee_id: rec.id,
                        basic: updatedFields.basic,
                        hra: updatedFields.hra,
                        special_allowance: updatedFields.specialAllowance,
                        gross_base: updatedFields.baseGross,
                        ot_pay: updatedFields.otPay,
                        gross_earnings: updatedFields.gross,
                        epf: updatedFields.epf,
                        esi: updatedFields.esi,
                        pt: updatedFields.pt,
                        lwf: updatedFields.lwf,
                        lop_deduction: updatedFields.lopDeduction,
                        tax_regime: updatedFields.taxRegime,
                        other_components: updatedFields.otherComponents,
                        extra_earnings: updatedFields.extraEarnings,
                        extra_deductions: updatedFields.extraDeductions,
                        attendance_ratio:
                          updatedFields.proratedEarnings?.attendanceRatio,
                        total_deductions: updatedFields.totalDeductions,
                        net_payable: updatedFields.netSalary,
                      };

                      const res = await axios.put(
                        `${import.meta.env.VITE_HRMS_BASE_URL}/api/payroll/edit`,
                        payload,
                      );

                      if (res.data.success) {
                        setPayrollStatuses((prev) => ({
                          ...prev,
                          [editingPayroll]: "configured",
                        }));
                        setEditingPayroll(null);
                        await fetchPayrollData();
                        showSuccess("Payroll updated successfully!");
                      }
                    } catch (err) {
                      console.error("Error updating payroll:", err);
                    }
                  } else {
                    setEditingPayroll(null);
                  }
                }}
                onCancel={() => setEditingPayroll(null)}
              />
            );
          })()}

        {showApproveModal && (
          <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="app-modal w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                  <AlertCircle size={24} />
                  <h3 className="modal-title">Approve Payroll</h3>
                </div>
                <p className="text-(--text-soft) text-sm mb-6">
                  Are you sure you want to approve the payroll for{" "}
                  {MONTH_NAMES[selectedMonth - 1]} {selectedYear}? Once
                  approved, you can mark entries as paid or failed.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="app-btn-secondary px-4 py-2 h-10 flex items-center justify-center"
                    disabled={approving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprovePayroll}
                    className="app-btn-primary px-4 py-2 h-10 flex items-center justify-center gap-2 bg-emerald-600 border border-emerald-700 hover:bg-emerald-700 font-semibold"
                    disabled={approving}
                  >
                    {approving && (
                      <RefreshCw size={14} className="animate-spin" />
                    )}
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFinalizeModal && (
          <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="app-modal w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 text-rose-600 mb-4">
                  <AlertCircle size={24} />
                  <h3 className="modal-title">Finalize Payroll</h3>
                </div>
                <p className="text-(--text-soft) text-sm mb-6">
                  Are you sure you want to finalize this payroll?{" "}
                  <strong>
                    This action is permanent and cannot be reversed.
                  </strong>{" "}
                  All payroll records for this month will be locked.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowFinalizeModal(false)}
                    className="app-btn-secondary px-4 py-2 h-10 flex items-center justify-center"
                    disabled={finalizingPayroll}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalizePayroll}
                    className="app-btn-primary px-4 py-2 h-10 flex items-center justify-center gap-2 bg-emerald-600 border border-emerald-700 hover:bg-emerald-700 font-semibold"
                    disabled={finalizingPayroll}
                  >
                    {finalizingPayroll && (
                      <RefreshCw size={14} className="animate-spin" />
                    )}
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRevertModal && (
          <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="app-modal w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                  <AlertCircle size={24} />
                  <h3 className="modal-title">Return Payroll To Draft</h3>
                </div>
                <p className="text-(--text-soft) text-sm mb-6">
                  Are you sure you want to move this payroll back to draft?
                  <strong>
                    {" "}
                    All paid and failed entries will be reset to pending
                  </strong>{" "}
                  so you can edit the payroll again.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowRevertModal(false)}
                    className="app-btn-secondary px-4 py-2 h-10 flex items-center justify-center"
                    disabled={revertingPayroll}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevertPayrollToDraft}
                    className="app-btn-primary px-4 py-2 h-10 flex items-center justify-center gap-2 bg-amber-600 border border-amber-700 hover:bg-amber-700 font-semibold"
                    disabled={revertingPayroll}
                  >
                    {revertingPayroll && (
                      <RefreshCw size={14} className="animate-spin" />
                    )}
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDiscardModal && (
          <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="app-modal w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 text-rose-600 mb-4">
                  <AlertCircle size={24} />
                  <h3 className="modal-title">Discard Payroll</h3>
                </div>
                <p className="text-(--text-soft) text-sm mb-6">
                  Are you sure you want to discard this payroll run? All data
                  for this period will be deleted.{" "}
                  <strong>This action cannot be undone.</strong>
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDiscardModal(false)}
                    className="app-btn-secondary px-4 py-2 h-10 flex items-center justify-center"
                    disabled={discarding}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDiscardPayroll}
                    className="app-btn-primary px-4 py-2 h-10 flex items-center justify-center gap-2 bg-rose-600 border border-rose-700 hover:bg-rose-700 font-semibold"
                    disabled={discarding}
                  >
                    {discarding && (
                      <RefreshCw size={14} className="animate-spin" />
                    )}
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;
