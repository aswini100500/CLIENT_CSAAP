










































































































































































































































































































































































































































import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../hooks/useAuth";

const MyTour = () => {
  const [showAddTour, setShowAddTour] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [tours, setTours] = useState([]);

  const { user } = useAuth();

  const fetchTours = async () => {
    const API_BASE = import.meta.env.VITE_HRMS_BASE_URL || `${import.meta.env.VITE_HRMS_BASE_URL}`;
    try {
      const response = await axios.get(`${API_BASE}/api/tours?user_id=${user.company_id}`);
      const body = response.data;
      const list = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : []);
      setTours(list);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
    }
  };

  useEffect(() => {
    if (user.company_id) fetchTours();
  }, [user.company_id]);


  const [tourData, setTourData] = useState({
    tourTo: '',
    fromDate: '',
    toDate: '',
    expensesDate: '',
    amount: '',
    billFile: null
  });

  const handleAddExpense = () => {
    const newExpense = {
      id: Date.now(),
      date: tourData.expensesDate || new Date().toISOString().split('T')[0],
      details: '',
      amount: '',
      image: null
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

 
const handleSaveTour = async () => {

  if (!tourData.tourTo || !tourData.fromDate || !tourData.toDate) {
    alert('Please fill in Tour Destination, From Date and To Date');
    return;
  }

  const formData = new FormData();
  const API_BASE = import.meta.env.VITE_HRMS_BASE_URL || `${import.meta.env.VITE_HRMS_BASE_URL}`;


  formData.append('user_id', user.company_id);
  formData.append('company_id', user?.company_id ?? user?.id);


  formData.append('tourTo', tourData.tourTo);
  formData.append('tour_to', tourData.tourTo);

  formData.append('fromDate', tourData.fromDate);
  formData.append('from_date', tourData.fromDate);

  formData.append('toDate', tourData.toDate);
  formData.append('to_date', tourData.toDate);

  formData.append('amount', tourData.amount || 0);


  if (tourData.billFile) formData.append('bill_file', tourData.billFile);


  expenses.forEach((exp, index) => {
    formData.append(`expenses[${index}][date]`, exp.date);
    formData.append(`expenses[${index}][expense_date]`, exp.date);
    formData.append(`expenses[${index}][details]`, exp.details);
    formData.append(`expenses[${index}][amount]`, exp.amount);
    if (exp.image) {
      formData.append(`expenses[${index}][image]`, exp.image);
      formData.append(`expenses[${index}][receipt]`, exp.image);
    }
  });

  try {
    const res = await axios.post(`${API_BASE}/api/tours`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });


    alert('Tour saved successfully!');
    setShowAddTour(false);

    try { await fetchTours(); } catch (e) { console.warn('refresh failed', e); }
  } catch (err) {
    console.error('Error saving tour', err);
    alert(err.response?.data?.error || 'Error saving tour');
  }
};



  const handleInputChange = (field, value) => {
    setTourData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTourData(prev => ({ ...prev, billFile: file }));
    }
  };

  const handleExpenseFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      handleExpenseChange(id, 'image', file);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">

      {!showAddTour ? (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tour Dashboard</h1>
              <p className="text-gray-600">Manage your tour applications and expenses</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <span>📥</span>
                Download CSV Format
              </button>
              <button className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2">
                <span>📤</span>
                Upload CSV File
              </button>
              <button 
                onClick={() => setShowAddTour(true)}
                className="px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>➕</span>
                Add New Tour
              </button>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
              <div className="text-blue-600 font-semibold">Total Tours</div>
              <div className="text-2xl font-bold text-gray-800">0</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
              <div className="text-green-600 font-semibold">Approved</div>
              <div className="text-2xl font-bold text-gray-800">0</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
              <div className="text-yellow-600 font-semibold">Pending</div>
              <div className="text-2xl font-bold text-gray-800">0</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
              <div className="text-red-600 font-semibold">Rejected</div>
              <div className="text-2xl font-bold text-gray-800">0</div>
            </div>
          </div>


          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">Show</span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search tours..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>



<div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg">
  <table className="w-full">
    <thead>
      <tr className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-300">
        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2">
            <span>#</span>
          </div>
        </th>
        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
            <span>Tour Destination</span>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 leading-none">▲</span>
              <span className="text-xs text-gray-400 leading-none -mt-1">▼</span>
            </div>
          </div>
        </th>
        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2">
            <span>From Date</span>
          </div>
        </th>
        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2">
            <span>To Date</span>
          </div>
        </th>
        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2">
            <span>Status</span>
          </div>
        </th>
        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2">
            <span>Created At</span>
          </div>
        </th>
        <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-sm">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {tours.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-6 py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No tours found</h3>
              <p className="text-gray-500 text-sm">Create your first tour to get started</p>
            </div>
          </td>
        </tr>
      ) : (
        tours.map((tour, index) => {
          const isCompleted = new Date(tour.to_date) < new Date();
          const isOngoing = new Date(tour.from_date) <= new Date() && new Date(tour.to_date) >= new Date();
          
          return (
            <tr 
              key={tour.id} 
              className="hover:bg-blue-50/50 transition-colors duration-150 group"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-lg">
                  {index + 1}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                 
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tour.tour_to || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tour.duration || 'N/A'} days
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">
                  {new Date(tour.from_date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tour.from_date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">
                  {new Date(tour.to_date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tour.to_date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isCompleted 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : isOngoing
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                    isCompleted ? 'bg-green-500' : isOngoing ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></span>
                  {isCompleted ? 'Completed' : isOngoing ? 'Ongoing' : 'Upcoming'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(tour.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tour.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <span className="text-lg">👁️</span>
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Edit"
                  >
                    <span className="text-lg">✏️</span>
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>


<div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
  <div className="text-sm text-gray-600">
    Showing <span className="font-semibold text-gray-900">{tours.length}</span> of{' '}
    <span className="font-semibold text-gray-900">{tours.length}</span> entries
  </div>
  <div className="flex items-center gap-2">
    <button 
      className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-medium"
      disabled
    >
      <span className="text-lg">←</span>
      Previous
    </button>
    <div className="flex items-center gap-1">
      <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-sm">
        1
      </button>
    </div>
    <button 
      className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-medium"
      disabled={tours.length === 0}
    >
      Next
      <span className="text-lg">→</span>
    </button>
  </div>
</div>
        </div>
      ) : (

        <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <button 
                  onClick={() => setShowAddTour(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Create New Tour</h1>
              </div>
              <p className="text-gray-600 ml-11">Fill in the details below to create a new tour application</p>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tour Destination <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tourData.tourTo}
                    onChange={(e) => handleInputChange('tourTo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter destination"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tourData.fromDate}
                      onChange={(e) => handleInputChange('fromDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tourData.toDate}
                      onChange={(e) => handleInputChange('toDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>


              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Expenses Date
                  </label>
                  <input
                    type="date"
                    value={tourData.expensesDate}
                    onChange={(e) => handleInputChange('expensesDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Total Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={tourData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Bill Upload
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="px-5 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2">
                      <span>📎</span>
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <span className="text-gray-500 text-sm">
                      {tourData.billFile ? tourData.billFile.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>


            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Expenses Details</h3>
                  <p className="text-gray-600 text-sm">Add individual expense items for this tour</p>
                </div>
                <button
                  onClick={handleAddExpense}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <span>💸</span>
                  Add Expense Item
                </button>
              </div>


              {expenses.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Details</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Amount</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Receipt</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="date"
                              value={expense.date}
                              onChange={(e) => handleExpenseChange(expense.id, 'date', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={expense.details}
                              onChange={(e) => handleExpenseChange(expense.id, 'details', e.target.value)}
                              placeholder="Expense description"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                              <input
                                type="number"
                                value={expense.amount}
                                onChange={(e) => handleExpenseChange(expense.id, 'amount', e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <label className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                              <span>📎</span>
                              Attach
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleExpenseFileChange(expense.id, e)}
                                accept=".pdf,.jpg,.jpeg,.png"
                              />
                            </label>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 text-sm"
                            >
                              <span>🗑️</span>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {expenses.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="text-4xl mb-3">💸</div>
                  <div className="text-gray-500 mb-2">No expenses added yet</div>
                  <div className="text-sm text-gray-400">Click "Add Expense Item" to get started</div>
                </div>
              )}
            </div>


            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddTour(false)}
                className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
             <button
  onClick={async () => {
    await handleSaveTour();
    window.location.reload();
  }}
  className="px-8 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
>
  <span>💾</span>
  Save Tour Application
</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTour;