// import React, { useState, useEffect } from 'react';
// import {
//   Search,
//   FilePlus,
//   Printer,
//   Eye,
//   Edit3,
//   Trash2,
//   RefreshCw,
//   Sliders,
//   CheckCircle,
//   XCircle,
//   Plus,
//   Copy,
//   Calculator,
//   DollarSign,
//   CreditCard,
//   Banknote,
//   MessageSquare,
//   Layers,
//   Activity,
//   FileSpreadsheet,
//   FileText,
//   ChevronDown,
//   ChevronsUpDown,
  
// } from 'lucide-react';

// const InvoiceManagement = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('All Months');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [sortBy, setSortBy] = useState('date');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);
//   const [expandedRows, setExpandedRows] = useState([]);



//   const statuses = [
//     'All',
//     { id: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
//     { id: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <RefreshCw className="w-4 h-4" /> },
//     { id: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
//     { id: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <FilePlus className="w-4 h-4" /> }
//   ];

//   const paymentMethods = [
//     { id: 'cash', label: 'Cash', icon: <DollarSign className="w-5 h-5" /> },
//     { id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
//     { id: 'bank', label: 'Bank Transfer', icon: <Banknote className="w-5 h-5" /> },
//     { id: 'upi', label: 'UPI', icon: <DollarSign className="w-5 h-5" /> }
//   ];

//   const [invoices, setInvoices] = useState([
//     {
//       id: 'INV-2024-001',
//       customer: {
//         name: 'ABC Enterprises Ltd.',
//         email: 'accounts@abcenterprises.com',
//         phone: '+91 9876543210',
//         gstin: '27AABCU9603R1ZX',
//         address: '123 Business Street, Mumbai, Maharashtra 400001'
//       },
//       date: '2024-01-15',
//       dueDate: '2024-02-14',
//       items: [
//         { id: 1, description: 'Premium Office Supplies', quantity: 50, rate: 1200, amount: 60000, taxRate: 18 },
//         { id: 2, description: 'Software License - Annual', quantity: 10, rate: 15000, amount: 150000, taxRate: 18 },
//         { id: 3, description: 'Technical Support Hours', quantity: 100, rate: 500, amount: 50000, taxRate: 18 }
//       ],
//       subtotal: 260000,
//       taxAmount: 46800,
//       total: 306800,
//       paidAmount: 306800,
//       balance: 0,
//       status: 'paid',
//       paymentMethod: 'bank',
//       notes: 'Payment received via NEFT',
//       createdBy: 'Admin User',
//       createdAt: '2024-01-15 10:30:00'
//     }
//   ]);

//   const stats = {
//     totalInvoices: 47,
//     totalAmount: '₹ 58,42,500',
//     pendingAmount: '₹ 12,34,200',
//     overdueAmount: '₹ 10,76,900',
//     paidAmount: '₹ 45,31,400'
//   };

//   const toggleRow = (id) => {
//     setExpandedRows(prev => 
//       prev.includes(id) 
//         ? prev.filter(rowId => rowId !== id)
//         : [...prev, id]
//     );
//   };

//   const handleCreateInvoice = () => {
//     setShowCreateModal(true);
//   };

//   const handleEditInvoice = (invoice) => {
//     setSelectedInvoice(invoice);
//     setShowCreateModal(true);
//   };

//   const handleDeleteInvoice = (id) => {
//     if (window.confirm('Are you sure you want to delete this invoice?')) {
//       setInvoices(prev => prev.filter(inv => inv.id !== id));
//     }
//   };

//   const handleDuplicateInvoice = (invoice) => {
//     const newInvoice = {
//       ...invoice,
//       id: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
//       date: new Date().toISOString().split('T')[0],
//       dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       status: 'draft',
//       paidAmount: 0,
//       balance: invoice.total,
//       createdAt: new Date().toISOString(),
//       createdBy: 'Current User'
//     };
//     setInvoices(prev => [newInvoice, ...prev]);
//   };

//   const handlePrintInvoice = (invoice) => {
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Invoice ${invoice.id}</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 40px; }
//             .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
//             .company-info { text-align: left; margin-bottom: 30px; }
//             .invoice-details { margin-bottom: 30px; }
//             table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//             th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
//             th { background-color: #f5f5f5; }
//             .total-section { margin-top: 30px; text-align: right; }
//             .terms { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
//           </style>
//         </head>
//         <body>
//           <div class="invoice-header">
//             <h1>TAX INVOICE</h1>
//             <h2>${invoice.id}</h2>
//           </div>
//           <div class="company-info">
//             <h3>Your Company Name</h3>
//             <p>123 Business Street, City, State 123456</p>
//             <p>GSTIN: 27AAAAA0000A1Z5</p>
//           </div>
//           <div class="invoice-details">
//             <p><strong>Bill To:</strong> ${invoice.customer.name}</p>
//             <p><strong>Date:</strong> ${invoice.date}</p>
//             <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
//           </div>
//           <table>
//             <thead>
//               <tr>
//                 <th>Description</th>
//                 <th>Quantity</th>
//                 <th>Rate</th>
//                 <th>Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${invoice.items.map(item => `
//                 <tr>
//                   <td>${item.description}</td>
//                   <td>${item.quantity}</td>
//                   <td>₹${item.rate.toLocaleString()}</td>
//                   <td>₹${item.amount.toLocaleString()}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
//           <div class="total-section">
//             <p><strong>Subtotal:</strong> ₹${invoice.subtotal.toLocaleString()}</p>
//             <p><strong>Tax (18%):</strong> ₹${invoice.taxAmount.toLocaleString()}</p>
//             <h3><strong>Total:</strong> ₹${invoice.total.toLocaleString()}</h3>
//           </div>
//           <div class="terms">
//             <p><strong>Payment Terms:</strong> Net 30 Days</p>
//             <p><strong>Notes:</strong> ${invoice.notes}</p>
//           </div>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const handleExport = (format) => {
//     alert(`Exporting invoices as ${format.toUpperCase()}...`);
//   };

