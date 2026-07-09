import React, { useState, useEffect } from "react";
import operationApi from "../../../../api/operation";

const ChangeHistory = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getProjectBudgets();
      console.log(response);
      
      setBudgets(response.data || []);
    } catch (error) {
      console.error("Error fetching project budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">History of Project Budget</h2>
        <button
          onClick={fetchBudgets}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 border border-blue-200"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center p-8 text-gray-500 italic border border-dashed border-gray-300 rounded-lg">
            No project budgets found.
          </div>
        ) : (
          <table className="w-full text-sm text-left text-gray-600 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 border-r border-gray-200">ID</th>
                <th scope="col" className="px-6 py-3 border-r border-gray-200">Budget Name</th>
                <th scope="col" className="px-6 py-3 border-r border-gray-200">Subject</th>
                <th scope="col" className="px-6 py-3 border-r border-gray-200">Document Date</th>
                <th scope="col" className="px-6 py-3 border-r border-gray-200">Total Construction</th>
                <th scope="col" className="px-6 py-3 border-r border-gray-200">Total Saleable</th>
                <th scope="col" className="px-6 py-3 border-r border-gray-200">Profit</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget, index) => (
                <tr 
                  key={budget.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-6 py-4 border-r border-gray-200 font-medium text-gray-900">{budget.id}</td>
                  <td className="px-6 py-4 border-r border-gray-200">{budget.selected_budget}</td>
                  <td className="px-6 py-4 border-r border-gray-200">{budget.document_subject}</td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    {budget.document_date ? new Date(budget.document_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 font-medium">₹{Number(budget.total_construction_budget).toLocaleString()}</td>
                  <td className="px-6 py-4 border-r border-gray-200 font-medium">₹{Number(budget.total_saleable_budget).toLocaleString()}</td>
                  <td className="px-6 py-4 border-r border-gray-200 font-medium text-green-600">₹{Number(budget.profit).toLocaleString()} ({budget.profit_ratio}%)</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                      ${budget.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                        budget.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}
                    >
                      {budget.status ? budget.status.charAt(0).toUpperCase() + budget.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ChangeHistory;
