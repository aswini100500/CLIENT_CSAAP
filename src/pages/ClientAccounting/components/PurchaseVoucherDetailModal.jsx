import React from "react";
import { useEffect, useRef } from "react";
import {
  X,
  FileText,
  Hash,
  Calendar,
  User,
  Download,
  Edit,
  Building,
  Truck,
} from "lucide-react";

const PurchaseVoucherDetailModal = ({
  voucher,
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

  if (!voucher) return null;

  const formatAmount = (amount) =>
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

  const subtotal =
    voucher.subtotal ??
    voucher.totalAmount ??
    voucher.items?.reduce(
      (sum, i) =>
        sum + (Number(i.amount) || Number(i.qty || 1) * Number(i.rate || 0)),
      0,
    ) ??
    0;
  const gstAmount = Number(voucher.gst_amount || voucher.gstAmount || 0);
  const grandTotal =
    voucher.grand_total ?? voucher.grandTotal ?? subtotal + gstAmount;
  const gstPercentage = Number(
    voucher.gst_percentage || voucher.gstPercentage || 0,
  );
  const igst = Number(voucher.igst_rate || voucher.igst || 0);
  const cgst = Number(voucher.cgst_rate || voucher.cgst || 0);
  const sgst = Number(voucher.sgst_rate || voucher.sgst || 0);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pv-modal-title"
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
                  id="pv-modal-title"
                  className="text-base/tight font-extrabold text-[#042f2e] "
                >
                  Purchase Voucher Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Supplier purchase invoice breakdown & accounting entry
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
                {voucher.invoiceNo || voucher.voucherNo || voucher.id}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Calendar size={12} className="text-[#00a651]" />
              <span className="font-extrabold text-[#042f2e]">
                {formatDate(voucher.date)}
              </span>
            </span>
            {voucher.customer && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f0fdf4] border border-[#c6f1d6] text-[#00a651] font-bold">
                <Building size={12} />
                {voucher.customer}
              </span>
            )}
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

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <Building size={14} className="text-[#00a651]" /> Supplier &
                Billing Details
              </h4>
              <div className="text-xs space-y-1 text-slate-700">
                <div>
                  <span className="font-semibold text-[#042f2e]">
                    Supplier / Party:
                  </span>{" "}
                  {voucher.customer || "-"}
                </div>
                {voucher.gstin && (
                  <div>
                    <span className="font-semibold text-[#042f2e]">GSTIN:</span>{" "}
                    {voucher.gstin}
                  </div>
                )}
                {voucher.address && (
                  <div>
                    <span className="font-semibold text-[#042f2e]">
                      Address:
                    </span>{" "}
                    {voucher.address}
                  </div>
                )}
                {voucher.state && voucher.state !== "Not Applicable" && (
                  <div>
                    <span className="font-semibold text-[#042f2e]">State:</span>{" "}
                    {voucher.state}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f8faf8] border border-[#e2f2e9] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <Truck size={14} className="text-[#00a651]" /> Delivery & Ref
                Details
              </h4>
              <div className="text-xs space-y-1 text-slate-700">
                <div>
                  <span className="font-semibold text-[#042f2e]">
                    Supplier Invoice No:
                  </span>{" "}
                  {voucher.supplierInvoiceNo || "-"}
                </div>
                {voucher.supplierInvoiceDate && (
                  <div>
                    <span className="font-semibold text-[#042f2e]">
                      Supplier Invoice Date:
                    </span>{" "}
                    {formatDate(voucher.supplierInvoiceDate)}
                  </div>
                )}
                {voucher.deliveryNoteNo && (
                  <div>
                    <span className="font-semibold text-[#042f2e]">
                      Delivery Note No:
                    </span>{" "}
                    {voucher.deliveryNoteNo}
                  </div>
                )}
                {voucher.destination && (
                  <div>
                    <span className="font-semibold text-[#042f2e]">
                      Destination:
                    </span>{" "}
                    {voucher.destination}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-2.5">
              Purchased Items Breakdown
            </p>
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
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-28">
                      HSN Code
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right w-24">
                      Qty
                    </th>
                    <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right w-28">
                      Rate (₹)
                    </th>
                    <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right w-32">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9]">
                  {voucher.items?.map((item, i) => {
                    const itemName =
                      item.itemName ||
                      item.item_name ||
                      item.item ||
                      "Stock Item";
                    const qty = Number(item.qty || 1);
                    const rate = Number(item.rate || 0);
                    const amt = Number(item.amount || qty * rate);
                    return (
                      <tr
                        key={i}
                        className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-150"
                      >
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-xs text-slate-400 font-mono text-center">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9]">
                          <div className="font-bold text-[#042f2e] text-[13px] leading-tight">
                            {itemName}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-center text-xs text-slate-600 font-mono">
                          {item.hsn_code || "-"}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-medium text-slate-700 text-[13px]">
                          {qty} {item.per || item.unit || ""}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-medium text-slate-700 text-[13px] tabular-nums">
                          {formatAmount(rate)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#042f2e] text-[13px] tabular-nums">
                          {formatAmount(amt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#f0fdf4]/40 border border-[#c6f1d6] rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-700">
              <span className="font-semibold">Subtotal:</span>
              <span className="font-bold text-[#042f2e] tabular-nums">
                ₹ {formatAmount(subtotal)}
              </span>
            </div>
            {gstPercentage > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-700 border-t border-[#e2f2e9] pt-2">
                <span className="font-semibold">
                  GST ({gstPercentage}%)
                  {igst > 0
                    ? ` - IGST ${igst}%`
                    : cgst > 0 || sgst > 0
                      ? ` - CGST ${cgst}% + SGST ${sgst}%`
                      : ""}
                </span>
                <span className="font-bold text-[#042f2e] tabular-nums">
                  ₹ {formatAmount(gstAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-extrabold text-[#042f2e] border-t border-[#c6f1d6] pt-2">
              <span>GRAND TOTAL:</span>
              <span className="text-base text-[#00a651] tabular-nums">
                ₹ {formatAmount(grandTotal)}
              </span>
            </div>
          </div>

          {voucher.narration && (
            <div className="flex gap-3 bg-[#f0fdf4] rounded-xl px-4 py-3 border border-[#c6f1d6]">
              <FileText size={16} className="text-[#00a651] shrink-0 mt-0.5" />
              <p className="text-xs/relaxed text-[#042f2e]  font-medium">
                <strong className="font-extrabold">Narration:</strong>{" "}
                {voucher.narration}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#e2f2e9] flex items-center justify-between gap-3 bg-white">
          <span className="text-xs px-3 py-1 rounded-full bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6] font-bold">
            {voucher.items?.length ?? 0} item
            {voucher.items?.length !== 1 ? "s" : ""}
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

export default PurchaseVoucherDetailModal;
