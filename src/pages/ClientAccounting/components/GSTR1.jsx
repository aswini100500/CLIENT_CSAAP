import React, { useState, useEffect, Fragment } from "react";
import {
  HiChevronDown,
  HiChevronRight,
  HiRefresh,
  HiDownload,
  HiSearch,
} from "react-icons/hi";
import { Printer } from "lucide-react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";

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
  B2B: "bg-blue-100 text-blue-800",
  B2CL: "bg-orange-100 text-orange-800",
  B2CS: "bg-green-100 text-green-800",
  EXPORT: "bg-purple-100 text-purple-800",
};

const TABS = ["All", "B2B", "B2CL", "B2CS", "HSN Summary", "Document Summary"];

export default function GSTR1() {
  const { companyId } = useCompany();
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-500">Loading GSTR-1…</span>
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex justify-between">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchAll}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 items-center"
        >
          <HiRefresh />
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="bg-linear-to-r from-green-700 to-green-500 rounded-xl p-5 text-white print:bg-green-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">GSTR-1 — Outward Supplies</h2>
            <p className="text-green-100 text-sm">
              Dynamically generated from Sales Vouchers · FY {fy || "—"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center print:hidden">
            <select
              value={fy}
              onChange={(e) => setFY(e.target.value)}
              className="bg-white/20 text-white border border-white/40 rounded-lg px-3 py-1.5 text-sm"
            >
              {fyList.map((f) => (
                <option key={f} value={f} className="text-gray-800">
                  FY {f}
                </option>
              ))}
            </select>
            <div className="flex rounded-lg border border-white/40 overflow-hidden text-sm">
              {["monthly", "quarterly"].map((m) => (
                <button
                  key={m}
                  onClick={() => setView(m)}
                  className={`px-3 py-1.5 capitalize font-medium ${view === m ? "bg-white text-green-700" : "text-white hover:bg-white/20"}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={fetchAll}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"
            >
              <HiRefresh className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportJSON}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"
            >
              <HiDownload className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={exportCSV}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"
            >
              <HiDownload className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => window.print()}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Invoices", v: filtered.length, c: "gray", num: true },
          { l: "Taxable", v: fmt(sum("subtotal")), c: "blue", num: false },
          { l: "CGST", v: fmt(sum("cgst")), c: "green", num: false },
          { l: "SGST", v: fmt(sum("sgst")), c: "green", num: false },
          { l: "IGST", v: fmt(sum("igst")), c: "purple", num: false },
        ].map((x) => (
          <div
            key={x.l}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {x.l}
            </p>
            <p className={`text-xl font-bold mt-1 text-${x.c}-700`}>{x.v}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto print:hidden">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {t}
            {!["HSN Summary", "Document Summary"].includes(t) && (
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
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
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, invoice no, GSTIN…"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}

      {tab === "HSN Summary" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              HSN Summary (from Sales Items)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
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
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hsn.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No HSN data for this period
                    </td>
                  </tr>
                ) : (
                  hsn.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono font-semibold text-gray-800">
                        {h.hsn_code || "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {parseFloat(h.gstRate || 0).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-center">
                        {h.invoiceCount}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {parseFloat(h.totalQty || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {fmt(h.taxableValue)}
                      </td>
                      <td className="px-4 py-2 text-right text-green-700">
                        {fmt(h.cgst)}
                      </td>
                      <td className="px-4 py-2 text-right text-green-700">
                        {fmt(h.sgst)}
                      </td>
                      <td className="px-4 py-2 text-right text-purple-700">
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
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Document Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                className="border border-gray-100 rounded-lg p-4 bg-gray-50"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {x.l}
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!["HSN Summary", "Document Summary"].includes(tab) && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
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
                      className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center text-gray-400"
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
                          className="bg-indigo-50 cursor-pointer hover:bg-indigo-100"
                          onClick={() => toggle(key)}
                        >
                          <td className="px-3 py-2.5" colSpan={5}>
                            <span className="flex items-center gap-2 font-semibold text-indigo-800">
                              {isOpen ? (
                                <HiChevronDown className="w-4 h-4" />
                              ) : (
                                <HiChevronRight className="w-4 h-4" />
                              )}
                              {label}
                              <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
                                {rows.length} inv
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5 text-right font-semibold text-indigo-800">
                            {fmt(gSub)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-indigo-800">
                            {fmt(gCGST)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-indigo-800">
                            {fmt(gSGST)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-indigo-800">
                            {fmt(gIGST)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-indigo-800">
                            {fmt(gGST)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-indigo-800">
                            {fmt(gTot)}
                          </td>
                        </tr>
                        {isOpen &&
                          rows.map((v) => (
                            <tr
                              key={v.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-3 py-2.5 text-gray-400 text-xs">
                                #{v.id}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-xs font-medium text-gray-700 whitespace-nowrap">
                                {v.invoiceNo ||
                                  `INV-${String(v.id).padStart(4, "0")}`}
                              </td>
                              <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                                {fmtDate(v.date)}
                              </td>
                              <td className="px-3 py-2.5">
                                <p className="font-medium text-gray-900">
                                  {v.customer}
                                </p>
                                {v.gstin && (
                                  <p className="text-xs font-mono text-gray-400">
                                    {v.gstin}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[v.invoiceType] || "bg-gray-100 text-gray-700"}`}
                                >
                                  {v.invoiceType || "B2CS"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-xs text-gray-500">
                                {v.placeOfSupply || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-right font-medium text-gray-900 whitespace-nowrap">
                                {fmt(v.subtotal)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-green-700 whitespace-nowrap">
                                {fmt(v.cgst)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-green-700 whitespace-nowrap">
                                {fmt(v.sgst)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-purple-700 whitespace-nowrap">
                                {fmt(v.igst)}
                              </td>
                              <td className="px-3 py-2.5 text-right text-gray-600 whitespace-nowrap">
                                {fmt(v.gst_amount)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                                {fmt(v.grand_total)}
                              </td>
                            </tr>
                          ))}
                        {isOpen && (
                          <tr className="bg-green-50 border-b-2 border-green-200">
                            <td
                              colSpan={6}
                              className="px-3 py-1.5 text-right text-xs font-semibold text-green-700 uppercase"
                            >
                              {label} Total
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-green-800">
                              {fmt(gSub)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-green-800">
                              {fmt(gCGST)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-green-800">
                              {fmt(gSGST)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-green-800">
                              {fmt(gIGST)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-green-800">
                              {fmt(gGST)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-green-800">
                              {fmt(gTot)}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
                <tr className="bg-gray-900 text-white">
                  <td
                    colSpan={6}
                    className="px-3 py-3 text-right text-xs font-bold uppercase tracking-widest"
                  >
                    Grand Total ({filtered.length} invoices)
                  </td>
                  <td className="px-3 py-3 text-right font-bold">
                    {fmt(sum("subtotal"))}
                  </td>
                  <td className="px-3 py-3 text-right font-bold">
                    {fmt(sum("cgst"))}
                  </td>
                  <td className="px-3 py-3 text-right font-bold">
                    {fmt(sum("sgst"))}
                  </td>
                  <td className="px-3 py-3 text-right font-bold">
                    {fmt(sum("igst"))}
                  </td>
                  <td className="px-3 py-3 text-right font-bold">
                    {fmt(sum("gst_amount"))}
                  </td>
                  <td className="px-3 py-3 text-right font-bold">
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
