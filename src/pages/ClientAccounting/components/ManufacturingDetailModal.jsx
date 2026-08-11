import React from "react";
import {
  Calendar,
  Download,
  Edit,
  Factory,
  FileText,
  Hash,
  MapPin,
  Package,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

const ManufacturingDetailModal = ({ journal, onClose, onEdit, onDownload }) => {
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

  if (!journal) return null;

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

  const grandTotal = Number(journal.grandTotal || 0);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mfg-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-[#e2f2e9]"
        style={{ maxHeight: "90vh" }}
      >
        <div className="px-6 py-5 border-b border-[#e2f2e9] bg-white">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#c6f1d6] flex items-center justify-center shrink-0 text-[#00a651]">
                <Factory size={20} />
              </div>
              <div>
                <h2
                  id="mfg-modal-title"
                  className="text-base/tight font-extrabold text-[#042f2e] "
                >
                  Manufacturing Journal Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {journal.productName || "Finished Goods Manufacturing"}
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
                {journal.voucherNo || journal.id}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Calendar size={12} className="text-[#00a651]" />
              <span className="font-extrabold text-[#042f2e]">
                {formatDate(journal.date)}
              </span>
            </span>
            {journal.godown && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
                <MapPin size={12} className="text-[#00a651]" />
                <span className="font-semibold text-[#042f2e]">
                  {journal.godown}
                </span>
              </span>
            )}
            {journal.role && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
                <User size={12} className="text-[#00a651]" />
                Created by{" "}
                <span className="font-bold text-[#042f2e] capitalize">
                  {journal.role}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f6faf7] border border-[#cbe0d2] rounded-xl p-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                Finished Qty
              </p>
              <p className="text-base font-extrabold text-[#042f2e] mt-0.5">
                {journal.finishedQty ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                Batch Name
              </p>
              <p className="text-sm font-bold text-[#042f2e] mt-0.5 truncate">
                {journal.batchName || "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                Effective Rate
              </p>
              <p className="text-sm font-bold text-[#042f2e] mt-0.5">
                ₹ {formatAmount(journal.effectiveRatePerFinished)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-500">
                Total Value
              </p>
              <p className="text-base font-extrabold text-[#00a651] mt-0.5">
                ₹ {formatAmount(grandTotal)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-[#00a651]" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#475569]">
                Components (Consumption)
              </h3>
            </div>
            <div className="rounded-xl border border-[#e2f2e9] overflow-hidden">
              <table className="w-full text-sm border-collapse bg-white">
                <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                  <tr className="text-left text-slate-700">
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] w-10 text-center">
                      #
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Item Name
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Godown
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Qty
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Rate (₹)
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9]">
                  {journal.components?.length > 0 ? (
                    journal.components.map((c, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-150"
                      >
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-xs text-slate-400 font-mono text-center">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px]">
                          {c.itemName || "—"}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-slate-600 text-xs">
                          {c.godown || "—"}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-right font-medium text-slate-700 text-xs">
                          {c.qty ?? 0}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-right font-medium text-slate-700 text-xs tabular-nums">
                          {formatAmount(c.rate)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#042f2e] text-xs tabular-nums">
                          {formatAmount(c.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-4 text-center text-xs text-slate-400 italic"
                      >
                        No components recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {journal.byProducts?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-amber-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#475569]">
                  Co-Products / By-Products / Scrap
                </h3>
              </div>
              <div className="rounded-xl border border-[#e2f2e9] overflow-hidden">
                <table className="w-full text-sm border-collapse bg-white">
                  <thead className="bg-amber-50/50 border-b border-[#e2f2e9]">
                    <tr className="text-left text-slate-700">
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] w-10 text-center">
                        #
                      </th>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Item Name
                      </th>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                        Qty
                      </th>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                        Rate (₹)
                      </th>
                      <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2f2e9]">
                    {journal.byProducts.map((b, i) => (
                      <tr
                        key={i}
                        className="hover:bg-amber-50/20 border-b border-[#e2f2e9] transition-colors duration-150"
                      >
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-xs text-slate-400 font-mono text-center">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px]">
                          {b.itemName || "—"}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-right font-medium text-slate-700 text-xs">
                          {b.qty ?? 0}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-right font-medium text-slate-700 text-xs tabular-nums">
                          {formatAmount(b.rate)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#042f2e] text-xs tabular-nums">
                          {formatAmount(b.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {journal.addlCost > 0 && (
            <div className="flex justify-between items-center bg-[#f0fdf4] rounded-xl px-4 py-3 border border-[#c6f1d6] text-xs">
              <span className="font-bold text-[#042f2e]">
                Additional Production Cost:
              </span>
              <span className="font-extrabold text-[#00a651]">
                ₹ {formatAmount(journal.addlCost)}
              </span>
            </div>
          )}

          <div className="flex gap-3 bg-[#f0fdf4] rounded-xl px-4 py-3 border border-[#c6f1d6]">
            <FileText size={16} className="text-[#00a651] shrink-0 mt-0.5" />
            <p className="text-xs/relaxed text-[#042f2e]  font-medium">
              {journal.narration ? (
                <span>
                  <strong className="font-extrabold">Narration:</strong>{" "}
                  {journal.narration}
                </span>
              ) : (
                <span className="italic text-slate-500">
                  No narration provided for this journal.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e2f2e9] flex items-center justify-between gap-3 bg-white">
          <span className="text-xs px-3 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6] font-bold">
            {journal.components?.length ?? 0} component
            {journal.components?.length !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(journal.id)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Download size={14} /> Download PDF
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(journal.id)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Edit size={14} /> Edit Journal
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

export default ManufacturingDetailModal;
