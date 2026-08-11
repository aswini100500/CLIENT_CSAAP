import React from "react";
import {
  Calendar,
  Download,
  Edit,
  FileText,
  Hash,
  MapPin,
  Package,
  Truck,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

const SaleVoucherDetailModal = ({ voucher, onClose, onEdit, onDownload }) => {
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

  const invoiceNumber =
    voucher.invoiceNo ||
    voucher.voucherNo ||
    voucher.voucherNumber ||
    voucher.id;
  const grandTotal =
    voucher.grand_total ?? voucher.totalAmount ?? voucher.amount ?? 0;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sv-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-[#e2f2e9]"
        style={{ maxHeight: "90vh" }}
      >
        <div className="px-6 py-5 border-b border-[#e2f2e9] bg-white shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#c6f1d6] flex items-center justify-center shrink-0 text-[#00a651]">
                <FileText size={20} />
              </div>
              <div>
                <h2
                  id="sv-modal-title"
                  className="text-base/tight font-extrabold text-[#042f2e] "
                >
                  Sales Voucher Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Client Sales Transaction & Tax Invoice Summary
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
              Invoice No.{" "}
              <span className="font-extrabold text-[#042f2e]">
                {invoiceNumber}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
              <Calendar size={12} className="text-[#00a651]" />
              <span className="font-extrabold text-[#042f2e]">
                {formatDate(voucher.date)}
              </span>
            </span>
            {voucher.customer && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
                <User size={12} className="text-[#00a651]" />
                Customer:{" "}
                <span className="font-extrabold text-[#042f2e]">
                  {voucher.customer}
                </span>
              </span>
            )}
            {voucher.role && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#f8faf8] border border-[#e2f2e9] text-slate-700 font-medium">
                Created by{" "}
                <span className="font-bold text-[#042f2e] capitalize">
                  {voucher.role}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#f8faf8] rounded-xl p-4 border border-[#e2f2e9]">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#00a651] mb-3 flex items-center gap-1.5">
                <MapPin size={14} /> Party Details
              </p>
              <div className="space-y-2 text-xs">
                {[
                  ["Customer Name", voucher.customer || voucher.customerName],
                  ["Mailing Name", voucher.mailingName],
                  ["Address", voucher.address],
                  ["State", voucher.state],
                  ["Pincode", voucher.pincode],
                  ["Country", voucher.country],
                  ["GSTIN", voucher.gstin],
                  ["GST Reg. Type", voucher.gstRegistrationType],
                  ["Place of Supply", voucher.placeOfSupply],
                ]
                  .filter(([, val]) => val)
                  .map(([label, val]) => (
                    <div
                      key={label}
                      className="flex justify-between items-start gap-2"
                    >
                      <span className="text-slate-500 font-medium shrink-0">
                        {label}:
                      </span>
                      <span className="font-bold text-[#042f2e] text-right">
                        {val}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-[#f0fdf4]/50 rounded-xl p-4 border border-[#c6f1d6]">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#00a651] mb-3">
                Tax & Amount Summary
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#042f2e]">
                    ₹ {formatAmount(voucher.subtotal)}
                  </span>
                </div>
                {Number(voucher.igst || 0) > 0 && (
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>IGST:</span>
                    <span className="font-bold text-[#042f2e]">
                      ₹ {formatAmount(voucher.igst)}
                    </span>
                  </div>
                )}
                {Number(voucher.cgst || 0) > 0 && (
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>CGST:</span>
                    <span className="font-bold text-[#042f2e]">
                      ₹ {formatAmount(voucher.cgst)}
                    </span>
                  </div>
                )}
                {Number(voucher.sgst || 0) > 0 && (
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>SGST:</span>
                    <span className="font-bold text-[#042f2e]">
                      ₹ {formatAmount(voucher.sgst)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>Total Tax Amount:</span>
                  <span className="font-bold text-emerald-700">
                    ₹ {formatAmount(voucher.gst_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-[#c6f1d6] pt-2.5 mt-2">
                  <span className="font-extrabold text-[#042f2e] text-sm">
                    Grand Total:
                  </span>
                  <span className="font-extrabold text-[#00a651] text-base">
                    ₹ {formatAmount(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {voucher.items && voucher.items.length > 0 && (
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-2.5 flex items-center gap-1.5">
                <Package size={14} className="text-[#00a651]" /> Line Items (
                {voucher.items.length})
              </p>
              <div className="rounded-xl border border-[#e2f2e9] overflow-hidden">
                <table className="w-full text-xs border-collapse bg-white">
                  <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                    <tr className="text-left text-slate-700">
                      <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] w-10 text-center">
                        #
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Item Name
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-24">
                        HSN Code
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right w-20">
                        Qty
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right w-24">
                        Rate (₹)
                      </th>
                      <th className="py-2.5 px-3 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-16">
                        Per
                      </th>
                      <th className="py-2.5 px-3 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right w-28">
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
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-slate-400 font-mono text-center">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] font-bold text-[#042f2e]">
                          {item.item || item.name || "—"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-center text-slate-500 font-mono">
                          {item.hsn_code || "—"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-semibold text-slate-700">
                          {item.qty || 0}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-semibold text-slate-700">
                          {formatAmount(item.rate)}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-center text-slate-500">
                          {item.per || "Nos"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#042f2e] tabular-nums">
                          {formatAmount(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(voucher.dispatchedThrough ||
            voucher.destination ||
            voucher.motorVehicleNo ||
            voucher.deliveryNoteNo ||
            voucher.carrierName ||
            voucher.buyerOrderNo) && (
            <div className="bg-[#f8faf8] rounded-xl p-4 border border-[#e2f2e9]">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#042f2e] mb-3 flex items-center gap-1.5">
                <Truck size={14} className="text-[#00a651]" /> Dispatch &
                Shipping Details
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  ["Delivery Note", voucher.deliveryNoteNo],
                  ["Dispatched Through", voucher.dispatchedThrough],
                  ["Destination", voucher.destination],
                  ["Vehicle No.", voucher.motorVehicleNo],
                  ["Dispatch Date", formatDate(voucher.dispatchDate)],
                  ["Bill of Lading", voucher.billOfLading],
                  ["Carrier Name", voucher.carrierName],
                  ["Reference No.", voucher.referenceNo],
                  ["Buyer Order No.", voucher.buyerOrderNo],
                ]
                  .filter(([, val]) => val && val !== "-")
                  .map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {label}
                      </p>
                      <p className="text-[#042f2e] font-semibold">{val}</p>
                    </div>
                  ))}
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
                  No narration provided for this sales voucher.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e2f2e9] flex items-center justify-between gap-3 bg-white shrink-0">
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

export default SaleVoucherDetailModal;
