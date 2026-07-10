import React, { useState, useEffect } from "react";
import { Calendar, Filter, FileText, Download } from "lucide-react";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";

const TransactionSummery = () => {
  const { companyId } = useCompany();

  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  const [selectedType, setSelectedType] = useState("All");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500 font-mono">
        Loading Transactions...
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

  const totalDebit = filteredData.reduce((a, b) => a + b.debit, 0);
  const totalCredit = filteredData.reduce((a, b) => a + b.credit, 0);

  const handleExport = () => {
    const csv = [
      ["Date", "Voucher", "Ledger", "Debit", "Credit"],
      ...filteredData.map((e) => [
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
    <div className="flex w-full h-[calc(100vh-70px)] bg-gray-100 overflow-hidden font-[monospace]">
      <div className="w-64 bg-white border-r shadow-sm p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-4 text-blue-700 flex items-center gap-2">
          <Filter size={18} /> Filters
        </h2>

        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Date Range
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
              <Calendar size={16} className="text-blue-600" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className="bg-transparent w-full text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
              <Calendar size={16} className="text-blue-600" />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className="bg-transparent w-full text-sm outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Voucher Type
          </h3>
          <div className="space-y-2">
            {transactionTypes.map((type) => (
              <div
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-2 rounded cursor-pointer text-sm ${
                  selectedType === type
                    ? "bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
              <FileText size={20} /> Transaction Summary
            </h2>

            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
            >
              <Download size={14} /> Export
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            Period: <b>{dateRange.from}</b> to <b>{dateRange.to}</b>
          </p>

          <div className="mt-4 border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b">
                <tr className="text-left">
                  <th className="p-2 border-r">Date</th>
                  <th className="p-2 border-r">Voucher Type</th>

                  <th className="p-2 border-r text-right">Debit (Dr)</th>
                  <th className="p-2 text-right">Credit (Cr)</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-2 border-r">
                        {new Date(row.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-2 border-r">{row.voucher}</td>

                      <td className="p-2 text-right border-r text-green-700 font-semibold">
                        {row.debit !== 0 ? row.debit.toLocaleString() : "-"}
                      </td>
                      <td className="p-2 text-right text-red-700 font-semibold">
                        {row.credit !== 0 ? row.credit.toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan="5">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="bg-gray-100 flex justify-end px-6 py-2 text-sm font-bold">
              <span className="mr-10 text-green-700">
                Total Debit: ₹{totalDebit.toLocaleString()}
              </span>
              <span className="text-red-700">
                Total Credit: ₹{totalCredit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummery;
