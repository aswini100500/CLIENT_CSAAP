import React, { useState } from "react";
import MonthlyWorkReport from "./MonthlyWorkReport";
import Timesheet from "./Timesheet";

export default function WorkReportTabs() {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-4 rounded-2xl shadow-sm">
        <div className="max-w-450  px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Work Reports
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                View your daily and monthly work reports.
              </p>
            </div>
          </div>

          {/* Sticky Tabs */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("daily")}
              className={`pb-4 text-sm font-semibold transition-all relative ${
                activeTab === "daily"
                  ? "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Daily Reports
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`pb-4 text-sm font-semibold transition-all relative ${
                activeTab === "monthly"
                  ? "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly Work Reports
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-450 mx-auto py-2 px-4 sm:px-6 lg:px-8">
        {activeTab === "daily" && <Timesheet hideHeader={true} />}
        {activeTab === "monthly" && <MonthlyWorkReport />}
      </div>
    </div>
  );
}
