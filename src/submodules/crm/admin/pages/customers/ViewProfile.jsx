import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api";
import accountingApi from "../../../accountingApi";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
  Heart,
  Calendar,
  Briefcase,
  FileText,
  Loader2,
} from "lucide-react";
import { formatSource } from "../telemarketing/leads/leadUtils";
import { usePermission } from "../../../../../hooks/usePermission";
import useAuth from "../../../../../hooks/useAuth";

const formatINR = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export default function ViewProfile() {
  const { has } = usePermission();
  const canViewLedger = has("crm.customers.ledger.view");

  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user, companyId, token } = useAuth();

  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer", customerId, companyId],
    queryFn: async () => {
      const response = await api.get(`/api/customers/${customerId}`, {
        params: { company_id: companyId },
      });
      return response.data.data || null;
    },
    enabled: !!customerId && !!companyId,
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

  const projectName = useMemo(() => {
    if (!customer?.project_id) return null;
    const p = projectOptions.find(
      (opt) => opt.project_id === customer.project_id,
    );
    return p?.name || customer.project_id;
  }, [customer, projectOptions]);

  const { data: paymentPlan } = useQuery({
    queryKey: [
      "payment-plan-customer",
      customer?.ledger_id,
      customer?.lead_id,
      companyId,
    ],
    queryFn: async () => {
      const response = customer.ledger_id
        ? await accountingApi.get(
            `/api/v1/project-payment/${customer.ledger_id}`,
            {
              params: { company_id: companyId },
            },
          )
        : await accountingApi.get("/api/v1/project-payment", {
            params: { company_id: companyId, lead_id: customer.lead_id },
          });
      return response.data.data || null;
    },
    enabled: (!!customer?.ledger_id || !!customer?.lead_id) && !!companyId,
  });

  if (isLoading) {
    return (
      <div className="app-shell p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-emerald-500 mx-auto" />
          <p className="text-sm text-(--text-soft) mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="app-shell p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="size-10 mx-auto text-(--text-faint) mb-3" />
          <p className="text-[14px] font-extrabold text-(--text-strong)">
            Customer not found
          </p>
          <p className="text-[12px] mt-1 text-(--text-soft)">
            {error?.message || "The customer record could not be loaded."}
          </p>
          <button
            onClick={() => navigate("/crm/customers")}
            className="app-btn-primary mt-4 text-xs py-1.5 w-full"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const dealVal = Number(paymentPlan?.total_deal_value) || 0;
  const paidVal =
    paymentPlan?.slabs?.reduce(
      (sum, slab) => sum + (Number(slab.paid_amount) || 0),
      0,
    ) || 0;
  const remaining = dealVal - paidVal;
  const progressPct =
    dealVal > 0 ? Math.min(Math.round((paidVal / dealVal) * 100), 100) : 0;

  return (
    <div className="crm-module-root size-full min-h-screen">
      <div
        className={`app-shell p-4 space-y-6 max-w-6xl mx-auto transition-all duration-300 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/crm/customers")}
            className="app-icon-button p-2 text-(--text-soft) hover:text-(--brand) hover:bg-(--bg-subtle) border border-(--border-soft) rounded-xl"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="app-title">{customer.name}</h1>
            <p className="app-subtitle mt-0.5">Customer Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="app-panel p-5 space-y-4">
              <h3 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest border-b border-(--border-soft) pb-1.5">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Phone} label="Phone" value={customer.phone} />
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={customer.email || "—"}
                />
                <InfoRow
                  icon={FileText}
                  label="Source"
                  value={formatSource(customer.source) || "—"}
                />
                <InfoRow
                  icon={Calendar}
                  label="Customer Since"
                  value={
                    customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString()
                      : "—"
                  }
                />
              </div>
            </div>

            <div className="app-panel p-5 space-y-4">
              <h3 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest border-b border-(--border-soft) pb-1.5">
                Profile Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={customer.full_address || "—"}
                />
                <InfoRow
                  icon={MapPin}
                  label="City / State"
                  value={
                    [customer.city, customer.state]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
                <InfoRow
                  icon={MapPin}
                  label="Pincode"
                  value={customer.pincode || "—"}
                />
                <InfoRow
                  icon={CreditCard}
                  label="PAN"
                  value={customer.pan_number || "—"}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Aadhaar"
                  value={customer.aadhaar_number || "—"}
                />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={
                    customer.date_of_birth
                      ? new Date(customer.date_of_birth).toLocaleDateString()
                      : "—"
                  }
                />
                <InfoRow
                  icon={Briefcase}
                  label="Occupation"
                  value={customer.occupation || "—"}
                />
                <InfoRow
                  icon={Building}
                  label="Company"
                  value={customer.company_name || "—"}
                />
              </div>
            </div>

            {(customer.nominee_name ||
              customer.nominee_relation ||
              customer.nominee_phone) && (
              <div className="app-panel p-5 space-y-4">
                <h3 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest border-b border-(--border-soft) pb-1.5">
                  Nominee Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoRow
                    icon={Heart}
                    label="Nominee"
                    value={customer.nominee_name || "—"}
                  />
                  <InfoRow
                    icon={Heart}
                    label="Relation"
                    value={customer.nominee_relation || "—"}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={customer.nominee_phone || "—"}
                  />
                </div>
              </div>
            )}

            {customer.profile_notes && (
              <div className="app-panel p-5">
                <h3 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest border-b border-(--border-soft) pb-1.5 mb-3">
                  Notes
                </h3>
                <p className="text-[13px] text-(--text-body) whitespace-pre-wrap">
                  {customer.profile_notes}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="app-panel p-5 space-y-4">
              <h3 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest border-b border-(--border-soft) pb-1.5">
                Payment Summary
              </h3>

              {projectName && (
                <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                    Project
                  </p>
                  <p className="text-[14px] font-extrabold text-sky-900 mt-0.5">
                    {projectName}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <SummaryRow
                  label="Deal Value"
                  value={formatINR(dealVal)}
                  color="text-(--text-strong)"
                />
                <SummaryRow
                  label="Total Paid"
                  value={formatINR(paidVal)}
                  color="text-emerald-700"
                />
                <SummaryRow
                  label="Remaining"
                  value={formatINR(remaining)}
                  color="text-amber-700"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-(--text-soft)">
                    Progress
                  </span>
                  <span className="text-[12px] font-extrabold text-(--text-strong)">
                    {progressPct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
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

              {canViewLedger && (
                <button
                  onClick={() =>
                    navigate(`/crm/customers/${customer.id}/ledger`)
                  }
                  className="app-btn-primary w-full text-xs flex items-center justify-center gap-1.5 mt-2"
                >
                  <CreditCard className="size-3.5" />
                  View Payment Ledger
                </button>
              )}
            </div>

            {paymentPlan?.slabs && paymentPlan.slabs.length > 0 && (
              <div className="app-panel p-5 space-y-3">
                <h3 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest border-b border-(--border-soft) pb-1.5">
                  Payment Slabs ({paymentPlan.slabs.length})
                </h3>
                <div className="space-y-2.5">
                  {paymentPlan.slabs.map((slab, idx) => {
                    const allocated = Number(slab.allocated_amount) || 0;
                    const paid = Number(slab.paid_amount) || 0;
                    const slabPct =
                      allocated > 0 ? Math.round((paid / allocated) * 100) : 0;

                    return (
                      <div
                        key={slab.id || idx}
                        className="border border-(--border-soft) rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-(--text-strong)">
                            {slab.stage_name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${
                              slab.status === "paid"
                                ? "bg-(--brand-soft) text-emerald-800 border-(--border-soft)"
                                : slab.status === "partial"
                                  ? "bg-amber-50 text-amber-800 border-amber-100"
                                  : "bg-slate-100 text-slate-600 border-(--border-soft)"
                            }`}
                          >
                            {slab.status === "pending" ? "unpaid" : slab.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-(--text-faint) font-medium">
                            {formatINR(paid)} / {formatINR(allocated)}
                          </span>
                          <span className="font-bold text-(--text-soft)">
                            {slabPct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${slabPct}%`,
                              background:
                                slab.status === "paid"
                                  ? "var(--brand)"
                                  : slab.status === "partial"
                                    ? "#f59e0b"
                                    : "#e2e8f0",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="app-panel p-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-(--text-soft)">
                  Customer Status
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
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="size-4 text-slate-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-bold text-(--text-faint) uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[13px] font-semibold text-(--text-body) mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-bold text-(--text-soft)">{label}</span>
      <span className={`text-[14px] font-extrabold ${color}`}>{value}</span>
    </div>
  );
}
