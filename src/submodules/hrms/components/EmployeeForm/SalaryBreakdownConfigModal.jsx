import React from "react";
import { createPortal } from "react-dom";

import { Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DEFAULT_SALARY_BREAKDOWN_POLICY,
  normalizeSalaryBreakdownPolicy,
} from "./salaryBreakdownUtils";

const TOGGLE_FIELDS = [
  { key: "enable_hra", label: "Enable HRA" },
  { key: "enable_ta", label: "Enable TA" },
  { key: "enable_da", label: "Enable DA" },
  { key: "enable_epf", label: "Enable EPF" },
  { key: "enable_esi", label: "Enable ESI" },
  { key: "enable_pt", label: "Enable PT" },
  { key: "enable_lwf", label: "Enable LWF" },
];

const RATE_FIELDS = [
  {
    key: "basic_rate",
    label: "Basic Rate",
    step: "0.01",
    help: "Percentage of monthly Gross Salary used as Basic.",
    showPercent: true,
  },
  {
    key: "hra_rate",
    label: "HRA Rate",
    step: "0.01",
    help: "Percentage of Basic used as HRA.",
    showPercent: true,
  },
  {
    key: "ta_rate",
    label: "TA Rate",
    step: "0.01",
    help: "Percentage of Basic used as TA.",
    showPercent: true,
  },
  {
    key: "da_rate",
    label: "DA Rate",
    step: "0.01",
    help: "Percentage of Basic used as DA.",
    showPercent: true,
  },
  {
    key: "epf_employee_rate",
    label: "EPF Employee Rate",
    step: "0.01",
    help: "Employee EPF percentage applied on eligible Basic.",
    showPercent: true,
  },
  {
    key: "epf_employer_rate",
    label: "EPF Employer Rate",
    step: "0.01",
    help: "Employer EPF percentage applied on eligible Basic.",
    showPercent: true,
  },
  {
    key: "epf_statutory_limit",
    label: "EPF Statutory Limit",
    step: "0.01",
    help: "Ceiling base for EPF cap.",
  },
  {
    key: "esi_employee_rate",
    label: "ESI Employee Rate",
    step: "0.01",
    help: "Employee ESI percentage applied on eligible Gross.",
    showPercent: true,
  },
  {
    key: "esi_employer_rate",
    label: "ESI Employer Rate",
    step: "0.01",
    help: "Employer ESI percentage applied on eligible Gross.",
    showPercent: true,
  },
  {
    key: "esi_gross_limit",
    label: "ESI Gross Limit",
    step: "0.01",
    help: "Maximum monthly gross eligible for ESI.",
  },
  {
    key: "rounding_tolerance",
    label: "Rounding Tolerance",
    step: "0.01",
    help: "Allowed variance for CTC validation.",
  },
];

const SalaryBreakdownConfigModal = ({
  policy,
  onSave,
  onCancel,
  saving = false,
}) => {
  const [localPolicy, setLocalPolicy] = useState(() => ({
    ...DEFAULT_SALARY_BREAKDOWN_POLICY,
    ...normalizeSalaryBreakdownPolicy(policy),
  }));
  const [displayValues, setDisplayValues] = useState(() => {
    const initialPolicy = {
      ...DEFAULT_SALARY_BREAKDOWN_POLICY,
      ...normalizeSalaryBreakdownPolicy(policy),
    };

    return RATE_FIELDS.reduce((acc, field) => {
      const value = initialPolicy[field.key];
      acc[field.key] = field.showPercent
        ? (Number(value || 0) * 100).toFixed(2)
        : String(value ?? "");
      return acc;
    }, {});
  });

  const normalizedPolicy = useMemo(
    () => normalizeSalaryBreakdownPolicy(localPolicy),
    [localPolicy],
  );

  const handleNumberChange = (field, value, showPercent = false) => {
    if (value.startsWith("-")) return;

    setDisplayValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setLocalPolicy((prev) => ({
      ...prev,
      [field]:
        value === "" ? "" : showPercent ? parseFloat(value) / 100 : value,
    }));
  };

  const handleNumberBlur = (field, value, showPercent = false) => {
    const fallback = DEFAULT_SALARY_BREAKDOWN_POLICY[field];
    const parsedValue = parseFloat(value);

    setLocalPolicy((prev) => ({
      ...prev,
      [field]: Number.isNaN(parsedValue)
        ? fallback
        : Math.max(0, showPercent ? parsedValue / 100 : parsedValue),
    }));

    setDisplayValues((prev) => ({
      ...prev,
      [field]: Number.isNaN(parsedValue)
        ? showPercent
          ? (Number(fallback || 0) * 100).toFixed(2)
          : String(fallback)
        : showPercent
          ? Math.max(0, parsedValue).toFixed(2)
          : String(Math.max(0, parsedValue)),
    }));
  };

  const handleToggle = (field) => {
    setLocalPolicy((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleKeyDown = (event) => {
    if (["e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center app-modal-backdrop p-4 backdrop-blur-sm bg-slate-900/40">
      <div className="app-modal flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-(--border-soft) bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border-soft) bg-white px-5 py-4">
          <div>
            <h2 className="modal-title text-lg font-bold text-(--text-strong)">
              Salary Breakdown Policy
            </h2>
            <p className="text-xs text-(--text-soft) mt-0.5">
              Configure company-wide salary breakup defaults.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle)/50 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {RATE_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="app-label mb-1.5 block">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step={field.step}
                    value={displayValues[field.key] ?? ""}
                    onChange={(event) =>
                      handleNumberChange(
                        field.key,
                        event.target.value,
                        field.showPercent,
                      )
                    }
                    onBlur={(event) =>
                      handleNumberBlur(
                        field.key,
                        event.target.value,
                        field.showPercent,
                      )
                    }
                    onKeyDown={handleKeyDown}
                    className="app-input w-full pr-9"
                  />
                  {field.showPercent && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      %
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-(--text-faint)">{field.help}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-(--border-soft) p-4 bg-(--bg-app)/30">
            <p className="mb-3 text-sm font-bold text-(--text-strong)">
              Enabled Components
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {TOGGLE_FIELDS.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-(--border-soft) bg-white px-3 py-2"
                >
                  <span className="text-sm font-semibold text-(--text-soft)">{label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      localPolicy[key] ? "bg-(--brand)" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        localPolicy[key] ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-xs font-semibold text-emerald-800 space-y-1">
            <p>
              Basic: {normalizedPolicy.basic_rate * 100}% of monthly Gross
              Salary.
            </p>
            <p>HRA: {normalizedPolicy.hra_rate * 100}% of basic pay.</p>
            <p>TA: {normalizedPolicy.ta_rate * 100}% of basic pay.</p>
            <p>DA: {normalizedPolicy.da_rate * 100}% of basic pay.</p>
            <p>
              EPF cap base: Rs.{" "}
              {normalizedPolicy.epf_statutory_limit.toFixed(2)}
            </p>
            <p>
              ESI applies up to gross Rs.{" "}
              {normalizedPolicy.esi_gross_limit.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-(--border-soft) bg-white px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="app-btn-secondary px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(normalizedPolicy)}
            disabled={saving}
            className="app-btn-primary flex items-center gap-2 px-4 py-2 active:scale-[0.98]"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SalaryBreakdownConfigModal;
