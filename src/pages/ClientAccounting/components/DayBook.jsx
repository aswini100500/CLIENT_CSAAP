// import React, { useState, useEffect } from "react";
// import { Calendar, Search } from "lucide-react";

// const DayBook = () => {
//   const [fromDate, setFromDate] = useState("2025-01-01");
//   const [toDate, setToDate] = useState("2025-01-31");
//   const [voucherType, setVoucherType] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   // SAMPLE ENTRIES (You can replace with API)
//   const [entries, setEntries] = useState([
//     {
//       id: 1,
//       date: "2025-01-02",
//       voucher: "Sales",
//       number: "S-101",
//       ledger: "Customer A",
//       amount: 15000,
//     },
//     {
//       id: 2,
//       date: "2025-01-05",
//       voucher: "Purchase",
//       number: "P-204",
//       ledger: "Supplier B",
//       amount: 22000,
//     },
//     {
//       id: 3,
//       date: "2025-01-07",
//       voucher: "Receipt",
//       number: "R-55",
//       ledger: "Bank",
//       amount: 10000,
//     },
//     {
//       id: 4,
//       date: "2025-01-08",
//       voucher: "Payment",
//       number: "PY-20",
//       ledger: "Vendor C",
//       amount: 8000,
//     },
//   ]);

//   // Filter logic
//   const filteredEntries = entries.filter((e) => {
//     const matchDate = e.date >= fromDate && e.date <= toDate;
//     const matchType = voucherType === "All" || e.voucher === voucherType;
//     const matchSearch =
//       e.ledger.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       e.voucher.toLowerCase().includes(searchQuery.toLowerCase());

//     return matchDate && matchType && matchSearch;
//   });

//   const totalAmount = filteredEntries.reduce((sum, e) => sum + e.amount, 0);

//   return (
//     <div className="p-6">

//       {/* HEADER */}
//       <h1 className="text-2xl font-bold text-blue-800 mb-4">Day Book</h1>

//       {/* FILTERS */}
//       <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

//         {/* Date From */}
//         <div>
//           <label className="text-sm font-medium text-gray-700">From Date</label>
//           <div className="flex items-center bg-gray-100 p-2 rounded">
//             <Calendar className="mr-2 text-gray-500" size={18} />
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="bg-transparent outline-none w-full"
//             />
//           </div>
//         </div>

//         {/* Date To */}
//         <div>
//           <label className="text-sm font-medium text-gray-700">To Date</label>
//           <div className="flex items-center bg-gray-100 p-2 rounded">
//             <Calendar className="mr-2 text-gray-500" size={18} />
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="bg-transparent outline-none w-full"
//             />
//           </div>
//         </div>

//         {/* Voucher Type */}
//         <div>
//           <label className="text-sm font-medium text-gray-700">Voucher Type</label>
//           <select
//             value={voucherType}
//             onChange={(e) => setVoucherType(e.target.value)}
//             className="w-full p-2 bg-gray-100 rounded outline-none"
//           >
//             <option>All</option>
//             <option>Sales</option>
//             <option>Purchase</option>
//             <option>Receipt</option>
//             <option>Payment</option>
//           </select>
//         </div>

//         {/* Search */}
//         <div>
//           <label className="text-sm font-medium text-gray-700">Search</label>
//           <div className="flex items-center bg-gray-100 p-2 rounded">
//             <Search size={18} className="mr-2 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Search ledger or voucher..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="bg-transparent outline-none w-full"
//             />
//           </div>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-blue-900 text-white text-left">
//             <tr>
//               <th className="p-3">Date</th>
//               <th className="p-3">Voucher Type</th>
//               <th className="p-3">Voucher No.</th>
//               <th className="p-3">Ledger</th>
//               <th className="p-3 text-right">Amount</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredEntries.length > 0 ? (
//               filteredEntries.map((e) => (
//                 <tr
//                   key={e.id}
//                   className="border-b hover:bg-blue-50 transition"
//                 >
//                   <td className="p-3">{e.date}</td>
//                   <td className="p-3">{e.voucher}</td>
//                   <td className="p-3">{e.number}</td>
//                   <td className="p-3">{e.ledger}</td>
//                   <td className="p-3 text-right font-semibold">
//                     ₹ {e.amount.toLocaleString()}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan="5"
//                   className="text-center p-4 text-gray-500 italic"
//                 >
//                   No entries found
//                 </td>
//               </tr>
//             )}
//           </tbody>

//           {/* TOTAL */}
//           <tfoot>
//             <tr className="bg-blue-100 font-bold">
//               <td colSpan="4" className="p-3">Total</td>
//               <td className="p-3 text-right">
//                 ₹ {totalAmount.toLocaleString()}
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DayBook;

