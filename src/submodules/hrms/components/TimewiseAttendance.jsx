import React, { useState,useeffect } from "react";
import axios from "axios";

export default function TimewiseAttendance() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showReport, setShowReport] = useState(false);
const [searchTerm, setSearchTerm] = useState("");



  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const [attendanceData,setAttendanceData]=useState([]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!month || !year) {
    alert("Please select both month and year");
    return;
  }

  const monthNumber = months.indexOf(month) + 1;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_HRMS_BASE_URL}/api/timewise-attendance/report?month=${monthNumber}&year=${year}&search=${searchTerm}`
    );

    //  Group records by emp_code
    const grouped = data.reduce((acc, record) => {
      const key = record.emp_code;
      if (!acc[key]) {
        acc[key] = {
          empCode: record.emp_code,
          employeeName: record.employee_name,
          department: record.department,
          designation: record.designation,
          location: record.location,
          days: [],
        };
      }

      const day = new Date(record.date).getDate();

      acc[key].days.push({
        day,
        inTime: record.in_time,
        outTime: record.out_time,
        lateBy: record.late_by,
        earlyBy: record.early_by,
        status: record.status,
      });

      return acc;
    }, {});

    //  Convert grouped object into array
    const formatted = Object.values(grouped).map((emp, index) => ({
      s1: index + 1,
      ...emp,
    }));

    setAttendanceData(formatted);
    console.log("formatted data",formatted);
    
    setShowReport(true);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch attendance");
  }
};



  const getDaysInMonth = () => {
    const date = new Date(parseInt(year), months.indexOf(month), 1);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth();



  //search bar filter
  const filteredEmployees = attendanceData.filter(
  (emp) =>
    emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empCode.toLowerCase().includes(searchTerm.toLowerCase())
);


  // Calculate summary statistics
  const summary = {
    totalEmployees: attendanceData.length,
    totalPresent: attendanceData.reduce((total, emp) => 
      total + emp.days.filter(day => day.status === "Present").length, 0
    ),
    totalAbsent: attendanceData.reduce((total, emp) => 
      total + emp.days.filter(day => day.status === "Absent").length, 0
    ),
    averageHours: "9.2 hrs"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Monthly Attendance
        </h1>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Monthly Attendance
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

        {/* Report Section */}
        {showReport && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">

            {/* <div className="mb-6 flex justify-end">
  <input
    type="text"
    placeholder="Search by name or emp code..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
  />
</div> */}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalEmployees}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Present</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{summary.totalPresent}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Total Absent</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{summary.totalAbsent}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Avg Hours/Day</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{summary.averageHours}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

  <div className="mb-6 flex justify-end">
  <input
    type="text"
    placeholder="Search by name or emp code..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
  />
</div>

   {/* Attendance Table */}
<div className="overflow-x-auto">
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700">
          S1
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

        {/* Day Headers */}
        {Array.from({ length: daysInMonth }, (_, i) => (
          <th
            key={i + 1}
            className="border border-gray-200 px-4 py-4 text-center font-medium text-gray-700 min-w-20 text-sm"
          >
            <div>{i + 1}</div>
            <div className="text-xs text-gray-500 font-normal">
              {month.slice(0, 3)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
    <tbody>

      
     {filteredEmployees.map((employee) => (
  <React.Fragment key={employee.empCode}>
    {/* Main Employee Row */}
    <tr className="hover:bg-gray-50">
      <td className="border border-gray-200 px-6 py-3 text-center font-medium text-gray-700">
        {employee.s1}
      </td>
      <td className="border border-gray-200 px-6 py-3 font-medium text-gray-600">
        {employee.empCode}
      </td>
      <td className="border border-gray-200 px-6 py-3 font-medium text-gray-600">
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

      {/* Status Day Cells */}
      {employee.days.slice(0, daysInMonth).map((day) => (
        <td
          key={day.day}
          className={`border border-gray-200 px-4 py-4 text-center text-sm font-medium ${
            day.status === "Present"
              ? "bg-green-100 text-green-800"
              : day.status === "Absent"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {day.status === "Present"
            ? "P"
            : day.status === "Absent"
            ? "A"
            : "-"}
        </td>
      ))}
    </tr>

    {/* Time Details Rows */}
    {["In Time", "Out Time", "Late By", "Early By"].map((detailType) => (
      <tr key={detailType} className="hover:bg-gray-50">
        <td
          colSpan="6"
          className="border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-50"
        >
          {detailType}
        </td>
        {employee.days.slice(0, daysInMonth).map((day) => (
          <td
            key={day.day}
            className="border border-gray-200 px-5 py-4 text-center text-base text-gray-700"
          >
            {detailType === "In Time" && day.inTime}
            {detailType === "Out Time" && day.outTime}
            {detailType === "Late By" && (day.lateBy || "-")}
            {detailType === "Early By" && (day.earlyBy || "-")}
          </td>
        ))}
      </tr>
    ))}
  </React.Fragment>
))}

                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Attendance Legend:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-green-100 border border-green-300 mr-2 rounded"></span>
                    <span className="text-green-700 font-medium">P</span>
                    <span className="text-gray-600 ml-1">= Present</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-red-100 border border-red-300 mr-2 rounded"></span>
                    <span className="text-red-700 font-medium">A</span>
                    <span className="text-gray-600 ml-1">= Absent</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-yellow-100 border border-yellow-300 mr-2 rounded"></span>
                    <span className="text-gray-600">Late By = Arrival delay</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-blue-100 border border-blue-300 mr-2 rounded"></span>
                    <span className="text-gray-600">Early By = Early departure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animation for fade-in effect */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}