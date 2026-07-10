import React from "react";
import { motion } from "framer-motion";
import { FaProjectDiagram, FaTimes } from "react-icons/fa";

export const ProjectTabs = ({
  currentTab,
  onTabChange,
  projectType,
  projectName,
  units = [],
  selectedUnit,
  onUnitChange,
  projectId,
  onClose,
}) => {
  const tabs = ["Home", "Main Info"];
  if (projectType === "duplex") {
    tabs.push("Ground Floor", "1st Floor");
  } else if (projectType === "triplex") {
    tabs.push("Ground Floor", "1st Floor", "2nd Floor");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-1 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20
                   w-9 h-9 rounded-full
                   flex items-center justify-center
                   text-gray-500 hover:text-gray-800
                   hover:bg-gray-100 transition"
            title="Back to Project List"
          >
            <FaTimes size={18} strokeWidth={2} />
          </button>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <FaProjectDiagram size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {projectName || "Untitled Project"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {projectType || "General"}
                </span>
                <span className="text-xs text-gray-400">
                  ID: {projectId || "NEW"}
                </span>
              </div>
            </div>
          </div>

          {units.length > 0 && currentTab >= 2 && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-w-md">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">
                  Select Unit
                </label>
                <span className="text-xs text-gray-400">
                  {units.length} total
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => onUnitChange(unit)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedUnit?.id === unit.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : unit.isComplete
                          ? "bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-300"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {unit.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => onTabChange(index)}
              className={`relative px-5 py-2.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap ${
                currentTab === index
                  ? "text-indigo-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="relative z-5">{tab}</span>

              {currentTab === index && (
                <>
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-50 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
