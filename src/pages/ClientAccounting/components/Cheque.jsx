// import React, { useState, useEffect } from 'react';
// import {
//   HiArrowLeft,
//   HiDocumentText,
//   // HiBanknotes,
//   HiCalendar,
//   HiCurrencyRupee,
//   HiCheckCircle,
//   HiClock,
//   HiXCircle,
//   HiSave,
//   HiPrinter,
//   HiDownload,
//   HiUser,
//  // HiBuildingOffice,
//   HiDocumentDuplicate
// } from 'react-icons/hi';
// import { useNavigate, useParams } from 'react-router-dom';

// const Cheque = () => {
//   const navigate = useNavigate();
//   const { id } = useParams(); // For edit/view mode
//   const [isEditMode, setIsEditMode] = useState(id && id !== 'new');
//   const [loading, setLoading] = useState(false);
//   const [printMode, setPrintMode] = useState(false);

//   const [chequeData, setChequeData] = useState({
//     // Basic Information
//     chequeNumber: '',
//     chequeDate: new Date().toISOString().split('T')[0],
//     chequeType: 'issued', // issued or received
//     amount: '',
//     amountInWords: '',
    
//     // Payee/Drawer Details
//     payeeName: '',
//     payeeAddress: '',
//     payeeContact: '',
//     payeePAN: '',
    
//     // Bank Details
//     bankName: '',
//     branchName: '',
//     accountNumber: '',
//     ifscCode: '',
    
//     // Dates
//     dateIssued: new Date().toISOString().split('T')[0],
//     datePresented: '',
//     dateCleared: '',
    
//     // Status
//     status: 'pending', // pending, cleared, bounced, cancelled
//     statusDate: '',
    
//     // Additional Details
//     purpose: '',
//     referenceNumber: '',
//     narration: '',
    
//     // Tax Information
//     tdsDeducted: '0',
//     tdsAmount: '0',
    
//     // Attachments
//     attachmentUrl: '',
//     chequeImage: ''
//   });

//   const [errors, setErrors] = useState({});

//   // For edit/view mode, fetch cheque data
//   useEffect(() => {
//     if (id && id !== 'new') {
//       setLoading(true);
//       // Simulate API call
//       setTimeout(() => {
//         const sampleData = {
//           chequeNumber: '876543',
//           chequeDate: '2024-01-15',
//           chequeType: 'issued',
//           amount: '75000',
//           amountInWords: 'Seventy Five Thousand Only',
//           payeeName: 'ABC Suppliers Pvt Ltd',
//           payeeAddress: '123 Business Street, Mumbai - 400001',
//           payeeContact: '9876543210',
//           payeePAN: 'ABCDE1234F',
//           bankName: 'HDFC Bank',
//           branchName: 'Mumbai Main',
//           accountNumber: '123456789012',
//           ifscCode: 'HDFC0001234',
//           dateIssued: '2024-01-15',
//           datePresented: '2024-01-18',
//           dateCleared: '2024-01-20',
//           status: 'cleared',
//           statusDate: '2024-01-20',
//           purpose: 'Material purchase',
//           referenceNumber: 'PO-2024-001',
//           narration: 'Payment for January materials',
//           tdsDeducted: '10',
//           tdsAmount: '7500',
//           attachmentUrl: '',
//           chequeImage: ''
//         };
//         setChequeData(sampleData);
//         setLoading(false);
//       }, 1000);
//     }
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setChequeData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
    
//     // Auto-calculate TDS amount if amount or TDS percentage changes
//     if (name === 'amount' || name === 'tdsDeducted') {
//       const amount = parseFloat(chequeData.amount) || 0;
//       const tdsPercentage = parseFloat(chequeData.tdsDeducted) || 0;
//       const tdsAmount = (amount * tdsPercentage) / 100;
      
//       setChequeData(prev => ({
//         ...prev,
//         tdsAmount: tdsAmount.toFixed(2)
//       }));
//     }
//   };

//   const handleAmountChange = (e) => {
//     const value = e.target.value;
//     setChequeData(prev => ({
//       ...prev,
//       amount: value
//     }));
    
//     // Convert amount to words (simplified version)
//     if (value && !isNaN(value)) {
//       const amountInWords = convertToWords(value);
//       setChequeData(prev => ({
//         ...prev,
//         amountInWords
//       }));
//     }
//   };

//   const convertToWords = (num) => {
//     // Simplified version - in real app use a proper library
//     const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
//     const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//     const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
//     const amount = parseFloat(num);
//     if (amount === 0) return 'Zero Only';
    
//     // Simple conversion for demo
//     return 'Rupees ' + amount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' Only';
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     // Required fields
//     if (!chequeData.chequeNumber) newErrors.chequeNumber = 'Cheque number is required';
//     if (!chequeData.amount) newErrors.amount = 'Amount is required';
//     if (!chequeData.payeeName) newErrors.payeeName = 'Payee name is required';
//     if (!chequeData.bankName) newErrors.bankName = 'Bank name is required';
//     if (!chequeData.accountNumber) newErrors.accountNumber = 'Account number is required';
    
//     return newErrors;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const validationErrors = validateForm();
    
//     if (Object.keys(validationErrors).length === 0) {
//       setLoading(true);
//       // Simulate API call
//       setTimeout(() => {
//         console.log('Cheque saved:', chequeData);
//         alert(`Cheque ${isEditMode ? 'updated' : 'created'} successfully!`);
//         navigate('/cheque-register');
//         setLoading(false);
//       }, 1500);
//     } else {
//       setErrors(validationErrors);
//     }
//   };

//   const handlePrintCheque = () => {
//     setPrintMode(true);
//     setTimeout(() => {
//       window.print();
//       setPrintMode(false);
//     }, 100);
//   };

//   const handleDownloadCheque = () => {
//     const dataStr = JSON.stringify(chequeData, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//     const exportFileDefaultName = `cheque-${chequeData.chequeNumber}.json`;
    
//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   const getStatusBadge = () => {
//     const statusConfig = {
//       cleared: { color: 'bg-green-100 text-green-800', icon: <HiCheckCircle className="w-5 h-5" /> },
//       pending: { color: 'bg-yellow-100 text-yellow-800', icon: <HiClock className="w-5 h-5" /> },
//       bounced: { color: 'bg-red-100 text-red-800', icon: <HiXCircle className="w-5 h-5" /> },
//       cancelled: { color: 'bg-gray-100 text-gray-800', icon: <HiXCircle className="w-5 h-5" /> }
//     };
    
//     const config = statusConfig[chequeData.status] || statusConfig.pending;
    
