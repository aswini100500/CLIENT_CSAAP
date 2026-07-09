import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, CreditCard, Loader2, Search } from 'lucide-react';

const AllCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://csaapnodeapi.csaap.com/api/admin/companies');
        if (response.data && response.data.success) {
          setCompanies(response.data.data || []);
        } else {
          setError('Failed to fetch companies data.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching companies.');
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSetPayment = (company) => {
    // Store both forms of ID just in case
    const sessionData = {
      tenant_id: company.id,
      company_id: company.id,
      id: company.id,
    };
    
    sessionStorage.setItem('viewingCompany', JSON.stringify(sessionData));
    sessionStorage.setItem('company_id', company.id);
    
    // Navigate to the user plan details page
    navigate(`/users/company-payment/${company.id}`);
  };

  const filteredCompanies = companies.filter(company => 
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.db_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-blue-600" />
            All Companies
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage registered companies and their payments</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search companies..."
            className="pl-10 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
          <span className="ml-3 text-slate-500 font-medium">Loading companies...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-600 text-left uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Database</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {company.db_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {company.admin_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.status === 'active' || company.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {company.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(company.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleSetPayment(company)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 font-medium text-xs rounded-md transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          View Details & Pay
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      No companies found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 text-right">
            Showing {filteredCompanies.length} companies
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCompanies;
