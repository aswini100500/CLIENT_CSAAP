import axios from "axios";
import {
  CalendarDays,
  CheckCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import useAuth from "../../../../hooks/useAuth";
import {
  formatAttendanceTime24,
  getAttendanceDateValue,
  parseIndiaDateTime,
} from "../../utils/attendanceTime";
import React from "react";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;

function secondsToDurationLabel(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0h 0m";
  }

  const safeSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function buildDateTimeValue(dateValue, timeValue) {
  if (!dateValue || !timeValue) return "";

  const normalizedTime = String(timeValue).trim().slice(0, 8);
  if (!normalizedTime) return "";

  const timePart =
    normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  return `${dateValue} ${timePart}`;
}

function computeAuditPreview({
  attendanceDate,
  punchInTime,
  punchOutTime,
  shiftStart,
  shiftEnd,
}) {
  const defaultPreview = {
    workedSeconds: 0,
    shiftSeconds: 0,
    overtimeSeconds: 0,
    overtime: "0h 0m",
    isLate: 0,
    isEarlyLeave: 0,
    isHalfDay: 0,
    otEligible: false,
  };

  if (!attendanceDate || !punchInTime) {
    return defaultPreview;
  }

  const punchInDateTime = parseIndiaDateTime(attendanceDate, punchInTime);
  const punchOutDateTime = punchOutTime
    ? parseIndiaDateTime(attendanceDate, punchOutTime)
    : null;

  if (!punchInDateTime) {
    return defaultPreview;
  }

  const workedSeconds = punchOutDateTime
    ? Math.max(Math.floor((punchOutDateTime - punchInDateTime) / 1000), 0)
    : 0;

  let shiftSeconds = 0;
  let overtimeSeconds = 0;
  let isLate = 0;
  let isEarlyLeave = 0;

  const shiftStartDateTime = shiftStart
    ? parseIndiaDateTime(attendanceDate, shiftStart)
    : null;
  const shiftEndDateTime = shiftEnd
    ? parseIndiaDateTime(attendanceDate, shiftEnd)
    : null;

  if (shiftStartDateTime && shiftEndDateTime) {
    if (shiftEndDateTime <= shiftStartDateTime) {
      shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1);
    }

    shiftSeconds = Math.max(
      Math.floor((shiftEndDateTime - shiftStartDateTime) / 1000),
      0,
    );

    const lateThreshold = new Date(
      shiftStartDateTime.getTime() + 16 * 60 * 1000,
    );
    isLate = punchInDateTime > lateThreshold ? 1 : 0;

    if (punchOutDateTime) {
      const projectedEnd = new Date(
        punchInDateTime.getTime() + shiftSeconds * 1000,
      );
      isEarlyLeave = punchOutDateTime < projectedEnd ? 1 : 0;
    }

    overtimeSeconds = Math.max(workedSeconds - shiftSeconds, 0);
  }

  const isHalfDay = workedSeconds < 7 * 60 * 60 ? 1 : 0;

  return {
    workedSeconds,
    shiftSeconds,
    overtimeSeconds,
    overtime: secondsToDurationLabel(overtimeSeconds),
    isLate,
    isEarlyLeave,
    isHalfDay,
    otEligible: overtimeSeconds >= 30 * 60,
  };
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
  const token = authToken || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState(attendanceRecord?.rawData || null);
  const [form, setForm] = useState(emptyForm);

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

    const fetchEmployeeDetails = async (employeeId) => {
      if (!employeeId || !token) return null;

      const response = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/get-employee/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data?.data || null;
    };

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

        if (attendanceId) {
          const response = await axios.get(
            `${API_BASE}/api/attendance/audit/${attendanceId}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            },
          );

          nextRecord = response.data?.data || nextRecord;
        } else {
          try {
            const employeeDetails = await fetchEmployeeDetails(
              attendanceRecord?.employee_id,
            );

            if (employeeDetails) {
              nextRecord = {
                ...nextRecord,
                employee_name:
                  employeeDetails.name ||
                  employeeDetails.employee_name ||
                  nextRecord?.employee_name ||
                  "Unknown",
                post_applied:
                  employeeDetails.postApplied ||
                  employeeDetails.post_applied ||
                  nextRecord?.post_applied ||
                  "N/A",
                shift_name:
                  employeeDetails.employeeShift ||
                  employeeDetails.shift_name ||
                  nextRecord?.shift_name ||
                  "General",
                shift_start:
                  employeeDetails.shift_start ||
                  employeeDetails.shiftStart ||
                  nextRecord?.shift_start ||
                  "",
                shift_end:
                  employeeDetails.shift_end ||
                  employeeDetails.shiftEnd ||
                  nextRecord?.shift_end ||
                  "",
                company:
                  employeeDetails.companyName ||
                  employeeDetails.company ||
                  nextRecord?.company ||
                  "",
              };
            }
          } catch (employeeError) {
            console.warn(
              "Failed to fetch employee details for audit",
              employeeError,
            );
          }
        }

        if (!isMounted) return;

        const mergedRecord = buildBaseRecord(nextRecord || {});
        setRecord(mergedRecord);
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
      }),
    [
      form.attendanceDate,
      form.punchInTime,
      form.punchOutTime,
      form.shiftStart,
      form.shiftEnd,
    ],
  );

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.attendanceDate ||
      !form.punchInTime ||
      form.punchInTime === "N/A"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Attendance date and punch-in time are required for audit.",
        confirmButtonColor: "#065f46",
      });
      return;
    }

    if (!isPunchOutMissing && !form.timesheetDetails.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Timesheet required",
        text: "Timesheet details are required when a punch-out time is provided.",
        confirmButtonColor: "#065f46",
      });
      return;
    }

    if (preview.isLate && !form.reason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Reason required",
        text: "Late attendance requires a reason before the audit can be saved.",
        confirmButtonColor: "#065f46",
      });
      return;
    }

    setSaving(true);
    setError("");

    try {
      const employeeId =
        record?.employee_id || attendanceRecord?.employee_id || 0;
      const payload = {
        employee_id: employeeId,
        employee_name:
          record?.employee_name || attendanceRecord?.employee_name || "Unknown",
        post_applied:
          record?.post_applied ||
          attendanceRecord?.post_applied ||
          attendanceRecord?.postApplied ||
          "N/A",
        company_id: Number(
          record?.company_id ||
            attendanceRecord?.company_id ||
            attendanceRecord?.rawData?.company_id ||
            0,
        ),
        company:
          record?.company ||
          attendanceRecord?.company ||
          attendanceRecord?.rawData?.company ||
          "",
        slug:
          record?.slug ||
          attendanceRecord?.slug ||
          attendanceRecord?.rawData?.slug ||
          "",
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
        device: "audit",
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
        confirmButtonColor: "#065f46",
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
        confirmButtonColor: "#065f46",
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
          confirmButtonColor: "#065f46",
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
        confirmButtonColor: "#065f46",
      });
    } finally {
      setSaving(false);
    }
  };

  const punchInLabel = formatAttendanceTime24(record?.mispunch_time);
  const punchOutLabel = formatAttendanceTime24(record?.leave_time);

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="app-modal flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden">
        <div className="flex shrink-0 items-start justify-between border-b border-(--border-soft) bg-white px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">
                {isCreateMode ? "Create attendance audit" : "Attendance audit"}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="truncate text-slate-900 normal-case tracking-normal">
                  {attendanceRecord?.employeeName ||
                    attendanceRecord?.employee_name ||
                    "Employee"}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  {form.attendanceDate || attendanceRecord?.date || "N/A"}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-mono">ID {attendanceId || "--"}</span>
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

        <div className="flex-1 overflow-y-auto bg-(--bg-subtle)/45 p-4 sm:p-5 custom-scrollbar">
          {loading ? (
            <div className="app-panel flex min-h-105 items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading audit record...
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
                  <section className="app-panel overflow-hidden">
                    <div className="app-section-bar px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                        Attendence timing
                      </p>
                    </div>
                    <div className="grid divide-slate-100 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:divide-x sm:divide-y-0 divide-y">
                      <div className="bg-white p-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Attendance date
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
                          Punch-in time*
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
                          Punch-out time
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

                  <section className="app-panel overflow-hidden">
                    <div className="app-section-bar px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                        Shift info
                      </p>
                    </div>
                    <div className="grid divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-y">
                      <div className="bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Shift name
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {record?.shift_name || "General"}
                        </p>
                      </div>
                      <div className="bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Shift start
                        </p>
                        <p className="mt-2 font-mono text-sm font-semibold text-slate-900">
                          {formatAttendanceTime24(record?.shift_start) ||
                            "--:--"}
                        </p>
                      </div>
                      <div className="bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Shift end
                        </p>
                        <p className="mt-2 font-mono text-sm font-semibold text-slate-900">
                          {formatAttendanceTime24(record?.shift_end) || "--:--"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="app-panel overflow-hidden">
                    <div className="app-section-bar px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                        Notes
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
                          Timesheet details
                        </label>
                        <textarea
                          name="timesheetDetails"
                          value={form.timesheetDetails}
                          onChange={handleChange}
                          disabled={isPunchOutMissing}
                          rows={5}
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
                            Late reason*
                          </label>
                          <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            rows={5}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                            placeholder="Keep the original reason without re-entry..."
                          />
                        </div>
                      ) : null}
                    </div>
                  </section>
                </div>

                <div className="space-y-4">
                  <section className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-emerald-200/70 bg-white p-2 text-emerald-700">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                          Current record
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Review the current punches here and update them as
                          needed.
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
                          Total Hours
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                          {record?.total_hours || "--:--"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white bg-white p-3 ring-1 ring-slate-200">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Shift
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {record?.shift_name || "General"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                          Derived preview
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          These values are recalculated from the raw times on
                          save.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Worked
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {secondsToDurationLabel(preview.workedSeconds)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Overtime
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {preview.overtime}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Late
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
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          Early leave
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {preview.isEarlyLeave ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          OT eligible
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {preview.otEligible ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
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
              className="app-btn-secondary inline-flex h-10 items-center px-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || saving}
              className="app-btn-primary inline-flex h-10 items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"
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
};

export default AttendanceAuditModal;
