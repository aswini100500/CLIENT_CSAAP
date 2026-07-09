// import React, { useState } from 'react';
// import { 
//   FaCalendarAlt, 
//   FaSearch, 
//   FaCheck, 
//   FaBolt,
//   FaFileAlt,
//   FaUser,
//   FaBuilding,
//   FaClipboardList,
//   FaHistory,
//   FaExchangeAlt,
//   FaTimes,
//   FaPaperPlane,
//   FaEdit,
//   FaTrash,
//   FaPlus
// } from 'react-icons/fa';

// const Work = () => {
//   const [documentDate, setDocumentDate] = useState('');
//   const [commencementDate, setCommencementDate] = useState('');
//   const [completionDate, setCompletionDate] = useState('');
//   const [bgApplicable, setBgApplicable] = useState(false);
//   const [foreignCurrency, setForeignCurrency] = useState(false);
//   const [activeTab, setActiveTab] = useState('Main Info');
//   const [items, setItems] = useState([
//     {
//       id: 1,
//       slNo: 1,
//       childRlNo: 'CH-001',
//       refNo: 'REF-2024-001',
//       milestoneCode: 'MIL-001',
//       workDescription: 'Site Preparation and Excavation Work',
//       uom: 'SQM',
//       orderQty: 1500,
//       orderRate: 1250.50,
//       orderAmount: 1875750,
//       subProject: 'SP-001',
//       budget: 1900000
//     },
//     {
//       id: 2,
//       slNo: 2,
//       childRlNo: 'CH-002',
//       refNo: 'REF-2024-002',
//       milestoneCode: 'MIL-002',
//       workDescription: 'Concrete Foundation and Structure',
//       uom: 'CUM',
//       orderQty: 850,
//       orderRate: 8500.75,
//       orderAmount: 7225637.5,
//       subProject: 'SP-001',
//       budget: 7300000
//     },
//     {
//       id: 3,
//       slNo: 3,
//       childRlNo: 'CH-003',
//       refNo: 'REF-2024-003',
//       milestoneCode: 'MIL-003',
//       workDescription: 'Electrical Wiring and Installation',
//       uom: 'MTR',
//       orderQty: 2500,
//       orderRate: 350.25,
//       orderAmount: 875625,
//       subProject: 'SP-002',
//       budget: 900000
//     }
//   ]);

//   // Billing Term Data
//   const [billingTerms, setBillingTerms] = useState([
//     { term: 'BASIC', description: '', rate: '', amount: 1104233.30 },
//     { term: 'DISCOUNT', description: '', rate: '', amount: '' },
//     { term: 'CGST', description: '', rate: 9.00, amount: 99381.00 },
//     { term: 'SGST', description: '', rate: 9.00, amount: 99381.00 },
//     { term: 'IGST', description: '', rate: '', amount: '' },
//     { term: 'CGST(NON ITC)', description: '', rate: '', amount: '' },
//     { term: 'SGST(NON ITC)', description: '', rate: '', amount: '' },
//     { term: 'IGST(NON ITC)', description: '', rate: '', amount: '' },
//     { term: 'Gross', description: '', rate: '', amount: 1302995.30 },
//     { term: 'ON A/C NORMAL ADVANCE', description: '', rate: '', amount: '' },
//     { term: 'MOBILIZATION ADVANCE', description: '', rate: '', amount: '' },
//     { term: 'SECURED ADVANCE', description: '', rate: '', amount: '' },
//     { term: 'TDS', description: '', rate: 2.00, amount: 22085.00 },
//     { term: 'Retention', description: '', rate: '', amount: '' },
//     { term: 'LWF', description: '', rate: '', amount: '' }
//   ]);

//   const navigationItems = [
//     'Main Info',
//     'Item Info',
//     'Billing Term',
//     'Attachment',
//     'Approval History',
//     'Change History'
//   ];

//   // Sample UOM options
//   const uomOptions = ['SQM', 'CUM', 'MTR', 'KG', 'TON', 'NOS', 'SET'];

