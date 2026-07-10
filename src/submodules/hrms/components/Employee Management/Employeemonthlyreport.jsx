import React from "react";
import { useState } from "react";

const EmployeeReport = () => {
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2011");
  const [selectedEmployee, setSelectedEmployee] = useState("ADMIN");
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState([]);


  const sampleReportData = [
    {
      date: "2023-03-01",
      details: [
        {
          project: "Project Alpha",
          hours: 6,
          description: "Frontend development",
        },
        { project: "Project Beta", hours: 2, description: "Code review" },
      ],
    },
    {
      date: "2023-03-02",
      details: [
        { project: "Project Alpha", hours: 8, description: "API integration" },
      ],
    },
    {
      date: "2023-03-03",
      details: [
        {
          project: "Project Beta",
          hours: 4,
          description: "Database optimization",
        },
        {
          project: "Project Gamma",
          hours: 4,
          description: "Meeting and planning",
        },
      ],
    },
  ];

  const handleDisplayReport = () => {
    setShowReport(true);
    setReportData(sampleReportData);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDailyTotal = (details) => {
    return details.reduce((total, item) => total + item.hours, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className=" mx-auto bg-white rounded-lg shadow-md">

        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-bold text-center">
            Employee Timesheet Report
          </h1>
          <p className="text-blue-100 text-center text-xs mt-1">
            Detailed monthly timesheet overview
          </p>
        </div>


        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option>2011</option>
                <option>2012</option>
                <option>2013</option>
                <option>2014</option>
                <option>2015</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option>ADMIN</option>
                <option>Manager</option>
                <option>Developer</option>
                <option>Designer</option>
              </select>
            </div>

            <div>
              <button
                onClick={handleDisplayReport}
                className="w-full bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition duration-200 font-medium"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>


        {showReport && (
          <div className="p-3 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Timesheet for {selectedEmployee} - {selectedMonth} {selectedYear}
            </h2>
            <p className="text-center text-gray-600 text-xs mt-1">
              {reportData.length} days with recorded entries
            </p>
          </div>
        )}


        <div className="p-4">
          {!showReport ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-600 mb-1">
                No Report Generated
              </h3>
              <p className="text-gray-500 text-sm">
                Select filters and click "Generate Report"
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportData.map((day, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow transition-shadow duration-200"
                >

                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {formatDate(day.date)}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {calculateDailyTotal(day.details)}h total
                      </span>
                    </div>
                  </div>


                  <div className="p-3">
                    <div className="space-y-2">
                      {day.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {detail.project}
                            </h4>
                            <p className="text-gray-600 text-xs truncate">
                              {detail.description}
                            </p>
                          </div>
                          <div className="ml-2 shrink-0">
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              {detail.hours}h
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>


                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Daily Summary:</span>
                        <span className="font-semibold text-gray-800">
                          {calculateDailyTotal(day.details)}h •{" "}
                          {day.details.length} project
                          {day.details.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}


              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">
                      Total Days
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {reportData.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">
                      Total Hours
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {reportData.reduce(
                        (total, day) =>
                          total + calculateDailyTotal(day.details),
                        0,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">
                      Avg Hours/Day
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {(
                        reportData.reduce(
                          (total, day) =>
                            total + calculateDailyTotal(day.details),
                          0,
                        ) / reportData.length
                      ).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;
