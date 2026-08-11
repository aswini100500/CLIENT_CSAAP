import React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  X,
  XCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  User,
  Clock,
  IndianRupee,
  ShieldCheck,
  FileText,
  Edit3,
  Equal,
} from "lucide-react";
import accountingApi from "../../../submodules/crm/accountingApi";
import useAuth from "../../../hooks/useAuth";

const ApprovePaymentSlabModal = ({
  proposal,
  projectName,
  onClose,
  onSaveSuccess,
}) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fullProposalData, setFullProposalData] = useState(null);

  const [crmOriginalDealValue, setCrmOriginalDealValue] = useState(0);

  const [totalDealValue, setTotalDealValue] = useState("");
  const [stages, setStages] = useState([]);

  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      const planId = proposal?.plan_id || proposal?.id;
      const res = await accountingApi.get(`/api/v1/project-payment/${planId}`, {
        params: { company_id: proposal.company_id },
      });

      if (res.data && res.data.success) {
        const data = res.data.data;
        setFullProposalData(data);

        const origVal = Number(data.total_deal_value || 0);
        setCrmOriginalDealValue(origVal);
        setTotalDealValue(origVal ? String(origVal) : "");

        const mappedSlabs = (data.slabs || []).map((s) => ({
          db_slab_id: s.id,
          stage_id: s.stage_id,
          stage_name: s.stage_name,
          ratio_percentage: Number(s.ratio_percentage || 0),
          allocated_amount: Number(s.allocated_amount || 0),
          orig_amount: Number(s.allocated_amount || 0),
          orig_ratio: Number(s.ratio_percentage || 0),
        }));

        setStages(mappedSlabs);
      }
    } catch (err) {
      console.error("Failed loading payment plan proposal:", err);
      alert(
        err.response?.data?.message || "Failed to load payment plan proposal.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposal) {
      fetchProposalDetails();
    }
  }, [proposal]);

  const handleAutoBalance = (targetDealVal = totalDealValue) => {
    const numericDeal = Number(targetDealVal) || 0;
    if (numericDeal <= 0 || stages.length === 0) return;

    const currentRatioSum = stages.reduce(
      (acc, s) => acc + (Number(s.ratio_percentage) || 0),
      0,
    );
    const validRatioSum = currentRatioSum > 0 ? currentRatioSum : 100;

    let updated = stages.map((s) => {
      const normalizedRatio =
        ((Number(s.ratio_percentage) || 100 / stages.length) / validRatioSum) *
        100;
      const amt = Math.round((numericDeal * normalizedRatio) / 100);
      return {
        ...s,
        ratio_percentage: Number(normalizedRatio.toFixed(2)),
        allocated_amount: amt,
      };
    });

    const currentSum = updated.reduce((acc, s) => acc + s.allocated_amount, 0);
    const diff = numericDeal - currentSum;
    if (diff !== 0 && updated.length > 0) {
      const lastIdx = updated.length - 1;
      updated[lastIdx].allocated_amount += diff;
      updated[lastIdx].ratio_percentage = Number(
        ((updated[lastIdx].allocated_amount / numericDeal) * 100).toFixed(2),
      );
    }

    setStages(updated);
  };

  const handleSplitEvenly = () => {
    const numericDeal = Number(totalDealValue) || 0;
    if (numericDeal <= 0 || stages.length === 0) return;

    const evenAmount = Math.floor((numericDeal / stages.length) * 100) / 100;
    setStages((current) =>
      current.map((stage, index) => {
        const allocatedAmount =
          index === current.length - 1
            ? Number(
                (numericDeal - evenAmount * (current.length - 1)).toFixed(2),
              )
            : evenAmount;
        return {
          ...stage,
          allocated_amount: allocatedAmount,
          ratio_percentage: Number(
            ((allocatedAmount / numericDeal) * 100).toFixed(2),
          ),
        };
      }),
    );
  };

  const handleDealValueChange = (newVal) => {
    setTotalDealValue(newVal);
    handleAutoBalance(newVal);
  };

  const handleStageRatioChange = (index, newRatio) => {
    const numericRatio = Math.max(0, Math.min(100, Number(newRatio) || 0));
    const numericDeal = Number(totalDealValue) || 0;

    setStages((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ratio_percentage: numericRatio,
        allocated_amount: Math.round((numericDeal * numericRatio) / 100),
      };
      return updated;
    });
  };

  const handleStageAmountChange = (index, newAmt) => {
    const numericAmt = Math.max(0, Number(newAmt) || 0);
    const numericDeal = Number(totalDealValue) || 1;

    setStages((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        allocated_amount: numericAmt,
        ratio_percentage: Number(((numericAmt / numericDeal) * 100).toFixed(2)),
      };
      return updated;
    });
  };

  const totalAllocated = useMemo(() => {
    return stages.reduce(
      (sum, s) => sum + (Number(s.allocated_amount) || 0),
      0,
    );
  }, [stages]);

  const totalPercentage = useMemo(() => {
    return stages.reduce(
      (sum, s) => sum + (Number(s.ratio_percentage) || 0),
      0,
    );
  }, [stages]);

  const dealValueModified = useMemo(() => {
    return Number(totalDealValue) !== crmOriginalDealValue;
  }, [totalDealValue, crmOriginalDealValue]);

  const handleApprove = async () => {
    const numericDeal = Number(totalDealValue);
    if (!numericDeal || numericDeal <= 0) {
      alert("Please enter a valid Total Deal Value.");
      return;
    }

    let activeStages = stages;
    if (Math.abs(totalAllocated - numericDeal) > 1) {
      handleAutoBalance(numericDeal);
    }

    try {
      setApproving(true);
      const planId = fullProposalData?.id || proposal?.plan_id || proposal?.id;

      const payload = {
        company_id: proposal.company_id,
        total_deal_value: numericDeal,
        approved_by: user?.name || user?.email || "Accountant",
        slabs: stages.map((s) => ({
          db_slab_id: s.db_slab_id,
          stage_id: s.stage_id,
          stage_name: s.stage_name,
          ratio_percentage: s.ratio_percentage,
          allocated_amount: s.allocated_amount,
        })),
      };

      const res = await accountingApi.post(
        `/api/v1/project-payment/${planId}/approve`,
        payload,
      );

      if (res.data && res.data.success) {
        alert("Payment Plan approved successfully! Customer ledger generated.");
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      } else {
        alert(res.data.message || "Failed to approve payment plan proposal.");
      }
    } catch (err) {
      console.error("Error approving payment proposal:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve payment plan proposal.",
      );
    } finally {
      setApproving(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionRemarks.trim()) {
      alert(
        "Please provide a rejection remark to explain the issue to the CRM team.",
      );
      return;
    }

    try {
      setRejecting(true);
      const planId = fullProposalData?.id || proposal?.plan_id || proposal?.id;

      const payload = {
        company_id: proposal.company_id,
        rejection_remarks: rejectionRemarks.trim(),
        rejected_by: user?.name || user?.email || "Accountant",
      };

      const res = await accountingApi.post(
        `/api/v1/project-payment/${planId}/reject`,
        payload,
      );

      if (res.data && res.data.success) {
        alert("Proposal rejected. Rejection remarks sent to CRM team.");
        setShowRejectModal(false);
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      } else {
        alert(res.data.message || "Failed to reject proposal.");
      }
    } catch (err) {
      console.error("Error rejecting proposal:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject proposal.",
      );
    } finally {
      setRejecting(false);
    }
  };

  const clientInfo =
    typeof proposal.client_info === "string"
      ? JSON.parse(proposal.client_info || "{}")
      : proposal.client_info || {};

  const clientName =
    proposal.name || clientInfo.name || proposal.unit_name || "Client";

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-linear-to-r from-(--brand-soft) via-(--brand-soft)/40 to-transparent border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center text-(--brand) shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-extrabold text-slate-800 tracking-tight">
                  Review &amp; Approve Payment Slab Proposal
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Clock className="size-3 text-amber-600" />
                  Pending Approval
                </span>
              </div>
              <p className="text-[12.5px] font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                <span>
                  Unit: <strong>{proposal.unit_name}</strong>
                </span>
                <span>&bull;</span>
                <span>Project: {projectName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="size-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-[13px] font-semibold text-slate-600">
                Loading proposal details...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Proposal Submission Audit</span>
                  <span className="text-slate-500 font-semibold normal-case">
                    Submitted by:{" "}
                    {fullProposalData?.submitted_by || "CRM Lead Manager"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <User className="size-4.5 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-400">
                        Client Contact
                      </p>
                      <p className="text-[13px] font-bold text-slate-800 truncate">
                        {clientName}
                      </p>
                      {proposal.phone && (
                        <p className="text-[11px] font-medium text-slate-500">
                          {proposal.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      <IndianRupee className="size-4.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">
                        CRM Proposed Value
                      </p>
                      <p className="text-[14px] font-extrabold text-amber-700">
                        ₹{crmOriginalDealValue.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Building2 className="size-4.5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">
                        Target Property Unit
                      </p>
                      <p className="text-[13px] font-bold text-slate-800">
                        {proposal.unit_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                    <span>Approved Total Deal Value (₹) *</span>
                    {dealValueModified && (
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Edit3 className="size-3 text-amber-600" />
                        Modified from CRM (₹
                        {crmOriginalDealValue.toLocaleString("en-IN")})
                      </span>
                    )}
                  </label>
                  <span className="text-[12px] font-semibold text-slate-500">
                    Slabs Sum:{" "}
                    <strong
                      className={
                        totalAllocated === Number(totalDealValue)
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    >
                      ₹{totalAllocated.toLocaleString("en-IN")}
                    </strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={totalDealValue}
                    onChange={(e) => handleDealValueChange(e.target.value)}
                    placeholder="Enter final approved deal value"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-[15px] font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {Math.abs(totalAllocated - Number(totalDealValue)) > 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-[13px] font-bold text-amber-900">
                        Allocation Discrepancy Detected
                      </h4>
                      <p className="text-[12px] font-medium text-amber-800 mt-0.5">
                        The sum of milestone slab amounts (
                        <strong>
                          ₹{totalAllocated.toLocaleString("en-IN")}
                        </strong>
                        ) differs from the Total Deal Value (
                        <strong>
                          ₹{Number(totalDealValue || 0).toLocaleString("en-IN")}
                        </strong>
                        ) by{" "}
                        <strong>
                          ₹
                          {Math.abs(
                            totalAllocated - Number(totalDealValue || 0),
                          ).toLocaleString("en-IN")}
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutoBalance()}
                    className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    Auto-Balance Slabs
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="size-4 text-slate-500" />
                    Milestone Slab Breakdown ({stages.length} Slabs)
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSplitEvenly}
                      disabled={
                        Number(totalDealValue) <= 0 || stages.length === 0
                      }
                      className="text-[11.5px] font-bold text-slate-600 hover:text-(--brand-strong) disabled:opacity-40 flex items-center gap-1"
                    >
                      <Equal className="size-3" /> Split evenly
                    </button>
                    {Math.abs(totalAllocated - Number(totalDealValue)) > 1 && (
                      <button
                        type="button"
                        onClick={() => handleAutoBalance()}
                        className="text-[11.5px] font-bold text-amber-700 hover:underline cursor-pointer"
                      >
                        Auto-Balance
                      </button>
                    )}
                    <span className="text-[11.5px] font-bold text-slate-500">
                      Total Ratio:{" "}
                      <strong
                        className={
                          Math.abs(totalPercentage - 100) < 0.1
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }
                      >
                        {totalPercentage.toFixed(1)}%
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {stages.map((stage, idx) => {
                    const isRatioDiff =
                      Math.abs(stage.ratio_percentage - stage.orig_ratio) >
                      0.01;
                    const isAmtDiff =
                      Math.abs(stage.allocated_amount - stage.orig_amount) > 1;

                    return (
                      <div
                        key={stage.db_slab_id || idx}
                        className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="size-6 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold text-slate-600 flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="text-[13.5px] font-bold text-slate-800 truncate">
                              {stage.stage_name}
                            </span>
                            {(isRatioDiff || isAmtDiff) && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                Modified
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="relative w-28">
                            <input
                              type="number"
                              step="0.01"
                              value={stage.ratio_percentage || ""}
                              onChange={(e) =>
                                handleStageRatioChange(idx, e.target.value)
                              }
                              className="w-full pr-7 pl-3 py-1.5 rounded-lg border border-slate-200 text-[13px] font-bold text-right text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              %
                            </span>
                          </div>

                          <div className="relative w-36">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={stage.allocated_amount || ""}
                              onChange={(e) =>
                                handleStageAmountChange(idx, e.target.value)
                              }
                              className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 text-[13px] font-bold text-right text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={approving || rejecting || loading}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-[13px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <XCircle className="size-4" />
              Reject Proposal
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={approving || rejecting || loading}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-md inline-flex items-center gap-2 disabled:opacity-50"
            >
              {approving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle className="size-4" />
              )}
              Approve &amp; Create Ledger
            </button>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-slate-800">
                  Reject Payment Proposal
                </h3>
                <p className="text-[12.5px] font-medium text-slate-500 mt-0.5">
                  Specify the reason for rejection so CRM users can fix and
                  resubmit.
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Rejection Remarks *
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  placeholder="e.g. Total deal value doesn't match signed deal sheet. Please adjust stage #2 allocation."
                  className="w-full p-3 rounded-xl border border-slate-300 text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-1.5"
                >
                  {rejecting && <Loader2 className="size-3.5 animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovePaymentSlabModal;
