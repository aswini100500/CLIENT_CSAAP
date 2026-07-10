import React, { useState } from "react";

const OutFlow = () => {
  const [data, setData] = useState([
    { group: "CONSTRUCTION COST", code: "1.1", head: "EARTH WORK", amount: 2118507.96, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.2", head: "PLAIN CEMENT CONCRETE", amount: 8869753.92, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.3", head: "RCC - CONCRETE WORK", amount: 9716404.02, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.4", head: "BRICK WORK / BLOCK WORK", amount: 1659014.53, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.5", head: "MARBLE WORK", amount: 64138283.96, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.6", head: "WOOD WORK", amount: 2877152.49, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.7", head: "STEEL WORK", amount: 552774.79, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.8", head: "FLOORING", amount: 513689.79, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.9", head: "ROOFING", amount: 249551.26, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.10", head: "WATER PROOFING", amount: 2750102.11, quantity: 1 },
    { group: "CONSTRUCTION COST", code: "1.11", head: "PLASTERING", amount: 2750102.11, quantity: 1 },
  ]);

  const [selectedRows, setSelectedRows] = useState([]);

  const toggleSelect = (code) => {
    setSelectedRows((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };


  const updateQuantity = (code, newQty) => {
    setData((prev) =>
      prev.map((item) =>
        item.code === code
          ? { ...item, quantity: newQty === "" ? "" : parseFloat(newQty) }
          : item
      )
    );
  };


  const totalOutflow = data.reduce(
    (sum, item) => sum + (item.amount * (item.quantity || 0)),
    0
  );

  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-green-600 text-white text-left">
            <tr>
              <th className="px-3 py-2 w-10">
                <input type="checkbox" />
              </th>
              <th className="px-3 py-2">Budget Group</th>
              <th className="px-3 py-2">Budget Head</th>
              <th className="px-3 py-2 text-center">Quantity</th>
              <th className="px-3 py-2 text-right">Budgeted Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.code}
                className={`border-b hover:bg-gray-50 ${
                  selectedRows.includes(row.code) ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.code)}
                    onChange={() => toggleSelect(row.code)}
                  />
                </td>
                <td className="px-3 py-2">{row.group}</td>
                <td className="px-3 py-2">{row.head}</td>


                <td className="px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.quantity}
                    onChange={(e) => updateQuantity(row.code, e.target.value)}
                    className="w-20 p-1 text-center border border-gray-300 rounded"
                  />
                </td>


                <td className="px-3 py-2 text-right">
                  {(row.amount * (row.quantity || 0)).toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-t">
        <div className="text-sm text-gray-600">
          Outflow Amount:{" "}
          <span className="font-semibold text-gray-800">
            {totalOutflow.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </span>{" "}
          | Inflow Amount:{" "}
          <span className="font-semibold text-gray-800">₹0.00</span>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button className="px-4 py-1 bg-green-600 text-white rounded hover:bg-blue-700">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutFlow;
