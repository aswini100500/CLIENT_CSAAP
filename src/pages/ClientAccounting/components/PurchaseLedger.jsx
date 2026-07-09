// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";

// function PurchaseLedger() {
//   const [ledger, setLedger] = useState({
//     name: "",
//     under: "",
//     typeOfLedger: "",
//     statutoryDetails: "",
//     isGstApplicable: "No",
//     gstDetails: {
//       nature: "",
//       taxDetails: "",
//       taxType: "",
//       typeOfSupply: ""
//     }
//   });

//   const [showGstPopup, setShowGstPopup] = useState(false);
//   const [existingLedgers, setExistingLedgers] = useState([]);

//   // Load existing ledgers from localStorage
//   useEffect(() => {
//     const savedLedgers = localStorage.getItem('purchaseLedgers');
//     if (savedLedgers) {
//       setExistingLedgers(JSON.parse(savedLedgers));
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setLedger({ ...ledger, [name]: value });
//   };

//   const handleGstChange = (e) => {
//     const { name, value } = e.target;
//     setLedger({
//       ...ledger,
//       gstDetails: {
//         ...ledger.gstDetails,
//         [name]: value
//       }
//     });
//   };

//   const handleGstApplicableChange = (e) => {
//     const { value } = e.target;
//     setLedger({ 
//       ...ledger, 
//       isGstApplicable: value,
//       ...(value === "No" && {
//         gstDetails: {
//           nature: "",
//           taxDetails: "",
//           taxType: "",
//           typeOfSupply: ""
//         }
//       })
//     });
    
//     if (value === "Yes") {
//       setTimeout(() => {
//         setShowGstPopup(true);
//       }, 300);
//     }
//   };

//   const saveGstDetails = () => {
//     if (!ledger.gstDetails.nature || !ledger.gstDetails.taxType) {
//       Swal.fire("Error", "Please fill all required GST fields", "warning");
//       return;
//     }
    
