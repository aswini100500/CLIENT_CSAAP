// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import axios from "axios";
// import { useCompany } from "../context/CompanyContext";
// import BulkImportButton from "./BulkImportButton";
// import { useParams, useNavigate } from "react-router-dom";

// const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher`;

// const PurchaseVoucher = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { companyId } = useCompany();

//  const [voucher, setVoucher] = useState({
//   date: "",
//   invoiceNo: "",
//   customer: "",
//   ledger: "",
//   narration: "",

//   // PARTY DETAILS
//   mailingName: "",
//   address: "",
//   state: "Not Applicable",
//   country: "India",
//   gstRegistrationType: "Unregistered/Consumer",
//   gstin: "",
//   placeOfSupply: "Not Applicable",

//   // DISPATCH DETAILS
//   deliveryNoteNo: "",
//   dispatchDocNo: "",
//   dispatchedThrough: "",
//   destination: "",
//   carrierName: "",
//   billOfLading: "",
//   motorVehicleNo: "",
//   dispatchDate: "",

//   items: [
//     {
//       itemName: "",
//       hsn_code: "",
//       qty: 1,
//       rate: 0,
//       amount: 0
//     }
//   ],
// });

//   const [gst, setGst] = useState({ applied: false, percentage: 0, amount: 0, igst: 0, cgst: 0, sgst: 0 });
//   const [ledgers, setLedgers] = useState([]);
//   const [isEditMode, setIsEditMode] = useState(false);

//   // Fetch ledger list
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res2 = await axios.get(
//           `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`
//         );
//         setLedgers(res2.data);

//         if (id) {
//           setIsEditMode(true);
//           const voucherRes = await axios.get(`${API}/single/${id}`);
//           const v = voucherRes.data;
//           if (v) {
//             setVoucher({
//               date: v.date ? new Date(v.date).toISOString().split('T')[0] : "",
//               invoiceNo: v.invoiceNo || v.voucherNo || "",
//               customer: v.customer || v.partyName || "",
//               ledger: String(v.ledgerId || v.ledger || ""),
//               narration: v.narration || "",
//               items: v.items && v.items.length > 0
//                 ? v.items.map(i => ({
//                   itemName: i.item || i.itemName || "",
//                   hsn_code: i.hsn_code || "",
//                   qty: i.qty || i.itemQuantity || 1,
//                   rate: i.rate || 0,
//                   amount: i.amount || 0
//                 }))
//                 : [{ itemName: "", hsn_code: "", qty: 1, rate: 0, amount: 0 }]
//             });
//             setGst({
//               applied: (v.gst_percentage || v.gstPercentage || 0) > 0,
//               percentage: v.gst_percentage || v.gstPercentage || 0,
//               amount: v.gst_amount || v.gstAmount || 0,
//               igst: v.igst || 0,
//               cgst: v.cgst || 0,
//               sgst: v.sgst || 0
//             });
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       }
//     };
//     if (companyId) fetchData();
//   }, [companyId, id]);


//   // Handle Item Change (Item name is manual input)
//   const handleItemChange = (index, field, value) => {
//     const updated = [...voucher.items];
//     updated[index][field] = value;

//     if (field === "qty" || field === "rate") {
//       const qty = parseFloat(updated[index].qty) || 0;
//       const rate = parseFloat(updated[index].rate) || 0;
//       updated[index].amount = qty * rate;
//     }

//     setVoucher({ ...voucher, items: updated });
//   };

//   // Add New Row
//   const addRow = () => {
//     setVoucher({
//       ...voucher,
//       items: [...voucher.items, { itemName: "", hsn_code: "", qty: 1, rate: 0, amount: 0 }],
//     });
//   };

//   const totalAmount = voucher.items.reduce(
//     (sum, r) => sum + Number(r.amount || 0),
//     0
//   );
//   const grandTotal = totalAmount + (gst.applied ? gst.amount : 0) + Number(gst.igst) + Number(gst.cgst) + Number(gst.sgst);

//   // Auto GST
//   const handleAutoGST = async () => {
//     const res = await axios.get(`${API}/gst/default`);
//     const gstPercentage = res.data.defaultGst;
//     const gstAmount = (totalAmount * gstPercentage) / 100;

//     setGst({ ...gst, applied: true, percentage: gstPercentage, amount: gstAmount });

//     Swal.fire({
//       icon: "success",
//       title: "GST Applied",
//       text: `${gstPercentage}% GST Added`,
//       timer: 1800,
//       showConfirmButton: false,
//     });
//   };


//   // Bulk Import Handler
//   const handleBulkImport = async (data) => {
//     try {
//       const grouped = {};

//       // 1. Group by InvoiceNo
//       data.forEach(row => {
//         // Excel column names assumption: 'InvoiceNo', 'Date', 'PartyName', 'ItemName', 'Qty', 'Rate', 'GST', 'HSN', 'Narration'
//         const invoiceNo = row.InvoiceNo || row.VoucherNo || "Unknown";
//         if (!grouped[invoiceNo]) {
//           grouped[invoiceNo] = {
//             date: row.Date ? new Date(row.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // format YYYY-MM-DD
//             invoiceNo: invoiceNo,
//             customer: row.PartyName,
//             narration: row.Narration || "",
//             items: [],
//             gst_percentage: parseFloat(row.GST || 0),
//             igst: parseFloat(row.IGST || 0),
//             cgst: parseFloat(row.CGST || 0),
//             sgst: parseFloat(row.SGST || 0)
//           };
//         }

//         // Add item
//         grouped[invoiceNo].items.push({
//           item: row.ItemName,
//           qty: parseFloat(row.Qty || 1),
//           rate: parseFloat(row.Rate || 0),
//           amount: parseFloat(row.Qty || 1) * parseFloat(row.Rate || 0),
//           hsn_code: row.HSN || ""
//         });
//       });

//       // 2. Transform to API format
//       const vouchers = Object.values(grouped).map(v => {
//         // Find Ledger ID
//         const ledgerObj = ledgers.find(l => l.name.toLowerCase() === (v.customer || "").toLowerCase());
//         const ledgerId = ledgerObj ? ledgerObj.id : null;

//         // Calculate totals
//         const subtotal = v.items.reduce((sum, item) => sum + item.amount, 0);
//         const gstAmount = (subtotal * v.gst_percentage) / 100;
//         const grandTotal = subtotal + gstAmount + v.igst + v.cgst + v.sgst;

//         return {
//           date: v.date,
//           invoiceNo: v.invoiceNo,
//           customer: v.customer,
//           ledger: ledgerId,
//           subtotal,
//           gst_percentage: v.gst_percentage,
//           gst_amount: gstAmount,
//           grand_total: grandTotal,
//           narration: v.narration,
//           igst: v.igst,
//           cgst: v.cgst,
//           sgst: v.sgst,
//           items: v.items
//         };
//       });

//       const validVouchers = vouchers.filter(v => v.ledger);
//       const missingLedgers = vouchers.filter(v => !v.ledger).map(v => v.customer);
//       const uniqueMissing = [...new Set(missingLedgers)];

//       if (uniqueMissing.length > 0) {
//         const result = await Swal.fire({
//           icon: "warning",
//           title: "Ledgers Not Found",
//           text: `The following Party Names were not found: ${uniqueMissing.join(", ")}.`,
//           showCancelButton: true,
//           confirmButtonText: "Create Missing Ledgers",
//           cancelButtonText: "Cancel Import",
//         });

//         if (result.isConfirmed) {
//           try {
//             // 1. Fetch Groups to find Sundry Creditors
//             const groupRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`);
//             const groups = groupRes.data;
//             const creditorGroup = groups.find(g => g.groupName === "Sundry Creditors");

//             if (!creditorGroup) {
//               Swal.fire("Error", "Sundry Creditors group not found in system.", "error");
//               return;
//             }

//             // 2. Create Ledgers
//             let createdCount = 0;
//             for (const name of uniqueMissing) {
//               await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`, {
//                 name: name,
//                 under: JSON.stringify({ name: "Sundry Creditors", id: creditorGroup.id }),
//                 mailingName: name,
//                 openingBalance: 0,
//                 state: "Not Applicable",
//                 country: "India",
//                 registrationType: "Regular",
//                 companyId // Body also needs companyId sometimes? Controller uses req.params, but safe to include.
//               });
//               createdCount++;
//             }

//             Swal.fire("Success", `${createdCount} Ledgers created. Retrying import...`, "success");

//             // 3. Refetch Ledgers and Retry Matching
//             const ledgerRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
//             const newLedgers = ledgerRes.data || [];
//             setLedgers(newLedgers); // Update state

//             // Re-map vouchers with new ledgers
//             vouchers.forEach(v => {
//               if (!v.ledger) {
//                 const l = newLedgers.find(led => led.name.toLowerCase() === v.customer.toLowerCase());
//                 if (l) v.ledger = l.id;
//               }
//             });

//           } catch (err) {
//             console.error(err);
//             Swal.fire("Error", "Failed to create ledgers automatically.", "error");
//             return;
//           }
//         } else {
//           return; // Cancelled
//         }
//       }

//       // Check again after potential creation
//       const finalValid = vouchers.filter(v => v.ledger);
//       if (finalValid.length === 0) return;

//       // 3. Send to Backend
//       const res = await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/bulk-create`, {
//         companyId,
//         vouchers: finalValid
//       });

//       Swal.fire("Success", res.data.message || "Bulk Import Successful", "success");
//       // Optional: Refresh data (but this page is usually creation only, so maybe just clear?)

//     } catch (error) {
//       console.error("Bulk Import Error", error);
//       Swal.fire("Error", "Failed to import vouchers", "error");
//     }
//   };


//   // Manual GST
//   const handleManualGST = async () => {
//     const { value: gstInput } = await Swal.fire({
//       title: "Enter GST Percentage",
//       input: "number",
//       inputAttributes: { min: 0, max: 100, step: 0.1 },
//       confirmButtonText: "Apply GST",
//       showCancelButton: true,
//     });

//     if (gstInput) {
//       const gstAmount = (totalAmount * gstInput) / 100;

//       setGst({
//         ...gst,
//         applied: true,
//         percentage: parseFloat(gstInput),
//         amount: gstAmount,
//       });

//       Swal.fire({
//         icon: "success",
//         title: "GST Added",
//         text: `${gstInput}% GST added`,
//         timer: 1800,
//         showConfirmButton: false,
//       });
//     }
//   };

//   // Save Voucher
//   const saveVoucher = async () => {
//     try {
//       const payload = {
//         companyId,
//         date: voucher.date,
//         customer: voucher.customer,
//         ledger: voucher.ledger,
//         subtotal: totalAmount,
//         gst_percentage: gst.percentage,
//         gst_amount: gst.amount,
//         igst: gst.igst,
//         cgst: gst.cgst,
//         sgst: gst.sgst,
//         grand_total: grandTotal,
//         narration: voucher.narration,

//         items: voucher.items.map((i) => ({
//           item: i.itemName, // now manual text
//           hsn_code: i.hsn_code,
//           qty: i.qty,
//           rate: i.rate,
//           amount: i.amount,
//         })),
//       };

//       if (isEditMode) {
//         await axios.put(`${API}/${id}`, payload);
//         Swal.fire("Success", "Voucher updated successfully", "success");
//         navigate("/listOfPurchaseVoucher");
//       } else {
//         // SAVE PURCHASE VOUCHER
//         const res = await axios.post(API, payload);

//         // SAVE IN GENERAL VOUCHERS TABLE
//         await axios.post(
//           `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher/createVoucher`,
//           {
//             companyId,
//             voucherId: Date.now(),
//             voucherType: "Purchase",
//             ledgerId: voucher.ledger,
//             debit: 0,
//             credit: grandTotal,
//             fromLedger: voucher.ledger,
//             toLedger: 0,
//             amount: grandTotal,
//             gst: gst.amount,
//             igst: gst.igst,
//             cgst: gst.cgst,
//             sgst: gst.sgst,
//             date: voucher.date,
//             narration: voucher.narration,
//             invoiceNo: voucher.invoiceNo,

//             items: voucher.items.map((i) => ({
//               itemName: i.itemName,
//               hsn_code: i.hsn_code,
//               itemQuantity: i.qty,
//               rate: i.rate,
//               amount: i.amount,
//             })),
//           }
//         );

//         Swal.fire({
//           icon: "success",
//           title: "Saved Successfully",
//           text: "Voucher saved successfully",
//           showCancelButton: true,
//           confirmButtonText: "Download PDF",
//           cancelButtonText: "Close"
//         }).then((result) => {
//           if (result.isConfirmed) {
//             const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
//             window.open(pdfUrl, "_blank");
//           }
//         });
//       }
//     } catch (err) {
//       console.log(err);
//       Swal.fire("Error", `Something went wrong while ${isEditMode ? 'updating' : 'saving'}!`, "error");
//     }
//   };

//   // UI


