import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { MdOutlineVideoCall } from "react-icons/md";
import Defineholiday from "./Calender/Defineholiday";
import MeetingScheduler from "./Calender/MeetingScheduler";

import { usePermission } from "../../../hooks/usePermission";

const CalendarTabs = () => {
  const { hasAccess } = usePermission();

  const tabs = [
    {
      id: "holiday",
      permission: "hrms.calendar.holiday",
      label: "Holiday",
      icon: <FaCalendarAlt />,
      description: "Manage company holidays and events",
      gradient: "from-emerald-500 to-emerald-600",
      activeColor: "bg-emerald-500",
      iconColor: "text-emerald-500",
      component: <Defineholiday />,
    },
    {
      id: "meeting",
      permission: "hrms.calendar.meeting.create",
      label: "Meeting",
      icon: <MdOutlineVideoCall />,
      description: "Schedule and manage team meetings",
      gradient: "from-emerald-500 to-emerald-600",
      activeColor: "bg-emerald-500",
      iconColor: "text-emerald-500",
      component: <MeetingScheduler />,
    },
  ];

  const filteredTabs = tabs.filter((tab) => hasAccess(tab.permission));

  const [activeTab, setActiveTab] = useState(() => {
    return filteredTabs[0]?.id || "holiday";
  });

  const activeTabData = filteredTabs.find((tab) => tab.id === activeTab) || filteredTabs[0];

  return (
    <div className="w-full bg-[#f8fafc]  lg:p-2 font-sans">
      {/* ── Sliding Navigation ─────────────────────────── */}
      <div className="flex justify-start mb-8">
        <nav className="flex p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm relative">
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-6 py-2.5 rounded-xl
                  text-sm font-bold transition-colors duration-300 z-10
                  ${isActive ? "text-white" : "text-slate-500 hover:text-slate-800"}
                `}
              >
                {/* Logic for the sliding background pill */}
                {isActive && (
                  <motion.div
                    layoutId="calendarActivePill"
                    className={`absolute inset-0 rounded-xl bg-linear-to-r ${tab.gradient} shadow-lg shadow-emerald-500/20`}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}

                <span
                  className={`relative z-20 text-lg ${!isActive && tab.iconColor}`}
                >
                  {tab.icon}
                </span>
                <span className="relative z-20 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Main Content Container ─────────────────────── */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Content Section */}
        <div className="w-full relative">
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
              className=""
            >
              {activeTabData?.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalendarTabs;
