import React from "react";
import { useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FileDown, FileSpreadsheet, FileText, Printer, X } from "lucide-react";
import Swal from "sweetalert2";

const formatBalanceText = (val, originalType) => {
  const num = parseFloat(val) || 0;
  if (num === 0) return "0.00";

  const isDebit =
    originalType === "Debit" || originalType === "Dr" || originalType === "DR";

  if (num > 0) {
    const formatted = num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted} ${isDebit ? "DR" : "CR"}`;
  } else {
    const absoluteVal = Math.abs(num);
    const formatted = absoluteVal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const flippedType = isDebit ? "CR" : "DR";
    return `${formatted} ${flippedType}`;
  }
};

const renderBalanceJSX = (val, originalType, extraClass = "") => {
  const num = parseFloat(val) || 0;
  const isDebit =
    originalType === "Debit" || originalType === "Dr" || originalType === "DR";

  let amountStr = "0.00";
  let typeStr = "";
  let colorClass = "";

  if (num > 0) {
    amountStr = num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    typeStr = isDebit ? "DR" : "CR";
    colorClass = isDebit ? "text-emerald-600" : "text-rose-500";
  } else if (num < 0) {
    amountStr = Math.abs(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    typeStr = isDebit ? "CR" : "DR";
    colorClass = isDebit ? "text-rose-500" : "text-emerald-600";
  }

  return (
    <div
      className={`flex items-center justify-end font-semibold ${extraClass}`}
    >
      <span className="tabular-nums">{amountStr}</span>
      <span
        className={`w-6 text-left ml-2 select-none text-[11px] font-bold tracking-wider ${colorClass}`}
      >
        {typeStr}
      </span>
    </div>
  );
};

const addWorkbookHeader = (ws, options) => {
  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [options.companyName],
      [options.companyAddress],
      [options.reportTitle],
      [`Generated on: ${options.generatedOn}`],
      [],
    ],
    { origin: "A1" },
  );
};

const ViewLedgerModal = ({
  isOpen,
  onClose,
  viewLedger,
  ledgerTransactions = [],
  companyDetails,
  companyName,
}) => {
  if (!isOpen || !viewLedger) return null;

  const transactionsWithBalance = useMemo(() => {
    if (!ledgerTransactions || ledgerTransactions.length === 0) return [];

    const sorted = [...ledgerTransactions].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      if (dateA - dateB !== 0) return dateA - dateB;
      return (a.id || 0) - (b.id || 0);
    });

    const isDebit =
      viewLedger?.balanceType === "Debit" ||
      viewLedger?.balanceType === "Dr" ||
      viewLedger?.balanceType === "DR";

    let running = parseFloat(viewLedger?.openingBalance) || 0;

    const balanceMap = new Map();
    sorted.forEach((t) => {
      const dr = parseFloat(t.debit) || 0;
      const cr = parseFloat(t.credit) || 0;
      if (isDebit) {
        running += dr - cr;
      } else {
        running += cr - dr;
      }
      balanceMap.set(t.id, running);
    });

    return ledgerTransactions.map((t) => ({
      ...t,
      runningBalance: balanceMap.get(t.id) ?? 0,
    }));
  }, [ledgerTransactions, viewLedger]);

  const handleModalExportPDF = () => {
    if (!viewLedger || transactionsWithBalance.length === 0) return;

    const doc = new jsPDF();
    const company = (
      companyDetails?.name ||
      companyName ||
      "Company"
    ).toUpperCase();
    const today = new Date().toLocaleDateString("en-IN");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(company, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(`Ledger Statement: ${viewLedger.name}`, 14, 25);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Under Group: ${viewLedger.underGroup || "-"} | Opening Balance: ${formatBalanceText(
        viewLedger.openingBalance,
        viewLedger.balanceType,
      )}`,
      14,
      31,
    );
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, 35, 195, 35);

    const totalDebit = transactionsWithBalance.reduce(
      (sum, t) => sum + Number(t.debit || 0),
      0,
    );
    const totalCredit = transactionsWithBalance.reduce(
      (sum, t) => sum + Number(t.credit || 0),
      0,
    );
    const finalBalance =
      transactionsWithBalance.length > 0
        ? transactionsWithBalance[transactionsWithBalance.length - 1]
            .runningBalance
        : Number(viewLedger.openingBalance) || 0;

    const tableData = transactionsWithBalance.map((t, i) => [
      i + 1,
      t.date ? t.date.split("T")[0] : "-",
      t.voucherType || "-",
      t.voucherId || "-",
      t.debit > 0
        ? parseFloat(t.debit).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })
        : "-",
      t.credit > 0
        ? parseFloat(t.credit).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })
        : "-",
      formatBalanceText(t.runningBalance, viewLedger.balanceType),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [
        [
          "#",
          "Date",
          "Voucher Type",
          "Voucher No.",
          "Debit (Dr)",
          "Credit (Cr)",
          "Balance",
        ],
      ],
      body: tableData,
      foot: [
        [
          "",
          "",
          "",
          "TOTAL",
          totalDebit > 0
            ? totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            : "0.00",
          totalCredit > 0
            ? totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            : "0.00",
          formatBalanceText(finalBalance, viewLedger.balanceType),
        ],
      ],
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 3, valign: "middle" },
      headStyles: {
        fillColor: [0, 166, 81],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 24 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { halign: "right", cellWidth: 32 },
        5: { halign: "right", cellWidth: 32 },
        6: { halign: "right", cellWidth: 32, fontStyle: "bold" },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • ${viewLedger.name} Statement`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    const sanitizedName = (viewLedger.name || "Ledger").replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );
    doc.save(`${sanitizedName}_Statement_${today}.pdf`);
  };

  const handleModalExportExcel = () => {
    if (!viewLedger || transactionsWithBalance.length === 0) return;
    const today = new Date().toLocaleDateString("en-IN");
    const companyNameForExport =
      companyDetails?.name || companyName || "Company";
    const companyAddress = companyDetails?.address || "-";

    const exportData = transactionsWithBalance.map((t, idx) => ({
      "S.No": idx + 1,
      Date: t.date ? t.date.split("T")[0] : "-",
      "Voucher Type": t.voucherType || "-",
      "Voucher No": t.voucherId || "-",
      "Debit (Dr)": Number(t.debit || 0),
      "Credit (Cr)": Number(t.credit || 0),
      Balance: formatBalanceText(t.runningBalance, viewLedger.balanceType),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
    addWorkbookHeader(ws, {
      companyName: companyNameForExport,
      companyAddress,
      reportTitle: `Ledger Statement: ${viewLedger.name} (${formatBalanceText(
        viewLedger.openingBalance,
        viewLedger.balanceType,
      )} Op. Bal)`,
      generatedOn: today,
    });

    const wb = XLSX.utils.book_new();
    const sanitizedSheetName = (viewLedger.name || "Statement")
      .substring(0, 31)
      .replace(/[:\\/?*\[\]]/g, "_");
    XLSX.utils.book_append_sheet(wb, ws, sanitizedSheetName);

    const sanitizedFileName = (viewLedger.name || "Ledger").replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );
    XLSX.writeFile(wb, `${sanitizedFileName}_Statement.xlsx`);
  };

  const handleModalPrint = () => {
    if (!viewLedger || transactionsWithBalance.length === 0) {
      Swal.fire("Info", "No transactions to print", "info");
      return;
    }

    const doc = new jsPDF();
    const company = (
      companyDetails?.name ||
      companyName ||
      "Company"
    ).toUpperCase();
    const today = new Date().toLocaleDateString("en-IN");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(company, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(`Ledger Statement: ${viewLedger.name}`, 14, 25);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Under Group: ${viewLedger.underGroup || "-"} | Opening Balance: ${formatBalanceText(
        viewLedger.openingBalance,
        viewLedger.balanceType,
      )}`,
      14,
      31,
    );
    doc.text(`Generated on: ${today}`, 195, 18, { align: "right" });

    doc.setDrawColor(220);
    doc.line(14, 35, 195, 35);

    const totalDebit = transactionsWithBalance.reduce(
      (sum, t) => sum + Number(t.debit || 0),
      0,
    );
    const totalCredit = transactionsWithBalance.reduce(
      (sum, t) => sum + Number(t.credit || 0),
      0,
    );
    const finalBalance =
      transactionsWithBalance.length > 0
        ? transactionsWithBalance[transactionsWithBalance.length - 1]
            .runningBalance
        : Number(viewLedger.openingBalance) || 0;

    const tableData = transactionsWithBalance.map((t, i) => [
      i + 1,
      t.date ? t.date.split("T")[0] : "-",
      t.voucherType || "-",
      t.voucherId || "-",
      t.debit > 0
        ? parseFloat(t.debit).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })
        : "-",
      t.credit > 0
        ? parseFloat(t.credit).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })
        : "-",
      formatBalanceText(t.runningBalance, viewLedger.balanceType),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [
        [
          "#",
          "Date",
          "Voucher Type",
          "Voucher No.",
          "Debit (Dr)",
          "Credit (Cr)",
          "Balance",
        ],
      ],
      body: tableData,
      foot: [
        [
          "",
          "",
          "",
          "TOTAL",
          totalDebit > 0
            ? totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            : "0.00",
          totalCredit > 0
            ? totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            : "0.00",
          formatBalanceText(finalBalance, viewLedger.balanceType),
        ],
      ],
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 3, valign: "middle" },
      headStyles: {
        fillColor: [0, 166, 81],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 24 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { halign: "right", cellWidth: 32 },
        5: { halign: "right", cellWidth: 32 },
        6: { halign: "right", cellWidth: 32, fontStyle: "bold" },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(230);
      doc.line(14, 285, 195, 285);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`${company} • ${viewLedger.name} Statement`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
    }

    const blobURL = doc.output("bloburl");
    const printWindow = window.open(blobURL);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  return (
    <div className="fixed inset-0 app-modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="app-modal w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#e2f2e9] overflow-hidden">
        <div className="bg-white px-6 py-4.5 flex justify-between items-center border-b border-[#e2f2e9] sticky top-0 z-10">
          <div className="flex items-center">
            <div className="size-11 rounded-xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center text-[#00a651] mr-3.5 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="modal-title text-base sm:text-lg">
                {viewLedger.name}
              </h3>
              <p className="modal-subtitle mt-0.5">
                Statement & details for this ledger account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="app-panel p-5 bg-white border border-[#e2f2e9] rounded-xl">
            <h4 className="modal-section-title uppercase tracking-wider text-[#00a651] font-bold mb-4">
              Basic & Tax Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-xs">
              <div className="col-span-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Ledger Name
                </span>
                <span className="block text-[13px] font-bold text-slate-800 mt-1">
                  {viewLedger.name}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Alias
                </span>
                <span className="block text-[13px] font-semibold text-slate-700 mt-1">
                  {viewLedger.aliasName || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Under Group
                </span>
                <span className="block text-[13px] font-bold text-[#00a651] mt-1">
                  {viewLedger.underGroup || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Opening Balance
                </span>
                <span className="block text-[13px] font-bold text-slate-800 mt-1">
                  Rs.{" "}
                  {formatBalanceText(
                    viewLedger.openingBalance,
                    viewLedger.balanceType,
                  )}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  PAN/IT No
                </span>
                <span className="block text-[13px] font-semibold text-slate-800 mt-1">
                  {viewLedger.pan || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Registration Type
                </span>
                <span className="block text-[13px] font-semibold text-slate-800 mt-1">
                  {viewLedger.registrationType || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  GSTIN/UIN
                </span>
                <span className="block text-[13px] font-bold text-[#00a651] mt-1">
                  {viewLedger.gstin || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="app-panel p-5 bg-white border border-[#e2f2e9] rounded-xl">
            <h4 className="modal-section-title uppercase tracking-wider text-[#00a651] font-bold mb-4">
              Mailing & Address details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-xs">
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Mailing Name
                </span>
                <span className="block text-[13px] font-semibold text-slate-800 mt-1">
                  {viewLedger.mailingName || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  State
                </span>
                <span className="block text-[13px] font-semibold text-slate-800 mt-1">
                  {viewLedger.state || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Country
                </span>
                <span className="block text-[13px] font-semibold text-slate-800 mt-1">
                  {viewLedger.country || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Pincode
                </span>
                <span className="block text-[13px] font-semibold text-slate-800 mt-1">
                  {viewLedger.pincode || "—"}
                </span>
              </div>
              <div className="col-span-full border-t border-slate-100 pt-3.5 mt-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Address
                </span>
                <span className="block text-[13px] font-medium text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                  {viewLedger.address || "—"}
                </span>
              </div>
            </div>
          </div>

          {viewLedger.haveBankDetails === "Yes" && viewLedger.bankDetails ? (
            <div className="app-panel p-5 bg-[#eff6ff]/30 border border-[#bfdbfe]/50 rounded-xl">
              <h4 className="modal-section-title uppercase tracking-wider text-blue-600 font-bold mb-4">
                Bank Account Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-xs">
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-500/80">
                    Bank Name
                  </span>
                  <span className="block text-[13px] font-bold text-slate-800 mt-1">
                    {viewLedger.bankDetails.bankName}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-500/80">
                    Branch
                  </span>
                  <span className="block text-[13px] font-semibold text-slate-800 mt-1">
                    {viewLedger.bankDetails.branch}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-500/80">
                    Account Number
                  </span>
                  <span className="block text-[13px] font-bold text-slate-800 mt-1 tracking-tighter">
                    {viewLedger.bankDetails.accountNumber}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-500/80">
                    IFSC Code
                  </span>
                  <span className="block text-[13px] font-bold text-slate-800 uppercase mt-1">
                    {viewLedger.bankDetails.ifsc}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="app-panel p-5 bg-white border border-[#e2f2e9] rounded-xl">
              <h4 className="modal-section-title uppercase tracking-wider text-slate-400 font-bold mb-2">
                Bank Account Details
              </h4>
              <p className="text-slate-400 italic text-[13px]">
                No bank details provided for this ledger.
              </p>
            </div>
          )}

          <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-xl bg-white">
            <div className="app-section-bar px-5 py-3 border-b border-[#e2f2e9] flex flex-wrap justify-between items-center gap-2">
              <h4 className="modal-section-title uppercase tracking-wider text-[#042f2e] font-bold">
                Voucher Transactions (Ledger Statement)
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleModalPrint}
                  disabled={transactionsWithBalance.length === 0}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                >
                  <Printer size={14} />
                  Print
                </button>
                <button
                  onClick={handleModalExportExcel}
                  disabled={transactionsWithBalance.length === 0}
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                >
                  <FileSpreadsheet size={14} />
                  Export Excel
                </button>
                <button
                  onClick={handleModalExportPDF}
                  disabled={transactionsWithBalance.length === 0}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                >
                  <FileDown size={14} />
                  Export PDF
                </button>
              </div>
            </div>
            {ledgerTransactions.length === 0 ? (
              <div className="p-6">
                <p className="text-slate-400 italic text-[13px] text-center">
                  No transactions found for this ledger.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse bg-white">
                  <thead className="bg-[#f8faf8] border-b border-[#e2f2e9] font-bold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest">
                        Date
                      </th>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest">
                        Voucher Type
                      </th>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest">
                        Voucher No.
                      </th>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-right">
                        Debit (Dr)
                      </th>
                      <th className="py-2.5 px-4 border-r border-[#e2f2e9] text-[10px] font-extrabold uppercase tracking-widest text-right">
                        Credit (Cr)
                      </th>
                      <th className="py-2.5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-right">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2f2e9]">
                    {transactionsWithBalance.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-[#e2f2e9] hover:bg-[#f0fdf4]/25 transition-colors"
                      >
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-slate-500 whitespace-nowrap">
                          {t.date ? t.date.split("T")[0] : "—"}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] font-bold text-[#00a651]">
                          {t.voucherType}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-slate-700 font-medium whitespace-nowrap">
                          {t.voucherId}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-right font-bold text-slate-800 whitespace-nowrap">
                          {t.debit > 0
                            ? parseFloat(t.debit).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[#e2f2e9] text-right font-bold text-slate-800 whitespace-nowrap">
                          {t.credit > 0
                            ? parseFloat(t.credit).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })
                            : "—"}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          {renderBalanceJSX(
                            t.runningBalance,
                            viewLedger?.balanceType,
                            "text-[#042f2e]",
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLedgerModal;
