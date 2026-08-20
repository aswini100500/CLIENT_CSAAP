import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Building2,
  Mail,
  MapPin,
  BadgeCheck,
  Briefcase,
  Loader2,
  AlertCircle,
  Edit3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Search,
  RefreshCw,
  X,
  ShieldAlert,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const API_BASE_URL =
  import.meta.env.VITE_CSAAP_URL || "https://csaapnodeapi.csaap.com";
const HRMS_BASE_URL =
  import.meta.env.VITE_HRMS_BASE_URL || "https://buildererphrms.csaap.com";

const CompanyProfilePage = () => {
  const { user, companyId: authCompanyId } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);

  // Branch Master State
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    branch_name: "",
    branch_code: "",
    address: "",
    phone: "",
    email: "",
  });
  const [branchErrors, setBranchErrors] = useState({});
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);
  const [branchDeleteModal, setBranchDeleteModal] = useState({
    isOpen: false,
    branch: null,
    error: "",
  });
  const [isDeletingBranch, setIsDeletingBranch] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const resolvedCompanyId = useMemo(() => {
    return (
      authCompanyId ||
      user?.company_id ||
      user?.companyId ||
      user?.id ||
      null
    );
  }, [authCompanyId, user]);

  const resolvedCompanySlug = useMemo(() => {
    return (
      user?.slug ||
      user?.company_slug ||
      user?.subdomain ||
      companyData?.subdomain ||
      companyData?.slug ||
      ""
    );
  }, [user, companyData]);

  // Fetch company profile details
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!resolvedCompanyId) {
        setError("No company ID found. Please ensure you are logged in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/builder-companies/${resolvedCompanyId}`,
        );

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setCompanyData(result.data);
          setError(null);
        } else {
          throw new Error("Invalid data structure received from API");
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(
          err.message || "Failed to load company data. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [resolvedCompanyId]);

  // Fetch branches
  const fetchBranches = async () => {
    if (!resolvedCompanyId && !resolvedCompanySlug) return;
    setLoadingBranches(true);
    try {
      const token =
        user?.token ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {};
      if (resolvedCompanyId) params.company_id = resolvedCompanyId;
      if (resolvedCompanySlug) params.company_slug = resolvedCompanySlug;

      const response = await axios.get(`${HRMS_BASE_URL}/api/branch`, {
        params,
        headers,
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        setBranches(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch company branches:", err);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    if (resolvedCompanyId || resolvedCompanySlug) {
      fetchBranches();
    }
  }, [resolvedCompanyId, resolvedCompanySlug]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "inactive":
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
      case "approved":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "pending":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      case "inactive":
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <Info className="h-3.5 w-3.5" />;
    }
  };

  // Branch CRUD Handlers
  const openCreateBranchModal = () => {
    setEditingBranch(null);
    setBranchForm({
      branch_name: "",
      branch_code: "",
      address: "",
      phone: "",
      email: "",
    });
    setBranchErrors({});
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      branch_name: branch.branch_name || branch.branchName || "",
      branch_code: branch.branch_code || branch.branchCode || "",
      address: branch.address || "",
      phone: branch.phone || branch.phoneNo || "",
      email: branch.email || "",
    });
    setBranchErrors({});
    setIsBranchModalOpen(true);
  };

  const handleBranchFormChange = (e) => {
    const { name, value } = e.target;
    setBranchForm((prev) => ({
      ...prev,
      [name]: name === "branch_code" ? value.toUpperCase() : value,
    }));

    if (branchErrors[name] || branchErrors.form) {
      setBranchErrors((prev) => ({
        ...prev,
        [name]: "",
        form: "",
      }));
    }
  };

  const validateBranchForm = () => {
    const errs = {};
    if (!branchForm.branch_name.trim()) {
      errs.branch_name = "Branch Name is required";
    }
    if (!branchForm.branch_code.trim()) {
      errs.branch_code = "Branch Code is required";
    }
    setBranchErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    if (!validateBranchForm()) return;

    setIsSubmittingBranch(true);
    setBranchErrors({});

    try {
      const token =
        user?.token ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        ...branchForm,
        branch_name: branchForm.branch_name.trim(),
        branch_code: branchForm.branch_code.trim().toUpperCase(),
        company_id: resolvedCompanyId,
        company_slug: resolvedCompanySlug,
      };

      if (editingBranch) {
        const res = await axios.put(
          `${HRMS_BASE_URL}/api/branch/${editingBranch.id}`,
          payload,
          { headers },
        );
        if (res.data?.success) {
          setMessage({
            type: "success",
            text: `Branch "${payload.branch_name}" updated successfully!`,
          });
          setIsBranchModalOpen(false);
          fetchBranches();
        }
      } else {
        const res = await axios.post(`${HRMS_BASE_URL}/api/branch`, payload, {
          headers,
        });
        if (res.data?.success) {
          setMessage({
            type: "success",
            text: `Branch "${payload.branch_name}" created successfully!`,
          });
          setIsBranchModalOpen(false);
          fetchBranches();
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "An error occurred while saving the branch.";
      setBranchErrors({ form: errorMsg });
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  const confirmDeleteBranch = async () => {
    if (!branchDeleteModal.branch) return;
    setIsDeletingBranch(true);
    setBranchDeleteModal((prev) => ({ ...prev, error: "" }));

    try {
      const token =
        user?.token ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.delete(
        `${HRMS_BASE_URL}/api/branch/${branchDeleteModal.branch.id}`,
        { headers },
      );

      if (res.data?.success) {
        setMessage({
          type: "success",
          text: `Branch "${branchDeleteModal.branch.branch_name}" deleted successfully!`,
        });
        setBranchDeleteModal({ isOpen: false, branch: null, error: "" });
        fetchBranches();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to delete branch. Ensure no employees or QR checkpoints are assigned to it.";
      setBranchDeleteModal((prev) => ({ ...prev, error: errorMsg }));
    } finally {
      setIsDeletingBranch(false);
    }
  };

  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return branches;
    const q = branchSearch.toLowerCase();
    return branches.filter(
      (b) =>
        (b.branch_name && b.branch_name.toLowerCase().includes(q)) ||
        (b.branch_code && b.branch_code.toLowerCase().includes(q)) ||
        (b.address && b.address.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)),
    );
  }, [branches, branchSearch]);

  const logoUrl = companyData?.logo_path
    ? `${API_BASE_URL}/${companyData.logo_path}`
    : null;

  const companyName =
    companyData?.company_name || companyData?.master_company_name || "Company";
  const companyLogoText = companyName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#e2f2e9] text-center max-w-md">
          <Loader2 className="h-12 w-12 text-[#00a651] animate-spin mx-auto mb-4" />
          <p className="text-[#1e293b] text-lg font-medium">
            Loading company profile...
          </p>
          <p className="text-[#475569] text-sm mt-1">
            Please wait while we fetch your company details
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#e2f2e9] text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h3 className="text-xl font-bold text-[#042f2e] mb-2">
            Unable to Load Profile
          </h3>
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

  if (!companyData) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#e2f2e9] text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-[#e2f2e9] flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-[#94a3b8]" />
          </div>
          <h3 className="text-xl font-bold text-[#042f2e] mb-2">
            No Company Data
          </h3>
          <p className="text-[#475569]">
            Unable to find company information. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell p-4 min-h-screen bg-[#f8faf8]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Flash Message Banner */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Company Header Card */}
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
                  <span>Organization Master</span>
                  <span className="w-1 h-1 rounded-full bg-[#94a3b8]"></span>
                  <span className="text-[#94a3b8]">
                    ID: {companyData.id || companyData.master_company_id}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(companyData.status || companyData.master_status)}`}
                >
                  {getStatusIcon(
                    companyData.status || companyData.master_status,
                  )}
                  {(
                    companyData.status ||
                    companyData.master_status ||
                    "unknown"
                  )
                    .charAt(0)
                    .toUpperCase() +
                    (
                      companyData.status ||
                      companyData.master_status ||
                      "unknown"
                    ).slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-[#e2f2e9] bg-white flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3.5 border-b-2 font-semibold text-sm flex items-center gap-2 transition duration-200 cursor-pointer ${
                activeTab === "profile"
                  ? "border-[#00a651] text-[#00a651]"
                  : "border-transparent text-[#475569] hover:text-[#1e293b] hover:border-slate-300"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Company Details
            </button>
            <button
              onClick={() => setActiveTab("branches")}
              className={`py-3.5 border-b-2 font-semibold text-sm flex items-center gap-2 transition duration-200 cursor-pointer ${
                activeTab === "branches"
                  ? "border-[#00a651] text-[#00a651]"
                  : "border-transparent text-[#475569] hover:text-[#1e293b] hover:border-slate-300"
              }`}
            >
              <GitBranch className="h-4 w-4" />
              Branches
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "branches"
                    ? "bg-[#00a651]/15 text-[#00a651]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {branches.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Profile View */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-[#f0fdf4] to-[#ecfdf5] border-2 border-[#e2f2e9] flex items-center justify-center overflow-hidden shadow-sm">
                    {logoUrl && !logoError ? (
                      <img
                        src={logoUrl}
                        alt={companyName}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-3xl font-bold">
                        {companyLogoText}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Company Name
                    </p>
                    <p className="text-[14px] font-bold text-[#042f2e] mt-1">
                      {companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Subdomain
                    </p>
                    <p className="text-[14px] font-bold text-[#042f2e] mt-1">
                      {companyData.subdomain || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                      Slug
                    </p>
                    <p className="text-[14px] font-bold text-[#042f2e] mt-1">
                      {companyData.slug || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                    <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[#00a651]" />
                      Company Information
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Company Size
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.company_size || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Year Established
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.year_established || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Registration Type
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.registration_type || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        GST Number
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.gst_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                    <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#00a651]" />
                      Location & Address
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Registered Address
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        City
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        State / Country
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {[companyData.state, companyData.country]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                    <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#00a651]" />
                      Contact Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Company Email
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1 break-all">
                        {companyData.company_email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Company Phone
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.company_phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Website
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.website || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#e2f2e9] shadow-sm overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
                    <h2 className="text-[15px] font-bold text-[#042f2e] flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-[#00a651]" />
                      Administrator
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Name
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.admin_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Email
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1 break-all">
                        {companyData.admin_email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
                        Phone
                      </p>
                      <p className="text-[14px] font-semibold text-[#1e293b] mt-1">
                        {companyData.admin_phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branches View */}
        {activeTab === "branches" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white rounded-2xl border border-[#e2f2e9] p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#042f2e] flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-[#00a651]" />
                  Branch Hierarchy Master
                </h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Manage all organizational operating branches, unique codes, and location checkpoints
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search branches..."
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#e2f2e9] focus:outline-none focus:border-[#00a651] focus:ring-1 focus:ring-[#00a651]"
                  />
                  {branchSearch && (
                    <button
                      onClick={() => setBranchSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={fetchBranches}
                  disabled={loadingBranches}
                  className="p-2 rounded-xl border border-[#e2f2e9] hover:bg-[#f0fdf4] text-slate-600 hover:text-[#00a651] transition disabled:opacity-50"
                  title="Refresh branches"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingBranches ? "animate-spin text-[#00a651]" : ""}`}
                  />
                </button>

                <button
                  onClick={openCreateBranchModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a651] hover:bg-[#008c44] text-white text-sm font-semibold shadow-sm transition duration-200 cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add Branch
                </button>
              </div>
            </div>

            {/* Branches List / Grid */}
            {loadingBranches ? (
              <div className="bg-white rounded-2xl border border-[#e2f2e9] p-12 text-center shadow-sm">
                <Loader2 className="h-8 w-8 text-[#00a651] animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">
                  Loading branches...
                </p>
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e2f2e9] p-12 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] border border-[#e2f2e9] flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="h-7 w-7 text-[#00a651]" />
                </div>
                <h3 className="text-base font-bold text-[#042f2e] mb-1">
                  {branchSearch ? "No matching branches found" : "No branches configured yet"}
                </h3>
                <p className="text-xs text-[#475569] max-w-sm mx-auto mb-5">
                  {branchSearch
                    ? `No branches matched your query "${branchSearch}". Try searching with a different keyword.`
                    : "Create your company's operational branches to assign employees and establish QR check-in points."}
                </p>
                {!branchSearch && (
                  <button
                    onClick={openCreateBranchModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a651] hover:bg-[#008c44] text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create First Branch
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="bg-white rounded-2xl border border-[#e2f2e9] p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-[15px] text-[#042f2e] leading-snug group-hover:text-[#00a651] transition">
                            {branch.branch_name}
                          </h3>
                          <div className="mt-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#e2f2e9] text-[#042f2e] text-[11px] font-mono font-bold tracking-wider border border-[#00a651]/20">
                              {branch.branch_code}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditBranchModal(branch)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00a651] hover:bg-[#f0fdf4] transition"
                            title="Edit branch"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setBranchDeleteModal({
                                isOpen: true,
                                branch,
                                error: "",
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete branch"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs text-[#475569] pt-2 border-t border-slate-100">
                        {branch.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#00a651] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{branch.address}</span>
                          </div>
                        )}
                        {branch.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-[#00a651] shrink-0" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-[#00a651] shrink-0" />
                            <span className="truncate">{branch.email}</span>
                          </div>
                        )}
                        {!branch.address && !branch.phone && !branch.email && (
                          <p className="text-slate-400 italic text-[11px]">
                            No additional contact details provided
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f0fdf4] flex items-center justify-between text-[11px] text-[#94a3b8]">
                      <span>Branch ID: #{branch.id}</span>
                      <span>
                        {branch.created_at
                          ? formatDate(branch.created_at)
                          : "Active"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Branch */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#e2f2e9] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#e2f2e9] flex items-center justify-between bg-linear-to-r from-[#f8faf8] to-[#f0fdf4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00a651]/10 flex items-center justify-center text-[#00a651]">
                  <GitBranch className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#042f2e]">
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </h3>
              </div>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="p-6 space-y-4">
              {branchErrors.form && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{branchErrors.form}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#042f2e] uppercase tracking-wider mb-1.5">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={branchForm.branch_name}
                  onChange={handleBranchFormChange}
                  placeholder="e.g. Bhubaneswar HQ"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    branchErrors.branch_name
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-[#e2f2e9] focus:border-[#00a651] focus:ring-[#00a651]/20"
                  } focus:outline-none focus:ring-2`}
                />
                {branchErrors.branch_name && (
                  <p className="text-xs text-rose-600 mt-1">
                    {branchErrors.branch_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042f2e] uppercase tracking-wider mb-1.5">
                  Branch Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="branch_code"
                  value={branchForm.branch_code}
                  onChange={handleBranchFormChange}
                  placeholder="e.g. BBSR-HQ"
                  className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border ${
                    branchErrors.branch_code
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-[#e2f2e9] focus:border-[#00a651] focus:ring-[#00a651]/20"
                  } focus:outline-none focus:ring-2`}
                />
                <p className="text-[11px] text-[#94a3b8] mt-1">
                  Unique alphanumeric identifier used for reports and tokenized QR badges.
                </p>
                {branchErrors.branch_code && (
                  <p className="text-xs text-rose-600 mt-1">
                    {branchErrors.branch_code}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042f2e] uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={branchForm.address}
                  onChange={handleBranchFormChange}
                  placeholder="Plot 101, Infocity, Bhubaneswar, Odisha - 751024"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e2f2e9] focus:outline-none focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#042f2e] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={branchForm.phone}
                    onChange={handleBranchFormChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e2f2e9] focus:outline-none focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#042f2e] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={branchForm.email}
                    onChange={handleBranchFormChange}
                    placeholder="branch@company.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e2f2e9] focus:outline-none focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#e2f2e9] hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00a651] hover:bg-[#008c44] text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingBranch && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingBranch ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Branch Confirmation */}
      {branchDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#042f2e]">
                  Delete Branch?
                </h3>
                <p className="text-xs text-[#475569] mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-900">
                    "{branchDeleteModal.branch?.branch_name}"
                  </strong>{" "}
                  ({branchDeleteModal.branch?.branch_code})? This action cannot be undone.
                </p>
              </div>

              {branchDeleteModal.error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Deletion Blocked
                  </div>
                  <p>{branchDeleteModal.error}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setBranchDeleteModal({
                      isOpen: false,
                      branch: null,
                      error: "",
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-[#e2f2e9] hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteBranch}
                  disabled={isDeletingBranch}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingBranch && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Delete Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfilePage;
