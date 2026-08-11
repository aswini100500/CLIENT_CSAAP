import React, { useState } from "react";

import StockEntry from "./StockEntry";
import StockList from "./StockList";
import StockTransferEntry from "./StockTransferEntry";
import StockTransferAccept from "./StockTransferAccept";

import { PlusCircle, ClipboardList, ArrowLeftRight, CheckSquare } from "lucide-react";

const StockMain = () => {
  const [activeTab, setActiveTab] = useState("stockEntry");

  const tabs = [
    { id: "stockEntry", label: "Stock Entry", icon: <PlusCircle className="w-4 h-4 text-green-600 mr-2" /> },
    { id: "stockList", label: "Stock List", icon: <ClipboardList className="w-4 h-4 text-green-600 mr-2" /> },
    { id: "stockTransferEntry", label: "Stock Transfer Entry", icon: <ArrowLeftRight className="w-4 h-4 text-green-600 mr-2" /> },
    { id: "stockTransferAccept", label: "Stock Transfer Accept", icon: <CheckSquare className="w-4 h-4 text-green-600 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="bg-gray-100/90 border-b border-gray-200/80 pt-2.5">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 px-4 sm:px-6 lg:px-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium rounded-t-xl transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-white text-green-700 border-t-2 border-green-600 font-semibold shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/80"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="animate-fadeIn">
          {activeTab === "stockEntry" && <StockEntry />}
          {activeTab === "stockList" && <StockList />}
          {activeTab === "stockTransferEntry" && <StockTransferEntry />}
          {activeTab === "stockTransferAccept" && <StockTransferAccept />}
        </div>
      </div>
    </div>
  );
};

export default StockMain;
