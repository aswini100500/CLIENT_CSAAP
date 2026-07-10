import React, { useState } from "react";
import PurchaseEntry from "./PurchaseEntry";
import PurchaseHistory from "./PurchaseHistory";
import PurchaseLedger from "./PurchaseLedger";

const PurchaseMain = () => {
  const [activeTab, setActiveTab] = useState("purchaseEntry");

  const tabs = [
    { id: "purchaseEntry", label: "Purchase Entry", icon: "📝" },
    { id: "purchaseHistory", label: "Purchase History", icon: "📋" },
    { id: "purchaseLedger", label: "Purchase Ledger", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="bg-white shadow-xl rounded-b-xl mb-6">
        <div className="container mx-auto px-4">
          <div className="flex relative">
            <div
              className="absolute bottom-0 h-1 bg-linear-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-in-out"
              style={{
                width: `${100 / tabs.length}%`,
                left: `${tabs.findIndex((tab) => tab.id === activeTab) * (100 / tabs.length)}%`,
              }}
            />

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 relative group px-8 py-5 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-blue-700 bg-linear-to-b from-blue-50 to-white"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-semibold tracking-wide">
                    {tab.label}
                  </span>

                  {activeTab === tab.id && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-10 border-r-10 border-b-10 border-l-transparent border-r-transparent border-b-white"></div>
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? "ring-2 ring-blue-200 ring-inset"
                        : "group-hover:ring-1 group-hover:ring-blue-100 group-hover:ring-inset"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="animate-fadeIn">
          {activeTab === "purchaseEntry" && <PurchaseEntry />}
          {activeTab === "purchaseHistory" && <PurchaseHistory />}
          {activeTab === "purchaseLedger" && <PurchaseLedger />}
        </div>
      </div>
    </div>
  );
};

export default PurchaseMain;
