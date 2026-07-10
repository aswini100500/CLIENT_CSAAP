import React, { useState, useEffect } from 'react';

const PaymentsPage = () => {
  const [amount, setAmount] = useState(100);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
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

  const handlePayment = async () => {
    if (!isScriptLoaded && !window.Razorpay) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: "rzp_test_your_key_here",
      amount: amount * 100, 
      currency: "INR",
      name: "Builder ERP",
      description: "Test Transaction",
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "Test User",
        email: "test.user@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#16a34a"
      }
    };

    const rzp1 = new window.Razorpay(options);
    
    rzp1.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
    });

    rzp1.open();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Payments</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Make a Payment</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (INR)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 text-slate-800"
          />
        </div>
        <button 
          onClick={handlePayment}
          disabled={!isScriptLoaded && !window.Razorpay}
          className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-400"
        >
          Pay with Razorpay
        </button>
      </div>
    </div>
  );
};

export default PaymentsPage;
