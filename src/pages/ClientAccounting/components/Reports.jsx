import React, { useState } from "react";
import ProfitLoss from "./Profit&Loss";
import BalanceSheet from "./BalanceSheet";

function Reports() {
  const [selectedReport, setSelectedReport] = useState("Profit & Loss Account");

  const reports = [
    "Profit & Loss Account",
    "Balance Sheet",
  ];

  return (
    <div className="min-h-screen bg-[#FDFBE6] font-[calibri] text-[15px]">

      <div className="bg-gray-200 text-gray-800 flex items-center justify-start   shadow">
        <div className="flex ">
          {reports.map((report) => (
            <button
              key={report}
              onClick={() => setSelectedReport(report)}
              className={`px-4 py-1 rounded-sm text-sm transition-all 
                ${
                  selectedReport === report
                    ? "bg-white border-t-2 border-r-2 border-l-2 text-[#1C5D99] shadow-2xl"
                    : "bg-white "
                }`}
            >
              {report}
            </button>
          ))}
        </div>
      </div>


      <div className="mt-2 py-3 px-2 mx-auto">
        <h2 className="text-xl font-semibold text-[#1C5D99] mb-4 border-b border-gray-300 pb-1">
          {selectedReport}
        </h2>

        <div className="bg-white border border-gray-200 p-6 rounded-sm">
          {selectedReport === "Trial Balance" && (
            <p className="text-gray-700">
              Displaying <span className="font-semibold">Trial Balance</span> —
              showing debit and credit balances for each ledger.
            </p>
          )}

        {selectedReport === "Profit & Loss Account" && (
          <ProfitLoss />
        )}

          {selectedReport === "Balance Sheet" && (
           <BalanceSheet />
          )}

          {selectedReport === "Ledger Summary" && (
            <p className="text-gray-700">
              Displaying <span className="font-semibold">Ledger Summary</span> —
              details of all ledger accounts with opening and closing balances.
            </p>
          )}
        </div>

    
      </div>

    </div>
  );
}

export default Reports;
