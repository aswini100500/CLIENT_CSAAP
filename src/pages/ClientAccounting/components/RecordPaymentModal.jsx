import React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  IndianRupee,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle2,
} from "lucide-react";
import accountingApi from "../../../submodules/crm/accountingApi";

const inputClass = "app-input w-full text-[13.5px] font-semibold";

const RecordPaymentModal = ({
  lead,
  paymentPlan,
  stages = [],
  onClose,
  onPaymentSuccess,
}) => {
  const activeSlabs = stages.filter((s) => (s.allocated_amount || 0) > 0);

  const [selectedSlabId, setSelectedSlabId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("bank_transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [receiptLedgers, setReceiptLedgers] = useState([]);
  const [receiptAccountId, setReceiptAccountId] = useState("");
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [voucherNo, setVoucherNo] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const hh = String(today.getHours()).padStart(2, "0");
    const min = String(today.getMinutes()).padStart(2, "0");
    const sec = String(today.getSeconds()).padStart(2, "0");
    return `REC-${yyyy}${mm}${dd}-${hh}${min}${sec}`;
  });

  useEffect(() => {
    const fetchReceiptLedgers = async () => {
      if (!lead.company_id) return;
      try {
        setLoadingLedgers(true);
        const ledgerResponse = await accountingApi.get(
          `/api/v1/ledger/${lead.company_id}/all`,
        );
        const allLedgers = Array.isArray(ledgerResponse.data) ? ledgerResponse.data : ledgerResponse.data?.data || [];

        let contraOptions = [];
        try {
          const bankResponse = await accountingApi.get(
            `/api/v1/bank/${lead.company_id}/all`,
          );
          const banks = bankResponse.data.accounts || [];
          contraOptions = banks.map((b) => ({
            id: `bank_${b.id}`,
            name: b.bankName
              ? `${b.accountName} (${b.bankName})`
              : b.accountName,
          }));
        } catch (bankErr) {
          console.error("Error fetching bank accounts for modal:", bankErr);
        }

        const cashLedger = allLedgers.find(
          (l) =>
            l.name?.toLowerCase().includes("cash") ||
            l.underGroup === "Cash-in-Hand" ||
            l.under === "Cash-in-Hand",
        );

        if (cashLedger) {
          contraOptions.push({
            id: `ledger_${cashLedger.id}`,
            name: cashLedger.name,
          });
        } else {
          contraOptions.push({ id: "cash", name: "Cash" });
        }

        setReceiptLedgers(contraOptions);
        if (contraOptions.length > 0) {
          setReceiptAccountId(contraOptions[0].id);
        }
      } catch (err) {
        console.error("Failed loading receipt accounts", err);
      } finally {
        setLoadingLedgers(false);
      }
    };

    fetchReceiptLedgers();
  }, [lead.company_id]);

  const selectedSlab = activeSlabs.find(
    (s) => String(s.db_slab_id) === String(selectedSlabId),
  );
  const outstandingAmount = selectedSlab
    ? selectedSlab.allocated_amount - (selectedSlab.paid_amount || 0)
    : 0;

  const maxAllowedPayment = (() => {
    if (!selectedSlab) return 0;
    const selectedIndex = activeSlabs.findIndex(
      (s) => String(s.db_slab_id) === String(selectedSlabId),
    );
    if (selectedIndex === -1) return 0;

    let sum = 0;
    for (let i = selectedIndex; i < activeSlabs.length; i++) {
      const slab = activeSlabs[i];
      if (slab.status !== "paid") {
        sum += slab.allocated_amount - (slab.paid_amount || 0);
      }
    }
    return sum;
  })();

  useEffect(() => {
    if (activeSlabs.length > 0 && !selectedSlabId) {
      const firstUnpaid = activeSlabs.find((s) => s.status !== "paid");
      if (firstUnpaid) {
        setSelectedSlabId(String(firstUnpaid.db_slab_id));
      } else {
        setSelectedSlabId(String(activeSlabs[0].db_slab_id));
      }
    }
  }, [activeSlabs, selectedSlabId]);

  useEffect(() => {
    if (selectedSlab) {
      setAmount(String(outstandingAmount > 0 ? outstandingAmount : ""));
    } else {
      setAmount("");
    }
  }, [selectedSlabId, selectedSlab, outstandingAmount]);

  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlabId) {
      setError("Please select a milestone stage.");
      return;
    }

    const amtNum = parseFloat(amount);
    if (Number.isNaN(amtNum) || amtNum <= 0) {
      setError("Please enter a valid positive payment amount.");
      return;
    }

    if (amtNum > maxAllowedPayment) {
      setError(
        `Payment exceeds total outstanding amount for selected and subsequent milestones. Max allowed is ${formatINR(maxAllowedPayment)}.`,
      );
      return;
    }

    if (!voucherNo || !voucherNo.trim()) {
      setError("Please enter a voucher number.");
      return;
    }

    if (!receiptAccountId) {
      setError("Please select a deposit account.");
      return;
    }

    if (!paymentMode) {
      setError("Please select a payment mode.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        voucherNo: voucherNo.trim(),
        date: paymentDate,
        receiptAccountId: receiptAccountId,
        instrumentType: paymentMode,
        referenceNo: referenceNumber || null,
        narration:
          note || `Slab Milestone Payment: ${selectedSlab?.name || ""}`,
        items: [
          {
            ledgerId:
              paymentPlan?.ledger_id ||
              paymentPlan?.id ||
              lead?.ledger_id ||
              lead?.id,
            amount: amtNum,
          },
        ],
      };

      console.log("[RecordPaymentModal] Submitting payment payload:", payload);

      const response = await accountingApi.post(
        `/api/v1/receive-voucher/createReciptVoucher/${lead.company_id}`,
        payload,
      );

      if (response.data && response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        }, 1500);
      } else {
        setError(response.data?.message || "Failed to record payment.");
      }
    } catch (err) {
      console.error("Error submitting payment:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while recording payment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-md">
      <div className="app-modal w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-(--brand-soft) border border-(--border-soft) shrink-0">
              <IndianRupee className="size-5 text-(--brand)" />
            </div>
            <div className="min-w-0">
              <h3 className="modal-title">Record Payment</h3>
              <p className="modal-subtitle mt-0.5">
                Lead / Customer: {lead.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button p-1.5 text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle) active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#f8faf8]/40"
        >
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="size-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="size-10 text-green-600 animate-bounce" />
              </div>
              <div>
                <h4 className="text-[16px] font-extrabold text-(--text-strong)">
                  Payment Recorded Successfully
                </h4>
                <p className="text-[13px] text-(--text-soft) mt-1">
                  Refreshed ledger payment slabs...
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <AlertCircle className="size-4.5 text-red-500 mt-0.5 shrink-0" />
                  <div className="text-[12.5px] font-medium text-rose-800">
                    {error}
                  </div>
                </div>
              )}

              {(paymentPlan?.status === "pending_approval" ||
                paymentPlan?.status === "rejected") && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <AlertCircle className="size-4.5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-[12.5px] font-medium text-amber-900">
                    Payment recording is locked. This payment slab proposal is{" "}
                    <strong>
                      {paymentPlan?.status === "pending_approval"
                        ? "Pending Accounting Approval"
                        : "Rejected"}
                    </strong>
                    . Payments can only be recorded once Accounting approves the
                    plan.
                  </div>
                </div>
              )}

              <div>
                <label className="modal-label block mb-1.5 uppercase">
                  Select Milestone Slab *
                </label>
                <div className="relative">
                  <select
                    value={selectedSlabId}
                    onChange={(e) => setSelectedSlabId(e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer pr-10`}
                    required
                  >
                    {activeSlabs.map((slab) => {
                      const outstanding =
                        slab.allocated_amount - (slab.paid_amount || 0);
                      const isPaid = slab.status === "paid";
                      return (
                        <option
                          key={slab.db_slab_id}
                          value={slab.db_slab_id}
                          disabled={isPaid}
                        >
                          {slab.name}{" "}
                          {isPaid
                            ? "(Fully Paid)"
                            : `(Outstanding: ${formatINR(outstanding)})`}
                        </option>
                      );
                    })}
                    {activeSlabs.length === 0 && (
                      <option value="" disabled>
                        No slabs available for payment
                      </option>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {selectedSlab && (
                <div className="app-panel p-3.5 space-y-2.5 shadow-xs bg-white">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-(--text-soft)">
                      Allocated Amount:
                    </span>
                    <span className="font-bold text-(--text-strong)">
                      {formatINR(selectedSlab.allocated_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-(--text-soft)">
                      Already Paid:
                    </span>
                    <span className="font-bold text-emerald-700">
                      {formatINR(selectedSlab.paid_amount)}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-(--border-soft) pt-2 flex items-center justify-between text-[13px] font-bold">
                    <span className="text-(--text-soft)">
                      Outstanding Balance:
                    </span>
                    <span className="text-rose-600">
                      {formatINR(outstandingAmount)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label block mb-1.5 uppercase">
                    Voucher Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. REC-001"
                      value={voucherNo}
                      onChange={(e) => setVoucherNo(e.target.value)}
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="modal-label block mb-1.5 uppercase">
                    Payment Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label block mb-1.5 uppercase">
                    Deposit Account (Receipt Ledger) *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <select
                      value={receiptAccountId}
                      onChange={(e) => setReceiptAccountId(e.target.value)}
                      className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                      required
                      disabled={loadingLedgers}
                    >
                      {receiptLedgers.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                      {receiptLedgers.length === 0 && (
                        <option value="" disabled>
                          Loading ledgers...
                        </option>
                      )}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <label className="modal-label block mb-1.5 uppercase">
                    Payment Mode *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                      required
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label block mb-1.5 uppercase">
                    Payment Amount (INR) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 50000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                  {!Number.isNaN(parseFloat(amount)) &&
                    parseFloat(amount) > outstandingAmount &&
                    parseFloat(amount) <= maxAllowedPayment && (
                      <div className="mt-2 text-[11.5px] font-semibold text-emerald-700 bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2 flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">
                          ★
                        </span>
                        <span>
                          Advance payment: Surplus of{" "}
                          <strong className="text-emerald-800">
                            {formatINR(parseFloat(amount) - outstandingAmount)}
                          </strong>{" "}
                          will overflow to subsequent milestone slabs.
                        </span>
                      </div>
                    )}
                </div>

                <div>
                  <label className="modal-label block mb-1.5 uppercase">
                    Reference / Transaction ID
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Txn ID, Cheque No, etc."
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="modal-label block mb-1.5 uppercase">
                  Remarks / Notes
                </label>
                <textarea
                  placeholder="Any additional remarks..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="app-input w-full min-h-20 resize-none"
                />
              </div>
            </>
          )}

          {!success && (
            <div className="px-5 py-4 border-t border-(--border-soft) bg-white flex items-center justify-end gap-3 -mx-5 -mb-5 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="app-btn-secondary text-xs min-h-9.5 py-2 px-4 shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  activeSlabs.length === 0 ||
                  paymentPlan?.status === "pending_approval" ||
                  paymentPlan?.status === "rejected"
                }
                className="app-btn-primary text-xs min-h-9.5 py-2 px-4 shadow-xs flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Record Payment
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RecordPaymentModal;
