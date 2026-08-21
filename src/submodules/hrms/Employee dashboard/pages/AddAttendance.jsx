import axios from "axios";
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import useAuth from "../../../../hooks/useAuth";
import { usePermission } from "../../../../hooks/usePermission";
import {
  getCurrentIndiaDate,
  parseIndiaDateTime,
} from "../../utils/attendanceTime";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;
const EMPLOYEE_API_BASE =
  "https://csaapnodeapi.csaap.com/api/tenant/hrms/get-employee";
const currentIndiaDate = getCurrentIndiaDate();

const panelClass =
  "bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-hidden transition-all hover:shadow-md";

const buildDateTimeValue = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return "";

  const normalizedTime = String(timeValue).trim().slice(0, 8);
  if (!normalizedTime) return "";

  const timePart =
    normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  return `${dateValue} ${timePart}`;
};

const normalizeTimeValue = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  const match = raw.match(/(\d{2}:\d{2})(?::\d{2})?/);
  if (match) return match[1];
  return raw.length >= 5 ? raw.slice(0, 5) : raw;
};

function secondsToDurationLabel(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0h 0m";
  }

  const safeSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
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

  if (!attendanceDate || !punchInTime || !punchOutTime) {
    return defaultPreview;
  }

  const punchInDateTime = parseIndiaDateTime(attendanceDate, punchInTime);
  const punchOutDateTime = parseIndiaDateTime(attendanceDate, punchOutTime);

  if (!punchInDateTime || !punchOutDateTime) {
    return defaultPreview;
  }

  const workedSeconds = Math.max(
    Math.floor((punchOutDateTime - punchInDateTime) / 1000),
    0,
  );

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

    const projectedEnd = new Date(
      punchInDateTime.getTime() + shiftSeconds * 1000,
    );
    isEarlyLeave = punchOutDateTime < projectedEnd ? 1 : 0;

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

