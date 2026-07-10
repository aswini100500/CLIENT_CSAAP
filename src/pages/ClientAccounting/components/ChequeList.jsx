import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';
import {
  FileText,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  Filter,
  Search,
  Plus,
  RefreshCw,
  ChevronDown,
  Landmark,
  User,
  Hash,
  MoreVertical,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

const ChequeList = () => {
  const { companyId } = useCompany();
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedCheques, setSelectedCheques] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    cleared: 0,
    bounced: 0,
    cancelled: 0,
    totalAmount: 0
  });


  const [showChequePopup, setShowChequePopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState(null);
  const [popupMode, setPopupMode] = useState('');


  const fetchCheques = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${companyId}/all`;
      

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm) params.append('q', searchTerm);
      if (dateFilter) params.append('date', dateFilter);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setCheques(response.data.data || []);
        calculateStats(response.data.data || []);
      } else {
        Swal.fire('Error', response.data.message || 'Failed to fetch cheques', 'error');
      }
    } catch (error) {
      console.error('Error fetching cheques:', error);
      Swal.fire('Error', 'Failed to fetch cheques', 'error');
    } finally {
      setLoading(false);
    }
  };


  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: 0,
      cleared: 0,
      bounced: 0,
      cancelled: 0,
      totalAmount: 0
    };
    
    data.forEach(cheque => {
      stats.totalAmount += parseFloat(cheque.amount || 0);
      
      switch(cheque.status) {
        case 'pending': stats.pending++; break;
        case 'cleared': stats.cleared++; break;
        case 'bounced': stats.bounced++; break;
        case 'cancelled': stats.cancelled++; break;
      }
    });
    
    setStats(stats);
  };

  useEffect(() => {
    if (companyId) {
      fetchCheques();
    }
  }, [companyId, statusFilter, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCheques();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('');
    setSelectedCheques([]);
    fetchCheques();
  };


  const handleViewCheque = (cheque) => {
    setSelectedCheque(cheque);
    setPopupMode('view');
    setShowViewPopup(true);
  };


  const handleEditCheque = (cheque) => {
    setSelectedCheque(cheque);
    setPopupMode('edit');
    setShowEditPopup(true);
  };


  const handleAddCheque = () => {
    setSelectedCheque(null);
    setPopupMode('add');
    setShowChequePopup(true);
  };


  const closePopups = () => {
    setShowChequePopup(false);
    setShowViewPopup(false);
    setShowEditPopup(false);
    setSelectedCheque(null);
  };


  const handleFormSubmit = async (formData) => {
    try {
      const url = popupMode === 'add' 
        ? `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/create`
        : `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${selectedCheque.id}/update`;
      
      const method = popupMode === 'add' ? 'post' : 'put';
      
      const response = await axios[method](url, formData);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: popupMode === 'add' ? 'Cheque Added!' : 'Cheque Updated!',
          text: response.data.message,
          timer: 2000,
          showConfirmButton: false
        });
        
        closePopups();
        fetchCheques();
      }
    } catch (error) {
      console.error('Error saving cheque:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save cheque',
      });
    }
  };

  const handleDeleteCheque = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${id}/delete`
        );

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Cheque has been deleted.',
            timer: 2000,
            showConfirmButton: false
          });
          
          fetchCheques();
        }
      } catch (error) {
        console.error('Error deleting cheque:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete cheque',
        });
      }
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    const result = await Swal.fire({
      title: 'Change Status',
      text: `Change cheque status to "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/${id}/change-status`,
          {
            status: newStatus,
            statusDate: new Date().toISOString().split('T')[0]
          }
        );

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Status Updated!',
            text: `Cheque status changed to ${newStatus}`,
            timer: 2000,
            showConfirmButton: false
          });
          
          fetchCheques();
        }
      } catch (error) {
        console.error('Error changing status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to change status',
        });
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(cheques, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `cheque-list-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
      cleared: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Cleared' },
      bounced: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Bounced' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      issued: { color: 'bg-blue-100 text-blue-800', label: 'Issued' },
      received: { color: 'bg-purple-100 text-purple-800', label: 'Received' }
    };
    
    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCheques = cheques.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cheques.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading cheques...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                Cheque Register
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all your cheque transactions</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddCheque}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Cheque
              </button>
              <button
                onClick={handleExport}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </button>
              <button
                onClick={handlePrint}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">

          <div className="bg-white rounded-xl p-4 shadow border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Cheques</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">All cheque transactions</p>
          </div>
          

          <div className="bg-white rounded-xl p-4 shadow border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Awaiting clearance</p>
          </div>
          

          <div className="bg-white rounded-xl p-4 shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Cleared</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.cleared}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Successfully processed</p>
          </div>
          

          <div className="bg-white rounded-xl p-4 shadow border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Bounced</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{stats.bounced}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Returned cheques</p>
          </div>
          

          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-700 mt-1">{stats.cancelled}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Voided cheques</p>
          </div>
          

          <div className="bg-white rounded-xl p-4 shadow border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600">Total Amount</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <IndianRupee className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Sum of all cheques</p>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by cheque number, payee name, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </form>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={handleResetFilters}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reset
              </button>
            </div>
          </div>
          

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="cleared">Cleared</option>
                  <option value="bounced">Bounced</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cheque Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="issued">Issued (Payment)</option>
                  <option value="received">Received (Income)</option>
                </select>
              </div>
              

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cheque Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>


        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Cheque Transactions</h3>
              <p className="text-sm text-gray-500">
                Showing {currentCheques.length} of {cheques.length} cheques
              </p>
            </div>
            
            {selectedCheques.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedCheques.length} selected
                </span>
                <button
                  onClick={() => setSelectedCheques([])}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
          
          {cheques.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Cheques Found</h4>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No cheques match your search criteria. Try different filters.'
                  : 'Get started by adding your first cheque.'}
              </p>
              <button
                onClick={handleAddCheque}
                className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Cheque
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cheque Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank & Payee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentCheques.map((cheque) => (
                      <tr key={cheque.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="shrink-0">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <Hash className="w-4 h-4 text-gray-400 mr-1" />
                                <div className="font-medium text-gray-900">
                                  {cheque.chequeNumber}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {getTypeBadge(cheque.chequeType)}
                              </div>
                              {cheque.referenceNumber && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Ref: {cheque.referenceNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(cheque.amount)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {cheque.amountInWords?.substring(0, 30)}...
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <Calendar className="w-4 h-4 inline mr-1 text-gray-400" />
                              <span className="text-gray-700">Date: </span>
                              <span className="font-medium">{formatDate(cheque.chequeDate)}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-700">Issued: </span>
                              <span>{formatDate(cheque.dateIssued)}</span>
                            </div>
                            {cheque.datePresented && (
                              <div className="text-sm">
                                <span className="text-gray-700">Presented: </span>
                                <span>{formatDate(cheque.datePresented)}</span>
                              </div>
                            )}
                            {cheque.dateCleared && (
                              <div className="text-sm">
                                <span className="text-gray-700">Cleared: </span>
                                <span className="text-green-600">{formatDate(cheque.dateCleared)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Landmark className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium">{cheque.bankName}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              A/c: {cheque.accountNumber}
                            </div>
                            <div className="flex items-center mt-2">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm">{cheque.payeeName}</span>
                            </div>
                            {cheque.purpose && (
                              <div className="text-xs text-gray-500">
                                Purpose: {cheque.purpose}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {getStatusBadge(cheque.status)}
                            <div className="text-xs text-gray-500">
                              Last updated: {formatDate(cheque.updatedAt)}
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {['pending', 'cleared', 'bounced', 'cancelled']
                                .filter(status => status !== cheque.status)
                                .map(status => (
                                  <button
                                    key={status}
                                    onClick={() => handleChangeStatus(cheque.id, status)}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                                  >
                                    Mark as {status}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewCheque(cheque)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => handleEditCheque(cheque)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteCheque(cheque.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            
                            <div className="relative">
                              <button
                                className="text-gray-600 hover:text-gray-800 p-1"
                                title="More options"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, cheques.length)}
                      </span>{' '}
                      of <span className="font-medium">{cheques.length}</span> results
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalPages <= 5) return true;
                          return page === 1 || page === totalPages || 
                                 (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-3 py-1">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>


        <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Status Distribution</h4>
              <div className="space-y-2">
                {[
                  { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
                  { label: 'Cleared', value: stats.cleared, color: 'bg-green-500' },
                  { label: 'Bounced', value: stats.bounced, color: 'bg-red-500' },
                  { label: 'Cancelled', value: stats.cancelled, color: 'bg-gray-500' }
                ].map((item, index) => {
                  const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-medium">
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
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Type Distribution</h4>
              <div className="space-y-2">
                {[
                  { label: 'Issued', value: cheques.filter(c => c.chequeType === 'issued').length, color: 'bg-blue-500' },
                  { label: 'Received', value: cheques.filter(c => c.chequeType === 'received').length, color: 'bg-purple-500' }
                ].map((item, index) => {
                  const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-medium">
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
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Amount Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-green-600">{formatCurrency(stats.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Cheque:</span>
                  <span className="font-medium">
                    {stats.total > 0 ? formatCurrency(stats.totalAmount / stats.total) : '₹0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Largest Cheque:</span>
                  <span className="font-medium">
                    {cheques.length > 0 
                      ? formatCurrency(Math.max(...cheques.map(c => parseFloat(c.amount || 0))))
                      : '₹0.00'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recent Activity</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Latest Cheque</div>
                  <div className="text-gray-600">
                    {cheques.length > 0 
                      ? `#${cheques[0].chequeNumber} - ${formatDate(cheques[0].createdAt)}`
                      : 'No cheques yet'}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Last Updated</div>
                  <div className="text-gray-600">
                    {cheques.length > 0 
                      ? formatDate(cheques[0].updatedAt)
                      : 'Never'}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Clearance Rate</div>
                  <div className="text-gray-600">
                    {stats.total > 0 
                      ? `${((stats.cleared / stats.total) * 100).toFixed(1)}% cleared`
                      : '0% cleared'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {showChequePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {popupMode === 'add' ? 'Add New Cheque' : 'Edit Cheque'}
              </h2>
              <button
                onClick={closePopups}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">

              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Cheque form will be implemented here
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closePopups}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {popupMode === 'add' ? 'Add Cheque' : 'Update Cheque'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showViewPopup && selectedCheque && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Cheque Details</h2>
              <button
                onClick={closePopups}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4">Cheque Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Cheque Number</label>
                      <p className="font-medium">{selectedCheque.chequeNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Type</label>
                      <p>{getTypeBadge(selectedCheque.chequeType)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Amount</label>
                      <p className="text-xl font-bold">{formatCurrency(selectedCheque.amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Amount in Words</label>
                      <p className="text-sm">{selectedCheque.amountInWords}</p>
                    </div>
                  </div>
                </div>


                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4">Status & Dates</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <p>{getStatusBadge(selectedCheque.status)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Cheque Date</label>
                      <p>{formatDate(selectedCheque.chequeDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Date Issued</label>
                      <p>{formatDate(selectedCheque.dateIssued)}</p>
                    </div>
                    {selectedCheque.datePresented && (
                      <div>
                        <label className="text-sm text-gray-500">Date Presented</label>
                        <p>{formatDate(selectedCheque.datePresented)}</p>
                      </div>
                    )}
                    {selectedCheque.dateCleared && (
                      <div>
                        <label className="text-sm text-gray-500">Date Cleared</label>
                        <p>{formatDate(selectedCheque.dateCleared)}</p>
                      </div>
                    )}
                  </div>
                </div>


                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4">Bank Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Bank Name</label>
                      <p className="font-medium">{selectedCheque.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Account Number</label>
                      <p>{selectedCheque.accountNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">IFSC Code</label>
                      <p>{selectedCheque.ifscCode || '-'}</p>
                    </div>
                  </div>
                </div>


                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4">Payee Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Payee Name</label>
                      <p className="font-medium">{selectedCheque.payeeName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Purpose</label>
                      <p>{selectedCheque.purpose || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Reference Number</label>
                      <p>{selectedCheque.referenceNumber || '-'}</p>
                    </div>
                    {selectedCheque.remarks && (
                      <div>
                        <label className="text-sm text-gray-500">Remarks</label>
                        <p className="text-sm">{selectedCheque.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closePopups}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditCheque(selectedCheque)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Cheque
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showEditPopup && selectedCheque && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Edit Cheque</h2>
              <button
                onClick={closePopups}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">

              <div className="text-center py-8">
                <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Edit form for cheque #{selectedCheque.chequeNumber}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closePopups}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Cheque
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChequeList;