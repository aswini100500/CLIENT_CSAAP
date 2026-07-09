

// import React, { useState } from "react";
// import Swal from "sweetalert2";

// const ContraVoucher = () => {
//   const [voucher, setVoucher] = useState({
//     date: new Date().toISOString().split("T")[0],
//     narration: "",
//     gstType: "",
//     gstRate: 0,
//     transactions: [
//       { fromAccount: "", toAccount: "", amount: "", narration: "" },
//     ],
//   });

//   // Update transaction field
//   const handleTransactionChange = (index, field, value) => {
//     const updated = [...voucher.transactions];
//     updated[index][field] = value;
//     setVoucher({ ...voucher, transactions: updated });
//   };

//   // Add new transaction row
//   const addTransaction = () => {
//     setVoucher({
//       ...voucher,
//       transactions: [
//         ...voucher.transactions,
//         { fromAccount: "", toAccount: "", amount: "", narration: "" },
//       ],
//     });
//   };

//   // Calculate total
//   const totalAmount = voucher.transactions.reduce(
//     (sum, t) => sum + (parseFloat(t.amount) || 0),
//     0
//   );

//   // Apply Auto GST (18%)
//   const handleAutoGST = () => {
//     const gstRate = 18;
//     setVoucher({ ...voucher, gstType: "Auto", gstRate });
//     Swal.fire({
//       icon: "success",
//       title: "GST Applied",
//       text: `Automatically applied GST: ${gstRate}%`,
//       timer: 2000,
//       showConfirmButton: false,
//     });
//   };

//   // Apply Manual GST (SweetAlert input)
//   const handleManualGST = async () => {
//     const { value: gstInput } = await Swal.fire({
//       title: "Enter GST Percentage",
//       input: "number",
//       inputAttributes: { min: 0, max: 100, step: 0.1 },
//       inputPlaceholder: "e.g., 5, 12, 18, 28",
//       confirmButtonText: "Apply GST",
//       showCancelButton: true,
//       inputValidator: (value) => {
//         if (!value || isNaN(value)) {
//           return "Please enter a valid GST percentage";
//         }
//       },
//     });

//     if (gstInput) {
//       const gstRate = parseFloat(gstInput);
//       setVoucher({ ...voucher, gstType: "Manual", gstRate });

//       const gstAmount = (totalAmount * gstRate) / 100;
//       Swal.fire({
//         icon: "success",
//         title: "GST Added",
//         text: `${gstRate}% GST applied: ₹${gstAmount.toFixed(2)}`,
//         timer: 2000,
//         showConfirmButton: false,
//       });
//     }
//   };

//   // GST Calculations
//   const gstAmount = (totalAmount * voucher.gstRate) / 100;
//   const grandTotal = totalAmount + gstAmount;

//   // Save voucher
//   const handleSave = () => {
//     if (
//       voucher.transactions.some(
//         (t) => !t.fromAccount || !t.toAccount || !t.amount
//       )
//     ) {
//       Swal.fire({
//         icon: "error",
//         title: "Incomplete Details",
//         text: "Please fill all fields in each transaction before saving.",
//       });
//       return;
//     }

//     Swal.fire({
//       icon: "success",
//       title: "Voucher Saved",
//       text: "Contra Voucher saved successfully!",
//       timer: 2000,
//       showConfirmButton: false,
//     });

//     console.log("Saved Contra Voucher:", voucher);
//   };

//   return (
//     <div className="p-6 bg-white mx-auto shadow-md rounded-xl border border-gray-300">
//       {/* Header */}
//       <div className="border-b py-3 mb-4">
//         <h1 className="text-2xl font-bold text-blue-800">Contra Voucher</h1>
//         <p className="text-gray-600 text-sm">Voucher Type: Contra</p>
//       </div>