//     setShowGstPopup(false);
//     Swal.fire("Success", "GST details saved successfully", "success");
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!ledger.name || !ledger.under || !ledger.typeOfLedger) {
//       Swal.fire("Error", "Please fill all required fields", "warning");
//       return;
//     }

//     if (ledger.isGstApplicable === "Yes" && (!ledger.gstDetails.nature || !ledger.gstDetails.taxType)) {
//       Swal.fire("Error", "Please complete GST details", "warning");
//       return;
//     }

//     // Save to localStorage
//     const newLedger = {
//       ...ledger,
//       id: Date.now().toString(),
//       createdAt: new Date().toISOString()
//     };

//     const updatedLedgers = [...existingLedgers, newLedger];
//     localStorage.setItem('purchaseLedgers', JSON.stringify(updatedLedgers));
//     setExistingLedgers(updatedLedgers);

//     console.log("Ledger Data:", newLedger);
//     Swal.fire("Success", "Purchase Ledger created successfully", "success");
    
//     setTimeout(() => {
//       window.history.back();
//     }, 1500);
//   };

//   const deleteLedger = (id) => {
//     Swal.fire({
//       title: "Delete Ledger?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Delete",
//       cancelButtonText: "Cancel"
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const updatedLedgers = existingLedgers.filter(ledger => ledger.id !== id);
//         localStorage.setItem('purchaseLedgers', JSON.stringify(updatedLedgers));
//         setExistingLedgers(updatedLedgers);
//         Swal.fire("Deleted!", "Ledger has been deleted.", "success");
//       }
//     });
//   };

//   const selectLedger = (ledger) => {
//     Swal.fire({
//       title: "Use this Ledger?",
//       html: `
//         <div class="text-left">
//           <p><strong>Name:</strong> ${ledger.name}</p>
//           <p><strong>Under:</strong> ${ledger.under}</p>
//           <p><strong>Type:</strong> ${ledger.typeOfLedger}</p>
//           ${ledger.isGstApplicable === "Yes" ? `<p><strong>GST:</strong> ${ledger.gstDetails.taxType}</p>` : ''}
//         </div>
//       `,
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Use This",
//       cancelButtonText: "Cancel"
//     }).then((result) => {
//       if (result.isConfirmed) {
//         // Save selected ledger to use in voucher
//         localStorage.setItem('selectedPurchaseLedger', JSON.stringify(ledger));
//         window.history.back();
//       }
//     });
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Purchase Ledgers</h2>
//           <p className="text-gray-600 mt-1">Manage GST details and expense accounts</p>
//         </div>
//         <button
//           onClick={() => window.history.back()}
//           className="text-gray-600 hover:text-gray-800 transition-colors"
//         >
//           ← Back to Voucher
//         </button>
//       </div>

//       {/* Existing Ledgers */}
//       {existingLedgers.length > 0 && (
//         <section className="mb-8">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Ledgers</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {existingLedgers.map((ledgerItem) => (
//               <div key={ledgerItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start mb-2">
//                   <h4 className="font-semibold text-gray-800">{ledgerItem.name}</h4>
//                   <div className="flex gap-1">
//                     <button
//                       onClick={() => selectLedger(ledgerItem)}
//                       className="text-blue-600 hover:text-blue-800 text-sm"
//                       title="Use this ledger"
//                     >
//                       ✅
//                     </button>
//                     <button
//                       onClick={() => deleteLedger(ledgerItem.id)}
//                       className="text-red-600 hover:text-red-800 text-sm"
//                       title="Delete ledger"
//                     >
//                       🗑️
//                     </button>
//                   </div>
//                 </div>
//                 <div className="text-sm text-gray-600 space-y-1">
//                   <p><span className="font-medium">Under:</span> {ledgerItem.under}</p>
//                   <p><span className="font-medium">Type:</span> {ledgerItem.typeOfLedger}</p>
//                   <p><span className="font-medium">GST:</span> {ledgerItem.isGstApplicable}</p>
//                   {ledgerItem.isGstApplicable === "Yes" && (
//                     <p><span className="font-medium">Tax Type:</span> {ledgerItem.gstDetails.taxType}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* Create New Ledger Form */}
//       <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Purchase Ledger</h3>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block font-medium mb-2 text-gray-700">
//                 Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={ledger.name}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="e.g., Purchase @18% GST"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block font-medium mb-2 text-gray-700">
//                 Under <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="under"
//                 value={ledger.under}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               >
//                 <option value="">Select Category</option>
//                 <option value="Direct Expenses">Direct Expenses</option>
//                 <option value="Indirect Expenses">Indirect Expenses</option>
//                 <option value="Cost of Goods Sold">Cost of Goods Sold</option>
//                 <option value="Purchases">Purchases</option>
//                 <option value="Fixed Assets">Fixed Assets</option>
//                 <option value="Current Assets">Current Assets</option>
//                 <option value="Current Liabilities">Current Liabilities</option>
//               </select>
//             </div>
//           </div>

//           <div className="mt-4">
//             <label className="block font-medium mb-2 text-gray-700">
//               Type of Ledger <span className="text-red-500">*</span>
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
//                 <input
//                   type="radio"
//                   name="typeOfLedger"
//                   value="Regular"
//                   checked={ledger.typeOfLedger === "Regular"}
//                   onChange={handleChange}
//                   className="mr-3"
//                   required
//                 />
//                 <div>
//                   <div className="font-medium">Regular</div>
//                   <div className="text-sm text-gray-600">Standard purchase ledger</div>
//                 </div>
//               </label>

//               <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
//                 <input
//                   type="radio"
//                   name="typeOfLedger"
//                   value="Inventory"
//                   checked={ledger.typeOfLedger === "Inventory"}
//                   onChange={handleChange}
//                   className="mr-3"
//                 />
//                 <div>
//                   <div className="font-medium">Inventory</div>
//                   <div className="text-sm text-gray-600">For stock items</div>
//                 </div>
//               </label>

//               <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
//                 <input
//                   type="radio"
//                   name="typeOfLedger"
//                   value="Capital"
//                   checked={ledger.typeOfLedger === "Capital"}
//                   onChange={handleChange}
//                   className="mr-3"
//                 />
//                 <div>
//                   <div className="font-medium">Capital</div>
//                   <div className="text-sm text-gray-600">For asset purchases</div>
//                 </div>
//               </label>
//             </div>
//           </div>

//           {/* Statutory Details */}
//           <div>
//             <label className="block font-medium mb-2 text-gray-700">Statutory Details</label>
//             <textarea
//               name="statutoryDetails"
//               value={ledger.statutoryDetails}
//               onChange={handleChange}
//               className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               rows="3"
//               placeholder="Enter any statutory compliance details, registration numbers, etc."
//             />
//           </div>

//           {/* GST Section */}
//           <div className="space-y-4">
//             <div>
//               <label className="block font-medium mb-2 text-gray-700">
//                 Is GST Applicable?
//               </label>
//               <div className="flex gap-6">
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     name="isGstApplicable"
//                     value="Yes"
//                     checked={ledger.isGstApplicable === "Yes"}
//                     onChange={handleGstApplicableChange}
//                     className="mr-2"
//                   />
//                   <span>Yes</span>
//                 </label>
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     name="isGstApplicable"
//                     value="No"
//                     checked={ledger.isGstApplicable === "No"}
//                     onChange={handleGstApplicableChange}
//                     className="mr-2"
//                   />
//                   <span>No</span>
//                 </label>
//               </div>
//             </div>

//             {ledger.isGstApplicable === "Yes" && (
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                 <div className="flex items-center justify-between mb-3">
//                   <h4 className="font-semibold text-blue-800">GST Details</h4>
//                   <button
//                     type="button"
//                     onClick={() => setShowGstPopup(true)}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
//                   >
//                     {ledger.gstDetails.nature ? "Edit GST Details" : "Set GST Details"}
//                   </button>
//                 </div>
                
//                 {ledger.gstDetails.nature ? (
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <span className="font-medium">Nature:</span> {ledger.gstDetails.nature}
//                     </div>
//                     <div>
//                       <span className="font-medium">Tax Type:</span> {ledger.gstDetails.taxType}
//                     </div>
//                     <div>
//                       <span className="font-medium">Type of Supply:</span> {ledger.gstDetails.typeOfSupply || "Not set"}
//                     </div>
//                     <div>
//                       <span className="font-medium">Tax Details:</span> {ledger.gstDetails.taxDetails || "Not set"}
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="text-blue-600 text-sm">Click "Set GST Details" to configure GST information</p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4 pt-6">
//             <button
//               type="button"
//               onClick={() => window.history.back()}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
//             >
//               Create Ledger
//             </button>
//           </div>
//         </form>
//       </section>

//       {/* GST Details Popup */}
//       {showGstPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-xl font-semibold text-gray-800">Set GST Details</h3>
//               <p className="text-gray-600 text-sm mt-1">Configure GST parameters for this ledger</p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block font-medium mb-2 text-gray-700">
//                   Nature <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="nature"
//                   value={ledger.gstDetails.nature}
//                   onChange={handleGstChange}
//                   className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 >
//                   <option value="">Select Nature</option>
//                   <option value="Goods">Goods</option>
//                   <option value="Services">Services</option>
//                   <option value="Both">Both Goods & Services</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block font-medium mb-2 text-gray-700">
//                   Tax Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="taxType"
//                   value={ledger.gstDetails.taxType}
//                   onChange={handleGstChange}
//                   className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 >
//                   <option value="">Select Tax Type</option>
//                   <option value="GST">GST</option>
//                   <option value="IGST">IGST</option>
//                   <option value="CGST+SGST">CGST + SGST</option>
//                   <option value="Exempt">Exempt</option>
//                   <option value="Non-GST">Non-GST</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block font-medium mb-2 text-gray-700">Tax Details</label>
//                 <input
//                   type="text"
//                   name="taxDetails"
//                   value={ledger.gstDetails.taxDetails}
//                   onChange={handleGstChange}
//                   className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., 18% GST on Goods"
//                 />
//               </div>

//               <div>
//                 <label className="block font-medium mb-2 text-gray-700">Type of Supply</label>
//                 <select
//                   name="typeOfSupply"
//                   value={ledger.gstDetails.typeOfSupply}
//                   onChange={handleGstChange}
//                   className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select Type of Supply</option>
//                   <option value="Interstate">Interstate Supply</option>
//                   <option value="Intrastate">Intrastate Supply</option>
//                   <option value="Export">Export</option>
//                   <option value="Import">Import</option>
//                   <option value="Deemed Export">Deemed Export</option>
//                 </select>
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => setShowGstPopup(false)}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={saveGstDetails}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Save GST Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PurchaseLedger;

