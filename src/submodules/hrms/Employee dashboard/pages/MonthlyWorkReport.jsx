import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../../hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";


const getProjectKey = (projectId, projectBranch) =>
  `${projectId ?? ""}::${(projectBranch || "").trim().toLowerCase()}`;

const isProjectManagerAssignment = (assignment) => {
  const globalRoleAssigned = (assignment.globalrole_assigned || "").toLowerCase();
  const globalRole = (assignment.assigned_global_role || "").trim().toLowerCase();

  return globalRoleAssigned === "yes" && globalRole === "manager";
};

const normalizeDepartment = (value = "") => value.trim().toLowerCase();

const getEmployeeRecordId = (employee) =>
  employee?.id ?? employee?.employee_id ?? employee?.employeeid ?? employee?.employeeProfileId;

const readActiveProject = () => {
  try {
    return JSON.parse(sessionStorage.getItem("activeProject") || "null");
  } catch {
    return null;
  }
};

const MonthlyWorkReport = () => {
  const [searchParams] = useSearchParams();
  const requestedMonth = searchParams.get("month") || "";
  const requestedYear = searchParams.get("year") || new Date().getFullYear();
  const shouldOpenForm = searchParams.get("openForm") === "1";

  const [showForm, setShowForm] = useState(shouldOpenForm);
  const [editingReport, setEditingReport] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [formData, setFormData] = useState({
    month: requestedMonth,
    year: requestedYear,
    description: '',
    nextMonthPlan: ''
  });
  const { user, token, companyId } = useAuth();
  console.log(user);

  const slug = user?.slug;
  const employeeId = user?.employeeProfileId || user?.id;

  const roleName = user?.role || "";
  const normalizedRole = roleName.toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const isHrManager = normalizedRole === "hr manager";
  const isDepartmentReviewer =
    normalizedRole === "hr" ||
    normalizedRole === "manager" ||
    normalizedRole.includes("manager");
  const canViewAllReports = isAdmin || isHrManager;


  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;
  const SUPERADMIN_API_BASE = import.meta.env.VITE_ACCOUNTING_URL;

  const [reports, setReports] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [employeeProjectOptions, setEmployeeProjectOptions] = useState([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState("");
  const [managedProjectKeys, setManagedProjectKeys] = useState([]);
  const [departmentEmployeeIds, setDepartmentEmployeeIds] = useState([]);
  const [projectScopeLoading, setProjectScopeLoading] = useState(false);
  const [projectScopeLoaded, setProjectScopeLoaded] = useState(false);
  const isProjectApprovalManager = managedProjectKeys.length > 0;
  const hasDepartmentReportScope = departmentEmployeeIds.length > 0;
  const canUseAdminReportView =
    canViewAllReports || isProjectApprovalManager || hasDepartmentReportScope;


  useEffect(() => {
    const fetchProjects = async () => {
      const activeCompanyId = companyId || user?.company_id;
      try {
        const csaapToken = token;

        if (!csaapToken || !activeCompanyId) {
          console.error("No authorization token or company ID found");
          setProjectScopeLoaded(true);
          return;
        }

        setProjectScopeLoading(true);
        setProjectScopeLoaded(false);

        const headers = { Authorization: `Bearer ${csaapToken}` };


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

        const transformedProjects = projectsData
          .map((project) => {
            const branch = project.project_code || "custom_project";
            return {
              key: getProjectKey(project.id, branch),
              id: project.id,
              name: project.project_name || project.name || "Unnamed Project",
              branch: branch,
              role: null,
              property_type: branch,
              location: [project?.locality, project?.city].filter(Boolean).join(", "),
            };
          })
          .filter((project) => project && project.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setEmployeeProjectOptions(transformedProjects);


        if (employeeId) {
          try {
            const [employeesRes, assignmentsRes] = await Promise.all([
              axios
                .get(`${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`, { headers })
                .catch(() => ({ data: [] })),
              axios
                .get(`${import.meta.env.VITE_CSAAP_URL}/api/tenant/project-assignments`, { headers })
                .catch(() => ({ data: { data: [] } })),
            ]);

            const managerKeys = new Set();
            const employees = employeesRes.data?.data || employeesRes.data || [];
            const currentEmployee = employees.find(
              (employee) => String(getEmployeeRecordId(employee)) === String(employeeId)
            );
            const currentDepartment = normalizeDepartment(
              currentEmployee?.department || user?.department || ""
            );
            const departmentIds =
              isDepartmentReviewer && !canViewAllReports && currentDepartment
                ? employees
                  .filter(
                    (employee) =>
                      normalizeDepartment(employee?.department || "") === currentDepartment
                  )
                  .map((employee) => String(getEmployeeRecordId(employee)))
                  .filter(Boolean)
                : [];

            const allAssignments = assignmentsRes.data?.data || assignmentsRes.data || [];

            transformedProjects.forEach((project) => {
              const assignments = allAssignments.filter(
                (a) =>
                  String(a.projectid) === String(project.id) &&
                  String(a.projectbranch || "").trim().toLowerCase() === String(project.branch).trim().toLowerCase()
              );

              assignments.forEach((assignment) => {
                if (isProjectManagerAssignment(assignment)) {
                  managerKeys.add(getProjectKey(project.id, project.branch));
                }
              });
            });

            setManagedProjectKeys(Array.from(managerKeys));
            setDepartmentEmployeeIds(Array.from(new Set(departmentIds)));
          } catch (error) {
            console.error("Error loading manager assignments", error);
            setManagedProjectKeys([]);
            setDepartmentEmployeeIds([]);
          }
        }

        setSelectedProjectKey((currentKey) => {
          if (currentKey && transformedProjects.some((project) => project.key === currentKey)) {
            return currentKey;
          }

          const activeProject = readActiveProject();
          const activeProjectKey = getProjectKey(activeProject?.id, activeProject?.branch);
          const activeMatch = transformedProjects.find((project) => project.key === activeProjectKey);

          return activeMatch?.key || transformedProjects[0]?.key || "";
        });

        if (transformedProjects.length === 0) {
          console.warn("No projects found");
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        setEmployeeProjectOptions([]);
        setManagedProjectKeys([]);
        setDepartmentEmployeeIds([]);
      } finally {
        setProjectScopeLoading(false);
        setProjectScopeLoaded(true);
      }
    };

    fetchProjects();
  }, [companyId, user?.company_id, employeeId, token, user?.department, isDepartmentReviewer, canViewAllReports]);

  useEffect(() => {
    const fetchMissingNames = async () => {

      const missingNameIds = [...new Set(reports
        .filter(r => {
          const id = r.employee_id || r.employeeId;
          const name = r.name || r.employee_name || r.emp_name;
          return !name && id && !employeeMap[id];
        })
        .map(r => r.employee_id || r.employeeId))];

      if (missingNameIds.length === 0) return;

      const newEntries = {};
      await Promise.all(missingNameIds.map(async (id) => {
        try {
          const res = await axios.get(`${process.env.VITE_HRMS_BASE_URL}/api/tenant/hrms/get-employee/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          const empData = res.data.data ?? res.data;
          if (empData) {
            newEntries[id] = {
              name: empData.name || empData.fullName || empData.employee_name || "Unknown",
              department: empData.department || empData.dept_name || "N/A"
            };
          }
        } catch (error) {
          console.error(`Error fetching employee ${id} from Cloudsat API:`, error.response?.data || error.message);
        }
      }));

      if (Object.keys(newEntries).length > 0) {
        setEmployeeMap(prev => ({ ...prev, ...newEntries }));
      }
    };

    if (canUseAdminReportView && reports.length > 0) {
      fetchMissingNames();
    }
  }, [reports, token, canUseAdminReportView, employeeMap]);

  const formatMonthlyReports = (data = []) =>
    data.map((r) => ({
      ...r,
      nextMonthPlan: r.nextMonthPlan ?? r.next_month_plan ?? "",
      submittedOn: r.submittedOn ?? r.submitted_on ?? null,
    }));

  useEffect(() => {
    const fetchReports = async () => {
      if (!slug || !employeeId) return;
      try {

        const endpoint = canUseAdminReportView
          ? `${API_BASE}/api/monthly-reports/${slug}/admin/all`
          : `${API_BASE}/api/monthly-reports/${slug}/employee/${employeeId}`;

        const res = await axios.get(endpoint);
        const formatted = formatMonthlyReports(res.data);
        setReports(formatted);
      } catch (error) {
        console.error("Error fetching reports", error);
      }
    };

    if (!slug || !employeeId) return;
    if (!canViewAllReports && !projectScopeLoaded) return;

    fetchReports();
  }, [API_BASE, slug, employeeId, canViewAllReports, canUseAdminReportView, projectScopeLoaded]);



  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026];

  const selectedReportProject =
    employeeProjectOptions.find((project) => project.key === selectedProjectKey) || null;

  const getReportProjectPayload = () => ({
    project_id: selectedReportProject?.id || null,
    project_name: selectedReportProject?.name || null,
    project_branch: selectedReportProject?.branch || null,
  });

  const isReportInManagerScope = (report) => {
    if (canViewAllReports) return true;

    const reportEmployeeId = report.employee_id || report.employeeId;
    if (departmentEmployeeIds.includes(String(reportEmployeeId))) {
      return true;
    }

    const reportProjectId = report.project_id || report.projectid;
    const reportProjectBranch = report.project_branch || report.projectbranch;

    if (reportProjectId && reportProjectBranch) {
      return managedProjectKeys.includes(getProjectKey(reportProjectId, reportProjectBranch));
    }

    return false;
  };

  const canReviewReport = (report) =>
    canUseAdminReportView &&
    !isHrManager &&
    report.status === "pending" &&
    String(report.employee_id || report.employeeId) !== String(employeeId) &&
    isReportInManagerScope(report);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  const resetForm = () => {
    setFormData({
      month: '',
      year: new Date().getFullYear(),
      description: '',
      nextMonthPlan: ''
    });
    setEditingReport(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingReport && employeeProjectOptions.length > 0 && !selectedReportProject) {
      Swal.fire("Error", "Please select the project for this monthly report", "error");
      return;
    }

    const projectPayload = getReportProjectPayload();

    try {

      if (editingReport) {

        await axios.put(
          `${API_BASE}/api/monthly-reports/${slug}/update/${editingReport.id}`,
          {
            ...formData,
            ...projectPayload
          }
        );

        setReports((prev) =>
          prev.map((r) =>
            r.id === editingReport.id
              ? { ...r, ...formData, ...projectPayload }
              : r
          )
        );
        Swal.fire("Success", "Report updated successfully", "success");

      } else {

        await axios.post(
          `${API_BASE}/api/monthly-reports/${slug}/create`,
          {
            employee_id: employeeId,
            ...formData,
            ...projectPayload
          }
        );

        Swal.fire("Success", "Report submitted successfully", "success");
      }

      resetForm();


      const refreshEndpoint = canUseAdminReportView
        ? `${API_BASE}/api/monthly-reports/${slug}/admin/all`
        : `${API_BASE}/api/monthly-reports/${slug}/employee/${employeeId}`;

      const res = await axios.get(
        refreshEndpoint
      );

      setReports(formatMonthlyReports(res.data));

    } catch (error) {

      Swal.fire(
        "Error",
        error.response?.data?.error || "Failed to submit report",
        "error"
      );

    }
  };


  const handleDelete = async (id) => {

    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {

      await axios.delete(
        `${API_BASE}/api/monthly-reports/${slug}/delete/${id}`
      );

      setReports((prev) => prev.filter((r) => r.id !== id));

      Swal.fire("Deleted", "Report deleted successfully", "success");

    } catch (error) {

      Swal.fire(
        "Error",
        error.response?.data?.error || "Failed to delete report",
        "error"
      );

    }
  };

  const handleReview = async (reportId, status) => {
    const report = reports.find((item) => item.id === reportId);
    const reportProjectId = report.project_id || report.projectid;
    const reportProjectBranch = report.project_branch || report.projectbranch;
    const reportProjectKey = getProjectKey(reportProjectId, reportProjectBranch);


    const isDirectProjectManager = managedProjectKeys.includes(reportProjectKey);

    if (reportProjectId && !isDirectProjectManager) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "You are not this project manager. Only the assigned project manager can approve or reject this report.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }


    if (!reportProjectId && report?.projectManager && user?.name !== report.projectManager) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: `You are not this project manager. Only the assigned manager (${report.projectManager}) can approve/reject this report.`,
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!report || !canReviewReport(report)) {
      Swal.fire("Error", "You can only review pending monthly reports from projects where you are assigned as Manager.", "error");
      return;
    }

    const { value: comment } = await Swal.fire({
      title: `Review Report`,
      text: `Are you sure you want to ${status} this report?`,
      input: 'textarea',
      inputPlaceholder: 'Add an optional comment...',
      showCancelButton: true,
      confirmButtonText: status.charAt(0).toUpperCase() + status.slice(1),
      confirmButtonColor: status === 'approved' ? '#10b981' : '#ef4444'
    });

    if (comment !== undefined) {
      try {
        await axios.put(`${API_BASE}/api/monthly-reports/${slug}/admin/review/${reportId}`, {
          status,
          adminComment: comment,
          reviewedBy: employeeId,
          reviewedByName: user?.name,
          reviewedByRole: user?.role
        }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setReports(prev => prev.map(r =>
          r.id === reportId ? { ...r, status, adminComment: comment } : r
        ));

        Swal.fire("Success", `Report ${status} successfully`, "success");
      } catch (error) {
        Swal.fire("Error", error.response?.data?.error || "Review failed", "error");
      }
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    const reportProjectId = report.project_id || report.projectid;
    const reportProjectBranch = report.project_branch || report.projectbranch;

    if (reportProjectId && reportProjectBranch) {
      setSelectedProjectKey(getProjectKey(reportProjectId, reportProjectBranch));
    }

    setFormData({
      month: report.month,
      year: report.year,
      description: report.description,
      nextMonthPlan: report.nextMonthPlan ?? report.next_month_plan ?? ""
    });
    setShowForm(true);
  };





  const toggleExpand = (id) => {
    setExpandedRows({
      ...expandedRows,
      [id]: !expandedRows[id]
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Project', 'Branch', 'Month', 'Year', 'Status', 'Submitted On', 'Description', 'Next Month Plan'];
    const csvData = scopedReports.map(report => [
      report.project_name || '',
      report.project_branch || '',
      report.month,
      report.year,
      report.status,
      report.submittedOn,
      report.description,
      report.nextMonthPlan
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };




  const scopedReports = canUseAdminReportView
    ? reports.filter((report) => isReportInManagerScope(report))
    : reports;

  const stats = {
    total: scopedReports.length,
    pending: scopedReports.filter(r => r.status === 'pending').length,
    approved: scopedReports.filter(r => r.status === 'approved').length,
    rejected: scopedReports.filter(r => r.status === 'rejected').length
  };


  const displayedReports = scopedReports.filter(r => {
    const id = r.employee_id || r.employeeId;
    const name = r.name || r.employee_name || r.emp_name || (id ? employeeMap[id]?.name : "") || "";
    const department = r.department || r.dept || (id ? employeeMap[id]?.department : "") || "";
    const projectName = r.project_name || "";
    const projectBranch = r.project_branch || "";

    const matchesSearch = canUseAdminReportView
      ? (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectBranch.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesMonth = filterMonth ? r.month === filterMonth : true;
    const matchesYear = filterYear ? String(r.year) === String(filterYear) : true;

    return matchesSearch && matchesMonth && matchesYear;
  });



  const viewMonthlyReportDetails = (report) => {
    const isAdminReviewable = canReviewReport(report);

    Swal.fire({
      title: `<div class="flex items-center gap-2 text-slate-800 text-base font-bold"><i class="lucide-file-text w-4 h-4 text-blue-600"></i> Monthly Work Report</div>`,
      html: `
        <div class="text-left space-y-4 p-1">
          ${canUseAdminReportView ? `
          <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
            <div>
              <label class="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Employee</label>
              <div class="text-slate-900 text-sm font-bold truncate">${report.name || report.employee_name || employeeMap[report.employee_id || report.employeeId]?.name || "Unknown"}</div>
            </div>
            <div>
              <label class="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Department</label>
              <div class="text-slate-900 text-sm font-semibold">${report.department || report.dept || employeeMap[report.employee_id || report.employeeId]?.department || "N/A"}</div>
            </div>
          </div>` : ''}

          ${(report.project_name || report.project_branch) ? `
          <div class="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-4">
            <label class="text-[10px] uppercase font-bold text-blue-500 block mb-1 tracking-wider">Project</label>
            <div class="text-blue-900 text-sm font-bold">${report.project_name || "Project"}${report.project_branch ? ` - ${report.project_branch}` : ""}</div>
          </div>` : ''}

          <div class="space-y-4">
            <div class="p-4 bg-white rounded-xl border border-slate-200">
              <label class="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">Work Description / Accomplishment</label>
              <div class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">${report.description || "No description provided"}</div>
            </div>

            ${report.nextMonthPlan ? `
            <div class="p-4 bg-white rounded-xl border border-slate-200">
              <label class="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">Next Month Plan</label>
              <div class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">${report.nextMonthPlan}</div>
            </div>` : ''}
          </div>

          ${report.adminComment ? `
          <div class="p-3 bg-yellow-50/50 rounded-xl border border-yellow-100 mt-2">
            <label class="text-[10px] uppercase font-bold text-yellow-600 block mb-1 tracking-wider italic">Admin Feedback</label>
            <p class="text-yellow-800 text-xs italic leading-relaxed">"${report.adminComment}"</p>
          </div>` : ''}
          
          <div class="pt-2 flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-widest border-t border-slate-100 mt-4">
             <span class="flex items-center gap-1.5">Status: <b class="${report.status === 'approved' ? 'text-emerald-600' : report.status === 'rejected' ? 'text-rose-600' : 'text-amber-500'} bg-white px-2 py-0.5 rounded shadow-sm border border-slate-50">${report.status}</b></span>
             <span>ID: #${report.id} • ${report.submittedOn ? new Date(report.submittedOn).toLocaleDateString() : '-'}</span>
          </div>
        </div>
      `,
      showCancelButton: canUseAdminReportView,
      showDenyButton: canUseAdminReportView,
      showConfirmButton: true,
      confirmButtonText: canUseAdminReportView ? 'Approve ✅' : 'Close',
      denyButtonText: 'Reject ❌',
      cancelButtonText: 'Cancel',
      confirmButtonColor: canUseAdminReportView ? '#059669' : '#334155',
      denyButtonColor: '#DC2626',
      width: '38rem',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-slate-200',
        confirmButton: 'px-5 py-2 rounded-lg font-bold text-sm',
        denyButton: 'px-5 py-2 rounded-lg font-bold text-sm',
        cancelButton: 'px-5 py-2 rounded-lg font-bold text-sm'
      }
    }).then((result) => {
      if (canUseAdminReportView) {
        if (result.isConfirmed) {
          handleReview(report.id, "approved");
        } else if (result.isDenied) {
          handleReview(report.id, "rejected");
        }
      }
    });
  };

  return (
    <div className="space-y-4 font-sans bg-transparent">

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap items-center gap-3">
          {canUseAdminReportView && (
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee or dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-(--border-soft) rounded-xl text-sm focus:ring-2 focus:ring-(--brand-ring) outline-none w-64 bg-white"
              />
            </div>
          )}

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-(--border-soft) rounded-xl text-sm bg-white focus:ring-2 focus:ring-(--brand-ring) outline-none text-(--text-body) font-semibold cursor-pointer"
          >
            <option value="">All Months</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-(--border-soft) rounded-xl text-sm bg-white focus:ring-2 focus:ring-(--brand-ring) outline-none text-(--text-body) font-semibold cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="bg-white border border-(--border-soft) text-(--text-body) hover:bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all text-sm shadow-sm"
          >
            <Download size={18} className="text-(--text-soft)" />
            Export CSV
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-linear-to-r from-(--brand) to-(--brand-strong) text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-95 font-bold transition-all text-sm shadow-sm shadow-(--brand)/10"
          >
            <Plus size={18} />
            Add Monthly Report
          </button>
        </div>
      </div>


      <AnimatePresence mode="wait">
        <motion.div
          key="monthly"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-2xl border border-(--border-soft) shadow-[0_4px_20px_-4px_rgba(0,166,81,0.05)] overflow-hidden p-6 space-y-6">

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="bg-(--brand-soft) p-2.5 rounded-xl border border-(--border-strong) shrink-0">
                    <FileText size={20} className="text-(--brand)" />
                  </div>
                  <div>
                    <p className="text-[22px] font-extrabold text-(--text-strong) leading-tight">{stats.total}</p>
                    <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">Total Reports</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="bg-[#fffbeb] p-2.5 rounded-xl border border-[#fef3c7] shrink-0">
                    <Clock size={20} className="text-[#d97706]" />
                  </div>
                  <div>
                    <p className="text-[22px] font-extrabold text-[#d97706] leading-tight">{stats.pending}</p>
                    <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">Pending</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="bg-(--brand-soft) p-2.5 rounded-xl border border-(--border-strong) shrink-0">
                    <CheckCircle size={20} className="text-(--brand-strong)" />
                  </div>
                  <div>
                    <p className="text-[22px] font-extrabold text-(--brand-strong) leading-tight">{stats.approved}</p>
                    <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">Approved</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-(--border-soft) shadow-[0_2px_8px_rgba(0,166,81,0.02)] flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="bg-[#fef2f2] p-2.5 rounded-xl border border-[#fecaca] shrink-0">
                    <XCircle size={20} className="text-[#ef4444]" />
                  </div>
                  <div>
                    <p className="text-[22px] font-extrabold text-[#ef4444] leading-tight">{stats.rejected}</p>
                    <p className="text-[10px] font-extrabold text-(--text-soft) uppercase tracking-wider">Rejected</p>
                  </div>
                </div>
              </div>


              {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl border border-(--border-soft) shadow-[0_8px_32px_rgba(0,166,81,0.08)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="border-b border-(--border-soft) px-6 py-4 flex items-center justify-between bg-(--bg-app)">
                      <h2 className="text-base font-bold text-(--text-strong)">
                        {editingReport ? 'Edit Monthly Report' : 'Add Monthly Work Report'}
                      </h2>
                      <button
                        onClick={resetForm}
                        className="text-slate-400 hover:text-slate-600 text-2xl font-semibold transition-all p-1"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-(--text-soft) uppercase tracking-wider mb-2">
                            Month *
                          </label>
                          <select
                            name="month"
                            value={formData.month}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-(--border-soft) rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-(--brand-ring) font-semibold cursor-pointer text-(--text-body)"
                          >
                            <option value="">Select Month</option>
                            {months.map(month => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-(--text-soft) uppercase tracking-wider mb-2">
                            Year *
                          </label>
                          <select
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-(--border-soft) rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-(--brand-ring) font-semibold cursor-pointer text-(--text-body)"
                          >
                            {years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-bold text-(--text-soft) uppercase tracking-wider mb-2">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows="4"
                          className="w-full px-4 py-2 border border-(--border-soft) rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--brand-ring) text-(--text-body) leading-relaxed placeholder-slate-400"
                          placeholder="Describe your work, achievements, and challenges this month..."
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-xs font-bold text-(--text-soft) uppercase tracking-wider mb-2">
                          Next Month Plan
                        </label>
                        <textarea
                          name="nextMonthPlan"
                          value={formData.nextMonthPlan}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-(--border-soft) rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--brand-ring) text-(--text-body) leading-relaxed placeholder-slate-400"
                          placeholder="Your plans for next month..."
                        />
                      </div>

                      <div className="flex justify-end gap-3 border-t border-(--border-soft) pt-4">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 border border-(--border-soft) rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-all text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-linear-to-r from-(--brand) to-(--brand-strong) text-white font-bold rounded-xl hover:opacity-95 shadow-sm shadow-(--brand)/10 transition-all text-sm"
                        >
                          {editingReport ? 'Update Report' : 'Submit Report'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}


              <div className="bg-white rounded-xl border border-(--border-soft) overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-(--border-soft)">
                  <thead className="bg-(--bg-app)">
                    <tr>
                      {canUseAdminReportView && (
                        <th className="px-6 py-3 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                          Employee
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                        Month/Year
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                        Submitted On
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-(--border-soft)">
                    {displayedReports.map((report) => {
                      return (
                        <React.Fragment key={report.id}>
                          <tr className="hover:bg-(--bg-app)/40 transition-colors">
                            {canUseAdminReportView && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-(--text-strong)">
                                  {report.name || report.employee_name || report.emp_name || employeeMap[report.employee_id || report.employeeId]?.name || "Loading..."}
                                
                                
                                </div>
                                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                                  {report.department || report.dept || employeeMap[report.employee_id || report.employeeId]?.department || "N/A"}
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <button
                                  onClick={() => toggleExpand(report.id)}
                                  className="mr-2 text-(--brand) hover:text-(--brand-strong)"
                                >
                                  {expandedRows[report.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <div>
                                  <div className="text-sm font-semibold text-(--text-body)">
                                    {report.month} {report.year}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-(--text-body)">
                                {report.project_name || "-"}
                              </div>
                              {report.project_branch && (
                                <div className="text-[11px] font-medium text-slate-400">{report.project_branch}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full flex items-center gap-1 w-fit ${getStatusBadge(report.status)}`}>
                                {getStatusIcon(report.status)}
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                              {report.submittedOn
                                ? new Date(report.submittedOn).toLocaleDateString()
                                : "-"}
                             </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => viewMonthlyReportDetails(report)}
                                  title="View Detailed Monthly Report"
                                  className="p-1.5 bg-(--brand-soft) text-(--brand) border border-(--border-strong) hover:bg-(--brand) hover:text-white rounded-lg transition-all shadow-sm"
                                >
                                  <Eye size={16} />
                                </button>


                                {canUseAdminReportView && (
                                  <>
                                    <button
                                      onClick={() => handleReview(report.id, "approved")}
                                      disabled={!canReviewReport(report)}
                                      className={`p-1.5 rounded-lg border transition-all ${
                                        !canReviewReport(report)
                                          ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white shadow-sm'
                                      }`}
                                      title={!canReviewReport(report) ? (report.status !== "pending" ? "Already reviewed" : String(report.employee_id || report.employeeId) === String(employeeId) ? "Self-approval not allowed" : "Scope restricted") : "Approve Report"}
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleReview(report.id, "rejected")}
                                      disabled={!canReviewReport(report)}
                                      className={`p-1.5 rounded-lg border transition-all ${
                                        !canReviewReport(report)
                                          ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                                          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white shadow-sm'
                                      }`}
                                      title={!canReviewReport(report) ? (report.status !== "pending" ? "Already reviewed" : String(report.employee_id || report.employeeId) === String(employeeId) ? "Self-rejection not allowed" : "Scope restricted") : "Reject Report"}
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}


                                {(String(report.employee_id || report.employeeId) === String(employeeId) || !canUseAdminReportView) && (
                                  <>
                                    <button
                                      onClick={() => handleEdit(report)}
                                      disabled={report.status !== "pending"}
                                      title={
                                        report.status !== "pending"
                                          ? "Edit not allowed after approval or rejection"
                                          : "Edit report"
                                      }
                                      className={`p-1.5 rounded-lg border transition-all ${
                                        report.status !== "pending"
                                          ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                                          : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm'
                                      }`}
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(report.id)}
                                      disabled={report.status !== "pending"}
                                      title={
                                        report.status !== "pending"
                                          ? "Delete not allowed after approval or rejection"
                                          : "Delete report"
                                      }
                                      className={`p-1.5 rounded-lg border transition-all ${
                                        report.status !== "pending"
                                          ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                                          : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white shadow-sm'
                                      }`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                             </td>
                          </tr>


                          {expandedRows[report.id] && (
                            <tr className="bg-(--bg-app)/60">
                              <td colSpan={canUseAdminReportView ? 6 : 5} className="px-6 py-4">
                                <div className="bg-white border border-(--border-soft) p-4 rounded-xl space-y-4 shadow-sm">
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-soft) mb-1">Description / Accomplishments:</h4>
                                    <p className="text-sm text-(--text-body) leading-relaxed whitespace-pre-wrap">{report.description}</p>
                                  </div>

                                  {report.nextMonthPlan && (
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-soft) mb-1">Next Month Plan:</h4>
                                      <p className="text-sm text-(--text-body) leading-relaxed whitespace-pre-wrap">{report.nextMonthPlan}</p>
                                    </div>
                                  )}

                                  {report.adminComment && (
                                    <div className="mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">Admin Feedback:</h4>
                                      <p className="text-sm text-amber-900 leading-relaxed italic">"{report.adminComment}"</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {displayedReports.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-(--brand-soft) border border-(--border-strong) rounded-xl flex items-center justify-center mx-auto mb-4 ring-4 ring-[#f0fdf4]">
                      <FileText size={32} className="text-(--brand)" />
                    </div>
                    <h3 className="text-sm font-bold text-(--text-strong) mb-1">No reports found</h3>
                    <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto">
                      {canUseAdminReportView
                        ? "No reports found in your project approval scope"
                        : 'Click the "Add Monthly Report" button to create your first report'}
                    </p>
                  </div>
                )}
              </div>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MonthlyWorkReport;