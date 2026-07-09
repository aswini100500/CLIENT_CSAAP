
// import React, { useState } from "react";
// import { Calendar, Plus, Trash2 } from "lucide-react";
// import Swal from "sweetalert2";

// const PaymentVoucher = () => {
//   const ledgers = [
//     "Cash",
//     "Bank Account",
//     "Purchase A/c",
//     "Sales A/c",
//     "GST Payable",
//     "GST Receivable",
//     "Contract Expenses",
//     "Transportation",
//   ];

//   const [voucherNo, setVoucherNo] = useState("1");
//   const [date, setDate] = useState("");

//   const [entries, setEntries] = useState([
//     { ledger: "", debit: "", credit: "" },
//   ]);

//   const [narration, setNarration] = useState("");

//   // ✅ Store all saved vouchers
//   const [savedVouchers, setSavedVouchers] = useState([]);

//   // ✅ Add Row
//   const addRow = () => {
//     setEntries([...entries, { ledger: "", debit: "", credit: "" }]);

//     Swal.fire({
//       icon: "success",
//       title: "Row Added",
//       text: "A new ledger row has been added.",
//       timer: 1200,
//       showConfirmButton: false,
//     });
//   };

//   // ✅ Remove Row
//   const removeRow = (index) => {
//     setEntries(entries.filter((_, i) => i !== index));

//     Swal.fire({
//       icon: "warning",
//       title: "Row Removed",
//       text: "The ledger row has been removed.",
//       timer: 1200,
//       showConfirmButton: false,
//     });
//   };

//   const updateField = (index, field, value) => {
//     const updated = [...entries];
//     updated[index][field] = value;
//     setEntries(updated);
//   };

//   const totalDebit = entries.reduce(
//     (sum, row) => sum + (parseFloat(row.debit) || 0),
//     0
//   );
//   const totalCredit = entries.reduce(
//     (sum, row) => sum + (parseFloat(row.credit) || 0),
//     0
//   );

//   // ✅ Save Voucher
//   const saveVoucher = () => {
//     if (!date) {
//       Swal.fire("Missing Date", "Please select voucher date", "error");
//       return;
//     }

//     if (entries.some((e) => !e.ledger)) {
//       Swal.fire("Missing Ledger", "All rows must have ledger selected", "error");
//       return;
//     }

//     if (totalDebit !== totalCredit) {
//       Swal.fire(
//         "Debit/Credit Mismatch",
//         "Total debit and credit must be equal.",
//         "error"
//       );
//       return;
//     }

//     // ✅ Create voucher object
//     const voucherData = {
//       voucherNo,
//       date,
//       entries,
//       totalDebit,
//       totalCredit,
//       narration,
//     };

//     // ✅ Store in table below
//     setSavedVouchers([...savedVouchers, voucherData]);

//     Swal.fire({
//       icon: "success",
//       title: "Voucher Saved",
//       text: "Your payment voucher has been successfully saved.",
//     });

//     // ✅ Reset form
//     setVoucherNo((prev) => String(Number(prev) + 1));
//     setDate("");
//     setEntries([{ ledger: "", debit: "", credit: "" }]);
//     setNarration("");
//   };

//   return (
//     <>
//       {/* MAIN FORM */}
//       <div className="w-full max-w-5xl mx-auto bg-white border border-gray-300 p-6 shadow-lg mt-5 rounded-md font-[calibri]">

//         <div className="text-center text-xl font-bold text-blue-700 border-b pb-2 mb-4">
//           Payment Voucher
//         </div>

//         {/* Top Inputs */}
//         <div className="grid grid-cols-3 gap-4 mb-4">
//           <div>
//             <label className="text-gray-600 text-sm">Voucher No:</label>
//             <input
//               type="text"
//               value={voucherNo}
//               onChange={(e) => {
//                 setVoucherNo(e.target.value);
//               }}
//               className="w-full border px-2 py-1 rounded focus:outline-blue-500"
//             />
//           </div>

