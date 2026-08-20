import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock,
  Coffee,
  HeartPulse,
  Info,
  LogOut,
  MapPin,
  MapPinOff,
  MessageSquare,
  Play,
  QrCode,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
  User,
  Utensils,
  X,
} from "lucide-react";
import useAuth from "../../../../hooks/useAuth";
import {
  formatBreakDuration,
  getCurrentIndiaDate,
  parseIndiaDateTime,
  parseIndiaDateTimeString,
} from "../../utils/attendanceTime";
import AttendanceSubmissionSkeleton from "../skeletons/AttendanceSubmissionSkeleton";

/** Returns distance in metres between two lat/lon points (Haversine). */
const getDistanceMetres = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6_371_000; // Earth radius in metres
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

const formatDisplayTime = (timeStr) => {
  if (!timeStr) return "";
  const raw = String(timeStr).trim();
  if (/am|pm/i.test(raw)) return raw;

  const timeMatch = raw.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!timeMatch) return raw;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

  const d = new Date();
  d.setHours(hours, minutes, seconds, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getDayOfWeekInIndia = (year, monthIndex, day) => {
  const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00+05:30`;
  const date = new Date(dateStr);
  return date.getDay(); // 0 = Sunday
};

const getLastWorkingDayOfMonth = (year, monthIndex, holidayDatesSet) => {
  let day = new Date(year, monthIndex + 1, 0).getDate();
  const holidays = holidayDatesSet || new Set();
  while (day > 0) {
    const dayOfWeek = getDayOfWeekInIndia(year, monthIndex, day);
    const dateString = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dayOfWeek === 0 || holidays.has(dateString)) {
      day--;
    } else {
      break;
    }
  }
  return {
    dateString: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    day,
    monthName: monthNames[monthIndex],
    year,
  };
};

const checkMonthlyReportStatus = async (employeeId, slug, token, holidays) => {
  if (!employeeId || !slug) {
    return { softReminderReport: null, hardBlockReport: null };
  }

  const holidayDatesSet = new Set(
    holidays.map((h) => String(h?.date || "").slice(0, 10)).filter(Boolean),
  );

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // YYYY-MM-DD

  const [currYear, currMonthNum] = todayStr.split("-").map(Number);
  const currMonthIndex = currMonthNum - 1;

  try {
    const [reportRes, employeeRes] = await Promise.all([
      axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/monthly-reports/${slug}/employee/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
      axios
        .get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/by-id/${employeeId}`)
        .catch(() => ({ data: {} })),
    ]);
    const reports = Array.isArray(reportRes.data) ? reportRes.data : [];
    const employee = employeeRes.data?.data || employeeRes.data || {};
    const createdAt =
      employee.created_at ||
      employee.createdAt ||
      employee.date_created ||
      employee.created_on ||
      employee.joining_date ||
      employee.joiningDate;
    const submittedReportsSet = new Set(
      reports.map((r) => `${String(r.month).toLowerCase()}_${r.year}`),
    );

    let softReminderReport = null;
    let hardBlockReport = null;

    const lastWorkingDay = getLastWorkingDayOfMonth(currYear, currMonthIndex, holidayDatesSet);
    const createdDate = String(createdAt || "").match(/\d{4}-\d{2}-\d{2}/)?.[0];
    const employeeWasCreatedForMonth = !createdDate || createdDate <= lastWorkingDay.dateString;
    const key = `${lastWorkingDay.monthName.toLowerCase()}_${lastWorkingDay.year}`;

    if (employeeWasCreatedForMonth && !submittedReportsSet.has(key) && todayStr === lastWorkingDay.dateString) {
      softReminderReport = lastWorkingDay;
    }

    return { softReminderReport, hardBlockReport };
  } catch (err) {
    console.warn("Monthly report status check error:", err);
    return { softReminderReport: null, hardBlockReport: null };
  }
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

