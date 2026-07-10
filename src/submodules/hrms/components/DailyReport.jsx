import axios from "axios";
import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function DailyReportsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/daily-reports`,
        );

        const formatted = res.data.map((r) => ({
          id: r.id,
          empCode: r.emp_code,
          name: r.name,
          department: r.department,
          designation: r.designation,
          location: r.location,
          attendance: r.attendance,
          misPunch: r.mis_punch,
          lateComing: r.late_coming,
          earlyGoing: r.early_going,
          date: r.date,
        }));


        setReports(formatted);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };

    fetchReports();
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.empCode.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()),
  );


  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);
  const startEntry = startIndex + 1;
  const endEntry = Math.min(startIndex + itemsPerPage, filtered.length);


  const summary = {
    totalEmployees: filtered.length,
    present: filtered.filter((r) => r.attendance === "Present").length,
    absent: filtered.filter((r) => r.attendance === "Absent").length,
    totalMisPunch: filtered.reduce((sum, r) => sum + r.misPunch, 0),
    totalLateComing: filtered.reduce((sum, r) => sum + r.lateComing, 0),
    totalEarlyGoing: filtered.reduce((sum, r) => sum + r.earlyGoing, 0),
  };


  const handleCheckboxChange = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id],
    );
  };


  const handleSelectAll = () => {
    if (selectedEmployees.length === currentData.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(currentData.map((r) => r.id));
    }
  };


  const handleExport = (format) => {
    const dataToExport =
      selectedEmployees.length > 0
        ? reports.filter((r) => selectedEmployees.includes(r.id))
        : filtered;

    if (format === "Excel") {
      const worksheet = XLSX.utils.json_to_sheet(
        dataToExport.map((r) => ({
          "Employee Code": r.empCode,
          Name: r.name,
          Department: r.department,
          Designation: r.designation,
          Location: r.location,
          Attendance: r.attendance,
          MisPunch: r.misPunch,
          "Late Coming": r.lateComing,
          "Early Going": r.earlyGoing,
          Date: r.date,
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Attendance");
      XLSX.writeFile(workbook, "Daily_Attendance.xlsx");
    } else if (format === "PDF") {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Daily Attendance Report", 14, 20);
      doc.setFontSize(12);
      let y = 30;
      dataToExport.forEach((r, index) => {
        doc.text(
          `${index + 1}. ${r.empCode} - ${r.name} (${r.department}) - ${r.attendance}`,
          14,
          y,
        );
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save("Daily_Attendance.pdf");
    }
    alert(`Exporting ${format} report for ${dataToExport.length} employee(s)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Daily Attendance Reports
        </h1>


        <div className="bg-white rounded-2xl shadow-lg p-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Daily Reports Summary
              </h2>
              <p className="text-sm text-gray-600">
                Overview of daily attendance and compliance metrics
              </p>
            </div>

            <button
              onClick={() => navigate("/monthlyperformancereport")}
              className="mt-4 lg:mt-0 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 text-sm font-medium flex items-center"
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
              Monthly Performance Report
            </button>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-700">
                Total Employees
              </p>
              <p className="text-lg font-bold text-blue-900 mt-1">
                {summary.totalEmployees}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-medium text-green-700">Present</p>
              <p className="text-lg font-bold text-green-900 mt-1">
                {summary.present}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-medium text-red-700">Absent</p>
              <p className="text-lg font-bold text-red-900 mt-1">
                {summary.absent}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs font-medium text-yellow-700">MisPunch</p>
              <p className="text-lg font-bold text-yellow-900 mt-1">
                {summary.totalMisPunch}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-medium text-orange-700">Late Coming</p>
              <p className="text-lg font-bold text-orange-900 mt-1">
                {summary.totalLateComing}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-xs font-medium text-purple-700">Early Going</p>
              <p className="text-lg font-bold text-purple-900 mt-1">
                {summary.totalEarlyGoing}
              </p>
            </div>
          </div>


          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex gap-3">
              <button
                onClick={() => handleExport("Excel")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-offset-2 transition duration-200 text-sm font-medium flex items-center"
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-offset-2 transition duration-200 text-sm font-medium flex items-center"
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


          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={
                        selectedEmployees.length === currentData.length &&
                        currentData.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                    SL
                  </th>
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                    Emp Code
                  </th>
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
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
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                    Attendance
                  </th>
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                    MisPunch
                  </th>
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                    Late Coming
                  </th>
                  <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
                    Early Going
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((r, idx) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="border border-gray-200 px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(r.id)}
                          onChange={() => handleCheckboxChange(r.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-center text-gray-600">
                        {startIndex + idx + 1}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 font-medium text-gray-700">
                        {r.empCode}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 font-medium text-gray-800">
                        {r.name}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-gray-600">
                        {r.department}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-gray-600">
                        {r.designation}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-gray-600">
                        {r.location}
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            r.attendance === "Present"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.attendance}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            r.misPunch > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.misPunch}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            r.lateComing > 0
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.lateComing}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            r.earlyGoing > 0
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.earlyGoing}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="border border-gray-200 px-6 py-8 text-center text-gray-500"
                    >
                      <svg
                        className="w-12 h-12 mx-auto text-gray-300 mb-2"
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
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {filtered.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition duration-200"
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
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