//       {/* Date */}
//       <div className="mb-6">
//         <label className="text-sm font-medium">Date</label>
//         <input
//           type="date"
//           className="w-full border px-3 py-2 rounded mt-1"
//           value={voucher.date}
//           onChange={(e) => setVoucher({ ...voucher, date: e.target.value })}
//         />
//       </div>

//       {/* Transactions Table */}
//       <h3 className="text-lg font-semibold mb-2 text-blue-700">
//         Transfer Details
//       </h3>

//       <table className="w-full border text-sm">
//         <thead className="bg-gray-100 border-b">
//           <tr>
//             <th className="border px-2 py-1 w-1/4">From Account</th>
//             <th className="border px-2 py-1 w-1/4">To Account</th>
//             <th className="border px-2 py-1 w-24 text-center">Amount (₹)</th>
//             <th className="border px-2 py-1 w-1/3">Narration</th>
//           </tr>
//         </thead>
//         <tbody>
//           {voucher.transactions.map((t, index) => (
//             <tr key={index}>
//               <td className="border px-2">
//                 <input
//                   className="w-full outline-none py-1"
//                   placeholder="From Account"
//                   value={t.fromAccount}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "fromAccount", e.target.value)
//                   }
//                 />
//               </td>
//               <td className="border px-2">
//                 <input
//                   className="w-full outline-none py-1"
//                   placeholder="To Account"
//                   value={t.toAccount}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "toAccount", e.target.value)
//                   }
//                 />
//               </td>
//               <td className="border px-2 text-center">
//                 <input
//                   type="number"
//                   className="w-full text-center outline-none py-1"
//                   placeholder="0.00"
//                   value={t.amount}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "amount", e.target.value)
//                   }
//                 />
//               </td>
//               <td className="border px-2">
//                 <input
//                   className="w-full outline-none py-1"
//                   placeholder="Narration"
//                   value={t.narration}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "narration", e.target.value)
//                   }
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Add Transaction Button */}
//       <button
//         className="mt-3 text-blue-700 font-medium hover:underline"
//         onClick={addTransaction}
//       >
//         + Add Transaction
//       </button>

//       {/* GST Section */}
//       <div className="mt-6 border-t pt-4">
//         <h3 className="text-lg font-semibold mb-3 text-blue-700">
//           GST Details
//         </h3>
//         <div className="flex gap-4">
//           <button
//             onClick={handleAutoGST}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//           >
//             Add GST Automatically
//           </button>

//           <button
//             onClick={handleManualGST}
//             className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
//           >
//             Add GST Manually
//           </button>
//         </div>

//         {voucher.gstRate > 0 && (
//           <div className="mt-4 text-right">
//             <p className="text-sm text-gray-700">
//               GST Type: {voucher.gstType} ({voucher.gstRate}%)
//             </p>
//             <p className="text-md font-medium text-gray-800">
//               GST Amount: ₹ {gstAmount.toFixed(2)}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Total */}
//       <div className="flex justify-end mt-4">
//         <div className="text-right">
//           <p className="text-lg font-semibold text-gray-800">
//             Total Before GST: ₹ {totalAmount.toFixed(2)}
//           </p>
//           <p className="text-xl font-bold text-blue-800">
//             Grand Total: ₹ {grandTotal.toFixed(2)}
//           </p>
//         </div>
//       </div>

//       {/* Narration */}
//       <div className="mt-6">
//         <label className="text-sm font-medium">Overall Narration</label>
//         <textarea
//           className="w-full border rounded px-3 py-2 mt-1"
//           rows="3"
//           placeholder="Enter narration..."
//           value={voucher.narration}
//           onChange={(e) =>
//             setVoucher({ ...voucher, narration: e.target.value })
//           }
//         ></textarea>
//       </div>

//       {/* Save Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={handleSave}
//           className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded font-medium"
//         >
//           Save Voucher
//         </button>
//       </div>

//       {/* Footer Note */}
//       <div className="mt-6 border-t pt-3 text-sm text-gray-600">
//         <p>
//           <strong>Note:</strong> Contra Voucher is used to record transfers
//           between Cash and Bank Accounts. GST is included here for demo or
//           internal accounting purposes.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ContraVoucher;



// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import axios from "axios";
// import { useCompany } from "../context/CompanyContext";

// const ContraVoucher = () => {
//   const {companyId} = useCompany();
//   const API = "http://localhost:3000/api/v1";

//   const [accounts, setAccounts] = useState([]);


//   const [voucher, setVoucher] = useState({
//     date: new Date().toISOString().split("T")[0],
//     narration: "",
//     gstType: "",
//     gstRate: 0,
//     transactions: [
//       { fromAccount: "", toAccount: "", amount: "", narration: "" },
//     ],
//   });

//   // Fetch accounts (still useful for future use)
//   useEffect(() => {
//     const fetchAccounts = async () => {
//       try {
//         const res = await axios.get(`${API}/accounts/${companyId}`);
//         setAccounts(res.data.data);
//       } catch (error) {
//         console.log("Error fetching accounts:", error);
//       }
//     };
//     fetchAccounts();
//   }, [companyId]);

//   const handleTransactionChange = (index, field, value) => {
//     const updated = [...voucher.transactions];
//     updated[index][field] = value;
//     setVoucher({ ...voucher, transactions: updated });
//   };

//   const addTransaction = () => {
//     setVoucher({
//       ...voucher,
//       transactions: [
//         ...voucher.transactions,
//         { fromAccount: "", toAccount: "", amount: "", narration: "" },
//       ],
//     });
//   };

//   const totalAmount = voucher.transactions.reduce(
//     (sum, t) => sum + (parseFloat(t.amount) || 0),
//     0
//   );
//   const gstAmount = (totalAmount * voucher.gstRate) / 100;
//   const grandTotal = totalAmount + gstAmount;

//   const handleAutoGST = () => {
//     const gstRate = 18;
//     setVoucher({ ...voucher, gstType: "Auto", gstRate });
//     Swal.fire({
//       icon: "success",
//       title: "GST Applied",
//       text: `Automatically applied GST: ${gstRate}%`,
//       timer: 1500,
//       showConfirmButton: false,
//     });
//   };

//   const handleManualGST = async () => {
//     const { value: gstInput } = await Swal.fire({
//       title: "Enter GST Percentage",
//       input: "number",
//       inputAttributes: { min: 0, max: 100 },
//       confirmButtonText: "Apply GST",
//       showCancelButton: true,
//     });

//     if (gstInput) {
//       const gstRate = parseFloat(gstInput);
//       setVoucher({ ...voucher, gstType: "Manual", gstRate });

//       Swal.fire({
//         icon: "success",
//         title: "GST Updated",
//         text: `${gstRate}% GST applied.`,
//         timer: 1500,
//         showConfirmButton: false,
//       });
//     }
//   };

//   const handleSave = async () => {
//     if (
//       voucher.transactions.some(
//         (t) => !t.fromAccount || !t.toAccount || !t.amount
//       )
//     ) {
//       Swal.fire({
//         icon: "error",
//         title: "Incomplete Details",
//         text: "Please fill all fields in each transaction.",
//       });
//       return;
//     }

//     const payload = {
//       ...voucher,
//       companyId,
//       totalAmount,
//       gstAmount,
//       grandTotal,
//     };

//     try {
//       const res = await axios.post(`${API}/contra-voucher/${companyId}/create`, payload);

//       Swal.fire({
//         icon: "success",
//         title: "Saved Successfully",
//         text: "Contra Voucher saved!",
//         timer: 1500,
//         showConfirmButton: false,
//       });

//       console.log("Saved:", res.data);
//     } catch (err) {
//       console.log("Error saving:", err);
//       Swal.fire({
//         icon: "error",
//         title: "Save Failed",
//         text: "Something went wrong while saving!",
//       });
//     }
//   };

//   return (
//     <div className="p-6 bg-white mx-auto shadow-md rounded-xl border border-gray-300">
//       <div className="border-b py-3 mb-4">
//         <h1 className="text-2xl font-bold text-blue-800">Contra Voucher</h1>
//         <p className="text-gray-600 text-sm">Voucher Type: Contra</p>
//       </div>

//       <input
//         type="date"
//         className="border px-3 py-2 rounded mb-4"
//         value={voucher.date}
//         onChange={(e) => setVoucher({ ...voucher, date: e.target.value })}
//       />

//       <table className="w-full border text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-2 py-1">From Account</th>
//             <th className="border px-2 py-1">To Account</th>
//             <th className="border px-2 py-1">Amount</th>
//             <th className="border px-2 py-1">Narration</th>
//           </tr>
//         </thead>

//         <tbody>
//           {voucher.transactions.map((t, index) => (
//             <tr key={index}>
//               {/* From Account as Input */}
//               <td className="border px-2">
//                 <input
//                   type="text"
//                   className="w-full py-1 border rounded px-2"
//                   placeholder="From Account"
//                   value={t.fromAccount}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "fromAccount", e.target.value)
//                   }
//                 />
//               </td>

//               {/* To Account as Input */}
//               <td className="border px-2">
//                 <input
//                   type="text"
//                   className="w-full py-1 border rounded px-2"
//                   placeholder="To Account"
//                   value={t.toAccount}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "toAccount", e.target.value)
//                   }
//                 />
//               </td>

//               <td className="border px-2">
//                 <input
//                   type="number"
//                   className="w-full text-center"
//                   placeholder="0.00"
//                   value={t.amount}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "amount", e.target.value)
//                   }
//                 />
//               </td>

//               <td className="border px-2">
//                 <input
//                   className="w-full"
//                   placeholder="Narration"
//                   value={t.narration}
//                   onChange={(e) =>
//                     handleTransactionChange(index, "narration", e.target.value)
//                   }
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <button className="mt-3 text-blue-700 font-medium" onClick={addTransaction}>
//         + Add Row
//       </button>

//       <div className="mt-6 border-t pt-4">
//         <button
//           className="bg-green-600 text-white px-4 py-2 rounded mr-3"
//           onClick={handleAutoGST}
//         >
//           Auto GST
//         </button>

//         <button
//           className="bg-yellow-500 text-white px-4 py-2 rounded"
//           onClick={handleManualGST}
//         >
//           Manual GST
//         </button>

//         {voucher.gstRate > 0 && (
//           <div className="mt-2 text-right">
//             <p className="text-sm">
//               GST ({voucher.gstRate}%): ₹ {gstAmount.toFixed(2)}
//             </p>
//           </div>
//         )}
//       </div>

//       <div className="mt-4 text-right">
//         <p>Total Before GST: ₹ {totalAmount.toFixed(2)}</p>
//         <p className="text-xl font-bold text-blue-800">
//           Grand Total: ₹ {grandTotal.toFixed(2)}
//         </p>
//       </div>

//       <textarea
//         className="w-full border mt-4 p-2 rounded"
//         rows="3"
//         placeholder="Overall Narration"
//         value={voucher.narration}
//         onChange={(e) => setVoucher({ ...voucher, narration: e.target.value })}
//       ></textarea>

//       <div className="text-right">
//         <button
//           className="bg-blue-700 text-white px-6 py-2 mt-4 rounded"
//           onClick={handleSave}
//         >
//           Save Voucher
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ContraVoucher;