//           <div>
//             <label className="text-gray-600 text-sm flex items-center gap-1">
//               <Calendar size={16} /> Date:
//             </label>
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => {
//                 setDate(e.target.value);
//               }}
//               className="w-full border px-2 py-1 rounded focus:outline-blue-500"
//             />
//           </div>
//         </div>

//         {/* Ledger Table */}
//         <table className="w-full border text-sm">
//           <thead className="bg-gray-100">
//             <tr className="border">
//               <th className="p-2 text-left w-1/2">Particulars</th>
//               <th className="p-2 text-right w-1/4">Debit</th>
//               <th className="p-2 text-right w-1/4">Credit</th>
//               <th className="p-2 w-10"></th>
//             </tr>
//           </thead>

//           <tbody>
//             {entries.map((row, index) => (
//               <tr key={index} className="border">
//                 <td className="p-1">
//                   <select
//                     value={row.ledger}
//                     onChange={(e) =>
//                       updateField(index, "ledger", e.target.value)
//                     }
//                     className="w-full border px-1 py-1 rounded focus:outline-blue-500"
//                   >
//                     <option value="">Select Ledger</option>
//                     {ledgers.map((ledger, idx) => (
//                       <option key={idx} value={ledger}>
//                         {ledger}
//                       </option>
//                     ))}
//                   </select>
//                 </td>

//                 <td className="p-1">
//                   <input
//                     type="number"
//                     value={row.debit}
//                     onChange={(e) =>
//                       updateField(index, "debit", e.target.value)
//                     }
//                     className="w-full text-right border-b px-1 py-1 focus:outline-blue-500"
//                   />
//                 </td>

//                 <td className="p-1">
//                   <input
//                     type="number"
//                     value={row.credit}
//                     onChange={(e) =>
//                       updateField(index, "credit", e.target.value)
//                     }
//                     className="w-full text-right border-b px-1 py-1 focus:outline-blue-500"
//                   />
//                 </td>

//                 <td className="text-center">
//                   {index > 0 && (
//                     <button
//                       onClick={() => removeRow(index)}
//                       className="text-red-500"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>

//           <tfoot>
//             <tr className="bg-gray-200 font-semibold">
//               <td className="p-2">Total</td>
//               <td className="p-2 text-right">{totalDebit.toFixed(2)}</td>
//               <td className="p-2 text-right">{totalCredit.toFixed(2)}</td>
//               <td></td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* Add Row Button */}
//         <div className="mt-3">
//           <button
//             onClick={addRow}
//             className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
//           >
//             <Plus size={16} /> Add Ledger Row
//           </button>
//         </div>

//         {/* Narration */}
//         <div className="mt-4">
//           <label className="text-gray-600 text-sm">Narration:</label>
//           <textarea
//             value={narration}
//             onChange={(e) => setNarration(e.target.value)}
//             className="w-full border px-2 py-2 rounded h-20 text-sm focus:outline-blue-500"
//             placeholder="Description..."
//           ></textarea>
//         </div>

//         {/* Footer Buttons */}
//         <div className="mt-5 flex justify-end gap-3">
//           <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
//             Cancel
//           </button>

//           <button
//             onClick={saveVoucher}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Save Voucher
//           </button>
//         </div>
//       </div>

//       {/* ✅ TABLE OF SAVED VOUCHERS BELOW */}
//       <div className="w-full max-w-5xl mx-auto bg-white border mt-6 p-4 shadow rounded">

//         <h2 className="text-lg font-bold text-gray-700 mb-3">
//           Saved Payment Vouchers
//         </h2>

//         {savedVouchers.length === 0 ? (
//           <p className="text-gray-500 text-sm">No vouchers saved yet.</p>
//         ) : (
//           <table className="w-full border text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 border">Voucher No</th>
//                 <th className="p-2 border">Date</th>
//                 <th className="p-2 border">Total</th>
//                 <th className="p-2 border">Narration</th>
//               </tr>
//             </thead>
//             <tbody>
//               {savedVouchers.map((v, i) => (
//                 <tr key={i} className="border">
//                   <td className="p-2 border">{v.voucherNo}</td>
//                   <td className="p-2 border">{v.date}</td>
//                   <td className="p-2 border">{v.totalDebit.toFixed(2)}</td>
//                   <td className="p-2 border">{v.narration}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </>
//   );
// };

// export default PaymentVoucher;



// import React, { useState, useEffect } from "react";
// import { Calendar, Plus, Trash2 } from "lucide-react";
// import Swal from "sweetalert2";
// import axios from "axios";
// import { useCompany } from "../context/CompanyContext";

// const PaymentVoucher = () => {
//   const { companyId } = useCompany();

//   const [ledgers, setLedgers] = useState([]); // ⭐ FETCHED FROM BACKEND
//   const [voucherNo, setVoucherNo] = useState("1");
//   const [date, setDate] = useState("");
//   const [entries, setEntries] = useState([{ ledger: "", debit: "", credit: "" }]);
//   const [narration, setNarration] = useState("");
//   const [savedVouchers, setSavedVouchers] = useState([]);

//   // 📌 Fetch Ledgers Dynamically
//   useEffect(() => {
//     const fetchLedgers = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:3000/api/v1/ledger/${companyId}/all`
//         );
//         console.log(res);

//         setLedgers(res.data|| []);
//       } catch (err) {
//         console.error("Ledger Fetch Error:", err);
//       }
//     };

//     if (companyId) fetchLedgers();
//   }, [companyId]);
//     console.log(ledgers);

//   // 📌 Fetch Existing Vouchers
//   useEffect(() => {
//     const fetchVouchers = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:3000/api/v1/payment-voucher/all/${companyId}`
//         );
//         setSavedVouchers(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     if (companyId) fetchVouchers();
//   }, [companyId]);

//   // ➕ Add Row
//   const addRow = () => {
//     setEntries([...entries, { ledger: "", debit: "", credit: "" }]);
//   };

//   // ❌ Delete Row
//   const removeRow = (index) => {
//     setEntries(entries.filter((_, i) => i !== index));
//   };

//   // Update row
//   const updateField = (index, field, value) => {
//     const updated = [...entries];
//     updated[index][field] = value;
//     setEntries(updated);
//   };

//   const totalDebit = entries.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0);
//   const totalCredit = entries.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0);

//   // 💾 SAVE VOUCHER
//   const saveVoucher = async () => {
//     if (!date) return Swal.fire("Error", "Please select a date", "error");
//     if (entries.some((e) => !e.ledger))
//       return Swal.fire("Error", "Ledger empty", "error");

//     // if (totalDebit !== totalCredit)
//     //   return Swal.fire("Error", "Debit & Credit mismatch", "error");

//     // Map entries to include ledgerId and normalize numeric values
//     // const payloadEntries = entries.map((e) => ({
//     //   ledgerId: Number(e.ledger.id) || null,
//     //   debit: parseFloat(e.debit) || 0,
//     //   credit: parseFloat(e.credit) || 0,
//     // }));
// const payloadEntries = entries.map((e) => {
//   const ledgerId = e.ledger ? (Number(e.ledger) || null) : null;
//   return {
//     ledgerId,
//     debit: parseFloat(e.debit) || 0,
//     credit: parseFloat(e.credit) || 0,
//   };
// });

//     const payload = {
//       voucherNo,
//       date,
//       narration,
//       totalDebit,
//       totalCredit,

//       entries: payloadEntries,
//     };

//     try {
//       await axios.post(
//         `http://localhost:3000/api/v1/payment-voucher/create/${companyId}`,
//         payload
//       );

//       Swal.fire("Saved", "Voucher saved successfully", "success");

//       setSavedVouchers([...savedVouchers, payload]);

//       setVoucherNo(String(Number(voucherNo) + 1));
//       setDate("");
//       setEntries([{ ledger: "", debit: "", credit: "" }]);
//       setNarration("");
//     } catch (err) {
//       console.error(err);
//       Swal.fire("Error", "Failed to save voucher", "error");
//     }
//   };

//   return (
//     <>
//       <div className="w-full max-w-5xl mx-auto bg-white border p-6 shadow-lg mt-5 rounded-md font-[calibri]">
//         <div className="text-center text-xl font-bold text-blue-700 border-b pb-2 mb-4">
//           Payment Voucher
//         </div>

//         {/* Top Inputs */}
//         <div className="grid grid-cols-3 gap-4 mb-4">
//           <div>
//             <label className="text-gray-600 text-sm">Voucher No:</label>
//             <input
//               type="text"
//               value={voucherNo}
//               onChange={(e) => setVoucherNo(e.target.value)}
//               className="w-full border px-2 py-1 rounded"
//             />
//           </div>

//           <div>
//             <label className="text-gray-600 text-sm flex items-center gap-1">
//               <Calendar size={16} /> Date:
//             </label>
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="w-full border px-2 py-1 rounded"
//             />
//           </div>
//         </div>

//         {/* Voucher Table */}
//         <table className="w-full border text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 text-left">Particulars</th>
//               <th className="p-2 text-right">Debit</th>
//               <th className="p-2 text-right">Credit</th>
//               <th></th>
//             </tr>
//           </thead>

//           <tbody>
//             {entries.map((row, index) => (
//               <tr key={index} className="border">
//                 <td className="p-1">
//                   <select
//                     value={row.ledger}
//                     onChange={(e) => updateField(index, "ledger", e.target.value)}
//                     className="w-full border px-1 py-1 rounded"
//                   >
//                     <option value="">Select Ledger</option>

//                     {ledgers.map((lg) => (
//                       <option key={lg.id} value={lg.id}>
//                         {lg.ledgerName || lg.name}
//                       </option>
//                     ))}
//                   </select>
//                 </td>

//                 <td className="p-1">
//                   <input
//                     type="number"
//                     value={row.debit}
//                     onChange={(e) => updateField(index, "debit", e.target.value)}
//                     className="w-full text-right border px-1 py-1"
//                   />
//                 </td>

//                 <td className="p-1">
//                   <input
//                     type="number"
//                     value={row.credit}
//                     onChange={(e) => updateField(index, "credit", e.target.value)}
//                     className="w-full text-right border px-1 py-1"
//                   />
//                 </td>

//                 <td className="text-center">
//                   {index > 0 && (
//                     <button onClick={() => removeRow(index)} className="text-red-500">
//                       <Trash2 size={16} />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>

//           <tfoot>
//             <tr className="bg-gray-200 font-semibold">
//               <td className="p-2">Total</td>
//               <td className="p-2 text-right">{totalDebit.toFixed(2)}</td>
//               <td className="p-2 text-right">{totalCredit.toFixed(2)}</td>
//               <td></td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* Add Row */}
//         <button onClick={addRow} className="mt-3 flex items-center gap-1 text-blue-600">
//           <Plus size={16} /> Add Ledger Row
//         </button>

//         {/* Narration */}
//         <div className="mt-4">
//           <label className="text-gray-600 text-sm">Narration:</label>
//           <textarea
//             value={narration}
//             onChange={(e) => setNarration(e.target.value)}
//             className="w-full border px-2 py-2 rounded h-20"
//           ></textarea>
//         </div>

//         {/* Save */}
//         <div className="mt-5 flex justify-end gap-3">
//           <button className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
//           <button
//             onClick={saveVoucher}
//             className="px-4 py-2 bg-blue-600 text-white rounded"
//           >
//             Save Voucher
//           </button>
//         </div>
//       </div>

//       {/* SAVED TABLE */}
//       <div className="w-full max-w-5xl mx-auto bg-white border mt-6 p-4 shadow rounded">
//         <h2 className="text-lg font-bold mb-3">Saved Payment Vouchers</h2>

//         {savedVouchers.length === 0 ? (
//           <p>No vouchers saved yet.</p>
//         ) : (
//           <table className="w-full border text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 border">Voucher No</th>
//                 <th className="p-2 border">Date</th>
//                 <th className="p-2 border">Total</th>
//                 <th className="p-2 border">Narration</th>
//               </tr>
//             </thead>

//             <tbody>
//               {savedVouchers.map((v, i) => (
//                 <tr key={i} className="border">
//                   <td className="p-2 border">{v.voucherNo}</td>
//                   <td className="p-2 border">{v.date}</td>
//                   <td className="p-2 border">{v.totalDebit}</td>
//                   <td className="p-2 border">{v.narration}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </>
//   );
// };

// export default PaymentVoucher;




// import React, { useState, useEffect } from "react";
// import { Calendar, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
// import Swal from "sweetalert2";
// import axios from "axios";
// import { useCompany } from "../context/CompanyContext";

// const PaymentVoucher = () => {
//   const { companyId } = useCompany();

//   const [ledgers, setLedgers] = useState([]);
//   const [voucherNo, setVoucherNo] = useState("1");
//   const [date, setDate] = useState("");
//   const [entries, setEntries] = useState([{ ledger: "", debit: "", credit: "" }]);
//   const [narration, setNarration] = useState("");
//   const [savedVouchers, setSavedVouchers] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // 📌 Fetch Ledgers Dynamically
//   useEffect(() => {
//     const fetchLedgers = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:3000/api/v1/ledger/${companyId}/all`
//         );
//         setLedgers(res.data || []);
//       } catch (err) {
//         console.error("Ledger Fetch Error:", err);
//         Swal.fire("Error", "Failed to fetch ledgers", "error");
//       }
//     };

//     if (companyId) fetchLedgers();
//   }, [companyId]);

//   // 📌 Fetch Existing Vouchers
//   useEffect(() => {
//     const fetchVouchers = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:3000/api/v1/payment-voucher/all/${companyId}`
//         );
//         setSavedVouchers(res.data || []);
//       } catch (err) {
//         console.error("Voucher Fetch Error:", err);
//       }
//     };

//     if (companyId) fetchVouchers();
//   }, [companyId]);

//   // ➕ Add Row
//   const addRow = () => {
//     setEntries([...entries, { ledger: "", debit: "", credit: "" }]);
//   };

//   // ❌ Delete Row
//   const removeRow = (index) => {
//     if (entries.length > 1) {
//       setEntries(entries.filter((_, i) => i !== index));
//     } else {
//       Swal.fire("Info", "At least one row is required", "info");
//     }
//   };

//   // Update row with validation
//   const updateField = (index, field, value) => {
//     const updated = [...entries];

//     // Auto-clear conflicting fields
//     if (field === "debit" && value && updated[index].credit) {
//       updated[index].credit = "";
//     } else if (field === "credit" && value && updated[index].debit) {
//       updated[index].debit = "";
//     }

//     updated[index][field] = value;
//     setEntries(updated);
//   };

//   // Calculate totals with better precision
//   const totalDebit = entries.reduce((sum, r) => {
//     const debitValue = parseFloat(r.debit) || 0;
//     return Math.round((sum + debitValue) * 100) / 100;
//   }, 0);

//   const totalCredit = entries.reduce((sum, r) => {
//     const creditValue = parseFloat(r.credit) || 0;
//     return Math.round((sum + creditValue) * 100) / 100;
//   }, 0);

//   // Check if totals are balanced
//   const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow small floating point differences

//   // Check for validation errors
//   const getValidationErrors = () => {
//     const errors = [];

//     if (!date) errors.push("Please select a date");

//     const emptyLedgers = entries.some((e) => !e.ledger);
//     if (emptyLedgers) errors.push("Please select ledger for all rows");

//     const entriesWithoutAmount = entries.filter(e => !e.debit && !e.credit);
//     if (entriesWithoutAmount.length > 0) errors.push("Please enter amount for all ledgers");

//     const entriesWithBothAmounts = entries.filter(e => e.debit && e.credit);
//     if (entriesWithBothAmounts.length > 0) errors.push("A ledger cannot have both debit and credit");

//     if (!isBalanced) errors.push(`Debit (${totalDebit.toFixed(2)}) and Credit (${totalCredit.toFixed(2)}) must be equal`);

//     return errors;
//   };

//   // 💾 SAVE VOUCHER
//   const saveVoucher = async () => {
//     const validationErrors = getValidationErrors();
//     if (validationErrors.length > 0) {
//       return Swal.fire("Error", validationErrors.join("\n"), "error");
//     }

//     setIsLoading(true);

//     try {
//       const payloadEntries = entries.map((e) => {
//         const ledgerId = e.ledger ? (Number(e.ledger) || null) : null;
//         return {
//           ledgerId,
//           debit: parseFloat(e.debit) || 0,
//           credit: parseFloat(e.credit) || 0,
//         };
//       });

//       const payload = {
//         voucherNo,
//         date,
//         narration,
//         totalDebit,
//         totalCredit,
//         entries: payloadEntries,
//       };

//       console.log("Sending payload:", payload);

//       await axios.post(
//         `http://localhost:3000/api/v1/payment-voucher/create/${companyId}`,
//         payload
//       );

//       Swal.fire("Success", "Voucher saved successfully", "success");

//       // Refresh the vouchers list
//       const vouchRes = await axios.get(
//         `http://localhost:3000/api/v1/payment-voucher/all/${companyId}`
//       );
//       setSavedVouchers(vouchRes.data || []);

//       // Reset form
//       setVoucherNo(String(Number(voucherNo) + 1));
//       setDate("");
//       setEntries([{ ledger: "", debit: "", credit: "" }]);
//       setNarration("");

//     } catch (err) {
//       console.error("Save Error:", err);
//       const errorMessage = err.response?.data?.message || "Failed to save voucher";
//       Swal.fire("Error", errorMessage, "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Get ledger name by ID
//   const getLedgerName = (ledgerId) => {
//     const ledger = ledgers.find(l => l.id.toString() === ledgerId.toString());
//     return ledger ? (ledger.ledgerName || ledger.name) : "Unknown Ledger";
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   };