//     return (
//       <div className={`inline-flex items-center px-4 py-2 rounded-lg ${config.color}`}>
//         {config.icon}
//         <span className="ml-2 font-medium capitalize">{chequeData.status}</span>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <span className="ml-4 text-gray-600">Loading cheque details...</span>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${printMode ? 'bg-white' : 'bg-gray-50'} p-4 md:p-6`}>
//       <div className="max-w-6xl mx-auto">
//         {/* Header - Hidden in print mode */}
//         {!printMode && (
//           <div className="mb-8">
//             <button
//               onClick={() => navigate('/cheque-register')}
//               className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
//             >
//               <HiArrowLeft className="w-5 h-5 mr-2" />
//               Back to Cheque Register
//             </button>
            
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-2 shadow-lg">
//               <div className="flex flex-col md:flex-row md:items-center justify-between">
//                 <div className="flex items-center mb-4 md:mb-0">
//                   <div className="bg-white/20 p-3 rounded-lg mr-4">
//                     {/* <HiBanknotes className="w-8 h-8 text-white" /> */}
//                   </div>
//                   <div>
//                     <h1 className="text-2xl md:text-3xl font-bold text-white">
//                       {isEditMode ? 'Edit Cheque' : 'Create New Cheque'}
//                     </h1>
//                     <p className="text-blue-100 mt-1">
//                       {isEditMode ? `Cheque: ${chequeData.chequeNumber}` : 'Add cheque details'}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     onClick={handlePrintCheque}
//                     className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center"
//                   >
//                     <HiPrinter className="w-5 h-5 mr-2" />
//                     Print Cheque
//                   </button>
//                   <button
//                     onClick={handleDownloadCheque}
//                     className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center"
//                   >
//                     <HiDownload className="w-5 h-5 mr-2" />
//                     Download
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Cheque Form */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <form onSubmit={handleSubmit}>
//             {/* Status Bar */}
//             {!printMode && (
//               <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
//                 <div className="flex items-center space-x-4">
//                   {getStatusBadge()}
//                   <div className="text-sm text-gray-500">
//                     {isEditMode ? 'Last updated: Today' : 'New Cheque'}
//                   </div>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     type="button"
//                     onClick={() => navigate('/cheque-register')}
//                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
//                   >
//                     <HiSave className="w-5 h-5 mr-2" />
//                     {loading ? 'Saving...' : 'Save Cheque'}
//                   </button>
//                 </div>
//               </div>
//             )}

//             <div className="p-6">
//               {/* 1️⃣ BASIC INFORMATION */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <HiDocumentText className="w-6 h-6 mr-2 text-blue-600" />
//                   Basic Information
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Cheque Type */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Cheque Type
//                     </label>
//                     <div className="flex space-x-4">
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="chequeType"
//                           value="issued"
//                           checked={chequeData.chequeType === 'issued'}
//                           onChange={handleChange}
//                           className="h-4 w-4 text-blue-600"
//                         />
//                         <span className="ml-2">Issued (Payment)</span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="chequeType"
//                           value="received"
//                           checked={chequeData.chequeType === 'received'}
//                           onChange={handleChange}
//                           className="h-4 w-4 text-blue-600"
//                         />
//                         <span className="ml-2">Received (Income)</span>
//                       </label>
//                     </div>
//                   </div>
                  
//                   {/* Cheque Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Cheque Number *
//                     </label>
//                     <input
//                       type="text"
//                       name="chequeNumber"
//                       value={chequeData.chequeNumber}
//                       onChange={handleChange}
//                       placeholder="Enter cheque number"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.chequeNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.chequeNumber && (
//                       <p className="mt-1 text-sm text-red-600">{errors.chequeNumber}</p>
//                     )}
//                   </div>
                  
//                   {/* Cheque Date */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Cheque Date
//                     </label>
//                     <input
//                       type="date"
//                       name="chequeDate"
//                       value={chequeData.chequeDate}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   {/* Amount */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Amount (₹) *
//                     </label>
//                     <input
//                       type="number"
//                       name="amount"
//                       value={chequeData.amount}
//                       onChange={handleAmountChange}
//                       placeholder="Enter amount"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.amount && (
//                       <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
//                     )}
//                   </div>
                  
//                   {/* Amount in Words */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Amount in Words
//                     </label>
//                     <input
//                       type="text"
//                       name="amountInWords"
//                       value={chequeData.amountInWords}
//                       onChange={handleChange}
//                       placeholder="Amount in words"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* 2️⃣ PAYEE/DRAWER DETAILS */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <HiUser className="w-6 h-6 mr-2 text-green-600" />
//                   {chequeData.chequeType === 'issued' ? 'Payee Details' : 'Drawer Details'}
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       {chequeData.chequeType === 'issued' ? 'Payee Name' : 'Drawer Name'} *
//                     </label>
//                     <input
//                       type="text"
//                       name="payeeName"
//                       value={chequeData.payeeName}
//                       onChange={handleChange}
//                       placeholder="Enter name"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.payeeName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.payeeName && (
//                       <p className="mt-1 text-sm text-red-600">{errors.payeeName}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       PAN Number
//                     </label>
//                     <input
//                       type="text"
//                       name="payeePAN"
//                       value={chequeData.payeePAN}
//                       onChange={handleChange}
//                       placeholder="Enter PAN"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Address
//                     </label>
//                     <textarea
//                       name="payeeAddress"
//                       value={chequeData.payeeAddress}
//                       onChange={handleChange}
//                       rows="3"
//                       placeholder="Enter address"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Contact Number
//                     </label>
//                     <input
//                       type="tel"
//                       name="payeeContact"
//                       value={chequeData.payeeContact}
//                       onChange={handleChange}
//                       placeholder="Enter contact number"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* 3️⃣ BANK DETAILS */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   {/* <HiBuildingOffice className="w-6 h-6 mr-2 text-purple-600" /> */}
//                   Bank Details
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bank Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="bankName"
//                       value={chequeData.bankName}
//                       onChange={handleChange}
//                       placeholder="Enter bank name"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.bankName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.bankName && (
//                       <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Branch Name
//                     </label>
//                     <input
//                       type="text"
//                       name="branchName"
//                       value={chequeData.branchName}
//                       onChange={handleChange}
//                       placeholder="Enter branch name"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Account Number *
//                     </label>
//                     <input
//                       type="text"
//                       name="accountNumber"
//                       value={chequeData.accountNumber}
//                       onChange={handleChange}
//                       placeholder="Enter account number"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.accountNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.accountNumber && (
//                       <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       IFSC Code
//                     </label>
//                     <input
//                       type="text"
//                       name="ifscCode"
//                       value={chequeData.ifscCode}
//                       onChange={handleChange}
//                       placeholder="Enter IFSC code"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* 4️⃣ DATES & STATUS */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <HiCalendar className="w-6 h-6 mr-2 text-orange-600" />
//                   Dates & Status
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Date Issued
//                     </label>
//                     <input
//                       type="date"
//                       name="dateIssued"
//                       value={chequeData.dateIssued}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Date Presented
//                     </label>
//                     <input
//                       type="date"
//                       name="datePresented"
//                       value={chequeData.datePresented}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <select
//                       name="status"
//                       value={chequeData.status}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="cleared">Cleared</option>
//                       <option value="bounced">Bounced</option>
//                       <option value="cancelled">Cancelled</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* 5️⃣ ADDITIONAL DETAILS */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <HiDocumentDuplicate className="w-6 h-6 mr-2 text-red-600" />
//                   Additional Details
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Purpose / Category
//                     </label>
//                     <select
//                       name="purpose"
//                       value={chequeData.purpose}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     >
//                       <option value="">Select Purpose</option>
//                       <option value="salary">Salary Payment</option>
//                       <option value="vendor">Vendor Payment</option>
//                       <option value="expense">Business Expense</option>
//                       <option value="loan">Loan Payment</option>
//                       <option value="investment">Investment</option>
//                       <option value="tax">Tax Payment</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Reference Number
//                     </label>
//                     <input
//                       type="text"
//                       name="referenceNumber"
//                       value={chequeData.referenceNumber}
//                       onChange={handleChange}
//                       placeholder="e.g., PO-2024-001"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Narration / Remarks
//                     </label>
//                     <textarea
//                       name="narration"
//                       value={chequeData.narration}
//                       onChange={handleChange}
//                       rows="3"
//                       placeholder="Enter any remarks"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       TDS Deducted (%)
//                     </label>
//                     <input
//                       type="number"
//                       name="tdsDeducted"
//                       value={chequeData.tdsDeducted}
//                       onChange={handleChange}
//                       placeholder="Enter TDS percentage"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       TDS Amount (₹)
//                     </label>
//                     <input
//                       type="text"
//                       name="tdsAmount"
//                       value={chequeData.tdsAmount}
//                       readOnly
//                       className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Save Button for Print Mode */}
//               {printMode && (
//                 <div className="mt-8 text-center print:hidden">
//                   <button
//                     type="submit"
//                     className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                   >
//                     Save Cheque Details
//                   </button>
//                 </div>
//               )}
//             </div>
//           </form>
//         </div>

