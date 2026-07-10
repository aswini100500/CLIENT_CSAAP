import axios from "axios";
import {
  AlertTriangle,
  FileText,
  Layers,
  Loader2,
  Percent,
  Search,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import ActionIconButton from "../../submodules/crm/admin/pages/telemarketing/leads/ActionIconButton";
import accountingApi from "../../submodules/crm/accountingApi";

const BookingCancellations = () => {
  const { user } = useAuth();
  const token = user?.token;
  const companyId = user?.company_id || user?.tenant_id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending_admin");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [deductionPercentage, setDeductionPercentage] = useState("0");
  const [adminNotes, setAdminNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await accountingApi.get("/api/v1/bookings/cancellations", {
        params: { company_id: companyId },
      });
      if (res.data && res.data.success) {
        setRequests(res.data.data || []);
      } else {
        toast.error(
          res.data.message || "Failed to load cancellation requests.",
        );
      }
    } catch (err) {
      console.error("Error fetching cancellation requests:", err);
      toast.error(
        err.response?.data?.message || "Error fetching cancellation requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && companyId) {
      fetchRequests();
    }
  }, [token, companyId]);

  const handleOpenApproval = (req) => {
    setSelectedRequest(req);
    setDeductionPercentage("0");
    setAdminNotes("");
    setShowApprovalModal(true);
  };

  const handleApprove = async () => {
    if (deductionPercentage === "" || isNaN(Number(deductionPercentage))) {
      toast.error("Please enter a valid deduction percentage.");
      return;
    }
    const percent = Number(deductionPercentage);
    if (percent < 0 || percent > 100) {
      toast.error("Deduction percentage must be between 0 and 100.");
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await accountingApi.post(
        `/api/v1/bookings/cancellations/${selectedRequest.id}/approve`,
        {
          company_id: companyId,
          deduction_percentage: percent,
          notes: adminNotes,
        },
      );

      if (res.data && res.data.success) {
        toast.success("Cancellation approved and booking terminated.");

        const responseData = res.data.data;
        if (responseData && responseData.project_id && responseData.unit_id) {
          await syncUnitInventory(
            responseData.project_id,
            responseData.unit_id,
          );
        }

        setShowApprovalModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(res.data.message || "Approval failed.");
      }
    } catch (err) {
      console.error("Error approving cancellation:", err);
      toast.error(
        err.response?.data?.message || "Error during approval processing.",
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast.error("Please provide rejection comments in notes.");
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await accountingApi.post(
        `/api/v1/bookings/cancellations/${selectedRequest.id}/reject`,
        {
          company_id: companyId,
          notes: adminNotes,
        },
      );

      if (res.data && res.data.success) {
        toast.success("Cancellation request rejected.");
        setShowApprovalModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(res.data.message || "Rejection failed.");
      }
    } catch (err) {
      console.error("Error rejecting cancellation:", err);
      toast.error(
        err.response?.data?.message || "Error during rejection processing.",
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDirectReject = async (req) => {
    const reason = window.prompt("Please enter rejection comments / reason:");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    try {
      setLoading(true);
      const res = await accountingApi.post(
        `/api/v1/bookings/cancellations/${req.id}/reject`,
        {
          company_id: companyId,
          notes: reason,
        },
      );

      if (res.data && res.data.success) {
        toast.success("Cancellation request rejected.");
        fetchRequests();
      } else {
        toast.error(res.data.message || "Rejection failed.");
      }
    } catch (err) {
      console.error("Error rejecting cancellation:", err);
      toast.error(
        err.response?.data?.message || "Error during rejection processing.",
      );
    } finally {
      setLoading(false);
    }
  };

  const syncUnitInventory = async (compositeProjectId, unitId) => {
    let projectType = "apartment";
    let projectId = compositeProjectId;
    if (
      typeof compositeProjectId === "string" &&
      compositeProjectId.includes(":")
    ) {
      const parts = compositeProjectId.split(":");
      projectType = parts[0];
      projectId = parts[1];
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const bookingRes = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}/booking-status`,
        { headers },
      );

      const isBooked = checkIfUnitBooked(bookingRes.data, unitId);

      if (isBooked) {
        await axios.put(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}/items/${unitId}/toggle-booking-status`,
          {},
          { headers },
        );
      }
    } catch (err) {
      console.error(
        "Error releasing unit booking status during cancellation:",
        err,
      );
    }
  };

  const checkIfUnitBooked = (responseData, targetItemId) => {
    if (!responseData) return false;
    const data =
      responseData.data !== undefined ? responseData.data : responseData;
    if (!data) return false;

    if (Array.isArray(data)) {
      return data.some((item) => {
        if (!item) return false;
        const itemId =
          item.itemId ?? item.item_id ?? item.id ?? item.unitId ?? item.unit_id;
        if (itemId !== undefined && String(itemId) === String(targetItemId)) {
          const isBooked = item.isBooked ?? item.is_booked ?? item.booked;
          if (isBooked !== undefined) {
            return typeof isBooked === "boolean"
              ? isBooked
              : String(isBooked).toLowerCase() === "booked";
          }
          const status = String(
            item.booking_status ?? item.status ?? "",
          ).toLowerCase();
          return status === "booked" || status === "sold";
        }
        return false;
      });
    }
    return false;
  };

  const calculatedDeduction = selectedRequest
    ? Math.round(
        Number(selectedRequest.verified_paid_amount) *
          (Number(deductionPercentage || 0) / 100) *
          100,
      ) / 100
    : 0;
  const calculatedRefund = selectedRequest
    ? Math.round(
        (Number(selectedRequest.verified_paid_amount) - calculatedDeduction) *
          100,
      ) / 100
    : 0;

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = r.overall_status === statusFilter;
    const matchesSearch =
      r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.project_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(
    (r) => r.overall_status === "pending_admin",
  ).length;
  const approvedCount = requests.filter(
    (r) => r.overall_status === "approved",
  ).length;
  const rejectedCount = requests.filter(
    (r) => r.overall_status === "rejected",
  ).length;

  return (
    <div className="crm-module-root size-full min-h-screen">
      <Toaster position="top-right" />

      <div className="app-shell p-4 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="app-title">Booking Cancellation</h1>
              <p className="app-subtitle mt-1">
                Review verified cancellation requests and authorize refund
                settlements.
              </p>
            </div>
          </div>

          <div className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-(--border-soft) flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setStatusFilter("pending_admin")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === "pending_admin"
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
                }`}
                style={
                  statusFilter === "pending_admin"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span>Pending Admin</span>
                <span
                  className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold tracking-[-0.01em] ${
                    statusFilter === "pending_admin"
                      ? "bg-white/16 text-white border border-white/10"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                  }`}
                >
                  {pendingCount}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === "approved"
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
                }`}
                style={
                  statusFilter === "approved"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span>Approved</span>
                <span
                  className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold tracking-[-0.01em] ${
                    statusFilter === "approved"
                      ? "bg-white/16 text-white border border-white/10"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                  }`}
                >
                  {approvedCount}
                </span>
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-[-0.02em] whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === "rejected"
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "bg-white border-(--border-soft) text-(--text-body) hover:bg-white hover:border-(--border-strong)"
                }`}
                style={
                  statusFilter === "rejected"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span>Rejected</span>
                <span
                  className={`min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-lg text-[11px] font-bold tracking-[-0.01em] ${
                    statusFilter === "rejected"
                      ? "bg-white/16 text-white border border-white/10"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                  }`}
                >
                  {rejectedCount}
                </span>
              </button>
            </div>
          </div>

          <div className="app-panel p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search by customer, unit, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="app-input w-full pl-9 pr-3 py-2 text-[13px]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) size-4" />
            </div>
          </div>

          <div className="app-panel overflow-hidden shadow-sm">
            <div className="app-section-bar px-4 py-3 flex items-center justify-between">
              <h3 className="app-heading">
                Requests Queue ({filteredRequests.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="animate-spin text-green-600" size={32} />
                <span className="text-sm font-medium text-slate-500">
                  Loading requests...
                </span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <Layers className="size-10 mx-auto mb-3 text-(--text-faint)" />
                <p className="text-[14px] font-extrabold text-(--text-strong)">
                  No requests found
                </p>
                <p className="text-[12px] mt-1 text-(--text-soft)">
                  No cancellation requests found in this queue.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-(--bg-subtle) text-left border-collapse">
                  <thead className="bg-(--bg-subtle)/30">
                    <tr>
                      <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Client Detail
                      </th>
                      <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                        Unit / Project
                      </th>
                      <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                        Deal Value
                      </th>
                      <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                        Verified Paid
                      </th>
                      <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-center">
                        Status
                      </th>
                      {statusFilter === "pending_admin" && (
                        <th className="px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) text-right">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-(--border-soft)">
                    {filteredRequests.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-(--bg-subtle)/70 duration-200 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <p className="text-[14px] font-bold text-(--text-strong)">
                            {r.customer_name}
                          </p>
                          <p className="text-[12px] font-medium text-(--text-faint) mt-0.5">
                            {r.customer_phone}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-[13px] font-semibold text-(--text-body)">
                            {r.unit_name}
                          </p>
                          <p className="text-[12px] font-medium text-(--text-faint) mt-0.5">
                            {r.project_id}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-[13px] font-medium text-(--text-body)">
                            ₹
                            {Number(r.total_deal_value).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <p className="text-[13px] font-bold text-emerald-700">
                            ₹
                            {Number(r.verified_paid_amount).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Verified Ledger
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border capitalize ${
                              r.overall_status === "pending_admin"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : r.overall_status === "approved"
                                  ? "bg-(--brand-soft) text-emerald-800 border-(--border-soft)"
                                  : "bg-red-50 text-red-600 border-red-200"
                            }`}
                          >
                            {r.overall_status === "pending_admin"
                              ? "Pending Admin"
                              : r.overall_status}
                          </span>
                        </td>
                        {statusFilter === "pending_admin" && (
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <ActionIconButton
                                icon={FileText}
                                label="Review & Decide"
                                onClick={() => handleOpenApproval(r)}
                                className="app-icon-button p-1.5 text-violet-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                              />
                              <ActionIconButton
                                icon={XCircle}
                                label="Reject Request"
                                onClick={() => handleDirectReject(r)}
                                className="app-icon-button p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApprovalModal &&
        selectedRequest &&
        createPortal(
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-md">
            <div className="app-modal w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-11 rounded-2xl flex items-center justify-center bg-(--brand-soft) border border-(--border-soft) shrink-0">
                    <AlertTriangle className="size-5 text-(--brand)" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="modal-title">Decide Booking Cancellation</h3>
                    <p className="modal-subtitle mt-0.5">
                      Customer: {selectedRequest.customer_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="app-icon-button p-1.5 text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle) active:scale-95 transition-all cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#f8faf8]/40">
                <div className="app-panel-muted p-4 space-y-2.5 text-xs text-(--text-body)">
                  <div className="flex justify-between">
                    <span className="font-semibold text-(--text-soft)">
                      Customer:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      {selectedRequest.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-(--text-soft)">
                      Unit / Project:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      {selectedRequest.unit_name} ({selectedRequest.project_id})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-(--text-soft)">
                      Deal Value:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      ₹
                      {Number(selectedRequest.total_deal_value).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-(--border-soft)">
                    <span className="font-semibold text-(--text-soft)">
                      Verified Paid Amount:
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">
                      ₹
                      {Number(
                        selectedRequest.verified_paid_amount,
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex flex-col pt-2 border-t border-(--border-soft)">
                    <span className="font-semibold text-(--text-soft) mb-1">
                      Cancellation Reason:
                    </span>
                    <span className="font-medium text-(--text-strong) italic bg-white p-2.5 rounded-lg border border-(--border-soft) block w-full">
                      {selectedRequest.reason}
                    </span>
                  </div>
                  {selectedRequest.accounting_notes && (
                    <div className="flex flex-col pt-2 border-t border-(--border-soft)">
                      <span className="font-semibold text-(--text-soft) mb-1">
                        Accounting Verification Notes:
                      </span>
                      <span className="font-medium text-(--text-strong) italic bg-white p-2.5 rounded-lg border border-(--border-soft) block w-full">
                        {selectedRequest.accounting_notes}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <label className="modal-label block uppercase tracking-wider">
                    Admin Settlement Calculations
                  </label>

                  <div className="relative w-full">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-faint) flex items-center">
                      <Percent className="size-4" />
                    </span>
                    <input
                      type="number"
                      placeholder="Deduction Percentage"
                      value={deductionPercentage}
                      onChange={(e) => setDeductionPercentage(e.target.value)}
                      className="app-input w-full pl-9 text-[13.5px] font-semibold"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                    <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl">
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                        Penalty Deduction
                      </p>
                      <p className="text-base font-extrabold text-rose-700 mt-0.5">
                        ₹{calculatedDeduction.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        Settled Refund due
                      </p>
                      <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                        ₹{calculatedRefund.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="modal-label block uppercase tracking-wider">
                    Admin Action Notes / Reason
                  </label>
                  <textarea
                    placeholder="Provide approval penalty breakdown or rejection reason comments..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="app-input w-full min-h-20 resize-none"
                  />
                </div>
              </div>

              <div className="px-5 py-4 border-t border-(--border-soft) bg-white flex items-center justify-end gap-3">
                <button
                  onClick={handleReject}
                  disabled={submittingAction}
                  className="app-btn-secondary text-xs min-h-9.5 py-2 px-4 shadow-xs"
                >
                  Reject Request
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submittingAction}
                  className="app-btn-primary bg-rose-600 hover:bg-rose-700 text-xs min-h-9.5 py-2 px-4 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingAction ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Approve & Settle"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default BookingCancellations;
