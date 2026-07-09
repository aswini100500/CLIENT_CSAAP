import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import parse from "html-react-parser";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Bell,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  Flag,
  History,
  Info,
  List,
  MessageSquare,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Trash2,
  User,
  Users,
  X,
  Zap
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useSelector } from "react-redux";
import useAuth from "../../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ToDoList from "../ToDoList/ToDoList";

const renderRichText = (html) => {
  if (!html) return null;

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

  return <div className="rich-text-content">{parse(html, options)}</div>;
};

const Task = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("task");
  const [taskActiveTab, setTaskActiveTab] = useState("Pending");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [newNotifications, setNewNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  // Table filtering states
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [tableDateFilter, setTableDateFilter] = useState("");
  const [tableProjectFilter, setTableProjectFilter] = useState("");
  const [tableAssignByFilter, setTableAssignByFilter] = useState("");
  const [activeStatFilter, setActiveStatFilter] = useState("All");
  const [tableStatusFilter, setTableStatusFilter] = useState("");
  const [tableDeadlineFilter, setTableDeadlineFilter] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
  ];

  const completedCount =
    viewingTask?.subtasks?.filter((st) => st.completed)?.length ?? 0;
  const totalCount = viewingTask?.subtasks?.length ?? 0;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [extensionApprovalDeadline, setExtensionApprovalDeadline] =
    useState("");
  const [showExtensionApproveModal, setShowExtensionApproveModal] =
    useState(false);
  const [selectedExtensionTask, setSelectedExtensionTask] = useState(null);
  const [showTransferApproveModal, setShowTransferApproveModal] =
    useState(false);
  const [selectedTransferTask, setSelectedTransferTask] = useState(null);
  const [showCannotCompleteApproveModal, setShowCannotCompleteApproveModal] =
    useState(false);
  const [selectedCannotCompleteTask, setSelectedCannotCompleteTask] =
    useState(null);
  const [cannotCompleteReassignTo, setCannotCompleteReassignTo] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  const { user, token: authToken } = useAuth();
  console.log(user);

  const isSuperAdmin =
    user?.role?.toLowerCase() === "superadmin" ||
    user?.role?.toLowerCase() === "admin" ||
    !user?.employee_id;
  const API = `${import.meta.env.VITE_HRMS_BASE_URL}`;
  const companyId = user?.company_id;
  console.log(companyId);

  const slug = user?.slug;
  const csaapToken = authToken;

  const getEmployeeNameById = useCallback(
    (id) => {
      if (!id) return "Unknown";
      if (String(id).toLowerCase() === "admin" || id === companyId)
        return "Superadmin";
      const employee = teamMembers.find((emp) => String(emp.id) === String(id));
      return employee ? employee.name : "Senior Manager BBSR";
    },
    [teamMembers, companyId],
  );

  const getEmployeeNamesByIds = useCallback(
    (ids = []) => {
      const names = (Array.isArray(ids) ? ids : [])
        .map((id) => getEmployeeNameById(id))
        .filter(Boolean);
      return names.length ? names.join(", ") : "Unknown";
    },
    [getEmployeeNameById],
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    tableSearchTerm,
    tableDateFilter,
    tableDeadlineFilter,
    tableProjectFilter,
    tableAssignByFilter,
    activeStatFilter,
    tableStatusFilter,
  ]);

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [activeChatTask, setActiveChatTask] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const [formData, setFormData] = useState({
    task: "",
    project: "",
    priority: "",
    deadlineDate: "",
    remark: "",
    assignedTo: [],
    subtasks: [{ name: "", completed: false }],
  });

  const priorityOptions = ["Low", "Medium", "High"];
  const statusOptions = [
    "Pending",
    "In Progress",
    "Completed",
    "Blocked",
    "Extension Pending",
    "Extended",
    "Transferred",
    "Cannot Complete",
    "Not Completed",
    "Pending Approval",
    "Transferred",
  ];

  // Show snackbar notification
  const showSnackbar = (message, type = "info") => {
    setSnackbar({ open: true, message, type });

    // Auto hide after 5 seconds
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 5000);
  };

  // Helper functions for assignees
  const toggleAssignee = (id) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(id)
        ? prev.assignedTo.filter((assignedId) => assignedId !== id)
        : [...prev.assignedTo, id],
    }));
    setShowAssigneesDropdown(false); // Close dropdown after selection
  };

  const selectAllAssignees = () => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: teamMembers.map((m) => m.id),
    }));
    setShowAssigneesDropdown(false); // Close dropdown after selection
  };

  const clearAllAssignees = () => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: [],
    }));
    setShowAssigneesDropdown(false); // Close dropdown after clearing
  };

  const removeAssignee = (id) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((assignedId) => assignedId !== id),
    }));
  };

  // Subtask functions
  const addSubtask = () => {
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { name: "", completed: false }],
    }));
  };

  const removeSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleSubtaskChange = (index, value) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index].name = value;
    setFormData((prev) => ({ ...prev, subtasks: newSubtasks }));
  };

  const handleSubtaskToggle = async (taskId, subtaskId) => {
    // Implementation for toggling subtask completion
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st,
      );
      try {
        await axios.put(`${API}/api/tasks/${taskId}`, {
          ...task,
          subtasks: updatedSubtasks,
        });
        await fetchTasks();
        showSnackbar("Subtask updated", "success");
      } catch (err) {
        showSnackbar("Failed to update subtask", "error");
      }
    }
  };

  const handleReassign = (task) => {
    setEditingTask(task);
    setIsReassigning(true);
    setFormData({
      task: task.task || task.title || "",
      assignedTo: task.assignedTo || [],
      deadlineDate: "",
      priority: task.priority || "",
      remark: "Transferred Task",
      project: task.project || "",
      subtasks:
        task.subtasks && task.subtasks.length > 0
          ? task.subtasks.map((st) => ({
            name: st.name,
            completed: st.completed || false,
          }))
          : [{ name: "", completed: false }],
    });
    setViewingTask(null);
    setIsFormOpen(true);
    showSnackbar("Task ready for reassignment", "info");
  };

  const getStatusReasonDetails = (task) => {
    if (!task) return null;
    if (
      ["Cannot Complete", "Not Completed"].includes(task.status) &&
      task.notCompletedReason
    ) {
      return {
        label: "Cannot Complete Request",
        value: task.notCompletedReason,
        className: "border-red-200 bg-red-50",
      };
    }
    if (
      ["Transferred", "Transfer Pending"].includes(task.status) &&
      task.transferReason
    ) {
      return {
        label:
          task.status === "Transfer Pending"
            ? "Transfer Request"
            : "Transfer Reason",
        value: `${task.transferReason}${task.transferTo?.length ? `\n\nTransfer To: ${getEmployeeNamesByIds(task.transferTo)}` : ""}`,
        className: "border-blue-200 bg-blue-50",
      };
    }
    if (
      ["Extended", "Extension Pending"].includes(task.status) &&
      task.extensionReason
    ) {
      return {
        label: "Extension Reason",
        value: task.extensionReason,
        className: "border-yellow-200 bg-yellow-50",
      };
    }
    return null;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!csaapToken) return;

        const response = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
          {
            headers: {
              Authorization: `Bearer ${csaapToken}`,
            },
          },
        );

        const employeesData = response.data?.data || [];

        const colors = [
          "bg-blue-500",
          "bg-green-500",
          "bg-purple-500",
          "bg-pink-500",
          "bg-orange-500",
          "bg-indigo-500",
          "bg-red-500",
          "bg-teal-500",
          "bg-yellow-500",
          "bg-gray-500",
        ];

        const employees = employeesData.map((emp) => ({
          id: emp.id,
          name: emp.name,
          role: emp.postApplied || emp.department || "Employee",
          email: emp.email,
          officeEmail: emp.officeEmail || emp.office_email,
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
        }));

        setTeamMembers(employees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setTeamMembers([]);
        showSnackbar("Failed to fetch team members", "error");
      }
    };

    fetchEmployees();
  }, []);
  // Update the fetchProjects function in your Task component

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!csaapToken) {
          console.error("No authorization token found");
          showSnackbar("Authentication token missing", "error");
          return;
        }

        // Define the project sources matching your backend
        const PROJECT_SOURCES = [
          { path: "commercials", property_type: "commercial" },
          { path: "apartments", property_type: "apartment" },
          { path: "plottings", property_type: "plotting" },
          { path: "duplexes", property_type: "duplex" },
          { path: "triplexes", property_type: "triplex" },
          { path: "custom-projects", property_type: "custom_project" },
        ];

        const TENANT_API_BASE_URL = "https://csaapnodeapi.csaap.com/api/tenant";

        // Fetch all project sources in parallel
        const results = await Promise.allSettled(
          PROJECT_SOURCES.map(async ({ path, property_type }) => {
            const response = await axios.get(`${TENANT_API_BASE_URL}/${path}`, {
              headers: {
                Authorization: `Bearer ${csaapToken}`
              },
            });

            const projects = Array.isArray(response.data?.data) ? response.data.data : [];

            // Map projects with property type
            return projects.map((project) => ({
              id: project.id,
              name: project.name,
              property_type: property_type,
              display_type: project.type || property_type,
              locality: project.locality,
              city: project.city,
              composite_key: `${property_type}:${project.id}`,
              location: [project?.locality, project?.city].filter(Boolean).join(", ")
            }));
          })
        );

        // Combine all successful results
        const allProjects = results
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value)
          .filter(project => project.name) // Only include projects with names
          .sort((a, b) => a.name.localeCompare(b.name));

        setProjects(allProjects);

        if (allProjects.length === 0) {
          showSnackbar("No projects found", "warning");
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        showSnackbar("Failed to load projects", "error");
        setProjects([]);
      }
    };
    fetchProjects();
  }, [authToken, csaapToken]);

  const filteredTeamMembers = teamMembers
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const activeStatLabel =
    activeStatFilter === "All"
      ? "All Tasks"
      : activeStatFilter === "Approved"
        ? "Approved Tasks"
        : activeStatFilter === "Completed"
          ? "Completed Tasks"
          : activeStatFilter === "Incompleted"
            ? "Incomplete Tasks"
            : activeStatFilter === "Transferred"
              ? "Transferred Tasks"
              : activeStatFilter === "Rejected"
                ? "Rejected Tasks"
                : "Tasks";

  const fetchTasks = async () => {
    if (!slug) return;
    try {
      const res = await axios.get(`${API}/api/tasks`, {
        params: { slug: slug },
      });
      const data = res.data.map((t) => ({
        ...t,
        title: t.title || t.task || "Untitled Task",
        task: t.task || t.title || "Untitled Task",
        assignedTo: Array.isArray(t.assignedTo)
          ? t.assignedTo
          : JSON.parse(t.assignedTo || "[]"),
        transferTo: Array.isArray(t.transferTo)
          ? t.transferTo
          : JSON.parse(t.transferTo || "[]"),
        subtasks: Array.isArray(t.subtasks)
          ? t.subtasks
          : JSON.parse(t.subtasks || "[]"),

        // ✅ ADD THIS
        history: Array.isArray(t.history)
          ? t.history
          : JSON.parse(t.history || "[]"),

        deadlineDate: t.deadlineDate || t.dueDate,
        assignedDate: t.assignedDate || t.startDate || "",
      }));
      const sortedData = data.sort((a, b) => {
        const aTime = a.assignedDate ? new Date(a.assignedDate).getTime() : 0;
        const bTime = b.assignedDate ? new Date(b.assignedDate).getTime() : 0;
        if (bTime !== aTime) return bTime - aTime;
        return (b.id || 0) - (a.id || 0);
      });
      setTasks(sortedData);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [companyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExtensionAction = async (taskId, action, newDeadline) => {
    try {
      if (action === "Approve" && !newDeadline) {
        showSnackbar("Please provide a deadline to approve", "warning");
        return;
      }
      await axios.put(`${API}/api/tasks/extension-action/${taskId}`, {
        action,
        newDeadline,
        userId: user?.employee_id,
        role: user?.role,
      });
      await fetchTasks();
      showSnackbar(
        `Extension request ${action.toLowerCase()}d successfully`,
        "success",
      );
      setShowExtensionApproveModal(false);
      setSelectedExtensionTask(null);
      setExtensionApprovalDeadline("");
      setViewingTask(null);
    } catch (err) {
      console.error(err);
      showSnackbar(`Failed to ${action.toLowerCase()} extension`, "error");
    }
  };

  const handleTransferAction = async (taskId, action) => {
    try {
      await axios.put(`${API}/api/tasks/transfer-action/${taskId}`, {
        action,
        userId: user?.employee_id,
        role: user?.role,
      });
      await fetchTasks();
      showSnackbar(
        action === "Approve"
          ? "Transfer approved successfully"
          : "Transfer request rejected",
        action === "Approve" ? "success" : "warning",
      );
      setShowTransferApproveModal(false);
      setSelectedTransferTask(null);
      if (viewingTask?.id === taskId) {
        setViewingTask(null);
      }
    } catch (err) {
      console.error(err);
      showSnackbar(`Failed to ${action.toLowerCase()} transfer`, "error");
    }
  };

  const handleCannotCompleteAction = async (
    taskId,
    action,
    newAssignee = null,
  ) => {
    try {
      if (action === "Approve" && !newAssignee) {
        showSnackbar("Please select an employee to reassign", "warning");
        return;
      }

      await axios.put(`${API}/api/tasks/cannot-complete-action/${taskId}`, {
        action,
        newAssignee: action === "Approve" ? newAssignee : undefined,
        userId: user?.employee_id,
        role: user?.role,
      });

      await fetchTasks();
      showSnackbar(
        action === "Approve"
          ? "Cannot complete request approved and task reassigned"
          : "Cannot complete request rejected",
        action === "Approve" ? "success" : "warning",
      );
      setShowCannotCompleteApproveModal(false);
      setSelectedCannotCompleteTask(null);
      setCannotCompleteReassignTo("");
      setViewingTask(null);
    } catch (err) {
      console.error(err);
      showSnackbar(
        `Failed to ${action.toLowerCase()} cannot complete request`,
        "error",
      );
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // await axios.put(`${API}/api/tasks/${taskId}/status`, { status: newStatus });
      const task = tasks.find((t) => t.id === taskId);

      let updatedHistory = [...(task.history || [])];

      if (newStatus === "Completed") {
        updatedHistory.push({
          action: "completed",
          task: task.task,
          subtasks: task.subtasks,
          by: user?.employee_id,
          to: task.assignedTo,
          date: new Date().toISOString(),
        });
      }

      await axios.put(`${API}/api/tasks/${taskId}/status`, {
        status: newStatus,
        history: updatedHistory,
        userId: user?.employee_id || "Admin",
        role: user?.role,
      });
      await fetchTasks();
      if (viewingTask?.id === taskId) {
        setViewingTask((prev) => ({ ...prev, status: newStatus }));
      }
      showSnackbar("Status updated successfully", "success");
    } catch (err) {
      showSnackbar("Failed to update status", "error");
    }
  };

  // HANDLE SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!formData.task) {
      showSnackbar("Please enter task description", "error");
      return;
    }

    if (!formData.project) {
      showSnackbar("Please select a project", "error");
      return;
    }

    if (!formData.deadlineDate) {
      showSnackbar("Please select a deadline date", "error");
      return;
    }

    if (!formData.priority) {
      showSnackbar("Please select priority level", "error");
      return;
    }

    if (formData.assignedTo.length === 0) {
      showSnackbar("Please assign at least one team member", "error");
      return;
    }

    const assignedEmails = formData.assignedTo
      .map((id) => {
        const member = teamMembers.find((m) => m.id === id);
        return member ? member.officeEmail || member.email : null;
      })
      .filter((email) => email && email.trim() !== "");

    // ✅ ADD HERE (BEFORE payload)
    const uniqueTo = [...new Set(formData.assignedTo)];
    const filteredSubtasks = formData.subtasks.filter(
      (st) => st.name && st.name.trim() !== "",
    );

    const plainTextTask = formData.task
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const title =
      plainTextTask.substring(0, 50) + (plainTextTask.length > 50 ? "..." : "");

    const payload = {
      title: title,
      task: formData.task,
      project: formData.project,
      deadlineDate: formData.deadlineDate,
      priority: formData.priority,
      assignedBy: user?.employee_id || companyId,
      assignedDate: new Date().toISOString(),
      remark: formData.remark,
      subtasks: filteredSubtasks,
      company_id: companyId,
      emails: assignedEmails,
      slug: user?.slug,
      assignedTo: uniqueTo,
      status: editingTask ? "Transferred" : "Pending",

      history: editingTask
        ? [
          ...(editingTask.history || []),
          {
            status: editingTask.status || "Pending",
            action: "transferred",
            task: editingTask.task || editingTask.title || "",
            newTask: formData.task.trim(),
            project: editingTask.project || "",
            priority: editingTask.priority || "",
            deadlineDate:
              editingTask.deadlineDate || editingTask.dueDate || "",
            assignedDate:
              editingTask.assignedDate ||
              editingTask.createdAt?.split("T")[0] ||
              "",
            remark: editingTask.remark || "",
            subtasks: filteredSubtasks,
            by: user?.employee_id || "Admin",
            to: editingTask.assignedTo || [],
            reassignedTo: uniqueTo,
            remarks: formData.remark || editingTask.remark,
            previousCompletedDate: editingTask.completedDate || null,
            date: new Date().toISOString(),
          },
        ]
        : [
          {
            action: "assigned",
            task: formData.task.trim(),
            subtasks: filteredSubtasks,
            by: user?.employee_id || "Admin",
            to: uniqueTo,
            remarks: formData.remark || "Task assigned",
            date: new Date().toISOString(),
          },
        ],
    };

    setIsProcessing(true);
    try {
      if (editingTask) {
        await axios.put(`${API}/api/tasks/${editingTask.id}`, {
          ...payload,
          status: editingTask ? "Transferred" : "Pending",
        });
        showSnackbar("Task updated successfully!", "success");
      } else {
        await axios.post(`${API}/api/tasks`, payload);
        showSnackbar(
          "Task created successfully! Emails sent to assigned team members.",
          "success",
        );
      }
      await fetchTasks();
      setEditingTask(null);
      setIsReassigning(false);
      setIsFormOpen(false);
      setFormData({
        task: "",
        project: "",
        priority: "",
        deadlineDate: "",
        remark: "",
        assignedTo: [],
        subtasks: [{ name: "", completed: false }],
      });
    } catch (err) {
      console.error("Failed to save task", err);
      showSnackbar("Failed to save task", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (task) => {
    const validPriority = priorityOptions.includes(task.priority)
      ? task.priority
      : "Medium";
    setEditingTask(task);
    setFormData({
      task: task.task || task.title,
      assignedTo: task.assignedTo,
      deadlineDate: task.deadlineDate?.split("T")[0] || task.deadlineDate,
      priority: validPriority,
      remark: task.remark || "",
      project: task.project || "",
      subtasks:
        task.subtasks && task.subtasks.length > 0
          ? task.subtasks
          : [{ name: "", completed: false }],
    });
    setIsFormOpen(true);
  };

  const handleView = (task) => {
    setViewingTask(task);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API}/api/tasks/${id}`);
      await fetchTasks();
      showSnackbar("Task deleted successfully!", "warning");
    } catch (err) {
      showSnackbar("Failed to delete task", "error");
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setViewingTask(null);
    setFormData({
      task: "",
      project: "",
      priority: "",
      deadlineDate: "",
      remark: "",
      assignedTo: [],
      subtasks: [{ name: "", completed: false }],
    });
    setIsReassigning(false);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: user?.name || "Current User",
      message: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setMessage("");
    showSnackbar("Message sent", "info");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Pending Approval":
      case "In Progress":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "Blocked":
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Extension Pending":
      case "Extended":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Cannot Complete":
      case "Not Completed":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Transferred":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  const getMemberAvatarColor = (memberName) => {
    const member = teamMembers.find((m) => m.name === memberName);
    return member ? member.avatarColor : "bg-gray-500";
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const truncateWords = (str, num = 3) => {
    if (!str) return "";
    // Strip HTML tags for truncation
    const plainText = str.replace(/<[^>]*>/g, " ");
    const words = plainText.trim().split(/\s+/).filter(Boolean);
    if (words.length <= num) return plainText.trim();
    return words.slice(0, num).join(" ") + "...";
  };

  const taskTabs = [
    {
      id: "task",
      label: "Tasks",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-emerald-600",
    },
    {
      id: "todo",
      label: "To Do List",
      icon: <List className="w-5 h-5" />,
      color: "bg-emerald-600",
    },
  ];

  // Derived state: filtered tasks for the main table
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 0. Sub-tab Filter removed

      // 1. Stat Card Filter
      if (activeStatFilter === "Approved" && task.status !== "Approved")
        return false;
      if (activeStatFilter === "Completed" && task.status !== "Completed")
        return false;
      if (
        activeStatFilter === "Incompleted" &&
        !["Pending", "In Progress", "Blocked"].includes(task.status)
      )
        return false;
      if (
        activeStatFilter === "Requests" &&
        ![
          "Pending Approval",
          "Extension Pending",
          "Transfer Pending",
          "Cannot Complete Pending",
        ].includes(task.status)
      )
        return false;
      if (
        activeStatFilter === "Rejected" &&
        !["Cannot Complete", "Not Completed"].includes(task.status)
      )
        return false;
      if (
        activeStatFilter === "Transferred" &&
        !["Transferred", "Transfer Pending"].includes(task.status)
      )
        return false;

      // 2. Text Search Filter
      if (tableSearchTerm) {
        const search = tableSearchTerm.toLowerCase();
        const taskTitle = (task.task || task.title || "").toLowerCase();
        const project = (task.project || "").toLowerCase();
        const assignedBy = getEmployeeNameById(task.assignedBy).toLowerCase();
        const priority = (task.priority || "").toLowerCase();
        const status = (task.status || "").toLowerCase();

        // Search across all assignedTo member names
        const assignedToNames = (
          Array.isArray(task.assignedTo) ? task.assignedTo : []
        )
          .map((id) => getEmployeeNameById(id).toLowerCase())
          .join(" ");

        if (
          !taskTitle.includes(search) &&
          !project.includes(search) &&
          !assignedBy.includes(search) &&
          !priority.includes(search) &&
          !status.includes(search) &&
          !assignedToNames.includes(search)
        ) {
          return false;
        }
      }

      // 3. Date Filter
      if (tableDateFilter) {
        if (!task.assignedDate) return false;
        const d = new Date(task.assignedDate);
        if (isNaN(d.getTime())) return false;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const taskDate = `${year}-${month}-${day}`;
        if (taskDate !== tableDateFilter) return false;
      }

      // 4. Project Filter
      if (tableProjectFilter && task.project !== tableProjectFilter) {
        return false;
      }

      // 5. Assign By Filter
      if (
        tableAssignByFilter &&
        String(task.assignedBy) !== String(tableAssignByFilter)
      ) {
        return false;
      }

      // 6. Status Filter
      if (tableStatusFilter && task.status !== tableStatusFilter) {
        return false;
      }

      // 7. Deadline Filter
      if (tableDeadlineFilter) {
        if (!task.deadlineDate) return false;
        const d = new Date(task.deadlineDate);
        if (isNaN(d.getTime())) return false;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const deadlineDateStr = `${year}-${month}-${day}`;
        if (deadlineDateStr !== tableDeadlineFilter) return false;
      }

      return true;
    });
  }, [
    tasks,
    taskActiveTab,
    activeStatFilter,
    tableSearchTerm,
    tableDateFilter,
    tableProjectFilter,
    tableAssignByFilter,
    tableStatusFilter,
    tableDeadlineFilter,
    getEmployeeNameById,
  ]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  return (
    <div className="crm-module-root flex flex-col min-h-screen w-full">
      <div className="app-shell flex-1 p-4 transition-all duration-300 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="app-title max-w-3xl">Task Management</h1>
              <p className="app-subtitle mt-1">
                Track, assign and collaborate on team tasks
              </p>
            </div>
            {activeTab === "task" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/hrms/archived-tasks")}
                  className="app-btn-secondary flex items-center gap-2 text-sm cursor-pointer"
                  title="View Archived Tasks"
                >
                  <Archive className="w-4 h-4 text-(--text-soft)" />
                  Archive
                </button>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="app-btn-primary flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Assign New Task
                </button>
              </div>
            )}
          </div>

          <div className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-(--border-soft) mb-6" style={{ background: "color-mix(in srgb, var(--bg-app) 94%, white)" }}>
            <div className="flex items-center gap-2 overflow-x-auto">
              {taskTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tab.id === "task" ? tasks.length : null;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                      ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                      : "bg-white/88 border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
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
                    <span className="w-4 h-4 flex items-center justify-center">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {count !== null && (
                      <span
                        className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold tracking-[-0.01em] ${isActive
                          ? "bg-white/16 text-white border border-white/10"
                          : "bg-(--bg-subtle) text-(--text-soft)"
                          }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "task" ? (
                <>
                  {/* Stats Cards - Interactive Filtering */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {[
                      {
                        id: "All",
                        label: "Total Tasks",
                        value: tasks.length,
                        icon: <FileText className="w-4 h-4 text-indigo-600" />,
                        bg: "bg-indigo-50 border-indigo-100",
                        activeColor: "border-indigo-400 ring-2 ring-indigo-100",
                      },
                      {
                        id: "Approved",
                        label: "Approved",
                        value: tasks.filter((t) => t.status === "Approved")
                          .length,
                        icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
                        bg: "bg-emerald-50 border-emerald-100",
                        activeColor: "border-emerald-400 ring-2 ring-emerald-100",
                      },
                      {
                        id: "Completed",
                        label: "Completed",
                        value: tasks.filter((t) => t.status === "Completed")
                          .length,
                        icon: <Check className="w-4 h-4 text-sky-600" />,
                        bg: "bg-sky-50 border-sky-100",
                        activeColor: "border-sky-400 ring-2 ring-sky-100",
                      },
                      {
                        id: "Incompleted",
                        label: "Incompleted",
                        value: tasks.filter((t) =>
                          ["Pending", "In Progress", "Blocked"].includes(
                            t.status,
                          ),
                        ).length,
                        icon: <Clock className="w-4 h-4 text-amber-600" />,
                        bg: "bg-amber-50 border-amber-100",
                        activeColor: "border-amber-400 ring-2 ring-amber-100",
                      },
                      {
                        id: "Requests",
                        label: "Requests",
                        value: tasks.filter((t) =>
                          [
                            "Pending Approval",
                            "Extension Pending",
                            "Transfer Pending",
                            "Cannot Complete Pending",
                          ].includes(t.status),
                        ).length,
                        icon: <Bell className="w-4 h-4 text-rose-600" />,
                        bg: "bg-rose-50 border-rose-100",
                        activeColor: "border-rose-400 ring-2 ring-rose-100",
                      },
                      {
                        id: "Transferred",
                        label: "Transferred",
                        value: tasks.filter((t) =>
                          ["Transferred", "Transfer Pending"].includes(t.status),
                        ).length,
                        icon: <Repeat className="w-4 h-4 text-purple-600" />,
                        bg: "bg-purple-50 border-purple-100",
                        activeColor: "border-purple-400 ring-2 ring-purple-100",
                      },
                    ].map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setActiveStatFilter(card.id);
                        }}
                        className={`app-panel p-4 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-start justify-between gap-3 ${activeStatFilter === card.id ? card.activeColor : "border-(--border-soft)"}`}
                      >
                        <div>
                          <p className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider">
                            {card.label}
                          </p>
                          <div className="mt-2 text-xl sm:text-2xl font-extrabold leading-none text-(--text-strong)">
                            {card.value}
                          </div>
                        </div>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${card.bg}`}>
                          {card.icon}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Tasks Table with filtering bar */}
                  <div className="app-panel overflow-hidden border border-(--border-soft)">
                    <div className="app-section-bar px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="app-heading">
                          {activeStatLabel}
                        </h3>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {filteredTasks.length} result
                          {filteredTasks.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                        {/* Search — always visible */}
                        <div className="relative flex-1 sm:w-80">
                          <input
                            type="text"
                            placeholder="Search tasks, projects, assignees..."
                            value={tableSearchTerm}
                            onChange={(e) =>
                              setTableSearchTerm(e.target.value)
                            }
                            className="app-input w-full pl-9! pr-3 py-1.5 text-xs focus:ring-2"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                          onClick={() => setShowFilterPanel((prev) => !prev)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs border rounded-xl transition-colors whitespace-nowrap cursor-pointer ${showFilterPanel ||
                            tableDateFilter ||
                            tableProjectFilter ||
                            tableAssignByFilter ||
                            tableStatusFilter
                            ? "border-emerald-500 text-emerald-600 bg-emerald-50 font-bold"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
                            }`}
                        >
                          <Filter className="w-3.5 h-3.5" />
                          Filters
                          {(tableDateFilter ||
                            tableDeadlineFilter ||
                            tableProjectFilter ||
                            tableAssignByFilter ||
                            tableStatusFilter) && (
                              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none font-bold">
                                {
                                  [
                                    tableDateFilter,
                                    tableDeadlineFilter,
                                    tableProjectFilter,
                                    tableAssignByFilter,
                                    tableStatusFilter,
                                  ].filter(Boolean).length
                                }
                              </span>
                            )}
                        </button>

                        {/* Reset Button */}
                        {(tableSearchTerm ||
                          tableDateFilter ||
                          tableDeadlineFilter ||
                          tableProjectFilter ||
                          tableAssignByFilter ||
                          tableStatusFilter ||
                          activeStatFilter !== "All") && (
                            <button
                              onClick={() => {
                                setTableSearchTerm("");
                                setTableDateFilter("");
                                setTableDeadlineFilter("");
                                setTableProjectFilter("");
                                setTableAssignByFilter("");
                                setTableStatusFilter("");
                                setActiveStatFilter("All");
                              }}
                              className="p-2 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Reset all filters"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>
                    </div>

                    <div className="px-4 sm:px-6 py-4 border-b border-(--border-soft) bg-slate-50/20">
                      <div className="flex flex-col gap-3">
                        {/* Row 2: Collapsible Filter Panel */}
                        {showFilterPanel && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 border border-(--border-soft) rounded-xl bg-slate-50/50" style={{ gap: '0.75rem' }}>
                            {/* Date Filter */}
                            <div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                Date Assigned
                              </div>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={tableDateFilter}
                                  onChange={(e) =>
                                    setTableDateFilter(e.target.value)
                                  }
                                  className="app-input w-full pl-3! pr-9! py-1.5 text-xs"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* Deadline Filter */}
                            <div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                Deadline Date
                              </div>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={tableDeadlineFilter}
                                  onChange={(e) =>
                                    setTableDeadlineFilter(e.target.value)
                                  }
                                  className="app-input w-full pl-3! pr-9! py-1.5 text-xs"
                                />
                                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* Project Filter */}
                            {/* Project Filter in filter panel */}
                            <div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                Project
                              </div>
                              <div className="relative">
                                <select
                                  value={tableProjectFilter}
                                  onChange={(e) => setTableProjectFilter(e.target.value)}
                                  className="app-input w-full pl-9! pr-8! py-1.5 text-xs appearance-none"
                                >
                                  <option value="">All Projects</option>
                                  {Array.from(new Set(tasks.map((t) => t.project).filter(Boolean))).map((project) => (
                                    <option key={project} value={project}>
                                      {project}
                                    </option>
                                  ))}
                                </select>
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* Assigned By Filter */}
                            <div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                Assigned By
                              </div>
                              <div className="relative">
                                <select
                                  value={tableAssignByFilter}
                                  onChange={(e) =>
                                    setTableAssignByFilter(e.target.value)
                                  }
                                  className="app-input w-full pl-9! pr-8! py-1.5 text-xs appearance-none"
                                >
                                  <option value="">All Assigners</option>
                                  {Array.from(
                                    new Set(
                                      tasks
                                        .map((t) => t.assignedBy)
                                        .filter(Boolean),
                                    ),
                                  )
                                    .map((assignerId) => ({
                                      id: assignerId,
                                      name: getEmployeeNameById(assignerId),
                                    }))
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(({ id, name }) => (
                                      <option key={id} value={id}>
                                        {name}
                                      </option>
                                    ))}
                                </select>
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                Status
                              </div>
                              <div className="relative">
                                <select
                                  value={tableStatusFilter}
                                  onChange={(e) =>
                                    setTableStatusFilter(e.target.value)
                                  }
                                  className="app-input w-full pl-9! pr-8! py-1.5 text-xs appearance-none"
                                >
                                  <option value="">All Status</option>
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status === "Pending Approval"
                                        ? "Reviewing"
                                        : status}
                                    </option>
                                  ))}
                                </select>
                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Row 3: Active Filter Tags */}
                        {(tableSearchTerm ||
                          tableDateFilter ||
                          tableDeadlineFilter ||
                          tableProjectFilter ||
                          tableAssignByFilter ||
                          tableStatusFilter ||
                          activeStatFilter !== "All") && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Active filters:
                              </span>
                              {activeStatFilter !== "All" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {activeStatFilter}
                                  <button
                                    onClick={() => setActiveStatFilter("All")}
                                    className="hover:text-emerald-900 ml-1 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableSearchTerm && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                  Search: {tableSearchTerm}
                                  <button
                                    onClick={() => setTableSearchTerm("")}
                                    className="hover:text-slate-900 ml-1 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableDateFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                  Date: {formatDate(tableDateFilter)}
                                  <button
                                    onClick={() => setTableDateFilter("")}
                                    className="hover:text-slate-900 ml-1 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableDeadlineFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                  Deadline: {formatDate(tableDeadlineFilter)}
                                  <button
                                    onClick={() => setTableDeadlineFilter("")}
                                    className="hover:text-slate-900 ml-1 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableProjectFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                  Project: {tableProjectFilter}
                                  <button
                                    onClick={() => setTableProjectFilter("")}
                                    className="hover:text-slate-900 ml-1 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableAssignByFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                  Assigner:{" "}
                                  {getEmployeeNameById(tableAssignByFilter)}
                                  <button
                                    onClick={() => setTableAssignByFilter("")}
                                    className="hover:text-slate-900 ml-1 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableStatusFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                  Status: {tableStatusFilter}
                                  <button
                                    onClick={() => setTableStatusFilter("")}
                                    className="hover:text-slate-900 ml-1 cursor-pointer font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="overflow-x-auto w-full bg-white">
                      <table className="min-w-full text-xs sm:text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left font-extrabold text-(--text-soft) border-b border-(--border-soft) text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Task & Project
                            </th>
                            <th className="px-4 py-3 text-left font-extrabold text-(--text-soft) border-b border-(--border-soft) text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Assigned To
                            </th>
                            <th className="px-4 py-3 text-left font-extrabold text-(--text-soft) border-b border-(--border-soft) text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Assigned By
                            </th>
                            <th className="px-4 py-3 text-left font-extrabold text-(--text-soft) border-b border-(--border-soft) text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Assigned Date
                            </th>
                            <th className="px-4 py-3 text-left font-extrabold text-(--text-soft) border-b border-(--border-soft) text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Priority
                            </th>
                            <th className="px-4 py-3 text-left font-extrabold text-(--text-soft) border-b border-(--border-soft) text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-extrabold text-(--text-soft) border-b border-(--border-soft) text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Deadline
                            </th>
                            <th className="px-4 py-3 font-extrabold text-(--text-soft) border-b border-(--border-soft) text-center text-[11px] uppercase tracking-widest bg-slate-50/50">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-(--border-soft)">
                          {/* Fixed JSX structure for conditional rendering */}
                          {filteredTasks.length === 0 ? (
                            <tr>
                              <td
                                colSpan="8"
                                className="px-6 py-12 text-center text-gray-500"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <FileText className="w-8 h-8 text-gray-200" />
                                  <p className="font-bold text-(--text-strong)">
                                    No tasks found matching your filters
                                  </p>
                                  <button
                                    onClick={() => {
                                      setTableSearchTerm("");
                                      setTableDateFilter("");
                                      setActiveStatFilter("All");
                                    }}
                                    className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold hover:underline cursor-pointer"
                                  >
                                    Clear all filters
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <>
                              {currentItems.map((task) => (
                                <tr
                                  key={task.id}
                                  className="hover:bg-(--bg-subtle)/50 transition-colors duration-200 border-b border-(--border-soft) last:border-b-0"
                                >
                                  {/* ...existing code for each row... */}
                                  <td className="px-3 py-3">
                                    <div className="max-w-45 sm:max-w-60">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="font-semibold text-gray-900 leading-snug text-[13px] line-clamp-1"
                                          title={task.title || task.task}
                                        >
                                          {renderRichText(
                                            task.title || task.task,
                                          )}
                                        </div>
                                        {task.history?.some((h) =>
                                          ["reassigned", "transferred"].includes(
                                            h.action,
                                          ),
                                        )}
                                        {/* && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                                              Transferred
                                            </span>
                                          )} */}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        <span
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
                                          title={task.project}
                                        >
                                          {truncateWords(task.project, 2)}
                                        </span>
                                        {task.subtasks &&
                                          task.subtasks.length > 0 && (
                                            <div className="flex items-center gap-1 text-[9px] text-gray-400">
                                              <Plus className="w-2.5 h-2.5" />
                                              <span>{task.subtasks.length}</span>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex -space-x-1.5">
                                      {task.assignedTo
                                        ?.slice(0, 3)
                                        .map((memberId, idx) => {
                                          const member = teamMembers.find(
                                            (m) => m.id === memberId,
                                          );
                                          const name = member
                                            ? member.name
                                            : "Team Member";
                                          return (
                                            <div
                                              key={idx}
                                              className={`h-7 w-7 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white ${getMemberAvatarColor(name)}`}
                                              title={name}
                                            >
                                              {getInitials(name)}
                                            </div>
                                          );
                                        })}
                                      {task.assignedTo?.length > 3 && (
                                        <div className="h-7 w-7 rounded-full border border-white bg-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-700">
                                          +{task.assignedTo.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <User className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-[11px] font-medium text-gray-900 whitespace-nowrap">
                                        {getEmployeeNameById(task.assignedBy)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-[11px] font-medium text-gray-900 whitespace-nowrap">
                                        {formatDate(task.assignedDate)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getStatusColor(task.status)}`}
                                    >
                                      {task.status === "Pending Approval"
                                        ? "Reviewing"
                                        : task.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-[11px] font-medium text-gray-900 whitespace-nowrap">
                                        {formatDate(task.deadlineDate)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleView(task)}
                                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200"
                                        title="View Details"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleReassign(task)}
                                        className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                                        title="Reassign Task"
                                      >
                                        <Repeat className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                                        title="Delete Task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>

                                      {![
                                        "Completed",
                                        "Approved",
                                        "Rejected",
                                      ].includes(task.status) && (
                                          <>
                                            {task.status === "Pending Approval" &&
                                              (isSuperAdmin ||
                                                String(user?.employee_id) ===
                                                String(task.assignedBy)) && (
                                                <button
                                                  onClick={() =>
                                                    handleStatusChange(
                                                      task.id,
                                                      "Completed",
                                                    )
                                                  }
                                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-200 ring-1 ring-emerald-300"
                                                  title="Mark as Completed"
                                                >
                                                  <Check className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            <button
                                              onClick={() => handleEdit(task)}
                                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                                              title="Edit Task"
                                            >
                                              <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            {task.status === "Extension Pending" &&
                                              (isSuperAdmin ||
                                                String(user?.employee_id) ===
                                                String(task.assignedBy)) && (
                                                <button
                                                  onClick={() => {
                                                    setSelectedExtensionTask(task);
                                                    setExtensionApprovalDeadline(
                                                      task.extensionDate
                                                        ? new Date(
                                                          task.extensionDate,
                                                        )
                                                          .toISOString()
                                                          .split("T")[0]
                                                        : "",
                                                    );
                                                    setShowExtensionApproveModal(
                                                      true,
                                                    );
                                                  }}
                                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors duration-200 ring-1 ring-amber-300"
                                                  title="Review Extension Request"
                                                >
                                                  <Clock className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            {task.status === "Cannot Complete" &&
                                              (isSuperAdmin ||
                                                String(user?.employee_id) ===
                                                String(task.assignedBy)) && (
                                                <>
                                                  <button
                                                    onClick={() => {
                                                      setSelectedCannotCompleteTask(
                                                        task,
                                                      );
                                                      setCannotCompleteReassignTo(
                                                        "",
                                                      );
                                                      setShowCannotCompleteApproveModal(
                                                        true,
                                                      );
                                                    }}
                                                    // className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors duration-200 ring-1 ring-rose-300"
                                                    title="Review Cannot Complete Request"
                                                  >
                                                    {/* <AlertTriangle className="w-3.5 h-3.5" /> */}
                                                  </button>
                                                  {/* <button
                                                    onClick={() => {
                                                      setSelectedCannotCompleteTask(
                                                        task,
                                                      );
                                                      setCannotCompleteReassignTo(
                                                        "",
                                                      );
                                                      setShowCannotCompleteApproveModal(
                                                        true,
                                                      );
                                                    }}
                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors duration-200 ring-1 ring-emerald-300 text-[10px] font-semibold"
                                                    title="Reassign Task"
                                                  >
                                                    Reassign
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      handleCannotCompleteAction(
                                                        task.id,
                                                        "Reject",
                                                      )
                                                    }
                                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors duration-200 ring-1 ring-rose-300 text-[10px] font-semibold"
                                                    title="Reject Cannot Complete Request"
                                                  >
                                                    Reject
                                                  </button> */}
                                                </>
                                              )}
                                            {task.status === "Transfer Pending" &&
                                              (isSuperAdmin ||
                                                String(user?.employee_id) ===
                                                String(task.assignedBy)) && (
                                                <>
                                                  <button
                                                    onClick={() => {
                                                      setSelectedTransferTask(task);
                                                      setShowTransferApproveModal(
                                                        true,
                                                      );
                                                    }}
                                                    className="p-1.5 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors duration-200 ring-1 ring-pink-300"
                                                    title="Review Transfer Request"
                                                  >
                                                    <Repeat className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      handleTransferAction(
                                                        task.id,
                                                        "Approve",
                                                      )
                                                    }
                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors duration-200 ring-1 ring-emerald-300 text-[10px] font-semibold"
                                                    title="Approve Transfer"
                                                  >
                                                    Approve
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      handleTransferAction(
                                                        task.id,
                                                        "Reject",
                                                      )
                                                    }
                                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors duration-200 ring-1 ring-rose-300 text-[10px] font-semibold"
                                                    title="Reject Transfer"
                                                  >
                                                    Reject
                                                  </button>
                                                </>
                                              )}
                                          </>
                                        )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {filteredTasks.length > 0 && (
                        <div className="px-4 py-3.5 border-t border-(--border-soft) bg-slate-50/10 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <div className="text-xs text-(--text-soft) font-medium">
                            Showing {indexOfFirstItem + 1} to{" "}
                            {Math.min(indexOfLastItem, filteredTasks.length)} of{" "}
                            {filteredTasks.length} tasks
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className={`p-1.5 rounded-xl border border-(--border-soft) transition-all cursor-pointer ${currentPage === 1
                                ? "text-gray-300 cursor-not-allowed bg-slate-50/50"
                                : "text-(--text-body) hover:bg-slate-50"
                                }`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex gap-1">
                              {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                  let pageNum;
                                  if (totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                  } else {
                                    pageNum = currentPage - 2 + i;
                                  }

                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setCurrentPage(pageNum)}
                                      className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
                                        ? "bg-linear-to-br from-(--brand) to-emerald-600 text-white shadow-[0_2px_8px_rgba(0,166,81,0.15)]"
                                        : "text-(--text-soft) hover:bg-slate-50 border border-(--border-soft)"
                                        }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                },
                              )}
                            </div>

                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages),
                                )
                              }
                              disabled={currentPage === totalPages}
                              className={`p-1.5 rounded-xl border border-(--border-soft) transition-all cursor-pointer ${currentPage === totalPages
                                ? "text-gray-300 cursor-not-allowed bg-slate-50/50"
                                : "text-(--text-body) hover:bg-slate-50"
                                }`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <select
                              value={itemsPerPage}
                              onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                              className="app-input ml-2 py-1.5 px-3.5 text-xs bg-white focus:ring-2 cursor-pointer"
                            >
                              <option value={5}>5 / page</option>
                              <option value={10}>10 / page</option>
                              <option value={25}>25 / page</option>
                              <option value={50}>50 / page</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <ToDoList />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 app-modal-backdrop flex items-center justify-center p-4 z-50">
            <div className="app-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-white">
              <div className="sticky top-0 bg-white border-b border-(--border-soft) px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h3 className="modal-title">
                    {editingTask ? "Edit Task" : "Assign New Task"}
                  </h3>
                  <p className="modal-subtitle mt-0.5">
                    {editingTask
                      ? "Update task details"
                      : "Create and assign a new task to team members"}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="app-icon-button p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="p-6 space-y-5 flex-1">
                  {/* Previously Assigned Info + History (visible only when reassigning) */}
                  {editingTask && (
                    <div className="space-y-4">
                      {/* Task History */}
                      {editingTask.history && editingTask.history.length > 0 && (
                        <div className="app-panel overflow-hidden">
                          <div className="app-section-bar px-4 py-2.5 flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[10px] font-bold text-(--text-soft) uppercase tracking-wider">
                              Task History
                            </span>
                          </div>
                          <div className="p-4 max-h-48 overflow-y-auto">
                            <div className="relative pl-6">
                              <div className="absolute left-2 top-2 bottom-2 w-px bg-(--border-soft)" />
                              <div className="space-y-3">
                                {[...editingTask.history]
                                  .reverse()
                                  .map((h, idx) => {
                                    const actionColors = {
                                      assigned: {
                                        dot: "bg-emerald-500",
                                        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
                                      },
                                      reassigned: {
                                        dot: "bg-amber-500",
                                        badge: "bg-amber-50 text-amber-700 border-amber-100",
                                      },
                                      completed: {
                                        dot: "bg-emerald-500",
                                        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
                                      },
                                    };
                                    const style = actionColors[h.action] || {
                                      dot: "bg-slate-400",
                                      badge: "bg-slate-50 text-slate-700 border-slate-100",
                                    };
                                    return (
                                      <div key={idx} className="relative">
                                        <div
                                          className={`absolute -left-6 top-2 w-2.5 h-2.5 rounded-full border-2 border-white ${style.dot}`}
                                        />
                                        <div className="bg-slate-50/50 border border-(--border-soft) rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                                          <div className="flex items-center justify-between px-3 py-1.5 border-b border-(--border-soft)">
                                            <span
                                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${style.badge}`}
                                            >
                                              {h.action || "updated"}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                              {h.date
                                                ? new Date(h.date).toLocaleString(
                                                  "en-GB",
                                                  {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  },
                                                )
                                                : ""}
                                            </span>
                                          </div>
                                          <div className="px-3 py-2">
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                              {h.action === "reassigned"
                                                ? renderRichText(h.newTask) ||
                                                "No description"
                                                : renderRichText(h.task) ||
                                                "No description"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Task Description */}
                  <div>
                    <label className="modal-label block mb-1.5" htmlFor="task">
                      Task Description <span className="text-rose-500">*</span>
                    </label>
                    <div className="bg-white rounded-xl border border-(--border-soft) overflow-hidden focus-within:ring-2 focus-within:ring-(--brand-ring) focus-within:border-(--brand)">
                      <ReactQuill
                        theme="snow"
                        value={formData.task}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, task: value }))
                        }
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Describe the task in detail..."
                        className="h-40 sm:mb-13 border-none"
                      />
                    </div>
                  </div>

                  {/* Project and Deadline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="modal-label block mb-1.5" htmlFor="project">
                        Project <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="project"
                        name="project"
                        value={formData.project}
                        onChange={handleInputChange}
                        className="app-input w-full cursor-pointer bg-white"
                        required
                      >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option
                            key={`${project.id}-${project.city}`}
                            value={project.name}
                          >
                            {project.name} ({project.city},{project.locality})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="modal-label block mb-1.5" htmlFor="deadlineDate">
                        Deadline Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="deadlineDate"
                          name="deadlineDate"
                          value={formData.deadlineDate}
                          onChange={handleInputChange}
                          className="app-input w-full cursor-pointer bg-white pr-9! py-1.5! text-xs"
                          required
                        />
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Priority and Multi-Select Assignees */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="modal-label block mb-1.5" htmlFor="priority">
                        Priority Level <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="app-input w-full cursor-pointer bg-white appearance-none pr-9! py-1.5! text-xs"
                          required
                        >
                          <option value="">Select Priority</option>
                          {priorityOptions.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div ref={dropdownRef} className="relative">
                      <label className="modal-label block mb-1.5">
                        Assign To <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAssigneesDropdown(!showAssigneesDropdown)
                          }
                          className="app-input w-full cursor-pointer bg-white flex justify-between items-center text-sm"
                        >
                          <div className="flex flex-wrap gap-1 overflow-hidden max-h-7">
                            {formData.assignedTo.length === 0 ? (
                              <span className="text-gray-400 font-medium">
                                Select team members...
                              </span>
                            ) : (
                              formData.assignedTo.map((id) => {
                                const member = teamMembers.find(
                                  (m) => m.id === id,
                                );
                                const name = member ? member.name : "Unknown";
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100"
                                  >
                                    {name}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeAssignee(id);
                                      }}
                                      className="hover:text-rose-600 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                );
                              })
                            )}
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showAssigneesDropdown ? "rotate-180" : ""}`}
                          />
                        </button>

                        {showAssigneesDropdown && (
                          <div
                            className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-2xl border border-(--border-soft) max-h-72 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="p-3 border-b border-(--border-soft) bg-slate-50/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search team members..."
                                  value={searchQuery}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery(e.target.value);
                                  }}
                                  className="app-input w-full pl-9! pr-3! py-1.5! text-xs bg-white focus:ring-2"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectAllAssignees();
                                  }}
                                  className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 hover:bg-emerald-50 rounded cursor-pointer"
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearAllAssignees();
                                  }}
                                  className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 hover:bg-rose-50 rounded cursor-pointer"
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>
                            <div
                              className="max-h-48 overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {filteredTeamMembers.map((member) => (
                                <label
                                  key={member.id}
                                  className={`flex items-center gap-3 p-2.5 cursor-pointer hover:bg-slate-50 border-l-4 ${formData.assignedTo.includes(member.id)
                                    ? "border-emerald-500 bg-emerald-50/30"
                                    : "border-transparent"
                                    }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.assignedTo.includes(
                                      member.id,
                                    )}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      toggleAssignee(member.id);
                                    }}
                                    className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <div
                                    className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${member.avatarColor}`}
                                  >
                                    {getInitials(member.name)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-xs text-gray-900">
                                      {member.name}
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-semibold">
                                    {member.role}
                                  </div>
                                  {formData.assignedTo.includes(member.id) && (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                                  )}
                                </label>
                              ))}
                            </div>
                            <div
                              className="p-2.5 border-t border-(--border-soft) bg-slate-50/50 text-xs text-gray-600 font-semibold"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {formData.assignedTo.length} member
                              {formData.assignedTo.length !== 1 ? "s" : ""}{" "}
                              selected
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <label className="modal-label block mb-1.5" htmlFor="remark">
                      Additional Remark
                    </label>
                    <textarea
                      id="remark"
                      name="remark"
                      value={formData.remark}
                      onChange={handleInputChange}
                      className="app-input w-full resize-none min-h-16 placeholder-gray-400"
                      rows="2"
                      placeholder="Add any special instructions, notes, or context..."
                    />
                  </div>

                  {/* Subtasks */}
                  <div className="app-panel-muted p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <label className="modal-label block mb-0.5">
                          Subtasks
                        </label>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Break down the main task into smaller items
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addSubtask}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Subtask
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.subtasks.map((subtask, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-white rounded-xl border border-(--border-soft)"
                        >
                          <span className="text-gray-500 text-xs font-bold pl-1.5">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={subtask.name}
                            onChange={(e) =>
                              handleSubtaskChange(index, e.target.value)
                            }
                            placeholder={`Describe subtask ${index + 1}`}
                            className="app-input flex-1 py-1.5 px-3 text-xs bg-white focus:ring-1"
                          />
                          {formData.subtasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubtask(index)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove subtask"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="sticky bottom-0 bg-white border-t border-(--border-soft) px-6 py-4 flex justify-end gap-3 z-10">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="app-btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="app-btn-primary flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : editingTask ? (
                      <>
                        <Check className="w-4 h-4" /> Update Task
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Assign Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── helpers ──────────────────────────────────────────── */}

        {viewingTask && (
          <div className="app-modal-backdrop fixed inset-0 flex items-start justify-center p-5 z-50 overflow-y-auto">
            <div className="app-modal w-full max-w-2xl my-auto flex flex-col overflow-hidden">
              {/* ── Header ─────────────────────────────────────────── */}
              <div className="sticky top-0 bg-white border-b border-(--border-soft) px-5 py-4 flex justify-between items-center z-10">
                <div>
                  <h3 className="modal-title">Task details</h3>
                  <p className="modal-subtitle mt-0.5">
                    Full breakdown and status
                  </p>
                </div>
                <button
                  onClick={() => setViewingTask(null)}
                  className="w-7 h-7 rounded-full border border-(--border-soft) flex items-center justify-center text-(--text-soft) hover:bg-(--bg-subtle) transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-5 py-5 flex flex-col gap-3">
                {/* ── Identity ────────────────────────────────────────── */}
                <div className="app-panel p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(viewingTask.priority)}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {viewingTask.priority} priority
                      </span>
                      {viewingTask.project && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {viewingTask.project}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${getStatusColor(viewingTask.status)}`}
                    >
                      {viewingTask.status === "Pending Approval"
                        ? "Reviewing"
                        : viewingTask.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-(--text-strong) leading-snug mb-3">
                    {renderRichText(viewingTask.title || viewingTask.task)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-(--text-soft)">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-(--text-faint)" />
                      Assigned: {formatDate(viewingTask.assignedDate)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-(--border-strong)" />
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-(--text-faint)" />
                      Deadline: {formatDate(viewingTask.deadlineDate)}
                    </span>
                  </div>
                </div>

                {/* ── Subtasks (collapsible) ──────────────────────────── */}
                {viewingTask.subtasks?.length > 0 && (
                  <div className="app-panel overflow-hidden">
                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5 border-b border-(--border-soft) cursor-pointer hover:bg-(--bg-subtle)/50 transition-colors"
                      onClick={() => setShowSubtasks(!showSubtasks)}
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-(--text-soft)" />
                      <span className="text-xs font-bold text-(--text-strong)">
                        Subtasks
                      </span>
                      <span className="ml-auto text-[10px] bg-white border border-(--border-soft) px-2 py-0.5 rounded-full text-(--text-soft)">
                        {completedCount} of {totalCount} done
                      </span>
                      {showSubtasks ? (
                        <ChevronUp className="w-3.5 h-3.5 text-(--text-soft) ml-1.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-(--text-soft) ml-1.5" />
                      )}
                    </div>
                    {showSubtasks && (
                      <div className="p-3.5">
                        <div className="h-1 bg-(--bg-subtle) rounded-full mb-3 overflow-hidden">
                          <div
                            className="h-full bg-(--brand) rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          {viewingTask.subtasks.map((subtask) => (
                            <div
                              key={subtask.id || subtask.name}
                              className="flex items-center justify-between px-2.5 py-2 border border-(--border-soft) rounded-xl hover:border-(--border-strong) bg-white transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() =>
                                    handleSubtaskToggle(
                                      viewingTask.id,
                                      subtask.id,
                                    )
                                  }
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${subtask.completed ? "bg-(--brand) border-(--brand)" : "border-gray-300 hover:border-(--brand) bg-white"}`}
                                >
                                  {subtask.completed && (
                                    <Check
                                      className="w-2.5 h-2.5 text-white"
                                      strokeWidth={3}
                                    />
                                  )}
                                </button>
                                <span
                                  className={`text-xs font-medium ${subtask.completed ? "text-(--text-faint) line-through" : "text-(--text-body)"}`}
                                >
                                  {subtask.name}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${subtask.completed ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}
                              >
                                {subtask.completed ? "Done" : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Info grid ───────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="app-panel overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-(--border-soft) bg-slate-50/50">
                      <FileText className="w-3.5 h-3.5 text-(--text-soft)" />
                      <span className="text-xs font-bold text-(--text-strong)">
                        Project & Assignment
                      </span>
                    </div>
                    <div className="p-3.5 space-y-3 bg-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-(--text-strong)">
                            {viewingTask.project}
                          </p>
                          <p className="text-[10px] text-(--text-faint)">Project</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 pt-3 border-t border-(--border-soft)">
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-(--text-strong)">
                            {getEmployeeNameById(viewingTask.assignedBy)}
                          </p>
                          <p className="text-[10px] text-(--text-faint)">Assigned by</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="app-panel overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-(--border-soft) bg-slate-50/50">
                      <Users className="w-3.5 h-3.5 text-(--text-soft)" />
                      <span className="text-xs font-bold text-(--text-strong)">
                        Team Members
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2 bg-white max-h-27.5 overflow-y-auto custom-scrollbar">
                      {viewingTask.assignedTo?.length > 0 ? (
                        viewingTask.assignedTo.map((memberId) => {
                          const member = teamMembers.find(
                            (m) => m.id === memberId,
                          );
                          const name = member?.name ?? "Unknown";
                          return (
                            <div
                              key={memberId}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${getMemberAvatarColor(name)}`}
                              >
                                {getInitials(name)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-(--text-strong)">
                                  {name}
                                </p>
                                <p className="text-[10px] text-(--text-faint)">
                                  Team member
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-(--text-faint)">
                          No members assigned
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Remark ───────────────────────────────────────────── */}
                {viewingTask.remark && (
                  <div className="app-panel overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-(--border-soft) bg-slate-50/50">
                      <MessageSquare className="w-3.5 h-3.5 text-(--text-soft)" />
                      <span className="text-xs font-bold text-(--text-strong)">
                        Remark
                      </span>
                    </div>
                    <div className="px-3.5 py-3 bg-white">
                      <p
                        className="text-xs text-(--text-soft) leading-relaxed border-l-2 border-(--brand) pl-2.5"
                        style={{ borderRadius: 0 }}
                      >
                        {viewingTask.remark}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Status reason ────────────────────────────────────── */}
                {getStatusReasonDetails(viewingTask) && (
                  <div className="app-panel overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-(--border-soft) bg-slate-50/50">
                      <span className="text-xs font-bold text-(--text-strong)">
                        {getStatusReasonDetails(viewingTask).label}
                      </span>
                    </div>
                    <div
                      className={`px-3.5 py-3 text-xs leading-relaxed bg-white ${getStatusReasonDetails(viewingTask).className}`}
                    >
                      {getStatusReasonDetails(viewingTask).value}
                    </div>
                  </div>
                )}

                {/* ── Extension pending ────────────────────────────────── */}
                {viewingTask.status === "Extension Pending" && (
                  <div className="app-panel border-amber-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50/50 border-b border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold text-amber-800">
                        Extension request pending
                      </span>
                    </div>
                    <div className="p-3.5 flex flex-col gap-3 bg-white">
                      <div className="space-y-1.5">
                        <div className="flex gap-3 text-xs">
                          <span className="text-(--text-soft) w-32 shrink-0 font-medium">
                            Reason
                          </span>
                          <span className="text-(--text-strong) font-semibold">
                            {viewingTask.extensionReason ||
                              viewingTask.reasonForExtension}
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span className="text-(--text-soft) w-32 shrink-0 font-medium">
                            Requested deadline
                          </span>
                          <span className="text-(--text-strong) font-semibold">
                            {formatDate(viewingTask.extensionDate)}
                          </span>
                        </div>
                      </div>
                      {String(user?.employee_id) ===
                        String(viewingTask.assignedBy) && (
                          <div className="border-t border-(--border-soft) pt-3 flex flex-col gap-2.5">
                            <div>
                              <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider mb-1.5">
                                Set new deadline
                              </p>
                              <input
                                type="date"
                                className="app-input w-full"
                                value={
                                  extensionApprovalDeadline ||
                                  viewingTask.extensionDate?.split("T")[0] ||
                                  ""
                                }
                                onChange={(e) =>
                                  setExtensionApprovalDeadline(e.target.value)
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleExtensionAction(
                                    viewingTask.id,
                                    "Approve",
                                    extensionApprovalDeadline ||
                                    viewingTask.extensionDate?.split("T")[0] ||
                                    "",
                                  )
                                }
                                className="app-btn-primary py-1.5 px-4 text-xs h-auto min-h-0 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleExtensionAction(
                                    viewingTask.id,
                                    "Reject",
                                    null,
                                  )
                                }
                                className="app-btn-secondary py-1.5 px-4 text-xs h-auto min-h-0 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* ── Transfer pending ─────────────────────────────────── */}
                {viewingTask.status === "Transfer Pending" && (
                  <div className="app-panel border-purple-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50/50 border-b border-purple-100">
                      <Repeat className="w-3.5 h-3.5 text-purple-700" />
                      <span className="text-xs font-bold text-purple-800">
                        Transfer request pending
                      </span>
                    </div>
                    <div className="p-3.5 flex flex-col gap-3 bg-white">
                      <div className="space-y-1.5">
                        <div className="flex gap-3 text-xs">
                          <span className="text-(--text-soft) w-32 shrink-0 font-medium">
                            Transfer to
                          </span>
                          <span className="text-(--text-strong) font-semibold">
                            {getEmployeeNamesByIds(viewingTask.transferTo)}
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span className="text-(--text-soft) w-32 shrink-0 font-medium">
                            Reason
                          </span>
                          <span className="text-(--text-strong) font-semibold">
                            {viewingTask.transferReason || "No reason provided"}
                          </span>
                        </div>
                      </div>
                      {String(user?.employee_id) ===
                        String(viewingTask.assignedBy) && (
                          <div className="flex gap-2 pt-3 border-t border-(--border-soft)">
                            <button
                              onClick={() =>
                                handleTransferAction(viewingTask.id, "Approve")
                              }
                              className="app-btn-primary py-1.5 px-4 text-xs h-auto min-h-0 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleTransferAction(viewingTask.id, "Reject")
                              }
                              className="app-btn-secondary py-1.5 px-4 text-xs h-auto min-h-0 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* ── History (collapsible) ────────────────────────────── */}
                {viewingTask.history?.length > 0 && (
                  <div className="app-panel overflow-hidden">
                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5 border-b border-(--border-soft) cursor-pointer hover:bg-(--bg-subtle)/50 transition-colors"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <History className="w-3.5 h-3.5 text-(--text-soft)" />
                      <span className="text-xs font-bold text-(--text-strong)">
                        Task History
                      </span>
                      <span className="text-[10px] bg-white border border-(--border-soft) rounded-full px-2 py-0.5 text-(--text-soft) ml-1">
                        {viewingTask.history.length}
                      </span>
                      {showHistory ? (
                        <ChevronUp className="w-3.5 h-3.5 text-(--text-soft) ml-auto" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-(--text-soft) ml-auto" />
                      )}
                    </div>
                    {showHistory && (
                      <div className="p-3.5 pl-5 bg-white space-y-4">
                        {[...viewingTask.history].reverse().map((h, i) => {
                          const STYLES = {
                            assigned: {
                              dot: "bg-sky-500",
                              badge:
                                "bg-sky-50 text-sky-800 border border-sky-100",
                            },
                            reassigned: {
                              dot: "bg-amber-500",
                              badge:
                                "bg-amber-50 text-amber-800 border border-amber-100",
                            },
                            completed: {
                              dot: "bg-emerald-600",
                              badge:
                                "bg-emerald-50 text-emerald-800 border border-emerald-100",
                            },
                          };
                          const s = STYLES[h.action] ?? {
                            dot: "bg-gray-400",
                            badge:
                              "bg-gray-100 text-gray-600 border border-gray-200",
                          };
                          const remark = h.remarks || h.remark;
                          const isLast = i === viewingTask.history.length - 1;
                          return (
                            <div key={i} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full border-2 border-white shrink-0 mt-1 ${s.dot}`}
                                />
                                {!isLast && (
                                  <div className="w-px flex-1 bg-(--border-soft) my-1" />
                                )}
                              </div>
                              <div className={`flex-1 ${!isLast ? "pb-4" : ""}`}>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${s.badge}`}
                                  >
                                    {h.action || "updated"}
                                  </span>
                                  <span className="text-[10px] text-(--text-faint) flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {h.date
                                      ? new Date(h.date).toLocaleString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                      : "—"}
                                  </span>
                                </div>
                                {h.task && (
                                  <p className="text-xs text-(--text-body) font-medium leading-snug mb-1">
                                    {h.task}
                                  </p>
                                )}
                                {h.by && (
                                  <p className="text-[10px] text-(--text-soft) flex items-center gap-1 mb-1 font-semibold">
                                    <User className="w-3 h-3" />
                                    <span className="font-bold text-(--text-strong)">
                                      {getEmployeeNameById(h.by)}
                                    </span>
                                  </p>
                                )}
                                {["reassigned", "transferred"].includes(
                                  h.action,
                                ) &&
                                  h.reassignedTo && (
                                    <p className="text-[10px] text-(--text-soft) mb-1 font-semibold">
                                      Transferred to:{" "}
                                      <span className="text-(--text-strong)">
                                        {getEmployeeNamesByIds(h.reassignedTo)}
                                      </span>
                                    </p>
                                  )}
                                {remark && (
                                  <p
                                    className="text-[11px] text-(--text-faint) italic border-l-2 border-(--border-strong) pl-2 mt-1"
                                    style={{ borderRadius: 0 }}
                                  >
                                    "{remark}"
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-(--border-soft) px-5 py-3 grid grid-cols-2 sm:flex sm:justify-end gap-2">
                {!["Completed", "Approved", "Rejected"].includes(
                  viewingTask.status,
                ) && (
                    <button
                      onClick={() => {
                        handleStatusChange(viewingTask.id, "Approved");
                        setViewingTask(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                <button
                  onClick={() => handleReassign(viewingTask)}
                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5" /> Reassign
                </button>
                <button
                  onClick={() => {
                    handleDelete(viewingTask.id);
                    setViewingTask(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 text-xs font-bold shadow-lg shadow-rose-200 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                {!["Completed", "Approved", "Rejected"].includes(
                  viewingTask.status,
                ) && (
                    <button
                      onClick={() => {
                        handleEdit(viewingTask);
                        setViewingTask(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit task
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Snackbar Notification */}
        {snackbar.open && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideUp">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${snackbar.type === "success"
                ? "bg-green-500"
                : snackbar.type === "error"
                  ? "bg-red-500"
                  : snackbar.type === "warning"
                    ? "bg-orange-500"
                    : "bg-blue-500"
                } text-white min-w-50`}
            >
              {snackbar.type === "success" && <Check className="w-4 h-4" />}
              {snackbar.type === "error" && <AlertCircle className="w-4 h-4" />}
              {snackbar.type === "warning" && (
                <AlertTriangle className="w-4 h-4" />
              )}
              {snackbar.type === "info" && <Info className="w-4 h-4" />}
              <span className="text-sm font-medium">{snackbar.message}</span>
              <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg animate-progressBar"></div>
            </div>
          </div>
        )}

        {/* Simple Message Box with History */}
        {showChat && (
          <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="bg-linear-to-r from-purple-600 to-purple-700 p-3 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold text-sm">Comments</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:text-purple-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-3 bg-gray-50">
              {chatMessages.slice(-3).map((msg) => (
                <div
                  key={msg.id}
                  className="mb-2 pb-2 border-b border-gray-200 last:border-0"
                >
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{msg.sender}</span> • {msg.time}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{msg.message}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your reply..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Extension Approval Modal (SuperAdmin Side) ── */}
        {showExtensionApproveModal && selectedExtensionTask && (
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-100">
            <div className="app-modal w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-(--border-soft) flex justify-between items-start bg-slate-50/50">
                <div>
                  <h3 className="modal-title flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Review Extension Request
                  </h3>
                  <p className="modal-subtitle mt-1">
                    Decide whether to approve or reject the employee's extension
                    request.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowExtensionApproveModal(false);
                    setSelectedExtensionTask(null);
                    setExtensionApprovalDeadline("");
                  }}
                  className="text-(--text-soft) hover:text-(--text-strong) p-1.5 rounded-full hover:bg-white/85 shadow-sm transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                {/* Task Details Summary */}
                <div className="app-panel p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider">
                      Task Description
                    </p>
                    <p className="text-sm font-bold text-(--text-strong) line-clamp-2">
                      {renderRichText(
                        selectedExtensionTask.task || selectedExtensionTask.title,
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                        Current Deadline
                      </p>
                      <div className="flex items-center gap-1.5 text-(--text-soft)">
                        <Calendar className="w-3.5 h-3.5 text-(--text-faint)" />
                        <p className="text-xs font-semibold">
                          {selectedExtensionTask.deadlineDate
                            ? new Date(
                              selectedExtensionTask.deadlineDate,
                            ).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                        Requested New Date
                      </p>
                      <div className="flex items-center gap-1.5 text-amber-700">
                        <Zap className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                        <p className="text-xs font-bold">
                          {selectedExtensionTask.extensionDate
                            ? new Date(
                              selectedExtensionTask.extensionDate,
                            ).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedExtensionTask.extensionReason && (
                    <div className="pt-2 border-t border-(--border-soft)">
                      <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider mb-1">
                        Reason for Extension
                      </p>
                      <div className="bg-white/50 p-2 rounded-xl border border-(--border-soft) italic text-xs text-(--text-soft) leading-relaxed">
                        "{selectedExtensionTask.extensionReason}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Approval Action */}
                <div className="space-y-2">
                  <label className="modal-label block">
                    Approve with Deadline <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={extensionApprovalDeadline}
                      onChange={(e) =>
                        setExtensionApprovalDeadline(e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="app-input w-full pl-4! pr-10! py-1.5! text-xs bg-white"
                    />
                    <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--text-faint) group-hover:text-(--brand) transition-colors pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-(--text-faint) italic">
                    * Tip: You can override the requested date if needed.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-(--border-soft) bg-slate-50/50 flex gap-3 justify-end items-center">
                <button
                  onClick={() =>
                    handleExtensionAction(selectedExtensionTask.id, "Reject")
                  }
                  className="px-6 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  onClick={() =>
                    handleExtensionAction(
                      selectedExtensionTask.id,
                      "Approve",
                      extensionApprovalDeadline,
                    )
                  }
                  disabled={!extensionApprovalDeadline}
                  className="app-btn-primary px-6 py-2.5 text-xs h-auto min-h-0 cursor-pointer disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  Approve & Set Deadline
                </button>
              </div>
            </div>
          </div>
        )}

        {showTransferApproveModal && selectedTransferTask && (
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-100">
            <div className="app-modal w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-(--border-soft) flex justify-between items-start bg-slate-50/50">
                <div>
                  <h3 className="modal-title flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-purple-600" />
                    Review Transfer Request
                  </h3>
                  <p className="modal-subtitle mt-1">
                    Approve to move this task to the requested employee, or reject
                    to keep it with the current employee.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTransferApproveModal(false);
                    setSelectedTransferTask(null);
                  }}
                  className="text-(--text-soft) hover:text-(--text-strong) p-1.5 rounded-full hover:bg-white/85 shadow-sm transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                <div className="app-panel p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider">
                      Task Description
                    </p>
                    <p className="text-sm font-bold text-(--text-strong) line-clamp-2">
                      {renderRichText(
                        selectedTransferTask.task || selectedTransferTask.title,
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider">
                        Current Employee
                      </p>
                      <p className="text-xs font-semibold text-(--text-strong)">
                        {getEmployeeNamesByIds(selectedTransferTask.assignedTo)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                        Transfer To
                      </p>
                      <p className="text-xs font-bold text-purple-700">
                        {getEmployeeNamesByIds(selectedTransferTask.transferTo)}
                      </p>
                    </div>
                  </div>

                  {selectedTransferTask.transferReason && (
                    <div className="pt-2 border-t border-(--border-soft)">
                      <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider mb-1">
                        Reason
                      </p>
                      <div className="bg-white/50 p-2 rounded-xl border border-(--border-soft) italic text-xs text-(--text-soft) leading-relaxed">
                        "{selectedTransferTask.transferReason}"
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-(--border-soft) bg-slate-50/50 flex gap-3 justify-end items-center">
                <button
                  onClick={() =>
                    handleTransferAction(selectedTransferTask.id, "Reject")
                  }
                  className="px-6 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  onClick={() =>
                    handleTransferAction(selectedTransferTask.id, "Approve")
                  }
                  className="app-btn-primary px-6 py-2.5 text-xs h-auto min-h-0 cursor-pointer"
                >
                  Approve Transfer
                </button>
              </div>
            </div>
          </div>
        )}

        {showCannotCompleteApproveModal && selectedCannotCompleteTask && (
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-100">
            <div className="app-modal w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-(--border-soft) flex justify-between items-start bg-slate-50/50">
                <div>
                  <h3 className="modal-title flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Review Cannot Complete Request
                  </h3>
                  <p className="modal-subtitle mt-1">
                    Reassign this task to another employee or reject the request
                    and send it back to the current employee.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCannotCompleteApproveModal(false);
                    setSelectedCannotCompleteTask(null);
                    setCannotCompleteReassignTo("");
                  }}
                  className="text-(--text-soft) hover:text-(--text-strong) p-1.5 rounded-full hover:bg-white/85 shadow-sm transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 bg-white">
                <div className="app-panel p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider">
                      Task Description
                    </p>
                    <p className="text-sm font-bold text-(--text-strong) line-clamp-2">
                      {renderRichText(
                        selectedCannotCompleteTask.task ||
                        selectedCannotCompleteTask.title,
                      )}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider">
                      Current Employee
                    </p>
                    <p className="text-xs font-semibold text-(--text-strong)">
                      {getEmployeeNamesByIds(
                        selectedCannotCompleteTask.assignedTo,
                      )}
                    </p>
                  </div>

                  {selectedCannotCompleteTask.notCompletedReason && (
                    <div className="pt-2 border-t border-(--border-soft)">
                      <p className="text-[10px] text-(--text-soft) font-bold uppercase tracking-wider mb-1">
                        Reason
                      </p>
                      <div className="bg-white/50 p-2 rounded-xl border border-(--border-soft) italic text-xs text-(--text-soft) leading-relaxed">
                        "{selectedCannotCompleteTask.notCompletedReason}"
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="modal-label block">
                    Reassign To <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cannotCompleteReassignTo}
                    onChange={(e) => setCannotCompleteReassignTo(e.target.value)}
                    className="app-input w-full cursor-pointer"
                  >
                    <option value="">Select employee</option>
                    {teamMembers
                      .filter(
                        (member) =>
                          !selectedCannotCompleteTask.assignedTo?.includes(
                            member.id,
                          ),
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-(--border-soft) bg-slate-50/50 flex gap-3 justify-end items-center">
                <button
                  onClick={() =>
                    handleCannotCompleteAction(
                      selectedCannotCompleteTask.id,
                      "Reject",
                    )
                  }
                  className="px-6 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  onClick={() =>
                    handleCannotCompleteAction(
                      selectedCannotCompleteTask.id,
                      "Approve",
                      cannotCompleteReassignTo,
                    )
                  }
                  disabled={!cannotCompleteReassignTo}
                  className="app-btn-primary px-6 py-2.5 text-xs h-auto min-h-0 cursor-pointer disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  Reassign Task
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        html, body { overflow-x: hidden; }

        /* Custom overrides to hide native Chrome/browser calendar icons & select arrows */
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none !important;
        }
        select.app-input {
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
        }

        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .animate-progressBar { animation: progressBar 5s linear forwards; }
      `}</style>
      </div>
    </div>
  );
};

export default Task;
