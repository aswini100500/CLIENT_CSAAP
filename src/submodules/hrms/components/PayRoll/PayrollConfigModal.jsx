import React from "react";
import { Save, X } from "lucide-react";
import { useState } from "react";

const PayrollConfigModal = ({ config, onSave, onCancel }) => {
  const [localConfig, setLocalConfig] = useState({
    ot_multiplier: config?.ot_multiplier ?? 1.5,
    fixed_ot_rate: config?.fixed_ot_rate ?? 200.0,
    is_ot_rate_fixed: config?.is_ot_rate_fixed ?? true,
    fixed_denominator_days: config?.fixed_denominator_days ?? 30,
    is_denominator_fixed: config?.is_denominator_fixed ?? true,
    hours_per_day: config?.hours_per_day ?? 8.0,
    saturday_off: config?.saturday_off ?? true,
    sunday_off: config?.sunday_off ?? true,
    late_penalty: config?.late_penalty ?? false,
    sandwich_leave: config?.sandwich_leave ?? false,
  });

  const handleChange = (field, value, isNumber = true) => {
    // Prevent negative values during typing if isNumber is true
    if (isNumber && value.startsWith("-")) {
      return;
    }
    setLocalConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field, value) => {
    if (value === "" || isNaN(parseFloat(value))) {
      setLocalConfig((prev) => ({
        ...prev,
        [field]: 0,
      }));
    } else {
      setLocalConfig((prev) => ({
        ...prev,
        [field]: Math.max(0, parseFloat(value)),
      }));
    }
  };

  const handleKeyDown = (e) => {
    // Prevent special characters like 'e', '+', '-' in numeric inputs
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleToggle = (field) => {
    setLocalConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="app-modal w-full max-w-sm text-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-(--border-soft) bg-(--bg-panel) rounded-t-xl">
          <h2 className="modal-title">Payroll Policy Config</h2>
          <button
            onClick={onCancel}
            className="app-icon-button p-2 text-(--text-soft) hover:bg-black/5 hover:text-(--text-strong) transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* ── OT Rate Type Toggle ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="modal-label text-(--text-body)">OT Rate Is Fixed</label>
              <button
                type="button"
                onClick={() => handleToggle("is_ot_rate_fixed")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localConfig.is_ot_rate_fixed ? "bg-(--brand)" : "bg-gray-200"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${localConfig.is_ot_rate_fixed ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>

          {/* ── Fixed OT Rate (shown when is_ot_rate_fixed) ── */}
          {localConfig.is_ot_rate_fixed ? (
            <div>
              <label className="modal-label block text-(--text-body) mb-1.5">
                Fixed OT Rate (₹/hr)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localConfig.fixed_ot_rate}
                onChange={(e) =>
                  handleChange("fixed_ot_rate", e.target.value, true)
                }
                onBlur={(e) => handleBlur("fixed_ot_rate", e.target.value)}
                onKeyDown={handleKeyDown}
                className="app-input w-full px-2 py-1.5"
              />
            </div>
          ) : (
            <div>
              <label className="modal-label block text-(--text-body) mb-1.5">OT Multiplier</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localConfig.ot_multiplier}
                onChange={(e) =>
                  handleChange("ot_multiplier", e.target.value, true)
                }
                onBlur={(e) => handleBlur("ot_multiplier", e.target.value)}
                onKeyDown={handleKeyDown}
                className="app-input w-full px-2 py-1.5"
              />
            </div>
          )}

          <div>
            <label className="modal-label block text-(--text-body) mb-1.5">Denominator Days</label>
            <input
              type="number"
              step="1"
              min="0"
              value={localConfig.fixed_denominator_days}
              onChange={(e) =>
                handleChange("fixed_denominator_days", e.target.value, true)
              }
              onBlur={(e) =>
                handleBlur("fixed_denominator_days", e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="app-input w-full px-2 py-1.5"
            />
          </div>

          <div>
            <label className="modal-label block text-(--text-body) mb-1.5">Hours Per Day</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={localConfig.hours_per_day}
              onChange={(e) =>
                handleChange("hours_per_day", e.target.value, true)
              }
              onBlur={(e) => handleBlur("hours_per_day", e.target.value)}
              onKeyDown={handleKeyDown}
              className="app-input w-full px-2 py-1.5"
            />
          </div>

          <div className="app-panel p-3 space-y-3 bg-(--bg-subtle)/30 border border-(--border-soft)">
            <p className="text-(--text-strong) font-bold text-xs uppercase tracking-wider">Weekly Offs</p>

            <div className="flex items-center justify-between">
              <label className="modal-label text-(--text-body)">Saturday Off</label>
              <button
                type="button"
                onClick={() => handleToggle("saturday_off")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localConfig.saturday_off ? "bg-(--brand)" : "bg-gray-200"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${localConfig.saturday_off ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="modal-label text-(--text-body)">Sunday Off</label>
              <button
                type="button"
                onClick={() => handleToggle("sunday_off")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localConfig.sunday_off ? "bg-(--brand)" : "bg-gray-200"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${localConfig.sunday_off ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>

          <div className="app-panel p-3 space-y-3 bg-(--bg-subtle)/30 border border-(--border-soft)">
            <p className="text-(--text-strong) font-bold text-xs uppercase tracking-wider">Penalties</p>

            <div className="flex items-center justify-between">
              <div>
                <label className="modal-label text-(--text-body)">Late Penalty</label>
                <p className="text-xs text-(--text-faint) mt-0.5">
                  3 consecutive late days = last day as half-day
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("late_penalty")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localConfig.late_penalty ? "bg-(--brand)" : "bg-gray-200"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${localConfig.late_penalty ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="modal-label text-(--text-body)">Sandwich Leave</label>
                <p className="text-xs text-(--text-faint) mt-0.5">
                  Absences around holidays/offs count those offs as LOP
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("sandwich_leave")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localConfig.sandwich_leave ? "bg-(--brand)" : "bg-gray-200"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${localConfig.sandwich_leave ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-(--border-soft) bg-(--bg-panel) rounded-b-xl">
          <button
            onClick={onCancel}
            className="app-btn-secondary px-4 py-1.5 h-10 flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="app-btn-primary px-4 py-1.5 h-10 flex items-center justify-center gap-1.5"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollConfigModal;
