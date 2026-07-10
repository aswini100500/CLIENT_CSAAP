import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimes,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";

const CustomizeSelect = ({
  onSelectType,
  onBack,
  initialSelected = [],
  completionStatus = {},
}) => {
  const typeDefinitions = {
    plotting: {
      title: "Plotting",
      description: "Land plots with individual specifications",
    },
    duplex: {
      title: "Duplex",
      description: "Fixed 2 floors (Ground + 1)",
    },
    triplex: {
      title: "Triplex",
      description: "Fixed 3 floors (Ground + 1 + 2)",
    },
    apartment: {
      title: "Apartment",
      description: "Multi-floor with customizable units",
    },
    commercial: {
      title: "Commercial",
      description: "Office/shop/showroom (and land)",
    },
  };

  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const toggle = (type) => {
    setSelected((s) =>
      s.includes(type) ? s.filter((t) => t !== type) : [...s, type],
    );
  };

  const handleConfirm = () => {
    if (!selected.length) {
      alert("Select at least one project type.");
      return;
    }

    onSelectType({
      projectType: "Custom",
      customTypes: selected,
      status: "draft",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 relative ">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Select one or more types
          </h3>
          <p className="text-sm text-gray-600">
            Choose multiple types to configure within this custom project.
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
          >
            <FaArrowLeft /> Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(typeDefinitions).map((key) => {
          const info = typeDefinitions[key];
          const active = selected.includes(key);
          const wasSelected = initialSelected.includes(key);
          const isComplete = completionStatus[key];
          const hasData = completionStatus[key] !== undefined;

          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`text-left p-5 rounded-xl border transition-all duration-150 relative ${
                active
                  ? "bg-emerald-50/50 border-emerald-400/80 shadow-sm"
                  : "bg-white border-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800">{info.title}</h4>
                    {wasSelected && (
                      <span className="text-[10px] bg-emerald-100/50 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Existing
                      </span>
                    )}
                  </div>
                  {active && hasData && !isComplete && (
                    <span className="text-[10px] text-amber-600 font-bold flex items-center mt-1">
                      <FaInfoCircle className="mr-1" /> Incomplete Data
                    </span>
                  )}
                  {active && hasData && isComplete && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">
                      <FaCheckCircle className="mr-1" /> Data Complete
                    </span>
                  )}
                </div>
                {active && (
                  <FaCheckCircle className="text-emerald-600 text-xl" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">{info.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          <FaInfoCircle className="inline mr-2" />
          {selected.length} selected
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelected([]);
            }}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              selected.length === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
            }`}
            disabled={selected.length === 0}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeSelect;
