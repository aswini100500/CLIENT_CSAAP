import React from "react";

import { Clock, Loader2, X } from "lucide-react";
import { getUiPresentDays } from "./payrollUtils";

const TONE_STYLES = {
  emerald: "border-emerald-200/80 bg-emerald-50/60 text-emerald-900",
  yellow: "border-amber-200/80 bg-amber-50/60 text-amber-900",
  orange: "border-orange-200/80 bg-orange-50/60 text-orange-900",
  rose: "border-rose-200/80 bg-rose-50/60 text-rose-900",
  red: "border-red-200/80 bg-red-50/60 text-red-900",
  blue: "border-blue-200/80 bg-blue-50/60 text-blue-900",
  violet: "border-violet-200/80 bg-violet-50/60 text-violet-900",
  amber: "border-amber-200/80 bg-amber-50/60 text-amber-900",
  gray: "border-(--border-soft) bg-(--bg-app) text-(--text-soft)",
};

const buildCalendarWeeks = (days = [], month, year) => {
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const cells = [];

  for (let index = 0; index < firstDayIndex; index += 1) {
    cells.push(null);
  }

  days.forEach((day) => cells.push(day));

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
};

const ATTENDANCE_STATUSES = new Set(["present", "late", "half_day"]);

const AttendanceCalendarModal = ({
  employee,
  monthName,
  year,
  data,
  loading,
  error,
  onClose,
}) => {
  const weeks = buildCalendarWeeks(
    data?.days || [],
    data?.period?.month,
    data?.period?.year,
  );
  const summary = data?.summary || {};
  const uiPresentDays = getUiPresentDays(summary);

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="app-modal flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-(--border-soft) bg-(--bg-panel) px-5 py-4">
          <div>
            <h2 className="modal-title">
              {employee?.name || data?.employee?.name || "Attendance Calendar"}
            </h2>
            <p className="modal-subtitle mt-1">
              {monthName} {year}
              {(employee?.department || data?.employee?.department) &&
                ` • ${employee?.department || data?.employee?.department}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-soft) transition-colors hover:bg-black/5 hover:text-(--text-strong)"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center gap-3 text-sm text-(--text-soft)">
              <Loader2 size={18} className="animate-spin text-(--brand)" />
              Loading attendance calendar...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Present
                  </div>
                  <div className="mt-1 text-xl font-bold text-emerald-950">
                    {uiPresentDays}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    Late
                  </div>
                  <div className="mt-1 text-xl font-bold text-amber-950">
                    {summary.late_days || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-orange-700">
                    Half Day
                  </div>
                  <div className="mt-1 text-xl font-bold text-orange-950">
                    {summary.half_days || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    Paid Leave
                  </div>
                  <div className="mt-1 text-xl font-bold text-blue-950">
                    {summary.paid_leave_days || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-rose-700">
                    LOP Leave
                  </div>
                  <div className="mt-1 text-xl font-bold text-rose-950">
                    {summary.unpaid_leave_days || 0}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-210">
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="rounded-lg bg-(--bg-subtle) px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-(--text-soft)"
                        >
                          {day}
                        </div>
                      ),
                    )}

                    {weeks.map((week, weekIndex) =>
                      week.map((day, dayIndex) => {
                        if (!day) {
                          return (
                            <div
                              key={`empty-${weekIndex}-${dayIndex}`}
                              className="min-h-32 rounded-xl border border-dashed border-(--border-soft) bg-white"
                            />
                          );
                        }

                        const toneClass =
                          TONE_STYLES[day.tone] || TONE_STYLES.gray;
                        const isAttendanceDay = ATTENDANCE_STATUSES.has(
                          day.status_code,
                        );
                        const showOt =
                          isAttendanceDay &&
                          day.overtime &&
                          day.overtime !== "00:00:00";

                        return (
                          <div
                            key={day.date}
                            className={`min-h-37 rounded-2xl border p-4 shadow-sm ${toneClass}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-3xl font-bold leading-none tracking-tight">
                                  {day.day}
                                </div>
                                <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.18em] opacity-75">
                                  {day.weekday}
                                </div>
                              </div>
                              {showOt && (
                                <div className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                                  OT
                                </div>
                              )}
                            </div>

                            <div className="mt-5 space-y-2 text-xs">
                              <div className="text-sm font-semibold leading-snug">
                                {day.label}
                              </div>
                              {showOt && (
                                <div className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 font-medium opacity-90">
                                  <Clock size={12} />
                                  OT: {day.overtime}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendarModal;
