import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Users, FileText, UserCheck, Loader2 } from "lucide-react";
import api from "../../api";
import useAuth from "../../../../hooks/useAuth";

export default function BrokerDetailsModal({ broker, onClose }) {
  const { companyId } = useAuth();
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!broker?.id || !companyId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [leadsRes, customersRes] = await Promise.all([
          api.get(`/api/brokers/${broker.id}/leads?company_id=${companyId}`),
          api.get(`/api/brokers/${broker.id}/customers?company_id=${companyId}`),
        ]);
        setLeads(leadsRes.data?.data || []);
        setCustomers(customersRes.data?.data || []);
      } catch (err) {
        console.error("Error fetching broker data:", err);
        setError("Failed to fetch broker details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [broker?.id, companyId]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return createPortal(
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 animate-in fade-in duration-300">
      <div className="app-modal w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-white border border-(--border-soft)">

        <div className="px-5 py-4 border-b border-(--border-soft) flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-(--brand-soft) border border-(--border-soft) text-(--brand)">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="modal-title">{broker.name}</h2>
              <p className="modal-subtitle mt-0.5">{broker.email} • {broker.phone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-icon-button p-1.5 text-(--text-faint) hover:text-(--text-soft) hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>


        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 min-h-75">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 animate-spin text-(--brand)" />
              <p className="text-xs font-semibold text-(--text-soft)">
                Fetching broker logs...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-semibold text-center">
              {error}
            </div>
          ) : (
            <>

              <div className="flex border-b border-(--border-soft) mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("leads")}
                  className={activeTab === "leads"
                    ? "px-4 py-2 border-b-2 border-(--brand) text-(--brand) font-bold text-[13px] cursor-pointer bg-transparent"
                    : "px-4 py-2 text-(--text-soft) hover:text-(--text-strong) font-semibold text-[13px] cursor-pointer bg-transparent"
                  }
                >
                  Leads
                  <span className="ml-1.5 bg-(--brand-soft) text-(--brand) px-1.5 py-0.5 rounded-full text-[10px]">
                    {leads.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("customers")}
                  className={activeTab === "customers"
                    ? "px-4 py-2 border-b-2 border-(--brand) text-(--brand) font-bold text-[13px] cursor-pointer bg-transparent"
                    : "px-4 py-2 text-(--text-soft) hover:text-(--text-strong) font-semibold text-[13px] cursor-pointer bg-transparent"
                  }
                >
                  Customers
                  <span className="ml-1.5 bg-(--brand-soft) text-(--brand) px-1.5 py-0.5 rounded-full text-[10px]">
                    {customers.length}
                  </span>
                </button>
              </div>


              <div className="border border-(--border-soft) rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-80 custom-scrollbar">
                  {activeTab === "leads" ? (
                    leads.length === 0 ? (
                      <div className="py-16 text-center">
                        <FileText className="size-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-(--text-strong)">
                          No active leads found
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          No leads are currently assigned to this partner.
                        </p>
                      </div>
                    ) : (
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="border-b border-(--border-soft)">
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Lead Info</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Commission</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Status</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Joined Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-(--bg-subtle)">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                              <td className="px-6 py-4">
                                <div className="text-[13px] font-bold text-slate-900">{lead.name}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{lead.phone} • {lead.email || "No email"}</div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                {lead.commission !== null && lead.commission !== undefined ? `${lead.commission}%` : "0%"}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                  lead.status === "NEW"
                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                    : lead.status === "ACCEPTED"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : lead.status === "REJECTED"
                                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                                        : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  ) : (
                    customers.length === 0 ? (
                      <div className="py-16 text-center">
                        <UserCheck className="size-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-(--text-strong)">
                          No customers found
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          No closed customer bookings have been referred yet.
                        </p>
                      </div>
                    ) : (
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="border-b border-(--border-soft)">
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Customer Info</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Unit Info</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Deal Value</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Commission</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) bg-slate-50/50">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-(--bg-subtle)">
                          {customers.map((cust) => (
                            <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                              <td className="px-6 py-4">
                                <div className="text-[13px] font-bold text-slate-900">{cust.name}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{cust.phone} • {cust.email || "No email"}</div>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                                {cust.unit_name || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-xs font-extrabold text-indigo-600 font-mono">
                                {formatCurrency(cust.total_deal_value)}
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                {cust.commission}%
                                {cust.total_deal_value > 0 && (
                                  <span className="text-[11px] text-slate-400 font-medium ml-1">
                                    ({formatCurrency((cust.total_deal_value * cust.commission) / 100)})
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                  cust.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                  {cust.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
