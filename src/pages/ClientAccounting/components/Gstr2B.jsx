import React from "react";
import { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  DollarSign,
  ShoppingBag,
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

const STATUS = {
  MATCHED: {
    label: "Matched",
    cls: "bg-[#ecfdf5] text-[#00a651] border border-[#c6f1d6]",
    Icon: CheckCircle2,
  },
  PARTIAL: {
    label: "Partial",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    Icon: AlertCircle,
  },
  MISSING_IN_PORTAL: {
    label: "Missing in Portal",
    cls: "bg-sky-50 text-sky-700 border border-sky-200",
    Icon: HelpCircle,
  },
  MISMATCH: {
    label: "Mismatch",
    cls: "bg-rose-50 text-rose-700 border border-rose-200",
    Icon: AlertCircle,
  },
};

const TABS = [
  "ITC Available",
  "ITC Unavailable",
  "Supplier-wise",
  "All Purchases",
];

export default function Gstr2B() {
  const { companyId } = useAuth();
  const [tab, setTab] = useState("All Purchases");
  const [fy, setFY] = useState("");
  const [month, setMonth] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [supply, setSupply] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const q = month ? `?month=${month}` : fy ? `?fy=${fy}` : "";
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${API}/api/gstr2b/${companyId}${q}`),
        axios.get(`${API}/api/gstr2b/summary/${companyId}${q}`),
        axios.get(`${API}/api/gstr2b/supplier/${companyId}${q}`),
      ]);
      setData(r1.data.data || []);
      setSummary(r2.data.data || null);
      setSupply(r3.data.data || []);
      setError(null);
    } catch (e) {
      setError("Failed to load GSTR-2B data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fy, month]);
  const fyList = [...new Set(data.map((v) => getFY(v.date)))].sort();
  useEffect(() => {
    if (!fy && fyList.length) setFY(fyList[fyList.length - 1]);
  }, [fyList.length]);

  const q = search.toLowerCase();
  const filtered = data.filter((v) => {
    const matchTab =
      tab === "All Purchases"
        ? true
        : tab === "ITC Available"
          ? v.matchStatus === "MATCHED" || v.matchStatus === "PARTIAL"
          : tab === "ITC Unavailable"
            ? v.matchStatus === "MISSING_IN_PORTAL" ||
              v.matchStatus === "MISMATCH"
            : true;
    const matchSrch =
      !q ||
      (v.supplierName || "").toLowerCase().includes(q) ||
      (v.supplierGSTIN || "").toLowerCase().includes(q) ||
      (v.supplierInvoiceNo || "").toLowerCase().includes(q);
    return matchTab && matchSrch;
  });

  const exportCSV = () => {
    const cols = [
      "supplierName",
      "supplierGSTIN",
      "supplierInvoiceNo",
      "date",
      "subtotal",
      "cgst",
      "sgst",
      "igst",
      "eligibleITC",
      "matchStatus",
    ];
    const rows = [
      cols.join(","),
      ...filtered.map((v) => cols.map((c) => `"${v[c] || ""}"`).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GSTR2B.csv";
    a.click();
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-[#00a651] border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">
          Loading GSTR-2B Data…
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
    <div className="space-y-4">
      <div className="bg-white border border-[#e2f2e9] rounded-2xl py-3 px-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="app-title text-base font-extrabold text-[#042f2e] tracking-tight">
                  GSTR-2B (ITC Reconciliation)
                </h2>
                <span className="text-[11px] font-bold text-[#00a651] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#c6f1d6]">
                  Auto-generated
                </span>
              </div>
              <p className="app-subtitle text-[11px] text-[#475569] font-medium">
                View auto-populated purchase returns & ITC reconciliation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={fy}
              onChange={(e) => {
                setFY(e.target.value);
                setMonth("");
              }}
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

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-9 border border-[#e2f2e9] text-[#042f2e] bg-white focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl px-3 py-1 text-xs font-semibold shadow-2xs"
            />

            <button
              onClick={fetchAll}
              title="Refresh"
              className="h-9 bg-white hover:bg-slate-50 text-slate-700 border border-[#e2f2e9] rounded-xl px-3 py-1.5 text-xs font-semibold flex gap-1.5 items-center transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Refresh
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

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              l: "Total Invoices",
              v: summary.totalInvoices || 0,
              c: "text-[#042f2e]",
              bg: "bg-[#f8faf8] border-[#e2f2e9]",
              icon: <Layers className="w-4 h-4 text-[#475569]" />,
            },
            {
              l: "Total ITC",
              v: fmt(summary.totalITC),
              c: "text-indigo-700",
              bg: "bg-indigo-50/60 border-indigo-200",
              icon: <DollarSign className="w-4 h-4 text-indigo-600" />,
            },
            {
              l: "Eligible ITC",
              v: fmt(summary.eligibleITC),
              c: "text-[#00a651]",
              bg: "bg-[#f0fdf4] border-[#c6f1d6]",
              icon: <ShieldCheck className="w-4 h-4 text-[#00a651]" />,
            },
            {
              l: "Ineligible ITC",
              v: fmt(summary.ineligibleITC),
              c: "text-rose-700",
              bg: "bg-rose-50/60 border-rose-200",
              icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
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
                <div className={`p-1.5 rounded-lg border ${x.bg}`}>
                  {x.icon}
                </div>
              </div>
              <p className={`text-lg font-extrabold mt-1.5 ${x.c}`}>{x.v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-[#e2f2e9] pb-2.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${tab === t ? "bg-linear-to-r from-[#00a651] to-[#00c853] text-white shadow-xs" : "bg-white text-[#475569] hover:text-[#042f2e] border border-[#e2f2e9] hover:bg-[#f0fdf4]/50"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search supplier, GSTIN, or invoice number…"
          className="app-input w-full pl-9 pr-4 py-2 border border-[#e2f2e9] rounded-xl text-xs font-medium text-[#042f2e] bg-white placeholder-slate-400 focus:outline-none focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] shadow-2xs"
        />
      </div>

      {tab === "Supplier-wise" && (
        <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
          <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9] flex items-center justify-between">
            <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
              Supplier-wise ITC Summary
            </h3>
            <span className="text-xs text-[#475569] font-medium">
              {supply.length} Suppliers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                <tr>
                  {[
                    "Supplier",
                    "GSTIN",
                    "Invoices",
                    "Taxable",
                    "CGST",
                    "SGST",
                    "IGST",
                    "Total ITC",
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
              <tbody className="divide-y divide-[#e2f2e9] bg-white">
                {supply.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-400 font-medium"
                    >
                      No supplier data available
                    </td>
                  </tr>
                ) : (
                  supply.map((s, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                    >
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] font-bold text-[#042f2e]">
                        {s.supplierName}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] font-mono text-[11px] text-[#475569]">
                        {s.supplierGSTIN || "—"}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-center font-medium text-slate-700">
                        {s.invoiceCount}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e]">
                        {fmt(s.taxableValue)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                        {fmt(s.cgst)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#00a651]">
                        {fmt(s.sgst)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-purple-700">
                        {fmt(s.igst)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-[#00a651]">
                        {fmt(s.totalITC)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab !== "Supplier-wise" && (
        <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9] sticky top-0">
                <tr>
                  {[
                    "Supplier / GSTIN",
                    "Supplier Inv No",
                    "Date",
                    "Place of Supply",
                    "Taxable",
                    "CGST",
                    "SGST",
                    "IGST",
                    "Eligible ITC",
                    "Status",
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
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-slate-400 font-medium"
                    >
                      No purchase records found for this period
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => {
                    const st = STATUS[v.matchStatus] || STATUS.MATCHED;
                    const StatusIcon = st.Icon;
                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                      >
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9]">
                          <p className="font-bold text-[#042f2e] text-[13px]">
                            {v.supplierName}
                          </p>
                          {v.supplierGSTIN && (
                            <p className="text-[11px] font-mono text-[#475569] mt-0.5">
                              {v.supplierGSTIN}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] font-mono text-xs font-bold text-[#042f2e] whitespace-nowrap">
                          {v.supplierInvoiceNo || "—"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-[#475569] font-medium whitespace-nowrap">
                          {fmtDate(v.date)}
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
                        <td className="py-2.5 px-3 border-r border-[#e2f2e9] text-right font-bold text-[#00a651] whitespace-nowrap">
                          {fmt(v.eligibleITC)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1.5 w-fit ${st.cls}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
                {filtered.length > 0 && (
                  <tr className="bg-[#f0fdf4] text-[#042f2e] font-extrabold border-t-2 border-[#00a651]">
                    <td
                      colSpan={4}
                      className="py-3 px-3 text-right text-xs uppercase tracking-widest border-r border-[#e2f2e9] text-[#042f2e]"
                    >
                      Total ({filtered.length} Invoices)
                    </td>
                    <td className="py-3 px-3 text-right border-r border-[#e2f2e9]">
                      {fmt(
                        filtered.reduce(
                          (s, v) => s + parseFloat(v.subtotal || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-[#00a651] border-r border-[#e2f2e9]">
                      {fmt(
                        filtered.reduce(
                          (s, v) => s + parseFloat(v.cgst || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-[#00a651] border-r border-[#e2f2e9]">
                      {fmt(
                        filtered.reduce(
                          (s, v) => s + parseFloat(v.sgst || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-purple-700 border-r border-[#e2f2e9]">
                      {fmt(
                        filtered.reduce(
                          (s, v) => s + parseFloat(v.igst || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-[#00a651] border-r border-[#e2f2e9]">
                      {fmt(
                        filtered.reduce(
                          (s, v) => s + parseFloat(v.eligibleITC || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
