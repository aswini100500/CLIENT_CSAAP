import React, { useState } from 'react';

const LedgerDetails = () => {
  // Sample ledger data
  const initialLedgerData = [
    { id: 57, customerName: 'Aggarwal Connectors', transactionDate: '02/08/2024', transactionType: 'Credited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: '', debitAmount: '', creditAmount: '1650', balance: '-101512.5' },
    { id: 58, customerName: 'Aggarwal Connectors', transactionDate: '02/08/2024', transactionType: 'Debited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: 'Cash', debitAmount: '1650', creditAmount: '', balance: '-99862.5' },
    { id: 59, customerName: 'Aggarwal Connectors', transactionDate: '09/08/2024', transactionType: 'Credited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: '', debitAmount: '', creditAmount: '300', balance: '-100162.5' },
    { id: 60, customerName: 'Aggarwal Connectors', transactionDate: '09/08/2024', transactionType: 'Debited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: 'Cash', debitAmount: '300', creditAmount: '', balance: '-99862.5' },
    { id: 61, customerName: 'Aggarwal Connectors', transactionDate: '10/09/2024', transactionType: 'Credited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: '', debitAmount: '', creditAmount: '400', balance: '-100262.5' },
    { id: 62, customerName: 'Aggarwal Connectors', transactionDate: '10/09/2024', transactionType: 'Debited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: 'SonuCash', debitAmount: '400', creditAmount: '', balance: '-99862.5' },
    { id: 63, customerName: 'Aggarwal Connectors', transactionDate: '04/10/2024', transactionType: 'Credited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: '', debitAmount: '', creditAmount: '550', balance: '-100412.5' },
    { id: 64, customerName: 'Aggarwal Connectors', transactionDate: '04/10/2024', transactionType: 'Debited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: 'SonuCash', debitAmount: '550', creditAmount: '', balance: '-99862.5' },
    { id: 65, customerName: 'Aggarwal Connectors', transactionDate: '25/12/2024', transactionType: 'Credited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: '', debitAmount: '', creditAmount: '520', balance: '-100382.5' },
    { id: 66, customerName: 'Aggarwal Connectors', transactionDate: '25/12/2024', transactionType: 'Debited', remark: 'Purchase Entry From Aggarwal Connectors', accountNo: 'SonuCash', debitAmount: '520', creditAmount: '', balance: '-99862.5' }
  ];

  // Sample customers for dropdown
  const customers = [
    { id: 1, name: 'Aggarwal Connectors' },
    { id: 2, name: 'Sharma Enterprises' },
    { id: 3, name: 'Gupta Traders' },
    { id: 4, name: 'Verma Industries' }
  ];

  // State for filters and data
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ledgerData, setLedgerData] = useState(initialLedgerData);
  const [filteredData, setFilteredData] = useState(initialLedgerData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Summary data
  const totalAmount = 1468967;
  const paidAmount = 1680845;
  const dueAmount = 211878;

  // Handle search button click
  const handleSearch = () => {
    let results = initialLedgerData;
    
    // Filter by customer
    if (selectedCustomer) {
      const customerName = customers.find(c => c.id.toString() === selectedCustomer)?.name || '';
      results = results.filter(item => 
        item.customerName.toLowerCase().includes(customerName.toLowerCase())
      );
    }
    
    // Filter by date range
    if (fromDate && toDate) {
      results = results.filter(item => {
        const itemDate = new Date(
          item.transactionDate.split('/').reverse().join('-')
        );
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(item =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remark.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accountNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(results);
    setCurrentPage(1); // Reset to first page after search
  };

  // Handle reset button click
  const handleReset = () => {
    setSelectedCustomer('');
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setFilteredData(initialLedgerData);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ledger Details</h1>
      
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md mr-2"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Amount</h3>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Paid Amount</h3>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(paidAmount)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Due Amount</h3>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(dueAmount)}</p>
          </div>
        </div>
      </div>
      
      {/* Ledger Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">sl</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account No</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.transactionDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.transactionType === 'Credited' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.remark}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.accountNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.debitAmount && formatCurrency(item.debitAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.creditAmount && formatCurrency(item.creditAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                    No ledger entries found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem}
                </span>{' '}
                of <span className="font-medium">{filteredData.length}</span> entries
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerDetails;