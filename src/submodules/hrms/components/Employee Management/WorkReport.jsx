import axios from "axios";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Search,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import Swal from "sweetalert2";
const AdminMonthlyReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [adminComment, setAdminComment] = useState("");
  const [filters, setFilters] = useState({
    employee: "all",
    month: "all",
    year: "all",
    status: "all",
    search: "",
  });
  const { user } = useAuth();

  const slug = user?.slug;

  const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;

  const [reports, setReports] = useState([]);
  const months = [
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

  const years = [2024, 2025, 2026];
  const statuses = ["pending", "approved", "rejected"];

  const uniqueEmployees = reports.reduce((acc, report) => {
    if (!acc.find((e) => e.id === report.employee.id)) {
      acc.push({
        id: report.employee.id,
        name: report.employee.name,
        employeeId: report.employee.employeeId,
      });
    }
    return acc;
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/monthly-reports/${slug}/admin/all`,
        );

        const formatted = res.data.map((r) => ({
          ...r,

          submittedOn: r.submitted_on,
          reviewedOn: r.reviewed_on,
          nextMonthPlan: r.next_month_plan,

          employee: {
            id: r.employee_id,
            name: r.name,
            employeeId: r.employee_id,
            department: r.department,
            designation: r.designation || "-",
          },
        }));

        setReports(formatted);
      } catch (error) {
        console.error("Error fetching reports", error);
      }
    };

    if (slug) fetchReports();
  }, [slug]);

  const handleStatusUpdate = async (reportId, status) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/monthly-reports/${slug}/admin/review/${reportId}`,
        {
          status,
          adminComment,
          reviewedBy: user?.name || "Admin",
        },
      );

      Swal.fire("Success", `Report ${status} successfully`, "success");

      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/monthly-reports/${slug}/admin/all`,
      );

      const formatted = res.data.map((r) => ({
        ...r,
        submittedOn: r.submitted_on,
        reviewedOn: r.reviewed_on,
        nextMonthPlan: r.next_month_plan,
        employee: {
          id: r.employee_id,
          name: r.name,
          employeeId: r.employee_id,
          department: r.department,
        },
      }));

      setReports(formatted);

      setSelectedReport(null);
      setAdminComment("");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.error || "Failed to update report",
        "error",
      );
    }
  };

  const toggleExpand = (id) => {
    setExpandedRows({
      ...expandedRows,
      [id]: !expandedRows[id],
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-green-500" />;
      case "rejected":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Employee",
      "Employee ID",
      "Department",
      "Month",
      "Year",
      "Status",
      "Submitted On",
      "Reviewed On",
      "Description",
      "Next Month Plan",
    ];
    const csvData = filteredReports.map((report) => [
      report.employee.name,
      report.employee.employeeId,
      report.employee.department,
      report.month,
      report.year,
      report.status,
      report.submittedOn,
      report.reviewedOn || "Not reviewed",
      report.description,
      report.nextMonthPlan,
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-monthly-reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredReports = reports.filter((report) => {
    if (filters.employee !== "all" && report.employee.id !== filters.employee) {
      return false;
    }

    if (filters.month !== "all" && report.month !== filters.month) {
      return false;
    }

    if (filters.year !== "all" && report.year !== parseInt(filters.year)) {
      return false;
    }

    if (filters.status !== "all" && report.status !== filters.status) {
      return false;
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        report.employee.name.toLowerCase().includes(searchTerm) ||
        report.employee.employeeId.toLowerCase().includes(searchTerm) ||
        report.employee.department.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter((r) => r.status === "pending").length,
    approved: filteredReports.filter((r) => r.status === "approved").length,
    rejected: filteredReports.filter((r) => r.status === "rejected").length,
    uniqueEmployees: uniqueEmployees.length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Monthly Reports
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage employee monthly work reports
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          Export All Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={filters.employee}
              onChange={(e) =>
                setFilters({ ...filters, employee: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {uniqueEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Name, ID, Dept..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month/Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <React.Fragment key={report.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.employee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.employee.employeeId} •{" "}
                          {report.employee.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {report.month} {report.year}
                    </div>
                    <div className="text-sm text-gray-500">
                      {report.tasks?.length || 0} tasks
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${getStatusBadge(report.status)}`}
                    >
                      {getStatusIcon(report.status)}
                      {report.status.charAt(0).toUpperCase() +
                        report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.submittedOn).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reviewedOn
                      ? new Date(report.reviewedOn).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Review
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No reports found
            </h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Review Monthly Report
                </h2>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setAdminComment("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employee</p>
                    <p className="font-medium">
                      {selectedReport.employee.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedReport.employee.employeeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">
                      {selectedReport.employee.department}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedReport.employee.designation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Period</p>
                  <p className="text-gray-600">
                    {selectedReport.month} {selectedReport.year}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Description
                  </p>
                  <p className="text-gray-600">{selectedReport.description}</p>
                </div>

                {selectedReport.tasks && selectedReport.tasks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Tasks Completed
                    </p>
                    <ul className="list-disc list-inside">
                      {selectedReport.tasks.map((task, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.nextMonthPlan && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Next Month Plan
                    </p>
                    <p className="text-gray-600">
                      {selectedReport.nextMonthPlan}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Submitted On
                  </p>
                  <p className="text-gray-600">
                    {new Date(selectedReport.submittedOn).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Feedback
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your comments or feedback for the employee..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setAdminComment("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedReport.id, "rejected")
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedReport.id, "approved")
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMonthlyReports;
