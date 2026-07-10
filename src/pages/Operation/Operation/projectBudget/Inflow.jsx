





























































    














    





































        






































        














    










































































    






















































































































































































































import React, { useState } from "react";
import Swal from "sweetalert2";

const InFlow = () => {
  const [data, setData] = useState([
    { source: "Aggregates", code: "INF-1", description: "Crushed stone supply", quantity: 50, amount: 150000, status: "approved" },
    { source: "Sand", code: "INF-2", description: "River sand delivered", quantity: 30, amount: 100000, status: "pending" },
    { source: "Cement", code: "INF-3", description: "50kg bags - initial stock", quantity: 100, amount: 250000, status: "approved" },
    { source: "Bricks", code: "INF-4", description: "Red bricks - batch 1", quantity: 5000, amount: 180000, status: "pending" },
    { source: "Granite", code: "INF-5", description: "Granite slabs - flooring", quantity: 200, amount: 200000, status: "approved" },
  ]);

  const [formData, setFormData] = useState({
    source: "",
    code: "",
    description: "",
    quantity: "",
    amount: "",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelect = (code) => {
    setSelectedRows((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((row) => row.code));
    }
    setSelectAll(!selectAll);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!formData.source || !formData.amount || !formData.quantity) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please enter Material Source, Quantity, and Amount!",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const newItem = {
      ...formData,
      code: `INF-${data.length + 1}`,
      amount: parseFloat(formData.amount),
      quantity: parseFloat(formData.quantity),
      status: "pending",
    };

    setData((prev) => [...prev, newItem]);
    setFormData({ source: "", code: "", description: "", quantity: "", amount: "" });

    Swal.fire({
      icon: "success",
      title: "Entry Added",
      text: "New material entry has been added successfully!",
      confirmButtonColor: "#16a34a",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleApprove = (code) => {
    setData((prev) =>
      prev.map((item) =>
        item.code === code ? { ...item, status: "approved" } : item
      )
    );

    Swal.fire({
      icon: "success",
      title: "Approved!",
      text: "Material entry has been approved.",
      confirmButtonColor: "#16a34a",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleBulkApprove = () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one entry to approve.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    Swal.fire({
      title: "Approve Selected Entries?",
      text: `You are about to approve ${selectedRows.length} entr${
        selectedRows.length === 1 ? "y" : "ies"
      }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approve!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev) =>
          prev.map((item) =>
            selectedRows.includes(item.code)
              ? { ...item, status: "approved" }
              : item
          )
        );
        setSelectedRows([]);
        setSelectAll(false);

        Swal.fire({
          icon: "success",
          title: "Approved!",
          text: `${selectedRows.length} entr${
            selectedRows.length === 1 ? "y has" : "ies have"
          } been approved.`,
          confirmButtonColor: "#16a34a",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one entry to delete.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    Swal.fire({
      title: "Delete Selected Entries?",
      text: `You are about to delete ${selectedRows.length} entr${
        selectedRows.length === 1 ? "y" : "ies"
      }. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#16a34a",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev) =>
          prev.filter((item) => !selectedRows.includes(item.code))
        );
        setSelectedRows([]);
        setSelectAll(false);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${selectedRows.length} entr${
            selectedRows.length === 1 ? "y has" : "ies have"
          } been deleted.`,
          confirmButtonColor: "#16a34a",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const totalInflow = data.reduce((sum, item) => sum + item.amount, 0);
  const approvedInflow = data
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + item.amount, 0);

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium border rounded-full ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-600 rounded"></span>
        Material Inflow Management
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material Source *
          </label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          >
            <option value="">Select Source</option>
            <option>Aggregates</option>
            <option>Sand</option>
            <option>Cement</option>
            <option>Bricks</option>
            <option>Marble</option>
            <option>Granite</option>
            <option>Tiles</option>
            <option>WBC</option>
            <option>Joiner Work (Door & Window)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            name="description"
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            placeholder="Enter quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₹) *
          </label>
          <input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 w-full flex items-center justify-center gap-2 font-medium transition shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Entry
          </button>
        </div>
      </div>


      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-green-600 text-white text-left">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 font-semibold">Material Source</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold text-center">Quantity</th>
              <th className="px-4 py-3 font-semibold text-right">Amount (₹)</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.code}
                className={`border-b hover:bg-gray-50 transition ${
                  selectedRows.includes(row.code) ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.code)}
                    onChange={() => toggleSelect(row.code)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {row.source}
                </td>
                <td className="px-4 py-3 text-gray-600">{row.description}</td>
                <td className="px-4 py-3 text-center text-gray-700">
                  {row.quantity}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {row.amount.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(row.status)}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.status === "pending" ? (
                    <button
                      onClick={() => handleApprove(row.code)}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition font-medium"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-green-600 text-sm font-medium">
                      Approved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-gray-50 border-t mt-4 rounded-b-lg gap-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            Total Inflow Amount:{" "}
            <span className="font-semibold text-gray-800">
              {totalInflow.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Approved Amount:{" "}
            <span className="font-semibold text-green-600">
              {approvedInflow.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setFormData({ source: "", code: "", description: "", quantity: "", amount: "" });
              setSelectedRows([]);
              setSelectAll(false);
            }}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => Swal.fire({
              icon: 'success',
              title: 'Submitted!',
              text: 'Material inflow data submitted successfully.',
              confirmButtonColor: '#16a34a'
            })}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Submit Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default InFlow;
