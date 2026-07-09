// import React, { useState } from 'react';
// import {
//   HiSearch,
//   HiDownload,
//   HiPrinter,
//   HiRefresh,
//   HiFilter,
//   HiDocumentAdd,
//   HiEye,
//   HiCheckCircle,
//   HiExclamationCircle,
//   HiCalculator,
//   HiCash,
//   HiReceiptRefund,
//   HiPlus,
//   HiOutlineXCircle
// } from 'react-icons/hi';
// import { BiChevronDown, BiChevronUp, BiData, BiReceipt } from 'react-icons/bi';
// import { FaFileExcel, FaFilePdf, FaRupeeSign } from 'react-icons/fa';
// import { MdCompareArrows, MdGridView, MdAttachMoney } from 'react-icons/md';

// const ChallanReconcilation = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('October 2023');
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [showAddChallan, setShowAddChallan] = useState(false);
//   const [filters, setFilters] = useState({
//     status: 'all',
//     paymentType: 'all',
//     amountRange: 'all'
//   });

//   // Sample Challan Data
//   const challanData = {
//     summary: {
//       totalChallans: 18,
//       totalAmount: '₹8,45,620',
//       matchedChallans: 15,
//       pendingReconciliation: 3,
//       unmatchedAmount: '₹52,180',
//       matchedPercentage: 83
//     },
//     challans: [
//       {
//         id: 'CH-2023-001',
//         cpn: 'CPN240820230001',
//         paymentDate: '2023-10-05',
//         paymentMode: 'Net Banking',
//         amount: '₹1,25,000',
//         taxPeriod: 'Oct-2023',
//         returnType: 'GSTR-3B',
//         status: 'Matched',
//         bankName: 'HDFC Bank',
//         referenceNo: 'NB20231005123456',
//         transactionId: 'TXN00120231005123456',
//         reconciliationStatus: 'Fully Matched',
//         gstin: '27AABCU9603R1ZX',
//         remarks: 'Auto-matched with GSTR-3B',
//         section: 'Tax Payment'
//       },
//     ]
//   };

//   const tabs = [
//     { id: 'all-challans', label: 'All Challans', icon: <BiReceipt /> },
//     { id: 'add-challan', label: 'Add Challan', icon: <HiDocumentAdd /> },
//   ];

//   const months = [
//     'April 2023', 'May 2023', 'June 2023', 'July 2023',
//     'August 2023', 'September 2023', 'October 2023',
//     'November 2023', 'December 2023', 'January 2024',
//     'February 2024', 'March 2024'
//   ];

//   const paymentModes = [
//     'Net Banking', 'Credit Card', 'Debit Card', 'UPI',
//     'NEFT/RTGS', 'Cheque', 'Cash', 'Others'
//   ];

//   const returnTypes = [
//     'GSTR-3B', 'GSTR-1', 'GSTR-4', 'GSTR-9',
//     'GSTR-9C', 'TDS/TCS', 'Interest', 'Penalty'
//   ];

//   const toggleRow = (id) => {
//     setExpandedRows(prev =>
//       prev.includes(id)
//         ? prev.filter(rowId => rowId !== id)
//         : [...prev, id]
//     );
//   };

//   const handleExport = (type) => {
//     alert(`Exporting challan data as ${type.toUpperCase()}...`);
//   };

