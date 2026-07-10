import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function LeaveReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i,
  );

  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState([]);

  const filteredData = leaveData.filter(
    (employee) =>
      employee.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      employee.empCode.toLowerCase().includes(search.toLowerCase()) ||
      employee.department.toLowerCase().includes(search.toLowerCase()),
  );

  const groupByEmployee = (data) => {
    const grouped = {};

    data.forEach((record) => {
      const day = new Date(record.date).getDate();

      if (!grouped[record.empCode]) {
        grouped[record.empCode] = {
          s1: Object.keys(grouped).length + 1,
          empCode: record.empCode,
          employeeName: record.employeeName,
          department: record.department,
          designation: record.designation,
          location: record.location,
          days: Array.from({ length: 31 }, (_, i) => ({
            day: i + 1,
            leaveType: "",
            status: "",
          })),
        };
      }


      grouped[record.empCode].days[day - 1] = {
        day,
        leaveType: record.leaveType || "",
        status: record.status || "",
      };
    });

    return Object.values(grouped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!month || !year) {
      alert("Please select both month and year");
      return;
    }

    try {
      setLoading(true);
      setShowReport(true);


      const monthNumber = months.indexOf(month) + 1;


      const { data } = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/leave-report/report?month=${monthNumber}&year=${year}`,
      );


      const grouped = groupByEmployee(data);
      setLeaveData(grouped);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Failed to load report from server");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const date = new Date(parseInt(year), months.indexOf(month), 1);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth();


  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const startEntry = startIndex + 1;
  const endEntry = Math.min(startIndex + itemsPerPage, filteredData.length);


  const summary = {
    totalEmployees: filteredData.length,
    totalLeaves: filteredData.reduce(
      (total, emp) => total + emp.days.filter((day) => day.leaveType).length,
      0,
    ),
    approvedLeaves: filteredData.reduce(
      (total, emp) =>
        total + emp.days.filter((day) => day.status === "Approved").length,
      0,
    ),
    pendingLeaves: filteredData.reduce(
      (total, emp) =>
        total + emp.days.filter((day) => day.status === "Pending").length,
      0,
    ),
  };

  const handleExport = (format) => {
    if (format === "Excel") {
      const wsData = [
        [
          "S1",
          "Emp Code",
          "Employee Name",
          "Department",
          "Designation",
          "Location",
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ],
        ...filteredData.map((emp) => [
          emp.s1,
          emp.empCode,
          emp.employeeName,
          emp.department,
          emp.designation,
          emp.location,
          ...emp.days.slice(0, daysInMonth).map((day) => day.leaveType || ""),
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leave Report");

      XLSX.writeFile(wb, `Leave_Report_${month}_${year}.xlsx`);
    }

    if (format === "PDF") {
      const doc = new jsPDF({ orientation: "landscape" });

      const tableColumn = [
        "S1",
        "Emp Code",
        "Employee Name",
        "Department",
        "Designation",
        "Location",
        ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
      ];

      const tableRows = filteredData.map((emp) => [
        emp.s1,
        emp.empCode,
        emp.employeeName,
        emp.department,
        emp.designation,
        emp.location,
        ...emp.days.slice(0, daysInMonth).map((day) => day.leaveType || ""),
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: "grid",
        headStyles: { fillColor: [220, 220, 220] },
        styles: { fontSize: 8 },
      });

      doc.save(`Leave_Report_${month}_${year}.pdf`);
    }
  };

  const getLeaveColor = (leaveType, status) => {
    if (!leaveType) return "";

    const baseColor =
      {
        CL: "bg-blue-100 text-blue-800 border-blue-200",
        SL: "bg-green-100 text-green-800 border-green-200",
        EL: "bg-purple-100 text-purple-800 border-purple-200",
      }[leaveType] || "bg-gray-100 text-gray-800 border-gray-200";

    if (status === "Pending")
      return `bg-yellow-100 text-yellow-800 border-yellow-200`;
    if (status === "Rejected") return `bg-red-100 text-red-800 border-red-200`;

    return baseColor;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Monthly Leave Report
        </h1>


        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Leave Report
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                <option value="">Select Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 text-sm font-medium"
              >
                Display Report
              </button>
            </div>
          </form>
        </div>


        {showReport && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Total Employees
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {summary.totalEmployees}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Total Leaves
                    </p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {summary.totalLeaves}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">
                      Approved Leaves
                    </p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">
                      {summary.approvedLeaves}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">
                      Pending Leaves
                    </p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {summary.pendingLeaves}
                    </p>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport("Excel")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 text-sm font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Excel
                </button>

                <button
                  onClick={() => handleExport("PDF")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 text-sm font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  PDF
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Search:
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-48"
                />
              </div>
            </div>


            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700 sticky left-0 bg-gray-100">
                      s1
                    </th>
                    <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700 sticky left-12 bg-gray-100">
                      Emp Code
                    </th>
                    <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700 sticky left-24 bg-gray-100">
                      Employee Name
                    </th>
                    <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                      Department
                    </th>
                    <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                      Designation
                    </th>
                    <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                      Location
                    </th>


                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <th
                        key={i + 1}
                        className="border border-gray-200 px-2 py-4 text-center font-medium text-gray-700 min-w-12"
                      >
                        <div className="text-xs">{i + 1}</div>
                        <div className="text-xs text-gray-500 font-normal">
                          {month.slice(0, 3)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((employee) => (
                    <tr key={employee.empCode} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-6 py-3 text-center font-medium text-gray-700 sticky left-0 bg-white">
                        {employee.s1}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 font-medium text-gray-600 sticky left-12 bg-white">
                        {employee.empCode}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 font-medium text-gray-600 sticky left-24 bg-white">
                        {employee.employeeName}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-gray-600">
                        {employee.department}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-gray-600">
                        {employee.designation}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-gray-600">
                        {employee.location}
                      </td>


                      {employee.days.slice(0, daysInMonth).map((day) => (
                        <td
                          key={day.day}
                          className="border border-gray-200 px-2 py-3 text-center"
                        >
                          {day.leaveType && (
                            <span
                              className={`inline-block px-1 py-0.5 text-xs font-medium rounded border ${getLeaveColor(day.leaveType, day.status)}`}
                            >
                              {day.leaveType}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {startEntry} to {endEntry} of {filteredData.length}{" "}
                entries
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>


            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Leave Legend:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></span>
                    <span className="text-blue-700 font-medium">CL</span>
                    <span className="text-gray-600 ml-1">= Casual Leave</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-4 bg-green-100 border border-green-200 rounded mr-2"></span>
                    <span className="text-green-700 font-medium">SL</span>
                    <span className="text-gray-600 ml-1">= Sick Leave</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-4 bg-purple-100 border border-purple-200 rounded mr-2"></span>
                    <span className="text-purple-700 font-medium">EL</span>
                    <span className="text-gray-600 ml-1">= Earned Leave</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></span>
                    <span className="text-yellow-700">Pending</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-4 bg-red-100 border border-red-200 rounded mr-2"></span>
                    <span className="text-red-700">Rejected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
