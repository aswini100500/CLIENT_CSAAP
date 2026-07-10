import React, { useState } from "react";

export default function SalaryReport() {
  const [month, setMonth] = useState("2025-11");

  const sections = [
    { title: "Company", items: ["Cloudsat Pvt Ltd"] },
    { title: "Branch", items: ["DEMO"] },
    { title: "Department", items: ["DEMO"] },
    { title: "Designation", items: ["DEMO"] },
    { title: "Employee", items: ["demo(1)"], search: true },
  ];

  return (
    <div className="p-6 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h1 className="text-white text-xl font-bold">Salary Report</h1>
            <p className="text-blue-100 text-sm mt-1">Generate and manage salary reports</p>
          </div>


          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  For Month
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="text-sm text-gray-500">
                Selected: <span className="font-medium text-blue-600">{month}</span>
              </div>
            </div>
          </div>


          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">Selection By</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {sections.map((sec, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm">{sec.title}</h3>
                  

                  <div className="space-y-2 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name={sec.title} 
                        defaultChecked 
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800">All {sec.title}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name={sec.title} 
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800">Few {sec.title}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="text-blue-500 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800">Select All</span>
                    </label>
                  </div>


                  <div className="border border-gray-300 rounded-lg bg-white h-40 overflow-hidden flex flex-col">
                    {sec.search && (
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search employee..."
                          className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-2">
                      {sec.items.map((item, i) => (
                        <label key={i} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-blue-50 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="text-blue-500 focus:ring-blue-500 rounded"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">Select Report Type</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: "monthly", label: "Monthly Statement", defaultChecked: true },
                { id: "payslip", label: "Pay-Slip" },
                { id: "excel", label: "Download Excel for Bank Upload" },
                { id: "vertical", label: "Pay-Slip Vertical" }
              ].map((report) => (
                <label key={report.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200">
                  <input 
                    type="radio" 
                    name="reportType" 
                    defaultChecked={report.defaultChecked}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{report.label}</span>
                </label>
              ))}
            </div>
          </div>


          <div className="p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button className="px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Show Report
              </button>
              <button className="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Salary Slip On Mail
              </button>
              <button className="px-6 py-3 bg-linear-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:from-gray-600 hover:to-gray-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}