import React from "react";
import { useState, useEffect, Fragment } from "react";
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  FileCode,
  Layers,
  DollarSign,
  PieChart,
  Search,
  ShoppingCart,
} from "lucide-react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

const API = import.meta.env.VITE_ACCOUNTING_URL;

const fmt = (n) =>
  "₹" +
  parseFloat(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtDate = (ds) => {
  try {
    return new Date(ds).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return ds || "";
  }
};
const getFY = (ds) => {
  const d = new Date(ds),
    m = d.getMonth(),
    y = d.getFullYear();
  return m >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};
const indMonth = (ds) => {
  const m = new Date(ds).getMonth();
  return m >= 3 ? m - 3 : m + 9;
};
const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];
const QUARTERS = [
  "Q1 (Apr–Jun)",
  "Q2 (Jul–Sep)",
  "Q3 (Oct–Dec)",
  "Q4 (Jan–Mar)",
];

const TYPE_COLORS = {
  B2B: "bg-blue-50 text-blue-700 border border-blue-200",
  B2CL: "bg-amber-50 text-amber-700 border border-amber-200",
  B2CS: "bg-[#ecfdf5] text-[#00a651] border border-[#c6f1d6]",
  EXPORT: "bg-purple-50 text-purple-700 border border-purple-200",
};

const TABS = ["All", "B2B", "B2CL", "B2CS", "HSN Summary", "Document Summary"];