//   const handleAddItem = () => {
//     const newItem = {
//       id: items.length + 1,
//       slNo: items.length + 1,
//       childRlNo: `CH-00${items.length + 1}`,
//       refNo: `REF-2024-00${items.length + 1}`,
//       milestoneCode: `MIL-00${items.length + 1}`,
//       workDescription: '',
//       uom: 'SQM',
//       orderQty: 0,
//       orderRate: 0,
//       orderAmount: 0,
//       subProject: '',
//       budget: 0
//     };
//     setItems([...items, newItem]);
//   };

//   const handleDeleteItem = (id) => {
//     setItems(items.filter(item => item.id !== id));
//   };

//   const handleItemChange = (id, field, value) => {
//     setItems(items.map(item => {
//       if (item.id === id) {
//         const updatedItem = { ...item, [field]: value };
        
//         // Auto-calculate order amount if qty or rate changes
//         if (field === 'orderQty' || field === 'orderRate') {
//           updatedItem.orderAmount = updatedItem.orderQty * updatedItem.orderRate;
//         }
        
//         return updatedItem;
//       }
//       return item;
//     }));
//   };

//   const handleBillingTermChange = (index, field, value) => {
//     const updatedTerms = [...billingTerms];
//     updatedTerms[index] = {
//       ...updatedTerms[index],
//       [field]: value
//     };
//     setBillingTerms(updatedTerms);
//   };

//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return '';
//     return new Intl.NumberFormat('en-IN', {
//       maximumFractionDigits: 2,
//       minimumFractionDigits: 2
//     }).format(amount);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex justify-between items-center py-4">
//             <h1 className="text-lg font-semibold text-gray-900">Document</h1>
//             <div className="flex items-center space-x-4">
//               <FaUser className="text-gray-400" />
//               <span className="text-sm text-gray-600">User Name</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Tabs */}
//        <div className="bg-gray-200">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex space-x-1 px-4 sm:px-6 lg:px-8">
//             {navigationItems.map((item) => (
//               <button
//                 key={item}
//                 onClick={() => setActiveTab(item)}
//                 className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
//                   activeTab === item
//                     ? 'bg-white text-blue-700 border-t-2 border-blue-500'
//                     : 'text-gray-600 hover:text-gray-900 hover:bg-white'
//                 }`}
//               >
//                 {item}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto py-6 px-6">
//         <div className="bg-white rounded-lg border border-gray-200">
//           {/* Form Content */}
//           <div className="p-6">
//             {activeTab === 'Main Info' && (
//               <div className="space-y-6">
//                 {/* First Row */}
//                 <div className="grid grid-cols-4 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Business Unit
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Business Unit</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Financial Year
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Financial Year</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Document Type
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Document Type</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Document Date
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="date"
//                         value={documentDate}
//                         onChange={(e) => setDocumentDate(e.target.value)}
//                         className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
//                       />
//                       <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Second Row */}
//                 <div className="grid grid-cols-4 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Document No
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter Document No"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Contractor Name
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Contractor</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Parent Contractor
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Parent Contractor</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Search Parent Contractor Name
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pl-10"
//                         placeholder="Search..."
//                       />
//                       <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Third Row - Subject */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Subject
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Enter Subject"
//                   />
//                 </div>

//                 {/* Fourth Row - Scope of Work */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Scope of Work
//                   </label>
//                   <textarea
//                     rows="3"
//                     className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                     placeholder="Enter Scope of Work"
//                   />
//                 </div>

//                 {/* Fifth Row - Remarks */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Remarks
//                   </label>
//                   <textarea
//                     rows="3"
//                     className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                     placeholder="Enter Remarks"
//                   />
//                 </div>

