import React from "react";

import { useState, useEffect } from "react";
import { Download, Printer, Filter, Search, FileText, ArrowUp, ArrowDown } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";

const DayBook = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [voucherType, setVoucherType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [entries, setEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  const { companyId } = useAuth();

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/daybook/${companyId}`,
        );

        let cleaned = res.data.map((e) => ({
          ...e,
          debit: parseFloat(e.debit) || 0,
          credit: parseFloat(e.credit) || 0,
          ledger: e.ledger || "-",
          narration: e.narration || "",
        }));

        cleaned.sort((a, b) => new Date(a.date) - new Date(b.date));

        setAllEntries(cleaned);

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const format = (d) => d.toLocaleDateString("en-CA");

        setFromDate(format(yesterday));
        setToDate(format(today));

        const todayEntries = cleaned.filter((entry) => entry.date === today);
        setEntries(todayEntries);
      } catch (err) {
        console.log("DayBook Error:", err);
      }
    };

    fetchData();
  }, [companyId]);

  useEffect(() => {
    if (!fromDate || !toDate || allEntries.length === 0) return;

    const filteredEntries = allEntries.filter((e) => {
      const entryDate = new Date(e.date).toISOString().split("T")[0];
      const start = fromDate;
      const end = toDate;

      const matchDate = entryDate >= start && entryDate <= end;
      const matchType = voucherType === "All" || e.voucher === voucherType;

      const q = searchQuery.toLowerCase();

      return (
        matchDate &&
        matchType &&
        (String(e.ledger).toLowerCase().includes(q) ||
          String(e.narration).toLowerCase().includes(q) ||
          String(e.voucher).toLowerCase().includes(q))
      );
    });

    setEntries(filteredEntries);
  }, [fromDate, toDate, voucherType, searchQuery, allEntries]);

  if (!fromDate || !toDate) {
    return (
      <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans flex items-center justify-center">
        <p className="text-center text-slate-500 font-semibold text-sm">
          Loading vouchers...
        </p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    if (dateA !== dateB) {
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    }
    return sortOrder === "desc"
      ? Number(b.id || 0) - Number(a.id || 0)
      : Number(a.id || 0) - Number(b.id || 0);
  });

  const totalDebit = sortedEntries.reduce((a, b) => a + b.debit, 0);
  const totalCredit = sortedEntries.reduce((a, b) => a + b.credit, 0);
  const closingBalance = totalDebit - totalCredit;

  const getVoucherColor = (v) => {
    const colors = {
      Sales: "text-emerald-700 bg-emerald-50 border-emerald-200",
      Purchase: "text-blue-700 bg-blue-50 border-blue-200",
      Receipt: "text-teal-700 bg-teal-50 border-teal-200",
      Payment: "text-rose-700 bg-rose-50 border-rose-200",
      Journal: "text-purple-700 bg-purple-50 border-purple-200",
      Contra: "text-amber-700 bg-amber-50 border-amber-200",
      Default: "text-slate-600 bg-slate-50 border-slate-200",
    };
    return colors[v] || colors.Default;
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleExport = () => {
    const csv = [
      ["Date", "Voucher", "No", "Ledger", "Narration", "Debit", "Credit"],
      ...sortedEntries.map((e) => [
        formatDate(e.date),
        e.voucher,
        e.number,
        e.ledger,
        e.narration,
        e.debit,
        e.credit,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `DayBook_${getTodayDate()}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const Filters = () => (
    <div className="p-6 border-b border-[#e2f2e9] bg-[#f8faf8]/60 no-print transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-1.5">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="app-input w-full border-[#c8ddcd] rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium transition-all"
          />
        </div>
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-1.5">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="app-input w-full border-[#c8ddcd] rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-1.5">
            Voucher Type
          </label>
          <select
            value={voucherType}
            onChange={(e) => setVoucherType(e.target.value)}
            className="app-input w-full border-[#c8ddcd] rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium transition-all"
          >
            <option value="All">All Types</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
            <option value="Receipt">Receipt</option>
            <option value="Payment">Payment</option>
            <option value="Journal">Journal</option>
            <option value="Contra">Contra</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-1.5">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search ledger or narration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="app-input w-full pl-9 border-[#c8ddcd] rounded-xl py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
        @media print {
            body * {
                visibility: hidden;
            }
            #daybook-print-area, #daybook-print-area * {
                visibility: visible;
            }
            #daybook-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: none !important;
                box-shadow: none !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `}
      </style>

      <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
        <div
          id="daybook-print-area"
          className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white"
        >
          <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
            <div>
              <h2 className="app-title text-xl font-extrabold text-[#042f2e]">
                Day Book
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {fromDate === toDate
                  ? `Date: ${formatDate(fromDate)} (Today)`
                  : "Showing Todays Report"}
              </p>
            </div>

            <div className="flex items-center gap-3 no-print">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 h-10 rounded-xl border transition-all text-sm font-semibold cursor-pointer active:scale-[0.98] ${
                  showFilters
                    ? "bg-emerald-50 text-[#00a651] border-[#c6f1d6]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 h-10 rounded-xl border border-emerald-200 transition-colors text-sm font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Download size={16} />
                <span>Export</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 h-10 rounded-xl border border-slate-200 transition-colors text-sm font-semibold cursor-pointer active:scale-[0.98]"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {showFilters && <Filters />}

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                <tr className="text-left text-slate-700">
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-center w-12">
                    #
                  </th>
                  <th
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] cursor-pointer select-none hover:bg-emerald-100/50 transition-colors"
                    title="Click to toggle sort order"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {sortOrder === "desc" ? (
                        <ArrowDown size={14} className="text-[#00a651]" />
                      ) : (
                        <ArrowUp size={14} className="text-[#00a651]" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Voucher
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    No
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Ledger
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Narration
                  </th>
                  <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Debit
                  </th>
                  <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e2f2e9]">
                {sortedEntries.length > 0 ? (
                  sortedEntries.map((e, idx) => (
                    <tr
                      key={e.id}
                      className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                    >
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-center text-[#475569] text-[13px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px] whitespace-nowrap">
                        {formatDate(e.date)}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9]">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] border rounded ${getVoucherColor(
                            e.voucher,
                          )}`}
                        >
                          {e.voucher}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-700 text-[13px] font-mono">
                        {e.number}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px]">
                        {e.ledger}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px] max-w-xs truncate" title={e.narration}>
                        {e.narration || "-"}
                      </td>
                      <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-semibold text-slate-800 text-[13px] font-mono">
                        {e.debit ? `₹${e.debit}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800 text-[13px] font-mono">
                        {e.credit ? `₹${e.credit}` : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-14 text-center">
                      <FileText size={32} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-[14px] font-medium text-slate-600">
                        No vouchers found for selected criteria
                      </p>
                      <p className="text-[13px] mt-1 text-slate-400">
                        Try adjusting your date range or filter criteria.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="bg-[#f0fdf4]/40 font-bold border-t border-[#e2f2e9]">
                  <td colSpan="6" className="py-3 px-4 border-r border-[#e2f2e9] text-right text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Total:
                  </td>
                  <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-bold text-slate-900 text-[13px] font-mono">
                    ₹{totalDebit}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-[13px] font-mono">
                    ₹{totalCredit}
                  </td>
                </tr>

                <tr className="bg-[#ecfdf5]/80 font-extrabold text-[#00a651] border-t-2 border-[#00a651]/30">
                  <td colSpan="6" className="py-3.5 px-4 border-r border-[#e2f2e9] text-right text-xs uppercase tracking-widest font-extrabold text-[#042f2e]">
                    Closing Balance:
                  </td>
                  <td colSpan="2" className="py-3.5 px-4 text-right font-bold text-emerald-700 text-sm font-mono">
                    {closingBalance >= 0 ? "₹" : "-₹"}
                    {Math.abs(closingBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DayBook;


