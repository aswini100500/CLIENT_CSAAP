import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  UserCircle,
  Clock,
  ClipboardList,
  HelpCircle,
  Megaphone,
  CheckCircle2,
  XCircle,
  QrCode,
  X,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import useAuth from "../../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AttendanceQRModal from "../../components/Attendance/AttendanceQRModal";
import { parseIndiaDateTime } from "../../utils/attendanceTime";
import parse from "html-react-parser";
const renderRichText = (html) => {
  if (!html) return null;


  const cleanHtml = String(html).replace(/&nbsp;/g, " ");

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const options = {
    replace: (domNode) => {
      if (domNode.type === "text") {
        const text = domNode.data;
        if (!text || !urlRegex.test(text)) return;

        return (
          <>
            {text.split(urlRegex).map((part, index) => {
              if (part.match(urlRegex)) {
                return (
                  <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {part}
                  </a>
                );
              }
              return part;
            })}
          </>
        );
      }
    },
  };


  return <>{parse(cleanHtml, options)}</>;
};


const NOTIF_CONFIG = {
  task: {
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-700",
    label: "Task",
  },
  help_request: {
    icon: HelpCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-700",
    label: "Help Request",
  },
  announcement: {
    icon: Megaphone,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    badgeColor: "bg-indigo-100 text-indigo-700",
    label: "Announcement",
  },
  leave_update: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badgeColor: "bg-emerald-100 text-emerald-700",
    label: "Leave",
  },
  lead_assignment: {
    icon: UserPlus,
    color: "text-rose-600",
    bg: "bg-rose-50",
    badgeColor: "bg-rose-100 text-rose-700",
    label: "Lead",
  },
  new_employee: {
    icon: UserPlus,
    color: "text-violet-600",
    bg: "bg-violet-50",
    badgeColor: "bg-violet-100 text-violet-700",
    label: "Employee",
  },
  task_overdue: {
    icon: AlertTriangle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    badgeColor: "bg-rose-100 text-rose-700",
    label: "Overdue",
  },
};

const getNotifStyle = (notif) => {
  if (notif.type === "leave_update" && notif.meta?.status === "Rejected") {
    return {
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      badgeColor: "bg-rose-100 text-rose-700",
      label: "Leave",
    };
  }
  return NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.announcement;
};

