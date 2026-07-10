import { useQuery } from "@tanstack/react-query";
import api from "../../../../api";
import { createPortal } from "react-dom";
import {
  CalendarClock,
  CircleDot,
  Clock,
  MessageSquare,
  Phone,
  PhoneOff,
  Trophy,
  User,
  X,
  XCircle,
} from "lucide-react";
import { getStatusColor } from "./leadUtils";

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

const outcomeConfig = {
  NO_RESPONSE: {
    icon: PhoneOff,
    label: "No response",
    color: "amber",
  },
  CALL_BACK: {
    icon: Phone,
    label: "Call back",
    color: "teal",
  },
  REJECTED: {
    icon: XCircle,
    label: "Rejected",
    color: "red",
  },
};

const nodeStyles = {
  amber: {
    circle: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
  },
  teal: {
    circle: "bg-teal-50 border-teal-200",
    icon: "text-teal-600",
  },
  indigo: {
    circle: "bg-indigo-50 border-indigo-200",
    icon: "text-indigo-600",
  },
  rose: {
    circle: "bg-rose-50 border-rose-200",
    icon: "text-rose-600",
  },
  emerald: {
    circle: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-600",
  },
  red: {
    circle: "bg-red-50 border-red-200",
    icon: "text-red-600",
  },
  slate: {
    circle: "bg-slate-50 border-slate-200",
    icon: "text-slate-600",
  },
};

const getOutcomeConfig = (outcome) =>
  outcomeConfig[outcome] || {
    icon: CircleDot,
    label: outcome,
    color: "slate",
  };

const LeadTimelineModal = ({ lead, onClose }) => {
  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ["lead-timeline", lead.id, lead.company_id],
    queryFn: async () => {
      const response = await api.get(`/api/leads/${lead.id}/follow-ups`, {
        params: { company_id: lead.company_id },
      });
      return response.data.data || [];
    },
    enabled: !!lead?.id && !!lead?.company_id,
  });

  const events = [
    ...timeline.map((item) => ({
      ...item,
      type: "interaction",
      timestamp: item.created_at,
    })),
    {
      id: "created",
      type: "created",
      outcome: null,
      timestamp: lead.created_at,
      note: `${lead.name} entered the lead queue.`,
    },
  ];

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
      <div className="app-modal w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="flex items-start gap-3.5 min-w-0 pr-4">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-(--brand-soft) border border-(--border-soft) shrink-0">
              <User className="size-5 text-(--brand)" />
            </div>
            <div className="min-w-0">
              <h3 className="modal-title truncate">{lead.name}</h3>
              <p className="modal-subtitle mt-1">Interaction timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button mt-0.5 p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3.5 animate-pulse">
                  <div className="size-8 rounded-xl bg-(--bg-subtle) shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-(--bg-subtle) rounded w-1/3" />
                    <div className="h-3 bg-(--bg-subtle) rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="size-8 mx-auto mb-3 text-(--text-faint)" />
              <p className="text-[14px] font-medium text-(--text-strong)">
                No interactions yet
              </p>
              <p className="text-[13px] mt-1 text-(--text-soft)">
                Log an interaction to start the timeline.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3.75 inset-y-4 w-px bg-(--border-soft)" />

              <div className="space-y-0">
                {events.map((event) => {
                  const isCreated = event.type === "created";
                  const config = isCreated
                    ? { icon: CircleDot, label: "Lead created", color: "slate" }
                    : getOutcomeConfig(event.outcome);
                  const Icon = config.icon;
                  const styles = nodeStyles[config.color] || nodeStyles.slate;

                  return (
                    <div
                      key={`${event.type}-${event.id}`}
                      className="relative flex gap-3.5 pb-5"
                    >
                      <div
                        className={`relative z-10 size-8 rounded-full flex items-center justify-center shrink-0 border ${styles.circle}`}
                      >
                        <Icon className={`size-3.5 ${styles.icon}`} />
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor(isCreated ? null : event.outcome)}`}
                          >
                            {config.label}
                          </span>
                          <span className="text-[11px] text-(--text-faint)">
                            {formatRelativeDate(event.timestamp)}
                          </span>
                        </div>

                        <p className="text-[12px] text-(--text-faint) mt-1">
                          {formatDateTime(event.timestamp)}
                        </p>

                        {event.note && (
                          <p className="text-[13px] text-(--text-body) mt-2 whitespace-pre-wrap bg-(--bg-subtle) border border-(--border-soft) rounded-xl p-2.5">
                            {event.note}
                          </p>
                        )}

                        {event.next_follow_up_at && (
                          <div className="flex items-center gap-1.5 mt-2 text-[12px] text-(--text-soft)">
                            <CalendarClock className="size-3 text-(--text-faint)" />
                            Next follow-up:{" "}
                            {formatDateTime(event.next_follow_up_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-(--border-soft) bg-(--bg-subtle)/50">
          <div className="flex items-center">
            <span className="text-[12px] text-(--text-faint)">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LeadTimelineModal;
