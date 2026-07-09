import React from "react";

export default function DepartmentDetailsInsidePage({
  selectedDepartment,
  setActiveMenu,
}) {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-blue-600 flex items-center gap-2">
          <span className="text-blue-600">▦</span> Department
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              className="w-full border rounded-md p-1.5 text-sm"
              value={selectedDepartment?.name || ""}
              readOnly
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Department Head Email Address
            </label>
            <input
              className="w-full border rounded-md p-1.5 text-sm"
              value={selectedDepartment?.email || ""}
              readOnly
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <button className="bg-green-600 text-white px-5 py-1.5 rounded-md text-sm">
            Save
          </button>
          <button className="bg-red-500 text-white px-5 py-1.5 rounded-md text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
