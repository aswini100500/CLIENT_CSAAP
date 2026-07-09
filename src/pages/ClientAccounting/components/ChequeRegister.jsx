// import React, { useState, useEffect } from 'react';
// import {
//   HiDocumentText,
//   HiCalendar,
//   HiCurrencyRupee,
//   HiCheckCircle,
//   HiClock,
//   HiXCircle,
//   HiPlus,
//   HiEye,
//   HiPencil,
//   HiTrash,
//   HiFilter,
//   HiDownload,
//   HiPrinter,
//   HiRefresh,
//   HiSearch,
//   HiX,
//   HiUser,
  
//   HiSave,
  
// } from 'react-icons/hi';

// const ChequeRegister = () => {
//   const [cheques, setCheques] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [selectedCheques, setSelectedCheques] = useState([]);
  
//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedCheque, setSelectedCheque] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   // Cheque form state
//   const [chequeForm, setChequeForm] = useState({
//     chequeNumber: '',
//     bankName: '',
//     accountNumber: '',
//     payeeName: '',
//     amount: '',
//     dateIssued: new Date().toISOString().split('T')[0],
//     datePresented: '',
//     status: 'pending',
//     type: 'issued',
//     remarks: '',
//     chequeDate: new Date().toISOString().split('T')[0],
//     payeeAddress: '',
//     payeeContact: '',
//     purpose: '',
//     referenceNumber: '',
//     narration: ''
//   });

//   // Sample data
//   const sampleCheques = [
//     {
//       id: 'CHQ001',
//       chequeNumber: '876543',
//       bankName: 'HDFC Bank',
//       accountNumber: '123456789012',
//       payeeName: 'ABC Suppliers Pvt Ltd',
//       amount: '₹75,000.00',
//       dateIssued: '2024-01-15',
//       datePresented: '2024-01-18',
//       status: 'cleared',
//       type: 'issued',
//       remarks: 'Material purchase payment',
//       chequeDate: '2024-01-15',
//       payeeAddress: '123 Business Street, Mumbai',
//       payeeContact: '9876543210',
//       purpose: 'Material Purchase',
//       referenceNumber: 'PO-001',
//       narration: 'Payment for materials'
//     },
//     {
//       id: 'CHQ002',
//       chequeNumber: '876544',
//       bankName: 'ICICI Bank',
//       accountNumber: '987654321098',
//       payeeName: 'XYZ Services',
//       amount: '₹25,500.00',
//       dateIssued: '2024-01-16',
//       datePresented: '',
//       status: 'pending',
//       type: 'issued',
//       remarks: 'Service charges',
//       chequeDate: '2024-01-16',
//       payeeAddress: '456 Service Road, Delhi',
//       payeeContact: '9876543211',
//       purpose: 'Service Charges',
//       referenceNumber: 'SC-001',
//       narration: 'Monthly service charges'
//     },
//     {
//       id: 'CHQ003',
//       chequeNumber: '654321',
//       bankName: 'SBI',
//       accountNumber: '112233445566',
//       payeeName: 'Customer A',
//       amount: '₹1,50,000.00',
//       dateIssued: '2024-01-10',
//       datePresented: '2024-01-12',
//       status: 'cleared',
//       type: 'received',
//       remarks: 'Advance payment',
//       chequeDate: '2024-01-10',
//       payeeAddress: '789 Customer Ave, Bangalore',
//       payeeContact: '9876543212',
//       purpose: 'Advance Payment',
//       referenceNumber: 'ADV-001',
//       narration: 'Customer advance'
//     }
//   ];

//   useEffect(() => {
//     // Simulate API call
//     setTimeout(() => {
//       setCheques(sampleCheques);
//       setLoading(false);
//     }, 1000);
//   }, []);

//   // Reset form
//   const resetForm = () => {
//     setChequeForm({
//       chequeNumber: '',
//       bankName: '',
//       accountNumber: '',
//       payeeName: '',
//       amount: '',
//       dateIssued: new Date().toISOString().split('T')[0],
//       datePresented: '',
//       status: 'pending',
//       type: 'issued',
//       remarks: '',
//       chequeDate: new Date().toISOString().split('T')[0],
//       payeeAddress: '',
//       payeeContact: '',
//       purpose: '',
//       referenceNumber: '',
//       narration: ''
//     });
//   };

//   // Handle form input changes
//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setChequeForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Open Add Cheque Modal
//   const handleAddCheque = () => {
//     resetForm();
//     setShowAddModal(true);
//     setIsEditMode(false);
//   };

//   // Open Edit Cheque Modal
//   const handleEditCheque = (cheque) => {
//     setSelectedCheque(cheque);
//     setChequeForm({
//       ...cheque,
//       amount: cheque.amount.replace(/[₹,]/g, '')
//     });
//     setShowEditModal(true);
//     setIsEditMode(true);
//   };

//   // Open View Cheque Modal
//   const handleViewCheque = (cheque) => {
//     setSelectedCheque(cheque);
//     setShowViewModal(true);
//   };

//   // Close all modals
//   const closeModal = () => {
//     setShowAddModal(false);
//     setShowEditModal(false);
//     setShowViewModal(false);
//     setSelectedCheque(null);
//     resetForm();
//   };

//   // Save Cheque (Add/Edit)
//   const handleSaveCheque = () => {
//     // Basic validation
//     if (!chequeForm.chequeNumber || !chequeForm.amount || !chequeForm.payeeName) {
//       alert('Please fill in required fields');
//       return;
//     }

//     const formattedAmount = `₹${parseFloat(chequeForm.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//     const chequeData = {
//       ...chequeForm,
//       amount: formattedAmount
//     };

//     if (isEditMode) {
//       // Update existing cheque
//       setCheques(cheques.map(c => 
//         c.id === selectedCheque.id ? { ...selectedCheque, ...chequeData } : c
//       ));
//     } else {
//       // Add new cheque
//       const newCheque = {
//         id: `CHQ${String(cheques.length + 1).padStart(3, '0')}`,
//         ...chequeData
//       };
//       setCheques([...cheques, newCheque]);
//     }

//     closeModal();
//   };

//   const handleDeleteCheque = (id) => {
//     if (window.confirm('Are you sure you want to delete this cheque?')) {
//       setCheques(cheques.filter(cheque => cheque.id !== id));
//     }
//   };

//   const handleSelectCheque = (id) => {
//     setSelectedCheques(prev => 
//       prev.includes(id) 
//         ? prev.filter(chequeId => chequeId !== id)
//         : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedCheques.length === filteredCheques.length) {
//       setSelectedCheques([]);
//     } else {
//       setSelectedCheques(filteredCheques.map(cheque => cheque.id));
//     }
//   };

//   const handleBulkAction = (action) => {
//     if (selectedCheques.length === 0) {
//       alert('Please select cheques first');
//       return;
//     }
    
//     switch(action) {
//       case 'mark-cleared':
//         setCheques(cheques.map(cheque => 
//           selectedCheques.includes(cheque.id) 
//             ? { ...cheque, status: 'cleared', datePresented: new Date().toISOString().split('T')[0] }
//             : cheque
//         ));
//         alert(`${selectedCheques.length} cheque(s) marked as cleared`);
//         break;
//       case 'mark-bounced':
//         setCheques(cheques.map(cheque => 
//           selectedCheques.includes(cheque.id) 
//             ? { ...cheque, status: 'bounced' }
//             : cheque
//         ));
//         alert(`${selectedCheques.length} cheque(s) marked as bounced`);
//         break;
//       case 'delete':
//         if (window.confirm(`Delete ${selectedCheques.length} cheque(s)?`)) {
//           setCheques(cheques.filter(cheque => !selectedCheques.includes(cheque.id)));
//           setSelectedCheques([]);
//         }
//         break;
//     }
//   };

//   // Filter cheques based on search and filters
//   const filteredCheques = cheques.filter(cheque => {
//     const matchesSearch = searchTerm === '' || 
//       cheque.chequeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       cheque.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       cheque.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = statusFilter === 'all' || cheque.status === statusFilter;
    
//     return matchesSearch && matchesStatus;
//   });

//   // Calculate summary
//   const summary = {
//     totalCheques: cheques.length,
//     totalAmount: cheques.reduce((sum, cheque) => 
//       sum + parseFloat(cheque.amount.replace(/[₹,]/g, '')), 0
//     ),
//     clearedAmount: cheques
//       .filter(cheque => cheque.status === 'cleared')
//       .reduce((sum, cheque) => 
//         sum + parseFloat(cheque.amount.replace(/[₹,]/g, '')), 0
//       ),
//     pendingAmount: cheques
//       .filter(cheque => cheque.status === 'pending')
//       .reduce((sum, cheque) => 
//         sum + parseFloat(cheque.amount.replace(/[₹,]/g, '')), 0
//       )
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       cleared: { color: 'bg-green-100 text-green-800', icon: <HiCheckCircle className="w-4 h-4" /> },
//       pending: { color: 'bg-yellow-100 text-yellow-800', icon: <HiClock className="w-4 h-4" /> },
//       bounced: { color: 'bg-red-100 text-red-800', icon: <HiXCircle className="w-4 h-4" /> },
//       cancelled: { color: 'bg-gray-100 text-gray-800', icon: <HiXCircle className="w-4 h-4" /> }
//     };
    
//     const config = statusConfig[status] || statusConfig.pending;
    
