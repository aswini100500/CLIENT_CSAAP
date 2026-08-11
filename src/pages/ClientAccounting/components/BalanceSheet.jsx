import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import {
  Printer,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Building2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BalanceSheet = () => {
  const { companyId, companyName } = useAuth();

  const [balanceData, setBalanceData] = useState({
    assets: [],
    liabilities: [],
    totals: { totalAssets: 0, totalLiabilities: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchBalanceSheet();
    }
  }, [companyId]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/balanceSheet/${companyId}`,
      );
      if (res.data.success) {
        setBalanceData(res.data);
      }
    } catch (err) {
      console.error("Error fetching Balance Sheet", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
    return `Rs. ${formatted}`;
  };

  const groupByGroup = (list) => {
    const groups = {};
    list.forEach((item) => {
      if (!groups[item.groupName]) {
        groups[item.groupName] = [];
      }
      groups[item.groupName].push(item);
    });
    return groups;
  };

  const assetGroups = groupByGroup(balanceData.assets);
  const liabilityGroups = groupByGroup(balanceData.liabilities);

  const prepareTableData = () => {
    const liabList = [];
    Object.keys(liabilityGroups)
      .sort()
      .forEach((groupName) => {
        const groupTotal = liabilityGroups[groupName].reduce(
          (sum, item) => sum + (item.closingCredit - item.closingDebit),
          0,
        );
        liabList.push({ name: groupName, amount: groupTotal, isGroup: true });
        if (
          groupName !== "Difference in opening balances" &&
          groupName !== "Profit & Loss"
        ) {
          liabilityGroups[groupName].forEach((l) => {
            const val = l.closingCredit - l.closingDebit;
            if (val !== 0)
              liabList.push({
                name: l.ledgerName,
                amount: val,
                isGroup: false,
              });
          });
        }
      });

    const assetList = [];
    Object.keys(assetGroups)
      .sort()
      .forEach((groupName) => {
        const groupTotal = assetGroups[groupName].reduce(
          (sum, item) => sum + (item.closingDebit - item.closingCredit),
          0,
        );
        assetList.push({ name: groupName, amount: groupTotal, isGroup: true });
        if (
          groupName !== "Difference in opening balances" &&
          groupName !== "Profit & Loss"
        ) {
          assetGroups[groupName].forEach((l) => {
            const val = l.closingDebit - l.closingCredit;
            if (val !== 0)
              assetList.push({
                name: l.ledgerName,
                amount: val,
                isGroup: false,
              });
          });
        }
      });

    return { liabList, assetList };
  };

  const handleExportExcel = () => {
    const rows = [["LIABILITIES", "Amount", "ASSETS", "Amount"]];
    const { liabList, assetList } = prepareTableData();
    const maxLen = Math.max(liabList.length, assetList.length);
    for (let i = 0; i < maxLen; i++) {
      const l = liabList[i] || { name: "", amount: "" };
      const a = assetList[i] || { name: "", amount: "" };

      const lAmt =
        l.amount !== "" ? Math.abs(l.amount) + (l.amount < 0 ? " Dr" : "") : "";
      const aAmt =
        a.amount !== "" ? Math.abs(a.amount) + (a.amount < 0 ? " Cr" : "") : "";

      rows.push([
        l.isGroup ? l.name : `  ${l.name}`,
        lAmt,
        a.isGroup ? a.name : `  ${a.name}`,
        aAmt,
      ]);
    }

    rows.push(["Total", totalLiabilities, "Total", totalAssets]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BalanceSheet");
    XLSX.writeFile(wb, "Balance_Sheet.xlsx");
  };

  const generatePDF = (shouldPrint = false) => {
    const doc = new jsPDF();
    doc.text(`${companyName}`, 14, 15);
    doc.text("Balance Sheet", 14, 22);
    doc.setFontSize(10);
    doc.text(`As on ${new Date().toLocaleDateString()}`, 14, 28);

    const rows = [];
    const { liabList, assetList } = prepareTableData();
    const maxLen = Math.max(liabList.length, assetList.length);

    for (let i = 0; i < maxLen; i++) {
      const l = liabList[i] || { name: "", amount: "" };
      const a = assetList[i] || { name: "", amount: "" };

      const lAmt =
        l.amount !== ""
          ? formatCurrency(Math.abs(l.amount)) + (l.amount < 0 ? " Dr" : "")
          : "";
      const aAmt =
        a.amount !== ""
          ? formatCurrency(Math.abs(a.amount)) + (a.amount < 0 ? " Cr" : "")
          : "";

      rows.push([
        l.isGroup ? l.name : `  ${l.name}`,
        lAmt,
        a.isGroup ? a.name : `  ${a.name}`,
        aAmt,
      ]);
    }

    rows.push([
      "Total",
      formatCurrency(totalLiabilities),
      "Total",
      formatCurrency(totalAssets),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["LIABILITIES", "Amount", "ASSETS", "Amount"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    if (shouldPrint) {
      doc.autoPrint();
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = doc.output("bloburl");
      document.body.appendChild(iframe);
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      doc.save("Balance_Sheet.pdf");
    }
  };

  const handleExportPDF = () => generatePDF(false);
  const handlePrint = () => generatePDF(true);

  const { liabList, assetList } = prepareTableData();
  const maxLen = Math.max(liabList.length, assetList.length);
  const tableRows = [];
  for (let i = 0; i < maxLen; i++) {
    tableRows.push({
      liab: liabList[i] || null,
      asset: assetList[i] || null,
    });
  }

  const { totalAssets, totalLiabilities } = balanceData.totals;
  const isBalanced = Math.abs(totalAssets - totalLiabilities) < 5;

  const RenderSide = ({ title, groups, total }) => {
    const isLiab = title === "Liabilities";
    return (
      <div className="flex-1 app-panel overflow-hidden border border-(--border-soft) bg-white flex flex-col min-h-112.5">
        <div
          className={`py-3.5 px-4 font-extrabold uppercase tracking-wider text-xs border-b flex items-center justify-between ${
            isLiab
              ? "bg-emerald-50/60 text-emerald-800 border-emerald-100"
              : "bg-sky-50/60 text-sky-800 border-sky-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                isLiab ? "bg-emerald-600" : "bg-sky-600"
              }`}
            />
            <span>{title}</span>
          </div>
        </div>

        <div className="p-4 grow space-y-3.5 overflow-y-auto">
          {Object.keys(groups)
            .sort()
            .map((groupName) => {
              const groupTotal = groups[groupName].reduce(
                (sum, item) =>
                  sum +
                  (title === "Liabilities"
                    ? item.closingCredit - item.closingDebit
                    : item.closingDebit - item.closingCredit),
                0,
              );

              return (
                <div key={groupName} className="space-y-1">
                  <div className="font-bold text-(--text-strong) text-xs border-b border-(--border-soft) pb-1 mb-1 flex justify-between items-center">
                    <span>{groupName}</span>
                    <span className="font-bold text-(--text-strong) tabular-nums">
                      {formatCurrency(Math.abs(groupTotal))}{" "}
                      {groupTotal < 0
                        ? title === "Liabilities"
                          ? "Dr"
                          : "Cr"
                        : ""}
                    </span>
                  </div>
                  <div className="pl-3 space-y-1 border-l-2 border-(--border-soft) ml-1">
                    {groupName !== "Difference in opening balances" &&
                      groupName !== "Profit & Loss" &&
                      groups[groupName].map((ledger) => {
                        const ledgerVal =
                          title === "Liabilities"
                            ? ledger.closingCredit - ledger.closingDebit
                            : ledger.closingDebit - ledger.closingCredit;
                        return (
                          <div
                            key={ledger.ledgerId}
                            className={`flex justify-between text-xs text-(--text-soft) hover:text-(--text-strong) py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLiab
                                ? "hover:bg-(--bg-subtle)/50"
                                : "hover:bg-sky-50/50"
                            }`}
                          >
                            <span className="font-medium">
                              {ledger.ledgerName}
                            </span>
                            <span className="font-semibold text-(--text-strong) tabular-nums text-[11px]">
                              {formatCurrency(Math.abs(ledgerVal))}{" "}
                              {ledgerVal < 0
                                ? title === "Liabilities"
                                  ? "Dr"
                                  : "Cr"
                                : ""}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="bg-(--bg-subtle)/40 p-3.5 border-t border-(--border-soft) flex justify-between font-extrabold text-(--text-strong) text-sm mt-auto">
          <span>Total {title}</span>
          <span
            className={`font-extrabold tabular-nums ${
              isLiab ? "text-emerald-700" : "text-sky-700"
            }`}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="app-panel p-10 flex flex-col justify-center items-center bg-white border border-(--border-soft)">
        <Loader2 className="size-8 animate-spin text-(--brand) mb-3" />
        <p className="text-xs font-semibold text-(--text-soft)">
          Loading Balance Sheet Data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-sm print:bg-white print:p-0">
      <div className="app-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2.5 text-[13px] font-bold text-(--text-strong)">
          <div className="size-8 rounded-xl bg-(--brand-soft) border border-(--border-strong) flex items-center justify-center text-(--brand)">
            <Building2 size={16} />
          </div>
          <div>
            <span className="block leading-tight">
              {companyName || companyId || "Company Accounting"}
            </span>
            <span className="text-[11px] font-medium text-(--text-faint)">
              As on {new Date().toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchBalanceSheet}
            className="app-btn-secondary flex items-center gap-2 min-h-9 px-3 text-[13px]"
          >
            <RefreshCw size={14} className="text-(--text-soft)" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="app-btn-secondary flex items-center gap-2 min-h-9 px-3 text-[13px]"
          >
            <Printer size={14} className="text-(--text-soft)" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="app-btn-secondary flex items-center gap-2 min-h-9 px-3 text-[13px]"
          >
            <FileText size={14} className="text-rose-600" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="app-btn-primary flex items-center gap-2 min-h-9 px-3 text-[13px]"
          >
            <FileSpreadsheet size={14} className="text-white" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold">{companyName}</h1>
        <h2 className="text-lg font-semibold text-gray-700">
          Balance Sheet Report
        </h2>
        <p className="text-sm text-gray-500">
          As on {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <RenderSide
          title="Liabilities"
          groups={liabilityGroups}
          total={totalLiabilities}
        />
        <RenderSide title="Assets" groups={assetGroups} total={totalAssets} />
      </div>

      <div className="hidden print:block w-full">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#1e3a8a] text-white">
              <th className="p-2 pl-4 text-left border border-gray-300 font-bold uppercase w-[25%]">
                LIABILITIES
              </th>
              <th className="p-2 text-left border border-gray-300 font-bold w-[25%]">
                Amount
              </th>
              <th className="p-2 pl-4 text-left border border-gray-300 font-bold uppercase w-[25%]">
                ASSETS
              </th>
              <th className="p-2 text-left border border-gray-300 font-bold w-[25%]">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, idx) => {
              const l = row.liab || { name: "", amount: "" };
              const a = row.asset || { name: "", amount: "" };
              const lAmt =
                l.amount !== ""
                  ? `${formatCurrency(Math.abs(l.amount))} ${
                      l.amount < 0 ? "Dr" : ""
                    }`.trim()
                  : "";
              const aAmt =
                a.amount !== ""
                  ? `${formatCurrency(Math.abs(a.amount))} ${
                      a.amount < 0 ? "Cr" : ""
                    }`.trim()
                  : "";
              return (
                <tr key={idx}>
                  <td
                    className={`p-2 border border-gray-300 text-gray-800 ${
                      l.isGroup ? "font-semibold" : "pl-6 text-gray-600"
                    }`}
                  >
                    {l.name}
                  </td>
                  <td
                    className={`p-2 border border-gray-300 ${
                      l.isGroup ? "font-semibold" : ""
                    }`}
                  >
                    {lAmt}
                  </td>
                  <td
                    className={`p-2 border border-gray-300 text-gray-800 ${
                      a.isGroup ? "font-semibold" : "pl-6 text-gray-600"
                    }`}
                  >
                    {a.name}
                  </td>
                  <td
                    className={`p-2 border border-gray-300 ${
                      a.isGroup ? "font-semibold" : ""
                    }`}
                  >
                    {aAmt}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold text-gray-900 bg-gray-50">
              <td className="p-2 pl-4 border border-gray-300">Total</td>
              <td className="p-2 border border-gray-300">
                {formatCurrency(totalLiabilities)}
              </td>
              <td className="p-2 pl-4 border border-gray-300">Total</td>
              <td className="p-2 border border-gray-300">
                {formatCurrency(totalAssets)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isBalanced && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold text-center flex items-center justify-center gap-2 shadow-2xs print:border-red-500">
          <AlertCircle size={18} className="text-rose-600" />
          <span>
            DIFFERENCE IN OPENING BALANCES:{" "}
            {formatCurrency(Math.abs(totalAssets - totalLiabilities))}
          </span>
        </div>
      )}
    </div>
  );
};

export default BalanceSheet;
