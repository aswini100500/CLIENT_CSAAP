import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { usePermission } from "../../../hooks/usePermission";
import useAuth from "../../../hooks/useAuth";

const EmployeeServiceReq = () => {
  // State management
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewRequest, setSelectedViewRequest] = useState(null);
  const [employeeMap, setEmployeeMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  const { has } = usePermission();

  // Get user from Redux
  const { user, token: authToken } = useAuth();
  const token = authToken;

  // Extract company data with fallbacks
  const slug = user?.slug;
  const company_id = user?.company_id || user?.id;

  // Debug logs
  console.log("Admin User:", user);
  console.log("Slug:", slug);
  console.log("Company ID:", company_id);

  // Show snackbar message
  const showSnackbar = (message, type = "success") => {
    setSnackbar({ show: true, message, type });
    setTimeout(
      () => setSnackbar({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  // Fetch employee names from external API
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const empData = response.data?.data || response.data || [];
      setEmployees(empData);
      const mapping = {};
      empData.forEach((emp) => {
        mapping[emp.id || emp.employee_id] = emp.name;
      });
      setEmployeeMap(mapping);

        const uniqueDepts = [
          ...new Set(empData.map((e) => e.department).filter(Boolean)),
        ];
        setDepartmentsList(uniqueDepts);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, [token]);

  // Fetch all service requests for the company
  const fetchAllRequests = useCallback(async () => {
    if (!slug) {
      setError("Company slug missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/company-search?company_id=${company_id}&slug=${slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        console.log("API Response Data:", response.data.data);
        // Debug: Check if reply_details exists in any request
        response.data.data.forEach((req, index) => {
          console.log(`Request ${index + 1}:`, {
            id: req.id,
            has_reply: !!req.reply_details,
            reply_details: req.reply_details,
            status: req.status
          });
        });
        
        setRequests(response.data.data);
        showSnackbar("Requests loaded successfully");
      } else {
        setError("Failed to load requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(error.response?.data?.message || "Failed to fetch requests");
      showSnackbar("Error loading requests", "error");
    } finally {
      setLoading(false);
    }
  }, [slug, token, company_id]);

  // Initial fetch
  useEffect(() => {
    if (slug) {
      fetchEmployees();
      fetchAllRequests();
    }
  }, [slug, fetchAllRequests, fetchEmployees]);

  // Apply filters whenever filter criteria or requests change
  useEffect(() => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.request_type
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.request_details
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.request_to
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.assigned_employee_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (request.employee_name || employeeMap[request.employee_id])
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(request.employee_id).includes(searchTerm) ||
          (request.reply_details &&
            request.reply_details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Department filter (by Requester's Department)
    if (departmentFilter !== "All") {
      filtered = filtered.filter((request) => {
        const emp = employees.find(
          (e) => String(e.id) === String(request.employee_id),
        );
        return emp?.department === departmentFilter;
      });
    }

    // Priority filter
    if (priorityFilter !== "All") {
      filtered = filtered.filter(
        (request) => request.priority === priorityFilter,
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return requestDate >= startDate && requestDate <= endDate;
      });
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [
    requests,
    searchTerm,
    statusFilter,
    departmentFilter,
    priorityFilter,
    dateRange,
    employees,
    employeeMap,
  ]);

  const handleUpdateStatus = async (id, newStatus, reply = null) => {
    if (!has("hrms.message.service_request.fulfill")) {
      showSnackbar("Access Denied: You do not have permission to fulfill service requests.", "error");
      return;
    }
    try {
      console.log("=== ADMIN UPDATE DEBUG ===");
      console.log("Request ID:", id);
      console.log("Admin Slug:", slug);
      console.log("New Status:", newStatus);
      console.log("Reply Text:", reply);
      
      const payload = {
        slug,
        status: newStatus,
        reply_details: reply || "Updated by admin",
      };

      console.log("Sending payload:", payload);

      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/update-status/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("Update response:", response.data);

      if (response.data.success) {
        await fetchAllRequests();
        setShowReplyModal(false);
        setSelectedRequest(null);
        setReplyText("");
        showSnackbar(`Status updated to ${newStatus}`, "success");
      } else {
        showSnackbar(response.data.message || "Failed to update", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error response:", error.response?.data);
      showSnackbar(
        error.response?.data?.message || "Failed to update request status",
        "error"
      );
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      showSnackbar("Please enter a reply", "error");
      return;
    }
    await handleUpdateStatus(
      selectedRequest.id,
      selectedRequest.status,
      replyText,
    );
  };

  const handleDeleteRequest = async (id) => {
    if (!has("hrms.message.service_request.fulfill")) {
      showSnackbar("Access Denied: You do not have permission to delete service requests.", "error");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete this service request? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/${id}`,
        {
          params: { slug },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        showSnackbar("Service request deleted successfully");
        fetchAllRequests();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to delete service request",
        "error",
      );
    }
  };

  const openReplyModal = (request) => {
    setSelectedRequest(request);
    setReplyText("");
    setShowReplyModal(true);
  };

  const openViewModal = (request) => {
    setSelectedViewRequest(request);
    setReplyText(request.reply_details || "");
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get unique values for filters
  const priorities = ["All", "High", "Medium", "Low"];
  const statuses = ["All", "Pending", "In Progress", "Completed", "Rejected"];

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    inProgress: requests.filter((r) => r.status === "In Progress").length,
    completed: requests.filter((r) => r.status === "Completed").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
    highPriority: requests.filter((r) => r.priority === "High").length,
  };

  return (
    <div className="font-sans">
      {/* Snackbar Notification */}
      {snackbar.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn ${
            snackbar.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {snackbar.type === "success" ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            )}
          </svg>
          <span>{snackbar.message}</span>
        </div>
      )}

      <div className="w-full">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <button
              onClick={fetchAllRequests}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div> */}
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">{filteredRequests.length}</span> of{" "}
              <span className="font-medium">{requests.length}</span> requests
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setDepartmentFilter("All");
                setPriorityFilter("All");
                setDateRange({ start: "", end: "" });
              }}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        )}

        {/* Requests Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Dept / Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg
                            className="w-16 h-16 mb-4 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div className="text-lg font-medium text-gray-500 mb-2">
                            No requests found
                          </div>
                          <p className="text-sm text-gray-400">
                            No service requests match your filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {request.employee_name?.charAt(0) || "E"}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.employee_name ||
                                  employeeMap[request.employee_id] ||
                                  `Employee #${request.employee_id}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {request.employee_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {request.request_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.request_to}
                          </div>
                          {request.assigned_employee_name && (
                            <div className="text-xs text-purple-600 font-medium flex items-center gap-1 mt-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              {request.assigned_employee_name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {request.reply_details ? (
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {request.reply_details}
                              </p>
                              {request.reply_details.length > 100 && (
                                <button
                                  onClick={() => openViewModal(request)}
                                  className="text-xs text-purple-600 hover:text-purple-800 mt-1 font-medium"
                                >
                                  Read more...
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              No response yet
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(request.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* View Button */}
                            <button
                              onClick={() => openViewModal(request)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>

                            {/* Reply Button */}
                            {has("hrms.message.service_request.fulfill") && (
                              <button
                                onClick={() => openReplyModal(request)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Reply"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Delete Button */}
                            {has("hrms.message.service_request.fulfill") && (
                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Status Update Dropdown */}
                            <select
                              value={request.status}
                              disabled={!has("hrms.message.service_request.fulfill")}
                              onChange={(e) =>
                                handleUpdateStatus(request.id, e.target.value)
                              }
                              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredRequests.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(
                        startIndex + entriesPerPage,
                        filteredRequests.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredRequests.length}
                    </span>{" "}
                    requests
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                        {currentPage}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-linear-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-xl flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">Reply to Request</h3>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedRequest(null);
                  setReplyText("");
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Existing Reply Display */}
              {selectedRequest.reply_details && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                    Previous Response:
                  </p>
                  <p className="text-sm text-blue-700 whitespace-pre-wrap">
                    {selectedRequest.reply_details}
                  </p>
                  <p className="text-xs text-blue-500 mt-2">
                    Sent on: {formatDate(selectedRequest.updated_at)}
                  </p>
                </div>
              )}

              {/* Request Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Employee:</span>{" "}
                  {selectedRequest.employee_name ||
                    employeeMap[selectedRequest.employee_id] ||
                    `Employee #${selectedRequest.employee_id}`}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Request Type:</span>{" "}
                  {selectedRequest.request_type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Department:</span>{" "}
                  {selectedRequest.request_to}
                </p>
                {selectedRequest.assigned_employee_name && (
                  <p className="text-sm text-purple-600 font-semibold flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Assigned To: {selectedRequest.assigned_employee_name}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Details:</span>{" "}
                  {selectedRequest.request_details}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Priority:</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedRequest.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : selectedRequest.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedRequest.priority}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Current Status:</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Submitted On:</span>{" "}
                  {formatDate(selectedRequest.created_at)}
                </p>
              </div>

              {/* Reply Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Type your reply here..."
                />
              </div>

              {/* Quick Status Update */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) =>
                    setSelectedRequest({
                      ...selectedRequest,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReplySubmit}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold"
                >
                  Send Reply & Update
                </button>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedRequest(null);
                    setReplyText("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedViewRequest && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-linear-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-xl flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">Request Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedViewRequest(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                    Employee
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedViewRequest.employee_name ||
                      employeeMap[selectedViewRequest.employee_id] ||
                      `Employee #${selectedViewRequest.employee_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                    Request Type
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedViewRequest.request_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                    Department
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedViewRequest.request_to}
                  </p>
                </div>
                {selectedViewRequest.assigned_employee_name && (
                  <div>
                    <p className="text-xs text-purple-500 uppercase font-bold tracking-wider mb-1">
                      Assigned To
                    </p>
                    <p className="text-purple-700 font-bold flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {selectedViewRequest.assigned_employee_name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                    Submitted On
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(selectedViewRequest.created_at)}
                  </p>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">
                  Request Description
                </p>
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedViewRequest.request_details}
                  </p>
                </div>
              </div>

              {/* Display Existing Response */}
              {selectedViewRequest.reply_details && (
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                    Admin Response
                  </p>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedViewRequest.reply_details}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Updated on: {formatDate(selectedViewRequest.updated_at)}
                    </p>
                  </div>
                </div>
              )}

              {has("hrms.message.service_request.fulfill") && (
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Admin Action
                  </h4>

                  <div className="space-y-4">
                    {/* Status Dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Update Status
                      </label>
                      <select
                        value={selectedViewRequest.status}
                        onChange={(e) =>
                          setSelectedViewRequest({
                            ...selectedViewRequest,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Reply Textarea */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Response <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                        placeholder="Enter your response to the employee..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t border-gray-200 gap-3">
                {has("hrms.message.service_request.fulfill") && (
                  <button
                    onClick={async () => {
                      await handleUpdateStatus(
                        selectedViewRequest.id,
                        selectedViewRequest.status,
                        replyText,
                      );
                      setShowViewModal(false);
                      setSelectedViewRequest(null);
                    }}
                    className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedViewRequest(null);
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default EmployeeServiceReq;