export default function TokenizedPunch() {
  const { qrToken } = useParams();
  const navigate = useNavigate();

  // Redux & Session Auth
  const { user: authUser, token: authToken } = useAuth();
  const sessionUser = useMemo(() => {
    try {
      const raw =
        sessionStorage.getItem("hrmsUser") ||
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("employeeUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const user = useMemo(
    () => ({
      ...sessionUser,
      ...authUser,
    }),
    [sessionUser, authUser],
  );

  const token =
    authToken ||
    sessionStorage.getItem("employeeToken") ||
    sessionStorage.getItem("hrmsUserToken") ||
    sessionStorage.getItem("token") ||
    "";

  const employeeId =
    user?.employee_id ||
    user?.employeeProfileId ||
    (user?.isEmployee ? user?.user_id || user?.id : null) ||
    sessionUser?.employee_id ||
    (sessionUser?.isEmployee ? sessionUser?.id : null) ||
    "";

  // QR Checkpoint State
  const [loadingQr, setLoadingQr] = useState(true);
  const [qrMetadata, setQrMetadata] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Form & Attendance Data State
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    department: "",
    postApplied: "",
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
  const [deviceLat, setDeviceLat] = useState(null);
  const [deviceLon, setDeviceLon] = useState(null);
  const [locationErrorCode, setLocationErrorCode] = useState(null);
  const [locationTimeout, setLocationTimeout] = useState(false);
  const [activeSessionDate, setActiveSessionDate] = useState(null);
  const [isExempt, setIsExempt] = useState(false);
  const [exemptionType, setExemptionType] = useState(null);
  const [autofillError, setAutofillError] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("IDLE");
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);
  const [lastBreakStart, setLastBreakStart] = useState(null);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [breakModalAction, setBreakModalAction] = useState("BREAK_START");

  // Custom Feedback Dialog State
  const [feedbackDialog, setFeedbackDialog] = useState(null);

  const showFeedback = (options) => {
    return new Promise((resolve) => {
      setFeedbackDialog({
        ...options,
        resolve: (res) => {
          setFeedbackDialog(null);
          resolve(res || { isConfirmed: false });
        },
      });
    });
  };

  // 1. Clock Ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Geolocation Tracker
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationErrorCode(2);
      setLocationTimeout(true);
      return;
    }

    const timeoutId = setTimeout(() => setLocationTimeout(true), 5000);

    const onPosSuccess = (pos) => {
      setDeviceLat(pos.coords.latitude);
      setDeviceLon(pos.coords.longitude);
      setLocationErrorCode(null);
      setLocationTimeout(false);
    };

    const onPosError = (err) => {
      setLocationErrorCode(err.code);
      setLocationTimeout(true);
      if (err.code !== 1) {
        navigator.geolocation.getCurrentPosition(
          onPosSuccess,
          (fallbackErr) => {
            setLocationErrorCode(fallbackErr.code);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
        );
      }
    };

    navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 30000,
    });

    const watchId = navigator.geolocation.watchPosition(
      onPosSuccess,
      onPosError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );

    return () => {
      clearTimeout(timeoutId);
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 3. Resolve QR Token on Mount
  useEffect(() => {
    async function resolveToken() {
      if (!qrToken) {
        setQrError("No QR token provided in the URL.");
        setLoadingQr(false);
        return;
      }

      setLoadingQr(true);
      setQrError(null);

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/qr/resolve/${encodeURIComponent(qrToken)}`,
        );

        if (res.data?.success && res.data?.data) {
          setQrMetadata(res.data.data);
        } else {
          setQrError(res.data?.message || "Invalid or inactive QR checkpoint.");
        }
      } catch (err) {
        console.error("QR Resolution error:", err);
        setQrError(
          err.response?.data?.message ||
            "This QR code is inactive, invalid, or belongs to another company.",
        );
      } finally {
        setLoadingQr(false);
      }
    }

    resolveToken();
  }, [qrToken]);

  // Apply attendance state from loaded record
  const applyTodayAttendanceState = (record) => {
    if (record) {
      setMispunchTime(record.punch_in || record.mispunch_time || "");
      setLeaveTime(record.punch_out || record.leave_time || "");
      setTimesheetDetails(record.timesheet_details || "");
      setEmployeeOtClaim(Boolean(record.employee_ot_claim));
      setOtEligibleFromApi(Boolean(record.ot_eligible));
      setActiveSessionDate(getAttendanceRecordDate(record));
      setSessionStatus(
        record.session_status ||
          (record.punch_out || record.leave_time
            ? "COMPLETED"
            : record.punch_in || record.mispunch_time
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

  // 4. Initialize Data (Profile, Attendance, Holidays)
  useEffect(() => {
    let isActive = true;

    const initializePage = async () => {
      if (!qrMetadata) return;
      setPageLoading(true);
      setConnectionError(null);

      try {
        const slug = qrMetadata.company_slug || user?.slug || "";
        const companyId = qrMetadata.company_id || user?.company_id;

        if (user?.name) {
          setFormData((prev) => ({
            ...prev,
            employeeName: user.name,
            employeeId: employeeId || prev.employeeId,
            department: user.department || user.employee_department || prev.department,
          }));
        }

        // Fetch Holidays
        if (slug || companyId) {
          try {
            const hRes = await axios.get(
              `${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday?slug=${slug || ""}&company_id=${companyId || ""}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (isActive && Array.isArray(hRes.data)) {
              setHolidays(hRes.data);
            }
          } catch {
            // Non-blocking
          }
        }

        // Fetch Employee Details
        if (!employeeId) {
          if (isActive) {
            setConnectionError("Employee profile not found in active session. If you are signed in with an administrative account, please sign in with your employee credentials to mark attendance.");
          }
          return;
        }

        if (employeeId) {
          try {
            const empRes = await axios.get(
              `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/by-id/${employeeId}`,
            );

            const emp = empRes.data?.data || empRes.data || {};
            if (isActive && (emp.name || emp.id)) {
              setFormData((prev) => ({
                ...prev,
                employeeName: emp.name || prev.employeeName,
                department: emp.department || prev.department,
                postApplied: emp.designation || emp.postApplied || emp.post_applied || prev.postApplied,
              }));
              const resolvedShiftName = emp.employeeShift || emp.shift_name || emp.shiftName || "";
              const resolvedShiftStart = emp.shift_start || emp.shiftStart || "";
              const resolvedShiftEnd = emp.shift_end || emp.shiftEnd || "";
              setShiftName(resolvedShiftName);
              setShiftStart(resolvedShiftStart);
              setShiftEnd(resolvedShiftEnd);
              if (emp.ot_allowed !== undefined) setOtAllowed(Boolean(emp.ot_allowed));
            }
          } catch (err) {
            console.error("Failed to load employee details", err);
            if (isActive) {
              setConnectionError(
                err.response?.data?.message ||
                  "Failed to verify employee profile. Please check your connection and retry.",
              );
            }
            return;
          }

          // Fetch Exemption & Attendance Snapshot
          try {
            const todayStr = getCurrentIndiaDate();
            const attRes = await axios.post(
              `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/submit`,
              {
                action: "FETCH",
                employee_id: employeeId,
                company_id: Number(companyId),
                slug,
                attendance_date: todayStr,
              },
            );

            if (isActive && attRes.data?.success) {
              setIsExempt(Boolean(attRes.data.isExempt));
              setExemptionType(attRes.data.exemptionType || null);

              if (attRes.data.todayAttendance) {
                applyTodayAttendanceState(attRes.data.todayAttendance);
              } else if (attRes.data.mispunch_time) {
                applyTodayAttendanceState(attRes.data);
              }
            }
          } catch (err) {
            console.error("Failed to load attendance snapshot", err);
            if (isActive) {
              setConnectionError(
                err.response?.data?.message ||
                  "Failed to load attendance status. Please check your connection and retry.",
              );
            }
          }
        }
      } finally {
        if (isActive) setPageLoading(false);
      }
    };

    initializePage();
    return () => {
      isActive = false;
    };
  }, [qrMetadata, employeeId, token, reloadTrigger]);

  // Active Break Live Stopwatch
  const activeBreakSeconds = useMemo(() => {
    if (sessionStatus !== "ON_BREAK" || !lastBreakStart) return 0;
    const parsedStart = parseIndiaDateTimeString(lastBreakStart);
    const startMs = parsedStart
      ? parsedStart.getTime()
      : new Date(lastBreakStart.replace(" ", "T")).getTime();

    if (Number.isNaN(startMs)) return 0;
    return Math.max(Math.floor((currentTimeTick - startMs) / 1000), 0);
  }, [sessionStatus, lastBreakStart, currentTimeTick]);

  // Distance & Geofence Calculation
  const qrLat = qrMetadata?.latitude ? parseFloat(qrMetadata.latitude) : null;
  const qrLon = qrMetadata?.longitude ? parseFloat(qrMetadata.longitude) : null;

  const distanceMetres = useMemo(() => {
    if (deviceLat == null || deviceLon == null || qrLat == null || qrLon == null) return null;
    return Math.round(getDistanceMetres(deviceLat, deviceLon, qrLat, qrLon));
  }, [deviceLat, deviceLon, qrLat, qrLon]);

  const hasDeviceLocation = deviceLat !== null && deviceLon !== null;
  const geofenceBlocked = !isExempt && distanceMetres !== null && distanceMetres > GEOFENCE_RADIUS_METRES;

  const todayIndiaDate = getCurrentIndiaDate();
  const displayedAttendanceDate = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const getCurrentClockTime = () => {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(currentTimeTick));
  };

  const hasPunchedIn = Boolean(mispunchTime);
  const hasPunchedOut = Boolean(mispunchTime) && (Boolean(leaveTime) || sessionStatus === "COMPLETED");
  const isWorking = hasPunchedIn && !hasPunchedOut && sessionStatus !== "ON_BREAK";
  const isOnBreak = hasPunchedIn && !hasPunchedOut && sessionStatus === "ON_BREAK";
  const isIdle = !hasPunchedIn && !hasPunchedOut;
  const isCompleted = hasPunchedOut;
  const isShiftAssigned = Boolean(shiftName && shiftStart && shiftEnd);

  // Late Arrival Check (15 mins grace period)
  const reasonRequiredForPunchIn = useMemo(() => {
    if (!isIdle || !shiftStart) return false;
    const shiftStartTime = parseIndiaDateTime(todayIndiaDate, shiftStart);
    if (!shiftStartTime) return false;
    const graceMs = 15 * 60 * 1000;
    return currentTimeTick > shiftStartTime.getTime() + graceMs;
  }, [isIdle, todayIndiaDate, shiftStart, currentTimeTick]);

  // OT Eligibility Calculation
  const otMetrics = useMemo(() => {
    return getOtMetrics({
      dateValue: todayIndiaDate,
      punchInValue: mispunchTime,
      shiftStartValue: shiftStart,
      shiftEndValue: shiftEnd,
      evaluationDate: new Date(currentTimeTick),
    });
  }, [todayIndiaDate, mispunchTime, shiftStart, shiftEnd, currentTimeTick]);

  const showOtClaimCheckbox =
    otAllowed &&
    isWorking &&
    (otEligibleFromApi || otMetrics.otEligible);

  // ── Handlers ──
  const openBreakModal = (actionType) => {
    setBreakModalAction(actionType);
    setIsBreakModalOpen(true);
  };

  const handleBreakModalSubmit = async (reasonText) => {
    setIsBreakModalOpen(false);
    await handleBreakAction(breakModalAction, reasonText);
  };

  const handleBreakAction = async (actionType, breakReasonText = "") => {
    if (!employeeId || !qrMetadata) return;

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const payload = {
        action: actionType,
        employee_id: employeeId,
        company_id: Number(qrMetadata.company_id || user?.company_id),
        company: user?.companyName || user?.company_name || qrMetadata.branch_name,
        slug: qrMetadata.company_slug || user?.slug,
        qr_token: qrMetadata.qr_token,
        branch_id: qrMetadata.branch_id,
        branch_name: qrMetadata.branch_name,
        qr_id: qrMetadata.id,
        latitude: deviceLat,
        longitude: deviceLon,
        device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        reason: breakReasonText || undefined,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/submit`,
        payload,
      );

      if (res.data?.success) {
        if (actionType === "BREAK_START") {
          setSessionStatus("ON_BREAK");
          setLastBreakStart(res.data.last_break_start);
          showFeedback({
            icon: "info",
            title: "Break Started",
            text: `Break recorded at ${formatDisplayTime(res.data.last_break_start || "")}`,
            timer: 2000,
          });
        } else {
          setSessionStatus("WORKING");
          setLastBreakStart(null);
          setTotalBreakSeconds(Number(res.data.total_break_seconds || 0));
          showFeedback({
            icon: "success",
            title: "Work Resumed",
            text: "Welcome back! Work session is active.",
            timer: 2000,
          });
        }
      }
    } catch (err) {
      console.error("Break action error:", err);
      showFeedback({
        icon: "error",
        title: "Break Action Failed",
        text: err.response?.data?.message || "Could not complete break action.",
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAutofillTimesheet = async () => {
    if (!employeeId) return;

    setIsAutofilling(true);
    setAutofillError(false);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/todos/employee/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const todos = Array.isArray(res.data?.data) ? res.data.data : [];
      const completedToday = todos.filter(
        (t) => t.is_completed || t.status === "Completed" || t.status === "DONE",
      );

      if (completedToday.length > 0) {
        const summary = completedToday.map((t, idx) => `${idx + 1}. ${t.title || t.task_name}`).join("\n");
        setTimesheetDetails(`Tasks completed today:\n${summary}`);
      } else if (todos.length > 0) {
        const summary = todos.slice(0, 5).map((t, idx) => `${idx + 1}. Worked on: ${t.title || t.task_name}`).join("\n");
        setTimesheetDetails(summary);
      } else {
        setAutofillError(true);
        showFeedback({
          icon: "info",
          title: "No Completed Tasks Found",
          text: "No tasks or to-do items were found for today. Please type your work summary manually.",
        });
      }
    } catch {
      setAutofillError(true);
      showFeedback({
        icon: "info",
        title: "Could Not Fetch Tasks",
        text: "Could not retrieve to-do tasks. Please enter your work summary manually.",
      });
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (!employeeId || !qrMetadata) return;

      // Check-In Validation
      if (!hasPunchedIn) {
        if (!isShiftAssigned) {
          showFeedback({
            icon: "warning",
            title: "No Shift Assigned",
            text: "No shift schedule assigned. Please contact your HR manager.",
          });
          return;
        }

        if (reasonRequiredForPunchIn && !reason.trim()) {
          showFeedback({
            icon: "warning",
            title: "Reason Required",
            text: "Please provide a reason for arriving late.",
          });
          return;
        }

        if (geofenceBlocked) {
          showFeedback({
            icon: "error",
            title: "Outside Allowed Zone",
            text: `You are ${distanceMetres}m away from the checkpoint (allowed: 100m). Please move closer.`,
          });
          return;
        }

        try {
          const payload = {
            action: "PUNCH_IN",
            employee_id: employeeId,
            employee_name: formData.employeeName || user?.name,
            department: formData.department || user?.department,
            post_applied: formData.postApplied || user?.designation,
            company_id: Number(qrMetadata.company_id || user?.company_id),
            company: user?.companyName || user?.company_name || qrMetadata.branch_name,
            slug: qrMetadata.company_slug || user?.slug,
            qr_token: qrMetadata.qr_token,
            branch_id: qrMetadata.branch_id,
            branch_name: qrMetadata.branch_name,
            qr_id: qrMetadata.id,
            latitude: deviceLat,
            longitude: deviceLon,
            device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
            shift_name: shiftName,
            shift_start: shiftStart?.length === 5 ? `${shiftStart}:00` : shiftStart,
            shift_end: shiftEnd?.length === 5 ? `${shiftEnd}:00` : shiftEnd,
            reason: reason.trim() || undefined,
          };

          const res = await axios.post(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/submit`,
            payload,
          );

          if (res.data?.success) {
            setMispunchTime(res.data.mispunch_time);
            setSessionStatus("WORKING");
            showFeedback({
              icon: "success",
              title: "Checked In Successfully",
              details: [
                { label: "Branch", value: qrMetadata.branch_name },
                { label: "Gate", value: qrMetadata.qr_name },
                { label: "Time", value: formatDisplayTime(res.data.mispunch_time) },
              ],
            });
          }
        } catch (err) {
          console.error("Punch In Error:", err);
          showFeedback({
            icon: "error",
            title: "Punch In Failed",
            text: err.response?.data?.message || "Failed to check in. Please try again.",
          });
        }
        return;
      }

      // Punch-Out Validation
      if (hasPunchedIn && !hasPunchedOut) {
        if (!timesheetDetails.trim()) {
          showFeedback({
            icon: "warning",
            title: "Work Summary Required",
            text: "Please provide a summary of work done today before punching out.",
          });
          return;
        }

        // Check Monthly Report Status
        const slug = qrMetadata.company_slug || user?.slug || "";
        const reportStatus = await checkMonthlyReportStatus(employeeId, slug, token, holidays);
        if (reportStatus.softReminderReport) {
          const report = reportStatus.softReminderReport;
          const confirmReport = await showFeedback({
            icon: "warning",
            title: "Monthly Work Report Reminder",
            text: `Today is the last working day of ${report.monthName} ${report.year}. Please submit your monthly work report.`,
            showCancelButton: true,
            confirmButtonText: "Submit Report First",
            cancelButtonText: "Punch Out Anyway",
          });
          if (confirmReport.isConfirmed) {
            navigate(
              `/employee/work-report?tab=monthly&openForm=1&month=${encodeURIComponent(report.monthName)}&year=${report.year}`,
            );
            return;
          }
        }

        const confirmResult = await showFeedback({
          icon: "question",
          title: "Confirm Punch Out?",
          text: "Are you ready to conclude your workday attendance?",
          showCancelButton: true,
          confirmButtonText: "Yes, Punch Out",
          cancelButtonText: "Cancel",
        });

        if (!confirmResult.isConfirmed) return;

        try {
          const payload = {
            action: "PUNCH_OUT",
            employee_id: employeeId,
            company_id: Number(qrMetadata.company_id || user?.company_id),
            company: user?.company_name || qrMetadata.branch_name,
            slug: qrMetadata.company_slug || user?.slug,
            qr_token: qrMetadata.qr_token,
            branch_id: qrMetadata.branch_id,
            branch_name: qrMetadata.branch_name,
            qr_id: qrMetadata.id,
            latitude: deviceLat,
            longitude: deviceLon,
            device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
            timesheet_details: timesheetDetails.trim(),
            employee_ot_claim: employeeOtClaim ? 1 : 0,
          };

          const res = await axios.post(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/submit`,
            payload,
          );

          if (res.data?.success) {
            setLeaveTime(res.data.punch_out || res.data.leave_time);
            setSessionStatus("COMPLETED");
            showFeedback({
              icon: "success",
              title: "Punch Out Successful",
              details: [
                { label: "Total Hours", value: res.data.total_hours || "N/A" },
                { label: "Punch Out", value: formatDisplayTime(res.data.punch_out || res.data.leave_time) },
                ...(res.data.overtime && res.data.overtime !== "00:00:00" ? [{ label: "Overtime", value: res.data.overtime }] : []),
              ],
            });
          }
        } catch (err) {
          console.error("Punch Out Error:", err);
          if (err.response?.data?.code === "MONTHLY_REPORT_REQUIRED") {
            const report = err.response.data.report || {};
            const r = await showFeedback({
              icon: "warning",
              title: "Monthly Report Required",
              text: err.response.data.message || "Please submit your monthly work report first.",
              showCancelButton: true,
              confirmButtonText: "Go to Monthly Report",
              cancelButtonText: "Dismiss",
            });
            if (r.isConfirmed) {
              navigate(
                `/employee/work-report?tab=monthly&openForm=1&month=${encodeURIComponent(report.month)}&year=${report.year}`,
              );
            }
            return;
          }
          showFeedback({
            icon: "error",
            title: "Punch Out Failed",
            text: err.response?.data?.message || "Failed to punch out.",
          });
        }
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ── Render Error Screen if QR invalid ──
  if (!loadingQr && qrError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Checkpoint Unavailable
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">Invalid Checkpoint</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{qrError}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Troubleshooting Steps
            </p>
            <ul className="space-y-1 list-disc list-inside text-slate-600">
              <li>Ensure you scanned an active, authorized branch QR code.</li>
              <li>Verify that this checkpoint belongs to your current company branch.</li>
              <li>Reach out to HR administration if this error persists.</li>
            </ul>
          </div>
          <button
            onClick={() => navigate("/employee/dashboard")}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition font-medium rounded-xl text-white text-sm shadow-xs cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Render Error Screen if Connection or Profile fetch failed ──
  if (!loadingQr && connectionError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Connection Error
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
              Profile Verification Failed
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{connectionError}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Troubleshooting Steps
            </p>
            <ul className="space-y-1 list-disc list-inside text-slate-600">
              <li>Check your network connection and session credentials.</li>
              <li>Ensure the server is online and accessible.</li>
              <li>Click Retry Connection below to re-authenticate.</li>
            </ul>
          </div>
          <div className="space-y-2.5">
            {!employeeId ? (
              <button
                type="button"
                onClick={() => navigate("/employee/login", { state: { from: location } })}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition font-medium rounded-xl text-white text-sm shadow-xs cursor-pointer"
              >
                Sign In as Employee
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConnectionError(null);
                  setReloadTrigger((prev) => prev + 1);
                }}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition font-medium rounded-xl text-white text-sm shadow-xs cursor-pointer"
              >
                Retry Connection
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/employee/dashboard")}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 transition font-medium rounded-xl text-slate-700 text-sm cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900 py-4 sm:py-8 px-3 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-5">
        {/* ── Top SaaS App Header ── */}
        <header className="bg-white border border-slate-200 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                <Building2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {qrMetadata?.branch_name || user?.companyName || user?.company_name || "CLIENT ERP"}
                </h2>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{displayedAttendanceDate}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isExempt && (
                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    {(() => {
                      const type = exemptionType?.toLowerCase();
                      if (type === "wfh") return "WFH Active";
                      if (type === "remote") return "Remote";
                      if (type === "field") return "Field Duty";
                      return "Exempt";
                    })()}
                  </span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-white shadow-xs">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-300" />
                <span className="tabular-nums font-mono">{getCurrentClockTime()}</span>
              </div>
            </div>
          </div>

          {/* Exemption mobile badge */}
          {isExempt && (
            <div className="sm:hidden mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {(() => {
                  const type = exemptionType?.toLowerCase();
                  if (type === "wfh") return "Work from Home Active";
                  if (type === "remote") return "Remote Mode Enabled";
                  if (type === "field") return "Field Duty Authorized";
                  return "Exemption Active";
                })()}
              </span>
            </div>
          )}
        </header>

        {/* ── Location Warning Banner (if blocked or detecting) ── */}
        {locationTimeout && !hasDeviceLocation && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm ${
              locationErrorCode === 1
                ? "border-rose-200 bg-rose-50/70 text-rose-900"
                : "border-amber-200 bg-amber-50/70 text-amber-900"
            }`}
          >
            {locationErrorCode === 1 ? (
              <MapPinOff className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-600" />
            ) : (
              <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600" />
            )}
            <div>
              {locationErrorCode === 1 ? (
                <>
                  <p className="font-semibold text-rose-950">Location Permission Blocked</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-rose-800">
                    Your browser has disabled location access. Enable location in your browser settings to verify gate proximity.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-amber-950">Acquiring GPS Signal</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                    Determining checkpoint coordinates. You may continue with your attendance submission.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Active Session From Previous Day Notice ── */}
        {!pageLoading && !loadingQr && hasPunchedIn && activeSessionDate && activeSessionDate !== todayIndiaDate && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs sm:text-sm text-amber-950">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Active Previous Day Session:</span> You remain clocked in from{" "}
              <span className="font-semibold underline">{activeSessionDate}</span>. Please complete your punch out for that shift.
            </div>
          </div>
        )}

        {/* ── Unassigned Shift Alert Banner ── */}
        {!pageLoading && !loadingQr && isIdle && !isShiftAssigned && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs sm:text-sm text-amber-950 shadow-xs">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-amber-950">No Shift Schedule Assigned</p>
              <p className="mt-0.5 text-xs text-amber-900/90 leading-relaxed">
                Your profile has not been assigned a work shift schedule. Punch-in is disabled until your HR manager configures your shift.
              </p>
            </div>
          </div>
        )}

        {pageLoading || loadingQr ? (
          <AttendanceSubmissionSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* ── 1. Live Session Status Card ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Attendance Checkpoint
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify gateway credentials and confirm your work activity.
                  </p>
                </div>
                <div>
                  {isIdle && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Not Checked In
                    </span>
                  )}
                  {isWorking && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Shift Active • Working
                    </span>
                  )}
                  {isOnBreak && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      On Break
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Shift Concluded
                    </span>
                  )}
                </div>
              </div>

              {/* Checkpoint Gateway Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Branch
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {qrMetadata?.branch_name || "Headquarters"}
                      {qrMetadata?.branch_code ? ` (${qrMetadata.branch_code})` : ""}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Gate / Terminal
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {qrMetadata?.qr_name || "Main Reception"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Employee Profile & Shift Data ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Employee & Shift Profile
                </h2>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formData.department || user?.department || "Operations"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Employee Name
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {formData.employeeName || user?.name || "Employee"}
                  </p>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Designation
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {formData.postApplied || user?.designation || "Staff Member"}
                  </p>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Shift Name
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {shiftName || "Not Assigned"}
                  </p>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Shift Window
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {shiftStart && shiftEnd
                      ? `${formatDisplayTime(shiftStart)} - ${formatDisplayTime(shiftEnd)}`
                      : "Not Assigned"}
                  </p>
                </div>
              </div>

              {/* Punch Timestamps Summary */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Punch In
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {mispunchTime ? formatDisplayTime(mispunchTime) : "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Punch Out
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {leaveTime ? formatDisplayTime(leaveTime) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 3. Late Arrival Reason Box (Conditional) ── */}
            {isIdle && reasonRequiredForPunchIn && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <label className="text-xs sm:text-sm font-bold">
                    Late Arrival Reason (15-min grace window passed)
                  </label>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your shift started at {formatDisplayTime(shiftStart)}. Please provide a brief reason for arriving after the grace period.
                </p>
                <textarea
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for late arrival..."
                  rows={3}
                  className="w-full rounded-xl border border-amber-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            )}

            {/* ── 4. Work Summary & Timesheet (When Working or On Break) ── */}
            {(isWorking || isOnBreak) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="min-w-0">
                    <label className="text-xs sm:text-sm font-semibold text-slate-800 block">
                      Today's Work Summary
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Required before punch out
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutofillTimesheet}
                    disabled={isAutofilling}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                  >
                    {isAutofilling ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                    <span>{isAutofilling ? "Autofilling..." : "Autofill Tasks"}</span>
                  </button>
                </div>

                {autofillError && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
                    No completed to-do tasks found for today. Please type your work achievements manually.
                  </div>
                )}

                <textarea
                  value={timesheetDetails}
                  onChange={(e) => setTimesheetDetails(e.target.value)}
                  placeholder="Summarize the key tasks and accomplishments completed today..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
              </div>
            )}

            {/* ── 5. Overtime Claim Checkbox Card ── */}
            {showOtClaimCheckbox && isWorking && (
              <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 cursor-pointer hover:bg-amber-50 transition">
                <input
                  type="checkbox"
                  checked={employeeOtClaim}
                  onChange={(e) => setEmployeeOtClaim(e.target.checked)}
                  className="mt-0.5 h-4.5 w-4.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-xs sm:text-sm font-bold text-slate-900">
                    Claim Overtime Hours
                  </span>
                  <span className="block text-xs text-slate-600 leading-relaxed mt-0.5">
                    Your session exceeds regular shift duration. Check this box to submit an overtime claim for supervisor review.
                  </span>
                </span>
              </label>
            )}

            {/* ── 6. Geofence Error Notification Banner ── */}
            {!isCompleted && geofenceBlocked && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-rose-950">Outside Allowed Checkpoint Zone</p>
                  <p className="mt-0.5 text-rose-800 leading-relaxed">
                    {distanceMetres !== null
                      ? `You are currently ${distanceMetres}m away from the checkpoint gate. Please move within the 100m boundary.`
                      : "Could not establish device GPS location. Please allow location permissions to proceed."}
                  </p>
                </div>
              </div>
            )}

            {/* ── 7. Active Break Live State Card ── */}
            {isOnBreak && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                      <Coffee className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                        Break in Progress
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                        Work Session Paused
                      </h3>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs font-mono font-bold text-amber-900 shadow-2xs">
                    <Timer className="h-3.5 w-3.5 text-amber-600" />
                    <span>{formatBreakDuration(activeBreakSeconds)}</span>
                  </div>
                </div>

                <p className="text-xs text-amber-900/90 leading-relaxed">
                  When you return to your workstation, click <strong>Resume Work</strong> to restart your work timer, or click <strong>Punch Out</strong> to end your workday directly (active break will be auto-closed).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleBreakAction("BREAK_END")}
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] px-4 py-3 text-sm font-semibold text-white shadow-xs transition duration-150 cursor-pointer disabled:opacity-60"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {isSubmitting ? "Resuming Work..." : "Resume Work (Break In)"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] px-4 py-3 text-sm font-semibold text-white shadow-xs transition duration-150 cursor-pointer disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Punch Out (End Day)</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── 8. Primary Action Bar ── */}
            {!isCompleted && !isOnBreak && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {isWorking && (
                  <button
                    type="button"
                    onClick={() => openBreakModal("BREAK_START")}
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition cursor-pointer disabled:opacity-60"
                  >
                    <Coffee className="h-4 w-4 text-amber-600" />
                    Take a Break
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || (isIdle && !isShiftAssigned)}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xs active:scale-[0.99] transition duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    isWorking
                      ? "bg-rose-600 hover:bg-rose-700 col-span-1"
                      : "bg-slate-900 hover:bg-slate-800 col-span-1 sm:col-span-2"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processing...</span>
                    </>
                  ) : isWorking ? (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Punch Out for Today</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>Punch In (Check In)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── 9. Attendance Completed State Card ── */}
            {isCompleted && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Attendance Completed for Today
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    You have punched out successfully. Your work hours and timesheet have been logged.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/employee/dashboard")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  <span>Return to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* ── Native-feeling Break Action Modal / Bottom Sheet ── */}
      <BreakActionModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        onSubmit={handleBreakModalSubmit}
        isSubmitting={isSubmitting}
      />

      {/* ── Custom SaaS Feedback Dialog / Modal ── */}
      <CustomFeedbackModal
        config={feedbackDialog}
        onClose={(res) => feedbackDialog?.resolve?.(res)}
      />
    </div>
  );
}

