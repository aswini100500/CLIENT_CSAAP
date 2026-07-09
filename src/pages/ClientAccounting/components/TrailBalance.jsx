import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import { ChevronDown, ChevronRight, Printer, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TrialBalance = () => {
  const { companyId, companyName } = useCompany();
  const [data, setData] = useState({ groupWise: {}, summary: {} });
  const [plData, setPlData] = useState({ netProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (companyId) {
      fetchTrialBalance();
    }
  }, [companyId]);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);

      // Fetch Trial Balance + Profit & Loss in parallel
      const [tbRes, plRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/trial-balance/get-Trail-balance/${companyId}`),
        axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/profit-loss/${companyId}`).catch(() => null)
      ]);

      if (tbRes.data.success) {
        setData(tbRes.data);
        const extractAllGroupNames = (groupsObj) => {
          let names = {};
          Object.values(groupsObj).forEach(g => {
            names[g.groupName] = true;
            if (g.subGroups) {
              names = { ...names, ...extractAllGroupNames(g.subGroups) };
            }
          });
          return names;
        };
        const allGroups = extractAllGroupNames(tbRes.data.groupWise);
        setExpandedGroups(allGroups);
      }

      if (plRes?.data?.success) {
        const rawIncome   = plRes.data.income   || [];
        const rawExpenses = plRes.data.expenses || [];

        // API returns { ledgerName, amount } — use .amount directly
        const totalIncome   = rawIncome.reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const totalExpenses = rawExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
        const netProfit     = totalIncome - totalExpenses;

        setPlData({ netProfit, totalIncome, totalExpenses });
      }
    } catch (err) {
      console.error("Error fetching TB", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!groupWise) return;
    const exportData = [];

    const traverseGroup = (group, depth) => {
      const indent = "  ".repeat(depth);

      // Add Group Header
      exportData.push({
        Particulars: `${indent}${group.groupName.toUpperCase()}`,
        "Opening Balance": "",
        Debit: group.totalDebit || "",
        Credit: group.totalCredit || "",
        "Closing Balance": ""
      });

      // Traverse subGroups
      if (group.subGroups) {
        Object.values(group.subGroups).forEach(subG => traverseGroup(subG, depth + 1));
      }

      // Add Ledgers
      if (group.ledgers) {
        group.ledgers.forEach(l => {
          exportData.push({
            Particulars: `${indent}  ${l.ledgerName}`,
            "Opening Balance": l.openingDebit > 0 ? `${l.openingDebit} Dr` : l.openingCredit > 0 ? `${l.openingCredit} Cr` : "0.00",
            Debit: l.debit || "",
            Credit: l.credit || "",
            "Closing Balance": l.closingDebit > 0 ? `${l.closingDebit} Dr` : l.closingCredit > 0 ? `${l.closingCredit} Cr` : "0.00"
          });
        });
      }
    };

    Object.values(groupWise).forEach(group => {
      traverseGroup(group, 0);
    });

    // Summary
    exportData.push({});
    exportData.push({
      Particulars: "GRAND TOTAL",
      "Opening Balance": "",
      Debit: summary.totalDebit,
      Credit: summary.totalCredit,
      "Closing Balance": Math.abs(summary.difference) < 1 ? "BALANCED" : `DIFF: ${summary.difference}`
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TrialBalance");
    XLSX.writeFile(wb, "Trial_Balance_Report.xlsx");
  };

  const generatePDF = (shouldPrint = false) => {
    const doc = new jsPDF();
    doc.text(`${companyName}`, 14, 15);
    doc.text("Trial Balance", 14, 22);
    doc.setFontSize(10);
    doc.text(`As on ${new Date().toLocaleDateString()}`, 14, 28);

    const rows = [];
    const traverseGroup = (group, depth) => {
      const indent = "  ".repeat(depth);
      rows.push([
        `${indent}${group.groupName.toUpperCase()}`,
        "",
        group.totalDebit ? formatCurrency(group.totalDebit) : "",
        group.totalCredit ? formatCurrency(group.totalCredit) : "",
        ""
      ]);

      if (group.subGroups) {
        Object.values(group.subGroups).forEach(subG => traverseGroup(subG, depth + 1));
      }
      if (group.ledgers) {
        group.ledgers.forEach(l => {
          rows.push([
            `${indent}  ${l.ledgerName}`,
            l.openingDebit > 0 ? `${formatCurrency(l.openingDebit)} Dr` : l.openingCredit > 0 ? `${formatCurrency(l.openingCredit)} Cr` : "0.00",
            l.debit ? formatCurrency(l.debit) : "",
            l.credit ? formatCurrency(l.credit) : "",
            l.closingDebit > 0 ? `${formatCurrency(l.closingDebit)} Dr` : l.closingCredit > 0 ? `${formatCurrency(l.closingCredit)} Cr` : "0.00"
          ]);
        });
      }
    };

    if (groupWise) {
      Object.values(groupWise).forEach(group => {
        traverseGroup(group, 0);
      });
    }

    rows.push([
      "GRAND TOTAL",
      "",
      formatCurrency(summary?.totalDebit || 0),
      formatCurrency(summary?.totalCredit || 0),
      Math.abs(summary?.difference || 0) < 1 ? "BALANCED" : `DIFF: ${formatCurrency(summary?.difference)}`
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Particulars", "Opening Balance", "Debit", "Credit", "Closing Balance"]],
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
      doc.save("Trial_Balance.pdf");
    }
  };

  const handleExportPDF = () => generatePDF(false);
  const handlePrint = () => generatePDF(true);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
    return `Rs. ${formatted}`;
  };

  const { groupWise, summary } = data;

  // ── Profit & Loss from P&L API (exact same as P&L report) ─────────────────
  const netProfit   = plData.netProfit || 0;
  // Profit → Credit side | Loss → Debit side
  const plDebit     = netProfit < 0 ? Math.abs(netProfit) : 0;
  const plCredit    = netProfit > 0 ? netProfit : 0;
  const hasPL       = Math.abs(netProfit) > 0.005;

  // ── Tally-style totals + difference ───────────────────────────────────────
  const totalDebit  = (summary?.totalDebit  || 0) + plDebit;
  const totalCredit = (summary?.totalCredit || 0) + plCredit;
  const rawDiff     = totalDebit - totalCredit;
  const hasDiff     = Math.abs(rawDiff) > 0.005;
  const diffDebit   = rawDiff < 0 ? Math.abs(rawDiff) : 0;
  const diffCredit  = rawDiff > 0 ? Math.abs(rawDiff) : 0;
  const grandTotal  = Math.max(totalDebit, totalCredit);
  // ──────────────────────────────────────────────────────────────────────────

  const GroupNode = ({ group, depth = 0 }) => {
    const isExpanded = expandedGroups[group.groupName];
    const paddingLeft = depth * 1.5 + 0.5; // rem units

    return (
      <div key={group.groupName}>
        {/* Group Row */}
        <div
          className="grid grid-cols-12 bg-gray-50 p-2 hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-100"
          onClick={() => toggleGroup(group.groupName)}
        >
          <div
            className="col-span-4 flex items-center gap-2 font-semibold text-gray-800"
            style={{ paddingLeft: `${paddingLeft}rem` }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {group.groupName}
          </div>

          <div className="col-span-2 text-right text-gray-500">-</div>
          <div className="col-span-2 text-right font-semibold text-gray-600">
            {group.totalDebit > 0 ? formatCurrency(group.totalDebit) : ""}
          </div>
          <div className="col-span-2 text-right font-semibold text-gray-600">
            {group.totalCredit > 0 ? formatCurrency(group.totalCredit) : ""}
          </div>
          <div className="col-span-2 text-right text-gray-500 pr-4">-</div>
        </div>

        {/* Children (SubGroups and Ledgers) */}
        {isExpanded && (
          <div className="bg-white">
            {/* Render SubGroups */}
            {group.subGroups && Object.values(group.subGroups).map(subG => (
              <GroupNode key={subG.groupName} group={subG} depth={depth + 1} />
            ))}

            {/* Render Ledgers */}
            {group.ledgers && group.ledgers.map((ledger) => (
              <div
                key={ledger.ledgerId}
                className="grid grid-cols-12 p-2 border-b border-gray-50 hover:bg-blue-50 transition-colors"
              >
                <div
                  className="col-span-4 text-gray-700 truncate"
                  title={ledger.ledgerName}
                  style={{ paddingLeft: `${paddingLeft + 2}rem` }}
                >
                  {ledger.ledgerName}
                </div>

                <div className="col-span-2 text-right text-gray-600">
                  {ledger.openingDebit > 0
                    ? `${formatCurrency(ledger.openingDebit)} Dr`
                    : ledger.openingCredit > 0
                      ? `${formatCurrency(ledger.openingCredit)} Cr`
                      : "-"}
                </div>

                <div className="col-span-2 text-right text-gray-800">
                  {ledger.debit > 0 ? formatCurrency(ledger.debit) : ""}
                </div>
                <div className="col-span-2 text-right text-gray-800">
                  {ledger.credit > 0 ? formatCurrency(ledger.credit) : ""}
                </div>

                <div className="col-span-2 text-right font-semibold text-gray-900 pr-4">
                  {ledger.closingDebit > 0
                    ? `${formatCurrency(ledger.closingDebit)} Dr`
                    : ledger.closingCredit > 0
                      ? `${formatCurrency(ledger.closingCredit)} Cr`
                      : "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-mono text-sm print:bg-white print:p-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trial Balance</h1>
          <p className="text-gray-600">{companyName}</p>
        </div>
        <div className="flex gap-3">
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
        <h1 className="text-xl font-bold">{companyName}</h1>
        <h2 className="text-lg">Trial Balance</h2>
        <p className="text-sm">As on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Table Container */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 print:shadow-none print:border-none">

        {/* Table Header */}
        <div className="grid grid-cols-12 bg-blue-100 text-blue-900 font-bold p-3 border-b border-blue-200">
          <div className="col-span-4 pl-4">Particulars</div>
          <div className="col-span-2 text-right">Opening Balance</div>
          <div className="col-span-2 text-right">Debit</div>
          <div className="col-span-2 text-right">Credit</div>
          <div className="col-span-2 text-right pr-4">Closing Balance</div>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-100">
          {groupWise && Object.values(groupWise).map((group) => (
            <GroupNode key={group.groupName} group={group} depth={0} />
          ))}

          {/* ── PROFIT & LOSS ROW — like Tally ── */}
          {hasPL && (
            <div className="grid grid-cols-12 p-2 border-b border-gray-100 hover:bg-gray-50 text-gray-700">
              <div className="col-span-4 pl-4">Profit &amp; Loss</div>
              <div className="col-span-2 text-right">-</div>
              <div className="col-span-2 text-right font-medium">
                {plDebit > 0 ? formatCurrency(plDebit) : ""}
              </div>
              <div className="col-span-2 text-right font-medium">
                {plCredit > 0 ? formatCurrency(plCredit) : ""}
              </div>
              <div className="col-span-2 text-right pr-4">-</div>
            </div>
          )}

          {/* ── DIFFERENCE IN OPENING BALANCES — italic, last row, like Tally ── */}
          {hasDiff && (
            <div className="grid grid-cols-12 p-2 border-b border-gray-100 hover:bg-gray-50 italic text-gray-500">
              <div className="col-span-4 pl-4 font-bold text-gray-700">Difference in opening balances</div>
              <div className="col-span-2 text-right">-</div>
              <div className="col-span-2 text-right not-italic text-gray-700">
                {diffDebit > 0 ? formatCurrency(diffDebit) : ""}
              </div>
              <div className="col-span-2 text-right not-italic text-gray-700">
                {diffCredit > 0 ? formatCurrency(diffCredit) : ""}
              </div>
              <div className="col-span-2 text-right pr-4">-</div>
            </div>
          )}
        </div>

        {/* Footer / Grand Total — always equal on both sides like Tally */}
        <div className="grid grid-cols-12 bg-blue-100 text-blue-900 font-bold p-3 border-t border-blue-200">
          <div className="col-span-4 pl-4">Grand Total</div>
          <div className="col-span-2 text-right">-</div>
          <div className="col-span-2 text-right">{formatCurrency(grandTotal)}</div>
          <div className="col-span-2 text-right">{formatCurrency(grandTotal)}</div>
          <div className="col-span-2 text-right pr-4">-</div>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;