//   const filteredInvoices = invoices.filter(invoice => {
//     const matchesSearch = 
//       invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       invoice.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    
//     const matchesMonth = selectedMonth === 'All Months' || 
//       invoice.date.includes(selectedMonth.split(' ')[0]) ||
//       invoice.date.includes(selectedMonth.split(' ')[1]);

//     return matchesSearch && matchesStatus && matchesMonth;
//   });

//   const sortedInvoices = [...filteredInvoices].sort((a, b) => {
//     switch (sortBy) {
//       case 'date':
//         return new Date(b.date) - new Date(a.date);
//       case 'amount':
//         return b.total - a.total;
//       case 'dueDate':
//         return new Date(a.dueDate) - new Date(b.dueDate);
//       default:
//         return 0;
//     }
//   });

//   const CreateInvoiceModal = () => {
//     const [formData, setFormData] = useState({
//       customer: {
//         name: '',
//         email: '',
//         phone: '',
//         gstin: '',
//         address: ''
//       },
//       date: new Date().toISOString().split('T')[0],
//       dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       items: [
//         { id: 1, description: '', quantity: 1, rate: 0, amount: 0, taxRate: 18 }
//       ],
//       notes: '',
//       paymentMethod: '',
//       status: 'draft'
//     });

//     const handleAddItem = () => {
//       setFormData(prev => ({
//         ...prev,
//         items: [
//           ...prev.items,
//           { id: prev.items.length + 1, description: '', quantity: 1, rate: 0, amount: 0, taxRate: 18 }
//         ]
//       }));
//     };

//     const handleRemoveItem = (id) => {
//       if (formData.items.length > 1) {
//         setFormData(prev => ({
//           ...prev,
//           items: prev.items.filter(item => item.id !== id)
//         }));
//       }
//     };

//     const handleItemChange = (id, field, value) => {
//       setFormData(prev => ({
//         ...prev,
//         items: prev.items.map(item => {
//           if (item.id === id) {
//             const updatedItem = { ...item, [field]: value };
//             if (field === 'quantity' || field === 'rate') {
//               updatedItem.amount = updatedItem.quantity * updatedItem.rate;
//             }
//             return updatedItem;
//           }
//           return item;
//         })
//       }));
//     };

//     const calculateTotals = () => {
//       const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
//       const taxAmount = formData.items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
//       const total = subtotal + taxAmount;
//       return { subtotal, taxAmount, total };
//     };

//     const { subtotal, taxAmount, total } = calculateTotals();

//     const handleSubmit = (e) => {
//       e.preventDefault();
//       const newInvoice = {
//         id: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
//         ...formData,
//         subtotal,
//         taxAmount,
//         total,
//         paidAmount: 0,
//         balance: total,
//         createdBy: 'Current User',
//         createdAt: new Date().toISOString()
//       };
//       setInvoices(prev => [newInvoice, ...prev]);
//       setShowCreateModal(false);
//       alert('Invoice created successfully!');
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
//           <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
//             <div className="flex items-center space-x-3">
//               <Layers className="w-8 h-8 text-blue-600" />
//               <h2 className="text-2xl font-bold text-gray-800">Create New Invoice</h2>
//             </div>
//             <button
//               onClick={() => setShowCreateModal(false)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               ✕
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Left Column - Customer Details */}
//               <div className="space-y-6">
//                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     {/* <Archive className="mr-2 text-blue-600" /> */}
//                     Customer Information
//                   </h3>
                  
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Customer Name *
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         value={formData.customer.name}
//                         onChange={(e) => setFormData(prev => ({
//                           ...prev,
//                           customer: { ...prev.customer, name: e.target.value }
//                         }))}
//                         className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter customer name"
//                       />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Email *
//                         </label>
//                         <input
//                           type="email"
//                           required
//                           value={formData.customer.email}
//                           onChange={(e) => setFormData(prev => ({
//                             ...prev,
//                             customer: { ...prev.customer, email: e.target.value }
//                           }))}
//                           className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                           placeholder="email@example.com"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Phone *
//                         </label>
//                         <input
//                           type="tel"
//                           required
//                           value={formData.customer.phone}
//                           onChange={(e) => setFormData(prev => ({
//                             ...prev,
//                             customer: { ...prev.customer, phone: e.target.value }
//                           }))}
//                           className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                           placeholder="+91 9876543210"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         GSTIN
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.customer.gstin}
//                         onChange={(e) => setFormData(prev => ({
//                           ...prev,
//                           customer: { ...prev.customer, gstin: e.target.value }
//                         }))}
//                         className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                         placeholder="27AABCU9603R1ZX"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Address
//                       </label>
//                       <textarea
//                         value={formData.customer.address}
//                         onChange={(e) => setFormData(prev => ({
//                           ...prev,
//                           customer: { ...prev.customer, address: e.target.value }
//                         }))}
//                         className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                         rows="3"
//                         placeholder="Enter full address"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Invoice Details */}
//                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     {/* <Calendar className="mr-2 text-blue-600" /> */}
//                     Invoice Details
//                   </h3>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Invoice Date *
//                       </label>
//                       <input
//                         type="date"
//                         required
//                         value={formData.date}
//                         onChange={(e) => setFormData(prev => ({
//                           ...prev,
//                           date: e.target.value
//                         }))}
//                         className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Due Date *
//                       </label>
//                       <input
//                         type="date"
//                         required
//                         value={formData.dueDate}
//                         onChange={(e) => setFormData(prev => ({
//                           ...prev,
//                           dueDate: e.target.value
//                         }))}
//                         className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                       />
//                     </div>
//                   </div>

//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Status
//                     </label>
//                     <select
//                       value={formData.status}
//                       onChange={(e) => setFormData(prev => ({
//                         ...prev,
//                         status: e.target.value
//                       }))}
//                       className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                     >
//                       <option value="draft">Draft</option>
//                       <option value="pending">Pending</option>
//                       <option value="paid">Paid</option>
//                     </select>
//                   </div>

