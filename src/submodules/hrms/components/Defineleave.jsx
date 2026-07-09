import { List } from "lucide-react";
import React from "react";

export default function DefineLeave({ setActiveMenu }) {
  const leavePolicies = [
    {
      code: "CL",
      name: "Casual Leave",
      includeWeeklyOff: "Yes",
      includeHoliday: "Yes",
      type: "Yearly",
    },
    {
      code: "SL",
      name: "Sick Leave",
      includeWeeklyOff: "No",
      includeHoliday: "Yes",
      type: "Yearly",
    },
    {
      code: "EL",
      name: "Earned Leave",
      includeWeeklyOff: "Yes",
      includeHoliday: "No",
      type: "Monthly",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-md overflow-hidden border">
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-2 flex items-center gap-2">
          <List className="w-4 h-4" />
          <h2 className="font-semibold text-lg">Define Leave</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white text-blue-600 border-b">
                <th className="border-r px-4 py-2 text-left w-16">Select</th>
                <th className="border-r px-4 py-2 text-left">Leave Code</th>
                <th className="border-r px-4 py-2 text-left">Leave Name</th>
                <th className="border-r px-4 py-2 text-left">
                  Include Weekly Off
                </th>
                <th className="border-r px-4 py-2 text-left">
                  Include Holiday
                </th>
                <th className="px-4 py-2 text-left">Leave Type</th>
              </tr>
            </thead>
            <tbody>
              {leavePolicies.map((leave, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="border-r px-4 py-2 text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="border-r px-4 py-2 font-medium text-blue-700 cursor-pointer hover:underline">
                    {leave.code}
                  </td>
                  <td className="border-r px-4 py-2">{leave.name}</td>
                  <td className="border-r px-4 py-2">
                    {leave.includeWeeklyOff}
                  </td>
                  <td className="border-r px-4 py-2">{leave.includeHoliday}</td>
                  <td className="px-4 py-2">{leave.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3 py-4 bg-white">
          <button
            onClick={() => setActiveMenu("Add Leave")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm"
          >
            Add
          </button>

          <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded text-sm">
            Delete
          </button>

          <button className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
