import axios from "axios";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Bell,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
  X,
  XCircle
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";
import { usePermission } from "../../../hooks/usePermission";
import CandidateDetailsUpdate from "./Candidatedetailsupdate";
import ViewEmployeeDocuments from "./Documentview";
import Experiencecertificate from "./Experiencecertificate";
import TerminateEmployee from "./TerminateEmployee";
import ViewJobApplication from "./Viewjobapplication";

const JobJoinedList = ({ basePath }) => {
  const { has } = usePermission();
  const canCreate = has("hrms.employee.create");
  const canExport = has("hrms.employee.export");
  const canEdit = has("hrms.employee.edit");
  const canDelete = has("hrms.employee.delete");
  const canResign = has("hrms.employee.resign");
  const canTerminate = has("hrms.employee.terminate");
  const canNotice = has("hrms.employee.notice");
  const canIdCard = has("hrms.employee.idcard");
  const canVisitingCard = has("hrms.employee.visitingcard");
  const parseNoticeDays = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    const match = String(value).match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [allEmployeesForStats, setAllEmployeesForStats] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activePanel, setActivePanel] = useState("");
  const [animateView, setAnimateView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acceptedEmployees, setAcceptedEmployees] = useState(new Set());
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [employeeToAccept, setEmployeeToAccept] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [tableDepartmentFilter, setTableDepartmentFilter] = useState("");
  const [tableDesignationFilter, setTableDesignationFilter] = useState("");
  const [tableShiftFilter, setTableShiftFilter] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [terminatedEmployees, setTerminatedEmployees] = useState([]);
  const [resignedEmployees, setResignedEmployees] = useState([]);
  const [noticeEmployees, setNoticeEmployees] = useState([]);
  const [exEmployees, setExEmployees] = useState([]);
  const [showResignForm, setShowResignForm] = useState(null);

  const [resigning, setResigning] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all", "accepted", "projects", "certificate", "terminate", "notice"
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Termination states
  const [showTerminationForm, setShowTerminationForm] = useState(null);
  const [terminating, setTerminating] = useState(false);

  // Notice states
  const [showNoticeForm, setShowNoticeForm] = useState(null);
  const [noticing, setNoticing] = useState(false);

  const entriesPerPage = 10;

  const { user, token } = useAuth();
  console.log(user);

  const slug = user.slug;
  console.log(slug);
  const id = user.id;
  console.log(id);
  const company_id = user.company_id;
  const companyScopeId = user.company_id;
  const role = user.role;
  console.log(role);
  const navigate = useNavigate();
  const location = useLocation();
  //  const { id } = useParams();
  const resolvedBasePath =
    basePath ||
    (location.pathname.startsWith("/employee/hr") ? "/employee/hr" : "/hrms");

  const normalizedSeparatedEmployees = [
    ...terminatedEmployees,
    ...resignedEmployees,
    ...noticeEmployees,
  ].map((emp) => ({
    ...emp,
    rowKey: `${emp.terminationType ? "termination" : emp.noticeType ? "notice" : "resignation"}-${emp.id}`,
    sourceRecordId: emp.id,
    id: emp.employeeId ?? emp.id,
    employeeId: emp.employeeId ?? emp.id,
    postApplied: emp.designation || emp.postApplied,
    phone: emp.phone || emp.contact || "-",
    employeeStatus: ["Notice Period", "Resigned", "Terminated"].includes(
      emp.status,
    )
      ? `${emp.status} (${parseNoticeDays(emp.noticePeriod ?? emp.notice_period)} days left)`
      : emp.employeeStatus || emp.status || "N/A",
    noticePeriod: parseNoticeDays(emp.noticePeriod ?? emp.notice_period),
    separationSource: emp.terminationType
      ? "termination"
      : emp.noticeType
        ? "notice"
        : "resignation",
  }));

  const getFilterParams = () => {
    const params = {};

    params.page = currentPage;
    params.limit = entriesPerPage;

    if (searchTerm) {
      const term = searchTerm.trim();
      if (term.includes("@")) {
        params.email = term;
      } else if (/^\d+$/.test(term) || term.toLowerCase().startsWith("emp")) {
        params.employeeId = term;
      } else {
        params.name = term;
      }
    }

    if (statusFilter) {
      params.status = statusFilter;
    }
    if (tableDepartmentFilter) {
      params.department = tableDepartmentFilter;
    }
    if (tableDesignationFilter) {
      params.designation = tableDesignationFilter;
    }
    if (tableShiftFilter) {
      params.employeeShift = tableShiftFilter;
    }

    // Tab level filters
    if (activeTab === "accepted" || activeTab === "confirm") {
      params.status = "Accepted";
    } else if (activeTab === "probation") {
      params.employeeStatus = "Probation";
    } else if (activeTab === "notice") {
      params.status = "Notice Period";
    } else if (activeTab === "parttime") {
      params.employeeStatus = "Part Time";
    }

    return params;
  };

  const fetchFilteredEmployees = async () => {
    if (activeTab === "ex") return;
    try {
      setLoading(true);
      const params = getFilterParams();

      const res = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/filter-employees`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("FILTERED API RESPONSE:", res);

      if (res.data) {
        let employeeList = [];
        let totalCountVal = 0;
        let totalPagesVal = 1;

        const dataObj = res.data;
        if (Array.isArray(dataObj.data)) {
          employeeList = dataObj.data;
          totalCountVal =
            dataObj.total ||
            dataObj.totalItems ||
            dataObj.pagination?.total ||
            dataObj.data.length;
          totalPagesVal =
            dataObj.totalPages ||
            dataObj.pagination?.totalPages ||
            Math.ceil(totalCountVal / entriesPerPage);
        } else if (dataObj.data && Array.isArray(dataObj.data.employees)) {
          employeeList = dataObj.data.employees;
          totalCountVal =
            dataObj.data.total ||
            dataObj.data.totalItems ||
            dataObj.data.pagination?.total ||
            employeeList.length;
          totalPagesVal =
            dataObj.data.totalPages ||
            dataObj.data.pagination?.totalPages ||
            Math.ceil(totalCountVal / entriesPerPage);
        } else if (Array.isArray(dataObj)) {
          employeeList = dataObj;
          totalCountVal = employeeList.length;
          totalPagesVal = Math.ceil(totalCountVal / entriesPerPage);
        } else if (dataObj.employees && Array.isArray(dataObj.employees)) {
          employeeList = dataObj.employees;
          totalCountVal =
            dataObj.total || dataObj.totalItems || employeeList.length;
          totalPagesVal =
            dataObj.totalPages || Math.ceil(totalCountVal / entriesPerPage);
        }

        setEmployees(employeeList);
        setTotalItems(totalCountVal);
        setTotalPagesState(totalPagesVal || 1);
      }
    } catch (err) {
      console.error(
        "Error fetching filtered employees:",
        err.response?.data || err,
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStatsAndEx = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.data) {
        setAllEmployeesForStats(res.data.data || []);
      }

      const exRes = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/ex-employee/${slug}`,
        {
          params: {
            company_id: companyScopeId,
          },
        },
      );
      if (exRes.data) {
        const exEmpData = Array.isArray(exRes.data)
          ? exRes.data
          : Array.isArray(exRes.data.data)
            ? exRes.data.data
            : [];
        setExEmployees(exEmpData);
      }
    } catch (err) {
      console.error("Error fetching stats or ex-employees:", err);
    }
  };

  const fetchEmployees = async () => {
    if (slug && companyScopeId && token) {
      await Promise.all([fetchAllStatsAndEx(), fetchFilteredEmployees()]);
    }
  };

  useEffect(() => {
    if (slug && companyScopeId && token) {
      fetchAllStatsAndEx();
    }
  }, [slug, companyScopeId, token]);

  useEffect(() => {
    if (slug && companyScopeId && token) {
      fetchFilteredEmployees();
    }
  }, [
    slug,
    companyScopeId,
    token,
    currentPage,
    searchTerm,
    statusFilter,
    tableDepartmentFilter,
    tableDesignationFilter,
    tableShiftFilter,
    activeTab,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    tableDepartmentFilter,
    tableDesignationFilter,
    tableShiftFilter,
    activeTab,
  ]);

  // Filter ex employees locally
  const getFilteredExEmployees = () => {
    const exList = Array.isArray(exEmployees) ? exEmployees : [];
    return exList
      .map((emp) => ({
        ...emp,
        rowKey: `ex-${emp.id}`,
        id: emp.id,
        employeeId: emp.employeeId || emp.id,
        name: emp.name,
        separationSource:
          emp.exit_type === "Resignation" ? "resignation" : "termination",
        terminationType: emp.exit_type,
        department: emp.department,
        designation: emp.postApplied || emp.designation,
        resignationDate: emp.exit_date,
        terminationDate: emp.exit_date,
        lastWorkingDay: emp.exit_date,
        reason: emp.exit_reason,
        phone: emp.phone || "-",
        employeeStatus: "Ex-Employee",
      }))
      .filter((employee) => {
        const matchesSearch =
          employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.designation
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = tableDepartmentFilter
          ? employee.department === tableDepartmentFilter
          : true;

        const matchesDesignation = tableDesignationFilter
          ? (employee.designation || employee.postApplied) ===
            tableDesignationFilter
          : true;

        return matchesSearch && matchesDepartment && matchesDesignation;
      });
  };

  const isExTab = activeTab === "ex";
  const filteredExData = isExTab ? getFilteredExEmployees() : [];

  const totalCount = isExTab ? filteredExData.length : totalItems;

  const totalPages = isExTab
    ? Math.ceil(filteredExData.length / entriesPerPage)
    : totalPagesState;

  const startIndex = (currentPage - 1) * entriesPerPage;

  const currentData = isExTab
    ? filteredExData.slice(startIndex, startIndex + entriesPerPage)
    : employees;

  const filteredData = isExTab ? filteredExData : { length: totalCount };

  // Accept Employee Function
  const handleAcceptEmployee = (employee) => {
    setEmployeeToAccept(employee);
    setShowAcceptConfirmation(true);
    setShowActionMenu(null);
  };
  const confirmAcceptEmployee = async (employee) => {
    if (!employee) return;

    setAccepting(true);

    try {
      // Optimistic UI update
      setAcceptedEmployees((prev) => new Set([...prev, employee.id]));

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id
            ? { ...emp, status: "Accepted", employeeStatus: "Permanent" }
            : emp,
        ),
      );
      setAllEmployeesForStats((prev) =>
        prev.map((emp) =>
          emp.id === employee.id
            ? { ...emp, status: "Accepted", employeeStatus: "Permanent" }
            : emp,
        ),
      );

      // 1️⃣ HRMS API
      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/${employee.id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 2️⃣ CSAAP API → Permanent
      await axios.put(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/update-employee/${employee.id}`,
        {
          employeeStatus: "Permanent",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ use same token
            "Content-Type": "application/json",
          },
        },
      );

      setSuccessMessage(`${employee.name} accepted successfully!`);
    } catch (error) {
      console.error("Error accepting employee:", error);

      // rollback (optional)
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id ? { ...emp, status: "Pending" } : emp,
        ),
      );
      setAllEmployeesForStats((prev) =>
        prev.map((emp) =>
          emp.id === employee.id ? { ...emp, status: "Pending" } : emp,
        ),
      );

      setSuccessMessage("Accepted locally (API failed).");
    } finally {
      setAccepting(false);
      setTimeout(() => {
        setSuccessMessage("");
      }, 1500);
    }
  };

  const cancelAcceptEmployee = () => {
    setShowAcceptConfirmation(false);
    setEmployeeToAccept(null);
  };

  // Termination handler with modal
  const handleTerminateClick = (employee) => {
    setShowTerminationForm(employee);
    setShowActionMenu(null);
  };

  const handleResignClick = (employee) => {
    setShowResignForm(employee);
    setShowActionMenu(null);
  };

  const handleResign = async (data) => {
    if (!canResign) {
      alert("You do not have permission to resign employees");
      return;
    }
    try {
      setResigning(true);
      const finalStatus =
        parseNoticeDays(data.noticePeriod) > 0
          ? "Notice Period"
          : "Ex-Employee";

      const payload = {
        employeeId: data.employeeId,
        company_id: companyScopeId,
        company_slug: slug,
        employee: showResignForm,
        resignationDate: data.resignationDate,
        date: data.resignationDate,
        lastWorkingDay: data.lastWorkingDay,
        reason: data.reason,
        remark: data.reason,
        noticePeriod: parseNoticeDays(data.noticePeriod),
        status: finalStatus,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/resignEmployee/resign`,
        payload,
      );

      if (res.data.success) {
        // 🔹 If immediate ex-employee, also delete from production Cloudsat
        if (finalStatus === "Ex-Employee") {
          try {
            await axios.delete(
              `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/delete-employee/${data.employeeId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            console.log("Deleted from Cloudsat production system");
          } catch (cloudErr) {
            console.error("Failed to delete from Cloudsat:", cloudErr);
          }
          setEmployees((prev) =>
            prev.filter((emp) => String(emp.id) !== String(data.employeeId)),
          );
          setAllEmployeesForStats((prev) =>
            prev.filter((emp) => String(emp.id) !== String(data.employeeId)),
          );
        }

        alert("Resignation processed successfully!");

        fetchEmployees();
        fetchResignedEmployees();

        setShowResignForm(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to process resignation");
    } finally {
      setResigning(false);
    }
  };
  // In your handleTerminate function in JobJoinedList component
  const handleTerminate = async (terminationData) => {
    if (!canTerminate) {
      alert("You do not have permission to terminate employees");
      return;
    }
    try {
      setTerminating(true);

      // ✅ decide status here
      const finalStatus =
        parseNoticeDays(terminationData.noticePeriod) > 0
          ? "Notice Period"
          : "Ex-Employee";

      const payload = {
        ...terminationData,
        company_id: companyScopeId,
        company_slug: slug,
        employee: showTerminationForm,
        status: finalStatus,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/terminate/terminate`,
        payload,
      );

      if (res.data.success) {
        // 🔹 If immediate ex-employee, also delete from production Cloudsat
        if (finalStatus === "Ex-Employee") {
          try {
            await axios.delete(
              `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/delete-employee/${terminationData.employeeId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            console.log("Deleted from Cloudsat production system");
          } catch (cloudErr) {
            console.error("Failed to delete from Cloudsat:", cloudErr);
          }
          setEmployees((prev) =>
            prev.filter(
              (emp) => String(emp.id) !== String(terminationData.employeeId),
            ),
          );
          setAllEmployeesForStats((prev) =>
            prev.filter(
              (emp) => String(emp.id) !== String(terminationData.employeeId),
            ),
          );
        }

        alert("Employee terminated successfully!");

        fetchEmployees(); // refresh list
        fetchTerminatedEmployees();
        setShowTerminationForm(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to terminate employee");
    } finally {
      setTerminating(false);
    }
  };

  const fetchTerminatedEmployees = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/terminate/${companyScopeId}`,
      );
      setTerminatedEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResignedEmployees = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/resignEmployee/${companyScopeId}`,
      );
      setResignedEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNoticeEmployees = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/notice-employee`,
        {
          params: {
            company_id: companyScopeId,
          },
        },
      );
      setNoticeEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotice = async (noticeData) => {
    if (!canNotice) {
      alert("You do not have permission to place employees on notice");
      return;
    }
    try {
      setNoticing(true);
      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/notice-employee/notice`,
        {
          ...noticeData,
          company_id: companyScopeId,
          company_slug: slug,
          employee: showNoticeForm,
        },
      );
      if (res.data.success) {
        alert("Employee put on notice successfully!");
        fetchEmployees();
        fetchNoticeEmployees();
        setShowNoticeForm(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to put employee on notice");
    } finally {
      setNoticing(false);
    }
  };

  useEffect(() => {
    if (!companyScopeId) return;
    fetchTerminatedEmployees();
    fetchResignedEmployees();
    fetchNoticeEmployees();
  }, [companyScopeId]);

  const handleDeleteEmployee = async (employee) => {
    if (!canDelete) {
      alert("You do not have permission to delete employees");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      // 🔹 Call production API (with token)
      await axios.delete(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/delete-employee/${employee.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ Update UI
      setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
      setAllEmployeesForStats((prev) =>
        prev.filter((emp) => emp.id !== employee.id),
      );
      setTerminatedEmployees((prev) =>
        prev.filter((emp) => emp.id !== employee.id),
      );

      // 🔥 Refresh terminated employees from backend
      await fetchTerminatedEmployees();

      setShowActionMenu(null);
      setSuccessMessage(`${employee.name} deleted successfully.`);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert(err.response?.data?.message || "Failed to delete employee");
    }
  };

  // Badge components
  const StatusBadge = ({ status, employeeId }) => {
    const isAccepted =
      acceptedEmployees.has(employeeId) || status === "Accepted";
    const isTerminated =
      status === "Terminated" ||
      (status && status.toLowerCase().includes("terminate"));

    if (isAccepted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-(--brand-soft) text-(--brand-strong) border border-(--border-strong) shadow-sm">
          <CheckCircle size={12} />
          Accepted
        </span>
      );
    }

    if (isTerminated) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
          <Trash2 size={12} />
          Terminated
        </span>
      );
    }

    if (status && status.toLowerCase().includes("notice")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
          <Bell size={12} />
          Notice Period
        </span>
      );
    }

    const statusConfig = {
      Joined:
        "bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)] border-[color:var(--border-strong)]",
      Probation: "bg-amber-50 text-amber-700 border border-amber-200",
      Onboarding: "bg-blue-50 text-blue-700 border border-blue-200",
      Accepted:
        "bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)] border-[color:var(--border-strong)]",
      Terminated: "bg-red-50 text-red-700 border border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm ${statusConfig[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
      >
        {status || "N/A"}
      </span>
    );
  };

  const JoinTypeBadge = ({ type }) => (
    <span className="inline-flex items-center px-2 py-0.5 bg-(--bg-subtle) text-(--text-soft) border border-(--border-soft) rounded text-xs font-semibold">
      {type}
    </span>
  );

  const fetchFilteredEmployeesForDownload = async () => {
    if (activeTab === "ex") {
      return filteredExData;
    }
    try {
      const params = getFilterParams();
      delete params.page;
      delete params.limit;
      const res = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/filter-employees`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.data) {
        const dataObj = res.data;
        if (Array.isArray(dataObj.data)) return dataObj.data;
        if (dataObj.data && Array.isArray(dataObj.data.employees))
          return dataObj.data.employees;
        if (Array.isArray(dataObj)) return dataObj;
        if (dataObj.employees && Array.isArray(dataObj.employees))
          return dataObj.employees;
      }
      return [];
    } catch (err) {
      console.error("Error fetching employees for download:", err);
      return [];
    }
  };

  // Download functions
  const downloadCSV = async () => {
    const list = await fetchFilteredEmployeesForDownload();
    const headers = [
      "Position",
      "Name",
      "Contact",
      "Email",
      "Gender",
      "Status",
      "Join Type",
      "Join Date",
    ];
    const rows = list.map((emp) => [
      emp.position,
      emp.name,
      emp.contact,
      emp.email,
      emp.gender,
      emp.status,
      emp.joinType,
      emp.joinDate,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "employees.csv");
  };

  const [showDocuments, setShowDocuments] = useState(false);

  const handleUploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const lines = event.target.result
        .split("\n")
        .filter((line) => line.trim() !== "");
      const newEmployees = lines.slice(1).map((line) => {
        const [
          position,
          name,
          contact,
          email,
          gender,
          status,
          joinType,
          joinDate,
        ] = line.split(",");
        return {
          position,
          name,
          contact,
          email,
          gender,
          status,
          joinType,
          joinDate,
        };
      });
      setEmployees((prev) => [...prev, ...newEmployees]);
    };
    reader.readAsText(file);
  };

  const downloadExcel = async () => {
    const list = await fetchFilteredEmployeesForDownload();
    const worksheet = XLSX.utils.json_to_sheet(list);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "employees.xlsx",
    );
  };

  const downloadPDF = async () => {
    const list = await fetchFilteredEmployeesForDownload();
    const doc = new jsPDF();
    const columns = [
      "Position",
      "Name",
      "Contact",
      "Email",
      "Gender",
      "Status",
      "Join Type",
      "Join Date",
    ];
    const rows = list.map((emp) => [
      emp.position,
      emp.name,
      emp.contact,
      emp.email,
      emp.gender,
      emp.status,
      emp.joinType,
      emp.joinDate,
    ]);
    autoTable(doc, { head: [columns], body: rows, startY: 20, theme: "grid" });
    doc.text("Employee List", 14, 15);
    doc.save("employees.pdf");
  };

  useEffect(() => {
    // Keep document.body overflow hidden to prevent the whole window/body from scrolling,
    // especially when absolute/portalled submenus or dropdowns are open.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Close the open action dropdown menus when any container scrolls
    const handleScroll = () => {
      setShowActionMenu(null);
    };
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  useEffect(() => {
    if (selectedEmployee && activePanel === "view")
      setTimeout(() => setAnimateView(true), 10);
    else setAnimateView(false);
  }, [selectedEmployee, activePanel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Stats calculations
  const totalAccepted = allEmployeesForStats.filter(
    (e) => acceptedEmployees.has(e.id) || e.status === "Accepted",
  ).length;
  const totalProbation = allEmployeesForStats.filter(
    (e) => e.employeeStatus === "Probation",
  ).length;
  const totalNotice = normalizedSeparatedEmployees.filter(
    (emp) => parseNoticeDays(emp.noticePeriod ?? emp.notice_period ?? 0) > 0,
  ).length;
  const totalEx = Array.isArray(exEmployees) ? exEmployees.length : 0;
  const totalPartTime = allEmployeesForStats.filter(
    (e) =>
      e.employeeStatus &&
      e.employeeStatus.toLowerCase().replace(/\s/g, "") === "parttime",
  ).length;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 4) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      let adjustedStart = start;
      let adjustedEnd = end;
      if (currentPage <= 4) {
        adjustedEnd = 5;
      } else if (currentPage >= totalPages - 3) {
        adjustedStart = totalPages - 4;
      }

      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      <div className="crm-module-root app-shell p-4 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="fixed top-4 right-4 bg-(--brand-strong) text-white px-6 py-3 rounded-xl shadow-lg z-50 font-bold animate-in fade-in slide-in-from-top-4 duration-300">
              {successMessage}
            </div>
          )}

          <div>
            <h1 className="app-title max-w-3xl">Job Joined List</h1>
            <p className="app-subtitle mt-1">
              Manage employees who have joined the company
            </p>
          </div>

          {/* Stats/KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Employees */}
            <div
              className={`app-panel p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                activeTab === "all"
                  ? "ring-2 ring-(--brand) bg-(--brand-soft) border-(--brand)"
                  : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                    Total Employees
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {allEmployeesForStats.length}
                  </div>
                  <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                    Active workforce
                  </p>
                </div>
                <div className="size-10 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                  <UserCheck className="size-5 text-(--brand)" />
                </div>
              </div>
            </div>

            {/* On Probation */}
            <div
              className={`app-panel p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                activeTab === "probation"
                  ? "ring-2 ring-(--brand) bg-(--brand-soft) border-(--brand)"
                  : ""
              }`}
              onClick={() => setActiveTab("probation")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                    On Probation
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {totalProbation}
                  </div>
                  <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                    Under review
                  </p>
                </div>
                <div className="size-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <Calendar className="size-5 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Notice Period */}
            <div
              className={`app-panel p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                activeTab === "notice"
                  ? "ring-2 ring-(--brand) bg-(--brand-soft) border-(--brand)"
                  : ""
              }`}
              onClick={() => setActiveTab("notice")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                    Notice Period
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {totalNotice}
                  </div>
                  <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                    Pending exit
                  </p>
                </div>
                <div className="size-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Bell className="size-5 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Part Time */}
            <div
              className={`app-panel p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                activeTab === "parttime"
                  ? "ring-2 ring-(--brand) bg-(--brand-soft) border-(--brand)"
                  : ""
              }`}
              onClick={() => setActiveTab("parttime")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                    Part Time
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {totalPartTime}
                  </div>
                  <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                    Flexible hours
                  </p>
                </div>
                <div className="size-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="size-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Ex Employees */}
            <div
              className={`app-panel p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                activeTab === "ex"
                  ? "ring-2 ring-(--brand) bg-(--brand-soft) border-(--brand)"
                  : ""
              }`}
              onClick={() => setActiveTab("ex")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                    Ex Employees
                  </p>
                  <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
                    {totalEx}
                  </div>
                  <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                    Separated list
                  </p>
                </div>
                <div className="size-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <UserMinus className="size-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="app-panel p-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap gap-3">
                {canCreate && (
                  <button
                    onClick={() => navigate(`${resolvedBasePath}/add-employee`)}
                    className="app-btn-primary flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Employee
                  </button>
                )}

                {canExport && (
                  <div className="relative inline-block" ref={dropdownRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDownloadDropdown(!showDownloadDropdown);
                      }}
                      className="app-btn-secondary flex items-center gap-2"
                    >
                      <Download size={16} /> Download{" "}
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${showDownloadDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showDownloadDropdown && (
                      <div className="app-floating absolute left-0 mt-2 w-56 rounded-xl z-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => {
                            downloadCSV();
                            setShowDownloadDropdown(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand-strong) transition-colors text-left"
                        >
                          <FileText size={16} className="text-blue-500" />
                          Download CSV Format
                        </button>
                        <button
                          onClick={() => {
                            downloadExcel();
                            setShowDownloadDropdown(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand-strong) transition-colors text-left"
                        >
                          <FileSpreadsheet
                            size={16}
                            className="text-green-500"
                          />
                          Download Excel
                        </button>
                        <button
                          onClick={() => {
                            downloadPDF();
                            setShowDownloadDropdown(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand-strong) transition-colors text-left"
                        >
                          <FileText size={16} className="text-red-500" />
                          Download PDF
                        </button>
                        <div className="h-px bg-(--border-soft) my-1 mx-2" />
                        <label className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand-strong) transition-colors cursor-pointer text-left">
                          <Upload size={16} className="text-purple-500" />
                          Upload CSV Format
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                              handleUploadCSV(e);
                              setShowDownloadDropdown(false);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Show employee table for employee-list tabs */}
          {[
            "all",
            "accepted",
            "confirm",
            "probation",
            "notice",
            "ex",
            "parttime",
          ].includes(activeTab) && (
            <>
              {/* Filters Panel */}
              <div className="app-panel p-4 mb-6">
                <div className="flex flex-col gap-4">
                  {/* Row 1 - Search & Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    {/* Search - wider and more prominent */}
                    <div className="relative flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Search by name, email, or employee ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="app-input w-full pl-9 pr-4 py-2.5 text-sm"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) w-4 h-4" />
                    </div>

                    {/* Action Buttons Group */}
                    <div className="flex items-center gap-2">
                      {/* Filter Button */}
                      <button
                        onClick={() => setShowFilterPanel((prev) => !prev)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          showFilterPanel ||
                          tableDepartmentFilter ||
                          tableDesignationFilter ||
                          tableShiftFilter
                            ? "bg-(--brand-soft) border-(--brand) text-(--brand-strong)"
                            : "bg-(--bg-panel-strong) border-(--border-soft) text-(--text-soft) hover:border-(--border-strong) hover:text-(--text-strong)"
                        } border`}
                      >
                        <Filter className="w-4 h-4" />
                        More Filters
                        {(tableDepartmentFilter ||
                          tableDesignationFilter ||
                          tableShiftFilter) && (
                          <span className="ml-0.5 w-5 h-5 bg-(--brand) text-white text-xs rounded-full inline-flex items-center justify-center">
                            {
                              [
                                tableDepartmentFilter,
                                tableDesignationFilter,
                                tableShiftFilter,
                              ].filter(Boolean).length
                            }
                          </span>
                        )}
                      </button>

                      {/* Reset Button - only show when filters active */}
                      {(searchTerm ||
                        statusFilter ||
                        tableDepartmentFilter ||
                        tableDesignationFilter ||
                        tableShiftFilter) && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("");
                            setTableDepartmentFilter("");
                            setTableDesignationFilter("");
                            setTableShiftFilter("");
                          }}
                          className="px-3.5 py-2.5 text-sm text-(--text-soft) hover:text-red-600 border border-(--border-soft) rounded-xl hover:bg-red-50 hover:border-red-200 transition-all font-bold"
                        >
                          Reset all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Row 2 - Filter Panel (animated) */}
                  {showFilterPanel && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-(--bg-subtle) rounded-xl border border-(--border-soft) mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Status Filter */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="app-label">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="app-input w-full px-3 py-2 text-sm"
                        >
                          <option value="">All Status</option>
                          <option value="Joined">Joined</option>
                          <option value="Probation">Probation</option>
                          <option value="Onboarding">Onboarding</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>

                      {/* Department Filter */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="app-label">Department</label>
                        <select
                          value={tableDepartmentFilter}
                          onChange={(e) =>
                            setTableDepartmentFilter(e.target.value)
                          }
                          className="app-input w-full px-3 py-2 text-sm"
                        >
                          <option value="">All Departments</option>
                          {Array.from(
                            new Set(
                              allEmployeesForStats
                                .map((e) => e.department)
                                .filter(Boolean),
                            ),
                          ).map((dep) => (
                            <option key={dep}>{dep}</option>
                          ))}
                        </select>
                      </div>

                      {/* Designation Filter */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="app-label">Designation</label>
                        <select
                          value={tableDesignationFilter}
                          onChange={(e) =>
                            setTableDesignationFilter(e.target.value)
                          }
                          className="app-input w-full px-3 py-2 text-sm"
                        >
                          <option value="">All Designations</option>
                          {Array.from(
                            new Set(
                              allEmployeesForStats
                                .map((e) => e.designation || e.postApplied)
                                .filter(Boolean),
                            ),
                          ).map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* Shift Filter */}
                      <div className="space-y-1.5 flex flex-col">
                        <label className="app-label">Shift</label>
                        <select
                          value={tableShiftFilter}
                          onChange={(e) => setTableShiftFilter(e.target.value)}
                          className="app-input w-full px-3 py-2 text-sm"
                        >
                          <option value="">All Shifts</option>
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                          <option value="Night">Night</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Optional: Active filter chips */}
                  {(tableDepartmentFilter ||
                    tableDesignationFilter ||
                    tableShiftFilter ||
                    statusFilter) &&
                    !showFilterPanel && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {statusFilter && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-(--brand-soft) text-(--brand-strong) rounded-full font-semibold border border-(--border-strong)">
                            Status: {statusFilter}
                            <button
                              onClick={() => setStatusFilter("")}
                              className="hover:text-red-600 font-bold ml-1"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {tableDepartmentFilter && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-(--brand-soft) text-(--brand-strong) rounded-full font-semibold border border-(--border-strong)">
                            Dept: {tableDepartmentFilter}
                            <button
                              onClick={() => setTableDepartmentFilter("")}
                              className="hover:text-red-600 font-bold ml-1"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {tableDesignationFilter && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-(--brand-soft) text-(--brand-strong) rounded-full font-semibold border border-(--border-strong)">
                            Designation: {tableDesignationFilter}
                            <button
                              onClick={() => setTableDesignationFilter("")}
                              className="hover:text-red-600 font-bold ml-1"
                            >
                              ×
                            </button>
                          </span>
                        )}
                        {tableShiftFilter && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-(--brand-soft) text-(--brand-strong) rounded-full font-semibold border border-(--border-strong)">
                            Shift: {tableShiftFilter}
                            <button
                              onClick={() => setTableShiftFilter("")}
                              className="hover:text-red-600 font-bold ml-1"
                            >
                              ×
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Table Panel */}
              <div className="app-panel overflow-hidden">
                <div className="app-section-bar px-4 py-3 flex justify-between items-center bg-white">
                  <h3 className="app-heading">
                    {activeTab === "ex" ? "Ex Employees" : "Active Employees"} (
                    {filteredData.length} total)
                  </h3>
                </div>
                <div className="max-h-150 overflow-auto custom-scrollbar">
                  {activeTab === "ex" ? (
                    <table className="min-w-full divide-y divide-(--border-soft)">
                      <thead className="bg-(--bg-subtle) sticky top-0 z-10 border-b border-(--border-soft)">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            S.No
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Emp ID
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Name
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Exit Type
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Department
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Designation
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Exit Date
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Reason
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Status
                          </th>
                          <th className="px-4 py-2.5 text-right text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-(--border-soft)">
                        {currentData.length > 0 ? (
                          currentData.map((employee, index) => (
                            <tr
                              key={employee.rowKey || employee.id}
                              className="hover:bg-(--bg-subtle)/70 transition-colors duration-200"
                            >
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-body)">
                               {startIndex + index + 1}
                              </td>
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-body)">
                                   {employee.registered_emp_id || "NA"}
                              </td>
                              <td className="px-4 py-3 text-[14px] font-bold text-(--text-strong)">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setActivePanel("view");
                                    setShowActionMenu(null);
                                  }}
                                  className="text-(--brand) hover:text-(--brand-strong) hover:underline focus:outline-none focus:underline font-bold text-left"
                                >
                                  {employee.name}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.separationSource === "resignation"
                                  ? "Resignation"
                                  : employee.terminationType || "Termination"}
                              </td>
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.department || "-"}
                              </td>
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.designation ||
                                  employee.postApplied ||
                                  "-"}
                              </td>
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.resignationDate ||
                                  employee.terminationDate ||
                                  employee.lastWorkingDay ||
                                  "-"}
                              </td>
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft) max-w-70">
                                <span className="line-clamp-2">
                                  {employee.reason || employee.remark || "-"}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
                                  Ex-Employee
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setActivePanel("view");
                                    setShowActionMenu(null);
                                  }}
                                  className="app-icon-button inline-flex items-center justify-center size-8 border border-(--border-soft) hover:bg-(--brand-soft) hover:border-(--brand) text-(--brand-strong) transition-all"
                                  title="View Full Details"
                                >
                                  <Eye className="size-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="px-6 py-24 text-center">
                              <Search className="size-8 mx-auto mb-3 text-(--text-faint) animate-bounce" />
                              <p className="text-[14px] font-bold text-(--text-strong)">
                                No ex-employees found
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-full divide-y divide-(--border-soft)">
                      <thead className="bg-(--bg-subtle) sticky top-0 z-10 border-b border-(--border-soft)">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            S.No
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Emp ID
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Name
                          </th>
                          {activeTab === "notice" && (
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                              Type
                            </th>
                          )}
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Department
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Designation
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Mobile No
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Mail ID
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Shift
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Status
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-(--border-soft)">
                        {currentData.length > 0 ? (
                          currentData.map((employee, index) => (
                            <tr
                              key={employee.rowKey || employee.id}
                              className="hover:bg-(--bg-subtle)/70 transition-colors duration-200"
                            >
                              {/* Serial Number */}
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-body)">
                                  {startIndex + index + 1}
                              </td>

                              {/* Employee ID */}
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-body)">
                               {employee.registered_emp_id || "NA"}
                              </td>

                              {/* Name */}
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      setActivePanel("view");
                                      setShowActionMenu(null);
                                    }}
                                    className="text-[14px] text-(--text-strong) hover:text-(--brand) hover:underline focus:outline-none focus:underline font-bold text-left"
                                    title={`View details for ${employee.name}`}
                                  >
                                    {employee.name}
                                  </button>
                                </div>
                              </td>

                              {/* Type (Notice Tab only) */}
                              {activeTab === "notice" && (
                                <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      employee.separationSource ===
                                      "resignation"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : employee.separationSource === "notice"
                                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                                          : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                  >
                                    {employee.separationSource === "resignation"
                                      ? "Resigned"
                                      : employee.separationSource === "notice"
                                        ? "Notice"
                                        : "Terminated"}
                                  </span>
                                </td>
                              )}

                              {/* Department */}
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.department || "-"}
                              </td>

                              {/* Designation */}
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.designation ||
                                  employee.postApplied ||
                                  "-"}
                              </td>

                              {/* Mobile */}
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.phone || "-"}
                              </td>

                              {/* Email */}
                              <td className="px-4 py-3 text-[13px] font-medium text-(--text-soft)">
                                {employee.email}
                              </td>

                              {/* Shift */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                                  {employee.employeeShift || "-"}
                                </span>
                              </td>

                              {/* Status Badge */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <StatusBadge
                                  status={
                                    employee.employeeStatus || employee.status
                                  }
                                  employeeId={employee.id}
                                />
                              </td>

                              {/* Table Actions */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {/* Edit Employee Button */}
                                  {/* Edit Employee Button */}
                                  {canEdit && (
                                    <button
                                      title="Edit Employee"
                                      className="app-icon-button flex items-center justify-center size-7 border border-(--border-soft) text-(--text-soft) hover:bg-(--brand-soft) hover:text-(--brand-strong) hover:border-(--border-strong) transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `${resolvedBasePath}/edit-candidate`,
                                          {
                                            state: {
                                              applicationId: employee.id,
                                            },
                                          },
                                        );
                                        setShowActionMenu(null);
                                      }}
                                    >
                                      <Pencil className="size-3.5" />
                                    </button>
                                  )}

                                  {/* Delete / Terminate Dropdown Button */}
                                  {(canDelete ||
                                    canResign ||
                                    canTerminate ||
                                    canNotice) && (
                                    <div className="relative inline-block">
                                      <button
                                        title="Delete / Terminate Options"
                                        className={`app-icon-button flex items-center justify-center size-7 border border-(--border-soft) ${
                                          showActionMenu?.id ===
                                          `del-${employee.id}`
                                            ? "bg-red-50 text-red-600 border-red-300"
                                            : "text-(--text-soft) hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                        } transition-all`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowActionMenu(
                                            showActionMenu?.id ===
                                              `del-${employee.id}`
                                              ? null
                                              : {
                                                  id: `del-${employee.id}`,
                                                  top:
                                                    e.currentTarget.getBoundingClientRect()
                                                      .bottom + window.scrollY,
                                                  left:
                                                    e.currentTarget.getBoundingClientRect()
                                                      .left + window.scrollX,
                                                },
                                          );
                                        }}
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>

                                      {showActionMenu?.id ===
                                        `del-${employee.id}` &&
                                        ReactDOM.createPortal(
                                          <div
                                            className="app-floating absolute z-50 w-48 rounded-xl py-1"
                                            style={{
                                              position: "absolute",
                                              top: showActionMenu.top + 4,
                                              left: Math.max(
                                                showActionMenu.left - 140,
                                                10,
                                              ),
                                            }}
                                          >
                                            {canDelete && (
                                              <button
                                                onClick={() => {
                                                  handleDeleteEmployee(
                                                    employee,
                                                  );
                                                  setShowActionMenu(null);
                                                }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 font-bold transition-all"
                                              >
                                                <Trash2 className="size-3.5" />{" "}
                                                Delete Employee
                                              </button>
                                            )}
                                            {canResign && (
                                              <button
                                                onClick={() => {
                                                  handleResignClick(employee);
                                                  setShowActionMenu(null);
                                                }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 font-bold transition-all"
                                              >
                                                <UserMinus className="size-3.5" />{" "}
                                                Resigned Employee
                                              </button>
                                            )}
                                            {canTerminate && (
                                              <button
                                                onClick={() => {
                                                  handleTerminateClick(
                                                    employee,
                                                  );
                                                  setShowActionMenu(null);
                                                }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 font-bold transition-all"
                                              >
                                                <XCircle className="size-3.5" />{" "}
                                                Terminate Employee
                                              </button>
                                            )}
                                            {canNotice && (
                                              <button
                                                onClick={() => {
                                                  setShowNoticeForm(employee);
                                                  setShowActionMenu(null);
                                                }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-bold transition-all"
                                              >
                                                <Bell className="size-3.5" />{" "}
                                                Notice Employee
                                              </button>
                                            )}
                                          </div>,
                                          document.body,
                                        )}
                                    </div>
                                  )}

                                  {/* Download Documents Dropdown Button */}
                                  {(canIdCard || canVisitingCard) && (
                                    <div className="relative inline-block">
                                      <button
                                        title="Download Documents"
                                        className={`app-icon-button flex items-center justify-center size-7 border border-(--border-soft) ${
                                          showActionMenu?.id ===
                                          `dl-${employee.id}`
                                            ? "bg-(--brand-soft) text-(--brand-strong) border-(--brand)"
                                            : "text-(--text-soft) hover:bg-(--brand-soft) hover:text-(--brand-strong) hover:border-(--border-strong)"
                                        } transition-all`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowActionMenu(
                                            showActionMenu?.id ===
                                              `dl-${employee.id}`
                                              ? null
                                              : {
                                                  id: `dl-${employee.id}`,
                                                  top:
                                                    e.currentTarget.getBoundingClientRect()
                                                      .bottom + window.scrollY,
                                                  left:
                                                    e.currentTarget.getBoundingClientRect()
                                                      .left + window.scrollX,
                                                },
                                          );
                                        }}
                                      >
                                        <Download className="size-3.5" />
                                      </button>

                                      {showActionMenu?.id ===
                                        `dl-${employee.id}` &&
                                        ReactDOM.createPortal(
                                          <div
                                            className="app-floating absolute z-50 w-44 rounded-xl py-1"
                                            style={{
                                              position: "absolute",
                                              top: showActionMenu.top + 4,
                                              left: Math.max(
                                                showActionMenu.left - 130,
                                                10,
                                              ),
                                            }}
                                          >
                                            {canIdCard && (
                                              <button
                                                onClick={() => {
                                                  navigate(
                                                    `/hrms/download-idcard`,
                                                    {
                                                      state: {
                                                        applicationId:
                                                          employee.id,
                                                      },
                                                    },
                                                  );
                                                  setShowActionMenu(null);
                                                }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand-strong) font-bold transition-all"
                                              >
                                                <CreditCard className="size-3.5" />{" "}
                                                Identity Card
                                              </button>
                                            )}
                                            {canVisitingCard && (
                                              <button
                                                onClick={() => {
                                                  navigate(
                                                    `/hrms/download-visitingcard`,
                                                    {
                                                      state: {
                                                        applicationId:
                                                          employee.id,
                                                      },
                                                    },
                                                  );
                                                  setShowActionMenu(null);
                                                }}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand-strong) font-bold transition-all"
                                              >
                                                <Building className="size-3.5" />{" "}
                                                Visiting Card
                                              </button>
                                            )}
                                          </div>,
                                          document.body,
                                        )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="11" className="px-6 py-24 text-center">
                              <Search className="size-8 mx-auto mb-3 text-(--text-faint)" />
                              <p className="text-[14px] font-bold text-(--text-strong)">
                                No employees found
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                <div className="app-section-bar px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-sm text-(--text-soft) mb-4 sm:mb-0 font-medium">
                    Showing{" "}
                    <span className="font-bold text-(--text-strong)">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-(--text-strong)">
                      {Math.min(
                        startIndex + entriesPerPage,
                        filteredData.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-(--text-strong)">
                      {filteredData.length}
                    </span>{" "}
                    entries
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      className="size-8 rounded-lg text-(--text-soft) hover:bg-(--brand-soft) hover:text-(--brand-strong) flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} strokeWidth={2} />
                    </button>

                    {getPageNumbers().map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="size-8 text-(--text-faint) text-xs font-semibold flex items-center justify-center cursor-default select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      const isActive = page === currentPage;
                      return (
                        <button
                          key={`page-${page}`}
                          onClick={() => setCurrentPage(page)}
                          className={
                            isActive
                              ? "size-8 bg-(--brand-soft) text-(--brand-strong) border border-(--brand) rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-default"
                              : "size-8 rounded-lg text-(--text-soft) hover:bg-(--brand-soft) hover:text-(--brand-strong) text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                          }
                          disabled={isActive}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      className="size-8 rounded-lg text-(--text-soft) hover:bg-(--brand-soft) hover:text-(--brand-strong) flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Conditional rendering for other tabs */}
          {activeTab === "certificate" && (
            <div className="app-panel p-4">
              <Experiencecertificate />
            </div>
          )}
          {activeTab === "terminate" && (
            <div className="app-panel p-4">
              <TerminateEmployee />
            </div>
          )}

          {/* Termination Form Modal */}
          {showTerminationForm && (
            <TerminationFormModal
              employee={showTerminationForm}
              onClose={() => setShowTerminationForm(null)}
              onTerminate={handleTerminate}
              terminating={terminating}
            />
          )}

          {showResignForm && (
            <ResignationFormModal
              employee={showResignForm}
              onClose={() => setShowResignForm(null)}
              onResign={handleResign}
              resigning={resigning}
            />
          )}

          {showNoticeForm && (
            <NoticeFormModal
              employee={showNoticeForm}
              onClose={() => setShowNoticeForm(null)}
              onNotice={handleNotice}
              noticing={noticing}
            />
          )}

          {/* Other modals */}
          {selectedEmployee && activePanel === "view" && (
            <ViewModal
              employee={selectedEmployee}
              onClose={() => {
                setAnimateView(false);
                setTimeout(() => setSelectedEmployee(null), 500);
              }}
              animateView={animateView}
            />
          )}

          {selectedEmployee && activePanel === "update" && (
            <UpdateModal
              employee={selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
            />
          )}

          {showDocuments && (
            <ViewEmployeeDocuments
              employee={selectedEmployee}
              onClose={() => setShowDocuments(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Accept Confirmation Modal Component
const AcceptConfirmationModal = ({
  employee,
  onConfirm,
  onCancel,
  accepting,
}) => {
  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="app-modal max-w-md w-full p-6">
        <div className="flex items-center justify-center size-12 bg-(--brand-soft) border border-(--border-strong) rounded-2xl mx-auto mb-4">
          <UserCheck className="size-6 text-(--brand)" />
        </div>

        <h3 className="modal-title text-center mb-2">Accept Employee</h3>

        <p className="text-(--text-soft) text-center text-sm mb-6">
          Are you sure you want to accept{" "}
          <span className="font-bold text-(--text-strong)">
            {employee.name}
          </span>{" "}
          as an employee?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="app-btn-secondary flex-1 flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={accepting}
            className="app-btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <svg
                  className="animate-spin size-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3 3-3 3v4a8 8 0 01-8-8z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={16} /> Accept
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Termination Form Modal Component
const TerminationFormModal = ({
  employee,
  onClose,
  onTerminate,
  terminating,
}) => {
  const [terminationType, setTerminationType] = useState("Terminated");
  const [date, setDate] = useState("");
  const [remark, setRemark] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("0");

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      alert("Please select a termination date.");
      return;
    }
    if (!remark.trim()) {
      alert("Please enter a remark.");
      return;
    }

    const terminationData = {
      employeeId: employee.id,
      terminationType,
      date,
      remark,
      noticePeriod: Number(noticePeriod) || 0,
    };

    if (
      window.confirm(
        `Are you sure you want to terminate ${employee.name}? This action cannot be undone.`,
      )
    ) {
      onTerminate(terminationData);
    }
  };

  return (
    <div
      className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="app-modal max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-(--border-soft) bg-white">
          <h2 className="modal-title">Terminate Employee</h2>
          <button
            onClick={onClose}
            className="app-icon-button p-1.5 text-(--text-soft) hover:bg-red-50 hover:text-red-600 transition-colors"
            disabled={terminating}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar"
        >
          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Termination Type</label>
            <select
              value={terminationType}
              onChange={(e) => setTerminationType(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              disabled={terminating}
            >
              <option value="Terminated">Terminated</option>
              <option value="Resigned">Resigned</option>
              <option value="Retired">Retired</option>
              <option value="Contract Ended">Contract Ended</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Termination Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              required
              disabled={terminating}
            />
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Remark / Reason</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              rows="3"
              placeholder="Enter reason for termination..."
              required
              disabled={terminating}
            />
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Notice Period (Days)</label>
            <input
              type="number"
              min="0"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              placeholder="Enter notice period in days"
              disabled={terminating}
            />
            <span className="modal-helper mt-1">
              Enter `0` to move employee directly to Ex-Employee. More than `0`
              will show in Notice Period.
            </span>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-(--border-soft) bg-white">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary flex-1 max-w-30 flex items-center justify-center"
              disabled={terminating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={terminating}
              className={`flex-1 max-w-37.5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all ${
                terminating
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 active:scale-[0.98]"
              }`}
            >
              {terminating ? (
                <>
                  <svg
                    className="animate-spin size-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3 3-3 3v4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" /> Terminate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Modal Component
const ViewModal = ({ employee, onClose, animateView }) => (
  <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center">
    <div
      className={`app-modal w-full h-full rounded-none shadow-lg overflow-y-auto transform transition-all duration-500 ease-out flex flex-col bg-(--bg-elevated) ${animateView ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-(--border-soft) sticky top-0 bg-white z-10">
        <h2 className="modal-title">View Employee Details</h2>
        <button
          className="app-icon-button p-2 text-(--text-soft) hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <ViewJobApplication
          employeeId={employee.id}
          employeeData={employee}
          onClose={onClose}
        />
      </div>
    </div>
  </div>
);

// Update Modal Component
const UpdateModal = ({ employee, onClose }) => (
  <div className="app-modal-backdrop fixed inset-0 z-50 flex flex-col overflow-y-auto">
    <div className="app-modal w-full max-w-4xl mx-auto my-4 shadow-lg flex flex-col min-h-screen">
      <div className="flex justify-between items-center p-4 top-0 bg-white z-10 rounded-t-2xl">
        <button
          className="app-icon-button p-2 text-(--text-soft) hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
        <div className="bg-white rounded-xl">
          <CandidateDetailsUpdate employee={employee} onClose={onClose} />
        </div>
      </div>
    </div>
  </div>
);

// Resignation Form Modal Component
const ResignationFormModal = ({ employee, onClose, onResign, resigning }) => {
  const [resignationDate, setResignationDate] = useState("");
  const [lastWorkingDay, setLastWorkingDay] = useState("");
  const [reason, setReason] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("0");

  // Set default dates
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setResignationDate(today);
    // Default last working day = today + 15 days
    const defaultLastDay = new Date();
    defaultLastDay.setDate(defaultLastDay.getDate() + 15);
    setLastWorkingDay(defaultLastDay.toISOString().split("T")[0]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resignationDate) {
      alert("Please select a resignation date.");
      return;
    }
    if (!lastWorkingDay) {
      alert("Please select the last working day.");
      return;
    }
    if (!reason.trim()) {
      alert("Please enter a reason for resignation.");
      return;
    }

    const resignationData = {
      employeeId: employee.id,
      resignationDate,
      lastWorkingDay,
      reason,
      noticePeriod: Number(noticePeriod) || 0,
    };

    if (
      window.confirm(
        `Are you sure you want to process resignation for ${employee.name}?`,
      )
    ) {
      onResign(resignationData);
    }
  };

  return (
    <div
      className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="app-modal max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-(--border-soft) bg-white">
          <h2 className="modal-title">Resign Employee</h2>
          <button
            onClick={onClose}
            className="app-icon-button p-1.5 text-(--text-soft) hover:bg-orange-50 hover:text-orange-600 transition-colors"
            disabled={resigning}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar"
        >
          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Resignation Date</label>
            <input
              type="date"
              value={resignationDate}
              onChange={(e) => setResignationDate(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              required
              disabled={resigning}
            />
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Last Working Day</label>
            <input
              type="date"
              value={lastWorkingDay}
              onChange={(e) => setLastWorkingDay(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              required
              disabled={resigning}
            />
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Notice Period (Days)</label>
            <input
              type="number"
              min="0"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              placeholder="Enter notice period in days"
              disabled={resigning}
            />
            <span className="modal-helper mt-1">
              Notice period in days (will affect employee status)
            </span>
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Reason for Resignation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              rows="3"
              placeholder="Please provide reason for resignation..."
              required
              disabled={resigning}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-(--border-soft) bg-white">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary flex-1 max-w-30 flex items-center justify-center"
              disabled={resigning}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resigning}
              className={`flex-1 max-w-45 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all ${
                resigning
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 active:scale-[0.98]"
              }`}
            >
              {resigning ? (
                <>
                  <svg
                    className="animate-spin size-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3 3-3 3v4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <UserMinus className="size-4" /> Confirm Resignation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Notice Form Modal Component
const NoticeFormModal = ({ employee, onClose, onNotice, noticing }) => {
  const [noticeType, setNoticeType] = useState("Notice");
  const [date, setDate] = useState("");
  const [remark, setRemark] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("0");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      alert("Please select a notice date.");
      return;
    }
    if (!remark.trim()) {
      alert("Please enter a remark.");
      return;
    }

    const noticeData = {
      employeeId: employee.id,
      noticeType,
      date,
      remark,
      noticePeriod: Number(noticePeriod) || 0,
    };

    if (
      window.confirm(`Are you sure you want to put ${employee.name} on notice?`)
    ) {
      onNotice(noticeData);
    }
  };

  return (
    <div
      className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="app-modal max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-(--border-soft) bg-white">
          <h2 className="modal-title">Notice Employee</h2>
          <button
            onClick={onClose}
            className="app-icon-button p-1.5 text-(--text-soft) hover:bg-blue-50 hover:text-blue-600 transition-colors"
            disabled={noticing}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar"
        >
          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Notice Type</label>
            <select
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              disabled={noticing}
            >
              <option value="Notice">General Notice</option>
              <option value="Warning">Warning Notice</option>
              <option value="Performance">Performance Notice</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Notice Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              required
              disabled={noticing}
            />
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Notice Period (Days)</label>
            <input
              type="number"
              min="0"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              placeholder="Enter notice period in days"
              disabled={noticing}
            />
          </div>

          <div className="flex flex-col">
            <label className="modal-label mb-1.5">Remark / Reason</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="app-input w-full p-2.5 text-sm"
              rows="3"
              placeholder="Enter reason for notice..."
              required
              disabled={noticing}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-(--border-soft) bg-white">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary flex-1 max-w-30 flex items-center justify-center"
              disabled={noticing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={noticing}
              className={`flex-1 max-w-37.5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all ${noticing ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"}`}
            >
              {noticing ? "Processing..." : "Set Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobJoinedList;
