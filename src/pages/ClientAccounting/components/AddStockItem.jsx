import React, { useState } from "react";

const AddStockItem = () => {
  const [item, setItem] = useState({
    name: "",
    qty: "",
    rate: "",
    value: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = { ...item, [name]: value };

    // Auto calculate value
    if (name === "qty" || name === "rate") {
      const qty = Number(updated.qty);
      const rate = Number(updated.rate);

      updated.value = qty && rate ? qty * rate : "";
    }

    setItem(updated);
  };

  // Save data to localStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!item.name) return alert("Item name is required!");

    const existing = JSON.parse(localStorage.getItem("stockItems")) || [];

    const updatedList = [...existing, item];

    localStorage.setItem("stockItems", JSON.stringify(updatedList));

    alert("Item added successfully!");

    // Reset the form
    setItem({
      name: "",
      qty: "",
      rate: "",
      value: "",
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <div className="bg-white shadow-lg p-6 rounded w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Add Stock Item
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Item Name</label>
            <input
              type="text"
              name="name"
              value={item.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="qty"
              value={item.qty}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block font-medium mb-1">Rate</label>
            <input
              type="number"
              name="rate"
              value={item.rate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block font-medium mb-1">Value</label>
            <input
              type="number"
              name="value"
              value={item.value}
              readOnly
              className="w-full border p-2 rounded bg-gray-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStockItem;