//   return (
//     <div className="p-6 bg-white mx-auto shadow-md rounded-xl border border-gray-300">
//       <div className="border-b py-3 mb-4">
//         <h1 className="text-2xl font-bold text-blue-800">Purchase Voucher</h1>
//       </div>

//       {/* Invoice Field */}
//       <div>
//         <label className="text-sm font-medium">Invoice No</label>
//         <input
//           type="text"
//           className="w-full border px-3 py-2 rounded mt-1"
//           value={voucher.invoiceNo}
//           onChange={(e) =>
//             setVoucher({ ...voucher, invoiceNo: e.target.value })
//           }
//         />
//       </div>

//       {/* Date + Customer */}
//       <div className="grid grid-cols-2 gap-6 mt-6">
//         <div>
//           <label className="text-sm font-medium">Date</label>
//           <input
//             type="date"
//             className="w-full border px-3 py-2 rounded mt-1"
//             value={voucher.date}
//             onChange={(e) => setVoucher({ ...voucher, date: e.target.value })}
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium">Party Name</label>
//           <input
//             type="text"
//             placeholder="Enter Customer"
//             className="w-full border px-3 py-2 rounded mt-1"
//             value={voucher.customer}
//             onChange={(e) =>
//               setVoucher({ ...voucher, customer: e.target.value })
//             }
//           />
//         </div>
//       </div>

//       {/* Party + Dispatch Details */}
// <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

//   {/* Party Details */}
//   <div className="border rounded-lg p-4 bg-gray-50">
//     <h3 className="text-lg font-semibold text-center border-b pb-2 mb-4">
//       Party Details
//     </h3>

//     <div className="space-y-3">

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">Buyer (Bill to)</label>

//         <input
//           type="text"
//           value={
//             ledgers.find(l => String(l.id) === String(voucher.ledger))?.name || ""
//           }
//           readOnly
//           className="col-span-2 border px-3 py-2 rounded bg-gray-100"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">Mailing Name</label>

//         <input
//           type="text"
//           value={voucher.mailingName}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               mailingName: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-start">
//         <label className="text-sm font-medium">Address</label>

//         <textarea
//           rows="3"
//           value={voucher.address}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               address: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">State</label>

//         <input
//           type="text"
//           value={voucher.state}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               state: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">Country</label>

//         <input
//           type="text"
//           value={voucher.country}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               country: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           GST Registration Type
//         </label>

//         <select
//           value={voucher.gstRegistrationType}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               gstRegistrationType: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         >
//           <option>Unregistered/Consumer</option>
//           <option>Regular</option>
//           <option>Composition</option>
//         </select>
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">GSTIN/UIN</label>

//         <input
//           type="text"
//           value={voucher.gstin}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               gstin: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">Place of Supply</label>

//         <input
//           type="text"
//           value={voucher.placeOfSupply}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               placeOfSupply: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//     </div>
//   </div>

//   {/* Dispatch Details */}
//   <div className="border rounded-lg p-4 bg-gray-50">
//     <h3 className="text-lg font-semibold text-center border-b pb-2 mb-4">
//       Dispatch Details
//     </h3>

//     <div className="space-y-3">

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           Delivery Note No(s)
//         </label>

//         <input
//           type="text"
//           value={voucher.deliveryNoteNo}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               deliveryNoteNo: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           Dispatch Doc No.
//         </label>

//         <input
//           type="text"
//           value={voucher.dispatchDocNo}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               dispatchDocNo: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           Dispatched Through
//         </label>

//         <input
//           type="text"
//           value={voucher.dispatchedThrough}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               dispatchedThrough: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">Destination</label>

//         <input
//           type="text"
//           value={voucher.destination}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               destination: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           Carrier Name/Agent
//         </label>

//         <input
//           type="text"
//           value={voucher.carrierName}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               carrierName: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           Bill of Lading/LR-RR No.
//         </label>

//         <input
//           type="text"
//           value={voucher.billOfLading}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               billOfLading: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           Motor Vehicle No.
//         </label>

//         <input
//           type="text"
//           value={voucher.motorVehicleNo}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               motorVehicleNo: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-3 items-center">
//         <label className="text-sm font-medium">
//           Dispatch Date
//         </label>

//         <input
//           type="date"
//           value={voucher.dispatchDate}
//           onChange={(e) =>
//             setVoucher({
//               ...voucher,
//               dispatchDate: e.target.value
//             })
//           }
//           className="col-span-2 border px-3 py-2 rounded"
//         />
//       </div>

//     </div>
//   </div>
// </div>

//       {/* Ledger */}
//       <div className="mt-6">
//         <label className="text-sm font-medium">Purchase Ledger</label>
//         <select
//           className="w-full border px-3 py-2 rounded mt-1"
//           value={voucher.ledger}
//           onChange={(e) => setVoucher({ ...voucher, ledger: e.target.value })}
//         >
//           <option value="">Select Ledger</option>
//           {ledgers.map((l) => (
//             <option key={l.id} value={l.id}>
//               {l.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* ITEM TABLE */}
//       <h3 className="text-lg font-semibold mt-6 mb-2 text-blue-700">
//         Item Details
//       </h3>

//       <table className="w-full border text-sm">
//         <thead className="bg-gray-100 border-b">
//           <tr>
//             <th className="border px-2 py-1 w-2/5">Item Name</th>
//             <th className="border px-2 py-1 w-24 text-center">HSN Code</th>
//             <th className="border px-2 py-1 w-20 text-center">Qty</th>
//             <th className="border px-2 py-1 w-28 text-center">Rate</th>
//             <th className="border px-2 py-1 w-28 text-center">Amount</th>
//           </tr>
//         </thead>

//         <tbody>
//           {voucher.items.map((row, index) => (
//             <tr key={index}>
//               <td className="border px-2">
//                 <input
//                   type="text"
//                   className="w-full py-1 px-3 border rounded"
//                   placeholder="Enter Item"
//                   value={row.itemName}
//                   onChange={(e) =>
//                     handleItemChange(index, "itemName", e.target.value)
//                   }
//                 />
//               </td>

//               <td className="border px-2">
//                 <input
//                   type="text"
//                   className="w-full py-1 border rounded text-center"
//                   placeholder="HSN"
//                   value={row.hsn_code}
//                   onChange={(e) =>
//                     handleItemChange(index, "hsn_code", e.target.value)
//                   }
//                 />
//               </td>

//               <td className="border px-2 text-center">
//                 <input
//                   type="number"
//                   className="w-full text-center py-1"
//                   value={row.qty}
//                   onChange={(e) =>
//                     handleItemChange(index, "qty", e.target.value)
//                   }
//                 />
//               </td>

//               <td className="border px-2 text-center">
//                 <input
//                   type="number"
//                   className="w-full text-center py-1"
//                   value={row.rate}
//                   onChange={(e) =>
//                     handleItemChange(index, "rate", e.target.value)
//                   }
//                 />
//               </td>

//               <td className="border px-2 text-center text-gray-900">
//                 {row.amount.toFixed(2)}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <button className="mt-3 text-blue-700" onClick={addRow}>
//         + Add Item
//       </button>

//       <div className="mt-3 inline-block ml-4 top-0">
//         <BulkImportButton onDataParsed={handleBulkImport} />
//       </div>



//       {/* GST Buttons */}
//       <div className="flex justify-end gap-4 mt-6">
//         <button
//           onClick={handleAutoGST}
//           className="bg-green-600 text-white px-5 py-2 rounded"
//         >
//           Auto GST
//         </button>

//         <button
//           onClick={handleManualGST}
//           className="bg-yellow-500 text-white px-5 py-2 rounded"
//         >
//           Manual GST
//         </button>
//       </div>

//       {/* Totals */}
//       <div className="flex justify-end mt-4">
//         <div className="text-right space-y-1">
//           <p className="font-medium">Subtotal: ₹ {totalAmount.toFixed(2)}</p>
//           {gst.applied && (
//             <p className="text-green-700 font-medium">
//               GST ({gst.percentage}%): ₹ {gst.amount.toFixed(2)}
//             </p>
//           )}

//           <div className="flex justify-end gap-2 text-sm mt-1">
//             <div className="flex items-center gap-1">
//               <label>IGST:</label>
//               <input type="number" className="border w-20 px-1" value={gst.igst} onChange={(e) => setGst({ ...gst, igst: e.target.value })} />
//             </div>
//             <div className="flex items-center gap-1">
//               <label>CGST:</label>
//               <input type="number" className="border w-20 px-1" value={gst.cgst} onChange={(e) => setGst({ ...gst, cgst: e.target.value })} />
//             </div>
//             <div className="flex items-center gap-1">
//               <label>SGST:</label>
//               <input type="number" className="border w-20 px-1" value={gst.sgst} onChange={(e) => setGst({ ...gst, sgst: e.target.value })} />
//             </div>
//           </div>

//           <p className="text-lg font-semibold border-t pt-1">
//             Grand Total: ₹ {grandTotal.toFixed(2)}
//           </p>
//         </div>
//       </div>

//       {/* Narration */}
//       <div className="mt-6">
//         <label className="text-sm font-medium">Narration</label>
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
//       <button
//         onClick={saveVoucher}
//         className="mt-6 bg-blue-700 text-white px-6 py-2 rounded"
//       >
//         {isEditMode ? "Update Voucher" : "Save Voucher"}
//       </button>
//     </div>
//   );
// };

// export default PurchaseVoucher;



// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import axios from "axios";
// import { useCompany } from "../context/CompanyContext";
// import BulkImportButton from "./BulkImportButton";
// import { useParams, useNavigate } from "react-router-dom";

// const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher`;

// /* ─────────────────────────────────────────────
//    Inline styles — no Tailwind dependency for
//    the design system tokens; Tailwind utilities
//    are still used for spacing/flex helpers.
// ───────────────────────────────────────────── */
// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

//   :root {
//     --ink: #0f1117;
//     --ink-muted: #5c6070;
//     --ink-faint: #9ca3af;
//     --surface: #f7f7f5;
//     --surface-card: #ffffff;
//     --surface-hover: #f0f0ee;
//     --border: #e2e2dc;
//     --border-strong: #c8c8c0;
//     --accent: #1a56db;
//     --accent-light: #eff4ff;
//     --accent-hover: #1648c0;
//     --green: #0d7448;
//     --green-light: #ecfdf5;
//     --amber: #b45309;
//     --amber-light: #fffbeb;
//     --red: #c0392b;
//     --red-light: #fef2f2;
//     --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
//     --shadow-md: 0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04);
//     --radius: 10px;
//     --radius-sm: 6px;
//   }

//   .pv-wrap * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

//   .pv-wrap {
//     background: var(--surface);
//     min-height: 100vh;
//     padding: 32px 24px 80px;
//   }

//   /* ── Page header ── */
//   .pv-header {
//     display: flex;
//     align-items: flex-end;
//     justify-content: space-between;
//     margin-bottom: 28px;
//     padding-bottom: 20px;
//     border-bottom: 1.5px solid var(--border);
//   }
//   .pv-header-left {}
//   .pv-eyebrow {
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: .12em;
//     text-transform: uppercase;
//     color: var(--accent);
//     margin-bottom: 4px;
//   }
//   .pv-title {
//     font-family: 'DM Serif Display', serif;
//     font-size: 30px;
//     color: var(--ink);
//     margin: 0;
//     line-height: 1.15;
//   }

//   /* ── Cards ── */
//   .pv-card {
//     background: var(--surface-card);
//     border: 1px solid var(--border);
//     border-radius: var(--radius);
//     box-shadow: var(--shadow-sm);
//     padding: 24px;
//     margin-bottom: 20px;
//   }
//   .pv-card-title {
//     font-size: 12px;
//     font-weight: 600;
//     letter-spacing: .1em;
//     text-transform: uppercase;
//     color: var(--ink-muted);
//     margin-bottom: 18px;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//   }
//   .pv-card-title::after {
//     content: '';
//     flex: 1;
//     height: 1px;
//     background: var(--border);
//   }

//   /* ── Grid layouts ── */
//   .pv-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
//   .pv-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

//   @media (max-width: 768px) {
//     .pv-grid-3, .pv-grid-2 { grid-template-columns: 1fr; }
//   }

//   /* ── Field ── */
//   .pv-field { display: flex; flex-direction: column; gap: 5px; }
//   .pv-label {
//     font-size: 12px;
//     font-weight: 500;
//     color: var(--ink-muted);
//     letter-spacing: .01em;
//   }
//   .pv-label .req { color: var(--red); margin-left: 2px; }

