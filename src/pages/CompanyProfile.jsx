import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Phone, MapPin, Calendar, Users, Hash, 
  Globe, FileText, BadgeCheck, Settings, Briefcase, Award, 
  Clock, Loader2, AlertCircle, User, Edit3, Link2, 
  CreditCard, Store, FileCheck, Eye, Download, Trash2,
  CheckCircle, XCircle, AlertTriangle, Info, Copy, 
  ExternalLink, MoreVertical, ChevronDown
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const CompanyProfilePage = () => {
  const { companyId } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) {
        setError('No company ID found. Please ensure you are logged in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://csaapnodeapi.csaap.com/api/builder-companies/${companyId}`);
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setCompanyData(result.data);
          setError(null);
          // Log the logo path to debug
          console.log('Logo path from API:', result.data.logo_path);
        } else {
          throw new Error('Invalid data structure received from API');
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err.message || 'Failed to load company data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'inactive':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'pending':
        return <AlertTriangle className="h-3.5 w-3.5" />;
      case 'inactive':
      case 'rejected':
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <Info className="h-3.5 w-3.5" />;
    }
  };

  const logoUrl = companyData?.logo_path 
    ? `https://csaapnodeapi.csaap.com/${companyData.logo_path}`
    : null;

  // Company name for fallback
  const companyName = companyData?.company_name || companyData?.master_company_name || "Company";
  const companyLogoText = companyName.charAt(0).toUpperCase();

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#e2f2e9] text-center max-w-md">
          <Loader2 className="h-12 w-12 text-[#00a651] animate-spin mx-auto mb-4" />
          <p className="text-[#1e293b] text-lg font-medium">Loading company profile...</p>
          <p className="text-[#475569] text-sm mt-1">Please wait while we fetch your company details</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#e2f2e9] text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h3 className="text-xl font-bold text-[#042f2e] mb-2">Unable to Load Profile</h3>
          <p className="text-[#475569] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#008c44] text-white font-medium transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!companyData) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#e2f2e9] text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-[#e2f2e9] flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-[#94a3b8]" />
          </div>
          <h3 className="text-xl font-bold text-[#042f2e] mb-2">No Company Data</h3>
          <p className="text-[#475569]">Unable to find company information. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="app-shell p-4 min-h-screen bg-[#f8faf8]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e2f2e9] bg-linear-to-r from-[#f8faf8] to-[#f0fdf4]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#042f2e] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00a651]/10 border border-[#00a651]/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#00a651]" />
                  </div>
                  {companyName}
                </h1>
                <p className="text-[#475569] text-sm mt-1 flex items-center gap-2">
                  <span>Company Profile</span>
                  <span className="w-1 h-1 rounded-full bg-[#94a3b8]"></span>
                  <span className="text-[#94a3b8]">ID: {companyData.id || companyData.master_company_id}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(companyData.status || companyData.master_status)}`}>
                  {getStatusIcon(companyData.status || companyData.master_status)}
                  {(companyData.status || companyData.master_status || 'unknown').charAt(0).toUpperCase() + 
                   (companyData.status || companyData.master_status || 'unknown').slice(1)}
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#e2f2e9] hover:border-[#00a651] hover:bg-[#f0fdf4] text-[#1e293b] font-medium transition duration-200">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Company Logo and Basic Info - Updated to match Sidebar */}
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-[#f0fdf4] to-[#ecfdf5] border-2 border-[#e2f2e9] flex items-center justify-center overflow-hidden shadow-sm">
                  {logoUrl && !logoError ? (
                    <img 
                      src={logoUrl}
                      alt={companyName}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.error('Logo failed to load in profile page');
                        setLogoError(true);
                      }}
                      onLoad={() => console.log('Logo loaded successfully in profile page')}
                    />
                  ) : (
                    /* Fallback text logo - same as Sidebar */
                    <div className="w-full h-full bg-linear-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-3xl font-bold">
                      {companyLogoText}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Company Name</p>
                  <p className="text-[14px] font-bold text-[#042f2e] mt-1">{companyName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Subdomain</p>
                  <p className="text-[14px] font-bold text-[#042f2e] mt-1">{companyData.subdomain}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Slug</p>
                  <p className="text-[14px] font-bold text-[#042f2e] mt-1">{companyData.slug}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
              <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#00a651]" />
                  Company Information
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Company Size</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.company_size || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Year Established</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.year_established || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Registration Number</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.registration_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">GST Number</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.gst_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">PAN Number</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.pan_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Database Name</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.db_name || companyData.master_db_name}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
              <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#00a651]" />
                  Address
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Street Address</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.street_address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">City</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">State</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Zip Code</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.zip_code || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Admin */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
              <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#00a651]" />
                  Contact
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Email</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1 break-all">{companyData.company_email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Phone</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.company_phone}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Website</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.website || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Admin Information */}
            <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
              <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-[#00a651]" />
                  Administrator
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Name</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.admin_name}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Email</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1 break-all">{companyData.admin_email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">Phone</p>
                  <p className="text-[14px] font-semibold text-[#1e293b] mt-1">{companyData.admin_phone}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