const Header = ({ isSidebarCollapsed, toggleSidebar }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const { user, token } = useAuth();
  const navigate = useNavigate();
  const company_id = user?.company_id;

  const employeeProfileId =
    user?.employeeProfileId || user?.employee_id || user?.id;
  const companySlug = user?.slug;
  const resolvedCompanyId =
    user?.company_id || company_id;
  const roleLabel = String(user?.role || "").toLowerCase();
  const isAdminOrHR = roleLabel.includes("admin") || roleLabel.includes("hr");

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : "Employee");
  const userRole = user?.role || "Employee";
  const userInitials = userName.substring(0, 2).toUpperCase();


  const [timer, setTimer] = useState("00:00:00");
  const [punchIn, setPunchIn] = useState(null);
  const [leaveTime, setLeaveTime] = useState(null);

  const getTodayKey = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());


  useEffect(() => {
    const fetchAttendanceForTimer = async () => {
      if (!employeeProfileId) return;

      try {
        const baseUrl =
          import.meta.env.VITE_HRMS_BASE_URL || "https://csaapnodeapi.csaap.com";
        const today = getTodayKey();
        const todayUrl = companySlug
          ? `${baseUrl}/api/attendance/${companySlug}?date=${today}`
          : null;
        const primaryUrl = companySlug
          ? `${baseUrl}/api/attendance/company/${companySlug}/employee/${employeeProfileId}`
          : null;
        const fallbackUrl = `${baseUrl}/api/attendance/timesheet/${employeeProfileId}`;

        let attendanceRes;
        let data = [];

        try {
          if (todayUrl) {
            attendanceRes = await axios.get(todayUrl);
            data = attendanceRes?.data?.data || [];
          } else if (primaryUrl) {
            attendanceRes = await axios.get(primaryUrl);
            data = attendanceRes?.data?.data || [];
          } else {
            attendanceRes = await axios.get(fallbackUrl);
            data = attendanceRes?.data?.data || [];
          }
        } catch (error) {
          if (error.response?.status === 404 && primaryUrl) {
            attendanceRes = await axios.get(fallbackUrl);
            data = attendanceRes?.data?.data || [];
          } else {
            throw error;
          }
        }

        const currentRecord =
          data.find(
            (item) => String(item.employee_id) === String(employeeProfileId),
          ) || null;

        if (currentRecord) {
          if (currentRecord.mispunch_time) {
            const punchInDateTime = parseIndiaDateTime(
              String(currentRecord.mispunch_time).slice(0, 10),
              String(currentRecord.mispunch_time).includes(" ")
                ? String(currentRecord.mispunch_time).split(" ")[1]
                : String(currentRecord.mispunch_time),
            );
            setPunchIn(punchInDateTime);
          } else {
            setPunchIn(null);
          }
          if (currentRecord.leave_time) {
            const leaveDateTime = parseIndiaDateTime(
              String(currentRecord.leave_time).slice(0, 10),
              String(currentRecord.leave_time).includes(" ")
                ? String(currentRecord.leave_time).split(" ")[1]
                : String(currentRecord.leave_time),
            );
            setLeaveTime(leaveDateTime);
          } else {
            setLeaveTime(null);
          }
        }
      } catch (err) {
        console.error("Header fetchAttendance error:", err);
      }
    };

    fetchAttendanceForTimer();
  }, [companySlug, employeeProfileId]);


  useEffect(() => {
    if (!punchIn) return;

    const interval = setInterval(() => {
      const endTime = leaveTime ? leaveTime : new Date();
      const diff = endTime - punchIn;

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


  useEffect(() => {
    if (!employeeProfileId || !token) {
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/get-employee/${employeeProfileId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.data.success && response.data.data) {
          setEmployee(response.data.data);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeProfileId, token]);


  const fetchNotifications = async () => {
    if (!employeeProfileId) {

      return;
    }

    try {
      const baseUrl =
        import.meta.env.VITE_HRMS_BASE_URL || "https://csaapnodeapi.csaap.com";
      const apiBaseUrl =
        import.meta.env.VITE_ACCOUNTING_URL || "https://csaapnodeapi.csaap.com";


      const notifRes = await axios.get(
        `${baseUrl}/api/notifications/employee/${employeeProfileId}`,
        {
          params: {
            limit: 25,
            company_id: resolvedCompanyId || undefined,
            company_slug: companySlug || undefined,
            user_id: user?.user_id || sessionUser?.id || undefined,
            email: user?.email || sessionUser?.email || undefined,
          },
        },
      );

      let allNotifs = [];
      if (notifRes.data?.success && notifRes.data.data) {
        allNotifs = notifRes.data.data;
      }

      if (isAdminOrHR && (companySlug || resolvedCompanyId)) {
        try {
          const companyNotifRes = await axios.get(
            `${baseUrl}/api/notifications/company/${companySlug || "all"}`,
            {
              params: {
                company_id: resolvedCompanyId || undefined,
                limit: 10,
              },
            },
          );

          if (companyNotifRes.data?.success && companyNotifRes.data.data) {
            allNotifs = [...allNotifs, ...companyNotifRes.data.data];
          }
        } catch (companyNotifErr) {
          console.error(
            "Error fetching company employee notifications:",
            companyNotifErr,
          );
        }
      }


      try {
        const leadRes = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/lead-assignments/employee/${employeeProfileId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (leadRes.data?.success && Array.isArray(leadRes.data.data)) {
          const leads = leadRes.data.data;
          const leadNotifs = leads.slice(0, 15).map((lead) => ({
            id: `lead_assign_${lead.id}`,
            type: "lead_assignment",
            title: "New Lead Assigned",
            message: `You have a new lead assigned: ${lead.lead_name || lead.establishment_name || "N/A"}`,
            createdAt:
              lead.assigned_date || lead.created_at || new Date().toISOString(),
            meta: { leadId: lead.lead_id },
          }));
          allNotifs = [...allNotifs, ...leadNotifs];
        }
      } catch (leadErr) {
        console.error("Error fetching leads for notifications:", leadErr);
      }


      const uniqueNotifs = Array.from(
        new Map(allNotifs.map((item) => [item.id, item])).values(),
      );

      uniqueNotifs.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });


      setNotifications(uniqueNotifs.slice(0, 30));
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (!employeeProfileId) return;

    fetchNotifications();


    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [employeeProfileId, companySlug, isAdminOrHR, resolvedCompanyId]);


  useEffect(() => {
    if (!employeeProfileId) return;

    if (notifications.length > 0) {
      const raw = localStorage.getItem(`seenNotifIds_${employeeProfileId}`);
      const seenIds = raw ? JSON.parse(raw) : [];
      const count = notifications.filter((n) => !seenIds.includes(n.id)).length;
      setUnseenCount(count);
      setHasNewNotification(count > 0);
    } else {
      setUnseenCount(0);
      setHasNewNotification(false);
    }
  }, [notifications, employeeProfileId]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNotificationOpen &&
        !event.target.closest(".notification-container")
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);


  useEffect(() => {
    const handleNewNotification = () => {
      fetchNotifications();
    };

    window.addEventListener("new-notification", handleNewNotification);
    return () => {
      window.removeEventListener("new-notification", handleNewNotification);
    };
  }, [employeeProfileId]);


  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <header
      className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-40 transition-all duration-300 shrink-0"
      style={{ fontFamily: "'Manrope', 'Inter', 'Segoe UI', sans-serif" }}
    >

      <div className="flex items-center gap-3 min-w-50">
        {!isSidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex w-9 h-9 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-500 hover:text-green-600 items-center justify-center transition-all duration-200 cursor-pointer shadow-sm shrink-0"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>


      <div className="flex items-center justify-center flex-1">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">
          <Clock className="w-4 h-4 text-green-500 shrink-0" />
          <span className="font-mono font-bold text-green-800 text-base tracking-widest">
            {timer}
          </span>
          {punchIn && !leaveTime ? (
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="flex h-2 w-2 rounded-full bg-gray-300 shrink-0"></span>
          )}
        </div>
      </div>


      <div className="flex items-center justify-end gap-3 min-w-50">

        <button
          onClick={() => setIsQRModalOpen(true)}
          className="w-9 h-9 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all duration-200 cursor-pointer"
          title="Attendance QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>


        <div className="relative notification-container">
          <button
            onClick={(e) => {
              e.stopPropagation();

              setIsNotificationOpen(!isNotificationOpen);

              if (!isNotificationOpen && notifications.length > 0) {

                const allIds = notifications.map((n) => n.id);
                localStorage.setItem(
                  `seenNotifIds_${employeeProfileId}`,
                  JSON.stringify(allIds),
                );
                setUnseenCount(0);
                setHasNewNotification(false);
              }
            }}
            className="w-9 h-9 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 relative flex items-center justify-center transition-colors duration-200"
          >
            <Bell size={18} />
            {unseenCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4.5 w-4.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-rose-500 text-[9px] font-extrabold text-white items-center justify-center border-2 border-white">
                  {unseenCount > 9 ? "9+" : unseenCount}
                </span>
              </span>
            )}
          </button>


          {isNotificationOpen && (
            <div
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-9999 overflow-hidden"
              style={{
                animation:
                  "fadeIn 0.2s ease-out, slideInFromTop 0.2s ease-out",
              }}
            >

              <div className="p-3 border-b border-gray-50 bg-slate-50/80 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">
                  Notifications
                </h3>
                {unseenCount > 0 && (
                  <span className="bg-indigo-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unseenCount} New
                  </span>
                )}
              </div>


              <div
                className="max-h-96 overflow-y-auto"
                style={{ scrollbarWidth: "thin" }}
              >
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const style = getNotifStyle(notif);
                    const Icon = style.icon;


                    const raw = localStorage.getItem(
                      `seenNotifIds_${employeeProfileId}`,
                    );
                    const seenIds = raw ? JSON.parse(raw) : [];
                    const isUnseen = !seenIds.includes(notif.id);

                    return (
                      <div
                        key={notif.id}
                        onClick={() => setSelectedNotif(notif)}
                        className={`p-3.5 border-b border-slate-50 transition-colors cursor-pointer group ${
                          isUnseen
                            ? "bg-gray-50 hover:bg-gray-100"
                            : "bg-white hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex gap-3">

                          <div
                            className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            <Icon className={`w-4 h-4 ${style.color}`} />
                          </div>


                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badgeColor}`}
                              >
                                {style.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                {timeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-0.5 group-hover:text-emerald-600 transition-colors truncate">
                              {notif.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {renderRichText(notif.message)}
                            </p>


                            {notif.type === "task" &&
                              notif.meta?.priority && (
                                <span
                                  className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    notif.meta.priority === "High"
                                      ? "bg-rose-50 text-rose-600"
                                      : notif.meta.priority === "Medium"
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {notif.meta.priority} Priority
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      No notifications yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Check back later for updates
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-7 bg-slate-200 mx-1 shrink-0" />


        <button
          onClick={() => navigate("/employee/profile")}
          className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-slate-50 transition-colors duration-200 group text-left outline-none"
          title="My Profile"
        >

          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-green-200">
            {userInitials}
          </div>
          

          <div className="hidden sm:block text-left">
            <p className="text-[13px] font-semibold text-slate-700 capitalize leading-tight">
              {userName}
            </p>
            <p className="text-[11px] font-medium text-slate-400 capitalize leading-tight">
              {userRole}
            </p>
          </div>
        </button>
      </div>


      {selectedNotif && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            style={{
              animation: "zoomIn 0.3s ease-out",
            }}
          >

            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${getNotifStyle(selectedNotif).bg}`}
                >
                  {React.createElement(getNotifStyle(selectedNotif).icon, {
                    className: `w-6 h-6 ${getNotifStyle(selectedNotif).color}`,
                  })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {getNotifStyle(selectedNotif).label}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {timeAgo(selectedNotif.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
              >
                <X
                  size={20}
                  className="text-gray-400 group-hover:text-gray-600"
                />
              </button>
            </div>


            <div
              className="p-8 overflow-y-auto max-h-[60vh]"
              style={{ scrollbarWidth: "thin" }}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-4 leading-tight">
                {selectedNotif.title}
              </h4>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {renderRichText(selectedNotif.message)}
                </div>
              </div>

              {selectedNotif.type === "task" &&
                selectedNotif.meta?.priority && (
                  <div className="mt-6 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Priority:
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        selectedNotif.meta.priority === "High"
                          ? "bg-rose-100 text-rose-700"
                          : selectedNotif.meta.priority === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {selectedNotif.meta.priority}
                    </span>
                  </div>
                )}
            </div>



          </div>
        </div>
      )}


      <AttendanceQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />


      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes blinkBell {
          0%,
          100% {
            ring-color: #f43f5e;
          }
          50% {
            ring-color: #fda4af;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
