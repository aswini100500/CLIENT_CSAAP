import React, { useEffect, useRef } from "react";
import { X, Hash, Calendar, CreditCard, Download, Edit } from "lucide-react";

const PaymentVoucherDetailModal = ({
  voucher,
  onClose,
  onEdit,
  onDownload,
  ledgerMap = {},
}) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!voucher) return null;

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalAmount = voucher.amount || voucher.totalCredit || 0;
  const paymentMode =
    voucher.accountTypeName ||
    ledgerMap[voucher.accountType] ||
    voucher.accountType ||
    "—";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pv-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <h2
                  id="pv-modal-title"
                  className="text-base font-semibold text-gray-900 leading-tight"
                >
                  Payment voucher details
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Outgoing payment record
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shrink-0"
              aria-label="Close modal"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600">
              <Hash size={11} className="text-gray-400" />
              Voucher no.{" "}
              <span className="font-semibold text-gray-800">
                {voucher.voucherNo || voucher.id}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600">
              <Calendar size={11} className="text-gray-400" />
              <span className="font-semibold text-gray-800">
                {formatDate(voucher.date)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600 max-w-full">
              <CreditCard size={11} className="text-gray-400 shrink-0" />
              <span
                className="font-semibold text-gray-800 truncate"
                title={paymentMode}
              >
                {paymentMode}
              </span>
            </span>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Summary
              </p>
            </div>
            <div className="px-4 py-4 flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">
                  Total amount paid
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  ₹ {formatAmount(totalAmount)}
                </p>
              </div>
              <div className="w-full">
                <p className="text-xs text-gray-500 mb-0.5">Payment mode</p>
                <span className="inline-flex items-start gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-100 break-words text-left max-w-full">
                  <CreditCard size={13} className="shrink-0 mt-0.5" />
                  <span style={{ wordBreak: "break-word" }}>{paymentMode}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
            <svg
              className="shrink-0 mt-0.5"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1">
                Narration
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                {voucher.narration || (
                  <span className="italic text-blue-400">
                    No narration provided.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">
            Payment voucher
          </span>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(voucher)}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Download size={14} /> Download PDF
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(voucher.id)}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Edit size={14} /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVoucherDetailModal;