//     return (
//       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
//         {config.icon}
//         <span className="ml-1 capitalize">{status}</span>
//       </span>
//     );
//   };

//   const getTypeBadge = (type) => {
//     const typeConfig = {
//       issued: { color: 'bg-blue-100 text-blue-800', label: 'Issued' },
//       received: { color: 'bg-purple-100 text-purple-800', label: 'Received' }
//     };
    
//     const config = typeConfig[type] || typeConfig.issued;
    
//     return (
//       <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
//         {config.label}
//       </span>
//     );
//   };

//   // Modal Component
//   const ChequeModal = ({ isEdit = false, isView = false }) => {
//     const modalTitle = isView ? 'View Cheque' : (isEdit ? 'Edit Cheque' : 'Add New Cheque');
    
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//           {/* Modal Header */}
//           <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//             <div className="flex items-center">
//               {/* <HiBanknotes className="w-6 h-6 text-blue-600 mr-3" /> */}
//               <h3 className="text-xl font-semibold text-gray-800">{modalTitle}</h3>
//             </div>
//             <button 
//               onClick={closeModal}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <HiX className="w-6 h-6" />
//             </button>
//           </div>
          
//           {/* Modal Content */}
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Cheque Number */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Cheque Number *
//                 </label>
//                 <input
//                   type="text"
//                   name="chequeNumber"
//                   value={chequeForm.chequeNumber}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter cheque number"
//                 />
//               </div>
              
//               {/* Bank Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Bank Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="bankName"
//                   value={chequeForm.bankName}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter bank name"
//                 />
//               </div>
              
//               {/* Account Number */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Account Number
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   value={chequeForm.accountNumber}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter account number"
//                 />
//               </div>
              
//               {/* Payee Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Payee Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="payeeName"
//                   value={chequeForm.payeeName}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter payee name"
//                 />
//               </div>
              
//               {/* Amount */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Amount (₹) *
//                 </label>
//                 <input
//                   type="number"
//                   name="amount"
//                   value={chequeForm.amount}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter amount"
//                 />
//               </div>
              
//               {/* Cheque Type */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Cheque Type
//                 </label>
//                 <select
//                   name="type"
//                   value={chequeForm.type}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 >
//                   <option value="issued">Issued (Payment)</option>
//                   <option value="received">Received (Income)</option>
//                 </select>
//               </div>
              
//               {/* Date Issued */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Date Issued
//                 </label>
//                 <input
//                   type="date"
//                   name="dateIssued"
//                   value={chequeForm.dateIssued}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 />
//               </div>
              
//               {/* Cheque Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Cheque Date
//                 </label>
//                 <input
//                   type="date"
//                   name="chequeDate"
//                   value={chequeForm.chequeDate}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 />
//               </div>
              
//               {/* Status */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <select
//                   name="status"
//                   value={chequeForm.status}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="cleared">Cleared</option>
//                   <option value="bounced">Bounced</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>
              
//               {/* Date Presented */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Date Presented
//                 </label>
//                 <input
//                   type="date"
//                   name="datePresented"
//                   value={chequeForm.datePresented}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 />
//               </div>
              
//               {/* Purpose */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Purpose
//                 </label>
//                 <select
//                   name="purpose"
//                   value={chequeForm.purpose}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 >
//                   <option value="">Select Purpose</option>
//                   <option value="Material Purchase">Material Purchase</option>
//                   <option value="Service Charges">Service Charges</option>
//                   <option value="Salary">Salary</option>
//                   <option value="Rent">Rent</option>
//                   <option value="Utilities">Utilities</option>
//                   <option value="Tax Payment">Tax Payment</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
              
//               {/* Reference Number */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Reference Number
//                 </label>
//                 <input
//                   type="text"
//                   name="referenceNumber"
//                   value={chequeForm.referenceNumber}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter reference number"
//                 />
//               </div>
              
//               {/* Payee Contact */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Payee Contact
//                 </label>
//                 <input
//                   type="tel"
//                   name="payeeContact"
//                   value={chequeForm.payeeContact}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter contact number"
//                 />
//               </div>
              
//               {/* Payee Address */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Payee Address
//                 </label>
//                 <textarea
//                   name="payeeAddress"
//                   value={chequeForm.payeeAddress}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   rows="3"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter payee address"
//                 />
//               </div>
              
//               {/* Remarks/Narration */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Remarks / Narration
//                 </label>
//                 <textarea
//                   name="narration"
//                   value={chequeForm.narration}
//                   onChange={handleFormChange}
//                   disabled={isView}
//                   rows="3"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter any remarks or narration"
//                 />
//               </div>
//             </div>
            
//             {/* Modal Actions */}
//             {!isView && (
//               <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSaveCheque}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//                 >
//                   <HiSave className="w-5 h-5 mr-2" />
//                   {isEdit ? 'Update Cheque' : 'Save Cheque'}
//                 </button>
//               </div>
//             )}
            
//             {/* View Mode Actions */}
//             {isView && selectedCheque && (
//               <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     closeModal();
//                     handleEditCheque(selectedCheque);
//                   }}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Edit Cheque
//                 </button>
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <span className="ml-4 text-gray-600">Loading cheque register...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* Add Cheque Modal */}
//       {showAddModal && <ChequeModal isEdit={false} isView={false} />}
      
//       {/* Edit Cheque Modal */}
//       {showEditModal && <ChequeModal isEdit={true} isView={false} />}
      
//       {/* View Cheque Modal */}
//       {showViewModal && <ChequeModal isEdit={false} isView={true} />}

//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-8 shadow-lg">
//           <div className="flex flex-col md:flex-row md:items-center justify-between">
//             <div className="flex items-center mb-4 md:mb-0">
//               <div className="bg-white/20 p-3 rounded-lg mr-4">
//                 {/* <HiBanknotes className="w-8 h-8 text-white" /> */}
//               </div>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-white">Cheque Register</h1>
//                 <p className="text-blue-100 mt-1">Track all issued and received cheques</p>
//               </div>
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <button
//                 onClick={handleAddCheque}
//                 className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
//               >
//                 <HiPlus className="w-5 h-5 mr-2" />
//                 Add Cheque
//               </button>
//               <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center">
//                 <HiPrinter className="w-5 h-5 mr-2" />
//                 Print
//               </button>
//               <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center">
//                 <HiDownload className="w-5 h-5 mr-2" />
//                 Export
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Total Cheques</p>
//                 <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalCheques}</p>
//               </div>
//               <div className="bg-blue-100 p-3 rounded-lg">
//                 <HiDocumentText className="w-8 h-8 text-blue-600" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Total Amount</p>
//                 <p className="text-3xl font-bold text-gray-800 mt-2">
//                   ₹{summary.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                 </p>
//               </div>
//               <div className="bg-green-100 p-3 rounded-lg">
//                 <HiCurrencyRupee className="w-8 h-8 text-green-600" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl p-6 shadow border border-green-200 bg-green-50">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-600">Cleared Amount</p>
//                 <p className="text-3xl font-bold text-green-700 mt-2">
//                   ₹{summary.clearedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                 </p>
//               </div>
//               <div className="bg-green-100 p-3 rounded-lg">
//                 <HiCheckCircle className="w-8 h-8 text-green-600" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl p-6 shadow border border-yellow-200 bg-yellow-50">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-yellow-600">Pending Amount</p>
//                 <p className="text-3xl font-bold text-yellow-700 mt-2">
//                   ₹{summary.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                 </p>
//               </div>
//               <div className="bg-yellow-100 p-3 rounded-lg">
//                 <HiClock className="w-8 h-8 text-yellow-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters and Bulk Actions */}
//         <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
//           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//             <div className="flex flex-wrap gap-4">
//               {/* Search */}
//               <div className="relative">
//                 <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by cheque number, payee, bank..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full lg:w-80"
//                 />
//               </div>
              
//               {/* Status Filter */}
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               >
//                 <option value="all">All Status</option>
//                 <option value="cleared">Cleared</option>
//                 <option value="pending">Pending</option>
//                 <option value="bounced">Bounced</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
              
//               {/* Date Filter */}
//               <select
//                 value={dateFilter}
//                 onChange={(e) => setDateFilter(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               >
//                 <option value="all">All Dates</option>
//                 <option value="today">Today</option>
//                 <option value="week">This Week</option>
//                 <option value="month">This Month</option>
//                 <option value="custom">Custom Range</option>
//               </select>
//             </div>
            