export default function GSTR1() {
  const { companyId } = useAuth();
  const [tab, setTab] = useState("All");
  const [view, setView] = useState("monthly");
  const [fy, setFY] = useState("");
  const [search, setSearch] = useState("");
  const [collapsed, setCol] = useState({});
  const [data, setData] = useState([]);
  const [hsn, setHsn] = useState([]);
  const [docSum, setDocSum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params = fy ? `?fy=${fy}` : "";
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${API}/api/gstr1/${companyId}${params}`),
        axios.get(`${API}/api/gstr1/hsn/${companyId}${params}`),
        axios.get(`${API}/api/gstr1/doc-summary/${companyId}${params}`),
      ]);
      setData(r1.data.data || []);
      setHsn(r2.data.data || []);
      setDocSum(r3.data.data || null);
      setError(null);
    } catch (e) {
      setError("Failed to load GSTR-1 data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fy]);

  const fyList = [...new Set(data.map((v) => getFY(v.date)))].sort();
  useEffect(() => {
    if (!fy && fyList.length) setFY(fyList[fyList.length - 1]);
  }, [fyList.length]);

  const filtered = data.filter((v) => {
    const matchFY = !fy || getFY(v.date) === fy;
    const matchTab = tab === "All" || v.invoiceType === tab;
    const q = search.toLowerCase();
    const matchSrch =
      !q ||
      (v.customer || "").toLowerCase().includes(q) ||
      (v.invoiceNo || "").toString().toLowerCase().includes(q) ||
      (v.gstin || "").toLowerCase().includes(q);
    return matchFY && matchTab && matchSrch;
  });

  const sum = (k) => filtered.reduce((s, v) => s + parseFloat(v[k] || 0), 0);
  const toggle = (k) => setCol((p) => ({ ...p, [k]: !p[k] }));

  const grouped = {};
  filtered.forEach((v) => {
    const mi = indMonth(v.date);
    const key =
      view === "monthly"
        ? `${mi}__${MONTHS[mi]}`
        : `${Math.floor(mi / 3)}__${QUARTERS[Math.floor(mi / 3)]}`;
    (grouped[key] = grouped[key] || []).push(v);
  });
  const groups = Object.entries(grouped).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GSTR1.json";
    a.click();
  };
  const exportCSV = () => {
    const cols = [
      "invoiceNo",
      "date",
      "customer",
      "gstin",
      "placeOfSupply",
      "invoiceType",
      "subtotal",
      "cgst",
      "sgst",
      "igst",
      "gst_amount",
      "grand_total",
    ];
    const rows = [
      cols.join(","),
      ...filtered.map((v) => cols.map((c) => `"${v[c] || ""}"`).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GSTR1.csv";
    a.click();
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-[#00a651] border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">
          Loading GSTR-1 Data…
        </span>
      </div>
    );

  if (error)
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <p className="text-xs font-medium text-rose-700">{error}</p>
        <button
          onClick={fetchAll}
          className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex gap-1.5 items-center transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="bg-white border border-[#e2f2e9] rounded-2xl py-3 px-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border bg-blue-50 border-blue-200 text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="app-title text-base font-extrabold text-[#042f2e] tracking-tight">
                  GSTR-1 (Sales)
                </h2>
                <span className="text-[11px] font-bold text-[#00a651] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#c6f1d6]">
                  {fy ? `FY ${fy}` : "FY Active"}
                </span>
              </div>
              <p className="app-subtitle text-[11px] text-[#475569] font-medium">
                File outward supplies and sales returns from Sales Vouchers
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center print:hidden">
            <select
              value={fy}
              onChange={(e) => setFY(e.target.value)}
              className="h-9 min-w-30 border border-[#e2f2e9] text-[#042f2e] bg-white focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
            >
              {fyList.length === 0 ? (
                <option value="">FY 2023-24</option>
              ) : (
                fyList.map((f) => (
                  <option key={f} value={f}>
                    FY {f}
                  </option>
                ))
              )}
            </select>

            <div className="h-9 flex rounded-xl border border-[#e2f2e9] overflow-hidden bg-slate-50 p-0.5 text-xs items-center">
              {["monthly", "quarterly"].map((m) => (
                <button
                  key={m}
                  onClick={() => setView(m)}
                  className={`h-full px-2.5 py-1 capitalize font-bold rounded-lg transition-all cursor-pointer flex items-center ${view === m ? "bg-linear-to-r from-[#00a651] to-[#00c853] text-white shadow-2xs" : "text-[#475569] hover:text-[#042f2e]"}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={fetchAll}
              title="Refresh"
              className="h-9 bg-white hover:bg-slate-50 text-slate-700 border border-[#e2f2e9] rounded-xl px-3 py-1.5 text-xs font-semibold flex gap-1.5 items-center transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Refresh
            </button>
            <button
              onClick={exportJSON}
              className="h-9 bg-white hover:bg-slate-50 text-slate-700 border border-[#e2f2e9] rounded-xl px-3 py-1.5 text-xs font-semibold flex gap-1.5 items-center transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              JSON
            </button>
            <button
              onClick={exportCSV}
              className="h-9 bg-white hover:bg-slate-50 text-slate-700 border border-[#e2f2e9] rounded-xl px-3 py-1.5 text-xs font-semibold flex gap-1.5 items-center transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#00a651]" />
              CSV
            </button>
            <button
              onClick={() => window.print()}
              className="h-9 bg-linear-to-r from-[#00a651] to-[#00c853] hover:from-[#008c44] hover:to-[#00a651] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex gap-1.5 items-center shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {
            l: "Invoices",
            v: filtered.length,
            c: "text-[#042f2e]",
            bg: "bg-[#f8faf8] border-[#e2f2e9]",
            icon: <Layers className="w-4 h-4 text-[#475569]" />,
          },
          {
            l: "Taxable",
            v: fmt(sum("subtotal")),
            c: "text-blue-700",
            bg: "bg-blue-50/60 border-blue-200",
            icon: <DollarSign className="w-4 h-4 text-blue-600" />,
          },
          {
            l: "CGST",
            v: fmt(sum("cgst")),
            c: "text-[#00a651]",
            bg: "bg-[#f0fdf4] border-[#c6f1d6]",
            icon: <PieChart className="w-4 h-4 text-[#00a651]" />,
          },
          {
            l: "SGST",
            v: fmt(sum("sgst")),
            c: "text-[#00a651]",
            bg: "bg-[#f0fdf4] border-[#c6f1d6]",
            icon: <PieChart className="w-4 h-4 text-[#00a651]" />,
          },
          {
            l: "IGST",
            v: fmt(sum("igst")),
            c: "text-purple-700",
            bg: "bg-purple-50/60 border-purple-200",
            icon: <PieChart className="w-4 h-4 text-purple-600" />,
          },
        ].map((x) => (
          <div
            key={x.l}
            className="bg-white border border-[#e2f2e9] rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-[#475569] uppercase tracking-widest">
                {x.l}
              </p>
              <div className={`p-1.5 rounded-lg border ${x.bg}`}>{x.icon}</div>
            </div>
            <p className={`text-lg font-extrabold mt-1.5 ${x.c}`}>{x.v}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-[#e2f2e9] pb-2.5 overflow-x-auto print:hidden">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${tab === t ? "bg-linear-to-r from-[#00a651] to-[#00c853] text-white shadow-xs" : "bg-white text-[#475569] hover:text-[#042f2e] border border-[#e2f2e9] hover:bg-[#f0fdf4]/50"}`}
          >
            {t}
            {!["HSN Summary", "Document Summary"].includes(t) && (
              <span
                className={`ml-2 text-[11px] px-2 py-0.5 rounded-full font-bold ${tab === t ? "bg-white/20 text-white" : "bg-[#f0fdf4] text-[#00a651] border border-[#c6f1d6]"}`}
              >
                {t === "All"
                  ? filtered.length
                  : data.filter((v) => v.invoiceType === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {!["HSN Summary", "Document Summary"].includes(tab) && (
        <div className="relative print:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, invoice number, or GSTIN…"
            className="app-input w-full pl-9 pr-4 py-2 border border-[#e2f2e9] rounded-xl text-xs font-medium text-[#042f2e] bg-white placeholder-slate-400 focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] shadow-2xs"
          />
        </div>
      )}

      {tab === "HSN Summary" && (
        <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
          <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9] flex items-center justify-between">
            <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
              HSN Summary (from Sales Items)
            </h3>
            <span className="text-xs text-[#475569] font-medium">
              {hsn.length} HSN Codes
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                <tr className="text-left text-[#475569]">
                  {[
                    "HSN Code",
                    "GST Rate",
                    "Invoices",
                    "Total Qty",
                    "Taxable Value",
                    "CGST",
                    "SGST",
                    "IGST",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2f2e9] bg-white text-xs">
                {hsn.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-400 font-medium"
                    >
                      No HSN data for this period
                    </td>
                  </tr>
                ) : (
                  hsn.map((h, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                    >
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] font-mono font-bold text-[#042f2e]">
                        {h.hsn_code || "—"}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-center font-medium text-slate-700">
                        {parseFloat(h.gstRate || 0).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-center font-medium text-slate-700">
                        {h.invoiceCount}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-medium text-slate-700">
                        {parseFloat(h.totalQty || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e]">
                        {fmt(h.taxableValue)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                        {fmt(h.cgst)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                        {fmt(h.sgst)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-purple-700">
                        {fmt(h.igst)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Document Summary" && docSum && (
        <div className="bg-white border border-[#e2f2e9] rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="border-b border-[#e2f2e9] pb-2.5">
            <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
              Document Summary Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { l: "Total Invoices Issued", v: docSum.totalInvoices || 0 },
              { l: "From Invoice No.", v: docSum.fromInvoice || "—" },
              { l: "To Invoice No.", v: docSum.toInvoice || "—" },
              { l: "Cancelled Invoices", v: docSum.cancelledInvoices || 0 },
              { l: "Debit Notes", v: docSum.debitNotes || 0 },
              { l: "Credit Notes", v: docSum.creditNotes || 0 },
            ].map((x) => (
              <div
                key={x.l}
                className="border border-[#e2f2e9] rounded-xl p-3.5 bg-[#f8faf8]"
              >
                <p className="text-[11px] font-extrabold text-[#475569] uppercase tracking-widest">
                  {x.l}
                </p>
                <p className="text-lg font-extrabold text-[#042f2e] mt-1">
                  {x.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!["HSN Summary", "Document Summary"].includes(tab) && (
        <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9] sticky top-0">
                <tr className="text-left text-[#475569]">
                  {[
                    "",
                    "Invoice No",
                    "Date",
                    "Customer / GSTIN",
                    "Type",
                    "Place of Supply",
                    "Taxable",
                    "CGST",
                    "SGST",
                    "IGST",
                    "GST Total",
                    "Grand Total",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-2.5 px-3 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2f2e9] bg-white">
                {groups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-8 text-center text-slate-400 font-medium"
                    >
                      No invoices found for this period / filter
                    </td>
                  </tr>
                ) : (
                  groups.map(([key, rows]) => {
                    const label = key.split("__")[1];
                    const isOpen = !collapsed[key];
                    const gSub = rows.reduce(
                      (s, v) => s + parseFloat(v.subtotal || 0),
                      0,
                    );
                    const gCGST = rows.reduce(
                      (s, v) => s + parseFloat(v.cgst || 0),
                      0,
                    );
                    const gSGST = rows.reduce(
                      (s, v) => s + parseFloat(v.sgst || 0),
                      0,
                    );
                    const gIGST = rows.reduce(
                      (s, v) => s + parseFloat(v.igst || 0),
                      0,
                    );
                    const gGST = rows.reduce(
                      (s, v) => s + parseFloat(v.gst_amount || 0),
                      0,
                    );
                    const gTot = rows.reduce(
                      (s, v) => s + parseFloat(v.grand_total || 0),
                      0,
                    );
                    return (
                      <Fragment key={key}>
                        <tr
                          className="bg-[#f0fdf4] hover:bg-[#c6f1d6]/50 cursor-pointer border-b border-[#e2f2e9] transition-colors"
                          onClick={() => toggle(key)}
                        >
                          <td
                            className="py-2.5 px-3 border-r border-[#e2f2e9]"
                            colSpan={5}
                          >
                            <span className="flex items-center gap-2 font-bold text-[#042f2e]">
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-[#00a651]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                              {label}
                              <span className="text-[11px] bg-[#ecfdf5] text-[#00a651] border border-[#c6f1d6] px-2 py-0.5 rounded-full font-semibold">
                                {rows.length} inv
                              </span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e2f2e9]" />
                          <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e]">
                            {fmt(gSub)}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                            {fmt(gCGST)}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                            {fmt(gSGST)}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-bold text-purple-700">
                            {fmt(gIGST)}
                          </td>
                          <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e]">
                            {fmt(gGST)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#00a651]">
                            {fmt(gTot)}
                          </td>
                        </tr>
                        {isOpen &&
                          rows.map((v) => (
                            <tr
                              key={v.id}
                              className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                            >
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-[#475569] text-[11px]">
                                #{v.id}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] font-mono text-xs font-bold text-[#042f2e] whitespace-nowrap">
                                {v.invoiceNo ||
                                  `INV-${String(v.id).padStart(4, "0")}`}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-[#475569] font-medium whitespace-nowrap">
                                {fmtDate(v.date)}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9]">
                                <p className="font-bold text-[#042f2e] text-[13px]">
                                  {v.customer}
                                </p>
                                {v.gstin && (
                                  <p className="text-[11px] font-mono text-[#475569] mt-0.5">
                                    {v.gstin}
                                  </p>
                                )}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9]">
                                <span
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[v.invoiceType] || "bg-slate-100 text-slate-700 border border-slate-200"}`}
                                >
                                  {v.invoiceType || "B2CS"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-[#475569] font-medium">
                                {v.placeOfSupply || "—"}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-medium text-[#042f2e] whitespace-nowrap">
                                {fmt(v.subtotal)}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-semibold text-[#00a651] whitespace-nowrap">
                                {fmt(v.cgst)}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-semibold text-[#00a651] whitespace-nowrap">
                                {fmt(v.sgst)}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-semibold text-purple-700 whitespace-nowrap">
                                {fmt(v.igst)}
                              </td>
                              <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-medium text-[#475569] whitespace-nowrap">
                                {fmt(v.gst_amount)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#042f2e] whitespace-nowrap">
                                {fmt(v.grand_total)}
                              </td>
                            </tr>
                          ))}
                        {isOpen && (
                          <tr className="bg-[#f0fdf4] border-b-2 border-[#00a651]">
                            <td
                              colSpan={6}
                              className="py-2 px-3 border-r border-[#e2f2e9] text-right text-xs font-extrabold text-[#00a651] uppercase tracking-wide"
                            >
                              {label} Total
                            </td>
                            <td className="py-2 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e]">
                              {fmt(gSub)}
                            </td>
                            <td className="py-2 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                              {fmt(gCGST)}
                            </td>
                            <td className="py-2 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                              {fmt(gSGST)}
                            </td>
                            <td className="py-2 px-3 border-r border-[#e2f2e9] text-right font-bold text-purple-700">
                              {fmt(gIGST)}
                            </td>
                            <td className="py-2 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e]">
                              {fmt(gGST)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-[#00a651]">
                              {fmt(gTot)}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
                <tr className="bg-[#f0fdf4] text-[#042f2e] font-extrabold border-t-2 border-[#00a651]">
                  <td
                    colSpan={6}
                    className="py-3 px-3 text-right text-xs uppercase tracking-widest border-r border-[#e2f2e9] text-[#042f2e]"
                  >
                    Grand Total ({filtered.length} Invoices)
                  </td>
                  <td className="py-3 px-3 text-right border-r border-[#e2f2e9]">
                    {fmt(sum("subtotal"))}
                  </td>
                  <td className="py-3 px-3 text-right text-[#00a651] border-r border-[#e2f2e9]">
                    {fmt(sum("cgst"))}
                  </td>
                  <td className="py-3 px-3 text-right text-[#00a651] border-r border-[#e2f2e9]">
                    {fmt(sum("sgst"))}
                  </td>
                  <td className="py-3 px-3 text-right text-purple-700 border-r border-[#e2f2e9]">
                    {fmt(sum("igst"))}
                  </td>
                  <td className="py-3 px-3 text-right border-r border-[#e2f2e9]">
                    {fmt(sum("gst_amount"))}
                  </td>
                  <td className="py-3 px-3 text-right text-[#00a651]">
                    {fmt(sum("grand_total"))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
