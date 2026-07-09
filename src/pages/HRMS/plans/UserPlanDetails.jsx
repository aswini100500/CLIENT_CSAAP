import React, { useEffect, useMemo, useState } from "react";
import axios from 'axios';
import { useSelector } from 'react-redux';
import useAuth from "../../../hooks/useAuth";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Loader2,
  Package,
  RefreshCw,
} from "lucide-react";
import userPlanService from "../../../api/userPlanService";

const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;
const GST_RATE = 0.18;
const VITE_RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim();

const unwrapApiData = (payload) => {
  if (!payload) return payload;
  if (Array.isArray(payload)) return payload;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.data && payload.data.data && Array.isArray(payload.data.data)) return payload.data.data;
  if (payload.data && typeof payload.data === "object") return payload.data;
  return payload;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = String(value).replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeIds = (ids) => {
  if (!ids) return [];
  
  const extractId = (item) => {
    if (item && typeof item === "object") {
      return String(item.id ?? item.service_id ?? item.value ?? item);
    }
    return String(item);
  };

  if (Array.isArray(ids)) return ids.map(extractId);
  if (typeof ids === "string") {
    try {
      const parsed = JSON.parse(ids);
      if (Array.isArray(parsed)) return parsed.map(extractId);
    } catch {
      return ids.split(",").map((id) => id.trim()).filter(Boolean);
    }
  }
  return [extractId(ids)];
};

const getServiceId = (service) =>
  service?.id ?? service?.service_id ?? service?.master_service_id ?? service?.value;

const getServiceName = (service) =>
  service?.service_name || service?.name || service?.title || `Service #${getServiceId(service)}`;

const getServicePrice = (service) =>
  toNumber(
    service?.price ??
      service?.amount ??
      service?.cost ??
      service?.service_cost ??
      service?.service_price ??
      service?.rate
  );

const getProjectCost = (company) =>
  toNumber(
    company?.main_project_cost ??
      company?.project_cost ??
      company?.projectCost ??
      company?.total_project_cost ??
      company?.cost
  );

const getPlanDuration = (company) =>
  company?.duration ??
  company?.plan_duration ??
  company?.validity ??
  company?.subscription_duration ??
  company?.plan_validity;

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(toNumber(amount));

