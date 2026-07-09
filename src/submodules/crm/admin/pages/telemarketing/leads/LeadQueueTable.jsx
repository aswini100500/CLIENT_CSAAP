import {
  ArrowRightLeft,
  CalendarClock,
  Download,
  Eye,
  PhoneCall,
  Plus,
  Search,
  SearchX,
  User,
  UserPlus,
  Trash2,
  X,
  Layers,
  Briefcase,
  Building,
  UserCog,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api";
import useAuth from "../../../../../../hooks/useAuth";

import ActionIconButton from "./ActionIconButton";
import { formatStatus, getStatusColor, LEAD_SOURCES, formatSource } from "./leadUtils";

const stageTitles = {
  new: {
    title: "New Leads",
    subtitle: "Fresh unassigned leads waiting for ownership.",
  },
  assigned: {
    title: "Assigned",
    subtitle: "Assigned leads waiting for the first interaction.",
  },
  followup: {
    title: "Follow-up",
    subtitle: "Leads that need the next call or reminder.",
  },
  interested: {
    title: "Interested",
    subtitle: "Leads that have shown positive interest.",
  },
  accepted: {
    title: "Accepted",
    subtitle: "Leads that have successfully been accepted.",
  },
  rejected: {
    title: "Rejected",
    subtitle: "Leads that were lost after the final outcome.",
  },
};

const filterByTab = (leads, tabKey) => {
  switch (tabKey) {
    case "new":
      return leads.filter((l) => l.stage === "NEW");
    case "assigned":
      return leads.filter((l) => l.stage !== "NEW");
    case "followup":
      return leads.filter((l) => l.stage === "FOLLOW_UP");
    case "interested":
      return leads.filter((l) => l.stage === "INTERESTED" || l.stage === "SITE_VISIT");
    case "accepted":
      return leads.filter((l) => l.stage === "ACCEPTED");
    case "rejected":
      return leads.filter((l) => l.stage === "REJECTED");
    default:
      return [];
  }
};

const formatDateTime = (value) => {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";
  return date.toLocaleString();
};

const LeadQueueTable = ({
  activeTab = "new",
  leads,
  onCreateLead,
  onExportLeads,
  onViewDetails,
  onViewTimeline,
  onReportEntry,
  onAssignLead,
  onTransferLead,
  onDeleteLead,
  onCreatePaymentSlab,
  onViewPaymentSlabs,
  onProjectSetup,
  onCreateProject,
  onCustomerProfileSetup,
  showAssignee = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const { token } = useAuth();

  // Fetch project options to map project IDs to friendly names
  const { data: projectOptions = [] } = useQuery({
    queryKey: ["project-options", token],
    queryFn: async () => {
      const response = await api.get("/api/projects/options");
      return response.data.data || [];
    },
    enabled: !!token,
  });

  const projectOptionsMap = useMemo(() => {
    const map = new Map();
    projectOptions.forEach((p) => {
      if (p.project_id) {
        map.set(p.project_id, p.name);
      }
    });
    return map;
  }, [projectOptions]);

  // Reset filters when activeTab changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedProject("");
    setSelectedSource("");
    setSelectedStatus("");
    setSelectedAssignee("");
  }, [activeTab]);

  // Dynamically extract unique options present in the current active stage's leads
  const stageLeads = useMemo(() => filterByTab(leads, activeTab), [leads, activeTab]);

  const uniqueProjects = useMemo(() => {
    const ids = [...new Set(stageLeads.map((l) => l.project_id).filter(Boolean))];
    return ids.map((id) => ({
      id,
      name: projectOptionsMap.get(id) || id,
    }));
  }, [stageLeads, projectOptionsMap]);

  const uniqueSources = useMemo(() => {
    const sources = [...new Set(stageLeads.map((l) => l.source).filter(Boolean))];
    return sources.map((source) => ({
      value: source,
      label: formatSource(source) || source,
    }));
  }, [stageLeads]);

  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(stageLeads.map((l) => l.status).filter(Boolean))];
    return statuses.map((status) => ({
      value: status,
      label: formatStatus(status),
    }));
  }, [stageLeads]);

  const uniqueAssignees = useMemo(() => {
    const seen = new Set();
    const result = [];
    stageLeads.forEach((l) => {
      const a = l.assignee;
      if (a && a.name) {
        const id = a.id || l.assigned_to;
        if (id && !seen.has(id)) {
          seen.add(id);
          result.push({ id, name: a.name });
        }
      }
    });
    return result;
  }, [stageLeads]);

  const hasActiveFilters = useMemo(() => {
    return !!(searchTerm.trim() || selectedProject || selectedSource || selectedStatus || selectedAssignee);
  }, [searchTerm, selectedProject, selectedSource, selectedStatus, selectedAssignee]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedProject("");
    setSelectedSource("");
    setSelectedStatus("");
    setSelectedAssignee("");
  };

  const copy = stageTitles[activeTab] || stageTitles.new;

  const visibleLeads = useMemo(() => {
    let result = filterByTab(leads, activeTab);

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(term) ||
          lead.phone?.toLowerCase().includes(term) ||
          lead.email?.toLowerCase().includes(term),
      );
    }

    if (selectedProject) {
      result = result.filter((lead) => lead.project_id === selectedProject);
    }

    if (selectedSource) {
      result = result.filter(
        (lead) => lead.source?.toUpperCase() === selectedSource.toUpperCase()
      );
    }

    if (selectedStatus) {
      result = result.filter(
        (lead) => lead.status?.toUpperCase() === selectedStatus.toUpperCase()
      );
    }

    if (selectedAssignee) {
      result = result.filter((lead) => {
        const assigneeId = lead.assignee?.id || lead.assigned_to;
        return assigneeId && String(assigneeId) === String(selectedAssignee);
      });
    }

    if (activeTab === "followup") {
      result.sort((first, second) => {
        const firstDate = first.next_follow_up_at
          ? new Date(first.next_follow_up_at).getTime()
          : Number.MAX_SAFE_INTEGER;
        const secondDate = second.next_follow_up_at
          ? new Date(second.next_follow_up_at).getTime()
          : Number.MAX_SAFE_INTEGER;
        return firstDate - secondDate;
      });
    } else if (activeTab === "interested" || activeTab === "accepted" || activeTab === "rejected") {
      result.sort(
        (first, second) =>
          new Date(second.updated_at || 0).getTime() -
          new Date(first.updated_at || 0).getTime(),
      );
    } else {
      result.sort(
        (first, second) =>
          new Date(second.created_at || 0).getTime() -
          new Date(first.created_at || 0).getTime(),
      );
    }

    return result;
  }, [leads, searchTerm, activeTab, selectedProject, selectedSource, selectedStatus, selectedAssignee]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="app-title max-w-3xl">
            {copy.title}
          </h1>
          <p className="app-subtitle mt-1">{copy.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onExportLeads && (
            <button
              onClick={() => onExportLeads(visibleLeads)}
              className="app-btn-secondary active:scale-[0.98] flex items-center text-[13px]"
            >
              <Download className="size-3.5 mr-1.5 text-(--text-soft)" />
              Export
            </button>
          )}
          {onCreateLead && (
            <button
              onClick={onCreateLead}
              className="app-btn-primary active:scale-[0.98] flex items-center text-[13px]"
            >
              <Plus className="size-3.5 mr-1.5" />
              Add lead
            </button>
          )}
        </div>
      </div>

      <div className="app-panel p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left section: Search bar */}
          <div className="flex-1 min-w-0">
            <label className="app-label block mb-1.5 font-bold tracking-wide">
              Search Leads
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, phone, or email..."
                className="app-input w-full pl-9 pr-3 py-2 text-[13px]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) size-3.5" />
            </div>
          </div>

          {/* Right section: Filters controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Project Filter */}
            <div className="w-full sm:w-44">
              <label className="app-label block mb-1.5">
                Project
              </label>
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="app-input w-full pl-3 pr-8 py-2 text-[13px] appearance-none cursor-pointer bg-white"
                >
                  <option value="">All Projects</option>
                  {uniqueProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="size-3 text-(--text-faint)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Source Filter */}
            <div className="w-full sm:w-36">
              <label className="app-label block mb-1.5">
                Source
              </label>
              <div className="relative">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="app-input w-full pl-3 pr-8 py-2 text-[13px] appearance-none cursor-pointer bg-white"
                >
                  <option value="">All Sources</option>
                  {uniqueSources.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="size-3 text-(--text-faint)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-36">
              <label className="app-label block mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="app-input w-full pl-3 pr-8 py-2 text-[13px] appearance-none cursor-pointer bg-white"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="size-3 text-(--text-faint)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Assignee Filter - only shown when relevant (e.g. stage is not NEW) */}
            {activeTab !== "new" && showAssignee && (
              <div className="w-full sm:w-40">
                <label className="app-label block mb-1.5">
                  Assignee
                </label>
                <div className="relative">
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="app-input w-full pl-3 pr-8 py-2 text-[13px] appearance-none cursor-pointer bg-white"
                  >
                    <option value="">All Assignees</option>
                    {uniqueAssignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="size-3 text-(--text-faint)"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="w-full sm:w-auto self-end pt-1 lg:pt-0">
                <button
                  onClick={clearAllFilters}
                  className="w-full text-[12px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl border border-red-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                >
                  <X className="size-3.5" />
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="app-panel overflow-hidden">
        <div className="app-section-bar px-4 py-3">
          <h3 className="app-heading">
            {copy.title} ({visibleLeads.length} leads)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white border-b border-(--border-soft)">
                {[
                  "Name",
                  "Phone",
                  "Status",
                  "Last Contacted",
                  "Next Follow-up",
                  ...(showAssignee ? ["Assigned To"] : []),
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-2.5 text-left text-[11px] font-extrabold text-(--text-soft) uppercase tracking-widest"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-(--bg-subtle)">
              {visibleLeads.length > 0 ? (
                visibleLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-(--bg-subtle)/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl flex items-center justify-center shrink-0 bg-(--bg-subtle) border border-(--border-soft)">
                          <User className="size-4 text-(--text-faint)" />
                        </div>
                        <div>
                          <button
                            onClick={() => onViewDetails(lead)}
                            className="text-[14px] font-bold tracking-[-0.02em] text-(--text-strong) hover:text-(--brand) transition-colors text-left"
                          >
                            {lead.name}
                          </button>
                          <div className="text-[12px] font-medium text-(--text-faint) truncate max-w-45">
                            {lead.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-(--text-body) whitespace-nowrap">
                      {lead.phone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor(lead.status)}`}
                      >
                        {formatStatus(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-(--text-body) whitespace-nowrap">
                      {formatDateTime(lead.last_contacted_at)}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-(--text-body) whitespace-nowrap">
                      {formatDateTime(lead.next_follow_up_at)}
                    </td>
                    {showAssignee && (
                      <td className="px-4 py-3 text-[13px] font-semibold text-(--text-body) whitespace-nowrap">
                        {lead.assignee?.name || "Unassigned"}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {activeTab === "new" && (
                          <>
                            {onAssignLead && (
                              <ActionIconButton
                                icon={UserPlus}
                                label="Assign"
                                onClick={() => onAssignLead(lead)}
                                className="app-icon-button p-1.5 text-violet-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                              />
                            )}
                            {onDeleteLead && (
                              <ActionIconButton
                                icon={Trash2}
                                label="Delete"
                                onClick={() => onDeleteLead(lead)}
                                className="app-icon-button p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                              />
                            )}
                          </>
                        )}
                        {(activeTab === "assigned" || activeTab === "followup") && (
                          <>
                            {onReportEntry && !(lead.stage === "ACCEPTED" || lead.stage === "REJECTED" || lead.status === "ACCEPTED" || lead.status === "REJECTED") && (
                              <ActionIconButton
                                icon={PhoneCall}
                                label="Log interaction"
                                onClick={() => onReportEntry(lead)}
                                className="app-icon-button p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                              />
                            )}
                            {onTransferLead && (
                              <ActionIconButton
                                icon={ArrowRightLeft}
                                label="Transfer assignment"
                                onClick={() => onTransferLead(lead)}
                                className="app-icon-button p-1.5 text-teal-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
                              />
                            )}
                          </>
                        )}
                        {activeTab === "interested" && onReportEntry && (
                          <ActionIconButton
                            icon={PhoneCall}
                            label="Log interaction"
                            onClick={() => onReportEntry(lead)}
                            className="app-icon-button p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          />
                        )}
                        {activeTab === "accepted" && (
                          <>
                            {(onViewPaymentSlabs || onCreatePaymentSlab) && (
                              <ActionIconButton
                                icon={Layers}
                                label="Manage Payment Slabs"
                                onClick={() => (onViewPaymentSlabs || onCreatePaymentSlab)(lead)}
                                className="app-icon-button p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                              />
                            )}
                            {onCreateProject && (
                              <ActionIconButton
                                icon={Building}
                                label="Create Project"
                                onClick={() => onCreateProject(lead)}
                                className="app-icon-button p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                              />
                            )}
                            {onProjectSetup && (
                              <ActionIconButton
                                icon={Briefcase}
                                label="Project Setup"
                                onClick={() => onProjectSetup(lead)}
                                className="app-icon-button p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                              />
                            )}
                            {onCustomerProfileSetup && (
                              <ActionIconButton
                                icon={UserCog}
                                label="Customer Profile Setup"
                                onClick={() => onCustomerProfileSetup(lead)}
                                className="app-icon-button p-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                              />
                            )}
                          </>
                        )}
                        <ActionIconButton
                          icon={Eye}
                          label="View details"
                          onClick={() => onViewDetails(lead)}
                          className="app-icon-button p-1.5 text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--brand) hover:border-(--border-soft)"
                        />
                        <ActionIconButton
                          icon={CalendarClock}
                          label="Timeline"
                          onClick={() => onViewTimeline(lead)}
                          className="app-icon-button p-1.5 text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) hover:border-(--border-soft)"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center">
                    <div className="text-slate-600">
                      <SearchX className="size-8 mx-auto mb-3 text-(--text-faint)" />
                      <p className="text-[14px] font-medium text-(--text-strong)">
                        No leads found
                      </p>
                      <p className="text-[13px] mt-1 text-(--text-soft)">
                        Try another tab or create a new lead.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadQueueTable;
