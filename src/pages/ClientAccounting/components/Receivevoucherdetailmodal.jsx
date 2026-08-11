import React from "react";
import {
  ArrowDownToLine,
  Calendar,
  Download,
  Edit,
  Hash,
  Landmark,
  User,
  X,
  FileText,
} from "lucide-react";
import { useEffect, useRef } from "react";

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

  const totalAmount =
    voucher.totalAmount || voucher.amount || voucher.totalDebit || 0;
  const receiptAccountId = voucher.receiptAccountId;
  const receiptMode =
    ledgerMap[receiptAccountId] ||
    (receiptAccountId === "cash"
      ? "Cash"
      : receiptAccountId
        ? String(receiptAccountId)
        : "—");

  const voucherNum = voucher.voucherId || voucher.voucherNo || voucher.id;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rv-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-[#e2f2e9]"
        style={{ maxHeight: "90vh" }}
      >
        <div className="px-6 py-5 border-b border-[#e2f2e9] bg-white">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#c6f1d6] flex items-center justify-center shrink-0 text-[#00a651]">
                <ArrowDownToLine size={20} />
              </div>
              <div>
                <h2
                  id="rv-modal-title"
                  className="text-base/tight font-extrabold text-[#042f2e] "
                >
                  Receipt Voucher Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Incoming payment record
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#e2f2e9] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shrink-0 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Hash size={12} className="text-[#00a651]" />
              Voucher No.{" "}
              <span className="font-extrabold text-[#042f2e]">
                {voucherNum}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Calendar size={12} className="text-[#00a651]" />
              <span className="font-extrabold text-[#042f2e]">
                {formatDate(voucher.date)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Landmark size={12} className="text-[#00a651]" />
              Receipt Into:{" "}
              <span className="font-extrabold text-[#042f2e]">
                {receiptMode}
              </span>
            </span>
            {voucher.role && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
                <User size={12} className="text-[#00a651]" />
                Created by{" "}
                <span className="font-bold text-[#042f2e] capitalize">
                  {voucher.role}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
            Payment Breakdown
          </p>

          {voucher.items && voucher.items.length > 0 ? (
            <div className="rounded-xl border border-[#e2f2e9] overflow-hidden">
              <table className="w-full text-sm border-collapse bg-white">
                <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                  <tr className="text-left text-slate-700">
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] w-10 text-center">
                      #
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Received From (Ledger)
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9]">
                  {voucher.items.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-150"
                    >
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-xs text-slate-400 font-mono text-center">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9]">
                        <div className="font-bold text-[#042f2e] text-[13px] leading-tight">
                          {ledgerMap[item.ledgerId] || item.ledgerId || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#042f2e] text-[13px] tabular-nums">
                        {formatAmount(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f0fdf4]/40 border-t border-[#e2f2e9]">
                    <td
                      colSpan={2}
                      className="py-3 px-4 text-xs font-extrabold uppercase tracking-wider text-[#475569] text-right border-r border-[#e2f2e9]"
                    >
                      Total Amount
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#042f2e] text-base tabular-nums">
                      ₹ {formatAmount(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-[#f8faf8] border border-[#e2f2e9] rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Customer / Party
                </p>
                <p className="text-sm font-bold text-[#042f2e]">
                  {ledgerMap[voucher.customer] || voucher.customer || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">
                  Total Received
                </p>
                <p className="text-lg font-extrabold text-[#00a651]">
                  ₹ {formatAmount(totalAmount)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 bg-[#f0fdf4] rounded-xl px-4 py-3 border border-[#c6f1d6]">
            <FileText size={16} className="text-[#00a651] shrink-0 mt-0.5" />
            <p className="text-xs/relaxed text-[#042f2e]  font-medium">
              {voucher.narration ? (
                <span>
                  <strong className="font-extrabold">Narration:</strong>{" "}
                  {voucher.narration}
                </span>
              ) : (
                <span className="italic text-slate-500">
                  No narration provided for this voucher.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e2f2e9] flex items-center justify-between gap-3 bg-white">
          <span className="text-xs px-3 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6] font-bold">
            {voucher.items?.length ?? 1} item
            {(voucher.items?.length ?? 1) !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(voucher)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Download size={14} /> Download PDF
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(voucher.id)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Edit size={14} /> Edit Voucher
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white transition-all font-bold cursor-pointer active:scale-[0.98] shadow-xs"
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