import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import BulkImportButton from "./BulkImportButton";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1`;

const ContraVoucher = () => {
  const { companyId } = useCompany();
  const { user, role: userRole } = useAuth();

  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [voucher, setVoucher] = useState({
    date: new Date().toISOString().split("T")[0],
    voucherNo: "",
    narration: "",
    transactions: [
      { fromAccount: "", toAccount: "", amount: "" },
    ],

  });

  const [gst, setGst] = useState({ applied: false, percentage: 0, amount: 0 });

  // Dynamic Lists
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    try {
      const bankRes = await axios.get(`${API}/bank/${companyId}/all`);
      const banks = bankRes.data.accounts || [];
      const contraOptions = banks.map((b) => ({
        id: `bank_${b.id}`,
        name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
      }));

      // Find Cash Ledger
      const ledgerRes = await axios.get(`${API}/ledger/${companyId}/all`);
      const allLedgers = ledgerRes.data || [];
      const cashLedger = allLedgers.find(
        (l) =>
          l.name?.toLowerCase().includes("cash") ||
          l.underGroup === "Cash-in-Hand" ||
          l.under === "Cash-in-Hand"
      );

      if (cashLedger) {
        contraOptions.push({ id: `ledger_${cashLedger.id}`, name: cashLedger.name });
      } else {
        contraOptions.push({ id: "cash", name: "Cash" });
      }

      setAccounts(contraOptions);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchVoucher = async () => {
    if (!id) return;
    try {
      setIsEditMode(true);
      const res = await axios.get(`${API}/contra-voucher/voucher/${id}`);
      const data = res.data;
      const vData = data.voucher || {};
      setVoucher({
        date: vData.date ? new Date(vData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        voucherNo: vData.voucherNo || "",
        narration: vData.narration || "",
        transactions: data.transactions?.length ? data.transactions : [{ fromAccount: "", toAccount: "", amount: "" }],
      });
    } catch (err) {
      console.error("Error fetching voucher:", err);
      Swal.fire("Error", "Could not fetch voucher details", "error");
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchAccounts();
    }
  }, [companyId]);

  useEffect(() => {
    if (id && companyId) {
      fetchVoucher();
    } else if (companyId) {
      axios.get(`${API}/voucher-util/next/${companyId}/contra`)
        .then(res => setVoucher(prev => ({ ...prev, voucherNo: res.data.nextNumber })))
        .catch(console.error);
    }
  }, [id, companyId]);

  // Handle Transaction Change
  const handleTransactionChange = (index, field, value) => {
    const updated = [...voucher.transactions];
    updated[index][field] = value;

    // Recalculate GST if amount changes and GST is applied
    if (field === "amount" && gst.applied) {
      const totalAmount = updated.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const gstAmount = (totalAmount * gst.percentage) / 100;
      setGst({ ...gst, amount: gstAmount });
    }

    setVoucher({ ...voucher, transactions: updated });
  };

  const addTransaction = () => {
    setVoucher({
      ...voucher,
      transactions: [
        ...voucher.transactions,
        { fromAccount: "", toAccount: "", amount: "" },
      ],
    });
  };

  const totalAmount = voucher.transactions.reduce(
    (sum, t) => sum + (parseFloat(t.amount) || 0),
    0
  );
  const grandTotal = totalAmount + (gst.applied ? gst.amount : 0);


  // Save Voucher
  // const saveVoucher = async () => {
  //   if (
  //     voucher.transactions.some(
  //       (t) => !t.fromAccount || !t.toAccount || !t.amount
  //     )
  //   ) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Incomplete Details",
  //       text: "Please fill all fields in each transaction.",
  //     });
  //     return;
  //   }

  //   const payload = {
  //     ...voucher,
  //     companyId,
  //     totalAmount,
  //     gstAmount: gst.amount,
  //     grandTotal,
  //   };

  //   try {
  //     const res = await axios.post(`${API}/contra-voucher/${companyId}/create`, payload);

  //     Swal.fire({
  //       icon: "success",
  //       title: "Saved Successfully",
  //       text: "Contra Voucher saved!",
  //       timer: 2000,
  //       showConfirmButton: false,
  //     });

  //     console.log("Saved:", res.data);

  //     // Reset form
  //     setVoucher({
  //       date: new Date().toISOString().split("T")[0],
  //       narration: "",
  //       transactions: [
  //         { fromAccount: "", toAccount: "", amount: "" },
  //       ],
  //     });
  //     setGst({ applied: false, percentage: 0, amount: 0 });

  //        try {
  //   await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher/createVoucher`, {
  //     companyId,
  //     voucherNo: voucher.voucherNo, 
  //     voucherType: "Contra",
  //     items:payload.transactions

  //   });

  //   Swal.fire({
  //     icon: "success",
  //     title: "Saved Successfully",
  //     timer: 2000,
  //     showConfirmButton: false,
  //   });
  // } catch (err) {
  //   console.log(err);
  //   Swal.fire("Error", "Something went wrong!", "error");
  // }


  //   } 



  //   catch (err) {
  //     console.log("Error saving:", err);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Save Failed",
  //       text: "Something went wrong while saving!",
  //     });
  //   }
  // };
  const saveVoucher = async () => {
    if (
      voucher.transactions.some(
        (t) => !t.fromAccount || !t.toAccount || !t.amount
      )
    ) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Details",
        text: "Please fill all fields in each transaction.",
      });
      return;
    }

    const employeeId = user?.employee_id || null;
    const roleName = userRole || "admin";

    const payload = {
      ...voucher,
      companyId,
      totalAmount,
      gstAmount: gst.amount,
      grandTotal,
      ...(employeeId && { employee_id: employeeId }),
      role: roleName,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `${API}/contra-voucher/update/${id}`,
          payload
        );

        Swal.fire(
          "Success",
          "Contra Voucher updated successfully",
          "success"
        );

        navigate("/accounting/client/listOfContraVoucher");
        return;
      }

      const res = await axios.post(
        `${API}/contra-voucher/${companyId}/create`,
        payload
      );

      // Create Voucher Entry
      await axios.post(
        `${API}/voucher/createVoucher`,
        {
          companyId,
          voucherNo: voucher.voucherNo,
          voucherType: "Contra",
          date: voucher.date,
          narration: voucher.narration,
          items: payload.transactions,
        }
      );

      Swal.fire({
        title: "Saved",
        text: "Contra Voucher saved successfully",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Download PDF",
        cancelButtonText: "Close",
      }).then((result) => {
        if (res.data?.pdf_path) {
          const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
          if (result.isConfirmed) {
            // Directly download AND view
            window.open(pdfUrl, "_blank"); // View in new tab
            
            // Force download
            fetch(pdfUrl)
              .then((response) => response.blob())
              .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = res.data.pdf_path.split("/").pop() || "ContraVoucher.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch((err) => console.error("Error downloading PDF:", err));
          }
        }
      });

      // Reset Form
      setVoucher({
        date: new Date()
          .toISOString()
          .split("T")[0],
        voucherNo: "",
        narration: "",
        transactions: [
          {
            fromAccount: "",
            toAccount: "",
            amount: "",
          },
        ],
      });

      setGst({
        applied: false,
        percentage: 0,
        amount: 0,
      });

    } catch (err) {
      console.log("Error saving:", err);

      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Voucher Number Already Exists!", "warning");
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: `Something went wrong while ${isEditMode ? "updating" : "saving"}!`,
        });
      }
    }
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

      // ===== TAKE FIRST VOUCHER =====

      const firstRow = data[0];

      // ===== BUILD TRANSACTIONS =====

      // ===== REFRESH LATEST BANKS =====

      const bankRes =
        await axios.get(
          `${API}/bank/${companyId}/all`
        );

      const latestBanks =
        bankRes.data.accounts || [];

      // ===== FETCH CASH LEDGER =====

      const ledgerRes =
        await axios.get(
          `${API}/ledger/${companyId}/all`
        );

      const allLedgers =
        ledgerRes.data || [];

      // ===== BUILD OPTIONS =====

      const latestAccounts =
        latestBanks.map((b) => ({

          id: `bank_${b.id}`,

          name:
            b.bankName
              ? `${b.accountName} (${b.bankName})`
              : b.accountName,
        }));

      // ===== CASH =====

      const cashLedger =
        allLedgers.find(
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

        latestAccounts.push({

          id:
            `ledger_${cashLedger.id}`,

          name:
            cashLedger.name,
        });

      } else {

        latestAccounts.push({
          id: "cash",
          name: "Cash",
        });
      }

      // ===== IMPORTED TRANSACTIONS =====

      const importedTransactions = [];

      for (const row of data) {

        const fromName =
          row.FromAccount
            ?.trim()
            ?.toLowerCase();

        const toName =
          row.ToAccount
            ?.trim()
            ?.toLowerCase();

        // ===== AUTO CREATE BANK =====

        const createBankIfMissing =
          async (name) => {

            if (
              !name ||
              name === "cash"
            ) return;

            const exists =
              latestAccounts.find(
                (a) =>
                  a.name
                    ?.toLowerCase()
                    ?.trim() === name
              );

            if (!exists) {

              try {

                const res =
                  await axios.post(
                    `${API}/bank/${companyId}/create`,
                    {
                      accountName: name,
                      bankName: name,
                      currentBalance: 0,
                    }
                  );

                latestAccounts.push({

                  id:
                    `bank_${res.data.id}`,

                  name,
                });

              } catch (err) {

                console.log(
                  "Bank create failed",
                  err
                );
              }
            }
          };

        await createBankIfMissing(
          fromName
        );

        await createBankIfMissing(
          toName
        );

        // ===== FIND ACCOUNTS =====

        const fromAcc =
          latestAccounts.find(
            (a) =>
              a.name
                ?.toLowerCase()
                ?.trim() ===
              fromName
          );

        const toAcc =
          latestAccounts.find(
            (a) =>
              a.name
                ?.toLowerCase()
                ?.trim() ===
              toName
          );

        importedTransactions.push({

          fromAccount:
            fromName === "cash"
              ? cashLedger
                ? `ledger_${cashLedger.id}`
                : "cash"
              : fromAcc?.id || "",

          toAccount:
            toName === "cash"
              ? cashLedger
                ? `ledger_${cashLedger.id}`
                : "cash"
              : toAcc?.id || "",

          amount:
            parseFloat(
              row.Amount || 0
            ),
        });
      }

      // ===== UPDATE DROPDOWNS =====

      setAccounts(latestAccounts);

      // ===== SHOW DATA IN FORM =====

      setVoucher({

        ...voucher,

        voucherNo:
          firstRow.VoucherNo ||
          "",

        date:
          firstRow.Date
            ? new Date(
              firstRow.Date
            )
              .toISOString()
              .split("T")[0]
            : new Date()
              .toISOString()
              .split("T")[0],

        narration:
          firstRow.Narration ||
          "",

        transactions:
          importedTransactions,
      });

      // ===== REFRESH ACCOUNTS =====

      const refreshedBankRes =
        await axios.get(
          `${API}/bank/${companyId}/all`
        );

      const banks =
        refreshedBankRes.data.accounts || [];

      const contraOptions =
        banks.map((b) => ({
          id: `bank_${b.id}`,
          name: b.bankName ? `${b.accountName} (${b.bankName})` : b.accountName,
        }));

      contraOptions.push({ id: "cash", name: "Cash" });

      setAccounts(contraOptions);

      Swal.fire({
        icon: "success",
        title: "Import Successful",
        text:
          "Imported data loaded successfully. Review and click Save Voucher.",
      });

    } catch (error) {

      console.log(error);

      Swal.fire(
        "Error",
        "Import failed",
        "error"
      );
    }
  };

  const resetForm = () => {
    setVoucher({
      date: new Date().toISOString().split("T")[0],
      voucherNo: "",
      narration: "",
      transactions: [
        {
          fromAccount: "",
          toAccount: "",
          amount: "",
        },
      ],
    });

    setGst({
      applied: false,
      percentage: 0,
      amount: 0,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition bg-white";

  const tableInputClass =
    "w-full rounded border border-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition bg-transparent";

  return (
    <div className="p-6 bg-white mx-auto shadow-md rounded-xl border border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-800">
            Contra Voucher
          </h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            CV
          </span>
        </div>

        <BulkImportButton onDataParsed={handleBulkImport} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Voucher Number
          </label>

          <input
            type="text"
            className={inputClass}
            value={voucher.voucherNo}
            onChange={(e) =>
              setVoucher({
                ...voucher,
                voucherNo: e.target.value,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
            Date
          </label>

          <input
            type="date"
            className={inputClass}
            value={voucher.date}
            onChange={(e) =>
              setVoucher({
                ...voucher,
                date: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto mb-2 border border-slate-100 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                From Account (Credit)
              </th>

              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold">
                To Account (Debit)
              </th>

              <th className="px-3 py-2 text-right text-xs uppercase tracking-wider text-slate-500 font-semibold w-32">
                Amount
              </th>

              <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-slate-500 font-semibold w-10"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {voucher.transactions.map((transaction, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-2 py-1">
                  <select
                    className={tableInputClass}
                    value={transaction.fromAccount}
                    onChange={(e) =>
                      handleTransactionChange(
                        index,
                        "fromAccount",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select account
                    </option>

                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-2 py-1">
                  <select
                    className={tableInputClass}
                    value={transaction.toAccount}
                    onChange={(e) =>
                      handleTransactionChange(
                        index,
                        "toAccount",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select account
                    </option>

                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}

                  </select>
                </td>

                <td className="px-2 py-1">
                  <input
                    type="number"
                    className={`${tableInputClass} text-right`}
                    placeholder="0.00"
                    value={transaction.amount}
                    onChange={(e) =>
                      handleTransactionChange(
                        index,
                        "amount",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td className="px-2 py-1 text-center">
                  <button
                    type="button"
                    className="text-slate-300 hover:text-red-400 hover:bg-red-50 rounded px-1.5 py-0.5 transition-colors text-xs"
                    onClick={() => {
                      const updated =
                        voucher.transactions.filter(
                          (_, i) => i !== index
                        );

                      setVoucher({
                        ...voucher,
                        transactions:
                          updated.length
                            ? updated
                            : [
                              {
                                fromAccount:
                                  "",
                                toAccount:
                                  "",
                                amount: "",
                              },
                            ],
                      });
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Row */}
      <button className="mt-3 text-blue-700" onClick={addTransaction}>
        + Add Transaction
      </button>

      {/* GST */}
      {/* <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleAutoGST}
          className="bg-green-600 text-white px-5 py-2 rounded"
        >
          Auto GST
        </button>

        <button
          onClick={handleManualGST}
          className="bg-yellow-500 text-white px-5 py-2 rounded"
        >
          Manual GST
        </button>
      </div> */}

      {/* Totals */}
      <div className="flex justify-end mt-4">
        <div className="text-right space-y-1">
          <p className="font-medium">Subtotal: ₹ {totalAmount.toFixed(2)}</p>
          {gst.applied && (
            <p className="text-green-700 font-medium">
              GST ({gst.percentage}%): ₹ {gst.amount.toFixed(2)}
            </p>
          )}
          <p className="text-lg font-semibold border-t pt-1">
            Grand Total: ₹ {grandTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Narration */}
      <div className="mt-6">
        <label className="text-sm font-medium">Narration</label>
        <textarea
          className="w-full border rounded px-3 py-2 mt-1"
          rows="3"
          placeholder="Enter narration..."
          value={voucher.narration}
          onChange={(e) =>
            setVoucher({ ...voucher, narration: e.target.value })
          }
        ></textarea>
      </div>

      {/* Submit */}
      <button
        onClick={saveVoucher}
        className="mt-6 bg-blue-700 text-white px-6 py-2 rounded"
      >
        {isEditMode
          ? "Update Voucher"
          : "Save Voucher"}
      </button>
    </div>
  );
};

export default ContraVoucher;