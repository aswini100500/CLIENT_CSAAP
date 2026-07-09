

// import React, { useState, useEffect } from 'react';

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
//   const [showExportMenu, setShowExportMenu] = useState(false);
//   const [selectedStock, setSelectedStock] = useState(null);
//   const [isAddingStock, setIsAddingStock] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [newStock, setNewStock] = useState({
//     name: '',
//     alias: '',
//     under: 'Raw Materials',
//     units: 'Nos',
//     maintainInBatches: false,
//     trackDateOfManufacture: false,
//     expiryDateOfBatches: false,
//     rateOfDuty: '0.00',
//     gstApplicable: 'Applicable',
//     hsn: '',
//     openingBalanceQty: '0.00',
//     openingBalanceRate: '0.00',
//     openingBalanceValue: '0.00'
//   });

//   const [categories] = useState([
//     'Raw Materials',
//     'Finished Goods',
//     'Semi-Finished Goods',
//     'Consumables',
//     'Work in Progress',
//     'Trading Goods'
//   ]);

//   const [units] = useState([
//     'Nos',
//     'Kg',
//     'Grams',
//     'Liters',
//     'Meters',
//     'Pieces',
//     'Boxes',
//     'Cartons',
//     'Bags'
//   ]);
//   const { companyId, employees } = useCompany();
//   useEffect(() => {
//     fetchStockData();
//   }, [companyId]);

//   const fetchStockData = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockData/${companyId}`);
//       console.log(response);

//       if (response.data.message === "Data fetched successfully") {
//         setStocks(response.data.data);
//         Swal.fire({
//           icon: 'success',
//           title: 'Data Loaded',
//           text: `${response.data.data.length} stock items loaded`,
//           timer: 1500,
//           showConfirmButton: false
//         });
//       } else {
//         throw new Error('Failed to fetch stock data');
//       }
//     } catch (err) {
//       setError(err.message);
//       Swal.fire('Error', 'Failed to load stock data: ' + err.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleAddStock = async () => {
//   //   try {
//   //     const response = await axios.post(`http://localhost:3000/api/v1/stock/createStock/${companyId}`, newStock);

//   //     if (response.data.message === "Stock created successfully") {
//   //       fetchStockData();
//   //       setNewStock({
//   //         name: '',
//   //         alias: '',
//   //         under: 'Raw Materials',
//   //         units: 'Nos',
//   //         maintainInBatches: false,
//   //         trackDateOfManufacture: false,
//   //         expiryDateOfBatches: false,
//   //         rateOfDuty: '0.00',
//   //         gstApplicable: 'Applicable',
//   //         hsn: '',
//   //         openingBalanceQty: '0.00',
//   //         openingBalanceRate: '0.00',
//   //         openingBalanceValue: '0.00'
//   //       });
//   //       setIsAddingStock(false);
//   //     }
//   //   } catch (err) {
//   //     alert('Error adding stock: ' + err.message);
//   //   }
//   // };

//   const handleUpdateStock = async () => {
//     if (!selectedStock) return;

//     try {
//       const response = await axios.put(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/updateStock/${companyId}/${selectedStock.id}`, newStock);

//       if (response.data.message === "Stock updated successfully") {
//         Swal.fire({
//           icon: 'success',
//           title: 'Stock Updated',
//           text: `${newStock.name} has been updated successfully`,
//           timer: 2000,
//           showConfirmButton: false
//         });
//         fetchStockData();
//         setIsEditing(false);
//         setSelectedStock(null);
//         setNewStock({
//           name: '',
//           alias: '',
//           under: 'Raw Materials',
//           units: 'Nos',
//           maintainInBatches: false,
//           trackDateOfManufacture: false,
//           expiryDateOfBatches: false,
//           rateOfDuty: '0.00',
//           gstApplicable: 'Applicable',
//           hsn: '',
//           openingBalanceQty: '0.00',
//           openingBalanceRate: '0.00',
//           openingBalanceValue: '0.00'
//         });
//       }
//     } catch (err) {
//       Swal.fire('Error', 'Error updating stock: ' + err.message, 'error');
//       console.log(err);

//     }
//   };

//   const handleDeleteStock = async (id) => {
//     const stockName = stocks.find(s => s.id === id)?.name || 'Stock item';