// import React, { useState, useEffect } from "react";
// import { Calendar, Search, Download, Printer, Filter, Plus } from "lucide-react";
// import { useCompany } from "../context/CompanyContext";
// import axios from "axios";

// const DayBook = () => {
//   const [fromDate, setFromDate] = useState("2025-01-01");
//   const [toDate, setToDate] = useState("2025-01-31");
//   const [voucherType, setVoucherType] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showFilters, setShowFilters] = useState(false);

//   const { companyId } = useCompany();
//   const [entries, setEntries] = useState([]);

//   // useEffect(() => {
//   //   if (!companyId) return;

//   //   const fetchDayBook = async () => {
//   //     try {
//   //       const res = await axios.get(
//   //         `http://localhost:3000/api/v1/daybook/${companyId}`
//   //       );

//   //       console.log("Daybook Response:", res.data);

//   //       // Convert debit/credit safely into numbers
//   //       const cleaned = res.data.map((e) => ({
//   //         ...e,
//   //         debit: e.debit ? parseFloat(e.debit) : 0,
//   //         credit: e.credit ? parseFloat(e.credit) : 0,
//   //         narration: e.narration || "",
//   //         ledger: e.ledger ? String(e.ledger) : "-",
//   //       }));

//   //       setEntries(cleaned);
//   //     } catch (e) {
//   //       console.log("DayBook fetch error:", e);
//   //     }
//   //   };

//   //   fetchDayBook();
//   // }, [companyId]);
//   // console.log(entries);

//   // FILTER LOGIC
  
//     useEffect(() => {
//   if (!companyId) return;

//   const fetchDayBook = async () => {
//     try {
//       const res = await axios.get(
//         `http://localhost:3000/api/v1/daybook/${companyId}`
//       );

//       const cleaned = res.data.map((e) => ({
//         ...e,
//         debit: e.debit ? parseFloat(e.debit) : 0,
//         credit: e.credit ? parseFloat(e.credit) : 0,
//         narration: e.narration || "",
//         ledger: e.ledger ? String(e.ledger) : "-",
//       }));

//       // Sort by date
//       cleaned.sort((a, b) => new Date(a.date) - new Date(b.date));

//       setEntries(cleaned);

//       // AUTO FIX FILTER RANGE
//       if (cleaned.length > 0) {
//         const dateList = cleaned.map(e =>
//           new Date(e.date).toISOString().slice(0, 10)
//         );

//         setFromDate(dateList[0]);                     // earliest
//         setToDate(dateList[dateList.length - 1]);     // latest
//       }

//     } catch (e) {
//       console.log("DayBook fetch error:", e);
//     }
//   };

//   fetchDayBook();
// }, [companyId]);

// console.log(entries);

  
//   const filteredEntries = entries.filter((e) => {
//     const matchDate =
//       new Date(e.date).getTime() >= new Date(fromDate).getTime() &&
//       new Date(e.date).getTime() <= new Date(toDate).getTime();
// console.log(matchDate);

//        const matchType = voucherType === "All" || e.voucher === voucherType;

//     const ledgerStr = String(e.ledger || "").toLowerCase();
//     const narrationStr = String(e.narration || "").toLowerCase();
//     const voucherStr = String(e.voucher || "").toLowerCase();

//     const matchSearch =
//       ledgerStr.includes(searchQuery.toLowerCase()) ||
//       voucherStr.includes(searchQuery.toLowerCase()) ||
//       narrationStr.includes(searchQuery.toLowerCase());

//     return matchDate && matchType && matchSearch;
//   });

//   console.log(filteredEntries);

//   // TOTALS
//   const totalDebit = filteredEntries.reduce(
//     (sum, e) => sum + (parseFloat(e.debit) || 0),
//     0
//   );

//   const totalCredit = filteredEntries.reduce(
//     (sum, e) => sum + (parseFloat(e.credit) || 0),
//     0
//   );

//   const closingBalance = totalDebit - totalCredit;

//   const getVoucherColor = (voucherType) => {
//     const colors = {
//       Sales: "text-green-600 bg-green-50 border-green-200",
//       Purchase: "text-blue-600 bg-blue-50 border-blue-200",
//       Receipt: "text-emerald-600 bg-emerald-50 border-emerald-200",
//       Payment: "text-red-600 bg-red-50 border-red-200",
//       Journal: "text-purple-600 bg-purple-50 border-purple-200",
//       Contra: "text-orange-600 bg-orange-50 border-orange-200",
//       Default: "text-gray-600 bg-gray-50 border-gray-200",
//     };
//     return colors[voucherType] || colors.Default;
//   };

//   const formatDate = (dateStr) => {
//     return new Date(dateStr).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   const handleExport = () => {
//     const csvContent = [
//       ["Date", "Voucher Type", "Voucher No", "Ledger", "Narration", "Debit", "Credit"],
//       ...filteredEntries.map((e) => [
//         formatDate(e.date),
//         e.voucher,
//         e.number,
//         e.ledger,
//         e.narration,
//         e.debit,
//         e.credit,
//       ]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `daybook-${fromDate}-to-${toDate}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 font-[monospace]">

//       <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
        
//         {/* HEADER */}
//         <div className="bg-blue-800 text-white p-4 border-b border-blue-700">
//           <h1 className="text-xl font-bold">Day Book</h1>
//           <p className="text-blue-200 text-sm">
//             Period: {formatDate(fromDate)} to {formatDate(toDate)}
//           </p>
//         </div>

//         {/* TOOLBAR */}
//         <div className="bg-gray-100 border-b border-gray-300 p-2">
//           <div className="flex justify-between items-center">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
//             >
//               <Filter size={14} />
//               <span>Filters</span>
//             </button>

//             <div className="flex space-x-2">
//               <button
//                 onClick={handleExport}
//                 className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
//               >
//                 <Download size={14} />
//                 <span>Export</span>
//               </button>

//               <button
//                 onClick={() => window.print()}
//                 className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
//               >
//                 <Printer size={14} />
//                 <span>Print</span>
//               </button>
//             </div>
//           </div>

//           {/* FILTER PANEL */}
//           {showFilters && (
//             <div className="mt-3 p-3 bg-white border border-gray-300 rounded grid grid-cols-1 md:grid-cols-4 gap-4">

//               <div>
//                 <label className="block text-xs mb-1">From Date</label>
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs mb-1">To Date</label>
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs mb-1">Voucher Type</label>
//                 <select
//                   value={voucherType}
//                   onChange={(e) => setVoucherType(e.target.value)}
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 >
//                   <option>All</option>
//                   <option>Sales</option>
//                   <option>Purchase</option>
//                   <option>Receipt</option>
//                   <option>Payment</option>
//                   <option>Journal</option>
//                   <option>Contra</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs mb-1">Search</label>
//                 <input
//                   type="text"
//                   placeholder="Search ledger, narration, voucher..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* TABLE */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr className="bg-blue-900 text-white text-left">
//                 <th className="p-2 border">Date</th>
//                 <th className="p-2 border">Voucher</th>
//                 <th className="p-2 border">No</th>
//                 <th className="p-2 border">Ledger</th>
//                 <th className="p-2 border">Narration</th>
//                 <th className="p-2 border text-right">Debit</th>
//                 <th className="p-2 border text-right">Credit</th>
//               </tr>
//             </thead>

//               <tbody>
//   {filteredEntries.length > 0 ? (
//     filteredEntries.map((e) => (
//       <tr key={e.id} className="border-b">
//         <td className="p-2 border">{formatDate(e.date)}</td>
//         <td className="p-2 border">
//           <span
//             className={`px-2 py-1 rounded text-xs border ${getVoucherColor(
//               e.voucher
//             )}`}
//           >
//             {e.voucher}
//           </span>
//         </td>
//         <td className="p-2 border">{e.number}</td>
//         <td className="p-2 border">{e.ledger}</td>
//         <td className="p-2 border">{e.narration || "-"}</td>
//         <td className="p-2 border text-right">
//           {e.debit > 0 ? `₹${e.debit.toLocaleString()}` : "-"}
//         </td>
//         <td className="p-2 border text-right">
//           {e.credit > 0 ? `₹${e.credit.toLocaleString()}` : "-"}
//         </td>
//       </tr>
//     ))
//   ) : (
//     <tr>
//       <td colSpan="7" className="p-4 text-center text-gray-500">
//         No vouchers found
//       </td>
//     </tr>
//   )}
//                 </tbody>


//             {/* TOTALS */}
//             <tfoot>
//               <tr className="bg-gray-100 font-bold border-t">
//                 <td colSpan="5" className="p-2 border text-right">
//                   Total:
//                 </td>
//                 <td className="p-2 border text-right text-green-700">
//                   ₹{totalDebit.toLocaleString()}
//                 </td>
//                 <td className="p-2 border text-right text-red-700">
//                   ₹{totalCredit.toLocaleString()}
//                 </td>
//               </tr>

//               <tr className="bg-blue-50 font-bold">
//                 <td colSpan="5" className="p-2 border text-right">
//                   Closing Balance:
//                 </td>
//                 <td colSpan="2" className="p-2 border text-right">
//                   {closingBalance >= 0 ? "₹" : "-₹"}
//                   {Math.abs(closingBalance).toLocaleString()}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DayBook;

// import React, { useState, useEffect } from "react";
// import { Download, Printer, Filter } from "lucide-react";
// import { useCompany } from "../context/CompanyContext";
// import axios from "axios";

// const DayBook = () => {
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [voucherType, setVoucherType] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [entries, setEntries] = useState([]);

//   const [filtersReady, setFiltersReady] = useState(false);
//   const { companyId } = useCompany();

//   // Fetch DayBook
//   useEffect(() => {
//     if (!companyId) return;

//     const fetchDayBook = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:3000/api/v1/daybook/${companyId}`
//         );

//         let cleaned = res.data.map((e) => ({
//           ...e,
//           debit: e.debit ? parseFloat(e.debit) : 0,
//           credit: e.credit ? parseFloat(e.credit) : 0,
//           narration: e.narration || "",
//           ledger: e.ledger ? String(e.ledger) : "-",
//         }));

//         // Sort by date ASC
//         cleaned.sort((a, b) => new Date(a.date) - new Date(b.date));

//         setEntries(cleaned);

//         // Auto-set From/To date
//         if (cleaned.length > 0) {
//           const dateList = cleaned.map((e) =>
//             new Date(e.date).toISOString().slice(0, 10)
//           );

//           setFromDate(dateList[0]);
//           setToDate(dateList[dateList.length - 1]);
//         }

//         // Ensure filters apply AFTER state updates
//         setTimeout(() => setFiltersReady(true), 0);
//       } catch (e) {
//         console.log("DayBook fetch error:", e);
//       }
//     };

//     setFiltersReady(false); // lock filters
//     fetchDayBook();
//   }, [companyId]);
// console.log(entries);


//   // Filter logic
//   const filteredEntries = filtersReady
//     ? entries.filter((e) => {
//         const matchDate =
//           new Date(e.date).getTime() >= new Date(fromDate).getTime() &&
//           new Date(e.date).getTime() <= new Date(toDate).getTime();

//         const matchType = voucherType === "All" || e.voucher === voucherType;

//         const ledgerStr = String(e.ledger || "").toLowerCase();
//         const narrationStr = String(e.narration || "").toLowerCase();
//         const voucherStr = String(e.voucher || "").toLowerCase();

//         const matchSearch =
//           ledgerStr.includes(searchQuery.toLowerCase()) ||
//           voucherStr.includes(searchQuery.toLowerCase()) ||
//           narrationStr.includes(searchQuery.toLowerCase());

//         return matchDate && matchType && matchSearch;
//       })
//     : [];

//   // Totals
//   const totalDebit = filteredEntries.reduce(
//     (sum, e) => sum + (parseFloat(e.debit) || 0),
//     0
//   );

//   const totalCredit = filteredEntries.reduce(
//     (sum, e) => sum + (parseFloat(e.credit) || 0),
//     0
//   );

//   const closingBalance = totalDebit - totalCredit;

//   const getVoucherColor = (voucher) => {
//     const colors = {
//       Sales: "text-green-600 bg-green-50 border-green-200",
//       Purchase: "text-blue-600 bg-blue-50 border-blue-200",
//       Receipt: "text-emerald-600 bg-emerald-50 border-emerald-200",
//       Payment: "text-red-600 bg-red-50 border-red-200",
//       Journal: "text-purple-600 bg-purple-50 border-purple-200",
//       Contra: "text-orange-600 bg-orange-50 border-orange-200",
//       Default: "text-gray-600 bg-gray-50 border-gray-200",
//     };
//     return colors[voucher] || colors.Default;
//   };

//   const formatDate = (d) =>
//     new Date(d).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//   const handleExport = () => {
//     const csvContent = [
//       [
//         "Date",
//         "Voucher Type",
//         "Voucher No",
//         "Ledger",
//         "Narration",
//         "Debit",
//         "Credit",
//       ],
//       ...filteredEntries.map((e) => [
//         formatDate(e.date),
//         e.voucher,
//         e.number,
//         e.ledger,
//         e.narration,
//         e.debit,
//         e.credit,
//       ]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `daybook-${fromDate}-to-${toDate}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 font-[monospace]">
//       <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
//         {/* HEADER */}
//         <div className="bg-blue-800 text-white p-4 border-b border-blue-700">
//           <h1 className="text-xl font-bold">Day Book</h1>
//           <p className="text-blue-200 text-sm">
//             Period: {fromDate && formatDate(fromDate)} to{" "}
//             {toDate && formatDate(toDate)}
//           </p>
//         </div>

//         {/* TOOLBAR */}
//         <div className="bg-gray-100 border-b border-gray-300 p-2">
//           <div className="flex justify-between items-center">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
//             >
//               <Filter size={14} />
//               <span>Filters</span>
//             </button>

