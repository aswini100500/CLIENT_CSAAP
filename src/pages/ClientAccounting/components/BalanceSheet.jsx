import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { Download, Printer, RefreshCw, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BalanceSheet = () => {
  const { companyId, companyName } = useCompany();

  const [balanceData, setBalanceData] = useState({
    assets: [],
    liabilities: [],
    totals: { totalAssets: 0, totalLiabilities: 0 }
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
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/balanceSheet/${companyId}`
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
      maximumFractionDigits: 2
    }).format(amount || 0);
    return `Rs. ${formatted}`;
  };

  // Helper to group by Group Name
  const groupByGroup = (list) => {
    const groups = {};
    list.forEach(item => {
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
    Object.keys(liabilityGroups).sort().forEach(groupName => {
      const groupTotal = liabilityGroups[groupName].reduce((sum, item) => sum + (item.closingCredit - item.closingDebit), 0);
      liabList.push({ name: groupName, amount: groupTotal, isGroup: true });
      if (groupName !== "Difference in opening balances" && groupName !== "Profit & Loss") {
        liabilityGroups[groupName].forEach(l => {
          const val = l.closingCredit - l.closingDebit;
          if (val !== 0) liabList.push({ name: l.ledgerName, amount: val, isGroup: false });
        });
      }
    });

    const assetList = [];
    Object.keys(assetGroups).sort().forEach(groupName => {
      const groupTotal = assetGroups[groupName].reduce((sum, item) => sum + (item.closingDebit - item.closingCredit), 0);
      assetList.push({ name: groupName, amount: groupTotal, isGroup: true });
      if (groupName !== "Difference in opening balances" && groupName !== "Profit & Loss") {
        assetGroups[groupName].forEach(l => {
          const val = l.closingDebit - l.closingCredit;
          if (val !== 0) assetList.push({ name: l.ledgerName, amount: val, isGroup: false });
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

      const lAmt = l.amount !== "" ? (Math.abs(l.amount) + (l.amount < 0 ? " Dr" : "")) : "";
      const aAmt = a.amount !== "" ? (Math.abs(a.amount) + (a.amount < 0 ? " Cr" : "")) : "";

      rows.push([l.isGroup ? l.name : `  ${l.name}`, lAmt, a.isGroup ? a.name : `  ${a.name}`, aAmt]);
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

      const lAmt = l.amount !== "" ? (formatCurrency(Math.abs(l.amount)) + (l.amount < 0 ? " Dr" : "")) : "";
      const aAmt = a.amount !== "" ? (formatCurrency(Math.abs(a.amount)) + (a.amount < 0 ? " Cr" : "")) : "";

      rows.push([l.isGroup ? l.name : `  ${l.name}`, lAmt, a.isGroup ? a.name : `  ${a.name}`, aAmt]);
    }

    rows.push(["Total", formatCurrency(totalLiabilities), "Total", formatCurrency(totalAssets)]);

    autoTable(doc, {
      startY: 35,
      head: [["LIABILITIES", "Amount", "ASSETS", "Amount"]],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] }
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
      asset: assetList[i] || null
    });
  }

  // Helper to Render Side (Liabilities or Assets)
  const RenderSide = ({ title, groups, total }) => {
    return (
      <div className="flex-1 border border-gray-300 min-h-150 flex flex-col bg-white">
        {/* Title */}
        <div className="bg-blue-800 text-white text-center py-2 font-bold uppercase tracking-wider border-b border-blue-900">
          {title}
        </div>

        {/* Content */}
        <div className="p-4 grow space-y-4">
          {Object.keys(groups).sort().map(groupName => {
            const groupTotal = groups[groupName].reduce((sum, item) => sum + (title === "Liabilities" ? (item.closingCredit - item.closingDebit) : (item.closingDebit - item.closingCredit)), 0);

            return (
              <div key={groupName}>
                <div className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-1 flex justify-between">
                  <span>{groupName}</span>
                  <span>{formatCurrency(Math.abs(groupTotal))} {groupTotal < 0 ? (title === "Liabilities" ? "Dr" : "Cr") : ""}</span>
                </div>
                <div className="pl-4 space-y-1">
                  {groupName !== "Difference in opening balances" && groupName !== "Profit & Loss" && groups[groupName].map(ledger => {
                    const ledgerVal = title === "Liabilities" ? (ledger.closingCredit - ledger.closingDebit) : (ledger.closingDebit - ledger.closingCredit);
                    return (
                      <div key={ledger.ledgerId} className="flex justify-between text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>{ledger.ledgerName}</span>
                        <span>
                          {formatCurrency(Math.abs(ledgerVal))} {ledgerVal < 0 ? (title === "Liabilities" ? "Dr" : "Cr") : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div className="bg-gray-100 p-3 border-t border-gray-300 flex justify-between font-bold text-gray-900 text-lg">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { totalAssets, totalLiabilities } = balanceData.totals;
  const isBalanced = Math.abs(totalAssets - totalLiabilities) < 5; // Tolerance for float errors

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-mono print:bg-white print:p-0">

      {/* Header */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Balance Sheet</h1>
          <p className="text-gray-600">{companyName}</p>
          <p className="text-sm text-gray-500">As on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchBalanceSheet}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            <FileText size={16} /> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">{companyName}</h1>
        <h2 className="text-xl font-bold uppercase mt-1">Balance Sheet</h2>
        <p className="text-sm mt-1">As on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Tally Style Layout: Left (Liabilities) | Right (Assets) - Screen ONLY */}
      <div className="flex flex-col md:flex-row gap-0 md:gap-4 shadow-lg print:hidden">
        <RenderSide
          title="Liabilities"
          groups={liabilityGroups}
          total={totalLiabilities}
        />
        <RenderSide
          title="Assets"
          groups={assetGroups}
          total={totalAssets}
        />
      </div>

      {/* Tally Style Unified Table - Print ONLY */}
      <div className="hidden print:block w-full">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#1e3a8a] text-white">
              <th className="p-2 pl-4 text-left border border-gray-300 font-bold uppercase w-[25%]">LIABILITIES</th>
              <th className="p-2 text-left border border-gray-300 font-bold w-[25%]">Amount</th>
              <th className="p-2 pl-4 text-left border border-gray-300 font-bold uppercase w-[25%]">ASSETS</th>
              <th className="p-2 text-left border border-gray-300 font-bold w-[25%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, idx) => {
              const l = row.liab || { name: "", amount: "" };
              const a = row.asset || { name: "", amount: "" };

              const lAmt = l.amount !== "" ? `${formatCurrency(Math.abs(l.amount))} ${l.amount < 0 ? "Dr" : ""}`.trim() : "";
              const aAmt = a.amount !== "" ? `${formatCurrency(Math.abs(a.amount))} ${a.amount < 0 ? "Cr" : ""}`.trim() : "";

              return (
                <tr key={idx}>
                  <td className={`p-2 border border-gray-300 text-gray-800 ${l.isGroup ? 'font-semibold' : 'pl-6 text-gray-600'}`}>{l.name}</td>
                  <td className={`p-2 border border-gray-300 ${l.isGroup ? 'font-semibold' : ''}`}>{lAmt}</td>
                  <td className={`p-2 border border-gray-300 text-gray-800 ${a.isGroup ? 'font-semibold' : 'pl-6 text-gray-600'}`}>{a.name}</td>
                  <td className={`p-2 border border-gray-300 ${a.isGroup ? 'font-semibold' : ''}`}>{aAmt}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold text-gray-900 bg-gray-50">
              <td className="p-2 pl-4 border border-gray-300">Total</td>
              <td className="p-2 border border-gray-300">{formatCurrency(totalLiabilities)}</td>
              <td className="p-2 pl-4 border border-gray-300">Total</td>
              <td className="p-2 border border-gray-300">{formatCurrency(totalAssets)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Difference Alert */}
      {!isBalanced && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded font-bold text-center print:border-red-500">
          DIFFERENCE IN OPENING BALANCES: {formatCurrency(Math.abs(totalAssets - totalLiabilities))}
        </div>
      )}

    </div>
  );
};

export default BalanceSheet;