//   return (
//     <>
//       <div className="w-full max-w-5xl mx-auto bg-white border p-6 shadow-lg mt-5 rounded-md font-[calibri]">
//         <div className="text-center text-xl font-bold text-blue-700 border-b pb-2 mb-4">
//           Payment Voucher
//         </div>

//         {/* Top Inputs */}
//         <div className="grid grid-cols-3 gap-4 mb-4">
//           <div>
//             <label className="text-gray-600 text-sm font-semibold">Voucher No:</label>
//             <input
//               type="text"
//               value={voucherNo}
//               onChange={(e) => setVoucherNo(e.target.value)}
//               className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="text-gray-600 text-sm font-semibold flex items-center gap-1">
//               <Calendar size={16} /> Date:
//             </label>
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="w-full border px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           {/* Balance Status */}
//           <div className="flex items-center justify-center">
//             <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
//               isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//             }`}>
//               {isBalanced ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//               <span className="font-semibold">
//                 {isBalanced ? 'Balanced' : 'Not Balanced'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Totals Display */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div className="bg-blue-50 p-3 rounded-lg border">
//             <div className="text-sm text-blue-600 font-semibold">Total Debit</div>
//             <div className="text-xl font-bold text-blue-800">₹{formatCurrency(totalDebit)}</div>
//           </div>
//           <div className="bg-green-50 p-3 rounded-lg border">
//             <div className="text-sm text-green-600 font-semibold">Total Credit</div>
//             <div className="text-xl font-bold text-green-800">₹{formatCurrency(totalCredit)}</div>
//           </div>
//         </div>

