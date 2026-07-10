import { List } from "lucide-react";
import React from "react";

export default function EmployeeRejoining() {
  const employees = [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-md overflow-hidden border">
        <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <h2 className="font-semibold text-lg">
              List of All Employee (Total Employee : {employees.length})
            </h2>
          </div>

          <input
            type="text"
            placeholder="Search"
            className="px-3 py-1 rounded border text-white text-sm outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          {employees.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">There is no record</div>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-white text-blue-600 border-b">
                  <th className="border-r px-4 py-2 text-left">Select</th>
                  <th className="border-r px-4 py-2 text-left">Emp Name</th>
                  <th className="border-r px-4 py-2 text-left">Card No</th>
                  <th className="border-r px-4 py-2 text-left">Emp Code</th>
                  <th className="border-r px-4 py-2 text-left">Dept Name</th>
                  <th className="border-r px-4 py-2 text-left">Desig Name</th>
                  <th className="border-r px-4 py-2 text-left">Branch</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="border-r px-4 py-2 text-center">
                      <input type="checkbox" />
                    </td>
                    <td className="border-r px-4 py-2">{emp.name}</td>
                    <td className="border-r px-4 py-2">{emp.cardno}</td>
                    <td className="border-r px-4 py-2">{emp.empcode}</td>
                    <td className="border-r px-4 py-2">{emp.dept}</td>
                    <td className="border-r px-4 py-2">{emp.desig}</td>
                    <td className="px-4 py-2">{emp.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-blue-600 text-white text-center font-medium py-2">
          Transfer To
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-white">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <select className="w-full border px-2 py-1 rounded text-sm">
              <option>Cloudsat Pvt Ltd</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <select className="w-full border px-2 py-1 rounded text-sm">
              <option>DEMO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <select className="w-full border px-2 py-1 rounded text-sm">
              <option>DEMO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation Name
            </label>
            <select className="w-full border px-2 py-1 rounded text-sm">
              <option>DEMO</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center gap-3 py-4 bg-white border-t">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm">
            Move
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
