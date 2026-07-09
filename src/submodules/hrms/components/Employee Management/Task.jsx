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
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Flag,
  History,
  Image,
  Info,
  List,
  MessageSquare,
  Paperclip,
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

  // Replace &nbsp; with a regular space to prevent literal display
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

  // Return a fragment instead of a div to avoid layout/line-clamp issues
  return <>{parse(cleanHtml, options)}</>;
};

const normalizeAttachment = (file, fallbackType = "file") => {
  if (!file) return null;
  if (typeof file === "string") {
    return {
      name: file.split("/").pop() || file,
      url: file,
      type: fallbackType,
    };
  }
  return {
    ...file,
    name:
      file.originalName ||
      file.name ||
      file.filename ||
      file.path ||
      "Attachment",
    url: file.url || (file.path ? `/uploads/${file.path}` : ""),
    type: file.type || fallbackType,
  };
};

const parseAttachmentArray = (value, fallbackType = "file") => {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed)
      ? parsed
        .map((file) => normalizeAttachment(file, fallbackType))
        .filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const getAttachmentUrl = (attachment, API) => {
  const url = attachment?.url || attachment?.path || "";
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const normalized = url.startsWith("/uploads")
    ? url
    : `/uploads/${url.replace(/^\/+/, "")}`;
  return `${API}${normalized}`;
};