//             <div className="flex space-x-2">
//               <button
//                 onClick={handleExport}
//                 className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
//               >
//                 <Download size={14} />
//                 <span>Export</span>
//               </button>

//               <button
//                 onClick={() => window.print()}
//                 className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
//               >
//                 <Printer size={14} />
//                 <span>Print</span>
//               </button>
//             </div>
//           </div>

//           {/* FILTER PANEL */}
//           {showFilters && (
//             <div className="mt-3 p-3 bg-white border border-gray-300 rounded grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div>
//                 <label className="block text-xs mb-1">From Date</label>
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs mb-1">To Date</label>
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs mb-1">Voucher Type</label>
//                 <select
//                   value={voucherType}
//                   onChange={(e) => setVoucherType(e.target.value)}
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 >
//                   <option>All</option>
//                   <option>Sales</option>
//                   <option>Purchase</option>
//                   <option>Receipt</option>
//                   <option>Payment</option>
//                   <option>Journal</option>
//                   <option>Contra</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs mb-1">Search</label>
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search ledger, narration, voucher..."
//                   className="w-full p-1 border border-gray-300 rounded bg-gray-50"
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* TABLE */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr className="bg-blue-900 text-white text-left">
//                 <th className="p-2 border">Date</th>
//                 <th className="p-2 border">Voucher</th>
//                 <th className="p-2 border">No</th>
//                 <th className="p-2 border">Ledger</th>
//                 <th className="p-2 border">Narration</th>
//                 <th className="p-2 border text-right">Debit</th>
//                 <th className="p-2 border text-right">Credit</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredEntries.length > 0 ? (
//                 filteredEntries.map((e) => (
//                   <tr key={e.id} className="border-b">
//                     <td className="p-2 border">{formatDate(e.date)}</td>
//                     <td className="p-2 border">
//                       <span
//                         className={`px-2 py-1 rounded text-xs border ${getVoucherColor(
//                           e.voucher
//                         )}`}
//                       >
//                         {e.voucher}
//                       </span>
//                     </td>
//                     <td className="p-2 border">{e.number}</td>
//                     <td className="p-2 border">{e.ledger}</td>
//                     <td className="p-2 border">{e.narration || "-"}</td>
//                     <td className="p-2 border text-right">
//                       {e.debit > 0 ? `₹${e.debit.toLocaleString()}` : "-"}
//                     </td>
//                     <td className="p-2 border text-right">
//                       {e.credit > 0 ? `₹${e.credit.toLocaleString()}` : "-"}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="p-4 text-center text-gray-500">
//                     No vouchers found
//                   </td>
//                 </tr>
//               )}
//             </tbody>

//             {/* TOTALS */}
//             <tfoot>
//               <tr className="bg-gray-100 font-bold border-t">
//                 <td colSpan="5" className="p-2 border text-right">Total:</td>
//                 <td className="p-2 border text-right text-green-700">
//                   ₹{totalDebit.toLocaleString()}
//                 </td>
//                 <td className="p-2 border text-right text-red-700">
//                   ₹{totalCredit.toLocaleString()}
//                 </td>
//               </tr>

//               <tr className="bg-blue-50 font-bold">
//                 <td colSpan="5" className="p-2 border text-right">
//                   Closing Balance:
//                 </td>
//                 <td colSpan="2" className="p-2 border text-right">
//                   {closingBalance >= 0 ? "₹" : "-₹"}
//                   {Math.abs(closingBalance).toLocaleString()}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DayBook;


// import React, { useState, useEffect } from "react";
// import { Download, Printer, Filter } from "lucide-react";
// import { useCompany } from "../context/CompanyContext";
// import axios from "axios";

// const DayBook = () => {
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [voucherType, setVoucherType] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [entries, setEntries] = useState([]);

//   const { companyId } = useCompany();

//   // ---------------- FETCH LOGIC ----------------
//   useEffect(() => {
//     if (!companyId) return;

//     const fetchData = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:3000/api/v1/daybook/${companyId}`
//         );

//         let cleaned = res.data.map((e) => ({
//           ...e,
//           debit: parseFloat(e.debit) || 0,
//           credit: parseFloat(e.credit) || 0,
//           ledger: e.ledger || "-",
//           narration: e.narration || "",
//         }));

//         cleaned.sort((a, b) => new Date(a.date) - new Date(b.date));

//         setEntries(cleaned);

//         const dates = cleaned.map((e) =>
//           new Date(e.date).toISOString().slice(0, 10)
//         );

//         setFromDate(dates[0]);
//         setToDate(dates[dates.length - 1]);
//       } catch (err) {
//         console.log("DayBook Error:", err);
//       }
//     };

//     fetchData();
//   }, [companyId]);