import React from 'react'

const PurchaseLedger = () => {
  return (
    <div>PurchaseLedger</div>
  )
}

export default PurchaseLedger ;


// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import Swal from "sweetalert2";

// function PurchaseLedger() {
//   const { companyId } = useParams();

//   const API = "http://localhost:3000/api/purchase-ledgers";

//   const [ledger, setLedger] = useState({
//     name: "",
//     under: "",
//     typeOfLedger: "",
//     statutoryDetails: "",
//     isGstApplicable: "No",
//     gstDetails: {
//       nature: "",
//       taxDetails: "",
//       taxType: "",
//       typeOfSupply: ""
//     }
//   });

//   const [existingLedgers, setExistingLedgers] = useState([]);
//   const [showGstPopup, setShowGstPopup] = useState(false);

//   // ✅ FETCH LEDGERS FROM BACKEND
//   useEffect(() => {
//     fetchLedgers();
//   }, [companyId]);

//   const fetchLedgers = async () => {
//     try {
//       const res = await axios.get(`${API}/${companyId}/all`);
//       setExistingLedgers(res.data);
//     } catch (err) {
//       console.log(err);
//       Swal.fire("Error", "Unable to load ledgers", "error");
//     }
//   };

//   // Form Handlers
//   const handleChange = (e) => {
//     setLedger({ ...ledger, [e.target.name]: e.target.value });
//   };