//   .pv-input, .pv-select, .pv-textarea {
//     width: 100%;
//     padding: 9px 12px;
//     border: 1.5px solid var(--border);
//     border-radius: var(--radius-sm);
//     font-size: 14px;
//     color: var(--ink);
//     background: var(--surface-card);
//     transition: border-color .15s, box-shadow .15s;
//     outline: none;
//     font-family: 'DM Sans', sans-serif;
//   }
//   .pv-input:focus, .pv-select:focus, .pv-textarea:focus {
//     border-color: var(--accent);
//     box-shadow: 0 0 0 3px rgba(26,86,219,.1);
//   }
//   .pv-input.readonly {
//     background: var(--surface);
//     color: var(--ink-muted);
//     cursor: default;
//   }
//   .pv-select { cursor: pointer; }
//   .pv-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

//   /* ── Items table ── */
//   .pv-table-wrap {
//     overflow-x: auto;
//     border: 1px solid var(--border);
//     border-radius: var(--radius-sm);
//   }
//   .pv-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
//   .pv-table thead { background: var(--surface); }
//   .pv-table th {
//     padding: 10px 12px;
//     text-align: left;
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: .08em;
//     text-transform: uppercase;
//     color: var(--ink-muted);
//     border-bottom: 1.5px solid var(--border);
//     white-space: nowrap;
//   }
//   .pv-table th.right, .pv-table td.right { text-align: right; }
//   .pv-table th.center, .pv-table td.center { text-align: center; }
//   .pv-table tbody tr { transition: background .1s; }
//   .pv-table tbody tr:hover { background: var(--surface-hover); }
//   .pv-table td {
//     padding: 8px 10px;
//     border-bottom: 1px solid var(--border);
//     vertical-align: middle;
//   }
//   .pv-table tbody tr:last-child td { border-bottom: none; }

//   .pv-table-input {
//     width: 100%;
//     padding: 6px 10px;
//     border: 1.5px solid transparent;
//     border-radius: 5px;
//     font-size: 13.5px;
//     color: var(--ink);
//     background: transparent;
//     outline: none;
//     font-family: 'DM Sans', sans-serif;
//     transition: border-color .15s, background .15s;
//   }
//   .pv-table-input:focus {
//     border-color: var(--accent);
//     background: var(--surface-card);
//   }
//   .pv-table-input.number { text-align: right; }

//   .pv-amount-cell {
//     font-weight: 500;
//     font-variant-numeric: tabular-nums;
//     color: var(--ink);
//     white-space: nowrap;
//     text-align: right;
//     padding-right: 14px;
//   }

//   /* ── Remove row btn ── */
//   .pv-remove-btn {
//     display: flex; align-items: center; justify-content: center;
//     width: 26px; height: 26px;
//     border: none; border-radius: 50%; cursor: pointer;
//     background: transparent; color: var(--ink-faint);
//     transition: background .15s, color .15s;
//     margin: auto;
//   }
//   .pv-remove-btn:hover { background: var(--red-light); color: var(--red); }

//   /* ── Add row ── */
//   .pv-add-row {
//     display: inline-flex; align-items: center; gap: 6px;
//     padding: 7px 14px;
//     border: 1.5px dashed var(--border-strong);
//     border-radius: var(--radius-sm);
//     background: transparent; cursor: pointer;
//     font-size: 13px; font-weight: 500; color: var(--accent);
//     transition: border-color .15s, background .15s;
//     font-family: 'DM Sans', sans-serif;
//     margin-top: 12px;
//   }
//   .pv-add-row:hover { border-color: var(--accent); background: var(--accent-light); }

//   /* ── GST Buttons ── */
//   .pv-gst-buttons { display: flex; gap: 10px; flex-wrap: wrap; }

//   .pv-btn {
//     display: inline-flex; align-items: center; gap: 7px;
//     padding: 9px 18px;
//     border: none; border-radius: var(--radius-sm);
//     font-size: 13.5px; font-weight: 500; cursor: pointer;
//     transition: opacity .15s, transform .1s;
//     font-family: 'DM Sans', sans-serif;
//     letter-spacing: .01em;
//   }
//   .pv-btn:active { transform: scale(.97); }
//   .pv-btn-green { background: var(--green); color: #fff; }
//   .pv-btn-green:hover { opacity: .88; }
//   .pv-btn-amber { background: var(--amber); color: #fff; }
//   .pv-btn-amber:hover { opacity: .88; }
//   .pv-btn-primary {
//     background: var(--accent); color: #fff;
//     padding: 11px 28px; font-size: 14.5px; font-weight: 600;
//     border-radius: var(--radius-sm);
//   }
//   .pv-btn-primary:hover { background: var(--accent-hover); }

//   /* ── GST breakdown ── */
//   .pv-gst-row {
//     display: flex; align-items: center; gap: 8px;
//     font-size: 13px;
//   }
//   .pv-gst-label { color: var(--ink-muted); min-width: 42px; }
//   .pv-gst-input {
//     width: 90px;
//     padding: 6px 10px;
//     border: 1.5px solid var(--border);
//     border-radius: 5px;
//     font-size: 13px; font-family: 'DM Sans', sans-serif;
//     text-align: right; color: var(--ink); outline: none;
//     transition: border-color .15s;
//   }
//   .pv-gst-input:focus { border-color: var(--accent); }

//   /* ── Totals panel ── */
//   .pv-totals {
//     background: var(--surface);
//     border: 1px solid var(--border);
//     border-radius: var(--radius-sm);
//     padding: 18px 20px;
//     min-width: 260px;
//   }
//   .pv-totals-row {
//     display: flex; justify-content: space-between; align-items: center;
//     font-size: 13.5px; padding: 4px 0; color: var(--ink-muted);
//   }
//   .pv-totals-row.grand {
//     font-size: 17px; font-weight: 700;
//     color: var(--ink); border-top: 1.5px solid var(--border-strong);
//     margin-top: 8px; padding-top: 12px;
//   }
//   .pv-totals-row .val { font-variant-numeric: tabular-nums; font-weight: 500; color: var(--ink); }
//   .pv-totals-row.grand .val { color: var(--accent); }
//   .pv-totals-row.gst-line .val { color: var(--green); }

//   /* ── Party/Dispatch detail grid ── */
//   .pv-detail-label {
//     font-size: 12px; font-weight: 500; color: var(--ink-muted);
//     padding-top: 9px;
//   }

//   /* ── Status badge ── */
//   .pv-badge {
//     display: inline-flex; align-items: center; gap: 5px;
//     padding: 3px 10px; border-radius: 20px;
//     font-size: 11.5px; font-weight: 600; letter-spacing: .04em;
//   }
//   .pv-badge-edit { background: var(--amber-light); color: var(--amber); }
//   .pv-badge-new { background: var(--green-light); color: var(--green); }

//   /* ── Footer action bar ── */
//   .pv-footer {
//     display: flex; align-items: center; justify-content: space-between;
//     flex-wrap: wrap; gap: 12px;
//     padding: 20px 24px;
//     background: var(--surface-card);
//     border: 1px solid var(--border);
//     border-radius: var(--radius);
//     box-shadow: var(--shadow-md);
//     margin-top: 8px;
//   }

//   /* ── Section divider ── */
//   .pv-divider {
//     height: 1px; background: var(--border);
//     margin: 4px 0 20px;
//   }

//   /* ── Pill tabs (Party / Dispatch) ── */
//   .pv-tabs { display: flex; gap: 4px; margin-bottom: 20px; }
//   .pv-tab {
//     padding: 6px 14px; border-radius: 20px;
//     font-size: 12.5px; font-weight: 500; cursor: pointer;
//     border: 1.5px solid var(--border);
//     background: transparent; color: var(--ink-muted);
//     transition: all .15s; font-family: 'DM Sans', sans-serif;
//   }
//   .pv-tab.active {
//     background: var(--accent); color: #fff; border-color: var(--accent);
//   }

//   /* Separator line in totals */
//   hr.pv-hr { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
// `;

// /* ── Sub-component: FieldRow (label + input side by side) ── */
// const FieldRow = ({ label, children }) => (
//   <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
//     <span className="pv-detail-label">{label}</span>
//     <div>{children}</div>
//   </div>
// );

// const PurchaseVoucher = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { companyId } = useCompany();
//   const [activeDetailTab, setActiveDetailTab] = useState("party");
//   const [states, setStates] = useState([]);
//   const [countries, setCountries] = useState([]);

//   const [voucher, setVoucher] = useState({
//     date: "",
//     invoiceNo: "",
//     customer: "",
//     ledger: "",
//     narration: "",
//     mailingName: "",
//     address: "",
//     state: "Not Applicable",
//     country: "India",
//     gstRegistrationType: "Unregistered/Consumer",
//     gstin: "",
//     placeOfSupply: "Not Applicable",
//     deliveryNoteNo: "",
//     dispatchDocNo: "",
//     dispatchedThrough: "",
//     destination: "",
//     carrierName: "",
//     billOfLading: "",
//     dispatchDate: "",
//     receiptNoteNo: "",
//     receiptDate: "",
//     receiptDocNo: "",
//     billOfLadingDate: "",
//     supplierInvoiceNo: "",
//     supplierInvoiceDate: "",
//     items: [{ itemName: "", hsn_code: "", qty: 1, rate: 0, amount: 0 }],
//   });

//   const [gst, setGst] = useState({ applied: false, percentage: 0, amount: 0, igst: 0, cgst: 0, sgst: 0 });
//   const [ledgers, setLedgers] = useState([]);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const fetchStates = async () => {
//     try {
//       const res = await fetch(
//         "https://countriesnow.space/api/v0.1/countries/states",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             country: "India",
//           }),
//         }
//       );

//       const data = await res.json();
//       setStates(data.data.states);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const fetchCountries = async () => {
//     try {
//       const res = await fetch(
//         "https://restcountries.com/v3.1/all?fields=name,cca2,flags"
//       );

//       const data = await res.json();

//       const formatted = data
//         .map((c) => ({
//           name: c.name.common,
//           code: c.cca2,
//           flag: c.flags?.png,
//         }))
//         .sort((a, b) => a.name.localeCompare(b.name));

//       setCountries(formatted);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchStates();
//     fetchCountries();
//     const fetchData = async () => {
//       try {
//         const res2 = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
//         setLedgers(res2.data);
//         if (id) {
//           setIsEditMode(true);
//           const voucherRes = await axios.get(`${API}/single/${id}`);
//           const v = voucherRes.data;
//           if (v) {
//             setVoucher({
//               date: v.date ? new Date(v.date).toISOString().split("T")[0] : "",
//               invoiceNo: v.invoiceNo || v.voucherNo || "",
//               customer: v.customer || v.partyName || "",
//               ledger: String(v.ledgerId || v.ledger || ""),
//               narration: v.narration || "",
//               mailingName: v.mailingName || "",
//               address: v.address || "",
//               state: v.state || "Not Applicable",
//               country: v.country || "India",
//               gstRegistrationType: v.gstRegistrationType || "Unregistered/Consumer",
//               gstin: v.gstin || "",
//               placeOfSupply: v.placeOfSupply || "Not Applicable",
//               deliveryNoteNo: v.deliveryNoteNo || "",
//               dispatchDocNo: v.dispatchDocNo || "",
//               dispatchedThrough: v.dispatchedThrough || "",
//               destination: v.destination || "",
//               carrierName: v.carrierName || "",
//               billOfLading: v.billOfLading || "",
//               billOfLadingDate: v.billOfLadingDate ? new Date(v.billOfLadingDate).toISOString().split("T")[0] : "",
//               motorVehicleNo: v.motorVehicleNo || "",
//               dispatchDate: v.dispatchDate ? new Date(v.dispatchDate).toISOString().split("T")[0] : "",
//               receiptNoteNo: v.receiptNoteNo || "",
//               receiptDate: v.receiptDate ? new Date(v.receiptDate).toISOString().split("T")[0] : "",
//               receiptDocNo: v.receiptDocNo || "",
//               supplierInvoiceNo: v.supplierInvoiceNo || "",
//               supplierInvoiceDate: v.supplierInvoiceDate ? new Date(v.supplierInvoiceDate).toISOString().split("T")[0] : "",
//               items: v.items?.length > 0
//                 ? v.items.map(i => ({ itemName: i.item || i.itemName || "", hsn_code: i.hsn_code || "", qty: i.qty || 1, rate: i.rate || 0, amount: i.amount || 0 }))
//                 : [{ itemName: "", hsn_code: "", qty: 1, rate: 0, amount: 0 }],
//             });
//             setGst({
//               applied: (v.gst_percentage || v.gstPercentage || 0) > 0,
//               percentage: v.gst_percentage || v.gstPercentage || 0,
//               amount: v.gst_amount || v.gstAmount || 0,
//               igst: v.igst || 0, cgst: v.cgst || 0, sgst: v.sgst || 0,
//             });
//           }
//         }
//       } catch (err) { console.error(err); }
//     };
//     if (companyId) fetchData();
//   }, [companyId, id]);

//   const handleItemChange = (index, field, value) => {
//     const updated = [...voucher.items];
//     updated[index][field] = value;
//     if (field === "qty" || field === "rate") {
//       const qty = parseFloat(updated[index].qty) || 0;
//       const rate = parseFloat(updated[index].rate) || 0;
//       updated[index].amount = qty * rate;
//     }
//     setVoucher({ ...voucher, items: updated });
//   };

