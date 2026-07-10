import React, { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { getAuthToken } from '../../store/authSession';
import { Eye, Trash2, Search, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';


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

const PurchaseHistory = () => {


  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];


  const currentYear = new Date().getFullYear();
  const years = [
    { value: '', label: 'All Years' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: currentYear.toString(), label: currentYear.toString() }
  ].filter((year, index, self) => 
    index === self.findIndex((y) => y.value === year.value)
  );


  const buildApiUrl = () => {
    let url = '/api/tenant/purchases/history';
    const params = [];
    
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return url;
  };


  const { data: purchaseData, error, isLoading, mutate } = useSWR(
    buildApiUrl(),
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      retryCount: 3,
    }
  );


  const purchases = purchaseData?.success ? purchaseData.data : [];


  const handleDisplay = () => {

    mutate();
  };


  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleDisplay();
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };


  const filteredPurchases = purchases.filter(purchase => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (purchase.bill_no && purchase.bill_no.toLowerCase().includes(searchLower)) ||
      (purchase.supplier_name && purchase.supplier_name.toLowerCase().includes(searchLower)) ||
      (purchase.store_name && purchase.store_name.toLowerCase().includes(searchLower)) ||
      (purchase.contact_no && purchase.contact_no.includes(searchTerm))
    );
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase record?')) return;
    
    try {
      const response = await api.delete(`/api/tenant/purchases/${id}`);
      if (response.data.success) {
        alert('Purchase record deleted successfully!');

        mutate();
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Failed to delete purchase record. Please try again.');
    }
  };


  const handleView = (purchase) => {


    alert(`Viewing purchase: ${purchase.bill_no}\nSupplier: ${purchase.supplier_name}\nAmount: ${formatCurrency(purchase.net_price)}`);
  };


  const handleDownloadCSV = () => {
    if (purchases.length === 0) {
      alert('No data to download');
      return;
    }

    const headers = [
      'Bill No',
      'Supplier Name',
      'Contact No',
      'Purchase Date',
      'Store',
      'Supplier GST',
      'Net Price',
      'Paid Amount',
      'Pending Amount',
      'GST Type'
    ];

    const csvData = purchases.map(purchase => [
      purchase.bill_no,
      purchase.supplier_name,
      purchase.contact_no,
      formatDate(purchase.purchase_date),
      purchase.store_name,
      purchase.supplier_gst,
      purchase.net_price,
      purchase.paid_amount,
      purchase.pending_amount,
      purchase.gst_type
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `purchase_history_${month || 'all'}_${year || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleResetFilters = () => {
    setMonth('');
    setYear('');
    setSearchTerm('');
    setCurrentPage(1);

    mutate();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-7xl">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">Error loading purchase history</div>
          <button 
            onClick={() => mutate()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-7xl">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Purchase History</h1>
          <div className="w-20 h-1 bg-blue-500"></div>
        </div>
        

        {purchases.length > 0 && (
          <button
            onClick={handleDownloadCSV}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Download size={18} className="mr-2" />
            Download CSV
          </button>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by bill, supplier, or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
          </div>
        </div>


        <div className="flex items-end space-x-2">
          <button
            onClick={handleDisplay}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
          >
            <Search size={18} className="mr-2" />
            Search
          </button>
          
          <button
            onClick={handleResetFilters}
            className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Reset
          </button>
        </div>


        <div className="flex items-end">
          <div className="w-full bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">Total Records</div>
            <div className="text-2xl font-bold text-gray-800">{purchases.length}</div>
          </div>
        </div>
      </div>


      {purchases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center">
              <Calendar className="text-blue-600 mr-3" size={20} />
              <div>
                <div className="text-sm font-medium text-blue-800">Total Purchases</div>
                <div className="text-xl font-bold text-gray-800">{purchases.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center">
              <div className="text-green-600 mr-3 font-bold">₹</div>
              <div>
                <div className="text-sm font-medium text-green-800">Total Amount</div>
                <div className="text-xl font-bold text-gray-800">
                  {formatCurrency(purchases.reduce((sum, purchase) => sum + parseFloat(purchase.net_price || 0), 0))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center">
              <div className="text-orange-600 mr-3 font-bold">₹</div>
              <div>
                <div className="text-sm font-medium text-orange-800">Total Paid</div>
                <div className="text-xl font-bold text-gray-800">
                  {formatCurrency(purchases.reduce((sum, purchase) => sum + parseFloat(purchase.paid_amount || 0), 0))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center">
              <div className="text-red-600 mr-3 font-bold">₹</div>
              <div>
                <div className="text-sm font-medium text-red-800">Total Pending</div>
                <div className="text-xl font-bold text-gray-800">
                  {formatCurrency(purchases.reduce((sum, purchase) => sum + parseFloat(purchase.pending_amount || 0), 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bill No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchase Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPurchases.length > 0 ? (
              currentPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{purchase.bill_no}</div>
                    <div className="text-xs text-gray-500">ID: {purchase.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{purchase.supplier_name}</div>
                    <div className="text-xs text-gray-500">GST: {purchase.supplier_gst || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.contact_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(purchase.purchase_date)}</div>
                    <div className="text-xs text-gray-500">GST: {purchase.gst_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{purchase.store_name}</div>
                    <div className="text-xs text-gray-500">Store GST: {purchase.store_gst || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(purchase.net_price)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Paid: {formatCurrency(purchase.paid_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${parseFloat(purchase.pending_amount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(purchase.pending_amount)}
                    </div>
                    {parseFloat(purchase.discount || 0) > 0 && (
                      <div className="text-xs text-gray-500">
                        Discount: {formatCurrency(purchase.discount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(purchase)}
                      className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                      title="View Details"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(purchase.id)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                      title="Delete Record"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Search size={48} className="mb-3 opacity-50" />
                    <div className="text-lg font-medium text-gray-500 mb-1">
                      {purchases.length === 0 ? 'No purchase records found' : 'No records match your filters'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {purchases.length === 0 
                        ? 'Start by creating your first purchase entry'
                        : 'Try adjusting your search or filters'}
                    </div>
                    {(month || year || searchTerm) && purchases.length > 0 && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {currentPurchases.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredPurchases.length)}
            </span>{' '}
            of <span className="font-medium">{filteredPurchases.length}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded-md flex items-center ${
                currentPage === 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            

            <div className="flex space-x-1">
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
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded-md flex items-center ${
                currentPage === totalPages
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;

