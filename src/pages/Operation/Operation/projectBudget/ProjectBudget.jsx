import React, { useState } from "react";
import MainInfo from "./MainInfo";
import OutFlow from "./OutFlow";
import Inflow from "./Inflow";
import Attachment from "./Attachment";
import ApprovalHistrory from "./ApprovalHistrory";
import ChangeHistory from "./ChangeHistory";

const tabs = [
  { id: "mainInfo", label: "Main Info", component: <MainInfo /> },
  { id: "outFlow", label: "Out Flow", component: <OutFlow /> },
  { id: "inFlow", label: "In Flow", component: <Inflow /> },
  { id: "attachment", label: "Attachment", component: <Attachment /> },
  { id: "approvalHistory", label: "Approval History", component: <ApprovalHistrory /> },
  { id: "changeHistory", label: "History of project budget", component: <ChangeHistory /> },
];

const ProjectBudgetTabs = () => {
  const [activeTab, setActiveTab] = useState("mainInfo");

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 bg-white shadow rounded-md">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-300 bg-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-r border-gray-300
              ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="p-6">{activeContent}</div>
    </div>
  );
};

export default ProjectBudgetTabs;
