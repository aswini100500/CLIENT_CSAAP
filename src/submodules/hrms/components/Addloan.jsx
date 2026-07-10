import React, { useState } from "react";

const AddNewLoan = () => {
  const [formData, setFormData] = useState({
    loanName: "",
    employee: "DEMO/2",
    loanType: "",
    amount: "",
    interestRate: "0",
    term: "1",
    startDate: "",
    totalAmount: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateEMI = () => {
    const P = parseFloat(formData.amount) || 0;
    const R = (parseFloat(formData.interestRate) || 0) / 12 / 100;
    const N = parseInt(formData.term) || 1;

    if (P > 0 && R >= 0 && N > 0) {
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      alert(`EMI: ₹${emi.toFixed(2)} per month`);
    } else {
      alert("Please fill Amount, Interest Rate, and Term to calculate EMI.");
    }
  };

  const handleSave = () => {
    console.log("Loan Data:", formData);
    alert("Loan saved successfully!");
  };

  const handleCancel = () => {
    setFormData({
      loanName: "",
      employee: "DEMO/2",
      loanType: "",
      amount: "",
      interestRate: "0",
      term: "1",
      startDate: "",
      totalAmount: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      <div className="bg-linear-to-r from-blue-500 to-blue-700 text-white font-semibold text-base px-6 py-3 rounded-t-lg flex items-center gap-2 shadow-sm">
        <span className="text-lg">Add New Loan</span>
      </div>

      <div className="bg-white rounded-b-lg shadow-md p-6 space-y-5">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Loan Name:
            </label>
            <input
              type="text"
              name="loanName"
              value={formData.loanName}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Employee:
            </label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 cursor-pointer"
            >
              <option>DEMO/2</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Loan Type:
            </label>
            <select
              name="loanType"
              value={formData.loanType}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>-- Select Loan Type --</option>
              <option>Personal Loan</option>
              <option>Home Loan</option>
              <option>Car Loan</option>
              <option>Education Loan</option>
              <option>Medical Loan</option>
              <option>Emergency Loan</option>
            </select>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount:
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Interest Rate (%):
            </label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Term (months):
            </label>
            <input
              type="number"
              name="term"
              value={formData.term}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
            />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date:
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Total Amount (Principal + Interest):
            </label>
            <input
              type="text"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              readOnly
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
              placeholder=""
            />
          </div>
        </div>


        <div className="pt-1">
          <button
            onClick={calculateEMI}
            className=" bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-4 rounded-md text-xs transition duration-200 shadow-sm uppercase tracking-wider"
          >
            Calculate EMI
          </button>
        </div>


        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-5 rounded-md text-sm transition duration-200 shadow-sm"
          >
            <span className="text-base">Save</span>
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-5 rounded-md text-sm transition duration-200 shadow-sm"
          >
            <span className="text-base">Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewLoan;
