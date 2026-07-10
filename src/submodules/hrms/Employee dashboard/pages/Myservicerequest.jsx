import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../../../../hooks/usePermission";
import useAuth from "../../../../hooks/useAuth";

const MyRequest = () => {
  const { has } = usePermission();
  const canCreate = has("hrms.self_service.service_request.create");
  const canDelete = has("hrms.self_service.service_request.delete");
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [departmentsList, setDepartmentsList] = useState([]);

  const { user, token } = useAuth();

  const employeeId = user?.employee_id;
  const company_id = user?.company_id;
  const slug = user?.slug;

  const [formData, setFormData] = useState({
    request_to: "",
    request_to_employee_id: "",
    request_type: "",
    request_details: "",
    priority: "Medium",
  });

  useEffect(() => {
    if (employeeId && slug && company_id) {
      fetchRequests();
    }
  }, [employeeId, slug, company_id]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      const uniqueDepts = [
        ...new Set(employees.map((e) => e.department).filter(Boolean)),
      ];
      setDepartmentsList(uniqueDepts);
    }
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setEmployees(response.data.data);
        const mapping = {};
        response.data.data.forEach((emp) => {
          mapping[emp.id] = emp.name;
        });
        setEmployeeMap(mapping);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/employee-search?employeeId=${employeeId}&company_id=${company_id}&slug=${slug}`,
      );

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequest = async () => {
    if (!canCreate) {
      alert("You do not have permission to create service requests");
      return;
    }
    if (
      !formData.request_to ||
      !formData.request_details ||
      !formData.request_type
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        slug,
        employeeId,
        company_id,
        request_to: formData.request_to,
        request_to_employee_id: formData.request_to_employee_id || null,
        request_type: formData.request_type,
        request_details: formData.request_details,
        priority: formData.priority,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        fetchRequests();

        setFormData({
          request_to: "",
          request_to_employee_id: "",
          request_type: "",
          request_details: "",
          priority: "Medium",
        });
        setShowAddRequest(false);
      }
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Failed to create request");
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!canDelete) {
      alert("You do not have permission to delete service requests");
      return;
    }
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/${id}`,
          {
            data: { slug },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          fetchRequests();
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        alert("Failed to delete request");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.request_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_details
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.requester_name &&
        request.requester_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const openReplyModal = (request) => {
    setSelectedRequest(request);
    setReplyText(request.reply_details || "");
    setShowReplyModal(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      alert("Please enter a reply");
      return;
    }
    try {
      const payload = {
        slug,
        status: selectedRequest.status,
        reply_details: replyText,
      };
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/update-status/${selectedRequest.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        fetchRequests();
        setShowReplyModal(false);
        setSelectedRequest(null);
        setReplyText("");
        alert("Reply sent successfully");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
      {!showAddRequest ? (
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  My Service Requests
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage and track all your service requests
                </p>
              </div>
              {canCreate && (
                <button
                  onClick={() => setShowAddRequest(true)}
                  className="px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold group"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Request
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              onClick={() => {
                setStatusFilter("All");
                setCurrentPage(1);
              }}
              className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all duration-200 ${statusFilter === "All" ? "border-emerald-500 ring-2 ring-emerald-100 shadow-md scale-[1.02]" : "border-gray-100 hover:border-emerald-200 hover:shadow-md hover:scale-[1.01]"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Requests
                  </p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {requests.length}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-xl transition-colors ${statusFilter === "All" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-600"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setStatusFilter("Pending");
                setCurrentPage(1);
              }}
              className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all duration-200 ${statusFilter === "Pending" ? "border-yellow-500 ring-2 ring-yellow-100 shadow-md scale-[1.02]" : "border-gray-100 hover:border-yellow-200 hover:shadow-md hover:scale-[1.01]"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-xl font-bold text-yellow-600 mt-1">
                    {requests.filter((r) => r.status === "Pending").length}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-xl transition-colors ${statusFilter === "Pending" ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-600"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setStatusFilter("In Progress");
                setCurrentPage(1);
              }}
              className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all duration-200 ${statusFilter === "In Progress" ? "border-blue-500 ring-2 ring-blue-100 shadow-md scale-[1.02]" : "border-gray-100 hover:border-blue-200 hover:shadow-md hover:scale-[1.01]"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    In Progress
                  </p>
                  <p className="text-xl font-bold text-emerald-600 mt=1">
                    {requests.filter((r) => r.status === "In Progress").length}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-xl transition-colors ${statusFilter === "In Progress" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-600"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setStatusFilter("Completed");
                setCurrentPage(1);
              }}
              className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all duration-200 ${statusFilter === "Completed" ? "border-green-500 ring-2 ring-green-100 shadow-md scale-[1.02]" : "border-gray-100 hover:border-green-200 hover:shadow-md hover:scale-[1.01]"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completed</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {requests.filter((r) => r.status === "Completed").length}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-xl transition-colors ${statusFilter === "Completed" ? "bg-green-600 text-white" : "bg-green-100 text-green-600"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading requests...</p>
            </div>
          )}

          {!loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Show
                      </span>
                      <select
                        value={entriesPerPage}
                        onChange={(e) => {
                          setEntriesPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-sm text-gray-600 font-medium">
                        entries
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full lg:w-80">
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-linear-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Request Type
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Requested By
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Request To
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Reply
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedRequests.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
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
                            <div className="text-sm text-gray-400 mb-4">
                              Get started by creating your first request
                            </div>
                            {canCreate && (
                              <button
                                onClick={() => setShowAddRequest(true)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                              >
                                Create Request
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50/80 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="shrink-0">
                                <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                  {request.request_type?.charAt(0) || "R"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {request.request_type}
                                </div>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    request.employee_id === employeeId
                                      ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                                      : request.request_to_employee_id ===
                                          employeeId
                                        ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                                        : "bg-purple-100 text-purple-600 border border-purple-200"
                                  }`}
                                >
                                  {request.employee_id === employeeId
                                    ? "Sent"
                                    : request.request_to_employee_id ===
                                        employeeId
                                      ? "Assigned to Me"
                                      : "Department"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.employee_id === employeeId ? (
                                <span className="text-emerald-600">You</span>
                              ) : (
                                request.requester_name || "Unknown"
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              ID: {request.employee_id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {request.request_to}
                            </div>
                            {request.assigned_employee_name && (
                              <div className="text-[11px] text-gray-500 italic">
                                ({request.assigned_employee_name})
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs line-clamp-2">
                              {request.request_details}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`}
                              />
                              <span className="text-sm text-gray-600">
                                {request.priority}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs">
                              {request.reply_details}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {formatDate(request.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewRequest(request)}
                                className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 rounded-lg transition-colors"
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
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => openReplyModal(request)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                              {request.employee_id === employeeId &&
                                canDelete && (
                                  <button
                                    onClick={() =>
                                      handleDeleteRequest(request.id)
                                    }
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredRequests.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <div className="font-medium">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + entriesPerPage,
                        filteredRequests.length,
                      )}{" "}
                      of {filteredRequests.length} requests
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                      >
                        Next
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-linear-to-r from-emerald-600 to-emerald-700 px-8 py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAddRequest(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Create New Request
                  </h2>
                  <p className="text-emerald-100 mt-1">
                    Fill in the details below to submit your service request
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Request Type <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={formData.request_type}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value.length <= 50) {
                      handleInputChange("request_type", value);
                    }
                  }}
                  minLength={10}
                  maxLength={50}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter request type (20-30 characters)"
                  required
                />

                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Minimum 10 and maximum 50 characters</span>
                  <span>{formData.request_type.length}/50</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Request To <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.request_to}
                  onChange={(e) =>
                    handleInputChange("request_to", e.target.value)
                  }
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select Department</option>
                  {departmentsList.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {formData.request_to && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Assign to Specific Employee (Optional)
                  </label>
                  <select
                    value={formData.request_to_employee_id}
                    onChange={(e) =>
                      handleInputChange(
                        "request_to_employee_id",
                        e.target.value,
                      )
                    }
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Any Employee</option>
                    {employees
                      .filter((emp) => emp.department === formData.request_to)
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Request Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.request_details}
                  onChange={(e) =>
                    handleInputChange("request_details", e.target.value)
                  }
                  rows={5}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  placeholder="Please describe your request in detail..."
                  required
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Be specific and include all relevant information</span>
                  <span>{formData.request_details.length}/500</span>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddRequest(false)}
                  className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRequest}
                  className="flex-1 px-6 py-3.5 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative animate-fade-in">
            <button
              onClick={() => {
                setShowReplyModal(false);
                setSelectedRequest(null);
                setReplyText("");
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
              title="Close"
            >
              <svg
                className="w-5 h-5"
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
            <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
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
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              Reply to Request
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Type:</span>{" "}
                  {selectedRequest.request_type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Details:</span>{" "}
                  {selectedRequest.request_details}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                  placeholder="Type your reply here..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReplySubmit}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-bold shadow-lg hover:shadow-emerald-200"
                >
                  Send Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedRequest(null);
                    setReplyText("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative animate-fade-in">
            <button
              onClick={handleCloseViewModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
              title="Close"
            >
              <svg
                className="w-5 h-5"
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
            <h2 className="text-2xl font-bold mb-6 text-blue-700 border-b pb-4">
              Service Request Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Type
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedRequest.request_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Priority
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                  >
                    {selectedRequest.priority}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Requested By
                </p>
                <p className="text-gray-900 font-medium">
                  {selectedRequest.requester_name || "Unknown"} (ID:{" "}
                  {selectedRequest.employee_id})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Request To
                </p>
                <p className="text-gray-900 font-medium">
                  {selectedRequest.request_to}
                  {selectedRequest.assigned_employee_name && (
                    <span className="text-gray-500 ml-1">
                      ({selectedRequest.assigned_employee_name})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}
                >
                  {selectedRequest.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Details
                </p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                  {selectedRequest.request_details}
                </p>
              </div>
              {selectedRequest.reply_details && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Reply from HR/Admin
                  </p>
                  <p className="text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-100 mt-1">
                    {selectedRequest.reply_details}
                  </p>
                </div>
              )}
              <div className="pt-4 text-xs text-gray-400">
                Submitted on {formatDate(selectedRequest.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequest;
