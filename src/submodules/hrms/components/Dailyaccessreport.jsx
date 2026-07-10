import React, { useState } from "react";

export default function DailyAccessReport() {
  const [reportDate, setReportDate] = useState("2025-11-08");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-md shadow-md overflow-hidden">
        <div className="bg-linear-to-r from-blue-500 to-blue-400 text-white font-semibold px-4 py-2 flex items-center space-x-2">
          <span className="text-lg">📋 Daily Access Report</span>
        </div>

        <div className="p-6 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="font-medium text-gray-700">Report Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="border border-gray-300 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm shadow">
              Open & Close Gate
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm shadow">
              Export in Excel
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm shadow">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
