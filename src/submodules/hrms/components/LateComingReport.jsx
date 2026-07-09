import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function MonthlyLateComingReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [search, setSearch] = useState("");

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

  // Sample data for demonstration
  const [employees, setEmployees] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!month || !year) {
      alert("Please select both month and year");
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/late-reports?month=${month}&year=${year}`,
      );

      // Convert backend rows into grouped employee objects
      const data = res.data;
      const grouped = {};

      data.forEach((row) => {
        if (!grouped[row.empCode]) {
          grouped[row.empCode] = {
            sl: Object.keys(grouped).length + 1,
            empCode: row.empCode,
            empName: row.empName,
            department: row.department,
            designation: row.designation,
            location: row.location,
            lateDays: Array(31).fill(false),
          };
        }

        // mark late days
        if (row.status === "Late" && row.day <= 31) {
          grouped[row.empCode].lateDays[row.day - 1] = true;
        }
      });

      setEmployees(Object.values(grouped));
      setShowTable(true);
    } catch (err) {
      console.error("Error fetching late report:", err);
      alert("Failed to load late coming data");
    }
  }

  // 🟢 Export table to Excel
  const handleExportExcel = () => {
    if (employees.length === 0) {
      alert("No data to export!");
      return;
    }

    const wsData = employees.map((emp) => {
      const row = {
        "Emp Code": emp.empCode,
        "Employee Name": emp.empName,
        Department: emp.department,
        Designation: emp.designation,
        Location: emp.location,
      };

      emp.lateDays.forEach((isLate, i) => {
        row[`Day ${i + 1}`] = isLate ? "Late" : "On Time";
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Late Report");

    XLSX.writeFile(wb, `LateComingReport_${month}_${year}.xlsx`);
  };

  // 🟣 Export table to PDF
  // 🟣 Export table to multi-page PDF
  const handleExportPDF = () => {
    if (employees.length === 0) {
      alert("No data to export!");
      return;
    }

    const pdf = new jsPDF("l", "pt", "a4"); // landscape orientation
    pdf.setFontSize(14);
    pdf.text(`Late Coming Report - ${month} ${year}`, 40, 40);

    // Define table headers dynamically based on number of days in the month
    const headers = [
      "Sl",
      "Emp Code",
      "Employee Name",
      "Department",
      "Designation",
      "Location",
      ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
    ];

    // Define table rows
    const data = employees.map((emp) => [
      emp.sl,
      emp.empCode,
      emp.empName,
      emp.department,
      emp.designation,
      emp.location,
      ...Array.from({ length: daysInMonth }, (_, i) =>
        emp.lateDays[i] ? "Late" : "On Time",
      ),
    ]);

    // Generate PDF table
    autoTable(pdf, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 6, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185] }, // blue header
      theme: "grid",
    });

    pdf.save(`LateComingReport_${month}_${year}.pdf`);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.empName.toLowerCase().includes(search.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(search.toLowerCase()),
  );

  const daysInMonth =
    month && year
      ? new Date(parseInt(year), months.indexOf(month) + 1, 0).getDate()
      : 31;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Monthly Late Coming Report
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Late Coming Report
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6"
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
                Display
              </button>
            </div>
          </form>

          {showTable && month && year && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded hover:bg-gray-300 text-sm"
                  >
                    Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-3 py-1.5 bg-red-600 text-white font-medium rounded hover:bg-gray-300 text-sm"
                  >
                    PDF
                  </button>
                </div>

                <div>
                  <label className="mr-2 text-sm font-medium text-gray-700">
                    Search:
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name or code"
                  />
                </div>
              </div>

              <div id="report-table" className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-4 py-3 font-medium text-gray-700 sticky left-0 bg-gray-100">
                        Sl
                      </th>
                      <th className="border border-gray-200 px-4 py-3 font-medium text-gray-700 sticky left-0 bg-gray-100">
                        Emp Code
                      </th>
                      <th className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                        Employee Name
                      </th>
                      <th className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                        Department
                      </th>
                      <th className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                        Designation
                      </th>
                      <th className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                        Location
                      </th>
                      {Array.from({ length: daysInMonth }, (_, i) => (
                        <th
                          key={i + 1}
                          className="border border-gray-200 px-4 py-3 font-medium text-gray-700 text-center"
                        >
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.sl} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 text-gray-700 sticky left-0 bg-white">
                          {emp.sl}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700 sticky left-0 bg-white">
                          {emp.empCode}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">
                          {emp.empName}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">
                          {emp.department}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">
                          {emp.designation}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">
                          {emp.location}
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <td
                            key={i + 1}
                            className={`border border-gray-200 px-4 py-2 text-center ${
                              emp.lateDays[i]
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {emp.lateDays[i] ? "Late" : "On Time"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <span>
                  Showing 1 to 1 of {filteredEmployees.length} entries
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    Previous
                  </button>
                  <span className="px-3 py-1">1</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
