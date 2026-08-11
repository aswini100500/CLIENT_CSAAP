import React from "react";
import { useState } from "react";
import { HiReceiptRefund } from "react-icons/hi";
import { BiReceipt } from "react-icons/bi";
import { MdPayments } from "react-icons/md";

import Gstr2a from "./Gstr2a";
import Gstr2b from "./Gstr2b";
import ChallanReconcilation from "./ChallanReconcilation";
const Reconciliation = () => {
  const [activeTab, setActiveTab] = useState("gstr2a");

  const tabs = [
    { id: "gstr2a", label: "GSTR-2A", icon: <BiReceipt /> },
    { id: "gstr2b", label: "GSTR-2B", icon: <HiReceiptRefund /> },
    { id: "challan", label: "Challan Reconciliation", icon: <MdPayments /> },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "gstr2a" && <Gstr2a />}
        {activeTab === "gstr2b" && <Gstr2b />}
        {activeTab === "challan" && <ChallanReconcilation />}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Note:</span> Regular reconciliation
          helps in identifying ITC mismatches early and ensures accurate tax
          credit claims.
        </p>
      </div>
    </div>
  );
};

export default Reconciliation;
