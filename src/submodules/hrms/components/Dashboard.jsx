import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  FileCheck,
  FileText,
  FileX,
  RotateCcw,
  UserMinus,
  XCircle,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import useAuth from "../../../hooks/useAuth";
import NoticePeriodAlertModal from "./NoticePeriodAlertModal";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const slug = user?.slug;

  const company_id = user?.id;

  const [stats, setStats] = useState({
    jobsListed: 0,
    formsApplied: 0,
    experience: 0,
    offerLetters: 0,
    terminationLetters: 0,
    attendance: 0,
    attendanceCount: 0,
    totalEmployees: 0,
    overtimeHours: 0,
    lateComing: 0,
    earlyGoing: 0,
    leaveReport: 0,
    totalTasks: 0,
    pendingTasks: 0,
  });
  const [noticeAlerts, setNoticeAlerts] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeActionLoading, setNoticeActionLoading] = useState("");
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  const getTodayKey = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
      new Date(),
    );
  useEffect(() => {
    if (!company_id) {
      return;
    }

    fetchApplicantsCount();
    fetchJobsCount();
    fetchExperienceCertificateCount();
    fetchOfferLettersCount();
    fetchTerminationLettersCount();
    fetchEmployeesCount();
    fetchAttendanceCount();
    fetchTasksCount();
    fetchNoticeAlerts();
  }, [slug, company_id]);

  const fetchNoticeAlerts = async () => {
    try {
      setNoticeLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/notice-period/actions`,
        {
          params: {
            slug,
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

  const handleNoticeAction = async (item, action, customExtraDays) => {
    try {
      let extraDays = customExtraDays || 0;

      if (action === "extend" && !customExtraDays) {
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

  const fetchApplicantsCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/ap/${company_id}`,
      );

      const totalApplicants = res.data?.data?.length || 0;

      setStats((prev) => ({
        ...prev,
        formsApplied: totalApplicants,
      }));
    } catch (error) {
      console.error("Failed to fetch applicants", error);
    }
  };
  const fetchJobsCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/jobs/${company_id}`,
      );

      let totalJobs = 0;

      if (Array.isArray(res.data)) {
        totalJobs = res.data.length;
      } else if (Array.isArray(res.data.data)) {
        totalJobs = res.data.data.length;
      }

      setStats((prev) => ({
        ...prev,
        jobsListed: totalJobs,
      }));
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };
  const fetchExperienceCertificateCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/eligible/employees/${company_id}`,
      );

      const totalCertificates = res.data?.data?.length || 0;

      setStats((prev) => ({
        ...prev,
        experience: totalCertificates,
      }));
    } catch (error) {
      console.error("Failed to fetch experience certificates", error);
    }
  };

  const fetchOfferLettersCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getselectedCandidates/all/${company_id}`,
      );

      const totalOfferLetters = res.data?.data?.length || 0;

      setStats((prev) => ({
        ...prev,
        offerLetters: totalOfferLetters,
      }));
    } catch (error) {
      console.error("Failed to fetch offer letters", error);
    }
  };

  const fetchTerminationLettersCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/terminate/${company_id}`,
      );

      const totalTerminationLetters = res.data.length;

      setStats((prev) => ({
        ...prev,
        terminationLetters: totalTerminationLetters,
      }));
    } catch (error) {
      console.error("Failed to fetch termination letters", error);
    }
  };
  const fetchEmployeesCount = async () => {
    try {
      if (!slug) {
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/${slug}`,
      );

      const totalEmployees = res.data?.data?.length || 0;

      setStats((prev) => ({
        ...prev,
        totalEmployees,
      }));
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };
  const fetchAttendanceCount = async () => {
    try {
      if (!slug) {
        return;
      }

      const attendanceUrl = `${import.meta.env.VITE_HRMS_BASE_URL}/api/attendance/${slug}`;

      const res = await axios.get(attendanceUrl, {
        params: {
          date: getTodayKey(),
        },
      });

      const totalAttendance = res.data?.data?.length || 0;

      setStats((prev) => ({
        ...prev,
        attendanceCount: totalAttendance,
      }));
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    }
  };

  const fetchTasksCount = async () => {
    try {
      if (!slug) {
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks`,
        {
          params: { slug },
        },
      );

      const taskList = Array.isArray(res.data) ? res.data : [];
      const pendingTasks = taskList.filter(
        (task) => task?.status !== "Completed",
      ).length;

      setStats((prev) => ({
        ...prev,
        totalTasks: taskList.length,
        pendingTasks,
      }));
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const attendancePercentage =
    stats.totalEmployees > 0
      ? Math.round((stats.attendanceCount / stats.totalEmployees) * 100)
      : 0;
  const attendanceData = [
    { name: "Present", value: stats.attendanceCount },
    {
      name: "Absent",
      value: Math.max(stats.totalEmployees - stats.attendanceCount, 0),
    },
  ];

  const overtimeData = [
    { name: "Overtime", value: stats.overtimeHours },
    { name: "Regular", value: 160 - stats.overtimeHours },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <NoticePeriodAlertModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        alerts={noticeAlerts}
        onAction={handleNoticeAction}
        actionLoading={noticeActionLoading}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">HRMS Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor HR operations and jump straight into task assignment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Briefcase size={24} />}
          title="Jobs Listed"
          value={stats.jobsListed}
          color="blue"
        />
        <StatCard
          icon={<FileText size={24} />}
          title="Forms Applied"
          value={stats.formsApplied}
          color="green"
        />

        <StatCard
          icon={<CheckCircle size={24} />}
          title="Experience"
          value={stats.experience}
          color="yellow"
        />
        <StatCard
          icon={<FileCheck size={24} />}
          title="Offer Letters"
          value={stats.offerLetters}
          color="teal"
        />
        <StatCard
          icon={<FileX size={24} />}
          title="Termination Letters"
          value={stats.terminationLetters}
          color="red"
        />
        <StatCard
          icon={<Calendar size={24} />}
          title="Attendance %"
          value={attendancePercentage}
          color="indigo"
        />
        <StatCard
          icon={<Clock size={24} />}
          title="Overtime Hours"
          value={stats.overtimeHours}
          color="pink"
        />
        <StatCard
          icon={<AlertCircle size={24} />}
          title="Late Coming"
          value={stats.lateComing}
          color="orange"
        />
        <StatCard
          icon={<AlertCircle size={24} />}
          title="Early Going"
          value={stats.earlyGoing}
          color="gray"
        />
        <StatCard
          icon={<FileText size={24} />}
          title="Leaves"
          value={stats.leaveReport}
          color="cyan"
        />
        <StatCard
          icon={<ClipboardList size={24} />}
          title="Total Tasks"
          value={stats.totalTasks}
          color="emerald"
        />
        <StatCard
          icon={<ClipboardList size={24} />}
          title="Open Tasks"
          value={stats.pendingTasks}
          color="rose"
        />
      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">
              Task Management
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {stats.pendingTasks} active tasks need follow-up
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Use the admin dashboard flow to assign new work or review pending
              tasks.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-500">
              Notice Period Alerts
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {noticeLoading
                ? "Loading..."
                : `${noticeAlerts.length} employee${noticeAlerts.length === 1 ? "" : "s"} need HR action`}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              These alerts appear one day before the notice period ends so HR
              can extend, regularise, or reject.
            </p>
          </div>
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <UserMinus size={22} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {noticeAlerts.length === 0 && !noticeLoading ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
              No notice-period actions are pending today.
            </div>
          ) : null}

          {noticeAlerts.map((item) => {
            const loadingKeyPrefix = `${item.source}-${item.id}`;

            return (
              <div
                key={`${item.source}-${item.id}`}
                className="flex flex-col gap-4 rounded-xl border border-red-100 bg-red-50/50 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.designation || "Employee"}
                    {item.department ? ` • ${item.department}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.source === "resignation"
                      ? "Resignation"
                      : item.source === "notice"
                        ? "Notice"
                        : "Termination"}{" "}
                    notice ends on{" "}
                    {item.noticeEndDate
                      ? new Date(item.noticeEndDate).toLocaleDateString("en-IN")
                      : "-"}
                    .
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleNoticeAction(item, "extend")}
                    disabled={noticeActionLoading.startsWith(loadingKeyPrefix)}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RotateCcw size={16} />
                    Extend
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNoticeAction(item, "regularise")}
                    disabled={noticeActionLoading.startsWith(loadingKeyPrefix)}
                    className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle size={16} />
                    Regularise
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNoticeAction(item, "reject")}
                    disabled={noticeActionLoading.startsWith(loadingKeyPrefix)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Attendance Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={attendanceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                <Cell fill="#4ade80" />
                <Cell fill="#f87171" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Overtime Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={overtimeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                <Cell fill="#facc15" />
                <Cell fill="#3b82f6" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  yellow: "bg-yellow-100 text-yellow-600",
  teal: "bg-teal-100 text-teal-600",
  red: "bg-red-100 text-red-600",
  indigo: "bg-indigo-100 text-indigo-600",
  pink: "bg-pink-100 text-pink-600",
  orange: "bg-orange-100 text-orange-600",
  gray: "bg-gray-100 text-gray-600",
  cyan: "bg-cyan-100 text-cyan-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="flex items-center p-4 bg-white rounded-lg shadow">
    <div className={`p-3 rounded-full mr-4 ${colorMap[color]}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

export default Dashboard;
