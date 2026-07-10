import React, { useState, useEffect, useRef } from "react";
import useAuth from "../../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  FileText,
  Image,
  Paperclip,
  Download,
  Loader,
  RefreshCw,
  MessageSquare,
  History,
  Repeat,
  CheckCircle,
  CheckSquare,
  Archive,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import parse from "html-react-parser";

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

  return (
    <div className="rich-text-content wrap-break-word overflow-hidden">
      {parse(html, options)}
    </div>
  );
};

const getTaskPreview = (html, wordLimit = 4) => {
  if (!html) return "";
  const text = String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  const words = text.split(" ").filter(Boolean);
  return words.length > wordLimit
    ? `${words.slice(0, wordLimit).join(" ")}...`
    : text;
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

const AssignTask = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isReassignMode, setIsReassignMode] = useState(false);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [activeChatTask, setActiveChatTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showSubtasks, setShowSubtasks] = useState(false);
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
  const { user, token: authToken } = useAuth();
  const id = user?.id;

  const token = authToken || user?.token;
  const csaapToken = user?.csaapToken || token;

  const [showTotalTasksModal, setShowTotalTasksModal] = useState(false);
  const [showCompletedTasksModal, setShowCompletedTasksModal] = useState(false);
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

  const handleTransferApproveAction = async (action) => {
    if (!selectedTransferTask) return;
    try {
      await axios.put(
        `${API}/api/tasks/transfer-action/${selectedTransferTask.id}`,
        {
          action,
          userId: assignedBy,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      await fetchTasks();
      showSnackbar(
        action === "Approve"
          ? "Transfer approved — task reassigned ✓"
          : "Transfer request rejected",
        action === "Approve" ? "success" : "warning",
      );
      setShowTransferApproveModal(false);
      setSelectedTransferTask(null);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to process transfer request", "error");
    }
  };

  const handleCannotCompleteApproveAction = async (
    action,
    taskOverride = null,
  ) => {
    const targetTask = taskOverride || selectedCannotCompleteTask;
    if (!targetTask?.id) return;
    if (action === "Approve" && !cannotCompleteReassignTo) {
      showSnackbar(
        "Please select an employee to reassign this task",
        "warning",
      );
      return;
    }

    try {
      await axios.put(
        `${API}/api/tasks/cannot-complete-action/${targetTask.id}`,
        {
          action,
          newAssignee:
            action === "Approve" ? cannotCompleteReassignTo : undefined,
          userId: assignedBy,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
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
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to process cannot complete request", "error");
    }
  };
  const [showTeamMembersModal, setShowTeamMembersModal] = useState(false);

  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [tableDateFilter, setTableDateFilter] = useState("");
  const [activeStatFilter, setActiveStatFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Pending");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterAssignedTo, setFilterAssignedTo] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDeadlineDate, setFilterDeadlineDate] = useState("");
  const [filterAssignedDate, setFilterAssignedDate] = useState("");

  const [showExtensionApproveModal, setShowExtensionApproveModal] =
    useState(false);
  const [selectedExtensionTask, setSelectedExtensionTask] = useState(null);
  const [extensionApprovalDeadline, setExtensionApprovalDeadline] =
    useState("");

  const assignedBy = user?.employeeProfileId;

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Jagan Mohan",
      message: "Can someone help with the API documentation?",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "Ashirbad",
      message: "I'll be available in 30 minutes",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "Arghyarua",
      message: "Testing phase completed successfully",
      time: "11:15 AM",
    },
  ]);

  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    task: "",
    project: "",
    priority: "",
    deadlineDate: "",
    remark: "",
    assignedTo: [],
    subtasks: [{ name: "", completed: false }],
  });

  const [teamMembers, setTeamMembers] = useState([]);

  const assigners = [
    "Project Manager",
    "Tech Lead",
    "QA Manager",
    "Team Lead",
    "Department Head",
  ];

  const priorityOptions = ["Low", "Medium", "High", "Critical"];
  const statusOptions = [
    "Pending",
    "In Progress",
    "Completed",
    "Blocked",
    "Extension Pending",
    "Extended",
    "Reassigned",
    "Transferred",
    "Cannot Complete",
    "Not Completed",
    "Pending Approval",
    "Approved",
    "Transferred",
  ];

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const showSnackbar = (message, type = "info") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 5000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAssigneesDropdown(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotificationsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const companyId = user?.company_id;
      if (!companyId) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/clprojects`,
          {
            params: { company_id: companyId },
            headers: {
              Authorization: `Bearer ${csaapToken || token}`,
            },
          },
        );

        let projectData = res.data?.data || res.data || [];

        const mappedProjects = projectData.map((p) => ({
          id: p.id,
          name: p.project_name || p.name || "Unnamed Project",
          branch: p.project_code || p.branch || "General",
        }));

        const uniqueProjects = [
          ...new Map(mappedProjects.map((item) => [item.name, item])).values(),
        ];

        setProjects(uniqueProjects);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        showSnackbar("Failed to load projects", "error");
      }
    };

    if (user?.company_id) {
      fetchProjects();
    }
  }, [user?.company_id, csaapToken, token]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "https://csaapnodeapi.csaap.com/api/tenant/hrms/all-employees",
          {
            headers: {
              Authorization: `Bearer ${csaapToken || token}`,
            },
          },
        );

        let employeesData = [];
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        } else if (
          response.data?.employees &&
          Array.isArray(response.data.employees)
        ) {
          employeesData = response.data.employees;
        }

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

        const employees = employeesData.map((emp, index) => ({
          id: emp.id,
          name: emp.name,
          role: emp.postApplied || emp.department || "Employee",
          email: emp.email,
          officeEmail: emp.officeEmail || emp.office_email,
          avatarColor: colors[index % colors.length],
        }));

        setTeamMembers(employees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setTeamMembers([]);
        showSnackbar("Failed to fetch team members", "error");
      }
    };

    if (!csaapToken && !token) return;

    fetchEmployees();
  }, [csaapToken, token]);

  const filteredTeamMembers = teamMembers
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (tasks.length > 0) {
      const latestTask = tasks[tasks.length - 1];
      if (
        latestTask &&
        !newNotifications.some((n) => n.taskId === latestTask.id)
      ) {
        const titleText = latestTask.task || latestTask.title || "";
        const snippet50 =
          titleText.length > 50 ? titleText.substring(0, 50) : titleText;
        const snippet30 =
          titleText.length > 30 ? titleText.substring(0, 30) : titleText;
        const notification = {
          id: Date.now(),
          message: `New task assigned: "${snippet50}${titleText.length > snippet50.length ? "..." : ""}"`,
          type: "info",
          taskId: latestTask.id,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setNewNotifications((prev) => [notification, ...prev]);
        showSnackbar(
          `New task "${snippet30}${titleText.length > snippet30.length ? "..." : ""}" has been created!`,
          "success",
        );
      }
    }
  }, [tasks.length]);

  const getEmployeeNameById = (id) => {
    const employee = teamMembers.find((emp) => String(emp.id) === String(id));
    return employee ? employee.name : "Unknown";
  };

  const getEmployeeNamesByIds = (ids = []) => {
    const parsedIds = parseJsonArray(ids);
    const names = parsedIds
      .map((id) => getEmployeeNameById(id))
      .filter((name) => name && name !== "Unknown");
    return names.length ? names.join(", ") : "Unknown";
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeStatFilter === "Approved" && task.status !== "Approved")
      return false;
    if (
      activeStatFilter === "Completed" &&
      !["Completed", "Pending Approval"].includes(task.status)
    )
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

    if (tableSearchTerm) {
      const search = tableSearchTerm.toLowerCase();
      const taskName = (task.task || task.title || "").toLowerCase();
      const project = (task.project || "").toLowerCase();
      const assignedBy = getEmployeeNameById(task.assignedBy).toLowerCase();
      const priority = (task.priority || "").toLowerCase();
      const status = (task.status || "").toLowerCase();

      const assignedToNames = (
        Array.isArray(task.assignedTo) ? task.assignedTo : []
      )
        .map((id) => getEmployeeNameById(id).toLowerCase())
        .join(" ");

      if (
        !taskName.includes(search) &&
        !project.includes(search) &&
        !assignedBy.includes(search) &&
        !priority.includes(search) &&
        !status.includes(search) &&
        !assignedToNames.includes(search)
      ) {
        return false;
      }
    }

    if (tableDateFilter) {
      const taskDate = task.assignedDate
        ? new Date(task.assignedDate).toISOString().split("T")[0]
        : "";
      if (taskDate !== tableDateFilter) return false;
    }

    if (
      filterAssignedTo !== "All" &&
      !task.assignedTo
        .map((id) => String(id))
        .includes(String(filterAssignedTo))
    )
      return false;
    if (filterStatus !== "All" && task.status !== filterStatus) return false;
    if (filterDeadlineDate) {
      const deadline = task.deadlineDate || task.dueDate;
      const formattedDeadline = deadline
        ? new Date(deadline).toISOString().split("T")[0]
        : "";
      if (formattedDeadline !== filterDeadlineDate) return false;
    }

    if (filterAssignedDate) {
      const assigned = task.assignedDate || task.createdAt;
      const formattedAssigned = assigned
        ? new Date(assigned).toISOString().split("T")[0]
        : "";
      if (formattedAssigned !== filterAssignedDate) return false;
    }

    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
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
        "Cannot Complete",
      ];
      if (pendingStatuses.includes(status)) return 2;
      if (status === "Completed" || status === "Approved") return 3;
      return 4;
    };

    const priorityA = getPriority(a.status);
    const priorityB = getPriority(b.status);

    if (priorityA !== priorityB) return priorityA - priorityB;

    const dateA = new Date(a.assignedDate || a.createdAt || 0);
    const dateB = new Date(b.assignedDate || b.createdAt || 0);
    return dateB - dateA;
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleAssignee = (memberId) => {
    const isSelected = formData.assignedTo.includes(memberId);
    const updatedAssignees = isSelected
      ? formData.assignedTo.filter((id) => id !== memberId)
      : [...formData.assignedTo, memberId];

    setFormData({
      ...formData,
      assignedTo: updatedAssignees,
    });
  };

  const removeAssignee = (memberId) => {
    const updatedAssignees = formData.assignedTo.filter(
      (id) => id !== memberId,
    );
    setFormData({
      ...formData,
      assignedTo: updatedAssignees,
    });
  };

  const selectAllAssignees = () => {
    const allMembers = teamMembers.map((member) => member.id);
    setFormData({
      ...formData,
      assignedTo: allMembers,
    });
    showSnackbar("All team members selected", "info");
  };

  const clearAllAssignees = () => {
    setFormData({
      ...formData,
      assignedTo: [],
    });
    showSnackbar("All team members cleared", "info");
  };

  const handleSubtaskChange = (index, value) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index] = { ...newSubtasks[index], name: value };
    setFormData({ ...formData, subtasks: newSubtasks });
  };

  const handleSubtaskAssigneeChange = (index, assigneeId) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index] = {
      ...newSubtasks[index],
      assigned_to: assigneeId || null,
    };
    setFormData({ ...formData, subtasks: newSubtasks });
  };

  const addSubtask = () => {
    setFormData({
      ...formData,
      subtasks: [
        ...formData.subtasks,
        { name: "", completed: false, assigned_to: null },
      ],
    });
    showSnackbar("New subtask added", "info");
  };

  const removeSubtask = (index) => {
    const newSubtasks = formData.subtasks.filter((_, i) => i !== index);
    setFormData({ ...formData, subtasks: newSubtasks });
    showSnackbar("Subtask removed", "warning");
  };

  const API = import.meta.env.VITE_HRMS_BASE_URL || "http://localhost:5000";

  const company_id = user?.company_id;
  const slug = user?.slug;

  const fetchTasks = async () => {
    if (!assignedBy) {
      return;
    }

    try {
      const res = await axios.get(`${API}/api/tasks/tasks/assigned-by`, {
        params: { assignedBy, company_id },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      let tasksData = res.data;
      if (res.data?.data) {
        tasksData = res.data.data;
      }

      if (!Array.isArray(tasksData)) {
        tasksData = [];
      }

      const formattedTasks = tasksData.map((t) => ({
        ...t,
        title: t.title || t.task || "Untitled Task",
        task: t.task || t.title || "Untitled Task",
        status: t.status === "approved" ? "Approved" : t.status,
        assignedTo: parseJsonArray(t.assignedTo),
        transferTo: parseJsonArray(t.transferTo),
        subtasks: parseJsonArray(t.subtasks),
        history: parseJsonArray(t.history),
        attachedFiles: parseAttachmentArray(t.attachedFiles, "file"),
        images: parseAttachmentArray(t.images, "image"),
        attachments: parseAttachmentArray(t.attachments),
        deadlineDate: t.deadlineDate || t.dueDate,
        assignedDate:
          t.assignedDate ||
          t.startDate ||
          t.createdAt?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        extensionReason: t.extensionReason || "",
        transferReason: t.transferReason || "",
        notCompletedReason: t.notCompletedReason || "",
      }));

      setTasks(formattedTasks);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      showSnackbar("Failed to fetch tasks", "error");
    }
  };

  useEffect(() => {
    if (slug) {
      fetchTasks();
    }
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!company_id) {
      showSnackbar("Company id not available", "error");
      return;
    }

    if (!formData.task || !formData.task.trim()) {
      showSnackbar("Task description is required", "error");
      return;
    }

    if (!formData.project) {
      showSnackbar("Project is required", "error");
      return;
    }

    if (!formData.deadlineDate) {
      showSnackbar("Deadline date is required", "error");
      return;
    }

    if (formData.assignedTo.length === 0) {
      showSnackbar("Please assign at least one team member", "error");
      return;
    }

    setIsSubmitting(true);

    const assignedEmails = formData.assignedTo
      .map((id) => {
        const m = teamMembers.find((m) => m.id === id);
        return m ? m.officeEmail || m.email : null;
      })
      .filter(Boolean);

    const filteredSubtasks = formData.subtasks.filter(
      (st) => st.name && st.name.trim() !== "",
    );

    const updatedHistory = editingTask
      ? [
          ...(editingTask.history || []),
          {
            status: editingTask.status || "Pending",
            action: isReassignMode ? "reassigned" : "updated",
            task: editingTask.task || editingTask.title || "",
            newTask: formData.task.trim(),
            project: editingTask.project || "",
            priority: editingTask.priority || "",
            deadlineDate: editingTask.deadlineDate || editingTask.dueDate || "",
            assignedDate:
              editingTask.assignedDate ||
              editingTask.createdAt?.split("T")[0] ||
              "",
            remark: editingTask.remark || "",
            subtasks: filteredSubtasks,
            by: assignedBy,
            to: editingTask.assignedTo || [],
            reassignedTo: formData.assignedTo,
            remarks: formData.remark || editingTask.remark || "Task reassigned",
            previousCompletedDate: editingTask.completedDate || null,
            date: new Date().toISOString(),
          },
        ]
      : [
          {
            action: "assigned",
            task: formData.task.trim(),
            subtasks: filteredSubtasks,
            by: assignedBy,
            to: formData.assignedTo,
            remarks: formData.remark || "Task assigned",
            date: new Date().toISOString(),
          },
        ];

    const plainTextTask = formData.task
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const title =
      plainTextTask.substring(0, 50) + (plainTextTask.length > 50 ? "..." : "");

    const payload = {
      title: title,
      task: formData.task.trim(),
      project: formData.project,
      deadlineDate: formData.deadlineDate,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      assignedBy: assignedBy,
      assignedDate: new Date().toISOString().split("T")[0],
      remark: formData.remark || "",
      subtasks: filteredSubtasks,
      company_id: company_id,
      slug: user?.slug,
      emails: assignedEmails,
      status: isReassignMode
        ? "Reassigned"
        : editingTask
          ? editingTask.status
          : "Pending",
      history: updatedHistory,
    };

    try {
      if (editingTask) {
        await axios.put(`${API}/api/tasks/${editingTask.id}`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        showSnackbar("Task updated successfully!", "success");
      } else {
        const response = await axios.post(
          `${API}/api/tasks/employee-assign`,
          payload,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

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
        assignedTo: [],
        deadlineDate: "",
        priority: "",
        remark: "",
        project: "",
        subtasks: [{ name: "", completed: false }],
      });
    } catch (err) {
      console.error("Failed to save task", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        const errorMessage =
          err.response.data.message ||
          err.response.data.error ||
          "Failed to save task";
        showSnackbar(errorMessage, "error");
      } else {
        showSnackbar(
          "Failed to save task: " + (err.message || "Unknown error"),
          "error",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsReassignMode(false);
    setFormData({
      task: task.task,
      assignedTo: task.assignedTo,
      deadlineDate: task.deadlineDate,
      priority: task.priority,
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
    showSnackbar(`Editing task: ${task.task.substring(0, 30)}...`, "info");
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
              id: st.id,
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

  const handleView = (task) => {
    setViewingTask({
      ...task,
      assignedTo: parseJsonArray(task.assignedTo),
      subtasks: parseJsonArray(task.subtasks),
      history: parseJsonArray(task.history),
      attachedFiles: parseAttachmentArray(task.attachedFiles, "file"),
      images: parseAttachmentArray(task.images, "image"),
      attachments: parseAttachmentArray(task.attachments),
    });
    setShowSubtasks(false);
    setShowHistory(false);
    setOpenHistorySubtasks(null);
    showSnackbar(`Viewing task: ${task.task.substring(0, 30)}...`, "info");
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
          userId: assignedBy,
          role: user?.role,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
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
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API}/api/tasks/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await fetchTasks();
      showSnackbar("Task deleted successfully!", "warning");
    } catch (err) {
      console.error("Failed to delete task", err);
      showSnackbar("Failed to delete task", "error");
    }
  };

  const handleExtensionApprove = async (action) => {
    if (!selectedExtensionTask) return;
    if (action === "Approve" && !extensionApprovalDeadline) {
      showSnackbar("Please select a deadline date to approve", "warning");
      return;
    }
    try {
      await axios.put(
        `${API}/api/tasks/extension-action/${selectedExtensionTask.id}`,
        {
          action,
          newDeadline: extensionApprovalDeadline,
          userId: assignedBy,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      await fetchTasks();
      showSnackbar(
        action === "Approve"
          ? "Extension approved — deadline updated ✓"
          : "Extension request rejected",
        action === "Approve" ? "success" : "warning",
      );
      setShowExtensionApproveModal(false);
      setSelectedExtensionTask(null);
      setExtensionApprovalDeadline("");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to process extension request", "error");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find((item) => item.id === taskId);
      let updatedHistory = [...(task?.history || [])];

      if (newStatus === "Completed" && task) {
        updatedHistory.push({
          action: "completed",
          task: task.task || task.title,
          subtasks: task.subtasks || [],
          by: user?.employee_id,
          to: task.assignedTo || [],
          remarks: task.remark || "Task marked as completed",
          date: new Date().toISOString(),
        });
      }

      await axios.put(
        `${API}/api/tasks/${taskId}/status`,
        {
          status: newStatus,
          history: updatedHistory,
          userId: assignedBy,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      await fetchTasks();
      showSnackbar("Status updated successfully", "success");
    } catch (err) {
      console.error("Failed to update status", err);
      showSnackbar("Failed to update status", "error");
    }
  };

  const handleSubtaskToggle = async (taskId, subtaskId) => {
    try {
      await axios.put(
        `${API}/api/tasks/${taskId}/subtask/${subtaskId}`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      await fetchTasks();
      showSnackbar("Subtask updated", "info");
    } catch (err) {
      console.error("Failed to toggle subtask", err);
      showSnackbar("Failed to toggle subtask", "error");
    }
  };

  const handleNotCompletedReason = async (taskId, reason) => {
    try {
      await axios.put(
        `${API}/api/tasks/${taskId}/reason`,
        { reason },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      await fetchTasks();
      showSnackbar("Reason updated successfully", "success");
    } catch (err) {
      console.error("Failed to update reason", err);
      showSnackbar("Failed to update reason", "error");
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setIsReassignMode(false);
    setViewingTask(null);
    setFormData({
      task: "",
      assignedTo: [],
      deadlineDate: "",
      priority: "",
      remark: "",
      project: "",
      subtasks: [{ name: "", completed: false }],
    });
    showSnackbar("Task assignment cancelled", "info");
  };

  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = {
      id: chatMessages.length + 1,
      sender: "You",
      message: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage("");
    showSnackbar("Message sent successfully!", "info");
  };

  const clearNotifications = () => {
    setNewNotifications([]);
    setShowNotificationsDropdown(false);
    showSnackbar("All notifications cleared", "info");
  };

  const toggleNotificationsDropdown = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
  };

  const handleNotificationClick = (notification) => {
    const task = tasks.find((t) => t.id === notification.taskId);
    if (task) handleView(task);
    setNewNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    setShowNotificationsDropdown(false);
    const notifText = (notification?.message ?? "") + "";
    const notifSnippet =
      notifText.length > 40 ? `${notifText.substring(0, 40)}...` : notifText;
    showSnackbar(`Opening task: ${notifSnippet}`, "info");
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
      case "Extended":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "Reassigned":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Transferred":
        return "bg-violet-100 text-violet-800 border-violet-200";
      case "Cannot Complete":
      case "Not Completed":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusReasonDetails = (task) => {
    switch (task?.status) {
      case "Cannot Complete":
      case "Not Completed":
        return task?.notCompletedReason
          ? {
              label: "Cannot Complete Reason",
              value: task.notCompletedReason,
              className: "bg-red-50 border-red-200 text-red-700",
            }
          : null;
      case "Extended":
        return task?.extensionReason
          ? {
              label: "Extension Reason",
              value: task.extensionReason,
              className: "bg-cyan-50 border-cyan-200 text-cyan-700",
            }
          : null;
      case "Transferred":
      case "Transfer Pending":
        return task?.transferReason
          ? {
              label:
                task.status === "Transfer Pending"
                  ? "Transfer Request"
                  : "Transfer Reason",
              value: `${task.transferReason}${task.transferTo?.length ? `\n\nTransfer To: ${getEmployeeNamesByIds(task.transferTo)}` : ""}`,
              className: "bg-violet-50 border-violet-200 text-violet-700",
            }
          : null;
      default:
        return null;
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

  const getSnackbarColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "warning":
        return "bg-orange-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-blue-600";
    }
  };

  const getMemberAvatarColor = (memberName) => {
    const member = teamMembers.find((m) => m.name === memberName);
    return member ? member.avatarColor : "bg-gray-500";
  };

  return (
    <div className="w-full">
      {snackbar.open && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-100 ${getSnackbarColor(snackbar.type)} text-white px-6 py-4 rounded-xl shadow-2xl max-w-md w-full mx-4 transition-all duration-300 animate-slideUp`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {snackbar.type === "success" && (
                <Check className="w-5 h-5 mr-3" />
              )}
              {snackbar.type === "error" && (
                <AlertCircle className="w-5 h-5 mr-3" />
              )}
              {snackbar.type === "warning" && (
                <AlertTriangle className="w-5 h-5 mr-3" />
              )}
              {snackbar.type === "info" && <Info className="w-5 h-5 mr-3" />}
              <span className="font-medium">{snackbar.message}</span>
            </div>
            <button
              onClick={closeSnackbar}
              className="ml-4 text-white hover:text-gray-200 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
            <div className="h-full bg-white/30 animate-progressBar"></div>
          </div>
        </div>
      )}

      <div className="w-full p-2 sm:p-3 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Task Management
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Track, assign and collaborate on team tasks{" "}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => navigate("/employee/archived-tasks")}
              className="bg-white text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all text-sm"
              title="View Archived Tasks"
            >
              <Archive className="w-5 h-5 text-gray-500" />
              Archive
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
            >
              <Plus className="w-5 h-5" />
              Assign New Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              id: "All",
              label: "Total Tasks",
              value: tasks.length,
              color: "text-blue-600",
              icon: <FileText className="w-5 h-5" />,
              bg: "bg-blue-100",
            },
            {
              id: "Completed",
              label: "Completed",
              value: tasks.filter((t) =>
                ["Completed", "Pending Approval"].includes(t.status),
              ).length,
              color: "text-blue-600",
              icon: <Check className="w-5 h-5" />,
              bg: "bg-blue-100",
            },
            {
              id: "Incompleted",
              label: "Incompleted",
              value: tasks.filter((t) =>
                ["Pending", "In Progress", "Blocked"].includes(t.status),
              ).length,
              color: "text-purple-600",
              icon: <Clock className="w-5 h-5" />,
              bg: "bg-purple-100",
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
              color: "text-orange-600",
              icon: <Bell className="w-5 h-5" />,
              bg: "bg-orange-100",
            },
          ].map((card) => (
            <button
              key={card.id}
              onClick={() => {
                setActiveStatFilter(card.id);
              }}
              className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-200 text-left group hover:shadow-md transform hover:-translate-y-0.5 ${
                activeStatFilter === card.id
                  ? "border-indigo-500 ring-2 ring-indigo-500/20"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  {card.label}
                </h3>
                <div
                  className={`p-2 rounded-lg ${card.bg.replace("100", "50")} ${card.color.replace("text-", "text-")}`}
                >
                  {card.icon}
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500">
                {card.id === "All"
                  ? ""
                  : card.id === "Completed"
                    ? ""
                    : card.id === "Incompleted"
                      ? ""
                      : card.id === "Rejected"
                        ? ""
                        : ""}
              </p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-3 py-3 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeStatLabel}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {filteredTasks.length} result
                    {filteredTasks.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search tasks, projects, assigned to, assigned by, priority, status..."
                    value={tableSearchTerm}
                    onChange={(e) => setTableSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>

                <button
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${showMoreFilters ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  <Filter className="w-4 h-4" />
                  More Filter
                </button>

                {(tableSearchTerm ||
                  tableDateFilter ||
                  activeStatFilter !== "All" ||
                  filterAssignedTo !== "All" ||
                  filterStatus !== "All" ||
                  filterDeadlineDate ||
                  filterAssignedDate) && (
                  <button
                    onClick={() => {
                      setTableSearchTerm("");
                      setTableDateFilter("");
                      setActiveStatFilter("All");
                      setFilterAssignedTo("All");
                      setFilterStatus("All");
                      setFilterDeadlineDate("");
                      setFilterAssignedDate("");
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {showMoreFilters && (
            <div className="px-3 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Assigned To
                </label>
                <select
                  value={filterAssignedTo}
                  onChange={(e) => setFilterAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="All">All Team Members</option>
                  {[...teamMembers]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="All">All Statuses</option>
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "Pending Approval" ? "Reviewing" : opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={filterDeadlineDate}
                  onChange={(e) => setFilterDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Assigned Date
                </label>
                <input
                  type="date"
                  value={filterAssignedDate}
                  onChange={(e) => setFilterAssignedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task & Project
                  </th>
                  <th className="px-1 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-1 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Assigned By
                  </th>
                  <th className="px-1 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-1 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-1 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-1 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-1 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-1 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className="font-semibold text-gray-900 max-w-30 sm:max-w-37.5 lg:max-w-50"
                            title={String(task.task || task.title || "")
                              .replace(/<[^>]*>/g, " ")
                              .replace(/\s+/g, " ")
                              .trim()}
                          >
                            {getTaskPreview(task.task || task.title, 4)}
                          </div>
                          {(() => {
                            const movement = [...(task.history || [])]
                              .reverse()
                              .find((h) =>
                                ["reassigned", "transferred"].includes(
                                  h.action,
                                ),
                              );
                            if (!movement) return null;
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                                {movement.action === "reassigned"
                                  ? "Reassigned"
                                  : "Transferred"}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                            {task.project}
                          </span>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {task.subtasks.length} subtasks
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-1 py-4">
                      <div className="flex -space-x-2">
                        {task.assignedTo.slice(0, 3).map((memberId, idx) => {
                          const member = teamMembers.find(
                            (m) => String(m.id) === String(memberId),
                          );
                          const name = member ? member.name : "Unknown";
                          return (
                            <div
                              key={idx}
                              className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${getMemberAvatarColor(name)}`}
                              title={name}
                            >
                              {getInitials(name)}
                            </div>
                          );
                        })}
                        {task.assignedTo.length > 3 && (
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700">
                            +{task.assignedTo.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {getEmployeeNameById(task.assignedBy) ||
                            task.assignedBy ||
                            "Admin"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {task.assignedDate
                            ? new Date(task.assignedDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-1 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-1 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(task.status)}`}
                      >
                        {task.status === "Pending Approval"
                          ? "Reviewing"
                          : task.status}
                      </span>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {task.deadlineDate
                            ? new Date(task.deadlineDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-1 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(task)}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {task.status === "Extension Pending" &&
                          String(assignedBy) === String(task.assignedBy) && (
                            <button
                              onClick={() => {
                                setSelectedExtensionTask(task);
                                setExtensionApprovalDeadline(
                                  task.extensionDate
                                    ? new Date(task.extensionDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : "",
                                );
                                setShowExtensionApproveModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors duration-200"
                              title="Review Extension Request"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        {task.status === "Cannot Complete" &&
                          String(assignedBy) === String(task.assignedBy) && (
                            <button
                              onClick={() => {
                                setSelectedCannotCompleteTask(task);
                                setCannotCompleteReassignTo("");
                                setShowCannotCompleteApproveModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors duration-200"
                              title="Review Cannot Complete Request"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        {task.status === "Pending Approval" &&
                          String(task.assignedBy) === String(assignedBy) && (
                            <button
                              onClick={() =>
                                handleStatusChange(task.id, "Approved")
                              }
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-200"
                              title="Mark as Completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {isReassignMode
                    ? "Reassign Task"
                    : editingTask
                      ? "Edit Task"
                      : "Assign New Task"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {isReassignMode
                    ? "Reassign task details"
                    : editingTask
                      ? "Update task details"
                      : "Create and assign a new task to team members"}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-500 rounded-full p-2 hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-6">
              <div className="space-y-6">
                {editingTask && (
                  <div className="space-y-4">
                    {editingTask.history && editingTask.history.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                          <History className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Task History
                          </span>
                        </div>
                        <div className="px-4 py-4">
                          <div className="relative pl-6">
                            <div className="absolute left-2.25 top-3 bottom-3 w-px bg-gray-200" />
                            <div className="space-y-3">
                              {[...editingTask.history]
                                .reverse()
                                .map((h, idx) => {
                                  const actionColors = {
                                    assigned: {
                                      dot: "bg-blue-500",
                                      badge: "bg-blue-50 text-blue-700",
                                    },
                                    updated: {
                                      dot: "bg-slate-500",
                                      badge: "bg-slate-50 text-slate-700",
                                    },
                                    reassigned: {
                                      dot: "bg-amber-500",
                                      badge: "bg-amber-50 text-amber-700",
                                    },
                                    completed: {
                                      dot: "bg-green-500",
                                      badge: "bg-green-50 text-green-700",
                                    },
                                  };
                                  const style = actionColors[h.action] || {
                                    dot: "bg-gray-400",
                                    badge: "bg-gray-100 text-gray-600",
                                  };
                                  return (
                                    <div key={idx} className="relative">
                                      <div
                                        className={`absolute -left-6 top-3 w-3.5 h-3.5 rounded-full border-2 border-white ${style.dot}`}
                                      />
                                      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                                          <span
                                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${style.badge}`}
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

                                        <div className="px-3 py-2.5">
                                          <div className="text-[12px] text-gray-700 leading-relaxed wrap-break-word overflow-hidden">
                                            {h.action === "reassigned"
                                              ? renderRichText(h.newTask) ||
                                                "No description"
                                              : renderRichText(h.task) ||
                                                "No description"}
                                          </div>
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

                <div>
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="task"
                  >
                    Task Description *
                  </label>
                  <div className="bg-white rounded-xl">
                    <ReactQuill
                      theme="snow"
                      value={formData.task}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, task: value }))
                      }
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Describe the task in detail. Be specific about requirements, deliverables, and expectations..."
                      className="h-40 mb-12 sm:mb-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-semibold mb-2"
                      htmlFor="project"
                    >
                      Project *
                    </label>
                    <select
                      id="project"
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                      required
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option
                          key={`${project.id}-${project.branch}`}
                          value={project.name}
                        >
                          {project.name} ({project.branch})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-semibold mb-2"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        required
                      />
                      <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-semibold mb-2"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl appearance-none"
                        required
                      >
                        <option value="" disabled hidden>
                          Select Priority
                        </option>

                        {priorityOptions.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div ref={dropdownRef} className="relative">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Assign To *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setShowAssigneesDropdown(!showAssigneesDropdown)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-wrap">
                          {formData.assignedTo.length === 0 ? (
                            <span className="text-gray-400">
                              Select team members...
                            </span>
                          ) : (
                            formData.assignedTo.map((id, idx) => {
                              const person = teamMembers.find(
                                (m) => m.id === id,
                              );
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
                                >
                                  {person?.name}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAssignee(id);
                                    }}
                                    className="hover:text-blue-900"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showAssigneesDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showAssigneesDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-hidden">
                          <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search team members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={selectAllAssignees}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={clearAllAssignees}
                                className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {filteredTeamMembers.map((member) => (
                              <label
                                key={member.id}
                                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${formData.assignedTo.includes(member.id) ? "border-blue-500 bg-blue-50" : "border-transparent"}`}
                                onClick={() => {
                                  toggleAssignee(member.id);
                                  setShowAssigneesDropdown(false);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.assignedTo.includes(
                                    member.id,
                                  )}
                                  onChange={() => toggleAssignee(member.id)}
                                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${member.avatarColor}`}
                                >
                                  {getInitials(member.name)}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {member.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {member.role}
                                  </div>
                                </div>
                                {formData.assignedTo.includes(member.id) && (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </label>
                            ))}
                          </div>
                          <div className="p-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
                            {formData.assignedTo.length} member
                            {formData.assignedTo.length !== 1 ? "s" : ""}{" "}
                            selected
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="remark"
                  >
                    Additional Remark
                  </label>
                  <textarea
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm placeholder-gray-400"
                    rows="2"
                    placeholder="Add any special instructions, notes, or context for the assigned team members..."
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-1">
                        Subtasks
                      </label>
                      <p className="text-xs text-gray-500">
                        Break down the main task into smaller, manageable items
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Subtask
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.subtasks.map((subtask, index) => {
                      const parentAssignees = teamMembers.filter((m) =>
                        formData.assignedTo.includes(m.id),
                      );
                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <span className="text-gray-500 text-sm">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={subtask.name}
                            onChange={(e) =>
                              handleSubtaskChange(index, e.target.value)
                            }
                            placeholder={`Describe subtask ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <select
                            value={
                              subtask.assigned_to || subtask.assignedTo || ""
                            }
                            onChange={(e) =>
                              handleSubtaskAssigneeChange(index, e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                          >
                            <option value="">Unassigned</option>
                            {parentAssignees.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                          {formData.subtasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubtask(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 self-end sm:self-auto"
                              title="Remove subtask"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isReassignMode ? (
                          <>
                            <Repeat className="w-4 h-4" />
                            Reassign Task
                          </>
                        ) : editingTask ? (
                          <>
                            <Check className="w-4 h-4" />
                            Update Task
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Assign Task
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-3xl my-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  Task details
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Complete information about this task
                </p>
              </div>
              <button
                onClick={() => setViewingTask(null)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-5">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(viewingTask.priority)}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {viewingTask.priority} priority
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingTask.status)}`}
                    >
                      {viewingTask.status}
                    </span>
                  </div>
                  {!["Completed", "Transferred"].includes(
                    viewingTask.status,
                  ) && (
                    <button
                      onClick={() => {
                        handleEdit(viewingTask);
                        setViewingTask(null);
                      }}
                      className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                <div className="text-sm font-semibold text-gray-900 leading-snug mb-4 wrap-break-word overflow-hidden">
                  {renderRichText(viewingTask.task || viewingTask.title)}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Assigned:{" "}
                    {viewingTask.assignedDate
                      ? new Date(viewingTask.assignedDate).toLocaleDateString()
                      : "—"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Due:{" "}
                    {viewingTask.deadlineDate
                      ? new Date(viewingTask.deadlineDate).toLocaleDateString()
                      : "—"}
                  </span>
                  {(viewingTask.status === "Completed" ||
                    viewingTask.status === "Approved") &&
                    viewingTask.completedDate && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1.5 text-green-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed:{" "}
                          {new Date(
                            viewingTask.completedDate,
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                </div>
              </div>

              {viewingTask.subtasks?.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 cursor-pointer"
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                      Subtasks
                    </span>

                    <span className="ml-auto text-xs text-gray-400">
                      {completedCount} of {totalCount} done
                    </span>

                    {showSubtasks ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                    )}
                  </div>

                  {showSubtasks && (
                    <div className="p-4">
                      <div className="h-1 bg-gray-100 rounded-full mb-4">
                        <div
                          className="h-1 bg-green-600 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="space-y-2">
                        {viewingTask.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleSubtaskToggle(
                                    viewingTask.id,
                                    subtask.id,
                                  )
                                }
                                className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  subtask.completed
                                    ? "bg-green-600 border-green-600"
                                    : "border-gray-300 hover:border-green-500"
                                }`}
                              >
                                {subtask.completed && (
                                  <Check
                                    className="w-2.5 h-2.5 text-white"
                                    strokeWidth={3}
                                  />
                                )}
                              </button>

                              <span
                                className={`text-xs ${
                                  subtask.completed
                                    ? "text-gray-400 line-through"
                                    : "text-gray-800"
                                }`}
                              >
                                {subtask.name}
                                {(subtask.assigned_to ||
                                  subtask.assignedTo) && (
                                  <span className="text-[10px] text-gray-400 ml-2 font-medium bg-gray-100 px-1.5 py-0.5 rounded-md">
                                    @
                                    {getEmployeeNameById(
                                      subtask.assigned_to || subtask.assignedTo,
                                    )}
                                  </span>
                                )}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                subtask.completed
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
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

              {(viewingTask.attachedFiles?.length > 0 ||
                viewingTask.images?.length > 0 ||
                viewingTask.attachments?.length > 0) && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                      Attachments
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
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
                            className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                          >
                            {attachment.type === "image" ? (
                              <Image className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            {attachmentUrl ? (
                              <a
                                href={attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-w-0 flex-1 truncate text-xs font-medium text-blue-700 hover:underline"
                              >
                                {attachment.name}
                              </a>
                            ) : (
                              <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                                {attachment.name}
                              </span>
                            )}
                            {attachmentUrl && (
                              <a
                                href={attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-700"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                      Project info
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {viewingTask.project}
                        </p>
                        <p className="text-xs text-gray-400">Project</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getEmployeeNameById(viewingTask.assignedBy)}
                        </p>
                        <p className="text-xs text-gray-400">Assigned by</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                      Team members
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {viewingTask.assignedTo?.length > 0 ? (
                      viewingTask.assignedTo.map((memberId) => {
                        const member = teamMembers.find(
                          (m) => m.id === memberId,
                        );
                        const name = member?.name ?? "Unknown";
                        return (
                          <div
                            key={memberId}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 ${getMemberAvatarColor(name)}`}
                            >
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Team member
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-400">
                        No members assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {viewingTask.remark && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                      Remark
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-xs text-gray-600 leading-relaxed border-l-2 border-gray-300 pl-3 wrap-break-word overflow-hidden">
                      {renderRichText(viewingTask.remark)}
                    </div>
                  </div>
                </div>
              )}

              {viewingTask.history?.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 cursor-pointer"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="w-3.5 h-3.5 text-gray-400" />

                    <span className="text-xs font-semibold text-gray-700">
                      Task history
                    </span>

                    <span className="ml-1 text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 text-gray-500">
                      {viewingTask.history.length}
                    </span>

                    {showHistory ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                    )}
                  </div>

                  {showHistory && (
                    <div className="p-4 pl-6">
                      {[...viewingTask.history].reverse().map((h, i) => {
                        const STYLES = {
                          assigned: {
                            dot: "bg-blue-500",
                            badge: "bg-blue-50 text-blue-800",
                          },
                          reassigned: {
                            dot: "bg-amber-500",
                            badge: "bg-amber-50 text-amber-800",
                          },
                          completed: {
                            dot: "bg-green-600",
                            badge: "bg-green-50 text-green-800",
                          },
                        };

                        const s = STYLES[h.action] ?? {
                          dot: "bg-gray-300",
                          badge: "bg-gray-100 text-gray-500",
                        };

                        const remark = h.remarks || h.remark;
                        const reversedHistory = [
                          ...viewingTask.history,
                        ].reverse();
                        const isLast = i === reversedHistory.length - 1;
                        const historySubtasks = parseJsonArray(h.subtasks);
                        const historySubtaskKey = `${h.action || "history"}-${h.date || i}-${i}`;
                        const isHistorySubtasksOpen =
                          openHistorySubtasks === historySubtaskKey;

                        return (
                          <div key={i} className="relative flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full border-2 border-white mt-1 ${s.dot}`}
                              />
                              {!isLast && (
                                <div className="w-px flex-1 bg-gray-200 my-1" />
                              )}
                            </div>

                            <div className={`flex-1 ${!isLast ? "pb-4" : ""}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${s.badge}`}
                                >
                                  {h.action || "updated"}
                                </span>

                                <span className="text-[11px] text-gray-400">
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
                                <div className="text-xs text-gray-600 mb-1 wrap-break-word overflow-hidden">
                                  {renderRichText(h.task)}
                                </div>
                              )}

                              {["reassigned", "transferred"].includes(
                                h.action,
                              ) &&
                                h.reassignedTo && (
                                  <div className="text-[10px] text-gray-500 mt-1 font-medium wrap-break-word overflow-hidden">
                                    {h.action === "reassigned"
                                      ? "Reassigned"
                                      : "Transferred"}{" "}
                                    to:{" "}
                                    <span className="text-gray-700">
                                      {renderRichText(
                                        getEmployeeNamesByIds(h.reassignedTo),
                                      )}
                                    </span>
                                  </div>
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
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                  >
                                    <CheckSquare className="w-3 h-3 text-gray-400" />
                                    {historySubtasks.length} subtask
                                    {historySubtasks.length > 1 ? "s" : ""}
                                    {isHistorySubtasksOpen ? (
                                      <ChevronUp className="w-3 h-3 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3 text-gray-400" />
                                    )}
                                  </button>

                                  {isHistorySubtasksOpen && (
                                    <div className="mt-2 space-y-1 rounded-lg border border-gray-100 bg-gray-50 p-2">
                                      {historySubtasks.map(
                                        (subtask, subtaskIndex) => (
                                          <div
                                            key={
                                              subtask.id ??
                                              `${historySubtaskKey}-${subtaskIndex}`
                                            }
                                            className="flex items-center justify-between gap-3 rounded-md bg-white px-2.5 py-1.5 text-[11px] text-gray-700"
                                          >
                                            <span className="min-w-0 flex-1 truncate">
                                              {subtask.name ||
                                                subtask.title ||
                                                `Subtask ${subtaskIndex + 1}`}
                                            </span>
                                            <span
                                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                subtask.completed
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
                                <div className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-2 mt-1 wrap-break-word overflow-hidden">
                                  "{renderRichText(remark)}"
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {getStatusReasonDetails(viewingTask) && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-700">
                      {getStatusReasonDetails(viewingTask).label}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-3 text-xs ${getStatusReasonDetails(viewingTask).className}`}
                  >
                    {renderRichText(getStatusReasonDetails(viewingTask).value)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              {!["Pending Approval", "Reviewing", "Transferred"].includes(
                viewingTask.status,
              ) && (
                <button
                  onClick={() => {
                    handleEdit(viewingTask);
                    setViewingTask(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-blue-50 text-xs font-medium rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
              )}

              {!["Completed", "Approved", "Transferred"].includes(
                viewingTask.status,
              ) && (
                <button
                  onClick={() => openDirectTransferModal(viewingTask)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-pink-700 text-pink-50 text-xs font-medium rounded-lg hover:bg-pink-800 transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" /> Transfer
                </button>
              )}

              {["Approved", "Pending Approval"].includes(
                viewingTask.status,
              ) && (
                <button
                  onClick={() => handleReassign(viewingTask)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-amber-50 text-xs font-medium rounded-lg hover:bg-amber-800 transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" /> Reassign
                </button>
              )}

              {viewingTask.status === "Pending Approval" &&
                String(viewingTask.assignedBy) === String(assignedBy) && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(viewingTask.id, "Approved");
                        setViewingTask(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-green-50 text-xs font-medium rounded-lg hover:bg-green-800 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>

                    <button
                      onClick={() => {
                        handleStatusChange(viewingTask.id, "Rejected");
                        setViewingTask(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-700 text-red-50 text-xs font-medium rounded-lg hover:bg-red-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}

              {viewingTask.status !== "Transferred" && (
                <button
                  onClick={() => {
                    handleDelete(viewingTask.id);
                    setViewingTask(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 text-rose-50 text-xs font-medium rounded-lg hover:bg-rose-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDirectTransferModal && selectedDirectTransferTask && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-linear-to-r from-indigo-50 to-white">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-indigo-500" />
                  Direct Transfer Task
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Transfer this task directly to another employee.
                </p>
              </div>
              <button
                onClick={closeDirectTransferModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/80 shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    Task
                  </p>
                  <div className="text-sm font-semibold text-gray-800 line-clamp-2 wrap-break-word overflow-hidden">
                    {renderRichText(
                      selectedDirectTransferTask.task ||
                        selectedDirectTransferTask.title,
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Transfer To *
                </label>
                <select
                  value={directTransferTo}
                  onChange={(e) => setDirectTransferTo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Transfer Reason *
                </label>
                <textarea
                  value={directTransferReason}
                  onChange={(e) => setDirectTransferReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-25"
                  placeholder="Enter reason for direct transfer..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/80 rounded-b-2xl">
              <button
                onClick={closeDirectTransferModal}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDirectTransfer}
                disabled={isTransferSubmitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50"
              >
                {isTransferSubmitting ? "Transferring..." : "Transfer Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExtensionApproveModal && selectedExtensionTask && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-linear-to-r from-amber-50 to-white">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Review Extension Request
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Approve or reject the deadline extension request.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExtensionApproveModal(false);
                  setSelectedExtensionTask(null);
                  setExtensionApprovalDeadline("");
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/80 shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    Task
                  </p>
                  <div className="text-sm font-semibold text-gray-800 line-clamp-2 wrap-break-word overflow-hidden">
                    {renderRichText(
                      selectedExtensionTask.task || selectedExtensionTask.title,
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Current Deadline
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedExtensionTask.deadlineDate
                        ? selectedExtensionTask.deadlineDate.split("T")[0]
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Requested Deadline
                    </p>
                    <p className="text-sm font-medium text-amber-600">
                      {selectedExtensionTask.extensionRequestedDate
                        ? selectedExtensionTask.extensionRequestedDate.split(
                            "T",
                          )[0]
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {selectedExtensionTask.extensionReason && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Reason for Extension
                    </p>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic wrap-break-word overflow-hidden">
                      {renderRichText(selectedExtensionTask.extensionReason)}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Approve with Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={extensionApprovalDeadline}
                    onChange={(e) =>
                      setExtensionApprovalDeadline(e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white focus:border-transparent text-sm transition-all duration-300 font-medium"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors pointer-events-none" />
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  * Tip: You can override the requested date if needed.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex gap-3 justify-end items-center">
              <button
                onClick={() => handleExtensionApprove("Reject")}
                className="px-6 py-2.5 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all duration-300 active:scale-95"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleExtensionApprove("Approve")}
                disabled={!extensionApprovalDeadline}
                className="px-6 py-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-px transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Approve & Set Deadline
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransferApproveModal && selectedTransferTask && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-linear-to-r from-pink-50 to-white">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-pink-500" />
                  Review Transfer Request
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Approve to move this task to the requested employee, or reject
                  to keep it with the current employee.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTransferApproveModal(false);
                  setSelectedTransferTask(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/80 shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Task
                  </p>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {renderRichText(
                      selectedTransferTask.task || selectedTransferTask.title,
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Current Employee
                    </p>
                    <p className="text-xs font-medium text-gray-700">
                      {getEmployeeNamesByIds(selectedTransferTask.assignedTo)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">
                      Transfer To
                    </p>
                    <p className="text-xs font-bold text-pink-700">
                      {getEmployeeNamesByIds(selectedTransferTask.transferTo)}
                    </p>
                  </div>
                </div>

                {selectedTransferTask.transferReason && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Reason
                    </p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                      "{renderRichText(selectedTransferTask.transferReason)}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex gap-3 justify-end items-center">
              <button
                onClick={() => handleTransferApproveAction("Reject")}
                className="px-6 py-2.5 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all duration-300 active:scale-95"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleTransferApproveAction("Approve")}
                className="px-6 py-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-px transition-all duration-300 active:scale-95"
              >
                Approve Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {showCannotCompleteApproveModal && selectedCannotCompleteTask && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-linear-to-r from-rose-50 to-white">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Review Cannot Complete Request
                </h3>
                <p className="text-gray-500 text-xs mt-1">
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
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/80 shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Task
                  </p>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {renderRichText(
                      selectedCannotCompleteTask.task ||
                        selectedCannotCompleteTask.title,
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Current Employee
                    </p>
                    <p className="text-xs font-medium text-gray-700">
                      {getEmployeeNamesByIds(
                        selectedCannotCompleteTask.assignedTo,
                      )}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                      Status
                    </p>
                    <p className="text-xs font-bold text-rose-700">
                      {selectedCannotCompleteTask.status}
                    </p>
                  </div>
                </div>

                {selectedCannotCompleteTask.notCompletedReason && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Reason
                    </p>
                    <div className="bg-white/50 p-2 rounded-lg border border-gray-100 italic text-xs text-gray-600 leading-relaxed ring-1 ring-rose-50">
                      "{selectedCannotCompleteTask.notCompletedReason}"
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Reassign To <span className="text-red-500">*</span>
                </label>
                <select
                  value={cannotCompleteReassignTo}
                  onChange={(e) => setCannotCompleteReassignTo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white focus:border-transparent text-sm transition-all duration-300 font-medium"
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

            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex gap-3 justify-end items-center">
              <button
                onClick={() => handleCannotCompleteApproveAction("Reject")}
                className="px-6 py-2.5 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all duration-300 active:scale-95"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleCannotCompleteApproveAction("Approve")}
                disabled={!cannotCompleteReassignTo}
                className="px-6 py-2.5 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-px transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Reassign Task
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        html,
        body {
          overflow-x: hidden;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        .animate-progressBar {
          animation: progressBar 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default AssignTask;
