import React from "react";

const AllLogs = () => {
  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">All Logs</h1>

      <div className="border border-gray-300">
        <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-900">All Logs</h2>
        </div>

        <div className="px-4 py-3 border-b border-gray-300 bg-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <select className="border border-gray-300 bg-white text-sm py-1">
              <option>10</option>
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Search:</span>
            <input
              type="text"
              className="border border-gray-300 px-2 py-1 text-sm w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100 border-r border-gray-300">
                  Log
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100">
                  Log By
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                  2025-11-22
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                  New Task Added by ADMIN ADMIN For ADMIN ADMIN (yhfyhfyh)
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">ADMIN ADMIN</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-gray-100 border-t border-gray-300 flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Showing 1 to 1 of 1 entries
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-700">Previous</span>
            <span className="text-sm text-gray-700 bg-gray-200 px-2 py-1 border border-gray-300">
              1
            </span>
            <span className="text-sm text-gray-700">40</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLogs;
