import React, { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { getAuthToken } from '../../store/authSession';


const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;


const api = axios.create({
  baseURL: API_BASE_URL,
});


api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


const fetcher = (url) => api.get(url).then(res => res.data);

const StockList = () => {


  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [damageQuantity, setDamageQuantity] = useState(0);
  const [damageReason, setDamageReason] = useState('');
  const entriesPerPage = 10;


  const { data: masterData, isLoading: masterLoading } = useSWR(
    '/api/tenant/stock/master-data',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );


  const { data: stockEntriesData, isLoading: stockEntriesLoading, error } = useSWR(
    '/api/tenant/stock/entry',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );


  const master = masterData?.success ? masterData.data : {};
  const stores = master.stores || [];
  const categories = master.categories || [];
  const products = master.products || [];
  const racks = master.racks || [];
  const units = master.units || [];


  const stockEntries = stockEntriesData?.success ? stockEntriesData.data || [] : [];







  const filteredData = Array.isArray(stockEntries) ? stockEntries.filter(item => {
    if (!item) return false;
    
    const storeName = stores.find(store => store.id === item.store_id)?.name || '';
    const productName = products.find(product => product.id === item.product_id)?.name || '';
    const category = products.find(product => product.id === item.product_id);
    const categoryName = category ? categories.find(cat => cat.id === category.category_id)?.name : '';
    
    return (
      storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.batch && item.batch.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.rack && item.rack.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (categoryName && categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }) : [];


  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = filteredData.slice(startIndex, startIndex + entriesPerPage);


  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : '—';
  };


  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : '—';
  };


  const getCategoryName = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '—';
    
    const category = categories.find(c => c.id === product.category_id);
    return category ? category.name : '—';
  };


  const handleBarcode = (item) => {
    setSelectedItem({
      ...item,
      store_name: getStoreName(item.store_id),
      product_name: getProductName(item.product_id),
      category_name: getCategoryName(item.product_id)
    });
    setShowBarcodeModal(true);
  };


  const handleDamageEntry = (item) => {
    setSelectedItem({
      ...item,
      store_name: getStoreName(item.store_id),
      product_name: getProductName(item.product_id)
    });
    setDamageQuantity(0);
    setDamageReason('');
    setShowDamageModal(true);
  };


  const handleDamageSubmit = async () => {
    if (!selectedItem || damageQuantity <= 0 || !damageReason) {
      alert('Please enter valid damage quantity and reason.');
      return;
    }

    try {
      const response = await api.post('/api/tenant/stock/damage', {
        stock_entry_id: selectedItem.id,
        quantity: parseInt(damageQuantity),
        reason: damageReason,
        store_id: selectedItem.store_id,
        product_id: selectedItem.product_id
      });

      if (response.data.success) {
        alert(`Damage reported successfully for ${selectedItem.product_name}.`);
        setShowDamageModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to report damage');
      }
    } catch (error) {
      console.error('Error reporting damage:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to report damage. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };


  const handlePrintBarcode = () => {
    window.print();
  };


  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = ['Store Name', 'Product Name', 'Category', 'Batch', 'Rack', 'Stock Quantity', 'Units', 'Purchase Price', 'Sale Price', 'MRP', 'HSN Code'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        getStoreName(item.store_id),
        getProductName(item.product_id),
        getCategoryName(item.product_id),
        item.batch || '—',
        item.rack || '—',
        item.quantity || '0',
        item.units || '—',
        item.purchase_amount || '0',
        item.sale_price || '0',
        item.mrp || '0',
        item.hsn_code || '—'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stock_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const calculateTotalValue = () => {
    return filteredData.reduce((sum, item) => {
      const purchaseAmount = parseFloat(item.purchase_amount || 0);
      const quantity = parseFloat(item.quantity || 0);
      return sum + (purchaseAmount * quantity);
    }, 0);
  };


  const countLowStockItems = () => {
    return filteredData.filter(item => parseFloat(item.quantity || 0) < 10).length;
  };


  if (masterLoading || stockEntriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock List</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Stock Data</h2>
            <p className="text-red-700 mt-2">
              {error.response?.data?.message || error.message || 'Failed to load stock data. Please try again.'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Note: The API endpoint for stock entries might be different. Please check if the endpoint <code>/api/tenant/stock/entry</code> is correct.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock List</h1>
        

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-sm text-yellow-800">
            Debug Info: Loaded {stores.length} stores, {products.length} products, and {stockEntries.length} stock entries.
          </p>
        </div>
        

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <input 
                type="text"
                placeholder="Search by store, product, batch, or rack..."
                className="w-full sm:w-64 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>
        

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {stockEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No stock entries found.</p>
              <p className="text-sm text-gray-600">Add stock entries from the "Stock Entry" tab to see them here.</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No matching stock entries found for "{searchTerm}".</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rack</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEntries.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{getStoreName(item.store_id)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{getProductName(item.product_id)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{getCategoryName(item.product_id)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.batch || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.rack || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            parseFloat(item.quantity || 0) < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity || '0'} {item.units || ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">₹{parseFloat(item.purchase_amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">₹{parseFloat(item.sale_price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleBarcode(item)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="Generate Barcode"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              Barcode
                            </button>
                            <button 
                              onClick={() => handleDamageEntry(item)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                              title="Damage Entry"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Damage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">
                      {Math.min(startIndex + entriesPerPage, filteredData.length)}
                    </span> of <span className="font-medium">{filteredData.length}</span> entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                    >
                      Previous
                    </button>
                    

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && <span className="px-2 py-1">...</span>}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
            <p className="text-2xl font-bold text-blue-600">{filteredData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Low Stock Items</h3>
            <p className="text-2xl font-bold text-red-600">
              {countLowStockItems()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Value</h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{calculateTotalValue().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>


      {showBarcodeModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Barcode for {selectedItem.product_name}</h2>
              <div className="bg-white p-4 border border-gray-300 rounded-md mb-4 flex justify-center">
                <div className="text-center">
                  <div className="mb-2">

                    <div className="bg-white p-2 inline-block">
                      <div className="h-12 bg-black w-1 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-1 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-2 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-1 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-3 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-1 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-2 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-1 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-1 inline-block mx-px"></div>
                      <div className="h-12 bg-black w-2 inline-block mx-px"></div>
                    </div>
                  </div>
                  <p className="text-sm font-mono">{selectedItem.product_name}</p>
                  <p className="text-xs text-gray-500">Batch: {selectedItem.batch} | Rack: {selectedItem.rack} | Stock: {selectedItem.quantity}</p>
                  <p className="text-xs text-gray-500">MRP: ₹{parseFloat(selectedItem.mrp || 0).toFixed(2)} | Sale: ₹{parseFloat(selectedItem.sale_price || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowBarcodeModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrintBarcode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                  Print Barcode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showDamageModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Damage Entry for {selectedItem.product_name}</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Damage Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  max={selectedItem.quantity || 0}
                  value={damageQuantity}
                  onChange={(e) => setDamageQuantity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Current stock: {selectedItem.quantity} {selectedItem.units}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Damage Reason</label>
                <textarea 
                  value={damageReason}
                  onChange={(e) => setDamageReason(e.target.value)}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter reason for damage..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowDamageModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDamageSubmit}
                  disabled={damageQuantity <= 0 || damageQuantity > (selectedItem.quantity || 0) || !damageReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Report Damage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockList;