//             {/* Bulk Actions */}
//             <div className="flex flex-wrap gap-3">
//               <span className="text-sm text-gray-500 self-center">
//                 {selectedCheques.length} selected
//               </span>
//               <select
//                 onChange={(e) => handleBulkAction(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 disabled={selectedCheques.length === 0}
//               >
//                 <option value="">Bulk Actions</option>
//                 <option value="mark-cleared">Mark as Cleared</option>
//                 <option value="mark-bounced">Mark as Bounced</option>
//                 <option value="delete">Delete Selected</option>
//               </select>
//               <button
//                 onClick={() => setSelectedCheques([])}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 disabled={selectedCheques.length === 0}
//               >
//                 Clear Selection
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Cheque Table */}
//         <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left">
//                     <input
//                       type="checkbox"
//                       checked={selectedCheques.length === filteredCheques.length && filteredCheques.length > 0}
//                       onChange={handleSelectAll}
//                       className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
//                     />
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Cheque Details
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Payee/Bank
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Amount
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Dates
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredCheques.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="px-6 py-8 text-center">
//                       <HiDocumentText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//                       <p className="text-gray-500">No cheques found</p>
//                       <button
//                         onClick={handleAddCheque}
//                         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                       >
//                         Add Your First Cheque
//                       </button>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredCheques.map((cheque) => (
//                     <tr key={cheque.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <input
//                           type="checkbox"
//                           checked={selectedCheques.includes(cheque.id)}
//                           onChange={() => handleSelectCheque(cheque.id)}
//                           className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="px-6 py-4">
//                         <div>
//                           <div className="flex items-center">
//                             {getTypeBadge(cheque.type)}
//                             <span className="ml-2 font-medium text-gray-900">
//                               {cheque.chequeNumber}
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-500 mt-1">{cheque.id}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div>
//                           <p className="font-medium text-gray-900">{cheque.payeeName}</p>
//                           <p className="text-sm text-gray-500">{cheque.bankName}</p>
//                           <p className="text-xs text-gray-400">Acc: {cheque.accountNumber}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-lg font-bold text-gray-900">{cheque.amount}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="space-y-1">
//                           <div className="text-sm">
//                             <span className="text-gray-500">Issued:</span>
//                             <span className="ml-2 text-gray-900">{cheque.dateIssued}</span>
//                           </div>
//                           {cheque.datePresented && (
//                             <div className="text-sm">
//                               <span className="text-gray-500">Presented:</span>
//                               <span className="ml-2 text-gray-900">{cheque.datePresented}</span>
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {getStatusBadge(cheque.status)}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => handleViewCheque(cheque)}
//                             className="text-blue-600 hover:text-blue-800 p-1"
//                             title="View"
//                           >
//                             <HiEye className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={() => handleEditCheque(cheque)}
//                             className="text-green-600 hover:text-green-800 p-1"
//                             title="Edit"
//                           >
//                             <HiPencil className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteCheque(cheque.id)}
//                             className="text-red-600 hover:text-red-800 p-1"
//                             title="Delete"
//                           >
//                             <HiTrash className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
//             <div className="space-y-4">
//               {['cleared', 'pending', 'bounced', 'cancelled'].map((status) => {
//                 const count = cheques.filter(c => c.status === status).length;
//                 const percentage = cheques.length > 0 ? (count / cheques.length) * 100 : 0;
                
//                 return (
//                   <div key={status} className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       {getStatusBadge(status)}
//                       <span className="ml-3 text-gray-700 capitalize">{status}</span>
//                     </div>
//                     <div className="text-right">
//                       <span className="font-medium text-gray-900">{count}</span>
//                       <span className="text-gray-500 text-sm ml-2">({percentage.toFixed(1)}%)</span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
//             <div className="space-y-4">
//               {cheques.slice(0, 2).map((cheque) => (
//                 <div key={cheque.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//                   <div className="flex items-center">
//                     <HiPlus className="w-5 h-5 text-blue-600 mr-3" />
//                     <div>
//                       <p className="font-medium text-gray-900">Cheque {cheque.status}</p>
//                       <p className="text-sm text-gray-500">{cheque.chequeNumber} - {cheque.amount}</p>
//                     </div>
//                   </div>
//                   <span className="text-sm text-gray-500">{cheque.dateIssued}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChequeRegister;


import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  IndianRupee,
  Eye,
  Plus,
  Printer,
  Download,
  Search,
  Wallet,
  BarChart3,
  Landmark,
  FilePlus,
  Hash,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';

