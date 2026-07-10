






































































































































































































































  










































  





















































































        





































































































































































































































































































































































































































































































































































































































































































































































































import React, { useState, useEffect } from "react";
import { Download, Printer, Filter } from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import axios from "axios";

const DayBook = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [voucherType, setVoucherType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [entries, setEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);

  const { companyId } = useCompany();


  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };


  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/daybook/${companyId}`
        );

        let cleaned = res.data.map((e) => ({
          ...e,
          debit: parseFloat(e.debit) || 0,
          credit: parseFloat(e.credit) || 0,
          ledger: e.ledger || "-",
          narration: e.narration || "",
        }));

        cleaned.sort((a, b) => new Date(a.date) - new Date(b.date));


        setAllEntries(cleaned);
        




        const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const format = (d) => d.toLocaleDateString("en-CA");

  setFromDate(format(yesterday));
  setToDate(format(today));


        const todayEntries = cleaned.filter(entry => 
          entry.date === today
        );
        setEntries(todayEntries);

      } catch (err) {
        console.log("DayBook Error:", err);
      }
    };

    fetchData();
  }, [companyId]);


  useEffect(() => {
    if (!fromDate || !toDate || allEntries.length === 0) return;

    const filteredEntries = allEntries.filter((e) => {
      const entryDate = new Date(e.date).toISOString().split("T")[0];
      const start = fromDate;
      const end = toDate;

      const matchDate = entryDate >= start && entryDate <= end;
      const matchType = voucherType === "All" || e.voucher === voucherType;

      const q = searchQuery.toLowerCase();

      return (
        matchDate &&
        matchType &&
        (String(e.ledger).toLowerCase().includes(q) ||
          String(e.narration).toLowerCase().includes(q) ||
          String(e.voucher).toLowerCase().includes(q))
      );
    });

    setEntries(filteredEntries);
  }, [fromDate, toDate, voucherType, searchQuery, allEntries]);


  if (!fromDate || !toDate) {
    return (
      <div className="p-4 text-center text-gray-500 font-mono">
        Loading vouchers...
      </div>
    );
  }


  const totalDebit = entries.reduce((a, b) => a + b.debit, 0);
  const totalCredit = entries.reduce((a, b) => a + b.credit, 0);
  const closingBalance = totalDebit - totalCredit;

  const getVoucherColor = (v) => {
    const colors = {
      Sales: "text-green-600 bg-green-50 border-green-200",
      Purchase: "text-blue-600 bg-blue-50 border-blue-200",
      Receipt: "text-emerald-600 bg-emerald-50 border-emerald-200",
      Payment: "text-red-600 bg-red-50 border-red-200",
      Journal: "text-purple-600 bg-purple-50 border-purple-200",
      Contra: "text-orange-600 bg-orange-50 border-orange-200",
      Default: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[v] || colors.Default;
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });


  const handleExport = () => {
    const csv = [
      ["Date", "Voucher", "No", "Ledger", "Narration", "Debit", "Credit"],
      ...entries.map((e) => [
        formatDate(e.date),
        e.voucher,
        e.number,
        e.ledger,
        e.narration,
        e.debit,
        e.credit,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `DayBook_${getTodayDate()}.csv`;
    a.click();
  };


  const handlePrint = () => {
    window.print();
  };


  const Filters = () => (
    <div className="p-4 border-b bg-gray-50 no-print">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voucher Type
          </label>
          <select
            value={voucherType}
            onChange={(e) => setVoucherType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="All">All Types</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
            <option value="Receipt">Receipt</option>
            <option value="Payment">Payment</option>
            <option value="Journal">Journal</option>
            <option value="Contra">Contra</option>
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search ledger or narration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>


      <div className="mt-3 flex justify-between items-center">
        <button
          onClick={() => {
            const today = getTodayDate();
            setFromDate(today);
            setToDate(today);
            setVoucherType("All");
            setSearchQuery("");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Show Today's Data
        </button>
        
        <div className="text-sm text-gray-600">
          Showing {entries.length} entries
          {fromDate === toDate ? ` for ${formatDate(fromDate)}` : ` from ${formatDate(fromDate)} to ${formatDate(toDate)}`}
        </div>
      </div>
    </div>
  );

  return (
    <>

      <style>
        {`
        @media print {
            body * {
                visibility: hidden;
            }
            #daybook-print-area, #daybook-print-area * {
                visibility: visible;
            }
            #daybook-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            .no-print {
                display: none !important;
            }
        }
    `}
      </style>

      <div className="min-h-screen bg-gray-50 font-[monospace]">
        <div
          id="daybook-print-area"
          className="max-w-7xl mx-auto bg-white shadow-lg border rounded-lg"
        >

          <div className="bg-blue-800 p-4 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Day Book</h1>
              <p className="text-blue-200 text-sm">
                {fromDate === toDate 
                  ? `Date: ${formatDate(fromDate)} (Today)`
                  :"Showing Todays Report"

                }
              </p>
            </div>


            <div className="flex space-x-2 no-print">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 bg-white text-blue-800 border border-gray-300 rounded text-sm flex items-center space-x-1"
              >
                <Filter size={14} /> <span>Filters</span>
              </button>

              <button
                onClick={handleExport}
                className="px-3 py-1 bg-white text-blue-800 border border-gray-300 rounded text-sm flex items-center space-x-1"
              >
                <Download size={14} /> <span>Export</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-white text-blue-800 border border-gray-300 rounded text-sm flex items-center space-x-1"
              >
                <Printer size={14} /> <span>Print</span>
              </button>
            </div>
          </div>


          {showFilters && <Filters />}


          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Voucher</th>
                  <th className="p-2 border">No</th>
                  <th className="p-2 border">Ledger</th>
                  <th className="p-2 border">Narration</th>
                  <th className="p-2 border text-right">Debit</th>
                  <th className="p-2 border text-right">Credit</th>
                </tr>
              </thead>

              <tbody>
                {entries.length > 0 ? (
                  entries.map((e) => (
                    <tr key={e.id}>
                      <td className="p-2 border">{formatDate(e.date)}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 text-xs border rounded ${getVoucherColor(
                            e.voucher
                          )}`}
                        >
                          {e.voucher}
                        </span>
                      </td>
                      <td className="p-2 border">{e.number}</td>
                      <td className="p-2 border">{e.ledger}</td>
                      <td className="p-2 border">{e.narration}</td>
                      <td className="p-2 border text-right">
                        {e.debit ? `₹${e.debit}` : "-"}
                      </td>
                      <td className="p-2 border text-right">
                        {e.credit ? `₹${e.credit}` : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-3 text-center text-gray-500">
                      No vouchers found for selected criteria
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="5" className="p-2 border text-right">
                    Total:
                  </td>
                  <td className="p-2 border text-right">₹{totalDebit}</td>
                  <td className="p-2 border text-right">₹{totalCredit}</td>
                </tr>

                <tr className="bg-blue-50 font-bold">
                  <td colSpan="5" className="p-2 border text-right">
                    Closing Balance:
                  </td>
                  <td colSpan="2" className="p-2 border text-right">
                    {closingBalance >= 0 ? "₹" : "-₹"}
                    {Math.abs(closingBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DayBook;















































































































































































































































