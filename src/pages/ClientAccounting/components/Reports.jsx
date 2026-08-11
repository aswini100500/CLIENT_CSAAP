import React from "react";
import { useState } from "react";
import { Scale, TrendingUp } from "lucide-react";
import ProfitLoss from "./Profit&Loss";
import BalanceSheet from "./BalanceSheet";

function Reports() {
  const [selectedReport, setSelectedReport] = useState("Profit & Loss Account");

  const reports = [
    {
      id: "Profit & Loss Account",
      label: "Profit & Loss Account",
      icon: TrendingUp,
    },
    { id: "Balance Sheet", label: "Balance Sheet", icon: Scale },
  ];

  return (
    <div className="erp-root app-shell min-h-screen p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="app-panel p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="app-title">Financial Reports</h1>
            <p className="app-subtitle mt-1">
              Comprehensive profit & loss statements and balance sheet
              reporting.
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-[#f0fdf4] rounded-xl border border-[#c6f1d6]/80">
            {reports.map((report) => {
              const Icon = report.icon;
              const isActive = selectedReport === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#00a651] text-white shadow-xs font-extrabold active:scale-[0.98]"
                      : "text-[#475569] hover:text-[#042f2e] hover:bg-white/70"
                  }`}
                >
                  <Icon className="size-4" />
                  {report.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {selectedReport === "Profit & Loss Account" && <ProfitLoss />}
          {selectedReport === "Balance Sheet" && <BalanceSheet />}
        </div>
      </div>
    </div>
  );
}

export default Reports;
