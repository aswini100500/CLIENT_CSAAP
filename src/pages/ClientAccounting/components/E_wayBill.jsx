// import React, { useState } from 'react';
// import {
//   HiTruck,
//   HiDocumentText,
//   HiUser,
//   HiLocationMarker,
//   HiCalendar,
//   HiCheck,
//   HiX,
//   HiRefresh,
//   HiDownload,
//   HiPrinter
// } from 'react-icons/hi';

// const E_wayBill = () => {
//   const [formData, setFormData] = useState({
//     // e-Way Bill Details
//     ewayBillNo: '',
//     ewayBillDate: '',
//     consolidatedEwayBillNo: '',
//     subType: 'Not Applicable',

//     // Consignor Details
//     consignorName: '',
//     consignorGSTIN: '',
//     consignorState: '',
//     consignorPincode: '',
//     consignorAddress: '',

//     // Consignee Details
//     consigneeName: '',
//     consigneeGSTIN: '',
//     consigneeState: '',
//     consigneePincode: '',
//     consigneeAddress: '',

//     // Transport Details
//     transporterName: '',
//     transporterID: '',
//     distanceKM: '',
//     documentNo: '',

//     // Part-B Details
//     transportMode: 'Road',
//     vehicleNumber: '',
//     vehicleType: 'Regular',
//     transportDate: ''
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Required fields validation
//     if (!formData.ewayBillNo) newErrors.ewayBillNo = 'E-way Bill Number is required';
//     if (!formData.ewayBillDate) newErrors.ewayBillDate = 'Date is required';
//     if (!formData.consignorName) newErrors.consignorName = 'Consignor Name is required';
//     if (!formData.consignorGSTIN) newErrors.consignorGSTIN = 'Consignor GSTIN is required';
//     if (!formData.consigneeName) newErrors.consigneeName = 'Consignee Name is required';
//     if (!formData.consigneeGSTIN) newErrors.consigneeGSTIN = 'Consignee GSTIN is required';
//     if (!formData.transporterName) newErrors.transporterName = 'Transporter Name is required';
//     if (!formData.distanceKM) newErrors.distanceKM = 'Distance is required';
//     if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle Number is required';
//     if (!formData.transportDate) newErrors.transportDate = 'Transport Date is required';

//     // GSTIN format validation (basic 15-character pattern)
//     const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//     if (formData.consignorGSTIN && !gstinPattern.test(formData.consignorGSTIN)) {
//       newErrors.consignorGSTIN = 'Invalid GSTIN format';
//     }
//     if (formData.consigneeGSTIN && !gstinPattern.test(formData.consigneeGSTIN)) {
//       newErrors.consigneeGSTIN = 'Invalid GSTIN format';
//     }

//     return newErrors;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const validationErrors = validateForm();
    
