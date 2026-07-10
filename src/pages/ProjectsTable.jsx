import React, { useState, useEffect } from "react";
import {
  MoreVertical,
  Filter,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "planning":
      return "bg-blue-50 text-blue-700 border border-blue-100";
    case "on hold":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border border-rose-100";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-100";
  }
};

const ProjectsTable = () => {
  const { companyId, token } = useAuth();
  const API_BASE_URL =
    import.meta.env.VITE_CSAAP_URL || "https://csaapnodeapi.csaap.com";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!companyId) {
        setError("No company ID found. Please check your user settings.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/tenant/clprojects?company_id=${companyId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load projects (Status: ${response.status})`,
          );
        }

        const data = await response.json();

        let projectsData = [];
        if (Array.isArray(data)) {
          projectsData = data;
        } else if (data.data && Array.isArray(data.data)) {
          projectsData = data.data;
        } else if (data.projects && Array.isArray(data.projects)) {
          projectsData = data.projects;
        } else if (data.result && Array.isArray(data.result)) {
          projectsData = data.result;
        }

        const mappedProjects = projectsData.map((item, index) => ({
          id: item.id || item.project_id || item._id || index + 1,
          name:
            item.name || item.project_name || item.title || "Unnamed Project",
          manager:
            item.manager ||
            item.project_manager ||
            item.manager_name ||
            item.assigned_to ||
            "Unassigned",
          progress: parseInt(
            item.progress || item.completion || item.completion_percentage || 0,
          ),
          budget: item.budget || item.project_budget || item.cost || "₹0",
          status:
            item.status || item.project_status || item.state || "Planning",
        }));

        setProjects(mappedProjects);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [companyId, token]);

  if (loading) {
    return (
      <div className="crm-module-root">
        <div className="app-panel p-8">
          <div className="flex flex-col justify-center items-center h-40 gap-3">
            <Loader2
              className="size-8 animate-spin text-(--brand)"
              strokeWidth={2.5}
            />
            <span className="text-(--text-soft) font-semibold text-sm">
              Loading projects...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crm-module-root">
        <div className="app-panel p-8 border-rose-100 bg-rose-50/10">
          <div className="text-center">
            <div className="text-rose-600 mb-4 flex flex-col items-center gap-2">
              <AlertCircle className="size-8 text-rose-500" />
              <p className="font-bold text-[15px]">Unable to load projects</p>
              <p className="text-sm text-rose-500/80 max-w-md mx-auto">
                {error}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="app-btn-secondary text-xs min-h-9 py-1.5 px-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-module-root">
      <div className="app-panel overflow-hidden">
        <div className="app-section-bar p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="app-heading">Active Projects ({projects.length})</h2>
          <div className="flex items-center gap-2">
            <button className="app-btn-secondary flex items-center gap-2 text-xs font-semibold py-1.5 px-3 min-h-9 rounded-xl border border-(--border-soft) hover:border-(--border-strong) transition-all">
              <Filter size={14} /> Filter
            </button>
            <button className="app-btn-secondary flex items-center gap-2 text-xs font-semibold py-1.5 px-3 min-h-9 rounded-xl border border-(--border-soft) hover:border-(--border-strong) transition-all">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="app-section-bar border-b border-(--border-soft)">
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                  Project Name
                </th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                  Project Manager
                </th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                  Progress
                </th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                  Budget
                </th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                  Status
                </th>
                <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-soft)">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <AlertCircle className="size-8 mx-auto mb-3 text-(--text-faint)" />
                    <p className="font-medium text-[14px] text-(--text-strong)">
                      No projects found
                    </p>
                    <p className="text-[13px] mt-1 text-(--text-soft)">
                      No active projects are currently listed in the system.
                    </p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-(--bg-subtle)/40 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-[14px] font-bold text-(--text-strong)">
                      {project.name}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-(--text-body)">
                      {project.manager}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(project.progress, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-(--text-soft) min-w-8">
                          {Math.min(project.progress, 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-(--text-strong)">
                      {project.budget}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-(--text-faint) hover:text-(--brand) transition-colors p-1 rounded-lg hover:bg-(--bg-subtle)">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;
