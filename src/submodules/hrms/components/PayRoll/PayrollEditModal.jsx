import React from "react";

import { Save, X } from "lucide-react";
import { useState } from "react";
import { formatINR, getUiPresentDays } from "./payrollUtils";

const normalizeComponentType = (component = {}) => {
  const rawType =
    component.type ??
    component.componentType ??
    component.earning_type ??
    component.category;
  const normalizedType = String(rawType || "")
    .trim()
    .toLowerCase();

  if (["deduction", "deductions"].includes(normalizedType)) {
    return "deduction";
  }

  return "earning";
};

const contributesToBaseGross = (component = {}) =>
  Boolean(
    component.contributesToBaseGross ??
    component.includeInBaseGross ??
    component.affectsBaseGross ??
    component.isBaseGross ??
    component.baseGross,
  );

const normalizePayrollComponent = (component = {}, fallbackType) => ({
  ...component,
  type: fallbackType || normalizeComponentType(component),
  amount: component.amount ?? 0,
});

const formatWorkHours = (hours) => `${(parseFloat(hours) || 0).toFixed(1)}h`;

const normalizeAttendanceRatio = (value) => {
  if (value === null || value === undefined || value === "") return 1;
  const ratio = parseFloat(value);
  if (Number.isNaN(ratio)) return 1;
  return Math.min(1, Math.max(0, ratio));
};

