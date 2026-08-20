import React from "react";
import { Eye, NotebookText, XCircle } from "lucide-react";

const MonthlyAttendanceOverview = ({
  selectedEmployee,
  selectedEmployeeRecords,
  selectedEmployeeMetrics,
  selectedEmployeePrimaryStats,
  selectedEmployeeMixStats,
  selectedEmployeeMixTotal,
  selectedEmployeeMixChartBackground,
  selectedEmployeeSignalStats,
  monthYearLabel,
  getShiftBadge,
  getIndiaWeekdayShort,
  formatShiftWindow,
  formatDurationLabel,
  getDayFlagBadges,
  onViewRecord,
  onClose,
}) => {
  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 transition-all sm:p-4">
      <div className="app-modal flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-(--border-soft) bg-white px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-(--border-soft) bg-(--brand-soft) font-bold text-(--brand)">
              {selectedEmployee.employee_name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <h2 className="modal-title flex flex-wrap items-center gap-2.5">
                Attendance Performance Report
                <span className="inline-flex items-center rounded-full bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ring-1 ring-inset ring-slate-100">
                  {monthYearLabel}
                </span>
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                <span className="font-bold text-slate-700">
                  {selectedEmployee.employee_name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono font-medium text-slate-400">
                  ID {selectedEmployee.employee_id}
                </span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-inset ring-slate-200/50">
                    {selectedEmployee.postApplied}
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 ring-1 ring-inset ring-slate-100">
                    {selectedEmployee.department}
                  </span>
                  {(selectedEmployee.branch_name || selectedEmployee.rawData?.branch_name) && (
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700 ring-1 ring-inset ring-indigo-200">
                      {selectedEmployee.branch_name || selectedEmployee.rawData?.branch_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button flex h-10 w-10 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) active:scale-95"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-(--bg-subtle)/45 p-4 sm:p-5 custom-scrollbar">
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
              <section className="app-panel overflow-hidden">
                <div className="app-section-bar px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Attendance Composition
                  </p>
                </div>
                <div className="grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
                  <div
                    className="relative flex h-28 w-28 items-center justify-center rounded-full"
                    style={{ background: selectedEmployeeMixChartBackground }}
                  >
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-slate-200 bg-white text-center shadow-sm">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Days
                      </span>
                      <span className="text-lg font-black text-slate-900 font-mono">
                        {selectedEmployeeMixTotal}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedEmployeeMixStats.map((stat) => {
                      const percent =
                        selectedEmployeeMixTotal > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (Number(stat.value || 0) /
                                  Number(selectedEmployeeMixTotal || 1)) *
                                  100,
                              ),
                            )
                          : 0;

                      return (
                        <div
                          key={stat.label}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: stat.color }}
                            />
                            <span className="text-sm font-semibold text-slate-900">
                              {stat.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900 font-mono">
                              {stat.value}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400">
                              {percent}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="app-panel overflow-hidden">
                <div className="app-section-bar px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Attendance Insights
                  </p>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between rounded-xl border border-sky-200/70 bg-sky-50 px-3 py-2.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700">
                        Timesheet Notes
                      </p>
                      <p className="mt-1 text-xl font-black text-sky-900 font-mono">
                        {selectedEmployeeSignalStats[0]?.value || 0}
                      </p>
                    </div>
                    <NotebookText className="h-5 w-5 text-sky-600/60" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
                        Late Arrivals
                      </p>
                      <p className="mt-1 text-lg font-black text-amber-900 font-mono">
                        {selectedEmployeeSignalStats[1]?.value || 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-rose-200/70 bg-rose-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-700">
                        Early Departures
                      </p>
                      <p className="mt-1 text-lg font-black text-rose-900 font-mono">
                        {selectedEmployeeSignalStats[2]?.value || 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-violet-200/70 bg-violet-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-700">
                        OT Requested
                      </p>
                      <p className="mt-1 text-lg font-black text-violet-900 font-mono">
                        {selectedEmployeeSignalStats[3]?.value || 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200/70 bg-emerald-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                        OT Authorized
                      </p>
                      <p className="mt-1 text-lg font-black text-emerald-900 font-mono">
                        {selectedEmployeeSignalStats[4]?.value || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="app-panel">
              <div className="app-section-bar flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Detailed Attendance Log
                </p>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedEmployeeMetrics?.recordedDays || 0} Records Found
                </span>
              </div>

              <div className="selection:bg-slate-200">
                <table className="min-w-275 w-full text-left table-auto">
                  <thead className="sticky top-0 z-10 border-b border-(--border-soft) bg-white">
                    <tr>
                      <th className="w-30 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Date
                      </th>
                      <th className="w-40 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Shift
                      </th>
                      <th className="w-35 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Log Profile
                      </th>
                      <th className="w-35 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Hours
                      </th>
                      <th className="w-75 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Remarks
                      </th>
                      <th className="w-45 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Indicators
                      </th>
                      <th className="w-30 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedEmployeeRecords.map(([date, data]) => (
                      <tr
                        key={date}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <p className="font-mono text-sm font-semibold text-slate-900">
                            {date}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                            {getIndiaWeekdayShort(date)}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <div className="space-y-1.5">
                            {getShiftBadge(data.shift)}
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                              {formatShiftWindow(data)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <div className="space-y-1 font-mono text-xs">
                            <p>
                              <span className="mr-1 font-sans font-bold text-emerald-600">
                                In:
                              </span>
                              <span className="font-medium text-slate-700">
                                {data.checkInTime || "--:--"}
                              </span>
                            </p>
                            <p>
                              <span className="mr-1 font-sans font-bold text-rose-600">
                                Out:
                              </span>
                              <span className="font-medium text-slate-700">
                                {data.checkOutTime || "--:--"}
                              </span>
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <p className="font-mono text-sm font-semibold text-slate-900">
                            {data.totalHours || "--"}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold text-amber-700">
                            Break:{" "}
                            {data.rawData?.total_break_seconds
                              ? formatDurationLabel(data.rawData.total_break_seconds)
                              : "0h 0m"}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                            Overtime:{" "}
                            {data.rawData?.overtime
                              ? formatDurationLabel(data.rawData.overtime)
                              : "0h 0m"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1.5 text-xs/5 font-medium  text-slate-600">
                            <p>
                              {data.timesheetDetails || (
                                <span className="italic text-slate-400">
                                  No records provided
                                </span>
                              )}
                            </p>
                            {data.reason && (
                              <p className="font-semibold text-amber-700">
                                Late: {data.reason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex max-w-42.5 flex-wrap gap-1.5">
                            {getDayFlagBadges(data).map((flag) => (
                              <span
                                key={`${date}-${flag.label}`}
                                className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${flag.className}`}
                              >
                                {flag.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <button
                            onClick={() => onViewRecord(selectedEmployee, data)}
                            className="app-icon-button inline-flex h-9 w-9 items-center justify-center border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) active:scale-95"
                            title="View Daily Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-(--border-soft) bg-white px-5 py-3">
          <button
            onClick={onClose}
            className="app-btn-primary inline-flex h-10 items-center"
          >
            Close report
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAttendanceOverview;