//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Payment Method
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                       {paymentMethods.map(method => (
//                         <button
//                           type="button"
//                           key={method.id}
//                           onClick={() => setFormData(prev => ({
//                             ...prev,
//                             paymentMethod: method.id
//                           }))}
//                           className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
//                             formData.paymentMethod === method.id
//                               ? 'border-blue-500 bg-blue-50'
//                               : 'border-gray-300 hover:bg-gray-50'
//                           }`}
//                         >
//                           {method.icon}
//                           <span className="text-xs mt-1">{method.label}</span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column - Line Items */}
//               <div className="space-y-6">
//                 <div className="bg-white p-4 rounded-lg border border-gray-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                       <FileText className="mr-2 text-blue-600" />
//                       Line Items
//                     </h3>
//                     <button
//                       type="button"
//                       onClick={handleAddItem}
//                       className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
//                     >
//                       <Plus className="w-4 h-4" />
//                       <span>Add Item</span>
//                     </button>
//                   </div>

//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Description</th>
//                           <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Quantity</th>
//                           <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Rate (₹)</th>
//                           <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Tax Rate</th>
//                           <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Amount (₹)</th>
//                           <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Action</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {formData.items.map((item, index) => (
//                           <tr key={item.id} className="border-b border-gray-100">
//                             <td className="py-2 px-3">
//                               <input
//                                 type="text"
//                                 required
//                                 value={item.description}
//                                 onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
//                                 className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
//                                 placeholder="Item description"
//                               />
//                             </td>
//                             <td className="py-2 px-3">
//                               <input
//                                 type="number"
//                                 required
//                                 min="1"
//                                 value={item.quantity}
//                                 onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
//                                 className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
//                               />
//                             </td>
//                             <td className="py-2 px-3">
//                               <input
//                                 type="number"
//                                 required
//                                 min="0"
//                                 step="0.01"
//                                 value={item.rate}
//                                 onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
//                                 className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
//                               />
//                             </td>
//                             <td className="py-2 px-3">
//                               <select
//                                 value={item.taxRate}
//                                 onChange={(e) => handleItemChange(item.id, 'taxRate', parseInt(e.target.value))}
//                                 className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
//                               >
//                                 <option value="0">0%</option>
//                                 <option value="5">5%</option>
//                                 <option value="12">12%</option>
//                                 <option value="18">18%</option>
//                                 <option value="28">28%</option>
//                               </select>
//                             </td>
//                             <td className="py-2 px-3">
//                               <span className="font-medium">₹{item.amount.toLocaleString()}</span>
//                             </td>
//                             <td className="py-2 px-3">
//                               {formData.items.length > 1 && (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveItem(item.id)}
//                                   className="text-red-600 hover:text-red-800"
//                                 >
//                                   <Trash2 className="w-4 h-4" />
//                                 </button>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {/* Totals Section */}
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     <Calculator className="mr-2 text-blue-600" />
//                     Summary
//                   </h3>
                  
//                   <div className="space-y-2">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Subtotal</span>
//                       <span className="font-medium">₹{subtotal.toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Tax Amount</span>
//                       <span className="font-medium">₹{taxAmount.toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between items-center pt-2 border-t border-gray-200">
//                       <span className="text-lg font-semibold text-gray-800">Total</span>
//                       <span className="text-2xl font-bold text-blue-600">₹{total.toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Notes */}
//                 <div className="bg-white p-4 rounded-lg border border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     <MessageSquare className="mr-2 text-blue-600" />
//                     Notes
//                   </h3>
//                   <textarea
//                     value={formData.notes}
//                     onChange={(e) => setFormData(prev => ({
//                       ...prev,
//                       notes: e.target.value
//                     }))}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                     rows="3"
//                     placeholder="Add any additional notes or terms..."
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Form Actions */}
//             <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={() => setShowCreateModal(false)}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setFormData(prev => ({ ...prev, status: 'draft' }));
//                   alert('Saved as draft!');
//                 }}
//                 className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
//               >
//                 Save Draft
//               </button>
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
//               >
//                 <FilePlus className="w-4 h-4" />
//                 <span>Create Invoice</span>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     );
//   };

//   const PreviewModal = ({ invoice }) => {
//     if (!invoice) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//           <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
//             <div className="flex items-center space-x-3">
//                   <Layers className="w-8 h-8 text-blue-600" />
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800">Invoice Preview</h2>
//                 <p className="text-gray-600">{invoice.id}</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setShowPreviewModal(false)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               ✕
//             </button>
//           </div>

//           <div className="p-6">
//             {/* Invoice Header */}
//             <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800 mb-2">From</h3>
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <p className="font-semibold">Your Company Name</p>
//                     <p className="text-sm text-gray-600">123 Business Street, City, State</p>
//                     <p className="text-sm text-gray-600">GSTIN: 27AAAAA0000A1Z5</p>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To</h3>
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <p className="font-semibold">{invoice.customer.name}</p>
//                     <p className="text-sm text-gray-600">{invoice.customer.email}</p>
//                     <p className="text-sm text-gray-600">{invoice.customer.phone}</p>
//                     <p className="text-sm text-gray-600">{invoice.customer.address}</p>
//                     {invoice.customer.gstin && (
//                       <p className="text-sm text-gray-600">GSTIN: {invoice.customer.gstin}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Invoice Details */}
//             <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="text-sm text-gray-600">Invoice Number</p>
//                   <p className="font-semibold">{invoice.id}</p>
//                 </div>
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="text-sm text-gray-600">Invoice Date</p>
//                   <p className="font-semibold">{new Date(invoice.date).toLocaleDateString()}</p>
//                 </div>
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="text-sm text-gray-600">Due Date</p>
//                   <p className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
//                 </div>
//               </div>

//               {/* Line Items */}
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-gray-50">
//                       <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Description</th>
//                       <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Qty</th>
//                       <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Rate</th>
//                       <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Tax Rate</th>
//                       <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {invoice.items.map((item, index) => (
//                       <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-3 px-4">{item.description}</td>
//                         <td className="py-3 px-4">{item.quantity}</td>
//                         <td className="py-3 px-4">₹{item.rate.toLocaleString()}</td>
//                         <td className="py-3 px-4">{item.taxRate}%</td>
//                         <td className="py-3 px-4 font-medium">₹{item.amount.toLocaleString()}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Totals */}
//               <div className="mt-6 flex justify-end">
//                 <div className="w-full md:w-1/3">
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Subtotal:</span>
//                         <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Tax:</span>
//                         <span className="font-medium">₹{invoice.taxAmount.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between pt-2 border-t border-gray-200">
//                         <span className="text-lg font-semibold">Total:</span>
//                         <span className="text-xl font-bold text-blue-600">₹{invoice.total.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Paid:</span>
//                         <span className="font-medium text-green-600">₹{invoice.paidAmount.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Balance:</span>
//                         <span className={`font-medium ${
//                           invoice.balance > 0 ? 'text-red-600' : 'text-green-600'
//                         }`}>
//                           ₹{invoice.balance.toLocaleString()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Additional Information */}
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h4 className="font-semibold text-gray-800 mb-2">Status & Payment</h4>
//                   <div className="flex items-center space-x-4">
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
//                       invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                       invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
//                     </span>
//                     {invoice.paymentMethod && (
//                       <span className="text-gray-600">
//                         {paymentMethods.find(m => m.id === invoice.paymentMethod)?.label}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
//                   <p className="text-gray-600">{invoice.notes || 'No notes added'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//             <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
//             <button
//               onClick={() => setShowPreviewModal(false)}
//               className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               Close
//             </button>
//             <button
//               onClick={() => handlePrintInvoice(invoice)}
//               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
//             >
//                 <Printer className="w-4 h-4" />
//               <span>Print Invoice</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
//           <div className="flex items-center space-x-4">
//             <div className="bg-white/20 p-3 rounded-lg">
//               <Layers className="w-8 h-8" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold flex items-center">
//                 <span className="mr-2">Invoice Management</span>
//                 {/* <Activity className="w-8 h-8" />
//                 <Activity className="w-8 h-8" />
//                 <Activity className="w-8 h-8" /> */}
//               </h1>
//               <p className="text-blue-100">Professional invoice management like Tally Prime</p>
//             </div>
//           </div>
//               <button
//                 onClick={handleCreateInvoice}
//                 className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
//               >
//                 <FilePlus className="w-5 h-5" />
//                 <span>Create New Invoice</span>
//               </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-sm text-gray-600">Total Invoices</p>
//               <p className="text-3xl font-bold text-gray-800">{stats.totalInvoices}</p>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-lg">
//               {/* <BiBarChartAlt2 className="w-8 h-8 text-blue-600" /> */}
//             </div>
//           </div>
//           <div className="mt-4 text-sm text-green-600">
//             +12% from last month
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-sm text-gray-600">Total Amount</p>
//               <p className="text-3xl font-bold text-gray-800">{stats.totalAmount}</p>
//             </div>
//             <div className="bg-green-100 p-3 rounded-lg">
//               {/* <BiRupee className="w-8 h-8 text-green-600" /> */}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-sm text-gray-600">Pending Amount</p>
//               <p className="text-3xl font-bold text-gray-800">{stats.pendingAmount}</p>
//             </div>
//             <div className="bg-yellow-100 p-3 rounded-lg">
//               {/* <HiRefresh className="w-8 h-8 text-yellow-600" /> */}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-sm text-gray-600">Overdue Amount</p>
//               <p className="text-3xl font-bold text-gray-800">{stats.overdueAmount}</p>
//             </div>
//             <div className="bg-red-100 p-3 rounded-lg">
//               {/* <HiXCircle className="w-8 h-8 text-red-600" /> */}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search invoices by ID, customer, or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <Sliders className="w-5 h-5 text-gray-400" />
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {statuses.map(status => (
//                   typeof status === 'object' ? (
//                     <option key={status.id} value={status.id}>{status.label}</option>
//                   ) : (
//                     <option key={status} value={status}>{status}</option>
//                   )
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center space-x-2">
//               <ChevronsUpDown className="w-5 h-5 text-gray-400" />
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="date">Sort by Date</option>
//                 <option value="amount">Sort by Amount</option>
//                 <option value="dueDate">Sort by Due Date</option>
//               </select>
//             </div>

//             <div className="flex space-x-2">
//               <button
//                 onClick={() => handleExport('pdf')}
//                 className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
//               >
//                 <FileText className="w-4 h-4 text-red-600" />
//                 <span>PDF</span>
//               </button>
//               <button
//                 onClick={() => handleExport('excel')}
//                 className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
//               >
//                 <FileSpreadsheet className="w-4 h-4 text-green-600" />
//                 <span>Excel</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Invoices Table */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Invoice Details</th>
//                 <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Customer</th>
//                 <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Dates</th>
//                 <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Amount</th>
//                 <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
//                 <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {sortedInvoices.map((invoice) => (
//                 <React.Fragment key={invoice.id}>
//                   <tr className="hover:bg-gray-50">
//                     <td className="py-4 px-6">
//                       <div className="flex items-center">
//                         <button
//                           onClick={() => toggleRow(invoice.id)}
//                           className="mr-3 text-gray-400 hover:text-gray-600"
//                         >
//                           {expandedRows.includes(invoice.id) ? 
//                             <ChevronUp className="w-5 h-5" /> : 
//                             <ChevronDown className="w-5 h-5" />
//                           }
//                         </button>
//                         <div>
//                           <div className="font-semibold text-gray-900">{invoice.id}</div>
//                           <div className="text-sm text-gray-500">
//                             Created: {new Date(invoice.createdAt).toLocaleDateString()}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div>
//                         <div className="font-medium text-gray-900">{invoice.customer.name}</div>
//                         <div className="text-sm text-gray-500">{invoice.customer.email}</div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="text-sm">
//                         <div>Date: {new Date(invoice.date).toLocaleDateString()}</div>
//                         <div>Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div>
//                         <div className="font-semibold text-gray-900">₹{invoice.total.toLocaleString()}</div>
//                         <div className="text-sm text-gray-500">
//                           Paid: ₹{invoice.paidAmount.toLocaleString()}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       {(() => {
//                         const status = statuses.find(s => s.id === invoice.status);
//                         return status ? (
//                           <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${status.color}`}>
//                             {status.icon}
//                             <span className="ml-2">{status.label}</span>
//                           </div>
//                         ) : null;
//                       })()}
//                     </td>
//                     <td className="py-4 px-6">
//                       <div className="flex items-center space-x-3">
//                         <button
//                           onClick={() => {
//                             setSelectedInvoice(invoice);
//                             setShowPreviewModal(true);
//                           }}
//                           className="text-blue-600 hover:text-blue-800"
//                           title="View"
//                         >
//                           <Eye className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleEditInvoice(invoice)}
//                           className="text-green-600 hover:text-green-800"
//                           title="Edit"
//                         >
//                           <Edit3 className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleDuplicateInvoice(invoice)}
//                           className="text-purple-600 hover:text-purple-800"
//                           title="Duplicate"
//                         >
//                           <Copy className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handlePrintInvoice(invoice)}
//                           className="text-gray-600 hover:text-gray-800"
//                           title="Print"
//                         >
//                           <Printer className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteInvoice(invoice.id)}
//                           className="text-red-600 hover:text-red-800"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
                  
//                   {/* Expanded Row */}
//                   {expandedRows.includes(invoice.id) && (
//                     <tr>
//                       <td colSpan="6" className="px-6 py-4 bg-gray-50">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                           <div>
//                             <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
//                             <ul className="space-y-2 text-sm">
//                               {invoice.items.map(item => (
//                                 <li key={item.id} className="flex justify-between">
//                                   <span className="text-gray-600">{item.description}</span>
//                                   <span className="font-medium">₹{item.amount.toLocaleString()}</span>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                           <div>
//                             <h4 className="font-semibold text-gray-700 mb-2">Payment Details</h4>
//                             <dl className="space-y-1 text-sm">
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Subtotal:</dt>
//                                 <dd className="font-medium">₹{invoice.subtotal.toLocaleString()}</dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Tax:</dt>
//                                 <dd className="font-medium">₹{invoice.taxAmount.toLocaleString()}</dd>
//                               </div>
//                               <div className="flex justify-between">
//                                 <dt className="text-gray-500">Total:</dt>
//                                 <dd className="font-semibold">₹{invoice.total.toLocaleString()}</dd>
//                               </div>
//                             </dl>
//                           </div>
//                           <div>
//                             <h4 className="font-semibold text-gray-700 mb-2">Additional Info</h4>
//                             <div className="space-y-2 text-sm">
//                               <div>
//                                 <span className="text-gray-500">Payment Method:</span>
//                                 <span className="ml-2 font-medium">
//                                   {invoice.paymentMethod ? 
//                                     paymentMethods.find(m => m.id === invoice.paymentMethod)?.label : 
//                                     'Not specified'}
//                                 </span>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500">Notes:</span>
//                                 <p className="mt-1 text-gray-600">{invoice.notes || 'No notes'}</p>
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

//         {sortedInvoices.length === 0 && (
//           <div className="text-center py-12">
//               <FilePlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-800 mb-2">No invoices found</h3>
//             <p className="text-gray-600">Try adjusting your search or filter criteria</p>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="bg-white rounded-xl border border-gray-200 p-4">
//         <div className="flex justify-between items-center">
//           <div className="text-sm text-gray-600">
//             Showing {sortedInvoices.length} of {invoices.length} invoices
//           </div>
//           <div className="flex items-center space-x-2">
//             <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
//               Previous
//             </button>
//             <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
//               1
//             </button>
//             <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
//               2
//             </button>
//             <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
//               3
//             </button>
//             <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showCreateModal && <CreateInvoiceModal />}
//       {showPreviewModal && <PreviewModal invoice={selectedInvoice} />}
//     </div>
//   );
// };

// export default InvoiceManagement;




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiSearch,
  HiDocumentAdd,
  HiPrinter,
  HiDownload,
  HiEye,
  HiPencilAlt,
  HiTrash,
  HiRefresh,
  HiFilter,
  HiCheckCircle,
  HiXCircle,
  HiPlus,
  HiOutlineDocumentDuplicate,
  HiCalculator,

  HiChatAlt2,
  HiShoppingCart,
  HiDocumentText
} from 'react-icons/hi';
import {
  BiChevronDown,
  BiChevronUp,
  BiCalendar,
  BiSortAlt2,
  BiBarChartAlt2,
  BiRupee,
  BiReceipt,
  BiPackage
} from 'react-icons/bi';
import { FaFileExcel, FaFilePdf, FaWarehouse } from 'react-icons/fa';
import { MdOutlineAttachMoney, MdOutlineInventory2 } from 'react-icons/md';
import { useCompany } from "../context/CompanyContext";

const InvoiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherItems, setVoucherItems] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stats, setStats] = useState({
    totalVouchers: 0,
    totalAmount: 0,
    thisMonthAmount: 0,
    pendingAmount: 0
  });

  const { companyId } = useCompany();

  const statuses = [
    'All',
    { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: <HiCheckCircle className="w-4 h-4" /> },
    { id: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <HiRefresh className="w-4 h-4" /> },
    { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <HiXCircle className="w-4 h-4" /> },
    { id: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <HiDocumentAdd className="w-4 h-4" /> }
  ];

  const gstRates = [0, 5, 12, 18, 28];

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch all vouchers
  const fetchVouchers = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/${companyId}`);
      console.log(response);
      
      const vouchersData = response.data;
      setVouchers(vouchersData);

      // Calculate stats
      const totalAmount = vouchersData.reduce((sum, voucher) => sum + parseFloat(voucher.grand_total || 0), 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthAmount = vouchersData.reduce((sum, voucher) => {
        const voucherDate = new Date(voucher.date);
        if (voucherDate.getMonth() === currentMonth && voucherDate.getFullYear() === currentYear) {
          return sum + parseFloat(voucher.grand_total || 0);
        }
        return sum;
      }, 0);

      setStats({
        totalVouchers: vouchersData.length,
        totalAmount,
        thisMonthAmount,
        pendingAmount: 0 // You might want to calculate this based on your business logic
      });

      // Fetch items for each voucher
      for (const voucher of vouchersData) {
        await fetchVoucherItems(voucher.id);
      }

    } catch (error) {
      console.error('Error fetching vouchers:', error);
      alert('Failed to load purchase vouchers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch items for a specific voucher
  const fetchVoucherItems = async (voucherId) => {
    console.log(voucherId);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/purchase-voucher/getItems/${voucherId}`);
      console.log(response);
      
      setVoucherItems(prev => ({
        ...prev,
        [voucherId]: response.data.items || response.data
      }));
    } catch (error) {
      console.error(`Error fetching items for voucher ${voucherId}:`, error);
    }
  };

  // Fetch ledgers
  const fetchLedgers = async () => {
    if (!companyId) return;
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/ledgers/${companyId}`);
      setLedgers(response.data);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      // For demo, using static data
      setLedgers([
        { id: 22, name: 'Sundry Creditors' },
        { id: 23, name: 'Cash Account' },
        { id: 24, name: 'Bank Account' }
      ]);
    }
  };

  // Fetch stocks
  const fetchStocks = async () => {
    if (!companyId) return;
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/stocks/${companyId}`);
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      // For demo, using static data
      setStocks([
        { id: 1, name: 'Raw Materials' },
        { id: 2, name: 'Office Supplies' },
        { id: 3, name: 'Electronics' },
        { id: 4, name: 'Furniture' }
      ]);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchVouchers();
      fetchLedgers();
      fetchStocks();
    }
  }, [companyId]);

  const toggleRow = (id) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleCreateVoucher = () => {
    setSelectedVoucher(null);
    setShowCreateModal(true);
  };

  const handleEditVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setShowCreateModal(true);
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this voucher?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/purchase-vouchers/${id}`);
      alert('Voucher deleted successfully');
      fetchVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Failed to delete voucher');
    }
  };

  const handlePrintVoucher = (voucher) => {
    const items = voucherItems[voucher.id] || [];
    const printWindow = window.open('', '_blank');
    
    const itemsHtml = items.length > 0 
      ? items.map(item => `
          <tr>
            <td>${item.item_name}</td>
            <td>${item.qty}</td>
            <td>₹${parseFloat(item.rate || 0).toLocaleString('en-IN')}</td>
            <td>₹${parseFloat(item.amount || 0).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" style="text-align: center;">No items found</td></tr>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Voucher ${voucher.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .voucher-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .company-info { text-align: left; margin-bottom: 30px; }
            .voucher-details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total-section { margin-top: 30px; text-align: right; }
            .terms { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
            .signature { margin-top: 100px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="voucher-header">
            <h1>PURCHASE VOUCHER</h1>
            <h2>PV No: ${voucher.id}</h2>
          </div>
          
          <div class="voucher-details">
            <p><strong>Date:</strong> ${formatDate(voucher.date)}</p>
            <p><strong>Supplier:</strong> ${voucher.customer || 'Not specified'}</p>
            <p><strong>Ledger:</strong> ${ledgers.find(l => l.id === voucher.ledgerId)?.name || 'N/A'}</p>
            <p><strong>Company ID:</strong> ${companyId}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total-section">
            <p><strong>Subtotal:</strong> ₹${parseFloat(voucher.subtotal || 0).toLocaleString('en-IN')}</p>
            <p><strong>GST (${voucher.gst_percentage || 0}%):</strong> ₹${parseFloat(voucher.gst_amount || 0).toLocaleString('en-IN')}</p>
            <h3><strong>Grand Total:</strong> ₹${parseFloat(voucher.grand_total || 0).toLocaleString('en-IN')}</h3>
          </div>
          
          <div class="terms">
            <p><strong>Narration:</strong> ${voucher.narration || 'No narration'}</p>
            <p><strong>Created:</strong> ${formatDate(voucher.created_at)}</p>
          </div>
          
          <div class="signature">
            <div>
              <p>___________________</p>
              <p>Prepared By</p>
            </div>
            <div>
              <p>___________________</p>
              <p>Authorized Signatory</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = (format) => {
    const data = vouchers;
    if (format === 'excel') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + [
          ['Voucher ID', 'Date', 'Supplier', 'Subtotal', 'GST %', 'GST Amount', 'Grand Total', 'Narration', 'Created At'],
          ...data.map(voucher => [
            voucher.id,
            formatDate(voucher.date),
            voucher.customer,
            voucher.subtotal,
            voucher.gst_percentage,
            voucher.gst_amount,
            voucher.grand_total,
            voucher.narration,
            formatDate(voucher.created_at)
          ])
        ].map(row => row.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `purchase_vouchers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
    } else {
      alert(`Exporting vouchers as ${format.toUpperCase()}...`);
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = 
      voucher.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (voucher.customer && voucher.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (voucher.narration && voucher.narration.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All';
    
    const matchesMonth = selectedMonth === 'All Months' || 
      formatDate(voucher.date).toLowerCase().includes(selectedMonth.toLowerCase());

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return parseFloat(b.grand_total) - parseFloat(a.grand_total);
      default:
        return 0;
    }
  });

  const CreateVoucherModal = () => {
    const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      customer: '',
      ledger: ledgers.length > 0 ? ledgers[0].id : '',
      narration: '',
      items: [
        { id: 1, item: '', qty: 1, rate: 0, amount: 0 }
      ],
      subtotal: 0,
      gst_percentage: 0,
      gst_amount: 0,
      grand_total: 0
    });

    // Reset form when modal opens with selected voucher
    useEffect(() => {
      if (selectedVoucher) {
        setFormData({
          date: selectedVoucher.date ? selectedVoucher.date.split('T')[0] : new Date().toISOString().split('T')[0],
          customer: selectedVoucher.customer || '',
          ledger: selectedVoucher.ledgerId || (ledgers.length > 0 ? ledgers[0].id : ''),
          narration: selectedVoucher.narration || '',
          items: [{ id: 1, item: '', qty: 1, rate: 0, amount: 0 }],
          subtotal: parseFloat(selectedVoucher.subtotal) || 0,
          gst_percentage: parseFloat(selectedVoucher.gst_percentage) || 0,
          gst_amount: parseFloat(selectedVoucher.gst_amount) || 0,
          grand_total: parseFloat(selectedVoucher.grand_total) || 0
        });
        
        // Fetch items for editing
        if (selectedVoucher.id) {
          fetchVoucherItems(selectedVoucher.id).then(items => {
            if (items && items.length > 0) {
              setFormData(prev => ({
                ...prev,
                items: items.map((item, index) => ({
                  id: index + 1,
                  item: item.item_name,
                  qty: item.qty,
                  rate: item.rate,
                  amount: item.amount
                }))
              }));
            }
          });
        }
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          customer: '',
          ledger: ledgers.length > 0 ? ledgers[0].id : '',
          narration: '',
          items: [
            { id: 1, item: '', qty: 1, rate: 0, amount: 0 }
          ],
          subtotal: 0,
          gst_percentage: 0,
          gst_amount: 0,
          grand_total: 0
        });
      }
    }, [selectedVoucher, ledgers]);

    const handleAddItem = () => {
      setFormData(prev => ({
        ...prev,
        items: [
          ...prev.items,
          { id: prev.items.length + 1, item: '', qty: 1, rate: 0, amount: 0 }
        ]
      }));
    };

    const handleRemoveItem = (id) => {
      if (formData.items.length > 1) {
        setFormData(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== id)
        }));
      }
    };

    const handleItemChange = (id, field, value) => {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item => {
          if (item.id === id) {
            const updatedItem = { ...item, [field]: value };
            if (field === 'qty' || field === 'rate') {
              updatedItem.amount = (parseFloat(updatedItem.qty) || 0) * (parseFloat(updatedItem.rate) || 0);
            }
            return updatedItem;
          }
          return item;
        })
      }), () => {
        // Recalculate totals after state update
        setTimeout(calculateTotals, 0);
      });
    };

    const calculateTotals = () => {
      const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const gstAmount = subtotal * (parseFloat(formData.gst_percentage) / 100);
      const grandTotal = subtotal + gstAmount;
      
      setFormData(prev => ({
        ...prev,
        subtotal,
        gst_amount: gstAmount,
        grand_total: grandTotal
      }));
    };

    useEffect(() => {
      calculateTotals();
    }, [formData.items, formData.gst_percentage]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!companyId) {
        alert('Company ID is required');
        return;
      }

      // Validate required fields
      if (!formData.customer.trim()) {
        alert('Customer name is required');
        return;
      }

      if (!formData.ledger) {
        alert('Please select a ledger');
        return;
      }

      // Validate items
      const invalidItems = formData.items.filter(item => !item.item.trim() || item.qty <= 0 || item.rate <= 0);
      if (invalidItems.length > 0) {
        alert('Please fill all item fields with valid values');
        return;
      }

      try {
        const payload = {
          companyId,
          date: formData.date,
          customer: formData.customer,
          ledger: formData.ledger,
          subtotal: formData.subtotal,
          gst_percentage: formData.gst_percentage,
          gst_amount: formData.gst_amount,
          grand_total: formData.grand_total,
          narration: formData.narration,
          items: formData.items.map(item => ({
            item: item.item,
            qty: parseFloat(item.qty),
            rate: parseFloat(item.rate),
            amount: parseFloat(item.amount)
          }))
        };

        if (selectedVoucher) {
          // Update existing voucher
          await axios.put(`${import.meta.env.VITE_ACCOUNTING_URL}/api/purchase-vouchers/${selectedVoucher.id}`, payload);
          alert('Voucher updated successfully!');
        } else {
          // Create new voucher
          await axios.post(`${import.meta.env.VITE_ACCOUNTING_URL}/api/purchase-vouchers`, payload);
          alert('Purchase Voucher created successfully!');
        }

        setShowCreateModal(false);
        fetchVouchers();
      } catch (error) {
        console.error('Error saving voucher:', error);
        alert(`Failed to save voucher: ${error.response?.data?.error || error.message}`);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center space-x-3">
              <HiShoppingCart className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedVoucher ? 'Edit Purchase Voucher' : 'Create Purchase Voucher'}
              </h2>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Details */}
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BiCalendar className="mr-2 text-blue-600" />
                    Voucher Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier/Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Enter supplier name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ledger *
                      </label>
                      <select
                        required
                        value={formData.ledger}
                        onChange={(e) => setFormData(prev => ({ ...prev, ledger: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="">Select Ledger</option>
                        {ledgers.map(ledger => (
                          <option key={ledger.id} value={ledger.id}>
                            {ledger.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Percentage *
                      </label>
                      <select
                        required
                        value={formData.gst_percentage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          gst_percentage: e.target.value 
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        {gstRates.map(rate => (
                          <option key={rate} value={rate}>
                            {rate}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiChatAlt2 className="mr-2 text-blue-600" />
                    Narration
                  </h3>
                  <textarea
                    value={formData.narration}
                    onChange={(e) => setFormData(prev => ({ ...prev, narration: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows="4"
                    placeholder="Enter narration or remarks..."
                  />
                </div>
              </div>

              {/* Right Column - Items & Totals */}
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <BiPackage className="mr-2 text-blue-600" />
                      Purchase Items
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <HiPlus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Item Name</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Qty</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Rate</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Amount</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                required
                                list="stockItems"
                                value={item.item}
                                onChange={(e) => handleItemChange(item.id, 'item', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                placeholder="Enter item name"
                              />
                              <datalist id="stockItems">
                                {stocks.map(stock => (
                                  <option key={stock.id} value={stock.name} />
                                ))}
                              </datalist>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                required
                                min="1"
                                step="0.01"
                                value={item.qty}
                                onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-medium">₹{item.amount.toLocaleString('en-IN')}</span>
                            </td>
                            <td className="py-2 px-3">
                              {formData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiCalculator className="mr-2 text-blue-600" />
                    Summary
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{formData.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GST ({formData.gst_percentage}%):</span>
                      <span className="font-medium">₹{formData.gst_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{formData.grand_total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
              >
                <HiDocumentAdd className="w-4 h-4" />
                <span>{selectedVoucher ? 'Update Voucher' : 'Create Voucher'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const PreviewModal = ({ voucher }) => {
    if (!voucher) return null;

    const items = voucherItems[voucher.id] || [];
    const ledgerName = ledgers.find(l => l.id === voucher.ledgerId)?.name || 'N/A';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center space-x-3">
              <HiShoppingCart className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Purchase Voucher Details</h2>
                <p className="text-gray-600">Voucher ID: {voucher.id}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPreviewModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {/* Voucher Header */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Company Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">Company ID: {companyId}</p>
                    <p className="text-sm text-gray-600">Voucher created via Invoice Management System</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Supplier Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">{voucher.customer || 'Not specified'}</p>
                    <p className="text-sm text-gray-600">Ledger: {ledgerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Voucher Date</p>
                  <p className="font-semibold">{formatDate(voucher.date)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Created On</p>
                  <p className="font-semibold">{formatDate(voucher.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">GST Rate</p>
                  <p className="font-semibold">{voucher.gst_percentage}%</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Item Name</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Quantity</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Rate</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{item.item_name}</td>
                          <td className="py-3 px-4">{item.qty}</td>
                          <td className="py-3 px-4">{formatCurrency(item.rate)}</td>
                          <td className="py-3 px-4 font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-gray-500">
                          ...no data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(voucher.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST ({voucher.gst_percentage}%):</span>
                        <span className="font-medium">{formatCurrency(voucher.gst_amount)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-lg font-semibold">Grand Total:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(voucher.grand_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Narration */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Narration</h4>
              <p className="text-gray-600">{voucher.narration || 'No narration provided'}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => handlePrintVoucher(voucher)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
            >
              <HiPrinter className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-xl p-3 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <HiShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Purchase Voucher Management</h1>
              <p className="text-blue-100">Manage all your purchase invoices and vouchers</p>
            </div>
          </div>
       
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by voucher ID, supplier, or narration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <HiFilter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  typeof status === 'object' ? (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ) : (
                    <option key={status} value={status}>{status}</option>
                  )
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <BiSortAlt2 className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date (Newest First)</option>
                <option value="amount">Sort by Amount (Highest First)</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <FaFilePdf className="w-4 h-4 text-red-600" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <FaFileExcel className="w-4 h-4 text-green-600" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Vouchers Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Voucher Details</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Supplier</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedVouchers.map((voucher) => (
                    <React.Fragment key={voucher.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleRow(voucher.id)}
                              className="mr-3 text-gray-400 hover:text-gray-600"
                            >
                              {expandedRows.includes(voucher.id) ? 
                                <BiChevronUp className="w-5 h-5" /> : 
                                <BiChevronDown className="w-5 h-5" />
                              }
                            </button>
                            <div>
                              <div className="font-semibold text-gray-900">Voucher #{voucher.id}</div>
                              <div className="text-sm text-gray-500">
                                Created: {formatDate(voucher.created_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">{voucher.customer || 'N/A'}</div>
                            <div className="text-sm text-gray-500">
                              {ledgers.find(l => l.id === voucher.ledgerId)?.name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div>{formatDate(voucher.date)}</div>
                            <div className="text-gray-500">
                              GST: {voucher.gst_percentage}%
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(voucher.grand_total)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Subtotal: {formatCurrency(voucher.subtotal)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedVoucher(voucher);
                                setShowPreviewModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <HiEye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditVoucher(voucher)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <HiPencilAlt className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handlePrintVoucher(voucher)}
                              className="text-gray-600 hover:text-gray-800"
                              title="Print"
                            >
                              <HiPrinter className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVoucher(voucher.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      {expandedRows.includes(voucher.id) && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                                {voucherItems[voucher.id]?.length > 0 ? (
                                  <ul className="space-y-2 text-sm">
                                    {voucherItems[voucher.id].map((item, index) => (
                                      <li key={index} className="flex justify-between">
                                        <span className="text-gray-600">{item.item_name}</span>
                                        <span className="font-medium">
                                          {item.qty} x {formatCurrency(item.rate)} = {formatCurrency(item.amount)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 text-sm">...no data found</p>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
                                <dl className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Subtotal:</dt>
                                    <dd className="font-medium">{formatCurrency(voucher.subtotal)}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">GST ({voucher.gst_percentage}%):</dt>
                                    <dd className="font-medium">{formatCurrency(voucher.gst_amount)}</dd>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <dt className="font-semibold">Grand Total:</dt>
                                    <dd className="font-semibold">{formatCurrency(voucher.grand_total)}</dd>
                                  </div>
                                </dl>
                                {voucher.narration && (
                                  <div className="mt-4">
                                    <h5 className="font-medium text-gray-700 mb-1">Narration:</h5>
                                    <p className="text-sm text-gray-600">{voucher.narration}</p>
                                  </div>
                                )}
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

            {sortedVouchers.length === 0 && !loading && (
              <div className="text-center py-12">
                <HiDocumentAdd className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">...no data found</h3>
                <p className="text-gray-600">Create your first purchase voucher to get started</p>
                <button
                  onClick={handleCreateVoucher}
                  className="mt-4 inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>Create Voucher</span>
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {sortedVouchers.length} of {vouchers.length} vouchers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchVouchers}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <HiRefresh className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showCreateModal && <CreateVoucherModal />}
      {showPreviewModal && <PreviewModal voucher={selectedVoucher} />}
    </div>
  );
};

export default InvoiceManagement;