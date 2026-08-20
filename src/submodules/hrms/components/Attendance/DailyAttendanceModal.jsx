import React from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  NotebookText,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

const DailyAttendanceModal = ({
  selectedAttendanceRecord,
  selectedAttendanceEmployee,
  selectedAttendanceFlags,
  hasOvertimeRecord,
  hasOtClaim,
  isOtApproved,
  timesheetDecision,
  recordActionState,
  formatDurationLabel,
  formatCoordinateLabel,
  getReviewStatusCardClass,
  getReviewStatusValueClass,
  onClose,
  onRecordOvertimeAction,
  onRecordTimesheetAction,
  onOpenAudit,
}) => {
  const totalBreakSeconds = Number(
    selectedAttendanceRecord.rawData?.total_break_seconds ??
    selectedAttendanceRecord.total_break_seconds ??
    0
  );
  const breakDurationFormatted = (() => {
    if (!totalBreakSeconds) return "0h 0m";
    const h = Math.floor(totalBreakSeconds / 3600);
    const m = Math.floor((totalBreakSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  })();

  const punchRows = [
    {
      label: "In",
      value: selectedAttendanceRecord.checkInTime || "--:--",
      tone: "text-emerald-600",
    },
    {
      label: "Out",
      value: selectedAttendanceRecord.checkOutTime || "--:--",
      tone: "text-rose-600",
    },
    {
      label: "Break",
      value: breakDurationFormatted,
      tone: "text-amber-700",
    },
    {
      label: "Net Hours",
      value: selectedAttendanceRecord.totalHours || "--:--",
      tone: "text-slate-900",
    },
    {
      label: "OT",
      value: selectedAttendanceRecord.rawData?.overtime
        ? formatDurationLabel(selectedAttendanceRecord.rawData.overtime)
        : "0h 0m",
      tone: "text-amber-700",
    },
  ];

  const statusRows = [
    {
      label: "Timesheet",
      value: selectedAttendanceRecord.rawData?.timesheet_status || "Pending",
      key: "Timesheet",
    },
  ];

  if (hasOvertimeRecord) {
    statusRows.push(
      {
        label: "OT Claim",
        value:
          Number(selectedAttendanceRecord.rawData?.employee_ot_claim || 0) === 1
            ? "Submitted"
            : "Not submitted",
        key: "OT claim",
      },
      {
        label: "OT Status",
        value:
          Number(selectedAttendanceRecord.rawData?.ot_approved || 0) === 1
            ? "Approved"
            : "Pending",
        key: "OT decision",
      },
    );
  }

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 z-[99999] flex items-center justify-center p-3 transition-all sm:p-4">
      <div className="app-modal flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden">
        <div className="flex shrink-0 items-start justify-between border-b border-(--border-soft) bg-white px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-xl border border-(--border-soft) bg-(--brand-soft) p-2.5 text-(--brand)">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="modal-title">Daily Attendance Record</h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="truncate text-slate-900 normal-case tracking-normal">
                  {selectedAttendanceEmployee?.employee_name || "Employee"}
                </span>
                <span className="text-slate-300">|</span>
                <span>{selectedAttendanceRecord.date}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono">
                  ID {selectedAttendanceRecord.attendance_id}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button flex h-9 w-9 items-center justify-center border-(--border-soft) bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-(--bg-subtle)/45 p-4 sm:p-5 custom-scrollbar">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="space-y-4">
              <section className="app-panel overflow-hidden">
                <div className="app-section-bar px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Record details
                  </p>
                </div>
                <div className="grid divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 divide-y">
                  <div className="bg-white p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      <User className="h-3.5 w-3.5" />
                      Employee
                    </div>
                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                      <p className="flex items-start gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-500">
                          Name
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {selectedAttendanceEmployee?.employee_name ||
                            selectedAttendanceRecord.rawData?.employee_name ||
                            "Unknown"}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-500">
                          Company
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {selectedAttendanceRecord.rawData?.company || "N/A"}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-500">
                          Shift
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {selectedAttendanceRecord.shift || "General"}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-500">
                          Role
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {selectedAttendanceEmployee?.postApplied ||
                            selectedAttendanceRecord.rawData?.post_applied ||
                            "N/A"}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-500">
                          Branch
                        </span>
                        <span className="min-w-0 font-medium text-indigo-700 font-semibold">
                          {selectedAttendanceRecord.rawData?.branch_name ||
                            selectedAttendanceEmployee?.branch_name ||
                            "Unassigned"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      Device & Location
                    </div>
                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                      <p className="flex items-start gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-500">
                          Device
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {selectedAttendanceRecord.rawData?.device ||
                            "desktop"}
                        </span>
                      </p>
                      <p className="flex items-start gap-2 font-mono text-[13px]">
                        <span className="w-14 shrink-0 font-sans font-semibold text-slate-500">
                          Lat
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {formatCoordinateLabel(
                            selectedAttendanceRecord.rawData?.latitude,
                          )}
                        </span>
                      </p>
                      <p className="flex items-start gap-2 font-mono text-[13px]">
                        <span className="w-14 shrink-0 font-sans font-semibold text-slate-500">
                          Long
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {formatCoordinateLabel(
                            selectedAttendanceRecord.rawData?.longitude,
                          )}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-14 shrink-0 font-semibold text-slate-500">
                          Source
                        </span>
                        <span className="min-w-0 font-medium text-slate-900">
                          {selectedAttendanceRecord.rawData?.device ===
                          "desktop"
                            ? "Fixed terminal"
                            : "Mobile capture"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                      Punch summary
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAttendanceFlags.length > 0 ? (
                      selectedAttendanceFlags.map((flag) => (
                        <span
                          key={flag.label}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${flag.className}`}
                        >
                          {flag.label}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        No flags
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid divide-slate-100 sm:grid-cols-2 lg:grid-cols-4 sm:divide-x sm:divide-y-0 divide-y">
                  {punchRows.map((row) => (
                    <div key={row.label} className="bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        {row.label}
                      </p>
                      <p
                        className={`mt-2 font-mono text-sm font-semibold ${row.tone}`}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Review status
                  </p>
                </div>
                <div
                  className={`grid divide-slate-100 ${
                    statusRows.length === 1
                      ? "grid-cols-1"
                      : "sm:grid-cols-2 lg:grid-cols-3 sm:divide-x sm:divide-y-0 divide-y"
                  }`}
                >
                  {statusRows.map((status) => (
                    <div
                      key={status.label}
                      className={`bg-white p-4 transition-all duration-300 ${getReviewStatusCardClass(
                        status.key,
                        status.value,
                      )}`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        {status.label}
                      </p>
                      <p
                        className={`mt-2 text-sm font-bold ${getReviewStatusValueClass(
                          status.key,
                          status.value,
                        )}`}
                      >
                        {status.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                  <NotebookText className="h-4 w-4 text-slate-500" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Notes
                  </p>
                </div>
                <div
                  className={`grid divide-slate-100 ${
                    !selectedAttendanceRecord.rawData?.is_late
                      ? "grid-cols-1"
                      : "sm:grid-cols-2 sm:divide-x sm:divide-y-0 divide-y"
                  }`}
                >
                  <div className="bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Timesheet description
                    </p>
                    <p className="mt-2 text-sm/6 font-medium  text-slate-700">
                      {selectedAttendanceRecord.timesheetDetails || (
                        <span className="italic text-slate-400">
                          No timesheet description recorded.
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Late reason
                    </p>
                    <p className="mt-2 text-sm/6 font-medium  text-slate-700">
                      {selectedAttendanceRecord.reason || (
                        <span className="italic text-slate-400">
                          No late reason added.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              {hasOvertimeRecord && (
                <section className="rounded-2xl border border-sky-200/70 bg-sky-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border border-sky-200/70 bg-white p-2 text-sky-700">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-700">
                        Overtime review
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Approve this claim only if it should flow into payroll.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    {isOtApproved ? (
                      <button
                        type="button"
                        onClick={() => onRecordOvertimeAction(false)}
                        disabled={recordActionState.overtime !== ""}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
                      >
                        {recordActionState.overtime === "reject" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Remove approval
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRecordOvertimeAction(true)}
                        disabled={
                          recordActionState.overtime !== "" || !hasOtClaim
                        }
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {recordActionState.overtime === "approve" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {hasOtClaim ? "Approve overtime" : "No OT claim"}
                      </button>
                    )}
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700">
                    <NotebookText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                      Timesheet review
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Accept or reject the notes attached to this day.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {timesheetDecision !== "Approved" && (
                    <button
                      type="button"
                      onClick={() => onRecordTimesheetAction("Approved")}
                      disabled={recordActionState.timesheet !== ""}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {recordActionState.timesheet === "approved" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                  )}
                  {timesheetDecision !== "Rejected" && (
                    <button
                      type="button"
                      onClick={() => onRecordTimesheetAction("Rejected")}
                      disabled={recordActionState.timesheet !== ""}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200/70 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-50"
                    >
                      {recordActionState.timesheet === "rejected" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-emerald-200/70 bg-white p-2 text-emerald-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                      Attendance audit
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Open the audit modal to adjust punch times, notes, and
                      review status.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={onOpenAudit}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    Open audit modal
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-3">
          <button
            onClick={onClose}
            className="app-btn-primary inline-flex h-10 items-center px-5"
          >
            Close panel
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default DailyAttendanceModal;