//   // SAFETY LOADING
//   if (!fromDate || !toDate) {
//     return (
//       <div className="p-4 text-center text-gray-500 font-mono">
//         Loading vouchers...
//       </div>
//     );
//   }

//   // ---------------- FILTER LOGIC ----------------
//   // const filteredEntries = entries.filter((e) => {
//   //   const entryTime = new Date(e.date).getTime();
//   //   const start = new Date(fromDate).getTime();
//   //   const end = new Date(toDate).getTime();

//   //   const matchDate = entryTime >= start && entryTime <= end;
//   //   const matchType = voucherType === "All" || e.voucher === voucherType;

//   //   const q = searchQuery.toLowerCase();

//   //   return (
//   //     matchDate &&
//   //     matchType &&
//   //     (String(e.ledger).toLowerCase().includes(q) ||
//   //       String(e.narration).toLowerCase().includes(q) ||
//   //       String(e.voucher).toLowerCase().includes(q))
//   //   );
//   // });

//   // ---------------- TOTALS ----------------

//   const totalDebit = entries.reduce((a, b) => a + b.debit, 0);
//   const totalCredit = entries.reduce((a, b) => a + b.credit, 0);
//   const closingBalance = totalDebit - totalCredit;

//   const getVoucherColor = (v) => {
//     const colors = {
//       Sales: "text-green-600 bg-green-50 border-green-200",
//       Purchase: "text-blue-600 bg-blue-50 border-blue-200",
//       Receipt: "text-emerald-600 bg-emerald-50 border-emerald-200",
//       Payment: "text-red-600 bg-red-50 border-red-200",
//       Journal: "text-purple-600 bg-purple-50 border-purple-200",
//       Contra: "text-orange-600 bg-orange-50 border-orange-200",
//       Default: "text-gray-600 bg-gray-50 border-gray-200",
//     };
//     return colors[v] || colors.Default;
//   };

//   const formatDate = (d) =>
//     new Date(d).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//   // ---------------- EXPORT CSV ----------------
//   const handleExport = () => {
//     const csv = [
//       ["Date", "Voucher", "No", "Ledger", "Narration", "Debit", "Credit"],
//       ...entries.map((e) => [
//         formatDate(e.date),
//         e.voucher,
//         e.number,
//         e.ledger,
//         e.narration,
//         e.debit,
//         e.credit,
//       ]),
//     ]
//       .map((r) => r.join(","))
//       .join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "DayBook.csv";
//     a.click();
//   };

//   // ---------------- PRINT ONLY TABLE ----------------
//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <>
//       {/* Hidden print-only styles */}
//       <style>
//         {`
//         @media print {
//             body * {
//                 visibility: hidden;
//             }
//             #daybook-print-area, #daybook-print-area * {
//                 visibility: visible;
//             }
//             #daybook-print-area {
//                 position: absolute;
//                 left: 0;
//                 top: 0;
//                 width: 100%;
//             }
//         }
//     `}
//       </style>

//       <div className="min-h-screen bg-gray-50 font-[monospace]">
//         <div
//           id="daybook-print-area"
//           className="max-w-7xl mx-auto bg-white shadow-lg border rounded-lg"
//         >
//           {/* HEADER */}
//           <div className="bg-blue-800 p-4 text-white flex justify-between items-center">
//             <div>
//               <h1 className="text-xl font-bold">Day Book</h1>
//               <p className="text-blue-200 text-sm">
//                 Period: {formatDate(fromDate)} to {formatDate(toDate)}
//               </p>
//             </div>

//             {/* BUTTONS */}
//             <div className="flex space-x-2 no-print">
//               <button
//                 onClick={handleExport}
//                 className="px-3 py-1 bg-white  text-blue-800 border border-gray-300 rounded text-sm flex items-center space-x-1"
//               >
//                 <Download size={14} /> <span>Export</span>
//               </button>

//               <button
//                 onClick={handlePrint}
//                 className="px-3 py-1 bg-white text-blue-800 border border-gray-300 rounded text-sm flex items-center space-x-1"
//               >
//                 <Printer size={14} /> <span>Print</span>
//               </button>
//             </div>
//           </div>

//           {/* TABLE */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-blue-900 text-white">
//                   <th className="p-2 border">Date</th>
//                   <th className="p-2 border">Voucher</th>
//                   <th className="p-2 border">No</th>
//                   <th className="p-2 border">Ledger</th>
//                   <th className="p-2 border">Narration</th>
//                   <th className="p-2 border text-right">Debit</th>
//                   <th className="p-2 border text-right">Credit</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {entries.length > 0 ? (
//                   entries.map((e) => (
//                     <tr key={e.id}>
//                       <td className="p-2 border">{formatDate(e.date)}</td>
//                       <td className="p-2 border">
//                         <span
//                           className={`px-2 py-1 text-xs border rounded ${getVoucherColor(
//                             e.voucher
//                           )}`}
//                         >
//                           {e.voucher}
//                         </span>
//                       </td>
//                       <td className="p-2 border">{e.number}</td>
//                       <td className="p-2 border">{e.ledger}</td>
//                       <td className="p-2 border">{e.narration}</td>
//                       <td className="p-2 border text-right">
//                         {e.debit ? `₹${e.debit}` : "-"}
//                       </td>
//                       <td className="p-2 border text-right">
//                         {e.credit ? `₹${e.credit}` : "-"}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="p-3 text-center text-gray-500">
//                       No vouchers found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>

