import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  User,
  Calendar,
  ChevronDown,
  XCircle,
  RefreshCw,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { usePermission } from "../../../hooks/usePermission";

const ComplaintsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { has } = usePermission();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const token = user?.token;

        const [empRes, complaintRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get(
            user?.slug
              ? `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/company/${user.slug}`
              : `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/`,
          ),
        ]);

        const employeesData = empRes.data.data || empRes.data || [];

        const formattedData = complaintRes.data.map((item) => {
          const employee = employeesData.find(
            (emp) => String(emp.id) === String(item.employee_id),
          );

          return {
            id: item.id,
            employeeName: employee?.name || "Unknown Employee",
            employeeId: item.employee_id?.toString() || "N/A",
            subject: item.complain || "No Subject",
            department: employee?.department || "N/A",
            description: item.complain,
            status: item.status || "Pending",
            dateSubmitted: new Date(item.date).toLocaleDateString("en-GB"),
            attachments: Array.isArray(item.attachments)
              ? item.attachments
              : [],
          };
        });

        setEmployees(employeesData);
        setComplaints(formattedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAllData();
    }
  }, [user]);
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          user?.slug
            ? `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/company/${user.slug}`
            : `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/`,
        );

        const formattedData = res.data.map((item) => {
          const employee = employees.find(
            (emp) => String(emp.id) === String(item.employee_id),
          );

          return {
            id: item.id,
            employeeName: employee?.name,
            employeeId: item.employee_id?.toString() || "N/A",
            subject: item.complain || "No Subject",
            department: employee?.department || "N/A",
            description: item.complain,
            status: item.status || "Pending",
            dateSubmitted: new Date(item.date).toLocaleDateString("en-GB"),
            attachments: Array.isArray(item.attachments)
              ? item.attachments
              : [],
          };
        });

        setComplaints(formattedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [employees]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = user?.token;

        const res = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    if (user?.token) {
      fetchEmployees();
    }
  }, [user]);

  {
    loading && (
      <div className="text-center py-10">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600 mt-2">Loading complaints...</p>
      </div>
    );
  }

  {
    error && <div className="text-center py-10 text-red-600">{error}</div>;
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Pending",
      },
      Approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Approved",
      },
      Rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };
  const getPriorityBadge = (priority) => {
    const priorityColors = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}
      >
        {priority}
      </span>
    );
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const employeeName = complaint.employeeName || "";
    const subject = complaint.subject || "";
    const employeeId = complaint.employeeId?.toString() || "";
    const id = complaint.id?.toString() || "";

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      employeeName.toLowerCase().includes(search) ||
      subject.toLowerCase().includes(search) ||
      employeeId.toLowerCase().includes(search) ||
      id.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleResolveComplaint = (complaintId) => {
    if (!has("hrms.message.complaints.resolve")) {
      Swal.fire(
        "Access Denied",
        "You do not have permission to resolve complaints.",
        "error",
      );
      return;
    }

    setComplaints(
      complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: "resolved",
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : c,
      ),
    );
    setShowResolveModal(false);
    setResolutionNote("");
    setSelectedComplaint(null);
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    if (!has("hrms.message.complaints.resolve")) {
      Swal.fire(
        "Access Denied",
        "You do not have permission to resolve complaints.",
        "error",
      );
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/status/${complaintId}`,
        { status: newStatus },
      );

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId ? { ...c, status: newStatus } : c,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredComplaints.length} of {complaints.length}{" "}
            complaints
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Complaint ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-blue-600">
                    {complaint.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">
                      {complaint.dateSubmitted}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {complaint.employeeId}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(complaint.status)}
                  {complaint.status === "unresolved" && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowResolveModal(true);
                      }}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                      title="View reason"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {has("hrms.message.complaints.resolve") &&
                      complaint.status !== "Approved" && (
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: "Are you sure?",
                              text: "Change status to Approved?",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#10B981",
                              cancelButtonColor: "#3b82f6",
                              confirmButtonText: "Yes, Approve!",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleUpdateStatus(complaint.id, "Approved");
                                Swal.fire({
                                  title: "Approved!",
                                  text: "Complaint has been approved.",
                                  icon: "success",
                                  timer: 1500,
                                  showConfirmButton: false,
                                });
                              }
                            });
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    {has("hrms.message.complaints.resolve") &&
                      complaint.status !== "Rejected" && (
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: "Are you sure?",
                              text: "Change status to Rejected?",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#ef4444",
                              cancelButtonColor: "#3b82f6",
                              confirmButtonText: "Yes, Reject!",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleUpdateStatus(complaint.id, "Rejected");
                                Swal.fire({
                                  title: "Rejected!",
                                  text: "Complaint has been rejected.",
                                  icon: "success",
                                  timer: 1500,
                                  showConfirmButton: false,
                                });
                              }
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No complaints found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </div>

      {selectedComplaint && !showResolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complaint Details
                </h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Complaint ID</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedComplaint.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Status
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {getStatusBadge(selectedComplaint.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedComplaint.employeeName} (
                    {selectedComplaint.employeeId})
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedComplaint.department}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedComplaint.description}
                  </p>
                </div>

                {selectedComplaint.status === "unresolved" &&
                  selectedComplaint.unresolvedReason && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Reason for being unresolved
                      </p>
                      <p className="text-base text-red-600 bg-red-50 p-4 rounded-lg">
                        {selectedComplaint.unresolvedReason}
                      </p>
                    </div>
                  )}

                <div>
                  <p className="text-sm text-gray-500">Attachments</p>
                  {selectedComplaint.attachments?.length > 0 ? (
                    <div className="mt-2">
                      {selectedComplaint.attachments.map((file, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 mr-2"
                        >
                          📎 {file}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No attachments</p>
                  )}
                </div>

                {has("hrms.message.complaints.resolve") && (
                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={() => {
                        setShowResolveModal(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Update Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Update Complaint Status
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={selectedComplaint.status}
                    onChange={(e) => {
                      setSelectedComplaint({
                        ...selectedComplaint,
                        status: e.target.value,
                      });
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {selectedComplaint.status === "unresolved" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for being unresolved
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2"
                      rows="4"
                      placeholder="Please explain why this complaint remains unresolved..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowResolveModal(false);
                      setResolutionNote("");
                      setSelectedComplaint(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (
                        selectedComplaint.status === "unresolved" &&
                        !resolutionNote.trim()
                      ) {
                        alert("Please provide a reason for unresolved status");
                        return;
                      }

                      handleUpdateStatus(
                        selectedComplaint.id,
                        selectedComplaint.status,
                        resolutionNote,
                      );

                      setShowResolveModal(false);
                      setResolutionNote("");
                      setSelectedComplaint(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;
