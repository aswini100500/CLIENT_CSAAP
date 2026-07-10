import React, { useState, useEffect } from "react";
import { HiRefresh, HiDownload, HiCalculator } from "react-icons/hi";
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
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) + "%" : "0%");

const Row = ({ label, taxable, cgst, sgst, igst, total, bold, light }) => (
  <tr className={bold ? "bg-gray-100 font-bold" : light ? "bg-green-50" : ""}>
    <td
      className={`px-4 py-2.5 ${bold ? "font-semibold text-gray-800" : "text-gray-700"}`}
    >
      {label}
    </td>
    <td
      className={`px-4 py-2.5 text-right font-mono ${bold ? "text-blue-800 font-bold" : "text-blue-600"}`}
    >
      {taxable != null ? fmt(taxable) : "—"}
    </td>
    <td className="px-4 py-2.5 text-right font-mono text-green-700">
      {fmt(cgst)}
    </td>
    <td className="px-4 py-2.5 text-right font-mono text-green-700">
      {fmt(sgst)}
    </td>
    <td className="px-4 py-2.5 text-right font-mono text-purple-700">
      {fmt(igst)}
    </td>
    <td
      className={`px-4 py-2.5 text-right font-mono ${bold ? "text-gray-900 font-bold" : "text-gray-800"}`}
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
  const { companyId } = useCompany();
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-purple-600" />
        <span className="ml-3 text-gray-500">Calculating GSTR-3B…</span>
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex justify-between">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchAll}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
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
      <div className="bg-linear-to-r from-purple-700 to-purple-500 rounded-xl p-5 text-white print:bg-purple-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              GSTR-3B — Monthly Return Summary
            </h2>
            <p className="text-purple-100 text-sm">
              Auto-calculated · Sales Vouchers → Output Tax · Purchase Vouchers
              → ITC
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center print:hidden">
            <select
              value={fy}
              onChange={(e) => {
                setFY(e.target.value);
                setMonth("");
              }}
              className="bg-white/20 text-white border border-white/40 rounded-lg px-3 py-1.5 text-sm"
            >
              {fyOptions.map((f) => (
                <option key={f} value={f} className="text-gray-800">
                  FY {f}
                </option>
              ))}
            </select>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-white/20 text-white border border-white/40 rounded-lg px-3 py-1.5 text-sm"
            />
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
              onClick={() => window.print()}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"
            >
              <Printer className="w-4 h-4" />
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
            c: "purple",
          },
          { l: "ITC Available", v: fmt(itc.eligibleITC), c: "green" },
          {
            l: "Net Tax Payable",
            v: fmt(pay.netTaxTotal),
            c: pay.netTaxTotal > 0 ? "red" : "green",
          },
          {
            l: "Carry Forward",
            v: fmt(
              (pay.carryForwardCGST || 0) +
                (pay.carryForwardSGST || 0) +
                (pay.carryForwardIGST || 0),
            ),
            c: "blue",
          },
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

      <div className="flex border-b border-gray-200 print:hidden">
        {[
          ["summary", "3B Summary"],
          ["monthly", "Month Comparison"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === v ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
              <HiCalculator className="text-purple-600 w-4 h-4" />
              <h3 className="font-semibold text-purple-800 text-sm uppercase tracking-wide">
                3.1 Outward Supplies (from Sales Vouchers)
              </h3>
              <span className="ml-auto text-xs text-purple-600">
                {o.totalInvoices || 0} invoices
              </span>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-2/5">
                    Nature
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-blue-600 uppercase">
                    Taxable Value (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    CGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    SGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    IGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Total Tax (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
              <HiCalculator className="text-green-600 w-4 h-4" />
              <h3 className="font-semibold text-green-800 text-sm uppercase tracking-wide">
                4. Eligible ITC (from Purchase Vouchers)
              </h3>
              <span className="ml-auto text-xs text-green-600">
                {itc.totalPurchases || 0} purchases
              </span>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-2/5">
                    ITC Type
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-blue-600 uppercase">
                    Taxable Value (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    CGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    SGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    IGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <HiCalculator className="text-red-600 w-4 h-4" />
              <h3 className="font-semibold text-red-800 text-sm uppercase tracking-wide">
                6. Tax Payment Summary
              </h3>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-2/5">
                    Description
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-blue-600 uppercase">
                    Taxable Value (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    CGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    SGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    IGST (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
                  className={`${pay.netTaxTotal > 0 ? "bg-red-50" : "bg-green-50"} font-bold`}
                >
                  <td
                    className={`px-4 py-3 font-bold ${pay.netTaxTotal > 0 ? "text-red-800" : "text-green-800"}`}
                  >
                    Net Tax Payable in Cash
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    —
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-bold ${pay.netTaxTotal > 0 ? "text-red-700" : "text-green-700"}`}
                  >
                    {fmt(pay.netTaxCGST)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-bold ${pay.netTaxTotal > 0 ? "text-red-700" : "text-green-700"}`}
                  >
                    {fmt(pay.netTaxSGST)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-bold ${pay.netTaxTotal > 0 ? "text-red-700" : "text-green-700"}`}
                  >
                    {fmt(pay.netTaxIGST)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono text-xl font-bold ${pay.netTaxTotal > 0 ? "text-red-700" : "text-green-700"}`}
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
      )}

      {tab === "monthly" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Month-over-Month Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
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
                      className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  monthly.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {m.month}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700">
                        {fmt(m.taxable)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-purple-700">
                        {fmt(m.outputTax)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-700">
                        {fmt(m.itc)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {fmt(m.netTax)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${m.netTax > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
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
                  <tr className="bg-gray-900 text-white">
                    <td className="px-4 py-3 font-bold text-xs uppercase tracking-widest">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {fmt(monthly.reduce((s, m) => s + m.taxable, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {fmt(monthly.reduce((s, m) => s + m.outputTax, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {fmt(monthly.reduce((s, m) => s + m.itc, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
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
