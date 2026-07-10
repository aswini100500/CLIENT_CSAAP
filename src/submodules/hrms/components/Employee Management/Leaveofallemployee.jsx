import axios from "axios";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  Loader2,
  Search,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import React from "react";

const LeaveManagementofEmployee = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
  const [showLeaveReasonModal, setShowLeaveReasonModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate, entriesPerPage]);

  const { user } = useAuth();
  const slug = user?.slug;
  console.log(user);

  const csaapToken = user.token;









































  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {

      const empRes = await axios.get(
        "https://csaapnodeapi.csaap.com/api/tenant/hrms/all-employees",
        {
          headers: {
            Authorization: `Bearer ${csaapToken}`,
          },
        },
      );

      const employees = empRes.data?.data || [];


      const employeeMap = {};
      employees.forEach((emp) => {
        employeeMap[emp.id] = emp.name;
      });


      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/${slug}`,
      );

      const leavesArray = res.data?.data || [];


      const formatted = leavesArray.map((leave) => ({
        ...leave,
        employeeName: employeeMap[leave.employee_id] || "Unknown",
        fromDate: leave.start_date
          ? new Date(leave.start_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "",
        fromDateRaw: leave.start_date || null,
        toDate: leave.end_date
          ? new Date(leave.end_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "",
        toDateRaw: leave.end_date || null,
        days: leave.leave_days || 0,
        leaveType: leave.leave_type || "-",
        reason: leave.reason || "-",
        status: leave.status || "-",
        rejectReason: leave.reject_reason || null,
      }));

      setLeaveRequests(formatted);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leave) => {
    if (window.confirm(`Approve ${leave.employeeName}?`)) {
      try {
        await axios.put(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/status/${leave.id}`,
          { status: "Approved" },
        );
        await fetchLeaveRequests();
      } catch (error) {
        console.error("Error approving leave:", error);
      }
    }
  };

  const handleRejectClick = (leave) => {
    setSelectedLeave(leave);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/status/${selectedLeave.id}`,
        {
          status: "Rejected",
          reject_reason: rejectReason,
        },
      );

      setShowRejectModal(false);
      setSelectedLeave(null);
      setRejectReason("");
      await fetchLeaveRequests();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Failed to reject leave request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (leave) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${leave.employeeName}'s leave request? This action cannot be undone.`,
      )
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/${leave.id}`,
        );
        await fetchLeaveRequests();
      } catch (error) {
        console.error("Error deleting leave:", error);
        alert("Failed to delete leave request. Please try again.");
      }
    }
  };

  const handleViewRejectReason = (leave) => {
    setSelectedLeave(leave);
    setShowRejectReasonModal(true);
  };

  const handleViewLeaveReason = (leave) => {
    setSelectedLeave(leave);
    setShowLeaveReasonModal(true);
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };


  const matchesDateRange = (leave) => {
    if (!startDate && !endDate) return true;

    const leaveStartDate = leave.fromDateRaw;
    if (!leaveStartDate) return false;

    const compareStart = startDate ? leaveStartDate >= startDate : true;
    const compareEnd = endDate ? leaveStartDate <= endDate : true;

    return compareStart && compareEnd;
  };


  const filteredLeaves = leaveRequests.filter((leave) => {
    const matchesSearch =
      leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || leave.status?.toLowerCase() === statusFilter;

    const matchesDate = matchesDateRange(leave);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredLeaves.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedLeaves = filteredLeaves.slice(
    startIndex,
    startIndex + entriesPerPage,
  );


  const StatusBadge = ({ status }) => {
    const getStatusConfig = () => {
      switch (status?.toLowerCase()) {
        case "approved":
          return {
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            border: "border-emerald-200",
            icon: CheckCircle,
            label: "Approved",
          };
        case "rejected":
          return {
            bg: "bg-rose-50",
            text: "text-rose-700",
            border: "border-rose-200",
            icon: XCircle,
            label: "Rejected",
          };
        case "pending":
          return {
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
            icon: Clock,
            label: "Pending",
          };
        default:
          return {
            bg: "bg-slate-50",
            text: "text-slate-700",
            border: "border-slate-200",
            icon: AlertCircle,
            label: status || "Pending",
          };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, bgClass, iconClass }) => (
    <div className="app-panel p-3 flex items-center gap-3 transition-all">
      <div className={`p-2 rounded-xl border shrink-0 ${bgClass}`}>
        <Icon className={`w-4 h-4 ${iconClass}`} />
      </div>
      <div>
        <p className="text-xl font-black text-(--text-strong) leading-tight">{value}</p>
        <p className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="app-shell flex min-h-[calc(100vh-100px)] items-center justify-center font-sans p-4">
        <div className="space-y-4 text-center animate-in fade-in duration-200">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-(--brand)" />
          <div>
            <h3 className="text-sm font-black text-(--text-strong) leading-tight">
              Loading Leave Requests
            </h3>
            <p className="mt-1 text-[13px] font-medium text-(--text-soft)">
              Please wait while we sync leave entries
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
          <StatCard
            icon={CalendarDays}
            label="Total Requests"
            value={leaveRequests.length}
            bgClass="bg-(--brand-soft) border-(--border-soft)"
            iconClass="text-(--brand)"
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={
              leaveRequests.filter((l) => l.status?.toLowerCase() === "pending")
                .length
            }
            bgClass="bg-amber-50 border-amber-100"
            iconClass="text-amber-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Approved Entries"
            value={
              leaveRequests.filter(
                (l) => l.status?.toLowerCase() === "approved",
              ).length
            }
            bgClass="bg-emerald-50 border-emerald-100"
            iconClass="text-emerald-600"
          />
          <StatCard
            icon={XCircle}
            label="Rejected Entries"
            value={
              leaveRequests.filter(
                (l) => l.status?.toLowerCase() === "rejected",
              ).length
            }
            bgClass="bg-rose-50 border-rose-100"
            iconClass="text-rose-600"
          />
        </div>


        <div className="app-panel p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">

              <div className="relative flex items-center rounded-xl border border-(--border-soft) bg-white px-3 transition-all focus-within:border-(--brand) focus-within:ring-4 focus-within:ring-(--brand-ring)">
                <span className="text-[13px] font-medium text-(--text-soft) mr-2">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="h-9 appearance-none bg-transparent pr-8 text-[13px] font-medium text-(--text-body) outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 pointer-events-none text-(--text-faint)" />
              </div>


              <div className="relative flex items-center rounded-xl border border-(--border-soft) bg-white px-3 transition-all focus-within:border-(--brand) focus-within:ring-4 focus-within:ring-(--brand-ring)">
                <Filter className="w-4 h-4 text-(--text-faint) mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 appearance-none bg-transparent pr-8 text-[13px] font-medium text-(--text-body) outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 pointer-events-none text-(--text-faint)" />
              </div>
            </div>


            <div className="flex flex-wrap items-center gap-3">

              <div className="flex flex-wrap items-center gap-2 bg-(--bg-subtle)/70 p-1.5 rounded-xl border border-(--border-soft)">
                <div className="flex items-center gap-1.5 px-2">
                  <Calendar className="w-4 h-4 text-(--text-faint)" />
                  <span className="text-[13px] font-medium text-(--text-body)">
                    Start Date:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="app-input px-2.5 py-1 text-[13px] bg-white border border-(--border-soft) rounded-lg outline-none"
                    placeholder="From"
                  />
                  <span className="text-gray-500">—</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="app-input px-2.5 py-1 text-[13px] bg-white border border-(--border-soft) rounded-lg outline-none"
                    placeholder="To"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={clearDateFilters}
                    className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>


              <div className="relative min-w-64">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, type, reason..."
                  className="app-input w-full px-4 py-2 pl-11 text-[13px]"
                />
              </div>
            </div>
          </div>


          {(startDate || endDate) && (
            <div className="mt-3 pt-2 border-t border-(--border-soft)">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-(--text-soft)">
                  Active date filter:
                </span>
                {startDate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    From: {new Date(startDate).toLocaleDateString()}
                  </span>
                )}
                {endDate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    To: {new Date(endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>


        <div className="app-panel overflow-hidden">
          <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Employee
                      </th>
                      <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Leave Period
                      </th>
                      <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Days
                      </th>
                      <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Type
                      </th>
                      <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Reason
                      </th>
                      <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Status
                      </th>
                      <th className="border-b border-(--border-soft) px-5 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {paginatedLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Calendar className="w-10 h-10 text-(--text-faint)" />
                            <p className="text-sm font-bold text-(--text-soft)">
                              No leave requests found
                            </p>
                            {(searchTerm ||
                              statusFilter !== "all" ||
                              startDate ||
                              endDate) && (
                              <p className="text-xs text-(--text-faint)">
                                Try adjusting your filters
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedLeaves.map((leave) => (
                        <tr
                          key={leave.id}
                          className="border-b border-(--bg-subtle) hover:bg-(--bg-subtle)/70 transition-colors"
                        >
                          <td className="px-5 py-3.5 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl border border-(--border-soft) bg-(--bg-subtle) flex items-center justify-center text-xs font-bold text-(--brand)">
                                {String(leave.employeeName || "?").charAt(0)}
                              </div>
                              <span className="text-[14px] font-bold text-(--text-strong)">
                                {leave.employeeName}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <div className="text-sm font-semibold text-slate-900">
                              {leave.fromDate}
                              <span className="text-slate-400 mx-1.5">→</span>
                              {leave.toDate}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <span className="text-sm font-bold text-slate-900">
                              {leave.days} {leave.days === 1 ? "day" : "days"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <span className="text-sm font-semibold text-slate-600">
                              {leave.leaveType}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <p className="max-w-xs truncate text-sm font-medium text-slate-600" title={leave.reason}>
                              {leave.reason}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <StatusBadge status={leave.status} />
                          </td>
                          <td className="px-5 py-3.5 align-middle">
                            <div className="flex items-center justify-center gap-1.5">

                              <button
                                onClick={() => handleViewLeaveReason(leave)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="View full leave reason"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {leave.status?.toLowerCase() === "rejected" &&
                                leave.rejectReason && (
                                  <button
                                    onClick={() =>
                                      handleViewRejectReason(leave)
                                    }
                                    className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="View rejection reason"
                                  >
                                    <AlertCircle className="w-4 h-4" />
                                  </button>
                                )}

                              {leave.status?.toLowerCase() === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(leave)}
                                    className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(leave)}
                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleDelete(leave)}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>


              <div className="app-section-bar px-6 py-4 border-t border-(--border-soft)">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-[13px] font-medium text-(--text-soft)">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + entriesPerPage,
                      filteredLeaves.length,
                    )}{" "}
                    of {filteredLeaves.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="app-btn-secondary min-h-0 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm bg-(--brand-soft) text-(--brand) border border-(--border-soft) rounded-lg">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="app-btn-secondary min-h-0 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
        </div>
      </div>


      {showRejectModal && selectedLeave && (
        <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="app-modal w-full max-w-md overflow-hidden flex flex-col">

            <div className="flex items-center justify-between px-5 py-3 border-b border-(--border-soft) bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-(--text-strong) leading-tight">
                    Reject Leave Request
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                    {selectedLeave.employeeName} • {selectedLeave.leaveType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedLeave(null);
                  setRejectReason("");
                }}
                className="app-icon-button inline-flex h-8 w-8 items-center justify-center border-(--border-soft) bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>


            <div className="px-5 py-4 overflow-y-auto space-y-3 bg-(--bg-subtle)/45 flex-1 custom-scrollbar">
              <div className="app-panel p-4 bg-white border border-(--border-soft)">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="app-input w-full px-3 py-2 text-sm resize-none focus:ring-4 focus:ring-red-100 border border-(--border-soft) rounded-lg outline-none"
                  placeholder="Please provide detailed reason for rejection..."
                  autoFocus
                />
              </div>
            </div>


            <div className="px-5 py-3 border-t border-(--border-soft) bg-white flex justify-end gap-3 shrink-0">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedLeave(null);
                  setRejectReason("");
                }}
                className="app-btn-secondary min-h-0 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  "Reject Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {showLeaveReasonModal && selectedLeave && (
        <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="app-modal w-full max-w-md overflow-hidden flex flex-col">

            <div className="flex items-center justify-between px-5 py-3 border-b border-(--border-soft) bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-(--text-strong) leading-tight">
                    Leave Reason
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                    {selectedLeave.employeeName} • {selectedLeave.leaveType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLeaveReasonModal(false);
                  setSelectedLeave(null);
                }}
                className="app-icon-button inline-flex h-8 w-8 items-center justify-center border-(--border-soft) bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>


            <div className="px-5 py-4 overflow-y-auto space-y-3 bg-(--bg-subtle)/45 flex-1 custom-scrollbar">
              <div className="app-panel px-4 py-3 border border-emerald-100 bg-white">
                <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-snug">
                  {selectedLeave.reason}
                </p>
              </div>
            </div>


            <div className="px-5 py-3 border-t border-(--border-soft) bg-white flex justify-end shrink-0">
              <button
                onClick={() => {
                  setShowLeaveReasonModal(false);
                  setSelectedLeave(null);
                }}
                className="app-btn-secondary min-h-0 px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {showRejectReasonModal && selectedLeave && (
        <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="app-modal w-full max-w-md overflow-hidden flex flex-col">

            <div className="flex items-center justify-between px-5 py-3 border-b border-(--border-soft) bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-sm shrink-0">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-(--text-strong) leading-tight">
                    Rejection Reason
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                    {selectedLeave.employeeName} • {selectedLeave.leaveType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRejectReasonModal(false);
                  setSelectedLeave(null);
                }}
                className="app-icon-button inline-flex h-8 w-8 items-center justify-center border-(--border-soft) bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>


            <div className="px-5 py-4 overflow-y-auto space-y-3 bg-(--bg-subtle)/45 flex-1 custom-scrollbar">
              <div className="app-panel px-4 py-3 border border-rose-100 bg-white">
                <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-snug">
                  {selectedLeave.rejectReason || "No reason specified."}
                </p>
              </div>
            </div>


            <div className="px-5 py-3 border-t border-(--border-soft) bg-white flex justify-end shrink-0">
              <button
                onClick={() => {
                  setShowRejectReasonModal(false);
                  setSelectedLeave(null);
                }}
                className="app-btn-secondary min-h-0 px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementofEmployee;
