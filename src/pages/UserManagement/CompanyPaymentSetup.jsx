import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  Loader2,
  Save,
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";

const CompanyPaymentSetup = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [price, setPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError("");

        const companyRes = await axios.get(
          `https://csaapnodeapi.csaap.com/api/builder-companies/${id}`,
        );

        const payload = companyRes.data;
        let companyData = null;
        if (payload && payload.data) {
          companyData = Array.isArray(payload.data)
            ? payload.data[0]
            : payload.data;
          if (
            companyData &&
            companyData.data &&
            Array.isArray(companyData.data)
          ) {
            companyData = companyData.data[0];
          } else if (
            companyData &&
            companyData.data &&
            typeof companyData.data === "object"
          ) {
            companyData = companyData.data;
          }
        }

        if (!companyData) {
          throw new Error("Could not parse company data from response.");
        }

        setCompany(companyData);

        try {
          const priceRes = await axios.get(
            `https://csaapnodeapi.csaap.com/api/master/user-service-prices/company/${id}`,
          );
          if (
            priceRes.data?.success &&
            Array.isArray(priceRes.data.data) &&
            priceRes.data.data.length > 0
          ) {
            setPrice(priceRes.data.data[0].price);
          }
        } catch (priceErr) {
          console.warn(
            "No existing price found or error fetching price",
            priceErr,
          );
        }
      } catch (err) {
        setError(err.message || "Failed to fetch company details");
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
      setError("");
      setSuccessMessage("");

      const response = await axios.post(
        "https://csaapnodeapi.csaap.com/api/master/user-service-prices",
        {
          companyId: Number(id),
          price: String(price),
        },
      );

      if (response.data && response.data.success) {
        setSuccessMessage(
          "Project price has been successfully set for this company.",
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setError("Failed to save price. Please try again.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "An error occurred while saving the price.",
      );
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading) {
    return (
      <div className="crm-module-root min-h-screen p-6 bg-[var(--bg-app)] flex justify-center items-center">
        <div className="flex items-center gap-3 app-panel p-6 shadow-sm">
          <Loader2 className="animate-spin text-[var(--brand)] h-6 w-6" />
          <span className="text-[var(--text-soft)] font-medium">
            Loading company details...
          </span>
        </div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="crm-module-root min-h-screen p-6 bg-[var(--bg-app)]">
        <button
          onClick={() => navigate("/users/all-companies")}
          className="mb-4 text-[var(--brand)] hover:text-[var(--brand-strong)] flex items-center text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Companies
        </button>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="crm-module-root min-h-screen p-6 bg-[var(--bg-app)]">
      <button
        onClick={() => navigate("/users/all-companies")}
        className="mb-6 text-[var(--text-soft)] hover:text-[var(--text-strong)] flex items-center text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All Companies
      </button>

      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="app-title">
            Company Dashboard
          </h1>
          <p className="app-subtitle mt-1">
            View details and configure manual pricing for{" "}
            <span className="font-semibold text-[var(--text-strong)]">
              {company?.master_company_name ||
                company?.company_name ||
                "this company"}
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg">
            <p className="text-rose-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-[var(--brand)] p-4 rounded-r-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[var(--brand)]" />
            <p className="text-[var(--brand-strong)] text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        <div className="app-panel overflow-hidden">
          <div className="border-b border-[var(--border-soft)] bg-[var(--bg-subtle)] px-6 py-4 flex items-center gap-3">
            <div className="bg-[var(--brand-soft)] p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-[var(--brand-strong)]" />
            </div>
            <h2 className="app-heading">
              Company Details
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 bg-white">
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Company Name
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {company?.master_company_name || company?.company_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Registration No.
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {company?.registration_number || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                GST Number
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {company?.gst_number || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Database Name
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {company?.master_db_name || company?.db_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Admin Email
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {company?.master_admin_email ||
                  company?.company_email ||
                  company?.email ||
                  "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Status
              </p>
              <div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    company?.master_status === "active" ||
                    company?.status === "active" ||
                    company?.status === "approved"
                      ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {company?.master_status || company?.status || "Unknown"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Company Size
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {company?.company_size || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Year Established
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {company?.year_established || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1">
                Full Address
              </p>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {[
                  company?.street_address,
                  company?.city,
                  company?.state,
                  company?.zip_code,
                ]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="app-panel overflow-hidden">
          <div className="border-b border-[var(--border-soft)] bg-[var(--bg-subtle)] px-6 py-4 flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <IndianRupee className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="app-heading">
              Project Price Configuration
            </h2>
          </div>

          <div className="p-6 bg-white">
            <p className="text-sm text-[var(--text-soft)] mb-6 max-w-2xl">
              Set the main project price for this company. This price will be
              used in the User Plan Details instead of the default calculated
              project cost, allowing you to offer custom manual pricing for
              individual tenants.
            </p>

            <div className="max-w-sm">
              <label
                htmlFor="price"
                className="block text-xs font-bold text-[var(--text-soft)] uppercase tracking-wider mb-1.5"
              >
                Manual Project Price (INR)
              </label>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[var(--text-soft)] sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  className="app-input pl-7 block w-full"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <button
                onClick={handleSavePrice}
                disabled={savingPrice}
                className="app-btn-primary w-full flex justify-center items-center gap-2"
              >
                {savingPrice ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {savingPrice ? "Saving Price..." : "Save Project Price"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPaymentSetup;
