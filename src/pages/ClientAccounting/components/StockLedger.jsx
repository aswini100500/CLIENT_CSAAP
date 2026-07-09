// import React, { useRef, useState } from "react";

// export default function StockQuery() {
//     const printRef = useRef();
//   const [itemData] = useState({
//     name: "Bajaj WX 3 Wet Grinder",
//     group: "Wet Grinders",
//     closingBalance: "-46 Pcs",
//     costPrice: "3,934.86/Pcs",
//     costingMethod: "Avg. Cost",
//     standardCost: "3,917.00/Pcs",
//     partNo: "Not Applicable",
//     category: "Not Applicable",
//     closingValue: "(-)1,79,932.00",
//     sellingPrice: "4,000.00/Pcs",
//     marketValuationMethod: "Avg. Price",
//   });

//   const purchases = [
//     {
//       date: "21-Dec-20",
//       party: "Confident Traders",
//       qty: "1 Pcs",
//       rate: "3,917.00",
//       amount: "3,917.00",
//     },
//   ];

//   const sales = [
//     { date: "28-Feb-21", party: "Sun Stores", qty: "15 Pcs", rate: "4,000.00", amount: "60,000.00" },
//     { date: "2-Nov-20", party: "Sun Stores", qty: "15 Pcs", rate: "4,000.00", amount: "60,000.00" },
//     { date: "31-Aug-20", party: "Sun Stores", qty: "15 Pcs", rate: "4,000.00", amount: "60,000.00" },
//     { date: "30-May-20", party: "Sun Stores", qty: "15 Pcs", rate: "4,000.00", amount: "60,000.00" },
//   ];

//   const godownDetails = [
//     { godown: "Main Location", batch: "Primary Batch", qty: "(-)47 Pcs" },
//     { godown: "Electronic City Godown", batch: "Primary Batch", qty: "1 Pcs" },
//   ];

//   const handlePrint = () => {
//     const printContent = printRef.current.innerHTML;
//     const printWindow = window.open("", "", "width=900,height=650");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Print</title>
//           <style>
//             body { font-family: Arial; padding: 10px; }
//             table, th, td { border: 1px solid black; border-collapse: collapse; padding: 6px; }
//             .title { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
//           </style>
//         </head>
//         <body>${printContent}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   return (
//     <div className="w-full bg-white p-4 shadow-lg border rounded text-sm font-medium">
     
//       {/* ----------------- Header Item Info ----------------- */}
//       <div className="grid grid-cols-2 gap-6 border-b pb-3">
//         <div>
//           <p><span className="font-semibold">Name :</span> {itemData.name}</p>
//           <p><span className="font-semibold">Group :</span> {itemData.group}</p>
//           <p><span className="font-semibold">Closing Balance :</span> {itemData.closingBalance}</p>
//           <p><span className="font-semibold">Cost price :</span> {itemData.costPrice}</p>
//           <p><span className="font-semibold">Costing method :</span> {itemData.costingMethod}</p>
//           <p><span className="font-semibold">Standard cost :</span> {itemData.standardCost}</p>
//         </div>

//         <div>
//           <p><span className="font-semibold">Part No. :</span> {itemData.partNo}</p>
//           <p><span className="font-semibold">Category :</span> {itemData.category}</p>
//           <p><span className="font-semibold">Closing value :</span> {itemData.closingValue}</p>
//           <p><span className="font-semibold">Standard selling price :</span> {itemData.sellingPrice}</p>
//           <p><span className="font-semibold">Market valuation method :</span> {itemData.marketValuationMethod}</p>
//         </div>
//       </div>

//       {/* ---------------- Purchases & Sales Table ---------------- */}
//       <div className="grid grid-cols-2 gap-4 mt-4">
        
