import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  Laptop,
  Loader2,
  LogIn,
  LogOut,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../../../hooks/useAuth";
import {
  formatAttendanceTime24,
  getAttendanceDateValue,
  parseIndiaDateTime,
} from "../../utils/attendanceTime";
import {
  validateBreakLogSequence,
  calculateBreakSecondsFromLogs,
  computeAuditPreview,
  secondsToDurationLabel,
} from "../../utils/attendanceAuditUtils";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;

function buildDateTimeValue(dateValue, timeValue) {
  if (!dateValue || !timeValue) return "";

  const normalizedTime = String(timeValue).trim().slice(0, 8);
  if (!normalizedTime) return "";

  const timePart =
    normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  return `${dateValue} ${timePart}`;
}

const emptyForm = {
  attendanceDate: "",
  punchInTime: "",
  punchOutTime: "",
  shiftName: "",
  shiftStart: "",
  shiftEnd: "",
  timesheetDetails: "",
  reason: "",
};

const AttendanceAuditModal = ({ attendanceRecord, onClose, onSaved }) => {
  const attendanceId =
    attendanceRecord?.attendance_id ||
    attendanceRecord?.id ||
    attendanceRecord?.rawData?.id ||
    null;
  const isCreateMode = !attendanceId;
  const { token: authToken } = useAuth();
  const token =
    authToken ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("hrmsUserToken") ||
    "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState(attendanceRecord?.rawData || null);
  const [form, setForm] = useState(emptyForm);
  const [breakLogs, setBreakLogs] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const buildBaseRecord = (nextRecord = {}) => ({
      ...attendanceRecord,
      ...nextRecord,
      employee_id:
        Number(
          nextRecord?.employee_id ??
            attendanceRecord?.employee_id ??
            attendanceRecord?.rawData?.employee_id ??
            0,
        ) || 0,
      employee_name:
        nextRecord?.employee_name ||
        attendanceRecord?.employee_name ||
        attendanceRecord?.rawData?.employee_name ||
        "Unknown",
      post_applied:
        nextRecord?.post_applied ||
        attendanceRecord?.post_applied ||
        attendanceRecord?.postApplied ||
        attendanceRecord?.rawData?.post_applied ||
        "N/A",
      branch_id:
        nextRecord?.branch_id ??
        attendanceRecord?.branch_id ??
        attendanceRecord?.rawData?.branch_id ??
        null,
      branch_name:
        nextRecord?.branch_name ||
        attendanceRecord?.branch_name ||
        attendanceRecord?.rawData?.branch_name ||
        "",
      shift_name:
        nextRecord?.shift_name ||
        attendanceRecord?.shift_name ||
        attendanceRecord?.shift ||
        attendanceRecord?.rawData?.shift_name ||
        "General",
      shift_start:
        nextRecord?.shift_start ||
        attendanceRecord?.shift_start ||
        attendanceRecord?.rawData?.shift_start ||
        "",
      shift_end:
        nextRecord?.shift_end ||
        attendanceRecord?.shift_end ||
        attendanceRecord?.rawData?.shift_end ||
        "",
      company_id:
        Number(
          nextRecord?.company_id ??
            attendanceRecord?.company_id ??
            attendanceRecord?.rawData?.company_id ??
            0,
        ) || 0,
      company:
        nextRecord?.company ||
        attendanceRecord?.company ||
        attendanceRecord?.rawData?.company ||
        "",
      slug:
        nextRecord?.slug ||
        attendanceRecord?.slug ||
        attendanceRecord?.rawData?.slug ||
        "",
      latitude:
        Number(nextRecord?.latitude ?? attendanceRecord?.latitude ?? 0) || 0,
      longitude:
        Number(nextRecord?.longitude ?? attendanceRecord?.longitude ?? 0) || 0,
    });

    const fetchAuditRecord = async () => {
      if (!attendanceId && !attendanceRecord?.employee_id) {
        setLoading(false);
        setError("Attendance record is missing.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        let nextRecord = attendanceRecord?.rawData || attendanceRecord || null;
        let fetchedLogs = [];

        if (attendanceId) {
          const response = await axios.get(
            `${API_BASE}/api/attendance/audit/${attendanceId}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            },
          );

          nextRecord = response.data?.data || nextRecord;
          fetchedLogs = response.data?.logs || [];
        }

        if (!isMounted) return;

        const mergedRecord = buildBaseRecord(nextRecord || {});
        setRecord(mergedRecord);
        setBreakLogs(fetchedLogs);
        setForm({
          attendanceDate:
            getAttendanceDateValue(mergedRecord) ||
            attendanceRecord?.date ||
            "",
          punchInTime:
            formatAttendanceTime24(mergedRecord?.mispunch_time, "") || "",
          punchOutTime:
            formatAttendanceTime24(mergedRecord?.leave_time, "") || "",
          shiftName: mergedRecord?.shift_name || "General",
          shiftStart:
            formatAttendanceTime24(mergedRecord?.shift_start, "") || "",
          shiftEnd: formatAttendanceTime24(mergedRecord?.shift_end, "") || "",
          timesheetDetails: mergedRecord?.timesheet_details || "",
          reason: mergedRecord?.reason || "",
        });
      } catch (fetchError) {
        if (!isMounted) return;

        const message =
          fetchError.response?.data?.message ||
          "Unable to load the attendance audit record.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAuditRecord();

    return () => {
      isMounted = false;
    };
  }, [attendanceId, attendanceRecord, token]);

  const preview = useMemo(
    () =>
      computeAuditPreview({
        attendanceDate: form.attendanceDate,
        punchInTime: form.punchInTime,
        punchOutTime: form.punchOutTime,
        shiftStart: form.shiftStart,
        shiftEnd: form.shiftEnd,
        breakLogs,
      }),
    [form.attendanceDate, form.punchInTime, form.punchOutTime, form.shiftStart, form.shiftEnd, breakLogs],
  );

  const openBreakStartLog = useMemo(() => {
    let activeStart = null;
    for (const log of breakLogs) {
      if (log.log_type === "BREAK_START") activeStart = log;
      else if (log.log_type === "BREAK_END") activeStart = null;
    }
    return activeStart;
  }, [breakLogs]);

  const handleAddBreakLog = (logType) => {
    const defaultTime = form.attendanceDate
      ? `${form.attendanceDate} 12:00:00`
      : "";
    setBreakLogs((prev) => [
      ...prev,
      {
        log_type: logType,
        timestamp: defaultTime,
        branch_name: record?.branch_name || "",
        device: "audit-admin",
        notes: "",
      },
    ]);
  };

  const handleUpdateBreakLog = (index, field, value) => {
    setBreakLogs((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleDeleteBreakLog = (index) => {
    setBreakLogs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCloseOpenBreak = () => {
    if (!openBreakStartLog) return;
    const shiftEndTime = form.shiftEnd
      ? buildDateTimeValue(form.attendanceDate, form.shiftEnd)
      : buildDateTimeValue(form.attendanceDate, "17:00:00");

    setBreakLogs((prev) => [
      ...prev,
      {
        log_type: "BREAK_END",
        timestamp: shiftEndTime,
        branch_name: record?.branch_name || "",
        device: "audit-admin",
        notes: "Closed by Admin at Shift End",
      },
    ]);
  };

  const isPunchOutMissing = !form.punchOutTime || form.punchOutTime === "N/A";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };

      if (name === "punchOutTime" && (!value || value === "N/A")) {
        next.timesheetDetails = "";
      }

      return next;
    });
  };

  const breakSequenceErrors = useMemo(
    () => validateBreakLogSequence(breakLogs),
    [breakLogs],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.attendanceDate || !form.punchInTime || form.punchInTime === "N/A") {
      setError("Attendance date and punch-in time are required.");
      return;
    }

    if (breakSequenceErrors.length > 0) {
      setError("Please resolve break timeline sequence errors before saving.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        employee_id:
          record?.employee_id ||
          attendanceRecord?.employee_id ||
          attendanceRecord?.id,
        employee_name:
          record?.employee_name ||
          attendanceRecord?.employeeName ||
          attendanceRecord?.employee_name,
        company_id:
          record?.company_id ||
          attendanceRecord?.company_id ||
          attendanceRecord?.companyId,
        company:
          record?.company ||
          attendanceRecord?.company ||
          attendanceRecord?.companyName,
        slug: record?.slug || attendanceRecord?.slug,
        branch_id: record?.branch_id || attendanceRecord?.branch_id || null,
        branch_name: record?.branch_name || attendanceRecord?.branch_name || null,
        department: record?.department || attendanceRecord?.department,
        post_applied:
          record?.post_applied ||
          attendanceRecord?.post_applied ||
          attendanceRecord?.postApplied,
        attendance_date: form.attendanceDate,
        mispunch_time: buildDateTimeValue(
          form.attendanceDate,
          form.punchInTime,
        ),
        leave_time: !isPunchOutMissing
          ? buildDateTimeValue(form.attendanceDate, form.punchOutTime)
          : null,
        timesheet_details: !isPunchOutMissing ? form.timesheetDetails : "",
        reason: preview.isLate ? form.reason : "",
        shift_name:
          record?.shift_name || attendanceRecord?.shift_name || "General",
        shift_start: (() => {
          const s =
            record?.shift_start || attendanceRecord?.shift_start || null;
          return s?.includes(":") && s.length === 5 ? `${s}:00` : s;
        })(),
        shift_end: (() => {
          const e = record?.shift_end || attendanceRecord?.shift_end || null;
          return e?.includes(":") && e.length === 5 ? `${e}:00` : e;
        })(),
        latitude: Number(record?.latitude || attendanceRecord?.latitude || 0),
        longitude: Number(
          record?.longitude || attendanceRecord?.longitude || 0,
        ),
        device: "audit-admin",
        logs: breakLogs,
      };

      const response = await axios[attendanceId ? "put" : "post"](
        attendanceId
          ? `${API_BASE}/api/attendance/audit/${attendanceId}`
          : `${API_BASE}/api/attendance/audit/upsert`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (response.data?.data) {
        onSaved?.(response.data.data);
      }

      Swal.fire({
        icon: "success",
        title: "Audit saved",
        text: response.data?.message || "Attendance audit has been updated.",
        confirmButtonColor: "#00a651",
      });

      onClose();
    } catch (saveError) {
      const message =
        saveError.response?.data?.message ||
        "Unable to save the attendance audit right now.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Audit failed",
        text: message,
        confirmButtonColor: "#00a651",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!attendanceId) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete attendance record?",
      text: "This action cannot be undone. It will completely delete this attendance record.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#cbd5e1",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    setError("");

    try {
      const response = await axios.delete(
        `${API_BASE}/api/attendance/audit/${attendanceId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (response.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The attendance record has been deleted.",
          confirmButtonColor: "#00a651",
        });
        onSaved?.({ isDeleted: true, id: attendanceId });
        onClose();
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete attendance record.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: message,
        confirmButtonColor: "#00a651",
      });
    } finally {
      setSaving(false);
    }
  };

  const punchInLabel = formatAttendanceTime24(record?.mispunch_time);
  const punchOutLabel = formatAttendanceTime24(record?.leave_time);

  const getLogTypeBadge = (logType) => {
    switch (logType) {
      case "PUNCH_IN":
        return {
          icon: LogIn,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "PUNCH IN",
        };
      case "BREAK_START":
        return {
          icon: PauseCircle,
          className: "bg-amber-50 text-amber-700 border-amber-200",
          label: "BREAK START",
        };
      case "BREAK_END":
        return {
          icon: PlayCircle,
          className: "bg-blue-50 text-blue-700 border-blue-200",
          label: "BREAK END",
        };
      case "PUNCH_OUT":
        return {
          icon: LogOut,
          className: "bg-rose-50 text-rose-700 border-rose-200",
          label: "PUNCH OUT",
        };
      default:
        return {
          icon: Clock,
          className: "bg-slate-50 text-slate-700 border-slate-200",
          label: logType || "EVENT",
        };
    }
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
      <div className="app-modal flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden">
        <div className="flex shrink-0 items-start justify-between border-b border-(--border-soft) bg-white px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">
                {isCreateMode ? "Create Attendance Audit" : "Attendance Audit & Event Trail"}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="truncate text-slate-900 normal-case tracking-normal">
                  {record?.employee_name ||
                    attendanceRecord?.employeeName ||
                    attendanceRecord?.employee_name ||
                    "Employee"}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  {form.attendanceDate || attendanceRecord?.date || "N/A"}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-mono">ID {attendanceId || "--"}</span>
                {record?.branch_name && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                      <Building2 className="h-3 w-3" />
                      {record.branch_name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-icon-button flex h-9 w-9 items-center justify-center border-(--border-soft) bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-5">
          {loading ? (
            <div className="flex min-h-105 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-(--brand)" />
                Loading audit record and event trail...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                  <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="space-y-4">
                  {/* Attendance Timing Section */}
                  <section className="app-panel overflow-hidden">
                    <div className="app-section-bar px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                        Attendance Timing
                      </p>
                    </div>
                    <div className="grid divide-slate-100 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:divide-x sm:divide-y-0 divide-y">
                      <div className="bg-white p-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Attendance Date
                        </label>
                        <input
                          type="text"
                          value={form.attendanceDate}
                          readOnly
                          className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                        />
                      </div>
                      <div className="bg-white p-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Punch-in Time *
                        </label>
                        <input
                          type="time"
                          name="punchInTime"
                          value={form.punchInTime}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                      <div className="bg-white p-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Punch-out Time
                        </label>
                        <input
                          type="time"
                          name="punchOutTime"
                          value={form.punchOutTime}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Unclosed Break Alert */}
                  {openBreakStartLog ? (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                              Unclosed Break Session
                            </p>
                            <p className="mt-1 text-xs text-amber-700">
                              Employee started a break at{" "}
                              <span className="font-mono font-bold">
                                {openBreakStartLog.timestamp?.slice(11, 16) || "N/A"}
                              </span>{" "}
                              without a recorded Break End.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCloseOpenBreak}
                          className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
                        >
                          Close Break at Shift End
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Interim Break Timeline & Management Section */}
                  <section className="app-panel overflow-hidden">
                    <div className="app-section-bar flex items-center justify-between px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                        Interim Break Timeline ({breakLogs.filter(l => l.log_type === 'BREAK_START' || l.log_type === 'BREAK_END').length} Events)
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddBreakLog("BREAK_START")}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                        >
                          + Add Break Start
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBreakLog("BREAK_END")}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                        >
                          + Add Break End
                        </button>
                      </div>
                    </div>

                    {breakSequenceErrors.length > 0 ? (
                      <div className="border-b border-rose-100 bg-rose-50/80 px-4 py-3 text-rose-800 text-xs flex items-start gap-2.5">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <div className="space-y-1">
                          <p className="font-bold uppercase tracking-wider text-[10px] text-rose-900">
                            Break Timeline Sequence Error
                          </p>
                          {breakSequenceErrors.map((err, i) => (
                            <p key={i}>• {err}</p>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="p-4 space-y-3">
                      {breakLogs.filter(l => l.log_type === 'BREAK_START' || l.log_type === 'BREAK_END').length === 0 ? (
                        <p className="text-xs italic text-slate-400">
                          No interim breaks recorded for this session.
                        </p>
                      ) : (
                        breakLogs
                          .map((log, originalIdx) => ({ log, originalIdx }))
                          .filter(({ log }) => log.log_type === 'BREAK_START' || log.log_type === 'BREAK_END')
                          .map(({ log, originalIdx }) => (
                            <div
                              key={originalIdx}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <select
                                  value={log.log_type}
                                  onChange={(e) =>
                                    handleUpdateBreakLog(originalIdx, "log_type", e.target.value)
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-bold text-slate-800 text-xs outline-none"
                                >
                                  <option value="BREAK_START">BREAK START</option>
                                  <option value="BREAK_END">BREAK END</option>
                                </select>
                                <input
                                  type="datetime-local"
                                  step="1"
                                  value={(log.timestamp || "").replace(" ", "T").slice(0, 19)}
                                  onChange={(e) => {
                                    const val = e.target.value.replace("T", " ");
                                    const formatted = val && val.length === 16 ? `${val}:00` : val;
                                    handleUpdateBreakLog(originalIdx, "timestamp", formatted);
                                  }}
                                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                              </div>
                              <div className="flex items-center gap-2 flex-1 min-w-48">
                                <input
                                  type="text"
                                  value={log.notes || ""}
                                  onChange={(e) =>
                                    handleUpdateBreakLog(originalIdx, "notes", e.target.value)
                                  }
                                  placeholder="Break Reason / Note"
                                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBreakLog(originalIdx)}
                                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                                  title="Delete Event"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </section>

                  {/* Audit Trail Complete History Table */}
                  {breakLogs.length > 0 && (
                    <section className="app-panel overflow-hidden">
                      <div className="app-section-bar px-4 py-3 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                          Chronological Audit Trail ({breakLogs.length} Events)
                        </p>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Immutable System Logs
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="px-3 py-2">Event</th>
                              <th className="px-3 py-2">Timestamp</th>
                              <th className="px-3 py-2">Branch</th>
                              <th className="px-3 py-2">Device</th>
                              <th className="px-3 py-2">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                            {breakLogs.map((log, idx) => {
                              const badge = getLogTypeBadge(log.log_type);
                              const Icon = badge.icon;

                              return (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-3 py-2.5 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badge.className}`}>
                                      <Icon className="h-3 w-3 shrink-0" />
                                      {badge.label}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 font-mono whitespace-nowrap text-slate-900">
                                    {log.timestamp || "--:--:--"}
                                  </td>
                                  <td className="px-3 py-2.5 whitespace-nowrap">
                                    {log.branch_name || record?.branch_name ? (
                                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                                        <Building2 className="h-2.5 w-2.5" />
                                        {log.branch_name || record?.branch_name}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[11px]">Unassigned</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 whitespace-nowrap text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                      {String(log.device || "").toLowerCase().includes("mobile") ? (
                                        <Smartphone className="h-3 w-3 text-slate-400" />
                                      ) : (
                                        <Laptop className="h-3 w-3 text-slate-400" />
                                      )}
                                      <span>{log.device || "desktop"}</span>
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-slate-600 max-w-xs truncate">
                                    {log.notes || <span className="text-slate-300 italic">None</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Shift Info */}
                  <section className="app-panel overflow-hidden">
                    <div className="app-section-bar px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                        Shift Configuration
                      </p>
                    </div>
                    <div className="grid divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-y">
                      <div className="bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Shift Name
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {record?.shift_name || "General"}
                        </p>
                      </div>
                      <div className="bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Shift Start
                        </p>
                        <p className="mt-2 font-mono text-sm font-semibold text-slate-900">
                          {formatAttendanceTime24(record?.shift_start) || "--:--"}
                        </p>
                      </div>
                      <div className="bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Shift End
                        </p>
                        <p className="mt-2 font-mono text-sm font-semibold text-slate-900">
                          {formatAttendanceTime24(record?.shift_end) || "--:--"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Notes & Timesheet */}
                  <section className="app-panel overflow-hidden">
                    <div className="app-section-bar px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                        Notes & Timesheet
                      </p>
                    </div>
                    <div
                      className={`grid divide-slate-100 ${
                        !preview.isLate
                          ? "grid-cols-1"
                          : "md:grid-cols-2 md:divide-x md:divide-y-0 divide-y"
                      }`}
                    >
                      <div className="bg-white p-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Timesheet Details
                        </label>
                        <textarea
                          name="timesheetDetails"
                          value={form.timesheetDetails}
                          onChange={handleChange}
                          disabled={isPunchOutMissing}
                          rows={4}
                          className={`mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium leading-6 outline-none transition placeholder:text-slate-400 ${
                            isPunchOutMissing
                              ? "bg-slate-50 cursor-not-allowed text-slate-400"
                              : "bg-white text-slate-900 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                          }`}
                          placeholder={
                            isPunchOutMissing
                              ? "Punch-out time is required to add timesheet details..."
                              : "Describe your work here..."
                          }
                        />
                      </div>
                      {preview.isLate ? (
                        <div className="bg-white p-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            Late Reason *
                          </label>
                          <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            rows={4}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                            placeholder="Reason for late check-in..."
                          />
                        </div>
                      ) : null}
                    </div>
                  </section>
                </div>

                {/* Sidebar Summary & Derived Preview */}
                <div className="space-y-4">
                  <section className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-emerald-200/70 bg-white p-2 text-emerald-700">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                          Current Record
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Review current registered metrics for this attendance session.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white bg-white p-3 ring-1 ring-slate-200">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Punch In
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                          {punchInLabel || "--:--"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white bg-white p-3 ring-1 ring-slate-200">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Punch Out
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                          {punchOutLabel || "--:--"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white bg-white p-3 ring-1 ring-slate-200">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Total Break Duration
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-amber-700">
                          {secondsToDurationLabel(record?.total_break_seconds || 0)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white bg-white p-3 ring-1 ring-slate-200">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Net Worked Hours
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                          {record?.total_hours || "--:--"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="app-panel p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                          Recalculated Preview
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Preview of net values computed deducting break durations.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Net Worked
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900 font-mono">
                          {secondsToDurationLabel(preview.workedSeconds)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Total Break
                        </p>
                        <p className="mt-1 text-sm font-bold text-amber-700 font-mono">
                          {secondsToDurationLabel(preview.totalBreakSeconds)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Late Arrival
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {preview.isLate ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Half Day
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {preview.isHalfDay ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Early Leave
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {preview.isEarlyLeave ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Overtime
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 font-mono">
                          {preview.overtime}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-(--border-soft) bg-white px-5 py-3">
          <div>
            {!isCreateMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || saving}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition-all hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete record
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || saving}
              className="app-btn-primary inline-flex h-10 items-center gap-2 px-5 text-sm font-bold"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {isCreateMode ? "Create audit" : "Save audit"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default AttendanceAuditModal;
