import React, { useState } from "react";

const DailyAccessActivity = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      employeeId: "EMP001",
      employeeName: "John Doe",
      department: "IT",
      designation: "Software Engineer",
      machineId: "FP001",
      machineName: "Main Entrance FP",
      punchTime: "2025-11-08 09:15:23",
      punchType: "IN",
      status: "MIS Punch",
      reason: "Late Arrival",
    },
    {
      id: 2,
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      department: "HR",
      designation: "HR Manager",
      machineId: "FP002",
      machineName: "Reception FP",
      punchTime: "2025-11-08 17:45:12",
      punchType: "OUT",
      status: "MIS Punch",
      reason: "Early Departure",
    },
    {
      id: 3,
      employeeId: "EMP003",
      employeeName: "Mike Johnson",
      department: "Finance",
      designation: "Accountant",
      machineId: "FP003",
      machineName: "Finance Dept FP",
      punchTime: "2025-11-08 13:30:45",
      punchType: "IN",
      status: "Regular",
      reason: "-",
    },
    {
      id: 4,
      employeeId: "EMP004",
      employeeName: "Sarah Wilson",
      department: "Marketing",
      designation: "Marketing Executive",
      machineId: "FP001",
      machineName: "Main Entrance FP",
      punchTime: "2025-11-08 10:05:33",
      punchType: "IN",
      status: "MIS Punch",
      reason: "Forgot to Punch",
    },
  ]);

  const [filters, setFilters] = useState({
    date: "2025-11-08",
    department: "",
    status: "",
    punchType: "",
  });

  const departments = ["All", "IT", "HR", "Finance", "Marketing", "Operations"];
  const statusOptions = ["All", "MIS Punch", "Regular"];
  const punchTypes = ["All", "IN", "OUT"];

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredReports = reports.filter((report) => {
    return (
      (filters.department === "" ||
        filters.department === "All" ||
        report.department === filters.department) &&
      (filters.status === "" ||
        filters.status === "All" ||
        report.status === filters.status) &&
      (filters.punchType === "" ||
        filters.punchType === "All" ||
        report.punchType === filters.punchType)
    );
  });

  const exportToExcel = () => {
    alert("Exporting MIS Punch data to Excel...");
  };

  const closePage = () => {
    window.history.back();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "MIS Punch":
        return "bg-yellow-100 text-yellow-800";
      case "Regular":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPunchTypeBadge = (punchType) => {
    switch (punchType) {
      case "IN":
        return "bg-blue-100 text-blue-800";
      case "OUT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-3 lg:mb-0">
              <h1 className="text-xl font-bold text-gray-800">
                Daily Access Activity
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Fingerprint Machine Access Activity & MIS Punch Records
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label
                htmlFor="date"
                className="text-sm font-medium text-gray-700"
              >
                Date:
              </label>
              <input
                type="date"
                id="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Departments</option>
                {departments
                  .filter((dept) => dept !== "All")
                  .map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                {statusOptions
                  .filter((status) => status !== "All")
                  .map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Punch Type
              </label>
              <select
                value={filters.punchType}
                onChange={(e) =>
                  handleFilterChange("punchType", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                {punchTypes
                  .filter((type) => type !== "All")
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={exportToExcel}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Export Excel</span>
              </button>

              <button
                onClick={closePage}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
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
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Punch Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Punch Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.employeeId}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {report.employeeName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {report.department}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {report.designation}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{report.machineName}</div>
                        <div className="text-xs text-gray-500">
                          ID: {report.machineId}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {report.punchTime}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPunchTypeBadge(report.punchType)}`}
                      >
                        {report.punchType}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {report.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-500">
                  Total Records
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {filteredReports.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-500">
                  MIS Punches
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {
                    filteredReports.filter((r) => r.status === "MIS Punch")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-500">
                  Regular Punches
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {filteredReports.filter((r) => r.status === "Regular").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
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
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-500">
                  IN Punches
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {filteredReports.filter((r) => r.punchType === "IN").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAccessActivity;
