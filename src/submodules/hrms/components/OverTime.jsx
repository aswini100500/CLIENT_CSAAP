import React, { useState, useEffect } from "react";
import axios from "axios";

export default function OverTime() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showReport, setShowReport] = useState(false);
const [overtimeData,setOvertimeData]=useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  




  useEffect(() => {

    setMonth("");
    setYear("");
    setShowReport(false);
  }, []);

  function handleSubmit(e) {
  e.preventDefault();
  if (!month || !year) {
    alert("Please select both month and year");
    return;
  }
  fetchOvertimeReport();
}


  const getDaysInMonth = () => {
    const date = new Date(parseInt(year), months.indexOf(month), 1);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth();


  const summary = {
    totalEmployees: overtimeData.length,
    totalOvertimeDays: overtimeData.reduce((total, emp) => 
      total + emp.days.filter(day => day.hours).length, 0
    ),
    totalOvertimeHours: overtimeData.reduce((total, emp) => 
      total + emp.days.reduce((empTotal, day) => 
        empTotal + (parseInt(day.hours) || 0), 0
      ), 0
    )
  };


 const fetchOvertimeReport = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/overtime?month=${month}&year=${year}`);
    setOvertimeData(res.data.data || []);
    setShowReport(true);
  } catch (err) {
    console.error("Error fetching overtime report", err);
    alert("Failed to load overtime report");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Monthly Overtime Report
        </h1>


        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Filter Overtime Report
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

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-6 py-4 font-medium text-gray-700 sticky left-0 bg-gray-100">
                      S1
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
                        className="border border-gray-200 px-3 py-4 text-center font-medium text-gray-700 min-w-12"
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
                  {overtimeData.map((employee) => (
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
                          className={`border border-gray-200 px-3 py-3 text-center text-sm font-medium ${
                            day.hours === "2" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : day.hours === "1" 
                              ? "bg-green-100 text-green-800" 
                              : "text-gray-400"
                          }`}
                        >
                          {day.hours || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


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