import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Loader2, Save, ArrowLeft, CheckCircle2, IndianRupee } from 'lucide-react';

const CompanyPaymentSetup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [price, setPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError('');
        

        const companyRes = await axios.get(`https://csaapnodeapi.csaap.com/api/builder-companies/${id}`);
        

        const payload = companyRes.data;
        let companyData = null;
        if (payload && payload.data) {
           companyData = Array.isArray(payload.data) ? payload.data[0] : payload.data;
           if (companyData && companyData.data && Array.isArray(companyData.data)) {
              companyData = companyData.data[0];
           } else if (companyData && companyData.data && typeof companyData.data === 'object') {
              companyData = companyData.data;
           }
        }
        
        if (!companyData) {
          throw new Error('Could not parse company data from response.');
        }
        
        setCompany(companyData);


        try {
          const priceRes = await axios.get(`https://csaapnodeapi.csaap.com/api/master/user-service-prices/company/${id}`);
          if (priceRes.data?.success && Array.isArray(priceRes.data.data) && priceRes.data.data.length > 0) {
            setPrice(priceRes.data.data[0].price);
          }
        } catch (priceErr) {
          console.warn("No existing price found or error fetching price", priceErr);
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch company details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  const handleSavePrice = async () => {
    if (!price || isNaN(price) || Number(price) <= 0) {
      setError("Please enter a valid price amount.");
      return;
    }

    try {
      setSavingPrice(true);
      setError('');
      setSuccessMessage('');

      const response = await axios.post('https://csaapnodeapi.csaap.com/api/master/user-service-prices', {
        companyId: Number(id),
        price: String(price)
      });

      if (response.data && response.data.success) {
        setSuccessMessage("Project price has been successfully set for this company.");
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError("Failed to save price. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "An error occurred while saving the price.");
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex justify-center items-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <Loader2 className="animate-spin text-blue-600 h-6 w-6" />
          <span className="text-slate-600 font-medium">Loading company details...</span>
        </div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <button onClick={() => navigate('/users/all-companies')} className="mb-4 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Companies
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <button 
        onClick={() => navigate('/users/all-companies')} 
        className="mb-6 text-slate-600 hover:text-slate-900 flex items-center text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All Companies
      </button>

      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Dashboard</h1>
          <p className="text-slate-500 mt-1">View details and configure manual pricing for {company?.master_company_name || company?.company_name || "this company"}</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800 text-sm font-medium">{successMessage}</p>
          </div>
        )}


        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-700" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Company Details</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Company Name</p>
              <p className="text-sm font-semibold text-slate-900">{company?.master_company_name || company?.company_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Registration No.</p>
              <p className="text-sm font-semibold text-slate-900">{company?.registration_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">GST Number</p>
              <p className="text-sm font-semibold text-slate-900">{company?.gst_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Database Name</p>
              <p className="text-sm font-semibold text-slate-900">{company?.master_db_name || company?.db_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Admin Email</p>
              <p className="text-sm font-semibold text-slate-900">{company?.master_admin_email || company?.company_email || company?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  company?.master_status === 'active' || company?.status === 'active' || company?.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {company?.master_status || company?.status || 'Unknown'}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Company Size</p>
              <p className="text-sm font-semibold text-slate-900">{company?.company_size || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Year Established</p>
              <p className="text-sm font-semibold text-slate-900">{company?.year_established || "N/A"}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Full Address</p>
              <p className="text-sm font-semibold text-slate-900">
                {[company?.street_address, company?.city, company?.state, company?.zip_code].filter(Boolean).join(', ') || "N/A"}
              </p>
            </div>
          </div>
        </div>


        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <IndianRupee className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Project Price Configuration</h2>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-6 max-w-2xl">
              Set the main project price for this company. This price will be used in the User Plan Details instead of the default calculated project cost, allowing you to offer custom manual pricing for individual tenants.
            </p>
            
            <div className="max-w-sm">
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1.5">
                Manual Project Price (INR)
              </label>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  className="pl-7 block w-full rounded-md border-slate-300 border py-2.5 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-shadow"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleSavePrice}
                disabled={savingPrice}
                className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  savingPrice ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {savingPrice ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {savingPrice ? 'Saving Price...' : 'Save Project Price'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyPaymentSetup;