//   const handlePrint = () => {
//     const printContent = document.getElementById('print-section');
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Challan Reconciliation Report - ${selectedMonth}</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; }
//             h1 { color: #1e40af; }
//             table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #f8fafc; }
//             .header { margin-bottom: 30px; }
//             .summary-box { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ccc; }
//             .matched { background-color: #d1fae5; }
//             .unmatched { background-color: #fee2e2; }
//             .pending { background-color: #fef3c7; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h1>Challan Reconciliation Report</h1>
//             <p><strong>Period:</strong> ${selectedMonth}</p>
//             <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
//           </div>
//           ${printContent.innerHTML}
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const handleMatchChallan = (challanId) => {
//     alert(`Matching challan ${challanId}...`);
//   };

//   const handleViewDetails = (challanId) => {
//     alert(`Viewing details for challan ${challanId}...`);
//   };

//   const handleAddChallan = () => {
//     setShowAddChallan(true);
//   };

//   const renderDashboard = () => {
//     return (
//       <div className="space-y-6">
//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-blue-700">Total Challans</p>
//                 <p className="text-3xl font-bold text-blue-800 mt-2">
//                   {challanData.summary.totalChallans}
//                 </p>
//               </div>
//               <BiReceipt className="w-10 h-10 text-blue-600 opacity-80" />
//             </div>
//             <div className="mt-4 pt-4 border-t border-blue-200">
//               <div className="flex justify-between text-sm">
//                 <span className="text-blue-600">Amount</span>
//                 <span className="font-semibold text-blue-800">{challanData.summary.totalAmount}</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-700">Matched Challans</p>
//                 <p className="text-3xl font-bold text-green-800 mt-2">
//                   {challanData.summary.matchedChallans}
//                 </p>
//               </div>
//               <HiCheckCircle className="w-10 h-10 text-green-600 opacity-80" />
//             </div>
//             <div className="mt-4 pt-4 border-t border-green-200">
//               <div className="flex justify-between text-sm">
//                 <span className="text-green-600">Match %</span>
//                 <span className="font-semibold text-green-800">{challanData.summary.matchedPercentage}%</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-amber-700">Pending Reconciliation</p>
//                 <p className="text-3xl font-bold text-amber-800 mt-2">
//                   {challanData.summary.pendingReconciliation}
//                 </p>
//               </div>
//               <HiExclamationCircle className="w-10 h-10 text-amber-600 opacity-80" />
//             </div>
//             <div className="mt-4 pt-4 border-t border-amber-200">
//               <div className="flex justify-between text-sm">
//                 <span className="text-amber-600">Requires Action</span>
//                 <span className="font-semibold text-amber-800">3 Challans</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-red-700">Unmatched Amount</p>
//                 <p className="text-3xl font-bold text-red-800 mt-2">
//                   {challanData.summary.unmatchedAmount}
//                 </p>
//               </div>
//               <HiCalculator className="w-10 h-10 text-red-600 opacity-80" />
//             </div>
//             <div className="mt-4 pt-4 border-t border-red-200">
//               <div className="flex justify-between text-sm">
//                 <span className="text-red-600">Discrepancy</span>
//                 <span className="font-semibold text-red-800">{challanData.summary.unmatchedAmount}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Challans */}
//         <div className="bg-white border border-gray-200 rounded-lg p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800">Recent Challans</h3>
//               <p className="text-gray-600 text-sm mt-1">Latest tax payment challans</p>
//             </div>
//             <button
//               onClick={() => setActiveTab('all-challans')}
//               className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//             >
//               View All →
//             </button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPN</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Type</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {challanData.challans.slice(0, 3).map((challan) => (
//                   <tr key={challan.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">{challan.cpn}</div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{challan.paymentDate}</div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <div className="text-sm font-semibold text-gray-900">{challan.amount}</div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{challan.returnType}</div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         challan.status === 'Matched'
//                           ? 'bg-green-100 text-green-800'
//                           : challan.status === 'Pending'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {challan.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm">
//                       <button
//                         onClick={() => handleViewDetails(challan.id)}
//                         className="text-blue-600 hover:text-blue-900 mr-3"
//                       >
//                         View
//                       </button>
//                       {challan.status !== 'Matched' && (
//                         <button
//                           onClick={() => handleMatchChallan(challan.id)}
//                           className="text-green-600 hover:text-green-900"
//                         >
//                           Match
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <button
//               onClick={() => setActiveTab('add-challan')}
//               className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
//             >
//               <HiDocumentAdd className="w-8 h-8 text-blue-600 mb-2" />
//               <span className="text-sm font-medium">Add Challan</span>
//             </button>
//             <button
//               onClick={() => handleExport('excel')}
//               className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
//             >
//               <FaFileExcel className="w-8 h-8 text-green-600 mb-2" />
//               <span className="text-sm font-medium">Export to Excel</span>
//             </button>
//             <button
//               onClick={handlePrint}
//               className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
//             >
//               <HiPrinter className="w-8 h-8 text-gray-600 mb-2" />
//               <span className="text-sm font-medium">Print Report</span>
//             </button>
//             <button
//               onClick={() => setActiveTab('unmatched')}
//               className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
//             >
//               <MdCompareArrows className="w-8 h-8 text-red-600 mb-2" />
//               <span className="text-sm font-medium">Reconcile Now</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderAllChallans = () => {
//     return (
//       <div className="space-y-6">
//         {/* Search and Filter Bar */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
//           <div className="relative w-full md:w-96">
//             <HiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by CPN, reference no, bank..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="flex space-x-2">
//               <select
//                 value={filters.status}
//                 onChange={(e) => setFilters({...filters, status: e.target.value})}
//                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//               >
//                 <option value="all">All Status</option>
//                 <option value="matched">Matched</option>
//                 <option value="pending">Pending</option>
//                 <option value="unmatched">Unmatched</option>
//               </select>
//               <select
//                 value={filters.paymentType}
//                 onChange={(e) => setFilters({...filters, paymentType: e.target.value})}
//                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//               >
//                 <option value="all">All Payment Modes</option>
//                 {paymentModes.map(mode => (
//                   <option key={mode} value={mode.toLowerCase()}>{mode}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => handleExport('pdf')}
//                 className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
//               >
//                 <FaFilePdf className="w-4 h-4 text-red-600" />
//                 <span className="text-sm">PDF</span>
//               </button>
//               <button
//                 onClick={() => handleExport('excel')}
//                 className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
//               >
//                 <FaFileExcel className="w-4 h-4 text-green-600" />
//                 <span className="text-sm">Excel</span>
//               </button>
//               <button
//                 onClick={handlePrint}
//                 className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
//               >
//                 <HiPrinter className="w-4 h-4" />
//                 <span className="text-sm">Print</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Challans Table */}
//         <div className="overflow-x-auto border border-gray-200 rounded-lg">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Challan Details
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Payment Info
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Amount & Period
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {challanData.challans.map((challan) => (
//                 <React.Fragment key={challan.id}>
//                   <tr className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <button
//                           onClick={() => toggleRow(challan.id)}
//                           className="mr-3 text-gray-400 hover:text-gray-600"
//                         >
//                           {expandedRows.includes(challan.id) ?
//                             <BiChevronUp className="w-5 h-5" /> :
//                             <BiChevronDown className="w-5 h-5" />
//                           }
//                         </button>
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {challan.cpn}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {challan.paymentDate}
//                           </div>
//                           <div className="text-xs text-gray-400 mt-1">
//                             Section: {challan.section}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">{challan.paymentMode}</div>
//                       <div className="text-sm text-gray-500">{challan.bankName}</div>
//                       <div className="text-xs text-gray-400 mt-1">
//                         Ref: {challan.referenceNo}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-2xl font-bold text-gray-900">{challan.amount}</div>
//                       <div className="text-sm text-gray-500">{challan.taxPeriod}</div>
//                       <div className="text-sm text-gray-500">{challan.returnType}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="space-y-1">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           challan.status === 'Matched'
//                             ? 'bg-green-100 text-green-800'
//                             : challan.status === 'Pending'
//                             ? 'bg-yellow-100 text-yellow-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {challan.status}
//                         </span>
//                         <div className="text-xs text-gray-500">{challan.reconciliationStatus}</div>
//                         <div className="text-xs">{challan.remarks}</div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleMatchChallan(challan.id)}
//                           className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50"
//                           title="Reconcile"
//                         >
//                           Reconcile
//                         </button>
//                         {challan.status === 'Matched' && (
//                           <button
//                             onClick={() => handleViewDetails(challan.id)}
//                             className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-200 rounded hover:bg-green-50"
//                             title="View Details"
//                           >
//                             Details
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                   {expandedRows.includes(challan.id) && (
//                     <tr>
//                       <td colSpan="5" className="px-6 py-4 bg-blue-50">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                           <div>
//                             <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Details</h4>
//                             <dl className="space-y-1 text-sm">
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Transaction ID:</dt>
//                                 <dd className="font-medium">{challan.transactionId}</dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Bank Name:</dt>
//                                 <dd className="font-medium">{challan.bankName}</dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Payment Mode:</dt>
//                                 <dd className="font-medium">{challan.paymentMode}</dd>
//                               </div>
//                             </dl>
//                           </div>
//                           <div>
//                             <h4 className="text-sm font-semibold text-gray-700 mb-2">Tax Details</h4>
//                             <dl className="space-y-1 text-sm">
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">GSTIN:</dt>
//                                 <dd className="font-medium">{challan.gstin}</dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Tax Period:</dt>
//                                 <dd className="font-medium">{challan.taxPeriod}</dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Return Type:</dt>
//                                 <dd className="font-medium">{challan.returnType}</dd>
//                               </div>
//                             </dl>
//                           </div>
//                           <div>
//                             <h4 className="text-sm font-semibold text-gray-700 mb-2">Reconciliation</h4>
//                             <dl className="space-y-1 text-sm">
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Status:</dt>
//                                 <dd className={`font-medium ${
//                                   challan.reconciliationStatus === 'Fully Matched' 
//                                     ? 'text-green-600' 
//                                     : challan.reconciliationStatus === 'Partial Match'
//                                     ? 'text-yellow-600'
//                                     : 'text-red-600'
//                                 }`}>
//                                   {challan.reconciliationStatus}
//                                 </dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Amount:</dt>
//                                 <dd className="font-medium">{challan.amount}</dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Section:</dt>
//                                 <dd className="font-medium">{challan.section}</dd>
//                               </div>
//                             </dl>
//                           </div>
//                           <div>
//                             <h4 className="text-sm font-semibold text-gray-700 mb-2">Actions</h4>
//                             <div className="space-y-2">
//                               <div className="flex items-center space-x-2">
//                                 <div className={`w-3 h-3 rounded-full ${
//                                   challan.reconciliationStatus === 'Fully Matched'
//                                     ? 'bg-green-500'
//                                     : challan.reconciliationStatus === 'Partial Match'
//                                     ? 'bg-yellow-500'
//                                     : 'bg-red-500'
//                                 }`} />
//                                 <span className="text-sm">{challan.reconciliationStatus}</span>
//                               </div>
//                               <div className="space-y-1">
//                                 <button className="w-full text-xs text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded">
//                                   Download Challan Copy
//                                 </button>
//                                 <button className="w-full text-xs text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-200 rounded">
//                                   View Matching Return
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   const renderAddChallan = () => {
//     return (
//       <div className="bg-white border border-gray-200 rounded-lg p-6">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h3 className="text-xl font-bold text-gray-800">Add New Challan</h3>
//             <p className="text-gray-600">Manually add tax payment challan for reconciliation</p>
//           </div>
//           <button
//             onClick={handleAddChallan}
//             className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//           >
//             <HiPlus className="w-4 h-4" />
//             <span>Add Challan</span>
//           </button>
//         </div>

//         <form className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Challan Payment Number (CPN) *
//               </label>
//               <input
//                 type="text"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="CPN240820230001"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Payment Date *
//               </label>
//               <input
//                 type="date"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Payment Mode *
//               </label>
//               <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option value="">Select Payment Mode</option>
//                 {paymentModes.map(mode => (
//                   <option key={mode} value={mode}>{mode}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Amount (₹) *
//               </label>
//               <input
//                 type="number"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="10000"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tax Period *
//               </label>
//               <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option value="">Select Tax Period</option>
//                 {months.map(month => (
//                   <option key={month} value={month}>{month}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Return Type *
//               </label>
//               <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option value="">Select Return Type</option>
//                 {returnTypes.map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Bank Name
//               </label>
//               <input
//                 type="text"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="HDFC Bank"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Reference Number
//               </label>
//               <input
//                 type="text"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="NB20231005123456"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Transaction ID
//               </label>
//               <input
//                 type="text"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="TXN00120231005123456"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Remarks (Optional)
//             </label>
//             <textarea
//               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               rows="3"
//               placeholder="Add any remarks about this challan..."
//             />
//           </div>
//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               Clear Form
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 alert('Challan added successfully!');
//               }}
//               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
//             >
//               Add Challan
//             </button>
//           </div>
//         </form>
//       </div>
//     );
//   };

//   const renderMatchedChallans = () => {
//     const matched = challanData.challans.filter(c => c.status === 'Matched');
//     return (
//       <div className="space-y-6">
//         <div className="bg-green-50 border border-green-200 rounded-lg p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800">Matched Challans</h3>
//               <p className="text-gray-600">Successfully reconciled tax payments</p>
//             </div>
//             <div className="text-right">
//               <div className="text-2xl font-bold text-green-700">{matched.length} Challans</div>
//               <div className="text-sm text-gray-600">Total: ₹{matched.reduce((sum, c) => sum + parseFloat(c.amount.replace('₹', '').replace(',', '')), 0).toLocaleString()}</div>
//             </div>
//           </div>
//         </div>
//         {/* Render matched challans table similar to all challans */}
//       </div>
//     );
//   };

//   const renderUnmatchedChallans = () => {
//     const unmatched = challanData.challans.filter(c => c.status !== 'Matched');
//     return (
//       <div className="space-y-6">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800">Unmatched Challans</h3>
//               <p className="text-gray-600">Requires reconciliation with returns</p>
//             </div>
//             <div className="text-right">
//               <div className="text-2xl font-bold text-red-700">{unmatched.length} Challans</div>
//               <div className="text-sm text-gray-600">Total: ₹{unmatched.reduce((sum, c) => sum + parseFloat(c.amount.replace('₹', '').replace(',', '')), 0).toLocaleString()}</div>
//             </div>
//           </div>
//         </div>
//         {/* Render unmatched challans table similar to all challans */}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800 flex items-center">
//               <MdAttachMoney className="mr-3 text-purple-600" />
//               Challan Reconciliation
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Match tax payment challans with GST returns for accurate ITC claims
//             </p>
//             <div className="flex items-center space-x-4 mt-3">
//               <span className="text-sm text-gray-500">
//                 Last Updated: 15th Nov 2023 | GSTIN: 27AABCU9603R1ZX
//               </span>
//               <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
//                 Auto-reconciliation enabled
//               </span>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="appearance-none bg-white border border-purple-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 {months.map(month => (
//                   <option key={month} value={month}>{month}</option>
//                 ))}
//               </select>
//               <BiChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
//             </div>
//             <button
//               onClick={() => alert('Refreshing challan data...')}
//               className="flex items-center space-x-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 px-4 py-2 rounded-lg"
//             >
//               <HiRefresh className="w-5 h-5" />
//               <span>Refresh</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tabs Navigation */}
//       <div className="bg-white rounded-lg border border-gray-200">
//         <div className="border-b border-gray-200">
//           <nav className="flex overflow-x-auto">
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 flex-shrink-0 px-6 py-3 border-b-2 font-medium text-sm ${
//                   activeTab === tab.id
//                     ? 'border-purple-500 text-purple-600 bg-purple-50'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <span className="text-lg">{tab.icon}</span>
//                 <span>{tab.label}</span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Tab Content */}
//         <div className="p-6" id="print-section">
//           {activeTab === 'dashboard' ? renderDashboard() :
//            activeTab === 'all-challans' ? renderAllChallans() :
//            activeTab === 'matched' ? renderMatchedChallans() :
//            activeTab === 'unmatched' ? renderUnmatchedChallans() :
//            activeTab === 'add-challan' ? renderAddChallan() :
//            <div className="text-center py-12">
//              <HiDownload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//              <h3 className="text-xl font-bold text-gray-800 mb-2">Reports Section</h3>
//              <p className="text-gray-600 mb-6">Generate detailed reconciliation reports</p>
//              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
//                Generate Report
//              </button>
//            </div>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChallanReconcilation;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Download,
  Printer,
  RefreshCw,
  Filter,
  FilePlus,
  Eye,
  CheckCircle,
  AlertCircle,
  Calculator,
  Plus,
  X,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Receipt,
  IndianRupee,
  Banknote,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useCompany } from "../context/CompanyContext";

const ChallanReconciliation = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('October 2023');
  const [expandedRows, setExpandedRows] = useState([]);
  const [showAddChallan, setShowAddChallan] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    payment_mode: 'all',
    amountRange: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalChallans: 0,
    totalAmount: 0,
    matchedChallans: 0,
    pendingReconciliation: 0,
    unmatchedAmount: 0,
    matchedPercentage: 0
  });
  const [challans, setChallans] = useState([]);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileData, setReconcileData] = useState({
    status: '',
    reconciliation_status: '',
    remarks: ''
  });

  const { companyId } = useCompany();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FileText className="w-4 h-4" /> },
    { id: 'all-challans', label: 'All Challans', icon: <Receipt className="w-4 h-4" /> },
    { id: 'add-challan', label: 'Add Challan', icon: <FilePlus className="w-4 h-4" /> },
  ];

  const months = [
    'April 2023', 'May 2023', 'June 2023', 'July 2023',
    'August 2023', 'September 2023', 'October 2023',
    'November 2023', 'December 2023', 'January 2024',
    'February 2024', 'March 2024'
  ];

  const paymentModes = [
    { id: 'net_banking', label: 'Net Banking', icon: <Landmark className="w-4 h-4" /> },
    { id: 'credit_card', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'debit_card', label: 'Debit Card', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'neft_rtgs', label: 'NEFT/RTGS', icon: <Banknote className="w-4 h-4" /> },
    { id: 'cheque', label: 'Cheque', icon: <Wallet className="w-4 h-4" /> },
    { id: 'cash', label: 'Cash', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'others', label: 'Others', icon: <Wallet className="w-4 h-4" /> }
  ];

  const returnTypes = [
    'GSTR-3B', 'GSTR-1', 'GSTR-4', 'GSTR-9',
    'GSTR-9C', 'TDS/TCS', 'Interest', 'Penalty'
  ];

  const statusOptions = [
    { id: 'Matched', label: 'Matched', color: 'bg-green-100 text-green-800' },
    { id: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'Unmatched', label: 'Unmatched', color: 'bg-red-100 text-red-800' }
  ];

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/challans/${companyId}/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch all challans
  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.payment_mode !== 'all') params.payment_mode = filters.payment_mode;
      if (searchTerm) params.q = searchTerm;

      const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/challans/${companyId}`, { params });
      setChallans(response.data);
    } catch (error) {
      console.error('Error fetching challans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single challan
  const fetchChallanById = async (id) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/challans/${companyId}/${id}`);
      setSelectedChallan(response.data);
    } catch (error) {
      console.error('Error fetching challan:', error);
    }
  };

  // Add new challan
  const handleAddChallan = async (formData) => {
    try {
      await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/challans/${companyId}`, formData);
      alert('Challan added successfully!');
      setShowAddChallan(false);
      fetchChallans();
      fetchSummary();
    } catch (error) {
      console.error('Error adding challan:', error);
      alert('Failed to add challan');
    }
  };

  // Reconcile challan
  const handleReconcileChallan = async () => {
    if (!selectedChallan) return;

    try {
      await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/challans/${companyId}/${selectedChallan.id}/reconcile`, reconcileData);
      alert('Challan reconciled successfully!');
      setShowReconcileModal(false);
      fetchChallans();
      fetchSummary();
    } catch (error) {
      console.error('Error reconciling challan:', error);
      alert('Failed to reconcile challan');
    }
  };

  // Delete challan
  const handleDeleteChallan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this challan?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/challans/${id}`);
      alert('Challan deleted successfully!');
      fetchChallans();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting challan:', error);
      alert('Failed to delete challan');
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchChallans();
  }, [filters, searchTerm]);

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleExport = (type) => {
    if (type === 'excel') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + [
          ['Challan ID', 'CPN', 'Payment Date', 'Amount', 'Payment Mode', 'Status', 'Return Type', 'Tax Period'],
          ...challans.map(challan => [
            challan.id,
            challan.cpn,
            formatDate(challan.payment_date),
            challan.amount,
            challan.payment_mode,
            challan.status,
            challan.return_type,
            challan.tax_period
          ])
        ].map(row => row.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `challans_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
    } else {
      alert(`Exporting challan data as ${type.toUpperCase()}...`);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-section');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Challan Reconciliation Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Challan Reconciliation Report</h1>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Challans:</strong> ${summary.totalChallans}</p>
            <p><strong>Matched Percentage:</strong> ${summary.matchedPercentage}%</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Challans</p>
                <p className="text-3xl font-bold text-blue-800 mt-2">
                  {summary.totalChallans}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-blue-600 opacity-80" />
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Amount</span>
                <span className="font-semibold text-blue-800">{formatCurrency(summary.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Matched Challans</p>
                <p className="text-3xl font-bold text-green-800 mt-2">
                  {summary.matchedChallans}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-80" />
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Match %</span>
                <span className="font-semibold text-green-800">{summary.matchedPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Pending Reconciliation</p>
                <p className="text-3xl font-bold text-amber-800 mt-2">
                  {summary.pendingReconciliation}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-amber-600 opacity-80" />
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <div className="flex justify-between text-sm">
                <span className="text-amber-600">Requires Action</span>
                <span className="font-semibold text-amber-800">{summary.pendingReconciliation} Challans</span>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Unmatched Amount</p>
                <p className="text-3xl font-bold text-red-800 mt-2">
                  {formatCurrency(summary.unmatchedAmount)}
                </p>
              </div>
              <Calculator className="w-10 h-10 text-red-600 opacity-80" />
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Discrepancy</span>
                <span className="font-semibold text-red-800">{formatCurrency(summary.unmatchedAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Challans */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Challans</h3>
              <p className="text-gray-600 text-sm mt-1">Latest tax payment challans</p>
            </div>
            <button
              onClick={() => setActiveTab('all-challans')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challans.slice(0, 3).map((challan) => (
                  <tr key={challan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{challan.cpn}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(challan.payment_date)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(challan.amount)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{challan.return_type}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        challan.status === 'Matched'
                          ? 'bg-green-100 text-green-800'
                          : challan.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {challan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          fetchChallanById(challan.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {challan.status !== 'Matched' && (
                        <button
                          onClick={() => {
                            setSelectedChallan(challan);
                            setShowReconcileModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('add-challan')}
              className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
            >
              <FilePlus className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Add Challan</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
            >
              <Download className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Export to Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
            >
              <Printer className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium">Print Report</span>
            </button>
            <button
              onClick={() => fetchChallans()}
              className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-4"
            >
              <RefreshCw className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Refresh Data</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAllChallans = () => {
    return (
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by CPN, reference no, bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Matched">Matched</option>
                <option value="Pending">Pending</option>
                <option value="Unmatched">Unmatched</option>
              </select>
              <select
                value={filters.payment_mode}
                onChange={(e) => setFilters({...filters, payment_mode: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Payment Modes</option>
                {paymentModes.map(mode => (
                  <option key={mode.id} value={mode.id}>{mode.label}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span className="text-sm">PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 text-green-600" />
                <span className="text-sm">Excel</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm">Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          /* Challans Table */
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challan Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount & Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challans.map((challan) => (
                  <React.Fragment key={challan.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleRow(challan.id)}
                            className="mr-3 text-gray-400 hover:text-gray-600"
                          >
                            {expandedRows.includes(challan.id) ?
                              <ChevronUp className="w-5 h-5" /> :
                              <ChevronDown className="w-5 h-5" />
                            }
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {challan.cpn}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(challan.payment_date)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Section: {challan.section || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {paymentModes.find(m => m.id === challan.payment_mode)?.label || challan.payment_mode}
                        </div>
                        <div className="text-sm text-gray-500">{challan.bank_name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Ref: {challan.reference_no}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(challan.amount)}</div>
                        <div className="text-sm text-gray-500">{challan.tax_period}</div>
                        <div className="text-sm text-gray-500">{challan.return_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            challan.status === 'Matched'
                              ? 'bg-green-100 text-green-800'
                              : challan.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {challan.status}
                          </span>
                          <div className="text-xs text-gray-500">{challan.reconciliation_status}</div>
                          <div className="text-xs">{challan.remarks}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedChallan(challan);
                              setShowReconcileModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50"
                            title="Reconcile"
                          >
                            Reconcile
                          </button>
                          {challan.status === 'Matched' && (
                            <button
                              onClick={() => fetchChallanById(challan.id)}
                              className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-200 rounded hover:bg-green-50"
                              title="View Details"
                            >
                              Details
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteChallan(challan.id)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.includes(challan.id) && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-blue-50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Details</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Transaction ID:</dt>
                                  <dd className="font-medium">{challan.transaction_id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Bank Name:</dt>
                                  <dd className="font-medium">{challan.bank_name}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Payment Mode:</dt>
                                  <dd className="font-medium">{challan.payment_mode}</dd>
                                </div>
                              </dl>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tax Details</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">GSTIN:</dt>
                                  <dd className="font-medium">{challan.gstin}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Tax Period:</dt>
                                  <dd className="font-medium">{challan.tax_period}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Return Type:</dt>
                                  <dd className="font-medium">{challan.return_type}</dd>
                                </div>
                              </dl>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Reconciliation</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Status:</dt>
                                  <dd className={`font-medium ${
                                    challan.reconciliation_status === 'Fully Matched' 
                                      ? 'text-green-600' 
                                      : challan.reconciliation_status === 'Partial Match'
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`}>
                                    {challan.reconciliation_status}
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Amount:</dt>
                                  <dd className="font-medium">{formatCurrency(challan.amount)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Section:</dt>
                                  <dd className="font-medium">{challan.section || 'N/A'}</dd>
                                </div>
                              </dl>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Actions</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    challan.reconciliation_status === 'Fully Matched'
                                      ? 'bg-green-500'
                                      : challan.reconciliation_status === 'Partial Match'
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`} />
                                  <span className="text-sm">{challan.reconciliation_status}</span>
                                </div>
                                <div className="space-y-1">
                                  <button 
                                    onClick={() => handleExport('excel')}
                                    className="w-full text-xs text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded"
                                  >
                                    Download Challan Copy
                                  </button>
                                  <button 
                                    onClick={() => fetchChallanById(challan.id)}
                                    className="w-full text-xs text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-200 rounded"
                                  >
                                    View Matching Return
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const AddChallanModal = () => {
    const [formData, setFormData] = useState({
      challan_no: '',
      cpn: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: '',
      bank_name: '',
      reference_no: '',
      transaction_id: '',
      amount: '',
      tax_period: '',
      return_type: '',
      section: '',
      gstin: '',
      remarks: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      await handleAddChallan(formData);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-cyan-50">
            <h2 className="text-2xl font-bold text-gray-800">Add New Challan</h2>
            <button
              onClick={() => setShowAddChallan(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challan Number *
                </label>
                <input
                  type="text"
                  name="challan_no"
                  required
                  value={formData.challan_no}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Enter challan number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPN (Challan Payment Number) *
                </label>
                <input
                  type="text"
                  name="cpn"
                  required
                  value={formData.cpn}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="CPN240820230001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="payment_date"
                  required
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode *
                </label>
                <select
                  name="payment_mode"
                  required
                  value={formData.payment_mode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select Payment Mode</option>
                  {paymentModes.map(mode => (
                    <option key={mode.id} value={mode.id}>{mode.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Period *
                </label>
                <input
                  type="text"
                  name="tax_period"
                  required
                  value={formData.tax_period}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Oct-2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Type *
                </label>
                <select
                  name="return_type"
                  required
                  value={formData.return_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select Return Type</option>
                  {returnTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="HDFC Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="reference_no"
                  value={formData.reference_no}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="NB20231005123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="TXN00120231005123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GSTIN
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="27AABCU9603R1ZX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Tax Payment"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows="3"
                placeholder="Add any remarks..."
              />
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddChallan(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add Challan
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ReconcileModal = () => {
    if (!selectedChallan) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-linear-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-bold text-gray-800">Reconcile Challan</h2>
            <button
              onClick={() => setShowReconcileModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Challan Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm"><strong>CPN:</strong> {selectedChallan.cpn}</p>
                <p className="text-sm"><strong>Amount:</strong> {formatCurrency(selectedChallan.amount)}</p>
                <p className="text-sm"><strong>Tax Period:</strong> {selectedChallan.tax_period}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={reconcileData.status}
                  onChange={(e) => setReconcileData({...reconcileData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select Status</option>
                  <option value="Matched">Matched</option>
                  <option value="Pending">Pending</option>
                  <option value="Unmatched">Unmatched</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reconciliation Status
                </label>
                <input
                  type="text"
                  value={reconcileData.reconciliation_status}
                  onChange={(e) => setReconcileData({...reconcileData, reconciliation_status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Fully Matched, Partial Match, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={reconcileData.remarks}
                  onChange={(e) => setReconcileData({...reconcileData, remarks: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows="3"
                  placeholder="Add reconciliation remarks..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowReconcileModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReconcileChallan}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Confirm Reconciliation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Receipt className="mr-3 text-purple-600" />
              Challan Reconciliation
            </h1>
            <p className="text-gray-600 mt-1">
              Match tax payment challans with GST returns for accurate ITC claims
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <span className="text-sm text-gray-500">
                Last Updated: {new Date().toLocaleDateString()} | Auto-reconciliation enabled
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-purple-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={fetchChallans}
              className="flex items-center space-x-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 px-4 py-2 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 shrink-0 px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6" id="print-section">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'all-challans' && renderAllChallans()}
          {activeTab === 'add-challan' && (
            <div className="text-center py-12">
              <FilePlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Add Challan</h3>
              <p className="text-gray-600 mb-6">Add new tax payment challans for reconciliation</p>
              <button
                onClick={() => setShowAddChallan(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Challan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddChallan && <AddChallanModal />}
      {showReconcileModal && <ReconcileModal />}
    </div>
  );
};

export default ChallanReconciliation;