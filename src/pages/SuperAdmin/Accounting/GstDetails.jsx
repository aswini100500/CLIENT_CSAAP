import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Hash,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const GstDetails = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchGstDetails = async () => {
      try {
        let currentSlug = window.location.hostname.split(".")[0];
        if (user?.slug || user?.subdomain) {
          currentSlug = user.slug || user.subdomain;
        }

        const token =
          sessionStorage.getItem("accountingToken") ||
          sessionStorage.getItem("adminToken") ||
          sessionStorage.getItem("employeeToken") ||
          sessionStorage.getItem("token");

        const response = await axios.get(
          `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gst/sync`,
          {
            headers: {
              "x-tenant-slug": currentSlug,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            withCredentials: true,
          },
        );

        if (response.data.success) {
          setCompanyDetails(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch GST details.");
        }
      } catch (err) {
        console.error("Error fetching GST details:", err);
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGstDetails();
  }, []);

  const handleStartEdit = () => {
    setEditForm({
      company_name: companyDetails.company_name || "",
      gst_number: companyDetails.gst_number || "",
      pan_number: companyDetails.pan_number || "",
      street_address: companyDetails.street_address || "",
      city: companyDetails.city || "",
      state: companyDetails.state || "",
      zip_code: companyDetails.zip_code || "",
      admin_phone: companyDetails.admin_phone || "",
      company_phone: companyDetails.company_phone || "",
      registration_number: companyDetails.registration_number || "",
    });
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let currentSlug = window.location.hostname.split(".")[0];
      const sessionData = sessionStorage.getItem("user");
      if (sessionData) {
        try {
          const parsedUser = JSON.parse(sessionData);
          if (parsedUser.slug || parsedUser.subdomain) {
            currentSlug = parsedUser.slug || parsedUser.subdomain;
          }
        } catch (e) {
          console.error("Failed to parse user session", e);
        }
      }

      const token =
        sessionStorage.getItem("accountingToken") ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("employeeToken") ||
        sessionStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gst/update`,
        editForm,
        {
          headers: {
            "x-tenant-slug": currentSlug,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setCompanyDetails(response.data.data);
        setIsEditing(false);
        setSuccessMessage("Company & GST details updated successfully!");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.data.message || "Failed to update details.");
      }
    } catch (err) {
      console.error("Error updating details:", err);
      setError(
        err.response?.data?.message || "An error occurred while saving.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">
            Syncing GST Details...
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 font-medium text-sm transition-all duration-200";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            GST & Company Details
          </h1>
          <p className="text-slate-500 mt-1">
            Information synchronized securely from the central database
          </p>
        </div>
        <div className="flex gap-3">
          {companyDetails && !isEditing && (
            <button
              onClick={handleStartEdit}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-xs cursor-pointer"
            >
              Edit Details
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium cursor-pointer"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-xs cursor-pointer"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Sync Error</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start gap-3">
          <CheckCircle2 className="text-green-500 mt-0.5" size={20} />
          <div>
            <h3 className="text-green-800 font-medium">Success</h3>
            <p className="text-green-600 text-sm mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {companyDetails && (
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="bg-linear-to-r from-slate-800 to-slate-900 p-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                <Building2 size={32} className="text-white" />
              </div>
              {isEditing ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={editForm.company_name}
                    onChange={handleInputChange}
                    className="block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:border-white focus:bg-white/20 focus:outline-none font-medium text-sm transition-all"
                    required
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {companyDetails.company_name}
                  </h2>
                  <p className="text-slate-300 flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Active Tenant ({companyDetails.subdomain})
                  </p>
                </>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                  <Mail size={18} />
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    Admin Email
                  </p>
                  <p className="text-slate-800 font-medium">
                    {companyDetails.admin_email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                  <Phone size={18} />
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    Contact Phone
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company_phone"
                      value={editForm.company_phone}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-slate-800 font-medium">
                      {companyDetails.company_phone || "N/A"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                  <Phone size={18} />
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    Admin Phone
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="admin_phone"
                      value={editForm.admin_phone}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-slate-800 font-medium">
                      {companyDetails.admin_phone || "N/A"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="w-full space-y-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Registered Address
                  </p>
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street_address"
                          value={editForm.street_address}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[11px] font-semibold text-slate-400 uppercase">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={editForm.city}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 uppercase">
                            Zip
                          </label>
                          <input
                            type="text"
                            name="zip_code"
                            value={editForm.zip_code}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={editForm.state}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {companyDetails.street_address ? (
                        <>
                          {companyDetails.street_address}
                          <br />
                          {companyDetails.city}, {companyDetails.state}{" "}
                          {companyDetails.zip_code}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="bg-linear-to-r from-green-600 to-emerald-600 p-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                <FileText size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Tax Information
              </h2>
              <p className="text-green-100 flex items-center gap-2 text-sm">
                Registration details
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg shrink-0">
                  <Hash size={18} />
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    GST Number
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="gst_number"
                      value={editForm.gst_number}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-slate-800 font-bold text-lg font-mono">
                        {companyDetails.gst_number || "Not Registered"}
                      </p>
                      {companyDetails.gst_number && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          Valid
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg shrink-0">
                  <FileText size={18} />
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    PAN Number
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="pan_number"
                      value={editForm.pan_number}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-slate-800 font-bold text-lg font-mono tracking-wider">
                      {companyDetails.pan_number || "N/A"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    Company Reg. No
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="registration_number"
                      value={editForm.registration_number}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-slate-800 font-medium">
                      {companyDetails.registration_number || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default GstDetails;
