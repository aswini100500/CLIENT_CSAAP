import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";

const EmployeesRequest = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [requests, setRequests] = useState([]);


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_HRMS_BASE_URL ||
          `${import.meta.env.VITE_HRMS_BASE_URL}`;
        const res = await axios.get(`${API_BASE}/api/requests?company_id=1`);


        const formattedRequests = res.data.map((r) => ({
          id: r.id,
          employeeName: r.user_name || r.employeeName || "Unknown",
          employeeId: r.empCode || r.employeeId || "",
          department: r.department || "",
          requestDetail: r.request_details,
          status: r.status,
          replyDetails: r.reply_details,
          priority: r.priority,
          date: new Date(r.created_at).toLocaleDateString(),
        }));

        setRequests(formattedRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setRequests([]);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
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

  const filteredRequests = requests.filter(
    (request) =>
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleStatusUpdate = (id, newStatus) => {
    setRequests(
      requests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request,
      ),
    );
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      const API_BASE =
        import.meta.env.VITE_HRMS_BASE_URL ||
        `${import.meta.env.VITE_HRMS_BASE_URL}`;
      await axios.delete(`${API_BASE}/api/requests/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("Failed to delete request");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                Employees Request
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and review all employee requests
              </p>
            </div>
            <div className="flex gap-3"></div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {requests.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-blue-600"
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {requests.filter((r) => r.status === "Pending").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-yellow-600"
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {requests.filter((r) => r.status === "Approved").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-green-600"
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {requests.filter((r) => r.status === "Rejected").length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>


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
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                  placeholder="Search employees or requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    Employee Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Request Detail
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Reply Details
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <div className="text-lg font-medium text-gray-500 mb-2">
                          No employee requests found
                        </div>
                        <div className="text-sm text-gray-400 mb-4">
                          {requests.length === 0
                            ? "No requests have been submitted yet"
                            : "No requests match your search criteria"}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.slice(0, entriesPerPage).map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                              {request.employeeName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.employeeName}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>{request.employeeId}</span>
                              <span>•</span>
                              <span>{request.department}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-900 font-medium line-clamp-2">
                            {request.requestDetail}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {request.date}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`}
                            ></div>
                            <span className="text-xs text-gray-500">
                              {request.priority} Priority
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {request.replyDetails}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">

                          <select
                            value={request.status}
                            onChange={(e) =>
                              handleStatusUpdate(request.id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                            <option value="In Progress">In Progress</option>
                          </select>

                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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

                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>


          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-gray-600">
              <div className="font-medium">
                Showing {Math.min(filteredRequests.length, entriesPerPage)} of{" "}
                {filteredRequests.length} requests
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium flex items-center gap-2">
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
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium flex items-center gap-2">
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
        </div>
      </div>
    </div>
  );
};

export default EmployeesRequest;
