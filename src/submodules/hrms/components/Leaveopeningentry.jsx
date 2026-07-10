import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function LeaveOpeningEntry() {
  const [year, setYear] = useState("2025");
  const [cl, setCl] = useState("0");
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] = useState("CL");

  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee`,
        );

        const formatted = (res.data.data || []).map((emp) => ({
          code: emp.id,
          name: emp.name || "N/A",
          department: emp.department || "Not Assigned",
          designation: emp.jobTitle || "Not Assigned",
          branch: emp.branch || "Main Branch",
          cl: emp.cl || 0,
          sl: emp.sl || 0,
          el: emp.el || 0,
        }));

        setEmployees(formatted);
      } catch (err) {
        console.error("❌ Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);
  const leaveTypes = ["CL", "SL", "EL"];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.branch.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddBalance = () => {
    if (selectedEmployee && cl > 0) {
      const emp = employees.find((e) => e.name === selectedEmployee);
      if (emp) {
        Swal.fire({
          title: "Success!",
          text: `${cl} ${selectedLeaveType} days added to ${emp.name}`,
          icon: "success",
          confirmButtonColor: "#16a34a",
        });
      }
    } else {
      Swal.fire({
        title: "Error",
        text: "Please select an employee and enter valid leave days",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleClearAllBalance = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will clear all leave balances!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clear all",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Cleared!",
          "All leave balances have been cleared.",
          "success",
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center font-semibold text-lg">
        <span className="mr-2">📋</span> Leave Opening Entry
      </div>

      <div className="bg-white shadow p-4 rounded-md m-4 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.code} value={emp.name}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, department, designation..."
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Leave Type
            </label>
            <select
              value={selectedLeaveType}
              onChange={(e) => setSelectedLeaveType(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleClearAllBalance}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
            >
              Clear All Leave Balance
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded-md m-4 border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Year
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {selectedLeaveType} Days
            </label>
            <input
              type="number"
              value={cl}
              onChange={(e) => setCl(e.target.value)}
              min="0"
              max="30"
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-md m-4 border overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 text-left border font-semibold">Emp.Code</th>
              <th className="p-3 text-left border font-semibold">Emp.Name</th>
              <th className="p-3 text-left border font-semibold">Department</th>
              <th className="p-3 text-left border font-semibold">
                Designation
              </th>
              <th className="p-3 text-left border font-semibold">Branch</th>
              <th className="p-3 text-center border font-semibold">CL</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.code} className="hover:bg-gray-50 border-b">
                <td className="p-3 border">{emp.code}</td>
                <td className="p-3 border font-medium text-gray-800">
                  {emp.name}
                </td>
                <td className="p-3 border text-gray-600">{emp.department}</td>
                <td className="p-3 border text-gray-600">{emp.designation}</td>
                <td className="p-3 border text-gray-600">{emp.branch}</td>

                <td className="p-3 border text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      emp.el > 12
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {emp.el}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No employees found matching your search criteria.
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-6 mb-8">
        <button
          onClick={handleAddBalance}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded font-medium transition-colors duration-200"
        >
          Add Balance
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded font-medium transition-colors duration-200">
          Old Leave Balance Entry Form
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded font-medium transition-colors duration-200">
          Close
        </button>
      </div>
    </div>
  );
}
