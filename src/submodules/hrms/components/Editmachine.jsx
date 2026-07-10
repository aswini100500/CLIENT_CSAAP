import { List } from "lucide-react";
import React from "react";

export default function MachineList({ setActiveMenu, machines = [] }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-md overflow-hidden">

        <div className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2">
          <List className="w-4 h-4" />
          <h2 className="font-semibold text-lg">List of Machine</h2>
        </div>



        <div className="p-4 bg-white h-100 overflow-y-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Machine No</th>

                <th className="border px-3 py-2 text-left">Machine Model</th>

                <th className="border px-3 py-2 text-left">
                  Machine Serial Number
                </th>
              </tr>
            </thead>
            <tbody>
              {machines.length > 0 ? (
                machines.map((m, i) => (
                  <tr key={i}>
                    <td className="border px-3 py-2">{m.machineNo}</td>

                    <td className="border px-3 py-2">{m.type}</td>

                    <td className="border px-3 py-2">{m.serialNo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No machines added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={() => setActiveMenu("Add Machine")}
          className="bg-[#ff5200] text-white px-4 py-2 rounded-md"
        >
          + Add Machine
        </button>

        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
          Delete
        </button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
          Close
        </button>
      </div>
    </div>
  );
}
