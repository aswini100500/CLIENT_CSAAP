import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { CreditCard, Calendar, CheckCircle, XCircle, Crown } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const Subscription = () => {
    const { userId } = useUser();
    const [plans, setPlans] = useState([]);
    const [mySubscriptions, setMySubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSubscription, setActiveSubscription] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_ACCOUNTING_URL || "http://localhost:5000";

    useEffect(() => {
        fetchPlans();
        fetchMySubscriptions();
    }, [userId]);

    const fetchPlans = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/v1/subscription/plans`, {
                withCredentials: true
            });
            if (data.success) {
                setPlans(data.plans);
            }
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        }
    };

    const fetchMySubscriptions = async () => {
        try {
            const { data } = await axios.get(
                `${API_BASE_URL}/api/v1/subscription/my-plan`,
                {
                    params: { userId },
                    withCredentials: true
                }
            );

            console.log("Subscriptions data:", data);

            if (data.success) {
                setMySubscriptions(data.subscriptions);
                // Find active subscription
                const active = data.subscriptions.find(
                    (sub) => sub.status === "active" && new Date(sub.end_date) >= new Date()
                );
                setActiveSubscription(active);
            }
        } catch (error) {
            console.error("Failed to fetch subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId, planPrice) => {
        try {
            console.log("Starting subscription for plan:", planId, "user:", userId);

            // Create order
            const { data: orderData } = await axios.post(
                `${API_BASE_URL}/api/v1/subscription/order`,
                { plan_id: planId, user_id: userId },
                { withCredentials: true }
            );

            console.log("Order response:", orderData);

            if (!orderData.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Order Failed',
                    text: orderData.message || "Failed to create order",
                    confirmButtonColor: '#3B82F6'
                });
                return;
            }

            // Show pricing info with GST breakdown
            const htmlContent = orderData.is_renewal
                ? `<div style="text-align: left; font-size: 14px;">
                    <p style="margin: 10px 0;"><strong>Original Price:</strong> ₹${orderData.original_price}</p>
                    <p style="margin: 10px 0;"><strong>Renewal Price:</strong> ₹${orderData.amount}</p>
                    <p style="margin: 10px 0;"><strong>GST (18%):</strong> ₹${orderData.gst_amount}</p>
                    <hr style="margin: 10px 0; border: 1px solid #e5e7eb;">
                    <p style="margin: 10px 0; font-size: 16px;"><strong>Total Amount:</strong> <span style="color: #3B82F6;">₹${orderData.total_amount}</span></p>
                    <p style="margin: 10px 0; color: #10b981;"><strong>You save:</strong> ₹${orderData.original_price - orderData.amount}</p>
                  </div>`
                : `<div style="text-align: left; font-size: 14px;">
                    <p style="margin: 10px 0;"><strong>Base Price:</strong> ₹${orderData.amount}</p>
                    <p style="margin: 10px 0;"><strong>GST (18%):</strong> ₹${orderData.gst_amount}</p>
                    <hr style="margin: 10px 0; border: 1px solid #e5e7eb;">
                    <p style="margin: 10px 0; font-size: 16px;"><strong>Total Amount:</strong> <span style="color: #3B82F6;">₹${orderData.total_amount}</span></p>
                  </div>`;

            const result = await Swal.fire({
                title: orderData.is_renewal ? '🎉 Renewal Discount Applied!' : 'Subscription Payment',
                html: htmlContent,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3B82F6',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Continue with Payment',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) {
                return;
            }

            // Initialize Razorpay
            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "Accounting Platform",
                description: orderData.is_renewal
                    ? `${orderData.plan_type} Subscription Renewal (₹${orderData.amount})`
                    : `${orderData.plan_type} Subscription`,
                order_id: orderData.order.id,
                handler: async function (response) {
                    console.log("Payment successful, verifying...", response);

                    try {
                        // Verify payment
                        const { data: verifyData } = await axios.post(
                            `${API_BASE_URL}/api/v1/subscription/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan_id: planId,
                                user_id: userId,
                            },
                            { withCredentials: true }
                        );

                        console.log("Verification response:", verifyData);

                        if (verifyData.success) {
                            await Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: 'Subscription activated successfully!',
                                confirmButtonColor: '#3B82F6'
                            });
                            // Reload page to update subscription status in context
                            window.location.reload();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Verification Failed',
                                text: verifyData.message || "Unknown error",
                                confirmButtonColor: '#3B82F6'
                            });
                            console.error("Verification failed:", verifyData);
                        }
                    } catch (error) {
                        console.error("Verification error:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Verification Failed',
                            text: error.response?.data?.message || error.message,
                            confirmButtonColor: '#3B82F6'
                        });
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: "",
                },
                theme: {
                    color: "#3B82F6",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Subscription error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Subscription Failed',
                text: error.response?.data?.message || error.message,
                confirmButtonColor: '#3B82F6'
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }
    const getRemainingDays = (endDate) => {
        const diff = new Date(endDate) - Date.now();
        return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Management</h1>
                <p className="text-gray-600 mb-8">Manage your subscription plans and billing</p>

                {/* Current Subscription Status */}
                {activeSubscription ? (
                    <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <Crown size={32} />
                            <div>
                                <h2 className="text-2xl font-bold">Active Subscription</h2>
                                <p className="text-blue-100">You have full access to all features</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-blue-100 text-sm">Plan</p>
                                <p className="text-xl font-semibold">{activeSubscription.plan_name}</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-blue-100 text-sm">Type</p>
                                <p className="text-xl font-semibold capitalize">{activeSubscription.plan_type}</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-blue-100 text-sm">Remaining Days</p>
                                <p className="text-xl font-semibold">
                                    {getRemainingDays(activeSubscription.end_date)}
                                </p>
                            </div>


                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-blue-100 text-sm">Valid Until</p>
                                <p className="text-xl font-semibold">{formatDate(activeSubscription.end_date)}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
                        <div className="flex items-center gap-3">
                            <XCircle className="text-yellow-600" size={24} />
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800">No Active Subscription</h3>
                                <p className="text-yellow-700">Subscribe to a plan to unlock all features</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Available Plans */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                        >
                            <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-6">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">₹{plan.price}</span>
                                    <span className="text-blue-100">/{plan.type}</span>
                                </div>
                                <p className="text-blue-100 text-sm mt-2">+ 18% GST</p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Full Access to All Features</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Unlimited Vouchers</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Reports & Analytics</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Priority Support</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={() => handleSubscribe(plan.id, plan.price)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={20} />
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscription History */}
                {mySubscriptions.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Subscription History</h2>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {mySubscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-800">{sub.plan_name}</td>
                                            <td className="px-6 py-4 text-gray-600 capitalize">{sub.plan_type}</td>
                                            <td className="px-6 py-4 text-gray-600">{formatDate(sub.start_date)}</td>
                                            <td className="px-6 py-4 text-gray-600">{formatDate(sub.end_date)}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${sub.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : sub.status === "expired"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {sub.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscription;
