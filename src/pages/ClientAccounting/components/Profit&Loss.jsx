import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const ProfitLoss = () => {
  const { companyId, companyName } = useAuth();

  const [fromDate, setFromDate] = useState("2025-04-01");
  const [toDate, setToDate] = useState("2026-03-31");

  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  const fetchPL = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/profit-loss/${companyId}`,
        { params: { from: fromDate, to: toDate } },
      );
      const rawIncome = res.data.income || [];
      const rawExpenses = res.data.expenses || [];
      setIncome(
        rawIncome.map((it) => ({
          name: it.ledgerName,
          amount: Number(it.amount) || 0,
          group: it.groupName,
        })),
      );
      setExpenses(
        rawExpenses.map((it) => ({
          name: it.ledgerName,
          amount: Number(it.amount) || 0,
          group: it.groupName,
        })),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPL();
  }, [companyId, fromDate, toDate]);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6 font-sans text-sm">
      <div className="app-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-[13px] font-bold text-(--text-strong)">
          <div className="size-8 rounded-xl bg-(--brand-soft) border border-(--border-strong) flex items-center justify-center text-(--brand)">
            <Building2 size={16} />
          </div>
          <div>
            <span className="block leading-tight">
              {companyName || companyId || "Company Accounting"}
            </span>
            <span className="text-[11px] font-medium text-(--text-faint)">
              Statement Period Filter
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs bg-(--bg-subtle)/60 px-3 py-1.5 rounded-xl border border-(--border-soft)">
            <Calendar size={14} className="text-(--brand)" />
            <span className="font-semibold text-(--text-soft)">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white border border-(--border-soft) rounded-lg px-2 py-1 text-xs font-semibold text-(--text-strong) focus:outline-none focus:border-(--brand)"
            />
            <span className="font-semibold text-(--text-soft) ml-1">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white border border-(--border-soft) rounded-lg px-2 py-1 text-xs font-semibold text-(--text-strong) focus:outline-none focus:border-(--brand)"
            />
          </div>

          <button
            onClick={fetchPL}
            disabled={loading}
            className="app-btn-secondary flex items-center gap-2 min-h-9 px-3 text-[13px]"
          >
            <RefreshCw
              size={14}
              className={
                loading ? "animate-spin text-(--brand)" : "text-(--text-soft)"
              }
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="app-panel overflow-hidden border border-(--border-soft) bg-white">
        <div className="grid grid-cols-12 bg-(--bg-subtle)/70 border-b border-(--border-soft) text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) p-3">
          <div className="col-span-8 pl-4">Particulars</div>
          <div className="col-span-4 text-right pr-4">Amount (₹)</div>
        </div>

        <div className="border-b border-(--border-soft)">
          <div className="bg-emerald-50/60 border-b border-emerald-100 px-4 py-2.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-600" />
              <span>Income</span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-(--text-soft) flex items-center justify-center gap-2 text-xs">
              <Loader2 size={16} className="animate-spin text-(--brand)" />{" "}
              Loading Income...
            </div>
          ) : income.length === 0 ? (
            <div className="p-4 text-center text-xs text-(--text-faint) italic">
              No income records
            </div>
          ) : (
            income.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-3 border-b border-slate-100 hover:bg-(--bg-subtle)/50 transition-colors text-[13px] items-center"
              >
                <div className="col-span-8 pl-4 font-semibold text-(--text-strong)">
                  {item.name}
                </div>
                <div className="col-span-4 text-right pr-4 font-bold text-(--text-strong) tabular-nums">
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))
          )}

          <div className="grid grid-cols-12 p-3.5 bg-emerald-50/30 border-t border-(--border-soft) text-[13px] font-bold text-(--text-strong)">
            <div className="col-span-8 pl-4 text-emerald-700 font-extrabold">
              Total Income
            </div>
            <div className="col-span-4 text-right pr-4 text-emerald-700 font-extrabold tabular-nums">
              ₹ {formatCurrency(totalIncome)}
            </div>
          </div>
        </div>

        <div className="border-b border-(--border-soft)">
          <div className="bg-rose-50/60 border-b border-rose-100 px-4 py-2.5 text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-rose-600" />
              <span>Expenses</span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-(--text-soft) flex items-center justify-center gap-2 text-xs">
              <Loader2 size={16} className="animate-spin text-rose-600" />{" "}
              Loading Expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-4 text-center text-xs text-(--text-faint) italic">
              No expense records
            </div>
          ) : (
            expenses.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-3 border-b border-slate-100 hover:bg-rose-50/40 transition-colors text-[13px] items-center"
              >
                <div className="col-span-8 pl-4 font-semibold text-(--text-strong)">
                  {item.name}
                </div>
                <div className="col-span-4 text-right pr-4 font-bold text-(--text-strong) tabular-nums">
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))
          )}

          <div className="grid grid-cols-12 p-3.5 bg-rose-50/30 border-t border-(--border-soft) text-[13px] font-bold text-(--text-strong)">
            <div className="col-span-8 pl-4 text-rose-700 font-extrabold">
              Total Expenses
            </div>
            <div className="col-span-4 text-right pr-4 text-rose-700 font-extrabold tabular-nums">
              ₹ {formatCurrency(totalExpenses)}
            </div>
          </div>
        </div>

        <div
          className={`grid grid-cols-12 p-4 text-[14px] font-extrabold items-center ${
            netProfit >= 0
              ? "bg-emerald-50 text-emerald-900 border-t-2 border-emerald-500"
              : "bg-rose-50 text-rose-900 border-t-2 border-rose-500"
          }`}
        >
          <div className="col-span-8 pl-4 flex items-center gap-2 uppercase tracking-wide">
            {netProfit >= 0 ? (
              <TrendingUp size={18} className="text-(--brand)" />
            ) : (
              <TrendingDown size={18} className="text-rose-600" />
            )}
            <span>{netProfit >= 0 ? "Net Profit" : "Net Loss"}</span>
          </div>
          <div className="col-span-4 text-right pr-4 tabular-nums text-base">
            ₹ {formatCurrency(Math.abs(netProfit))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
