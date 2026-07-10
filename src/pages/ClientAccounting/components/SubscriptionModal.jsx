import { X, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubscriptionModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubscribe = () => {
        onClose();
        navigate("/subscription");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeIn">

                <div className="bg-linear-to-r from-blue-500 to-blue-600 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3 text-white">
                        <Crown size={40} />
                        <div>
                            <h2 className="text-2xl font-bold">Subscription Required</h2>
                            <p className="text-blue-100 text-sm">Unlock all features</p>
                        </div>
                    </div>
                </div>


                <div className="p-6">
                    <p className="text-gray-700 text-lg mb-6">
                        This feature is only available to subscribed users. Subscribe now to get full access to all features!
                    </p>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">With a subscription, you get:</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                <span>Full access to all accounting features</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                <span>Unlimited vouchers and transactions</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                <span>Advanced reports and analytics</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                <span>Priority customer support</span>
                            </li>
                        </ul>
                    </div>


                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleSubscribe}
                            className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            Subscribe Now
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