//         {/* Voucher Table */}
//         <table className="w-full border text-sm mb-4">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 text-left border">Particulars</th>
//               <th className="p-2 text-right border w-32">Debit (₹)</th>
//               <th className="p-2 text-right border w-32">Credit (₹)</th>
//               <th className="p-2 text-center border w-16">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {entries.map((row, index) => (
//               <tr key={index} className="border hover:bg-gray-50">
//                 <td className="p-1 border">
//                   <select
//                     value={row.ledger}
//                     onChange={(e) => updateField(index, "ledger", e.target.value)}
//                     className="w-full border px-1 py-1 rounded focus:ring-1 focus:ring-blue-500"
//                   >
//                     <option value="">Select Ledger</option>
//                     {ledgers.map((lg) => (
//                       <option key={lg.id} value={lg.id}>
//                         {lg.ledgerName || lg.name}
//                       </option>
//                     ))}
//                   </select>
//                 </td>

//                 <td className="p-1 border">
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={row.debit}
//                     onChange={(e) => updateField(index, "debit", e.target.value)}
//                     className="w-full text-right border px-1 py-1 focus:ring-1 focus:ring-blue-500"
//                     placeholder="0.00"
//                   />
//                 </td>

//                 <td className="p-1 border">
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={row.credit}
//                     onChange={(e) => updateField(index, "credit", e.target.value)}
//                     className="w-full text-right border px-1 py-1 focus:ring-1 focus:ring-green-500"
//                     placeholder="0.00"
//                   />
//                 </td>

