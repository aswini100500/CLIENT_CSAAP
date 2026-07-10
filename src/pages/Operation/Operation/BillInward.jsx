import React, { useState, useEffect } from "react";
import BillInwardHistory from "./BillInwardHistory";
import {
  FaCalendarAlt,
  FaRupeeSign,
} from "react-icons/fa";
import operationApi from "../../../api/operation";

const BillInward = () => {
  const [loading, setLoading] = useState(false);
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [partyBillDate, setPartyBillDate] = useState("");
  const [isImport, setIsImport] = useState(false);
  const [assignTo, setAssignTo] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [activeTab, setActiveTab] = useState("inward");

  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    businessUnit: "",
    documentType: "",
    documentNo: "",
    supplier_id: "",
    partyBillNo: "",
    billAmount: "",
    remarks: "",
    financialYear: "",
    parentAccountHead: "",
  });

  const businessUnits = ["Head Office", "Branch Office"];
  const documentTypes = ["Tax Invoice", "Purchase Bill", "Service Bill"];
  const financialYears = ["2023-2024", "2024-2025", "2025-2026"];
  const parentAccountHeads = [
    "IT Assets",
    "Construction Material",
    "Office Supplies",
  ];
  const users = ["Admin User", "John Doe", "Jane Smith"];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await operationApi.getSuppliers();
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.supplier_id) {
      alert("Please select a supplier");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        business_unit: formData.businessUnit,
        document_type: formData.documentType,
        document_no: formData.documentNo,
        supplier_id: formData.supplier_id,
        party_bill_no: formData.partyBillNo,
        bill_amount: parseFloat(formData.billAmount),
        remarks: formData.remarks,
        financial_year: formData.financialYear,
        document_date: documentDate,
        parent_account_head: formData.parentAccountHead,
        party_bill_date: partyBillDate,
        assigned_to: assignTo,
        search_user: searchUser,
      };
      await operationApi.createBillInward(payload);
      alert("Bill Inward submitted successfully!");
      setFormData({
        businessUnit: "",
        documentType: "",
        documentNo: "",
        supplier_id: "",
        partyBillNo: "",
        billAmount: "",
        remarks: "",
        financialYear: "",
        parentAccountHead: "",
      });
      setPartyBillDate("");
      setAssignTo("");
      setSearchUser("");
    } catch (error) {
      console.error("Error submitting bill inward:", error);
      alert(error.response?.data?.message || "Failed to submit bill inward");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex ">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("inward")}
                  className={`px-3 py-1 rounded ${activeTab === "inward" ? "bg-white text-blue-500 border-t-2" : "bg-transparent text-gray-700 hover:bg-gray-100"}`}
                >
                  Bill Inwarding
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-3 py-1 rounded ${activeTab === "history" ? "bg-white text-blue-500 border-t-2" : "bg-transparent text-gray-700 hover:bg-gray-100"}`}
                >
                  Bill Inward History
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {activeTab === "inward" ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Unit
                    </label>
                    <select
                      name="businessUnit"
                      value={formData.businessUnit}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select Business Unit</option>
                      {businessUnits.map((unit, index) => (
                        <option key={index} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Type
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select Document Type</option>
                      {documentTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document No
                    </label>
                    <input
                      type="text"
                      name="documentNo"
                      value={formData.documentNo}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter document number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <select
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Bill No
                    </label>
                    <input
                      type="text"
                      name="partyBillNo"
                      value={formData.partyBillNo}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter party bill number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRupeeSign className="text-gray-400 text-sm" />
                      </div>
                      <input
                        type="number"
                        name="billAmount"
                        value={formData.billAmount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter remarks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Bill Date
                    </label>
                    <input
                      type="date"
                      value={partyBillDate}
                      onChange={(e) => setPartyBillDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4 pr-10"
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Document Details
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Financial Year
                      </label>
                      <select
                        name="financialYear"
                        value={formData.financialYear}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Financial Year</option>
                        {financialYears.map((fy) => (
                          <option key={fy} value={fy}>
                            {fy}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={documentDate}
                          onChange={(e) => setDocumentDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4 pr-10"
                        />
                        <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Account Head
                  </label>
                  <select
                    name="parentAccountHead"
                    value={formData.parentAccountHead}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select</option>
                    {parentAccountHeads.map((head) => (
                      <option key={head} value={head}>
                        {head}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select</option>
                    {users.map((user, index) => (
                      <option key={index} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search User
                  </label>
                  <select
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select</option>
                    {users.map((user, index) => (
                      <option key={index} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <BillInwardHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillInward;
