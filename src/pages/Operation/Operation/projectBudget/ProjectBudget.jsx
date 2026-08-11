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
  {
    id: "approvalHistory",
    label: "Approval History",
    component: <ApprovalHistrory />,
  },
  {
    id: "changeHistory",
    label: "History of project budget",
    component: <ChangeHistory />,
  },
];

const ProjectBudgetTabs = () => {
  const [activeTab, setActiveTab] = useState("mainInfo");

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 bg-white shadow rounded-md overflow-hidden">
      <div className="bg-gray-200">
        <div className="flex space-x-1 px-4 sm:px-6 lg:px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                  ? "bg-white text-green-700 border-t-2 border-green-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">{activeContent}</div>
    </div>
  );
};

export default ProjectBudgetTabs;