//     Swal.fire({
//       title: 'Delete Stock Item?',
//       text: `Are you sure you want to delete "${stockName}"? This action cannot be undone.`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#dc2626',
//       cancelButtonColor: '#6b7280',
//       confirmButtonText: 'Yes, Delete',
//       cancelButtonText: 'Cancel'
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const response = await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/deleteStock/${companyId}/${id}`);

//           if (response.data.message === "Stock deleted successfully") {
//             Swal.fire({
//               icon: 'success',
//               title: 'Deleted!',
//               text: `${stockName} has been deleted successfully`,
//               timer: 2000,
//               showConfirmButton: false
//             });
//             fetchStockData();
//             if (selectedStock?.id === id) {
//               setSelectedStock(null);
//             }
//           }
//         } catch (err) {
//           Swal.fire('Error', 'Error deleting stock: ' + err.message, 'error');
//         }
//       }
//     });
//   };

//   const userStr = sessionStorage.getItem("user");
//   let loggedInRole = "admin";
//   let loggedInEmployeeId = null;
//   if (userStr) {
//     const userObj = JSON.parse(userStr);
//     loggedInRole = userObj.role?.toLowerCase() || "admin";
//     loggedInEmployeeId = userObj.employee_id || null;
//   }
//   const isEmployeeDashboard = loggedInRole === 'employee';
//   const getEmployeeName = (id) => {
//       const emp = employees?.find(e => e.id == id);
//       return emp ? emp.name : "Unknown Employee";
//   };
//
//   const filteredStocks = stocks.filter(stock => {
//     if (isEmployeeDashboard) {
//         if (stock.employee_id != loggedInEmployeeId) return false;
//     } else {
//         const isCreatedByEmployee = stock.employee_id && (stock.role?.toLowerCase() === 'employee');
//         if (showEmployeeActivity) {
//             if (!isCreatedByEmployee) return false;
//         } else {
//             if (isCreatedByEmployee) return false;
//         }
//     }
//     return stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.hsn.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stock.under.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   const calculateTotalValue = () => {
//     return stocks.reduce((total, stock) => total + parseFloat(stock.openingBalanceValue), 0);
//   };

//   const handleEditClick = (stock) => {
//     Swal.fire({
//       icon: 'info',
//       title: 'Edit Stock Item',
//       text: `Editing: ${stock.name}`,
//       timer: 1500,
//       showConfirmButton: false
//     });
//     setSelectedStock(stock);
//     setNewStock({
//       name: stock.name,
//       alias: stock.alias,
//       under: stock.under,
//       units: stock.units,
//       maintainInBatches: stock.maintainInBatches === 1,
//       trackDateOfManufacture: stock.trackDateOfManufacture === 1,
//       expiryDateOfBatches: stock.expiryDateOfBatches === 1,
//       rateOfDuty: stock.rateOfDuty,
//       gstApplicable: stock.gstApplicable,
//       hsn: stock.hsn,
//       openingBalanceQty: stock.openingBalanceQty,
//       openingBalanceRate: stock.openingBalanceRate,
//       openingBalanceValue: stock.openingBalanceValue
//     });
//     setIsEditing(true);
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const exportToCSV = () => {
//     const csvData = [];

//     // Add headers
//     csvData.push(['Name', 'Alias', 'Category', 'Units', 'HSN', 'GST Applicable', 'Opening Qty', 'Opening Rate', 'Opening Value']);

//     // Add data
//     stocks.forEach(stock => {
//       csvData.push([
//         stock.name,
//         stock.alias,
//         stock.under,
//         stock.units,
//         stock.hsn,
//         stock.gstApplicable,
//         stock.openingBalanceQty,
//         stock.openingBalanceRate,
//         stock.openingBalanceValue
//       ]);
//     });

//     // Add total
//     csvData.push([]);
//     csvData.push(['Total Opening Value', '', '', '', '', '', '', '', calculateTotalValue()]);

//     const csvContent = csvData.map(row => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `stock_list_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading Stock Data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-600 text-lg font-semibold">Error</div>
//           <p className="text-gray-600 mt-2">{error}</p>
//           <button
//             onClick={fetchStockData}
//             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Print Styles */}
//       <style jsx global>{`
//         @media print {
//           .no-print {
//             display: none !important;
//           }
//           .printable-content {
//             background: white !important;
//           }
//           table {
//             page-break-inside: auto;
//           }
//           tr {
//             page-break-inside: avoid;
//             page-break-after: auto;
//           }
//         }
//       `}</style>

//       <div className="min-h-screen bg-gray-50 p-6 printable-content">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">Stock List</h1>
//                 <p className="text-gray-600 mt-1">Manage your inventory items</p>
//               </div>
//               <div className="flex gap-3 no-print">
//                 {/* <button
//                   onClick={() => setIsAddingStock(true)}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                   </svg>
//                   Add Stock
//                 </button> */}
//                 <button
//                   onClick={handlePrint}
//                   className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//                   </svg>
//                   Print
//                 </button>
//                 <button
//                   onClick={exportToCSV}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   Export CSV
//                 </button>
//               </div>
//             </div>

