


















  

  









  


























































































































































































































    
































    

    




























    

    













    

    










    
















          


















              















              















              















              















              
















              














              














              


















              














              






















              















              















              















              
















            




















            









































      


      

















































          













          













          






























              












              













            




































































































































































                















          


























import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  IndianRupee,
  Eye,
  Plus,
  Printer,
  Download,
  Search,
  Wallet,
  BarChart3,
  Landmark,
  FilePlus,
  Hash,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';


const AddChequeModal = ({ 
  isOpen, 
  onClose, 
  selectedAccount, 
  chequeForm, 
  setChequeForm, 
  onSubmit, 
  editingChequeId 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingChequeId ? 'Edit Cheque' : 'Add New Cheque'} - {selectedAccount?.accountName}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Number {chequeForm.status !== 'blank' && '*'}
              </label>
              <input
                type="text"
                value={chequeForm.chequeNo}
                onChange={(e) => setChequeForm(prev => ({...prev, chequeNo: e.target.value}))}
                placeholder="e.g., 876543"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
                required={chequeForm.status !== 'blank'}
              />
              {chequeForm.status === 'blank' && (
                <p className="text-xs text-gray-500 mt-1">Leave empty for blank cheque</p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Book Number
              </label>
              <input
                type="text"
                value={chequeForm.chequeBookNumber}
                onChange={(e) => setChequeForm(prev => ({...prev, chequeBookNumber: e.target.value}))}
                placeholder="e.g., CB-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={chequeForm.status}
                onChange={(e) => setChequeForm(prev => ({...prev, status: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="blank">Blank</option>
                <option value="available">Available</option>
                <option value="unreconciled">Unreconciled</option>
                <option value="reconciled">Reconciled</option>
                <option value="cancelled">Cancelled</option>
                <option value="out_of_period">Out of Period</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={chequeForm.type}
                onChange={(e) => setChequeForm(prev => ({...prev, type: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Type</option>
                <option value="issued">Issued</option>
                <option value="received">Received</option>
                <option value="Business">Business</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={chequeForm.amount}
                onChange={(e) => setChequeForm(prev => ({...prev, amount: e.target.value}))}
                placeholder="e.g., 50000.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Issued
              </label>
              <input
                type="date"
                value={chequeForm.date_issued}
                onChange={(e) => setChequeForm(prev => ({...prev, date_issued: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payee Name
              </label>
              <input
                type="text"
                value={chequeForm.payeeName}
                onChange={(e) => setChequeForm(prev => ({...prev, payeeName: e.target.value}))}
                placeholder="Enter payee name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={chequeForm.remarks}
                onChange={(e) => setChequeForm(prev => ({...prev, remarks: e.target.value}))}
                placeholder="Enter remarks"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>
          </div>


          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {editingChequeId ? 'Update Cheque' : 'Add Cheque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AddChequesModal = ({ 
  isOpen, 
  onClose, 
  selectedAccount, 
  addChequesData, 
  setAddChequesData, 
  onSubmit,
  stats,
  handleNumberOfLeavesChange,
  handleStartNumberChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Add Cheque Leaves - {selectedAccount?.accountName}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Book Number
              </label>
              <input
                type="text"
                value={addChequesData.chequeBookNumber}
                onChange={(e) => setAddChequesData(prev => ({...prev, chequeBookNumber: e.target.value}))}
                placeholder="e.g., CB-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={addChequesData.issueDate}
                onChange={(e) => setAddChequesData(prev => ({...prev, issueDate: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cheque Leaves *
              </label>
              <input
                type="number"
                value={addChequesData.numberOfLeaves}
                onChange={handleNumberOfLeavesChange}
                placeholder="e.g., 25, 50, 100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="1"
                autoComplete="off"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Standard: 25, 50, or 100 leaves per book</p>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Cheque Number (Optional)
              </label>
              <input
                type="text"
                value={addChequesData.startNumber}
                onChange={handleStartNumberChange}
                placeholder="e.g., 876501"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoComplete="off"
              />
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated End Number
              </label>
              <input
                type="text"
                value={addChequesData.endNumber}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
                placeholder="Auto-calculated"
              />
              {addChequesData.numberOfLeaves && addChequesData.startNumber && (
                <p className="text-xs text-green-600 mt-1">
                  Cheque numbers: {addChequesData.startNumber} to {addChequesData.endNumber}
                </p>
              )}
            </div>
          </div>


          {addChequesData.numberOfLeaves && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bank Account:</span>
                  <p className="font-medium">{selectedAccount?.accountName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Leaves to Add:</span>
                  <p className="font-medium text-blue-600">{addChequesData.numberOfLeaves}</p>
                </div>
                <div>
                  <span className="text-gray-600">New Total:</span>
                  <p className="font-medium text-green-600">
                    {selectedAccount ? stats.totalCheques + parseInt(addChequesData.numberOfLeaves) : 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium">Blank (Unused)</p>
                </div>
              </div>
            </div>
          )}


          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Cheque Leaves
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChequeRegister = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddChequeModal, setShowAddChequeModal] = useState(false);
  const [showAddChequesModal, setShowAddChequesModal] = useState(false);
  const [editingChequeId, setEditingChequeId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cheques, setCheques] = useState([]);
  const { companyId } = useCompany();

  const [chequeForm, setChequeForm] = useState({
    chequeNo: '',
    chequeBookNumber: '',
    status: 'blank',
    amount: '',
    date_issued: new Date().toISOString().split('T')[0],
    payeeName: '',
    remarks: '',
    type: ''
  });

  const [addChequesData, setAddChequesData] = useState({
    startNumber: '',
    endNumber: '',
    numberOfLeaves: '',
    chequeBookNumber: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState({
    totalCheques: 0,
    availableCheques: 0,
    unreconciled: 0,
    reconciled: 0,
    blankCheques: 0,
    cancelledCheques: 0,
    outOfPeriod: 0
  });


  useEffect(() => {
    fetchBankAccounts();
  }, [companyId]);

  const fetchBankAccounts = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/bank/${companyId}/all`
      );
      
      if (response.data.success) {
        setBankAccounts(response.data.accounts || []);
      } else {
        Swal.fire('Error', response.data.message || 'Failed to fetch bank accounts', 'error');
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      Swal.fire('Error', 'Failed to fetch bank accounts', 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (companyId) {
      fetchCheques();
    }
  }, [companyId]);


  useEffect(() => {
    if (selectedAccount && cheques.length > 0) {
      updateStats();
    }
  }, [cheques, selectedAccount]);


  const fetchCheques = async () => {
    if (!companyId) return;
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/getAllcheque/${companyId}`
      );
      
      console.log('Fetched cheques:', response.data);
      
      if (response.data.success) {

        const transformedCheques = (response.data.data || []).map(cheque => ({
          ...cheque,

          chequeNumber: cheque.chequeNo,
          dateIssued: cheque.date_issued,

          bankName: selectedAccount?.bankName || 'Unknown Bank'
        }));
        console.log('Transformed cheques:', transformedCheques);
        setCheques(transformedCheques);
      } else {
        Swal.fire('Error', response.data.message || 'Failed to fetch cheques', 'error');
      }
    } catch (error) {
      console.error('Error fetching cheques:', error);
      Swal.fire('Error', 'Failed to fetch cheques', 'error');
    }
  };

  const updateStats = () => {
    if (!selectedAccount) return;
    


    const accountCheques = cheques;
    
    const newStats = {
      totalCheques: accountCheques.length,
      availableCheques: accountCheques.filter(c => c.status === 'available').length,
      unreconciled: accountCheques.filter(c => c.status === 'unreconciled').length,
      reconciled: accountCheques.filter(c => c.status === 'reconciled').length,
      blankCheques: accountCheques.filter(c => c.status === 'blank').length,
      cancelledCheques: accountCheques.filter(c => c.status === 'cancelled').length,
      outOfPeriod: accountCheques.filter(c => c.status === 'out_of_period').length
    };
    
    console.log('Updated stats:', newStats);
    setStats(newStats);
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setEditingChequeId(null);
    setFilterStatus('all');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', label: 'Available', icon: <CheckCircle className="w-4 h-4" /> },
      unreconciled: { color: 'bg-yellow-100 text-yellow-800', label: 'Unreconciled', icon: <Clock className="w-4 h-4" /> },
      reconciled: { color: 'bg-blue-100 text-blue-800', label: 'Reconciled', icon: <CheckCircle className="w-4 h-4" /> },
      blank: { color: 'bg-gray-100 text-gray-800', label: 'Blank', icon: <FileText className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
      out_of_period: { color: 'bg-orange-100 text-orange-800', label: 'Out of Period', icon: <Calendar className="w-4 h-4" /> }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const getAccountCheques = () => {
    if (!selectedAccount) return [];



    return cheques;
  };

  const filteredCheques = getAccountCheques().filter(cheque => {
    const searchMatch = !searchTerm || 
      cheque.chequeNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.payeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.chequeBookNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filterStatus === 'all' || cheque.status === filterStatus;
    
    return searchMatch && statusMatch;
  });

  const handleAddCheque = () => {
    if (!selectedAccount) {
      Swal.fire('Warning', 'Please select a bank account first', 'warning');
      return;
    }
    
    setChequeForm({
      chequeNo: '',
      chequeBookNumber: '',
      status: 'blank',
      amount: '',
      date_issued: new Date().toISOString().split('T')[0],
      payeeName: '',
      remarks: '',
      type: ''
    });
    
    setShowAddChequeModal(true);
  };

  const handleEditCheque = (cheque) => {
    setChequeForm({
      chequeNo: cheque.chequeNo || '',
      chequeBookNumber: cheque.chequeBookNumber || '',
      status: cheque.status,
      amount: cheque.amount || '',
      date_issued: cheque.date_issued || new Date().toISOString().split('T')[0],
      payeeName: cheque.payeeName || '',
      remarks: cheque.remarks || '',
      type: cheque.type || ''
    });
    
    setEditingChequeId(cheque.id);
    setShowAddChequeModal(true);
  };

  const handleSaveCheque = async (e) => {
    e.preventDefault();
    
    if (!chequeForm.chequeNo && chequeForm.status !== 'blank') {
      Swal.fire('Warning', 'Please enter cheque number', 'warning');
      return;
    }

    try {
      const chequeData = {
        ...chequeForm,
        amount: chequeForm.amount || "0.00"
      };

      console.log('Saving cheque data:', chequeData);

      if (editingChequeId) {

        const response = await axios.put(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/updateCheque/${editingChequeId}`,
          chequeData
        );

        console.log('Update response:', response.data);

        if (response.data.success) {
          Swal.fire('Success', 'Cheque updated successfully!', 'success');
          await fetchCheques();
        } else {
          Swal.fire('Error', response.data.message || 'Failed to update cheque', 'error');
        }
      } else {

        const response = await axios.post(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/addCheque/${companyId}`,
          chequeData
        );

        console.log('Add response:', response.data);

        if (response.data.success) {
          Swal.fire('Success', 'Cheque added successfully!', 'success');
          await fetchCheques();
        } else {
          Swal.fire('Error', response.data.message || 'Failed to add cheque', 'error');
        }
      }
      
      setShowAddChequeModal(false);
      setEditingChequeId(null);
    } catch (error) {
      console.error('Error saving cheque:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save cheque', 'error');
    }
  };

  const handleDeleteCheque = async (chequeId) => {
    console.log(chequeId);
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this cheque?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {

        Swal.fire('Deleted!', 'Cheque deletion would be implemented with a DELETE endpoint.', 'success');
         await axios.delete(`${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/deleteCheque/${chequeId}`);
         await fetchCheques();
      } catch (error) {
        console.error('Error deleting cheque:', error);
        Swal.fire('Error', 'Failed to delete cheque', 'error');
      }
    }
  };

  const handleAddChequesSubmit = async (e) => {
    e.preventDefault();
    
    if (!addChequesData.numberOfLeaves) {
      Swal.fire('Warning', 'Please enter number of cheque leaves', 'warning');
      return;
    }

    const numberOfLeaves = parseInt(addChequesData.numberOfLeaves);
    const startNumber = addChequesData.startNumber ? parseInt(addChequesData.startNumber) : 1;
    
    try {
      const chequesToAdd = [];
      
      for (let i = 0; i < numberOfLeaves; i++) {
        const chequeNo = addChequesData.startNumber 
          ? (startNumber + i).toString()
          : '';
        
        chequesToAdd.push({
          chequeNo: chequeNo,
          chequeBookNumber: addChequesData.chequeBookNumber || `CB-${Date.now()}`,
          status: 'blank',
          amount: "0.00",
          date_issued: addChequesData.issueDate || '',
          payeeName: '',
          remarks: 'Blank cheque leaf',
          type: ''
        });
      }
console.log(chequesToAdd);


      let successCount = 0;
      for (const chequeData of chequesToAdd) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/cheque/addCheque/${companyId}`,
            chequeData
          );
          if (response.data.success) {
            successCount++;
          }
        } catch (error) {
          console.error('Error adding cheque:', error);
        }
      }

      if (successCount > 0) {
        Swal.fire('Success', `Added ${successCount} cheque leaves successfully!`, 'success');
        await fetchCheques();
      } else {
        Swal.fire('Error', 'Failed to add cheque leaves', 'error');
      }


      setAddChequesData({
        startNumber: '',
        endNumber: '',
        numberOfLeaves: '',
        chequeBookNumber: '',
        issueDate: new Date().toISOString().split('T')[0]
      });
      setShowAddChequesModal(false);
    } catch (error) {
      console.error('Error adding cheque leaves:', error);
      Swal.fire('Error', 'Failed to add cheque leaves', 'error');
    }
  };

  const handleNumberOfLeavesChange = (e) => {
    const value = e.target.value;
    setAddChequesData(prev => ({
      ...prev,
      numberOfLeaves: value,
      endNumber: ''
    }));
  };

  const handleStartNumberChange = (e) => {
    const value = e.target.value;
    setAddChequesData(prev => {
      const start = parseInt(value) || 0;
      const numberOfLeaves = parseInt(prev.numberOfLeaves) || 0;
      const end = start + numberOfLeaves - 1;
      
      return {
        ...prev,
        startNumber: value,
        endNumber: numberOfLeaves > 0 ? end.toString() : ''
      };
    });
  };

  const handleRefresh = async () => {
    await fetchBankAccounts();
    await fetchCheques();
    Swal.fire('Refreshed!', 'Data has been refreshed successfully.', 'success');
  };


  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Wallet className="w-8 h-8 mr-3 text-blue-600" />
                Cheque Register
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all your cheque transactions</p>
            </div>
      
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddCheque}
                disabled={!selectedAccount}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  selectedAccount 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Single Cheque
              </button>
            </div>
          </div>
        </div>


        <AddChequeModal 
          isOpen={showAddChequeModal}
          onClose={() => {
            setShowAddChequeModal(false);
            setEditingChequeId(null);
          }}
          selectedAccount={selectedAccount}
          chequeForm={chequeForm}
          setChequeForm={setChequeForm}
          onSubmit={handleSaveCheque}
          editingChequeId={editingChequeId}
        />
        <AddChequesModal 
          isOpen={showAddChequesModal}
          onClose={() => setShowAddChequesModal(false)}
          selectedAccount={selectedAccount}
          addChequesData={addChequesData}
          setAddChequesData={setAddChequesData}
          onSubmit={handleAddChequesSubmit}
          stats={stats}
          handleNumberOfLeavesChange={handleNumberOfLeavesChange}
          handleStartNumberChange={handleStartNumberChange}
        />


        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Landmark className="w-5 h-5 mr-2 text-blue-600" />
                    Bank Accounts
                  </h3>
                  <p className="text-sm text-gray-500">Select an account to view cheques</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {bankAccounts.map((account) => (
                    <div 
                      key={account.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedAccount?.id === account.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                      onClick={() => handleAccountSelect(account)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Wallet className="w-5 h-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-gray-800">{account.accountName}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{account.bankName}</p>
                          <p className="text-xs text-gray-500 mt-1">Acc: {account.accountNumber}</p>
                          

                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-800">{cheques.length}</p>
                              <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                {cheques.filter(c => c.status === 'available').length}
                              </p>
                              <p className="text-xs text-gray-500">Available</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{account.currentBalance}</p>
                          <p className="text-xs text-gray-500">Balance</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              <div className="bg-white rounded-xl shadow border border-gray-200 mt-6 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Overall Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Bank Accounts</span>
                    <span className="font-bold text-gray-800">{bankAccounts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cheques</span>
                    <span className="font-bold text-gray-800">{cheques.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Blank Leaves</span>
                    <span className="font-bold text-blue-600">
                      {cheques.filter(c => c.status === 'blank').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>


            <div className="lg:col-span-2">
              {selectedAccount ? (
                <div className="space-y-6">

                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedAccount.accountName}</h3>
                        <div className="flex items-center mt-2 space-x-4 text-gray-600">
                          <span className="flex items-center">
                            <Landmark className="w-4 h-4 mr-1" />
                            {selectedAccount.bankName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            {selectedAccount.currentBalance}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => setShowAddChequesModal(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <FilePlus className="w-5 h-5 mr-2" />
                          Add Multiple Cheques
                        </button>
                      </div>
                    </div>
                  </div>


                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Available', key: 'availableCheques', color: 'green', icon: <CheckCircle className="w-6 h-6" /> },
                      { label: 'Unreconciled', key: 'unreconciled', color: 'yellow', icon: <Clock className="w-6 h-6" /> },
                      { label: 'Reconciled', key: 'reconciled', color: 'blue', icon: <CheckCircle className="w-6 h-6" /> },
                      { label: 'Blank', key: 'blankCheques', color: 'gray', icon: <FileText className="w-6 h-6" /> },
                      { label: 'Cancelled', key: 'cancelledCheques', color: 'red', icon: <XCircle className="w-6 h-6" /> },
                      { label: 'Out of Period', key: 'outOfPeriod', color: 'orange', icon: <Calendar className="w-6 h-6" /> },
                      { label: 'Total Cheques', key: 'totalCheques', color: 'indigo', icon: <FileText className="w-6 h-6" /> }
                    ].map((item, index) => (
                      <div key={index} className={`bg-white rounded-xl p-4 shadow border border-${item.color}-200`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm text-${item.color}-600`}>{item.label}</p>
                            <p className={`text-2xl font-bold text-${item.color}-700 mt-1`}>
                              {stats[item.key]}
                            </p>
                          </div>
                          <div className={`bg-${item.color}-100 p-2 rounded-lg`}>
                            {React.cloneElement(item.icon, { className: `w-6 h-6 text-${item.color}-600` })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>


                  <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Cheque Details
                          </h3>
                          <p className="text-sm text-gray-500">
                            Showing {filteredCheques.length} of {getAccountCheques().length} cheques
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">

                          <div className="relative">
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white"
                            >
                              <option value="all">All Status</option>
                              <option value="available">Available</option>
                              <option value="unreconciled">Unreconciled</option>
                              <option value="reconciled">Reconciled</option>
                              <option value="blank">Blank</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="out_of_period">Out of Period</option>
                            </select>
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search cheques..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
                            />
                          </div>
                          
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setFilterStatus('all');
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
                          >
                            <X className="w-5 h-5 mr-2" />
                            Clear
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {['all', 'available', 'unreconciled', 'reconciled', 'blank', 'cancelled'].map(status => (
                          <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1 text-sm rounded-full ${
                              filterStatus === status 
                                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cheque No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Book No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payee/Remarks
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredCheques.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No cheques found</p>
                                <div className="mt-4 flex justify-center space-x-4">
                                  <button
                                    onClick={handleAddCheque}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                  >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add Single Cheque
                                  </button>
                                  <button
                                    onClick={() => setShowAddChequesModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                  >
                                    <FilePlus className="w-5 h-5 mr-2" />
                                    Add Multiple
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredCheques.map((cheque) => (
                              <tr key={cheque.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">
                                    {cheque.chequeNo || 'Blank'}
                                    {cheque.chequeNo && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        <Hash className="w-3 h-3 inline" />
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {cheque.chequeBookNumber || '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {getStatusBadge(cheque.status)}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">
                                    {cheque.amount ? `₹${Number(cheque.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {cheque.date_issued ? new Date(cheque.date_issued).toLocaleDateString('en-IN') : '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    {cheque.payeeName && (
                                      <div className="font-medium text-gray-900">{cheque.payeeName}</div>
                                    )}
                                    {cheque.remarks && (
                                      <div className="text-sm text-gray-500">{cheque.remarks}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleEditCheque(cheque)}
                                      className="text-blue-600 hover:text-blue-800 p-1"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCheque(cheque.id)}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-800 p-1" title="View">

                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Select a Bank Account</h4>
                  <p className="text-gray-500">Select a bank account from the left panel to view cheque details</p>
                </div>
              )}
            </div>
          </div>
        )}


        <div className="mt-8 bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Cheque Status Distribution
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Available', value: stats.availableCheques, color: 'bg-green-500' },
              { label: 'Unreconciled', value: stats.unreconciled, color: 'bg-yellow-500' },
              { label: 'Reconciled', value: stats.reconciled, color: 'bg-blue-500' },
              { label: 'Blank', value: stats.blankCheques, color: 'bg-gray-500' },
              { label: 'Cancelled', value: stats.cancelledCheques, color: 'bg-red-500' },
              { label: 'Out of Period', value: stats.outOfPeriod, color: 'bg-orange-500' }
            ].map((item, index) => {
              const percentage = stats.totalCheques > 0 ? (item.value / stats.totalCheques) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium text-gray-900">
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
      </div>
    </div>
  );
};

export default ChequeRegister;












































  


    
  




      
































































    

    









    

    

































    

    





















    


    








    










     














    






    




    











      









      

      


    













    







    



    




      














    

    

    


























      


























        






































































































































































        

















































































































































      




























              

















                        












                      





                    



































































                    




























                  













                  













                  













                  













                  













                  













                  






























                      


















                        










                        












                    
















                  



















































































































































              
























