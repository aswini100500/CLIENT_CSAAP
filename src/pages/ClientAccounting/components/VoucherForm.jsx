import React, { useState } from "react";

function VoucherForm() {
  const [voucher, setVoucher] = useState({
    date: "",
    voucherType: "Payment",
    ledger: "",
    amount: "",
    narration: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVoucher({ ...voucher, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Voucher Recorded Successfully!");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Record Voucher</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={voucher.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Voucher Type</label>
          <select
            name="voucherType"
            value={voucher.voucherType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option>Payment</option>
            <option>Receipt</option>
            <option>Contra</option>
            <option>Journal</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Ledger Name</label>
          <input
            type="text"
            name="ledger"
            value={voucher.ledger}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={voucher.amount}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Narration</label>
          <textarea
            name="narration"
            value={voucher.narration}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Voucher
        </button>
      </form>
    </div>
  );
}

export default VoucherForm;
