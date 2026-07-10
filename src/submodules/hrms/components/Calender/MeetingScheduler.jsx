import axios from "axios";
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePermission } from "../../../../hooks/usePermission";
import useAuth from "../../../../hooks/useAuth";

const MeetingScheduler = () => {
  const [meetings, setMeetings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    mode: "All",
    date: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const { user, token: authToken } = useAuth();
  const { has } = usePermission();
  const token = authToken;
  const companyId = user?.company_id;
  const slug = user?.slug;

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    mode: "online",
    location: "",
    meetingLink: "",
    organizer: user?.name || "Admin",
    attendees: [],
    department: "",
    priority: "medium",
    status: "scheduled",
    reminder: true,
    recurring: false,
    recurringPattern: "none",
    notes: "",
  });

  const [employees, setEmployees] = useState([]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  useEffect(() => {
    if (companyId && slug) {
      fetchEmployees();
      fetchMeetings();
    }
  }, [companyId, slug]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/${slug}`,
        {
          params: { company_id: companyId, slug },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setEmployees(
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || [],
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
      showSnackbar("Failed to fetch employees", "error");
    }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/meetings`,
        {
          params: { company_id: companyId, slug },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMeetings(response.data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      showSnackbar("Failed to fetch meetings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAttendee = (employee) => {
    if (!newMeeting.attendees.some((a) => a.id === employee.id)) {
      setNewMeeting((prev) => ({
        ...prev,
        attendees: [...prev.attendees, employee.id],
      }));
    }
    setShowEmployeeDropdown(false);
    setSearchEmployee("");
  };

  const removeAttendee = (employeeId) => {
    setNewMeeting((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((id) => id !== employeeId),
    }));
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : `Employee #${employeeId}`;
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!has("hrms.calendar.meeting.create")) {
      showSnackbar(
        "Access Denied: You do not have permission to schedule meetings.",
        "error",
      );
      return;
    }

    try {
      const meetingData = {
        company_id: companyId,
        slug,
        title: newMeeting.title,
        description: newMeeting.description || null,
        date: newMeeting.date,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime || null,
        mode: newMeeting.mode,
        location: newMeeting.location || null,
        meetingLink: newMeeting.meetingLink || null,
        organizer: newMeeting.organizer,
        department: newMeeting.department || null,
        attendees: newMeeting.attendees,
        notes: newMeeting.notes || null,
        priority: newMeeting.priority,
        status: "scheduled",
        reminder: newMeeting.reminder,
        recurring: newMeeting.recurring,
        recurringPattern: newMeeting.recurringPattern,
        createdBy: user.id,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/meetings`,
        meetingData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        showSnackbar("Meeting scheduled successfully", "success");
        fetchMeetings();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to schedule meeting",
        "error",
      );
    }
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    if (!has("hrms.calendar.meeting.create")) {
      showSnackbar(
        "Access Denied: You do not have permission to update meetings.",
        "error",
      );
      return;
    }

    try {
      const meetingData = {
        title: selectedMeeting.title,
        description: selectedMeeting.description,
        date: selectedMeeting.date,
        startTime: selectedMeeting.startTime,
        endTime: selectedMeeting.endTime,
        mode: selectedMeeting.mode,
        location: selectedMeeting.location,
        meetingLink: selectedMeeting.meetingLink,
        organizer: selectedMeeting.organizer,
        department: selectedMeeting.department,
        attendees: selectedMeeting.attendees,
        notes: selectedMeeting.notes,
        priority: selectedMeeting.priority,
        status: selectedMeeting.status,
        reminder: selectedMeeting.reminder,
        recurring: selectedMeeting.recurring,
        recurringPattern: selectedMeeting.recurringPattern,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/meetings/${selectedMeeting.id}?company_id=${companyId}&slug=${slug}`,
        meetingData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        showSnackbar("Meeting updated successfully", "success");
        fetchMeetings();
        setShowEditModal(false);
        setSelectedMeeting(null);
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to update meeting",
        "error",
      );
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!has("hrms.calendar.meeting.create")) {
      showSnackbar(
        "Access Denied: You do not have permission to cancel meetings.",
        "error",
      );
      return;
    }
    if (window.confirm("Are you sure you want to cancel this meeting?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/meetings/${meetingId}?company_id=${companyId}&slug=${slug}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.data.success) {
          showSnackbar("Meeting cancelled successfully", "success");
          fetchMeetings();
        }
      } catch (error) {
        console.error("Error deleting meeting:", error);
        showSnackbar(
          error.response?.data?.error || "Failed to cancel meeting",
          "error",
        );
      }
    }
  };

  const resetForm = () => {
    setNewMeeting({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      mode: "online",
      location: "",
      meetingLink: "",
      organizer: user?.name || "Admin",
      attendees: [],
      department: "",
      priority: "medium",
      status: "scheduled",
      reminder: true,
      recurring: false,
      recurringPattern: "none",
      notes: "",
    });
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 3000);
  };

  const filteredMeetings = (Array.isArray(meetings) ? meetings : []).filter(
    (meeting) => {
      if (!meeting) return false;

      const searchMatch =
        (meeting.title?.toLowerCase() || "").includes(
          filters.search.toLowerCase(),
        ) ||
        (meeting.description?.toLowerCase() || "").includes(
          filters.search.toLowerCase(),
        ) ||
        (meeting.organizer?.toLowerCase() || "").includes(
          filters.search.toLowerCase(),
        );

      const statusMatch =
        filters.status === "All" || (meeting.status || "") === filters.status;
      const modeMatch =
        filters.mode === "All" || (meeting.mode || "") === filters.mode;
      const dateMatch = !filters.date || (meeting.date || "") === filters.date;

      return searchMatch && statusMatch && modeMatch && dateMatch;
    },
  );

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Scheduled
          </span>
        );
      case "ongoing":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Ongoing
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status || "Unknown"}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    try {
      return timeString.substring(0, 5);
    } catch (error) {
      return "--:--";
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {snackbar.open && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn ${
            snackbar.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {snackbar.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{snackbar.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Meeting Scheduler
            </h1>
            <p className="text-gray-600 mt-1">
              Schedule and manage meetings with employees
            </p>
          </div>
          <button
            onClick={() => {
              if (!has("hrms.calendar.meeting.create")) {
                showSnackbar(
                  "Access Denied: You do not have permission to schedule meetings.",
                  "error",
                );
                return;
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-600 to-indigo-600 text-white rounded-lg hover:from-emerald-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Schedule Meeting
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search meetings..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {filteredMeetings.length} of {meetings.length} meetings
            </p>
            <button
              onClick={() =>
                setFilters({ search: "", status: "All", mode: "All", date: "" })
              }
              className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting?.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-4 border-b border-gray-100 bg-linear-to-r from-emerald-50 to-indigo-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {meeting?.mode === "online" ? (
                        <Video className="text-emerald-600" size={20} />
                      ) : meeting?.mode === "hybrid" ? (
                        <Users className="text-purple-600" size={20} />
                      ) : (
                        <MapPin className="text-green-600" size={20} />
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {meeting?.title || "Untitled Meeting"}
                      </h3>
                    </div>
                    {getStatusBadge(meeting?.status)}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{formatDate(meeting?.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>
                      {formatTime(meeting?.startTime)} -{" "}
                      {formatTime(meeting?.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>Organized by: {meeting?.organizer || "Unknown"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{meeting?.attendees?.length || 0} Attendees</span>
                  </div>

                  {meeting?.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{meeting.location}</span>
                    </div>
                  )}

                  {meeting?.meetingLink && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video size={16} className="text-emerald-600" />
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline truncate max-w-50"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(meeting?.priority)}`}
                    >
                      {capitalizeFirstLetter(meeting?.priority) ||
                        "No Priority"}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowDetailsModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="View Details"
                      >
                        <CalendarCheck size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (!has("hrms.calendar.meeting.create")) {
                            showSnackbar(
                              "Access Denied: You do not have permission to edit meetings.",
                              "error",
                            );
                            return;
                          }
                          setSelectedMeeting(meeting);
                          setShowEditModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(meeting?.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Cancel Meeting"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredMeetings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <CalendarDays className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Meetings Found
            </h3>
            <p className="text-gray-500 mb-4">
              Schedule your first meeting to get started
            </p>
            <button
              onClick={() => {
                if (!has("hrms.calendar.meeting.create")) {
                  showSnackbar(
                    "Access Denied: You do not have permission to schedule meetings.",
                    "error",
                  );
                  return;
                }
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus size={20} />
              Schedule Meeting
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-emerald-600 to-indigo-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                Schedule New Meeting
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newMeeting.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Weekly Sync, Project Review, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newMeeting.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Meeting agenda, objectives, etc."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Date & Time
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newMeeting.date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={newMeeting.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Engineering, HR, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={newMeeting.startTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Meeting Mode
                </h3>

                <div className="flex gap-4">
                  {["online", "offline", "hybrid"].map((mode) => (
                    <label key={mode} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mode"
                        value={mode}
                        checked={newMeeting.mode === mode}
                        onChange={handleInputChange}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {mode}
                      </span>
                    </label>
                  ))}
                </div>

                {(newMeeting.mode === "offline" ||
                  newMeeting.mode === "hybrid") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newMeeting.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Conference Room A, Building 2, etc."
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={newMeeting.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendees
                </h3>

                <div className="relative">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchEmployee}
                      onChange={(e) => {
                        setSearchEmployee(e.target.value);
                        setShowEmployeeDropdown(true);
                      }}
                      onFocus={() => setShowEmployeeDropdown(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Search employees to add..."
                    />
                  </div>

                  {showEmployeeDropdown && searchEmployee && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {employees
                        .filter(
                          (emp) =>
                            emp.name
                              ?.toLowerCase()
                              .includes(searchEmployee.toLowerCase()) ||
                            emp.email
                              ?.toLowerCase()
                              .includes(searchEmployee.toLowerCase()),
                        )
                        .map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => handleAddAttendee(emp)}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {emp.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {emp.email} •{" "}
                                {emp.department || "No department"}
                              </p>
                            </div>
                          </div>
                        ))}
                      {employees.filter((emp) =>
                        emp.name
                          ?.toLowerCase()
                          .includes(searchEmployee.toLowerCase()),
                      ).length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No employees found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {newMeeting.attendees.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Attendees:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {newMeeting.attendees.map((attendeeId) => {
                        const employee = employees.find(
                          (emp) => emp.id === attendeeId,
                        );
                        return (
                          <div
                            key={attendeeId}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                          >
                            <User size={14} />
                            <span>
                              {employee?.name || `Employee #${attendeeId}`}
                            </span>
                            <button
                              onClick={() => removeAttendee(attendeeId)}
                              className="hover:text-red-600"
                              type="button"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={newMeeting.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Any additional information for attendees..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="reminder"
                  checked={newMeeting.reminder}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, reminder: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm text-gray-700">
                  Send reminder notifications to attendees
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="recurring"
                  checked={newMeeting.recurring}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      recurring: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm text-gray-700">
                  Recurring meeting
                </label>
              </div>

              {newMeeting.recurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurring Pattern
                  </label>
                  <select
                    name="recurringPattern"
                    value={newMeeting.recurringPattern}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Meeting Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedMeeting?.title || "Untitled Meeting"}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(selectedMeeting?.status)}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMeeting?.priority)}`}
                  >
                    {capitalizeFirstLetter(selectedMeeting?.priority) ||
                      "No Priority"}
                  </span>
                </div>
              </div>

              {selectedMeeting?.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedMeeting.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} />
                    <span className="text-sm">
                      Date: {formatDate(selectedMeeting?.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={18} />
                    <span className="text-sm">
                      Time: {formatTime(selectedMeeting?.startTime)} -{" "}
                      {formatTime(selectedMeeting?.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={18} />
                    <span className="text-sm">
                      Organizer: {selectedMeeting?.organizer || "Unknown"}
                    </span>
                  </div>

                  {selectedMeeting?.department && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 size={18} />
                      <span className="text-sm">
                        Department: {selectedMeeting.department}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    {selectedMeeting?.mode === "online" ? (
                      <Video size={18} className="text-emerald-600" />
                    ) : selectedMeeting?.mode === "hybrid" ? (
                      <Users size={18} className="text-purple-600" />
                    ) : (
                      <MapPin size={18} className="text-green-600" />
                    )}
                    <span className="text-sm capitalize">
                      Mode: {selectedMeeting?.mode || "Not specified"}
                    </span>
                  </div>

                  {selectedMeeting?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} />
                      <span className="text-sm">
                        Location: {selectedMeeting.location}
                      </span>
                    </div>
                  )}

                  {selectedMeeting?.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Video size={18} className="text-emerald-600" />
                      <a
                        href={selectedMeeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        Join Meeting Link
                      </a>
                    </div>
                  )}

                  {selectedMeeting?.recurring &&
                    selectedMeeting.recurringPattern !== "none" && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <RefreshCw size={18} />
                        <span className="text-sm capitalize">
                          Recurring: {selectedMeeting.recurringPattern}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={18} />
                  Attendees ({selectedMeeting?.attendees?.length || 0})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedMeeting?.attendees?.map((attendeeId, index) => {
                    const employee = employees.find(
                      (emp) => emp.id === attendeeId,
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <User size={14} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {employee?.name || `Employee #${attendeeId}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {employee?.email || "No email"}
                            </p>
                          </div>
                        </div>
                        <button
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Send Email"
                          onClick={() =>
                            (window.location.href = `mailto:${employee?.email}`)
                          }
                        >
                          <Mail size={14} className="text-gray-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedMeeting?.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Additional Notes
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedMeeting.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (!has("hrms.calendar.meeting.create")) {
                      showSnackbar(
                        "Access Denied: You do not have permission to edit meetings.",
                        "error",
                      );
                      return;
                    }
                    setShowDetailsModal(false);
                    setSelectedMeeting(selectedMeeting);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200"
                >
                  Edit Meeting
                </button>
                <button
                  onClick={() => {
                    showSnackbar(
                      "Calendar invitation sent to attendees",
                      "success",
                    );
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200"
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Meeting</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMeeting(null);
                }}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateMeeting} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={selectedMeeting.title || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        title: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={selectedMeeting.description || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedMeeting.date || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={selectedMeeting.department || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={selectedMeeting.startTime || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={selectedMeeting.endTime || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode
                </label>
                <select
                  value={selectedMeeting.mode || "online"}
                  onChange={(e) =>
                    setSelectedMeeting({
                      ...selectedMeeting,
                      mode: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {selectedMeeting.mode === "online" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={selectedMeeting.meetingLink || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        meetingLink: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={selectedMeeting.location || ""}
                    onChange={(e) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={selectedMeeting.priority || "medium"}
                  onChange={(e) =>
                    setSelectedMeeting({
                      ...selectedMeeting,
                      priority: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={selectedMeeting.notes || ""}
                  onChange={(e) =>
                    setSelectedMeeting({
                      ...selectedMeeting,
                      notes: e.target.value,
                    })
                  }
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-linear-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600"
                >
                  Update Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMeeting(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MeetingScheduler;
