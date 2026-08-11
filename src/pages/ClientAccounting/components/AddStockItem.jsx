import React from "react";
import { useState } from "react";
import { PackagePlus, Save } from "lucide-react";

const AddStockItem = () => {
  const [item, setItem] = useState({
    name: "",
    qty: "",
    rate: "",
    value: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = { ...item, [name]: value };

    if (name === "qty" || name === "rate") {
      const qty = Number(updated.qty);
      const rate = Number(updated.rate);

      updated.value = qty && rate ? qty * rate : "";
    }

    setItem(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!item.name) return alert("Item name is required!");

    const existing = JSON.parse(localStorage.getItem("stockItems")) || [];
    const updatedList = [...existing, item];

    localStorage.setItem("stockItems", JSON.stringify(updatedList));

    alert("Item added successfully!");

    setItem({
      name: "",
      qty: "",
      rate: "",
      value: "",
    });
  };

  return (
    <div className="erp-root app-shell min-h-screen p-6 font-sans flex justify-center items-start">
      <div className="app-panel w-full max-w-lg overflow-hidden border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs space-y-6">
        <div className="px-6 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
            <PackagePlus className="size-6 text-[#00a651]" />
          </div>
          <div>
            <h2 className="app-title text-base font-extrabold text-[#042f2e]">
              Add Quick Stock Item
            </h2>
            <p className="app-subtitle text-xs text-[#475569] font-medium mt-0.5">
              Enter stock item name, quantity, rate, and calculated value.
            </p>
          </div>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={item.name}
              onChange={handleChange}
              className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white placeholder-[#94a3b8] focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] outline-none"
              placeholder="e.g. Cement Bag 50kg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                name="qty"
                value={item.qty}
                onChange={handleChange}
                className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] outline-none text-right"
                placeholder="0"
              />
            </div>

            <div>
              <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                Rate (₹)
              </label>
              <input
                type="number"
                name="rate"
                value={item.rate}
                onChange={handleChange}
                className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white focus:border-[#00a651] outline-none text-right"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
              Calculated Total Value (₹)
            </label>
            <input
              type="number"
              name="value"
              value={item.value}
              readOnly
              className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-bold text-[#00a651] bg-[#f0fdf4]/50 outline-none cursor-not-allowed text-right"
              placeholder="0.00"
            />
          </div>

          <button
            type="submit"
            className="h-10 app-btn-primary w-full mt-2 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            <Save className="size-4" /> Add Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStockItem;
