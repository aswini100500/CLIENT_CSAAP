import React, { useState, useEffect } from "react";
import plansService from "../api/plansService";
import useAuth from "../hooks/useAuth";

const PlansPage = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [plans, setPlans] = useState([]);
  const [matchedPlan, setMatchedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setIsScriptLoaded(true);
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          setIsScriptLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          setIsScriptLoaded(false);
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (!user) return;

    const tenantId = user.tenant_id || user.company_id || user.id || null;
    if (!tenantId) {
      setError("Tenant ID is missing in user session.");
      setLoading(false);
      return;
    }
    setCompanyId(tenantId);
  }, [user]);

  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const companyData = await plansService.getCompanyById(companyId);
        setCompany(companyData.data || companyData);

        const plansData = await plansService.getAvailablePlans();
        const plansArray = plansData.data || plansData;
        setPlans(plansArray);

        const matched = matchCompanyWithPlan(
          companyData.data || companyData,
          plansArray,
        );
        setMatchedPlan(matched);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const matchCompanyWithPlan = (companyData, availablePlans) => {
    if (!companyData || !availablePlans || availablePlans.length === 0) {
      return null;
    }

    const numberOfUsers = companyData.number_of_users;
    const numberOfProjects = companyData.number_of_projects;
    const planDuration = companyData.plan_duration;

    const matched = availablePlans.find((plan) => {
      return (
        plan.user >= numberOfUsers &&
        plan.numberproject >= numberOfProjects &&
        plan.validity >= planDuration / 2
      );
    });

    return matched || null;
  };

  const handlePlanPayment = async (plan) => {
    if (!isScriptLoaded && !window.Razorpay) {
      setError(
        "Razorpay SDK failed to load. Please check your internet connection.",
      );
      return;
    }

    setProcessingPayment(true);
    setSelectedPlan(plan);

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key_here",
        amount: Math.round(plan.price * 100),
        currency: "INR",
        name: "Builder ERP",
        description: plan.description,
        prefill: {
          name: company?.company_name || "Company",
          email: company?.email || "",
          contact: company?.phone || "",
        },
        notes: {
          companyId: company?.id,
          planId: plan.id,
          planName: plan.description,
          validity: plan.validity,
        },
        theme: {
          color: "#3b82f6",
        },
        handler: function (response) {
          handlePaymentSuccess(response, plan);
        },
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response) {
        handlePaymentFailure(response.error, plan);
      });

      rzp1.open();
    } catch (err) {
      setError("Failed to initiate payment: " + err.message);
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = (response, plan) => {
    setProcessingPayment(false);
    setSelectedPlan(null);

    alert(
      `✓ Payment Successful!\n\nPayment ID: ${response.razorpay_payment_id}\n\nPlan: ${plan.description}\nAmount: ₹${formatPrice(plan.price)}\nValidity: ${plan.validity} days\n\nYour subscription is now active.`,
    );
  };

  const handlePaymentFailure = (error, plan) => {
    setProcessingPayment(false);
    setSelectedPlan(null);

    alert(
      `Payment Failed!\n\nError: ${error.description}\n\nPlan: ${plan.description}\n\nPlease try again.`,
    );

    console.error("Payment failed:", error);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Plans & Subscription
      </h1>

      {companyId === null && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg shadow-md border border-yellow-200 text-yellow-800">
          Loading tenant information from session...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-slate-600">
            Loading plans and company information...
          </div>
        </div>
      )}

      {!loading && company && (
        <>
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              Company Information
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Number of Users
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {company.number_of_users}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Number of Projects
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {company.number_of_projects}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Plan Duration (days)
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {company.plan_duration}
                </p>
              </div>
            </div>
          </div>

          {matchedPlan && (
            <div className="mb-6 bg-linear-to-r from-green-50 to-emerald-50 p-6 rounded-lg shadow-md border-2 border-green-500">
              <h2 className="text-xl font-semibold mb-4 text-green-800">
                ✓ Recommended Plan Match
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Plan Name
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {matchedPlan.description}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Price
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(matchedPlan.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Included Users / Projects / Validity
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {matchedPlan.user} users / {matchedPlan.numberproject}{" "}
                    projects / {matchedPlan.validity} days
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Match Score
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    Users:{" "}
                    {matchedPlan.user >= company.number_of_users ? "✓" : "✗"} |
                    Projects:{" "}
                    {matchedPlan.numberproject >= company.number_of_projects
                      ? "✓"
                      : "✗"}{" "}
                    | Duration:{" "}
                    {matchedPlan.validity >= company.plan_duration / 2
                      ? "✓"
                      : "✗"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!matchedPlan && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium">
                ⚠ No perfect plan match found. Please review available plans
                below.
              </p>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              All Available Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isMatched = matchedPlan && matchedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isMatched
                        ? "bg-green-50 border-green-500 shadow-lg"
                        : "bg-white border-slate-200 hover:shadow-md"
                    }`}
                  >
                    {isMatched && (
                      <div className="mb-2 inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        MATCHED
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-800 mb-3">
                      {plan.description}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Projects:</span>
                        <span className="font-semibold text-slate-800">
                          {plan.numberproject}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Users:</span>
                        <span className="font-semibold text-slate-800">
                          {plan.user}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Validity:</span>
                        <span className="font-semibold text-slate-800">
                          {plan.validity} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                        <span className="text-slate-600">Price:</span>
                        <span className="font-bold text-lg text-blue-600">
                          {formatPrice(plan.price)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs mb-4">
                      {plan.user >= company.number_of_users && (
                        <div className="text-green-600 flex items-center">
                          <span className="mr-1">✓</span> Covers{" "}
                          {company.number_of_users} users
                        </div>
                      )}
                      {plan.user < company.number_of_users && (
                        <div className="text-red-600 flex items-center">
                          <span className="mr-1">✗</span> Only {plan.user} users
                        </div>
                      )}

                      {plan.numberproject >= company.number_of_projects && (
                        <div className="text-green-600 flex items-center">
                          <span className="mr-1">✓</span> Covers{" "}
                          {company.number_of_projects} projects
                        </div>
                      )}
                      {plan.numberproject < company.number_of_projects && (
                        <div className="text-red-600 flex items-center">
                          <span className="mr-1">✗</span> Only{" "}
                          {plan.numberproject} projects
                        </div>
                      )}

                      {plan.validity >= company.plan_duration / 2 && (
                        <div className="text-green-600 flex items-center">
                          <span className="mr-1">✓</span> Covers duration
                        </div>
                      )}
                      {plan.validity < company.plan_duration / 2 && (
                        <div className="text-red-600 flex items-center">
                          <span className="mr-1">✗</span> Insufficient duration
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handlePlanPayment(plan)}
                      disabled={processingPayment || !isScriptLoaded}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        isMatched
                          ? "bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-400"
                          : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400"
                      }`}
                    >
                      {processingPayment && selectedPlan?.id === plan.id
                        ? "Processing..."
                        : isMatched
                          ? "Subscribe Now"
                          : "Choose Plan"}
                    </button>

                    <p className="text-xs text-slate-500 text-center mt-2">
                      Created: {formatDate(plan.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlansPage;