//                 {/* Sixth Row */}
//                 <div className="grid grid-cols-4 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Commencement Date
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="date"
//                         value={commencementDate}
//                         onChange={(e) => setCommencementDate(e.target.value)}
//                         className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
//                       />
//                       <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Completion Date
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="date"
//                         value={completionDate}
//                         onChange={(e) => setCompletionDate(e.target.value)}
//                         className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
//                       />
//                       <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Work Type
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Work Type</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Copy Work Order
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Work Order</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Seventh Row */}
//                 <div className="grid grid-cols-4 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Payment Term
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Payment Term</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       BG Applicable
//                     </label>
//                     <div className="flex items-center mt-2">
//                       <input
//                         type="checkbox"
//                         checked={bgApplicable}
//                         onChange={(e) => setBgApplicable(e.target.checked)}
//                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                       />
//                       <label className="ml-2 text-sm text-gray-700 flex items-center">
//                         <FaCheck className="mr-1 text-green-500 text-xs" />
//                         Yes
//                       </label>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Foreign Currency
//                     </label>
//                     <div className="flex items-center mt-2">
//                       <input
//                         type="checkbox"
//                         checked={foreignCurrency}
//                         onChange={(e) => setForeignCurrency(e.target.checked)}
//                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                       />
//                       <label className="ml-2 text-sm text-gray-700 flex items-center">
//                         <FaCheck className="mr-1 text-green-500 text-xs" />
//                         Yes
//                       </label>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Select Work Order
//                     </label>
//                     <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
//                       <option value="">Select Work Order</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//                   <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center">
//                     <FaTimes className="mr-2" />
//                     Cancel
//                   </button>
//                   <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center">
//                     <FaPaperPlane className="mr-2" />
//                     Submit
//                   </button>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'Item Info' && (
//               <div className="space-y-6">
//                 {/* Header with Add Button */}
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-lg font-semibold text-gray-900">Item Information</h2>
//                   <button
//                     onClick={handleAddItem}
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
//                   >
//                     <FaPlus className="mr-2" />
//                     Add Item
//                   </button>
//                 </div>

