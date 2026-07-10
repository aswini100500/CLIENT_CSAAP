import { useQuery } from "@tanstack/react-query";
import api from "../../../../api";
import axios from "axios";
import { createPortal } from "react-dom";
import useAuth from "../../../../../../hooks/useAuth";
import React, { createElement, useState } from "react";
import {
  CalendarClock,
  ChevronRight,
  ClipboardPenLine,
  Clock,
  FileText,
  Hash,
  Info,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  User,
  X,
} from "lucide-react";
import { formatSource, formatStatus, getStatusColor } from "./leadUtils";
import ProjectDetailsModal from "./ProjectDetailsModal";

const formatDateTime = (value) => {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";
  return date.toLocaleString();
};

const formatRelativeDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const DetailRow = ({
  icon: IconComponent,
  label,
  value,
  iconColor = "text-[color:var(--text-faint)]",
}) => (
  <div className="flex items-center gap-2.5 py-2 min-w-0">
    {createElement(IconComponent, {
      className: `size-3.5 shrink-0 ${iconColor}`,
    })}
    <span className="text-[12px] text-(--text-faint) shrink-0">{label}</span>
    <span className="text-[13px] font-medium text-(--text-strong) truncate ml-auto text-right">
      {value || "NA"}
    </span>
  </div>
);

