import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import useAuth from "../../../../hooks/useAuth";
import AttendanceSubmissionSkeleton from "../skeletons/AttendanceSubmissionSkeleton";
import {
  getCurrentIndiaDate,
  parseIndiaDateTime,
  formatBreakDuration,
  parseIndiaDateTimeString,
} from "../../utils/attendanceTime";
import {
  Clock,
  Coffee,
  Play,
  MapPinOff,
  TriangleAlert,
  CircleAlert,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import BreakActionModal from "./BreakActionModal";

const getDistanceMetres = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const GEOFENCE_RADIUS_METRES = 100;

const getShiftWindow = (dateValue, shiftStartValue, shiftEndValue) => {
  const shiftStartDateTime = parseIndiaDateTime(dateValue, shiftStartValue);
  const shiftEndDateTime = parseIndiaDateTime(dateValue, shiftEndValue);

  if (!shiftStartDateTime || !shiftEndDateTime) return null;

  if (shiftEndDateTime <= shiftStartDateTime) {
    shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1);
  }

  return { shiftStartDateTime, shiftEndDateTime };
};

const getOtMetrics = ({
  dateValue,
  punchInValue,
  shiftStartValue,
  shiftEndValue,
  evaluationDate,
}) => {
  const punchInDateTime = parseIndiaDateTime(dateValue, punchInValue);
  const shiftWindow = getShiftWindow(dateValue, shiftStartValue, shiftEndValue);

  if (!punchInDateTime || !shiftWindow || !evaluationDate) {
    return {
      overtimeSeconds: 0,
      lateSeconds: 0,
      otEligible: false,
    };
  }

  const { shiftStartDateTime, shiftEndDateTime } = shiftWindow;
  const totalSeconds = Math.max(
    Math.floor((evaluationDate.getTime() - punchInDateTime.getTime()) / 1000),
    0,
  );
  const shiftSeconds = Math.max(
    Math.floor(
      (shiftEndDateTime.getTime() - shiftStartDateTime.getTime()) / 1000,
    ),
    0,
  );
  const lateSeconds = Math.max(
    Math.floor(
      (punchInDateTime.getTime() - shiftStartDateTime.getTime()) / 1000,
    ),
    0,
  );
  const overtimeSeconds = Math.max(totalSeconds - shiftSeconds, 0);

  return {
    overtimeSeconds,
    lateSeconds,
    otEligible: overtimeSeconds >= 30 * 60,
  };
};

const PAGE_LOADING_MIN_MS = 750;

