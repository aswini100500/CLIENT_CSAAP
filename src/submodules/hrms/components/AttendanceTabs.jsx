import React, { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaClipboardCheck,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { usePermission } from "../../../hooks/usePermission";
import Leaveofallemployee from "./Employee Management/Leaveofallemployee";
import Attendance2 from "./pages/Attendance2";
import AttendanceRequestsLedger from "./pages/AttendanceRequestsLedger";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeAttendanceReview from "./pages/EmployeeAttendanceReview";

const AttendanceTabs = () => {
  const [activeTab, setActiveTab] = useState("attendance");
  const [isLoading, setIsLoading] = useState(false);
  const { hasAccess } = usePermission();

  const tabs = [
    {
      id: "attendance",
      label: "Attendance",
      icon: <FaUsers />,
      description:
        "Track presence, spot exceptions, and review monthly attendance records.",
      color: "from-emerald-600 to-emerald-500",
    },
    {
      id: "attendance_review",
      label: "Attendance Review",
      icon: <FaClipboardCheck />,
      description:
        "Review attendance entries, punch details, and approve timesheets from one merged view.",
      color: "from-emerald-600 to-emerald-500",
    },
    {
      id: "requests",
      label: "Attendance Request",
      icon: <FaClipboardCheck />,
      description:
        "Review request submissions, approve valid entries, and keep the attendance table clean.",
      color: "from-emerald-600 to-emerald-500",
    },
    {
      id: "mispunch",
      label: "Daily Punch",
      icon: <FaUserPlus />,
      description:
        "Resolve punch issues, configure location check-ins, and monitor today's entries.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "leave",
      label: "Employee Leave",
      icon: <FaBriefcase />,
      description:
        "Review requests, filter by status, and approve or reject with context.",
      color: "from-emerald-500 to-emerald-500",
    },
  ];

  const filteredTabs = tabs.filter((tab) => {
    if (tab.id === "attendance") return hasAccess("hrms.attendance");
    if (tab.id === "attendance_review")
      return hasAccess("hrms.attendance.review");
    if (tab.id === "requests") return hasAccess("hrms.attendance.requests");
    if (tab.id === "mispunch") return hasAccess("hrms.attendance.mispunch");
    if (tab.id === "leave") return hasAccess("hrms.attendance.leave");
    return true;
  });

  const activeTabData =
    filteredTabs.find((tab) => tab.id === activeTab) || filteredTabs[0];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 p-2 lg:p-4">
      <div className="w-full mb-6">
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl p-2 gap-4 border border-gray-200 shadow-sm inline-flex flex-wrap">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center justify-center
                  px-6 py-3 rounded-xl font-semibold transition-all
                  duration-500 ease-out transform hover:scale-[1.02]
                  hover:shadow-md min-w-35 group
                  ${
                    activeTab === tab.id
                      ? `text-white bg-linear-to-r ${tab.color} shadow-lg scale-[1.02]`
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`
                    text-lg transition-colors duration-300
                    ${activeTab === tab.id ? "text-white" : tab.iconColor}
                  `}
                >
                  {tab.icon}
                </span>

                <span className="ml-2 text-sm font-semibold whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm min-h-150">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTabData?.label}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {activeTabData?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full p-4 sm:p-6">
          <div
            className={`transition-opacity duration-300 ${
              isLoading ? "opacity-30" : "opacity-100"
            }`}
          >
            {activeTab === "mispunch" && <Attendance2 />}
            {activeTab === "attendance" && <EmployeeAttendance />}
            {activeTab === "attendance_review" && <EmployeeAttendanceReview />}
            {activeTab === "requests" && <AttendanceRequestsLedger />}
            {activeTab === "leave" && <Leaveofallemployee />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTabs;
