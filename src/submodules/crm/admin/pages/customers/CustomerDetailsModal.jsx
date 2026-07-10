import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
import { formatSource } from "../telemarketing/leads/leadUtils";

const formatINR = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const CustomerDetailsModal = ({
  customer,
  projectName,
  onClose,
  onViewProfile,
  onViewLedger,
}) => {
  if (!customer) return null;

  const dealVal = Number(customer.total_deal_value) || 0;
  const paidVal = Number(customer.total_paid) || 0;
  const progressPct =
    dealVal > 0 ? Math.min(Math.round((paidVal / dealVal) * 100), 100) : 0;
  const remaining = dealVal - paidVal;

  const letter = customer.name?.charAt(0).toUpperCase() || "C";

  return createPortal(
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
      <div className="app-modal w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-(--border-soft) flex items-center justify-between shrink-0">
          <div className="flex items-start gap-3.5 min-w-0 pr-4">
            <div className="size-11 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
              <span className="font-extrabold text-[14px] text-(--brand-strong) tracking-tight">
                {letter}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="modal-title truncate">{customer.name}</h2>
              <p className="modal-subtitle mt-0.5">Customer Quick View</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-faint) hover:text-(--text-soft) hover:bg-(--bg-subtle) transition-all duration-200 active:scale-[0.98] shrink-0"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-(--text-body)">
              <Phone className="size-4 text-(--text-faint) shrink-0" />
              <span className="text-[13px] font-bold">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2.5 text-(--text-body)">
                <Mail className="size-4 text-(--text-faint) shrink-0" />
                <span className="text-[13px] font-medium">
                  {customer.email}
                </span>
              </div>
            )}
            {customer.city && (
              <div className="flex items-center gap-2.5 text-(--text-body)">
                <MapPin className="size-4 text-(--text-faint) shrink-0" />
                <span className="text-[13px] font-medium">{customer.city}</span>
              </div>
            )}
            {customer.source && (
              <div className="flex items-center gap-2.5 text-(--text-body)">
                <FileText className="size-4 text-(--text-faint) shrink-0" />
                <span className="inline-block text-[11px] font-bold text-(--text-soft) bg-(--bg-subtle) px-2 py-0.5 rounded-md border border-(--border-soft)">
                  {formatSource(customer.source)}
                </span>
              </div>
            )}
          </div>

          {projectName && projectName !== "—" && (
            <div className="app-panel p-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-(--text-faint) uppercase tracking-wider">
                    Project
                  </p>
                  <p className="text-[13.5px] font-extrabold text-(--text-strong)">
                    {projectName}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest border-b border-(--border-soft) pb-1.5">
              Payment Summary
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="app-panel p-3 text-center">
                <p className="text-[10px] font-bold text-(--text-faint) uppercase tracking-wider">
                  Deal Value
                </p>
                <p className="text-[15px] font-extrabold text-(--text-strong) mt-1">
                  {formatINR(dealVal)}
                </p>
              </div>
              <div className="app-panel p-3 text-center">
                <p className="text-[10px] font-bold text-(--text-faint) uppercase tracking-wider">
                  Paid
                </p>
                <p className="text-[15px] font-extrabold text-emerald-700 mt-1">
                  {formatINR(paidVal)}
                </p>
              </div>
              <div className="app-panel p-3 text-center">
                <p className="text-[10px] font-bold text-(--text-faint) uppercase tracking-wider">
                  Remaining
                </p>
                <p className="text-[15px] font-extrabold text-amber-700 mt-1">
                  {formatINR(remaining)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-(--text-soft)">
                  Collection Progress
                </span>
                <span className="text-[12px] font-extrabold text-(--text-strong)">
                  {progressPct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      progressPct === 100
                        ? "var(--brand)"
                        : progressPct > 50
                          ? "#3b82f6"
                          : "#f59e0b",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-(--text-soft)">
              Status
            </span>
            <span
              className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border capitalize ${
                customer.status === "active"
                  ? "bg-(--brand-soft) text-emerald-800 border-(--border-soft)"
                  : customer.status === "completed"
                    ? "bg-blue-50 text-blue-800 border-blue-100"
                    : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {customer.status}
            </span>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-(--border-soft) flex items-center justify-end gap-2 shrink-0">
          {onViewProfile && (
            <button
              onClick={() => {
                onClose();
                onViewProfile();
              }}
              className="app-btn-secondary text-xs flex items-center gap-1.5"
            >
              <User className="size-3.5" />
              Full Profile
            </button>
          )}
          {onViewLedger && (
            <button
              onClick={() => {
                onClose();
                onViewLedger();
              }}
              className="app-btn-primary text-xs flex items-center gap-1.5"
            >
              <CreditCard className="size-3.5" />
              Payment Ledger
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CustomerDetailsModal;