const formatDisplayTime = (timeStr) => {
  if (!timeStr) return "";

  const timeDate = parseIndiaDateTime(getCurrentIndiaDate(), timeStr);
  if (!timeDate) return timeStr;

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(timeDate);
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthEndReportInfo = (dateValue) => {
  if (!dateValue) return null;

  const dateMatch = String(dateValue).match(/\d{4}-\d{2}-\d{2}/);
  if (!dateMatch) return null;

  const [year, month, day] = dateMatch[0].split("-").map(Number);
  if (!year || !month || !day) return null;

  const lastDay = new Date(year, month, 0).getDate();
  if (day < lastDay) return null;

  return {
    month: monthNames[month - 1],
    year,
  };
};

const getAttendanceRecordDate = (record) => {
  const value =
    record?.date ||
    record?.attendance_date ||
    record?.mispunch_time ||
    record?.created_at ||
    "";
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
};

const getAttendanceRecordSortTime = (record) => {
  const dateValue = getAttendanceRecordDate(record);
  if (!dateValue) return 0;

  const rawTimeValue =
    record?.punch_in ||
    record?.mispunch_time ||
    record?.created_at ||
    "00:00:00";
  const timeValue =
    String(rawTimeValue).match(/\d{2}:\d{2}(?::\d{2})?/)?.[0] || "00:00:00";
  const parsedDate = parseIndiaDateTime(dateValue, timeValue);

  return parsedDate ? parsedDate.getTime() : 0;
};

const selectAttendanceSession = (records, today) => {
  if (!Array.isArray(records) || records.length === 0) return null;

  const sortedRecords = [...records].sort(
    (a, b) => getAttendanceRecordSortTime(b) - getAttendanceRecordSortTime(a),
  );
  const latestOpenRecord = sortedRecords.find((record) => !record?.punch_out);

  if (latestOpenRecord) return latestOpenRecord;

  return (
    sortedRecords.find((record) => getAttendanceRecordDate(record) === today) ||
    null
  );
};

const XYZ = () => {
  const [params] = useSearchParams();
  const routeParams = useParams();
  const navigate = useNavigate();
  const company_id = routeParams.company_id || params.get("company_id") || "";

  const { user, token } = useAuth();
  const companyName = params.get("company") || user?.companyName || "";
  const employeeProfileId = user?.employeeProfileId;

  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    department: "",
    postApplied: "",
    mispunchTime: "",
  });
  const [mispunchTime, setMispunchTime] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [reason, setReason] = useState("");
  const [timesheetDetails, setTimesheetDetails] = useState("");
  const [otAllowed, setOtAllowed] = useState(false);
  const [employeeOtClaim, setEmployeeOtClaim] = useState(false);
  const [otEligibleFromApi, setOtEligibleFromApi] = useState(false);
  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [currentTimeTick, setCurrentTimeTick] = useState(Date.now());
  const [qrLat] = useState(params.get("lat") || null);
  const [qrLon] = useState(params.get("lon") || null);
  const [deviceLat, setDeviceLat] = useState(null);
  const [deviceLon, setDeviceLon] = useState(null);
  const [locationTimeout, setLocationTimeout] = useState(false);
  const [locationErrorCode, setLocationErrorCode] = useState(null);
  const [activeSessionDate, setActiveSessionDate] = useState(null);
  const [isExempt, setIsExempt] = useState(false);
  const [exemptionType, setExemptionType] = useState(null);
  const [autofillError, setAutofillError] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("IDLE");
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);
  const [lastBreakStart, setLastBreakStart] = useState(null);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [breakModalAction, setBreakModalAction] = useState("BREAK_START");

  const activeBreakSeconds = useMemo(() => {
    if (sessionStatus !== "ON_BREAK" || !lastBreakStart) return 0;
    const parsedStart = parseIndiaDateTimeString(lastBreakStart);
    const startMs = parsedStart
      ? parsedStart.getTime()
      : new Date(lastBreakStart.replace(" ", "T")).getTime();

    if (Number.isNaN(startMs)) return 0;
    return Math.max(Math.floor((currentTimeTick - startMs) / 1000), 0);
  }, [sessionStatus, lastBreakStart, currentTimeTick]);

  const openBreakModal = (actionType) => {
    setBreakModalAction(actionType);
    setIsBreakModalOpen(true);
  };

  const handleBreakModalSubmit = async (reasonText) => {
    setIsBreakModalOpen(false);
    await handleBreakAction(breakModalAction, reasonText);
  };

  const applyTodayAttendanceState = (record) => {
    if (record) {
      setMispunchTime(record.punch_in || "");
      setLeaveTime(record.punch_out || "");
      setTimesheetDetails(record.timesheet_details || "");
      setEmployeeOtClaim(Boolean(record.employee_ot_claim));
      setOtEligibleFromApi(Boolean(record.ot_eligible));
      setActiveSessionDate(getAttendanceRecordDate(record));
      setSessionStatus(
        record.session_status ||
          (record.punch_out
            ? "COMPLETED"
            : record.punch_in
              ? "WORKING"
              : "IDLE"),
      );
      setTotalBreakSeconds(Number(record.total_break_seconds || 0));
      setLastBreakStart(record.last_break_start || null);
      setReason("");
      return;
    }

    setMispunchTime("");
    setLeaveTime("");
    setTimesheetDetails("");
    setEmployeeOtClaim(false);
    setOtEligibleFromApi(false);
    setActiveSessionDate(null);
    setSessionStatus("IDLE");
    setTotalBreakSeconds(0);
    setLastBreakStart(null);
  };

  const loadTodayAttendance = async (employeeId) => {
    if (!employeeId || !token) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/timesheet/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = res.data.data || [];
      const today = getCurrentIndiaDate();

      setIsExempt(Boolean(res.data.isExempt));
      setExemptionType(res.data.exemptionType || null);

      const latestRecord = selectAttendanceSession(data, today);

      if (latestRecord) {
        applyTodayAttendanceState(latestRecord);
      } else {
        applyTodayAttendanceState(null);
      }
    } catch (error) {
      console.error("Failed to load attendance", error);
      applyTodayAttendanceState(null);
    }
  };

  useEffect(() => {
    let isActive = true;

    const initializePage = async () => {
      const loadStartedAt = Date.now();
      setPageLoading(true);

      try {
        let employeeIdToUse = user?.employee_id || employeeProfileId || null;

        if (user?.name) {
          setFormData((prev) => ({
            ...prev,
            employeeName: user.name,
            employeeId: user.employee_id || prev.employeeId,
            department:
              user.department || user.employee_department || prev.department,
          }));
        }

        if (employeeProfileId && token) {
          const res = await axios.get(
            `https://csaapnodeapi.csaap.com/api/tenant/hrms/get-employee/${employeeProfileId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (res.data.success && res.data.data) {
            const emp = res.data.data;
            employeeIdToUse = emp.id || employeeIdToUse;

            setFormData((prev) => ({
              ...prev,
              employeeId: emp.id,
              employeeName: emp.name,
              department:
                emp.department ||
                emp.employee_department ||
                user?.department ||
                user?.employee_department ||
                "",
              postApplied:
                emp.postApplied || emp.post_applied || emp.designation || "",
            }));

            setShiftName(emp.employeeShift || "");
            setShiftStart(emp.shift_start || "");
            setShiftEnd(emp.shift_end || "");
            setOtAllowed(Boolean(emp.ot_allowed));
          }
        }

        if (employeeIdToUse && token) {
          await loadTodayAttendance(employeeIdToUse);
        } else {
          applyTodayAttendanceState(null);
        }
      } catch (err) {
        console.error("Failed to initialize attendance page", err);
        applyTodayAttendanceState(null);
      } finally {
        const elapsedMs = Date.now() - loadStartedAt;
        const remainingMs = Math.max(PAGE_LOADING_MIN_MS - elapsedMs, 0);

        if (remainingMs > 0) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, remainingMs),
          );
        }

        if (isActive) {
          setPageLoading(false);
        }
      }
    };

    initializePage();

    return () => {
      isActive = false;
    };
  }, [employeeProfileId, token, user?.employee_id, user?.name]);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setCurrentTimeTick(Date.now()),
      1000,
    );
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (params.get("visualise") === "true") {
      const lat = qrLat || params.get("lat") || "20.276400";
      const lon = qrLon || params.get("lon") || "20.276400";
      window.location.href = `https://geo-fenching-by-srj.vercel.app/${lat}/${lon}`;
    }
  }, [params, qrLat, qrLon]);

  const hasPunchedIn = Boolean(mispunchTime) && !leaveTime;
  const hasPunchedOut = Boolean(mispunchTime) && Boolean(leaveTime);
  const todayIndiaDate = getCurrentIndiaDate();
  const displayedAttendanceDate = activeSessionDate || todayIndiaDate;
  const shiftStartDateTime = parseIndiaDateTime(todayIndiaDate, shiftStart);
  const reasonRequiredForPunchIn = (() => {
    if (hasPunchedIn || hasPunchedOut || !shiftStartDateTime) return false;
    const threshold = new Date(shiftStartDateTime.getTime() + 16 * 60 * 1000);
    return Date.now() >= threshold.getTime();
  })();
  const liveOtMetrics = getOtMetrics({
    dateValue: activeSessionDate,
    punchInValue: mispunchTime,
    shiftStartValue: shiftStart,
    shiftEndValue: shiftEnd,
    evaluationDate: new Date(currentTimeTick),
  });
  const showOtClaimCheckbox =
    otAllowed &&
    hasPunchedIn &&
    (otEligibleFromApi || liveOtMetrics.otEligible);

  const hasDeviceLocation = deviceLat != null && deviceLon != null;
  const hasQrLocation = qrLat != null && qrLon != null;
  const distanceMetres =
    hasDeviceLocation && hasQrLocation
      ? getDistanceMetres(
          parseFloat(deviceLat),
          parseFloat(deviceLon),
          parseFloat(qrLat),
          parseFloat(qrLon),
        )
      : null;
  const isWithinRange =
    distanceMetres !== null && distanceMetres <= GEOFENCE_RADIUS_METRES;
  const geofenceBlocked = !isWithinRange && !isExempt;

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        try {
          setDeviceLat(Number(pos.coords.latitude).toFixed(6));
          setDeviceLon(Number(pos.coords.longitude).toFixed(6));
        } catch (err) {
          console.warn("Failed to set navigator geolocation", err);
        }
      },
      (err) => {
        console.warn("navigator.geolocation error", err);
        setLocationErrorCode(err?.code ?? null);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (hasDeviceLocation && hasQrLocation) {
      setLocationTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!hasDeviceLocation || !hasQrLocation) {
        setLocationTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasDeviceLocation, hasQrLocation]);
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "reason") {
      setReason(value);
    } else if (name === "timesheetDetails") {
      setTimesheetDetails(value);
      setAutofillError(false);
    } else if (name === "employeeOtClaim") {
      setEmployeeOtClaim(checked);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId) {
      Swal.fire({
        icon: "warning",
        title: "Employee Required",
        text: "Please select an employee before submitting.",
      });
      return;
    }

    if (!company_id) {
      Swal.fire({
        icon: "warning",
        title: "Company Required",
        text: "Company ID is missing. Please login or provide company info.",
      });
      return;
    }

    const hasPunchedIn = mispunchTime && !leaveTime;
    const hasPunchedOut = mispunchTime && leaveTime;

    if (!hasPunchedIn && !shiftName) {
      Swal.fire({
        icon: "warning",
        title: "Shift Required",
        text: "Please select a shift before punching in.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    if (!hasPunchedIn && reasonRequiredForPunchIn && !reason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Reason Required",
        text: "Please provide a reason for arriving late.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    if (hasPunchedOut) {
      Swal.fire({
        icon: "warning",
        title: "Already Punched Out",
        text: "You have already completed your attendance for this session.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    const monthEndReport =
      getMonthEndReportInfo(todayIndiaDate) ||
      getMonthEndReportInfo(activeSessionDate);

    if (monthEndReport) {
      try {
        const reportRes = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/monthly-reports/${user.slug}/employee/${formData.employeeId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const reports = Array.isArray(reportRes.data) ? reportRes.data : [];
        const reportAlreadySubmitted = reports.some(
          (report) =>
            String(report.month).toLowerCase() ===
              monthEndReport.month.toLowerCase() &&
            Number(report.year) === Number(monthEndReport.year),
        );

        if (!reportAlreadySubmitted) {
          const result = await Swal.fire({
            icon: "warning",
            title: "Monthly work report required",
            text: `Please submit your ${monthEndReport.month} ${monthEndReport.year} monthly work report before punching out.`,
            showCancelButton: true,
            confirmButtonText: "Go to Monthly Work Report",
            cancelButtonText: "Stay here",
            confirmButtonColor: "#4f46e5",
          });

          if (result.isConfirmed) {
            navigate(
              `/employee/work-report?tab=monthly&openForm=1&month=${encodeURIComponent(monthEndReport.month)}&year=${monthEndReport.year}`,
            );
          }

          return;
        }
      } catch (reportError) {
        console.error(
          "Failed to check monthly report before punch out",
          reportError,
        );
        Swal.fire({
          icon: "error",
          title: "Report check failed",
          text: "We could not verify your monthly work report. Please try again before punching out.",
          confirmButtonColor: "#4f46e5",
        });
        return;
      }
    }

    if (hasPunchedIn && !timesheetDetails.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Timesheet Details Required",
        text: "Please enter timesheet details before punching out.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        employee_id: formData.employeeId,
        employee_name: formData.employeeName,
        department: formData.department,
        employee_department: formData.department,
        post_applied: formData.postApplied,
        company_id,
        company: companyName,
        slug: user.slug,
        latitude: parseFloat(deviceLat || qrLat || params.get("lat") || 0),
        longitude: parseFloat(deviceLon || qrLon || params.get("lon") || 0),
        qr_latitude: parseFloat(qrLat || 0),
        qr_longitude: parseFloat(qrLon || 0),
        qr_sig: params.get("sig") || "",
        device: /Mobi|Android/i.test(navigator.userAgent)
          ? "mobile"
          : "desktop",
        source: "PORTAL",
        action: hasPunchedIn ? "PUNCH_OUT" : "PUNCH_IN",
        shift_name: !hasPunchedIn ? shiftName : undefined,
        shift_start: !hasPunchedIn
          ? shiftStart?.includes(":") && shiftStart.length === 5
            ? `${shiftStart}:00`
            : shiftStart
          : undefined,
        shift_end: !hasPunchedIn
          ? shiftEnd?.includes(":") && shiftEnd.length === 5
            ? `${shiftEnd}:00`
            : shiftEnd
          : undefined,
        reason: !hasPunchedIn ? reason.trim() || undefined : undefined,
        timesheet_details: hasPunchedIn ? timesheetDetails : undefined,
        employee_ot_claim: hasPunchedIn ? (employeeOtClaim ? 1 : 0) : undefined,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/submit`,
        payload,
      );

      if (res.data.type === "IN") {
        setMispunchTime(res.data.mispunch_time);
        setLeaveTime("");
        setReason("");
        setEmployeeOtClaim(false);
        setOtEligibleFromApi(false);
        Swal.fire({
          icon: "success",
          title: "Punch In Successful",
          text: `Punch In Time: ${formatDisplayTime(res.data.mispunch_time)}`,
          confirmButtonColor: "#4f46e5",
        });
      } else if (res.data.type === "OUT") {
        setLeaveTime(res.data.leave_time);
        setEmployeeOtClaim(Boolean(res.data.employee_ot_claim));
        setOtEligibleFromApi(Boolean(res.data.ot_eligible));
        Swal.fire({
          icon: "success",
          title: "Punch Out Successful",
          text: `Punch Out Time: ${formatDisplayTime(res.data.punch_out)}`,
          confirmButtonColor: "#4f46e5",
        });
      }

      await loadTodayAttendance(formData.employeeId);
    } catch (error) {
      console.error("Error submitting attendance", error);
      if (error?.response?.data?.code === "MONTHLY_REPORT_REQUIRED") {
        const report = error.response.data.report || {};
        const result = await Swal.fire({
          icon: "warning",
          title: "Monthly work report required",
          text:
            error.response.data.message ||
            "Please submit your monthly work report before punching out.",
          showCancelButton: true,
          confirmButtonText: "Go to Monthly Work Report",
          cancelButtonText: "Stay here",
          confirmButtonColor: "#4f46e5",
        });

        if (result.isConfirmed) {
          navigate(
            `/employee/work-report?tab=monthly&openForm=1&month=${encodeURIComponent(report.month || "")}&year=${report.year || new Date().getFullYear()}`,
          );
        }
        return;
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit attendance";
      Swal.fire({
        icon: "warning",
        title: "Attendance Info",
        text: message,
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleBreakAction = async (actionType, reasonOverride) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const selectedReason =
        reasonOverride ||
        (actionType === "BREAK_START"
          ? reason.trim() || "General Break"
          : undefined);

      const payload = {
        employee_id: formData.employeeId,
        employee_name: formData.employeeName,
        department: formData.department,
        company_id,
        company: companyName,
        slug: user?.slug,
        latitude: parseFloat(deviceLat || qrLat || params.get("lat") || 0),
        longitude: parseFloat(deviceLon || qrLon || params.get("lon") || 0),
        qr_latitude: parseFloat(qrLat || 0),
        qr_longitude: parseFloat(qrLon || 0),
        qr_sig: params.get("sig") || "",
        device: /Mobi|Android/i.test(navigator.userAgent)
          ? "mobile"
          : "desktop",
        action: actionType,
        reason: selectedReason,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/submit`,
        payload,
      );

      if (res.data.success) {
        setSessionStatus(res.data.session_status);
        if (res.data.total_break_seconds !== undefined) {
          setTotalBreakSeconds(res.data.total_break_seconds);
        }
        if (res.data.last_break_start) {
          setLastBreakStart(res.data.last_break_start);
        }
        Swal.fire({
          icon: "success",
          title:
            actionType === "BREAK_START" ? "Break Started" : "Work Resumed",
          text: res.data.message || "Attendance updated successfully",
          confirmButtonColor: "#4f46e5",
        });
        await loadTodayAttendance(formData.employeeId);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update break status";
      Swal.fire({
        icon: "warning",
        title: "Break Info",
        text: message,
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAutofillTimesheet = async () => {
    setIsAutofilling(true);
    try {
      const today = getCurrentIndiaDate();
      const todosRes = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/todos/completed-by-date?company_slug=${user.slug}&created_by=${user.user_id}&date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const todayTodos = todosRes.data || [];
      if (todayTodos.length === 0) {
        setIsAutofilling(false);
        setAutofillError(true);
        return;
      }
      setAutofillError(false);

      const contextText = todayTodos
        .map((t) => {
          let text = `- Task: ${t.title}`;
          if (t.description) text += `\n  Description: ${t.description}`;
          if (t.subtasks && t.subtasks.length > 0) {
            text += `\n  Subtasks: ${t.subtasks.map((st) => st.title).join(", ")}`;
          }
          return text;
        })
        .join("\n\n");

      const aiRes = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/autofill-timesheet`,
        {
          context: contextText,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (aiRes.data && aiRes.data.success) {
        setTimesheetDetails(aiRes.data.summary);
      }
    } catch (error) {
      console.error("Autofill error:", error);
    } finally {
      setIsAutofilling(false);
    }
  };

  const formatTime = (timeStr) => formatDisplayTime(timeStr);
  const getCurrentClockTime = () =>
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(currentTimeTick));

  return (
    <>
      <style>{`
        @keyframes attendanceBlurIn {
          from {
            opacity: 0;
            transform: translateY(6px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
      <div
        className="min-h-screen bg-linear-to-br from-slate-50 via-white to-sky-50 px-3 py-4 md:px-6 md:py-8"
        style={{ animation: "attendanceBlurIn 280ms ease-out both" }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 space-y-2 md:mb-5">
            <div className="flex flex-col gap-2">
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Attendance portal
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                  Submit your attendance
                </h1>
                <p className="max-w-2xl text-xs leading-5 text-slate-600 md:text-sm">
                  Attendance is timestamped automatically when you submit this
                  form. For corrections, please contact the HR team.
                </p>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="border-b border-slate-100 px-4 py-4 md:px-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                    Attendance details
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 md:text-sm">
                    Review the prefilled information, add what applies, then
                    submit.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isExempt && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 shadow-sm transition-all hover:bg-emerald-100/80">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="flex items-center gap-1.5">
                        {(() => {
                          const type = exemptionType?.toLowerCase();
                          if (type === "wfh") return "Work from Home Active";
                          if (type === "remote") return "Remote Mode Enabled";
                          if (type === "field") return "Field Duty Authorized";
                          return "Remote Sync Active";
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm ring-1 ring-inset ring-slate-900/10">
                    <Clock className="h-3.5 w-3.5 text-sky-300" />
                    <span className="font-semibold tabular-nums">
                      {getCurrentClockTime()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {((locationTimeout && !hasDeviceLocation) ||
              (!hasQrLocation && locationTimeout)) && (
              <div className="px-4 pt-4 md:px-6 md:pt-6">
                {locationTimeout && !hasDeviceLocation && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ring-1 ${
                      locationErrorCode === 1
                        ? "border-red-200 bg-red-50 text-red-800 ring-red-200"
                        : "border-amber-200 bg-amber-50 text-amber-800 ring-amber-200"
                    }`}
                  >
                    {locationErrorCode === 1 ? (
                      <MapPinOff className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    ) : (
                      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    )}
                    <div>
                      {locationErrorCode === 1 ? (
                        <>
                          <p className="font-semibold text-red-900">
                            Location permission denied
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-red-700">
                            Your browser blocked location access. Open your
                            browser settings, allow location for this site, then
                            reload the page.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-amber-900">
                            Taking longer than usual to detect your location
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-amber-700">
                            This usually resolves on its own. Try moving to an
                            area with better GPS signal, or check that location
                            services are enabled on your device.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {!hasQrLocation && locationTimeout && (
                  <div className="mt-3 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 ring-1 ring-red-200">
                    <CircleAlert className="h-5 w-5 shrink-0 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-900">
                        QR location data is missing
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-red-700">
                        The scanned QR code doesn't include valid coordinates.
                        Please ask your HR team to regenerate it.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {pageLoading || !hasDeviceLocation || !hasQrLocation ? (
              <AttendanceSubmissionSkeleton />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 px-4 py-4 md:px-6 md:py-6"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Company name
                    </label>
                    <div className="text-sm font-medium text-slate-900">
                      {companyName || "N/A"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Attendance date
                    </label>
                    <div className="text-sm font-medium text-slate-900">
                      {displayedAttendanceDate}
                    </div>
                  </div>
                </div>

                {hasPunchedIn &&
                  activeSessionDate &&
                  activeSessionDate !== todayIndiaDate && (
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-900 shadow-sm ring-1 ring-amber-100/50">
                      <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                      <div className="text-sm">
                        <span className="font-semibold">Note:</span> You are
                        still punched in from{" "}
                        <span className="font-bold">{activeSessionDate}</span>.
                        Please close this session before starting a new one.
                      </div>
                    </div>
                  )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Employee name
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Device latitude
                    </label>
                    <input
                      type="text"
                      value={deviceLat || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Device longitude
                    </label>
                    <input
                      type="text"
                      value={deviceLon || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Shift name
                    </label>
                    <input
                      type="text"
                      value={shiftName}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Shift start time
                    </label>
                    <input
                      type="text"
                      value={formatTime(shiftStart)}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Shift end time
                    </label>
                    <input
                      type="text"
                      value={formatTime(shiftEnd)}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Punch-in time
                    </label>
                    <input
                      type="text"
                      value={formatTime(mispunchTime)}
                      readOnly
                      placeholder="Punch In Time"
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Punch-out time
                    </label>
                    <input
                      type="text"
                      value={formatTime(leaveTime)}
                      readOnly
                      placeholder="Punch Out Time"
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
                    />
                  </div>
                </div>

                {!mispunchTime && !leaveTime && reasonRequiredForPunchIn && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Reason for late punch-in
                    </label>
                    <textarea
                      name="reason"
                      value={reason}
                      onChange={handleChange}
                      placeholder="Enter the reason for arriving late..."
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                )}

                {mispunchTime && !leaveTime && sessionStatus !== "ON_BREAK" && (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Work summary
                      </label>
                      <button
                        type="button"
                        onClick={handleAutofillTimesheet}
                        disabled={isAutofilling}
                        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold text-indigo-700 shadow-xs ring-1 ring-inset ring-indigo-200 transition-all hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
                      >
                        {isAutofilling ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-indigo-700 border-t-transparent" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        {isAutofilling ? "Generating..." : "Autofill with AI"}
                      </button>
                    </div>

                    {autofillError && (
                      <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-xs leading-relaxed text-slate-600">
                          AI Autofill generates your work summary by syncing
                          with your daily{" "}
                          <span className="font-bold text-slate-900 text-[10px] uppercase tracking-wide">
                            To-Do list
                          </span>
                          . No completed entries were found for today. To use
                          this feature, please ensure you have added and marked
                          your items as completed in the{" "}
                          <span className="font-bold text-slate-900">
                            Employee Dashboard
                          </span>
                          .
                        </p>
                      </div>
                    )}

                    <textarea
                      name="timesheetDetails"
                      value={timesheetDetails}
                      onChange={handleChange}
                      placeholder="Describe your work before punching out..."
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                )}

                {showOtClaimCheckbox && sessionStatus !== "ON_BREAK" && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                    <input
                      type="checkbox"
                      name="employeeOtClaim"
                      checked={employeeOtClaim}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        Claim overtime
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        Overtime is saved automatically. Select this only if you
                        want to claim it.
                      </span>
                    </span>
                  </label>
                )}

                {!hasPunchedOut && geofenceBlocked && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800">
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div>
                      <p className="font-semibold">
                        You are outside the allowed zone
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-red-700">
                        {distanceMetres !== null
                          ? "Please move closer to the office to enable attendance."
                          : "We could not determine your location. Please allow location access and try again."}
                      </p>
                    </div>
                  </div>
                )}

                {!hasPunchedOut &&
                  !geofenceBlocked &&
                  !isWithinRange &&
                  isExempt && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <div>
                        <p className="font-semibold">
                          Remote Access Authorized
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-emerald-700">
                          {(() => {
                            const type = exemptionType?.toLowerCase();
                            if (type === "wfh")
                              return "Your Work from Home status allows you to proceed from this location.";
                            if (type === "remote")
                              return "Remote Working Mode is enabled for your account today.";
                            if (type === "field")
                              return "Field Duty status is active; location restrictions are suspended.";
                            return "You are currently authorized for remote attendance.";
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                {!hasPunchedOut && sessionStatus === "ON_BREAK" && (
                  <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 sm:p-5 shadow-xs transition-all">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200/80 mt-0.5 sm:mt-0 shadow-2xs">
                          <Coffee className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between sm:justify-start gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                              You are currently on break
                            </h4>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/80 bg-white/90 px-2 py-0.5 text-xs font-mono font-bold text-amber-900 shadow-2xs shrink-0">
                              <Clock
                                className="h-3 w-3 text-amber-600 animate-spin"
                                style={{ animationDuration: "4s" }}
                              />
                              {formatBreakDuration(activeBreakSeconds)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
                            Click "Resume Work" when you return to your desk.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBreakAction("BREAK_END")}
                        disabled={isSubmitting || geofenceBlocked}
                        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition duration-150 disabled:opacity-60"
                      >
                        <Play className="h-4 w-4" />
                        {isSubmitting
                          ? "Resuming..."
                          : "Resume Work (Break In)"}
                      </button>
                    </div>
                  </div>
                )}

                {!hasPunchedOut && sessionStatus !== "ON_BREAK" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {hasPunchedIn && sessionStatus === "WORKING" && (
                      <button
                        type="button"
                        onClick={() => openBreakModal("BREAK_START")}
                        disabled={isSubmitting || geofenceBlocked}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Coffee className="h-4 w-4 text-slate-600" />
                        Take a Break
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting || geofenceBlocked}
                      className={`group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-sky-700 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)] transition duration-200 hover:-translate-y-0.5 hover:from-slate-800 hover:via-slate-700 hover:to-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${
                        hasPunchedIn && sessionStatus === "WORKING"
                          ? ""
                          : "sm:col-span-2"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          {hasPunchedIn ? "Punch Out" : "Punch In"}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {hasPunchedOut && (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 py-8 text-center ring-1 ring-emerald-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-emerald-900">
                        Attendance Completed
                      </h3>
                      <p className="mt-1 text-xs text-emerald-700">
                        You have successfully finished your shift for today.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            )}
          </section>
        </div>
      </div>

      <BreakActionModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        onSubmit={handleBreakModalSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default XYZ;