//               <tfoot>
//                 <tr className="bg-gray-100 font-bold">
//                   <td colSpan="5" className="p-2 border text-right">
//                     Total:
//                   </td>
//                   <td className="p-2 border text-right">₹{totalDebit}</td>
//                   <td className="p-2 border text-right">₹{totalCredit}</td>
//                 </tr>

//                 <tr className="bg-blue-50 font-bold">
//                   <td colSpan="5" className="p-2 border text-right">
//                     Closing Balance:
//                   </td>
//                   <td colSpan="2" className="p-2 border text-right">
//                     {closingBalance >= 0 ? "₹" : "-₹"}
//                     {Math.abs(closingBalance)}
//                   </td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DayBook;


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
  const [allEntries, setAllEntries] = useState([]); // Store all entries for filtering

  const { companyId } = useCompany();

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // ---------------- FETCH LOGIC ----------------
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

        // Store all entries
        setAllEntries(cleaned);
        
        // // Set today's date as default
        // const today = getTodayDate();
        // setFromDate(today);
        // setToDate(today);
        const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const format = (d) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD

  setFromDate(format(yesterday));
  setToDate(format(today));

        // Filter entries for today
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

  // ---------------- FILTER LOGIC ----------------
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

  // SAFETY LOADING
  if (!fromDate || !toDate) {
    return (
      <div className="p-4 text-center text-gray-500 font-mono">
        Loading vouchers...
      </div>
    );
  }

  // ---------------- TOTALS ----------------
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

  // ---------------- EXPORT CSV ----------------
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

  // ---------------- PRINT ONLY TABLE ----------------
  const handlePrint = () => {
    window.print();
  };

  // ---------------- FILTERS COMPONENT ----------------
  const Filters = () => (
    <div className="p-4 border-b bg-gray-50 no-print">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Range */}
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

        {/* Voucher Type Filter */}
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

        {/* Search */}
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

      {/* Today Button */}
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
      {/* Hidden print-only styles */}
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
          {/* HEADER */}
          <div className="bg-blue-800 p-4 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Day Book</h1>
              <p className="text-blue-200 text-sm">
                {fromDate === toDate 
                  ? `Date: ${formatDate(fromDate)} (Today)`
                  :"Showing Todays Report"
                  // : `Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`
                }
              </p>
            </div>

            {/* BUTTONS */}
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

          {/* FILTERS */}
          {showFilters && <Filters />}

          {/* TABLE */}
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




// DayBook.jsx
// import React, { useState, useMemo } from "react";
// import { Calendar, Search } from "lucide-react";

// const DayBook = () => {
//   const [fromDate, setFromDate] = useState("2025-01-01");
//   const [toDate, setToDate] = useState("2025-01-31");
//   const [voucherType, setVoucherType] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   // SAMPLE DATA - Replace with API later
//   const [entries] = useState([
//     {
//       id: 1,
//       date: "2025-01-02",
//       voucher: "Sales",
//       number: "S-101",
//       ledger: "Customer A",
//       drAmount: 0,
//       crAmount: 15000,
//     },
//     {
//       id: 2,
//       date: "2025-01-05",
//       voucher: "Purchase",
//       number: "P-204",
//       ledger: "Supplier B",
//       drAmount: 22000,
//       crAmount: 0,
//     },
//     {
//       id: 3,
//       date: "2025-01-07",
//       voucher: "Receipt",
//       number: "R-55",
//       ledger: "Bank",
//       drAmount: 10000,
//       crAmount: 0,
//     },
//     {
//       id: 4,
//       date: "2025-01-08",
//       voucher: "Payment",
//       number: "PY-20",
//       ledger: "Vendor C",
//       drAmount: 0,
//       crAmount: 8000,
//     },
//     {
//       id: 5,
//       date: "2025-01-12",
//       voucher: "Sales",
//       number: "S-102",
//       ledger: "Customer B",
//       drAmount: 0,
//       crAmount: 12000,
//     },
//   ]);

