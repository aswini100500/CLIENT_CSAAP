import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api";
import axios from "axios";
import {
  AlertCircle,
  Download,
  Search,
  SearchX,
  X,
  User,
  Eye,
  CalendarClock,
  MapPin,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import ActionIconButton from "./ActionIconButton";
import { formatStatus, getStatusColor, formatSource } from "./leadUtils";
import LeadListSk from "../../../components/skeletons/LeadListSk";
import ReportEntryModal from "./ReportEntryModal";
import LeadDetailsModal from "./LeadDetailsModal";
import LeadTimelineModal from "./LeadTimelineModal";
import { usePermission } from "../../../../../../hooks/usePermission";
import useAuth from "../../../../../../hooks/useAuth";

const formatDateTime = (value) => {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";
  return date.toLocaleString();
};

const SalesPipeline = () => {
  const { has } = usePermission();
  const canExport = has("crm.leads.export");
  const canReportEntry = has("crm.leads.interested.interaction");

  const { user, companyId, token } = useAuth();

  const [contentVisible, setContentVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const queryClient = useQueryClient();
  const [showReportEntry, setShowReportEntry] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [reportData, setReportData] = useState({
    leadId: "",
    outcome: "SITE_VISIT_COMPLETE",
    note: "",
    nextFollowUpAt: "",
    siteVisitScheduledAt: "",
    siteVisitAssignedTo: "",
  });
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [viewingLead, setViewingLead] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineLead, setTimelineLead] = useState(null);

  const logInteractionMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.post(`/api/leads/${id}/interactions`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      setShowReportEntry(false);
      setSelectedLead(null);
      alert("Interaction logged successfully!");
    },
    onError: (error) => {
      alert(
        `Error logging interaction: ${
          error.response?.data?.message || error.message
        }`,
      );
    },
  });

  const handleReportEntry = (lead) => {
    setSelectedLead(lead);
    setReportData({
      leadId: lead.id,
      outcome: "SITE_VISIT_COMPLETE",
      note: "",
      nextFollowUpAt: "",
    });
    setShowReportEntry(true);
  };

  const handleSaveReport = () => {
    if (!reportData.outcome) {
      alert("Please select an outcome.");
      return;
    }

    logInteractionMutation.mutate({
      id: reportData.leadId,
      payload: {
        company_id: companyId,
        outcome: reportData.outcome,
        note: reportData.note,
        next_follow_up_at: null,
        site_visit_scheduled_at: null,
        site_visit_assigned_to: null,
      },
    });
  };

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setContentVisible(true);
    }, 40);

    return () => clearTimeout(revealTimer);
  }, []);

  const {
    data: rawLeads = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["leads", companyId],
    queryFn: async () => {
      const response = await api.get("/api/leads", {
        params: { company_id: companyId, limit: 500 },
      });
      return response.data.data || [];
    },
    enabled: !!companyId,
  });

  const { data: projectOptions = [] } = useQuery({
    queryKey: ["project-options", token, companyId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/clprojects`,
        {
          params: { company_id: companyId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const projects = response.data?.data || [];
      return projects.map((p) => ({
        project_id: p.id,
        composite_key: p.id,
        name: p.project_name,
        display_type: p.project_code || p.status || "",
        location: p.client_company_name
          ? `Client: ${p.client_company_name}`
          : "",
      }));
    },
    enabled: !!token && !!companyId,
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

  const leads = useMemo(
    () =>
      rawLeads
        .map((lead) => ({
          ...lead,
          name: lead.name || "Unnamed lead",
          email: lead.email || "",
        }))
        .filter((lead) => lead.stage === "SITE_VISIT"),
    [rawLeads],
  );

  const uniqueProjects = useMemo(() => {
    const ids = [...new Set(leads.map((l) => l.project_id).filter(Boolean))];
    return ids.map((id) => ({
      id,
      name: projectOptionsMap.get(id) || id,
    }));
  }, [leads, projectOptionsMap]);

  const uniqueSources = useMemo(() => {
    const sources = [...new Set(leads.map((l) => l.source).filter(Boolean))];
    return sources.map((source) => ({
      value: source,
      label: formatSource(source) || source,
    }));
  }, [leads]);

  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(leads.map((l) => l.status).filter(Boolean))];
    return statuses.map((status) => ({
      value: status,
      label: formatStatus(status),
    }));
  }, [leads]);

  const uniqueAssignees = useMemo(() => {
    const seen = new Set();
    const result = [];
    leads.forEach((l) => {
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
  }, [leads]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm.trim() ||
      selectedProject ||
      selectedSource ||
      selectedStatus ||
      selectedAssignee
    );
  }, [
    searchTerm,
    selectedProject,
    selectedSource,
    selectedStatus,
    selectedAssignee,
  ]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedProject("");
    setSelectedSource("");
    setSelectedStatus("");
    setSelectedAssignee("");
  };

  const visibleLeads = useMemo(() => {
    let result = [...leads];

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
        (lead) => lead.source?.toUpperCase() === selectedSource.toUpperCase(),
      );
    }

    if (selectedStatus) {
      result = result.filter(
        (lead) => lead.status?.toUpperCase() === selectedStatus.toUpperCase(),
      );
    }

    if (selectedAssignee) {
      result = result.filter((lead) => {
        const assigneeId = lead.assignee?.id || lead.assigned_to;
        return assigneeId && String(assigneeId) === String(selectedAssignee);
      });
    }

    result.sort(
      (first, second) =>
        new Date(second.created_at || 0).getTime() -
        new Date(first.created_at || 0).getTime(),
    );

    return result;
  }, [
    leads,
    searchTerm,
    selectedProject,
    selectedSource,
    selectedStatus,
    selectedAssignee,
  ]);

  const handleExportLeads = (leadSubset = leads) => {
    if (leadSubset.length === 0) {
      alert("No leads to export!");
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "Email",
      "Stage",
      "Status",
      "Last Contacted",
      "Next Follow-up",
      "Assigned To",
    ];
    const csvRows = [
      headers.join(","),
      ...leadSubset.map((lead) =>
        [
          `"${lead.name || ""}"`,
          `"${lead.phone || ""}"`,
          `"${lead.email || ""}"`,
          `"${lead.stage || ""}"`,
          `"${lead.status || ""}"`,
          `"${lead.last_contacted_at || ""}"`,
          `"${lead.next_follow_up_at || ""}"`,
          `"${lead.assignee?.name || lead.assigned_to || ""}"`,
        ].join(","),
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `sales_pipeline_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Exported ${leadSubset.length} leads successfully!`);
  };

  if (isLoading) {
    return <LeadListSk />;
  }

  return (
    <div
      className={`erp-root app-shell p-4 transition-all duration-400 ease-out ${contentVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-sm translate-y-2"}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {queryError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Error loading leads
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {queryError.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {!queryError && (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="app-title max-w-3xl">Site Visit</h1>
                <p className="app-subtitle mt-1">
                  Manage and track leads currently in the Site Visit stage.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canExport && (
                  <button
                    onClick={() => handleExportLeads(visibleLeads)}
                    className="app-btn-secondary active:scale-[0.98] flex items-center text-[13px]"
                  >
                    <Download className="size-3.5 mr-1.5 text-(--text-soft)" />
                    Export
                  </button>
                )}
              </div>
            </div>

            <div className="app-panel p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="w-full sm:w-44">
                    <label className="app-label block mb-1.5">Project</label>
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

                  <div className="w-full sm:w-36">
                    <label className="app-label block mb-1.5">Source</label>
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

                  <div className="w-full sm:w-36">
                    <label className="app-label block mb-1.5">Status</label>
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

                  <div className="w-full sm:w-40">
                    <label className="app-label block mb-1.5">Assignee</label>
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
                  Site Visit Pipeline ({visibleLeads.length} leads)
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
                        "Assigned To",
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
                                  onClick={() => {
                                    setViewingLead(lead);
                                    setShowLeadDetails(true);
                                  }}
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
                          <td className="px-4 py-3 text-[13px] font-semibold text-(--text-body) whitespace-nowrap">
                            {lead.assignee?.name || "Unassigned"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {canReportEntry &&
                                lead.status !== "SITE_VISIT_COMPLETE" && (
                                  <ActionIconButton
                                    icon={MapPin}
                                    label="Site Visited"
                                    onClick={() => handleReportEntry(lead)}
                                    className="app-icon-button p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                                  />
                                )}
                              <ActionIconButton
                                icon={Eye}
                                label="View details"
                                onClick={() => {
                                  setViewingLead(lead);
                                  setShowLeadDetails(true);
                                }}
                                className="app-icon-button p-1.5 text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--brand) hover:border-(--border-soft)"
                              />
                              <ActionIconButton
                                icon={CalendarClock}
                                label="Timeline"
                                onClick={() => {
                                  setTimelineLead(lead);
                                  setShowTimeline(true);
                                }}
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
                              There are currently no leads in the Site Visit
                              stage.
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
        )}

        {showReportEntry && selectedLead && (
          <ReportEntryModal
            lead={selectedLead}
            reportData={reportData}
            setReportData={setReportData}
            onClose={() => {
              setShowReportEntry(false);
              setSelectedLead(null);
            }}
            onSave={handleSaveReport}
            activeTab="site_visit"
          />
        )}

        {showLeadDetails && viewingLead && (
          <LeadDetailsModal
            lead={viewingLead}
            onClose={() => {
              setShowLeadDetails(false);
              setViewingLead(null);
            }}
            onViewTimeline={() => {
              setShowLeadDetails(false);
              setTimelineLead(viewingLead);
              setShowTimeline(true);
            }}
          />
        )}

        {showTimeline && timelineLead && (
          <LeadTimelineModal
            lead={timelineLead}
            onClose={() => {
              setShowTimeline(false);
              setTimelineLead(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SalesPipeline;
