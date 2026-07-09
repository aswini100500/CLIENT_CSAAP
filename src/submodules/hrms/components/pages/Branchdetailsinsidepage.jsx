import React from "react";

export default function BranchDetailsInsidePage({ selectedCompany }) {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-blue-600 flex items-center gap-2">
          <span className="text-blue-600">▦</span> Branch Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <select className="w-full border rounded-md p-1.5 text-sm" disabled>
              <option>{selectedCompany?.name || "No Company"}</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              className="w-full border rounded-md p-1.5 text-sm"
              placeholder="Enter branch name"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              className="w-full border rounded-md p-1.5 text-sm"
              value={selectedCompany?.Address || ""}
              readOnly
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Phone No
            </label>
            <input
              className="w-full border rounded-md p-1.5 text-sm"
              value={selectedCompany?.phone || ""}
              readOnly
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              className="w-full border rounded-md p-1.5 text-sm"
              value={selectedCompany?.email || ""}
              readOnly
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-center">
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
