import React, { useState } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { getAuthToken } from '../../store/authSession';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;


const api = axios.create({
  baseURL: API_BASE_URL
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


const postFetcher = (url) => api.get(url).then(res => res.data);

const IndentHistory = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [status, setStatus] = useState('draft');


  const { data: historyData, error, isLoading } = useSWR(
    '/api/tenant/indents/history',
    postFetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  );


  const indents = historyData?.success ? historyData.data?.indents || [] : [];
  const pagination = historyData?.success ? historyData.data?.pagination || {} : {};


  const filteredIndents = indents.filter(indent =>
    indent.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indent.indent_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indent.supplier_gst?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indent.supplier_contact?.includes(searchTerm)
  );


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIndents = filteredIndents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIndents.length / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const exportToExcel = () => {

    toast.info('Export feature coming soon!', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const exportToPDF = () => {

    toast.info('Export feature coming soon!', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const viewIndent = (indent) => {

    setSelectedIndent(indent);
    toast.info(`Viewing indent ${indent.indent_number}`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const editIndent = (indent) => {

    toast.info(`Edit feature for ${indent.indent_number} coming soon!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const openStatusModal = (indent) => {
    setSelectedIndent(indent);
    setStatus(indent.status || 'draft');
    setShowStatusModal(true);
  };

  const openDeleteModal = (indent) => {
    setSelectedIndent(indent);
    setShowDeleteModal(true);
  };

  const updateIndentStatus = async () => {
    if (!selectedIndent) return;

    try {
      setLoading(true);
      const response = await api.put(`/api/tenant/indents/status/${selectedIndent.id}`, {
        status: status
      });

      if (response.data.success) {
        toast.success('Status updated successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        

        mutate('/api/tenant/indents/history');
        
        setShowStatusModal(false);
        setSelectedIndent(null);
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteIndent = async () => {
    if (!selectedIndent) return;

    try {
      setLoading(true);
      const response = await api.delete(`/api/tenant/indents/${selectedIndent.id}`);

      if (response.data.success) {
        toast.success('Indent deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        

        mutate('/api/tenant/indents/history');
        
        setShowDeleteModal(false);
        setSelectedIndent(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete indent');
      }
    } catch (error) {
      console.error('Error deleting indent:', error);
      toast.error(error.response?.data?.message || 'Failed to delete indent', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    mutate('/api/tenant/indents/history');
    toast.info('Refreshing indent history...', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-7xl mx-auto">

       


        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
            </div>

            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search by supplier name, indent number, GST or contact..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading indent history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg text-gray-700 mb-2">Failed to load indent history</p>
              <p className="text-gray-600 mb-4">{error.message || 'Please try again later'}</p>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Indent Number</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Indent Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier GST</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Items</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentIndents.length > 0 ? (
                      currentIndents.map((indent) => (
                        <tr key={indent.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-blue-600">{indent.indent_number}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{indent.supplier_name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">{indent.supplier_contact || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{formatDate(indent.indent_date)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">{indent.supplier_gst || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(indent.status)}`}>
                              {indent.status?.charAt(0).toUpperCase() + indent.status?.slice(1) || 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{indent.total_items || 0}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewIndent(indent)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => editIndent(indent)}
                                className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                                title="Edit Indent"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openStatusModal(indent)}
                                className="text-yellow-600 hover:text-yellow-800 transition-colors p-1 rounded hover:bg-yellow-50"
                                title="Update Status"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDeleteModal(indent)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                                title="Delete Indent"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-lg font-medium mb-2">No indents found</p>
                            <p className="text-sm">No indents available or matching your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>


              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredIndents.length)}
                    </span> of{' '}
                    <span className="font-medium">{filteredIndents.length}</span> entries
                    {pagination.total && (
                      <span className="ml-2 text-gray-500">
                        (Total: {pagination.total})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg border-2 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      Previous
                    </button>


                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`px-3 py-1 rounded-lg border-2 ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`px-3 py-1 rounded-lg border-2 ${
                        currentPage === totalPages || totalPages === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>


      {showStatusModal && selectedIndent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Update Indent Status</h3>
              <p className="text-gray-600 mb-4">
                Update status for <span className="font-semibold">{selectedIndent.indent_number}</span>
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedIndent(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateIndentStatus}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showDeleteModal && selectedIndent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to delete indent <span className="font-semibold">{selectedIndent.indent_number}</span>?
                <br />
                <span className="text-sm text-red-500">This action cannot be undone.</span>
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedIndent(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteIndent}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Indent'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndentHistory;

