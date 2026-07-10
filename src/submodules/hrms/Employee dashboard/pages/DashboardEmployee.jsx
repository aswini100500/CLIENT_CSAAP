import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  MoreVertical,
  FileText,
  MessageSquare,
  CheckCircle,
  Target,
} from "lucide-react";
import useAuth from "../../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import NoticePeriodAlertModal from "../../components/NoticePeriodAlertModal";
import Swal from "sweetalert2";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  return { month: monthNames[month - 1], year };
};

const DashboardEmployee = () => {
  const { user, token } = useAuth();
  const employeeId = user?.employee_id;
  const companySlug = user?.slug;
  const companyId = user?.company_id;
  const employeeName = user?.name;

  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [holidayLoading, setHolidayLoading] = useState(false);
  const [timer, setTimer] = useState("00:00:00");
  const [shiftEnd, setShiftEnd] = useState(null);
  const [punchIn, setPunchIn] = useState(null);
  const [leaveTime, setLeaveTime] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [adminMessages, setAdminMessages] = useState(0);
  const [myPresentDays, setMyPresentDays] = useState(0);
  const [totalWorkingDays, setTotalWorkingDays] = useState(24);
  const [noticeAlerts, setNoticeAlerts] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeActionLoading, setNoticeActionLoading] = useState("");
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);
  const [serviceRequestsCount, setServiceRequestsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const getTodayKey = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

  const roleLabel = String(user?.role || "").toLowerCase();
  const isAdminOrHR = roleLabel.includes("admin") || roleLabel.includes("hr");

  const getAuthToken = () => {
    return token;
  };

  useEffect(() => {
    const checkFirstLogin = async () => {
      const welcomeEmployeeId =
        employeeId || user?.employeeProfileId || user?.id;
      const welcomeName = employeeName || "there";

      if (!welcomeEmployeeId || isAdminOrHR) {
        return;
      }

      const welcomeKey = `employeeWelcomeShown_${welcomeEmployeeId}`;

      if (localStorage.getItem(welcomeKey)) {
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/by-id/${welcomeEmployeeId}`,
        );
        const empData = res.data?.data;

        if (empData && empData.first_login === 1) {
          Swal.fire({
            icon: "success",
            title: `Welcome, ${welcomeName}!`,
            text: "Your employee dashboard is ready. We're glad to have you on board.",
            confirmButtonText: "Let's go",
            confirmButtonColor: "#2563eb",
          }).then(async () => {
            localStorage.setItem(welcomeKey, "true");
            try {
              await axios.put(
                `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/first-login-done/${welcomeEmployeeId}`,
              );
            } catch (err) {
              console.error("Error marking first login done:", err);
            }
          });
        }
      } catch (err) {
        console.error("Error checking first login status:", err);
      }
    };

    checkFirstLogin();
  }, [
    employeeId,
    employeeName,
    isAdminOrHR,
    user?.employeeProfileId,
    user?.id,
  ]);

  useEffect(() => {
    const checkMonthlyReport = async () => {
      const currentEmployeeId = employeeId || user?.employeeProfileId;
      if (!currentEmployeeId || !companySlug) return;

      const today = getTodayKey();
      const monthEndReport = getMonthEndReportInfo(today);

      if (!monthEndReport) return;

      try {
        const token = getAuthToken();
        const reportRes = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/monthly-reports/${companySlug}/employee/${currentEmployeeId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const reports = Array.isArray(reportRes.data) ? reportRes.data : [];
        const alreadySubmitted = reports.some(
          (r) =>
            String(r.month).toLowerCase() ===
              monthEndReport.month.toLowerCase() &&
            Number(r.year) === Number(monthEndReport.year),
        );

        if (!alreadySubmitted) {
          Swal.fire({
            icon: "warning",
            title: "Monthly work report required",
            text: `It's the end of the month! Please submit your ${monthEndReport.month} ${monthEndReport.year} monthly work report.`,
            confirmButtonText: "Submit Now",
            showCancelButton: true,
            cancelButtonText: "Later",
            confirmButtonColor: "#2563eb",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate(
                `/employee/work-report?tab=monthly&openForm=1&month=${encodeURIComponent(monthEndReport.month)}&year=${monthEndReport.year}`,
              );
            }
          });
        }
      } catch (err) {
        console.error("Dashboard monthly report check failed", err);
      }
    };

    checkMonthlyReport();
  }, [
    employeeId,
    companySlug,
    isAdminOrHR,
    user?.employeeProfileId,
    user?.slug,
  ]);

  useEffect(() => {
    if (isAdminOrHR) {
      fetchNoticeAlerts();
    }
  }, [companySlug, isAdminOrHR]);

  const fetchNoticeAlerts = async () => {
    try {
      setNoticeLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/notice-period/actions`,
        {
          params: {
            slug: companySlug,
          },
        },
      );

      const alerts = res.data?.data || [];
      setNoticeAlerts(alerts);

      if (alerts.length > 0 && alerts.length !== lastAlertCount) {
        setIsNoticeModalOpen(true);
        setLastAlertCount(alerts.length);
      }
    } catch (error) {
      console.error("Failed to fetch notice alerts", error);
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleNoticeAction = async (item, action) => {
    try {
      let extraDays = 0;

      if (action === "extend") {
        const input = window.prompt(
          `Enter extension days for ${item.name}`,
          "7",
        );
        if (input === null) return;

        extraDays = Number.parseInt(input, 10);
        if (!Number.isFinite(extraDays) || extraDays <= 0) {
          window.alert("Please enter valid extension days.");
          return;
        }
      }

      if (action !== "extend") {
        const confirmed = window.confirm(
          action === "regularise"
            ? `Regularise ${item.name} and move status to Permanent?`
            : `Reject extension/regularisation for ${item.name} and continue notice period?`,
        );

        if (!confirmed) return;
      }

      setNoticeActionLoading(`${item.source}-${item.id}-${action}`);

      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/notice-period/action`,
        {
          source: item.source,
          recordId: item.id,
          action,
          extraDays,
        },
      );

      await fetchNoticeAlerts();
    } catch (error) {
      console.error("Failed to update notice action", error);
      window.alert(
        error.response?.data?.message || "Failed to update notice action",
      );
    } finally {
      setNoticeActionLoading("");
    }
  };

  const fetchTasks = async () => {
    if (!employeeId || !companyId || !companySlug) {
      console.warn("Missing required data for tasks fetch:", {
        employeeId,
        companyId,
        companySlug,
      });
      return;
    }

    setTasksLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/tasks/employee-search`,
        {
          params: {
            employeeId: employeeId,
            company_id: companyId,
            slug: companySlug,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.success) {
        const tasks = response.data.data || [];
        setTotalTasks(tasks.length);

        const completed = tasks.filter((task) => {
          const status = (task.status || "").toLowerCase();
          return (
            status === "completed" ||
            status === "approved" ||
            status === "done" ||
            status === "finished"
          );
        }).length;
        setCompletedTasks(completed);

        const pending = tasks.filter((task) => {
          const status = (task.status || "").toLowerCase();
          return (
            status !== "completed" &&
            status !== "approved" &&
            status !== "done" &&
            status !== "finished"
          );
        }).length;
        setPendingTasks(pending);
      } else {
        console.warn("Tasks API returned unexpected structure:", response.data);
        setTotalTasks(0);
        setCompletedTasks(0);
        setPendingTasks(0);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);

      setTotalTasks(0);
      setCompletedTasks(0);
      setPendingTasks(0);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!employeeId || !companyId || !companySlug) {
      console.warn("Missing required data for messages fetch:", {
        employeeId,
        companyId,
        companySlug,
      });
      return;
    }

    setMessagesLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/messages/employee`,
        {
          params: {
            employee_id: employeeId,
            company_id: companyId,
            slug: companySlug,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      let messages = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          messages = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          messages = response.data.data;
        } else if (
          response.data.messages &&
          Array.isArray(response.data.messages)
        ) {
          messages = response.data.messages;
        }
      }

      setAdminMessages(messages.length);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setAdminMessages(0);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchPresentDays = async () => {
    if (!employeeId || !companySlug) {
      console.warn("Missing required data for attendance fetch:", {
        employeeId,
        companySlug,
      });
      return;
    }

    setAttendanceLoading(true);
    try {
      const token = getAuthToken();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/${companySlug}/employee/${employeeId}/year/${currentYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.success) {
        const attendanceData = response.data.data || [];

        const currentMonthRecords = attendanceData.filter((record) => {
          const recordDate = new Date(record.date || record.attendance_date);
          return recordDate.getMonth() + 1 === currentMonth;
        });

        const presents = currentMonthRecords.filter((record) => {
          const status = (record.status || "").toLowerCase();
          const isPresent = record.isPresent === true;
          const hasMispunch =
            record.mispunch_time !== null && record.mispunch_time !== undefined;
          const hasCheckIn =
            record.check_in !== null && record.check_in !== undefined;

          return (
            status === "present" ||
            status === "p" ||
            isPresent ||
            hasMispunch ||
            hasCheckIn
          );
        }).length;

        setMyPresentDays(presents);

        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        let workingDays = 0;
        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(currentYear, currentMonth - 1, i);
          const dayOfWeek = date.getDay();

          if (dayOfWeek !== 0) {
            workingDays++;
          }
        }
        setTotalWorkingDays(workingDays);
      } else {
        console.warn(
          "Attendance API returned unsuccessful or unexpected structure:",
          response.data,
        );
        setMyPresentDays(0);
      }
    } catch (err) {
      console.error("Error fetching present days:", err);
      setMyPresentDays(0);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    if (!companySlug || !employeeId) {
      console.warn("Missing required data for service requests fetch:", {
        companySlug,
        employeeId,
      });
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/employee-search?employeeId=${employeeId}&company_id=${company_id}&slug=${slug}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.success) {
        const requests = response.data.data || [];

        setServiceRequestsCount(requests.length);
        const pendingCount = requests.filter((r) => {
          const status = (r.status || "").toLowerCase();
          return (
            status === "pending" || status === "p" || status === "in-progress"
          );
        }).length;
        setPendingRequestsCount(pendingCount);
      } else {
        console.warn(
          "Service requests API returned unsuccessful:",
          response.data,
        );
        setServiceRequestsCount(0);
        setPendingRequestsCount(0);
      }
    } catch (err) {
      console.error("Error fetching service requests:", err);
      setServiceRequestsCount(0);
      setPendingRequestsCount(0);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (employeeId && companyId && companySlug) {
        await Promise.allSettled([
          fetchTasks(),
          fetchMessages(),
          fetchPresentDays(),
          fetchServiceRequests(),
        ]);
      }
    };

    loadDashboardData();
  }, [employeeId, companyId, companySlug]);

  useEffect(() => {
    if (!employeeId || !companyId || !companySlug) return;

    const interval = setInterval(
      () => {
        fetchTasks();
        fetchMessages();
        fetchPresentDays();
        fetchServiceRequests();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [employeeId, companyId, companySlug]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        if (!employeeId) {
          console.warn("No employeeId available, skipping attendance fetch.");
          setTeamMembers([]);
          setPunchIn(null);
          setLeaveTime(null);
          setLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_HRMS_BASE_URL;
        const today = getTodayKey();

        let attendanceRes = null;
        let data = [];

        try {
          if (companySlug) {
            attendanceRes = await axios.get(
              `${baseUrl}/api/attendance/${companySlug}?date=${today}`,
            );
            if (attendanceRes?.data?.data) {
              data = attendanceRes.data.data;
            }
          }
        } catch (err) {
          console.warn("Primary attendance endpoint failed:", err.message);
        }

        if (!data.length && companySlug) {
          try {
            attendanceRes = await axios.get(
              `${baseUrl}/api/attendance/company/${companySlug}/employee/${employeeId}`,
            );
            if (attendanceRes?.data?.data) {
              data = Array.isArray(attendanceRes.data.data)
                ? attendanceRes.data.data
                : [attendanceRes.data.data];
            }
          } catch (err) {
            console.warn("Employee attendance endpoint failed:", err.message);
          }
        }

        if (!data.length) {
          try {
            attendanceRes = await axios.get(
              `${baseUrl}/api/attendance/timesheet/${employeeId}`,
            );
            if (attendanceRes?.data?.data) {
              data = Array.isArray(attendanceRes.data.data)
                ? attendanceRes.data.data
                : [attendanceRes.data.data];
            }
          } catch (err) {
            console.warn("Timesheet endpoint failed:", err.message);
          }
        }

        const currentRecord = data.find(
          (item) => String(item.employee_id) === String(employeeId),
        );

        if (currentRecord) {
          setShiftEnd(currentRecord.shift_end || null);
          if (currentRecord.mispunch_time) {
            setPunchIn(new Date(currentRecord.mispunch_time));
          } else {
            setPunchIn(null);
          }

          if (currentRecord.leave_time) {
            setLeaveTime(new Date(currentRecord.leave_time));
          } else {
            setLeaveTime(null);
          }
        } else {
          console.warn("Attendance record not found for employee", employeeId);
          setShiftEnd(null);
          setPunchIn(null);
          setLeaveTime(null);
        }

        const department = currentRecord?.department?.trim() || null;

        const todayAttendance = data.filter((item) => {
          const attendanceDate = item.attendance_date || item.date;
          return (
            attendanceDate === today && item.department?.trim() === department
          );
        });

        const formattedMembers = todayAttendance.map((item) => ({
          id: item.employee_id,
          name: item.employee_name,
          role: item.post_applied || item.designation || "Team Member",
          avatar: item.employee_name
            ? item.employee_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "NA",
          present: Boolean(item.mispunch_time || item.check_in),
        }));

        setTeamMembers(formattedMembers);
      } catch (err) {
        console.error("DashboardEmployee fetchAttendance error:", err);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [companySlug, employeeId]);

  useEffect(() => {
    const fetchUpcomingHolidays = async () => {
      try {
        setHolidayLoading(true);

        if (!user?.company_id || !user?.slug) {
          console.warn("Missing company_id or slug for holiday fetch");
          setHolidays([]);
          return;
        }

        const baseUrl = import.meta.env.VITE_HRMS_BASE_URL;
        const res = await axios.get(
          `${baseUrl}/api/holiday/upcoming?company_id=${user.company_id}&slug=${user.slug}`,
        );

        const data = res?.data?.data || [];

        const formatted = data
          .map((h, index) => {
            const dateObj = new Date(h.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const daysLeft = Math.ceil(
              (dateObj - today) / (1000 * 60 * 60 * 24),
            );

            return {
              id: h.id || index,
              name: h.name,
              originalDate: h.date,
              date: dateObj.getDate(),
              month: dateObj
                .toLocaleString("en-US", { month: "short" })
                .toUpperCase(),
              day: dateObj.toLocaleString("en-US", { weekday: "long" }),
              type: h.type || "Holiday",
              daysLeft: daysLeft,
            };
          })
          .filter((h) => h.daysLeft >= 0)
          .sort((a, b) => a.daysLeft - b.daysLeft);

        setHolidays(formatted);
      } catch (err) {
        console.error("Holiday fetch error:", err);
        setHolidays([]);
      } finally {
        setHolidayLoading(false);
      }
    };

    if (user?.company_id && user?.slug) {
      fetchUpcomingHolidays();
    }
  }, [user]);

  useEffect(() => {
    if (!punchIn) return;

    const interval = setInterval(() => {
      const endTime = leaveTime ? leaveTime : new Date();
      const diff = endTime - punchIn;

      if (diff <= 0) {
        setTimer("00:00:00");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimer(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );

      if (leaveTime) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [punchIn, leaveTime]);

  const getInitials = (name) => {
    if (!name) return "NA";
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "NA"
    );
  };

  const presentCount = teamMembers.filter((member) => member.present).length;
  const totalMembers = teamMembers.length;
  const attendancePercentage =
    totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;

  const handleRefreshData = async () => {
    Swal.fire({
      title: "Refreshing...",
      text: "Please wait while we update your dashboard",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await Promise.allSettled([
        fetchTasks(),
        fetchMessages(),
        fetchPresentDays(),
        fetchServiceRequests(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Refreshed!",
        text: "Dashboard data has been updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Refresh Failed",
        text: "Some data could not be updated. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const stats = [
    {
      label: "Total Tasks",
      value: tasksLoading ? "..." : totalTasks,
      subtext: `${completedTasks} completed, ${pendingTasks} pending`,
      icon: FileText,
      lightColor: "bg-blue-50 text-blue-600",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      onClick: () => {
        navigate("/tasks");
      },
    },
    {
      label: "Present Days",
      value: attendanceLoading ? "..." : myPresentDays,
      subtext: `out of ${totalWorkingDays} days this month`,
      icon: CheckCircle,
      lightColor: "bg-emerald-50 text-emerald-600",
      iconColor: "text-emerald-600",
      accentColor: "bg-emerald-500",
      onClick: () => {
        navigate("/employee/attendance");
      },
    },
    {
      label: "Messages",
      value: messagesLoading ? "..." : adminMessages,
      subtext: adminMessages === 1 ? "Total message" : "Total messages",
      icon: MessageSquare,
      lightColor: "bg-amber-50 text-amber-600",
      iconColor: "text-amber-600",
      accentColor: "bg-amber-500",
      onClick: () => {
        navigate("/employee/message");
      },
    },
    {
      label: "Service Requests",
      value: serviceRequestsCount,
      subtext: `${pendingRequestsCount} pending requests`,
      icon: Target,
      lightColor: "bg-rose-50 text-rose-600",
      iconColor: "text-rose-600",
      accentColor: "bg-rose-500",
      onClick: () => {
        navigate("/employee/service-request");
      },
    },
  ];

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.4s ease-in-out" }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="flex justify-end">
        <button
          onClick={handleRefreshData}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          🔄 Refresh Data
        </button>
      </div>

      {isAdminOrHR && (
        <NoticePeriodAlertModal
          isOpen={isNoticeModalOpen}
          onClose={() => setIsNoticeModalOpen(false)}
          alerts={noticeAlerts}
          onAction={handleNoticeAction}
          actionLoading={noticeActionLoading}
        />
      )}

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-sm">
          Welcome back, here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.onClick}
            className="w-full text-left relative bg-white rounded-xl border border-slate-100 overflow-hidden p-3 sm:p-4 hover:border-slate-200 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group"
          >
            <div
              className={`absolute top-0 inset-x-0 h-0.5 ${stat.accentColor} group-hover:opacity-80 transition-opacity`}
            />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 group-hover:text-slate-800 transition-colors font-medium">
                  {stat.label}
                </p>
              </div>
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${stat.lightColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
              >
                <stat.icon size={15} className="sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-50">
              <p className="text-[9px] sm:text-[10px] font-medium text-slate-400">
                {stat.subtext}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Team Attendance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {presentCount} of {totalMembers} members present
              </p>
            </div>
            <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreVertical size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-medium text-slate-500">
                Today's attendance
              </span>
              <span className="text-xs font-bold text-slate-700">
                {attendancePercentage}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="overflow-y-auto pr-1 custom-scrollbar max-h-72">
            <div className="space-y-1.5">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded w-24 mb-1"></div>
                      <div className="h-2 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                        {member.avatar || getInitials(member.name)}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${member.present ? "bg-emerald-500" : "bg-rose-500"}`}
                      >
                        {member.present && (
                          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50"></span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-800 truncate">
                        {member.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {member.role}
                      </p>
                    </div>
                    <div
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${member.present ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      {member.present ? "Present" : "Absent"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No team members found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col">
          <div className="flex items-start justify-between mb-4 shrink-0">
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Holiday Calendar
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upcoming holidays & events
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] text-slate-500">Holiday</span>
              </div>
              <button
                onClick={() => navigate("/employee/calendar")}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <Calendar size={14} className="text-slate-500 cursor-pointer" />
              </button>
            </div>
          </div>

          <div className="flex-1" style={{ minHeight: "410px" }}>
            <BigCalendar
              localizer={localizer}
              events={holidays.map((h) => ({
                title: h.name,
                start: new Date(h.originalDate),
                end: new Date(h.originalDate),
                allDay: true,
                type: "holiday",
              }))}
              startAccessor="start"
              endAccessor="end"
              views={["month"]}
              defaultView="month"
              toolbar={true}
              className="custom-calendar-small"
              eventPropGetter={() => ({
                style: {
                  backgroundColor: "#10B981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "9px",
                  padding: "2px 4px",
                  fontWeight: 500,
                },
              })}
            />
          </div>

          {holidays.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Upcoming
              </p>
              <div className="space-y-1.5">
                {holidays.slice(0, 3).map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium text-slate-700">
                        {holiday.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {holiday.daysLeft} days left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        
        /* Mini Calendar Styles */
        .custom-calendar-small {
          height: 100%;
          min-height: 350px;
        }
        .custom-calendar-small .rbc-toolbar {
          font-size: 11px;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .custom-calendar-small .rbc-toolbar button {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #475569;
          transition: all 0.2s;
        }
        .custom-calendar-small .rbc-toolbar button:hover {
          background: #F1F5F9;
        }
        .custom-calendar-small .rbc-toolbar button.rbc-active {
          background: #1E293B;
          color: white;
          border-color: #1E293B;
        }
        .custom-calendar-small .rbc-toolbar-label {
          font-weight: 600;
          font-size: 12px;
          color: #1E293B;
        }
        .custom-calendar-small .rbc-header {
          padding: 6px 4px;
          font-size: 9px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .custom-calendar-small .rbc-date-cell {
          padding: 4px;
          font-size: 10px;
          font-weight: 500;
        }
        .custom-calendar-small .rbc-date-cell button {
          color: #64748B;
        }
        .custom-calendar-small .rbc-today {
          background: #F0F9FF;
        }
        .custom-calendar-small .rbc-today .rbc-date-cell button {
          color: #0284C7;
          font-weight: 700;
        }
        .custom-calendar-small .rbc-month-view {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
        }
        .custom-calendar-small .rbc-month-row {
          min-height: 70px;
        }
        .custom-calendar-small .rbc-day-bg {
          border-left: 1px solid #F1F5F9;
        }
        .custom-calendar-small .rbc-off-range-bg {
          background: #F8FAFC;
        }
        .custom-calendar-small .rbc-off-range .rbc-date-cell button {
          color: #CBD5E1;
        }
        
        @media (max-width: 640px) {
          .custom-calendar-small {
            min-height: 300px;
          }
          .custom-calendar-small .rbc-month-row {
            min-height: 55px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardEmployee;