//   const handleGstChange = (e) => {
//     setLedger({
//       ...ledger,
//       gstDetails: { ...ledger.gstDetails, [e.target.name]: e.target.value },
//     });
//   };

//   const handleGstApplicableChange = (e) => {
//     const value = e.target.value;

//     setLedger({
//       ...ledger,
//       isGstApplicable: value,
//       ...(value === "No"
//         ? {
//             gstDetails: {
//               nature: "",
//               taxDetails: "",
//               taxType: "",
//               typeOfSupply: "",
//             },
//           }
//         : {}),
//     });

//     if (value === "Yes") {
//       setTimeout(() => setShowGstPopup(true), 300);
//     }
//   };

//   const saveGstDetails = () => {
//     if (!ledger.gstDetails.nature || !ledger.gstDetails.taxType) {
//       Swal.fire("Error", "Please fill required GST fields", "warning");
//       return;
//     }
//     setShowGstPopup(false);
//     Swal.fire("Success", "GST details saved", "success");
//   };

//   // ✅ CREATE LEDGER API
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!ledger.name || !ledger.under || !ledger.typeOfLedger) {
//       Swal.fire("Error", "Fill all required fields", "warning");
//       return;
//     }

//     try {
//       const res = await axios.post(`${API}/${companyId}`, ledger);
//       Swal.fire("Success", "Purchase Ledger Created", "success");

//       fetchLedgers(); // refresh list

//       setTimeout(() => window.history.back(), 1200);
//     } catch (err) {
//       console.log(err);
//       Swal.fire("Error", "Could not create ledger", "error");
//     }
//   };

//   // ✅ DELETE LEDGER API
//   const deleteLedger = (id) => {
//     Swal.fire({
//       title: "Delete Ledger?",
//       text: "This cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Delete",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axios.delete(`${API}/${companyId}/${id}`);
//           Swal.fire("Deleted!", "Ledger removed", "success");
//           fetchLedgers();
//         } catch (err) {
//           Swal.fire("Error", "Unable to delete ledger", "error");
//         }
//       }
//     });
//   };

//   // Ledger Selection (Voucher Use)
//   const selectLedger = (ledger) => {
//     Swal.fire({
//       title: "Use this Ledger?",
//       html: `
//         <div class="text-left">
//           <p><b>Name:</b> ${ledger.name}</p>
//           <p><b>Under:</b> ${ledger.under}</p>
//           <p><b>Type:</b> ${ledger.typeOfLedger}</p>
//           ${
//             ledger.isGstApplicable === "Yes"
//               ? `<p><b>GST:</b> ${ledger.gst_tax_type}</p>`
//               : ""
//           }
//         </div>
//       `,
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Use This",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         localStorage.setItem("selectedPurchaseLedger", JSON.stringify(ledger));
//         window.history.back();
//       }
//     });
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg">

//       {/* HEADER */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Purchase Ledgers</h2>
//           <p className="text-gray-600">Dynamic from MySQL & Express</p>
//         </div>

//         <button
//           onClick={() => window.history.back()}
//           className="text-gray-600 hover:text-gray-800"
//         >
//           ← Back
//         </button>
//       </div>

//       {/* EXISTING LEDGERS */}
//       {existingLedgers.length > 0 && (
//         <section className="mb-8">
//           <h3 className="text-lg font-semibold mb-4">Existing Ledgers</h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {existingLedgers.map((item) => (
//               <div key={item.id} className="border p-4 rounded-lg shadow-sm">

//                 <div className="flex justify-between items-start mb-2">
//                   <h4 className="font-semibold">{item.name}</h4>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => selectLedger(item)}
//                       className="text-blue-600"
//                     >
//                       ✓
//                     </button>
//                     <button
//                       onClick={() => deleteLedger(item.id)}
//                       className="text-red-600"
//                     >
//                       🗑️
//                     </button>
//                   </div>
//                 </div>

//                 <div className="text-sm text-gray-600">
//                   <p><b>Under:</b> {item.under}</p>
//                   <p><b>Type:</b> {item.typeOfLedger}</p>
//                   <p><b>GST:</b> {item.isGstApplicable}</p>
//                   {item.isGstApplicable === "Yes" && (
//                     <p><b>Tax Type:</b> {item.gst_tax_type}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       {/* CREATE LEDGER FORM */}
//       <section className="bg-gray-50 p-6 rounded-xl border">
//         <h3 className="text-lg font-semibold mb-4">
//           Create New Purchase Ledger
//         </h3>

//         <form onSubmit={handleSubmit} className="space-y-6">

//           {/* Name */}
//           <div>
//             <label className="block font-medium mb-1">Name *</label>
//             <input
//               type="text"
//               name="name"
//               value={ledger.name}
//               onChange={handleChange}
//               className="w-full border p-3 rounded-lg"
//               placeholder="Purchase @18% GST"
//             />
//           </div>

//           {/* Under */}
//           <div>
//             <label className="block font-medium mb-1">Under *</label>
//             <select
//               name="under"
//               value={ledger.under}
//               onChange={handleChange}
//               className="w-full border p-3 rounded-lg"
//             >
//               <option value="">Select</option>
//               <option value="Direct Expenses">Direct Expenses</option>
//               <option value="Indirect Expenses">Indirect Expenses</option>
//               <option value="Cost of Goods Sold">Cost of Goods Sold</option>
//               <option value="Purchases">Purchases</option>
//               <option value="Fixed Assets">Fixed Assets</option>
//             </select>
//           </div>

//           {/* Type of Ledger */}
//           <div>
//             <label className="block font-medium mb-1">Type of Ledger *</label>
//             <div className="grid grid-cols-3 gap-3">
//               {["Regular", "Inventory", "Capital"].map((type) => (
//                 <label
//                   key={type}
//                   className="border p-3 rounded-lg flex items-center gap-2 cursor-pointer"
//                 >
//                   <input
//                     type="radio"
//                     name="typeOfLedger"
//                     value={type}
//                     checked={ledger.typeOfLedger === type}
//                     onChange={handleChange}
//                   />
//                   {type}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* GST */}
//           <div>
//             <label className="block font-medium mb-1">Is GST Applicable?</label>

//             <div className="flex gap-6">
//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   value="Yes"
//                   name="isGstApplicable"
//                   checked={ledger.isGstApplicable === "Yes"}
//                   onChange={handleGstApplicableChange}
//                 />
//                 Yes
//               </label>

//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   value="No"
//                   name="isGstApplicable"
//                   checked={ledger.isGstApplicable === "No"}
//                   onChange={handleGstApplicableChange}
//                 />
//                 No
//               </label>
//             </div>
//           </div>

//           {/* Create Button */}
//           <div className="text-right">
//             <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
//               Create Ledger
//             </button>
//           </div>
//         </form>
//       </section>

//       {/* GST POPUP */}
//       {showGstPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full">
//             <h3 className="text-lg font-bold mb-4">GST Details</h3>

//             <div className="space-y-4">
//               <select
//                 name="nature"
//                 value={ledger.gstDetails.nature}
//                 onChange={handleGstChange}
//                 className="w-full border p-3 rounded-lg"
//               >
//                 <option value="">Select Nature</option>
//                 <option value="Goods">Goods</option>
//                 <option value="Services">Services</option>
//               </select>

//               <select
//                 name="taxType"
//                 value={ledger.gstDetails.taxType}
//                 onChange={handleGstChange}
//                 className="w-full border p-3 rounded-lg"
//               >
//                 <option value="">Select Tax Type</option>
//                 <option value="GST">GST</option>
//                 <option value="IGST">IGST</option>
//                 <option value="CGST+SGST">CGST + SGST</option>
//               </select>

//               <input
//                 type="text"
//                 name="taxDetails"
//                 placeholder="18% GST"
//                 value={ledger.gstDetails.taxDetails}
//                 onChange={handleGstChange}
//                 className="w-full border p-3 rounded-lg"
//               />

//               <select
//                 name="typeOfSupply"
//                 value={ledger.gstDetails.typeOfSupply}
//                 onChange={handleGstChange}
//                 className="w-full border p-3 rounded-lg"
//               >
//                 <option value="">Type of Supply</option>
//                 <option value="Interstate">Interstate</option>
//                 <option value="Intrastate">Intrastate</option>
//               </select>
//             </div>

//             <div className="flex justify-end gap-3 mt-6">
//               <button
//                 className="px-4 py-2 border rounded"
//                 onClick={() => setShowGstPopup(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-blue-600 text-white rounded"
//                 onClick={saveGstDetails}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// export default PurchaseLedger;


