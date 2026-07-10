import React, { useEffect, useRef } from "react";
import {
  X,
  Hash,
  Calendar,
  ArrowDownToLine,
  Download,
  Edit,
} from "lucide-react";

const ReceiveVoucherDetailModal = ({
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

  const totalAmount = voucher.totalAmount || voucher.amount || 0;
  const receiptMode =
    ledgerMap[voucher.receiptAccountId] || voucher.receiptAccountId || "—";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rv-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ArrowDownToLine size={20} className="text-blue-600" />
              </div>
              <div>
                <h2
                  id="rv-modal-title"
                  className="text-base font-semibold text-gray-900 leading-tight"
                >
                  Receipt Voucher Details
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Incoming payment record
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
                {voucher.voucherId || voucher.id}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600">
              <Calendar size={11} className="text-gray-400" />
              <span className="font-semibold text-gray-800">
                {formatDate(voucher.date)}
              </span>
            </span>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Summary
              </p>
            </div>
            <div className="px-4 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">
                  Total amount received
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  ₹ {formatAmount(totalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Received In</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  {receiptMode}
                </span>
              </div>
            </div>
          </div>

          {voucher.items && voucher.items.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Received From (Ledger)
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {voucher.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {ledgerMap[item.ledgerId] || item.ledgerId}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                        {formatAmount(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-right text-gray-600 text-xs uppercase tracking-wider">
                      Grand Total
                    </td>
                    <td className="px-4 py-3 text-right text-blue-700 tabular-nums">
                      ₹ {formatAmount(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex gap-3 bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
            <svg
              className="shrink-0 mt-0.5"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-1">
                Narration
              </p>
              <p className="text-sm text-indigo-700 leading-relaxed">
                {voucher.narration || (
                  <span className="italic text-indigo-400">
                    No narration provided.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
            Receipt voucher
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

export default ReceiveVoucherDetailModal;