const PRESET_BREAK_REASONS = [
  { id: "lunch", label: "Lunch Break", icon: Utensils, desc: "Midday meal break" },
  { id: "tea", label: "Tea / Coffee Break", icon: Coffee, desc: "Quick refreshment" },
  { id: "personal", label: "Personal Work", icon: Sparkles, desc: "Errands & personal task" },
  { id: "meeting", label: "Team Sync", icon: MessageSquare, desc: "Internal / external sync" },
  { id: "medical", label: "Medical / Health", icon: HeartPulse, desc: "Health check or rest" },
  { id: "general", label: "General Break", icon: Clock, desc: "Short rest & pause" },
];

function BreakActionModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [selectedPreset, setSelectedPreset] = useState("Lunch Break");
  const [customReason, setCustomReason] = useState("Lunch Break");

  useEffect(() => {
    if (isOpen) {
      setSelectedPreset("Lunch Break");
      setCustomReason("Lunch Break");
    }
  }, [isOpen]);

  const handleSelectPreset = (reasonLabel) => {
    setSelectedPreset(reasonLabel);
    setCustomReason(reasonLabel);
  };

  const handleCustomReasonChange = (e) => {
    const val = e.target.value;
    setCustomReason(val);
    const matchingPreset = PRESET_BREAK_REASONS.find(
      (p) => p.label.toLowerCase() === val.trim().toLowerCase(),
    );
    setSelectedPreset(matchingPreset ? matchingPreset.label : null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const finalReason = customReason.trim() || selectedPreset || "General Break";
    onSubmit(finalReason);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="break-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4"
        >
          <motion.div
            key="break-modal-sheet"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md max-h-[90vh] flex flex-col bg-white border-b sm:border border-slate-200 rounded-b-3xl sm:rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Coffee className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 block">
                    Taking a Break
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Select Break Category
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Select Category
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PRESET_BREAK_REASONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedPreset === item.label;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPreset(item.label)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? "border-amber-500 bg-amber-50/60 text-slate-900 ring-1 ring-amber-500 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 w-full">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                              isSelected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold truncate leading-tight">
                            {item.label}
                          </span>
                        </div>
                        <span className="mt-1 text-[10px] text-slate-500 leading-tight block truncate">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Custom Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={handleCustomReasonChange}
                    placeholder="e.g. Lunch at cafeteria, back in 30 mins"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-60 text-center cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Coffee className="h-3.5 w-3.5" />
                      <span>Start Break</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Mobile Pull Handle at bottom of top drawer */}
            <div className="sm:hidden pb-2.5 pt-1 flex justify-center bg-white">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CustomFeedbackModal({ config, onClose }) {
  useEffect(() => {
    if (!config?.timer) return;
    const timerId = setTimeout(() => {
      onClose({ isConfirmed: true });
    }, config.timer);
    return () => clearTimeout(timerId);
  }, [config, onClose]);

  const {
    icon = "info",
    title,
    text,
    details,
    confirmButtonText = "OK",
    cancelButtonText = "Cancel",
    showCancelButton = false,
  } = config || {};

  const getIconElement = () => {
    switch (icon) {
      case "success":
        return (
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
      case "error":
        return (
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
            <CircleAlert className="h-6 w-6" />
          </div>
        );
      case "warning":
      case "question":
        return (
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
            <TriangleAlert className="h-6 w-6" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-2xs">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {config && (
        <motion.div
          key="feedback-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && showCancelButton) {
              onClose({ isConfirmed: false });
            }
          }}
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4"
        >
          <motion.div
            key="feedback-modal-sheet"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md bg-white border-b sm:border border-slate-200 rounded-b-3xl sm:rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-start gap-3.5">
              {getIconElement()}
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {title}
                </h3>
                {text && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                    {text}
                  </p>
                )}
              </div>
            </div>

            {Array.isArray(details) && details.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5">
                {details.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-medium">{item.label}:</span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              {showCancelButton && (
                <button
                  type="button"
                  onClick={() => onClose({ isConfirmed: false })}
                  className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition cursor-pointer"
                >
                  {cancelButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={() => onClose({ isConfirmed: true })}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition active:scale-[0.99] cursor-pointer ${
                  icon === "error"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : icon === "warning" || icon === "question"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {confirmButtonText}
              </button>
            </div>

            {/* Mobile Pull Bar at bottom of top drawer */}
            <div className="sm:hidden pt-2 pb-0 flex justify-center -mb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