//                 <td className="text-center border">
//                   <button 
//                     onClick={() => removeRow(index)} 
//                     className="text-red-500 hover:text-red-700 p-1 transition-colors"
//                     disabled={entries.length <= 1}
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>

//           <tfoot className="bg-gray-200 font-semibold">
//             <tr>
//               <td className="p-2 border">Grand Total</td>
//               <td className="p-2 text-right border">₹{formatCurrency(totalDebit)}</td>
//               <td className="p-2 text-right border">₹{formatCurrency(totalCredit)}</td>
//               <td className="p-2 border"></td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* Add Row */}
//         <button 
//           onClick={addRow} 
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
//         >
//           <Plus size={16} /> Add Ledger Row
//         </button>

//         {/* Narration */}
//         <div className="mt-4">
//           <label className="text-gray-600 text-sm font-semibold">Narration:</label>
//           <textarea
//             value={narration}
//             onChange={(e) => setNarration(e.target.value)}
//             className="w-full border px-2 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
//             placeholder="Enter voucher narration..."
//           ></textarea>
//         </div>

//         {/* Save Button */}
//         <div className="mt-6 flex justify-end gap-3">
//           <button 
//             className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
//             onClick={() => {
//               setEntries([{ ledger: "", debit: "", credit: "" }]);
//               setNarration("");
//             }}
//           >
//             Clear Form
//           </button>
//           <button
//             onClick={saveVoucher}
//             disabled={isLoading || !isBalanced}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
//           >
//             {isLoading ? "Saving..." : "Save Voucher"}
//             {!isLoading && <CheckCircle size={16} />}
//           </button>
//         </div>
//       </div>

//       {/* SAVED VOUCHERS TABLE */}
//       <div className="w-full max-w-5xl mx-auto bg-white border mt-6 p-4 shadow rounded">
//         <h2 className="text-lg font-bold mb-3 text-gray-800">Saved Payment Vouchers</h2>

//         {savedVouchers.length === 0 ? (
//           <p className="text-gray-500 text-center py-4">No vouchers saved yet.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="p-2 border font-semibold">Voucher No</th>
//                   <th className="p-2 border font-semibold">Date</th>
//                   <th className="p-2 border font-semibold">Total Debit</th>
//                   <th className="p-2 border font-semibold">Total Credit</th>
//                   <th className="p-2 border font-semibold">Narration</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {savedVouchers.map((v, i) => (
//                   <tr key={i} className="border hover:bg-gray-50">
//                     <td className="p-2 border font-mono">{v.voucherNo}</td>
//                     <td className="p-2 border">{v.date}</td>
//                     <td className="p-2 border text-right font-mono">₹{formatCurrency(v.totalDebit)}</td>
//                     <td className="p-2 border text-right font-mono">₹{formatCurrency(v.totalCredit)}</td>
//                     <td className="p-2 border text-sm">{v.narration || "-"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default PaymentVoucher;