//             {/* Search Bar */}
//             <div className="mt-6">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search by name, alias, HSN, or category..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="text-sm text-gray-500">Total Stock Items</div>
//               <div className="text-2xl font-bold text-gray-800">{stocks.length}</div>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="text-sm text-gray-500">Total Opening Value</div>
//               <div className="text-2xl font-bold text-blue-600">₹{calculateTotalValue().toFixed(2)}</div>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="text-sm text-gray-500">Categories</div>
//               <div className="text-2xl font-bold text-green-600">
//                 {[...new Set(stocks.map(stock => stock.under))].length}
//               </div>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="text-sm text-gray-500">Average Rate</div>
//               <div className="text-2xl font-bold text-purple-600">
//                 {stocks.length > 0 ?
//                   (stocks.reduce((sum, stock) => sum + parseFloat(stock.openingBalanceRate), 0) / stocks.length).toFixed(2) :
//                   '0.00'
//                 }
//               </div>
//             </div>
//           </div>

//           {/* Stock List Table */}
//           <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//             <div className="bg-gray-50 px-6 py-4 border-b">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 Stock Items ({filteredStocks.length})
//               </h2>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Alias
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Category
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Units
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       HSN
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       GST
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Opening Qty
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Rate (₹)
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Value (₹)
//                     </th>
//                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredStocks.map((stock) => (
//                     <tr
//                       key={stock.id}
//                       className="hover:bg-gray-50 cursor-pointer"
//                       onClick={() => setSelectedStock(stock)}
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="font-medium text-gray-900">{stock.name}</div>
//                         <div className="text-xs text-gray-500">
//                           {stock.maintainInBatches === 1 && (
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mr-1">
//                               Batches
//                             </span>
//                           )}
//                           {stock.trackDateOfManufacture === 1 && (
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mr-1">
//                               Mfg Date
//                             </span>
//                           )}
//                           {stock.expiryDateOfBatches === 1 && (
//                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
//                               Expiry
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {stock.alias || '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {stock.under}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {stock.units}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {stock.hsn || '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stock.gstApplicable === 'Applicable'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-gray-100 text-gray-800'
//                           }`}>
//                           {stock.gstApplicable}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
//                         {parseFloat(stock.openingBalanceQty).toFixed(2)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
//                         {parseFloat(stock.openingBalanceRate).toFixed(2)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
//                         ₹{parseFloat(stock.openingBalanceValue).toFixed(2)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-center no-print">
//                         <div className="flex justify-center gap-2">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleEditClick(stock);
//                             }}
//                             className="text-blue-600 hover:text-blue-900 transition-colors"
//                           >
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                             </svg>
//                           </button>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleDeleteStock(stock.id);
//                             }}
//                             className="text-red-600 hover:text-red-900 transition-colors"
//                           >
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                             </svg>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot className="bg-gray-50 border-t-2 border-gray-200">
//                   <tr>
//                     <td colSpan="6" className="px-6 py-4 text-sm font-semibold text-gray-900">
//                       Total
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900">
//                       {filteredStocks.reduce((sum, stock) => sum + parseFloat(stock.openingBalanceQty), 0).toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900">
//                       -
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-right text-blue-600">
//                       ₹{filteredStocks.reduce((sum, stock) => sum + parseFloat(stock.openingBalanceValue), 0).toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-right no-print"></td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           </div>

//           {/* Selected Stock Details Sidebar */}
//           {selectedStock && !isEditing && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 no-print">
//               <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-lg font-semibold text-gray-800">Stock Details</h3>
//                     <button
//                       onClick={() => setSelectedStock(null)}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Name</label>
//                         <div className="mt-1 text-lg font-semibold text-gray-900">{selectedStock.name}</div>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Alias</label>
//                         <div className="mt-1 text-gray-600">{selectedStock.alias || 'No alias'}</div>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Category</label>
//                         <div className="mt-1 text-gray-600">{selectedStock.under}</div>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">Units</label>
//                         <div className="mt-1 text-gray-600">{selectedStock.units}</div>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">HSN Code</label>
//                         <div className="mt-1 text-gray-600">{selectedStock.hsn || 'Not specified'}</div>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">GST Applicable</label>
//                         <div className="mt-1">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedStock.gstApplicable === 'Applicable'
//                               ? 'bg-green-100 text-green-800'
//                               : 'bg-gray-100 text-gray-800'
//                             }`}>
//                             {selectedStock.gstApplicable}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-medium text-gray-700 mb-2">Opening Balance</h4>
//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <div className="text-sm text-gray-500">Quantity</div>
//                           <div className="text-lg font-semibold">{parseFloat(selectedStock.openingBalanceQty).toFixed(2)}</div>
//                         </div>
//                         <div>
//                           <div className="text-sm text-gray-500">Rate</div>
//                           <div className="text-lg font-semibold">₹{parseFloat(selectedStock.openingBalanceRate).toFixed(2)}</div>
//                         </div>
//                         <div>
//                           <div className="text-sm text-gray-500">Value</div>
//                           <div className="text-lg font-semibold text-blue-600">
//                             ₹{parseFloat(selectedStock.openingBalanceValue).toFixed(2)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-medium text-gray-700 mb-2">Additional Settings</h4>
//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <div className="text-sm text-gray-500">Maintain Batches</div>
//                           <div className="mt-1">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedStock.maintainInBatches === 1
//                                 ? 'bg-blue-100 text-blue-800'
//                                 : 'bg-gray-100 text-gray-800'
//                               }`}>
//                               {selectedStock.maintainInBatches === 1 ? 'Yes' : 'No'}
//                             </span>
//                           </div>
//                         </div>
//                         <div>
//                           <div className="text-sm text-gray-500">Track Mfg. Date</div>
//                           <div className="mt-1">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedStock.trackDateOfManufacture === 1
//                                 ? 'bg-green-100 text-green-800'
//                                 : 'bg-gray-100 text-gray-800'
//                               }`}>
//                               {selectedStock.trackDateOfManufacture === 1 ? 'Yes' : 'No'}
//                             </span>
//                           </div>
//                         </div>
//                         <div>
//                           <div className="text-sm text-gray-500">Track Expiry Date</div>
//                           <div className="mt-1">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedStock.expiryDateOfBatches === 1
//                                 ? 'bg-red-100 text-red-800'
//                                 : 'bg-gray-100 text-gray-800'
//                               }`}>
//                               {selectedStock.expiryDateOfBatches === 1 ? 'Yes' : 'No'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex gap-3 mt-6">
//                       <button
//                         onClick={() => handleEditClick(selectedStock)}
//                         className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                       >
//                         Edit Stock
//                       </button>
//                       <button
//                         onClick={() => setSelectedStock(null)}
//                         className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Add/Edit Stock Modal */}
//           {(isAddingStock || isEditing) && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 no-print">
//               <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-6">
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       {isEditing ? 'Edit Stock Item' : 'Add New Stock Item'}
//                     </h3>
//                     <button
//                       onClick={() => {
//                         setIsAddingStock(false);
//                         setIsEditing(false);
//                         setSelectedStock(null);
//                         setNewStock({
//                           name: '',
//                           alias: '',
//                           under: 'Raw Materials',
//                           units: 'Nos',
//                           maintainInBatches: false,
//                           trackDateOfManufacture: false,
//                           expiryDateOfBatches: false,
//                           rateOfDuty: '0.00',
//                           gstApplicable: 'Applicable',
//                           hsn: '',
//                           openingBalanceQty: '0.00',
//                           openingBalanceRate: '0.00',
//                           openingBalanceValue: '0.00'
//                         });
//                       }}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Stock Name *
//                         </label>
//                         <input
//                           type="text"
//                           value={newStock.name}
//                           onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="Enter stock name"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Alias (Optional)
//                         </label>
//                         <input
//                           type="text"
//                           value={newStock.alias}
//                           onChange={(e) => setNewStock({ ...newStock, alias: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="Enter alias"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Under Category *
//                         </label>
//                         <select
//                           value={newStock.under}
//                           onChange={(e) => setNewStock({ ...newStock, under: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                           {categories.map(category => (
//                             <option key={category} value={category}>{category}</option>
//                           ))}
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Units *
//                         </label>
//                         <select
//                           value={newStock.units}
//                           onChange={(e) => setNewStock({ ...newStock, units: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                           {units.map(unit => (
//                             <option key={unit} value={unit}>{unit}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           HSN Code
//                         </label>
//                         <input
//                           type="text"
//                           value={newStock.hsn}
//                           onChange={(e) => setNewStock({ ...newStock, hsn: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="Enter HSN code"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           GST Applicable *
//                         </label>
//                         <select
//                           value={newStock.gstApplicable}
//                           onChange={(e) => setNewStock({ ...newStock, gstApplicable: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                           <option value="Applicable">Applicable</option>
//                           <option value="Not Applicable">Not Applicable</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-medium text-gray-700 mb-3">Opening Balance</h4>
//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Quantity
//                           </label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={newStock.openingBalanceQty}
//                             onChange={(e) => {
//                               const qty = parseFloat(e.target.value) || 0;
//                               const rate = parseFloat(newStock.openingBalanceRate) || 0;
//                               const value = qty * rate;
//                               setNewStock({
//                                 ...newStock,
//                                 openingBalanceQty: e.target.value,
//                                 openingBalanceValue: value.toFixed(2)
//                               });
//                             }}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Rate (₹)
//                           </label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={newStock.openingBalanceRate}
//                             onChange={(e) => {
//                               const rate = parseFloat(e.target.value) || 0;
//                               const qty = parseFloat(newStock.openingBalanceQty) || 0;
//                               const value = qty * rate;
//                               setNewStock({
//                                 ...newStock,
//                                 openingBalanceRate: e.target.value,
//                                 openingBalanceValue: value.toFixed(2)
//                               });
//                             }}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Value (₹)
//                           </label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={newStock.openingBalanceValue}
//                             readOnly
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       <h4 className="font-medium text-gray-700 mb-3">Additional Settings</h4>
//                       <div className="grid grid-cols-3 gap-4">
//                         <div className="flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={newStock.maintainInBatches}
//                             onChange={(e) => setNewStock({ ...newStock, maintainInBatches: e.target.checked })}
//                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                           />
//                           <label className="ml-2 text-sm text-gray-700">Maintain in Batches</label>
//                         </div>
//                         <div className="flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={newStock.trackDateOfManufacture}
//                             onChange={(e) => setNewStock({ ...newStock, trackDateOfManufacture: e.target.checked })}
//                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                           />
//                           <label className="ml-2 text-sm text-gray-700">Track Mfg. Date</label>
//                         </div>
//                         <div className="flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={newStock.expiryDateOfBatches}
//                             onChange={(e) => setNewStock({ ...newStock, expiryDateOfBatches: e.target.checked })}
//                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                           />
//                           <label className="ml-2 text-sm text-gray-700">Track Expiry Date</label>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex gap-3 mt-6">
//                       <button
//                         onClick={isEditing ? handleUpdateStock : handleAddStock}
//                         disabled={!newStock.name.trim()}
//                         className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//                       >
//                         {isEditing ? 'Update Stock' : 'Add Stock'}
//                       </button>
//                       <button
//                         onClick={() => {
//                           setIsAddingStock(false);
//                           setIsEditing(false);
//                           setSelectedStock(null);
//                           setNewStock({
//                             name: '',
//                             alias: '',
//                             under: 'Raw Materials',
//                             units: 'Nos',
//                             maintainInBatches: false,
//                             trackDateOfManufacture: false,
//                             expiryDateOfBatches: false,
//                             rateOfDuty: '0.00',
//                             gstApplicable: 'Applicable',
//                             hsn: '',
//                             openingBalanceQty: '0.00',
//                             openingBalanceRate: '0.00',
//                             openingBalanceValue: '0.00'
//                           });
//                         }}
//                         className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default StockList;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";

const StockList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeActivity, setShowEmployeeActivity] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(defaultStockForm());
  const { companyId, employees } = useCompany();
  const loggedInRole = user?.role?.toLowerCase() || "admin";
  const loggedInEmployeeId = user?.employee_id || null;
  const isEmployeeDashboard = loggedInRole === 'employee';

  const getEmployeeName = (id) => {
    const emp = employees?.find(e => e.id == id);
    return emp ? emp.name : "Unknown Employee";
  };

  const categories = [
    'Raw Materials', 'Finished Goods', 'Semi-Finished Goods',
    'Consumables', 'Work in Progress', 'Trading Goods'
  ];

  const units = [
    'Nos', 'Kg', 'Grams', 'Liters', 'Meters', 'Pieces', 'Boxes', 'Cartons', 'Bags'
  ];

  function defaultStockForm() {
    return {
      name: '', alias: '', under: 'Raw Materials', units: 'Nos',
      maintainInBatches: false, trackDateOfManufacture: false,
      expiryDateOfBatches: false, rateOfDuty: '0.00',
      gstApplicable: 'Applicable', hsn: '',
      openingBalanceQty: '0.00', openingBalanceRate: '0.00', openingBalanceValue: '0.00'
    };
  }

  useEffect(() => {
    if (companyId) fetchStockData();
  }, [companyId]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/getStockData/${companyId}`
      );
      if (response.data.message === 'Data fetched successfully') {
        setStocks(response.data.data);
      } else {
        throw new Error('Failed to fetch stock data');
      }
    } catch (err) {
      setError(err.message);
      Swal.fire('Error', 'Failed to load stock data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedStock) return;
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/updateStock/${companyId}/${selectedStock.id}`,
        newStock
      );
      if (response.data.message === 'Stock updated successfully') {
        Swal.fire({ icon: 'success', title: 'Updated', text: `${newStock.name} updated successfully`, timer: 1800, showConfirmButton: false });
        fetchStockData();
        closeEditModal();
      }
    } catch (err) {
      Swal.fire('Error', 'Error updating stock: ' + err.message, 'error');
    }
  };

  const handleDeleteStock = async (id) => {
    const stockName = stocks.find(s => s.id === id)?.name || 'this item';
    const result = await Swal.fire({
      title: 'Delete stock item?',
      text: `"${stockName}" will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/stock/deleteStock/${companyId}/${id}`
        );
        if (response.data.message === 'Stock deleted successfully') {
          Swal.fire({ icon: 'success', title: 'Deleted', text: `${stockName} has been deleted`, timer: 1800, showConfirmButton: false });
          fetchStockData();
          if (selectedStock?.id === id) setSelectedStock(null);
        }
      } catch (err) {
        Swal.fire('Error', 'Error deleting stock: ' + err.message, 'error');
      }
    }
  };

  const handleEditClick = (stock) => {
    const userStr = sessionStorage.getItem("user");
    let role = "admin";
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        role = userObj.role || "admin";
      } catch (e) { }
    }
    const basePath = role === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";
    navigate(`${basePath}/stockItemCreation?id=${stock.id}`, { state: stock });
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedStock(null);
    setNewStock(defaultStockForm());
  };

  const fmt = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const handleExportExcel = () => {
    if (!stocks.length) return;
    const ws = XLSX.utils.json_to_sheet(stocks.map(s => ({
      Name: s.name, Alias: s.alias, Category: s.under, Units: s.units,
      HSN: s.hsn, 'GST Applicable': s.gstApplicable,
      'Opening Qty': s.openingBalanceQty,
      'Opening Rate': s.openingBalanceRate,
      'Opening Value': s.openingBalanceValue
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StockList');
    XLSX.writeFile(wb, 'Stock_List_Report.xlsx');
  };

  const handleExportPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(16);

    doc.text(
      'Stock List Report',
      14,
      15
    );

    const tableData =
      filteredStocks.map((s) => ([
        s.name,
        s.alias || '-',
        s.under,
        s.units,
        s.hsn || '-',
        s.gstApplicable,
        fmt(s.openingBalanceQty),
        fmt(s.openingBalanceRate),
        fmt(s.openingBalanceValue),
      ]));

    autoTable(doc, {

      startY: 25,

      head: [[
        'Name',
        'Alias',
        'Category',
        'Units',
        'HSN',
        'GST',
        'Qty',
        'Rate',
        'Value',
      ]],

      body: tableData,

      styles: {
        fontSize: 8,
      },

      headStyles: {
        fillColor: [37, 99, 235],
      },
    });

    doc.save(
      'Stock_List_Report.pdf'
    );
  };
  const handlePrint = () => {

    const printWindow =
      window.open(
        '',
        '',
        'width=1200,height=800'
      );

    const rows =
      filteredStocks.map((s) => `

      <tr>
        <td>${s.name}</td>
        <td>${s.alias || '-'}</td>
        <td>${s.under}</td>
        <td>${s.units}</td>
        <td>${s.hsn || '-'}</td>
        <td>${s.gstApplicable}</td>
        <td style="text-align:right;">
          ${fmt(s.openingBalanceQty)}
        </td>
        <td style="text-align:right;">
          ₹${fmt(s.openingBalanceRate)}
        </td>
        <td style="text-align:right;">
          ₹${fmt(s.openingBalanceValue)}
        </td>
      </tr>

    `).join('');

    printWindow.document.write(`

    <html>

      <head>

        <title>
          Stock List Report
        </title>

        <style>

          body {

            font-family:
              Arial,
              sans-serif;

            padding: 24px;

            color: #111827;
          }

          h1 {

            margin-bottom: 20px;

            color: #2563eb;
          }

          table {

            width: 100%;

            border-collapse: collapse;
          }

          th, td {

            border: 1px solid #d1d5db;

            padding: 10px;

            font-size: 12px;
          }

          th {

            background: #eff6ff;

            text-align: left;
          }

          tfoot td {

            font-weight: bold;

            background: #f9fafb;
          }

        </style>

      </head>

      <body>

        <h1>
          Stock List Report
        </h1>

        <table>

          <thead>

            <tr>

              <th>Name</th>
              <th>Alias</th>
              <th>Category</th>
              <th>Units</th>
              <th>HSN</th>
              <th>GST</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Value</th>

            </tr>

          </thead>

          <tbody>

            ${rows}

          </tbody>

          <tfoot>

            <tr>

              <td colspan="8">
                Total
              </td>

              <td style="text-align:right;">
                ₹${filteredStocks
        .reduce(
          (s, i) =>
            s +
            parseFloat(
              i.openingBalanceValue || 0
            ),
          0
        )
        .toFixed(2)}
              </td>

            </tr>

          </tfoot>

        </table>

      </body>

    </html>

  `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {

      printWindow.print();

    }, 500);
  };

  const exportToCSV = () => {
    const rows = [
      ['Name', 'Alias', 'Category', 'Units', 'HSN', 'GST Applicable', 'Opening Qty', 'Opening Rate', 'Opening Value'],
      ...stocks.map(s => [s.name, s.alias, s.under, s.units, s.hsn, s.gstApplicable, s.openingBalanceQty, s.openingBalanceRate, s.openingBalanceValue]),
      [],
      ['Total Opening Value', '', '', '', '', '', '', '', totalValue().toFixed(2)]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalValue = () => stocks.reduce((sum, s) => sum + parseFloat(s.openingBalanceValue || 0), 0);
  const avgRate = () => stocks.length
    ? (stocks.reduce((sum, s) => sum + parseFloat(s.openingBalanceRate || 0), 0) / stocks.length).toFixed(2)
    : '0.00';
  const uniqueCategories = () => new Set(stocks.map(s => s.under)).size;

  const filteredStocks = stocks.filter(s => {
    if (isEmployeeDashboard) {
      if (s.employee_id != loggedInEmployeeId) return false;
    } else {
      const isCreatedByEmployee = s.employee_id && (s.role?.toLowerCase() === 'employee');
      if (showEmployeeActivity) {
        if (!isCreatedByEmployee) return false;
      } else {
        if (isCreatedByEmployee) return false;
      }
    }

    return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.alias || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.hsn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.under.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005AB3] mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading stock data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button onClick={fetchStockData} className="bg-[#005AB3] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 p-5 font-[sans-serif]">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* ── Top bar ── */}
          {/* Top Header */}
          <div className="bg-[#005AB3] text-white px-5 py-3 shadow rounded-xl">
            <div className="flex items-center justify-between gap-4 flex-wrap">

              {/* Left - Title */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <h1 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                  Stock List
                </h1>
              </div>

              {/* Right - Search + Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">

                {/* Search */}
                <div className="relative">
                  <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search name, alias, HSN…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8.5 pl-8 pr-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-56"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const userStr = sessionStorage.getItem("user");
                      let role = "admin";
                      if (userStr) {
                        try {
                          const userObj = JSON.parse(userStr);
                          role = userObj.role || "admin";
                        } catch (e) {}
                      }
                      const basePath = role === "employee" ? "/employee/hr/accounting/client" : "/accounting/client";
                      navigate(`${basePath}/stockItemCreation`);
                    }}
                    className="flex items-center gap-1.5 bg-[#1a56db] hover:bg-blue-600 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>

                  {/* Export Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                      <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showExportMenu && (
                      <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <button
                          onClick={() => {
                            handleExportExcel();
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Excel
                        </button>
                        <button
                          onClick={() => {
                            handleExportPDF();
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEmployeeDashboard && (
                    <button
                      onClick={() => setShowEmployeeActivity(prev => !prev)}
                      className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                        showEmployeeActivity 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {showEmployeeActivity ? "Back to Stock" : "Employee Activity"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
            {[
              { label: 'Total items', value: stocks.length, color: 'text-gray-800' },
              { label: 'Opening value', value: `₹${totalValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-[#005AB3]' },
              { label: 'Categories', value: uniqueCategories(), color: 'text-green-700' },
              { label: 'Avg. rate', value: `₹${avgRate()}`, color: 'text-purple-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-2xl font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-medium text-gray-800">Stock items</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {filteredStocks.length} of {stocks.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Alias</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Unit</th>
                    <th className="px-4 py-3 text-left font-medium">HSN</th>
                    <th className="px-4 py-3 text-left font-medium">GST</th>
                    <th className="px-4 py-3 text-right font-medium">Qty</th>
                    <th className="px-4 py-3 text-right font-medium">Rate (₹)</th>
                    <th className="px-4 py-3 text-right font-medium">Value (₹)</th>
                    <th className="px-4 py-3 text-center font-medium no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStocks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-gray-400 text-sm">
                        No stock items found
                      </td>
                    </tr>
                  ) : filteredStocks.map(stock => (
                    <tr
                      key={stock.id}
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => { setSelectedStock(stock); setIsEditing(false); }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {stock.name}
                          {stock.employee_id && stock.role?.toLowerCase() === 'employee' && (
                            <span className="ml-2 text-xs text-gray-500 font-normal">
                              (Created by: {getEmployeeName(stock.employee_id)})
                            </span>
                          )}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {stock.maintainInBatches === 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Batches</span>
                          )}
                          {stock.trackDateOfManufacture === 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Mfg date</span>
                          )}
                          {stock.expiryDateOfBatches === 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">Expiry</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{stock.alias || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{stock.under}</td>
                      <td className="px-4 py-3 text-gray-500">{stock.units}</td>
                      <td className="px-4 py-3 text-gray-500">{stock.hsn || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${stock.gstApplicable === 'Applicable'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                          }`}>{stock.gstApplicable === 'Applicable' ? stock.gstApplicable : '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                        {parseFloat(stock.openingBalanceQty).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                        {parseFloat(stock.openingBalanceRate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#005AB3] tabular-nums">
                        ₹{parseFloat(stock.openingBalanceValue).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <div className="flex items-center justify-center gap-2">
                          {(!(!isEmployeeDashboard && stock.employee_id && stock.role?.toLowerCase() === 'employee')) && (
                            <button
                              onClick={e => { e.stopPropagation(); e.preventDefault(); handleEditClick(stock); }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); e.preventDefault(); handleDeleteStock(stock.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-sm font-medium text-gray-500">
                      Total ({filteredStocks.length} items)
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums">
                      {filteredStocks.reduce((s, i) => s + parseFloat(i.openingBalanceQty || 0), 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#005AB3] tabular-nums">
                      ₹{filteredStocks.reduce((s, i) => s + parseFloat(i.openingBalanceValue || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="no-print" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── View Detail Modal ── */}
      {selectedStock && !isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print"
          onClick={() => setSelectedStock(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#005AB3] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-[15px] leading-tight">{selectedStock.name}</p>
                  <p className="text-white/65 text-xs mt-0.5">
                    {selectedStock.alias || 'No alias'} · {selectedStock.under}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${selectedStock.gstApplicable === 'Applicable'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
                  }`}>{selectedStock.gstApplicable === 'Applicable' ? selectedStock.gstApplicable : '—'}</span>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition text-lg leading-none"
                >✕</button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Basic info */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Basic details</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    ['Category', selectedStock.under],
                    ['Units', selectedStock.units],
                    ['HSN code', selectedStock.hsn || '—'],
                    ['Rate of duty', `${selectedStock.rateOfDuty}%`],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-gray-800">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opening balance */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Opening balance</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Quantity</p>
                    <p className="text-base font-semibold text-gray-800">
                      {parseFloat(selectedStock.openingBalanceQty).toFixed(2)}
                      <span className="text-xs text-gray-400 ml-1">{selectedStock.units}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Rate</p>
                    <p className="text-base font-semibold text-gray-800">
                      ₹{parseFloat(selectedStock.openingBalanceRate).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Value</p>
                    <p className="text-base font-semibold text-[#005AB3]">
                      ₹{parseFloat(selectedStock.openingBalanceValue).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Batch settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Batch &amp; tracking</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Maintain batches', selectedStock.maintainInBatches === 1, 'bg-blue-50 text-blue-700'],
                    ['Track mfg. date', selectedStock.trackDateOfManufacture === 1, 'bg-green-50 text-green-700'],
                    ['Track expiry', selectedStock.expiryDateOfBatches === 1, 'bg-red-50 text-red-600'],
                  ].map(([label, active, cls]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${active ? cls : 'bg-gray-100 text-gray-400'}`}>
                        {active ? 'Yes' : 'No'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedStock(null)}
                className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
              >Close</button>
              {(!(!isEmployeeDashboard && selectedStock.employee_id && selectedStock.role?.toLowerCase() === 'employee')) && (
                <button
                  onClick={() => handleEditClick(selectedStock)}
                  className="px-4 py-1.5 text-sm bg-[#005AB3] text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#005AB3] px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-[15px]">Edit stock item</p>
                  <p className="text-white/65 text-xs">{selectedStock?.name}</p>
                </div>
              </div>
              <button onClick={closeEditModal}
                className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition text-lg leading-none">✕</button>
            </div>

            <div className="p-5 space-y-5">
              {/* Basic fields */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Basic details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stock name <span className="text-red-400">*</span></label>
                    <input type="text" value={newStock.name}
                      onChange={e => setNewStock({ ...newStock, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]"
                      placeholder="Enter stock name" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Alias</label>
                    <input type="text" value={newStock.alias}
                      onChange={e => setNewStock({ ...newStock, alias: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]"
                      placeholder="Optional alias" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category <span className="text-red-400">*</span></label>
                    <select value={newStock.under} onChange={e => setNewStock({ ...newStock, under: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Units <span className="text-red-400">*</span></label>
                    <select value={newStock.units} onChange={e => setNewStock({ ...newStock, units: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]">
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">HSN code</label>
                    <input type="text" value={newStock.hsn}
                      onChange={e => setNewStock({ ...newStock, hsn: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]"
                      placeholder="e.g. 7213" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">GST applicable <span className="text-red-400">*</span></label>
                    <select value={newStock.gstApplicable} onChange={e => setNewStock({ ...newStock, gstApplicable: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]">
                      <option value="Applicable">Applicable</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Opening balance */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Opening balance</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input type="number" step="0.01" value={newStock.openingBalanceQty}
                      onChange={e => {
                        const qty = parseFloat(e.target.value) || 0;
                        const rate = parseFloat(newStock.openingBalanceRate) || 0;
                        setNewStock({ ...newStock, openingBalanceQty: e.target.value, openingBalanceValue: (qty * rate).toFixed(2) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rate (₹)</label>
                    <input type="number" step="0.01" value={newStock.openingBalanceRate}
                      onChange={e => {
                        const rate = parseFloat(e.target.value) || 0;
                        const qty = parseFloat(newStock.openingBalanceQty) || 0;
                        setNewStock({ ...newStock, openingBalanceRate: e.target.value, openingBalanceValue: (qty * rate).toFixed(2) });
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AB3]/30 focus:border-[#005AB3]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Value (₹)</label>
                    <input type="number" step="0.01" value={newStock.openingBalanceValue} readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* Additional settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Batch &amp; tracking settings</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ['maintainInBatches', 'Maintain batches'],
                    ['trackDateOfManufacture', 'Track mfg. date'],
                    ['expiryDateOfBatches', 'Track expiry date'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={newStock[key]}
                        onChange={e => setNewStock({ ...newStock, [key]: e.target.checked })}
                        className="h-4 w-4 text-[#005AB3] rounded border-gray-300 focus:ring-[#005AB3]" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button onClick={closeEditModal}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">
                Cancel
              </button>
              <button onClick={handleUpdateStock} disabled={!newStock.name.trim()}
                className="px-5 py-2 text-sm bg-[#005AB3] text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update stock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StockList;