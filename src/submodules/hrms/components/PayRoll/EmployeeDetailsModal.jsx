import React from "react";

import { Calendar, Clock, IndianRupee, X } from "lucide-react";
import { formatINR, getUiPresentDays } from "./payrollUtils";

const EmployeeDetailsModal = ({ employee, payroll, onClose }) => {
  const uiPresentDays = getUiPresentDays(payroll);

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="app-modal w-full max-w-lg text-sm max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between p-4 border-b border-(--border-soft) bg-(--bg-panel) sticky top-0 z-10 rounded-t-xl">
          <h2 className="modal-title">{employee.name}</h2>
          <button
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-soft) hover:bg-black/5 hover:text-(--text-strong) transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-(--text-body)">
            <div>
              <span className="text-(--text-faint)">ID:</span>{" "}
              <span className="font-semibold text-(--text-strong)">
                {employee.id}
              </span>
            </div>
            <div>
              <span className="text-(--text-faint)">Dept:</span>{" "}
              <span className="font-semibold text-(--text-strong)">
                {employee.department || "N/A"}
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-(--text-faint)">Job Title:</span>{" "}
              <span className="font-semibold text-(--text-strong)">
                {employee.jobTitle || "N/A"}
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-(--text-faint)">Tax Regime:</span>{" "}
              <span className="px-2 py-0.5 bg-(--bg-subtle) text-emerald-800 border border-emerald-200/50 rounded font-bold text-xs">
                {payroll.taxRegime || "NEW"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-(--text-faint)">Annual CTC:</span>{" "}
              <span className="font-bold text-(--text-strong)">
                {formatINR(payroll.annualCTC)}
              </span>
            </div>
          </div>

          <div className="app-panel-muted p-4">
            <h3 className="app-heading mb-2 border-b border-(--border-soft) pb-1 flex items-center gap-1.5">
              <Calendar size={14} className="text-(--brand)" /> Attendance &
              Leaves
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-(--text-soft)">Days Present</div>
                <div className="font-bold text-(--text-strong)">
                  {uiPresentDays}
                </div>
              </div>
              <div>
                <div className="text-xs text-(--text-soft)">Late Days</div>
                <div className="font-bold text-(--text-strong)">
                  {payroll.lateDays}
                </div>
              </div>
              <div>
                <div className="text-xs text-(--text-soft)">Half Days</div>
                <div className="font-bold text-(--text-strong)">
                  {payroll.halfDays}
                </div>
              </div>
              <div>
                <div className="text-xs text-(--text-soft)">LOP Days</div>
                <div className="font-bold text-rose-600">
                  {payroll.lopDays || 0}
                </div>
              </div>
            </div>
          </div>

          {payroll.proratedEarnings && (
            <div className="app-panel p-4 bg-amber-50/40 border border-amber-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-amber-950 text-base">
                    Payable Gross
                  </h3>
                  <p className="text-[11px] text-amber-800/80 font-medium italic">
                    {(payroll.proratedEarnings.attendanceRatio * 100).toFixed(
                      1,
                    )}
                    % of {formatINR(payroll.baseGross)} Monthly Gross
                  </p>
                </div>
                <IndianRupee size={20} className="text-amber-400/30" />
              </div>

              <div className="space-y-1 text-gray-700">
                <div className="flex justify-between">
                  <span>Basic</span>
                  <span>{formatINR(payroll.proratedEarnings.basic)}</span>
                </div>
                <div className="flex justify-between">
                  <span>HRA</span>
                  <span>{formatINR(payroll.proratedEarnings.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TA</span>
                  <span>{formatINR(payroll.proratedEarnings.ta)}</span>
                </div>
                <div className="flex justify-between">
                  <span>DA</span>
                  <span>{formatINR(payroll.proratedEarnings.da)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Allowance</span>
                  <span>
                    {formatINR(payroll.proratedEarnings.specialAllowance)}
                  </span>
                </div>
                {payroll.proratedEarnings.otherEarnings > 0 && (
                  <div className="flex justify-between">
                    <span>Other Earnings</span>
                    <span>
                      {formatINR(payroll.proratedEarnings.otherEarnings)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-amber-200 mt-2 space-y-1">
                  {payroll.otPay > 0 && (
                    <div className="flex justify-between text-purple-700 font-medium">
                      <span>OT Pay</span>
                      <span>+{formatINR(payroll.otPay)}</span>
                    </div>
                  )}
                  {payroll.extraEarnings
                    ?.filter((c) => c.amount > 0)
                    .map((comp, idx) => (
                      <div
                        key={`p-extra-${idx}`}
                        className="flex justify-between text-blue-700 font-medium"
                      >
                        <span>{comp.name}</span>
                        <span>+{formatINR(comp.amount)}</span>
                      </div>
                    ))}
                  <div className="flex justify-between font-bold text-amber-950 text-lg pt-1">
                    <span>Final Payable Gross</span>
                    <span>
                      {formatINR(
                        payroll.proratedEarnings.baseGross +
                          (payroll.otPay || 0) +
                          (payroll.extraEarnings?.reduce(
                            (acc, c) => acc + (parseFloat(c.amount) || 0),
                            0,
                          ) || 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {payroll.otHoursDecimal > 0 && (
            <div className="app-panel p-4 bg-blue-50/40 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Overtime: {payroll.otHoursDecimal?.toFixed(1)} hrs
                  </span>
                </div>
                {payroll.otPay > 0 && (
                  <span className="font-bold text-blue-800">
                    +{formatINR(payroll.otPay)}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="app-panel p-4">
            <h3 className="app-heading mb-2 border-b border-(--border-soft) pb-1 flex items-center gap-1.5">
              <IndianRupee size={14} className="text-(--brand)" /> Monthly
              Earnings
            </h3>
            <div className="space-y-1 text-(--text-body)">
              <div className="flex justify-between">
                <span className="text-(--text-soft)">Basic</span>
                <span className="font-medium text-(--text-strong)">
                  {formatINR(payroll.basic)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-soft)">HRA</span>
                <span className="font-medium text-(--text-strong)">
                  {formatINR(payroll.hra)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-soft)">TA</span>
                <span className="font-medium text-(--text-strong)">
                  {formatINR(payroll.ta)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-soft)">DA</span>
                <span className="font-medium text-(--text-strong)">
                  {formatINR(payroll.da)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-soft)">Special Allowance</span>
                <span className="font-medium text-(--text-strong)">
                  {formatINR(payroll.specialAllowance)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-(--border-soft) mt-1 text-(--text-strong)">
                <span>Base Gross</span>
                <span>{formatINR(payroll.baseGross)}</span>
              </div>
              {payroll.otherComponents
                ?.filter((c) => c.type === "earning" && c.amount > 0)
                .map((comp, idx) => (
                  <div key={`o-earn-${idx}`} className="flex justify-between">
                    <span className="text-(--text-soft)">{comp.name}</span>
                    <span className="font-medium text-emerald-700">
                      +{formatINR(comp.amount)}
                    </span>
                  </div>
                ))}
              {payroll.extraEarnings
                ?.filter((c) => c.amount > 0)
                .map((comp, idx) => (
                  <div key={`e-earn-${idx}`} className="flex justify-between">
                    <span className="text-(--text-soft)">{comp.name}</span>
                    <span className="font-medium text-blue-700">
                      +{formatINR(comp.amount)}
                    </span>
                  </div>
                ))}
              <div
                className={`flex justify-between pt-1 mt-1 ${payroll.otPay > 0 ? "text-purple-700 font-semibold" : "text-(--text-soft)"}`}
              >
                <span>OT Pay ({payroll.otHoursDecimal?.toFixed(1)}h)</span>
                <span>+{formatINR(payroll.otPay || 0)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-(--border-soft) mt-1 text-(--text-strong) text-base">
                <span>Revised Gross</span>
                <span>{formatINR(payroll.gross)}</span>
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <h3 className="app-heading mb-2 border-b border-(--border-soft) pb-1">
              Deductions
            </h3>
            <div className="space-y-1 text-(--text-body)">
              <div className="flex justify-between">
                <span className="text-(--text-soft)">EPF</span>
                <span className="text-rose-600 font-medium">
                  -{formatINR(payroll.epf)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-soft)">ESI</span>
                <span className="text-rose-600 font-medium">
                  -{formatINR(payroll.esi)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-soft)">Professional Tax</span>
                <span className="text-rose-600 font-medium">
                  -{formatINR(payroll.pt)}
                </span>
              </div>
              {payroll.lwf > 0 && (
                <div className="flex justify-between">
                  <span className="text-(--text-soft)">LWF</span>
                  <span className="text-rose-600 font-medium">
                    -{formatINR(payroll.lwf)}
                  </span>
                </div>
              )}
              {payroll.otherComponents
                ?.filter((c) => c.type === "deduction" && c.amount > 0)
                .map((comp, idx) => (
                  <div key={`o-ded-${idx}`} className="flex justify-between">
                    <span className="text-(--text-soft)">{comp.name}</span>
                    <span className="text-rose-600 font-medium">
                      -{formatINR(comp.amount)}
                    </span>
                  </div>
                ))}
              {payroll.extraDeductions
                ?.filter((c) => c.amount > 0)
                .map((comp, idx) => (
                  <div key={`e-ded-${idx}`} className="flex justify-between">
                    <span className="text-(--text-soft)">{comp.name}</span>
                    <span className="text-rose-600 font-medium">
                      -{formatINR(comp.amount)}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between">
                <span className="text-(--text-soft)">TDS</span>
                <span className="text-rose-600 font-medium">
                  -{formatINR(payroll.tds)}
                </span>
              </div>
              {payroll.lopDeduction > 0 && (
                <div className="flex justify-between">
                  <span className="text-(--text-soft)">
                    LOP Deduction ({payroll.lopDays} day
                    {payroll.lopDays > 1 ? "s" : ""})
                  </span>
                  <span className="text-rose-600 font-medium">
                    -{formatINR(payroll.lopDeduction)}
                  </span>
                </div>
              )}
              {payroll.halfDayDeduction > 0 && (
                <div className="flex justify-between">
                  <span className="text-(--text-soft)">
                    Half-day Deduction ({payroll.halfDays}d)
                  </span>
                  <span className="text-rose-600 font-medium">
                    -{formatINR(payroll.halfDayDeduction)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t border-(--border-soft) mt-1 text-rose-700 text-base">
                <span>Total Deductions</span>
                <span>-{formatINR(payroll.totalDeductions)}</span>
              </div>
            </div>
          </div>

          <div className="app-panel p-4 bg-emerald-50/40 border border-emerald-200">
            <div className="flex justify-between font-bold text-lg text-emerald-950">
              <span>Net Payable</span>
              <span className="text-emerald-800">
                {formatINR(payroll.netSalary)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
