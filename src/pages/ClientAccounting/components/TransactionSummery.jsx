import React from "react";

import { useState, useEffect } from "react";
import { Calendar, Filter, FileText, Download, ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

const TransactionSummery = () => {
  const { companyId } = useAuth();

  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  const [selectedType, setSelectedType] = useState("All");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");

  const transactionTypes = [
    "All",
    "Payment",
    "Sales",
    "Purchase",
    "Contra",
    "Journal",
    "Receipt",
  ];

  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/daybook/${companyId}`,
        );

        let cleaned = res.data.map((e) => ({
          ...e,
          voucher: String(e.voucher)
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase()),

          debit: parseFloat(e.debit) || 0,
          credit: parseFloat(e.credit) || 0,
          ledger: e.ledger || "Unknown Ledger",
          narration: e.narration || "",
        }));

        cleaned.sort((a, b) => new Date(a.date) - new Date(b.date));

        setEntries(cleaned);

        if (cleaned.length > 0) {
          const dates = cleaned.map((e) =>
            new Date(e.date).toISOString().slice(0, 10),
          );

          setDateRange({
            from: dates[0],
            to: dates[dates.length - 1],
          });
        }

        setLoading(false);
      } catch (err) {
        console.log("Transaction Summary Error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans flex items-center justify-center">
        <p className="text-center text-slate-500 font-semibold text-sm">
          Loading Transactions...
        </p>
      </div>
    );
  }

  const filteredData = entries.filter((row) => {
    const date = new Date(row.date).getTime();
    const from = new Date(dateRange.from).getTime();
    const to = new Date(dateRange.to).getTime();

    const matchDate = date >= from && date <= to;
    const matchType =
      selectedType === "All" ||
      row.voucher.toLowerCase() === selectedType.toLowerCase();

    return matchDate && matchType;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    if (dateA !== dateB) {
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    }
    return sortOrder === "desc"
      ? Number(b.id || 0) - Number(a.id || 0)
      : Number(a.id || 0) - Number(b.id || 0);
  });

  const totalDebit = sortedData.reduce((a, b) => a + b.debit, 0);
  const totalCredit = sortedData.reduce((a, b) => a + b.credit, 0);

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

  const handleExport = () => {
    const csv = [
      ["Date", "Voucher", "Ledger", "Debit", "Credit"],
      ...sortedData.map((e) => [
        new Date(e.date).toLocaleDateString("en-IN"),
        e.voucher,
        e.ledger,
        e.debit,
        e.credit,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transaction-summary.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 erp-root font-sans">
      <div className="max-w-7xl mx-auto app-panel overflow-hidden border border-[#e2f2e9] bg-white flex flex-col md:flex-row min-h-[calc(100vh-120px)]">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#e2f2e9] p-5 shrink-0 overflow-y-auto">
          <h2 className="font-extrabold text-base mb-4 text-[#042f2e] flex items-center gap-2 border-b border-[#e2f2e9] pb-3">
            <Filter size={16} className="text-[#00a651]" /> Filters
          </h2>

          <div className="mb-6">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-2">
              Date Range
            </h3>
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="app-input w-full border-[#c8ddcd] rounded-xl px-3 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="app-input w-full border-[#c8ddcd] rounded-xl px-3 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] font-medium transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-2">
              Voucher Type
            </h3>
            <div className="space-y-1">
              {transactionTypes.map((type) => (
                <div
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-2 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between font-semibold border ${
                    selectedType === type
                      ? "bg-[#ecfdf5] text-[#00a651] border-[#c6f1d6] shadow-2xs font-bold"
                      : "text-slate-600 hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex flex-wrap justify-between items-center app-section-bar py-5 px-6 border-b border-[#e2f2e9] gap-4 bg-white">
            <div>
              <h1 className="app-title text-xl font-extrabold text-[#042f2e] flex items-center gap-2">
                <FileText size={20} className="text-[#00a651]" /> Transaction Summary
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Period: <span className="font-semibold text-slate-700">{dateRange.from}</span> to <span className="font-semibold text-slate-700">{dateRange.to}</span>
              </p>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 h-9 rounded-xl border border-emerald-200 transition-colors text-xs font-semibold cursor-pointer active:scale-[0.98]"
            >
              <Download size={14} /> Export
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="border border-[#e2f2e9] rounded-2xl overflow-hidden bg-white shadow-2xs">
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
                      Voucher Type
                    </th>
                    <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Ledger
                    </th>
                    <th className="py-3 px-4 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Debit (Dr)
                    </th>
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Credit (Cr)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e2f2e9]">
                  {sortedData.length > 0 ? (
                    sortedData.map((row, index) => (
                      <tr
                        key={index}
                        className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                      >
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-center text-[#475569] text-[13px]">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-slate-600 text-[13px] whitespace-nowrap">
                          {new Date(row.date).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9]">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 text-[11px] border rounded ${getVoucherColor(
                              row.voucher,
                            )}`}
                          >
                            {row.voucher}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9] font-bold text-[#042f2e] text-[13px]">
                          {row.ledger}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e2f2e9] text-right font-semibold text-emerald-700 text-[13px] font-mono">
                          {row.debit !== 0 ? `₹${row.debit.toLocaleString()}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-rose-700 text-[13px] font-mono">
                          {row.credit !== 0 ? `₹${row.credit.toLocaleString()}` : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-14 text-center text-slate-500" colSpan="6">
                        <FileText size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-[14px] font-medium text-slate-600">
                          No transactions found
                        </p>
                        <p className="text-[13px] mt-1 text-slate-400">
                          Try selecting a different date range or voucher type.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="bg-[#f0fdf4]/40 border-t-2 border-[#e2f2e9] flex justify-end items-center px-6 py-3 text-sm font-bold gap-8">
                <span className="text-emerald-700 font-mono">
                  Total Debit: ₹{totalDebit.toLocaleString()}
                </span>
                <span className="text-rose-700 font-mono">
                  Total Credit: ₹{totalCredit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummery;