const LeadDetailsModal = ({
  lead,
  onClose,
  onEdit,
  onReportEntry,
  onViewTimeline,
}) => {
  const canLogInteraction =
    lead.stage === "ASSIGNED" ||
    lead.stage === "FOLLOW_UP" ||
    lead.stage === "INTERESTED" ||
    lead.stage === "SITE_VISIT";

  const { token } = useAuth();

  const [showProjectModal, setShowProjectModal] = useState(false);

  const { data: projectDetails, isLoading: isLoadingProject } = useQuery({
    queryKey: ["project-details", lead?.project_id, token],
    queryFn: async () => {
      const response = await api.get(`/api/projects/${lead.project_id}`);
      return response.data?.data || response.data;
    },
    enabled: !!lead?.project_id && !!token,
  });

  const { data: brokerOptions = [] } = useQuery({
    queryKey: ["broker-options", token],
    queryFn: async () => {
      const response = await axios.get(
        "https://csaapnodeapi.csaap.com/api/tenant/broker",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data.data || [];
    },
    enabled:
      !!token && lead?.source?.toUpperCase() === "BROKER" && !!lead?.broker_id,
  });

  const selectedBroker = brokerOptions.find(
    (b) => String(b.id) === String(lead.broker_id),
  );
  const brokerName = selectedBroker
    ? selectedBroker.name
    : lead.broker_name || lead.broker_id;

  const { data: lastInteraction, isLoading: isLoadingLast } = useQuery({
    queryKey: ["lead-last-interaction", lead.id, lead.company_id],
    queryFn: async () => {
      const response = await api.get(`/api/leads/${lead.id}/follow-ups`, {
        params: { company_id: lead.company_id },
      });
      const items = response.data.data || [];
      return items.length > 0 ? items[0] : null;
    },
    enabled: !!lead?.id && !!lead?.company_id,
  });

  const modalContent = (
    <>
      {!showProjectModal ? (
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
          <div className="app-modal w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
              <div className="flex items-start gap-3.5 min-w-0 pr-4">
                <div className="size-11 rounded-2xl flex items-center justify-center bg-(--brand-soft) border border-(--border-soft) shrink-0">
                  <User className="size-5 text-(--brand)" />
                </div>
                <div className="min-w-0">
                  <h3 className="modal-title truncate">{lead.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor(lead.status)}`}
                    >
                      {formatStatus(lead.status)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="app-icon-button mt-0.5 p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) active:scale-95"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
              <div className="app-panel overflow-hidden">
                <div className="app-section-bar px-4 py-2.5">
                  <h4 className="app-heading">Lead details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-(--bg-subtle)">
                  <div className="px-4 py-1 divide-y divide-(--bg-subtle)">
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={lead.phone}
                      iconColor="text-sky-500"
                    />
                    <DetailRow
                      icon={Mail}
                      label="Email"
                      value={lead.email}
                      iconColor="text-emerald-500"
                    />
                    <DetailRow
                      icon={MapPin}
                      label="Location"
                      value={lead.location}
                    />
                    <DetailRow
                      icon={User}
                      label="Assigned To"
                      value={
                        lead.assignee
                          ? `${lead.assignee.name}${
                              lead.assignee.department
                                ? ` (${lead.assignee.department})`
                                : ""
                            }`
                          : "Unassigned"
                      }
                      iconColor="text-rose-400"
                    />
                  </div>

                  <div className="px-4 py-1 divide-y divide-(--bg-subtle)">
                    <div className="flex items-center gap-2.5 py-2 min-w-0">
                      <Hash className="size-3.5 shrink-0 text-(--text-faint)" />
                      <span className="text-[12px] text-(--text-faint) shrink-0">
                        Project
                      </span>
                      <div className="ml-auto text-right flex items-center gap-1.5 min-w-0">
                        {isLoadingProject ? (
                          <span className="text-[12px] text-(--text-faint) animate-pulse font-medium">
                            Loading...
                          </span>
                        ) : projectDetails ? (
                          <>
                            <span
                              className="text-[13px] font-bold text-(--text-strong) truncate max-w-30"
                              title={projectDetails.name}
                            >
                              {projectDetails.name}
                            </span>
                            <button
                              onClick={() => setShowProjectModal(true)}
                              className="flex items-center gap-0.5 text-[11.5px] font-semibold text-(--brand) hover:text-(--brand-strong) transition-colors cursor-pointer shrink-0 ml-1.5"
                              title="View project details"
                            >
                              <Info className="size-3" />
                              <span>details</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[13px] font-semibold text-(--text-strong) truncate max-w-37.5">
                            {lead.project_id || "NA"}
                          </span>
                        )}
                      </div>
                    </div>
                    <DetailRow
                      icon={Info}
                      label="Source"
                      value={formatSource(lead.source)}
                    />
                    {lead.source?.toUpperCase() === "BROKER" && (
                      <>
                        <DetailRow
                          icon={User}
                          label="Broker Name"
                          value={brokerName || "NA"}
                          iconColor="text-violet-500"
                        />
                        <DetailRow
                          icon={Hash}
                          label="Broker Commission"
                          value={lead.commission ? `${lead.commission}%` : "NA"}
                          iconColor="text-amber-500"
                        />
                      </>
                    )}
                    <DetailRow
                      icon={CalendarClock}
                      label="Last contacted"
                      value={formatDateTime(lead.last_contacted_at)}
                    />
                    <DetailRow
                      icon={CalendarClock}
                      label="Next follow-up"
                      value={formatDateTime(lead.next_follow_up_at)}
                    />
                    {lead.site_visit_scheduled_at && (
                      <>
                        <DetailRow
                          icon={CalendarClock}
                          label="Site Visit Scheduled"
                          value={formatDateTime(lead.site_visit_scheduled_at)}
                          iconColor="text-indigo-500"
                        />
                        <DetailRow
                          icon={User}
                          label="Site Visit Assignee"
                          value={
                            lead.site_visit_assignee
                              ? `${lead.site_visit_assignee.name}${
                                  lead.site_visit_assignee.department
                                    ? ` (${lead.site_visit_assignee.department})`
                                    : ""
                                }`
                              : "Unassigned"
                          }
                          iconColor="text-indigo-400"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="app-panel overflow-hidden">
                <div className="app-section-bar px-4 py-2.5 flex items-center justify-between">
                  <h4 className="app-heading">Last interaction</h4>
                  <button
                    onClick={onViewTimeline}
                    className="flex items-center gap-1 text-[12px] font-medium text-(--brand) hover:text-(--brand-strong) transition-colors"
                  >
                    View full timeline
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
                <div className="p-3.5">
                  {isLoadingLast ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  ) : lastInteraction ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor(lastInteraction.outcome)}`}
                        >
                          {formatStatus(lastInteraction.outcome)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-(--text-faint)">
                            {formatRelativeDate(lastInteraction.created_at)}
                          </span>
                          <span className="text-[12px] text-(--text-faint)">
                            {formatDateTime(lastInteraction.created_at)}
                          </span>
                        </div>
                      </div>
                      {lastInteraction.note && (
                        <p className="text-[13px] text-(--text-body) whitespace-pre-wrap bg-(--bg-subtle) border border-(--border-soft) rounded-xl p-2.5 line-clamp-3">
                          {lastInteraction.note}
                        </p>
                      )}
                      {lastInteraction.next_follow_up_at && (
                        <div className="flex items-center gap-1.5 text-[12px] text-(--text-soft)">
                          <CalendarClock className="size-3 text-(--text-faint)" />
                          Next follow-up:{" "}
                          {formatDateTime(lastInteraction.next_follow_up_at)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[13px] text-(--text-faint) py-2">
                      <Clock className="size-4 text-(--text-faint)" />
                      No interactions logged yet.
                    </div>
                  )}
                </div>
              </div>

              {((canLogInteraction && onReportEntry) || onEdit) && (
                <div
                  className={`grid grid-cols-1 ${canLogInteraction && onReportEntry && onEdit ? "sm:grid-cols-2" : ""} gap-3`}
                >
                  {canLogInteraction && onReportEntry && (
                    <button
                      onClick={onReportEntry}
                      className="app-panel flex items-center gap-3 p-3 hover:bg-(--bg-subtle) active:scale-[0.98] transition-all"
                    >
                      <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
                        <PhoneCall className="size-4 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-[13px] font-medium text-(--text-strong)">
                          Log interaction
                        </div>
                        <div className="text-[11px] text-(--text-faint) leading-tight mt-0.5">
                          Record outcome
                        </div>
                      </div>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="app-panel flex items-center gap-3 p-3 hover:bg-(--bg-subtle) active:scale-[0.98] transition-all"
                    >
                      <div className="p-2 bg-orange-50 rounded-xl border border-orange-100 shrink-0">
                        <ClipboardPenLine className="size-4 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-[13px] font-medium text-(--text-strong)">
                          Edit contact
                        </div>
                        <div className="text-[11px] text-(--text-faint) leading-tight mt-0.5">
                          Update details
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[12px] text-(--text-faint) px-1">
                <FileText className="size-3 text-(--text-faint)" />
                Created {formatDateTime(lead.created_at)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        projectDetails && (
          <ProjectDetailsModal
            project={projectDetails}
            onClose={() => setShowProjectModal(false)}
          />
        )
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default LeadDetailsModal;
