import axios from "axios";
import { motion } from "framer-motion";
import parse from "html-react-parser";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Frown,
  Image,
  Info,
  MessageCircle,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePermission } from "../../../../hooks/usePermission";
import { useAuth } from "../../../../hooks/useAuth";

const renderRichText = (html) => {
  if (!html) return null;

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

  return <>{parse(cleanHtml, options)}</>;
};

const getPlainText = (value) => {
  if (!value) return "";

  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeAttachment = (file, fallbackType = "file") => {
  if (!file) return null;
  if (typeof file === "string") {
    return {
      name: file.split("/").pop() || file,
      url: file.startsWith("http") || file.startsWith("/uploads") ? file : "",
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

const getAttachmentUrl = (attachment) => {
  const url = attachment?.url || attachment?.path || "";
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const normalized = url.startsWith("/uploads")
    ? url
    : `/uploads/${url.replace(/^\/+/, "")}`;
  return `${import.meta.env.VITE_HRMS_BASE_URL}${normalized}`;
};

const parseJsonAttachments = (value, fallbackType = "file") => {
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

const MyTask = () => {
  const { has } = usePermission();
  const canUpdate = has("hrms.self_service.tasks.update");

  const [helpRequests, setHelpRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showCannotCompleteModal, setShowCannotCompleteModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showRequestHelpModal, setShowRequestHelpModal] = useState(false);
  const [assignedDateFilter, setAssignedDateFilter] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReceiveHelpModal, setShowReceiveHelpModal] = useState(false);
  const [showWantHelpModal, setShowWantHelpModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [cannotCompleteReason, setCannotCompleteReason] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [urgencyLevel, setUrgencyLevel] = useState("Medium");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [receiveHelpFiles, setReceiveHelpFiles] = useState([]);
  const [receiveHelpImages, setReceiveHelpImages] = useState([]);

  const [wantHelpEmployee, setWantHelpEmployee] = useState("");
  const [wantHelpDescription, setWantHelpDescription] = useState("");
  const [wantHelpFiles, setWantHelpFiles] = useState([]);
  const [wantHelpImages, setWantHelpImages] = useState([]);
  const [showWantHelpEmployeeList, setShowWantHelpEmployeeList] =
    useState(false);

  const [helpReplies, setHelpReplies] = useState({});

  const [receiveHelpReply, setReceiveHelpReply] = useState("");

  const [activeTab, setActiveTab] = useState("Pending");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterAssignedBy, setFilterAssignedBy] = useState("All");
  const [filterDeadlineDate, setFilterDeadlineDate] = useState("");
  const [employees, setEmployees] = useState([]);

  const [showChat, setShowChat] = useState(false);

  const [message, setMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const { user } = useAuth();

  const emp_id = user?.employeeProfileId;

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    helpRequests: 0,
    transferred: 0,
  });

  const categories = [
    "All Projects",
    ...new Set(
      tasks.map((task) => task.category || task.project).filter(Boolean),
    ),
  ];

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
    {
      id: 4,
      sender: "You",
      message: "Working on the quarterly report, need some data",
      time: "11:30 AM",
    },
    {
      id: 5,
      sender: "Rajesh Kumar",
      message: "Team meeting at 2 PM to discuss project milestones",
      time: "12:15 PM",
    },
    {
      id: 6,
      sender: "Priya Sharma",
      message: "Client database update is 75% complete",
      time: "12:45 PM",
    },
  ]);

  const statuses =
    activeTab === "Completed"
      ? ["All", "Completed", "Approved", "Reviewing"]
      : [
          "All",
          "Pending",
          "In Progress",
          "Cannot Complete",
          "Reassigned",
          "Overdue",
          "Requests",
        ];

  const completedStatuses = ["Completed", "Approved", "Reviewing"];

  const fetchHelpReplies = async (taskId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/help-replies/${taskId}`,
      );

      if (response.data.success) {
        setHelpReplies((prev) => ({
          ...prev,
          [taskId]: response.data.replies,
        }));
      }
    } catch (error) {
      console.error("Error fetching help replies:", error);
    }
  };

  useEffect(() => {
    if (!tasks.length) return;

    tasks.forEach((task) => {
      if (
        task.helpRequests &&
        task.helpRequests.length > 0 &&
        !helpReplies[task.id]
      ) {
        fetchHelpReplies(task.id);
      }
    });
  }, [tasks, helpReplies]);

  const normalizeTask = (task, extraHelpRequests = []) => {
    const parseIdArray = (value) => {
      if (Array.isArray(value)) {
        return value
          .map((id) => String(id))
          .filter((id) => id && id !== "null");
      }
      if (!value) return [];
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return Array.isArray(parsed)
          ? parsed.map((id) => String(id)).filter((id) => id && id !== "null")
          : [];
      } catch {
        return [];
      }
    };

    let parsedAssignedTo = [];
    if (task.assignedTo) {
      try {
        const parsed =
          typeof task.assignedTo === "string"
            ? JSON.parse(task.assignedTo)
            : task.assignedTo;
        parsedAssignedTo = Array.isArray(parsed)
          ? parsed.map((id) => String(id))
          : [];
      } catch {
        parsedAssignedTo = [];
      }
    }

    let parsedHelpRequests = [];
    if (task.helpRequests) {
      try {
        const parsed =
          typeof task.helpRequests === "string"
            ? JSON.parse(task.helpRequests)
            : task.helpRequests;
        parsedHelpRequests = Array.isArray(parsed) ? parsed : [];
      } catch {
        parsedHelpRequests = [];
      }
    }

    if (extraHelpRequests && extraHelpRequests.length) {
      parsedHelpRequests = [...parsedHelpRequests, ...extraHelpRequests];
    }

    if (parsedHelpRequests.length > 0 && helpReplies[task.id]) {
      parsedHelpRequests = parsedHelpRequests.map((hr) => {
        const reply = helpReplies[task.id]?.find(
          (r) =>
            String(r.fromId) === String(hr.toId) ||
            String(r.toId) === String(hr.fromId),
        );
        return {
          ...hr,
          reply: reply?.reply,
          replyBy: reply?.replyBy,
          replyAt: reply?.replyAt,
        };
      });
    }

    if (parsedHelpRequests.length) {
      const unique = {};
      parsedHelpRequests.forEach((hr) => {
        if (hr && hr.id != null) unique[hr.id] = hr;
      });
      parsedHelpRequests = Object.values(unique);
    }

    let parsedSubtasks = [];
    if (task.subtasks) {
      try {
        const parsed =
          typeof task.subtasks === "string"
            ? JSON.parse(task.subtasks)
            : task.subtasks;
        parsedSubtasks = Array.isArray(parsed) ? parsed : [];
      } catch {
        parsedSubtasks = [];
      }
    }

    const parsedAttachedFiles = parseJsonAttachments(
      task.attachedFiles,
      "file",
    );
    const parsedImages = parseJsonAttachments(task.images, "image");

    const myHelpRequest = parsedHelpRequests.find(
      (hr) =>
        String(hr.fromId) === String(emp_id) ||
        String(hr.toId) === String(emp_id),
    );

    const isRequestForMe = parsedHelpRequests.some(
      (hr) => String(hr.toId) === String(emp_id),
    );

    const isRequestByMe = parsedHelpRequests.some(
      (hr) => String(hr.fromId) === String(emp_id),
    );

    return {
      ...task,
      status: task.status === "approved" ? "Approved" : task.status,
      assignedTo: parsedAssignedTo,
      transferTo: parseIdArray(task.transferTo),
      task: task.task || task.title || "",
      deadlineDate: task.dueDate || task.deadlineDate,
      subtasks: parsedSubtasks,
      category: task.project || task.category || "General",

      isAssignedToMe: parsedAssignedTo.some(
        (id) => String(id) === String(emp_id),
      ),
      canViewInMyTasks:
        parsedAssignedTo.some((id) => String(id) === String(emp_id)) ||
        isRequestForMe,
      isHelpRequest: parsedHelpRequests?.some(
        (r) => String(r.toId) === String(emp_id),
      ),
      attachedFiles: parsedAttachedFiles,
      images: parsedImages,
      workProgress:
        task.status === "Completed" ||
        task.status === "Approved" ||
        task.status === "approved" ||
        task.status === "Pending Approval"
          ? 100
          : task.workProgress || 0,
      assignedBy: task.assignedBy || "Admin",

      helpRequests: parsedHelpRequests,
      requestedHelp: parsedHelpRequests || [],
      helpRequestTo: parsedHelpRequests.map((hr) => hr.to),
      helpRequestId: myHelpRequest?.id,
      helpRequestMessage: myHelpRequest?.description || "",
      helpRequestDate: myHelpRequest?.createdAt || null,

      isHelpRequestForMe: isRequestForMe,
      isHelpRequestByMe: isRequestByMe,
      helpRequestReceiver: parsedHelpRequests[0]?.to,
      helpRequestSender: parsedHelpRequests[0]?.from,
    };
  };
  const fetchMyTasks = () => {
    if (!emp_id) return;

    const company_id = user?.company_id;
    const slug = user?.slug;

    axios
      .get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/tasks/employee-search`,
        {
          params: {
            employeeId: emp_id,
            company_id: company_id,
            slug: slug,
          },
        },
      )
      .then((res) => {
        let tasksData = [];

        if (res.data.success && Array.isArray(res.data.data)) {
          tasksData = res.data.data;
        } else if (Array.isArray(res.data)) {
          tasksData = res.data;
        } else if (res.data.tasks && Array.isArray(res.data.tasks)) {
          tasksData = res.data.tasks;
        } else {
          console.warn("Unexpected API response structure:", res.data);
          tasksData = [];
        }

        const normalizedTasks = tasksData
          .map((task) =>
            normalizeTask(
              task,
              helpRequests.filter(
                (hr) => Number(hr.taskId) === Number(task.id),
              ),
            ),
          )
          .filter((task) => task.canViewInMyTasks);

        setTasks(
          normalizedTasks.sort((a, b) => {
            if (a.status === "Reviewing" && b.status !== "Reviewing") return -1;
            if (b.status === "Reviewing" && a.status !== "Reviewing") return 1;
            if (a.status === "Completed" && b.status !== "Completed") return 1;
            if (b.status === "Completed" && a.status !== "Completed") return -1;
            return (b.id || 0) - (a.id || 0);
          }),
        );
      })
      .catch((err) => {
        showSnackbar("Failed to fetch tasks", "error");
      });
  };

  useEffect(() => {
    if (emp_id && user?.company_id && user?.slug) {
      fetchMyTasks();
    }
  }, [emp_id, user?.company_id, user?.slug]);

  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTask)) {
        setSelectedTask(updated);
      }
    }
  }, [tasks, selectedTask]);

  useEffect(() => {
    if (!user?.token) {
      return;
    }

    fetchEmployees();
  }, [user?.token]);

  useEffect(() => {
    if (!emp_id) return;

    axios
      .get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/help-requests/${emp_id}`,
      )
      .then((res) => {
        if (res.data.success) {
          setHelpRequests(res.data.helpRequests);
        }
      })
      .catch((err) => {
        console.error("Error fetching help requests:", err);
      });
  }, [emp_id]);

  useEffect(() => {
    if (!helpRequests?.length) {
      return;
    }

    const taskIds = helpRequests.map((r) => Number(r.taskId));

    axios
      .get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/by-ids`, {
        params: { ids: taskIds.join(",") },
      })
      .then((res) => {
        const normalizedNewTasks = res.data
          .map((task) =>
            normalizeTask(
              task,
              helpRequests.filter(
                (hr) => Number(hr.taskId) === Number(task.id),
              ),
            ),
          )
          .filter((task) => task.canViewInMyTasks);

        setTasks((prev) => {
          const existingIds = prev.map((t) => t.id);
          const newTasks = normalizedNewTasks.filter(
            (t) => !existingIds.includes(t.id),
          );
          const merged = [...newTasks, ...prev];
          return merged.sort((a, b) => {
            if (a.status === "Reviewing" && b.status !== "Reviewing") return -1;
            if (b.status === "Reviewing" && a.status !== "Reviewing") return 1;
            if (a.status === "Completed" && b.status !== "Completed") return 1;
            if (b.status === "Completed" && a.status !== "Completed") return -1;
            return (b.id || 0) - (a.id || 0);
          });
        });
      })
      .catch((err) => {});
  }, [helpRequests, emp_id]);

  useEffect(() => {
    if (!helpRequests || helpRequests.length === 0) return;

    setTasks((prev) => {
      const updatedTasks = prev.map((task) => {
        const hrs = helpRequests.filter(
          (hr) => Number(hr.taskId) === Number(task.id),
        );
        if (hrs.length) {
          const enriched = normalizeTask(task, hrs);

          return enriched;
        }
        return task;
      });

      if (JSON.stringify(updatedTasks) === JSON.stringify(prev)) {
        return prev;
      }
      return updatedTasks;
    });

    if (selectedTask) {
      const hrs = helpRequests.filter(
        (hr) => Number(hr.taskId) === Number(selectedTask.id),
      );

      if (hrs.length) {
        const updated = normalizeTask(selectedTask, hrs);

        if (JSON.stringify(updated) !== JSON.stringify(selectedTask)) {
          setSelectedTask(updated);
        }
      }
    }
  }, [helpRequests, helpReplies, emp_id]);
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "https://csaapnodeapi.csaap.com/api/tenant/hrms/all-employees",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const employeesData = response.data.data || [];
      setEmployees(employeesData);

      const employeeIds = employeesData.map((emp) => emp.id);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleComplete = async (taskId) => {
    if (!canUpdate) {
      showSnackbar("You do not have permission to update task status", "error");
      return;
    }
    try {
      const taskToComplete = tasks.find((t) => t.id === taskId);
      const updatedSubtasks = (taskToComplete?.subtasks || []).map((st) => ({
        ...st,
        completed: true,
      }));

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/${taskId}/status`,
        {
          status: "Pending Approval",
          subtasks: updatedSubtasks,
        },
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "Pending Approval",
                workProgress: 100,
                subtasks: updatedSubtasks,
              }
            : task,
        ),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) => ({
          ...prev,
          status: "Pending Approval",
          workProgress: 100,
          subtasks: updatedSubtasks,
        }));
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const toggleSubtask = async (taskId, subtaskIndex) => {
    if (!canUpdate) {
      showSnackbar(
        "You do not have permission to update task subtasks",
        "error",
      );
      return;
    }
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const subtask = task.subtasks[subtaskIndex];
      if (!subtask) return;

      const loggedInEmpId = emp_id;
      const userRole = String(user?.role || "").toLowerCase();
      const isAdmin = userRole === "admin" || userRole === "superadmin";
      const isCreator =
        task.assignedBy && String(loggedInEmpId) === String(task.assignedBy);
      const subtaskAssignee = subtask.assigned_to || subtask.assignedTo;

      let canToggle = false;
      if (isAdmin || isCreator) {
        canToggle = true;
      } else if (subtaskAssignee) {
        canToggle = String(loggedInEmpId) === String(subtaskAssignee);
      } else {
        const parentAssignees = Array.isArray(task.assignedTo)
          ? task.assignedTo.map(String)
          : [];
        canToggle = parentAssignees.includes(String(loggedInEmpId));
      }

      if (!canToggle) {
        showSnackbar("You are not authorized to toggle this subtask", "error");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/${taskId}/subtask/${subtask.id}`,
        {
          userId: loggedInEmpId,
          role: user?.role,
        },
      );

      fetchMyTasks();
      showSnackbar("Subtask status updated", "success");
    } catch (error) {
      console.error("Error toggling subtask:", error);
      showSnackbar("Failed to update subtask", "error");
    }
  };

  const handleCannotComplete = async () => {
    if (!canUpdate) {
      showSnackbar("You do not have permission to modify task status", "error");
      return;
    }
    if (selectedTask && cannotCompleteReason) {
      try {
        await axios.put(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/cannot-complete/${selectedTask.id}`,
          {
            reason: cannotCompleteReason,
          },
        );
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to update task status on server", "error");
        return;
      }
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                status: "Cannot Complete",
                notCompletedReason: cannotCompleteReason,
              }
            : task,
        ),
      );
      setCannotCompleteReason("");
      setShowCannotCompleteModal(false);
      showSnackbar("Cannot complete request sent for approval", "warning");
    }
  };

  const handleExtensionRequest = async () => {
    if (!canUpdate) {
      showSnackbar(
        "You do not have permission to request task extensions",
        "error",
      );
      return;
    }
    if (selectedTask && extensionReason.trim()) {
      try {
        await axios.put(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/extend/${selectedTask.id}`,
          {
            reason: extensionReason.trim(),
          },
        );

        setTasks((prev) =>
          prev.map((task) =>
            task.id === selectedTask.id
              ? {
                  ...task,
                  extensionReason: extensionReason,
                  extensionDate: null,

                  status: "Extension Pending",
                }
              : task,
          ),
        );

        setTimeout(() => fetchMyTasks(), 500);
        setExtensionReason("");
        setNewDeadline("");
        setShowExtensionModal(false);
        showSnackbar("Extension request submitted — awaiting approval", "info");
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to submit extension request", "error");
      }
    }
  };

  const handleRequestHelp = () => {
    if (selectedTask && requestMessage && selectedEmployees.length > 0) {
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                requestedHelp: true,
                helpRequestTo: selectedEmployees,
                helpRequestMessage: requestMessage,
                helpRequestUrgency: urgencyLevel,
                helpRequestDate: new Date().toISOString().split("T")[0],
                helpRequests: [
                  ...(task.helpRequests || []),
                  {
                    id: `help-${task.id}-${Date.now()}`,
                    taskId: task.id,
                    taskTitle: task.task || task.title,
                    from: user?.name || "",
                    fromId: user?.id || null,
                    to: selectedEmployees.join(", "),
                    toId: null,
                    description: requestMessage,
                    createdAt: new Date().toISOString(),
                    status: "Pending",
                    files: [],
                    images: [],
                  },
                ],
              }
            : task,
        ),
      );
      setRequestMessage("");
      setSelectedEmployees([]);
      setUrgencyLevel("Medium");
      setShowRequestHelpModal(false);
      showSnackbar("Help request sent successfully", "success");
    }
  };

  const handleWantHelp = async () => {
    if (!selectedTask || !wantHelpEmployee || !wantHelpDescription) {
      showSnackbar("Please fill all fields", "warning");
      return;
    }

    try {
      const selectedEmployee = employees.find(
        (emp) => emp.name === wantHelpEmployee,
      );

      if (!selectedEmployee) {
        showSnackbar("Employee not found", "error");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/request-help`,
        {
          taskId: selectedTask.id,
          toId: selectedEmployee.id,
          toName: selectedEmployee.name,
          description: wantHelpDescription,
          files: wantHelpFiles,
          images: wantHelpImages,
          from: user?.name,
          fromId: emp_id,
        },
      );

      showSnackbar(`Help request sent to ${wantHelpEmployee}`, "success");

      setWantHelpEmployee("");
      setWantHelpDescription("");
      setWantHelpFiles([]);
      setWantHelpImages([]);
      setShowWantHelpModal(false);

      fetchMyTasks();
    } catch (error) {
      console.error("Help request failed:", error);
      showSnackbar("Failed to send help request", "error");
    }
  };

  const handleReceiveHelpReply = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/reply-help`,
        {
          taskId: selectedTask.id,
          reply: receiveHelpReply,
          fromId: emp_id,
          from: user.name,
        },
      );

      showSnackbar("Reply sent successfully!", "success");

      fetchHelpReplies(selectedTask.id);

      setShowReceiveHelpModal(false);
      setReceiveHelpReply("");
    } catch (error) {
      console.error(error);
      showSnackbar("Error sending reply", "error");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const documentFiles = files.filter(
      (file) => !file.type.startsWith("image/"),
    );

    setUploadedImages((prev) => [...prev, ...imageFiles]);
    setUploadedFiles((prev) => [...prev, ...documentFiles]);
  };

  const handleWantHelpFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const documentFiles = files.filter(
      (file) => !file.type.startsWith("image/"),
    );

    setWantHelpImages((prev) => [...prev, ...imageFiles]);
    setWantHelpFiles((prev) => [...prev, ...documentFiles]);
  };

  const saveUploadedFiles = async () => {
    if (
      !selectedTask ||
      (uploadedFiles.length === 0 && uploadedImages.length === 0)
    )
      return;

    const formData = new FormData();
    formData.append("taskId", selectedTask.id);
    formData.append("description", uploadDescription);
    [...uploadedFiles, ...uploadedImages].forEach((file) => {
      formData.append("files", file);
    });

    setIsUploadingFiles(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/tasks/${selectedTask.id}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const newFiles = (response.data?.attachedFiles || []).map((file) =>
        normalizeAttachment(file, "file"),
      );
      const newImages = (response.data?.images || []).map((file) =>
        normalizeAttachment(file, "image"),
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                attachedFiles: [...(task.attachedFiles || []), ...newFiles],
                images: [...(task.images || []), ...newImages],
                lastUpload: new Date().toISOString().split("T")[0],
                uploadDescription: uploadDescription,
              }
            : task,
        ),
      );

      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              attachedFiles: [...(prev.attachedFiles || []), ...newFiles],
              images: [...(prev.images || []), ...newImages],
              lastUpload: new Date().toISOString().split("T")[0],
              uploadDescription: uploadDescription,
            }
          : prev,
      );

      setUploadedFiles([]);
      setUploadedImages([]);
      setUploadDescription("");
      setShowUploadModal(false);
      showSnackbar("Files uploaded successfully", "success");
      fetchMyTasks();
    } catch (error) {
      console.error("File upload failed:", error);
      showSnackbar("Failed to upload files", "error");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const removeUploadedFile = (index, isImage = false, isWantHelp = false) => {
    if (isWantHelp) {
      if (isImage) {
        setWantHelpImages(wantHelpImages.filter((_, i) => i !== index));
      } else {
        setWantHelpFiles(wantHelpFiles.filter((_, i) => i !== index));
      }
    } else {
      if (isImage) {
        setUploadedImages(uploadedImages.filter((_, i) => i !== index));
      } else {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
      }
    }
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

  const showSnackbar = (message, type = "info") => {
    setSnackbar({ open: true, message, type });

    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 5000);
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs";
      case "Completed":
        return "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs";
      case "Pending Approval":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs";
      case "Assigned":
        return "bg-slate-50 text-slate-700 border border-slate-200 shadow-xs";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border border-amber-200 shadow-xs";
      case "Blocked":
        return "bg-rose-50 text-rose-700 border border-rose-200 shadow-xs";
      case "Rejected":
        return "bg-red-50 text-red-700 border border-red-200 shadow-xs";
      case "Review":
        return "bg-purple-50 text-purple-700 border border-purple-200 shadow-xs";
      case "Cannot Complete":
        return "bg-gray-100 text-gray-700 border border-gray-200 shadow-xs";
      case "Not Completed":
        return "bg-gray-100 text-gray-700 border border-gray-200 shadow-xs";
      case "Extended":
        return "bg-orange-50 text-orange-700 border border-orange-200 shadow-xs";
      case "Extension Pending":
        return "bg-orange-50 text-orange-700 border border-orange-200 shadow-xs";
      case "Reassigned":
        return "bg-amber-50 text-amber-700 border border-amber-200 shadow-xs";
      case "Transferred":
        return "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 shadow-xs";
      case "Transfer Pending":
        return "bg-pink-50 text-pink-700 border border-pink-200 shadow-xs";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
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
        className: "bg-red-50 border-red-200 text-red-700",
      };
    }

    if (["Extended", "Extension Pending"].includes(task.status)) {
      const extensionValue = task.extensionReason || task.reasonForExtension;
      if (extensionValue) {
        return {
          label: "Extension Reason",
          value: extensionValue,
          className: "bg-orange-50 border-orange-200 text-orange-700",
        };
      }
    }

    if (
      ["Transferred", "Transfer Pending"].includes(task.status) &&
      task.transferReason
    ) {
      return {
        label: "Transfer Request",
        value: `${task.transferReason}${task.transferTo?.length ? `\n\nTransfer To: ${getEmployeeNames(task.transferTo)}` : ""}`,
        className: "bg-pink-50 border-pink-200 text-pink-700",
      };
    }

    return null;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
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

  const getEmployeeName = (id) => {
    if (!id) return "Admin";

    const idStr = String(id);
    const employee = employees.find((emp) => String(emp.id) === idStr);
    return employee ? employee.name : "Admin";
  };

  const getEmployeeNames = (ids = []) => {
    const parsedIds = Array.isArray(ids) ? ids : [];
    const names = parsedIds.map((id) => getEmployeeName(id)).filter(Boolean);
    return names.length ? names.join(", ") : "N/A";
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredTasks = tasks.filter((task) => {
    const searchLower = searchTerm.toLowerCase();

    const taskName = (task.task || task.title || "").toLowerCase();
    const assignedBy = (task.assignedBy || "").toLowerCase();

    const matchesSearch =
      taskName.includes(searchLower) ||
      (getEmployeeName(task.assignedBy) || "")
        .toLowerCase()
        .includes(searchLower);
    const matchesCategory =
      selectedCategory === "All Projects" || task.category === selectedCategory;
    const isCompletedStatus = completedStatuses.includes(task.status);
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Completed" ? isCompletedStatus : !isCompletedStatus);

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Overdue"
        ? task.deadlineDate &&
          new Date(task.deadlineDate) < new Date() &&
          !isCompletedStatus
        : selectedStatus === "Requests"
          ? task.helpRequests?.length > 0 ||
            [
              "Transfer Pending",
              "Transferred",
              "Extension Pending",
              "Extended",
              "Cannot Complete",
              "Not Completed",
            ].includes(task.status)
          : selectedStatus === "Reviewing"
            ? task.status === "Pending Approval"
            : task.status === selectedStatus);

    const matchesAssignedDate =
      !assignedDateFilter ||
      (() => {
        const taskDate = task.startDate || task.assignedDate;
        if (!taskDate) return false;
        const localDate = new Date(taskDate).toLocaleDateString("en-CA");
        return localDate === assignedDateFilter;
      })();

    const matchesAssignedBy =
      filterAssignedBy === "All" ||
      String(task.assignedBy) === String(filterAssignedBy);
    const matchesDeadline =
      !filterDeadlineDate ||
      (() => {
        const deadline = task.deadlineDate || task.dueDate;
        if (!deadline) return false;
        const formattedDeadline = new Date(deadline)
          .toISOString()
          .split("T")[0];
        return formattedDeadline === filterDeadlineDate;
      })();

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesAssignedDate &&
      matchesTab &&
      matchesAssignedBy &&
      matchesDeadline
    );
  });

  const helpRequestTaskIds = helpRequests.map((r) => Number(r.taskId));

  useEffect(() => {
    setStats((prev) => ({ ...prev, helpRequests: helpRequests.length }));
  }, [helpRequests]);

  const sortedTasks = [...filteredTasks]
    .map((task) => ({
      ...task,
      isHelpRequest: helpRequestTaskIds.includes(Number(task.id)),
    }))
    .sort((a, b) => {
      const getPriority = (status, isHelp) => {
        if (status === "Pending") return 1;
        if (status === "Reviewing" || status === "Pending Approval") return 2;
        if (isHelp) return 3;
        if (status === "Completed" || status === "Approved") return 5;
        return 4;
      };

      const priorityA = getPriority(a.status, a.isHelpRequest);
      const priorityB = getPriority(b.status, b.isHelpRequest);

      if (priorityA !== priorityB) return priorityA - priorityB;

      return (b.id || 0) - (a.id || 0);
    });

  return (
    <div className="w-full">
      {snackbar.open && (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-100 pointer-events-none px-4">
          <div
            className={`relative ${getSnackbarColor(snackbar.type)} text-white px-6 py-4 rounded-xl shadow-2xl max-w-md w-full pointer-events-auto transition-all duration-300 animate-slideDown`}
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
        </div>
      )}

      {showConversationModal &&
        selectedTask &&
        helpReplies[selectedTask.id] && (
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50 bg-[rgba(27,36,47,0.28)] backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="app-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="bg-white px-6 py-4 border-b border-(--border-soft) flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h3 className="modal-title flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-(--brand)" />
                    Conversation
                  </h3>
                  <p className="text-xs text-(--text-soft) mt-1 truncate max-w-md">
                    {getPlainText(selectedTask.task || selectedTask.title)}
                  </p>
                </div>
                <button
                  onClick={() => setShowConversationModal(false)}
                  className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {selectedTask.helpRequests &&
                  selectedTask.helpRequests.map((hr, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-(--brand-soft) flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-(--brand)">
                            {getInitials(hr.from)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-(--bg-subtle)/50 rounded-2xl p-4 border border-(--border-soft)">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-(--text-strong)">
                                {hr.from}
                              </span>
                              <span className="text-xs text-(--text-soft)">
                                {formatDate(hr.createdAt)}
                              </span>
                            </div>
                            <p className="text-(--text-body) text-sm leading-relaxed">
                              {renderRichText(hr.description)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {hr.reply && (
                        <div className="flex items-start gap-3 ml-8">
                          <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-sky-800">
                              {getInitials(hr.replyBy)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sky-900">
                                  {hr.replyBy}
                                </span>
                                <span className="text-xs text-sky-600">
                                  {formatDate(hr.replyAt)}
                                </span>
                              </div>
                              <p className="text-(--text-body) text-sm leading-relaxed">
                                {hr.reply}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                <div className="pt-4 border-t border-(--border-soft)">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={receiveHelpReply}
                      onChange={(e) => setReceiveHelpReply(e.target.value)}
                      placeholder="Type your reply..."
                      className="app-input flex-1 py-2 text-sm"
                    />
                    <button
                      onClick={async () => {
                        await handleReceiveHelpReply();
                        setShowConversationModal(false);
                      }}
                      disabled={!receiveHelpReply.trim()}
                      className="app-btn-primary min-h-0 py-2.5 px-6"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      {showReceiveHelpModal && selectedTask && (
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50 bg-[rgba(27,36,47,0.28)] backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="app-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
          >
            <div className="bg-white px-6 py-4 border-b border-(--border-soft) flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="modal-title flex items-center gap-2">
                  <Upload className="w-5 h-5 text-(--brand)" />
                  Help Request
                </h3>
                <p className="text-xs text-(--text-soft) mt-1">
                  Respond to team member's help request
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReceiveHelpModal(false);
                  setReceiveHelpReply("");
                  setReceiveHelpFiles([]);
                  setReceiveHelpImages([]);
                }}
                className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="p-4 rounded-xl border border-(--border-soft) bg-(--bg-subtle)/30">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-(--brand)" />
                  <h5 className="font-bold text-(--text-strong) text-sm">
                    Help Request Message
                  </h5>
                </div>
                <div className="bg-white p-4 rounded-lg border border-(--border-soft) text-sm text-(--text-body)">
                  {selectedTask.helpRequests &&
                  selectedTask.helpRequests.length > 0 ? (
                    selectedTask.helpRequests.map((hr, idx) => (
                      <p
                        key={idx}
                        className="text-(--text-body) text-sm leading-relaxed"
                      >
                        {renderRichText(hr.description)}
                      </p>
                    ))
                  ) : (
                    <p className="text-(--text-body) text-sm leading-relaxed">
                      No specific message provided
                    </p>
                  )}
                </div>

                {selectedTask.helpRequestDate && (
                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-(--brand)">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Requested: {formatDate(selectedTask.helpRequestDate)}
                    </span>
                    {selectedTask.helpRequestUrgency && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        Urgency: {selectedTask.helpRequestUrgency}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {helpReplies[selectedTask.id] &&
                helpReplies[selectedTask.id].length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-(--text-strong) text-sm">
                      Previous Replies
                    </h5>
                    {helpReplies[selectedTask.id].map((reply, idx) => (
                      <div
                        key={idx}
                        className="bg-sky-50/50 p-3 rounded-lg border border-sky-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-sky-800">
                            {reply.replyBy}
                          </span>
                          <span className="text-xs text-sky-600">
                            {formatDate(reply.replyAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.reply}</p>
                      </div>
                    ))}
                  </div>
                )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-(--text-strong) flex items-center gap-2">
                    <div className="w-6 h-6 bg-(--brand-soft) rounded-lg flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-(--brand)" />
                    </div>
                    Your Reply <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-(--text-faint)">
                    {receiveHelpReply.length}/500 characters
                  </span>
                </div>

                <textarea
                  value={receiveHelpReply}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setReceiveHelpReply(e.target.value);
                    }
                  }}
                  rows="4"
                  className="app-input w-full px-4 py-3 text-sm resize-none"
                  placeholder="Type your response here... Be specific and helpful ✨"
                />

                <div className="flex justify-end">
                  <div
                    className={`h-1 w-20 rounded-full transition-all duration-300 ${
                      receiveHelpReply.length > 400
                        ? "bg-yellow-400"
                        : receiveHelpReply.length > 0
                          ? "bg-(--brand)"
                          : "bg-gray-200"
                    }`}
                    style={{
                      width: `${(receiveHelpReply.length / 500) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-(--text-strong) flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  Attachments (Optional)
                </label>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const images = files.filter((file) =>
                        file.type.startsWith("image/"),
                      );
                      const docs = files.filter(
                        (file) => !file.type.startsWith("image/"),
                      );
                      setReceiveHelpImages((prev) => [...prev, ...images]);
                      setReceiveHelpFiles((prev) => [...prev, ...docs]);
                    }}
                    className="hidden"
                    id="receive-help-file-upload"
                  />
                  <label
                    htmlFor="receive-help-file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-(--border-strong) rounded-xl cursor-pointer hover:border-(--brand) hover:bg-(--brand-soft) transition-all duration-200 group"
                  >
                    <Upload className="w-8 h-8 text-(--text-faint) group-hover:text-(--brand) mb-2 transition-colors" />
                    <p className="text-sm text-(--text-soft) group-hover:text-(--text-strong)">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-(--text-faint) mt-1">
                      PNG, JPG, GIF, PDF, DOC up to 10MB
                    </p>
                  </label>
                </div>

                {(receiveHelpFiles.length > 0 ||
                  receiveHelpImages.length > 0) && (
                  <div className="bg-(--bg-subtle)/40 rounded-xl p-4 space-y-4 border border-(--border-soft)">
                    <h6 className="text-xs font-semibold text-(--text-strong) flex items-center gap-1">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Selected Files (
                      {receiveHelpFiles.length + receiveHelpImages.length})
                    </h6>

                    {receiveHelpImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-(--text-soft)">Images</p>
                        <div className="grid grid-cols-4 gap-2">
                          {receiveHelpImages.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-linear-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 flex items-center justify-center">
                                <Image className="w-6 h-6 text-purple-400" />
                              </div>
                              <button
                                onClick={() => {
                                  setReceiveHelpImages((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  );
                                }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <p className="text-[10px] text-(--text-soft) mt-1 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {receiveHelpFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-(--text-soft)">Documents</p>
                        <div className="space-y-1.5">
                          {receiveHelpFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white rounded-lg border border-(--border-soft) group hover:border-(--brand) transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-(--text-strong) truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-(--text-faint)">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setReceiveHelpFiles((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  );
                                }}
                                className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-(--bg-subtle)/30 p-4 rounded-xl border border-(--border-soft)">
                <p className="text-xs font-semibold text-(--text-soft) mb-2">
                  Quick responses:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "I can help with that!",
                    "I'll take a look",
                    "When do you need this?",
                    "Can you share more details?",
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setReceiveHelpReply(suggestion)}
                      className="px-3 py-1.5 bg-white border border-(--border-soft) rounded-lg text-xs text---text-body hover:border-(--brand) hover:bg-(--brand-soft) transition-all duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-(--border-soft)">
                <button
                  onClick={() => {
                    setShowReceiveHelpModal(false);
                    setReceiveHelpReply("");
                    setReceiveHelpFiles([]);
                    setReceiveHelpImages([]);
                  }}
                  className="app-btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={handleReceiveHelpReply}
                  disabled={!receiveHelpReply.trim()}
                  className="app-btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>

              <p className="text-xs text-center text-(--text-faint)">
                Your reply will be sent to{" "}
                {selectedTask.assignedBy || "the requester"} immediately
              </p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="w-full transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="mt-4 md:mt-0 flex items-center gap-3"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
              {[
                {
                  label: "Total Tasks",
                  value: tasks.length,
                  color: "text-(--text-strong)",
                  filter: "All",
                },

                {
                  label: "Completed",
                  value: tasks.filter((t) =>
                    completedStatuses.includes(t.status),
                  ).length,
                  color: "text-emerald-600",
                  filter: "Completed",
                },

                {
                  label: "Requests",
                  value: tasks.filter(
                    (t) =>
                      (t.helpRequests && t.helpRequests.length > 0) ||
                      [
                        "Transfer Pending",
                        "Transferred",
                        "Extension Pending",
                        "Extended",
                        "Cannot Complete",
                        "Not Completed",
                      ].includes(t.status),
                  ).length,
                  color: "text-blue-600",
                  filter: "Requests",
                },

                {
                  label: "Incompleted",
                  value: tasks.filter((t) => t.status === "Pending").length,
                  color: "text-rose-600",
                  filter: "Pending",
                },

                {
                  label: "Reassigned",
                  value: tasks.filter((t) => t.status === "Reassigned").length,
                  color: "text-amber-500",
                  filter: "Reassigned",
                },
              ].map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedStatus(card.filter);

                    if (card.filter === "All") setActiveTab("All");
                    else if (card.filter === "Completed")
                      setActiveTab("Completed");
                    else setActiveTab("Pending");
                  }}
                  className={`
                    app-panel p-4 text-left flex flex-col justify-between h-22 transition-all duration-200 hover:-translate-y-px hover:shadow-md cursor-pointer
                    ${
                      selectedStatus === card.filter
                        ? "border-(--brand) ring-2 ring-(--brand-ring)"
                        : "border-(--border-soft)"
                    }
                  `}
                >
                  <p className="text-[12px] font-bold text-(--text-soft) truncate">
                    {card.label}
                  </p>

                  <h3 className={`text-2xl font-extrabold mt-2 ${card.color}`}>
                    {card.value}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          <div className="app-panel p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-(--text-faint) absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="app-input w-full pl-9 pr-4 py-2 text-[13px]"
                    placeholder="Search tasks or Assigned By..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className={`app-btn-secondary min-h-0 py-2 text-[13px] flex items-center gap-2 px-4 rounded-xl border transition-all duration-200 font-medium ${showMoreFilters ? "bg-(--brand-soft) border-(--border-strong) text-(--brand)" : ""}`}
                >
                  <Filter className="w-4 h-4" />
                  More Filter
                </button>

                {(searchTerm ||
                  selectedCategory !== "All Projects" ||
                  selectedStatus !== "All" ||
                  assignedDateFilter ||
                  filterAssignedBy !== "All" ||
                  filterDeadlineDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All Projects");
                      setSelectedStatus("All");
                      setAssignedDateFilter("");
                      setFilterAssignedBy("All");
                      setFilterDeadlineDate("");
                    }}
                    className="text-sm text-rose-600 hover:text-rose-700 font-bold px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {showMoreFilters && (
              <div className="mt-4 pt-4 border-t border-(--border-soft) grid grid-cols-1 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="app-label block mb-1.5 uppercase tracking-wider">
                    Assigned By
                  </label>
                  <select
                    value={filterAssignedBy}
                    onChange={(e) => setFilterAssignedBy(e.target.value)}
                    className="app-input w-full py-1.5 text-[13px]"
                  >
                    <option value="All">All Assigners</option>
                    {[...new Set(tasks.map((t) => t.assignedBy))].map((id) => (
                      <option key={id} value={id}>
                        {getEmployeeName(id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label block mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="app-input w-full py-1.5 text-[13px]"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label block mb-1.5 uppercase tracking-wider">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    value={filterDeadlineDate}
                    onChange={(e) => setFilterDeadlineDate(e.target.value)}
                    className="app-input w-full py-1.5 text-[13px]"
                  />
                </div>

                <div>
                  <label className="app-label block mb-1.5 uppercase tracking-wider">
                    Project/Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="app-input w-full py-1.5 text-[13px]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label block mb-1.5 uppercase tracking-wider">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    value={assignedDateFilter}
                    onChange={(e) => setAssignedDateFilter(e.target.value)}
                    className="app-input w-full py-1.5 text-[13px]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="app-panel overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-245 table-fixed">
                <thead className="bg-(--bg-subtle)/40 border-b border-(--border-soft)">
                  <tr>
                    <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) w-[28%]">
                      Task Details
                    </th>
                    <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) w-[13%]">
                      Assigned By
                    </th>
                    <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) w-[13%]">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) w-[13%]">
                      Assigned Date
                    </th>
                    <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) w-[11%]">
                      Priority
                    </th>
                    <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) w-[12%]">
                      Deadline
                    </th>
                    <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-soft)">
                  {sortedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-(--bg-subtle)/50 transition-colors duration-200 group"
                    >
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="min-w-0 max-w-full">
                            <div
                              title={getPlainText(task.title || task.task)}
                              className="max-w-full truncate font-bold text-(--text-strong) text-sm group-hover:text-(--brand) transition-colors"
                            >
                              {getPlainText(task.title || task.task)}
                            </div>
                            <div className="text-[12px] font-semibold text-(--text-faint) mt-1 flex items-center gap-2">
                              <span className="truncate text-(--brand)">
                                {task.category}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-(--border-strong)" />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <div className="text-[13px] font-semibold text-(--text-body) truncate">
                          {getEmployeeName(task.assignedBy)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <span
                          className={`px-2 py-1 whitespace-nowrap rounded-md text-[11px] font-semibold border shadow-xs ${getStatusColor(task.status).replace("bg-", "bg-opacity-50 bg-")}`}
                        >
                          {task.status === "Pending Approval"
                            ? "Reviewing"
                            : task.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <div className="text-[13px] font-medium text-(--text-body)">
                          {formatDate(task.startDate || task.assignedDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full shadow-xs ${getPriorityColor(task.priority)}`}
                          />
                          <span className="text-[13px] font-medium text-(--text-body)">
                            {task.priority}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <div
                          className={`text-[13px] font-semibold truncate ${
                            (task.deadlineDate || task.dueDate) &&
                            new Date(task.deadlineDate || task.dueDate) <
                              new Date() &&
                            task.status !== "Completed" &&
                            task.status !== "Approved"
                              ? "text-rose-600"
                              : "text-(--text-body)"
                          }`}
                        >
                          {formatDate(task.deadlineDate || task.dueDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center justify-start gap-1.5 min-h-10">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskDetails(true);
                            }}
                            title="View Details"
                            className="p-1.5 text-(--text-soft) hover:text-(--brand) hover:bg-(--brand-soft) rounded-lg transition-all group/icon"
                          >
                            <Eye className="w-3.5 h-3.5 transition-transform group-hover/icon:scale-110" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <Frown className="size-8 mx-auto mb-3 text-(--text-faint)" />
                        <p className="text-[14px] font-bold text-(--text-strong)">
                          No tasks found
                        </p>
                        <p className="text-[13px] mt-1 text-(--text-soft) mb-4">
                          Try adjusting your search or filters
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("All Projects");
                            setSelectedStatus("All");
                            setAssignedDateFilter("");
                            setFilterAssignedBy("All");
                            setFilterDeadlineDate("");
                          }}
                          className="app-btn-secondary min-h-0 py-2 text-xs"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ${showChat ? "translate-x-0" : "translate-x-full"} z-40 border-l border-gray-200 flex flex-col`}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-linear-to-r from-blue-50 to-white">
          <div>
            <h3 className="font-bold text-gray-800">Team Chat</h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time collaboration
            </p>
          </div>
          <button
            onClick={() => setShowChat(false)}
            className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm">
              <Clock className="w-4 h-4" />
              Today
            </div>
          </div>
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${msg.sender === "You" ? "text-right" : ""}`}
            >
              <div
                className={`inline-block rounded-2xl px-4 py-3 max-w-[80%] ${msg.sender === "You" ? "bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}
              >
                <div
                  className={`font-medium text-xs mb-1 ${msg.sender === "You" ? "text-blue-100" : "text-gray-600"}`}
                >
                  {msg.sender === "You" ? "You" : msg.sender}
                </div>
                <div className="text-sm">{msg.message}</div>
                <div
                  className={`text-xs mt-2 ${msg.sender === "You" ? "text-blue-200" : "text-gray-500"}`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={sendMessage}
              className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showWantHelpModal && selectedTask && (
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50 bg-[rgba(27,36,47,0.28)] backdrop-blur-xs">
          <div className="app-modal max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-(--border-soft)">
                <div>
                  <h3 className="modal-title flex items-center gap-2">
                    <Info className="w-5 h-5 text-(--brand)" />
                    Need Help?
                  </h3>
                  <p className="text-(--text-soft) text-sm mt-1">
                    Request assistance from a specific team member
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowWantHelpModal(false);
                    setWantHelpEmployee("");
                    setWantHelpDescription("");
                    setWantHelpFiles([]);
                    setWantHelpImages([]);
                  }}
                  className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-(--text-body) text-sm mb-2">
                    <span className="font-semibold text-(--text-strong)">
                      Task:
                    </span>{" "}
                    <span className="wrap-break-word">
                      {getPlainText(selectedTask.task || selectedTask.title)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text-strong) mb-2">
                    Select Team Member *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowWantHelpEmployeeList(!showWantHelpEmployeeList)
                      }
                      className="app-input w-full text-left flex justify-between items-center text-sm"
                    >
                      <span
                        className={
                          wantHelpEmployee
                            ? "text-(--text-strong)"
                            : "text-(--text-faint)"
                        }
                      >
                        {wantHelpEmployee || "Choose a team member"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-(--text-faint) transition-transform ${showWantHelpEmployeeList ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showWantHelpEmployeeList && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-(--border-soft) rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {employees
                          .filter(
                            (emp) =>
                              String(emp.id) !==
                              String(selectedTask?.assignedBy),
                          )
                          .map((employee) => (
                            <div
                              key={employee.id}
                              onClick={() => {
                                setWantHelpEmployee(employee.name);
                                setShowWantHelpEmployeeList(false);
                              }}
                              className="flex items-center gap-2.5 p-2.5 hover:bg-(--brand-soft) cursor-pointer border-b border-gray-100 last:border-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-(--brand-soft) flex items-center justify-center text-xs font-semibold text-(--brand) shrink-0">
                                {getInitials(employee.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-(--text-strong) text-sm truncate">
                                  {employee.name}
                                </div>
                                <div className="text-xs text-(--text-soft) truncate">
                                  {employee.designation ||
                                    employee.role ||
                                    "Employee"}{" "}
                                  • {employee.department || "N/A"}
                                </div>
                              </div>
                              {wantHelpEmployee === employee.name && (
                                <Check className="w-4 h-4 text-(--brand) shrink-0" />
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text-strong) mb-2">
                    What help do you need? *
                  </label>
                  <textarea
                    value={wantHelpDescription}
                    onChange={(e) => setWantHelpDescription(e.target.value)}
                    className="app-input w-full text-sm resize-none"
                    rows="4"
                    placeholder="Describe what you need help with, any specific requirements, or questions..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text-strong) mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-(--border-strong) rounded-lg p-4 text-center hover:border-(--brand) hover:bg-(--brand-soft) transition-all duration-200">
                    <input
                      type="file"
                      multiple
                      onChange={handleWantHelpFileUpload}
                      className="hidden"
                      id="want-help-file-upload"
                    />
                    <label
                      htmlFor="want-help-file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Upload className="w-8 h-8 text-(--text-faint) mb-2" />
                      <div className="text-(--text-soft) text-xs">
                        <span className="font-medium text-(--brand)">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </div>
                      <p className="text-[10px] text-(--text-faint) mt-1">
                        Images (PNG, JPG, GIF) and documents (PDF, DOC, XLS)
                      </p>
                    </label>
                  </div>
                </div>

                {(wantHelpFiles.length > 0 || wantHelpImages.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-(--text-strong) text-sm">
                      Attached Files
                    </h4>

                    {wantHelpImages.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-(--text-soft) mb-1.5">
                          Images
                        </h5>
                        <div className="grid grid-cols-3 gap-1.5">
                          {wantHelpImages.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-(--border-soft)">
                                <Image className="w-6 h-6 text-(--text-faint)" />
                              </div>
                              <button
                                onClick={() =>
                                  removeUploadedFile(index, true, true)
                                }
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                              <p className="text-[10px] text-(--text-soft) mt-1 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {wantHelpFiles.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-(--text-soft) mb-1.5">
                          Documents
                        </h5>
                        <div className="space-y-1.5">
                          {wantHelpFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-(--bg-subtle)/30 rounded-lg border border-(--border-soft) group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-(--text-faint) shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-(--text-strong) truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-[10px] text-(--text-faint)">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  removeUploadedFile(index, false, true)
                                }
                                className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-(--text-soft)" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-(--border-soft)">
                  <button
                    onClick={() => {
                      setShowWantHelpModal(false);
                      setWantHelpEmployee("");
                      setWantHelpDescription("");
                      setWantHelpFiles([]);
                      setWantHelpImages([]);
                    }}
                    className="app-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWantHelp}
                    disabled={!wantHelpEmployee || !wantHelpDescription.trim()}
                    className="app-btn-primary flex-1"
                  >
                    Send Help Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTaskDetails && selectedTask && (
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50 bg-[rgba(27,36,47,0.28)] backdrop-blur-xs">
          <div className="app-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-(--border-soft)">
                <div>
                  <h3 className="modal-title">Task Details</h3>
                </div>
                <button
                  onClick={() => setShowTaskDetails(false)}
                  className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedTask && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Task
                      </label>
                      <div className="text-sm font-bold text-(--text-strong) mt-0.5 wrap-break-word">
                        {renderRichText(
                          selectedTask.task || selectedTask.title,
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Status
                      </label>
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium mt-0.5 ${getStatusColor(selectedTask.status)}`}
                      >
                        {selectedTask.status === "Pending Approval"
                          ? "Reviewing"
                          : selectedTask.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Priority
                      </label>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(selectedTask.priority)}`}
                        />
                        <span className="text-sm text-(--text-strong) font-semibold">
                          {selectedTask.priority}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Category / Project
                      </label>
                      <p className="text-sm text-(--text-strong) font-semibold mt-0.5">
                        {selectedTask.project || selectedTask.category || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Assigned By
                      </label>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm text-(--text-strong) font-semibold">
                          {getEmployeeName(selectedTask.assignedBy)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Role
                      </label>
                      <p className="text-sm text-(--text-strong) font-semibold mt-0.5">
                        {selectedTask.assignedByRole || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Deadline
                      </label>
                      <p
                        className={`text-sm font-bold mt-0.5 ${
                          (selectedTask.deadlineDate || selectedTask.dueDate) &&
                          new Date(
                            selectedTask.deadlineDate || selectedTask.dueDate,
                          ) < new Date() &&
                          selectedTask.status !== "Completed"
                            ? "text-red-600"
                            : "text-(--text-strong)"
                        }`}
                      >
                        {formatDate(
                          selectedTask.deadlineDate || selectedTask.dueDate,
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1 block">
                        Assigned Date
                      </label>
                      <p className="text-sm text-(--text-strong) font-semibold mt-0.5">
                        {formatDate(
                          selectedTask.startDate || selectedTask.assignedDate,
                        )}
                      </p>
                    </div>
                  </div>

                  {(selectedTask.description || selectedTask.remark) && (
                    <div className="border-t border-(--border-soft) pt-3">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-2 block">
                        Description / Remarks
                      </label>
                      <div className="app-panel-muted p-4 rounded-xl border border-(--border-soft)">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-(--brand-soft) rounded-lg flex items-center justify-center shrink-0 border border-(--border-soft)">
                            <Info className="w-4 h-4 text-(--brand)" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-(--text-body) leading-relaxed wrap-break-word">
                              {renderRichText(
                                selectedTask.description ||
                                  selectedTask.remark ||
                                  selectedTask.task,
                              )}
                            </div>
                            {(selectedTask.description ||
                              selectedTask.remark) && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-(--text-faint)">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  Added by {selectedTask.assignedBy} on{" "}
                                  {formatDate(
                                    selectedTask.startDate ||
                                      selectedTask.assignedDate,
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {getStatusReasonDetails(selectedTask) && (
                    <div className="border-t border-(--border-soft) pt-3">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-2 block">
                        {getStatusReasonDetails(selectedTask).label}
                      </label>
                      <div
                        className={`rounded-xl border p-4 font-semibold text-sm ${getStatusReasonDetails(selectedTask).className}`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {renderRichText(
                            getStatusReasonDetails(selectedTask).value,
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTask.subtasks &&
                    selectedTask.subtasks.length > 0 && (
                      <div className="border-t border-(--border-soft) pt-3">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-2 block">
                          Subtasks (
                          {
                            selectedTask.subtasks.filter((s) => s.completed)
                              .length
                          }
                          /{selectedTask.subtasks.length})
                        </label>
                        <div className="space-y-2">
                          {selectedTask.subtasks.map((subtask, index) => {
                            const subtaskName =
                              subtask.name ||
                              subtask.title ||
                              (typeof subtask === "string"
                                ? subtask
                                : "Unnamed Subtask");
                            const isCompleted = !!subtask.completed;

                            const loggedInEmpId = emp_id;
                            const userRole = String(
                              user?.role || "",
                            ).toLowerCase();
                            const isAdmin =
                              userRole === "admin" || userRole === "superadmin";
                            const isCreator =
                              selectedTask.assignedBy &&
                              String(loggedInEmpId) ===
                                String(selectedTask.assignedBy);
                            const subtaskAssignee =
                              subtask.assigned_to || subtask.assignedTo;

                            let canToggle = false;
                            if (isAdmin || isCreator) {
                              canToggle = true;
                            } else if (subtaskAssignee) {
                              canToggle =
                                String(loggedInEmpId) ===
                                String(subtaskAssignee);
                            } else {
                              const parentAssignees = Array.isArray(
                                selectedTask.assignedTo,
                              )
                                ? selectedTask.assignedTo.map(String)
                                : [];
                              canToggle = parentAssignees.includes(
                                String(loggedInEmpId),
                              );
                            }

                            const assigneeName = subtaskAssignee
                              ? getEmployeeName(subtaskAssignee)
                              : "";

                            return (
                              <div
                                key={index}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group ${
                                  isCompleted
                                    ? "bg-(--bg-subtle)/10 border-(--border-soft)"
                                    : "bg-(--bg-subtle)/30 border-(--border-soft) hover:bg-white hover:shadow-xs"
                                }`}
                              >
                                <button
                                  disabled={!canToggle}
                                  onClick={() =>
                                    toggleSubtask(selectedTask.id, index)
                                  }
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                                    isCompleted
                                      ? "bg-(--brand) border-(--brand) text-white"
                                      : "bg-white border-gray-300 " +
                                        (canToggle
                                          ? "group-hover:border-(--brand) cursor-pointer"
                                          : "cursor-not-allowed opacity-50")
                                  }`}
                                  title={
                                    !canToggle
                                      ? "You are not authorized to toggle this subtask"
                                      : ""
                                  }
                                >
                                  {isCompleted && (
                                    <Check className="w-3 h-3 stroke-3" />
                                  )}
                                </button>
                                <span
                                  className={`text-sm transition-all duration-200 ${
                                    isCompleted
                                      ? "text-(--text-faint) line-through"
                                      : "text-(--text-strong) font-bold"
                                  } ${!canToggle && !isCompleted ? "opacity-75" : ""}`}
                                >
                                  {subtaskName}
                                  {subtaskAssignee && (
                                    <span className="text-[10px] text-gray-400 ml-2 font-medium bg-gray-100 px-1.5 py-0.5 rounded-md">
                                      @{assigneeName}
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {selectedTask.helpRequests &&
                    selectedTask.helpRequests.length > 0 && (
                      <div className="border-t border-(--border-soft) pt-4 mt-4">
                        <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white pb-2 z-10 border-b border-(--border-soft)">
                          <MessageSquare className="w-4 h-4 text-(--brand)" />
                          <h4 className="text-sm font-bold text-(--text-strong)">
                            Collaboration Thread
                          </h4>
                        </div>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedTask.helpRequests.map((hr, idx) => (
                            <div key={idx} className="space-y-3">
                              <div className="flex flex-col items-start max-w-[90%]">
                                <div className="flex items-center gap-2 mb-1 px-1">
                                  <span className="text-[10px] font-bold text-(--text-faint) uppercase tracking-wider">
                                    {renderRichText(hr.from)}
                                  </span>
                                  <span className="text-[10px] text-(--text-faint)">
                                    {new Date(hr.createdAt).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </span>
                                </div>
                                <div className="bg-white border border-(--border-soft) rounded-2xl rounded-tl-none p-3 shadow-xs">
                                  <p className="text-sm text-(--text-body) leading-relaxed">
                                    {renderRichText(hr.description)}
                                  </p>
                                </div>
                              </div>

                              {hr.reply && (
                                <div className="flex flex-col items-end w-full">
                                  <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[10px] text-(--text-faint)">
                                      {new Date(hr.replyAt).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" },
                                      )}
                                    </span>
                                    <span className="text-[10px] font-bold text-(--brand) uppercase tracking-wider">
                                      {renderRichText(hr.replyBy)}
                                    </span>
                                  </div>
                                  <div className="bg-(--brand-soft) border border-(--border-strong) rounded-2xl rounded-tr-none p-3 shadow-xs max-w-[90%]">
                                    <p className="text-sm text-(--text-body) font-semibold leading-relaxed">
                                      {renderRichText(hr.reply)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {(selectedTask.attachedFiles?.length > 0 ||
                    selectedTask.images?.length > 0) && (
                    <div className="border-t border-(--border-soft) pt-3">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-2 block">
                        Attachments
                      </label>
                      <div className="space-y-2">
                        {[
                          ...(selectedTask.attachedFiles || []),
                          ...(selectedTask.images || []),
                        ].map((file, index) => {
                          const attachment = normalizeAttachment(file);
                          const attachmentUrl = getAttachmentUrl(attachment);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-(--border-soft) hover:border-(--brand) hover:bg-(--brand-soft)/10 transition-colors"
                            >
                              {attachment.type === "image" ? (
                                <Image className="w-4 h-4 text-(--text-faint)" />
                              ) : (
                                <FileText className="w-4 h-4 text-(--text-faint)" />
                              )}
                              {attachmentUrl ? (
                                <a
                                  href={attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline truncate"
                                >
                                  {attachment.name}
                                </a>
                              ) : (
                                <span className="text-sm text-(--text-strong) font-semibold truncate">
                                  {attachment.name}
                                </span>
                              )}
                              {attachmentUrl && (
                                <a
                                  href={attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto text-(--text-faint) hover:text-(--text-strong) transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-3.5 border-t border-(--border-soft) space-y-3">
                    {canUpdate && (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setShowTaskDetails(false);
                            handleComplete(selectedTask.id);
                          }}
                          className="app-btn-primary min-h-0 py-2.5 flex items-center justify-center text-center font-bold"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => {
                            setShowTaskDetails(false);
                            setShowCannotCompleteModal(true);
                          }}
                          className="app-btn-secondary border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50/50 min-h-0 py-2.5 flex items-center justify-center text-center font-bold"
                        >
                          Cannot Complete
                        </button>
                        <button
                          onClick={() => {
                            setShowTaskDetails(false);
                            setShowExtensionModal(true);
                          }}
                          className="app-btn-secondary min-h-0 py-2.5 flex items-center justify-center text-center font-bold"
                        >
                          Extend
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => {
                          setShowTaskDetails(false);
                          setShowUploadModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-50 border border-violet-200 text-violet-750 hover:bg-violet-100 rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Files
                      </button>
                      <button
                        onClick={() => {
                          setShowTaskDetails(false);
                          setShowWantHelpModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 border border-teal-200 text-teal-750 hover:bg-teal-100 rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Ask for Help
                      </button>
                      {selectedTask.isHelpRequestForMe && (
                        <button
                          onClick={() => {
                            setShowTaskDetails(false);
                            setShowReceiveHelpModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-750 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-[0.98] animate-pulse"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Reply to
                          Help
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCannotCompleteModal && selectedTask && (
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50 bg-[rgba(27,36,47,0.28)] backdrop-blur-xs">
          <div className="app-modal max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-(--border-soft)">
                <div>
                  <h3 className="modal-title">Cannot Complete Task</h3>
                  <p className="modal-subtitle mt-1">
                    Provide a reason why this task cannot be completed
                  </p>
                </div>
                <button
                  onClick={() => setShowCannotCompleteModal(false)}
                  className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-(--text-body) text-sm">
                    <span className="font-semibold text-(--text-strong)">
                      Task:
                    </span>{" "}
                    <span className="wrap-break-word">
                      {getPlainText(selectedTask.task || selectedTask.title)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text-strong) mb-2">
                    Reason for not completing *
                  </label>
                  <textarea
                    value={cannotCompleteReason}
                    onChange={(e) => setCannotCompleteReason(e.target.value)}
                    className="app-input w-full text-sm resize-none focus:ring-red-500 focus:border-red-500"
                    rows="4"
                    placeholder="Please provide a detailed reason why this task cannot be completed..."
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t border-(--border-soft)">
                  <button
                    onClick={() => {
                      setCannotCompleteReason("");
                      setShowCannotCompleteModal(false);
                    }}
                    className="app-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCannotComplete}
                    disabled={!cannotCompleteReason.trim()}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Reason
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExtensionModal && selectedTask && (
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50 bg-[rgba(27,36,47,0.28)] backdrop-blur-xs">
          <div className="app-modal max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-(--border-soft)">
                <div>
                  <h3 className="modal-title">Request Extension</h3>
                  <p className="modal-subtitle mt-1">
                    Request more time to complete this task
                  </p>
                </div>
                <button
                  onClick={() => setShowExtensionModal(false)}
                  className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-(--text-body) text-sm">
                    <span className="font-semibold text-(--text-strong)">
                      Current Deadline:
                    </span>{" "}
                    {formatDate(
                      selectedTask.deadlineDate || selectedTask.dueDate,
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text-strong) mb-2">
                    Reason for extension *
                  </label>
                  <textarea
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    className="app-input w-full text-sm resize-none"
                    rows="4"
                    placeholder="Please explain why you need more time..."
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t border-(--border-soft)">
                  <button
                    onClick={() => {
                      setExtensionReason("");
                      setShowExtensionModal(false);
                    }}
                    className="app-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExtensionRequest}
                    disabled={!extensionReason.trim()}
                    className="app-btn-primary flex-1"
                  >
                    Request Extension
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && selectedTask && (
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50 bg-[rgba(27,36,47,0.28)] backdrop-blur-xs">
          <div className="app-modal max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-(--border-soft)">
                <div>
                  <h3 className="modal-title">Upload Files</h3>
                  <p className="modal-subtitle mt-1">
                    Upload documents and images for this task
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="app-icon-button p-2 text-(--text-soft) hover:text-(--text-strong) hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-(--text-body) text-sm mb-2">
                    <span className="font-semibold text-(--text-strong)">
                      Task:
                    </span>{" "}
                    <span className="wrap-break-word">
                      {getPlainText(selectedTask.task || selectedTask.title)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text-strong) mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="app-input w-full text-sm"
                    placeholder="Brief description of uploaded files..."
                  />
                </div>

                <div className="border-2 border-dashed border-(--border-strong) rounded-lg p-4 text-center hover:border-(--brand) hover:bg-(--brand-soft) transition-all duration-200">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="w-8 h-8 text-(--text-faint) mb-2" />
                    <div className="text-(--text-soft) text-xs">
                      <span className="font-medium text-(--brand)">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </div>
                    <p className="text-[10px] text-(--text-faint) mt-1">
                      Images (PNG, JPG, GIF) and documents (PDF, DOC, XLS) up to
                      10MB
                    </p>
                  </label>
                </div>

                {(uploadedFiles.length > 0 || uploadedImages.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-(--text-strong) text-sm">
                      Selected Files
                    </h4>

                    {uploadedImages.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-(--text-soft) mb-1.5">
                          Images
                        </h5>
                        <div className="grid grid-cols-3 gap-1.5">
                          {uploadedImages.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-(--border-soft)">
                                <Image className="w-6 h-6 text-(--text-faint)" />
                              </div>
                              <button
                                onClick={() => removeUploadedFile(index, true)}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                              <p className="text-[10px] text-(--text-soft) mt-1 truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-(--text-faint)">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-(--text-soft) mb-1.5">
                          Documents
                        </h5>
                        <div className="space-y-1.5">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-(--bg-subtle)/30 rounded-lg border border-(--border-soft) group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-(--text-faint) shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-(--text-strong) truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-[10px] text-(--text-faint)">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeUploadedFile(index, false)}
                                className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3.5 h-3.5 text-(--text-soft)" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-(--border-soft)">
                  <button
                    onClick={() => {
                      setUploadedFiles([]);
                      setUploadedImages([]);
                      setUploadDescription("");
                      setShowUploadModal(false);
                    }}
                    className="app-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveUploadedFiles}
                    disabled={
                      isUploadingFiles ||
                      (uploadedFiles.length === 0 &&
                        uploadedImages.length === 0)
                    }
                    className="app-btn-primary flex-1 font-bold"
                  >
                    {isUploadingFiles ? "Uploading..." : "Upload Files"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
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
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-progressBar {
          animation: progressBar 5s linear forwards;
        }
        .rich-text-content,
        .rich-text-content * {
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};

export default MyTask;