//   const addRow = () => setVoucher({ ...voucher, items: [...voucher.items, { itemName: "", hsn_code: "", qty: 1, rate: 0, amount: 0 }] });
//   const removeRow = (i) => { if (voucher.items.length > 1) setVoucher({ ...voucher, items: voucher.items.filter((_, idx) => idx !== i) }); };

//   const totalAmount = voucher.items.reduce((sum, r) => sum + Number(r.amount || 0), 0);
//   const grandTotal = totalAmount + (gst.applied ? gst.amount : 0) + Number(gst.igst) + Number(gst.cgst) + Number(gst.sgst);

//   const handleAutoGST = async () => {
//     const res = await axios.get(`${API}/gst/default`);
//     const pct = res.data.defaultGst;
//     const amt = (totalAmount * pct) / 100;
//     setGst({ ...gst, applied: true, percentage: pct, amount: amt });
//     Swal.fire({ icon: "success", title: "GST Applied", text: `${pct}% GST added`, timer: 1600, showConfirmButton: false });
//   };

//   const handleManualGST = async () => {
//     const { value } = await Swal.fire({ title: "Enter GST Percentage", input: "number", inputAttributes: { min: 0, max: 100, step: 0.1 }, confirmButtonText: "Apply", showCancelButton: true });
//     if (value) {
//       const amt = (totalAmount * value) / 100;
//       setGst({ ...gst, applied: true, percentage: parseFloat(value), amount: amt });
//       Swal.fire({ icon: "success", title: "GST Added", text: `${value}% GST applied`, timer: 1600, showConfirmButton: false });
//     }
//   };

//   const handleBulkImport = async (data) => {
//     try {
//       const grouped = {};
//       data.forEach(row => {
//         const invoiceNo = row.InvoiceNo || row.VoucherNo || "Unknown";
//         if (!grouped[invoiceNo]) {
//           grouped[invoiceNo] = { date: row.Date ? new Date(row.Date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0], invoiceNo, customer: row.PartyName, narration: row.Narration || "", items: [], gst_percentage: parseFloat(row.GST || 0), igst: parseFloat(row.IGST || 0), cgst: parseFloat(row.CGST || 0), sgst: parseFloat(row.SGST || 0) };
//         }
//         grouped[invoiceNo].items.push({ item: row.ItemName, qty: parseFloat(row.Qty || 1), rate: parseFloat(row.Rate || 0), amount: parseFloat(row.Qty || 1) * parseFloat(row.Rate || 0), hsn_code: row.HSN || "" });
//       });
//       const vouchers = Object.values(grouped).map(v => {
//         const ledgerObj = ledgers.find(l => l.name.toLowerCase() === (v.customer || "").toLowerCase());
//         const subtotal = v.items.reduce((s, i) => s + i.amount, 0);
//         const gstAmount = (subtotal * v.gst_percentage) / 100;
//         return { date: v.date, invoiceNo: v.invoiceNo, customer: v.customer, ledger: ledgerObj ? ledgerObj.id : null, subtotal, gst_percentage: v.gst_percentage, gst_amount: gstAmount, grand_total: subtotal + gstAmount + v.igst + v.cgst + v.sgst, narration: v.narration, igst: v.igst, cgst: v.cgst, sgst: v.sgst, items: v.items };
//       });
//       const uniqueMissing = [...new Set(vouchers.filter(v => !v.ledger).map(v => v.customer))];
//       if (uniqueMissing.length > 0) {
//         const result = await Swal.fire({ icon: "warning", title: "Ledgers Not Found", text: `Parties not found: ${uniqueMissing.join(", ")}.`, showCancelButton: true, confirmButtonText: "Create Ledgers", cancelButtonText: "Cancel" });
//         if (result.isConfirmed) {
//           const groupRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`);
//           const creditorGroup = groupRes.data.find(g => g.groupName === "Sundry Creditors");
//           if (!creditorGroup) { Swal.fire("Error", "Sundry Creditors group not found.", "error"); return; }
//           for (const name of uniqueMissing) { await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`, { name, under: JSON.stringify({ name: "Sundry Creditors", id: creditorGroup.id }), mailingName: name, openingBalance: 0, state: "Not Applicable", country: "India", registrationType: "Regular", companyId }); }
//           const ledgerRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
//           const newLedgers = ledgerRes.data || [];
//           setLedgers(newLedgers);
//           vouchers.forEach(v => { if (!v.ledger) { const l = newLedgers.find(led => led.name.toLowerCase() === v.customer.toLowerCase()); if (l) v.ledger = l.id; } });
//         } else return;
//       }
//       const finalValid = vouchers.filter(v => v.ledger);
//       if (!finalValid.length) return;
//       const res = await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/bulk-create`, { companyId, vouchers: finalValid });
//       Swal.fire("Success", res.data.message || "Bulk Import Successful", "success");
//     } catch (err) { Swal.fire("Error", "Failed to import vouchers", "error"); }
//   };

//   const saveVoucher = async () => {
//     try {
//       const payload = { 
//         ...voucher,
//         companyId, 
//         subtotal: totalAmount, 
//         gst_percentage: gst.percentage, 
//         gst_amount: gst.amount, 
//         igst: gst.igst, 
//         cgst: gst.cgst, 
//         sgst: gst.sgst, 
//         grand_total: grandTotal, 
//         narration: voucher.narration, 
//         items: voucher.items.map(i => ({ 
//           item: i.itemName, 
//           hsn_code: i.hsn_code, 
//           qty: i.qty, 
//           rate: i.rate, 
//           amount: i.amount 
//         })) 
//       };
//       if (isEditMode) {
//         await axios.put(`${API}/${id}`, payload);
//         Swal.fire("Success", "Voucher updated successfully", "success");
//         navigate("/listOfPurchaseVoucher");
//       } else {
//         const res = await axios.post(API, payload);
//         await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher/createVoucher`, { companyId, voucherId: Date.now(), voucherType: "Purchase", ledgerId: voucher.ledger, debit: 0, credit: grandTotal, fromLedger: voucher.ledger, toLedger: 0, amount: grandTotal, gst: gst.amount, igst: gst.igst, cgst: gst.cgst, sgst: gst.sgst, date: voucher.date, narration: voucher.narration, invoiceNo: voucher.invoiceNo, items: voucher.items.map(i => ({ itemName: i.itemName, hsn_code: i.hsn_code, itemQuantity: i.qty, rate: i.rate, amount: i.amount })) });
//         Swal.fire({ icon: "success", title: "Saved Successfully", showCancelButton: true, confirmButtonText: "Download PDF", cancelButtonText: "Close" }).then(r => { if (r.isConfirmed) window.open(`${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`, "_blank"); });
//       }
//     } catch (err) { Swal.fire("Error", `Something went wrong while ${isEditMode ? "updating" : "saving"}!`, "error"); }
//   };

//   const set = (key, val) => setVoucher(v => ({ ...v, [key]: val }));

//   return (
//     <>
//       <style>{styles}</style>

//       <div className="pv-wrap">

//         {/* ── Page Header ── */}
//         <div className="pv-header">
//           <div className="pv-header-left">
//             <p className="pv-eyebrow">Accounts Payable</p>
//             <h1 className="pv-title">Purchase Voucher</h1>
//           </div>
//           <span className={`pv-badge ${isEditMode ? "pv-badge-edit" : "pv-badge-new"}`}>
//             <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
//             {isEditMode ? "Edit Mode" : "New Voucher"}
//           </span>
//         </div>

//         {/* ── Section 1 : Voucher Basics ── */}
//         <div className="pv-card">
//           <p className="pv-card-title">Voucher Details</p>
//           <div className="pv-grid-3">
//             <div className="pv-field">
//               <label className="pv-label">Voucher No</label>
//               <input className="pv-input" placeholder="e.g. PUR-001" value={voucher.invoiceNo} onChange={e => set("invoiceNo", e.target.value)} />
//             </div>
//             <div className="pv-field">
//               <label className="pv-label">Date <span className="req">*</span></label>
//               <input type="date" className="pv-input" value={voucher.date} onChange={e => set("date", e.target.value)} />
//             </div>
//             <div className="pv-field">
//               <label className="pv-label">Party Name <span className="req">*</span></label>
//               <input className="pv-input" placeholder="Enter supplier / party" value={voucher.customer} onChange={e => set("customer", e.target.value)} />
//             </div>
//           </div>

//           <div className="pv-grid-3" style={{ marginTop: 14 }}>
//             <div className="pv-field">
//               <label className="pv-label">Supplier Invoice No.</label>
//               <input className="pv-input" placeholder="e.g. ABC/123" value={voucher.supplierInvoiceNo} onChange={e => set("supplierInvoiceNo", e.target.value)} />
//             </div>
//             <div className="pv-field">
//               <label className="pv-label">Supplier Invoice Date</label>
//               <input type="date" className="pv-input" value={voucher.supplierInvoiceDate} onChange={e => set("supplierInvoiceDate", e.target.value)} />
//             </div>
//             <div className="pv-field">
//               <label className="pv-label">Purchase Ledger <span className="req">*</span></label>
//               {/* <select className="pv-select" value={voucher.ledger} onChange={e => set("ledger", e.target.value)}>
//                 <option value="">— Select ledger —</option>
//                 {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
//               </select> */}

//               <select
//   className="pv-select"
//   value={voucher.ledger}
//   onChange={(e) => {
//     const ledgerId = e.target.value;

//     // Find selected ledger
//     const selectedLedger = ledgers.find(
//       (l) => String(l.id) === String(ledgerId)
//     );

//     setVoucher((prev) => ({
//       ...prev,

//       // ledger
//       ledger: ledgerId,

//       // supplier/customer
//       customer: selectedLedger?.name || "",

//       // party details auto fill
//       mailingName: selectedLedger?.mailingName || "",
//       address: selectedLedger?.address || "",
//       state: selectedLedger?.state || "Not Applicable",
//       country: selectedLedger?.country || "India",

//       // GST
//       gstRegistrationType:
//         selectedLedger?.registrationType ||
//         "Unregistered/Consumer",

//       gstin: selectedLedger?.gstin || "",

//       placeOfSupply:
//         selectedLedger?.state || "Not Applicable",
//     }));
//   }}
// >
//   <option value="">— Select ledger —</option>

//   {ledgers.map((l) => (
//     <option key={l.id} value={l.id}>
//       {l.name}
//     </option>
//   ))}
// </select>
//             </div>
//           </div>
//         </div>

//         {/* ── Section 2 : Party & Dispatch (tabbed) ── */}
//         <div className="pv-card">
//           <div className="pv-tabs">

//             <button className={`pv-tab ${activeDetailTab === "party" ? "active" : ""}`} onClick={() => setActiveDetailTab("party")}>Party Details</button>
//             <button className={`pv-tab ${activeDetailTab === "receipt" ? "active" : ""}`} onClick={() => setActiveDetailTab("receipt")}>Receipt Details</button>
//           </div>

//           {activeDetailTab === "party" && (
//             <div className="pv-grid-2">
//               <div>
//                 <FieldRow label="Supplier (Bill from)">
//                   <input className="pv-input readonly" readOnly value={ledgers.find(l => String(l.id) === String(voucher.ledger))?.name || ""} placeholder="Auto-filled from ledger" />
//                 </FieldRow>
//                 <FieldRow label="Mailing Name">
//                   <input className="pv-input" value={voucher.mailingName} onChange={e => set("mailingName", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="State">
//                   <select className="pv-select" value={voucher.state} onChange={e => set("state", e.target.value)}>
//                     <option value="Not Applicable">Not Applicable</option>
//                     {states.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
//                   </select>
//                 </FieldRow>
//                 <FieldRow label="Country">
//                   <select className="pv-select" value={voucher.country} onChange={e => set("country", e.target.value)}>
//                     <option value="India">India</option>
//                     {countries.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
//                   </select>
//                 </FieldRow>
//               </div>
//               <div>
//                 <FieldRow label="Address">
//                   <textarea className="pv-textarea" rows={3} value={voucher.address} onChange={e => set("address", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="GST Reg. Type">
//                   <select className="pv-select" value={voucher.gstRegistrationType} onChange={e => set("gstRegistrationType", e.target.value)}>
//                     <option>Unregistered/Consumer</option>
//                     <option>Regular</option>
//                     <option>Composition</option>
//                   </select>
//                 </FieldRow>
//                 <FieldRow label="GSTIN/UIN">
//                   <input className="pv-input" placeholder="22AAAAA0000A1Z5" value={voucher.gstin} onChange={e => set("gstin", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Place of Supply">
//                   <select className="pv-select" value={voucher.placeOfSupply} onChange={e => set("placeOfSupply", e.target.value)}>
//                     <option value="Not Applicable">Not Applicable</option>
//                     {states.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
//                   </select>
//                 </FieldRow>
//               </div>
//             </div>
//           )}

