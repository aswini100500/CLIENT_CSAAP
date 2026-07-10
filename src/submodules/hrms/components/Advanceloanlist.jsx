import { Calendar, Eye, Filter, PlusCircle, Search } from "lucide-react";
import React, { useState } from "react";

export default function AdvanceLoanList({ setActiveMenu }) {
  const [search, setSearch] = useState("");
  const [loanType, setLoanType] = useState("Active Loan");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 font-sans">

      <div className="max-w-7xl mx-auto">

        <div className="bg-linear-to-r from-blue-500 to-blue-700 text-white px-6 py-4 rounded-2xl shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Advance/Loan List</h1>
                <p className="text-orange-100 text-sm mt-1">
                  Manage and track employee loans efficiently
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
              <span className="font-semibold">Total Records: </span>
              <span className="font-bold text-white">0</span>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Filters & Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Employee
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Enter employee name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                >
                  <option>Active Loan</option>
                  <option>Closure Loan</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>


            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200">
                  <Eye size={18} />
                  VIEW RECORDS
                </button>
                <div className="text-red-500 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  No Record Found
                </div>
              </div>

              <button
                onClick={() => setActiveMenu("Add New Loan")}
                className="bg-linear-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusCircle size={18} />
                ADD NEW LOAN
              </button>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No loans found
            </h3>
            <p className="text-gray-600 mb-6">
              {search || loanType !== "Active Loan" || dateFrom || dateTo
                ? "Try adjusting your filters to see more results."
                : "Get started by adding your first employee loan."}
            </p>
            <button className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transition-all duration-200">
              <PlusCircle size={18} />
              CREATE FIRST LOAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
