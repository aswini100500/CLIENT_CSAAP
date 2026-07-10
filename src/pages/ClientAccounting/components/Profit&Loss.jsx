import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";

const ProfitLoss = () => {
  const { companyId, companyName } = useCompany();

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
        {
          params: { from: fromDate, to: toDate },
        },
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
      alert("Failed to load data");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPL();
  }, [companyId, fromDate, toDate]);

  return (
    <div className="bg-[#FDFDFD] min-h-screen font-[Cambria] text-sm text-gray-800">
      <div className="bg-[#0078D7] text-white py-2 px-4 flex justify-between items-center text-[15px]">
        <div className="font-semibold">Profit & Loss Account</div>
        <div>
          Company:{" "}
          <span className="font-semibold">{companyName || companyId}</span>
        </div>
      </div>

      <div className="flex justify-center gap-6 py-3 border-b border-gray-300 text-[14px]">
        <div>
          From:{" "}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 px-2 py-1 rounded"
          />
        </div>
        <div>
          To:{" "}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 px-2 py-1 rounded"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-4 border border-gray-300">
        <div className="grid grid-cols-2 font-semibold bg-gray-100 border-b border-gray-300">
          <div className="py-2 px-3 border-r border-gray-300">Particulars</div>
          <div className="py-2 px-3 text-right">Amount (₹)</div>
        </div>

        <div className="border-b border-gray-200">
          <div className="bg-[#F2F8FF] font-semibold px-3 py-1">Income</div>

          {loading ? (
            <div className="p-3 text-gray-500">Loading...</div>
          ) : income.length === 0 ? (
            <div className="p-3 text-gray-500">No income records</div>
          ) : (
            income.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 hover:bg-blue-50 transition text-[14px]"
              >
                <div className="px-3 py-1 border-r border-gray-200">
                  {item.name}
                </div>
                <div className="px-3 py-1 text-right">
                  {Number(item.amount || 0).toLocaleString()}
                </div>
              </div>
            ))
          )}

          <div className="grid grid-cols-2 border-t border-gray-300 font-semibold bg-gray-50">
            <div className="px-3 py-1 border-r border-gray-200">
              Total Income
            </div>
            <div className="px-3 py-1 text-right">
              {Number(totalIncome || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="bg-[#F2F8FF] font-semibold px-3 py-1">Expenses</div>

          {loading ? (
            <div className="p-3 text-gray-500">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="p-3 text-gray-500">No expense records</div>
          ) : (
            expenses.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 hover:bg-blue-50 transition text-[14px]"
              >
                <div className="px-3 py-1 border-r border-gray-200">
                  {item.name}
                </div>
                <div className="px-3 py-1 text-right">
                  {Number(item.amount || 0).toLocaleString()}
                </div>
              </div>
            ))
          )}

          <div className="grid grid-cols-2 border-t border-gray-300 font-semibold bg-gray-50">
            <div className="px-3 py-1 border-r border-gray-200">
              Total Expenses
            </div>
            <div className="px-3 py-1 text-right">
              {Number(totalExpenses || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 bg-yellow-50 font-semibold text-[15px]">
          <div className="px-3 py-2 border-r border-gray-300">
            {netProfit >= 0 ? "Net Profit" : "Net Loss"}
          </div>
          <div
            className={`px-3 py-2 text-right ${
              netProfit >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {Number(Math.abs(netProfit) || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
