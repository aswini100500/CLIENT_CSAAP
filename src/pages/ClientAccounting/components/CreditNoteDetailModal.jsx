import React from "react";
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  FileText,
  Hash,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";

const CreditNoteDetailModal = ({
  note,
  items = [],
  onClose,
  onEdit,
  onDownload,
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

  if (!note) return null;

  const fmt = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const statusBadgeStyle = (status) => {
    switch (status) {
      case "Accepted":
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-[#fbf7f0] text-[#a16207] border-[#f3e8d2]";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "Accepted":
      case "Approved":
        return <CheckCircle size={12} className="text-green-600" />;
      case "Rejected":
        return <XCircle size={12} className="text-red-600" />;
      default:
        return <Clock size={12} className="text-[#a16207]" />;
    }
  };

  const grandTotal = note.grand_total ?? note.totalAmount ?? 0;
  const noteItems = items?.length > 0 ? items : note.items || [];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cn-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-[#e2f2e9]"
        style={{ maxHeight: "90vh" }}
      >
        <div className="px-6 py-5 border-b border-[#e2f2e9] bg-white">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#c6f1d6] flex items-center justify-center shrink-0 text-[#00a651]">
                <FileText size={20} />
              </div>
              <div>
                <h2
                  id="cn-modal-title"
                  className="text-base/tight font-extrabold text-[#042f2e] "
                >
                  Credit Note Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {note.partyLedgerName ||
                    note.PartyLedger ||
                    "Credit Note Voucher"}
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Hash size={12} className="text-[#00a651]" />
              Voucher No.{" "}
              <span className="font-extrabold text-[#042f2e]">
                {note.voucherNo || note.id}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Calendar size={12} className="text-[#00a651]" />
              <span className="font-extrabold text-[#042f2e]">
                {formatDate(note.date)}
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-bold ${statusBadgeStyle(note.status)}`}
            >
              {statusIcon(note.status)}
              <span className="capitalize">{note.status || "Pending"}</span>
            </span>
            {note.role && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
                <User size={12} className="text-[#00a651]" />
                Created by{" "}
                <span className="font-bold text-[#042f2e] capitalize">
                  {note.role}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#f0fdf4]/40 rounded-xl p-3.5 border border-[#e2f2e9]">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                Party Ledger
              </p>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#00a651] shrink-0" />
                <p className="text-sm font-bold text-[#042f2e] truncate">
                  {note.partyLedgerName || note.PartyLedger || "—"}
                </p>
              </div>
            </div>
            <div className="bg-[#f0fdf4]/40 rounded-xl p-3.5 border border-[#e2f2e9]">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                Sales / Purchase Ledger
              </p>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#00a651] shrink-0" />
                <p className="text-sm font-bold text-[#042f2e] truncate">
                  {note.purchaseLedgerName || note.PurchaseLedger || "—"}
                </p>
              </div>
            </div>
          </div>

          {(note.deliveryNoteNo ||
            note.dispatchDocNo ||
            note.dispatchedThrough ||
            note.destination ||
            note.motorVehicleNo) && (
            <div className="bg-[#f8faf8] rounded-xl p-3.5 border border-[#e2f2e9]">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={14} className="text-[#00a651]" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                  Dispatch Details
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {note.deliveryNoteNo && (
                  <div>
                    <span className="text-slate-400">Delivery Note:</span>{" "}
                    <span className="font-semibold text-slate-700">
                      {note.deliveryNoteNo}
                    </span>
                  </div>
                )}
                {note.dispatchDocNo && (
                  <div>
                    <span className="text-slate-400">Doc No:</span>{" "}
                    <span className="font-semibold text-slate-700">
                      {note.dispatchDocNo}
                    </span>
                  </div>
                )}
                {note.dispatchedThrough && (
                  <div>
                    <span className="text-slate-400">Dispatched Via:</span>{" "}
                    <span className="font-semibold text-slate-700">
                      {note.dispatchedThrough}
                    </span>
                  </div>
                )}
                {note.destination && (
                  <div>
                    <span className="text-slate-400">Destination:</span>{" "}
                    <span className="font-semibold text-slate-700">
                      {note.destination}
                    </span>
                  </div>
                )}
                {note.motorVehicleNo && (
                  <div>
                    <span className="text-slate-400">Vehicle No:</span>{" "}
                    <span className="font-semibold text-slate-700">
                      {note.motorVehicleNo}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
              Item Breakdown
            </p>
            <div className="rounded-xl border border-[#e2f2e9] overflow-hidden">
              <table className="w-full text-xs border-collapse bg-white">
                <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                  <tr className="text-left text-[#475569]">
                    <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-[#475569] w-8 text-center">
                      #
                    </th>
                    <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Item Name
                    </th>
                    <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-[#475569] text-center">
                      HSN
                    </th>
                    <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-[#475569] text-center">
                      Qty
                    </th>
                    <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Rate
                    </th>
                    <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Disc %
                    </th>
                    <th className="py-2.5 px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9]">
                  {noteItems.length > 0 ? (
                    noteItems.map((item, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-150"
                      >
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-slate-400 font-mono text-center">
                          {i + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] font-bold text-[#042f2e]">
                          {item.itemName || "—"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-center text-slate-500 font-mono">
                          {item.hsn_code || "—"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-center font-bold text-[#042f2e]">
                          {item.qty} {item.per || ""}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-mono text-slate-700">
                          ₹{fmt(item.rate)}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-mono text-slate-500">
                          {item.discount ? `${item.discount}%` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#042f2e] font-mono">
                          ₹{fmt(item.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-4 text-center text-slate-400 italic"
                      >
                        No item details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 pt-2">
            <div className="flex-1 bg-[#f0fdf4] rounded-xl px-4 py-3 border border-[#c6f1d6] self-start">
              <FileText size={16} className="text-[#00a651] shrink-0 mb-1" />
              <p className="text-xs/relaxed text-[#042f2e]  font-medium">
                {note.narration ? (
                  <span>
                    <strong className="font-extrabold">Narration:</strong>{" "}
                    {note.narration}
                  </span>
                ) : (
                  <span className="italic text-slate-500">
                    No narration provided.
                  </span>
                )}
              </p>
            </div>

            <div className="w-full md:w-72 bg-white p-4 rounded-xl border border-[#e2f2e9] space-y-2 text-xs text-slate-700 shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-mono font-bold">
                  ₹{fmt(note.subtotal)}
                </span>
              </div>
              {Number(note.cgst_amount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    CGST ({note.cgst_rate}%)
                  </span>
                  <span className="font-mono font-medium">
                    ₹{fmt(note.cgst_amount)}
                  </span>
                </div>
              )}
              {Number(note.sgst_amount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    SGST ({note.sgst_rate}%)
                  </span>
                  <span className="font-mono font-medium">
                    ₹{fmt(note.sgst_amount)}
                  </span>
                </div>
              )}
              {Number(note.igst_amount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    IGST ({note.igst_rate}%)
                  </span>
                  <span className="font-mono font-medium">
                    ₹{fmt(note.igst_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#00a651] border-t border-dashed border-[#e2f2e9] pt-2">
                <span>Grand Total</span>
                <span className="font-mono text-base">₹{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e2f2e9] flex items-center justify-between gap-3 bg-white">
          <span className="text-xs px-3 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6] font-bold">
            {noteItems.length} item{noteItems.length !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(note)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Download size={14} /> Download PDF
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(note.id)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Edit size={14} /> Edit
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

export default CreditNoteDetailModal;