//         {/* Purchases */}
//         <div>
//           <h2 className="font-semibold bg-gray-200 p-2">Purchases</h2>
//           <table className="w-full border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Party Name</th>
//                 <th className="border p-2">Qty</th>
//                 <th className="border p-2">Rate</th>
//                 <th className="border p-2">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {purchases.map((p, i) => (
//                 <tr key={i} className="hover:bg-yellow-100">
//                   <td className="border p-2">{p.date}</td>
//                   <td className="border p-2">{p.party}</td>
//                   <td className="border p-2">{p.qty}</td>
//                   <td className="border p-2">{p.rate}</td>
//                   <td className="border p-2">{p.amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Sales */}
//         <div>
//           <h2 className="font-semibold bg-gray-200 p-2">Sales</h2>
//           <table className="w-full border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Party Name</th>
//                 <th className="border p-2">Qty</th>
//                 <th className="border p-2">Rate</th>
//                 <th className="border p-2">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sales.map((s, i) => (
//                 <tr key={i}>
//                   <td className="border p-2">{s.date}</td>
//                   <td className="border p-2">{s.party}</td>
//                   <td className="border p-2">{s.qty}</td>
//                   <td className="border p-2">{s.rate}</td>
//                   <td className="border p-2">{s.amount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>

//       {/* ---------------- Godown / Batch Details ---------------- */}
//       <div className="mt-6">
//         <h2 className="font-semibold bg-gray-200 p-2">Godown / Batch Details</h2>

//         <table className="w-full border mt-1">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">Godown</th>
//               <th className="border p-2">Batch</th>
//               <th className="border p-2">Quantity</th>
//             </tr>
//           </thead>
//           <tbody>
//             {godownDetails.map((g, i) => (
//               <tr key={i}>
//                 <td className="border p-2">{g.godown}</td>
//                 <td className="border p-2">{g.batch}</td>
//                 <td className="border p-2">{g.qty}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//   <button onClick={()=>{
//         window.print()
//       }}>
//         print
//       </button> 

//     </div>
//   );
// }




import React, { useState } from 'react';