//     if (Object.keys(validationErrors).length === 0) {
//       // Here you would typically send data to API
//       console.log('Form submitted:', formData);
//       setIsSubmitted(true);
//       setTimeout(() => setIsSubmitted(false), 3000);
//     } else {
//       setErrors(validationErrors);
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       ewayBillNo: '',
//       ewayBillDate: '',
//       consolidatedEwayBillNo: '',
//       subType: 'Not Applicable',
//       consignorName: '',
//       consignorGSTIN: '',
//       consignorState: '',
//       consignorPincode: '',
//       consignorAddress: '',
//       consigneeName: '',
//       consigneeGSTIN: '',
//       consigneeState: '',
//       consigneePincode: '',
//       consigneeAddress: '',
//       transporterName: '',
//       transporterID: '',
//       distanceKM: '',
//       documentNo: '',
//       transportMode: 'Road',
//       vehicleNumber: '',
//       vehicleType: 'Regular',
//       transportDate: ''
//     });
//     setErrors({});
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownload = () => {
//     const dataStr = JSON.stringify(formData, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//     const exportFileDefaultName = 'e-way-bill-details.json';
    
//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
//       {/* Success Message */}
//       {isSubmitted && (
//         <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
//           <HiCheck className="w-5 h-5 mr-2" />
//           E-way Bill details saved successfully!
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-8 shadow-lg">
//           <div className="flex flex-col md:flex-row md:items-center justify-between">
//             <div className="flex items-center mb-4 md:mb-0">
//               <div className="bg-white/20 p-3 rounded-lg mr-4">
//                 <HiDocumentText className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-white">E-way Bill Details</h1>
//                 <p className="text-blue-100 mt-1">Local Sales (Taxable) - Additional Details</p>
//               </div>
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 type="button"
//                 onClick={handleDownload}
//                 className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
//               >
//                 <HiDownload className="w-5 h-5 mr-2" />
//                 Export
//               </button>
//               <button
//                 type="button"
//                 onClick={handlePrint}
//                 className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
//               >
//                 <HiPrinter className="w-5 h-5 mr-2" />
//                 Print
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Form Container */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <form onSubmit={handleSubmit}>
//             {/* 1️⃣ E-WAY BILL DETAILS */}
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center mb-6">
//                 <div className="bg-blue-100 p-2 rounded-lg mr-3">
//                   <HiDocumentText className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-800">e-Way Bill Details</h2>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* E-way Bill Number */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiDocumentText className="w-4 h-4 mr-2" />
//                       E-way Bill Number
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="ewayBillNo"
//                     value={formData.ewayBillNo}
//                     onChange={handleChange}
//                     placeholder="Enter e-way bill number"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.ewayBillNo 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.ewayBillNo && (
//                     <p className="mt-1 text-sm text-red-600">{errors.ewayBillNo}</p>
//                   )}
//                 </div>
                
//                 {/* Date */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiCalendar className="w-4 h-4 mr-2" />
//                       Date
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="date"
//                     name="ewayBillDate"
//                     value={formData.ewayBillDate}
//                     onChange={handleChange}
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.ewayBillDate 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.ewayBillDate && (
//                     <p className="mt-1 text-sm text-red-600">{errors.ewayBillDate}</p>
//                   )}
//                 </div>
                
//                 {/* Consolidated e-Way Bill No. */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiDocumentText className="w-4 h-4 mr-2" />
//                       Consolidated e-Way Bill No.
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="consolidatedEwayBillNo"
//                     value={formData.consolidatedEwayBillNo}
//                     onChange={handleChange}
//                     placeholder="Enter consolidated bill number"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
                
//                 {/* Sub Type */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiDocumentText className="w-4 h-4 mr-2" />
//                       Sub Type
//                     </div>
//                   </label>
//                   <select
//                     name="subType"
//                     value={formData.subType}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   >
//                     <option>Not Applicable</option>
//                     <option>Supply</option>
//                     <option>Export</option>
//                     <option>Job Work</option>
//                     <option>Others</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* 2️⃣ CONSIGNOR DETAILS */}
//             <div className="p-6 border-b border-gray-200 bg-blue-50/30">
//               <div className="flex items-center mb-6">
//                 <div className="bg-green-100 p-2 rounded-lg mr-3">
//                   <HiUser className="w-6 h-6 text-green-600" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-800">Consignor Details (From)</h2>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Consignor Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiUser className="w-4 h-4 mr-2" />
//                       Mailing Name
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="consignorName"
//                     value={formData.consignorName}
//                     onChange={handleChange}
//                     placeholder="Enter consignor name"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.consignorName 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.consignorName && (
//                     <p className="mt-1 text-sm text-red-600">{errors.consignorName}</p>
//                   )}
//                 </div>
                
//                 {/* Consignor GSTIN */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiDocumentText className="w-4 h-4 mr-2" />
//                       GSTIN/UIN
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="consignorGSTIN"
//                     value={formData.consignorGSTIN}
//                     onChange={handleChange}
//                     placeholder="27XXXXX1234X1X5"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.consignorGSTIN 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.consignorGSTIN && (
//                     <p className="mt-1 text-sm text-red-600">{errors.consignorGSTIN}</p>
//                   )}
//                 </div>
                
//                 {/* Consignor State */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiLocationMarker className="w-4 h-4 mr-2" />
//                       State
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="consignorState"
//                     value={formData.consignorState}
//                     onChange={handleChange}
//                     placeholder="Enter state"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
                
//                 {/* Consignor Pincode */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiLocationMarker className="w-4 h-4 mr-2" />
//                       Pincode
//                     </div>
//                   </label>
//                   <input
//                     type="number"
//                     name="consignorPincode"
//                     value={formData.consignorPincode}
//                     onChange={handleChange}
//                     placeholder="Enter pincode"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
                
//                 {/* Consignor Address */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiLocationMarker className="w-4 h-4 mr-2" />
//                       Address
//                     </div>
//                   </label>
//                   <textarea
//                     name="consignorAddress"
//                     value={formData.consignorAddress}
//                     onChange={handleChange}
//                     rows="3"
//                     placeholder="Enter complete address"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* 3️⃣ CONSIGNEE DETAILS */}
//             <div className="p-6 border-b border-gray-200 bg-green-50/30">
//               <div className="flex items-center mb-6">
//                 <div className="bg-purple-100 p-2 rounded-lg mr-3">
//                   <HiUser className="w-6 h-6 text-purple-600" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-800">Consignee Details (To)</h2>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Consignee Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiUser className="w-4 h-4 mr-2" />
//                       Mailing Name
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="consigneeName"
//                     value={formData.consigneeName}
//                     onChange={handleChange}
//                     placeholder="Enter consignee name"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.consigneeName 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.consigneeName && (
//                     <p className="mt-1 text-sm text-red-600">{errors.consigneeName}</p>
//                   )}
//                 </div>
                
//                 {/* Consignee GSTIN */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiDocumentText className="w-4 h-4 mr-2" />
//                       GSTIN/UIN
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="consigneeGSTIN"
//                     value={formData.consigneeGSTIN}
//                     onChange={handleChange}
//                     placeholder="27XXXXX1234X1X5"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.consigneeGSTIN 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.consigneeGSTIN && (
//                     <p className="mt-1 text-sm text-red-600">{errors.consigneeGSTIN}</p>
//                   )}
//                 </div>
                
//                 {/* Consignee State */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiLocationMarker className="w-4 h-4 mr-2" />
//                       State
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="consigneeState"
//                     value={formData.consigneeState}
//                     onChange={handleChange}
//                     placeholder="Enter state"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
                
//                 {/* Consignee Pincode */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiLocationMarker className="w-4 h-4 mr-2" />
//                       Pincode
//                     </div>
//                   </label>
//                   <input
//                     type="number"
//                     name="consigneePincode"
//                     value={formData.consigneePincode}
//                     onChange={handleChange}
//                     placeholder="Enter pincode"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
                
//                 {/* Consignee Address */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiLocationMarker className="w-4 h-4 mr-2" />
//                       Address
//                     </div>
//                   </label>
//                   <textarea
//                     name="consigneeAddress"
//                     value={formData.consigneeAddress}
//                     onChange={handleChange}
//                     rows="3"
//                     placeholder="Enter complete address"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* 4️⃣ TRANSPORT DETAILS */}
//             <div className="p-6 border-b border-gray-200 bg-orange-50/30">
//               <div className="flex items-center mb-6">
//                 <div className="bg-orange-100 p-2 rounded-lg mr-3">
//                   <HiTruck className="w-6 h-6 text-orange-600" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-800">Transport Details</h2>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Transporter Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiTruck className="w-4 h-4 mr-2" />
//                       Transporter Name
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="transporterName"
//                     value={formData.transporterName}
//                     onChange={handleChange}
//                     placeholder="Enter transporter name"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.transporterName 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.transporterName && (
//                     <p className="mt-1 text-sm text-red-600">{errors.transporterName}</p>
//                   )}
//                 </div>
                
//                 {/* Transporter ID */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiDocumentText className="w-4 h-4 mr-2" />
//                       Transporter ID
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="transporterID"
//                     value={formData.transporterID}
//                     onChange={handleChange}
//                     placeholder="Enter transporter ID"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
                
//                 {/* Distance KM */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiLocationMarker className="w-4 h-4 mr-2" />
//                       Pin to Pin Distance (KM)
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="number"
//                     name="distanceKM"
//                     value={formData.distanceKM}
//                     onChange={handleChange}
//                     placeholder="Enter distance in KM"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.distanceKM 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.distanceKM && (
//                     <p className="mt-1 text-sm text-red-600">{errors.distanceKM}</p>
//                   )}
//                 </div>
                
//                 {/* Document No */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiDocumentText className="w-4 h-4 mr-2" />
//                       Document No / Lading No
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="documentNo"
//                     value={formData.documentNo}
//                     onChange={handleChange}
//                     placeholder="Enter document number"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* 5️⃣ PART-B DETAILS */}
//             <div className="p-6 bg-red-50/30">
//               <div className="flex items-center mb-6">
//                 <div className="bg-red-100 p-2 rounded-lg mr-3">
//                   <HiTruck className="w-6 h-6 text-red-600" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-800">Part-B Details</h2>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Mode of Transport */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiTruck className="w-4 h-4 mr-2" />
//                       Mode of Transport
//                     </div>
//                   </label>
//                   <select
//                     name="transportMode"
//                     value={formData.transportMode}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   >
//                     <option>Road</option>
//                     <option>Rail</option>
//                     <option>Air</option>
//                     <option>Ship</option>
//                     <option>Not Applicable</option>
//                   </select>
//                 </div>
                
//                 {/* Vehicle Number */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiTruck className="w-4 h-4 mr-2" />
//                       Vehicle Number
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="text"
//                     name="vehicleNumber"
//                     value={formData.vehicleNumber}
//                     onChange={handleChange}
//                     placeholder="Enter vehicle number"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.vehicleNumber 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.vehicleNumber && (
//                     <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
//                   )}
//                 </div>
                
//                 {/* Vehicle Type */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiTruck className="w-4 h-4 mr-2" />
//                       Vehicle Type
//                     </div>
//                   </label>
//                   <select
//                     name="vehicleType"
//                     value={formData.vehicleType}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   >
//                     <option>Regular</option>
//                     <option>Over-Dimensional Cargo</option>
//                     <option>Not Applicable</option>
//                   </select>
//                 </div>
                
//                 {/* Transport Date */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     <div className="flex items-center">
//                       <HiCalendar className="w-4 h-4 mr-2" />
//                       Transport Date
//                       <span className="text-red-500 ml-1">*</span>
//                     </div>
//                   </label>
//                   <input
//                     type="date"
//                     name="transportDate"
//                     value={formData.transportDate}
//                     onChange={handleChange}
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                       errors.transportDate 
//                         ? 'border-red-300 focus:ring-red-500' 
//                         : 'border-gray-300 focus:ring-blue-500'
//                     }`}
//                   />
//                   {errors.transportDate && (
//                     <p className="mt-1 text-sm text-red-600">{errors.transportDate}</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="p-6 border-t border-gray-200 bg-gray-50">
//               <div className="flex flex-col sm:flex-row justify-end gap-4">
//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
//                 >
//                   <HiRefresh className="w-5 h-5 mr-2" />
//                   Reset Form
//                 </button>
                
//                 <button
//                   type="button"
//                   onClick={() => setIsSubmitted(false)}
//                   className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
//                 >
//                   <HiX className="w-5 h-5 mr-2" />
//                   Cancel
//                 </button>
                
//                 <button
//                   type="submit"
//                   className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
//                 >
//                   <HiCheck className="w-5 h-5 mr-2" />
//                   Save E-way Bill Details
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Quick Stats / Summary */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
//             <div className="flex items-center">
//               <div className="bg-blue-100 p-3 rounded-lg mr-4">
//                 <HiDocumentText className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">E-way Bill Number</p>
//                 <p className="text-lg font-semibold text-gray-800">
//                   {formData.ewayBillNo || 'Not entered'}
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
//             <div className="flex items-center">
//               <div className="bg-green-100 p-3 rounded-lg mr-4">
//                 <HiUser className="w-6 h-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Consignor</p>
//                 <p className="text-lg font-semibold text-gray-800">
//                   {formData.consignorName || 'Not entered'}
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
//             <div className="flex items-center">
//               <div className="bg-purple-100 p-3 rounded-lg mr-4">
//                 <HiTruck className="w-6 h-6 text-purple-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Transporter</p>
//                 <p className="text-lg font-semibold text-gray-800">
//                   {formData.transporterName || 'Not entered'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Information Card */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
//           <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
//             <HiDocumentText className="w-5 h-5 mr-2" />
//             About E-way Bill
//           </h3>
//           <p className="text-gray-700 mb-3">
//             E-way Bill is a compliance mechanism under GST where by the person in charge of conveyance carrying any consignment of goods of value exceeding ₹50,000 is required to carry a document generated from the GST Common Portal.
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             <div className="flex items-center">
//               <div className="bg-green-100 p-2 rounded-lg mr-3">
//                 <HiCheck className="w-4 h-4 text-green-600" />
//               </div>
//               <span>Required for inter-state movement of goods</span>
//             </div>
//             <div className="flex items-center">
//               <div className="bg-blue-100 p-2 rounded-lg mr-3">
//                 <HiCheck className="w-4 h-4 text-blue-600" />
//               </div>
//               <span>Valid for 1-15 days depending on distance</span>
//             </div>
//             <div className="flex items-center">
//               <div className="bg-purple-100 p-2 rounded-lg mr-3">
//                 <HiCheck className="w-4 h-4 text-purple-600" />
//               </div>
//               <span>Mandatory for all registered persons</span>
//             </div>
//             <div className="flex items-center">
//               <div className="bg-orange-100 p-2 rounded-lg mr-3">
//                 <HiCheck className="w-4 h-4 text-orange-600" />
//               </div>
//               <span>Can be generated online via GST Portal</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default E_wayBill;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useCompany } from '../context/CompanyContext';
import {
  HiTruck,
  HiDocumentText,
  HiCalendar,
  HiUser,
  HiLocationMarker,
  HiCheckCircle,
  HiEye,
  HiRefresh
} from 'react-icons/hi';

const EwayBillVouchers = () => {
  const { companyId } = useCompany();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch e-way bill vouchers
  const fetchEwayBillVouchers = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/sale-voucher/getEwaybill/${companyId}`
      );
      
      if (response.data.success) {
        setVouchers(response.data.data || []);
      } else {
        Swal.fire('Error', response.data.message || 'Failed to fetch e-way bill vouchers', 'error');
      }
    } catch (error) {
      console.error('Error fetching e-way bill vouchers:', error);
      Swal.fire('Error', 'Failed to fetch e-way bill vouchers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEwayBillVouchers();
  }, [companyId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // View voucher details
  const viewVoucherDetails = (voucher) => {
    setSelectedVoucher(voucher);
    setShowDetailsModal(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVoucher(null);
  };

  // Details Modal Component
  const VoucherDetailsModal = () => {
    if (!selectedVoucher) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <HiDocumentText className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                E-way Bill Details - Invoice #{selectedVoucher.invoiceNo || 'N/A'}
              </h3>
            </div>
            <button
              onClick={closeDetailsModal}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <HiDocumentText className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="font-medium">{selectedVoucher.invoiceNo || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiCalendar className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-medium">{formatDate(selectedVoucher.date)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiUser className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{selectedVoucher.customer || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiDocumentText className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Grand Total</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(selectedVoucher.grand_total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* E-way Bill Details */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                E-way Bill Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">E-way Bill Number</label>
                  <p className="font-medium text-blue-600">{selectedVoucher.ewayBillNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">E-way Bill Date</label>
                  <p className="font-medium">{formatDate(selectedVoucher.ewayBillDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Consolidated E-way Bill No</label>
                  <p className="font-medium">{selectedVoucher.consolidatedEwayBillNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Sub Type</label>
                  <p className="font-medium">{selectedVoucher.subType || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Transport Details */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                Transport Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Transport Mode</label>
                  <p className="font-medium">{selectedVoucher.transportMode || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vehicle Number</label>
                  <p className="font-medium">{selectedVoucher.vehicleNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vehicle Type</label>
                  <p className="font-medium">{selectedVoucher.vehicleType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Distance (KM)</label>
                  <p className="font-medium">{selectedVoucher.distanceKM || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Transport Date</label>
                  <p className="font-medium">{formatDate(selectedVoucher.transportDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Document No</label>
                  <p className="font-medium">{selectedVoucher.documentNo || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Consignor Details */}
            {selectedVoucher.consignorName && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                  Consignor Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">{selectedVoucher.consignorName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">GSTIN</label>
                    <p className="font-medium">{selectedVoucher.consignorGSTIN || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    <p className="font-medium">{selectedVoucher.consignorState || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Pincode</label>
                    <p className="font-medium">{selectedVoucher.consignorPincode || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-medium">{selectedVoucher.consignorAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Consignee Details */}
            {selectedVoucher.consigneeName && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                  Consignee Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">{selectedVoucher.consigneeName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">GSTIN</label>
                    <p className="font-medium">{selectedVoucher.consigneeGSTIN || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    <p className="font-medium">{selectedVoucher.consigneeState || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Pincode</label>
                    <p className="font-medium">{selectedVoucher.consigneePincode || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-medium">{selectedVoucher.consigneeAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transporter Details */}
            {selectedVoucher.transporterName && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                  Transporter Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Transporter Name</label>
                    <p className="font-medium">{selectedVoucher.transporterName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Transporter ID</label>
                    <p className="font-medium">{selectedVoucher.transporterID || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white mx-auto shadow-md rounded-xl border border-gray-300 max-w-6xl">
      {/* Header */}
      <div className="border-b py-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <HiTruck className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">E-way Bill Vouchers</h1>
              <p className="text-gray-600 text-sm">
                List of all sale vouchers with e-way bill details
              </p>
            </div>
          </div>
          <button
            onClick={fetchEwayBillVouchers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            <HiRefresh className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* No Vouchers State */}
          {vouchers.length === 0 ? (
            <div className="text-center py-12">
              <HiDocumentText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No E-way Bill Vouchers</h3>
              <p className="text-gray-500">
                No sale vouchers with e-way bill details found.
              </p>
            </div>
          ) : (
            /* Vouchers Table */
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Invoice No
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      E-way Bill No
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Transport Mode
                    </th>
                    <th className="border px-4 py-3 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50 border-b">
                      <td className="border px-4 py-3">
                        <div className="font-medium">{voucher.invoiceNo || 'N/A'}</div>
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiUser className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{voucher.customer || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiDocumentText className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="font-medium text-blue-600">
                            {voucher.ewayBillNo || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiCalendar className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{formatDate(voucher.date)}</span>
                        </div>
                      </td>
                      <td className="border px-4 py-3 font-semibold text-green-600">
                        {formatCurrency(voucher.grand_total)}
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex items-center">
                          <HiTruck className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{voucher.transportMode || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="border px-4 py-3">
                        <button
                          onClick={() => viewVoucherDetails(voucher)}
                          className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
                        >
                          <HiEye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {vouchers.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <HiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-700">
                    Total {vouchers.length} e-way bill voucher{vouchers.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                <div className="text-lg font-semibold text-blue-800">
                  Total Amount: {formatCurrency(
                    vouchers.reduce((sum, voucher) => sum + parseFloat(voucher.grand_total || 0), 0)
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && <VoucherDetailsModal />}
    </div>
  );
};

export default EwayBillVouchers;