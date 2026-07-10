import axios from "axios";
import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  Bell,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  Cloud,
  Crown,
  Edit2,
  Eye,
  FileText,
  Flag,
  Gift,
  Globe,
  Heart,
  History,
  Image as ImageIcon,
  Moon,
  Paperclip,
  PartyPopper,
  RefreshCw,
  Save,
  Search,
  Send,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { usePermission } from "../../../hooks/usePermission";




const formatDateForInput = (dateString) => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "2025-12-25";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "2025-12-25";
  }
};

const getEmployeeTargetId = (employee) => {
  const val = employee?.employee_id || employee?.id;
  return val ? String(val) : "";
};

function Announcement() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState({});
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTermEmployees, setSearchTermEmployees] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("active");
  const [generalForm, setGeneralForm] = useState({
    title: "",
    description: "",
    scheduleDate: "2025-11-12",
    scheduleTime: "09:00",
    sendTo: "All Employees",
    attachment: null,
    attachmentPreview: null,
    priority: "normal",
  });
  const [showAttachPreview, setShowAttachPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [holidayTitle, setHolidayTitle] = useState("");
  const [holidayDescription, setHolidayDescription] = useState("");
  const [holidayScheduleDate, setHolidayScheduleDate] = useState("");
  const [holidayScheduleTime, setHolidayScheduleTime] = useState("09:00");
  const { user, token } = useAuth();
  const { has } = usePermission();
  const companyId = user?.company_id || user?.id;
  const slug = user?.slug || user?.subdomain;

  const latestStateRef = React.useRef({
    generalForm,
    holidayTitle,
    holidayDescription,
    selectedEmployees,
    activeTab,
    draftId,
  });
  useEffect(() => {
    latestStateRef.current = {
      generalForm,
      holidayTitle,
      holidayDescription,
      selectedEmployees,
      activeTab,
      draftId,
    };
  }, [
    generalForm,
    holidayTitle,
    holidayDescription,
    selectedEmployees,
    activeTab,
    draftId,
  ]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const csaapToken = token;

      if (!csaapToken) {
        console.error("CSAAP token not found");
        setLoadingEmployees(false);
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
        {
          headers: {
            Authorization: `Bearer ${csaapToken}`,
          },
        },
      );

      if (res.data.success) {
        const data = res.data.data || [];
        setEmployees(data);


        const grouped = data.reduce((acc, emp) => {
          const dept = emp.department || emp.postApplied || "Other";
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});
        setDepartments(grouped);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setDepartments({});
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      setLoadingHolidays(true);
      if (!companyId || !slug) return;

      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/holiday?company_id=${companyId}&slug=${slug}`,
      );
      if (res.data) {

        const holidayIcons = [
          PartyPopper,
          Flag,
          Heart,
          Moon,
          Star,
          Sun,
          Crown,
          Cloud,
        ];
        const colors = [
          "from-green-500 to-emerald-600",
          "from-blue-500 to-indigo-600",
          "from-purple-500 to-pink-600",
          "from-amber-500 to-orange-600",
          "from-sky-500 to-blue-600",
          "from-orange-500 to-red-600",
          "from-red-500 to-rose-600",
          "from-amber-600 to-yellow-700",
        ];

        const mappedHolidays = (Array.isArray(res.data) ? res.data : []).map(
          (h, i) => ({
            ...h,
            icon: holidayIcons[i % holidayIcons.length],
            color: colors[i % colors.length],
          }),
        );
        setHolidays(mappedHolidays);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const fetchAnnouncementsList = async (status) => {
    try {
      setLoadingAnnouncements(true);
      if (!companyId || !slug) return;

      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/announcements?company_id=${companyId}&slug=${slug}&status=${status}`,
      );


      if (res.data) {
        setAnnouncementsList(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchAnnouncementsList(historyFilter);
    }
  }, [activeTab, historyFilter]);

  useEffect(() => {
    fetchEmployees();
    fetchHolidays();
  }, []);

  const handleEditDraft = (item) => {
    setActiveTab("general");

    setDraftId(item.id);

    setGeneralForm({
      title: item.title || "",
      description: item.description || "",
      scheduleDate: item.scheduled_at ? item.scheduled_at.split(" ")[0] : "",
      scheduleTime: item.scheduled_at
        ? item.scheduled_at.split(" ")[1]?.slice(0, 5)
        : "",
      sendTo: "All Employees",
      attachment: null,
      attachmentPreview: null,
      priority: item.priority || "normal",
    });

    setSelectedEmployees(item.send_to ? JSON.parse(item.send_to) : []);
  };
  const autoSaveDraft = async (forceData = null) => {
    if (!has("hrms.message.announcement.create")) return;
    try {
      const state = forceData || latestStateRef.current;
      const isHoliday = state.activeTab === "holiday" && selectedHoliday;
      const title = isHoliday ? holidayTitle : state.generalForm.title;
      const description = isHoliday
        ? holidayDescription
        : state.generalForm.description;

      if (!title?.trim()) return;

      setIsAutoSaving(true);
      if (!companyId || !slug) return;

      const senderId = user?.user_id || user?.id || null;

      const payload = {
        company_id: companyId,
        slug,
        title: title,
        description: description,
        priority: state.generalForm.priority,
        status: "draft",
        sender_id: senderId,
        created_by: senderId,
        scheduled_at: isHoliday
          ? holidayScheduleDate && holidayScheduleTime
            ? `${holidayScheduleDate} ${holidayScheduleTime}`
            : null
          : state.generalForm.scheduleDate && state.generalForm.scheduleTime
            ? `${state.generalForm.scheduleDate} ${state.generalForm.scheduleTime}`
            : null,
        send_to: state.selectedEmployees && state.selectedEmployees.length > 0 ? state.selectedEmployees : null,
      };

      const url = `${import.meta.env.VITE_HRMS_BASE_URL}/api/announcements`;
      const res = state.draftId
        ? await axios.put(`${url}/${state.draftId}`, payload)
        : await axios.post(url, payload);

      if (res.data && res.data.data) {
        if (!state.draftId) setDraftId(res.data.data.id);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const title = activeTab === "holiday" ? holidayTitle : generalForm.title;
      if (title.trim()) {
        autoSaveDraft();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [
    generalForm.title,
    generalForm.description,
    holidayTitle,
    holidayDescription,
    selectedEmployees,
  ]);

  useEffect(() => {
    return () => {

      const state = latestStateRef.current;
      const title =
        state.activeTab === "holiday"
          ? state.holidayTitle
          : state.generalForm.title;
      if (title?.trim()) {
        autoSaveDraft(state);
      }
    };
  }, []);

  const handleTabChange = (tab) => {

    const title = activeTab === "holiday" ? holidayTitle : generalForm.title;
    if (title.trim()) {
      autoSaveDraft();
    }
    setActiveTab(tab);
    setSelectedHoliday(null);
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneralForm((prev) => ({
          ...prev,
          attachment: file,
          attachmentPreview: reader.result,
        }));
        setShowAttachPreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setGeneralForm((prev) => ({
      ...prev,
      attachment: null,
      attachmentPreview: null,
    }));
    setShowAttachPreview(false);
  };

  const handlePublish = async () => {
    if (!has("hrms.message.announcement.create")) {
      alert("Access Denied: You do not have permission to publish announcements.");
      return;
    }
    if (!generalForm.title.trim()) {
      alert("Please enter an announcement title");
      return;
    }

    if (!companyId || !slug) {
      alert("Session expired. Please login again.");
      return;
    }

    setIsPublishing(true);
    try {
      const senderId = user?.user_id || user?.id || null;

      const recipientEmails = selectedEmployees.length > 0
        ? employees
            .filter((emp) =>
              selectedEmployees.includes(getEmployeeTargetId(emp)),
            )
            .map((emp) => emp.email)
            .filter(Boolean)
        : employees.map((emp) => emp.email).filter(Boolean);

      const payload = {
        title: generalForm.title,
        description: generalForm.description,
        company_id: companyId,
        slug,
        status: "active",
        priority: generalForm.priority,
        sender_id: senderId,
        created_by: senderId,
        scheduled_at:
          generalForm.scheduleDate && generalForm.scheduleTime
            ? `${generalForm.scheduleDate} ${generalForm.scheduleTime}`
            : null,
        send_to: selectedEmployees.length > 0 ? selectedEmployees : null,
        recipient_emails: recipientEmails,
      };

      if (draftId) {
        await axios.put(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/announcements/${draftId}`,
          payload,
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/announcements`,
          payload,
        );
      }

      alert(`✅ Announcement "${generalForm.title}" published successfully!`);
      if (activeTab === "history") fetchAnnouncementsList(historyFilter);
      setGeneralForm({
        title: "",
        description: "",
        scheduleDate: "2025-11-12",
        scheduleTime: "09:00",
        sendTo: "All Employees",
        attachment: null,
        attachmentPreview: null,
        priority: "normal",
      });
      setDraftId(null);
      setLastSaved(null);
      setShowAttachPreview(false);
    } catch (err) {
      console.error("Publishing failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to publish announcement. Please try again.";
      alert(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!has("hrms.message.announcement.create")) {
      alert("Access Denied: You do not have permission to save drafts.");
      return;
    }
    if (!generalForm.title.trim() && !generalForm.description.trim()) {
      alert("Add at least title or description to save draft");
      return;
    }
    await autoSaveDraft();
    alert(`📝 Draft saved successfully`);
  };

  const handleSelectHoliday = (holiday) => {
    setSelectedHoliday(holiday);
    setHolidayTitle(`Office closed: ${holiday.name}`);
    setHolidayDescription(
      `In observance of ${holiday.name} (${holiday.date}), the office will remain closed. Wishing everyone a wonderful celebration. ${holiday.description}`,
    );
    setHolidayScheduleDate(formatDateForInput(holiday.date));
    setHolidayScheduleTime("09:00");
  };

  const handlePublishHolidayAnnouncement = async () => {
    if (!has("hrms.message.announcement.create")) {
      alert("Access Denied: You do not have permission to publish announcements.");
      return;
    }
    if (!holidayTitle.trim()) {
      alert("Please enter an announcement title");
      return;
    }

    if (!companyId || !slug) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      const senderId = user?.user_id || user?.id || null;

      const recipientEmails = selectedEmployees.length > 0
        ? employees
            .filter((emp) =>
              selectedEmployees.includes(getEmployeeTargetId(emp)),
            )
            .map((emp) => emp.email)
            .filter(Boolean)
        : employees.map((emp) => emp.email).filter(Boolean);

      const payload = {
        title: holidayTitle,
        description: holidayDescription,
        company_id: companyId,
        slug,
        status: "active",
        priority: "high",
        sender_id: senderId,
        created_by: senderId,
        scheduled_at: `${holidayScheduleDate} ${holidayScheduleTime}`,
        send_to: selectedEmployees.length > 0 ? selectedEmployees : null,
        recipient_emails: recipientEmails,
      };

      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/announcements`,
        payload,
      );

      alert(
        `🎉 Holiday announcement for "${selectedHoliday.name}" has been published and sent to all employees.`,
      );
      setSelectedHoliday(null);
      setHolidayTitle("");
      setHolidayDescription("");
      setSelectedEmployees([]);
    } catch (err) {
      console.error("Holiday publishing failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to publish holiday announcement.";
      alert(errorMessage);
    }
  };

  const handleCancelHoliday = () => {
    setSelectedHoliday(null);
  };

  const backToHolidayList = () => {
    setSelectedHoliday(null);
  };

  const getPriorityColor = () => {
    switch (generalForm.priority) {
      case "high":
        return "from-red-500 to-rose-600";
      case "medium":
        return "from-amber-500 to-orange-600";
      default:
        return "from-indigo-500 to-indigo-600";
    }
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(getEmployeeTargetId).filter(Boolean));
    }
  };

  const toggleSelectDepartment = (deptName) => {
    const deptEmployeeIds = employees
      .filter(
        (emp) => (emp.department || emp.postApplied || "Other") === deptName,
      )
      .map(getEmployeeTargetId)
      .filter(Boolean);

    const allSelected = deptEmployeeIds.every((id) =>
      selectedEmployees.includes(id),
    );

    if (allSelected) {
      setSelectedEmployees((prev) =>
        prev.filter((id) => !deptEmployeeIds.includes(id)),
      );
    } else {
      setSelectedEmployees((prev) => [
        ...new Set([...prev, ...deptEmployeeIds]),
      ]);
    }
  };

  const toggleSelectEmployee = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId],
    );
  };

  const filteredEmployeesList = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTermEmployees.toLowerCase()) ||
      (emp.department || emp.postApplied || "Other")
        .toLowerCase()
        .includes(searchTermEmployees.toLowerCase()),
  );

  return (
    <div className="font-sans">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage company-wide updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isAutoSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm shadow-sm"
          >
            <Save
              className={`h-4 w-4 ${isAutoSaving ? "animate-pulse text-emerald-500" : ""}`}
            />
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 text-sm shadow-md"
          >
            {isPublishing ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish
          </button>
        </div>
      </div>

      <div className="space-y-8">

        <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl w-fit">
          <button
            onClick={() => handleTabChange("general")}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "general"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            General
          </button>
          <button
            onClick={() => handleTabChange("holiday")}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "holiday"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Holiday
          </button>
          <button
            onClick={() => handleTabChange("history")}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>


        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-3xl">

          {activeTab === "general" && (
            <div className="p-6 md:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                <div className="space-y-7">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      Create New Announcement
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      Priority Level
                    </label>
                    <div className="flex gap-2">
                      {["normal", "medium", "high"].map((priority) => (
                        <button
                          key={priority}
                          onClick={() =>
                            setGeneralForm((prev) => ({ ...prev, priority }))
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                            generalForm.priority === priority
                              ? priority === "high"
                                ? "bg-red-500 text-white shadow-md"
                                : priority === "medium"
                                  ? "bg-amber-500 text-white shadow-md"
                                  : "bg-emerald-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title
                    </label>
                    <div className="relative">
                      <Bell className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="title"
                        value={generalForm.title}
                        onChange={handleGeneralChange}
                        placeholder="e.g., Important Update: Q4 Goals"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none bg-gray-50 hover:bg-white focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={generalForm.description}
                      onChange={handleGeneralChange}
                      rows="4"
                      placeholder="Share the details with your team..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-gray-50 hover:bg-white focus:bg-white"
                    />
                  </div>

                  <div className="bg-linear-to-r from-gray-50 to-white p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      Schedule Announcement
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-medium">
                          DATE
                        </label>
                        <input
                          type="date"
                          name="scheduleDate"
                          value={generalForm.scheduleDate}
                          onChange={handleGeneralChange}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium">
                          TIME
                        </label>
                        <input
                          type="time"
                          name="scheduleTime"
                          value={generalForm.scheduleTime}
                          onChange={handleGeneralChange}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Automatically published
                      at selected date and time
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Send To
                    </label>
                    <div className="space-y-4">

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={toggleSelectAll}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                            selectedEmployees.length === employees.length &&
                            employees.length > 0
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                              : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-sm font-semibold">
                            All Employees ({employees.length})
                          </span>
                          {selectedEmployees.length === employees.length &&
                            employees.length > 0 && (
                              <CheckCircle className="h-3.5 w-3.5 ml-1" />
                            )}
                        </button>

                        {Object.entries(departments).map(([dept, count]) => {
                          const deptEmployeeIds = employees
                            .filter(
                              (emp) =>
                                (emp.department ||
                                  emp.postApplied ||
                                  "Other") === dept,
                            )
                            .map(getEmployeeTargetId)
                            .filter(Boolean);
                          const isFullySelected = deptEmployeeIds.every((id) =>
                            selectedEmployees.includes(id),
                          );

                          return (
                            <button
                              key={dept}
                              onClick={() => toggleSelectDepartment(dept)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                isFullySelected
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${isFullySelected ? "bg-white" : "bg-emerald-400"}`}
                              ></div>
                              <span className="truncate max-w-30">
                                {dept} ({count})
                              </span>
                            </button>
                          );
                        })}
                      </div>


                      <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Select Individual Employees
                          </span>
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            {selectedEmployees.length} selected
                          </span>
                        </div>

                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name or department..."
                            value={searchTermEmployees}
                            onChange={(e) =>
                              setSearchTermEmployees(e.target.value)
                            }
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                          />
                        </div>

                        <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                          {filteredEmployeesList.length > 0 ? (
                            filteredEmployeesList.map((emp) => {
                              const employeeTargetId = getEmployeeTargetId(emp);
                              const isSelected =
                                selectedEmployees.includes(employeeTargetId);
                              return (
                                <div
                                  key={emp.id}
                                  onClick={() =>
                                    toggleSelectEmployee(employeeTargetId)
                                  }
                                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                      ? "bg-indigo-50 border-indigo-100"
                                      : "hover:bg-white hover:shadow-sm border-transparent"
                                  } border`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                                        isSelected
                                          ? "bg-emerald-600"
                                          : "bg-gray-400"
                                      }`}
                                    >
                                      {emp.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                    </div>
                                    <div>
                                      <p
                                        className={`text-sm font-semibold ${isSelected ? "text-indigo-900" : "text-gray-700"}`}
                                      >
                                        {emp.name}
                                      </p>
                                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                        {emp.department ||
                                          emp.postApplied ||
                                          "Other"}
                                      </p>
                                    </div>
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "bg-white border-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <CheckCircle className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-xs text-gray-400 italic">
                                No employees found matching "
                                {searchTermEmployees}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Attach File or Image
                      </label>
                      {generalForm.attachmentPreview && (
                        <button
                          onClick={removeAttachment}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="mt-1">
                      <label className="cursor-pointer bg-white border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 w-fit group">
                        <ImageIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Choose file
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleFileAttach}
                        />
                      </label>
                      {generalForm.attachmentPreview && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
                          <Paperclip className="h-3.5 w-3.5" />
                          <span className="truncate max-w-50">
                            {generalForm.attachment?.name}
                          </span>
                        </div>
                      )}
                      {showAttachPreview &&
                        generalForm.attachmentPreview &&
                        generalForm.attachment?.type?.startsWith("image/") && (
                          <div className="mt-3 relative w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md hover:scale-105 transition-transform">
                            <img
                              src={generalForm.attachmentPreview}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </div>


                <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-inner sticky top-24">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-emerald-500" />
                      Live Preview
                    </h3>
                    {lastSaved && (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100 italic">
                        <Save className="h-2.5 w-2.5" />
                        Saved at{" "}
                        {lastSaved.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    )}
                    {isAutoSaving && (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 animate-pulse">
                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                        Auto-saving...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border shadow-sm flex items-center gap-1">
                      <Zap className="h-3 w-3" /> real-time
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={`bg-linear-to-br ${getPriorityColor()} p-2 rounded-xl shadow-md`}
                      >
                        <Briefcase className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        General
                      </span>
                      {generalForm.priority !== "normal" && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            generalForm.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {generalForm.priority} priority
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 wrap-break-word">
                      {generalForm.title || " Your announcement title"}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-5">
                      {generalForm.description ||
                        "Preview of your announcement will appear here as you type..."}
                    </p>
                    <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(
                            generalForm.scheduleDate +
                              "T" +
                              generalForm.scheduleTime,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {selectedEmployees.length === employees.length &&
                          employees.length > 0
                            ? "All Employees"
                            : `${selectedEmployees.length} selected`}
                        </span>
                      </div>
                    </div>
                    {generalForm.attachmentPreview && (
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center gap-2 text-xs text-emerald-500 font-medium">
                        <Paperclip className="h-3 w-3" /> 1 attachment ready
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="flex-1 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isPublishing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Publish
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === "holiday" && (
            <div className="p-6 md:p-8 lg:p-10">
              {selectedHoliday === null ? (

                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-amber-100 rounded-xl">
                          <Gift className="h-5 w-5 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                          Upcoming Holidays
                        </h2>
                      </div>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" /> Click on any
                        holiday to create an announcement
                      </p>
                    </div>
                    <div className="bg-linear-to-br from-amber-100 to-orange-100 p-3 rounded-2xl shadow-sm">
                      <CalendarDays className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {loadingHolidays ? (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                        <RefreshCw className="h-10 w-10 animate-spin text-emerald-500" />
                        <p className="font-medium">
                          Fetching upcoming holidays...
                        </p>
                      </div>
                    ) : holidays.length > 0 ? (
                      holidays.map((holiday) => {
                        const IconComponent = holiday.icon || Gift;
                        return (
                          <div
                            key={holiday.id}
                            onClick={() => handleSelectHoliday(holiday)}
                            className="group cursor-pointer bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-1"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`p-2 rounded-xl bg-linear-to-r ${holiday.color} shadow-md`}
                                  >
                                    <IconComponent className="h-4 w-4 text-white" />
                                  </div>
                                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-amber-600 transition-colors">
                                    {holiday.name}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    {holiday.date} ({holiday.day})
                                  </span>
                                </div>
                                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                  {holiday.type}
                                </span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                              {holiday.description}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                        <Calendar className="h-10 w-10" />
                        <p className="font-medium">
                          No upcoming holidays found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (

                <div className="animate-fadeIn">
                  <button
                    onClick={backToHolidayList}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-4 py-2 rounded-xl transition-all hover:bg-amber-100 group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
                    Back to holidays
                  </button>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="bg-linear-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border-l-4 border-amber-400">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const HolidayIcon = selectedHoliday.icon || Gift;
                            return (
                              <HolidayIcon className="h-6 w-6 text-amber-600" />
                            );
                          })()}
                          <div>
                            <span className="font-semibold text-gray-800">
                              Creating announcement for:
                            </span>
                            <p className="text-sm text-amber-700 font-medium">
                              {selectedHoliday.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Announcement Type
                        </label>
                        <div className="flex gap-3">
                          <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold border border-amber-200 flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" /> Holiday
                          </span>
                          <span className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm border border-gray-200 flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" /> General
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={holidayTitle}
                          onChange={(e) => setHolidayTitle(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-gray-50 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows="4"
                          value={holidayDescription}
                          onChange={(e) =>
                            setHolidayDescription(e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-gray-50 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="bg-linear-to-r from-gray-50 to-white p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 gap-2 items-center">
                          <Clock className="h-4 w-4 text-amber-500" /> Schedule
                          Announcement
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 font-medium">
                              DATE
                            </label>
                            <input
                              type="date"
                              value={holidayScheduleDate}
                              onChange={(e) =>
                                setHolidayScheduleDate(e.target.value)
                              }
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-medium">
                              TIME
                            </label>
                            <input
                              type="time"
                              value={holidayScheduleTime}
                              onChange={(e) =>
                                setHolidayScheduleTime(e.target.value)
                              }
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl mt-1 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                          Announcement will be published at selected time.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Send To
                        </label>
                        <div className="space-y-4">

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={toggleSelectAll}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                selectedEmployees.length === employees.length &&
                                employees.length > 0
                                  ? "bg-amber-500 border-amber-500 text-white shadow-md"
                                  : "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-semibold">
                                All Employees ({employees.length})
                              </span>
                              {selectedEmployees.length === employees.length &&
                                employees.length > 0 && (
                                  <CheckCircle className="h-3.5 w-3.5 ml-1" />
                                )}
                            </button>

                            {Object.entries(departments).map(
                              ([dept, count]) => {
                                const deptEmployeeIds = employees
                                  .filter(
                                    (emp) =>
                                      (emp.department ||
                                        emp.postApplied ||
                                        "Other") === dept,
                                  )
                                  .map(getEmployeeTargetId)
                                  .filter(Boolean);
                                const isFullySelected = deptEmployeeIds.every(
                                  (id) => selectedEmployees.includes(id),
                                );

                                return (
                                  <button
                                    key={dept}
                                    onClick={() => toggleSelectDepartment(dept)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                      isFullySelected
                                        ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-gray-50"
                                    }`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${isFullySelected ? "bg-white" : "bg-amber-400"}`}
                                    ></div>
                                    <span className="truncate max-w-30">
                                      {dept} ({count})
                                    </span>
                                  </button>
                                );
                              },
                            )}
                          </div>


                          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Select Individual Employees
                              </span>
                              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                {selectedEmployees.length} selected
                              </span>
                            </div>

                            <div className="relative mb-3">
                              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search by name or department..."
                                value={searchTermEmployees}
                                onChange={(e) =>
                                  setSearchTermEmployees(e.target.value)
                                }
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white transition-all"
                              />
                            </div>

                            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                              {filteredEmployeesList.length > 0 ? (
                                filteredEmployeesList.map((emp) => {
                                  const employeeTargetId =
                                    getEmployeeTargetId(emp);
                                  const isSelected =
                                    selectedEmployees.includes(
                                      employeeTargetId,
                                    );
                                  return (
                                    <div
                                      key={emp.id}
                                      onClick={() =>
                                        toggleSelectEmployee(employeeTargetId)
                                      }
                                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                          ? "bg-amber-50 border-amber-100"
                                          : "hover:bg-white hover:shadow-sm border-transparent"
                                      } border`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                                            isSelected
                                              ? "bg-amber-500"
                                              : "bg-gray-400"
                                          }`}
                                        >
                                          {emp.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                        </div>
                                        <div>
                                          <p
                                            className={`text-sm font-semibold ${isSelected ? "text-amber-900" : "text-gray-700"}`}
                                          >
                                            {emp.name}
                                          </p>
                                          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                            {emp.department ||
                                              emp.postApplied ||
                                              "Other"}
                                          </p>
                                        </div>
                                      </div>
                                      <div
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                          isSelected
                                            ? "bg-amber-500 border-amber-500 text-white"
                                            : "bg-white border-gray-300"
                                        }`}
                                      >
                                        {isSelected && (
                                          <CheckCircle className="h-3.5 w-3.5" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-6">
                                  <p className="text-xs text-gray-400 italic">
                                    No employees found matching "
                                    {searchTermEmployees}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Attach File or Image (optional)
                        </label>
                        <label className="cursor-pointer bg-white border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-xl px-5 py-3 inline-flex items-center gap-2 text-sm hover:bg-gray-50 transition-all group">
                          <ImageIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />{" "}
                          Upload
                          <input type="file" className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 sticky top-24">
                      <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-amber-500" /> Preview
                      </h3>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-linear-to-br from-amber-500 to-orange-500 p-2 rounded-xl shadow-md">
                            <Gift className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            Holiday
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">
                          {holidayTitle || "Holiday announcement"}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {holidayDescription || "Preview will appear here"}
                        </p>
                        <div className="border-t pt-4 flex text-xs text-gray-400 justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Scheduled: {holidayScheduleDate || "Select date"}{" "}
                              at {holidayScheduleTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {selectedEmployees.length === employees.length &&
                              employees.length > 0
                                ? "All Employees"
                                : `${selectedEmployees.length} selected`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handlePublishHolidayAnnouncement}
                          className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Send className="h-4 w-4" /> Publish
                        </button>
                        <button
                          onClick={handleCancelHoliday}
                          className="flex-1 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {activeTab === "history" && (
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <History className="h-5 w-5 text-slate-600" />
                    Announcement History
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage and view your previously created announcements
                  </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
                  <button
                    onClick={() => setHistoryFilter("active")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      historyFilter === "active"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setHistoryFilter("draft")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      historyFilter === "draft"
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Drafts
                  </button>
                </div>
              </div>

              {loadingAnnouncements ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                  <RefreshCw className="h-10 w-10 animate-spin text-indigo-500" />
                  <p className="font-medium italic">Loading history...</p>
                </div>
              ) : announcementsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {announcementsList.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-slate-200 hover:border-l-indigo-500 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              item.priority === "high"
                                ? "bg-red-50 text-red-500"
                                : item.priority === "medium"
                                  ? "bg-amber-50 text-amber-500"
                                  : "bg-indigo-50 text-indigo-500"
                            }`}
                          >
                            {item.priority || "Normal"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed mb-4 italic">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm ${
                                  i === 1
                                    ? "bg-indigo-400"
                                    : i === 2
                                      ? "bg-amber-400"
                                      : "bg-slate-400"
                                }`}
                              >
                                {String.fromCharCode(64 + i)}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold ml-1">
                            {JSON.parse(item.send_to || "[]").length} recipients
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {has("hrms.message.announcement.create") && item.status === "draft" && (
                            <button
                              onClick={() => handleEditDraft(item)}
                              className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"
                              title="Edit Draft"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {has("hrms.message.announcement.create") && (
                            <button
                              className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center gap-4 text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl mx-auto max-w-lg bg-gray-50/30">
                  <div className="p-5 bg-white rounded-full shadow-lg border border-gray-50">
                    <History className="h-10 w-10 text-gray-200" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-500">
                      No {historyFilter} announcements
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-50">
                      Start by creating a new announcement in the other tabs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        <div className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Manage company announcements</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            <span>All employees receive notifications</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            <span>Real-time updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Announcement;
