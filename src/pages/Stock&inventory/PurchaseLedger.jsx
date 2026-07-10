import React, { useState } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { getAuthToken } from '../../store/authSession';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';


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

const PurchaseLedger = () => {


  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const { data: suppliersData, isLoading: suppliersLoading } = useSWR(
    '/api/tenant/supplier',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );


  const buildApiUrl = () => {
    let url = '/api/tenant/purchases/ledger';
    const params = [];
    
    if (selectedSupplier) params.push(`supplier_id=${selectedSupplier}`);
    if (fromDate) params.push(`from_date=${fromDate}`);
    if (toDate) params.push(`to_date=${toDate}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return url;
  };


  const { data: ledgerData, error, isLoading } = useSWR(
    buildApiUrl(),
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      retryCount: 3,
    }
  );


  const suppliers = suppliersData?.success ? suppliersData.data : [];
  const ledgerEntries = ledgerData?.success ? ledgerData.data : [];


  const filteredData = ledgerEntries.filter(entry => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (entry.supplier_name && entry.supplier_name.toLowerCase().includes(searchLower)) ||
      (entry.bill_no && entry.bill_no.toLowerCase().includes(searchLower)) ||
      (entry.remark && entry.remark.toLowerCase().includes(searchLower))
    );
  });


  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEntries = filteredData.slice(startIndex, startIndex + itemsPerPage);


  const totalDebit = filteredData.reduce((sum, entry) => sum + parseFloat(entry.debit || 0), 0);
  const totalCredit = filteredData.reduce((sum, entry) => sum + parseFloat(entry.credit || 0), 0);
  const totalBalance = filteredData.reduce((sum, entry) => sum + parseFloat(entry.balance || 0), 0);


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
    if (!amount && amount !== 0) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };


  const handleApplyFilters = () => {
    mutate(buildApiUrl());
    setCurrentPage(1);
  };


  const handleResetFilters = () => {
    setSelectedSupplier('');
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setCurrentPage(1);
    mutate('/api/tenant/purchases/ledger');
  };


  const handleDownloadCSV = () => {
    if (filteredData.length === 0) {
      alert('No data to download');
      return;
    }

    const headers = [
      'Date',
      'Supplier Name',
      'Bill No',
      'Debit Amount',
      'Credit Amount',
      'Balance'
    ];

    const csvData = filteredData.map(entry => [
      formatDate(entry.date),
      entry.supplier_name || '—',
      entry.bill_no || '—',
      entry.debit || '0.00',
      entry.credit || '0.00',
      entry.balance || '0.00'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `purchase_ledger_${fromDate || 'all'}_${toDate || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const generateDateOptions = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const lastQuarter = new Date(today);
    lastQuarter.setMonth(today.getMonth() - 3);
    
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    
    return {
      today: today.toISOString().split('T')[0],
      lastWeek: lastWeek.toISOString().split('T')[0],
      lastMonth: lastMonth.toISOString().split('T')[0],
      lastQuarter: lastQuarter.toISOString().split('T')[0],
      lastYear: lastYear.toISOString().split('T')[0]
    };
  };

  const dateOptions = generateDateOptions();

  if (isLoading || suppliersLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchase ledger...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">Error loading purchase ledger</div>
            <button 
              onClick={() => mutate(buildApiUrl())}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Purchase Ledger Details</h1>
            <p className="text-gray-600">Track all purchase transactions and balances</p>
          </div>
          
          {filteredData.length > 0 && (
            <button
              onClick={handleDownloadCSV}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Download size={18} className="mr-2" />
              Download CSV
            </button>
          )}
        </div>
        

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Supplier</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <div className="flex space-x-2">
              <input 
                type="date" 
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <button
                onClick={() => setFromDate(dateOptions.lastMonth)}
                className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                title="Last Month"
              >
                <Calendar size={14} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <div className="flex space-x-2">
              <input 
                type="date" 
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <button
                onClick={() => setToDate(dateOptions.today)}
                className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                title="Today"
              >
                <Calendar size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
            >
              <Filter size={18} className="mr-2" />
              Apply Filters
            </button>
            
            <button
              onClick={handleResetFilters}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>


        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setFromDate(dateOptions.lastWeek);
              setToDate(dateOptions.today);
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Last Week
          </button>
          <button
            onClick={() => {
              setFromDate(dateOptions.lastMonth);
              setToDate(dateOptions.today);
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Last Month
          </button>
          <button
            onClick={() => {
              setFromDate(dateOptions.lastQuarter);
              setToDate(dateOptions.today);
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Last Quarter
          </button>
          <button
            onClick={() => {
              setFromDate(dateOptions.lastYear);
              setToDate(dateOptions.today);
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Last Year
          </button>
        </div>
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <div className="text-blue-600 font-bold">₹</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Total Debit</h3>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalDebit)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <div className="text-green-600 font-bold">₹</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Total Credit</h3>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalCredit)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-3">
                <div className="text-purple-600 font-bold">₹</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-800">Net Balance</h3>
                <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Purchase Ledger Details</h2>
          

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search suppliers, bill numbers..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">Show:</label>
              <select 
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
        

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((entry, index) => (
                  <tr key={entry.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{entry.supplier_name}</div>
                      <div className="text-xs text-gray-500">ID: {entry.supplier_id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.bill_no || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        parseFloat(entry.debit || 0) > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {parseFloat(entry.debit || 0) > 0 ? 'Debit' : 'Credit'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(entry.debit)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(entry.credit)}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${
                      parseFloat(entry.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(entry.balance)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-3 opacity-50" />
                      <div className="text-lg font-medium text-gray-500 mb-1">
                        {ledgerEntries.length === 0 ? 'No purchase ledger entries found' : 'No entries match your filters'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {ledgerEntries.length === 0 
                          ? 'Purchase ledger entries will appear here after purchases are made'
                          : 'Try adjusting your search or filters'}
                      </div>
                      {(selectedSupplier || fromDate || toDate || searchTerm) && ledgerEntries.length > 0 && (
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
        

        {currentEntries.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-1 text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
        

        {currentEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Total Entries</h3>
              <p className="text-2xl font-bold text-blue-900">{filteredData.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Total Debit</h3>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalDebit)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Total Credit</h3>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalCredit)}</p>
            </div>
            <div className={`p-4 rounded-lg ${totalBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-sm font-medium ${totalBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Net Balance
              </h3>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseLedger;