//           {activeDetailTab === "receipt" && (
//             <div className="pv-grid-2">
//               <div>
//                 <FieldRow label="Receipt Note No(s)">
//                   <input className="pv-input" value={voucher.receiptNoteNo} onChange={e => set("receiptNoteNo", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Date">
//                   <input type="date" className="pv-input" value={voucher.receiptDate} onChange={e => set("receiptDate", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Receipt Doc No.">
//                   <input className="pv-input" value={voucher.receiptDocNo} onChange={e => set("receiptDocNo", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Dispatched through">
//                   <input className="pv-input" value={voucher.dispatchedThrough} onChange={e => set("dispatchedThrough", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Destination">
//                   <input className="pv-input" value={voucher.destination} onChange={e => set("destination", e.target.value)} />
//                 </FieldRow>
//               </div>
//               <div>
//                 <FieldRow label="Carrier Name/Agent">
//                   <input className="pv-input" value={voucher.carrierName} onChange={e => set("carrierName", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Bill of Lading/LR-RR No.">
//                   <input className="pv-input" value={voucher.billOfLading} onChange={e => set("billOfLading", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Date">
//                   <input type="date" className="pv-input" value={voucher.billOfLadingDate} onChange={e => set("billOfLadingDate", e.target.value)} />
//                 </FieldRow>
//                 <FieldRow label="Motor Vehicle No.">
//                   <input className="pv-input" value={voucher.motorVehicleNo} onChange={e => set("motorVehicleNo", e.target.value)} />
//                 </FieldRow>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── Section 3 : Items ── */}
//         <div className="pv-card">
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
//             <p className="pv-card-title" style={{ margin: 0 }}>Line Items</p>
//             <div style={{ display: "flex", gap: 8 }}>
//               <BulkImportButton onDataParsed={handleBulkImport} />
//             </div>
//           </div>

//           <div className="pv-table-wrap">
//             <table className="pv-table">
//               <thead>
//                 <tr>
//                   <th style={{ width: "36%", paddingLeft: 14 }}>Item Name</th>
//                   <th style={{ width: "14%" }}>HSN Code</th>
//                   <th className="right" style={{ width: "12%" }}>Qty</th>
//                   <th className="right" style={{ width: "16%" }}>Rate (₹)</th>
//                   <th className="right" style={{ width: "16%", paddingRight: 14 }}>Amount (₹)</th>
//                   <th style={{ width: "6%" }}></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {voucher.items.map((row, index) => (
//                   <tr key={index}>
//                     <td style={{ paddingLeft: 10 }}>
//                       <input className="pv-table-input" placeholder="Item description" value={row.itemName} onChange={e => handleItemChange(index, "itemName", e.target.value)} />
//                     </td>
//                     <td>
//                       <input className="pv-table-input" placeholder="0000" value={row.hsn_code} onChange={e => handleItemChange(index, "hsn_code", e.target.value)} />
//                     </td>
//                     <td>
//                       <input type="number" className="pv-table-input number" value={row.qty} onChange={e => handleItemChange(index, "qty", e.target.value)} />
//                     </td>
//                     <td>
//                       <input type="number" className="pv-table-input number" value={row.rate} onChange={e => handleItemChange(index, "rate", e.target.value)} />
//                     </td>
//                     <td className="pv-amount-cell">
//                       {Number(row.amount).toFixed(2)}
//                     </td>
//                     <td>
//                       <button className="pv-remove-btn" onClick={() => removeRow(index)} title="Remove item">
//                         <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <button className="pv-add-row" onClick={addRow}>
//             <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
//             Add line item
//           </button>
//         </div>

//         {/* ── Section 4 : GST + Totals ── */}
//         <div className="pv-card">
//           <p className="pv-card-title">Tax & Totals</p>

//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>

//             {/* Left: GST actions + breakdown */}
//             <div style={{ flex: "1 1 320px" }}>
//               <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Apply GST</p>
//               <div className="pv-gst-buttons" style={{ marginBottom: 20 }}>
//                 <button className="pv-btn pv-btn-green" onClick={handleAutoGST}>
//                   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
//                   Auto GST
//                 </button>
//                 <button className="pv-btn pv-btn-amber" onClick={handleManualGST}>
//                   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
//                   Manual GST
//                 </button>
//               </div>

//               {gst.applied && (
//                 <div style={{ background: "var(--green-light)", border: "1px solid #a7f3d0", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--green)", fontWeight: 500, marginBottom: 16 }}>
//                   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
//                   {gst.percentage}% GST applied — ₹{gst.amount.toFixed(2)}
//                 </div>
//               )}

//               <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>Component Breakdown</p>
//               <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//                 {[["IGST", "igst"], ["CGST", "cgst"], ["SGST", "sgst"]].map(([label, key]) => (
//                   <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//                     <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: ".06em" }}>{label} (₹)</span>
//                     <input type="number" className="pv-gst-input" value={gst[key]} onChange={e => setGst(g => ({ ...g, [key]: e.target.value }))} />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Right: Totals panel */}
//             <div className="pv-totals" style={{ flex: "0 0 auto" }}>
//               <div className="pv-totals-row">
//                 <span>Subtotal</span>
//                 <span className="val">₹ {totalAmount.toFixed(2)}</span>
//               </div>
//               {gst.applied && (
//                 <div className="pv-totals-row gst-line">
//                   <span>GST ({gst.percentage}%)</span>
//                   <span className="val">₹ {gst.amount.toFixed(2)}</span>
//                 </div>
//               )}
//               {Number(gst.igst) > 0 && <div className="pv-totals-row"><span>IGST</span><span className="val">₹ {Number(gst.igst).toFixed(2)}</span></div>}
//               {Number(gst.cgst) > 0 && <div className="pv-totals-row"><span>CGST</span><span className="val">₹ {Number(gst.cgst).toFixed(2)}</span></div>}
//               {Number(gst.sgst) > 0 && <div className="pv-totals-row"><span>SGST</span><span className="val">₹ {Number(gst.sgst).toFixed(2)}</span></div>}
//               <div className="pv-totals-row grand">
//                 <span>Grand Total</span>
//                 <span className="val">₹ {grandTotal.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Section 5 : Narration ── */}
//         <div className="pv-card">
//           <p className="pv-card-title">Narration</p>
//           <textarea className="pv-textarea" rows={3} placeholder="Add internal notes or narration for this voucher…" value={voucher.narration} onChange={e => set("narration", e.target.value)} />
//         </div>

//         {/* ── Footer Action Bar ── */}
//         <div className="pv-footer">
//           <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
//             {isEditMode
//               ? <span>Editing voucher <strong style={{ color: "var(--ink)" }}>{voucher.invoiceNo || id}</strong></span>
//               : <span>All fields marked <span style={{ color: "var(--red)" }}>*</span> are required</span>
//             }
//           </div>
//           <button className="pv-btn pv-btn-primary" onClick={saveVoucher}>
//             <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
//               {isEditMode
//                 ? <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>
//                 : <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>
//               }
//             </svg>
//             {isEditMode ? "Update Voucher" : "Save Voucher"}
//           </button>
//         </div>

//       </div>
//     </>
//   );
// };

// export default PurchaseVoucher;




import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";
import BulkImportButton from "./BulkImportButton";
import { useParams, useNavigate } from "react-router-dom";
import { Search, UserPlus } from 'lucide-react';
import useAuth from "../../../hooks/useAuth";

const API = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher`;

// --- Internal Searchable Select Component ---
const SearchableLedgerSelect = ({ ledgers, value, onSelect, onCreateNew, placeholder = "Search or add ledger..." }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLedger = ledgers.find((l) => String(l.id) === String(value));

  useEffect(() => {
    if (selectedLedger) {
      setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
    }
  }, [selectedLedger]);

  const filtered = ledgers.filter((l) =>
    (l.name || l.ledgerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedLedger) setSearchTerm(selectedLedger.name || selectedLedger.ledgerName);
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
          className="pv-input pr-10"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Search size={18} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-100 mt-1 w-full bg-white border border-[#e2e2dc] rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((l) => (
              <div
                key={l.id}
                className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-b-0"
                onClick={() => {
                  onSelect(l.id);
                  setSearchTerm(l.name || l.ledgerName);
                  setIsOpen(false);
                }}
              >
                {l.name || l.ledgerName}
              </div>
            ))
          ) : (
            <div className="px-4 py-2.5 text-sm text-gray-500 italic">No matches found</div>
          )}

          <div
            className="px-4 py-2.5 text-sm bg-gray-50 hover:bg-blue-100 cursor-pointer text-blue-600 font-medium flex items-center gap-2 border-t border-[#e2e2dc]"
            onClick={() => {
              onCreateNew(searchTerm);
              setIsOpen(false);
            }}
          >
            <UserPlus size={18} /> Add "{searchTerm || "New Ledger"}"
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Inline styles — no Tailwind dependency for
   the design system tokens; Tailwind utilities
   are still used for spacing/flex helpers.
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  :root {
    --ink: #0f1117;
    --ink-muted: #5c6070;
    --ink-faint: #9ca3af;
    --surface: #f7f7f5;
    --surface-card: #ffffff;
    --surface-hover: #f0f0ee;
    --border: #e2e2dc;
    --border-strong: #c8c8c0;
    --accent: #1a56db;
    --accent-light: #eff4ff;
    --accent-hover: #1648c0;
    --green: #0d7448;
    --green-light: #ecfdf5;
    --amber: #b45309;
    --amber-light: #fffbeb;
    --red: #c0392b;
    --red-light: #fef2f2;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04);
    --radius: 10px;
    --radius-sm: 6px;
  }

  .pv-wrap * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

  .pv-wrap {
    background: var(--surface);
    min-height: 100vh;
    padding: 32px 24px 80px;
  }

  /* ── Page header ── */
  .pv-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1.5px solid var(--border);
  }
  .pv-header-left {}
  .pv-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 4px;
  }
  .pv-title {
    font-family: 'DM Serif Display', serif;
    font-size: 30px;
    color: var(--ink);
    margin: 0;
    line-height: 1.15;
  }

  /* ── Cards ── */
  .pv-card {
    background: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: 24px;
    margin-bottom: 20px;
  }
  .pv-card-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pv-card-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Grid layouts ── */
  .pv-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .pv-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  @media (max-width: 768px) {
    .pv-grid-3, .pv-grid-2 { grid-template-columns: 1fr; }
  }

  /* ── Field ── */
  .pv-field { display: flex; flex-direction: column; gap: 5px; }
  .pv-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ink-muted);
    letter-spacing: .01em;
  }
  .pv-label .req { color: var(--red); margin-left: 2px; }

  .pv-input, .pv-select, .pv-textarea {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--ink);
    background: var(--surface-card);
    transition: border-color .15s, box-shadow .15s;
    outline: none;
    font-family: 'DM Sans', sans-serif;
  }
  .pv-input:focus, .pv-select:focus, .pv-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(26,86,219,.1);
  }
  .pv-input.readonly {
    background: var(--surface);
    color: var(--ink-muted);
    cursor: default;
  }
  .pv-select { cursor: pointer; }
  .pv-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

  /* ── Items table ── */
  .pv-table-wrap {
    overflow: visible;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .pv-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .pv-table thead { background: var(--surface); }
  .pv-table th {
    padding: 10px 12px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--ink-muted);
    border-bottom: 1.5px solid var(--border);
    white-space: nowrap;
  }
  .pv-table th.right, .pv-table td.right { text-align: right; }
  .pv-table th.center, .pv-table td.center { text-align: center; }
  .pv-table tbody tr { transition: background .1s; }
  .pv-table tbody tr:hover { background: var(--surface-hover); }
  .pv-table td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  .pv-table tbody tr:last-child td { border-bottom: none; }

  .pv-table-input {
    width: 100%;
    padding: 6px 10px;
    border: 1.5px solid transparent;
    border-radius: 5px;
    font-size: 13.5px;
    color: var(--ink);
    background: transparent;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border-color .15s, background .15s;
  }
  .pv-table-input:focus {
    border-color: var(--accent);
    background: var(--surface-card);
  }
  .pv-table-input.number { text-align: right; }

  .pv-amount-cell {
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--ink);
    white-space: nowrap;
    text-align: right;
    padding-right: 14px;
  }

  /* ── Remove row btn ── */
  .pv-remove-btn {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px;
    border: none; border-radius: 50%; cursor: pointer;
    background: transparent; color: var(--ink-faint);
    transition: background .15s, color .15s;
    margin: auto;
  }
  .pv-remove-btn:hover { background: var(--red-light); color: var(--red); }

  /* ── Add row ── */
  .pv-add-row {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    border: 1.5px dashed var(--border-strong);
    border-radius: var(--radius-sm);
    background: transparent; cursor: pointer;
    font-size: 13px; font-weight: 500; color: var(--accent);
    transition: border-color .15s, background .15s;
    font-family: 'DM Sans', sans-serif;
    margin-top: 12px;
  }
  .pv-add-row:hover { border-color: var(--accent); background: var(--accent-light); }

  /* ── GST Buttons ── */
  .pv-gst-buttons { display: flex; gap: 10px; flex-wrap: wrap; }

  .pv-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px;
    border: none; border-radius: var(--radius-sm);
    font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: opacity .15s, transform .1s;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: .01em;
  }
  .pv-btn:active { transform: scale(.97); }
  .pv-btn-green { background: var(--green); color: #fff; }
  .pv-btn-green:hover { opacity: .88; }
  .pv-btn-amber { background: var(--amber); color: #fff; }
  .pv-btn-amber:hover { opacity: .88; }
  .pv-btn-primary {
    background: var(--accent); color: #fff;
    padding: 11px 28px; font-size: 14.5px; font-weight: 600;
    border-radius: var(--radius-sm);
  }
  .pv-btn-primary:hover { background: var(--accent-hover); }

  /* ── GST breakdown ── */
  .pv-gst-row {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px;
  }
  .pv-gst-label { color: var(--ink-muted); min-width: 42px; }
  .pv-gst-input {
    width: 90px;
    padding: 6px 10px;
    border: 1.5px solid var(--border);
    border-radius: 5px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    text-align: right; color: var(--ink); outline: none;
    transition: border-color .15s;
  }
  .pv-gst-input:focus { border-color: var(--accent); }

  /* ── Totals panel ── */
  .pv-totals {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 18px 20px;
    min-width: 260px;
  }
  .pv-totals-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13.5px; padding: 4px 0; color: var(--ink-muted);
  }
  .pv-totals-row.grand {
    font-size: 17px; font-weight: 700;
    color: var(--ink); border-top: 1.5px solid var(--border-strong);
    margin-top: 8px; padding-top: 12px;
  }
  .pv-totals-row .val { font-variant-numeric: tabular-nums; font-weight: 500; color: var(--ink); }
  .pv-totals-row.grand .val { color: var(--accent); }
  .pv-totals-row.gst-line .val { color: var(--green); }

  /* ── Party/Dispatch detail grid ── */
  .pv-detail-label {
    font-size: 12px; font-weight: 500; color: var(--ink-muted);
    padding-top: 9px;
  }

  /* ── Status badge ── */
  .pv-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11.5px; font-weight: 600; letter-spacing: .04em;
  }
  .pv-badge-edit { background: var(--amber-light); color: var(--amber); }
  .pv-badge-new { background: var(--green-light); color: var(--green); }

  /* ── Footer action bar ── */
  .pv-footer {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
    padding: 20px 24px;
    background: var(--surface-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    margin-top: 8px;
  }

  /* ── Section divider ── */
  .pv-divider {
    height: 1px; background: var(--border);
    margin: 4px 0 20px;
  }

  /* ── Pill tabs (Party / Dispatch) ── */
  .pv-tabs { display: flex; gap: 4px; margin-bottom: 20px; }
  .pv-tab {
    padding: 6px 14px; border-radius: 20px;
    font-size: 12.5px; font-weight: 500; cursor: pointer;
    border: 1.5px solid var(--border);
    background: transparent; color: var(--ink-muted);
    transition: all .15s; font-family: 'DM Sans', sans-serif;
  }
  .pv-tab.active {
    background: var(--accent); color: #fff; border-color: var(--accent);
  }

  /* Separator line in totals */
  hr.pv-hr { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
`;

