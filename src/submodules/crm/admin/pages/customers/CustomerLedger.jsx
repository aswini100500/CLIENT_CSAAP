import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api";
import accountingApi from "../../../accountingApi";
import useAuth from "../../../../../hooks/useAuth";
import { downloadPaymentVoucher } from "./docs/PaymentVoucherDocument";
import {
  ArrowLeft,
  CreditCard,
  IndianRupee,
  Download,
  Loader2,
  User,
  TrendingUp,
  Receipt,
} from "lucide-react";

const formatINR = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CustomerLedger({ customerId: propCustomerId, onBack }) {
  const { customerId: paramCustomerId } = useParams();
  const customerId = propCustomerId || paramCustomerId;
  const navigate = useNavigate();
  const { user, companyId, companyName } = useAuth();

  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ["customer", customerId, companyId],
    queryFn: async () => {
      const response = await api.get(`/api/customers/${customerId}`, {
        params: { company_id: companyId },
      });
      return response.data.data || null;
    },
    enabled: !!customerId && !!companyId,
  });

  const { data: paymentPlan, isLoading: loadingPlan } = useQuery({
    queryKey: [
      "payment-plan-customer",
      customer?.ledger_id,
      customer?.lead_id,
      companyId,
    ],
    queryFn: async () => {
      const planId = customer.ledger_id;
      if (planId) {
        const response = await accountingApi.get(
          `/api/v1/project-payment/${planId}`,
          {
            params: { company_id: companyId },
          },
        );
        return response.data.data || null;
      } else if (customer.lead_id) {
        const response = await accountingApi.get("/api/v1/project-payment", {
          params: { company_id: companyId, lead_id: customer.lead_id },
        });
        return response.data.data || null;
      }
      return null;
    },
    enabled: (!!customer?.ledger_id || !!customer?.lead_id) && !!companyId,
  });

  const { data: paymentHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["payment-history", paymentPlan?.id, companyId],
    queryFn: async () => {
      const response = await accountingApi.get(
        `/api/v1/project-payment/${paymentPlan.ledger_id || paymentPlan.id}/history`,
        { params: { company_id: companyId } },
      );
      return response.data.data || [];
    },
    enabled: !!paymentPlan?.id && !!companyId,
  });

  const mergedPayments = useMemo(() => {
    if (!paymentHistory || paymentHistory.length === 0) return [];

    const parentMap = new Map();
    const standaloneList = [];

    const referencedParentIds = new Set(
      paymentHistory
        .filter((tx) => tx.parent_payment_id)
        .map((tx) => Number(tx.parent_payment_id)),
    );

    for (const tx of paymentHistory) {
      const txId = Number(tx.id);

      if (tx.parent_payment_id) {
        const pid = Number(tx.parent_payment_id);
        if (!parentMap.has(pid)) {
          parentMap.set(pid, {
            totalAmount: 0,
            slabNames: [],
            cleanNote: "",
            segments: [],
            isMerged: true,
          });
        }
        const group = parentMap.get(pid);
        group.totalAmount += Number(tx.amount) || 0;
        group.slabNames.push(tx.stage_name);
        group.segments.push({ ...tx, isOverflow: true });
      } else if (referencedParentIds.has(txId)) {
        if (!parentMap.has(txId)) {
          parentMap.set(txId, {
            totalAmount: 0,
            slabNames: [],
            cleanNote: "",
            segments: [],
            isMerged: true,
          });
        }
        const group = parentMap.get(txId);

        group.totalAmount += Number(tx.amount) || 0;
        group.slabNames.unshift(tx.stage_name);
        group.segments.unshift({ ...tx, isOverflow: false });
        group.cleanNote = tx.note || "";

        Object.assign(group, {
          ...tx,
          totalAmount: group.totalAmount,
          slabNames: group.slabNames,
          cleanNote: group.cleanNote,
          segments: group.segments,
          isMerged: group.segments.length > 1,
        });
      } else {
        standaloneList.push({
          ...tx,
          totalAmount: Number(tx.amount) || 0,
          slabNames: [tx.stage_name].filter(Boolean),
          cleanNote: tx.note || "",
          segments: [{ ...tx, isOverflow: false }],
          isMerged: false,
        });
      }
    }

    const all = [...parentMap.values(), ...standaloneList];
    all.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    return all;
  }, [paymentHistory]);

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadVoucher = async (mergedTx) => {
    try {
      setDownloadingId(mergedTx.id);
      await downloadPaymentVoucher(customer, mergedTx, companyName);
    } catch (err) {
      console.error("Error downloading voucher:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const isLoading = loadingCustomer || loadingPlan;

  if (isLoading) {
    return (
      <div className="app-shell p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-emerald-500 mx-auto" />
          <p className="text-sm text-(--text-soft) mt-2">Loading ledger...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="app-shell p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="size-10 mx-auto text-(--text-faint) mb-3" />
          <p className="text-[14px] font-extrabold text-(--text-strong)">
            Customer not found
          </p>
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigate("/crm/customers");
              }
            }}
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
    <div className="erp-root size-full min-h-screen">
      <div
        className={`app-shell p-4 space-y-6 max-w-6xl mx-auto transition-all duration-300 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigate(`/crm/customers/${customer.id}`);
              }
            }}
            className="app-icon-button p-2 text-(--text-soft) hover:text-(--brand) hover:bg-(--bg-subtle) border border-(--border-soft) rounded-xl"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="app-title">Payment Ledger</h1>
            <p className="app-subtitle mt-0.5">{customer.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="app-panel p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                Deal Value
              </p>
              <div className="mt-2 text-2xl font-extrabold leading-none text-(--text-strong)">
                {formatINR(dealVal)}
              </div>
            </div>
            <div className="size-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              <IndianRupee className="size-5 text-slate-600" />
            </div>
          </div>

          <div className="app-panel p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                Total Paid
              </p>
              <div className="mt-2 text-2xl font-extrabold leading-none text-emerald-700">
                {formatINR(paidVal)}
              </div>
            </div>
            <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5 text-emerald-600" />
            </div>
          </div>

          <div className="app-panel p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                Remaining
              </p>
              <div className="mt-2 text-2xl font-extrabold leading-none text-amber-700">
                {formatINR(remaining)}
              </div>
            </div>
            <div className="size-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <CreditCard className="size-5 text-amber-600" />
            </div>
          </div>

          <div className="app-panel p-4 flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-[12px] font-bold text-(--text-soft) uppercase tracking-wider">
                Progress
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
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
                <span className="text-lg font-extrabold text-(--text-strong)">
                  {progressPct}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {paymentPlan?.slabs && paymentPlan.slabs.length > 0 && (
          <div className="app-panel overflow-hidden">
            <div className="app-section-bar px-4 py-3">
              <h3 className="app-heading">
                Payment Slabs ({paymentPlan.slabs.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-(--border-soft) text-left">
                <thead className="bg-(--bg-subtle)/30">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Stage
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Allocated
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Paid
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Progress
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-(--border-soft)">
                  {paymentPlan.slabs.map((slab, idx) => {
                    const allocated = Number(slab.allocated_amount) || 0;
                    const paid = Number(slab.paid_amount) || 0;
                    const slabPct =
                      allocated > 0 ? Math.round((paid / allocated) * 100) : 0;

                    return (
                      <tr
                        key={slab.id || idx}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-(--brand-strong)">
                                {idx + 1}
                              </span>
                            </div>
                            <span className="text-[13px] font-bold text-(--text-strong)">
                              {slab.stage_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold text-(--text-body)">
                          {formatINR(allocated)}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-bold text-emerald-700">
                          {formatINR(paid)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${slabPct}%`,
                                  background:
                                    slab.status === "paid"
                                      ? "#10b981"
                                      : slab.status === "partial"
                                        ? "#f59e0b"
                                        : "#e2e8f0",
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-(--text-soft)">
                              {slabPct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                              slab.status === "paid"
                                ? "bg-(--brand-soft) text-emerald-800 border-(--border-soft)"
                                : slab.status === "partial"
                                  ? "bg-amber-50 text-amber-800 border-amber-100"
                                  : "bg-slate-100 text-slate-600 border-(--border-soft)"
                            }`}
                          >
                            {slab.status === "pending" ? "unpaid" : slab.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[12px] font-medium text-(--text-body)">
                          {formatDate(slab.due_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="app-panel overflow-hidden">
          <div className="app-section-bar px-4 py-3">
            <h3 className="app-heading">
              Payment History ({mergedPayments.length} transaction
              {mergedPayments.length !== 1 ? "s" : ""})
            </h3>
          </div>

          {loadingHistory ? (
            <div className="p-8 text-center">
              <Loader2 className="size-6 animate-spin text-emerald-500 mx-auto" />
              <p className="text-xs text-(--text-soft) mt-2">
                Loading history...
              </p>
            </div>
          ) : mergedPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="size-8 mx-auto text-(--text-faint) mb-3" />
              <p className="text-[13px] font-bold text-(--text-strong)">
                No payment transactions yet
              </p>
              <p className="text-[12px] mt-1 text-(--text-soft)">
                Payments will appear here once recorded against slabs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-(--border-soft) text-left">
                <thead className="bg-(--bg-subtle)/30">
                  <tr>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Slab
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                      Amount
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Mode
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Reference
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Note
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                      Voucher
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-(--border-soft)">
                  {mergedPayments.map((tx, idx) => (
                    <tr
                      key={tx.id || idx}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-(--text-body) whitespace-nowrap">
                        {formatDateTime(tx.payment_date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {tx.slabNames.map((name, i) => (
                            <span
                              key={i}
                              className={`inline-block text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                                i === 0
                                  ? "text-(--text-strong) bg-white border-(--border-soft)"
                                  : "text-amber-700 bg-amber-50 border-amber-100"
                              }`}
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] font-extrabold text-emerald-700">
                          {formatINR(tx.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block text-[11px] font-bold text-(--text-soft) bg-(--bg-subtle) px-2 py-0.5 rounded-md border border-(--border-soft) capitalize">
                          {tx.payment_mode || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-medium text-(--text-body)">
                        {tx.reference_number || "—"}
                      </td>
                      <td className="px-4 py-3 text-[12px] font-medium text-(--text-faint) max-w-40 truncate">
                        {tx.cleanNote || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDownloadVoucher(tx)}
                          disabled={downloadingId === tx.id}
                          className="inline-flex items-center justify-center size-8 rounded-lg border border-(--border-soft) text-(--text-soft) hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-50"
                          title="Download Voucher"
                        >
                          {downloadingId === tx.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
