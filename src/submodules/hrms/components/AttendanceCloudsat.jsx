import {
  Briefcase,
  ClipboardCheck,
  FileText,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Leaveofallemployee from "../components/Employee Management/Leaveofallemployee";
import Attendance2 from "./pages/Attendance2";
import AttendanceRequestsLedger from "./pages/AttendanceRequestsLedger";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeAttendanceReview from "./pages/EmployeeAttendanceReview";

const AttendanceCloudsat = () => {
  const [activeTab, setActiveTab] = useState("attendance");

  const tabs = [
    {
      id: "mispunch",
      label: "Daily Punch",
      icon: UserPlus,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: Users,
    },
    {
      id: "attendance_review",
      label: "Attendance Review",
      icon: ClipboardCheck,
    },
    {
      id: "requests",
      label: "Attendance Request",
      icon: FileText,
    },

    {
      id: "leave",
      label: "Employee Leave",
      icon: Briefcase,
    },
  ];

  return (
    <div className="erp-root app-shell min-h-[calc(100vh-80px)] font-sans">
      <div className="mx-auto max-w-7xl px-3 py-4 lg:px-4">
        <div
          className="-mx-3 mb-5 border-b border-(--border-soft) px-3 py-3 lg:-mx-4 lg:px-4"
          style={{ background: "color-mix(in srgb, var(--bg-app) 94%, white)" }}
        >
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-bold tracking-[-0.02em] transition-all duration-200 sm:px-4 ${
                    isActive
                      ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                      : "border-(--border-soft) bg-white/88 text-(--text-body) hover:border-(--border-strong) hover:bg-white hover:text-(--brand)"
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(135deg, var(--brand), #00c853)",
                        }
                      : undefined
                  }
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isActive
                        ? "border border-white/10 bg-white/16 text-white"
                        : "bg-(--bg-subtle) text-(--text-soft)"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="w-full">
            <div className="rounded-4xl bg-transparent">
              {activeTab === "mispunch" && <Attendance2 />}
              {activeTab === "attendance" && <EmployeeAttendance />}
              {activeTab === "attendance_review" && (
                <EmployeeAttendanceReview />
              )}
              {activeTab === "requests" && <AttendanceRequestsLedger />}
              {activeTab === "leave" && <Leaveofallemployee />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCloudsat;