// Add Cheque Modal Component (Extracted Outside)
const AddChequeModal = ({ 
  isOpen, 
  onClose, 
  selectedAccount, 
  chequeForm, 
  setChequeForm, 
  onSubmit, 
  editingChequeId 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingChequeId ? 'Edit Cheque' : 'Add New Cheque'} - {selectedAccount?.accountName}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cheque Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Number {chequeForm.status !== 'blank' && '*'}
              </label>
              <input
                type="text"
                value={chequeForm.chequeNo}
                onChange={(e) => setChequeForm(prev => ({...prev, chequeNo: e.target.value}))}
                placeholder="e.g., 876543"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
                required={chequeForm.status !== 'blank'}
              />
              {chequeForm.status === 'blank' && (
                <p className="text-xs text-gray-500 mt-1">Leave empty for blank cheque</p>
              )}
            </div>

            {/* Cheque Book Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Book Number
              </label>
              <input
                type="text"
                value={chequeForm.chequeBookNumber}
                onChange={(e) => setChequeForm(prev => ({...prev, chequeBookNumber: e.target.value}))}
                placeholder="e.g., CB-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={chequeForm.status}
                onChange={(e) => setChequeForm(prev => ({...prev, status: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="blank">Blank</option>
                <option value="available">Available</option>
                <option value="unreconciled">Unreconciled</option>
                <option value="reconciled">Reconciled</option>
                <option value="cancelled">Cancelled</option>
                <option value="out_of_period">Out of Period</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={chequeForm.type}
                onChange={(e) => setChequeForm(prev => ({...prev, type: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Type</option>
                <option value="issued">Issued</option>
                <option value="received">Received</option>
                <option value="Business">Business</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={chequeForm.amount}
                onChange={(e) => setChequeForm(prev => ({...prev, amount: e.target.value}))}
                placeholder="e.g., 50000.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>

            {/* Date Issued */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Issued
              </label>
              <input
                type="date"
                value={chequeForm.date_issued}
                onChange={(e) => setChequeForm(prev => ({...prev, date_issued: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Payee Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payee Name
              </label>
              <input
                type="text"
                value={chequeForm.payeeName}
                onChange={(e) => setChequeForm(prev => ({...prev, payeeName: e.target.value}))}
                placeholder="Enter payee name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={chequeForm.remarks}
                onChange={(e) => setChequeForm(prev => ({...prev, remarks: e.target.value}))}
                placeholder="Enter remarks"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {editingChequeId ? 'Update Cheque' : 'Add Cheque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Cheques Modal Component (Extracted Outside)
const AddChequesModal = ({ 
  isOpen, 
  onClose, 
  selectedAccount, 
  addChequesData, 
  setAddChequesData, 
  onSubmit,
  stats,
  handleNumberOfLeavesChange,
  handleStartNumberChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Add Cheque Leaves - {selectedAccount?.accountName}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cheque Book Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Book Number
              </label>
              <input
                type="text"
                value={addChequesData.chequeBookNumber}
                onChange={(e) => setAddChequesData(prev => ({...prev, chequeBookNumber: e.target.value}))}
                placeholder="e.g., CB-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={addChequesData.issueDate}
                onChange={(e) => setAddChequesData(prev => ({...prev, issueDate: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Number of Leaves */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cheque Leaves *
              </label>
              <input
                type="number"
                value={addChequesData.numberOfLeaves}
                onChange={handleNumberOfLeavesChange}
                placeholder="e.g., 25, 50, 100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="1"
                autoComplete="off"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Standard: 25, 50, or 100 leaves per book</p>
            </div>

            {/* Start Number (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Cheque Number (Optional)
              </label>
              <input
                type="text"
                value={addChequesData.startNumber}
                onChange={handleStartNumberChange}
                placeholder="e.g., 876501"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>

            {/* End Number (Auto-calculated) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated End Number
              </label>
              <input
                type="text"
                value={addChequesData.endNumber}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
                placeholder="Auto-calculated"
              />
              {addChequesData.numberOfLeaves && addChequesData.startNumber && (
                <p className="text-xs text-green-600 mt-1">
                  Cheque numbers: {addChequesData.startNumber} to {addChequesData.endNumber}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          {addChequesData.numberOfLeaves && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bank Account:</span>
                  <p className="font-medium">{selectedAccount?.accountName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Leaves to Add:</span>
                  <p className="font-medium text-blue-600">{addChequesData.numberOfLeaves}</p>
                </div>
                <div>
                  <span className="text-gray-600">New Total:</span>
                  <p className="font-medium text-green-600">
                    {selectedAccount ? stats.totalCheques + parseInt(addChequesData.numberOfLeaves) : 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium">Blank (Unused)</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Cheque Leaves
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChequeRegister = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddChequeModal, setShowAddChequeModal] = useState(false);
  const [showAddChequesModal, setShowAddChequesModal] = useState(false);
  const [editingChequeId, setEditingChequeId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cheques, setCheques] = useState([]);
  const { companyId } = useCompany();

  const [chequeForm, setChequeForm] = useState({
    chequeNo: '',
    chequeBookNumber: '',
    status: 'blank',
    amount: '',
    date_issued: new Date().toISOString().split('T')[0],
    payeeName: '',
    remarks: '',
    type: ''
  });

  const [addChequesData, setAddChequesData] = useState({
    startNumber: '',
    endNumber: '',
    numberOfLeaves: '',
    chequeBookNumber: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState({
    totalCheques: 0,
    availableCheques: 0,
    unreconciled: 0,
    reconciled: 0,
    blankCheques: 0,
    cancelledCheques: 0,
    outOfPeriod: 0
  });

  // Fetch bank accounts
  useEffect(() => {
    fetchBankAccounts();
  }, [companyId]);

  const fetchBankAccounts = async () => {
    if (!companyId) return;
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Fetch cheques when companyId changes
  useEffect(() => {
    if (companyId) {
      fetchCheques();
    }
  }, [companyId]);

  // Update stats when cheques or selected account changes
  useEffect(() => {
    if (selectedAccount && cheques.length > 0) {
      updateStats();
    }
  }, [cheques, selectedAccount]);

  // Fetch all cheques for the company
  const fetchCheques = async () => {
    if (!companyId) return;
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/getAllcheque/${companyId}`
      );
      
      console.log('Fetched cheques:', response.data);
      
      if (response.data.success) {
        // Transform API data to match UI expectations
        const transformedCheques = (response.data.data || []).map(cheque => ({
          ...cheque,
          // Map API field names to UI field names
          chequeNumber: cheque.chequeNo,
          dateIssued: cheque.date_issued,
          // Add bank name if available from selected account
          bankName: selectedAccount?.bankName || 'Unknown Bank'
        }));
        console.log('Transformed cheques:', transformedCheques);
        setCheques(transformedCheques);
      } else {
        Swal.fire('Error', response.data.message || 'Failed to fetch cheques', 'error');
      }
    } catch (error) {
      console.error('Error fetching cheques:', error);
      Swal.fire('Error', 'Failed to fetch cheques', 'error');
    }
  };

  const updateStats = () => {
    if (!selectedAccount) return;
    
    // Since all cheques are fetched for the company, we need to filter by company only
    // If your API supports filtering by bank account, you should modify the API call
    const accountCheques = cheques; // For now, show all company cheques
    
    const newStats = {
      totalCheques: accountCheques.length,
      availableCheques: accountCheques.filter(c => c.status === 'available').length,
      unreconciled: accountCheques.filter(c => c.status === 'unreconciled').length,
      reconciled: accountCheques.filter(c => c.status === 'reconciled').length,
      blankCheques: accountCheques.filter(c => c.status === 'blank').length,
      cancelledCheques: accountCheques.filter(c => c.status === 'cancelled').length,
      outOfPeriod: accountCheques.filter(c => c.status === 'out_of_period').length
    };
    
    console.log('Updated stats:', newStats);
    setStats(newStats);
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setEditingChequeId(null);
    setFilterStatus('all');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', label: 'Available', icon: <CheckCircle className="w-4 h-4" /> },
      unreconciled: { color: 'bg-yellow-100 text-yellow-800', label: 'Unreconciled', icon: <Clock className="w-4 h-4" /> },
      reconciled: { color: 'bg-blue-100 text-blue-800', label: 'Reconciled', icon: <CheckCircle className="w-4 h-4" /> },
      blank: { color: 'bg-gray-100 text-gray-800', label: 'Blank', icon: <FileText className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
      out_of_period: { color: 'bg-orange-100 text-orange-800', label: 'Out of Period', icon: <Calendar className="w-4 h-4" /> }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const getAccountCheques = () => {
    if (!selectedAccount) return [];
    // Since we don't have bankAccountId in the cheque data,
    // we'll return all cheques for now
    // You should modify your API to include bankAccountId in the cheque response
    return cheques;
  };

  const filteredCheques = getAccountCheques().filter(cheque => {
    const searchMatch = !searchTerm || 
      cheque.chequeNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.payeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.chequeBookNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filterStatus === 'all' || cheque.status === filterStatus;
    
    return searchMatch && statusMatch;
  });

  const handleAddCheque = () => {
    if (!selectedAccount) {
      Swal.fire('Warning', 'Please select a bank account first', 'warning');
      return;
    }
    
    setChequeForm({
      chequeNo: '',
      chequeBookNumber: '',
      status: 'blank',
      amount: '',
      date_issued: new Date().toISOString().split('T')[0],
      payeeName: '',
      remarks: '',
      type: ''
    });
    
    setShowAddChequeModal(true);
  };

  const handleEditCheque = (cheque) => {
    setChequeForm({
      chequeNo: cheque.chequeNo || '',
      chequeBookNumber: cheque.chequeBookNumber || '',
      status: cheque.status,
      amount: cheque.amount || '',
      date_issued: cheque.date_issued || new Date().toISOString().split('T')[0],
      payeeName: cheque.payeeName || '',
      remarks: cheque.remarks || '',
      type: cheque.type || ''
    });
    
    setEditingChequeId(cheque.id);
    setShowAddChequeModal(true);
  };

  const handleSaveCheque = async (e) => {
    e.preventDefault();
    
    if (!chequeForm.chequeNo && chequeForm.status !== 'blank') {
      Swal.fire('Warning', 'Please enter cheque number', 'warning');
      return;
    }

    try {
      const chequeData = {
        ...chequeForm,
        amount: chequeForm.amount || "0.00"
      };

      console.log('Saving cheque data:', chequeData);

      if (editingChequeId) {
        // Update existing cheque
        const response = await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/updateCheque/${editingChequeId}`,
          chequeData
        );

        console.log('Update response:', response.data);

        if (response.data.success) {
          Swal.fire('Success', 'Cheque updated successfully!', 'success');
          await fetchCheques();
        } else {
          Swal.fire('Error', response.data.message || 'Failed to update cheque', 'error');
        }
      } else {
        // Add new cheque
        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/addCheque/${companyId}`,
          chequeData
        );

        console.log('Add response:', response.data);

        if (response.data.success) {
          Swal.fire('Success', 'Cheque added successfully!', 'success');
          await fetchCheques();
        } else {
          Swal.fire('Error', response.data.message || 'Failed to add cheque', 'error');
        }
      }
      
      setShowAddChequeModal(false);
      setEditingChequeId(null);
    } catch (error) {
      console.error('Error saving cheque:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save cheque', 'error');
    }
  };

  const handleDeleteCheque = async (chequeId) => {
    console.log(chequeId);
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this cheque?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // Note: You might need to implement a delete endpoint
        Swal.fire('Deleted!', 'Cheque deletion would be implemented with a DELETE endpoint.', 'success');
         await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/deleteCheque/${chequeId}`);
         await fetchCheques();
      } catch (error) {
        console.error('Error deleting cheque:', error);
        Swal.fire('Error', 'Failed to delete cheque', 'error');
      }
    }
  };

  const handleAddChequesSubmit = async (e) => {
    e.preventDefault();
    
    if (!addChequesData.numberOfLeaves) {
      Swal.fire('Warning', 'Please enter number of cheque leaves', 'warning');
      return;
    }

    const numberOfLeaves = parseInt(addChequesData.numberOfLeaves);
    const startNumber = addChequesData.startNumber ? parseInt(addChequesData.startNumber) : 1;
    
    try {
      const chequesToAdd = [];
      
      for (let i = 0; i < numberOfLeaves; i++) {
        const chequeNo = addChequesData.startNumber 
          ? (startNumber + i).toString()
          : '';
        
        chequesToAdd.push({
          chequeNo: chequeNo,
          chequeBookNumber: addChequesData.chequeBookNumber || `CB-${Date.now()}`,
          status: 'blank',
          amount: "0.00",
          date_issued: addChequesData.issueDate || '',
          payeeName: '',
          remarks: 'Blank cheque leaf',
          type: ''
        });
      }
console.log(chequesToAdd);

      // Add cheques in batch
      let successCount = 0;
      for (const chequeData of chequesToAdd) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/addCheque/${companyId}`,
            chequeData
          );
          if (response.data.success) {
            successCount++;
          }
        } catch (error) {
          console.error('Error adding cheque:', error);
        }
      }

      if (successCount > 0) {
        Swal.fire('Success', `Added ${successCount} cheque leaves successfully!`, 'success');
        await fetchCheques();
      } else {
        Swal.fire('Error', 'Failed to add cheque leaves', 'error');
      }

      // Reset form
      setAddChequesData({
        startNumber: '',
        endNumber: '',
        numberOfLeaves: '',
        chequeBookNumber: '',
        issueDate: new Date().toISOString().split('T')[0]
      });
      setShowAddChequesModal(false);
    } catch (error) {
      console.error('Error adding cheque leaves:', error);
      Swal.fire('Error', 'Failed to add cheque leaves', 'error');
    }
  };

  const handleNumberOfLeavesChange = (e) => {
    const value = e.target.value;
    setAddChequesData(prev => ({
      ...prev,
      numberOfLeaves: value,
      endNumber: ''
    }));
  };

  const handleStartNumberChange = (e) => {
    const value = e.target.value;
    setAddChequesData(prev => {
      const start = parseInt(value) || 0;
      const numberOfLeaves = parseInt(prev.numberOfLeaves) || 0;
      const end = start + numberOfLeaves - 1;
      
      return {
        ...prev,
        startNumber: value,
        endNumber: numberOfLeaves > 0 ? end.toString() : ''
      };
    });
  };

  const handleRefresh = async () => {
    await fetchBankAccounts();
    await fetchCheques();
    Swal.fire('Refreshed!', 'Data has been refreshed successfully.', 'success');
  };


  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Wallet className="w-8 h-8 mr-3 text-blue-600" />
                Cheque Register
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all your cheque transactions</p>
            </div>
      
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddCheque}
                disabled={!selectedAccount}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  selectedAccount 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Single Cheque
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddChequeModal 
          isOpen={showAddChequeModal}
          onClose={() => {
            setShowAddChequeModal(false);
            setEditingChequeId(null);
          }}
          selectedAccount={selectedAccount}
          chequeForm={chequeForm}
          setChequeForm={setChequeForm}
          onSubmit={handleSaveCheque}
          editingChequeId={editingChequeId}
        />
        <AddChequesModal 
          isOpen={showAddChequesModal}
          onClose={() => setShowAddChequesModal(false)}
          selectedAccount={selectedAccount}
          addChequesData={addChequesData}
          setAddChequesData={setAddChequesData}
          onSubmit={handleAddChequesSubmit}
          stats={stats}
          handleNumberOfLeavesChange={handleNumberOfLeavesChange}
          handleStartNumberChange={handleStartNumberChange}
        />

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Bank Accounts */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Landmark className="w-5 h-5 mr-2 text-blue-600" />
                    Bank Accounts
                  </h3>
                  <p className="text-sm text-gray-500">Select an account to view cheques</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {bankAccounts.map((account) => (
                    <div 
                      key={account.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedAccount?.id === account.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                      onClick={() => handleAccountSelect(account)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Wallet className="w-5 h-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-gray-800">{account.accountName}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{account.bankName}</p>
                          <p className="text-xs text-gray-500 mt-1">Acc: {account.accountNumber}</p>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-800">{cheques.length}</p>
                              <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                {cheques.filter(c => c.status === 'available').length}
                              </p>
                              <p className="text-xs text-gray-500">Available</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{account.currentBalance}</p>
                          <p className="text-xs text-gray-500">Balance</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Statistics */}
              <div className="bg-white rounded-xl shadow border border-gray-200 mt-6 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Overall Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Bank Accounts</span>
                    <span className="font-bold text-gray-800">{bankAccounts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cheques</span>
                    <span className="font-bold text-gray-800">{cheques.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Blank Leaves</span>
                    <span className="font-bold text-blue-600">
                      {cheques.filter(c => c.status === 'blank').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Cheque Details */}
            <div className="lg:col-span-2">
              {selectedAccount ? (
                <div className="space-y-6">
                  {/* Selected Account Header */}
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedAccount.accountName}</h3>
                        <div className="flex items-center mt-2 space-x-4 text-gray-600">
                          <span className="flex items-center">
                            <Landmark className="w-4 h-4 mr-1" />
                            {selectedAccount.bankName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            {selectedAccount.currentBalance}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => setShowAddChequesModal(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <FilePlus className="w-5 h-5 mr-2" />
                          Add Multiple Cheques
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cheque Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Available', key: 'availableCheques', color: 'green', icon: <CheckCircle className="w-6 h-6" /> },
                      { label: 'Unreconciled', key: 'unreconciled', color: 'yellow', icon: <Clock className="w-6 h-6" /> },
                      { label: 'Reconciled', key: 'reconciled', color: 'blue', icon: <CheckCircle className="w-6 h-6" /> },
                      { label: 'Blank', key: 'blankCheques', color: 'gray', icon: <FileText className="w-6 h-6" /> },
                      { label: 'Cancelled', key: 'cancelledCheques', color: 'red', icon: <XCircle className="w-6 h-6" /> },
                      { label: 'Out of Period', key: 'outOfPeriod', color: 'orange', icon: <Calendar className="w-6 h-6" /> },
                      { label: 'Total Cheques', key: 'totalCheques', color: 'indigo', icon: <FileText className="w-6 h-6" /> }
                    ].map((item, index) => (
                      <div key={index} className={`bg-white rounded-xl p-4 shadow border border-${item.color}-200`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm text-${item.color}-600`}>{item.label}</p>
                            <p className={`text-2xl font-bold text-${item.color}-700 mt-1`}>
                              {stats[item.key]}
                            </p>
                          </div>
                          <div className={`bg-${item.color}-100 p-2 rounded-lg`}>
                            {React.cloneElement(item.icon, { className: `w-6 h-6 text-${item.color}-600` })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cheque List */}
                  <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Cheque Details
                          </h3>
                          <p className="text-sm text-gray-500">
                            Showing {filteredCheques.length} of {getAccountCheques().length} cheques
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* Filter by Status */}
                          <div className="relative">
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white"
                            >
                              <option value="all">All Status</option>
                              <option value="available">Available</option>
                              <option value="unreconciled">Unreconciled</option>
                              <option value="reconciled">Reconciled</option>
                              <option value="blank">Blank</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="out_of_period">Out of Period</option>
                            </select>
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search cheques..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
                            />
                          </div>
                          
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setFilterStatus('all');
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
                          >
                            <X className="w-5 h-5 mr-2" />
                            Clear
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {['all', 'available', 'unreconciled', 'reconciled', 'blank', 'cancelled'].map(status => (
                          <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1 text-sm rounded-full ${
                              filterStatus === status 
                                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cheque No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Book No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payee/Remarks
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredCheques.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No cheques found</p>
                                <div className="mt-4 flex justify-center space-x-4">
                                  <button
                                    onClick={handleAddCheque}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                  >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add Single Cheque
                                  </button>
                                  <button
                                    onClick={() => setShowAddChequesModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                  >
                                    <FilePlus className="w-5 h-5 mr-2" />
                                    Add Multiple
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredCheques.map((cheque) => (
                              <tr key={cheque.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">
                                    {cheque.chequeNo || 'Blank'}
                                    {cheque.chequeNo && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        <Hash className="w-3 h-3 inline" />
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {cheque.chequeBookNumber || '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {getStatusBadge(cheque.status)}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">
                                    {cheque.amount ? `₹${Number(cheque.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {cheque.date_issued ? new Date(cheque.date_issued).toLocaleDateString('en-IN') : '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    {cheque.payeeName && (
                                      <div className="font-medium text-gray-900">{cheque.payeeName}</div>
                                    )}
                                    {cheque.remarks && (
                                      <div className="text-sm text-gray-500">{cheque.remarks}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleEditCheque(cheque)}
                                      className="text-blue-600 hover:text-blue-800 p-1"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCheque(cheque.id)}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-800 p-1" title="View">
                                      {/* <Eye className="w-5 h-5" /> */}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Select a Bank Account</h4>
                  <p className="text-gray-500">Select a bank account from the left panel to view cheque details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Chart */}
        <div className="mt-8 bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Cheque Status Distribution
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Available', value: stats.availableCheques, color: 'bg-green-500' },
              { label: 'Unreconciled', value: stats.unreconciled, color: 'bg-yellow-500' },
              { label: 'Reconciled', value: stats.reconciled, color: 'bg-blue-500' },
              { label: 'Blank', value: stats.blankCheques, color: 'bg-gray-500' },
              { label: 'Cancelled', value: stats.cancelledCheques, color: 'bg-red-500' },
              { label: 'Out of Period', value: stats.outOfPeriod, color: 'bg-orange-500' }
            ].map((item, index) => {
              const percentage = stats.totalCheques > 0 ? (item.value / stats.totalCheques) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {item.value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChequeRegister;

// import React, { useState, useEffect } from 'react';
// import {
//   FileText,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Calendar,
//   IndianRupee,
//   Eye,
//   Plus,
//   Printer,
//   Download,
//   Search,
//   Wallet,
//   BarChart3,
//   Landmark,
//   FilePlus,
//   Hash,
//   Edit2,
//   Trash2,
//   Save,
//   X,
//   RefreshCw,
//   Filter
// } from 'lucide-react';
// import Swal from 'sweetalert2';
// import axios from 'axios';
// import { useCompany } from '../context/CompanyContext';

// const ChequeRegister = () => {
//   const [bankAccounts, setBankAccounts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedAccount, setSelectedAccount] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showAddChequeModal, setShowAddChequeModal] = useState(false);
//   const [showAddChequesModal, setShowAddChequesModal] = useState(false);
//   const [editingChequeId, setEditingChequeId] = useState(null);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const { companyId } = useCompany(); 

//   useEffect(() => {
//   fetchBankAccounts()
//   }, [])
  
//     const fetchBankAccounts = async () => {
//     if (!companyId) return;
    
  
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
//       );
      
//       if (response.data.success) {
//         setBankAccounts(response.data.accounts || []);
//       } else {
//         Swal.fire('Error', response.data.message || 'Failed to fetch bank accounts', 'error');
//       }
//     } catch (error) {
//       console.error('Error fetching bank accounts:', error);
//       Swal.fire('Error', 'Failed to fetch bank accounts', 'error');
//     } 
//   };

//   const [chequeForm, setChequeForm] = useState({
//     chequeNumber: '',
//     chequeBookNumber: '',
//     status: 'blank',
//     amount: '',
//     dateIssued: new Date().toISOString().split('T')[0],
//     payeeName: '',
//     remarks: '',
//     type: ''
//   });

//   const [addChequesData, setAddChequesData] = useState({
//     startNumber: '',
//     endNumber: '',
//     numberOfLeaves: '',
//     chequeBookNumber: '',
//     issueDate: new Date().toISOString().split('T')[0]
//   });

//   const [stats, setStats] = useState({
//     totalCheques: 0,
//     availableCheques: 0,
//     unreconciled: 0,
//     reconciled: 0,
//     blankCheques: 0,
//     cancelledCheques: 0,
//     outOfPeriod: 0
//   });
//   // Initial cheque data
//   const [cheques, setCheques] = useState([
//     {
//       id: 1,
//       accountId: 1,
//       chequeNumber: '876543',
//       status: 'available',
//       type: 'issued',
//       amount: '₹75,000.00',
//       dateIssued: '2024-01-15',
//       payeeName: 'ABC Suppliers',
//       remarks: 'Material purchase',
//       bankName: 'HDFC Bank',
//       chequeBookNumber: 'CB-001'
//     },
//   ]);

//   useEffect(() => {
//     if (selectedAccount) {
//       updateStats(selectedAccount);
//     }
//   }, [cheques, selectedAccount]);

//   const updateStats = (account) => {
//     if (!account) return;
    
//     const accountCheques = cheques.filter(cheque => cheque.accountId === account.id);
    
//     const newStats = {
//       totalCheques: accountCheques.length,
//       availableCheques: accountCheques.filter(c => c.status === 'available').length,
//       unreconciled: accountCheques.filter(c => c.status === 'unreconciled').length,
//       reconciled: accountCheques.filter(c => c.status === 'reconciled').length,
//       blankCheques: accountCheques.filter(c => c.status === 'blank').length,
//       cancelledCheques: accountCheques.filter(c => c.status === 'cancelled').length,
//       outOfPeriod: accountCheques.filter(c => c.status === 'out_of_period').length
//     };
    
//     setStats(newStats);
    
//     // Update account data
//     const updatedAccounts = bankAccounts.map(acc => 
//       acc.id === account.id 
//         ? { 
//             ...acc, 
//             totalCheques: newStats.totalCheques,
//             availableCheques: newStats.availableCheques,
//             unreconciled: newStats.unreconciled,
//             reconciled: newStats.reconciled,
//             blankCheques: newStats.blankCheques,
//             cancelledCheques: newStats.cancelledCheques,
//             outOfPeriod: newStats.outOfPeriod
//           } 
//         : acc
//     );
//     setBankAccounts(updatedAccounts);
//   };

//   const handleAccountSelect = (account) => {
//     setSelectedAccount(account);
//     setEditingChequeId(null);
//     setFilterStatus('all');
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       available: { color: 'bg-green-100 text-green-800', label: 'Available', icon: <CheckCircle className="w-4 h-4" /> },
//       unreconciled: { color: 'bg-yellow-100 text-yellow-800', label: 'Unreconciled', icon: <Clock className="w-4 h-4" /> },
//       reconciled: { color: 'bg-blue-100 text-blue-800', label: 'Reconciled', icon: <CheckCircle className="w-4 h-4" /> },
//       blank: { color: 'bg-gray-100 text-gray-800', label: 'Blank', icon: <FileText className="w-4 h-4" /> },
//       cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
//       out_of_period: { color: 'bg-orange-100 text-orange-800', label: 'Out of Period', icon: <Calendar className="w-4 h-4" /> }
//     };
    
//     const config = statusConfig[status] || statusConfig.available;
    
//     return (
//       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
//         {config.icon}
//         <span className="ml-1">{config.label}</span>
//       </span>
//     );
//   };

//   const getAccountCheques = () => {
//     if (!selectedAccount) return [];
//     return cheques.filter(cheque => cheque.accountId === selectedAccount.id);
//   };

//   const filteredCheques = getAccountCheques().filter(cheque => {
//     // Filter by search term
//     const searchMatch = !searchTerm || 
//       cheque.chequeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       cheque.payeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       cheque.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       cheque.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       cheque.chequeBookNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
//     // Filter by status
//     const statusMatch = filterStatus === 'all' || cheque.status === filterStatus;
    
//     return searchMatch && statusMatch;
//   });

//   const handleAddCheque = () => {
//     if (!selectedAccount) {
//       alert('Please select a bank account first');
//       return;
//     }
    
//     setChequeForm({
//       chequeNumber: '',
//       chequeBookNumber: '',
//       status: 'blank',
//       amount: '',
//       dateIssued: new Date().toISOString().split('T')[0],
//       payeeName: '',
//       remarks: '',
//       type: ''
//     });
     
//     setShowAddChequeModal(true);
//   };

//   const handleEditCheque = (cheque) => {
//     setChequeForm({
//       chequeNumber: cheque.chequeNumber || '',
//       chequeBookNumber: cheque.chequeBookNumber || '',
//       status: cheque.status,
//       amount: cheque.amount || '',
//       dateIssued: cheque.dateIssued || new Date().toISOString().split('T')[0],
//       payeeName: cheque.payeeName || '',
//       remarks: cheque.remarks || '',
//       type: cheque.type || ''
//     });
    
//     setEditingChequeId(cheque.id);
//     setShowAddChequeModal(true);
//   };

//   const handleSaveCheque = (e) => {
//     e.preventDefault();
    
//     if (!chequeForm.chequeNumber && chequeForm.status !== 'blank') {
//       alert('Please enter cheque number');
//       return;
//     }
    
//     if (editingChequeId) {
//       // Update existing cheque
//       setCheques(prev => prev.map(cheque => 
//         cheque.id === editingChequeId 
//           ? { 
//               ...cheque, 
//               ...chequeForm,
//               bankName: selectedAccount.bankName
//             } 
//           : cheque
//       ));
      
//       alert('Cheque updated successfully!');
//     } else {
//       // Add new cheque
//       const newCheque = {
//         id: Math.max(...cheques.map(c => c.id)) + 1,
//         accountId: selectedAccount.id,
//         ...chequeForm,
//         bankName: selectedAccount.bankName
//       };
      
//       setCheques(prev => [...prev, newCheque]);
      
//       alert('Cheque added successfully!');
//     }
    
//     setShowAddChequeModal(false);
//     setEditingChequeId(null);
//   };

//   const handleDeleteCheque = (chequeId) => {
//     if (window.confirm('Are you sure you want to delete this cheque?')) {
//       setCheques(prev => prev.filter(cheque => cheque.id !== chequeId));
//       alert('Cheque deleted successfully!');
//     }
//   };

//   const handleAddChequesSubmit = (e) => {
//     e.preventDefault();
    
//     if (!addChequesData.numberOfLeaves) {
//       alert('Please enter number of cheque leaves');
//       return;
//     }

//     const numberOfLeaves = parseInt(addChequesData.numberOfLeaves);
//     const startNumber = addChequesData.startNumber ? parseInt(addChequesData.startNumber) : 1;
    
//     // Add multiple blank cheques
//     const newCheques = [];
//     const maxId = Math.max(...cheques.map(c => c.id));
    
//     for (let i = 0; i < numberOfLeaves; i++) {
//       const chequeNumber = addChequesData.startNumber 
//         ? (startNumber + i).toString()
//         : '';
      
//       newCheques.push({
//         id: maxId + i + 1,
//         accountId: selectedAccount.id,
//         chequeNumber: chequeNumber,
//         chequeBookNumber: addChequesData.chequeBookNumber || `CB-${selectedAccount.id}-${Date.now()}`,
//         status: 'blank',
//         amount: '',
//         dateIssued: addChequesData.issueDate || '',
//         payeeName: '',
//         remarks: 'Blank cheque leaf',
//         type: '',
//         bankName: selectedAccount.bankName
//       });
//     }
    
//     setCheques(prev => [...prev, ...newCheques]);
    
//     alert(`Added ${numberOfLeaves} cheque leaves to ${selectedAccount.accountName}`);
    
//     // Reset form
//     setAddChequesData({
//       startNumber: '',
//       endNumber: '',
//       numberOfLeaves: '',
//       chequeBookNumber: '',
//       issueDate: new Date().toISOString().split('T')[0]
//     });
//     setShowAddChequesModal(false);
//   };

//   const handleNumberOfLeavesChange = (e) => {
//     const value = e.target.value;
//     setAddChequesData(prev => ({
//       ...prev,
//       numberOfLeaves: value,
//       endNumber: ''
//     }));
//   };

//   const handleStartNumberChange = (e) => {
//     const value = e.target.value;
//     setAddChequesData(prev => {
//       const start = parseInt(value) || 0;
//       const numberOfLeaves = parseInt(prev.numberOfLeaves) || 0;
//       const end = start + numberOfLeaves - 1;
      
//       return {
//         ...prev,
//         startNumber: value,
//         endNumber: numberOfLeaves > 0 ? end.toString() : ''
//       };
//     });
//   };

//   // Add Cheque Modal Component
//   const AddChequeModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//           <h3 className="text-xl font-semibold text-gray-800">
//             {editingChequeId ? 'Edit Cheque' : 'Add New Cheque'} - {selectedAccount?.accountName}
//           </h3>
//           <button 
//             onClick={() => {
//               setShowAddChequeModal(false);
//               setEditingChequeId(null);
//             }}
//             className="text-gray-500 hover:text-gray-700 text-2xl"
//           >
//             &times;
//           </button>
//         </div>
        
//         <form onSubmit={handleSaveCheque} className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Cheque Number */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Cheque Number {chequeForm.status !== 'blank' && '*'}
//               </label>
//               <input
//                 type="text"
//                 value={chequeForm.chequeNumber}
//                 onChange={(e) => setChequeForm(prev => ({...prev, chequeNumber: e.target.value}))}
//                 placeholder="e.g., 876543"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 required={chequeForm.status !== 'blank'}
//               />
//               {chequeForm.status === 'blank' && (
//                 <p className="text-xs text-gray-500 mt-1">Leave empty for blank cheque</p>
//               )}
//             </div>

//             {/* Cheque Book Number */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Cheque Book Number
//               </label>
//               <input
//                 type="text"
//                 value={chequeForm.chequeBookNumber}
//                 onChange={(e) => setChequeForm(prev => ({...prev, chequeBookNumber: e.target.value}))}
//                 placeholder="e.g., CB-001"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>

//             {/* Status */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status *
//               </label>
//               <select
//                 value={chequeForm.status}
//                 onChange={(e) => setChequeForm(prev => ({...prev, status: e.target.value}))}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               >
//                 <option value="blank">Blank</option>
//                 <option value="available">Available</option>
//                 <option value="unreconciled">Unreconciled</option>
//                 <option value="reconciled">Reconciled</option>
//                 <option value="cancelled">Cancelled</option>
//                 <option value="out_of_period">Out of Period</option>
//               </select>
//             </div>

//             {/* Type */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Type
//               </label>
//               <select
//                 value={chequeForm.type}
//                 onChange={(e) => setChequeForm(prev => ({...prev, type: e.target.value}))}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               >
//                 <option value="">Select Type</option>
//                 <option value="issued">Issued</option>
//                 <option value="received">Received</option>
//                 <option value="canceled">Canceled</option>
//               </select>
//             </div>

//             {/* Amount */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Amount
//               </label>
//               <input
//                 type="text"
//                 value={chequeForm.amount}
//                 onChange={(e) => setChequeForm(prev => ({...prev, amount: e.target.value}))}
//                 placeholder="e.g., ₹50,000.00"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>

//             {/* Date Issued */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date Issued
//               </label>
//               <input
//                 type="date"
//                 value={chequeForm.dateIssued}
//                 onChange={(e) => setChequeForm(prev => ({...prev, dateIssued: e.target.value}))}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>

//             {/* Payee Name */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Payee Name
//               </label>
//               <input
//                 type="text"
//                 value={chequeForm.payeeName}
//                 onChange={(e) => setChequeForm(prev => ({...prev, payeeName: e.target.value}))}
//                 placeholder="Enter payee name"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>

//             {/* Remarks */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Remarks
//               </label>
//               <textarea
//                 value={chequeForm.remarks}
//                 onChange={(e) => setChequeForm(prev => ({...prev, remarks: e.target.value}))}
//                 placeholder="Enter remarks"
//                 rows="3"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={() => {
//                 setShowAddChequeModal(false);
//                 setEditingChequeId(null);
//               }}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//             >
//               <Save className="w-5 h-5 mr-2" />
//               {editingChequeId ? 'Update Cheque' : 'Add Cheque'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

//   // Add Cheques Modal Component (for multiple leaves)
//   const AddChequesModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//           <h3 className="text-xl font-semibold text-gray-800">
//             Add Cheque Leaves - {selectedAccount?.accountName}
//           </h3>
//           <button 
//             onClick={() => setShowAddChequesModal(false)}
//             className="text-gray-500 hover:text-gray-700 text-2xl"
//           >
//             &times;
//           </button>
//         </div>
        
//         <form onSubmit={handleAddChequesSubmit} className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Cheque Book Number */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Cheque Book Number
//               </label>
//               <input
//                 type="text"
//                 value={addChequesData.chequeBookNumber}
//                 onChange={(e) => setAddChequesData(prev => ({...prev, chequeBookNumber: e.target.value}))}
//                 placeholder="e.g., CB-001"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>

//             {/* Issue Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Issue Date
//               </label>
//               <input
//                 type="date"
//                 value={addChequesData.issueDate}
//                 onChange={(e) => setAddChequesData(prev => ({...prev, issueDate: e.target.value}))}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>

//             {/* Number of Leaves */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Number of Cheque Leaves *
//               </label>
//               <input
//                 type="number"
//                 value={addChequesData.numberOfLeaves}
//                 onChange={handleNumberOfLeavesChange}
//                 placeholder="e.g., 25, 50, 100"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 min="1"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">Standard: 25, 50, or 100 leaves per book</p>
//             </div>

//             {/* Start Number (Optional) */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Starting Cheque Number (Optional)
//               </label>
//               <input
//                 type="text"
//                 value={addChequesData.startNumber}
//                 onChange={handleStartNumberChange}
//                 placeholder="e.g., 876501"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               />
//             </div>

//             {/* End Number (Auto-calculated) */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Estimated End Number
//               </label>
//               <input
//                 type="text"
//                 value={addChequesData.endNumber}
//                 readOnly
//                 className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
//                 placeholder="Auto-calculated"
//               />
//               {addChequesData.numberOfLeaves && addChequesData.startNumber && (
//                 <p className="text-xs text-green-600 mt-1">
//                   Cheque numbers: {addChequesData.startNumber} to {addChequesData.endNumber}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Summary */}
//           {addChequesData.numberOfLeaves && (
//             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <h4 className="font-medium text-blue-800 mb-2 flex items-center">
//                 <FileText className="w-5 h-5 mr-2" />
//                 Summary
//               </h4>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div>
//                   <span className="text-gray-600">Bank Account:</span>
//                   <p className="font-medium">{selectedAccount?.accountName}</p>
//                 </div>
//                 <div>
//                   <span className="text-gray-600">Leaves to Add:</span>
//                   <p className="font-medium text-blue-600">{addChequesData.numberOfLeaves}</p>
//                 </div>
//                 <div>
//                   <span className="text-gray-600">New Total:</span>
//                   <p className="font-medium text-green-600">
//                     {selectedAccount ? stats.totalCheques + parseInt(addChequesData.numberOfLeaves) : 0}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-gray-600">Status:</span>
//                   <p className="font-medium">Blank (Unused)</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Form Actions */}
//           <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={() => setShowAddChequesModal(false)}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Cheque Leaves
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-2">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 shadow-lg">
//           <div className="flex flex-col md:flex-row md:items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800 flex items-center">
//                 <Wallet className="w-8 h-8 mr-3 text-blue-600" />
//                 Cheque Register
//               </h1>
//               <p className="text-gray-600 mt-1">Manage and track all your cheque transactions</p>
//             </div>
      
//             <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
//               <button
//                 onClick={handleAddCheque}
//                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//               >
//                 <Plus className="w-5 h-5 mr-2" />
//                 Add Single Cheque
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Modals */}
//         {showAddChequeModal && <AddChequeModal />}
//         {showAddChequesModal && <AddChequesModal />}

//         {/* Two Column Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Bank Accounts */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                   <Landmark className="w-5 h-5 mr-2 text-blue-600" />
//                   Bank Accounts
//                 </h3>
//                 <p className="text-sm text-gray-500">Select an account to view cheques</p>
//               </div>
              
//               <div className="divide-y divide-gray-200">
//                 {bankAccounts.map((account) => (
//                   <div 
//                     key={account.id}
//                     className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
//                       selectedAccount?.id === account.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
//                     }`}
//                     onClick={() => handleAccountSelect(account)}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center">
//                           <Wallet className="w-5 h-5 text-blue-600 mr-2" />
//                           <h4 className="font-semibold text-gray-800">{account.accountName}</h4>
//                         </div>
//                         <p className="text-sm text-gray-600 mt-1">{account.bankName}</p>
//                         <p className="text-xs text-gray-500 mt-1">Acc: {account.accountNumber}</p>
                        
//                         {/* Quick Stats */}
//                         <div className="grid grid-cols-2 gap-2 mt-3">
//                           <div className="text-center">
//                             <p className="text-2xl font-bold text-gray-800">{stats.totalCheques}</p>
//                             <p className="text-xs text-gray-500">Total</p>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-2xl font-bold text-green-600">{stats.availableCheques}</p>
//                             <p className="text-xs text-gray-500">Available</p>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="text-right">
//                         <p className="font-bold text-gray-900">{account.currentBalance}</p>
//                         <p className="text-xs text-gray-500">Balance</p>
//                       </div>
//                     </div>
                    
//                     <div className="mt-3 pt-3 border-t border-gray-100">
//                       <p className="text-xs text-gray-500">
//                         Last Reconciled: {account.lastReconciliation}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Overall Statistics */}
//             <div className="bg-white rounded-xl shadow border border-gray-200 mt-6 p-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                 <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
//                 Overall Statistics
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Total Bank Accounts</span>
//                   <span className="font-bold text-gray-800">{bankAccounts.length}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Total Cheques</span>
//                   <span className="font-bold text-gray-800">
//                     {bankAccounts.reduce((sum, acc) => sum + acc.totalCheques, 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Total Balance</span>
//                   <span className="font-bold text-green-600">
//                     ₹{bankAccounts.reduce((sum, acc) => {
//                       const balance = parseFloat(acc.currentBalance.replace(/[₹,]/g, ''));
//                       return sum + (isNaN(balance) ? 0 : balance);
//                     }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Blank Leaves</span>
//                   <span className="font-bold text-blue-600">
//                     {bankAccounts.reduce((sum, acc) => sum + acc.blankCheques, 0)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Cheque Details */}
//           <div className="lg:col-span-2">
//             {selectedAccount ? (
//               <div className="space-y-6">
//                 {/* Selected Account Header */}
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
//                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-800">{selectedAccount.accountName}</h3>
//                       <div className="flex items-center mt-2 space-x-4 text-gray-600">
//                         <span className="flex items-center">
//                           <Landmark className="w-4 h-4 mr-1" />
//                           {selectedAccount.bankName}
//                         </span>
//                         <span>•</span>
//                         <span className="flex items-center">
//                           <IndianRupee className="w-4 h-4 mr-1" />
//                           {selectedAccount.currentBalance}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="flex space-x-3">
//                       <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
//                         <Printer className="w-5 h-5 mr-2" />
//                         Print Register
//                       </button>
//                       <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
//                         <Download className="w-5 h-5 mr-2" />
//                         Export
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Cheque Statistics Cards */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   {/* Available Cheques */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-green-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-green-600">Available</p>
//                         <p className="text-2xl font-bold text-green-700 mt-1">{stats.availableCheques}</p>
//                       </div>
//                       <div className="bg-green-100 p-2 rounded-lg">
//                         <CheckCircle className="w-6 h-6 text-green-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Ready to use</p>
//                   </div>
                  
//                   {/* Unreconciled */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-yellow-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-yellow-600">Unreconciled</p>
//                         <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.unreconciled}</p>
//                       </div>
//                       <div className="bg-yellow-100 p-2 rounded-lg">
//                         <Clock className="w-6 h-6 text-yellow-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Pending reconciliation</p>
//                   </div>
                  
//                   {/* Reconciled */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-blue-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-blue-600">Reconciled</p>
//                         <p className="text-2xl font-bold text-blue-700 mt-1">{stats.reconciled}</p>
//                       </div>
//                       <div className="bg-blue-100 p-2 rounded-lg">
//                         <CheckCircle className="w-6 h-6 text-blue-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Matched with bank</p>
//                   </div>
                  
//                   {/* Blank Cheques */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-600">Blank</p>
//                         <p className="text-2xl font-bold text-gray-700 mt-1">{stats.blankCheques}</p>
//                       </div>
//                       <div className="bg-gray-100 p-2 rounded-lg">
//                         <FileText className="w-6 h-6 text-gray-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Unused cheque leaves</p>
//                   </div>
                  
//                   {/* Cancelled Cheques */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-red-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-red-600">Cancelled</p>
//                         <p className="text-2xl font-bold text-red-700 mt-1">{stats.cancelledCheques}</p>
//                       </div>
//                       <div className="bg-red-100 p-2 rounded-lg">
//                         <XCircle className="w-6 h-6 text-red-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Voided cheques</p>
//                   </div>
                  
//                   {/* Out of Period */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-orange-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-orange-600">Out of Period</p>
//                         <p className="text-2xl font-bold text-orange-700 mt-1">{stats.outOfPeriod}</p>
//                       </div>
//                       <div className="bg-orange-100 p-2 rounded-lg">
//                         <Calendar className="w-6 h-6 text-orange-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Expired/old cheques</p>
//                   </div>
                  
//                   {/* Total Cheques */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-indigo-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-indigo-600">Total Cheques</p>
//                         <p className="text-2xl font-bold text-indigo-700 mt-1">{stats.totalCheques}</p>
//                       </div>
//                       <div className="bg-indigo-100 p-2 rounded-lg">
//                         <FileText className="w-6 h-6 text-indigo-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">All cheque leaves</p>
//                   </div>
                  
//                   {/* Reconciliation Status */}
//                   <div className="bg-white rounded-xl p-4 shadow border border-purple-200">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-purple-600">Reconciliation %</p>
//                         <p className="text-2xl font-bold text-purple-700 mt-1">
//                           {stats.totalCheques > 0 ? Math.round((stats.reconciled / stats.totalCheques) * 100) : 0}%
//                         </p>
//                       </div>
//                       <div className="bg-purple-100 p-2 rounded-lg">
//                         <BarChart3 className="w-6 h-6 text-purple-600" />
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Reconciliation rate</p>
//                   </div>
//                 </div>

//                 {/* Cheque List */}
//                 <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
//                   <div className="px-6 py-4 border-b border-gray-200">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                           <FileText className="w-5 h-5 mr-2 text-blue-600" />
//                           Cheque Details
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Showing {filteredCheques.length} of {getAccountCheques().length} cheques
//                         </p>
//                       </div>
                      
//                       <div className="flex items-center space-x-4">
//                         {/* Filter by Status */}
//                         <div className="relative">
//                           <select
//                             value={filterStatus}
//                             onChange={(e) => setFilterStatus(e.target.value)}
//                             className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white"
//                           >
//                             <option value="all">All Status</option>
//                             <option value="available">Available</option>
//                             <option value="unreconciled">Unreconciled</option>
//                             <option value="reconciled">Reconciled</option>
//                             <option value="blank">Blank</option>
//                             <option value="cancelled">Cancelled</option>
//                             <option value="out_of_period">Out of Period</option>
//                           </select>
//                           <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         </div>
                        
//                         <div className="relative">
//                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                           <input
//                             type="text"
//                             placeholder="Search cheques..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
//                           />
//                         </div>
                        
//                         <button
//                           onClick={() => {
//                             setSearchTerm('');
//                             setFilterStatus('all');
//                           }}
//                           className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
//                         >
//                           <X className="w-5 h-5 mr-2" />
//                           Clear
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="flex flex-wrap gap-2">
//                       {['all', 'available', 'unreconciled', 'reconciled', 'blank', 'cancelled'].map(status => (
//                         <button
//                           key={status}
//                           onClick={() => setFilterStatus(status)}
//                           className={`px-3 py-1 text-sm rounded-full ${
//                             filterStatus === status 
//                               ? 'bg-blue-100 text-blue-800 border border-blue-300' 
//                               : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                           }`}
//                         >
//                           {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Cheque No.
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Book No.
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Status
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Amount
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Date
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Payee/Remarks
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {filteredCheques.length === 0 ? (
//                           <tr>
//                             <td colSpan="7" className="px-6 py-8 text-center">
//                               <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//                               <p className="text-gray-500">No cheques found</p>
//                               <div className="mt-4 flex justify-center space-x-4">
//                                 <button
//                                   onClick={handleAddCheque}
//                                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//                                 >
//                                   <Plus className="w-5 h-5 mr-2" />
//                                   Add Single Cheque
//                                 </button>
//                                 <button
//                                   onClick={() => setShowAddChequesModal(true)}
//                                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
//                                 >
//                                   <FilePlus className="w-5 h-5 mr-2" />
//                                   Add Multiple
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ) : (
//                           filteredCheques.map((cheque) => (
//                             <tr key={cheque.id} className="hover:bg-gray-50">
//                               <td className="px-6 py-4">
//                                 <div className="font-medium text-gray-900">
//                                   {cheque.chequeNumber || 'Blank'}
//                                   {cheque.chequeNumber && (
//                                     <span className="ml-2 text-xs text-gray-500">
//                                       <Hash className="w-3 h-3 inline" />
//                                     </span>
//                                   )}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-500">
//                                   {cheque.chequeBookNumber || '-'}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 {getStatusBadge(cheque.status)}
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="font-medium text-gray-900">
//                                   {cheque.amount || '-'}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-500">
//                                   {cheque.dateIssued || '-'}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div>
//                                   {cheque.payeeName && (
//                                     <div className="font-medium text-gray-900">{cheque.payeeName}</div>
//                                   )}
//                                   {cheque.remarks && (
//                                     <div className="text-sm text-gray-500">{cheque.remarks}</div>
//                                   )}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="flex space-x-2">
//                                   <button 
//                                     onClick={() => handleEditCheque(cheque)}
//                                     className="text-blue-600 hover:text-blue-800 p-1"
//                                     title="Edit"
//                                   >
//                                     <Edit2 className="w-5 h-5" />
//                                   </button>
//                                   <button 
//                                     onClick={() => handleDeleteCheque(cheque.id)}
//                                     className="text-red-600 hover:text-red-800 p-1"
//                                     title="Delete"
//                                   >
//                                     <Trash2 className="w-5 h-5" />
//                                   </button>
//                                   <button className="text-gray-600 hover:text-gray-800 p-1" title="View">
//                                     <Eye className="w-5 h-5" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
//                 <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//                 <h4 className="text-lg font-semibold text-gray-700 mb-2">Select a Bank Account</h4>
//                 <p className="text-gray-500">Select a bank account from the left panel to view cheque details</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Summary Chart */}
//         <div className="mt-8 bg-white rounded-xl shadow border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//             <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
//             Cheque Status Distribution
//           </h3>
//           <div className="space-y-4">
//             {[
//               { label: 'Available', value: stats.availableCheques, color: 'bg-green-500' },
//               { label: 'Unreconciled', value: stats.unreconciled, color: 'bg-yellow-500' },
//               { label: 'Reconciled', value: stats.reconciled, color: 'bg-blue-500' },
//               { label: 'Blank', value: stats.blankCheques, color: 'bg-gray-500' },
//               { label: 'Cancelled', value: stats.cancelledCheques, color: 'bg-red-500' },
//               { label: 'Out of Period', value: stats.outOfPeriod, color: 'bg-orange-500' }
//             ].map((item, index) => {
//               const percentage = stats.totalCheques > 0 ? (item.value / stats.totalCheques) * 100 : 0;
              
//               return (
//                 <div key={index} className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-700">{item.label}</span>
//                     <span className="font-medium text-gray-900">
//                       {item.value} ({percentage.toFixed(1)}%)
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className={`${item.color} h-2 rounded-full`}
//                       style={{ width: `${percentage}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChequeRegister;