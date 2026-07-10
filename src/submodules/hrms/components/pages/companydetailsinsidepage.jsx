import React from "react";

export default function CompanyDetailsInsidePage({ selectedCompany }) {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-600">
          Company Details
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              className="w-full border rounded-lg p-1.5 text-sm"
              defaultValue={selectedCompany?.name}
            />{" "}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              className="w-full border rounded-lg p-1.5 text-sm"
              defaultValue={
                selectedCompany
                  ? `${selectedCompany?.address_line || ""} ${selectedCompany?.city || ""} ${selectedCompany?.state || ""} ${selectedCompany?.postal_code || ""} ${selectedCompany?.country || ""}`
                  : ""
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID
            </label>
            <input
              className="w-full border rounded-lg p-1.5 text-sm"
              defaultValue={selectedCompany?.admin_email}
            />{" "}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone No
            </label>
            <input
              className="w-full border rounded-lg p-1.5 text-sm"
              defaultValue={selectedCompany?.admin_phone}
            />{" "}
          </div>
        </div>


        <h3 className="text-lg font-semibold mt-8 mb-2 text-blue-600">
          Advanced Company Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Account Number
            </label>
            <input className="w-full border rounded-lg p-1.5 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PT Application OR Not
            </label>
            <select className="w-full border rounded-lg p-1.5 text-sm">
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company PF Reg. No
            </label>
            <input className="w-full border rounded-lg p-1.5 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ESI Limit Amount
            </label>
            <input className="w-full border rounded-lg p-1.5 text-sm" />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Company ESI Reg.No
            </label>
            <input className="w-full p-1.5 text-sm border rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Company PAN No
            </label>
            <input className="w-full p-1.5 text-sm border rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Employee PF Share%
            </label>
            <input className="w-full p-1.5 text-sm border rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Employer PF Share%
            </label>
            <input className="w-full p-1.5 text-sm border rounded-lg" />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              GST No
            </label>
            <input className="w-full p-1.5 text-sm border rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Employer ESI Share%
            </label>
            <input className="w-full p-1.5 text-sm border rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Registration No *
            </label>
            <input className="w-full p-1.5 text-sm border rounded-lg" />
          </div>
        </div>


        <h3 className="text-lg font-semibold mt-8 mb-2 text-blue-600">
          Define Addition Heads
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Head{i + 1}
              </label>
              <input className="w-full border rounded-lg p-1.5 text-sm" />
            </div>
          ))}
        </div>


        <h3 className="text-lg font-semibold mt-8 mb-2 text-blue-600">
          Fixed Deduction Heads
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head{i + 1}
              </label>
              <input className="w-full border rounded-lg p-1.5 text-sm" />
            </div>
          ))}
        </div>


        <h3 className="text-lg font-semibold mt-8 mb-2 text-blue-600">
          Define Deduction Heads
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head{i + 1}
              </label>
              <input className="w-full border rounded-lg p-1.5 text-sm" />
            </div>
          ))}
        </div>


        <div className="flex gap-4 justify-center mt-8">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg">
            Save
          </button>
          <button className="bg-red-500 text-white px-6 py-2 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