export default function ItemCategories() {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Raw Materials',
      description: 'Primary materials used in production',
      items: 24,
      value: '₹15,42,800',
      parent: null,
      isActive: true,
      products: [
        { id: 1, name: 'Steel Rods', code: 'STM001', price: '₹1,200', stock: 150, unit: 'kg' },
        { id: 2, name: 'Copper Wires', code: 'COP002', price: '₹850', stock: 200, unit: 'meters' }
      ]
    },
    {
      id: 2,
      name: 'Finished Goods',
      description: 'Completed products ready for sale',
      items: 18,
      value: '₹28,75,600',
      parent: null,
      isActive: true,
      products: [
        { id: 3, name: 'LED Bulbs', code: 'LED001', price: '₹250', stock: 500, unit: 'pcs' },
        { id: 4, name: 'Switches', code: 'SWT001', price: '₹180', stock: 300, unit: 'pcs' }
      ]
    },
    {
      id: 3,
      name: 'Semi-Finished Goods',
      description: 'Partially completed products',
      items: 12,
      value: '₹9,84,300',
      parent: null,
      isActive: true,
      products: [
        { id: 5, name: 'Circuit Boards', code: 'CIR001', price: '₹1,500', stock: 80, unit: 'pcs' }
      ]
    },
    {
      id: 4,
      name: 'Consumables',
      description: 'Items consumed during operations',
      items: 35,
      value: '₹3,42,100',
      parent: null,
      isActive: true,
      products: [
        { id: 6, name: 'Lubricants', code: 'LUB001', price: '₹450', stock: 100, unit: 'liters' }
      ]
    },
    {
      id: 5,
      name: 'Steel',
      description: 'Various steel products and raw materials',
      items: 8,
      value: '₹12,45,000',
      parent: 1,
      isActive: true,
      products: [
        { id: 7, name: 'Steel Sheets', code: 'STS001', price: '₹2,800', stock: 50, unit: 'sheets' }
      ]
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    price: '',
    stock: '',
    unit: '',
    categoryId: null
  });

  const mainCategories = categories.filter(cat => cat.parent === null);
  const subCategories = categories.filter(cat => cat.parent !== null);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (newProduct.name.trim() && newProduct.categoryId) {
      const updatedCategories = categories.map(category => {
        if (category.id === newProduct.categoryId) {
          const product = {
            id: category.products.length + 1,
            name: newProduct.name,
            code: newProduct.code,
            price: newProduct.price,
            stock: parseInt(newProduct.stock),
            unit: newProduct.unit
          };
          return {
            ...category,
            products: [...category.products, product],
            items: category.items + 1
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      setNewProduct({ name: '', code: '', price: '', stock: '', unit: '', categoryId: null });
      setIsAddingProduct(false);
    }
  };

  const toggleCategoryStatus = (id) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const getSubCategories = (parentId) => {
    return categories.filter(cat => cat.parent === parentId);
  };

  const exportToCSV = () => {
    const csvData = [];
    
    // Add headers
    csvData.push(['Category Name', 'Product Name', 'Product Code', 'Price', 'Stock', 'Unit']);
    
    // Add data
    categories.forEach(category => {
      if (category.products.length > 0) {
        category.products.forEach(product => {
          csvData.push([
            category.name,
            product.name,
            product.code,
            product.price,
            product.stock,
            product.unit
          ]);
        });
      } else {
        csvData.push([category.name, 'No Products', '', '', '', '']);
      }
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories_and_products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printData = () => {
    const printContent = document.getElementById('printable-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Categories and Products Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .category { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
            .category-name { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
            .product-table { width: 100%; border-collapse: collapse; }
            .product-table th, .product-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .product-table th { background-color: #f5f5f5; }
            .no-products { color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Categories and Products Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Item Categories</h1>
              <p className="text-gray-600 mt-1">Manage categories and their products</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddingProduct(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
              <button 
                onClick={printData}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button 
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-800">All Categories ({filteredCategories.length})</h2>
              </div>
              
              <div className="divide-y">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                      selectedCategory?.id === category.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          category.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {category.name}
                            {category.parent && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Sub-category
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                          
                          {/* Products List */}
                          {category.products.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs font-semibold text-gray-500 mb-2">PRODUCTS:</div>
                              <div className="space-y-2">
                                {category.products.map(product => (
                                  <div key={product.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <div>
                                      <div className="font-medium text-sm">{product.name}</div>
                                      <div className="text-xs text-gray-500">Code: {product.code}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-semibold">{product.price}</div>
                                      <div className="text-xs text-gray-500">Stock: {product.stock} {product.unit}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {category.parent && (
                            <p className="text-xs text-gray-500 mt-1">
                              Parent: {categories.find(c => c.id === category.parent)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">{category.items} items</div>
                            <div className="text-green-600 font-medium">{category.value}</div>
                          </div>
                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategoryStatus(category.id);
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              category.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Category Details & Products */}
          <div className="space-y-6">
            {/* Category Details */}
            {selectedCategory && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Category Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Category Name</label>
                    <div className="font-medium text-gray-800">{selectedCategory.name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <div className="font-medium text-gray-800">{selectedCategory.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Items Count</label>
                      <div className="font-medium text-gray-800">{selectedCategory.items}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Total Value</label>
                      <div className="font-medium text-green-600">{selectedCategory.value}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCategory.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCategory.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {/* Products in this Category */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Products in this Category</h4>
                  {selectedCategory.products.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCategory.products.map(product => (
                        <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{product.price}</div>
                            <div className="text-xs text-gray-500">{product.stock} {product.unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No products in this category
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => {
                      setNewProduct({...newProduct, categoryId: selectedCategory.id});
                      setIsAddingProduct(true);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Product
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Categories</span>
                  <span className="font-semibold">{categories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Categories</span>
                  <span className="font-semibold text-green-600">
                    {categories.filter(c => c.isActive).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Products</span>
                  <span className="font-semibold">
                    {categories.reduce((total, cat) => total + cat.products.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Main Categories</span>
                  <span className="font-semibold">{mainCategories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sub-categories</span>
                  <span className="font-semibold">{subCategories.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Content (Hidden) */}
      <div id="printable-content" className="hidden">
        {categories.map(category => (
          <div key={category.id} className="category">
            <div className="category-name">{category.name}</div>
            <div>{category.description}</div>
            {category.products.length > 0 ? (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Code</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {category.products.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.code}</td>
                      <td>{product.price}</td>
                      <td>{product.stock}</td>
                      <td>{product.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-products">No products in this category</div>
            )}
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Code
                  </label>
                  <input
                    type="text"
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product code"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="text"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="₹0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="pcs, kg, liters, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newProduct.categoryId || ''}
                    onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={!newProduct.name.trim() || !newProduct.categoryId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}