const UserPlanDetails = () => {
  const { user, token: authToken, companyId: authCompanyId } = useAuth();
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(Boolean(window.Razorpay));
  const [processingPayment, setProcessingPayment] = useState(false);
  const [projectPrice, setProjectPrice] = useState(0);

  // Get company data from Redux
  const companyData = useSelector(state => state.companyApi.data);

  const requiredServiceIds = useMemo(
    () => normalizeIds(company?.required_services),
    [company?.required_services]
  );

  const selectedServices = useMemo(() => {
    const requiredIdSet = new Set(requiredServiceIds);
    return services.filter((service) => requiredIdSet.has(String(getServiceId(service))));
  }, [requiredServiceIds, services]);

  const missingServiceIds = useMemo(() => {
    const selectedIdSet = new Set(selectedServices.map((service) => String(getServiceId(service))));
    return requiredServiceIds.filter((id) => !selectedIdSet.has(id));
  }, [requiredServiceIds, selectedServices]);

  const costs = useMemo(() => {
    const servicesTotal = selectedServices.reduce(
      (total, service) => total + getServicePrice(service),
      0
    );

    const mainProjectCost = projectPrice > 0 ? projectPrice : getProjectCost(company);
    const subtotal = servicesTotal + mainProjectCost;
    const gstAmount = subtotal * GST_RATE;

    return {
      servicesTotal,
      mainProjectCost,
      subtotal,
      gstAmount,
      grandTotal: subtotal + gstAmount,
    };
  }, [company, selectedServices, projectPrice]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      if (window.Razorpay) {
        setIsScriptLoaded(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => setIsScriptLoaded(true));
        existingScript.addEventListener("error", () => setIsScriptLoaded(false));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => setIsScriptLoaded(false);
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const id = authCompanyId;

    if (!id) {
      setError("Company id was not found. Please login again.");
      setLoading(false);
      return;
    }

    setCompanyId(id);
  }, [authCompanyId]);

  useEffect(() => {
    if (!companyId) return;

    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [companyResponse, servicesResponse] = await Promise.all([
          userPlanService.getCompanyDetailsById(companyId),
          userPlanService.getAllServices(),
        ]);

        const companyData = unwrapApiData(companyResponse);
        const servicesData = unwrapApiData(servicesResponse);

        // Fetch custom project price
        try {
          const priceRes = await axios.get(`${API_BASE_URL}/api/master/user-service-prices/company/${companyId}`);
          if (priceRes.data?.success && Array.isArray(priceRes.data.data) && priceRes.data.data.length > 0) {
            setProjectPrice(Number(priceRes.data.data[0].price) || 0);
          }
        } catch (e) {
          console.warn("Could not fetch custom project price", e);
        }

        setCompany(companyData || null);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load user plan details.";

        setError(message);
        console.error("Error loading user plan details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [companyId]);

  // ==========================================
  // PAYMENT SUCCESS HANDLER (UPDATED)
  // ==========================================
  const handlePaymentSuccess = async (response) => {
    try {
      // ✅ STEP 1: Validate Razorpay response
      if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
        throw new Error('Invalid Razorpay response - missing required fields');
      }

      // ✅ STEP 2: Default Payment Info (Removed the failing GET request)
      const paymentMethod = 'Razorpay';
      const bankName = null;

      // ✅ STEP 3: Get company and user details
      const adminPhoneValue =
        companyData?.admin_phone ||
        companyData?.adminPhone ||
        companyData?.phone ||
        companyData?.mobile ||
        companyData?.contact_number ||
        companyData?.contactNumber ||
        company?.admin_phone ||
        company?.adminPhone ||
        company?.phone ||
        company?.mobile ||
        company?.contact_number ||
        company?.contactNumber ||
        user?.phone ||
        user?.mobile ||
        user?.contact_number ||
        user?.contactNumber ||
        null;

      // ✅ STEP 4: Prepare payment data
      const paymentData = {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,

        orderId: response.razorpay_order_id,
        companyId: authCompanyId,
        serviceId: null, 

        companyName: companyData?.master_company_name || companyData?.company_name || company?.master_company_name || company?.company_name,
        companyEmail: companyData?.email || companyData?.company_email || company?.email || company?.company_email,
        adminEmail: companyData?.admin_email || companyData?.adminEmail || company?.admin_email || company?.adminEmail,
        adminPhone: adminPhoneValue,

        bankName: bankName,
        amount: costs.grandTotal,
        currency: 'INR',
        paymentMethod: paymentMethod,
        status: 'completed',

        paymentSummaryDetails: {
          costs,
          selectedServices,
          requiredServiceIds,
          company: {
            id: company?.id,
            name: company?.master_company_name || company?.company_name,
            email: company?.email || company?.company_email
          },
          timestamp: new Date().toISOString(),
          razorpayDetails: {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          }
        }
      };

      // ✅ STEP 5: Create payment record on backend
      const apiResponse = await axios.post(`${API_BASE_URL}/api/master/payments`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
        timeout: 30000, 
      });

      if (apiResponse.data?.success) {
        // Success
        alert(`Payment Successful! 🎉\n\nPayment ID: ${response.razorpay_payment_id}\nAmount: ${formatMoney(costs.grandTotal)}\n\nPayment record saved successfully.`);
        // window.location.reload(); 
      } else {
        const errorMsg = apiResponse.data?.message || 'Payment record could not be saved.';
        alert(`Payment Successful, but saving failed!\n\nPayment ID: ${response.razorpay_payment_id}\n\n⚠️ Warning: ${errorMsg}`);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      let errorMessage = 'Payment processing failed. Please contact support.';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error (${error.response.status}).`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      alert(`Payment Issue\n\nPayment ID: ${response.razorpay_payment_id}\n\n${errorMessage}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentFailure = (razorpayError) => {
    setProcessingPayment(false);
    const errorDescription = razorpayError?.error?.description;
    const errorReason = razorpayError?.error?.reason;
    let userMessage = errorDescription || `Payment failed: ${errorReason || 'Unknown error'}`;
    alert(`Payment Failed\n\n${userMessage}\n\nPlease try again or contact support if the problem persists.`);
  };

  // ==========================================
  // PAYMENT INITIALIZATION (UPDATED)
  // ==========================================
  const handlePayment = async () => {
    if (!VITE_RAZORPAY_KEY_ID) {
      setError("Razorpay key id is missing. Please set VITE_RAZORPAY_KEY_ID in the frontend .env file.");
      return;
    }

    if (!window.Razorpay || !isScriptLoaded) {
      setError("Razorpay checkout could not be loaded. Please refresh and try again.");
      return;
    }

    if (costs.grandTotal <= 0) {
      setError("Payment amount is not available for this plan.");
      return;
    }

    if (!authCompanyId) {
      setError("Company information is missing. Please login again.");
      return;
    }

    if (!company?.master_company_name && !company?.company_name) {
      setError("Company name is required for payment processing.");
      return;
    }

    setProcessingPayment(true);
    setError("");

    try {
      // ✅ STEP 1: CREATE THE ORDER ON THE BACKEND FIRST
      const orderResponse = await axios.post(
        `${API_BASE_URL}/api/master/payments/create-order`, 
        { amount: costs.grandTotal }, 
        { headers: { Authorization: authToken ? `Bearer ${authToken}` : undefined } }
      );

      if (!orderResponse.data?.success || !orderResponse.data?.order?.id) {
        throw new Error("Failed to generate order ID from server.");
      }

      // ✅ STEP 2: EXTRACT THE ORDER ID
      const orderId = orderResponse.data.order.id;

      // ✅ STEP 3: INITIALIZE RAZORPAY WITH THE ORDER ID
      const options = {
        key: VITE_RAZORPAY_KEY_ID,
        amount: Math.round(costs.grandTotal * 100), // paise
        currency: "INR",
        name: "Builder ERP",
        description: `Plan services payment for ${company?.master_company_name || company?.company_name || "company"}`,
        order_id: orderId, // 🟢 CRITICAL FIX: Passing the generated order ID
        prefill: {
          name: company?.master_company_name || company?.company_name || "",
          email: company?.email || company?.company_email || "",
          contact: company?.phone || company?.mobile || company?.contact_number || "",
        },
        notes: {
          company_id: company?.id || authCompanyId,
          required_services: requiredServiceIds.join(","),
        },
        theme: { color: "#16a34a" },
        handler: handlePaymentSuccess,
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          },
          confirm_close: true,
          escape: true,
        },
        retry: { enabled: false },
        timeout: 300, 
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => handlePaymentFailure(response.error));
      razorpay.open();

    } catch (initError) {
      console.error('Order creation error:', initError);
      setProcessingPayment(false);
      setError("Failed to initialize payment order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-90 items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-green-700" />
            Loading user plan details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-green-700">
              User Management
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">User Plan Details</h1>
            <p className="mt-2 text-slate-600">
              {company?.master_company_name || company?.company_name || "Company plan"} service
              charges and payment summary.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to continue</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {company && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Duration</span>
                  <CalendarDays className="h-5 w-5 text-green-700" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {getPlanDuration(company) || "N/A"}
                </p>
                <p className="mt-1 text-sm text-slate-500">Plan validity</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Required Services</span>
                  <Package className="h-5 w-5 text-green-700" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{requiredServiceIds.length}</p>
                <p className="mt-1 text-sm text-slate-500">
                  IDs: {requiredServiceIds.length ? requiredServiceIds.join(", ") : "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Main Project Cost</span>
                  <IndianRupee className="h-5 w-5 text-green-700" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatMoney(costs.mainProjectCost)}
                </p>
                <p className="mt-1 text-sm text-slate-500">Fetched from company details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-700" />
                  <h2 className="text-xl font-semibold text-slate-900">Selected Services</h2>
                </div>

                {selectedServices.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Service ID</th>
                          <th className="px-4 py-3 font-semibold">Service Name</th>
                          <th className="px-4 py-3 text-right font-semibold">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {selectedServices.map((service) => (
                          <tr key={String(getServiceId(service))}>
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {getServiceId(service)}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              <div className="font-medium text-slate-900">
                                {getServiceName(service)}
                              </div>
                              {service?.description && (
                                <div className="mt-1 text-xs text-slate-500">
                                  {service.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                              {formatMoney(getServicePrice(service))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    No matching services were found for the required service IDs.
                  </div>
                )}

                {missingServiceIds.length > 0 && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Service master data was not found for ID(s): {missingServiceIds.join(", ")}.
                  </div>
                )}
              </section>

              <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-700" />
                  <h2 className="text-xl font-semibold text-slate-900">Payment Summary</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Services total</span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(costs.servicesTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Main project cost</span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(costs.mainProjectCost)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(costs.subtotal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">GST ({GST_RATE * 100}%)</span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(costs.gstAmount)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-900">Total payable</span>
                      <span className="text-2xl font-bold text-green-700">
                        {formatMoney(costs.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={processingPayment || !isScriptLoaded || !VITE_RAZORPAY_KEY_ID || costs.grandTotal <= 0}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pay with Razorpay
                    </>
                  )}
                </button>

                {!isScriptLoaded && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Loading Razorpay checkout...
                  </p>
                )}

                {!VITE_RAZORPAY_KEY_ID && (
                  <p className="mt-3 text-center text-xs text-red-600">
                    Razorpay key id is not configured.
                  </p>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPlanDetails;
