import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeLeaveList({ setActiveMenu }) {
  const [search, setSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee`,
        );
        const formatted = (res.data.data || []).map((emp) => ({
          id: emp.id,
          name: emp.name || "N/A",
          department: emp.department || "Not Assigned",
          designation: emp.jobTitle || "Not Assigned",
          branch: emp.branch || "Main Branch",
          cl: emp.cl || 0,
          sl: emp.sl || 0,
          el: emp.el || 0,
          dateOfJoin: emp.dateOfJoin || emp.joinDate || emp.doj || "N/A",
        }));

        setEmployees(formatted);
      } catch (err) {
        console.error("❌ Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.branch.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const isAllSelected =
    filteredEmployees.length > 0 &&
    selectedEmployees.length === filteredEmployees.length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center font-semibold text-lg">
        <span className="mr-2">📋</span> List of Employees for Leave
      </div>

      <div className="bg-white shadow p-4 rounded-md m-4 border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="font-medium text-gray-700 text-sm whitespace-nowrap">
            Search Employee:
          </label>
          <input
            type="text"
            placeholder="Search by name, card no, department, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="text-sm text-gray-500">
            {filteredEmployees.length} employee(s) found
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-md m-4 border overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-blue-50">
            <tr className="text-blue-600">
              <th className="p-3 border text-left font-semibold">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  Select All
                </div>
              </th>
              <th className="p-3 border text-left font-semibold">
                Employee Name
              </th>
              <th className="p-3 border text-left font-semibold">Card No.</th>
              <th className="p-3 border text-left font-semibold">Emp. Code</th>
              <th className="p-3 border text-left font-semibold">Department</th>
              <th className="p-3 border text-left font-semibold">
                Designation
              </th>
              <th className="p-3 border text-left font-semibold">
                Date of Join
              </th>
              <th className="p-3 border text-left font-semibold">Branch</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                className={`hover:bg-gray-50 border-b ${
                  selectedEmployees.includes(emp.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="p-3 border text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => handleSelectEmployee(emp.id)}
                  />
                </td>
                <td
                  className="p-3 border font-medium text-gray-800"
                  onClick={() => setActiveMenu("Leave Application inside")}
                >
                  {emp.name}
                </td>
                <td className="p-3 border text-gray-600 font-mono">
                  {emp.cardNo}
                </td>
                <td className="p-3 border text-gray-600">{emp.empCode}</td>
                <td className="p-3 border text-gray-600">{emp.department}</td>
                <td className="p-3 border text-gray-600">{emp.designation}</td>
                <td className="p-3 border text-gray-600">{emp.dateOfJoin}</td>
                <td className="p-3 border text-gray-600">{emp.branch}</td>
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

      {selectedEmployees.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md mx-4 p-3">
          <div className="text-sm text-blue-700 font-medium">
            {selectedEmployees.length} employee(s) selected for leave processing
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6 mb-8">
        <button
          onClick={() => navigate("/attendance-home")}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded font-medium transition-colors duration-200"
        >
          Home
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded font-medium transition-colors duration-200">
          Close
        </button>
      </div>
    </div>
  );
}
