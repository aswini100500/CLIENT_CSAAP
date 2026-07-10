import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useAuth from "../../../../hooks/useAuth";
import axios from "axios";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  FileText,
  Plus,
  Sparkles,
  Download,
  ChevronRight,
  Gift,
  Users,
  Clock,
  TrendingUp,
  Video,
  MapPin,
  User,
} from "lucide-react";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const EmployeeCalendar = () => {
  const [view, setView] = useState("month");
  const [showHolidayPDF, setShowHolidayPDF] = useState(false);
  const [selectedYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.slug && user?.company_id) {
      fetchHolidays();
      fetchMeetings();
    }
  }, [user]);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday`,
        {
          params: { company_id: user.company_id, slug: user.slug },
        },
      );
      setHolidays(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/meetings`,
        {
          params: { company_id: user.company_id, slug: user.slug },
        },
      );
      setMeetings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sidebarMeetings = meetings.map((m, index) => {
    const colors = [
      {
        color: "from-blue-500 to-blue-600",
        lightColor: "bg-blue-50 text-blue-600",
      },
      {
        color: "from-purple-500 to-purple-600",
        lightColor: "bg-purple-50 text-purple-600",
      },
      {
        color: "from-emerald-500 to-emerald-600",
        lightColor: "bg-emerald-50 text-emerald-600",
      },
      {
        color: "from-amber-500 to-amber-600",
        lightColor: "bg-amber-50 text-amber-600",
      },
      {
        color: "from-rose-500 to-rose-600",
        lightColor: "bg-rose-50 text-rose-600",
      },
    ];
    const theme = colors[index % colors.length];

    return {
      id: m.id,
      title: m.title,
      time: m.startTime || "Time not set",
      date: new Date(m.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      attendees: Array.isArray(m.attendees) ? m.attendees.length : 0,
      type: m.mode || "Meeting",
      location: m.mode || "TBD",
      ...theme,
    };
  });

  const formattedEvents = [
    ...holidays.map((h) => ({
      title: h.name,
      start: new Date(h.date),
      end: new Date(h.date),
      allDay: true,
      type: "holiday",
      resource: h,
    })),
    ...meetings.map((m) => {
      const start = new Date(m.date);
      if (m.startTime) {
        const [hours, minutes] = m.startTime.split(":");
        if (hours && minutes) {
          start.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
      }
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      return {
        title: m.title,
        start,
        end,
        allDay: false,
        type: "meeting",
        resource: m,
      };
    }),
  ];

  const upcomingHolidays = [...holidays]
    .filter((h) => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextHoliday = upcomingHolidays.length > 0 ? upcomingHolidays[0] : null;
  const stringToday = new Date().toLocaleDateString();
  const meetingsToday = meetings.filter(
    (m) => new Date(m.date).toLocaleDateString() === stringToday,
  );

  const stats = [
    {
      label: "Team Members",
      value: "14",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      lightColor: "bg-blue-50 text-blue-600",
      change: "+2",
      subtext: "Active members",
    },
    {
      label: "Next Holiday",
      value: nextHoliday
        ? new Date(nextHoliday.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "None",
      icon: Gift,
      color: "from-emerald-500 to-emerald-600",
      lightColor: "bg-emerald-50 text-emerald-600",
      change: "",
      subtext: nextHoliday ? nextHoliday.name : "No upcoming holidays",
    },
    {
      label: "Scheduled Tasks",
      value: "08",
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      lightColor: "bg-indigo-50 text-indigo-600",
      change: "+3",
      subtext: "This week",
    },
    {
      label: "Meetings Today",
      value: meetingsToday.length.toString().padStart(2, "0"),
      icon: Video,
      color: "from-purple-500 to-purple-600",
      lightColor: "bg-purple-50 text-purple-600",
      change: "",
      subtext: "Scheduled for today",
    },
  ];

  const holidaysByMonth = holidays.reduce((acc, holiday) => {
    const month = format(new Date(holiday.date), "MMMM yyyy");
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30">
      <nav className=" top-0 z-40 bg-white/95 border-b rounded-2xl border-slate-100 backdrop-blur-md shadow-sm">
        <div className="max-w-400 mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"></div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
              {["month", "week", "day"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold capitalize transition-all ${
                    view === v
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowHolidayPDF(true)}
              className="flex items-center bg-blue-900 gap-2 px-3 py-3 text-xs font-medium text-white rounded-lg transition-all"
            >
              <Gift size={14} /> Holidays Calendar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-400 mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 sm:p-2 rounded-lg ${stat.lightColor} group-hover:scale-105 transition-transform`}
                >
                  <stat.icon size={14} className="sm:w-4 sm:h-4" />
                </div>
                {stat.change && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {stat.value}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  {stat.label}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-50">
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-400">
                  {stat.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4">
            <BigCalendar
              localizer={localizer}
              events={formattedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              views={["month", "week", "day"]}
              view={view}
              onView={setView}
              className="custom-calendar"
              eventPropGetter={(event) => {
                let backgroundColor =
                  event.type === "holiday" ? "#10B981" : "#3B82F6";
                return {
                  style: { backgroundColor, border: "none", color: "white" },
                };
              }}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Schedule Meetings
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Today & Upcoming
                  </p>
                </div>
                <button className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  <Plus size={14} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-87.5 overflow-y-auto">
              {sidebarMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${meeting.lightColor} group-hover:scale-105 transition-transform`}
                    >
                      <Video size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">
                        {meeting.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-500">
                            {meeting.time}
                          </span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <div className="flex items-center gap-1">
                          <User size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-500">
                            {meeting.attendees} attendees
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={10} className="text-slate-400" />
                        <span className="text-[9px] text-slate-400">
                          {meeting.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {meeting.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <button className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors">
                View All Meetings →
              </button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showHolidayPDF && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 "
            onClick={() => setShowHolidayPDF(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="max-w-6xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Holiday Calendar {selectedYear}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Annual Observances
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
                    <Download size={16} /> Export PDF
                  </button>
                  <button
                    onClick={() => setShowHolidayPDF(false)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-10 bg-slate-50/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(holidaysByMonth).map(
                    ([month, monthHolidays]) => (
                      <div
                        key={month}
                        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">
                          {month}
                        </h3>

                        <div className="space-y-2">
                          {monthHolidays.map((holiday, idx) => (
                            <div
                              key={idx}
                              className="group flex items-start gap-3"
                            >
                              <div className="min-w-10 h-10 bg-emerald-50 rounded-lg flex flex-col items-center justify-center border border-emerald-100 group-hover:bg-blue-600 transition-colors duration-300">
                                <span className="text-[10px] font-bold text-blue-600 group-hover:text-white leading-none">
                                  {format(new Date(holiday.date), "dd")}
                                </span>
                                <span className="text-[8px] font-bold text-blue-400 group-hover:text-emerald-100 uppercase leading-none mt-0.5">
                                  {format(new Date(holiday.date), "EEE")}
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <h4 className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
                                  {holiday.name}
                                </h4>
                                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                  {holiday.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {monthHolidays.length === 0 && (
                          <p className="text-[10px] font-medium text-slate-300 italic py-2">
                            No public holidays
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="px-4 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      Public Holiday
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      Observance
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-400 tracking-tight">
                  Total {holidays.length} Holidays scheduled for {selectedYear}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Clean Calendar Styling */
        .custom-calendar .rbc-header {
          padding: 12px 8px;
          font-weight: 700;
          color: #94A3B8;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #E2E8F0;
          background: #F8FAFC;
        }
        
        .custom-calendar .rbc-month-view {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .custom-calendar .rbc-month-row {
          min-height: 100px;
        }
        
        .custom-calendar .rbc-day-bg {
          border-left: 1px solid #F1F5F9;
        }
        
        .custom-calendar .rbc-day-bg:first-child {
          border-left: none;
        }
        
        .custom-calendar .rbc-today {
          background: #F0F9FF;
        }
        
        .custom-calendar .rbc-today .rbc-date-cell button {
          color: #0284C7;
          font-weight: 900;
        }
        
        .custom-calendar .rbc-date-cell {
          padding: 8px;
          text-align: left;
        }
        
        .custom-calendar .rbc-date-cell button {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748B;
          background: none;
          border: none;
          cursor: pointer;
        }
        
        .custom-calendar .rbc-off-range-bg {
          background: #F8FAFC;
          opacity: 0.5;
        }
        
        .custom-calendar .rbc-off-range .rbc-date-cell button {
          color: #CBD5E1;
        }
        
        /* Week/Day View */
        .custom-calendar .rbc-time-header-cell {
          padding: 8px;
        }
        
        .custom-calendar .rbc-time-slot {
          border-top: 1px solid #F1F5F9;
        }
        
        .custom-calendar .rbc-time-header-gutter {
          border-right: 1px solid #E2E8F0;
        }
        
        .custom-calendar .rbc-time-view {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        /* Toolbar */
        .custom-calendar .rbc-toolbar {
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .custom-calendar .rbc-toolbar button {
          color: #475569;
          font-weight: 500;
          border-radius: 8px;
          padding: 6px 12px;
          border: 1px solid #E2E8F0;
          background: white;
          transition: all 0.2s;
        }
        
        .custom-calendar .rbc-toolbar button:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }
        
        .custom-calendar .rbc-toolbar button.rbc-active {
          background: #1E293B;
          color: white;
          border-color: #1E293B;
        }
        
        .custom-calendar .rbc-toolbar-label {
          font-weight: 700;
          font-size: 1rem;
          color: #1E293B;
        }
        
        @media (max-width: 640px) {
          .custom-calendar .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .custom-calendar .rbc-toolbar-label {
            text-align: center;
            order: -1;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeCalendar;