//         {/* Preview Section (Non-print mode only) */}
//         {!printMode && (
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Cheque Preview</h3>
//             <div className="bg-white border-2 border-gray-300 rounded-xl p-8 shadow-inner">
//               <div className="grid grid-cols-2 gap-8">
//                 <div>
//                   <h4 className="font-bold text-gray-800 mb-4">Cheque Details</h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Cheque Number:</span>
//                       <span className="font-semibold">{chequeData.chequeNumber || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Date:</span>
//                       <span>{chequeData.chequeDate || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Pay to:</span>
//                       <span className="font-medium">{chequeData.payeeName || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Amount:</span>
//                       <span className="text-xl font-bold">
//                         {chequeData.amount ? `₹${parseFloat(chequeData.amount).toLocaleString('en-IN')}` : '---'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h4 className="font-bold text-gray-800 mb-4">Bank Details</h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Bank:</span>
//                       <span>{chequeData.bankName || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Account:</span>
//                       <span>{chequeData.accountNumber || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Status:</span>
//                       {getStatusBadge()}
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Amount in Words Box */}
//               {chequeData.amountInWords && (
//                 <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                   <p className="text-gray-600 text-sm mb-1">Amount in Words:</p>
//                   <p className="font-medium">{chequeData.amountInWords}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Cheque;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  FileText,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  Printer,
  Download,
  User,
  Copy,
  Landmark,
  Wallet,
  ChevronDown,
  Loader2,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

