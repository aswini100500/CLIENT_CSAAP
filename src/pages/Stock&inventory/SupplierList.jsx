import React, { useState } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { getAuthToken } from '../../store/authSession';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaFileExcel, FaFilePdf, FaDownload, FaUpload, FaArrowLeft, FaSearch, FaFileInvoice } from 'react-icons/fa';

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

const SupplierList = () => {

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    gst_number: '',
    address: '',
    contact_person: ''
  });


  const { data: suppliersData, error, isLoading } = useSWR(
    '/api/tenant/supplier',
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  );


  const suppliers = suppliersData?.success ? suppliersData.data || [] : [];


  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm) ||
    supplier.gst_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier) => {
    setEditFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      alternate_phone: supplier.alternate_phone || '',
      gst_number: supplier.gst_number || '',
      address: supplier.address || '',
      contact_person: supplier.contact_person || ''
    });
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteModal(true);
  };

  const deleteSupplier = async () => {
    if (!supplierToDelete) return;

    try {
      setLoading(true);
      const response = await api.delete(`/api/tenant/supplier/${supplierToDelete.id}`);

      if (response.data.success) {
        toast.success('Supplier deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        

        mutate('/api/tenant/supplier');
        
        setShowDeleteModal(false);
        setSupplierToDelete(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error(error.response?.data?.message || 'Failed to delete supplier', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async () => {
    if (!selectedSupplier) return;

    try {
      setLoading(true);
      const response = await api.put(`/api/tenant/supplier/${selectedSupplier.id}`, editFormData);

      if (response.data.success) {
        toast.success('Supplier updated successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        

        mutate('/api/tenant/supplier');
        
        setShowEditModal(false);
        setSelectedSupplier(null);
      } else {
        throw new Error(response.data.message || 'Failed to update supplier');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error(error.response?.data?.message || 'Failed to update supplier', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    toast.info('CSV export feature coming soon!', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleUploadCSV = () => {
    toast.info('CSV upload feature coming soon!', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleBackToList = () => {
    setSelectedSupplier(null);
  };

  const refreshData = () => {
    mutate('/api/tenant/supplier');
    toast.info('Refreshing supplier data...', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  if (!selectedSupplier) {
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

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Supplier Management</h1>
            <p className="text-lg text-gray-600">View and manage all suppliers</p>
            
            
          </div>


          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2">
                  <FaFileExcel />
                  Excel
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2">
                  <FaFilePdf />
                  PDF
                </button>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleDownloadCSV}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
                >
                  <FaDownload />
                  Download CSV
                </button>
                <button 
                  onClick={handleUploadCSV}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
                >
                  <FaUpload />
                  Upload CSV
                </button>
              </div>

              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search suppliers by name, phone, GST or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>


          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading suppliers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg text-gray-700 mb-2">Failed to load suppliers</p>
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Person</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GST Number</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((supplier) => (
                          <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleSupplierClick(supplier)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                              >
                                {supplier.name}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{supplier.contact_person || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{supplier.phone}</div>
                              {supplier.alternate_phone && (
                                <div className="text-xs text-gray-500 mt-1">{supplier.alternate_phone}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{supplier.email || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{supplier.gst_number || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                supplier.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {supplier.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(supplier)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors text-lg"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(supplier)}
                                  className="text-red-600 hover:text-red-900 transition-colors text-lg"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <p className="text-lg font-medium mb-2">No suppliers found</p>
                              <p className="text-sm">No suppliers available or matching your search criteria</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>


        {showDeleteModal && supplierToDelete && (
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
                  Are you sure you want to delete supplier <span className="font-semibold">{supplierToDelete.name}</span>?
                  <br />
                  <span className="text-sm text-red-500">This action cannot be undone.</span>
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSupplierToDelete(null);
                    }}
                    disabled={loading}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteSupplier}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Supplier'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {showEditModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Supplier</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={editFormData.contact_person}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternate_phone"
                      value={editFormData.alternate_phone}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gst_number"
                      value={editFormData.gst_number}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditFormChange}
                      rows="3"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSupplier(null);
                    }}
                    disabled={loading}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateSupplier}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Supplier'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">

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

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">

        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 font-medium text-sm"
              >
                <FaArrowLeft className="text-xs" />
                Back to Suppliers
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Supplier Details</h1>
                <p className="text-sm text-gray-600">{selectedSupplier.name}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition text-xs font-medium flex items-center gap-2">
                  <FaFileExcel />
                  Export Excel
                </button>
                <button className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition text-xs font-medium flex items-center gap-2">
                  <FaFilePdf />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>


        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Supplier Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p className="text-sm font-medium text-gray-900">{selectedSupplier.contact_person || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">{selectedSupplier.phone}</p>
              {selectedSupplier.alternate_phone && (
                <p className="text-xs text-gray-500">Alt: {selectedSupplier.alternate_phone}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{selectedSupplier.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">GST Number</p>
              <p className="text-sm font-medium text-gray-900">{selectedSupplier.gst_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                selectedSupplier.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedSupplier.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-sm font-medium text-gray-900">{selectedSupplier.address || 'N/A'}</p>
            </div>
          </div>
        </div>


        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Ledger Transactions</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                className="px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaFileInvoice className="mx-auto text-5xl" />
            </div>
            <p className="text-gray-600 mb-2">Ledger feature coming soon!</p>
            <p className="text-sm text-gray-500">Supplier ledger transactions will be available in the next update</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;

