import React, { useState, useEffect } from "react";
import { FileText, PlusCircle, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import operationApi from "../../../api/operation";

const Compliances = () => {
  const emptyForm = {
    business_unit: "",
    document_type: "",
    contractor_name: "",
    contractor_id: "",
    work_order_no: "",
    work_order_amount: "",
    invoice_number: "",
    bill_amount: "",
    billing_type: "Monthly",
    period_from: "",
    period_to: "",
    narration: "",
    financial_year: "",
    document_date: "",
  };

  const [records, setRecords] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [clearanceFile, setClearanceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const res = await operationApi.getContractors();
      setContractors(res.data.contractors || []);
    } catch (err) {
      console.error("Error fetching contractors:", err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await operationApi.getContractorCompliances();
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("Error fetching compliances:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "contractor_select") {
      const selected = contractors.find((c) => c.id === parseInt(value));
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          contractor_name: selected.name,
          contractor_id: selected.id,
        }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.contractor_name ||
      !formData.work_order_no ||
      !formData.document_date
    ) {
      Swal.fire(
        "Required Fields",
        "Please fill contractor name, work order no, and document date.",
        "warning",
      );
      return;
    }
    try {
      setLoading(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          payload.append(k, v);
        }
      });
      if (clearanceFile) payload.append("clearance_document", clearanceFile);
      await operationApi.createContractorCompliance(payload);
      Swal.fire("Success!", "Compliance record created.", "success");
      setFormData(emptyForm);
      setClearanceFile(null);
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      console.error("Error creating compliance:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create compliance.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await operationApi.deleteContractorCompliance(id);
      fetchRecords();
      Swal.fire("Deleted!", "Compliance deleted.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to delete compliance.", "error");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: "business_unit", label: "Business Unit", type: "text" },
    { name: "document_type", label: "Document Type", type: "text" },
    { name: "work_order_no", label: "Work Order No", type: "text" },
    { name: "work_order_amount", label: "Work Order Amount", type: "number" },
    { name: "invoice_number", label: "Invoice Number", type: "text" },
    { name: "bill_amount", label: "Bill Amount", type: "number" },
    { name: "period_from", label: "Period From", type: "date" },
    { name: "period_to", label: "Period To", type: "date" },
    { name: "document_date", label: "Document Date", type: "date" },
    { name: "financial_year", label: "Financial Year", type: "text" },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-green-700 flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          Contractor Compliances
        </h2>
        <div className="erp-root">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="app-btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {showForm ? "Close Form" : "Add Compliance"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-700 mb-4">
            New Compliance Record
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Select Contractor
              </label>
              <select
                name="contractor_select"
                value={formData.contractor_id}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select Contractor --</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {formFields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Billing Type
              </label>
              <select
                name="billing_type"
                value={formData.billing_type}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="One-time">One-time</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Narration
              </label>
              <input
                type="text"
                name="narration"
                value={formData.narration}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Clearance Document
              </label>
              <input
                type="file"
                onChange={(e) => setClearanceFile(e.target.files[0])}
                className="w-full text-sm border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>
          <div className="erp-root flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="app-btn-primary"
            >
              {loading ? "Saving..." : "Save Compliance"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-green-50 text-green-900">
            <tr>
              {[
                "#",
                "Contractor",
                "Business Unit",
                "Doc Type",
                "Work Order",
                "Bill Amount",
                "Period",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="border border-gray-200 p-2 text-left text-xs font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No compliance records found.
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2">{i + 1}</td>
                  <td className="border border-gray-200 p-2">
                    {r.contractor_name}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {r.business_unit}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {r.document_type}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {r.work_order_no}
                  </td>
                  <td className="border border-gray-200 p-2">
                    ₹{parseFloat(r.bill_amount || 0).toLocaleString()}
                  </td>
                  <td className="border border-gray-200 p-2 text-xs">
                    {r.period_from
                      ? new Date(r.period_from).toLocaleDateString()
                      : "-"}{" "}
                    →{" "}
                    {r.period_to
                      ? new Date(r.period_to).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border border-gray-200 p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        r.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-2 text-center">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compliances;
