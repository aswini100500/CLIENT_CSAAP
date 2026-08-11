import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  Printer,
  Scale,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import useAuth from "../../../hooks/useAuth";

const TrialBalance = () => {
  const { companyId, companyName } = useAuth();
  const [data, setData] = useState({ groupWise: {}, summary: {} });
  const [plData, setPlData] = useState({ netProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (companyId) {
      fetchTrialBalance();
    }
  }, [companyId]);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);

      const [tbRes, plRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/trial-balance/get-Trail-balance/${companyId}`,
        ),
        axios
          .get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/profit-loss/${companyId}`,
          )
          .catch(() => null),
      ]);

      if (tbRes.data.success) {
        setData(tbRes.data);
        const extractAllGroupNames = (groupsObj) => {
          let names = {};
          Object.values(groupsObj).forEach((g) => {
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
        const rawIncome = plRes.data.income || [];
        const rawExpenses = plRes.data.expenses || [];

        const totalIncome = rawIncome.reduce(
          (s, i) => s + (Number(i.amount) || 0),
          0,
        );
        const totalExpenses = rawExpenses.reduce(
          (s, e) => s + (Number(e.amount) || 0),
          0,
        );
        const netProfit = totalIncome - totalExpenses;

        setPlData({ netProfit, totalIncome, totalExpenses });
      }
    } catch (err) {
      console.error("Error fetching TB", err);
    } finally {
      setLoading(false);
    }
  };

  const { groupWise, summary } = data;

  const handleExpandAll = () => {
    const extractAllGroupNames = (groupsObj) => {
      let names = {};
      Object.values(groupsObj || {}).forEach((g) => {
        names[g.groupName] = true;
        if (g.subGroups) {
          names = { ...names, ...extractAllGroupNames(g.subGroups) };
        }
      });
      return names;
    };
    if (groupWise) {
      setExpandedGroups(extractAllGroupNames(groupWise));
    }
  };

  const handleCollapseAll = () => {
    setExpandedGroups({});
  };

  const matchesSearch = (group, term) => {
    if (!term) return true;
    const lowerTerm = term.toLowerCase();
    if (group.groupName.toLowerCase().includes(lowerTerm)) return true;

    if (
      group.ledgers &&
      group.ledgers.some((l) => l.ledgerName.toLowerCase().includes(lowerTerm))
    ) {
      return true;
    }

    if (group.subGroups) {
      return Object.values(group.subGroups).some((subG) =>
        matchesSearch(subG, term),
      );
    }

    return false;
  };

  const handleExportExcel = () => {
    if (!groupWise) return;
    const exportData = [];

    const traverseGroup = (group, depth) => {
      const indent = "  ".repeat(depth);

      exportData.push({
        Particulars: `${indent}${group.groupName.toUpperCase()}`,
        "Opening Balance": "",
        Debit: group.totalDebit || "",
        Credit: group.totalCredit || "",
        "Closing Balance": "",
      });

      if (group.subGroups) {
        Object.values(group.subGroups).forEach((subG) =>
          traverseGroup(subG, depth + 1),
        );
      }

      if (group.ledgers) {
        group.ledgers.forEach((l) => {
          exportData.push({
            Particulars: `${indent}  ${l.ledgerName}`,
            "Opening Balance":
              l.openingDebit > 0
                ? `${l.openingDebit} Dr`
                : l.openingCredit > 0
                  ? `${l.openingCredit} Cr`
                  : "0.00",
            Debit: l.debit || "",
            Credit: l.credit || "",
            "Closing Balance":
              l.closingDebit > 0
                ? `${l.closingDebit} Dr`
                : l.closingCredit > 0
                  ? `${l.closingCredit} Cr`
                  : "0.00",
          });
        });
      }
    };

    Object.values(groupWise).forEach((group) => {
      traverseGroup(group, 0);
    });

    exportData.push({});
    exportData.push({
      Particulars: "GRAND TOTAL",
      "Opening Balance": "",
      Debit: summary.totalDebit,
      Credit: summary.totalCredit,
      "Closing Balance":
        Math.abs(summary.difference) < 1
          ? "BALANCED"
          : `DIFF: ${summary.difference}`,
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
        "",
      ]);

      if (group.subGroups) {
        Object.values(group.subGroups).forEach((subG) =>
          traverseGroup(subG, depth + 1),
        );
      }
      if (group.ledgers) {
        group.ledgers.forEach((l) => {
          rows.push([
            `${indent}  ${l.ledgerName}`,
            l.openingDebit > 0
              ? `${formatCurrency(l.openingDebit)} Dr`
              : l.openingCredit > 0
                ? `${formatCurrency(l.openingCredit)} Cr`
                : "0.00",
            l.debit ? formatCurrency(l.debit) : "",
            l.credit ? formatCurrency(l.credit) : "",
            l.closingDebit > 0
              ? `${formatCurrency(l.closingDebit)} Dr`
              : l.closingCredit > 0
                ? `${formatCurrency(l.closingCredit)} Cr`
                : "0.00",
          ]);
        });
      }
    };

    if (groupWise) {
      Object.values(groupWise).forEach((group) => {
        traverseGroup(group, 0);
      });
    }

    rows.push([
      "GRAND TOTAL",
      "",
      formatCurrency(summary?.totalDebit || 0),
      formatCurrency(summary?.totalCredit || 0),
      Math.abs(summary?.difference || 0) < 1
        ? "BALANCED"
        : `DIFF: ${formatCurrency(summary?.difference)}`,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Particulars",
          "Opening Balance",
          "Debit",
          "Credit",
          "Closing Balance",
        ],
      ],
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
      maximumFractionDigits: 2,
    }).format(amount || 0);
    return `₹${formatted}`;
  };

  const netProfit = plData.netProfit || 0;
  const plDebit = netProfit < 0 ? Math.abs(netProfit) : 0;
  const plCredit = netProfit > 0 ? netProfit : 0;
  const hasPL = Math.abs(netProfit) > 0.005;

  const totalDebit = (summary?.totalDebit || 0) + plDebit;
  const totalCredit = (summary?.totalCredit || 0) + plCredit;
  const rawDiff = totalDebit - totalCredit;
  const hasDiff = Math.abs(rawDiff) > 0.005;
  const diffDebit = rawDiff < 0 ? Math.abs(rawDiff) : 0;
  const diffCredit = rawDiff > 0 ? Math.abs(rawDiff) : 0;
  const grandTotal = Math.max(totalDebit, totalCredit);

  const GroupNode = ({ group, depth = 0 }) => {
    if (searchTerm && !matchesSearch(group, searchTerm)) {
      return null;
    }

    const isExpanded = searchTerm ? true : !!expandedGroups[group.groupName];
    const paddingLeft = depth * 1.5 + 0.75;

    return (
      <div key={group.groupName}>
        <div
          className="grid grid-cols-12 bg-slate-50/80 hover:bg-slate-100/80 p-2.5 cursor-pointer transition-colors border-b border-(--border-soft) items-center"
          onClick={() => toggleGroup(group.groupName)}
        >
          <div
            className="col-span-4 flex items-center gap-2 font-bold text-(--text-strong) text-[13px]"
            style={{ paddingLeft: `${paddingLeft}rem` }}
          >
            {isExpanded ? (
              <ChevronDown size={15} className="text-(--brand) shrink-0" />
            ) : (
              <ChevronRight size={15} className="text-(--text-soft) shrink-0" />
            )}
            <span className="truncate">{group.groupName}</span>
          </div>

          <div className="col-span-2 text-right text-gray-400 font-mono text-[12px]">
            -
          </div>
          <div className="col-span-2 text-right font-bold text-(--text-strong) tabular-nums text-[13px]">
            {group.totalDebit > 0 ? formatCurrency(group.totalDebit) : ""}
          </div>
          <div className="col-span-2 text-right font-bold text-(--text-strong) tabular-nums text-[13px]">
            {group.totalCredit > 0 ? formatCurrency(group.totalCredit) : ""}
          </div>
          <div className="col-span-2 text-right text-gray-400 pr-4 font-mono text-[12px]">
            -
          </div>
        </div>

        {isExpanded && (
          <div className="bg-white">
            {group.subGroups &&
              Object.values(group.subGroups).map((subG) => (
                <GroupNode
                  key={subG.groupName}
                  group={subG}
                  depth={depth + 1}
                />
              ))}

            {group.ledgers &&
              group.ledgers.map((ledger) => {
                if (
                  searchTerm &&
                  !ledger.ledgerName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                ) {
                  return null;
                }
                return (
                  <div
                    key={ledger.ledgerId}
                    className="grid grid-cols-12 p-2.5 border-b border-slate-100 hover:bg-(--bg-subtle)/60 transition-colors items-center text-[13px]"
                  >
                    <div
                      className="col-span-4 text-(--text-body) font-medium truncate"
                      title={ledger.ledgerName}
                      style={{ paddingLeft: `${paddingLeft + 1.75}rem` }}
                    >
                      {ledger.ledgerName}
                    </div>

                    <div className="col-span-2 text-right text-(--text-soft) font-medium tabular-nums">
                      {ledger.openingDebit > 0 ? (
                        <span className="inline-flex items-center gap-1 justify-end">
                          {formatCurrency(ledger.openingDebit)}
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 uppercase">
                            Dr
                          </span>
                        </span>
                      ) : ledger.openingCredit > 0 ? (
                        <span className="inline-flex items-center gap-1 justify-end">
                          {formatCurrency(ledger.openingCredit)}
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200 uppercase">
                            Cr
                          </span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </div>

                    <div className="col-span-2 text-right text-(--text-strong) font-semibold tabular-nums">
                      {ledger.debit > 0 ? formatCurrency(ledger.debit) : ""}
                    </div>
                    <div className="col-span-2 text-right text-(--text-strong) font-semibold tabular-nums">
                      {ledger.credit > 0 ? formatCurrency(ledger.credit) : ""}
                    </div>

                    <div className="col-span-2 text-right font-bold text-(--text-strong) pr-4 tabular-nums">
                      {ledger.closingDebit > 0 ? (
                        <span className="inline-flex items-center gap-1 justify-end">
                          {formatCurrency(ledger.closingDebit)}
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 uppercase">
                            Dr
                          </span>
                        </span>
                      ) : ledger.closingCredit > 0 ? (
                        <span className="inline-flex items-center gap-1 justify-end">
                          {formatCurrency(ledger.closingCredit)}
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200 uppercase">
                            Cr
                          </span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="erp-root app-shell min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-(--text-soft)">
          <Loader2 className="size-6 animate-spin text-(--brand)" />
          <span className="text-[14px] font-semibold">
            Loading Trial Balance...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-root app-shell min-h-screen p-4 md:p-6 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="app-panel p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
          <div>
            <h1 className="app-title">Trial Balance</h1>
            <p className="app-subtitle mt-0.5">
              {companyName || "Company Accounting"} • As on{" "}
              {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="app-btn-secondary flex items-center gap-2 min-h-9 px-3 text-[13px]"
            >
              <Printer size={15} className="text-(--text-soft)" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="app-btn-secondary flex items-center gap-2 min-h-9 px-3 text-[13px]"
            >
              <FileText size={15} className="text-rose-600" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="app-btn-primary flex items-center gap-2 min-h-9 px-3 text-[13px]"
            >
              <FileSpreadsheet size={15} className="text-white" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="hidden print:block text-center mb-6">
          <h1 className="text-xl font-bold">{companyName}</h1>
          <h2 className="text-lg font-semibold text-gray-700">
            Trial Balance Report
          </h2>
          <p className="text-sm text-gray-500">
            As on {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="app-panel p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search group or ledger..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="app-input w-full pl-9 pr-8 py-1.5 text-[13px]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) size-4" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExpandAll}
              className="app-btn-secondary flex items-center gap-1.5 min-h-8 px-2.5 text-[12px]"
            >
              <Maximize2 size={13} className="text-(--text-soft)" />
              <span>Expand All</span>
            </button>
            <button
              onClick={handleCollapseAll}
              className="app-btn-secondary flex items-center gap-1.5 min-h-8 px-2.5 text-[12px]"
            >
              <Minimize2 size={13} className="text-(--text-soft)" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>

        <div className="app-panel overflow-hidden print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 bg-(--bg-subtle)/70 text-(--text-soft) font-extrabold text-[11px] uppercase tracking-widest p-3 border-b border-(--border-soft) min-w-3xl">
              <div className="col-span-4 pl-4">Particulars</div>
              <div className="col-span-2 text-right">Opening Balance</div>
              <div className="col-span-2 text-right">Debit</div>
              <div className="col-span-2 text-right">Credit</div>
              <div className="col-span-2 text-right pr-4">Closing Balance</div>
            </div>

            <div className="divide-y divide-(--border-soft) min-w-3xl">
              {groupWise &&
                Object.values(groupWise).map((group) => (
                  <GroupNode key={group.groupName} group={group} depth={0} />
                ))}

              {hasPL && (
                <div className="grid grid-cols-12 p-3 bg-sky-50/50 hover:bg-sky-50 border-b border-sky-100 text-sky-900 transition-colors items-center">
                  <div className="col-span-4 pl-4 font-bold flex items-center gap-2 text-[13px]">
                    <DollarSign className="size-4 text-sky-600 shrink-0" />
                    Profit &amp; Loss
                  </div>
                  <div className="col-span-2 text-right text-gray-400 font-mono text-[12px]">
                    -
                  </div>
                  <div className="col-span-2 text-right font-bold tabular-nums text-sky-800 text-[13px]">
                    {plDebit > 0 ? formatCurrency(plDebit) : ""}
                  </div>
                  <div className="col-span-2 text-right font-bold tabular-nums text-sky-800 text-[13px]">
                    {plCredit > 0 ? formatCurrency(plCredit) : ""}
                  </div>
                  <div className="col-span-2 text-right text-gray-400 pr-4 font-mono text-[12px]">
                    -
                  </div>
                </div>
              )}

              {hasDiff && (
                <div className="grid grid-cols-12 p-3 bg-amber-50/60 hover:bg-amber-50 border-b border-amber-100 italic text-amber-900 transition-colors items-center">
                  <div className="col-span-4 pl-4 font-bold text-amber-950 flex items-center gap-2 text-[13px]">
                    <AlertCircle className="size-4 text-amber-600 shrink-0 not-italic" />
                    Difference in opening balances
                  </div>
                  <div className="col-span-2 text-right text-gray-400 font-mono text-[12px]">
                    -
                  </div>
                  <div className="col-span-2 text-right not-italic font-bold tabular-nums text-amber-800 text-[13px]">
                    {diffDebit > 0 ? formatCurrency(diffDebit) : ""}
                  </div>
                  <div className="col-span-2 text-right not-italic font-bold tabular-nums text-amber-800 text-[13px]">
                    {diffCredit > 0 ? formatCurrency(diffCredit) : ""}
                  </div>
                  <div className="col-span-2 text-right text-gray-400 pr-4 font-mono text-[12px]">
                    -
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-12 bg-(--bg-subtle) text-(--text-strong) font-extrabold p-3.5 border-t border-(--border-strong) text-[13.5px] min-w-3xl items-center">
              <div className="col-span-4 pl-4 flex items-center gap-2 uppercase tracking-wide">
                <Scale className="size-4 text-(--brand)" />
                Grand Total
              </div>
              <div className="col-span-2 text-right text-gray-400 font-mono text-[12px]">
                -
              </div>
              <div className="col-span-2 text-right tabular-nums text-emerald-700 font-black">
                {formatCurrency(grandTotal)}
              </div>
              <div className="col-span-2 text-right tabular-nums text-emerald-700 font-black">
                {formatCurrency(grandTotal)}
              </div>
              <div className="col-span-2 text-right pr-4 text-gray-400 font-mono text-[12px]">
                -
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;
