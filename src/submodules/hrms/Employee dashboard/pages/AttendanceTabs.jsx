import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { MdOutlineEditCalendar } from "react-icons/md";

import { usePermission } from "../../../../hooks/usePermission";
import AttendanceEmployee from "./AttendanceEmployee";
import AddAttendance from "./AddAttendance";
import LeaveManagement from "./LeaveManagement";
import MyTimesheet from "./Timesheet";

const AttendanceTabs = ({ defaultTab = "attendance" }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { hasAccess } = usePermission();

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const allTabs = [
    {
      id: "attendance",
      permission: "hrms.self_service.attendance",
      label: "Attendance",
      icon: <MdOutlineEditCalendar />,
      iconColor: "text-green-500",
      component: <AttendanceEmployee />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "add-attendance",
      permission: "hrms.self_service.attendance.add",
      label: "Add Attendance",
      icon: <PlusCircle />,
      iconColor: "text-emerald-500",
      component: <AddAttendance />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "timesheet",
      permission: "hrms.self_service.timesheet",
      label: "Timesheet",
      icon: <FaClock />,
      iconColor: "text-emerald-500",
      component: <MyTimesheet />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "leave",
      permission: "hrms.self_service.leave",
      label: "Leave",
      icon: <FaCalendarAlt />,
      iconColor: "text-emerald-500",
      component: <LeaveManagement />,
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const tabs = allTabs.filter(tab => hasAccess(tab.permission));

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#f8fafc] p-4 lg:p-6 font-sans">
      <div className="mb-4 flex justify-start">
        <nav className="relative flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-colors duration-300 ${
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="attendanceActivePill"
                    className={`absolute inset-0 rounded-xl bg-linear-to-r ${tab.gradient} shadow-lg shadow-blue-500/20`}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}

                <span className={`relative z-20 text-lg ${!isActive ? tab.iconColor : ""}`}>
                  {tab.icon}
                </span>
                <span className="relative z-20 whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="w-full overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {activeTabData?.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTabs;