const AddAttendance = () => {
  const { user, token } = useAuth();
  const { has } = usePermission();
  const canAdd = has("hrms.self_service.attendance.add");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [deviceLat, setDeviceLat] = useState("");
  const [deviceLon, setDeviceLon] = useState("");
  const [currentClock, setCurrentClock] = useState("");
  const [employeeProfile, setEmployeeProfile] = useState({
    employeeId: user?.employeeProfileId || user?.employee_id || user?.id || 0,
    employeeName: user?.name || "Employee",
    department: user?.department || user?.employee_department || "",
    postApplied:
      user?.postApplied || user?.post_applied || user?.designation || "N/A",
    companyId: Number(user?.company_id || user?.id || 0),
    companyName: user?.companyName || user?.company || "",
    slug: user?.slug || user?.company_slug || "",
    shiftName: user?.employeeShift || user?.shift_name || "General",
    shiftStart: normalizeTimeValue(user?.shift_start || user?.shiftStart || ""),
    shiftEnd: normalizeTimeValue(user?.shift_end || user?.shiftEnd || ""),
  });
  const [form, setForm] = useState({
    attendanceDate: currentIndiaDate,
    punchInTime: "",
    punchOutTime: "",
    timesheetDetails: "",
    reason: "",
  });
  const [employeeOtClaim, setEmployeeOtClaim] = useState(false);

  const preview = useMemo(
    () =>
      computeAuditPreview({
        attendanceDate: form.attendanceDate,
        punchInTime: form.punchInTime,
        punchOutTime: form.punchOutTime,
        shiftStart: employeeProfile.shiftStart,
        shiftEnd: employeeProfile.shiftEnd,
      }),
    [
      form.attendanceDate,
      form.punchInTime,
      form.punchOutTime,
      employeeProfile.shiftStart,
      employeeProfile.shiftEnd,
    ],
  );

  useEffect(() => {
    if (!preview.otEligible && employeeOtClaim) {
      setEmployeeOtClaim(false);
    }
  }, [preview.otEligible, employeeOtClaim]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      try {
        const employeeProfileId =
          user?.employeeProfileId || user?.employee_id || user?.id || null;

        if (employeeProfileId && token) {
          try {
            const response = await axios.get(
              `${EMPLOYEE_API_BASE}/${employeeProfileId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            const data = response.data?.data || null;

            if (data && active) {
              setEmployeeProfile({
                employeeId: data.id || user?.employee_id || user?.id || 0,
                employeeName:
                  data.name || data.employee_name || user?.name || "Employee",
                department:
                  data.department ||
                  user?.department ||
                  user?.employee_department ||
                  "",
                postApplied:
                  data.postApplied ||
                  data.post_applied ||
                  user?.postApplied ||
                  user?.post_applied ||
                  "N/A",
                companyId: Number(
                  data.company_id || user?.company_id || user?.id || 0,
                ),
                companyName:
                  data.companyName ||
                  data.company ||
                  user?.companyName ||
                  user?.company ||
                  "",
                slug:
                  data.slug ||
                  data.company_slug ||
                  user?.slug ||
                  user?.company_slug ||
                  "",
                shiftName:
                  data.employeeShift ||
                  data.shift_name ||
                  user?.employeeShift ||
                  user?.shift_name ||
                  "General",
                shiftStart: normalizeTimeValue(
                  data.shift_start ||
                    data.shiftStart ||
                    user?.shift_start ||
                    user?.shiftStart ||
                    "",
                ),
                shiftEnd: normalizeTimeValue(
                  data.shift_end ||
                    data.shiftEnd ||
                    user?.shift_end ||
                    user?.shiftEnd ||
                    "",
                ),
              });
            }
          } catch (error) {
            console.warn(
              "Failed to fetch employee profile for attendance",
              error,
            );
          }
        }

        if (!active) return;

        setForm({
          attendanceDate: currentIndiaDate,
          punchInTime: "",
          punchOutTime: "",
          timesheetDetails: "",
          reason: "",
        });
        setEmployeeOtClaim(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, [token, user]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentClock(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date()),
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let active = true;

    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location capture.");
      return undefined;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        setDeviceLat(Number(position.coords.latitude).toFixed(6));
        setDeviceLon(Number(position.coords.longitude).toFixed(6));
        setLocationError("");
      },
      (error) => {
        if (!active) return;
        setLocationError(
          error?.code === 1
            ? "Location permission was denied. The form will still submit, but coordinates will be stored as 0."
            : "Unable to capture your current location right now.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canAdd) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You do not have permission to submit attendance requests.",
      });
      return;
    }

    if (!employeeProfile.employeeId) {
      Swal.fire({
        icon: "warning",
        title: "Employee required",
        text: "We could not determine your employee profile.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    if (!form.attendanceDate || !form.punchInTime || !form.punchOutTime) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Attendance date, punch-in time, and punch-out time are required.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    if (!form.timesheetDetails.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Work summary required",
        text: "Please describe the work you completed before submitting.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    if (preview.isLate && !form.reason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Reason required",
        text: "Late attendance requires a reason.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    const payload = {
      employee_id: employeeProfile.employeeId,
      employee_name: employeeProfile.employeeName,
      department: employeeProfile.department,
      post_applied: employeeProfile.postApplied,
      company_id: employeeProfile.companyId,
      company: employeeProfile.companyName,
      slug: employeeProfile.slug,
      attendance_date: form.attendanceDate,
      mispunch_time: buildDateTimeValue(form.attendanceDate, form.punchInTime),
      leave_time: buildDateTimeValue(form.attendanceDate, form.punchOutTime),
      timesheet_details: form.timesheetDetails.trim(),
      reason: preview.isLate ? form.reason.trim() : "",
      shift_name: employeeProfile.shiftName || "General",
      shift_start: employeeProfile.shiftStart || null,
      shift_end: employeeProfile.shiftEnd || null,
      latitude: Number(deviceLat || 0),
      longitude: Number(deviceLon || 0),
      device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      source: "REQUEST",
      employee_ot_claim: preview.otEligible ? (employeeOtClaim ? 1 : 0) : 0,
    };

    setSaving(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/attendance/employee/add-attendance`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      Swal.fire({
        icon: "success",
        title: "Attendance submitted",
        text:
          response.data?.message ||
          "Your attendance application has been saved.",
        confirmButtonColor: "#4f46e5",
      });

      setForm((current) => ({
        ...current,
        punchInTime: "",
        punchOutTime: "",
        timesheetDetails: "",
        reason: "",
      }));
      setEmployeeOtClaim(false);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to submit the attendance application right now.";

      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: message,
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-transparent py-6 font-sans">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-900" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Loading attendance form
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Please wait while we prepare your submission form
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-4 font-sans md:p-8">
      <div className="mx-auto max-w-4xl space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Add Attendance Request
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Submit a request for a date that does not already have a
                  record.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>{currentClock || "--:--:--"}</span>
            </div>
          </div>
        </div>

        {locationError ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-900">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-5">{locationError}</p>
          </div>
        ) : null}

        <div className={panelClass}>
          <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Attendance Request
              </p>
              <h2 className="text-sm font-bold text-slate-900">
                {currentIndiaDate}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Attendance date
                </label>
                <input
                  type="date"
                  name="attendanceDate"
                  value={form.attendanceDate}
                  max={currentIndiaDate}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Punch-in time
                </label>
                <input
                  type="time"
                  name="punchInTime"
                  value={form.punchInTime}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Punch-out time
                </label>
                <input
                  type="time"
                  name="punchOutTime"
                  value={form.punchOutTime}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Work summary
              </label>
              <textarea
                name="timesheetDetails"
                value={form.timesheetDetails}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the work you completed for this date..."
                className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {preview.otEligible ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <input
                  type="checkbox"
                  name="employeeOtClaim"
                  checked={employeeOtClaim}
                  onChange={(event) => setEmployeeOtClaim(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    Claim overtime
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    Overtime is calculated automatically. Select this only if
                    you want to claim it.
                  </span>
                </span>
              </label>
            ) : null}

            {preview.isLate ? (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Reason for late punch-in
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add a reason only if your punch-in was late..."
                  className="min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving || !canAdd}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit request
                </>
              )}
            </button>
            <p className="pt-1 text-[11px] leading-5 text-slate-500 text-center">
              The request will be rejected if a record already exists for the
              selected date.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAttendance;