const PayrollEditModal = ({
  employee,
  payroll,
  tds,
  onTdsChange,
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState("salary");
  const uiPresentDays = getUiPresentDays(payroll);

  const [localBasic, setLocalBasic] = useState(payroll.basic || 0);
  const [localHra, setLocalHra] = useState(payroll.hra || 0);
  const [localTa, setLocalTa] = useState(payroll.ta || 0);
  const [localDa, setLocalDa] = useState(payroll.da || 0);
  const [localSA, setLocalSA] = useState(payroll.specialAllowance || 0);
  const [localOtPay, setLocalOtPay] = useState(payroll.otPay || 0);

  const [localEpf, setLocalEpf] = useState(payroll.epf || 0);
  const [localEsi, setLocalEsi] = useState(payroll.esi || 0);
  const [localPt, setLocalPt] = useState(payroll.pt || 0);
  const [localLwf, setLocalLwf] = useState(payroll.lwf || 0);
  const [localTds, setLocalTds] = useState(tds || 0);
  const [localLopDeduction, setLocalLopDeduction] = useState(
    payroll.lopDeduction || 0,
  );
  const [localAttendanceRatio, setLocalAttendanceRatio] = useState(
    payroll.proratedEarnings?.attendanceRatio ?? 1,
  );
  const [localTaxRegime] = useState(payroll.taxRegime || "NEW");

  const [localOtherComps, setLocalOtherComps] = useState(() => {
    const initialComponents = (payroll.otherComponents || []).map((component) =>
      normalizePayrollComponent(component),
    );
    const migratedBaseGrossEarnings = (payroll.extraEarnings || [])
      .filter((component) => contributesToBaseGross(component))
      .map((component) => normalizePayrollComponent(component, "earning"));

    return [...initialComponents, ...migratedBaseGrossEarnings];
  });

  const [localExtraEarnings, setLocalExtraEarnings] = useState(() =>
    (payroll.extraEarnings || [])
      .filter((component) => !contributesToBaseGross(component))
      .map((component) => normalizePayrollComponent(component, "earning")),
  );

  const [localExtraDeductions, setLocalExtraDeductions] = useState(() =>
    (payroll.extraDeductions || []).map((component) =>
      normalizePayrollComponent(component, "deduction"),
    ),
  );

  const handleKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleBlur = (value, setter) => {
    const parsed = parseFloat(value);
    if (value === "" || isNaN(parsed)) {
      setter(0);
    } else {
      setter(Math.max(0, parsed));
    }
  };

  let initialEarningsTotal = 0;
  let initialDeductionsTotal = 0;
  let extraEarningsTotal = 0;
  let extraDeductionsTotal = 0;

  localOtherComps.forEach((c) => {
    if (c.type === "earning") initialEarningsTotal += parseFloat(c.amount) || 0;
    if (c.type === "deduction")
      initialDeductionsTotal += parseFloat(c.amount) || 0;
  });

  localExtraEarnings.forEach(
    (c) => (extraEarningsTotal += parseFloat(c.amount) || 0),
  );
  localExtraDeductions.forEach(
    (c) => (extraDeductionsTotal += parseFloat(c.amount) || 0),
  );

  const baseGross =
    (parseFloat(localBasic) || 0) +
    (parseFloat(localHra) || 0) +
    (parseFloat(localTa) || 0) +
    (parseFloat(localDa) || 0) +
    (parseFloat(localSA) || 0) +
    initialEarningsTotal;
  const gross = baseGross + (parseFloat(localOtPay) || 0) + extraEarningsTotal;

  const lopDeduction = parseFloat(localLopDeduction) || 0;
  const halfDayDeduction = payroll.halfDayDeduction || 0;
  const normalizedAttendanceRatio =
    normalizeAttendanceRatio(localAttendanceRatio);
  const proratedEarnings = {
    attendanceRatio: normalizedAttendanceRatio,
    basic: (parseFloat(localBasic) || 0) * normalizedAttendanceRatio,
    hra: (parseFloat(localHra) || 0) * normalizedAttendanceRatio,
    ta: (parseFloat(localTa) || 0) * normalizedAttendanceRatio,
    da: (parseFloat(localDa) || 0) * normalizedAttendanceRatio,
    specialAllowance: (parseFloat(localSA) || 0) * normalizedAttendanceRatio,
    otherEarnings: initialEarningsTotal * normalizedAttendanceRatio,
    baseGross: baseGross * normalizedAttendanceRatio,
  };

  const totalDeductions =
    (parseFloat(localEpf) || 0) +
    (parseFloat(localEsi) || 0) +
    (parseFloat(localPt) || 0) +
    (parseFloat(localLwf) || 0) +
    (parseFloat(localTds) || 0) +
    lopDeduction +
    halfDayDeduction +
    initialDeductionsTotal +
    extraDeductionsTotal;
  const netSalary = gross - totalDeductions;

  const handleSave = () => {
    onTdsChange(localTds);
    onSave({
      basic: parseFloat(localBasic) || 0,
      hra: parseFloat(localHra) || 0,
      ta: parseFloat(localTa) || 0,
      da: parseFloat(localDa) || 0,
      specialAllowance: parseFloat(localSA) || 0,
      baseGross,
      otPay: parseFloat(localOtPay) || 0,
      gross,
      epf: parseFloat(localEpf) || 0,
      esi: parseFloat(localEsi) || 0,
      pt: parseFloat(localPt) || 0,
      lwf: parseFloat(localLwf) || 0,
      tds: parseFloat(localTds) || 0,
      lopDeduction,
      taxRegime: localTaxRegime,
      otherComponents: localOtherComps.map((c) => ({
        ...c,
        amount: parseFloat(c.amount) || 0,
      })),
      extraEarnings: localExtraEarnings.map((c) => ({
        ...c,
        amount: parseFloat(c.amount) || 0,
      })),
      extraDeductions: localExtraDeductions.map((c) => ({
        ...c,
        amount: parseFloat(c.amount) || 0,
      })),
      proratedEarnings,
      totalDeductions,
      netSalary,
    });
  };

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="app-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-sm">
        <div className="flex items-center justify-between p-4 border-b border-(--border-soft) bg-(--bg-panel) sticky top-0 z-10">
          <h2 className="modal-title">
            {employee?.name}
          </h2>
          <button
            onClick={onCancel}
            className="app-icon-button p-2 text-(--text-soft) hover:bg-black/5 hover:text-(--text-strong) transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex border-b border-(--border-soft)">
            {["salary", "attendance", "preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-bold capitalize transition-colors duration-200 -mb-px ${
                  activeTab === tab
                    ? "border-b-2 border-(--brand) text-(--brand)"
                    : "text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle)/40 border-b-2 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "salary" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="app-heading mb-2 border-b border-(--border-soft) pb-1">
                  Earnings
                </h3>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">Basic</label>
                  <input
                    type="number"
                    min="0"
                    value={localBasic}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalBasic(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalBasic)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">HRA</label>
                  <input
                    type="number"
                    min="0"
                    value={localHra}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalHra(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalHra)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">TA</label>
                  <input
                    type="number"
                    min="0"
                    value={localTa}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalTa(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalTa)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">DA</label>
                  <input
                    type="number"
                    min="0"
                    value={localDa}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalDa(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalDa)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">Special Allowance</label>
                  <input
                    type="number"
                    min="0"
                    value={localSA}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalSA(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalSA)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>

                {localOtherComps.map(
                  (comp, idx) =>
                    comp.type === "earning" && (
                      <div
                        key={`o-earn-${idx}`}
                        className="flex items-center justify-between"
                      >
                        <label className="modal-label text-(--text-body)">{comp.name}</label>
                        <input
                          type="number"
                          min="0"
                          value={comp.amount}
                          onChange={(e) => {
                            if (e.target.value.startsWith("-")) return;
                            const newComps = [...localOtherComps];
                            newComps[idx].amount = e.target.value;
                            setLocalOtherComps(newComps);
                          }}
                          onBlur={(e) => {
                            const newComps = [...localOtherComps];
                            newComps[idx].amount = Math.max(
                              0,
                              parseFloat(e.target.value) || 0,
                            );
                            setLocalOtherComps(newComps);
                          }}
                          onKeyDown={handleKeyDown}
                          className="app-input w-32 px-2 py-1 text-right bg-white"
                        />
                      </div>
                    ),
                )}

                <div className="flex items-center justify-between pt-2 border-t border-(--border-soft) font-bold text-(--text-strong)">
                  <span>{baseGross === gross ? "Gross" : "Base Gross"}</span>
                  <span>{formatINR(baseGross)}</span>
                </div>


                {localExtraEarnings.map((comp, idx) => (
                  <div
                    key={`e-earn-${idx}`}
                    className="flex items-center justify-between"
                  >
                    <input
                      type="text"
                      value={comp.name}
                      placeholder="Earning Name"
                      onChange={(e) => {
                        const newEarns = [...localExtraEarnings];
                        newEarns[idx].name = e.target.value;
                        setLocalExtraEarnings(newEarns);
                      }}
                      className="app-input w-32 px-2 py-1 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={comp.amount}
                        onChange={(e) => {
                          if (e.target.value.startsWith("-")) return;
                          const newEarns = [...localExtraEarnings];
                          newEarns[idx].amount = e.target.value;
                          setLocalExtraEarnings(newEarns);
                        }}
                        onBlur={(e) => {
                          const newEarns = [...localExtraEarnings];
                          newEarns[idx].amount = Math.max(
                            0,
                            parseFloat(e.target.value) || 0,
                          );
                          setLocalExtraEarnings(newEarns);
                        }}
                        onKeyDown={handleKeyDown}
                        onWheel={(e) => e.target.blur()}
                        className="app-input w-20 px-2 py-1 text-right bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newEarns = [...localExtraEarnings];
                          newEarns.splice(idx, 1);
                          setLocalExtraEarnings(newEarns);
                        }}
                        className="text-(--text-soft) hover:text-(--text-strong) transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setLocalExtraEarnings([
                      ...localExtraEarnings,
                      { name: "", amount: 0, type: "earning" },
                    ])
                  }
                  className="text-(--brand) hover:text-(--brand-strong) text-xs font-bold transition-colors pt-1 text-left"
                >
                  + Add Extra Earning
                </button>

                <div
                  className={`flex items-center justify-between pt-1 mt-1 ${localOtPay > 0 ? "text-purple-700" : "text-(--text-soft)"}`}
                >
                  <label className="font-bold text-xs uppercase tracking-wider">
                    OT Pay ({payroll.otHoursDecimal?.toFixed(1)}h)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={localOtPay}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalOtPay(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalOtPay)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className={`app-input w-32 px-2 py-1 text-right ${localOtPay > 0 ? "bg-purple-50/50 border-purple-200 text-purple-700 font-semibold" : ""}`}
                  />
                </div>

                {baseGross !== gross && (
                  <div className="flex items-center justify-between pt-2 border-t border-(--border-soft) font-bold text-(--text-strong)">
                    <span>Revised Gross</span>
                    <span>{formatINR(gross)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="app-heading mb-2 border-b border-(--border-soft) pb-1">
                  Deductions
                </h3>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">EPF</label>
                  <input
                    type="number"
                    min="0"
                    value={localEpf}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalEpf(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalEpf)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">ESI</label>
                  <input
                    type="number"
                    min="0"
                    value={localEsi}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalEsi(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalEsi)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">Professional Tax</label>
                  <input
                    type="number"
                    min="0"
                    value={localPt}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalPt(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalPt)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body)">LWF</label>
                  <input
                    type="number"
                    min="0"
                    value={localLwf}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalLwf(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalLwf)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>


                {localOtherComps.map(
                  (comp, idx) =>
                    comp.type === "deduction" && (
                      <div
                        key={`o-ded-${idx}`}
                        className="flex items-center justify-between"
                      >
                        <label className="modal-label text-(--text-body)">{comp.name}</label>
                        <input
                          type="number"
                          min="0"
                          value={comp.amount}
                          onChange={(e) => {
                            if (e.target.value.startsWith("-")) return;
                            const newComps = [...localOtherComps];
                            newComps[idx].amount = e.target.value;
                            setLocalOtherComps(newComps);
                          }}
                          onBlur={(e) => {
                            const newComps = [...localOtherComps];
                            newComps[idx].amount = Math.max(
                              0,
                              parseFloat(e.target.value) || 0,
                            );
                            setLocalOtherComps(newComps);
                          }}
                          onKeyDown={handleKeyDown}
                          className="app-input w-32 px-2 py-1 text-right bg-white"
                        />
                      </div>
                    ),
                )}


                {localExtraDeductions.map((comp, idx) => (
                  <div
                    key={`e-ded-${idx}`}
                    className="flex items-center justify-between"
                  >
                    <input
                      type="text"
                      value={comp.name}
                      placeholder="Deduction Name"
                      onChange={(e) => {
                        const newDeds = [...localExtraDeductions];
                        newDeds[idx].name = e.target.value;
                        setLocalExtraDeductions(newDeds);
                      }}
                      className="app-input w-32 px-2 py-1 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={comp.amount}
                        onChange={(e) => {
                          if (e.target.value.startsWith("-")) return;
                          const newDeds = [...localExtraDeductions];
                          newDeds[idx].amount = e.target.value;
                          setLocalExtraDeductions(newDeds);
                        }}
                        onBlur={(e) => {
                          const newDeds = [...localExtraDeductions];
                          newDeds[idx].amount = Math.max(
                            0,
                            parseFloat(e.target.value) || 0,
                          );
                          setLocalExtraDeductions(newDeds);
                        }}
                        onKeyDown={handleKeyDown}
                        onWheel={(e) => e.target.blur()}
                        className="app-input w-20 px-2 py-1 text-right bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDeds = [...localExtraDeductions];
                          newDeds.splice(idx, 1);
                          setLocalExtraDeductions(newDeds);
                        }}
                        className="text-(--text-soft) hover:text-(--text-strong) transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setLocalExtraDeductions([
                      ...localExtraDeductions,
                      { name: "", amount: 0, type: "deduction" },
                    ])
                  }
                  className="text-(--brand) hover:text-(--brand-strong) text-xs font-bold transition-colors pt-1 text-left"
                >
                  + Add Extra Deduction
                </button>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-body) font-bold">TDS</label>
                  <input
                    type="number"
                    min="0"
                    value={localTds}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalTds(e.target.value)
                    }
                    onBlur={(e) => handleBlur(e.target.value, setLocalTds)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right font-medium"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="modal-label text-rose-600 font-bold">LOP Deduction</label>
                  <input
                    type="number"
                    min="0"
                    value={localLopDeduction}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalLopDeduction(e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur(e.target.value, setLocalLopDeduction)
                    }
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right text-rose-700 bg-rose-50/50 border-rose-200"
                  />
                </div>
                {halfDayDeduction > 0 && (
                  <div className="flex items-center justify-between">
                    <label className="modal-label text-rose-600 font-bold">Half-day Deduction</label>
                    <span className="app-input w-32 px-2 py-1 text-right text-rose-700 bg-rose-50/50 border border-rose-200">
                      {formatINR(halfDayDeduction)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="modal-label text-(--text-soft)">Attendance Ratio</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.000001"
                    value={localAttendanceRatio}
                    onChange={(e) =>
                      !e.target.value.startsWith("-") &&
                      setLocalAttendanceRatio(e.target.value)
                    }
                    onBlur={(e) => {
                      const parsed = parseFloat(e.target.value);
                      setLocalAttendanceRatio(
                        Number.isNaN(parsed)
                           ? 1
                           : Math.min(1, Math.max(0, parsed)),
                      );
                    }}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.target.blur()}
                    className="app-input w-32 px-2 py-1 text-right"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-(--border-soft) font-bold text-rose-700 text-base">
                  <span>Total Deductions</span>
                  <span>{formatINR(totalDeductions)}</span>
                </div>
                <div className="pt-2 border-t border-(--border-soft) mt-2 flex items-center justify-between font-bold text-emerald-800 text-lg">
                  <span>Net Salary</span>
                  <span>{formatINR(netSalary)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="app-panel-muted p-4 text-center">
                <div className="text-2xl font-bold text-(--text-strong)">
                  {uiPresentDays}
                </div>
                <div className="text-xs text-(--text-soft) mt-1">Days Present</div>
              </div>
              <div className="app-panel-muted p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {payroll.lateDays}
                </div>
                <div className="text-xs text-(--text-soft) mt-1">Late Days</div>
              </div>
              <div className="app-panel-muted p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {payroll.halfDays}
                </div>
                <div className="text-xs text-(--text-soft) mt-1">Half Days</div>
              </div>
              <div className="app-panel-muted p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {payroll.leaveDays}
                </div>
                <div className="text-xs text-(--text-soft) mt-1">
                  Approved Leaves
                </div>
              </div>
              <div className="app-panel-muted p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatWorkHours(payroll.otHoursDecimal)}
                </div>
                <div className="text-xs text-(--text-soft) mt-1">Overtime Hours</div>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border border-(--border-soft) rounded-lg text-center bg-(--bg-subtle)/30">
                  <div className="text-base md:text-lg font-bold text-(--text-strong)">
                    {formatINR(gross)}
                  </div>
                  <div className="text-(--text-soft) text-xs mt-1">
                    Revised Gross
                  </div>
                </div>
                <div className="p-3 border border-rose-200 rounded-lg text-center bg-rose-50/20">
                  <div className="text-base md:text-lg font-bold text-rose-700">
                    {formatINR(totalDeductions)}
                  </div>
                  <div className="text-rose-600 text-xs mt-1">Deductions</div>
                </div>
                <div className="p-3 border border-emerald-200 rounded-lg text-center bg-emerald-50/20">
                  <div className="text-base md:text-lg font-bold text-emerald-800">
                    {formatINR(netSalary)}
                  </div>
                  <div className="text-emerald-700 text-xs mt-1">Net Payable</div>
                </div>
              </div>
              <div className="text-center text-xs text-(--text-faint) font-medium">
                Annual CTC: {formatINR(payroll.annualCTC)} • Monthly CTC:{" "}
                {formatINR(payroll.monthlyCTC)}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-(--border-soft) bg-(--bg-panel) sticky bottom-0 z-10 rounded-b-xl">
          <button
            onClick={onCancel}
            className="app-btn-secondary px-4 py-1.5 h-10 flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="app-btn-primary px-4 py-1.5 h-10 flex items-center justify-center gap-1.5"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollEditModal;
