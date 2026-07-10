import axios from "axios";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Archive as ArchiveIcon,
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  FileText,
  Info,
  RotateCcw,
  Search,
  User,
  UserCheck,
} from "lucide-react";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useAuth from "../../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser";
const renderRichText = (html) => {
  if (!html) return null;


  const cleanHtml = String(html).replace(/&nbsp;/g, ' ');

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const options = {
    replace: (domNode) => {
      if (domNode.type === 'text') {
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
    }
  };


  return <>{parse(cleanHtml, options)}</>;
};

const ArchivedTasks = () => {
  const navigate = useNavigate();
  const { user, token: authToken } = useAuth();
  const slug = user?.slug;
  const API = `${import.meta.env.VITE_HRMS_BASE_URL}`;
  const csaapToken = authToken;

  const [archivedTasks, setArchivedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const [teamMembers, setTeamMembers] = useState([]);

  const showSnackbar = (message, type = "info") => {
    setSnackbar({ open: true, message, type });
    setTimeout(
      () => setSnackbar({ open: false, message: "", type: "info" }),
      3000,
    );
  };


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!csaapToken) {
          console.error("CSAAP token not found");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
          {
            headers: {
              Authorization: `Bearer ${csaapToken}`,
            },
          },
        );

        const employeesData = response.data?.data || [];
        const employees = employeesData.map((emp) => ({
          id: emp.id,
          name: emp.name,
          role: emp.postApplied || emp.department || "Employee",
        }));

        setTeamMembers(employees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setTeamMembers([]);
      }
    };

    fetchEmployees();
  }, [csaapToken]);


  const getEmployeeNameById = useCallback(
    (id) => {
      if (!id) return "Unknown";
      if (String(id).toLowerCase() === "admin" || id === user.company_id)
        return "Superadmin";
      const employee = teamMembers.find((emp) => String(emp.id) === String(id));
      return employee ? employee.name : "Senior Manager BBSR";
    },
    [teamMembers, user.company_id],
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

  const fetchArchivedTasks = async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/api/tasks/archived`, {
        params: { slug },
      });
      setArchivedTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch archived tasks", err);
      showSnackbar("Failed to load archived tasks", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (taskId) => {
    try {
      await axios.post(`${API}/api/tasks/restore/${taskId}`);
      showSnackbar("Task restored successfully with Pending status", "success");
      fetchArchivedTasks();
    } catch (err) {
      console.error("Failed to restore task", err);
      showSnackbar("Failed to restore task", "error");
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, [slug]);

  const filteredTasks = archivedTasks.filter(
    (task) =>
      (task.title || task.task || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (task.project || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Blocked":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const getSnackbarColor = (type) => {
    switch (type) {
      case "success":
        return "bg-emerald-600";
      case "error":
        return "bg-rose-600";
      case "warning":
        return "bg-orange-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div className="crm-module-root min-h-screen bg-(--bg-app) w-full p-4 flex flex-col">
      <div className="max-w-7xl mx-auto w-full space-y-6 flex-1">

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="app-btn-secondary flex items-center gap-2 cursor-pointer text-xs py-1.5 px-3 min-h-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Task Management
          </button>
          
          <div>
            <h1 className="app-title max-w-3xl">Archived Tasks</h1>
            <p className="app-subtitle mt-1">
              Review, search, and restore tasks that have been archived.
            </p>
          </div>
        </div>


        <div className="app-grid-4">
          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                  Total Archived
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-(--text-strong)">
                  {archivedTasks.length}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Deleted tasks count
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                <ArchiveIcon className="size-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                  Completed
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-(--text-strong)">
                  {archivedTasks.filter((t) => t.status === "Completed").length}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Finished tasks count
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Check className="size-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                  In Progress
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-(--text-strong)">
                  {archivedTasks.filter((t) => t.status === "In Progress").length}
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  In progress tasks
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <FileText className="size-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="app-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                  High Priority
                </p>
                <div className="mt-2 text-[26px] font-extrabold leading-none text-(--text-strong)">
                  {
                    archivedTasks.filter(
                      (t) => t.priority === "High" || t.priority === "Critical"
                    ).length
                  }
                </div>
                <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
                  Urgent tasks count
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="size-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>


        <div className="app-panel p-4">
          <div className="relative max-w-xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search archived tasks or projects..."
              className="w-full pl-9! pr-3! py-2! app-input text-xs"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) size-3.5" />
          </div>
        </div>


        <div className="app-panel overflow-hidden border border-(--border-soft)">
          <div className="app-section-bar px-4 py-3.5 flex items-center justify-between gap-3 bg-white">
            <h3 className="app-heading flex items-center gap-2">
              <ArchiveIcon className="w-4 h-4 text-indigo-600" />
              Archived Tasks List
            </h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-white">
              <div className="w-8 h-8 border-3 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-xs font-semibold text-(--text-soft)">
                Fetching archived tasks...
              </p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="overflow-x-auto bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white border-b border-(--border-soft)">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Task Details
                    </th>
                    <th className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Assigned By
                    </th>
                    <th className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Assigned To
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Priority
                    </th>
                    <th className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Dates
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--bg-subtle)">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-(--bg-subtle)/50 border-b border-(--border-soft) last:border-b-0 duration-200 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] font-bold text-(--text-strong) line-clamp-1 max-w-xs">
{renderRichText(task.title || task.task)}                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-(--brand-soft) text-(--brand) border border-(--border-soft) w-fit mt-1">
                            <Briefcase className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {task.project || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-semibold text-(--text-body)">
                          {getEmployeeNameById(task.assignedBy) || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-medium text-(--text-body) line-clamp-1 max-w-50">
                          {task.assignedTo
                            ? getEmployeeNamesByIds(
                                Array.isArray(task.assignedTo)
                                  ? task.assignedTo
                                  : typeof task.assignedTo === "string"
                                    ? JSON.parse(task.assignedTo)
                                    : []
                              )
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusColor(task.status)}`}
                        >
                          {task.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority || "Medium")}`}
                        >
                          {task.priority || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-xs text-(--text-soft)">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-(--text-faint)" />
                            <span>
                              {task.created_at
                                ? new Date(task.created_at).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold text-orange-600">
                            <ArchiveIcon className="w-3.5 h-3.5 text-orange-400" />
                            <span>
                              {task.archivedAt
                                ? new Date(task.archivedAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRestore(task.id)}
                          className="app-btn-secondary inline-flex items-center gap-1.5 py-1.5 px-3 min-h-0 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center bg-white">
              <ArchiveIcon className="size-8 mx-auto mb-3 text-(--text-faint)" />
              <p className="text-[14px] font-medium text-(--text-strong)">
                No archived tasks
              </p>
              <p className="text-[13px] mt-1 text-(--text-soft)">
                Tasks you delete will appear here. You can restore them at any time.
              </p>
            </div>
          )}
        </div>
      </div>


      {snackbar.open && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: 20 }}
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 font-medium text-white ${getSnackbarColor(snackbar.type)}`}
        >
          {snackbar.type === "success" && <Check className="w-5 h-5" />}
          {snackbar.type === "error" && <AlertCircle className="w-5 h-5" />}
          {snackbar.type === "warning" && <AlertTriangle className="w-5 h-5" />}
          {snackbar.type === "info" && <Info className="w-5 h-5" />}
          {snackbar.message}
        </motion.div>
      )}
    </div>
  );
};

export default ArchivedTasks;