//                 {/* Table Container */}
//                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-gray-50 border-b border-gray-200">
//                         <tr>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sl No</th>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Child Rl No</th>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ref No</th>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Milestone</th>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Work Description</th>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">UOM</th>
//                           <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty</th>
//                           <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Rate</th>
//                           <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sub Project</th>
//                           <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Budget</th>
//                           <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {items.map((item) => (
//                           <tr key={item.id} className="hover:bg-blue-50 transition-colors">
//                             <td className="px-4 py-3 text-sm font-medium text-gray-900">
//                               {item.slNo}
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="text"
//                                 value={item.childRlNo}
//                                 onChange={(e) => handleItemChange(item.id, 'childRlNo', e.target.value)}
//                                 className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="text"
//                                 value={item.refNo}
//                                 onChange={(e) => handleItemChange(item.id, 'refNo', e.target.value)}
//                                 className="w-28 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="text"
//                                 value={item.milestoneCode}
//                                 onChange={(e) => handleItemChange(item.id, 'milestoneCode', e.target.value)}
//                                 className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <textarea
//                                 value={item.workDescription}
//                                 onChange={(e) => handleItemChange(item.id, 'workDescription', e.target.value)}
//                                 rows="1"
//                                 className="w-48 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                                 placeholder="Work description..."
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <select
//                                 value={item.uom}
//                                 onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
//                                 className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                               >
//                                 {uomOptions.map(uom => (
//                                   <option key={uom} value={uom}>{uom}</option>
//                                 ))}
//                               </select>
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="number"
//                                 value={item.orderQty}
//                                 onChange={(e) => handleItemChange(item.id, 'orderQty', parseFloat(e.target.value) || 0)}
//                                 className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 step="0.01"
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="number"
//                                 value={item.orderRate}
//                                 onChange={(e) => handleItemChange(item.id, 'orderRate', parseFloat(e.target.value) || 0)}
//                                 className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 step="0.01"
//                               />
//                             </td>
//                             <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
//                               ₹{formatCurrency(item.orderAmount)}
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="text"
//                                 value={item.subProject}
//                                 onChange={(e) => handleItemChange(item.id, 'subProject', e.target.value)}
//                                 className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 placeholder="Sub project"
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="number"
//                                 value={item.budget}
//                                 onChange={(e) => handleItemChange(item.id, 'budget', parseFloat(e.target.value) || 0)}
//                                 className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 step="0.01"
//                               />
//                             </td>
//                             <td className="px-4 py-3 text-center">
//                               <div className="flex justify-center space-x-2">
//                                 <button 
//                                   className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
//                                   title="Edit"
//                                 >
//                                   <FaEdit size={14} />
//                                 </button>
//                                 <button 
//                                   onClick={() => handleDeleteItem(item.id)}
//                                   className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
//                                   title="Delete"
//                                 >
//                                   <FaTrash size={14} />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Summary Section */}
//                   <div className="bg-gray-50 border-t border-gray-200 p-4">
//                     <div className="grid grid-cols-4 gap-4 text-sm">
//                       <div className="text-center">
//                         <div className="text-gray-600 font-medium">Total Items</div>
//                         <div className="text-lg font-bold text-gray-900">{items.length}</div>
//                       </div>
//                       <div className="text-center">
//                         <div className="text-gray-600 font-medium">Total Order Amount</div>
//                         <div className="text-lg font-bold text-green-600">
//                           ₹{formatCurrency(items.reduce((sum, item) => sum + item.orderAmount, 0))}
//                         </div>
//                       </div>
//                       <div className="text-center">
//                         <div className="text-gray-600 font-medium">Total Budget</div>
//                         <div className="text-lg font-bold text-blue-600">
//                           ₹{formatCurrency(items.reduce((sum, item) => sum + item.budget, 0))}
//                         </div>
//                       </div>
//                       <div className="text-center">
//                         <div className="text-gray-600 font-medium">Variance</div>
//                         <div className={`text-lg font-bold ${
//                           items.reduce((sum, item) => sum + item.budget, 0) - items.reduce((sum, item) => sum + item.orderAmount, 0) >= 0 
//                             ? 'text-green-600' 
//                             : 'text-red-600'
//                         }`}>
//                           ₹{formatCurrency(items.reduce((sum, item) => sum + item.budget, 0) - items.reduce((sum, item) => sum + item.orderAmount, 0))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-3 gap-4 mt-6">
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <div className="text-sm font-medium text-blue-800">Total Order Amount</div>
//                     <div className="text-2xl font-bold text-blue-900">
//                       ₹{formatCurrency(items.reduce((sum, item) => sum + item.orderAmount, 0))}
//                     </div>
//                   </div>
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                     <div className="text-sm font-medium text-green-800">Total Budget</div>
//                     <div className="text-2xl font-bold text-green-900">
//                       ₹{formatCurrency(items.reduce((sum, item) => sum + item.budget, 0))}
//                     </div>
//                   </div>
//                   <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//                     <div className="text-sm font-medium text-purple-800">Items Count</div>
//                     <div className="text-2xl font-bold text-purple-900">{items.length}</div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'Billing Term' && (
//               <div className="space-y-6">
//                 <h2 className="text-lg font-semibold text-gray-900">Billing Terms</h2>
                
//                 {/* Billing Terms Table */}
//                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-gray-50 border-b border-gray-200">
//                         <tr>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Billing Term</th>
//                           <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
//                           <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Rate (%)</th>
//                           <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount (₹)</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {billingTerms.map((term, index) => (
//                           <tr key={index} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-4 py-3 text-sm font-medium text-gray-900">
//                               {term.term}
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="text"
//                                 value={term.description}
//                                 onChange={(e) => handleBillingTermChange(index, 'description', e.target.value)}
//                                 className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 placeholder="Enter description"
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="number"
//                                 value={term.rate}
//                                 onChange={(e) => handleBillingTermChange(index, 'rate', e.target.value)}
//                                 className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-auto"
//                                 placeholder="0.00"
//                                 step="0.01"
//                               />
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="number"
//                                 value={term.amount}
//                                 onChange={(e) => handleBillingTermChange(index, 'amount', e.target.value)}
//                                 className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ml-auto"
//                                 placeholder="0.00"
//                                 step="0.01"
//                               />
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {/* Order Amount Display */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <div className="text-sm font-medium text-blue-800 text-center">
//                     Order Amount: ₹{formatCurrency(1104233.3)}
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//                   <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center">
//                     <FaTimes className="mr-2" />
//                     Cancel
//                   </button>
//                   <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center">
//                     <FaPaperPlane className="mr-2" />
//                     Submit
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Placeholder for other tabs */}
//             {activeTab !== 'Main Info' && activeTab !== 'Item Info' && activeTab !== 'Billing Term' && (
//               <div className="text-center py-12">
//                 <div className="flex justify-center mb-4">
//                   {activeTab === 'Attachment' && <FaPaperPlane className="text-4xl text-gray-400" />}
//                   {activeTab === 'Approval History' && <FaHistory className="text-4xl text-gray-400" />}
//                   {activeTab === 'Change History' && <FaExchangeAlt className="text-4xl text-gray-400" />}
//                 </div>
//                 <div className="text-gray-400 text-lg mb-2">
//                   {activeTab}
//                 </div>
//                 <div className="text-gray-500 text-sm">
//                   Content will be displayed here
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Work;

