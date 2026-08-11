import React, { useState, useEffect } from "react";
import {
  Coffee,
  Sparkles,
  Utensils,
  MessageSquare,
  HeartPulse,
  Clock,
  X,
} from "lucide-react";

const PRESET_BREAK_REASONS = [
  {
    id: "lunch",
    label: "Lunch Break",
    icon: Utensils,
    desc: "Midday meal break",
  },
  {
    id: "tea",
    label: "Tea / Coffee Break",
    icon: Coffee,
    desc: "Quick refreshment",
  },
  {
    id: "personal",
    label: "Personal Work",
    icon: Sparkles,
    desc: "Errands & personal task",
  },
  {
    id: "meeting",
    label: "Team Sync",
    icon: MessageSquare,
    desc: "Internal / external sync",
  },
  {
    id: "medical",
    label: "Medical / Health",
    icon: HeartPulse,
    desc: "Health check or rest",
  },
  {
    id: "general",
    label: "General Break",
    icon: Clock,
    desc: "Short rest & pause",
  },
];

const BreakActionModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [selectedPreset, setSelectedPreset] = useState("Lunch Break");
  const [customReason, setCustomReason] = useState("Lunch Break");

  useEffect(() => {
    if (isOpen) {
      setSelectedPreset("Lunch Break");
      setCustomReason("Lunch Break");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (reasonLabel) => {
    setSelectedPreset(reasonLabel);
    setCustomReason(reasonLabel);
  };

  const handleCustomReasonChange = (e) => {
    const val = e.target.value;
    setCustomReason(val);
    const matchingPreset = PRESET_BREAK_REASONS.find(
      (p) => p.label.toLowerCase() === val.trim().toLowerCase(),
    );
    setSelectedPreset(matchingPreset ? matchingPreset.label : null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const finalReason =
      customReason.trim() || selectedPreset || "General Break";
    onSubmit(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        {/* Clean Neutral Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Coffee className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
                Taking a Break
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Select break category
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Select Break Reason
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-2.5">
              {PRESET_BREAK_REASONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedPreset === item.label;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPreset(item.label)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition duration-150 ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/60 text-slate-900 ring-1 ring-amber-500 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${isSelected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold truncate leading-tight">
                        {item.label}
                      </span>
                    </div>
                    <span className="mt-1 text-[10px] text-slate-500 leading-tight block truncate sm:whitespace-normal">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Custom Note / Reason (Optional)
              </label>
              <input
                type="text"
                value={customReason}
                onChange={handleCustomReasonChange}
                placeholder="e.g. Lunch at cafeteria, back in 30 mins"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-2.5 pt-3.5 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition duration-150 focus:outline-none disabled:opacity-60 text-center"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Starting...
                </>
              ) : (
                <>
                  <Coffee className="h-3.5 w-3.5" />
                  Start Break
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BreakActionModal;