const Cheque = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { companyId } = useCompany();
  const [isEditMode, setIsEditMode] = useState(id && id !== 'new');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBankData, setSelectedBankData] = useState(null);

  const [chequeData, setChequeData] = useState({
    // Basic Information
    chequeNumber: '',
    chequeDate: new Date().toISOString().split('T')[0],
    chequeType: 'issued',
    amount: '',
    amountInWords: '',
    
    // Payee/Drawer Details
    payeeName: '',
    payeeAddress: '',
    payeeContact: '',
    payeePAN: '',
    
    // Bank Details
    bankId: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Dates
    dateIssued: new Date().toISOString().split('T')[0],
    datePresented: '',
    dateCleared: '',
    
    // Status
    status: 'pending',
    statusDate: '',
    
    // Additional Details
    purpose: '',
    referenceNumber: '',
    narration: '',
    
    // Tax Information
    tdsDeducted: '0',
    tdsAmount: '0',
    
    // Attachments
    attachmentUrl: '',
    chequeImage: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch bank accounts from API when companyId is available
  const fetchBankAccounts = async () => {
    if (!companyId) return;
    
    setLoadingBanks(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
      );
      
      if (response.data.success) {
        setBankAccounts(response.data.accounts || []);
      } else {
        Swal.fire('Error', response.data.message || 'Failed to fetch bank accounts', 'error');
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      Swal.fire('Error', 'Failed to fetch bank accounts', 'error');
    } finally {
      setLoadingBanks(false);
    }
  };

  // Fetch cheque data for edit/view mode
  const fetchChequeData = async () => {
    if (!id || id === 'new') return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/item/${id}`
      );
      
      if (response.data.success) {
        const data = response.data.data;
        // Convert dates to YYYY-MM-DD format for input fields
        const formattedData = {
          ...data,
          chequeDate: data.chequeDate ? data.chequeDate.split('T')[0] : '',
          dateIssued: data.dateIssued ? data.dateIssued.split('T')[0] : '',
          datePresented: data.datePresented ? data.datePresented.split('T')[0] : '',
          dateCleared: data.dateCleared ? data.dateCleared.split('T')[0] : '',
          statusDate: data.statusDate ? data.statusDate.split('T')[0] : '',
          tdsDeducted: data.tdsDeducted?.toString() || '0',
          tdsAmount: data.tdsAmount?.toString() || '0',
          amount: data.amount?.toString() || ''
        };
        
        setChequeData(formattedData);
        setIsEditMode(true);
        
        // Find and set selected bank data
        if (data.bankId && bankAccounts.length > 0) {
          const bank = bankAccounts.find(b => b.id === data.bankId);
          if (bank) setSelectedBankData(bank);
        }
      } else {
        Swal.fire('Error', response.data.message || 'Failed to fetch cheque data', 'error');
        navigate('/cheque-register');
      }
    } catch (error) {
      console.error('Error fetching cheque:', error);
      Swal.fire('Error', 'Failed to fetch cheque data', 'error');
      navigate('/cheque-register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchBankAccounts();
    }
  }, [companyId]);

  useEffect(() => {
    if (id && id !== 'new' && bankAccounts.length > 0) {
      fetchChequeData();
    }
  }, [id, bankAccounts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedChequeData = {
      ...chequeData,
      [name]: value
    };

    // If bank selection changes, auto-fill bank details
    if (name === 'bankId' && value) {
      const selectedBank = bankAccounts.find(bank => bank.id.toString() === value);
      if (selectedBank) {
        updatedChequeData.bankName = selectedBank.bankName || '';
        updatedChequeData.branchName = selectedBank.branchName || '';
        updatedChequeData.accountNumber = selectedBank.accountNumber || '';
        updatedChequeData.ifscCode = selectedBank.ifscCode || '';
        setSelectedBankData(selectedBank);
      }
    }

    // Auto-calculate TDS amount
    if (name === 'amount' || name === 'tdsDeducted') {
      const amount = parseFloat(updatedChequeData.amount) || 0;
      const tdsPercentage = parseFloat(updatedChequeData.tdsDeducted) || 0;
      updatedChequeData.tdsAmount = ((amount * tdsPercentage) / 100).toFixed(2);
    }

    setChequeData(updatedChequeData);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setChequeData(prev => ({
      ...prev,
      amount: value
    }));
    
    // Convert amount to words
    if (value && !isNaN(value)) {
      const amountInWords = convertToWords(value);
      setChequeData(prev => ({
        ...prev,
        amountInWords
      }));
    }
  };

  const convertToWords = (num) => {
    const amount = parseFloat(num);
    if (amount === 0) return 'Zero Only';
    
    // Simple conversion - consider using a library like 'number-to-words' for production
    return 'Rupees ' + amount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' Only';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!chequeData.chequeNumber) newErrors.chequeNumber = 'Cheque number is required';
    if (!chequeData.amount) newErrors.amount = 'Amount is required';
    if (!chequeData.payeeName) newErrors.payeeName = 'Payee name is required';
    
    // Only validate bank details for issued cheques
    if (chequeData.chequeType === 'issued') {
      if (!chequeData.bankId) newErrors.bankId = 'Bank selection is required';
      if (!chequeData.accountNumber) newErrors.accountNumber = 'Account number is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...chequeData,
        amount: parseFloat(chequeData.amount),
        tdsDeducted: parseFloat(chequeData.tdsDeducted) || 0,
        tdsAmount: parseFloat(chequeData.tdsAmount) || 0
      };

      let response;
      
      if (isEditMode) {
        // Update existing cheque
        response = await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${id}/update`,
          payload
        );
      } else {
        // Create new cheque
        response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${companyId}/create`,
          payload
        );
      }

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Cheque ${isEditMode ? 'updated' : 'created'} successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
        
        // Navigate back to cheque register
        setTimeout(() => {
          navigate('/cheque-register');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to save cheque');
      }
    } catch (error) {
      console.error('Error saving cheque:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to save cheque',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCheque = async () => {
    if (!id || id === 'new') return;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${id}/delete`
        );

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Cheque has been deleted.',
            timer: 2000,
            showConfirmButton: false
          });
          
          setTimeout(() => {
            navigate('/cheque-register');
          }, 1500);
        }
      } catch (error) {
        console.error('Error deleting cheque:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete cheque',
        });
      }
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (!id || id === 'new') return;
    
    const result = await Swal.fire({
      title: 'Change Status',
      text: `Change cheque status to "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${id}/change-status`,
          {
            status: newStatus,
            statusDate: new Date().toISOString().split('T')[0]
          }
        );

        if (response.data.success) {
          setChequeData(prev => ({
            ...prev,
            status: newStatus,
            statusDate: new Date().toISOString().split('T')[0]
          }));
          
          Swal.fire({
            icon: 'success',
            title: 'Status Updated!',
            text: `Cheque status changed to ${newStatus}`,
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error changing status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to change status',
        });
      }
    }
  };

  const handlePrintCheque = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleDownloadCheque = () => {
    const dataStr = JSON.stringify(chequeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `cheque-${chequeData.chequeNumber}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusBadge = (status = chequeData.status) => {
    const statusConfig = {
      cleared: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-5 h-5" /> },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-5 h-5" /> },
      bounced: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-5 h-5" /> },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-5 h-5" /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-lg ${config.color}`}>
        {config.icon}
        <span className="ml-2 font-medium capitalize">{status}</span>
      </div>
    );
  };

  // const QuickStatusButtons = () => (
  //   <div className="flex flex-wrap gap-2 mt-2">
  //     {['pending', 'cleared', 'bounced', 'cancelled'].map((status) => (
  //       <button
  //         key={status}
  //         type="button"
  //         onClick={() => handleChangeStatus(status)}
  //         disabled={chequeData.status === status}
  //         className={`px-3 py-1 rounded text-sm ${
  //           chequeData.status === status 
  //             ? 'bg-blue-600 text-white' 
  //             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  //         }`}
  //       >
  //         {status.charAt(0).toUpperCase() + status.slice(1)}
  //       </button>
  //     ))}
  //   </div>
  // );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading cheque details...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${printMode ? 'bg-white' : 'bg-gray-50'} p-1 `}>
      <div className=" mx-auto">
        {/* Header */}
        {!printMode && (
          <div className="mb-8">
            <button
              onClick={() => navigate('/cheque-register')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cheque Register
            </button>
            
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl p-2 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-white/20 p-3 rounded-lg mr-4">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      {isEditMode ? 'Edit Cheque' : 'Create New Cheque'}
                    </h1>
                    <p className="text-blue-100 mt-1">
                      {isEditMode ? `Cheque: ${chequeData.chequeNumber}` : 'Add cheque details'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrintCheque}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Print Cheque
                  </button>
                  <button
                    onClick={handleDownloadCheque}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </button>
                  {isEditMode && (
                    <button
                      onClick={handleDeleteCheque}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cheque Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Status Bar */}
            {!printMode && (
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {/* {getStatusBadge()} */}
                  <div className="text-sm text-gray-500">
                    {isEditMode ? `Last updated: Today` : 'New Cheque'}
                  </div>
                  {/* <QuickStatusButtons /> */}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/cheque-register')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {isEditMode ? 'Update Cheque' : 'Save Cheque'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* 1️⃣ BASIC INFORMATION */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cheque Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cheque Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="chequeType"
                          value="issued"
                          checked={chequeData.chequeType === 'issued'}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Issued (Payment)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="chequeType"
                          value="received"
                          checked={chequeData.chequeType === 'received'}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Received (Income)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Cheque Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cheque Number *
                    </label>
                    <input
                      type="text"
                      name="chequeNumber"
                      value={chequeData.chequeNumber}
                      onChange={handleChange}
                      placeholder="Enter cheque number"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                        errors.chequeNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.chequeNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.chequeNumber}</p>
                    )}
                  </div>
                  
                  {/* Cheque Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cheque Date
                    </label>
                    <input
                      type="date"
                      name="chequeDate"
                      value={chequeData.chequeDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={chequeData.amount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                        errors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>
                  
                  {/* Amount in Words */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount in Words
                    </label>
                    <input
                      type="text"
                      name="amountInWords"
                      value={chequeData.amountInWords}
                      onChange={handleChange}
                      placeholder="Amount in words"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2️⃣ PAYEE/DRAWER DETAILS */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-6 h-6 mr-2 text-green-600" />
                  {chequeData.chequeType === 'issued' ? 'Payee Details' : 'Drawer Details'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {chequeData.chequeType === 'issued' ? 'Payee Name' : 'Drawer Name'} *
                    </label>
                    <input
                      type="text"
                      name="payeeName"
                      value={chequeData.payeeName}
                      onChange={handleChange}
                      placeholder="Enter name"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                        errors.payeeName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.payeeName && (
                      <p className="mt-1 text-sm text-red-600">{errors.payeeName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      name="payeePAN"
                      value={chequeData.payeePAN}
                      onChange={handleChange}
                      placeholder="Enter PAN"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="payeeAddress"
                      value={chequeData.payeeAddress}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="payeeContact"
                      value={chequeData.payeeContact}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3️⃣ BANK DETAILS - Only for issued cheques */}
              {chequeData.chequeType === 'issued' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Landmark className="w-6 h-6 mr-2 text-purple-600" />
                    Bank Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bank Selection Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Bank Account *
                      </label>
                      <div className="relative">
                        {loadingBanks ? (
                          <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-400" />
                            <span className="text-gray-500">Loading banks...</span>
                          </div>
                        ) : bankAccounts.length === 0 ? (
                          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-yellow-50">
                            <p className="text-yellow-700 text-sm">
                              No bank accounts found. 
                              <button
                                type="button"
                                onClick={() => navigate('/bank-activities')}
                                className="ml-1 text-blue-600 hover:underline"
                              >
                                Add bank account first
                              </button>
                            </p>
                          </div>
                        ) : (
                          <select
                            name="bankId"
                            value={chequeData.bankId}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:outline-none ${
                              errors.bankId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                          >
                            <option value="">Select Bank Account</option>
                            {bankAccounts.map((bank) => (
                              <option key={bank.id} value={bank.id}>
                                {bank.bankName} - {bank.accountNumber} ({bank.accountName})
                              </option>
                            ))}
                          </select>
                        )}
                        <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.bankId && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankId}</p>
                      )}
                    </div>

                    {/* Auto-filled Bank Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={chequeData.bankName}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        name="branchName"
                        value={chequeData.branchName}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={chequeData.accountNumber}
                        readOnly
                        className={`w-full px-4 py-2 border rounded-lg bg-gray-50 ${
                          errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.accountNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={chequeData.ifscCode}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
                      />
                    </div>
                    
                    {/* Display selected bank details */}
                    {selectedBankData && (
                      <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                          <Landmark className="w-5 h-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-800">Selected Bank Account</h4>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Account Name:</span>
                            <span className="ml-2 font-medium">{selectedBankData.accountName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Current Balance:</span>
                            <span className="ml-2 font-medium text-green-600">
                              ₹{parseFloat(selectedBankData.currentBalance || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* For received cheques - manual bank entry */}
              {chequeData.chequeType === 'received' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Landmark className="w-6 h-6 mr-2 text-purple-600" />
                    Drawer Bank Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={chequeData.bankName}
                        onChange={handleChange}
                        placeholder="Enter drawer's bank name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={chequeData.accountNumber}
                        onChange={handleChange}
                        placeholder="Enter drawer's account number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4️⃣ DATES & STATUS */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-orange-600" />
                  Dates & Status
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Issued
                    </label>
                    <input
                      type="date"
                      name="dateIssued"
                      value={chequeData.dateIssued}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Presented
                    </label>
                    <input
                      type="date"
                      name="datePresented"
                      value={chequeData.datePresented}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Cleared
                    </label>
                    <input
                      type="date"
                      name="dateCleared"
                      value={chequeData.dateCleared}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 5️⃣ ADDITIONAL DETAILS */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Copy className="w-6 h-6 mr-2 text-red-600" />
                  Additional Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose / Category
                    </label>
                    <select
                      name="purpose"
                      value={chequeData.purpose}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select Purpose</option>
                      <option value="salary">Salary Payment</option>
                      <option value="vendor">Vendor Payment</option>
                      <option value="expense">Business Expense</option>
                      <option value="loan">Loan Payment</option>
                      <option value="investment">Investment</option>
                      <option value="tax">Tax Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="referenceNumber"
                      value={chequeData.referenceNumber}
                      onChange={handleChange}
                      placeholder="e.g., PO-2024-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Narration / Remarks
                    </label>
                    <textarea
                      name="narration"
                      value={chequeData.narration}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter any remarks"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TDS Deducted (%)
                    </label>
                    <input
                      type="number"
                      name="tdsDeducted"
                      value={chequeData.tdsDeducted}
                      onChange={handleChange}
                      placeholder="Enter TDS percentage"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TDS Amount (₹)
                    </label>
                    <input
                      type="text"
                      name="tdsAmount"
                      value={chequeData.tdsAmount}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {!printMode && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cheque Preview</h3>
            <div className="bg-white border-2 border-gray-300 rounded-xl p-8 shadow-inner">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-800 mb-4">Cheque Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cheque Number:</span>
                      <span className="font-semibold">{chequeData.chequeNumber || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{chequeData.chequeDate || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pay to:</span>
                      <span className="font-medium">{chequeData.payeeName || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-xl font-bold">
                        {chequeData.amount ? `₹${parseFloat(chequeData.amount).toLocaleString('en-IN')}` : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{chequeData.chequeType || '---'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-4">Bank Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span>{chequeData.bankName || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span>{chequeData.accountNumber || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC:</span>
                      <span>{chequeData.ifscCode || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Amount in Words Box */}
              {chequeData.amountInWords && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-sm mb-1">Amount in Words:</p>
                  <p className="font-medium">{chequeData.amountInWords}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cheque;


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { useCompany } from '../context/CompanyContext'; // Add this if not already present

// import {
//   ArrowLeft,
//   FileText,
//   Calendar,
//   IndianRupee,
//   CheckCircle,
//   Clock,
//   XCircle,
//   Save,
//   Printer,
//   Download,
//   User,
//   Copy,
//   Landmark,
//   Wallet,
//   ChevronDown,
//   Loader2
// } from 'lucide-react';

// const Cheque = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const { companyId } = useCompany(); // Get companyId from context
//   const [isEditMode, setIsEditMode] = useState(id && id !== 'new');
//   const [loading, setLoading] = useState(false);
//   const [printMode, setPrintMode] = useState(false);
//   const [bankAccounts, setBankAccounts] = useState([]);
//   const [loadingBanks, setLoadingBanks] = useState(false);
//   const [selectedBankData, setSelectedBankData] = useState(null);

//   const [chequeData, setChequeData] = useState({
//     // Basic Information
//     chequeNumber: '',
//     chequeDate: new Date().toISOString().split('T')[0],
//     chequeType: 'issued',
//     amount: '',
//     amountInWords: '',
    
//     // Payee/Drawer Details
//     payeeName: '',
//     payeeAddress: '',
//     payeeContact: '',
//     payeePAN: '',
    
//     // Bank Details
//     bankId: '',
//     bankName: '',
//     branchName: '',
//     accountNumber: '',
//     ifscCode: '',
    
//     // Dates
//     dateIssued: new Date().toISOString().split('T')[0],
//     datePresented: '',
//     dateCleared: '',
    
//     // Status
//     status: 'pending',
//     statusDate: '',
    
//     // Additional Details
//     purpose: '',
//     referenceNumber: '',
//     narration: '',
    
//     // Tax Information
//     tdsDeducted: '0',
//     tdsAmount: '0',
    
//     // Attachments
//     attachmentUrl: '',
//     chequeImage: ''
//   });

//   const [errors, setErrors] = useState({});

//   // Fetch bank accounts from API when companyId is available
//   useEffect(() => {
//     if (companyId) {
//       fetchBankAccounts();
//     }
//   }, [companyId]);

//   const fetchBankAccounts = async () => {
//     setLoadingBanks(true);
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
//       );
      
//       if (response.data.success) {
//         setBankAccounts(response.data.accounts || []);
//       } else {
//         console.error('Failed to fetch bank accounts:', response.data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching bank accounts:', error);
//     } finally {
//       setLoadingBanks(false);
//     }
//   };

//   // For edit/view mode, fetch cheque data
//   useEffect(() => {
//     if (id && id !== 'new') {
//       setLoading(true);
//       setTimeout(() => {
//         const sampleData = {
//           chequeNumber: '876543',
//           chequeDate: '2024-01-15',
//           chequeType: 'issued',
//           amount: '75000',
//           amountInWords: 'Seventy Five Thousand Only',
//           payeeName: 'ABC Suppliers Pvt Ltd',
//           payeeAddress: '123 Business Street, Mumbai - 400001',
//           payeeContact: '9876543210',
//           payeePAN: 'ABCDE1234F',
//           bankId: '1',
//           bankName: 'HDFC Bank',
//           branchName: 'Mumbai Main',
//           accountNumber: '123456789012',
//           ifscCode: 'HDFC0001234',
//           dateIssued: '2024-01-15',
//           datePresented: '2024-01-18',
//           dateCleared: '2024-01-20',
//           status: 'cleared',
//           statusDate: '2024-01-20',
//           purpose: 'Material purchase',
//           referenceNumber: 'PO-2024-001',
//           narration: 'Payment for January materials',
//           tdsDeducted: '10',
//           tdsAmount: '7500',
//           attachmentUrl: '',
//           chequeImage: ''
//         };
//         setChequeData(sampleData);
//         setLoading(false);
//       }, 1000);
//     }
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedChequeData = {
//       ...chequeData,
//       [name]: value
//     };

//     // If bank selection changes, auto-fill bank details
//     if (name === 'bankId' && value) {
//       const selectedBank = bankAccounts.find(bank => bank.id.toString() === value);
//       if (selectedBank) {
//         updatedChequeData.bankName = selectedBank.bankName || '';
//         updatedChequeData.branchName = selectedBank.branchName || '';
//         updatedChequeData.accountNumber = selectedBank.accountNumber || '';
//         updatedChequeData.ifscCode = selectedBank.ifscCode || '';
//         setSelectedBankData(selectedBank);
//       }
//     }

//     // Auto-calculate TDS amount
//     if (name === 'amount' || name === 'tdsDeducted') {
//       const amount = parseFloat(updatedChequeData.amount) || 0;
//       const tdsPercentage = parseFloat(updatedChequeData.tdsDeducted) || 0;
//       updatedChequeData.tdsAmount = ((amount * tdsPercentage) / 100).toFixed(2);
//     }

//     setChequeData(updatedChequeData);
    
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const handleAmountChange = (e) => {
//     const value = e.target.value;
//     setChequeData(prev => ({
//       ...prev,
//       amount: value
//     }));
    
//     // Convert amount to words
//     if (value && !isNaN(value)) {
//       const amountInWords = convertToWords(value);
//       setChequeData(prev => ({
//         ...prev,
//         amountInWords
//       }));
//     }
//   };

//   const convertToWords = (num) => {
//     const amount = parseFloat(num);
//     if (amount === 0) return 'Zero Only';
    
//     // Simple conversion - consider using a library like 'number-to-words' for production
//     return 'Rupees ' + amount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' Only';
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!chequeData.chequeNumber) newErrors.chequeNumber = 'Cheque number is required';
//     if (!chequeData.amount) newErrors.amount = 'Amount is required';
//     if (!chequeData.payeeName) newErrors.payeeName = 'Payee name is required';
    
//     // Only validate bank details for issued cheques
//     if (chequeData.chequeType === 'issued') {
//       if (!chequeData.bankId) newErrors.bankId = 'Bank selection is required';
//       if (!chequeData.accountNumber) newErrors.accountNumber = 'Account number is required';
//     }
    
//     return newErrors;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const validationErrors = validateForm();
    
//     if (Object.keys(validationErrors).length === 0) {
//       setLoading(true);
//       // Here you would make your API call to save the cheque
//       setTimeout(() => {
//         console.log('Cheque saved:', chequeData);
//         alert(`Cheque ${isEditMode ? 'updated' : 'created'} successfully!`);
//         navigate('/cheque-register');
//         setLoading(false);
//       }, 1500);
//     } else {
//       setErrors(validationErrors);
//     }
//   };

//   const handlePrintCheque = () => {
//     setPrintMode(true);
//     setTimeout(() => {
//       window.print();
//       setPrintMode(false);
//     }, 100);
//   };

//   const handleDownloadCheque = () => {
//     const dataStr = JSON.stringify(chequeData, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//     const exportFileDefaultName = `cheque-${chequeData.chequeNumber}.json`;
    
//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   const getStatusBadge = () => {
//     const statusConfig = {
//       cleared: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-5 h-5" /> },
//       pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-5 h-5" /> },
//       bounced: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-5 h-5" /> },
//       cancelled: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-5 h-5" /> }
//     };
    
//     const config = statusConfig[chequeData.status] || statusConfig.pending;
    
//     return (
//       <div className={`inline-flex items-center px-4 py-2 rounded-lg ${config.color}`}>
//         {config.icon}
//         <span className="ml-2 font-medium capitalize">{chequeData.status}</span>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <span className="ml-4 text-gray-600">Loading cheque details...</span>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${printMode ? 'bg-white' : 'bg-gray-50'} p-4 `}>
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         {!printMode && (
//           <div className="mb-8">
//             <button
//               onClick={() => navigate('/cheque-register')}
//               className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
//             >
//               <ArrowLeft className="w-5 h-5 mr-2" />
//               Back to Cheque Register
//             </button>
            
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-2 shadow-lg">
//               <div className="flex flex-col md:flex-row md:items-center justify-between">
//                 <div className="flex items-center mb-4 md:mb-0">
//                   <div className="bg-white/20 p-3 rounded-lg mr-4">
//                     <Wallet className="w-8 h-8 text-white" />
//                   </div>
//                   <div>
//                     <h1 className="text-2xl md:text-3xl font-bold text-white">
//                       {isEditMode ? 'Edit Cheque' : 'Create New Cheque'}
//                     </h1>
//                     <p className="text-blue-100 mt-1">
//                       {isEditMode ? `Cheque: ${chequeData.chequeNumber}` : 'Add cheque details'}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     onClick={handlePrintCheque}
//                     className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center"
//                   >
//                     <Printer className="w-5 h-5 mr-2" />
//                     Print Cheque
//                   </button>
//                   <button
//                     onClick={handleDownloadCheque}
//                     className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center"
//                   >
//                     <Download className="w-5 h-5 mr-2" />
//                     Download
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Cheque Form */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <form onSubmit={handleSubmit}>
//             {/* Status Bar */}
//             {!printMode && (
//               <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
//                 <div className="flex items-center space-x-4">
//                   {getStatusBadge()}
//                   <div className="text-sm text-gray-500">
//                     {isEditMode ? 'Last updated: Today' : 'New Cheque'}
//                   </div>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     type="button"
//                     onClick={() => navigate('/cheque-register')}
//                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <Save className="w-5 h-5 mr-2" />
//                         Save Cheque
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             <div className="p-6">
//               {/* 1️⃣ BASIC INFORMATION */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <FileText className="w-6 h-6 mr-2 text-blue-600" />
//                   Basic Information
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Cheque Type */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Cheque Type
//                     </label>
//                     <div className="flex space-x-4">
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="chequeType"
//                           value="issued"
//                           checked={chequeData.chequeType === 'issued'}
//                           onChange={handleChange}
//                           className="h-4 w-4 text-blue-600"
//                         />
//                         <span className="ml-2">Issued (Payment)</span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="chequeType"
//                           value="received"
//                           checked={chequeData.chequeType === 'received'}
//                           onChange={handleChange}
//                           className="h-4 w-4 text-blue-600"
//                         />
//                         <span className="ml-2">Received (Income)</span>
//                       </label>
//                     </div>
//                   </div>
                  
//                   {/* Cheque Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Cheque Number *
//                     </label>
//                     <input
//                       type="text"
//                       name="chequeNumber"
//                       value={chequeData.chequeNumber}
//                       onChange={handleChange}
//                       placeholder="Enter cheque number"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.chequeNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.chequeNumber && (
//                       <p className="mt-1 text-sm text-red-600">{errors.chequeNumber}</p>
//                     )}
//                   </div>
                  
//                   {/* Cheque Date */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Cheque Date
//                     </label>
//                     <input
//                       type="date"
//                       name="chequeDate"
//                       value={chequeData.chequeDate}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   {/* Amount */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Amount (₹) *
//                     </label>
//                     <input
//                       type="number"
//                       name="amount"
//                       value={chequeData.amount}
//                       onChange={handleAmountChange}
//                       placeholder="Enter amount"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.amount && (
//                       <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
//                     )}
//                   </div>
                  
//                   {/* Amount in Words */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Amount in Words
//                     </label>
//                     <input
//                       type="text"
//                       name="amountInWords"
//                       value={chequeData.amountInWords}
//                       onChange={handleChange}
//                       placeholder="Amount in words"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* 2️⃣ PAYEE/DRAWER DETAILS */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <User className="w-6 h-6 mr-2 text-green-600" />
//                   {chequeData.chequeType === 'issued' ? 'Payee Details' : 'Drawer Details'}
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       {chequeData.chequeType === 'issued' ? 'Payee Name' : 'Drawer Name'} *
//                     </label>
//                     <input
//                       type="text"
//                       name="payeeName"
//                       value={chequeData.payeeName}
//                       onChange={handleChange}
//                       placeholder="Enter name"
//                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
//                         errors.payeeName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                       }`}
//                     />
//                     {errors.payeeName && (
//                       <p className="mt-1 text-sm text-red-600">{errors.payeeName}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       PAN Number
//                     </label>
//                     <input
//                       type="text"
//                       name="payeePAN"
//                       value={chequeData.payeePAN}
//                       onChange={handleChange}
//                       placeholder="Enter PAN"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Address
//                     </label>
//                     <textarea
//                       name="payeeAddress"
//                       value={chequeData.payeeAddress}
//                       onChange={handleChange}
//                       rows="3"
//                       placeholder="Enter address"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Contact Number
//                     </label>
//                     <input
//                       type="tel"
//                       name="payeeContact"
//                       value={chequeData.payeeContact}
//                       onChange={handleChange}
//                       placeholder="Enter contact number"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* 3️⃣ BANK DETAILS - Only for issued cheques */}
//               {chequeData.chequeType === 'issued' && (
//                 <div className="mb-8">
//                   <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                     <Landmark className="w-6 h-6 mr-2 text-purple-600" />
//                     Bank Details
//                   </h2>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Bank Selection Dropdown */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Select Bank Account *
//                       </label>
//                       <div className="relative">
//                         {loadingBanks ? (
//                           <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
//                             <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-400" />
//                             <span className="text-gray-500">Loading banks...</span>
//                           </div>
//                         ) : bankAccounts.length === 0 ? (
//                           <div className="px-4 py-2 border border-gray-300 rounded-lg bg-yellow-50">
//                             <p className="text-yellow-700 text-sm">
//                               No bank accounts found. 
//                               <button
//                                 type="button"
//                                 onClick={() => navigate('/bank-activities')}
//                                 className="ml-1 text-blue-600 hover:underline"
//                               >
//                                 Add bank account first
//                               </button>
//                             </p>
//                           </div>
//                         ) : (
//                           <select
//                             name="bankId"
//                             value={chequeData.bankId}
//                             onChange={handleChange}
//                             className={`w-full px-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:outline-none ${
//                               errors.bankId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
//                             }`}
//                           >
//                             <option value="">Select Bank Account</option>
//                             {bankAccounts.map((bank) => (
//                               <option key={bank.id} value={bank.id}>
//                                 {bank.bankName} - {bank.accountNumber} ({bank.accountName})
//                               </option>
//                             ))}
//                           </select>
//                         )}
//                         <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
//                       </div>
//                       {errors.bankId && (
//                         <p className="mt-1 text-sm text-red-600">{errors.bankId}</p>
//                       )}
//                     </div>

//                     {/* Auto-filled Bank Details */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Bank Name
//                       </label>
//                       <input
//                         type="text"
//                         name="bankName"
//                         value={chequeData.bankName}
//                         readOnly
//                         className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Branch Name
//                       </label>
//                       <input
//                         type="text"
//                         name="branchName"
//                         value={chequeData.branchName}
//                         readOnly
//                         className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Account Number *
//                       </label>
//                       <input
//                         type="text"
//                         name="accountNumber"
//                         value={chequeData.accountNumber}
//                         readOnly
//                         className={`w-full px-4 py-2 border rounded-lg bg-gray-50 ${
//                           errors.accountNumber ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.accountNumber && (
//                         <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
//                       )}
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         IFSC Code
//                       </label>
//                       <input
//                         type="text"
//                         name="ifscCode"
//                         value={chequeData.ifscCode}
//                         readOnly
//                         className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
//                       />
//                     </div>
                    
//                     {/* Display selected bank details */}
//                     {selectedBankData && (
//                       <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                         <div className="flex items-center">
//                           <Landmark className="w-5 h-5 text-blue-600 mr-2" />
//                           <h4 className="font-medium text-blue-800">Selected Bank Account</h4>
//                         </div>
//                         <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
//                           <div>
//                             <span className="text-gray-600">Account Name:</span>
//                             <span className="ml-2 font-medium">{selectedBankData.accountName}</span>
//                           </div>
//                           <div>
//                             <span className="text-gray-600">Current Balance:</span>
//                             <span className="ml-2 font-medium text-green-600">
//                               ₹{parseFloat(selectedBankData.currentBalance || 0).toLocaleString('en-IN')}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* For received cheques - manual bank entry */}
//               {chequeData.chequeType === 'received' && (
//                 <div className="mb-8">
//                   <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                     <Landmark className="w-6 h-6 mr-2 text-purple-600" />
//                     Drawer Bank Details
//                   </h2>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Bank Name
//                       </label>
//                       <input
//                         type="text"
//                         name="bankName"
//                         value={chequeData.bankName}
//                         onChange={handleChange}
//                         placeholder="Enter drawer's bank name"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Account Number
//                       </label>
//                       <input
//                         type="text"
//                         name="accountNumber"
//                         value={chequeData.accountNumber}
//                         onChange={handleChange}
//                         placeholder="Enter drawer's account number"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* 4️⃣ DATES & STATUS */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Calendar className="w-6 h-6 mr-2 text-orange-600" />
//                   Dates & Status
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Date Issued
//                     </label>
//                     <input
//                       type="date"
//                       name="dateIssued"
//                       value={chequeData.dateIssued}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Date Presented
//                     </label>
//                     <input
//                       type="date"
//                       name="datePresented"
//                       value={chequeData.datePresented}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <select
//                       name="status"
//                       value={chequeData.status}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="cleared">Cleared</option>
//                       <option value="bounced">Bounced</option>
//                       <option value="cancelled">Cancelled</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* 5️⃣ ADDITIONAL DETAILS */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Copy className="w-6 h-6 mr-2 text-red-600" />
//                   Additional Details
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Purpose / Category
//                     </label>
//                     <select
//                       name="purpose"
//                       value={chequeData.purpose}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     >
//                       <option value="">Select Purpose</option>
//                       <option value="salary">Salary Payment</option>
//                       <option value="vendor">Vendor Payment</option>
//                       <option value="expense">Business Expense</option>
//                       <option value="loan">Loan Payment</option>
//                       <option value="investment">Investment</option>
//                       <option value="tax">Tax Payment</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Reference Number
//                     </label>
//                     <input
//                       type="text"
//                       name="referenceNumber"
//                       value={chequeData.referenceNumber}
//                       onChange={handleChange}
//                       placeholder="e.g., PO-2024-001"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Narration / Remarks
//                     </label>
//                     <textarea
//                       name="narration"
//                       value={chequeData.narration}
//                       onChange={handleChange}
//                       rows="3"
//                       placeholder="Enter any remarks"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       TDS Deducted (%)
//                     </label>
//                     <input
//                       type="number"
//                       name="tdsDeducted"
//                       value={chequeData.tdsDeducted}
//                       onChange={handleChange}
//                       placeholder="Enter TDS percentage"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       TDS Amount (₹)
//                     </label>
//                     <input
//                       type="text"
//                       name="tdsAmount"
//                       value={chequeData.tdsAmount}
//                       readOnly
//                       className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Preview Section */}
//         {!printMode && (
//           <div className="mt-8">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Cheque Preview</h3>
//             <div className="bg-white border-2 border-gray-300 rounded-xl p-8 shadow-inner">
//               <div className="grid grid-cols-2 gap-8">
//                 <div>
//                   <h4 className="font-bold text-gray-800 mb-4">Cheque Details</h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Cheque Number:</span>
//                       <span className="font-semibold">{chequeData.chequeNumber || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Date:</span>
//                       <span>{chequeData.chequeDate || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Pay to:</span>
//                       <span className="font-medium">{chequeData.payeeName || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Amount:</span>
//                       <span className="text-xl font-bold">
//                         {chequeData.amount ? `₹${parseFloat(chequeData.amount).toLocaleString('en-IN')}` : '---'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h4 className="font-bold text-gray-800 mb-4">Bank Details</h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Bank:</span>
//                       <span>{chequeData.bankName || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Account:</span>
//                       <span>{chequeData.accountNumber || '---'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Status:</span>
//                       {getStatusBadge()}
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Amount in Words Box */}
//               {chequeData.amountInWords && (
//                 <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                   <p className="text-gray-600 text-sm mb-1">Amount in Words:</p>
//                   <p className="font-medium">{chequeData.amountInWords}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Cheque;