const Task = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("task");
  const [taskActiveTab, setTaskActiveTab] = useState("Pending");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isReassignMode, setIsReassignMode] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [showChat, setShowChat] = useState(false);
  // const [newNotifications, setNewNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });
  // const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
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
  const [openHistorySubtasks, setOpenHistorySubtasks] = useState(null);

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

  const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

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
  const [showDirectTransferModal, setShowDirectTransferModal] = useState(false);
  const [selectedDirectTransferTask, setSelectedDirectTransferTask] =
    useState(null);
  const [directTransferTo, setDirectTransferTo] = useState("");
  const [directTransferReason, setDirectTransferReason] = useState("");
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false);
  const [showCannotCompleteApproveModal, setShowCannotCompleteApproveModal] =
    useState(false);
  const [selectedCannotCompleteTask, setSelectedCannotCompleteTask] =
    useState(null);
  const [cannotCompleteReassignTo, setCannotCompleteReassignTo] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  const { user, token: authToken } = useAuth();
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    !user?.employee_id;
  const API = `${import.meta.env.VITE_HRMS_BASE_URL}`;
  const companyId = user?.company_id;
  console.log("User from Redux:", user);
  const slug = user?.slug;
  const csaapToken = authToken;

  const hasReadPermission = true;
  const hasInsertPermission = true;
  const hasUpdatePermission = true;
  const hasDeletePermission = true;

  const getEmployeeNameById = useCallback(
    (id) => {
      if (!id) return "Unknown";
      if (String(id).toLowerCase() === "admin" || id === companyId)
        return "admin";
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
  // const notificationsRef = useRef(null);
  // const chatContainerRef = useRef(null);

  // const [activeChatTask, setActiveChatTask] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const [formData, setFormData] = useState({
    task: "",
    project: "",
    priority: "",
    deadlineDate: "",
    remark: "",
    assignedTo: [],
    subtasks: [{ name: "", completed: false, assigned_to: null }],
  });

  const priorityOptions = ["Low", "Medium", "High"];
  const statusOptions = [
    "Pending",
    "In Progress",
    "Completed",
    "Approved",
    "Rejected",
    "Blocked",
    "Extension Pending",
    "Extended",
    "Reassigned",
    "Transferred",
    "Cannot Complete",
    "Not Completed",
    "Pending Approval",
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
      subtasks: [...prev.subtasks, { name: "", completed: false, assigned_to: null }],
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

  const handleSubtaskAssigneeChange = (index, assigneeId) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index] = { ...newSubtasks[index], assigned_to: assigneeId || null };
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
    setIsReassignMode(true);
    setFormData({
      task: task.task || task.title || "",
      assignedTo: task.assignedTo || [],
      deadlineDate: "",
      priority: task.priority || "",
      remark: "Reassigned Task",
      project: task.project || "",
      subtasks:
        task.subtasks && task.subtasks.length > 0
          ? task.subtasks.map((st) => ({
            name: st.name || st.title,
            completed: st.completed || false,
            assigned_to: st.assigned_to || st.assignedTo || null,
          }))
          : [{ name: "", completed: false, assigned_to: null }],
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!csaapToken) {
          console.error("No authorization token found");
          showSnackbar("Authentication token missing", "error");
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_CSAAP_URL || 'https://csaapnodeapi.csaap.com';
        const activeCompanyId = companyId || 1;
        const response = await axios.get(`${API_BASE_URL}/api/tenant/clprojects`, {
          params: { company_id: activeCompanyId },
          headers: { Authorization: `Bearer ${csaapToken}` }
        });

        const projectsData = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        const allProjects = projectsData
          .map((project) => ({
            id: project.id,
            name: project.project_name || project.name || "Unnamed Project",
            property_type: 'clproject',
            display_type: 'Client Project',
            locality: project.locality || '',
            city: project.city || '',
            branch: project.project_code || 'Main',
            composite_key: `clproject:${project.id}`,
            location: [project?.locality, project?.city].filter(Boolean).join(", ")
          }))
          .filter(project => project.name)
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
  }, [csaapToken, companyId]);

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
            : activeStatFilter === "Rejected"
              ? "Rejected Tasks"
              : "Tasks";

  const fetchTasks = async () => {
    if (!slug || !hasReadPermission) return;
    try {
      const res = await axios.get(`${API}/api/tasks`, {
        params: { slug: slug },
      });
      const data = res.data.map((t) => ({
        ...t,
        title: t.title || t.task || "Untitled Task",
        task: t.task || t.title || "Untitled Task",
        status: t.status === "approved" ? "Approved" : t.status,
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

        attachedFiles: parseAttachmentArray(t.attachedFiles, "file"),
        images: parseAttachmentArray(t.images, "image"),
        attachments: parseAttachmentArray(t.attachments),
        deadlineDate: t.deadlineDate || t.dueDate,
        assignedDate: t.assignedDate || t.startDate || "",
      }));
      const sortedData = data.sort((a, b) => {
        const getPriority = (status) => {
          if (status === "Pending Approval") return 1;
          const pendingStatuses = [
            "Pending",
            "Extension Pending",
            "Transfer Pending",
            "Transferred",
            "Reassigned",
            "In Progress",
            "Blocked",
            "Extended",
          ];
          if (pendingStatuses.includes(status)) return 2;
          if (status === "Completed" || status === "Approved") return 3;
          return 4; // Other statuses
        };

        const priorityA = getPriority(a.status);
        const priorityB = getPriority(b.status);

        if (priorityA !== priorityB) return priorityA - priorityB;

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
    if (hasReadPermission) {
      fetchTasks();
    }
  }, [companyId, hasReadPermission]);

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

    if (isReassignMode || editingTask) {
      if (!hasUpdatePermission) {
        showSnackbar("You don't have update permission", "warning");
        return;
      }
    } else {
      if (!hasInsertPermission) {
        showSnackbar("You don't have insert permission", "warning");
        return;
      }
    }

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
      .replace(/&nbsp;/g, " ")
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
      status: isReassignMode
        ? "Reassigned"
        : editingTask
          ? editingTask.status
          : "Pending",

      history: editingTask
        ? [
          ...(editingTask.history || []),
          {
            status: editingTask.status || "Pending",
            action: isReassignMode ? "reassigned" : "updated",
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
        await axios.put(`${API}/api/tasks/${editingTask.id}`, payload);
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
      setIsReassignMode(false);
      setIsFormOpen(false);
      setFormData({
        task: "",
        project: "",
        priority: "",
        deadlineDate: "",
        remark: "",
        assignedTo: [],
        subtasks: [{ name: "", completed: false, assigned_to: null }],
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
    setIsReassignMode(false);
    setFormData({
      task: task.task || task.title,
      assignedTo: task.assignedTo,
      deadlineDate: task.deadlineDate?.split("T")[0] || task.deadlineDate,
      priority: validPriority,
      remark: task.remark || "",
      project: task.project || "",
      subtasks:
        task.subtasks && task.subtasks.length > 0
          ? task.subtasks.map((st) => ({
            id: st.id,
            name: st.name || st.title,
            completed: st.completed || false,
            assigned_to: st.assigned_to || st.assignedTo || null,
          }))
          : [{ name: "", completed: false, assigned_to: null }],
    });
    setIsFormOpen(true);
  };

  const handleView = (task) => {
    setViewingTask({
      ...task,
      attachedFiles: parseAttachmentArray(task.attachedFiles, "file"),
      images: parseAttachmentArray(task.images, "image"),
      attachments: parseAttachmentArray(task.attachments),
    });
    setShowSubtasks(true);
    setShowHistory(false);
    setOpenHistorySubtasks(null);
  };

  const openDirectTransferModal = (task) => {
    setSelectedDirectTransferTask(task);
    setDirectTransferTo("");
    setDirectTransferReason("");
    setShowDirectTransferModal(true);
  };

  const closeDirectTransferModal = () => {
    setShowDirectTransferModal(false);
    setSelectedDirectTransferTask(null);
    setDirectTransferTo("");
    setDirectTransferReason("");
  };

  const handleDirectTransfer = async () => {
    if (!selectedDirectTransferTask?.id) return;
    if (!directTransferTo) {
      showSnackbar(
        "Please select an employee to transfer this task",
        "warning",
      );
      return;
    }
    if (!directTransferReason.trim()) {
      showSnackbar("Please enter a transfer reason", "warning");
      return;
    }

    setIsTransferSubmitting(true);
    try {
      await axios.put(
        `${API}/api/tasks/direct-transfer/${selectedDirectTransferTask.id}`,
        {
          newAssignee: directTransferTo,
          reason: directTransferReason.trim(),
          userId: user?.employee_id,
          role: user?.role,
        },
      );
      await fetchTasks();
      showSnackbar("Task transferred successfully", "success");
      if (viewingTask?.id === selectedDirectTransferTask.id) {
        setViewingTask(null);
      }
      closeDirectTransferModal();
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to transfer task", "error");
    } finally {
      setIsTransferSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!hasDeletePermission) {
      showSnackbar("You don't have delete permission", "warning");
      return;
    }
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
      subtasks: [{ name: "", completed: false, assigned_to: null }],
    });
    setIsReassignMode(false);
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
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending Approval":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Blocked":
        return "bg-red-100 text-red-800 border-red-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Extension Pending":
      case "Extended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Reassigned":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Cannot Complete":
      case "Not Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Transferred":
        return "bg-violet-100 text-violet-800 border-violet-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
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
      color: "bg-blue-600",
    },
    {
      id: "todo",
      label: "To Do List",
      icon: <List className="w-5 h-5" />,
      color: "bg-indigo-600",
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
      if (activeStatFilter === "Requests") {
        if (task.status === "Completed" || task.status === "Approved")
          return false;
        const requestStatuses = [
          "Pending Approval",
          "Extension Pending",
          "Transfer Pending",
          "Transferred",
          "Cannot Complete",
        ];
        const isRequest =
          requestStatuses.includes(task.status) ||
          (task.helpRequests && task.helpRequests.length > 0);
        if (!isRequest) return false;
      }
      if (
        activeStatFilter === "Rejected" &&
        !["Cannot Complete", "Not Completed"].includes(task.status)
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
    <div className="crm-module-root app-shell min-h-[calc(100vh-80px)] font-sans bg-(--bg-app) w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="app-title max-w-3xl font-extrabold text-(--text-strong) tracking-tight">
              Task Management
            </h1>
            <p className="app-subtitle mt-1 text-(--text-soft) text-xs sm:text-sm">
              Track, assign and collaborate on team tasks
            </p>
          </div>
          {activeTab === "task" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/hrms/archived-tasks")}
                className="app-btn-secondary bg-white text-(--text-body) border border-(--border-soft) hover:border-(--border-strong) hover:bg-(--bg-subtle) font-semibold py-2 px-4 rounded-xl flex items-center gap-2 shadow-2xs transition-all text-sm"
                title="View Archived Tasks"
              >
                <Archive className="w-5 h-5 text-(--text-soft)" />
                Archive
              </button>
              {hasInsertPermission && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="app-btn-primary bg-linear-to-r from-(--brand) to-(--brand-strong) hover:from-(--brand-strong) hover:to-(--brand-strong) text-white font-semibold py-2 px-5 rounded-xl flex items-center gap-2 shadow-xs active:scale-[0.98] transition-all text-sm"
                >
                  <Plus className="w-5 h-5" /> Assign New Task
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Headers */}
        <div
          className="-mx-3 mb-5 px-3 py-3 lg:-mx-4 lg:px-4"
          style={{ background: "color-mix(in srgb, var(--bg-app) 94%, white)" }}
        >
          <div className="flex items-center justify-start gap-2 overflow-x-auto">
            {taskTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-bold tracking-[-0.02em] transition-all duration-200 sm:px-4 ${isActive
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
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${isActive
                      ? "border border-white/10 bg-white/16 text-white"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                      }`}
                  >
                    {React.cloneElement(tab.icon, { className: "h-3.5 w-3.5" })}
                  </span>
                  <span className="whitespace-nowrap">{tab.label}</span>
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
            className="space-y-6"
          >
            {activeTab === "task" ? (
              hasReadPermission ? (
                <>
                  {/* Stats Cards - Interactive Filtering */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: "All",
                        label: "Total Tasks",
                        value: tasks.length,
                        color: "text-sky-600",
                        icon: <FileText className="w-5 h-5 text-sky-600" />,
                        bg: "bg-sky-50 border border-sky-100",
                        activeClass: "border-sky-500 ring-2 ring-sky-500/10",
                      },
                      {
                        id: "Completed",
                        label: "Completed",
                        value: tasks.filter((t) => t.status === "Completed").length,
                        color: "text-(--brand)",
                        icon: <Check className="w-5 h-5 text-(--brand)" />,
                        bg: "bg-(--brand-soft) border border-(--border-soft)",
                        activeClass: "border-(--brand) ring-2 ring-(--brand-ring)",
                      },
                      {
                        id: "Incompleted",
                        label: "Incompleted",
                        value: tasks.filter((t) =>
                          ["Pending", "In Progress", "Blocked"].includes(t.status)
                        ).length,
                        color: "text-amber-600",
                        icon: <Clock className="w-5 h-5 text-amber-600" />,
                        bg: "bg-amber-50 border border-amber-100",
                        activeClass: "border-amber-500 ring-2 ring-amber-500/10",
                      },
                      {
                        id: "Requests",
                        label: "Requests",
                        value: tasks.filter((t) => {
                          if (t.status === "Completed" || t.status === "Approved")
                            return false;
                          const requestStatuses = [
                            "Pending Approval",
                            "Extension Pending",
                            "Transfer Pending",
                            "Transferred",
                            "Cannot Complete",
                          ];
                          return (
                            requestStatuses.includes(t.status) ||
                            (t.helpRequests && t.helpRequests.length > 0)
                          );
                        }).length,
                        color: "text-violet-600",
                        icon: <Bell className="w-5 h-5 text-violet-600" />,
                        bg: "bg-violet-50 border border-violet-100",
                        activeClass: "border-violet-500 ring-2 ring-violet-500/10",
                      },
                    ].map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setActiveStatFilter(card.id);
                        }}
                        className={`app-panel p-4 flex items-start justify-between gap-3 text-left group transition-all duration-200 cursor-pointer ${activeStatFilter === card.id
                          ? card.activeClass
                          : "hover:border-(--border-strong) hover:shadow-2xs"
                          }`}
                      >
                        <div>
                          <p className="text-[11px] font-bold text-(--text-soft) uppercase tracking-wider">
                            {card.label}
                          </p>
                          <div className={`mt-2 text-2xl sm:text-[28px] font-extrabold leading-none ${card.color}`}>
                            {card.value}
                          </div>
                        </div>
                        <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${card.bg}`}>
                          {card.icon}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Tasks Table with filtering bar */}
                  <div className="app-panel overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-(--border-soft) bg-white">
                      <div className="flex flex-col gap-3">
                        {/* Row 1: Title + Search + Filter Button */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <h3 className="app-heading">
                              {activeStatLabel}
                            </h3>
                            <span className="text-xs font-semibold text-(--brand) bg-(--brand-soft) border border-(--border-soft) px-2 py-0.5 rounded-full">
                              {filteredTasks.length} result{filteredTasks.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                            {/* Search — always visible */}
                            <div className="relative flex-1 sm:w-80">
                              <input
                                type="text"
                                placeholder="Search tasks, projects, assigned to, assigned by, priority, status..."
                                value={tableSearchTerm}
                                onChange={(e) => setTableSearchTerm(e.target.value)}
                                className="app-input w-full pl-9 pr-3 py-2 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-sm transition-all duration-200 text-(--text-body) placeholder-(--text-faint)"
                              />
                              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            </div>

                            {/* Filter Toggle Button */}
                            <button
                              onClick={() => setShowFilterPanel((prev) => !prev)}
                              className={`flex items-center gap-1.5 px-3 py-2 text-sm border border-(--border-soft) rounded-xl transition-all font-semibold whitespace-nowrap ${showFilterPanel ||
                                tableDateFilter ||
                                tableProjectFilter ||
                                tableAssignByFilter ||
                                tableStatusFilter
                                ? "border-(--brand) text-(--brand) bg-(--brand-soft)"
                                : "bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) hover:border-(--border-strong)"
                                }`}
                            >
                              <Filter className="w-3.5 h-3.5" />
                              More Filters
                              {(tableDateFilter ||
                                tableDeadlineFilter ||
                                tableProjectFilter ||
                                tableAssignByFilter ||
                                tableStatusFilter) && (
                                  <span className="bg-(--brand) text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none font-bold">
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
                                  className="p-2 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors duration-200"
                                  title="Reset all filters"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              )}
                          </div>
                        </div>

                        {/* Row 2: Collapsible Filter Panel */}
                        {showFilterPanel && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border border-(--border-soft) rounded-xl bg-(--bg-subtle)/20">
                            {/* Date Filter */}
                            <div className="relative">
                              <div className="app-label block mb-1 text-(--text-soft)">
                                Date Assigned
                              </div>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={tableDateFilter}
                                  onChange={(e) => setTableDateFilter(e.target.value)}
                                  className="app-input w-full pl-9 pr-3 py-2 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-sm transition-all duration-200 text-(--text-body) clean-date-input"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* Deadline Filter */}
                            <div className="relative">
                              <div className="app-label block mb-1 text-(--text-soft)">
                                Deadline Date
                              </div>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={tableDeadlineFilter}
                                  onChange={(e) => setTableDeadlineFilter(e.target.value)}
                                  className="app-input w-full pl-9 pr-3 py-2 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-sm transition-all duration-200 text-(--text-body) clean-date-input"
                                />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* Project Filter */}
                            <div className="relative">
                              <div className="app-label block mb-1 text-(--text-soft)">
                                Project
                              </div>
                              <div className="relative">
                                <select
                                  value={tableProjectFilter}
                                  onChange={(e) => setTableProjectFilter(e.target.value)}
                                  className="app-input w-full pl-9 pr-8 py-2 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-sm transition-all duration-200 text-(--text-body) appearance-none"
                                >
                                  <option value="">All Projects</option>
                                  {Array.from(
                                    new Set(tasks.map((t) => t.project).filter(Boolean))
                                  ).map((project) => (
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
                            <div className="relative">
                              <div className="app-label block mb-1 text-(--text-soft)">
                                Assigned By
                              </div>
                              <div className="relative">
                                <select
                                  value={tableAssignByFilter}
                                  onChange={(e) => setTableAssignByFilter(e.target.value)}
                                  className="app-input w-full pl-9 pr-8 py-2 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-sm transition-all duration-200 text-(--text-body) appearance-none"
                                >
                                  <option value="">All Assigners</option>
                                  {Array.from(
                                    new Set(tasks.map((t) => t.assignedBy).filter(Boolean))
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
                            <div className="relative col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
                              <div className="app-label block mb-1 text-(--text-soft)">
                                Status
                              </div>
                              <div className="relative max-w-sm">
                                <select
                                  value={tableStatusFilter}
                                  onChange={(e) => setTableStatusFilter(e.target.value)}
                                  className="app-input w-full pl-9 pr-8 py-2 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-sm transition-all duration-200 text-(--text-body) appearance-none"
                                >
                                  <option value="">All Status</option>
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status === "Pending Approval" ? "Reviewing" : status}
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
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs text-(--text-soft) font-medium">
                                Active filters:
                              </span>
                              {activeStatFilter !== "All" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 rounded-full">
                                  {activeStatFilter}
                                  <button
                                    onClick={() => setActiveStatFilter("All")}
                                    className="hover:text-sky-900 ml-1 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableSearchTerm && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-gray-50 text-(--text-soft) border border-gray-100 rounded-full">
                                  Search: {tableSearchTerm}
                                  <button
                                    onClick={() => setTableSearchTerm("")}
                                    className="hover:text-gray-900 ml-1 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableDateFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-(--brand-soft) text-(--brand) border border-(--border-soft) rounded-full">
                                  Date: {formatDate(tableDateFilter)}
                                  <button
                                    onClick={() => setTableDateFilter("")}
                                    className="hover:text-(--brand-strong) ml-1 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableDeadlineFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-(--brand-soft) text-(--brand) border border-(--border-soft) rounded-full">
                                  Deadline: {formatDate(tableDeadlineFilter)}
                                  <button
                                    onClick={() => setTableDeadlineFilter("")}
                                    className="hover:text-(--brand-strong) ml-1 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableProjectFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-(--brand-soft) text-(--brand) border border-(--border-soft) rounded-full">
                                  Project: {tableProjectFilter}
                                  <button
                                    onClick={() => setTableProjectFilter("")}
                                    className="hover:text-(--brand-strong) ml-1 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableAssignByFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-(--brand-soft) text-(--brand) border border-(--border-soft) rounded-full">
                                  Assigner: {getEmployeeNameById(tableAssignByFilter)}
                                  <button
                                    onClick={() => setTableAssignByFilter("")}
                                    className="hover:text-(--brand-strong) ml-1 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                              {tableStatusFilter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-(--brand-soft) text-(--brand) border border-(--border-soft) rounded-full">
                                  Status: {tableStatusFilter}
                                  <button
                                    onClick={() => setTableStatusFilter("")}
                                    className="hover:text-(--brand-strong) ml-1 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="min-w-full text-xs sm:text-sm">
                        <thead className="bg-(--bg-subtle)/40 border-b border-(--border-soft)">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-extrabold text-(--text-soft) uppercase tracking-widest text-[11px] border-b border-(--border-soft)">
                              Task & Project
                            </th>
                            <th className="px-4 py-2.5 text-left font-extrabold text-(--text-soft) uppercase tracking-widest text-[11px] border-b border-(--border-soft)">
                              Assigned To
                            </th>
                            <th className="px-4 py-2.5 text-left font-extrabold text-(--text-soft) uppercase tracking-widest text-[11px] border-b border-(--border-soft)">
                              Assigned By
                            </th>
                            <th className="px-4 py-2.5 text-left font-extrabold text-(--text-soft) uppercase tracking-widest text-[11px] border-b border-(--border-soft)">
                              Assigned Date
                            </th>
                            <th className="px-4 py-2.5 text-left font-extrabold text-(--text-soft) uppercase tracking-widest text-[11px] border-b border-(--border-soft)">
                              Priority
                            </th>
                            <th className="px-4 py-2.5 text-left font-extrabold text-(--text-soft) uppercase tracking-widest text-[11px] border-b border-(--border-soft)">
                              Status
                            </th>
                            <th className="px-4 py-2.5 text-left font-extrabold text-(--text-soft) uppercase tracking-widest text-[11px] border-b border-(--border-soft)">
                              Deadline
                            </th>
                            <th className="px-4 py-2.5 font-extrabold text-(--text-soft) uppercase tracking-widest text-center text-[11px] border-b border-(--border-soft)">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-(--bg-subtle)">
                          {filteredTasks.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <FileText className="w-8 h-8 text-(--text-faint)" />
                                  <p className="font-semibold text-(--text-strong)">
                                    No tasks found matching your filters
                                  </p>
                                  <button
                                    onClick={() => {
                                      setTableSearchTerm("");
                                      setTableDateFilter("");
                                      setActiveStatFilter("All");
                                    }}
                                    className="text-(--brand) hover:text-(--brand-strong) text-sm font-semibold transition-colors"
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
                                  className="hover:bg-(--bg-subtle)/50 border-b border-(--border-soft) transition-all duration-200"
                                >
                                  <td className="px-3 py-3">
                                    <div className="max-w-45 sm:max-w-60">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="font-bold text-(--text-strong) leading-snug text-[13.5px] line-clamp-1 hover:text-(--brand) transition-colors"
                                          title={String(
                                            task.title || task.task || ""
                                          ).replace(/&nbsp;/g, " ")}
                                        >
                                          {renderRichText(task.title || task.task)}
                                        </div>
                                        {(() => {
                                          const movement = [...(task.history || [])]
                                            .reverse()
                                            .find((h) =>
                                              ["reassigned", "transferred"].includes(
                                                h.action
                                              )
                                            );
                                          if (!movement) return null;
                                          return (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
                                              {movement.action === "reassigned"
                                                ? "Reassigned"
                                                : "Transferred"}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                        <span
                                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-(--brand-soft) text-(--brand) border border-(--border-soft) transition-all"
                                          title={task.project}
                                        >
                                          {truncateWords(task.project, 2)}
                                        </span>
                                        {task.subtasks && task.subtasks.length > 0 && (
                                          <div className="flex items-center gap-1 text-[9.5px] font-semibold text-(--text-faint)">
                                            <CheckSquare className="w-3 h-3 text-(--text-faint)" />
                                            <span>
                                              {task.subtasks.filter((s) => s.completed).length}/
                                              {task.subtasks.length}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                      {task.assignedTo?.slice(0, 3).map((memberId, idx) => {
                                        const member = teamMembers.find(
                                          (m) => m.id === memberId
                                        );
                                        const name = member ? member.name : "Team Member";
                                        return (
                                          <div
                                            key={idx}
                                            className={`h-7.5 w-7.5 rounded-full border-2 border-white shadow-2xs flex items-center justify-center text-[9.5px] font-bold text-white transition-transform hover:scale-105 shrink-0 ${getMemberAvatarColor(
                                              name
                                            )}`}
                                            title={name}
                                          >
                                            {getInitials(name)}
                                          </div>
                                        );
                                      })}
                                      {task.assignedTo?.length > 3 && (
                                        <div className="h-7.5 w-7.5 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9.5px] font-bold text-gray-600 shrink-0">
                                          +{task.assignedTo.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <User className="w-3.5 h-3.5 text-(--text-faint)" />
                                      <span className="text-[13px] font-semibold text-(--text-body) whitespace-nowrap">
                                        {getEmployeeNameById(task.assignedBy)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-(--text-faint)" />
                                      <span className="text-[13px] font-medium text-(--text-body) whitespace-nowrap">
                                        {formatDate(task.assignedDate)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${getStatusColor(
                                        task.status
                                      )}`}
                                    >
                                      {task.status === "Pending Approval"
                                        ? "Reviewing"
                                        : task.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-(--text-faint)" />
                                      <span className="text-[13px] font-medium text-(--text-body) whitespace-nowrap">
                                        {formatDate(task.deadlineDate)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      {hasReadPermission && (
                                        <button
                                          onClick={() => handleView(task)}
                                          className="p-1.5 rounded-lg bg-(--brand-soft) text-(--brand) border border-(--border-soft) hover:bg-(--brand) hover:text-white transition-all shadow-3xs"
                                          title="View Details"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {task.status === "Pending Approval" &&
                                        (isAdmin ||
                                          String(user?.employee_id) ===
                                          String(task.assignedBy)) && (
                                          <button
                                            onClick={() =>
                                              handleStatusChange(
                                                task.id,
                                                "Approved"
                                              )
                                            }
                                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-3xs ring-1 ring-emerald-300"
                                            title="Mark as Completed"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                        )}

                                      {task.status === "Extension Pending" &&
                                        (isAdmin ||
                                          String(user?.employee_id) ===
                                          String(task.assignedBy)) && (
                                          <button
                                            onClick={() => {
                                              setSelectedExtensionTask(task);
                                              setExtensionApprovalDeadline(
                                                task.extensionDate
                                                  ? new Date(task.extensionDate)
                                                    .toISOString()
                                                    .split("T")[0]
                                                  : ""
                                              );
                                              setShowExtensionApproveModal(true);
                                            }}
                                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-3xs"
                                            title="Review Extension Request"
                                          >
                                            <Clock className="w-3.5 h-3.5" />
                                          </button>
                                        )}

                                      {task.status === "Cannot Complete" &&
                                        (isAdmin ||
                                          String(user?.employee_id) ===
                                          String(task.assignedBy)) && (
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
                                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors duration-200 ring-1 ring-rose-300"
                                            title="Review Cannot Complete Request"
                                          >
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                          </button>
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
                        <div className="px-4 sm:px-6 py-4 border-t border-(--border-soft) bg-(--bg-subtle)/20 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <div className="text-xs font-semibold text-(--text-soft)">
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
                              className={`p-2 rounded-lg border border-(--border-soft) transition-colors bg-white ${currentPage === 1
                                ? "text-(--text-faint) cursor-not-allowed"
                                : "text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand)"
                                }`}
                            >
                              <ChevronLeft className="w-4 h-4" />
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
                                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border border-(--border-soft) ${currentPage === pageNum
                                        ? "bg-(--brand) text-white border-(--brand) shadow-xs"
                                        : "text-(--text-body) bg-white hover:bg-(--bg-subtle) hover:text-(--brand)"
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
                              className={`p-2 rounded-lg border border-(--border-soft) transition-colors bg-white ${currentPage === totalPages
                                ? "text-(--text-faint) cursor-not-allowed"
                                : "text-(--text-body) hover:bg-(--bg-subtle) hover:text-(--brand)"
                                }`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            <select
                              value={itemsPerPage}
                              onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                              className="ml-2 px-3 py-1 text-xs bg-white border border-(--border-soft) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) font-semibold text-(--text-body)"
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
                <div className="bg-white rounded-xl border border-red-100 p-10 text-center">
                  <p className="text-sm font-medium text-red-500">
                    You do not have permission to view tasks.
                  </p>
                </div>
              )
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-(--border-soft) shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white z-10 border-b border-(--border-soft) px-8 py-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-(--text-strong)">
                  {isReassignMode
                    ? "Reassign Task"
                    : editingTask
                      ? "Edit Task"
                      : "Assign New Task"}
                </h3>
                <p className="text-(--text-soft) mt-0.5 text-xs sm:text-sm">
                  {isReassignMode
                    ? "Reassign task details"
                    : editingTask
                      ? "Update task details"
                      : "Create and assign a new task to team members"}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-(--text-faint) hover:text-(--text-strong) rounded-full p-1.5 hover:bg-(--bg-subtle) transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar px-8 py-5 flex flex-col">
              <div className="space-y-5 flex-1">
                {/* Previously Assigned Info + History (visible only when reassigning) */}
                {editingTask && (
                  <div className="space-y-4">
                    {/* Task History */}
                    {editingTask.history && editingTask.history.length > 0 && (
                      <div className="bg-white border border-(--border-soft) rounded-xl overflow-hidden shadow-2xs">
                        <div className="px-4 py-2.5 border-b border-(--border-soft) bg-(--bg-subtle)/35 flex items-center gap-2">
                          <History className="w-3.5 h-3.5 text-(--text-soft)" />
                          <span className="text-xs font-extrabold text-(--text-soft) uppercase tracking-widest">
                            Task History
                          </span>
                        </div>
                        <div className="px-4 py-4">
                          <div className="relative pl-6">
                            <div className="absolute left-2.25 top-3 bottom-3 w-px bg-(--border-soft)" />
                            <div className="space-y-3">
                              {[...editingTask.history]
                                .reverse()
                                .map((h, idx) => {
                                  const actionColors = {
                                    assigned: {
                                      dot: "bg-blue-500",
                                      badge: "bg-blue-50 text-blue-700 border-blue-100",
                                    },
                                    updated: {
                                      dot: "bg-slate-500",
                                      badge: "bg-slate-50 text-slate-700 border-slate-100",
                                    },
                                    reassigned: {
                                      dot: "bg-amber-500",
                                      badge: "bg-amber-50 text-amber-700 border-amber-100",
                                    },
                                    completed: {
                                      dot: "bg-green-500",
                                      badge: "bg-green-50 text-green-700 border-green-100",
                                    },
                                  };
                                  const style = actionColors[h.action] || {
                                    dot: "bg-gray-400",
                                    badge: "bg-gray-100 text-gray-600 border-gray-200",
                                  };
                                  return (
                                    <div key={idx} className="relative">
                                      <div
                                        className={`absolute -left-6 top-3 w-3.5 h-3.5 rounded-full border-2 border-white ${style.dot}`}
                                      />
                                      <div className="bg-white border border-(--border-soft) rounded-xl overflow-hidden hover:border-(--border-strong) transition-colors shadow-3xs">
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-(--border-soft) bg-gray-50/50">
                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${style.badge}`}
                                          >
                                            {h.action || "updated"}
                                          </span>
                                          <span className="text-[10px] font-medium text-(--text-faint)">
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
                                        <div className="px-3 py-2.5">
                                          <p className="text-[12px] text-(--text-body) leading-relaxed">
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
                <div className="px-1">
                  <label
                    className="block text-(--text-strong) text-sm font-bold mb-1.5"
                    htmlFor="task"
                  >
                    Task Description *
                  </label>
                  <div className="bg-white rounded-xl border border-(--border-soft) overflow-hidden focus-within:ring-2 focus-within:ring-(--brand-ring) focus-within:border-(--brand) transition-all duration-200">
                    <ReactQuill
                      theme="snow"
                      value={formData.task}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, task: value }))
                      }
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Describe the task in detail. Be specific about requirements, deliverables, and expectations..."
                      className="h-40 sm:mb-11"
                    />
                  </div>
                </div>

                {/* Project and Deadline */}
                <div className="grid grid-cols-2 gap-5 px-1">
                  <div>
                    <label
                      className="block text-(--text-strong) text-sm font-bold mb-1.5"
                      htmlFor="project"
                    >
                      Project *
                    </label>
                    <div className="relative">
                      <select
                        id="project"
                        name="project"
                        value={formData.project}
                        onChange={handleInputChange}
                        className="app-input w-full px-4 py-2.5 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) transition-all duration-200 text-sm font-semibold text-(--text-body) appearance-none"
                        required
                      >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option
                            key={`${project.id}-${project.branch}`}
                            value={project.name}
                          >
                            {project.name} ({project.locality || project.city})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-(--text-faint) pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-(--text-strong) text-sm font-bold mb-1.5"
                      htmlFor="deadlineDate"
                    >
                      Deadline Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="deadlineDate"
                        name="deadlineDate"
                        value={formData.deadlineDate}
                        onChange={handleInputChange}
                        className="app-input w-full px-4 py-2.5 border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) transition-all duration-200 text-sm font-medium text-(--text-body) bg-white clean-date-input"
                        required
                      />
                      <Calendar className="w-4 h-4 text-(--text-faint) absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Priority and Multi-Select Assignees */}
                <div className="grid grid-cols-2 gap-5 px-1">
                  <div>
                    <label
                      className="block text-(--text-strong) text-sm font-bold mb-1.5"
                      htmlFor="priority"
                    >
                      Priority Level *
                    </label>
                    <div className="relative">
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="app-input w-full px-4 py-2.5 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) transition-all duration-200 text-sm font-semibold text-(--text-body) appearance-none"
                        required
                      >
                        <option value="">Select Priority</option>
                        {priorityOptions.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-(--text-faint) pointer-events-none" />
                    </div>
                  </div>

                  <div ref={dropdownRef} className="relative">
                    <label className="block text-(--text-strong) text-sm font-bold mb-1.5">
                      Assign To *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setShowAssigneesDropdown(!showAssigneesDropdown)
                        }
                        className="app-input w-full px-4 py-2.5 border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) transition-all duration-200 flex justify-between items-center text-sm bg-white font-semibold text-(--text-body)"
                      >
                        <div className="flex flex-wrap gap-1.5 overflow-hidden">
                          {formData.assignedTo.length === 0 ? (
                            <span className="text-(--text-faint)">
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
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-(--brand-soft) text-(--brand) border border-(--border-soft) rounded-lg text-xs font-semibold"
                                >
                                  {name}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAssignee(id);
                                    }}
                                    className="hover:text-(--brand-strong) transition-colors font-bold ml-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-(--text-faint) transition-transform duration-200 shrink-0 ml-1 ${showAssigneesDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showAssigneesDropdown && (
                        <div
                          className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-(--border-soft) max-h-80 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className="p-3 border-b border-(--border-soft) bg-gray-50"
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
                                className="w-full px-3 py-1.5 pl-9 text-xs border border-(--border-soft) rounded-lg focus:outline-none focus:ring-1 focus:ring-(--brand) focus:border-(--brand)"
                              />
                              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectAllAssignees();
                                }}
                                className="text-[10px] text-(--brand) hover:text-(--brand-strong) font-bold px-2 py-0.5 hover:bg-(--brand-soft) rounded transition-colors"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearAllAssignees();
                                }}
                                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold px-2 py-0.5 hover:bg-rose-50 rounded transition-colors"
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
                                className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-(--bg-subtle)/35 border-l-4 transition-colors ${formData.assignedTo.includes(member.id)
                                  ? "border-(--brand) bg-(--brand-soft)"
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
                                  className="h-4 w-4 text-(--brand) border-(--border-soft) rounded focus:ring-(--brand)"
                                />
                                <div
                                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${member.avatarColor}`}
                                >
                                  {getInitials(member.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-xs text-(--text-strong) truncate">
                                    {member.name}
                                  </div>
                                  <div className="text-[10px] text-(--text-faint) truncate font-medium">
                                    {member.role}
                                  </div>
                                </div>
                                {formData.assignedTo.includes(member.id) && (
                                  <Check className="w-3.5 h-3.5 text-(--brand) ml-auto" />
                                )}
                              </label>
                            ))}
                          </div>
                          <div
                            className="p-2.5 border-t border-(--border-soft) bg-gray-50 text-xs font-semibold text-(--text-soft)"
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
                <div className="px-1">
                  <label
                    className="block text-(--text-strong) text-sm font-bold mb-1.5"
                    htmlFor="remark"
                  >
                    Additional Remark
                  </label>
                  <textarea
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) transition-all duration-200 resize-none text-sm placeholder-(--text-faint) text-(--text-body) font-medium"
                    rows="2"
                    placeholder="Add any special instructions, notes, or context for the assigned team members..."
                  />
                </div>

                {/* Subtasks */}
                <div className="bg-(--bg-subtle)/20 rounded-xl p-4 border border-(--border-soft) mx-1">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <label className="block text-(--text-strong) text-sm font-bold">
                        Subtasks
                      </label>
                      <p className="text-[10px] text-(--text-soft) font-medium">
                        Break down the main task into smaller, manageable items
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="text-xs text-(--brand) hover:text-(--brand-strong) font-bold px-3 py-1.5 hover:bg-(--brand-soft) rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Subtask
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.subtasks.map((subtask, index) => {
                      const parentAssignees = teamMembers.filter(m => formData.assignedTo.includes(m.id));
                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white rounded-lg border border-(--border-soft)"
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <span className="text-(--text-soft) text-xs font-semibold">
                              {index + 1}.
                            </span>
                            <input
                              type="text"
                              value={subtask.name}
                              onChange={(e) =>
                                handleSubtaskChange(index, e.target.value)
                              }
                              placeholder={`Describe subtask ${index + 1}`}
                              className="flex-1 px-3 py-1.5 border border-(--border-soft) rounded-lg focus:outline-none focus:ring-1 focus:ring-(--brand) focus:border-(--brand) text-xs text-(--text-body) font-medium"
                            />
                          </div>
                          <select
                            value={subtask.assigned_to || subtask.assignedTo || ""}
                            onChange={(e) => handleSubtaskAssigneeChange(index, e.target.value)}
                            className="px-3 py-1.5 border border-(--border-soft) rounded-lg focus:outline-none focus:ring-1 focus:ring-(--brand) focus:border-(--brand) text-xs text-(--text-body) font-medium bg-white"
                          >
                            <option value="">Unassigned</option>
                            {parentAssignees.map(member => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                          {formData.subtasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubtask(index)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors self-end sm:self-auto shrink-0"
                              title="Remove subtask"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-(--border-soft)">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 text-(--text-soft) border border-(--border-soft) rounded-xl hover:bg-(--bg-subtle) hover:text-(--text-strong) transition-colors duration-200 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-5 py-2 bg-linear-to-r from-(--brand) to-(--brand-strong) text-white rounded-xl hover:from-(--brand-strong) hover:to-(--brand-strong) transition-all duration-200 shadow-xs text-sm font-semibold flex items-center gap-2 ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : isReassignMode ? (
                    <>
                      <Repeat className="w-4 h-4" /> Reassign Task
                    </>
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
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl border border-(--border-soft) w-full max-w-2xl my-auto flex flex-col overflow-hidden max-h-[90vh] shadow-2xl">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="sticky rounded-t-2xl top-0 bg-white border-b border-(--border-soft) px-5 py-4 flex justify-between items-center z-10">
              <div>
                <p className="text-sm font-extrabold text-(--text-strong) uppercase tracking-wider">
                  Task details
                </p>
                <p className="text-xs text-(--text-soft) mt-0.5">
                  Full breakdown and status
                </p>
              </div>
              <button
                onClick={() => setViewingTask(null)}
                className="w-7 h-7 rounded-full border border-(--border-soft) flex items-center justify-center text-(--text-soft) hover:bg-(--bg-subtle) transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-5 py-5 flex flex-col gap-3 grow overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* ── Identity ────────────────────────────────────────── */}
              <div className="border border-(--border-soft) bg-white rounded-xl p-4 shadow-3xs">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getPriorityColor(viewingTask.priority)}`}
                    >
                      {viewingTask.priority} priority
                    </span>
                    {viewingTask.project && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-(--brand-soft) text-(--brand) border border-(--border-soft)">
                        {viewingTask.project}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border shrink-0 ${getStatusColor(viewingTask.status)}`}
                  >
                    {viewingTask.status === "Pending Approval"
                      ? "Reviewing"
                      : viewingTask.status}
                  </span>
                </div>
                <div className="text-[13.5px] font-bold text-(--text-strong) leading-snug mb-3">
                  {renderRichText(viewingTask.title || viewingTask.task)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-(--text-soft) font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-(--text-faint)" />
                    Assigned: {formatDate(viewingTask.assignedDate)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-(--text-faint)" />
                    Deadline: {formatDate(viewingTask.deadlineDate)}
                  </span>
                </div>
              </div>

              {/* ── Subtasks (collapsible) - Only for pending tasks ── */}
              {viewingTask.subtasks?.length > 0 &&
                viewingTask.status !== "Completed" &&
                viewingTask.status !== "Approved" && (
                  <div className="border border-(--border-soft) rounded-xl overflow-hidden shadow-3xs bg-white">
                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-(--bg-subtle)/30 border-b border-(--border-soft) cursor-pointer hover:bg-(--bg-subtle)/60 transition-colors"
                      onClick={() => setShowSubtasks(!showSubtasks)}
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-(--text-soft)" />
                      <span className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                        Subtasks
                      </span>
                      <span className="ml-auto text-[10px] bg-white border border-(--border-soft) px-2 py-0.5 rounded-full text-(--brand) font-bold">
                        {completedCount} of {totalCount} done
                      </span>
                      {showSubtasks ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-1.5 animate-pulse" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
                      )}
                    </div>
                    {showSubtasks && (
                      <div className="p-3.5 bg-white">
                        <div className="space-y-1.5">
                          {/* Filter only pending subtasks */}
                          {viewingTask.subtasks
                            .filter((subtask) => !subtask.completed)
                            .map((subtask) => (
                              <div
                                key={subtask.id || subtask.name}
                                className="flex items-center justify-between px-2.5 py-2 border border-(--border-soft) rounded-lg hover:border-(--border-strong) transition-colors bg-white shadow-3xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <button
                                    onClick={() =>
                                      handleSubtaskToggle(
                                        viewingTask.id,
                                        subtask.id,
                                      )
                                    }
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${subtask.completed ? "bg-(--brand) border-(--brand)" : "border-(--border-soft) hover:border-(--brand) bg-white"}`}
                                  >
                                    {subtask.completed && (
                                      <Check
                                        className="w-2.5 h-2.5 text-white"
                                        strokeWidth={3}
                                      />
                                    )}
                                  </button>
                                  <span
                                    className={`text-xs font-semibold ${subtask.completed ? "text-(--text-faint) line-through" : "text-(--text-body)"}`}
                                  >
                                    {subtask.name}
                                    {(subtask.assigned_to || subtask.assignedTo) && (
                                      <span className="text-[10px] text-gray-400 ml-2 font-medium bg-gray-100 px-1.5 py-0.5 rounded-md">
                                        @{getEmployeeNameById(subtask.assigned_to || subtask.assignedTo)}
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${subtask.completed ? "bg-green-50 text-green-700 border border-green-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}
                                >
                                  {subtask.completed ? "Done" : "Pending"}
                                </span>
                              </div>
                            ))}

                          {/* Optional: Show message when no pending subtasks */}
                          {viewingTask.subtasks.filter(
                            (subtask) => !subtask.completed,
                          ).length === 0 && (
                              <div className="text-center py-4 text-xs font-semibold text-(--brand)">
                                ✨ All subtasks completed!
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* ── Info grid ───────────────────────────────────────── */}
              {(viewingTask.attachedFiles?.length > 0 ||
                viewingTask.images?.length > 0 ||
                viewingTask.attachments?.length > 0) && (
                  <div className="border border-(--border-soft) rounded-xl overflow-hidden shadow-3xs bg-white">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-(--bg-subtle)/30 border-b border-(--border-soft)">
                      <Paperclip className="w-3.5 h-3.5 text-(--text-soft)" />
                      <span className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                        Attachments
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2">
                      {(viewingTask.attachments?.length
                        ? viewingTask.attachments
                        : [
                          ...(viewingTask.attachedFiles || []),
                          ...(viewingTask.images || []),
                        ]
                      )
                        .map((file) => normalizeAttachment(file))
                        .filter(Boolean)
                        .map((attachment, index) => {
                          const attachmentUrl = getAttachmentUrl(attachment, API);
                          return (
                            <div
                              key={`${attachment.name}-${index}`}
                              className="flex items-center gap-2 rounded-lg border border-(--border-soft) bg-gray-50/50 px-2.5 py-2 shadow-3xs"
                            >
                              {attachment.type === "image" ? (
                                <Image className="w-3.5 h-3.5 text-(--text-faint)" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-(--text-faint)" />
                              )}
                              {attachmentUrl ? (
                                <a
                                  href={attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-w-0 flex-1 truncate text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {attachment.name}
                                </a>
                              ) : (
                                <span className="min-w-0 flex-1 truncate text-xs font-bold text-(--text-body)">
                                  {attachment.name}
                                </span>
                              )}
                              {attachmentUrl && (
                                <a
                                  href={attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-(--text-faint) hover:text-(--text-strong)"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-3 bg-white">
                <div className="border border-(--border-soft) rounded-xl overflow-hidden shadow-3xs">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-(--bg-subtle)/30 border-b border-(--border-soft)">
                    <FileText className="w-3.5 h-3.5 text-(--text-soft)" />
                    <span className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                      Project & assignment
                    </span>
                  </div>
                  <div className="p-3.5 space-y-3 bg-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100">
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-(--text-strong)">
                          {viewingTask.project}
                        </p>
                        <p className="text-[10px] text-(--text-faint) font-semibold uppercase tracking-wider">Project</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 pt-3 border-t border-(--border-soft)">
                      <div className="w-7 h-7 rounded-lg bg-(--brand-soft) flex items-center justify-center shrink-0 border border-(--border-soft)">
                        <User className="w-3.5 h-3.5 text-(--brand)" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-(--text-strong)">
                          {getEmployeeNameById(viewingTask.assignedBy)}
                        </p>
                        <p className="text-[10px] text-(--text-faint) font-semibold uppercase tracking-wider">Assigned by</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-(--border-soft) rounded-xl overflow-hidden shadow-3xs">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-(--bg-subtle)/30 border-b border-(--border-soft)">
                    <Users className="w-3.5 h-3.5 text-(--text-soft)" />
                    <span className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                      Team members
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2 bg-white max-h-36 overflow-y-auto custom-scrollbar">
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
                              className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${getMemberAvatarColor(name)}`}
                            >
                              {getInitials(name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-(--text-strong) truncate">
                                {name}
                              </p>
                              <p className="text-[10px] text-(--text-faint) font-semibold uppercase tracking-wider">
                                Team member
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs font-semibold text-(--text-faint)">
                        No members assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Remark ───────────────────────────────────────────── */}
              {viewingTask.remark && (
                <div className="border border-(--border-soft) rounded-xl overflow-hidden shadow-3xs bg-white">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-(--bg-subtle)/30 border-b border-(--border-soft)">
                    <MessageSquare className="w-3.5 h-3.5 text-(--text-soft)" />
                    <span className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                      Remark
                    </span>
                  </div>
                  <div className="px-3.5 py-3">
                    <p
                      className="text-xs text-(--text-body) font-medium leading-relaxed border-l-3 border-(--brand) pl-3"
                      style={{ borderRadius: 0 }}
                    >
                      {viewingTask.remark}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Status reason ────────────────────────────────────── */}
              {getStatusReasonDetails(viewingTask) && (
                <div className="border border-(--border-soft) rounded-xl overflow-hidden shadow-3xs bg-white">
                  <div className="px-3.5 py-2.5 bg-gray-50/50 border-b border-(--border-soft)">
                    <span className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                      {getStatusReasonDetails(viewingTask).label}
                    </span>
                  </div>
                  <div
                    className={`px-3.5 py-3 text-xs font-semibold ${getStatusReasonDetails(viewingTask).className}`}
                  >
                    {getStatusReasonDetails(viewingTask).value}
                  </div>
                </div>
              )}

              {/* ── Extension pending ────────────────────────────────── */}
              {viewingTask.status === "Extension Pending" && (
                <div className="border border-orange-200 bg-orange-50/30 rounded-xl overflow-hidden shadow-3xs">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-orange-50 border-b border-orange-100">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-700" />
                    <span className="text-xs font-extrabold text-orange-850 uppercase tracking-wider">
                      Extension request pending
                    </span>
                  </div>
                  <div className="p-3.5 flex flex-col gap-3">
                    <div className="space-y-1.5">
                      <div className="flex gap-3 text-xs">
                        <span className="text-(--text-soft) font-semibold w-32 shrink-0">
                          Reason
                        </span>
                        <span className="text-(--text-strong) font-bold italic">
                          "{viewingTask.extensionReason ||
                            viewingTask.reasonForExtension}"
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-(--text-soft) font-semibold w-32 shrink-0">
                          Requested deadline
                        </span>
                        <span className="text-orange-750 font-extrabold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(viewingTask.extensionDate)}
                        </span>
                      </div>
                    </div>
                    {String(user?.employee_id) ===
                      String(viewingTask.assignedBy) && (
                        <div className="border-t border-orange-200/50 pt-3 flex flex-col gap-2.5">
                          <div>
                            <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1.5">
                              Set new deadline
                            </p>
                            <input
                              type="date"
                              className="w-full px-3 py-1.5 border border-orange-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 text-(--text-body) font-medium"
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
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
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
                              className="px-4 py-1.5 border border-orange-200 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
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
                <div className="border border-pink-200 bg-pink-50/20 rounded-xl overflow-hidden shadow-3xs">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-pink-50 border-b border-pink-100">
                    <Repeat className="w-3.5 h-3.5 text-pink-700" />
                    <span className="text-xs font-extrabold text-pink-850 uppercase tracking-wider">
                      Transfer request pending
                    </span>
                  </div>
                  <div className="p-3.5 flex flex-col gap-3">
                    <div className="space-y-1.5">
                      <div className="flex gap-3 text-xs">
                        <span className="text-(--text-soft) font-semibold w-32 shrink-0">
                          Transfer to
                        </span>
                        <span className="text-(--text-strong) font-bold">
                          {renderRichText(
                            getEmployeeNamesByIds(viewingTask.transferTo),
                          )}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-(--text-soft) font-semibold w-32 shrink-0">
                          Reason
                        </span>
                        <span className="text-(--text-strong) font-bold italic">
                          "{renderRichText(
                            viewingTask.transferReason || "No reason provided",
                          )}"
                        </span>
                      </div>
                    </div>
                    {String(user?.employee_id) ===
                      String(viewingTask.assignedBy) && (
                        <div className="flex gap-2 pt-3 border-t border-pink-200/50">
                          <button
                            onClick={() =>
                              handleTransferAction(viewingTask.id, "Approve")
                            }
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-pink-700 hover:bg-pink-800 text-pink-50 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleTransferAction(viewingTask.id, "Reject")
                            }
                            className="px-4 py-1.5 border border-pink-200 text-pink-700 hover:bg-pink-100 rounded-lg text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
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
                <div className="border border-(--border-soft) rounded-xl overflow-hidden shadow-3xs bg-white">
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-(--bg-subtle)/30 border-b border-(--border-soft) cursor-pointer hover:bg-(--bg-subtle)/60 transition-colors"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="w-3.5 h-3.5 text-(--text-soft)" />
                    <span className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                      Task history
                    </span>
                    <span className="text-[10px] bg-white border border-(--border-soft) rounded-full px-2 py-0.5 font-bold text-(--brand) ml-1">
                      {viewingTask.history.length}
                    </span>
                    {showHistory ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    )}
                  </div>
                  {showHistory && (
                    <div className="p-3.5 pl-5 bg-white">
                      {[...viewingTask.history].reverse().map((h, i) => {
                        const STYLES = {
                          assigned: {
                            dot: "bg-blue-500",
                            badge:
                              "bg-blue-50 text-blue-800 border border-blue-100",
                          },
                          updated: {
                            dot: "bg-slate-500",
                            badge:
                              "bg-slate-50 text-slate-800 border border-slate-100",
                          },
                          reassigned: {
                            dot: "bg-amber-500",
                            badge:
                              "bg-amber-50 text-amber-800 border border-amber-100",
                          },
                          completed: {
                            dot: "bg-green-600",
                            badge:
                              "bg-green-50 text-green-800 border border-green-100",
                          },
                        };
                        const s = STYLES[h.action] ?? {
                          dot: "bg-gray-400",
                          badge:
                            "bg-gray-100 text-gray-600 border border-gray-200",
                        };
                        const remark = h.remarks || h.remark;
                        const isLast = i === viewingTask.history.length - 1;
                        const historySubtasks = parseJsonArray(h.subtasks);
                        const historySubtaskKey = `${h.action || "history"}-${h.date || i}-${i}`;
                        const isHistorySubtasksOpen =
                          openHistorySubtasks === historySubtaskKey;
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
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize border ${s.badge}`}
                                >
                                  {h.action || "updated"}
                                </span>
                                <span className="font-semibold text-[10px] text-(--text-faint)">
                                  by
                                </span>
                                {h.by && (
                                  <p className="text-[10px] text-(--text-soft) flex items-center gap-1 font-semibold">
                                    <User className="w-3 h-3" />
                                    <span className="text-(--text-body)">
                                      {renderRichText(
                                        getEmployeeNameById(h.by),
                                      )}
                                    </span>
                                  </p>
                                )}
                                <span className="text-[10px] text-(--text-faint) flex items-center gap-1 font-semibold">
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
                                <p className="text-xs text-(--text-body) font-semibold leading-snug mb-1">
                                  {renderRichText(h.task)}
                                </p>
                              )}

                              {["reassigned", "transferred"].includes(
                                h.action,
                              ) &&
                                h.reassignedTo && (
                                  <p className="text-[10px] text-(--text-soft) mb-1 font-bold">
                                    {h.action === "reassigned"
                                      ? "Reassigned"
                                      : "Transferred"}{" "}
                                    to:{" "}
                                    <span className="text-(--text-body)">
                                      {renderRichText(
                                        getEmployeeNamesByIds(h.reassignedTo),
                                      )}
                                    </span>
                                  </p>
                                )}
                              {historySubtasks.length > 0 && (
                                <div className="mt-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenHistorySubtasks(
                                        isHistorySubtasksOpen
                                          ? null
                                          : historySubtaskKey,
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--border-soft) bg-white px-2.5 py-1 text-[10px] font-bold text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--brand) transition-colors"
                                  >
                                    <CheckSquare className="w-3 h-3 text-(--text-faint)" />
                                    {historySubtasks.length} subtask
                                    {historySubtasks.length > 1 ? "s" : ""}
                                    {isHistorySubtasksOpen ? (
                                      <ChevronUp className="w-3 h-3 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3 text-gray-400" />
                                    )}
                                  </button>

                                  {isHistorySubtasksOpen && (
                                    <div className="mt-2 space-y-1 rounded-lg border border-(--border-soft) bg-gray-50/50 p-2">
                                      {historySubtasks.map(
                                        (subtask, subtaskIndex) => (
                                          <div
                                            key={
                                              subtask.id ??
                                              `${historySubtaskKey}-${subtaskIndex}`
                                            }
                                            className="flex items-center justify-between gap-3 rounded-md bg-white border border-(--border-soft) px-2.5 py-1.5 text-[11px] font-semibold text-(--text-body) shadow-3xs"
                                          >
                                            <span className="min-w-0 flex-1 truncate">
                                              {subtask.name ||
                                                subtask.title ||
                                                `Subtask ${subtaskIndex + 1}`}
                                            </span>
                                            <span
                                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${subtask.completed
                                                ? "bg-green-50 text-green-700"
                                                : "bg-amber-50 text-amber-700"
                                                }`}
                                            >
                                              {subtask.completed
                                                ? "Done"
                                                : "Pending"}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {remark && (
                                <p
                                  className="text-[11px] text-(--text-soft) italic border-l-2 border-(--brand) pl-2.5 mt-1 font-medium"
                                  style={{ borderRadius: 0 }}
                                >
                                  "{renderRichText(remark)}"
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

            <div className="sticky bottom-0 bg-white border-t border-(--border-soft) px-5 py-3.5 flex flex-wrap justify-end gap-2 z-10">
              {hasUpdatePermission &&
                !["Completed", "Approved", "Transferred", "Rejected"].includes(viewingTask.status) && (
                  <button
                    onClick={() => {
                      handleEdit(viewingTask);
                      setViewingTask(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-600 hover:text-white hover:border-sky-600 rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                )}

              {hasUpdatePermission &&
                !["Completed", "Approved", "Transferred"].includes(viewingTask.status) && (
                  <button
                    onClick={() => openDirectTransferModal(viewingTask)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 hover:text-pink-850 rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
                  >
                    <Repeat className="w-3.5 h-3.5" /> Transfer
                  </button>
                )}

              {hasUpdatePermission &&
                !["Completed", "Approved", "Transferred"].includes(viewingTask.status) && (
                  <button
                    onClick={() => handleReassign(viewingTask)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-850 rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
                  >
                    <Repeat className="w-3.5 h-3.5" /> Reassign
                  </button>
                )}

              {viewingTask.status === "Pending Approval" &&
                (isAdmin || String(user?.employee_id) === String(viewingTask.assignedBy)) && (
                  <button
                    onClick={() => {
                      handleStatusChange(viewingTask.id, "Approved");
                      setViewingTask(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-(--brand-soft) border border-(--border-soft) text-(--brand) hover:bg-(--brand) hover:text-white rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}

              {hasDeletePermission &&
                !["Completed", "Approved", "Transferred"].includes(viewingTask.status) && (
                  <button
                    onClick={() => {
                      handleDelete(viewingTask.id);
                      setViewingTask(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
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
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl border border-(--border-soft) shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="bg-linear-to-r from-(--brand) to-(--brand-strong) p-3.5 text-white flex justify-between items-center">
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Comments</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-3.5 bg-(--bg-subtle)/20 custom-scrollbar">
            {chatMessages.slice(-3).map((msg) => (
              <div
                key={msg.id}
                className="mb-3 pb-3 border-b border-(--border-soft) last:mb-0 last:pb-0 last:border-0"
              >
                <div className="text-[10px] text-(--text-soft) font-bold flex items-center gap-1">
                  <span className="text-(--text-strong)">{msg.sender}</span>
                  <span className="text-(--text-faint)">•</span>
                  <span className="text-(--text-faint)">{msg.time}</span>
                </div>
                <div className="text-xs text-(--text-body) font-semibold mt-1 bg-white border border-(--border-soft) rounded-lg p-2 shadow-3xs leading-relaxed">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-(--border-soft) bg-white">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              className="w-full px-3 py-2 border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-xs font-semibold text-(--text-body) placeholder-(--text-faint) resize-none"
              rows="2"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="px-4 py-1.5 bg-linear-to-r from-(--brand) to-(--brand-strong) text-white text-xs font-bold rounded-lg hover:from-(--brand-strong) hover:to-(--brand-strong) disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {showDirectTransferModal && selectedDirectTransferTask && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/45 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-(--border-soft) flex flex-col">
            <div className="px-6 py-5 border-b border-(--border-soft) flex justify-between items-start bg-white">
              <div>
                <h3 className="text-base font-extrabold text-(--text-strong) flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-(--brand)" />
                  Transfer Task
                </h3>
                <p className="text-(--text-soft) text-[11px] font-semibold mt-0.5 leading-relaxed">
                  Move this task to another employee. The current employee will keep a transferred record for viewing.
                </p>
              </div>
              <button
                onClick={closeDirectTransferModal}
                className="text-(--text-faint) hover:text-(--text-strong) p-1 hover:bg-(--bg-subtle) rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-(--bg-subtle)/35 rounded-xl p-4 border border-(--border-soft) space-y-2.5 shadow-3xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                    Task
                  </p>
                  <p className="text-xs font-bold text-(--text-strong) line-clamp-2 leading-relaxed">
                    {renderRichText(
                      selectedDirectTransferTask.task ||
                      selectedDirectTransferTask.title,
                    )}
                  </p>
                </div>
                <div className="space-y-0.5 pt-2 border-t border-(--border-soft)">
                  <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                    Current Employee
                  </p>
                  <p className="text-xs font-bold text-(--text-strong)">
                    {getEmployeeNamesByIds(
                      selectedDirectTransferTask.assignedTo,
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-(--text-strong)">
                  Transfer To <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={directTransferTo}
                    onChange={(e) => setDirectTransferTo(e.target.value)}
                    className="app-input w-full px-4 py-2.5 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-xs transition-all duration-300 font-semibold text-(--text-body) appearance-none"
                  >
                    <option value="">Select employee</option>
                    {teamMembers
                      .filter(
                        (member) =>
                          !parseJsonArray(selectedDirectTransferTask.assignedTo)
                            .map(String)
                            .includes(String(member.id)),
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-(--text-faint) pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-(--text-strong)">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={directTransferReason}
                  onChange={(e) => setDirectTransferReason(e.target.value)}
                  rows="2"
                  placeholder="Why is this task being transferred?"
                  className="w-full px-4 py-2.5 border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-xs font-semibold text-(--text-body) placeholder-(--text-faint) resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-(--border-soft) bg-gray-50 flex gap-3 justify-end items-center">
              <button
                onClick={closeDirectTransferModal}
                className="px-4 py-2 rounded-xl border border-(--border-soft) text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) font-bold text-xs transition-all duration-300 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDirectTransfer}
                disabled={
                  isTransferSubmitting ||
                  !directTransferTo ||
                  !directTransferReason.trim()
                }
                className="px-4 py-2 rounded-xl bg-linear-to-br from-(--brand) to-(--brand-strong) text-white font-bold text-xs shadow-xs hover:from-(--brand-strong) hover:to-(--brand-strong) hover:-translate-y-px transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                {isTransferSubmitting ? "Transferring..." : "Transfer Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Extension Approval Modal (SuperAdmin Side) ── */}
      {showExtensionApproveModal && selectedExtensionTask && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/45 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-(--border-soft) flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-(--border-soft) flex justify-between items-start bg-white">
              <div>
                <h3 className="text-base font-extrabold text-(--text-strong) flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Review Extension Request
                </h3>
                <p className="text-(--text-soft) text-[11px] font-semibold mt-0.5">
                  Decide whether to approve or reject the employee's extension request.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExtensionApproveModal(false);
                  setSelectedExtensionTask(null);
                  setExtensionApprovalDeadline("");
                }}
                className="text-(--text-faint) hover:text-(--text-strong) p-1 hover:bg-(--bg-subtle) rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Task Details Summary */}
              <div className="bg-(--bg-subtle)/35 rounded-xl p-4 border border-(--border-soft) space-y-2.5 shadow-3xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                    Task Description
                  </p>
                  <p className="text-xs font-bold text-(--text-strong) line-clamp-2 leading-relaxed">
                    {renderRichText(
                      selectedExtensionTask.task || selectedExtensionTask.title,
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-(--border-soft)">
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
                          ).toLocaleDateString("en-GB")
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                      Requested New Date
                    </p>
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-xs font-bold">
                        {selectedExtensionTask.extensionDate
                          ? new Date(
                            selectedExtensionTask.extensionDate,
                          ).toLocaleDateString("en-GB")
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedExtensionTask.extensionReason && (
                  <div className="pt-2 border-t border-(--border-soft)">
                    <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider mb-1">
                      Reason for Extension
                    </p>
                    <div className="bg-white p-2 rounded-lg border border-(--border-soft) italic text-xs font-semibold text-(--text-soft) leading-relaxed">
                      "{selectedExtensionTask.extensionReason}"
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Action */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-(--text-strong)">
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
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-xs transition-all duration-300 font-semibold text-(--text-body) clean-date-input"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-(--brand) transition-colors pointer-events-none" />
                </div>
                <p className="text-[10px] text-(--text-faint) font-semibold italic">
                  * Note: You can override the requested date if needed.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-(--border-soft) bg-gray-50 flex gap-3 justify-end items-center">
              <button
                onClick={() =>
                  handleExtensionAction(selectedExtensionTask.id, "Reject")
                }
                className="px-4 py-2 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold text-xs transition-all duration-300 active:scale-95"
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
                className="px-4 py-2 rounded-xl bg-linear-to-br from-(--brand) to-(--brand-strong) text-white font-bold text-xs shadow-xs hover:from-(--brand-strong) hover:to-(--brand-strong) hover:-translate-y-px transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Approve & Set
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransferApproveModal && selectedTransferTask && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/45 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-(--border-soft) flex flex-col">
            <div className="px-6 py-5 border-b border-(--border-soft) flex justify-between items-start bg-white">
              <div>
                <h3 className="text-base font-extrabold text-(--text-strong) flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-pink-500" />
                  Review Transfer Request
                </h3>
                <p className="text-(--text-soft) text-[11px] font-semibold mt-0.5">
                  Approve to move this task to the requested employee, or reject.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTransferApproveModal(false);
                  setSelectedTransferTask(null);
                }}
                className="text-(--text-faint) hover:text-(--text-strong) p-1 hover:bg-(--bg-subtle) rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-(--bg-subtle)/35 rounded-xl p-4 border border-(--border-soft) space-y-2.5 shadow-3xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                    Task Description
                  </p>
                  <p className="text-xs font-bold text-(--text-strong) line-clamp-2 leading-relaxed">
                    {renderRichText(
                      selectedTransferTask.task || selectedTransferTask.title,
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-(--border-soft)">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                      Current Employee
                    </p>
                    <p className="text-xs font-bold text-(--text-strong)">
                      {getEmployeeNamesByIds(selectedTransferTask.assignedTo)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">
                      Transfer To
                    </p>
                    <p className="text-xs font-extrabold text-pink-700">
                      {getEmployeeNamesByIds(selectedTransferTask.transferTo)}
                    </p>
                  </div>
                </div>

                {selectedTransferTask.transferReason && (
                  <div className="pt-2 border-t border-(--border-soft)">
                    <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider mb-1">
                      Reason
                    </p>
                    <div className="bg-white p-2 rounded-lg border border-(--border-soft) italic text-xs font-semibold text-(--text-soft) leading-relaxed">
                      "{selectedTransferTask.transferReason}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-(--border-soft) bg-gray-50 flex gap-3 justify-end items-center">
              <button
                onClick={() =>
                  handleTransferAction(selectedTransferTask.id, "Reject")
                }
                className="px-4 py-2 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold text-xs transition-all duration-300 active:scale-95"
              >
                Reject Request
              </button>
              <button
                onClick={() =>
                  handleTransferAction(selectedTransferTask.id, "Approve")
                }
                className="px-4 py-2 rounded-xl bg-linear-to-br from-(--brand) to-(--brand-strong) text-white font-bold text-xs shadow-xs hover:from-(--brand-strong) hover:to-(--brand-strong) hover:-translate-y-px transition-all duration-300 active:scale-95"
              >
                Approve Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {showCannotCompleteApproveModal && selectedCannotCompleteTask && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/45 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-(--border-soft) flex flex-col">
            <div className="px-6 py-5 border-b border-(--border-soft) flex justify-between items-start bg-white">
              <div>
                <h3 className="text-base font-extrabold text-(--text-strong) flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Review Cannot Complete Request
                </h3>
                <p className="text-(--text-soft) text-[11px] font-semibold mt-0.5">
                  Reassign this task or reject the request to send it back.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCannotCompleteApproveModal(false);
                  setSelectedCannotCompleteTask(null);
                  setCannotCompleteReassignTo("");
                }}
                className="text-(--text-faint) hover:text-(--text-strong) p-1 hover:bg-(--bg-subtle) rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-(--bg-subtle)/35 rounded-xl p-4 border border-(--border-soft) space-y-2.5 shadow-3xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                    Task Description
                  </p>
                  <p className="text-xs font-bold text-(--text-strong) line-clamp-2 leading-relaxed">
                    {renderRichText(
                      selectedCannotCompleteTask.task ||
                      selectedCannotCompleteTask.title,
                    )}
                  </p>
                </div>

                <div className="space-y-0.5 pt-2 border-t border-(--border-soft)">
                  <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider">
                    Current Employee
                  </p>
                  <p className="text-xs font-bold text-(--text-strong)">
                    {getEmployeeNamesByIds(
                      selectedCannotCompleteTask.assignedTo,
                    )}
                  </p>
                </div>

                {selectedCannotCompleteTask.notCompletedReason && (
                  <div className="pt-2 border-t border-(--border-soft)">
                    <p className="text-[10px] text-(--text-faint) font-bold uppercase tracking-wider mb-1">
                      Reason
                    </p>
                    <div className="bg-white p-2 rounded-lg border border-(--border-soft) italic text-xs font-semibold text-(--text-soft) leading-relaxed">
                      "{selectedCannotCompleteTask.notCompletedReason}"
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-(--text-strong)">
                  Reassign To <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={cannotCompleteReassignTo}
                    onChange={(e) => setCannotCompleteReassignTo(e.target.value)}
                    className="app-input w-full px-4 py-2.5 bg-white border border-(--border-soft) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--brand)/20 focus:border-(--brand) text-xs transition-all duration-300 font-semibold text-(--text-body) appearance-none"
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
                  <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-(--text-faint) pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-(--border-soft) bg-gray-50 flex gap-3 justify-end items-center">
              <button
                onClick={() =>
                  handleCannotCompleteAction(
                    selectedCannotCompleteTask.id,
                    "Reject",
                  )
                }
                className="px-4 py-2 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold text-xs transition-all duration-300 active:scale-95"
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
                className="px-4 py-2 rounded-xl bg-linear-to-br from-(--brand) to-(--brand-strong) text-white font-bold text-xs shadow-xs hover:from-(--brand-strong) hover:to-(--brand-strong) hover:-translate-y-px transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Reassign Task
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
        .clean-date-input::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Task;
