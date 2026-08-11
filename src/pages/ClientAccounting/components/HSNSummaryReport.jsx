import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  Search,
  FileText,
} from "lucide-react";

const API = import.meta.env.VITE_ACCOUNTING_URL;

const fmt = (n) =>
  "₹" +
  parseFloat(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtNum = (n) =>
  parseFloat(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MONTH_OPTIONS = [
  { value: "", label: "All Months" },
  { value: "01", label: "01 - January" },
  { value: "02", label: "02 - February" },
  { value: "03", label: "03 - March" },
  { value: "04", label: "04 - April" },
  { value: "05", label: "05 - May" },
  { value: "06", label: "06 - June" },
  { value: "07", label: "07 - July" },
  { value: "08", label: "08 - August" },
  { value: "09", label: "09 - September" },
  { value: "10", label: "10 - October" },
  { value: "11", label: "11 - November" },
  { value: "12", label: "12 - December" },
];

const YEAR_OPTIONS = ["", "2027", "2026", "2025", "2024", "2023"];

export default function HSNSummaryReport({ onBack }) {
  const { companyId } = useAuth();
  const now = new Date();
  const defaultYear = now.getFullYear().toString();
  const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      let url = `${API}/api/v1/hsn-summary/${companyId}`;
      const params = [];
      if (selectedYear) params.push(`year=${selectedYear}`);
      if (selectedMonth) params.push(`month=${selectedMonth}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setData(res.data.data || []);
      } else {
        setError(res.data.message || "Failed to load HSN summary");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, selectedYear, selectedMonth]);

  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.hsn_code || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  });

  const totals = filteredData.reduce(
    (acc, cur) => ({
      totalQty: acc.totalQty + parseFloat(cur.totalQty || 0),
      taxableValue: acc.taxableValue + parseFloat(cur.taxableValue || 0),
      igst: acc.igst + parseFloat(cur.igst || 0),
      cgst: acc.cgst + parseFloat(cur.cgst || 0),
      sgst: acc.sgst + parseFloat(cur.sgst || 0),
    }),
    { totalQty: 0, taxableValue: 0, igst: 0, cgst: 0, sgst: 0 }
  );

  const totalTax = totals.igst + totals.cgst + totals.sgst;
  const totalAmount = totals.taxableValue + totalTax;

  const handleExportExcel = () => {
    const periodTag = `${selectedMonth || "All"}_${selectedYear || "All"}`;
    const rows = filteredData.map((item, idx) => {
      const taxable = parseFloat(item.taxableValue || 0);
      const cgst = parseFloat(item.cgst || 0);
      const sgst = parseFloat(item.sgst || 0);
      const igst = parseFloat(item.igst || 0);
      const taxAmt = cgst + sgst + igst;
      return {
        "S.No": idx + 1,
        "HSN/SAC Code": item.hsn_code || "—",
        Description: item.description || "—",
        UQC: item.uqc || "—",
        "Total Quantity": parseFloat(item.totalQty || 0),
        "GST Rate (%)": parseFloat(item.gstRate || 0),
        "Taxable Value (₹)": taxable,
        "IGST (₹)": igst,
        "CGST (₹)": cgst,
        "SGST/UTGST (₹)": sgst,
        "Total Tax (₹)": taxAmt,
        "Total Amount (₹)": taxable + taxAmt,
      };
    });

    rows.push({
      "S.No": "TOTAL",
      "HSN/SAC Code": "",
      Description: "",
      UQC: "",
      "Total Quantity": totals.totalQty,
      "GST Rate (%)": "",
      "Taxable Value (₹)": totals.taxableValue,
      "IGST (₹)": totals.igst,
      "CGST (₹)": totals.cgst,
      "SGST/UTGST (₹)": totals.sgst,
      "Total Tax (₹)": totalTax,
      "Total Amount (₹)": totalAmount,
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HSN_Summary");
    XLSX.writeFile(wb, `HSN_Summary_Report_${periodTag}.xlsx`);
  };

  const handleExportPDF = (isPrint = false) => {
    const doc = new jsPDF({ orientation: "landscape" });
    const periodTag = `${selectedMonth || "All"}/${selectedYear || "All"}`;

    doc.setFontSize(14);
    doc.text(`HSN/SAC Summary Report (${periodTag})`, 14, 15);

    const tableHead = [
      [
        "S.No",
        "HSN/SAC",
        "Description",
        "UQC",
        "Qty",
        "Rate (%)",
        "Taxable Value",
        "IGST",
        "CGST",
        "SGST/UTGST",
        "Tax Amount",
        "Total Amount",
      ],
    ];

    const tableBody = filteredData.map((item, index) => {
      const taxable = parseFloat(item.taxableValue || 0);
      const cgst = parseFloat(item.cgst || 0);
      const sgst = parseFloat(item.sgst || 0);
      const igst = parseFloat(item.igst || 0);
      const taxAmt = cgst + sgst + igst;
      const totalAmt = taxable + taxAmt;

      return [
        index + 1,
        item.hsn_code || "—",
        item.description || "—",
        item.uqc || "—",
        fmtNum(item.totalQty),
        `${parseFloat(item.gstRate || 0)}%`,
        fmtNum(taxable),
        fmtNum(igst),
        fmtNum(cgst),
        fmtNum(sgst),
        fmtNum(taxAmt),
        fmtNum(totalAmt),
      ];
    });

    tableBody.push([
      "Total",
      "",
      "",
      "",
      fmtNum(totals.totalQty),
      "",
      fmtNum(totals.taxableValue),
      fmtNum(totals.igst),
      fmtNum(totals.cgst),
      fmtNum(totals.sgst),
      fmtNum(totalTax),
      fmtNum(totalAmount),
    ]);

    autoTable(doc, {
      startY: 22,
      head: tableHead,
      body: tableBody,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 166, 81] },
      footStyles: { fillColor: [240, 240, 240], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 24 },
        2: { cellWidth: 40 },
        3: { cellWidth: 16 },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: 18, halign: "right" },
        6: { cellWidth: 28, halign: "right" },
        7: { cellWidth: 22, halign: "right" },
        8: { cellWidth: 22, halign: "right" },
        9: { cellWidth: 24, halign: "right" },
        10: { cellWidth: 26, halign: "right" },
        11: { cellWidth: 28, halign: "right" },
      },
    });

    if (isPrint) {
      const blobURL = doc.output("bloburl");
      const printWindow = window.open(blobURL);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } else {
      doc.save(`HSN_Summary_Report_${periodTag}.pdf`);
    }
  };

  if (loading) {
    return (
      <div className="erp-root app-shell flex flex-col justify-center items-center h-64 gap-3 bg-[#f8faf8] rounded-2xl border border-[#e2f2e9]">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-[#00a651] border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">
          Loading HSN/SAC Summary Data…
        </span>
      </div>
    );
  }

  return (
    <div className="erp-root app-shell min-h-screen p-6 font-sans space-y-5">
      {/* Top Navigation & Header */}
      <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl border border-[#e2f2e9] text-[#475569] hover:bg-[#f0fdf4] hover:text-[#00a651] transition-all cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="size-5" />
              </button>
            )}
            <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
              <FileText className="size-6 text-[#00a651]" />
            </div>
            <div>
              <h1 className="app-title text-xl font-extrabold text-[#042f2e]">
                HSN/SAC Summary Report
              </h1>
              <p className="app-subtitle text-xs md:text-sm text-[#475569] font-medium mt-0.5">
                Summary of outward supplies grouped by HSN/SAC code & tax rate from Sales Vouchers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap no-print">
            <button
              onClick={fetchData}
              className="h-10 px-4 app-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-4" /> Refresh
            </button>
            <button
              onClick={() => handleExportPDF(true)}
              className="h-10 px-4 app-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="size-4" /> Print
            </button>
            <button
              onClick={handleExportExcel}
              className="h-10 px-4 text-xs font-bold text-[#00a651] bg-[#f0fdf4] border border-[#c6f1d6] rounded-xl hover:bg-[#00a651] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="size-4" /> Excel
            </button>
            <button
              onClick={() => handleExportPDF(false)}
              className="h-10 px-4 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="size-4" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl p-4 shadow-2xs no-print">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="app-input h-10 border border-[#e2f2e9] rounded-xl text-xs font-medium text-slate-900 bg-white px-3 outline-none cursor-pointer"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y || "All Years"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="app-input h-10 border border-[#e2f2e9] rounded-xl text-xs font-medium text-slate-900 bg-white px-3 outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] size-4" />
            <input
              type="text"
              placeholder="Search HSN code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input w-full pl-10 pr-4 h-10 border border-[#e2f2e9] rounded-xl text-xs font-medium text-slate-900 bg-white placeholder-[#94a3b8] focus:border-[#00a651] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8faf8] border-b border-[#e2f2e9]">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-12">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  HSN / SAC
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  UQC
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Total Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  GST Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Taxable Value (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  IGST (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  CGST (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SGST/UTGST (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Total Tax (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Total Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2f2e9] bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const taxable = parseFloat(row.taxableValue || 0);
                  const cgst = parseFloat(row.cgst || 0);
                  const sgst = parseFloat(row.sgst || 0);
                  const igst = parseFloat(row.igst || 0);
                  const taxAmt = cgst + sgst + igst;
                  const totalAmt = taxable + taxAmt;

                  return (
                    <tr
                      key={row.hsn_code || idx}
                      className="hover:bg-[#f0fdf4]/50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                        {row.hsn_code || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">
                        {row.description || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-slate-800">
                        {row.uqc || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                        {fmtNum(row.totalQty)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                        {parseFloat(row.gstRate || 0)}%
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-semibold text-slate-900">
                        {fmt(taxable)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-purple-700">
                        {fmt(igst)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                        {fmt(cgst)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-slate-800">
                        {fmt(sgst)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-semibold text-emerald-700">
                        {fmt(taxAmt)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-bold text-[#00a651]">
                        {fmt(totalAmt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12" className="px-4 py-12 text-center text-[#94a3b8]">
                    <p className="text-sm font-bold text-slate-700">
                      No HSN summary records found
                    </p>
                    <p className="text-xs mt-1 text-slate-500 font-medium">
                      Select another period or issue Sales Vouchers with HSN items.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot className="bg-[#f8faf8] border-t-2 border-[#e2f2e9] font-bold text-slate-900">
                <tr>
                  <td colSpan="4" className="px-4 py-3.5 text-right text-xs uppercase tracking-wider">
                    Total
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm">{fmtNum(totals.totalQty)}</td>
                  <td className="px-4 py-3.5 text-right text-sm">—</td>
                  <td className="px-4 py-3.5 text-right text-sm">{fmt(totals.taxableValue)}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-purple-700">{fmt(totals.igst)}</td>
                  <td className="px-4 py-3.5 text-right text-sm">{fmt(totals.cgst)}</td>
                  <td className="px-4 py-3.5 text-right text-sm">{fmt(totals.sgst)}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-emerald-700">{fmt(totalTax)}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-[#00a651]">{fmt(totalAmount)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