import React, { useState, useEffect, useRef } from "react";
import { Trash2, Plus, Search, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import BulkImportButton from "./BulkImportButton";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

// --- Internal Searchable Select Component ---
const SearchableLedgerSelect = ({ ledgers, value, onSelect, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLedger = ledgers.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name);
    }
  }, [selectedLedger]);

  const filtered = ledgers.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedLedger) setSearchTerm(selectedLedger.name);
        else setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLedger]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition pr-8"
          placeholder="Search or add ledger..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-100 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-50 last:border-b-0"
                onClick={() => {
                  onSelect(l.id);
                  setSearchTerm(l.name);
                  setIsOpen(false);
                }}
              >
                {l.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500 italic">No matches found</div>
          )}

          <div
            className="px-3 py-2 text-sm bg-slate-50 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium flex items-center gap-2 border-t border-slate-200"
            onClick={() => {
              onCreateNew(searchTerm);
              setIsOpen(false);
            }}
          >
            <UserPlus size={14} /> Add "{searchTerm || "New Ledger"}"
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentVoucher = () => {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ledgers, setLedgers] = useState([]);
  const [bankCashLedgers, setBankCashLedgers] = useState([]);
  const [voucherNo, setVoucherNo] = useState("1");
  const [date, setDate] = useState("");
  const [accountType, setAccountType] = useState("");
  const [narration, setNarration] = useState("");
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [entries, setEntries] = useState([
    { ledger: "", amount: "", openingBalance: 0, closingBalance: 0, remainingBalance: 0, balanceType: "Debit" },
  ]);
  const [groups, setGroups] = useState([]); // To populate 'under' in quick create

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`
        );
        const allLedgers = res.data || [];
        setLedgers(allLedgers);

        const bankRes = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
        );
        const banks = bankRes.data.accounts || [];

        const bankOptions = banks.map((b) => ({
          id: `bank_${b.id}`,
          name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
          type: "bank",
          originalId: b.id,
        }));

        const cashLedger = allLedgers.find(
          (l) =>
            l.name.toLowerCase().includes("cash") ||
            l.underGroup === "Cash-in-Hand" ||
            l.under === "Cash-in-Hand"
        );

        bankOptions.push(
          cashLedger
            ? { id: `ledger_${cashLedger.id}`, name: cashLedger.name, type: "cash", originalId: cashLedger.id }
            : { id: "cash", name: "Cash", type: "cash", originalId: "cash" }
        );

        setBankCashLedgers(bankOptions);

        const groupRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`);
        setGroups(groupRes.data || []);

        // --- RESTORE STATE IF RETURNING FROM LEDGER CREATION ---
        const savedState = sessionStorage.getItem("paymentVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucherNo(state.voucherNo);
          setDate(state.date);
          setAccountType(state.accountType);
          setNarration(state.narration);
          setEntries(state.entries);
          sessionStorage.removeItem("paymentVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false
          });
        }

        // FETCH VOUCHER DETAILS IF EDITING
        if (id) {
          setIsEditMode(true);
          const voucherRes = await axios.get(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/get/${id}`
          );
          const v = voucherRes.data;
          if (v && v.voucherNo) {
            setVoucherNo(v.voucherNo);
            setDate(v.date ? new Date(v.date).toISOString().split('T')[0] : "");

            // Handle accountType pre-filling (ensure prefix matches bankOptions)
            let rawAccType = v.accountType;
            if (rawAccType && !rawAccType.toString().startsWith("bank_") && !rawAccType.toString().startsWith("ledger_")) {
              // Try to find if it's a bank account or cash ledger
              const isBank = banks.some(b => String(b.id) === String(rawAccType));
              if (isBank) {
                rawAccType = `bank_${rawAccType}`;
              } else {
                rawAccType = `ledger_${rawAccType}`;
              }
            }
            setAccountType(rawAccType);

            setNarration(v.narration || "");
            const entriesList = v.entries || v.items || [];
            if (entriesList.length > 0) {
              setEntries(entriesList.map(item => {
                const ledgerObj = allLedgers.find(l => String(l.id) === String(item.ledgerId));
                const opening = parseFloat(ledgerObj?.openingBalance) || 0;
                const debit = parseFloat(ledgerObj?.debit) || 0;
                const credit = parseFloat(ledgerObj?.credit) || 0;
                const type = ledgerObj?.balanceType || ledgerObj?.type || "Debit";

                let closing = 0;
                if (type === "Debit") {
                  closing = opening + debit - credit;
                } else {
                  closing = opening - debit + credit;
                }

                const amt = parseFloat(item.amount) || 0;
                let rem = 0;
                if (type === "Debit") {
                  rem = closing + amt;
                } else {
                  rem = closing - amt;
                }
                return {
                  ledger: item.ledgerId,
                  amount: item.amount,
                  openingBalance: opening,
                  closingBalance: closing,
                  remainingBalance: rem,
                  balanceType: type
                };
              }));
            }
          }
        } else if (companyId) {
          try {
            const nextRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/payment`);
            if (nextRes.data && nextRes.data.nextNumber) {
              setVoucherNo(nextRes.data.nextNumber);
            }
          } catch (e) { console.error(e); }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (companyId) fetchData();
  }, [companyId, id]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/all/${companyId}`
        );
        setSavedVouchers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVouchers();
  }, [companyId]);

  const formatBalance = (val, originalType) => {
    if (val === 0) return "0.00";
    if (val > 0) {
      return `${val.toFixed(2)} ${originalType === "Debit" ? "Dr" : "Cr"}`;
    } else {
      const absoluteVal = Math.abs(val);
      const flippedType = originalType === "Debit" ? "Cr" : "Dr";
      return `${absoluteVal.toFixed(2)} ${flippedType}`;
    }
  };

  const addRow = () => {
    setEntries([
      ...entries,
      { ledger: "", amount: "", openingBalance: 0, closingBalance: 0, remainingBalance: 0, balanceType: "Debit" },
    ]);
  };

  const removeRow = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const onLedgerSelect = (index, ledgerId) => {
    const ledger = ledgers.find((l) => l.id == ledgerId);
    const opening = parseFloat(ledger?.openingBalance) || 0;
    const debit = parseFloat(ledger?.debit) || 0;
    const credit = parseFloat(ledger?.credit) || 0;
    const type = ledger?.balanceType || ledger?.type || "Debit";

    let closing = 0;
    if (type === "Debit") {
      closing = opening + debit - credit;
    } else {
      closing = opening - debit + credit;
    }

    const updated = [...entries];
    updated[index].ledger = ledgerId;
    updated[index].openingBalance = opening;
    updated[index].closingBalance = closing;
    updated[index].balanceType = type;

    const amt = parseFloat(updated[index].amount) || 0;
    if (type === "Debit") {
      updated[index].remainingBalance = closing + amt;
    } else {
      updated[index].remainingBalance = closing - amt;
    }
    setEntries(updated);
  };

  // --- NAVIGATE TO FULL LEDGER FORM ---
  const handleQuickCreateLedger = async (index, initialName) => {
    // Save current state to session storage
    const stateToSave = {
      voucherNo,
      date,
      accountType,
      narration,
      entries,
      editingIndex: index
    };
    sessionStorage.setItem("paymentVoucherState", JSON.stringify(stateToSave));

    const userStr = sessionStorage.getItem("user");
    let role = "admin";
    if (userStr) {
      const userObj = JSON.parse(userStr);
      role = userObj.role || "admin";
    }
    const basePath = role === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";

    // Navigate to ledger creation with a redirect back parameter
    const redirectPath = id ? `${basePath}/paymentvoucher/${id}` : `${basePath}/paymentvoucher`;
    navigate(`${basePath}/ledger?redirect=${redirectPath}&name=${encodeURIComponent(initialName)}`);
  };

  const updateAmount = (index, value) => {
    const updated = [...entries];
    const amt = parseFloat(value) || 0;
    updated[index].amount = value;

    const closing = parseFloat(updated[index].closingBalance) || 0;
    const type = updated[index].balanceType || "Debit";

    if (type === "Debit") {
      updated[index].remainingBalance = closing + amt;
    } else {
      updated[index].remainingBalance = closing - amt;
    }
    setEntries(updated);
  };

  const totalAmount = entries.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const resetForm = () => {
    setVoucherNo(String(Number(voucherNo) + 1));
    setDate("");
    setAccountType("");
    setEntries([{ ledger: "", amount: "", openingBalance: 0, closingBalance: 0, remainingBalance: 0, balanceType: "Debit" }]);
    setNarration("");
  };

  const handleBulkImport = async (data) => {

    try {

      if (!data || data.length === 0) {

        Swal.fire(
          "Error",
          "No data found in file",
          "error"
        );

        return;
      }

      const firstRow = data[0];

      // ================= REFRESH LEDGERS =================

      const ledgerRes =
        await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`
        );

      let latestLedgers =
        ledgerRes.data || [];

      // ================= REFRESH BANKS =================

      const bankRes =
        await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
        );

      const latestBanks =
        bankRes.data.accounts || [];

      // ================= BUILD BANK/CASH =================

      const latestBankCash =
        latestBanks.map((b) => ({

          id:
            `bank_${b.id}`,

          name:
            b.bankName
              ? `${b.accountName} (${b.bankName})`
              : b.accountName,

          type: "bank",
        }));

      const cashLedger =
        latestLedgers.find(
          (l) =>
            l.name
              ?.toLowerCase()
              .includes("cash") ||

            l.underGroup ===
            "Cash-in-Hand" ||

            l.under ===
            "Cash-in-Hand"
        );

      if (cashLedger) {

        latestBankCash.push({

          id:
            `ledger_${cashLedger.id}`,

          name:
            cashLedger.name,

          type: "cash",
        });

      } else {

        latestBankCash.push({

          id: "cash",
          name: "Cash",
          type: "cash",
        });
      }

      // ================= PAYMENT MODE =================

      const rawPaymentMode =
        String(
          firstRow["Payment Mode"] ||
          firstRow["accountType"] ||
          ""
        )
          .trim()
          .toLowerCase();

      let selectedAccount = "";

      if (rawPaymentMode === "cash") {

        selectedAccount =
          cashLedger
            ? `ledger_${cashLedger.id}`
            : "cash";

      } else {

        let matchedBank =
          latestBankCash.find(
            (b) =>
              b.name
                ?.toLowerCase()
                ?.trim() ===
              rawPaymentMode
          );

        // ================= AUTO CREATE BANK =================

        if (!matchedBank && rawPaymentMode) {

          try {

            const createBank =
              await axios.post(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/create`,
                {

                  accountName:
                    rawPaymentMode,

                  bankName:
                    rawPaymentMode,

                  currentBalance: 0,
                }
              );

            matchedBank = {

              id:
                `bank_${createBank.data.id}`,

              name:
                rawPaymentMode,

              type: "bank",
            };

            latestBankCash.push(
              matchedBank
            );

          } catch (err) {

            console.log(
              "Bank create failed",
              err
            );
          }
        }

        selectedAccount =
          matchedBank?.id || "";
      }

      // ================= IMPORT ENTRIES =================

      const importedEntries = [];

      for (const row of data) {

        const ledgerName =
          String(
            row["Paid To"] ||
            row["ledgerId"] ||
            ""
          )
            .trim();

        let matchedLedger =
          latestLedgers.find(
            (l) =>
              l.name
                ?.toLowerCase()
                ?.trim() ===
              ledgerName
                ?.toLowerCase()
                ?.trim()
          );

        // ===== AUTO CREATE LEDGER =====

        if (!matchedLedger && ledgerName) {

          try {

            // ===== FIND DEFAULT GROUP =====

            const creditorGroup =
              groups.find(
                (g) =>
                  g.groupName ===
                  "Sundry Creditors"
              );

            // ===== CREATE LEDGER =====

            const createRes =
              await axios.post(
                `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`,
                {

                  name:
                    ledgerName,

                  under:
                    JSON.stringify({

                      id:
                        creditorGroup?.id,

                      name:
                        "Sundry Creditors",
                    }),

                  openingBalance: 0,

                  mailingName:
                    ledgerName,

                  address: "",

                  city: "",

                  state:
                    "Odisha",

                  country:
                    "India",

                  pincode: "",

                  pan: "",

                  gstin: "",

                  registrationType:
                    "Regular",

                  companyId,
                }
              );

            // ===== NEW LEDGER =====

            matchedLedger = {

              id:
                createRes.data.id,

              name:
                ledgerName,

              openingBalance: 0,

              closingBalance: 0,

              balanceType:
                "Debit",
            };

            // ===== ADD TO DROPDOWN =====

            latestLedgers.push(
              matchedLedger
            );

          } catch (err) {

            console.log(
              "Ledger auto create failed",
              err
            );
          }
        }

        // ================= CALCULATE CLOSING BALANCE =================
        const opening = parseFloat(matchedLedger?.openingBalance) || 0;
        const debit = parseFloat(matchedLedger?.debit) || 0;
        const credit = parseFloat(matchedLedger?.credit) || 0;
        const type = matchedLedger?.balanceType || "Debit";

        let closing = 0;
        if (type === "Debit") {
          closing = opening + debit - credit;
        } else {
          closing = opening - debit + credit;
        }

        // ================= ADD ENTRY =================

        importedEntries.push({

          ledger:
            matchedLedger
              ? matchedLedger.id
              : "",

          amount:
            row["Amount"] ||
            row["amount"] ||
            "",

          openingBalance:
            opening,

          closingBalance:
            closing,

          remainingBalance:
            closing,

          balanceType:
            type,
        });
      }

      // ================= UPDATE UI =================

      setLedgers(
        latestLedgers
      );

      setBankCashLedgers(
        latestBankCash
      );

      setVoucherNo(
        firstRow["Voucher No"] ||
        firstRow["voucherNo"] ||
        ""
      );

      setDate(
        firstRow["Date"]
          ? new Date(
            firstRow["Date"]
          )
            .toISOString()
            .split("T")[0]
          : new Date()
            .toISOString()
            .split("T")[0]
      );

      setNarration(
        firstRow[
        "Voucher Narration"
        ] ||
        firstRow["narration"] ||
        ""
      );

      setAccountType(
        selectedAccount
      );

      setEntries(
        importedEntries
      );

      Swal.fire({

        icon: "success",

        title:
          "Import Successful",

        text:
          "Imported data loaded successfully. Review and click Save Voucher.",
      });

    } catch (err) {

      console.log(err);

      Swal.fire(
        "Error",
        "Import failed",
        "error"
      );
    }
  };

  const saveVoucher = async () => {
    if (!date) return Swal.fire("Error", "Please select a date", "error");
    if (!accountType) return Swal.fire("Error", "Please select Account Type", "error");
    if (entries.some((e) => !e.ledger)) return Swal.fire("Error", "Select all debit ledgers", "error");

    const formattedItems = entries.map((e) => ({
      ledgerId: Number(e.ledger),
      amount: parseFloat(e.amount) || 0,
    }));

    const employeeId = user?.employee_id || null;
    const role = user?.role || "admin";

    const payload = { voucherNo, date, accountType, narration, totalAmount, companyId, items: formattedItems, ...(employeeId && { employee_id: employeeId }), role };

    try {
      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/update/${id}`,
          payload
        );
        Swal.fire("Success", "Voucher updated successfully", "success");
        if (role === "employee") {
          navigate("/employee/hr/accounting/client/listOfPaymentVoucher");
        } else {
          navigate("/accounting/client/listOfPaymentVoucher");
        }
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/payment-voucher/create/${companyId}`,
          payload
        );

        Swal.fire({
          title: "Saved",
          text: "Voucher saved successfully",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Download PDF",
          cancelButtonText: "Close",
        }).then((result) => {
          if (result.isConfirmed && res.data?.pdf_path) {
            const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
            // View in new tab
            window.open(pdfUrl, "_blank");
            
            // Force download
            fetch(pdfUrl)
              .then((response) => response.blob())
              .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = res.data.pdf_path.split("/").pop() || "PaymentVoucher.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch((err) => console.error("Error downloading PDF:", err));
          }
          if (role === "employee") {
            navigate("/employee/hr/accounting/client/listOfPaymentVoucher");
          } else {
            navigate("/accounting/client/listOfPaymentVoucher");
          }
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire("Error", `Failed to ${isEditMode ? 'update' : 'save'} voucher`, "error");
      }
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition bg-white";

  const tableInputClass =
    "w-full rounded border border-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition bg-transparent";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-800">Payment Voucher</h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            PV
          </span>
        </div>
        <BulkImportButton onImport={handleBulkImport} />
      </div>

      {/* Account Type */}
      <div className="flex flex-col gap-1 mb-5">
        <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
          Account Type (Bank / Cash)
        </label>
        <select
          className={inputClass}
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
        >
          <option value="">Select Bank / Cash Account</option>
          {bankCashLedgers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Voucher No & Date */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Voucher Number
          </label>
          <input
            type="text"
            className={inputClass}
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Date
          </label>
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Section Label */}
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
        Transaction Details
      </p>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 overflow-visible mb-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-left">Particulars</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Opening</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Closing</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Amount (₹)</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-right">Remaining</th>
              <th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400 font-medium text-center w-10"></th>
            </tr>
          </thead>

          <tbody>
            {entries.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors relative hover:z-50"
              >
                {/* Particulars */}
                <td className="px-2 py-1">
                  <SearchableLedgerSelect
                    ledgers={ledgers}
                    value={row.ledger}
                    onSelect={(val) => onLedgerSelect(index, val)}
                    onCreateNew={(name) => handleQuickCreateLedger(index, name)}
                  />
                </td>

                {/* Opening Balance */}
                <td className="px-3 py-2 text-right text-slate-500 text-sm">
                  {row.ledger ? formatBalance(row.openingBalance, row.balanceType) : "0.00"}
                </td>

                {/* Closing Balance */}
                <td className="px-3 py-2 text-right text-slate-500 text-sm">
                  {row.ledger ? formatBalance(row.closingBalance, row.balanceType) : "0.00"}
                </td>

                {/* Amount */}
                <td className="px-2 py-1">
                  <input
                    type="number"
                    placeholder="0.00"
                    className={`${tableInputClass} text-right`}
                    value={row.amount}
                    onChange={(e) => updateAmount(index, e.target.value)}
                  />
                </td>

                {/* Remaining Balance */}
                <td className="px-3 py-2 text-right text-slate-800 font-medium text-sm">
                  {row.ledger ? formatBalance(row.remainingBalance, row.balanceType) : "0.00"}
                </td>

                {/* Delete */}
                <td className="px-2 py-1 text-center">
                  {index > 0 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="text-slate-300 hover:text-red-400 hover:bg-red-50 rounded p-1 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer Total */}
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200">
              <td className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total
              </td>
              <td />
              <td />
              <td className="px-3 py-2 text-right text-sm font-semibold text-slate-800">
                ₹ {totalAmount.toFixed(2)}
              </td>
              <td />
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Row */}
      <button
        onClick={addRow}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors mb-5"
      >
        <Plus size={13} /> Add Row
      </button>

      {/* Totals Summary */}
      <div className="flex justify-end mb-5">
        <div className="bg-slate-50 rounded-lg px-5 py-3 flex flex-col items-end gap-1 min-w-48">
          <div className="flex justify-between w-full text-sm font-semibold text-slate-800 gap-8">
            <span>Grand Total</span>
            <span>₹ {totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Narration */}
      <div className="flex flex-col gap-1 mb-5">
        <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
          Narration
        </label>
        <textarea
          rows="2"
          placeholder="Enter narration (optional)..."
          className={`${inputClass} resize-none`}
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={resetForm}
          className="px-4 py-2 rounded-lg text-sm text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={saveVoucher}
          className="px-5 py-2 rounded-lg text-sm text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {isEditMode ? "Update Voucher" : "Save Voucher"}
        </button>
      </div>
    </div>
  );
};

export default PaymentVoucher;
