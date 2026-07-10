import React from "react";

export default function LeaveApplicationPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-xl p-6">

        <div className="bg-blue-600 text-white px-4 py-2 rounded-md mb-6 font-semibold text-lg">
          Leave Application
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Employee Code *
            </label>
            <input
              className="w-full border rounded-md p-2"
              placeholder="Employee Code"
            />
          </div>


          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Date From *
            </label>
            <input type="date" className="w-full border rounded-md p-2" />
          </div>


          <div>
            <label className="block font-medium text-gray-700 mb-1">
              To From *
            </label>
            <input type="date" className="w-full border rounded-md p-2" />
          </div>


          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              className="w-full border rounded-md p-2"
              placeholder="Employee Name"
            />
          </div>


          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Father/Husband Name
            </label>
            <input className="w-full border rounded-md p-2" placeholder="" />
          </div>


          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Card No.
            </label>
            <input
              className="w-full border rounded-md p-2"
              placeholder="0000001"
            />
          </div>
        </div>


        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Leave Name *
            </label>
            <select className="w-full border rounded-md p-2">
              <option>CL</option>
              <option>SL</option>
              <option>EL</option>
            </select>
          </div>


          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <input
              className="w-full border rounded-md p-2"
              placeholder="Reason for leave"
            />
          </div>
        </div>


        <div className="mt-6 border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Opening</th>
                <th className="border px-4 py-2 text-left">Consume</th>
                <th className="border px-4 py-2 text-left">Balance</th>
                <th className="border px-4 py-2 text-left">Leave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">0.00</td>
                <td className="border px-4 py-2">0.00</td>
                <td className="border px-4 py-2">0.00</td>
                <td className="border px-4 py-2">CL</td>
              </tr>
            </tbody>
          </table>
        </div>


        <div className="mt-8 border rounded-md">
          <div className="bg-blue-700 text-white px-4 py-2 font-semibold text-sm">
            Leave Balance
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="leaveType" /> Quarter
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="leaveType" /> Half Day
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="leaveType" /> Three Fourth
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="leaveType" /> Full Day
            </label>
          </div>
        </div>


        <div className="flex justify-center mt-8 gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm">
            Save
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
