import React from "react";
import { useState, useEffect } from "react";
import {
  RefreshCw,
  Printer,
  FileCode,
  Calculator,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
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

const Row = ({ label, taxable, cgst, sgst, igst, total, bold, light }) => (
  <tr
    className={`border-b border-[#e2f2e9] transition-colors duration-200 ${bold ? "bg-[#f0fdf4]/50 font-bold hover:bg-[#f0fdf4]" : light ? "bg-[#f0fdf4]/30 hover:bg-[#f0fdf4]/60" : "hover:bg-[#f0fdf4]/20"}`}
  >
    <td
      className={`py-2.5 px-3.5 border-r border-[#e2f2e9] ${bold ? "font-bold text-[#042f2e]" : "font-medium text-[#475569]"}`}
    >
      {label}
    </td>
    <td
      className={`py-2.5 px-3.5 border-r border-[#e2f2e9] text-right ${bold ? "text-blue-700 font-bold" : "text-blue-600 font-medium"}`}
    >
      {taxable != null ? fmt(taxable) : "—"}
    </td>
    <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-medium text-[#00a651]">
      {fmt(cgst)}
    </td>
    <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-medium text-[#00a651]">
      {fmt(sgst)}
    </td>
    <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-medium text-purple-700">
      {fmt(igst)}
    </td>
    <td
      className={`py-2.5 px-3.5 text-right ${bold ? "text-[#042f2e] font-bold" : "text-slate-800 font-semibold"}`}
    >
      {fmt(total)}
    </td>
  </tr>
);

const fyList_from = (months) => {
  const fy = new Set();
  (months || []).forEach((m) => {
    const [y, mo] = m.month.split("-").map(Number);
    fy.add(mo >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`);
  });
  return [...fy].sort();
};

export default function GSTR3B() {
  const { companyId } = useAuth();
  const [fy, setFY] = useState("");
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [tab, setTab] = useState("summary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const q = month ? `?month=${month}` : fy ? `?fy=${fy}` : "";
      const [r1, r2] = await Promise.all([
        axios.get(`${API}/api/gstr3b/${companyId}${q}`),
        axios.get(
          `${API}/api/gstr3b/monthly/${companyId}${fy ? `?fy=${fy}` : ""}`,
        ),
      ]);
      setData(r1.data.data || null);
      setMonthly(r2.data.data || []);
      setError(null);
    } catch (e) {
      setError("Failed to load GSTR-3B data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fy, month]);

  const fyOptions = fyList_from(monthly);
  useEffect(() => {
    if (!fy && fyOptions.length) setFY(fyOptions[fyOptions.length - 1]);
  }, [fyOptions.length]);

  const exportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GSTR3B.json";
    a.click();
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-[#00a651] border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">
          Calculating GSTR-3B Summary…
        </span>
      </div>
    );

  if (error)
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <p className="text-xs font-medium text-rose-700">{error}</p>
        <button
          onClick={fetchAll}
          className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );

  const o = data?.outward || {};
  const itc = data?.itc || {};
  const pay = data?.payment || {};

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="bg-white border border-[#e2f2e9] rounded-2xl py-3 px-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border bg-purple-50 border-purple-200 text-purple-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="app-title text-base font-extrabold text-[#042f2e] tracking-tight">
                  GSTR-3B (Monthly Summary)
                </h2>
                <span className="text-[11px] font-bold text-[#00a651] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#c6f1d6]">
                  Auto-calculated
                </span>
              </div>
              <p className="app-subtitle text-[11px] text-[#475569] font-medium">
                Monthly summary return from Sales (Output Tax) & Purchases (ITC)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center print:hidden">
            <select
              value={fy}
              onChange={(e) => {
                setFY(e.target.value);
                setMonth("");
              }}
              className="h-9 min-w-30 border border-[#e2f2e9] text-[#042f2e] bg-white focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
            >
              {fyOptions.length === 0 ? (
                <option value="">FY 2023-24</option>
              ) : (
                fyOptions.map((f) => (
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
              onClick={exportJSON}
              className="h-9 bg-white hover:bg-slate-50 text-slate-700 border border-[#e2f2e9] rounded-xl px-3 py-1.5 text-xs font-semibold flex gap-1.5 items-center transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              JSON
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            l: "Output Tax",
            v: fmt(pay.outputCGST + pay.outputSGST + pay.outputIGST),
            c: "text-purple-700",
            bg: "bg-purple-50/60 border-purple-200",
            icon: <Calculator className="w-4 h-4 text-purple-600" />,
          },
          {
            l: "ITC Available",
            v: fmt(itc.eligibleITC),
            c: "text-[#00a651]",
            bg: "bg-[#f0fdf4] border-[#c6f1d6]",
            icon: <ShieldCheck className="w-4 h-4 text-[#00a651]" />,
          },
          {
            l: "Net Tax Payable",
            v: fmt(pay.netTaxTotal),
            c: pay.netTaxTotal > 0 ? "text-rose-700" : "text-[#00a651]",
            bg:
              pay.netTaxTotal > 0
                ? "bg-rose-50/60 border-rose-200"
                : "bg-[#f0fdf4] border-[#c6f1d6]",
            icon: <DollarSign className="w-4 h-4 text-slate-600" />,
          },
          {
            l: "Carry Forward",
            v: fmt(
              (pay.carryForwardCGST || 0) +
                (pay.carryForwardSGST || 0) +
                (pay.carryForwardIGST || 0),
            ),
            c: "text-blue-700",
            bg: "bg-blue-50/60 border-blue-200",
            icon: <ArrowUpRight className="w-4 h-4 text-blue-600" />,
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

      <div className="flex items-center gap-2 border-b border-[#e2f2e9] pb-2.5 print:hidden">
        {[
          ["summary", "3B Summary"],
          ["monthly", "Month Comparison"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${tab === v ? "bg-linear-to-r from-[#00a651] to-[#00c853] text-white shadow-xs" : "bg-white text-[#475569] hover:text-[#042f2e] border border-[#e2f2e9] hover:bg-[#f0fdf4]/50"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="space-y-4">
          <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
            <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="text-purple-600 w-4 h-4" />
                <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
                  3.1 Outward Supplies (from Sales Vouchers)
                </h3>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {o.totalInvoices || 0} Invoices
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse bg-white">
                <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                  <tr>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-left w-2/5">
                      Nature
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-blue-600 text-right">
                      Taxable Value (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      CGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      SGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      IGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Total Tax (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9] bg-white">
                  <Row
                    label="Taxable Outward Supplies"
                    taxable={o.taxableValue}
                    cgst={o.cgst}
                    sgst={o.sgst}
                    igst={o.igst}
                    total={o.totalOutputTax}
                    bold
                  />
                  <Row
                    label="Interstate Supplies"
                    taxable={o.interstateTaxable}
                    cgst={0}
                    sgst={0}
                    igst={o.igstOnInterstate}
                    total={o.igstOnInterstate}
                  />
                  <Row
                    label="Nil / Exempt Supplies"
                    taxable={o.nilRatedValue}
                    cgst={0}
                    sgst={0}
                    igst={0}
                    total={0}
                  />
                </tbody>
              </table>
            </div>
          </div>

          <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
            <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="text-[#00a651] w-4 h-4" />
                <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
                  4. Eligible ITC (from Purchase Vouchers)
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#00a651] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#c6f1d6]">
                {itc.totalPurchases || 0} Purchases
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse bg-white">
                <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                  <tr>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-left w-2/5">
                      ITC Type
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-blue-600 text-right">
                      Taxable Value (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      CGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      SGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      IGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Total (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9] bg-white">
                  <Row
                    label="Total ITC (all purchases)"
                    taxable={itc.purchaseTaxableValue}
                    cgst={itc.itcCGST}
                    sgst={itc.itcSGST}
                    igst={itc.itcIGST}
                    total={itc.totalEligibleITC}
                    bold
                  />
                  <Row
                    label="4A. ITC Available (GSTIN suppliers)"
                    taxable={null}
                    cgst={
                      itc.itcCGST *
                      (itc.eligibleITC / Math.max(itc.totalEligibleITC, 1))
                    }
                    sgst={
                      itc.itcSGST *
                      (itc.eligibleITC / Math.max(itc.totalEligibleITC, 1))
                    }
                    igst={
                      itc.itcIGST *
                      (itc.eligibleITC / Math.max(itc.totalEligibleITC, 1))
                    }
                    total={itc.eligibleITC}
                    light
                  />
                  <Row
                    label="4B. ITC Reversed / Blocked (no GSTIN)"
                    taxable={null}
                    cgst={0}
                    sgst={0}
                    igst={0}
                    total={itc.reversedITC}
                  />
                  <Row
                    label="Net ITC Claimable"
                    taxable={null}
                    cgst={0}
                    sgst={0}
                    igst={0}
                    total={itc.netITC}
                    bold
                  />
                </tbody>
              </table>
            </div>
          </div>

          <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
            <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="text-rose-600 w-4 h-4" />
                <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
                  6. Tax Payment Summary
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse bg-white">
                <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                  <tr>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-left w-2/5">
                      Description
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-blue-600 text-right">
                      Taxable Value (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      CGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      SGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      IGST (₹)
                    </th>
                    <th className="py-2.5 px-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#475569] text-right">
                      Total (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2f2e9] bg-white">
                  <Row
                    label="Output Tax Liability"
                    taxable={o.taxableValue}
                    cgst={pay.outputCGST}
                    sgst={pay.outputSGST}
                    igst={pay.outputIGST}
                    total={pay.outputCGST + pay.outputSGST + pay.outputIGST}
                    bold
                  />
                  <Row
                    label="Less: ITC Utilized"
                    taxable={null}
                    cgst={pay.itcCGST}
                    sgst={pay.itcSGST}
                    igst={pay.itcIGST}
                    total={itc.eligibleITC}
                  />
                  <tr
                    className={`${pay.netTaxTotal > 0 ? "bg-rose-50/70" : "bg-[#f0fdf4]"} font-bold border-b border-[#e2f2e9]`}
                  >
                    <td
                      className={`py-3 px-3.5 border-r border-[#e2f2e9] font-bold ${pay.netTaxTotal > 0 ? "text-rose-900" : "text-[#042f2e]"}`}
                    >
                      Net Tax Payable in Cash
                    </td>
                    <td className="py-3 px-3.5 border-r border-[#e2f2e9] text-right text-slate-400 text-xs">
                      —
                    </td>
                    <td
                      className={`py-3 px-3.5 border-r border-[#e2f2e9] text-right font-bold ${pay.netTaxTotal > 0 ? "text-rose-700" : "text-[#00a651]"}`}
                    >
                      {fmt(pay.netTaxCGST)}
                    </td>
                    <td
                      className={`py-3 px-3.5 border-r border-[#e2f2e9] text-right font-bold ${pay.netTaxTotal > 0 ? "text-rose-700" : "text-[#00a651]"}`}
                    >
                      {fmt(pay.netTaxSGST)}
                    </td>
                    <td
                      className={`py-3 px-3.5 border-r border-[#e2f2e9] text-right font-bold ${pay.netTaxTotal > 0 ? "text-rose-700" : "text-[#00a651]"}`}
                    >
                      {fmt(pay.netTaxIGST)}
                    </td>
                    <td
                      className={`py-3 px-3.5 text-right text-sm font-extrabold ${pay.netTaxTotal > 0 ? "text-rose-700" : "text-[#00a651]"}`}
                    >
                      {fmt(pay.netTaxTotal)}
                    </td>
                  </tr>
                  {pay.carryForwardCGST +
                    pay.carryForwardSGST +
                    pay.carryForwardIGST >
                    0 && (
                    <Row
                      label="Excess ITC (Carry Forward)"
                      taxable={null}
                      cgst={pay.carryForwardCGST}
                      sgst={pay.carryForwardSGST}
                      igst={pay.carryForwardIGST}
                      total={
                        pay.carryForwardCGST +
                        pay.carryForwardSGST +
                        pay.carryForwardIGST
                      }
                      light
                    />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "monthly" && (
        <div className="app-panel overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
          <div className="app-section-bar px-4 py-3 bg-white border-b border-[#e2f2e9]">
            <h3 className="app-heading text-xs font-extrabold text-[#042f2e] uppercase tracking-wider">
              Month-over-Month Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse bg-white">
              <thead className="bg-[#f0fdf4]/50 border-b border-[#e2f2e9]">
                <tr>
                  {[
                    "Month",
                    "Taxable Sales",
                    "Output Tax",
                    "ITC",
                    "Net Tax",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-[11px] font-extrabold uppercase tracking-widest text-[#475569] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2f2e9] bg-white">
                {monthly.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-400 font-medium"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  monthly.map((m, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#f0fdf4]/20 border-b border-[#e2f2e9] transition-colors duration-200"
                    >
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] font-bold text-[#042f2e] whitespace-nowrap">
                        {m.month}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-medium text-[#042f2e]">
                        {fmt(m.taxable)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-semibold text-purple-700">
                        {fmt(m.outputTax)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-semibold text-[#00a651]">
                        {fmt(m.itc)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-[#e2f2e9] text-right font-bold text-[#042f2e]">
                        {fmt(m.netTax)}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${m.netTax > 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-[#ecfdf5] text-[#00a651] border border-[#c6f1d6]"}`}
                        >
                          {m.netTax > 0 ? "Tax Due" : "Credit"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {monthly.length > 0 && (
                <tfoot>
                  <tr className="bg-[#f0fdf4] text-[#042f2e] font-extrabold border-t-2 border-[#00a651]">
                    <td className="py-3 px-3.5 border-r border-[#e2f2e9] uppercase tracking-widest text-xs">
                      Total
                    </td>
                    <td className="py-3 px-3.5 border-r border-[#e2f2e9] text-right">
                      {fmt(monthly.reduce((s, m) => s + m.taxable, 0))}
                    </td>
                    <td className="py-3 px-3.5 border-r border-[#e2f2e9] text-right text-purple-700">
                      {fmt(monthly.reduce((s, m) => s + m.outputTax, 0))}
                    </td>
                    <td className="py-3 px-3.5 border-r border-[#e2f2e9] text-right text-[#00a651]">
                      {fmt(monthly.reduce((s, m) => s + m.itc, 0))}
                    </td>
                    <td className="py-3 px-3.5 border-r border-[#e2f2e9] text-right text-[#042f2e]">
                      {fmt(monthly.reduce((s, m) => s + m.netTax, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
