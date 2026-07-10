import React, { useState } from "react";
import Vehicle from "../Equipment management/Vehicle";
import EquipmentManage from "../Equipment management/EquipmentManage";
import Operator from "../Equipment management/Operator";
import Drivers from "../Equipment management/Drivers";

const Equipment = () => {
  const [activeTab, setActiveTab] = useState("vehicles");

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Equipment Management
      </h1>

      <div className="flex flex-wrap gap-0.5 border-b border-gray-300 mb-2">
        {["vehicles", "equipment", "operators", "drivers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-blue-600 border-t shadow-xl"
                : "bg-white text-gray-700 hover:bg-blue-50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md transition-all">
        {activeTab === "vehicles" && <Vehicle />}

        {activeTab === "equipment" && <EquipmentManage />}

        {activeTab === "operators" && <Operator />}

        {activeTab === "drivers" && <Drivers />}
      </div>
    </div>
  );
};

export default Equipment;