/* ── Sub-component: FieldRow (label + input side by side) ── */
const FieldRow = ({ label, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
    <span className="pv-detail-label">{label}</span>
    <div>{children}</div>
  </div>
);

const PurchaseVoucher = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { companyId } = useCompany();
  const [activeDetailTab, setActiveDetailTab] = useState("party");
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);

  const [voucher, setVoucher] = useState({
    date: "",
    invoiceNo: "",
    customer: "",
    ledger: "",
    narration: "",
    mailingName: "",
    address: "",
    state: "Not Applicable",
    country: "India",
    gstRegistrationType: "Unregistered/Consumer",
    gstin: "",
    placeOfSupply: "Not Applicable",
    deliveryNoteNo: "",
    deliveryNoteDate: "",
    paymentTerms: "",
    otherReferences: "",
    referenceNo: "",
    referenceDate: "",
    buyerOrderNo: "",
    buyerOrderDate: "",
    dispatchDocNo: "",
    dispatchedThrough: "",
    destination: "",
    carrierName: "",
    billOfLading: "",
    billOfLadingDate: "",
    dispatchDate: "",
    receiptNoteNo: "",
    receiptDate: "",
    receiptDocNo: "",
    supplierInvoiceNo: "",
    supplierInvoiceDate: "",
    termsOfDelivery: "",
    consigneeSameAsBilling: true,
    consigneeName: "",
    consigneeGSTIN: "",
    consigneeAddress: "",
    consigneeState: "Not Applicable",
    consigneePincode: "",
    items: [{ itemName: "", hsn_code: "", qty: 1, rate: 0, amount: 0 }],
  });

  const [gst, setGst] = useState({ applied: false, percentage: 0, amount: 0, igst: 0, cgst: 0, sgst: 0 });
  const [ledgers, setLedgers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchStates = async () => {
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: "India",
          }),
        }
      );

      const data = await res.json();
      setStates(data.data.states);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2,flags"
      );

      const data = await res.json();

      const formatted = data
        .map((c) => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags?.png,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountries(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCountries();
    const fetchData = async () => {
      try {
        const res2 = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
        setLedgers(res2.data);

        // --- RESTORE STATE IF RETURNING FROM LEDGER CREATION ---
        const savedState = sessionStorage.getItem("purchaseVoucherState");
        if (savedState) {
          const state = JSON.parse(savedState);
          setVoucher(state.voucher);
          setGst(state.gst);
          sessionStorage.removeItem("purchaseVoucherState");
          Swal.fire({
            title: "Welcome back!",
            text: "Your voucher progress has been restored.",
            icon: "info",
            timer: 2000,
            showConfirmButton: false
          });
        }
        if (id) {
          setIsEditMode(true);
          const voucherRes = await axios.get(`${API}/single/${id}`);
          const v = voucherRes.data;
          if (v) {
            setVoucher({
              date: v.date ? new Date(v.date).toISOString().split("T")[0] : "",
              invoiceNo: v.invoiceNo || v.voucherNo || "",
              customer: v.customer || v.partyName || "",
              ledger: String(v.ledgerId || v.ledger || ""),
              narration: v.narration || "",
              mailingName: v.mailingName || "",
              address: v.address || "",
              state: v.state || "Not Applicable",
              country: v.country || "India",
              gstRegistrationType: v.gstRegistrationType || "Unregistered/Consumer",
              gstin: v.gstin || "",
              placeOfSupply: v.placeOfSupply || "Not Applicable",
              deliveryNoteNo: v.deliveryNoteNo || "",
              deliveryNoteDate: v.deliveryNoteDate ? new Date(v.deliveryNoteDate).toISOString().split("T")[0] : "",
              paymentTerms: v.paymentTerms || "",
              otherReferences: v.otherReferences || "",
              referenceNo: v.referenceNo || "",
              referenceDate: v.referenceDate ? new Date(v.referenceDate).toISOString().split("T")[0] : "",
              buyerOrderNo: v.buyerOrderNo || "",
              buyerOrderDate: v.buyerOrderDate ? new Date(v.buyerOrderDate).toISOString().split("T")[0] : "",
              dispatchDocNo: v.dispatchDocNo || "",
              dispatchedThrough: v.dispatchedThrough || "",
              destination: v.destination || "",
              carrierName: v.carrierName || "",
              billOfLading: v.billOfLading || "",
              billOfLadingDate: v.billOfLadingDate ? new Date(v.billOfLadingDate).toISOString().split("T")[0] : "",
              motorVehicleNo: v.motorVehicleNo || "",
              dispatchDate: v.dispatchDate ? new Date(v.dispatchDate).toISOString().split("T")[0] : "",
              receiptNoteNo: v.receiptNoteNo || "",
              receiptDate: v.receiptDate ? new Date(v.receiptDate).toISOString().split("T")[0] : "",
              receiptDocNo: v.receiptDocNo || "",
              supplierInvoiceNo: v.supplierInvoiceNo || "",
              supplierInvoiceDate: v.supplierInvoiceDate ? new Date(v.supplierInvoiceDate).toISOString().split("T")[0] : "",
              termsOfDelivery: v.termsOfDelivery || v.delivery_terms || "",
              consigneeSameAsBilling: v.consigneeSameAsBilling !== undefined ? Boolean(v.consigneeSameAsBilling) : true,
              consigneeName: v.consigneeName || "",
              consigneeGSTIN: v.consigneeGSTIN || "",
              consigneeAddress: v.consigneeAddress || "",
              consigneeState: v.consigneeState || "Not Applicable",
              consigneePincode: v.consigneePincode || "",
              items: v.items?.length > 0
                ? v.items.map(i => ({ itemName: i.item_name || i.item || i.itemName || "", hsn_code: i.hsn_code || "", qty: Number(i.qty) || 1, per: i.per || i.unit || "", rate: Number(i.rate) || 0, amount: Number(i.amount) || 0 }))
                : [{ itemName: "", hsn_code: "", qty: 1, per: "Nos", rate: 0, amount: 0 }],
            });
            setGst({
              applied: Number(v.gst_percentage || v.gstPercentage || 0) > 0,

              percentage: Number(v.gst_percentage || v.gstPercentage || 0),

              amount: Number(v.gst_amount || v.gstAmount || 0),

              igst: Number(v.igst_rate || 0),

              cgst: Number(v.cgst_rate || 0),

              sgst: Number(v.sgst_rate || 0),
            });
          }
        }
      } catch (err) { console.error(err); }
    };
    if (companyId) fetchData();

    if (companyId && !id) {
      axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/voucher-util/next/${companyId}/purchase`)
        .then(res => setVoucher(prev => ({ ...prev, invoiceNo: res.data.nextNumber })))
        .catch(console.error);
    }
  }, [companyId, id]);

  const handleItemChange = (index, field, value) => {
    const updated = [...voucher.items];
    updated[index][field] = value;
    if (field === "qty" || field === "rate") {
      const qty = parseFloat(updated[index].qty) || 0;
      const rate = parseFloat(updated[index].rate) || 0;
      updated[index].amount = qty * rate;
    }
    setVoucher({ ...voucher, items: updated });
  };

  const addRow = () => setVoucher({ ...voucher, items: [...voucher.items, { itemName: "", hsn_code: "", qty: 1, per: "Nos", rate: 0, amount: 0 }] });
  const removeRow = (i) => { setVoucher({ ...voucher, items: voucher.items.filter((_, idx) => idx !== i) }); };

  const totalAmount = voucher.items.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const effectiveGstRate = Number(gst.igst || 0) + Number(gst.cgst || 0) + Number(gst.sgst || 0);
  const gstAmount = (totalAmount * (gst.percentage || effectiveGstRate || 0)) / 100;
  const grandTotal = totalAmount + gstAmount;

  const handleAutoGST = () => {
    setGst({
      applied: true,
      percentage: 18,
      igst: 0,
      cgst: 9,
      sgst: 9,
      amount: 0
    });

    Swal.fire({
      icon: "success",
      title: "GST Applied",
      text: "Applied 18% GST (CGST 9% + SGST 9%)",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleManualGST = async () => {
    const { value } = await Swal.fire({ title: "Enter GST Percentage", input: "number", inputAttributes: { min: 0, max: 100, step: 0.1 }, confirmButtonText: "Apply", showCancelButton: true });
    if (value) {
      const rate = parseFloat(value);
      // Determine if IGST or CGST/SGST based on state (similar to SaleVoucher logic if needed, but here we just ask)
      const { value: type } = await Swal.fire({
        title: "Tax Type",
        input: "select",
        inputOptions: { intra: "Intra-state (CGST+SGST)", inter: "Inter-state (IGST)" },
        confirmButtonText: "Select"
      });

      if (type === "inter") {
        setGst({ ...gst, applied: true, percentage: rate, igst: rate, cgst: 0, sgst: 0 });
      } else {
        setGst({ ...gst, applied: true, percentage: rate, igst: 0, cgst: rate / 2, sgst: rate / 2 });
      }
      Swal.fire({ icon: "success", title: "GST Added", text: `${value}% GST applied`, timer: 1600, showConfirmButton: false });
    }
  };

  const handleBulkImport = async (data) => {
    try {

      if (!data || data.length === 0) {
        Swal.fire("Error", "No data found in file", "error");
        return;
      }

      const grouped = {};

      // ================= GROUP BY INVOICE =================
      data.forEach((row) => {

        const invoiceNo =
          row.InvoiceNo ||
          row.VoucherNo ||
          `PUR-${Date.now()}`;

        if (!grouped[invoiceNo]) {

          grouped[invoiceNo] = {

            date: row.Date
              ? new Date(row.Date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],

            invoiceNo,

            customer:
              row.Customer ||
              row.PartyName ||
              "",

            narration:
              row.Narration || "",

            supplierInvoiceNo:
              row.SupplierInvoiceNo || "",

            supplierInvoiceDate:
              row.SupplierInvoiceDate || "",

            mailingName:
              row.MailingName ||
              row.Customer ||
              "",

            address:
              row.Address || "",

            state:
              row.State || "Not Applicable",

            country:
              row.Country || "India",

            gstin:
              row.GSTIN || "",

            placeOfSupply:
              row.PlaceOfSupply || "Not Applicable",

            paymentTerms:
              row.PaymentTerms || "",

            deliveryNoteNo:
              row.DeliveryNoteNo || "",

            deliveryNoteDate:
              row.DeliveryNoteDate || "",

            dispatchDocNo:
              row.DispatchDocNo || "",

            destination:
              row.Destination || "",

            carrierName:
              row.CarrierName || "",

            gst_percentage:
              parseFloat(row.GST || 0),

            igst:
              parseFloat(row.IGST || 0),

            cgst:
              parseFloat(row.CGST || 0),

            sgst:
              parseFloat(row.SGST || 0),

            items: [],
          };
        }

        // ================= ITEMS =================
        grouped[invoiceNo].items.push({

          itemName:
            row.ItemName || "",

          hsn_code:
            row.HSN || "",

          qty:
            parseFloat(row.Qty || 1),

          rate:
            parseFloat(row.Rate || 0),

          amount:
            parseFloat(row.Amount || 0) ||
            parseFloat(row.Qty || 1) *
            parseFloat(row.Rate || 0),
        });
      });

      // ================= TAKE FIRST VOUCHER =================
      const firstVoucher = Object.values(grouped)[0];

      if (!firstVoucher) {
        Swal.fire("Error", "Voucher parsing failed", "error");
        return;
      }

      // ================= FIND OR CREATE LEDGER =================
      let ledgerId = "";
      let finalLedgerList = ledgers;
      let ledgerObj = ledgers.find(
        (l) =>
          (l.name || "")
            .toLowerCase()
            .trim() ===
          (firstVoucher.customer || "")
            .toLowerCase()
            .trim()
      );

      if (ledgerObj) {
        ledgerId = ledgerObj.id;
      } else if (firstVoucher.customer) {
        const confirmCreate = await Swal.fire({
          title: "Ledger Not Found",
          text: `Party/Supplier "${firstVoucher.customer}" does not exist. Do you want to create a new ledger under Sundry Creditors?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Create",
          cancelButtonText: "No, Skip Selecting Ledger"
        });

        if (confirmCreate.isConfirmed) {
          try {
            const groupRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/group/all/${companyId}`);
            const creditorsGroup = groupRes.data.find(g => g.groupName === "Sundry Creditors");

            if (!creditorsGroup) {
              Swal.fire("Error", "Sundry Creditors group not found in system.", "error");
            } else {
              await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/create`, {
                name: firstVoucher.customer,
                under: JSON.stringify({ name: "Sundry Creditors", id: creditorsGroup.id }),
                mailingName: firstVoucher.customer,
                openingBalance: 0,
                state: firstVoucher.state || "Not Applicable",
                country: firstVoucher.country || "India",
                registrationType: firstVoucher.gstin ? "Regular" : "Unregistered/Consumer",
                gstin: firstVoucher.gstin || "",
                companyId
              });

              // Refetch Ledgers
              const ledgerRes = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/ledger/${companyId}/all`);
              finalLedgerList = ledgerRes.data || [];
              setLedgers(finalLedgerList);

              // Find new ledger ID
              const newLedger = finalLedgerList.find(
                (l) => (l.name || "").toLowerCase().trim() === (firstVoucher.customer || "").toLowerCase().trim()
              );
              if (newLedger) {
                ledgerId = newLedger.id;
              }
            }
          } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to auto-create ledger.", "error");
          }
        }
      }

      // ================= FILL FORM =================
      setVoucher((prev) => ({

        ...prev,

        date: firstVoucher.date,

        invoiceNo: firstVoucher.invoiceNo,

        customer: firstVoucher.customer,

        ledger: ledgerId,

        narration: firstVoucher.narration,

        supplierInvoiceNo:
          firstVoucher.supplierInvoiceNo,

        supplierInvoiceDate:
          firstVoucher.supplierInvoiceDate,

        mailingName:
          firstVoucher.mailingName,

        address:
          firstVoucher.address,

        state:
          firstVoucher.state,

        country:
          firstVoucher.country,

        gstin:
          firstVoucher.gstin,

        placeOfSupply:
          firstVoucher.placeOfSupply,

        paymentTerms:
          firstVoucher.paymentTerms,

        deliveryNoteNo:
          firstVoucher.deliveryNoteNo,

        deliveryNoteDate:
          firstVoucher.deliveryNoteDate,

        dispatchDocNo:
          firstVoucher.dispatchDocNo,

        destination:
          firstVoucher.destination,

        carrierName:
          firstVoucher.carrierName,

        items:
          firstVoucher.items,
      }));

      // ================= GST =================
      const effectiveRate =
        firstVoucher.gst_percentage ||
        (
          firstVoucher.igst +
          firstVoucher.cgst +
          firstVoucher.sgst
        );

      setGst({

        applied: effectiveRate > 0,

        percentage: effectiveRate,

        igst: firstVoucher.igst || 0,

        cgst: firstVoucher.cgst || 0,

        sgst: firstVoucher.sgst || 0,

        amount: 0,
      });

      Swal.fire({
        icon: "success",
        title: "Import Successful",
        text: "Purchase voucher loaded successfully",
        timer: 1800,
        showConfirmButton: false
      });

    } catch (err) {

      console.error(err);

      Swal.fire(
        "Error",
        "Failed to import file",
        "error"
      );
    }
  };

  const saveVoucher = async () => {
    try {
      const employeeId = user?.employee_id || null;
      const role = user?.role || "admin";

      const payload = {
        ...voucher,
        companyId,
        subtotal: totalAmount,
        gst_percentage: gst.percentage || effectiveGstRate,
        gst_amount: gstAmount,
        igst: (totalAmount * Number(gst.igst || 0)) / 100,
        cgst: (totalAmount * Number(gst.cgst || 0)) / 100,
        sgst: (totalAmount * Number(gst.sgst || 0)) / 100,
        igst_rate: Number(gst.igst || 0),
        cgst_rate: Number(gst.cgst || 0),
        sgst_rate: Number(gst.sgst || 0),
        grand_total: grandTotal,
        narration: voucher.narration,
        items: voucher.items.map(i => ({
          item: i.itemName,
          hsn_code: i.hsn_code,
          qty: i.qty,
          per: i.per,
          rate: i.rate,
          amount: i.amount
        })),
        ...(employeeId && { employee_id: employeeId }),
        role,
      };
      if (isEditMode) {
        await axios.put(`${API}/${id}`, payload);
        Swal.fire("Success", "Voucher updated successfully", "success");
        navigate("/accounting/client/listOfPurchaseVoucher");
      } else {
        const res = await axios.post(API, payload);
        Swal.fire({ 
          icon: "success", 
          title: "Saved Successfully", 
          showCancelButton: true, 
          confirmButtonText: "Download PDF", 
          cancelButtonText: "Close" 
        }).then(r => { 
          if (r.isConfirmed && res.data?.pdf_path) { 
            const pdfUrl = `${import.meta.env.VITE_ACCOUNTING_URL}/${res.data.pdf_path}`;
            window.open(pdfUrl, "_blank");
            fetch(pdfUrl)
              .then(response => response.blob())
              .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = res.data.pdf_path.split("/").pop() || "PurchaseVoucher.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch(err => console.error("Error downloading PDF:", err));
          } 
        });
      }
    } catch (err) { 
      if (err.response && err.response.status === 409) {
        Swal.fire("Warning", "Invoice Number Already Exists!", "warning");
      } else {
        Swal.fire("Error", err?.response?.data?.message || err?.response?.data?.error || `Something went wrong while ${isEditMode ? "updating" : "saving"}!`, "error"); 
      }
    }
  };

  // --- NAVIGATE TO FULL LEDGER FORM ---
  const handleQuickCreateLedger = async (initialName) => {
    const stateToSave = {
      voucher,
      gst
    };
    sessionStorage.setItem("purchaseVoucherState", JSON.stringify(stateToSave));
    navigate(`/accounting/client/ledger?redirect=/accounting/client/purchasevoucher&name=${encodeURIComponent(initialName)}`);
  };

  const set = (key, val) => setVoucher(v => ({ ...v, [key]: val }));

  return (
    <>
      <style>{styles}</style>

      <div className="pv-wrap">

        {/* ── Page Header ── */}
        <div className="pv-header">

          {/* Left */}
          <div className="pv-header-left">
            <p className="pv-eyebrow">
              Accounts Payable
            </p>

            <h1 className="pv-title">
              Purchase Voucher
            </h1>
          </div>

          {/* Right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >

            {/* Status Badge */}
            <span
              className={`pv-badge ${isEditMode
                  ? "pv-badge-edit"
                  : "pv-badge-new"
                }`}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "currentColor",
                  display: "inline-block"
                }}
              />

              {isEditMode
                ? "Edit Mode"
                : "New Voucher"}
            </span>

            {/* Import Button */}
            <BulkImportButton
              onImport={handleBulkImport}
              buttonLabel="Import Excel / CSV"
            />

          </div>
        </div>

        {/* ── Section 1 : Voucher Basics ── */}
        <div className="pv-card">
          <p className="pv-card-title">Voucher Details</p>
          <div className="pv-grid-3">
            <div className="pv-field">
              <label className="pv-label">Voucher No</label>
              <input className="pv-input" placeholder="e.g. PUR-001" value={voucher.invoiceNo} onChange={e => set("invoiceNo", e.target.value)} />
            </div>
            <div className="pv-field">
              <label className="pv-label">Date <span className="req">*</span></label>
              <input type="date" className="pv-input" value={voucher.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="pv-field">
              <label className="pv-label">Party Name <span className="req">*</span></label>
              <input className="pv-input" placeholder="Enter supplier / party" value={voucher.customer} onChange={e => set("customer", e.target.value)} />
            </div>
          </div>

          <div className="pv-grid-3" style={{ marginTop: 14 }}>
            <div className="pv-field">
              <label className="pv-label">Supplier Invoice No.</label>
              <input className="pv-input" placeholder="e.g. ABC/123" value={voucher.supplierInvoiceNo} onChange={e => set("supplierInvoiceNo", e.target.value)} />
            </div>
            <div className="pv-field">
              <label className="pv-label">Supplier Invoice Date</label>
              <input type="date" className="pv-input" value={voucher.supplierInvoiceDate} onChange={e => set("supplierInvoiceDate", e.target.value)} />
            </div>
            <div className="pv-field">
              <label className="pv-label">Purchase Ledger <span className="req">*</span></label>
              {/* <select className="pv-select" value={voucher.ledger} onChange={e => set("ledger", e.target.value)}>
                <option value="">— Select ledger —</option>
                {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select> */}

              <SearchableLedgerSelect
                ledgers={ledgers}
                value={voucher.ledger}
                onSelect={(ledgerId) => {
                  const selectedLedger = ledgers.find(
                    (l) => String(l.id) === String(ledgerId)
                  );
                  setVoucher((prev) => ({
                    ...prev,
                    ledger: ledgerId,
                    customer: selectedLedger?.name || "",
                    mailingName: selectedLedger?.mailingName || "",
                    address: selectedLedger?.address || "",
                    state: selectedLedger?.state || "Not Applicable",
                    country: selectedLedger?.country || "India",
                    gstRegistrationType: selectedLedger?.registrationType || "Unregistered/Consumer",
                    gstin: selectedLedger?.gstin || "",
                    placeOfSupply: selectedLedger?.state || "Not Applicable",
                  }));
                }}
                onCreateNew={(name) => handleQuickCreateLedger(name)}
                placeholder="— Select ledger —"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2 : Party & Dispatch (tabbed) ── */}
        <div className="pv-card">
          <div className="pv-tabs">

            <button className={`pv-tab ${activeDetailTab === "party" ? "active" : ""}`} onClick={() => setActiveDetailTab("party")}>Party Details</button>
            <button className={`pv-tab ${activeDetailTab === "receipt" ? "active" : ""}`} onClick={() => setActiveDetailTab("receipt")}>Purchase Details</button>
          </div>

          {activeDetailTab === "party" && (
            <div className="pv-grid-2">
              <div>
                <FieldRow label="Supplier (Bill from)">
                  <input className="pv-input readonly" readOnly value={ledgers.find(l => String(l.id) === String(voucher.ledger))?.name || ""} placeholder="Auto-filled from ledger" />
                </FieldRow>
                <FieldRow label="Mailing Name">
                  <input className="pv-input" value={voucher.mailingName} onChange={e => set("mailingName", e.target.value)} />
                </FieldRow>
                <FieldRow label="State">
                  <select className="pv-select" value={voucher.state} onChange={e => set("state", e.target.value)}>
                    <option value="Not Applicable">Not Applicable</option>
                    {states.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label="Country">
                  <select className="pv-select" value={voucher.country} onChange={e => set("country", e.target.value)}>
                    <option value="India">India</option>
                    {countries.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
                  </select>
                </FieldRow>
              </div>
              <div>
                <FieldRow label="Address">
                  <textarea className="pv-textarea" rows={3} value={voucher.address} onChange={e => set("address", e.target.value)} />
                </FieldRow>
                <FieldRow label="GST Reg. Type">
                  <select className="pv-select" value={voucher.gstRegistrationType} onChange={e => set("gstRegistrationType", e.target.value)}>
                    <option>Unregistered/Consumer</option>
                    <option>Regular</option>
                    <option>Composition</option>
                  </select>
                </FieldRow>
                <FieldRow label="GSTIN/UIN">
                  <input className="pv-input" placeholder="22AAAAA0000A1Z5" value={voucher.gstin} onChange={e => set("gstin", e.target.value)} />
                </FieldRow>
                <FieldRow label="Place of Supply">
                  <select className="pv-select" value={voucher.placeOfSupply} onChange={e => set("placeOfSupply", e.target.value)}>
                    <option value="Not Applicable">Not Applicable</option>
                    {states.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                  </select>
                </FieldRow>
              </div>
            </div>
          )}

          {activeDetailTab === "receipt" && (
            <div className="animate-in fade-in duration-300">
              <div className="pv-grid-3">
                {/* Column 1: Receipt Details */}
                <div>
                  <FieldRow label="Purchase Note No(s)">
                    <input className="pv-input" value={voucher.receiptNoteNo} onChange={e => set("receiptNoteNo", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Purchase Date">
                    <input type="date" className="pv-input" value={voucher.receiptDate} onChange={e => set("receiptDate", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Purchase Doc No.">
                    <input className="pv-input" value={voucher.receiptDocNo} onChange={e => set("receiptDocNo", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Delivery Note">
                    <input className="pv-input" value={voucher.deliveryNoteNo} onChange={e => set("deliveryNoteNo", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Delivery Date">
                    <input type="date" className="pv-input" value={voucher.deliveryNoteDate} onChange={e => set("deliveryNoteDate", e.target.value)} />
                  </FieldRow>
                </div>

                {/* Column 2: Shipping/Reference */}
                <div>
                  <FieldRow label="Dispatched through">
                    <input className="pv-input" value={voucher.dispatchedThrough} onChange={e => set("dispatchedThrough", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Destination">
                    <input className="pv-input" value={voucher.destination} onChange={e => set("destination", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Carrier Name/Agent">
                    <input className="pv-input" value={voucher.carrierName} onChange={e => set("carrierName", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Bill of Lading">
                    <input className="pv-input" value={voucher.billOfLading} onChange={e => set("billOfLading", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Lading Date">
                    <input type="date" className="pv-input" value={voucher.billOfLadingDate} onChange={e => set("billOfLadingDate", e.target.value)} />
                  </FieldRow>
                </div>

                {/* Column 3: Orders & Terms */}
                <div>
                  <FieldRow label="Motor Vehicle No.">
                    <input className="pv-input" value={voucher.motorVehicleNo} onChange={e => set("motorVehicleNo", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Reference No.">
                    <input className="pv-input" value={voucher.referenceNo} onChange={e => set("referenceNo", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Reference Date">
                    <input type="date" className="pv-input" value={voucher.referenceDate} onChange={e => set("referenceDate", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Order No.">
                    <input className="pv-input" value={voucher.buyerOrderNo} onChange={e => set("buyerOrderNo", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Order Date">
                    <input type="date" className="pv-input" value={voucher.buyerOrderDate} onChange={e => set("buyerOrderDate", e.target.value)} />
                  </FieldRow>
                </div>
              </div>

              {/* Terms and Other Ref */}
              <div className="pv-grid-2 mt-4 pt-4 border-t border-gray-100">
                <FieldRow label="Payment Terms">
                  <input className="pv-input" placeholder="e.g. Net 30" value={voucher.paymentTerms} onChange={e => set("paymentTerms", e.target.value)} />
                </FieldRow>
                <FieldRow label="Other References">
                  <input className="pv-input" value={voucher.otherReferences} onChange={e => set("otherReferences", e.target.value)} />
                </FieldRow>
                <FieldRow label="Terms of Delivery">
                  <textarea className="pv-input" rows={2} value={voucher.termsOfDelivery} onChange={e => set("termsOfDelivery", e.target.value)} style={{ resize: "none" }} />
                </FieldRow>
              </div>

              {/* Consignee Section */}
              <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: ".1em", margin: 0 }}>Consignee (Ship To)</h4>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" }}>Same as Billing?</span>
                    <input type="checkbox" checked={voucher.consigneeSameAsBilling} onChange={e => set("consigneeSameAsBilling", e.target.checked)} style={{ width: 14, height: 14 }} />
                  </label>
                </div>

                {!voucher.consigneeSameAsBilling && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px 24px", padding: 20, background: "var(--bg-faint)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-faint)" }}>
                    <FieldRow label="Name">
                      <input className="pv-input" value={voucher.consigneeName} onChange={e => set("consigneeName", e.target.value)} />
                    </FieldRow>
                    <FieldRow label="GSTIN">
                      <input className="pv-input uppercase" value={voucher.consigneeGSTIN} onChange={e => set("consigneeGSTIN", e.target.value)} />
                    </FieldRow>
                    <FieldRow label="State">
                      <select className="pv-select" value={voucher.consigneeState} onChange={e => set("consigneeState", e.target.value)}>
                        <option value="Not Applicable">Not Applicable</option>
                        {states.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                      </select>
                    </FieldRow>
                    <FieldRow label="Address">
                      <textarea className="pv-input" rows={2} value={voucher.consigneeAddress} onChange={e => set("consigneeAddress", e.target.value)} style={{ resize: "none" }} />
                    </FieldRow>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Section 3 : Items ── */}
        <div className="pv-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p className="pv-card-title" style={{ margin: 0 }}>Line Items</p>
            <div style={{ display: "flex", gap: 8 }}>
              <BulkImportButton onDataParsed={handleBulkImport} />
            </div>
          </div>

          <div className="pv-table-wrap">
            <table className="pv-table">
              <thead>
                <tr>
                  <th style={{ width: "36%", paddingLeft: 14 }}>Item Name</th>
                  <th style={{ width: "14%" }}>HSN Code</th>
                  <th className="right" style={{ width: "12%" }}>Qty</th>
                  <th className="center" style={{ width: "8%" }}>Unit</th>
                  <th className="right" style={{ width: "16%" }}>Rate (₹)</th>
                  <th className="right" style={{ width: "16%", paddingRight: 14 }}>Amount (₹)</th>
                  <th style={{ width: "6%" }}></th>
                </tr>
              </thead>
              <tbody>
                <datalist id="unit-options">
                  <option value="Nos" />
                  <option value="Piece" />
                  <option value="Pair" />
                  <option value="Set" />
                  <option value="Dozen" />
                  <option value="Kg" />
                  <option value="Gram" />
                  <option value="Quintal" />
                  <option value="Ton" />
                  <option value="Litre" />
                  <option value="ML" />
                  <option value="Meter" />
                  <option value="Feet" />
                  <option value="Inch" />
                  <option value="CM" />
                  <option value="Box" />
                  <option value="Bag" />
                  <option value="Packet" />
                  <option value="Bottle" />
                  <option value="Carton" />
                  <option value="Bundle" />
                  <option value="Roll" />
                  <option value="Tray" />
                  <option value="Can" />
                  <option value="Drum" />
                  <option value="Sheet" />
                  <option value="Rod" />
                  <option value="Pipe" />
                  <option value="Block" />
                </datalist>
                {voucher.items.map((row, index) => (
                  <tr key={index} className="relative hover:z-50">
                    <td style={{ paddingLeft: 10 }}>
                      <input className="pv-table-input" placeholder="Item description" value={row.itemName} onChange={e => handleItemChange(index, "itemName", e.target.value)} />
                    </td>
                    <td>
                      <input className="pv-table-input" placeholder="0000" value={row.hsn_code} onChange={e => handleItemChange(index, "hsn_code", e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="pv-table-input number" value={row.qty} onChange={e => handleItemChange(index, "qty", e.target.value)} />
                    </td>
                    <td>
                      <input list="unit-options" className="pv-table-input" style={{ textAlign: "center" }} value={row.per} onChange={e => handleItemChange(index, "per", e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="pv-table-input number" value={row.rate} onChange={e => handleItemChange(index, "rate", e.target.value)} />
                    </td>
                    <td className="pv-amount-cell">
                      {Number(row.amount).toFixed(2)}
                    </td>
                    <td>
                      <button className="pv-remove-btn" onClick={() => removeRow(index)} title="Remove item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="pv-add-row" onClick={addRow}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            Add line item
          </button>
        </div>

        {/* ── Section 4 : GST + Totals ── */}
        <div className="pv-card">
          <p className="pv-card-title">Tax & Totals</p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>

            {/* Left: GST actions + breakdown */}
            <div style={{ flex: "1 1 320px" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Apply GST</p>
              <div className="pv-gst-buttons" style={{ marginBottom: 20 }}>
                <button className="pv-btn pv-btn-green" onClick={handleAutoGST}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                  Auto GST
                </button>
                <button className="pv-btn pv-btn-amber" onClick={handleManualGST}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Manual GST
                </button>
              </div>

              {gst.applied && (
                <div style={{ background: "var(--green-light)", border: "1px solid #a7f3d0", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--green)", fontWeight: 500, marginBottom: 16 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  {gst.percentage}% GST applied — ₹{Number(gst.amount || 0).toFixed(2)}
                </div>
              )}

              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>Component Breakdown</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[["IGST", "igst"], ["CGST", "cgst"], ["SGST", "sgst"]].map(([label, key]) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: ".06em" }}>{label} (%)</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)" }}>₹ {((totalAmount * Number(gst[key] || 0)) / 100).toFixed(2)}</span>
                    </div>
                    <input type="number" className="pv-gst-input" placeholder="Rate %" value={gst[key]} onChange={e => setGst(g => ({ ...g, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Totals panel */}
            <div className="pv-totals" style={{ flex: "0 0 auto" }}>
              <div className="pv-totals-row">
                <span>Subtotal</span>
                <span className="val">₹ {totalAmount.toFixed(2)}</span>
              </div>
              {gst.applied && (
                <div className="pv-totals-row gst-line">
                  <span>GST ({gst.percentage}%)</span>
                  <span className="val">
                    ₹ {Number(gst.amount || 0).toFixed(2)}
                  </span>
                </div>
              )}
              {Number(gst.igst) > 0 && <div className="pv-totals-row"><span>IGST ({gst.igst}%)</span><span className="val">₹ {((totalAmount * Number(gst.igst)) / 100).toFixed(2)}</span></div>}
              {Number(gst.cgst) > 0 && <div className="pv-totals-row"><span>CGST ({gst.cgst}%)</span><span className="val">₹ {((totalAmount * Number(gst.cgst)) / 100).toFixed(2)}</span></div>}
              {Number(gst.sgst) > 0 && <div className="pv-totals-row"><span>SGST ({gst.sgst}%)</span><span className="val">₹ {((totalAmount * Number(gst.sgst)) / 100).toFixed(2)}</span></div>}
              <div className="pv-totals-row grand">
                <span>Grand Total</span>
                <span className="val">₹ {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 5 : Narration ── */}
        <div className="pv-card">
          <p className="pv-card-title">Narration</p>
          <textarea className="pv-textarea" rows={3} placeholder="Add internal notes or narration for this voucher…" value={voucher.narration} onChange={e => set("narration", e.target.value)} />
        </div>

        {/* ── Footer Action Bar ── */}
        <div className="pv-footer">
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
            {isEditMode
              ? <span>Editing voucher <strong style={{ color: "var(--ink)" }}>{voucher.invoiceNo || id}</strong></span>
              : <span>All fields marked <span style={{ color: "var(--red)" }}>*</span> are required</span>
            }
          </div>
          <button className="pv-btn pv-btn-primary" onClick={saveVoucher}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              {isEditMode
                ? <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>
                : <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>
              }
            </svg>
            {isEditMode ? "Update Voucher" : "Save Voucher"}
          </button>
        </div>

      </div>
    </>
  );
};

export default PurchaseVoucher;
