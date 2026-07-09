import axios from "axios";
import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";

const parseAttendanceDate = (value) => {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00+05:30`);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Enhanced version with better Edit/Delete functionality
const TimesheetOfEmployeesWithData = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [employees, setEmployees] = useState([]);
  const { user } = useAuth();
  const slug = user?.slug;
  const formatDate = (value) => {
    if (!value) return "-";
    const date = parseAttendanceDate(value);
    if (!date) return "-";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // Local date, not UTC
  };

  useEffect(() => {
    fetchTimesheets();
  }, [slug]);

  const fetchTimesheets = async () => {
    try {
      if (!slug) {
        setEmployees([]);
        return;
      }

      const timesheetRes = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets`,
        {
          params: {
            slug,
          },
        },
      );

      const timesheets = Array.isArray(timesheetRes.data)
        ? timesheetRes.data
        : Array.isArray(timesheetRes.data?.data)
          ? timesheetRes.data.data
          : Array.isArray(timesheetRes.data?.timesheets)
            ? timesheetRes.data.timesheets
            : [];

      const merged = timesheets.map((record) => ({
        id: record.id,
        date: formatDate(record.date || record.attendance_date),
        employeeId: record.employeeId || record.employee_id,
        employeeName: record.employee_name || "Unknown",
        post_applied: record.post_applied || "-",
        status: record.status || "Pending",
        entryTime: record.created_at
          ? new Date(record.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
      }));

      setEmployees(merged);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Edit functionality
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditedData(employee);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/${selectedEmployee.id}`,
        {
          employeeId: editedData.employeeId || selectedEmployee.employeeId,
          date: editedData.date || selectedEmployee.date,
          hoursWorked: editedData.hoursWorked || 0,
          taskDescription: editedData.entryDate,
          status: editedData.status,
          notes: editedData.entryDate,
        },
      );

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id
            ? {
                ...emp,
                date: editedData.date || emp.date,
                employeeName: editedData.employeeName || emp.employeeName,
                status: editedData.status,
                entryDate: editedData.entryDate,
              }
            : emp,
        ),
      );

      setEditModalOpen(false);
      setSelectedEmployee(null);
      setEditedData({});
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Delete functionality
  const handleDelete = (employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  // Approve timesheet
  const handleApprove = async (employee) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/${employee.id}/approve`,
      );

      // Update local state to reflect approved status
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id
            ? { ...emp, status: response.data.timesheet.status }
            : emp,
        ),
      );
    } catch (error) {
      console.error("Error approving timesheet:", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets/${selectedEmployee.id}`,
      );

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, status: "Rejected" } : emp,
        ),
      );

      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // Pagination calculations
  const totalEntries = employees.length;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = employees.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Present: {
        bg: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-400",
      },
      Late: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        dot: "bg-yellow-400",
      },
      Absent: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-400" },
      Holiday: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-400" },
    };

    const config = statusConfig[status] || statusConfig.Present;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span className={`w-2 h-2 rounded-full mr-2 ${config.dot}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Timesheet
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track employee attendance records
          </p>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 entries</option>
              <option value={10}>10 entries</option>
              <option value={25}>25 entries</option>
              <option value={50}>50 entries</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {totalEntries} employees
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
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
                  Entry Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 text-6xl mb-4">📊</div>
                      <div className="text-gray-500 text-lg font-medium">
                        No records found
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        No employee timesheet data available
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.date}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.employeeName}
                        </div>
                        {/* <div className="text-sm text-gray-500">{employee.department}</div> */}
                        <div className="text-sm text-gray-500">
                          {employee.post_applied}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={employee.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.entryTime}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {/* <button 
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900 font-medium flex items-center transition-colors duration-200"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button> */}
                        <button
                          onClick={() => handleDelete(employee)}
                          className="text-red-600 hover:text-red-900 font-medium flex items-center transition-colors duration-200"
                        >
                          <span className="mr-1">🗑️</span>
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(employee)}
                          className="text-green-600 hover:text-green-900 font-medium flex items-center transition-colors duration-200"
                        >
                          <span className="mr-1">✔️</span>
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {currentEntries.length > 0 ? startIndex + 1 : 0} to{" "}
            {endIndex} of {totalEntries} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                currentPage === 1
                  ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 text-sm font-medium rounded-md border transition-colors duration-200 ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={endIndex >= totalEntries}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                endIndex >= totalEntries
                  ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Employee Record
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={editedData.employeeName || ""}
                  onChange={(e) =>
                    handleEditChange("employeeName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editedData.status || ""}
                  onChange={(e) => handleEditChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Holiday">Holiday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editedData.entryDate?.replace(" ", "T") || ""}
                  onChange={(e) =>
                    handleEditChange(
                      "entryDate",
                      e.target.value.replace("T", " "),
                    )
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Reject
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                Are you sure you want to reject the timesheet record for{" "}
                <span className="font-semibold text-gray-800">
                  {selectedEmployee?.employeeName}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetOfEmployeesWithData;
