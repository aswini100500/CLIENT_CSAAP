import React, { useEffect, useRef } from "react";
import { X, Hash, Calendar, User, Download, Edit, ArrowRight } from "lucide-react";

const ContraVoucherDetailModal = ({ voucher, onClose, onEdit, onDownload }) => {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
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

    const grandTotal = voucher.transactions?.reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
    ) ?? 0;

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cv-modal-title"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: "90vh" }}
            >

                <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <div>
                                <h2
                                    id="cv-modal-title"
                                    className="text-base font-semibold text-gray-900 leading-tight"
                                >
                                    Contra voucher details
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Fund transfer between accounts
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
                        {voucher.role && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600">
                                <User size={11} className="text-gray-400" />
                                Created by{" "}
                                <span className="font-semibold text-gray-800 capitalize">
                                    {voucher.role}
                                </span>
                            </span>
                        )}
                    </div>
                </div>


                <div className="overflow-y-auto flex-1 px-6 py-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                        Transactions
                    </p>


                    <div className="rounded-xl border border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <table className="w-full text-sm min-w-max">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-10">
                                        #
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                                        From account
                                    </th>
                                    <th className="w-8" />
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                                        To account
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">
                                        Amount (₹)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {voucher.transactions?.map((t, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors duration-100"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                            {String(i + 1).padStart(2, "0")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800 text-sm leading-tight">
                                                {t.fromAccountName || t.fromAccount || "—"}
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-300">
                                            <ArrowRight size={14} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800 text-sm leading-tight">
                                                {t.toAccountName || t.toAccount || "—"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                                            {formatAmount(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50">
                                    <td
                                        colSpan={4}
                                        className="px-4 py-3 text-sm font-semibold text-gray-500 text-right"
                                    >
                                        Grand total
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-700 text-base tabular-nums">
                                        {formatAmount(grandTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>


                    <div className="mt-4 flex gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
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
                        <p className="text-sm text-blue-700 leading-relaxed">
                            {voucher.narration || (
                                <span className="italic text-blue-400">No narration provided.</span>
                            )}
                        </p>
                    </div>
                </div>


                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {voucher.transactions?.length ?? 0} transaction
                        {voucher.transactions?.length !== 1 ? "s" : ""}
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

export default ContraVoucherDetailModal;