import React, { useState } from 'react';
import {
  FaCalendarAlt, FaSearch, FaCheck, FaPaperPlane,
  FaTimes, FaPlus, FaTrash, FaEdit
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CreateWorkOrder from './CreateWorkOrder';
import WorkOrderHistory from './WorkOrderHistrory';

const WorkOrder = () => {
  const [documentDate, setDocumentDate] = useState('');
  // const [commencementDate, setCommencementDate] = useState('');
  // const [completionDate, setCompletionDate] = useState('');
  // const [bgApplicable, setBgApplicable] = useState(false);
  // const [foreignCurrency, setForeignCurrency] = useState(false);
  const [activeTab, setActiveTab] = useState('Issue Work Order');
  const [items, setItems] = useState([
    { id: 1, slNo: 1, workDescription: 'Site Preparation', uom: 'SQM', orderQty: 1500, orderRate: 1250, orderAmount: 1875000 }
  ]);

  const navigationItems = ['Issue Work Order', 'Work Order History'];

  // const uomOptions = ['SQM', 'CUM', 'MTR', 'KG', 'TON', 'NOS'];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  // const handleAddItem = () => {
  //   const newItem = {
  //     id: items.length + 1,
  //     slNo: items.length + 1,
  //     workDescription: '',
  //     uom: 'SQM',
  //     orderQty: 0,
  //     orderRate: 0,
  //     orderAmount: 0,
  //   };
  //   setItems([...items, newItem]);
  // };

  // const handleItemChange = (id, field, value) => {
  //   setItems(items.map((item) =>
  //     item.id === id
  //       ? {
  //           ...item,
  //           [field]: value,
  //           orderAmount:
  //             field === 'orderQty' || field === 'orderRate'
  //               ? (field === 'orderQty' ? value : item.orderQty) *
  //                 (field === 'orderRate' ? value : item.orderRate)
  //               : item.orderAmount,
  //         }
  //       : item
  //   ));
  // };

  // const handleDeleteItem = (id) => {
  //   setItems(items.filter((i) => i.id !== id));
  // };

  const totalAmount = items.reduce((sum, i) => sum + i.orderAmount, 0);

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Work Order', 14, 20);
    doc.text(`Date: ${documentDate}`, 150, 20);
    doc.text('Contractor Work Order Summary', 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Sl No', 'Description', 'UOM', 'Qty', 'Rate', 'Amount']],
      body: items.map((i) => [
        i.slNo,
        i.workDescription,
        i.uom,
        i.orderQty,
        i.orderRate,
        i.orderAmount,
      ]),
    });

    doc.text(`Total: ₹${totalAmount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save('work_order.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Work Order</h1>
          <span className="text-sm text-gray-600">Construction Department</span>
        </div>
      </div> */}

      {/* Tabs */}
      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto flex space-x-1 px-6">
          {navigationItems.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg ${
                activeTab === tab
                  ? 'bg-white text-blue-700 border-t-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto  bg-white  rounded-b-lg">

        {activeTab === 'Issue Work Order' && (
        <CreateWorkOrder />
        )}

        {activeTab === 'Work Order History' && (
       <WorkOrderHistory />
        )}

        {activeTab === 'Summary' && (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Work Order Summary</h2>
            <p className="text-gray-700">
              Total Items: <span className="font-bold">{items.length}</span>
            </p>
            <p className="text-green-700 text-lg font-semibold">
              Total Work Order Value: {formatCurrency(totalAmount)}
            </p>
            <button
              onClick={handleGeneratePDF}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrder;


// import React, { useState } from "react";
// import { Plus, Trash2, Save, FileText } from "lucide-react";
// import { jsPDF } from "jspdf";

// const WorkOrder = () => {
//   const [formData, setFormData] = useState({
//     to: "",
//     address: "",
//     pin: "",
//     projectName: "",
//     contractorName: "",
//     workOrderDate: new Date().toISOString().split("T")[0],
//     description: "",
//     terms: "",
//   });

//   const [items, setItems] = useState([
//     { description: "", quantity: 0, rate: 0, amount: 0 },
//   ]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...items];
//     updatedItems[index][field] = value;
//     if (field === "quantity" || field === "rate") {
//       const qty = parseFloat(updatedItems[index].quantity) || 0;
//       const rate = parseFloat(updatedItems[index].rate) || 0;
//       updatedItems[index].amount = qty * rate;
//     }
//     setItems(updatedItems);
//   };

//   const addItem = () => {
//     setItems([...items, { description: "", quantity: 0, rate: 0, amount: 0 }]);
//   };

//   const removeItem = (index) => {
//     setItems(items.filter((_, i) => i !== index));
//   };

//   const totalAmount = items.reduce((acc, item) => acc + (item.amount || 0), 0);

//   const handleSave = () => {
//     alert(" Work Order Saved Successfully!");
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     let y = 15;

//     // Header
//     doc.setFontSize(18);
//     doc.text("Construction Work Order", 70, y);
//     y += 10;

//     doc.setFontSize(12);
//     doc.text(`To: ${formData.to || "-"}`, 20, y);
//     y += 8;
//     doc.text(`Address: ${formData.address || "-"}`, 20, y);
//     y += 8;
//     doc.text(`Pin Code: ${formData.pin || "-"}`, 20, y);
//     y += 12;

//     // Work Order Info
//     doc.text(`Project: ${formData.projectName || "-"}`, 20, y);
//     y += 8;
//     doc.text(`Contractor: ${formData.contractorName || "-"}`, 20, y);
//     y += 8;
//     doc.text(`Date: ${formData.workOrderDate || "-"}`, 20, y);
//     y += 8;
//     doc.text(`Description: ${formData.description || "-"}`, 20, y);
//     y += 12;

//     // Table Header
//     doc.setFontSize(13);
//     doc.text("S.No", 20, y);
//     doc.text("Description", 40, y);
//     doc.text("Qty", 120, y);
//     doc.text("Rate", 140, y);
//     doc.text("Amount", 165, y);
//     y += 6;
//     doc.line(20, y, 190, y);
//     y += 6;

//     // Items
//     doc.setFontSize(12);
//     items.forEach((item, index) => {
//       doc.text(`${index + 1}`, 22, y);
//       doc.text(`${item.description || "-"}`, 40, y);
//       doc.text(`${item.quantity}`, 120, y);
//       doc.text(`${item.rate}`, 140, y);
//       doc.text(`₹${item.amount.toFixed(2)}`, 165, y);
//       y += 8;
//     });

//     // Total
//     y += 4;
//     doc.line(20, y, 190, y);
//     y += 8;
//     doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 120, y);

//     // Terms
//     y += 15;
//     doc.setFontSize(13);
//     doc.text("Terms & Conditions:", 20, y);
//     y += 8;
//     doc.setFontSize(11);
//     const termsText = formData.terms || "N/A";
//     const splitText = doc.splitTextToSize(termsText, 170);
//     doc.text(splitText, 20, y);

//     doc.save("work-order.pdf");
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8">
//       <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
//          Construction Work Order
//       </h2>

//       {/* Work Order Form */}
//       <div className="grid md:grid-cols-2 gap-4 mb-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             To
//           </label>
//           <input
//             type="text"
//             name="to"
//             value={formData.to}
//             onChange={handleInputChange}
//             placeholder="Receiver name or firm"
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Address
//           </label>
//           <input
//             type="text"
//             name="address"
//             value={formData.address}
//             onChange={handleInputChange}
//             placeholder="Contractor address"
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Pin Code
//           </label>
//           <input
//             type="text"
//             name="pin"
//             value={formData.pin}
//             onChange={handleInputChange}
//             placeholder="e.g. 400001"
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Project Name
//           </label>
//           <input
//             type="text"
//             name="projectName"
//             value={formData.projectName}
//             onChange={handleInputChange}
//             placeholder="Enter project name"
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Contractor Name
//           </label>
//           <input
//             type="text"
//             name="contractorName"
//             value={formData.contractorName}
//             onChange={handleInputChange}
//             placeholder="Enter contractor name"
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Work Order Date
//           </label>
//           <input
//             type="date"
//             name="workOrderDate"
//             value={formData.workOrderDate}
//             onChange={handleInputChange}
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//           />
//         </div>
//         <div className="md:col-span-2">
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Work Description
//           </label>
//           <input
//             type="text"
//             name="description"
//             value={formData.description}
//             onChange={handleInputChange}
//             placeholder="e.g., Masonry, Electrical, Plumbing"
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//           />
//         </div>
//       </div>

//       {/* Line Items */}
//      <div className="mb-6">
//   <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">
//     Work Items
//   </h3>

//   <div className="space-y-3">
//     {items.map((item, index) => (
//       <div
//         key={index}
//         className="grid grid-cols-12 gap-3 items-end bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
//       >
//         {/* Description */}
//         <div className="col-span-4">
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Description
//           </label>
//           <input
//             type="text"
//             placeholder="Enter work description"
//             value={item.description}
//             onChange={(e) =>
//               handleItemChange(index, "description", e.target.value)
//             }
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
//           />
//         </div>

//         {/* Quantity */}
//         <div className="col-span-2">
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Quantity
//           </label>
//           <input
//             type="number"
//             placeholder="Qty"
//             value={item.quantity}
//             onChange={(e) =>
//               handleItemChange(index, "quantity", e.target.value)
//             }
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
//           />
//         </div>

//         {/* Rate */}
//         <div className="col-span-2">
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Rate
//           </label>
//           <input
//             type="number"
//             placeholder="Rate"
//             value={item.rate}
//             onChange={(e) => handleItemChange(index, "rate", e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
//           />
//         </div>

//         {/* Amount */}
//         <div className="col-span-3">
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Amount
//           </label>
//           <input
//             type="number"
//             readOnly
//             value={item.amount}
//             className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-500 dark:border-gray-400"
//           />
//         </div>

//         {/* Remove Button */}
//         <div className="col-span-1 flex items-end justify-center">
//           <button
//             onClick={() => removeItem(index)}
//             className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
//           >
//             <Trash2 size={18} />
//           </button>
//             <button
//            onClick={addItem}
//             className=" flex items-center  text-blue-600 hover:text-blue-700"
//          >
//            <Plus size={18} />New 
//   </button>

//         </div>
//       </div>
//     ))}
//   </div>

//   {/* <button
//     onClick={addItem}
//     className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700"
//   >
//     <Plus size={18} /> Add New Item
//   </button> */}
// </div>


//       {/* Terms and Conditions */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Terms & Conditions
//         </label>
//         <textarea
//           name="terms"
//           rows={4}
//           value={formData.terms}
//           onChange={handleInputChange}
//           placeholder="Enter payment, completion, or quality terms"
//           className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//         />
//       </div>

//       {/* Total */}
//       <div className="flex justify-end items-center mb-4">
//         <span className="text-lg font-semibold">
//           Total: ₹{totalAmount.toFixed(2)}
//         </span>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-end gap-3">
//         <button
//           onClick={handleSave}
//           className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
//         >
//           <Save size={18} /> Save
//         </button>
//         <button
//           onClick={downloadPDF}
//           className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
//         >
//           <FileText size={18} /> Download PDF
//         </button>
//       </div>
//     </div>
//   );
// };

// export default WorkOrder;