//   // FILTER + RUNNING BALANCE
//   const filteredEntries = useMemo(() => {
//     return entries
//       .filter((e) => {
//         const matchDate = e.date >= fromDate && e.date <= toDate;
//         const matchType = voucherType === "All" || e.voucher === voucherType;
//         const matchSearch =
//           e.ledger.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           e.voucher.toLowerCase().includes(searchQuery.toLowerCase());
//         return matchDate && matchType && matchSearch;
//       })
//       .map((e, idx, arr) => {
//         const prev = idx === 0 ? 0 : arr[idx - 1].runningBalance || 0;
//         const runningBalance = prev + e.drAmount - e.crAmount;
//         return { ...e, runningBalance };
//       });
//   }, [entries, fromDate, toDate, voucherType, searchQuery]);

//   const totalInward = filteredEntries.reduce((sum, e) => sum + e.drAmount, 0);
//   const totalOutward = filteredEntries.reduce((sum, e) => sum + e.crAmount, 0);
//   const closingBalance =
//     filteredEntries.length > 0
//       ? filteredEntries[filteredEntries.length - 1].runningBalance || 0
//       : 0;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* HEADER */}
//       {/* <h1 className="text-2xl font-bold text-blue-900 mb-5">
//         Day Book (Tally Prime Style)
//       </h1> */}

//       {/* FILTERS */}
//       <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         {/* From Date */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             From Date
//           </label>
//           <div className="flex items-center bg-gray-100 p-2 rounded mt-1">
//             <Calendar className="mr-2 text-gray-500" size={18} />
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="bg-transparent outline-none w-full"
//             />
//           </div>
//         </div>

//         {/* To Date */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             To Date
//           </label>
//           <div className="flex items-center bg-gray-100 p-2 rounded mt-1">
//             <Calendar className="mr-2 text-gray-500" size={18} />
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="bg-transparent outline-none w-full"
//             />
//           </div>
//         </div>

//         {/* Voucher Type */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Voucher Type
//           </label>
//           <select
//             value={voucherType}
//             onChange={(e) => setVoucherType(e.target.value)}
//             className="mt-1 w-full p-2 bg-gray-100 rounded outline-none"
//           >
//             <option>All</option>
//             <option>Sales</option>
//             <option>Purchase</option>
//             <option>Receipt</option>
//             <option>Payment</option>
//           </select>
//         </div>

//         {/* Search */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Search
//           </label>
//           <div className="flex items-center bg-gray-100 p-2 rounded mt-1">
//             <Search size={18} className="mr-2 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Ledger / Voucher..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="bg-transparent outline-none w-full"
//             />
//           </div>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-blue-900 text-white">
//             <tr>
//               <th className="p-3 text-left">Date</th>
//               <th className="p-3 text-left">Voucher</th>
//               <th className="p-3 text-left">No.</th>
//               <th className="p-3 text-left">Particulars</th>
//               <th className="p-3 text-right">Inward (Dr)</th>
//               <th className="p-3 text-right">Outward (Cr)</th>
//               <th className="p-3 text-right">Balance</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredEntries.length > 0 ? (
//               filteredEntries.map((e) => (
//                 <tr
//                   key={e.id}
//                   className="border-b hover:bg-blue-50 transition"
//                 >
//                   <td className="p-3">{e.date}</td>
//                   <td className="p-3">{e.voucher}</td>
//                   <td className="p-3">{e.number}</td>
//                   <td className="p-3">{e.ledger}</td>
//                   <td className="p-3 text-right font-medium">
//                     {e.drAmount ? `₹ ${e.drAmount.toLocaleString()}` : "-"}
//                   </td>
//                   <td className="p-3 text-right font-medium">
//                     {e.crAmount ? `₹ ${e.crAmount.toLocaleString()}` : "-"}
//                   </td>
//                   <td className="p-3 text-right font-semibold text-blue-700">
//                     ₹ {Math.abs(e.runningBalance).toLocaleString()}
//                     {e.runningBalance >= 0 ? " Dr" : " Cr"}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="text-center p-6 text-gray-500 italic"
//                 >
//                   No entries found for the selected criteria
//                 </td>
//               </tr>
//             )}
//           </tbody>

//           {/* FOOTER - TOTALS */}
//           <tfoot className="bg-blue-100 font-bold text-gray-800">
//             <tr>
//               <td colSpan={4} className="p-3 text-left">
//                 Total
//               </td>
//               <td className="p-3 text-right">
//                 ₹ {totalInward.toLocaleString()}
//               </td>
//               <td className="p-3 text-right">
//                 ₹ {totalOutward.toLocaleString()}
//               </td>
//               <td className="p-3 text-right">
//                 ₹ {Math.abs(closingBalance).toLocaleString()}{" "}
//                 {closingBalance >= 0 ? "Dr" : "Cr"}
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DayBook;