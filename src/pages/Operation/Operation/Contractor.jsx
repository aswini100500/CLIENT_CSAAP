import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaSearch,
} from "react-icons/fa";
import Compliances from "./Compliances";
import ApprovalHistoryContractor from "./ApprovalHistoryContractor";
import AttachementContractor from "./AttachementContractor";
import ChangeHistoryContractor from "./ChangeHistoryContractor";
import operationApi from "../../../api/operation";
import Swal from "sweetalert2";

const Contractor = () => {
  const [activeTab, setActiveTab] = useState("Main Info");
  const [formData, setFormData] = useState({
    businessUnit: "",
    documentType: "",
    documentNo: "",
    contractorName: "",
    workOrderNo: "",
    workOrderAmount: "",
    invoiceNumber: "",
    billAmount: "",
    billingType: "",
    periodFrom: "",
    narration: "",
    financialYear: "",
    documentDate: "2025-04-08",
    parentContractor: "",
    billInward: "",
    invoiceDate: "",
    dueDate: "",
    periodTo: "",
  });

  const navigationItems = [
    "Main Info",
    "Attachment",
    "Approval History",
    "Change History",
    "Compliances",
  ];

  const postingInfoData = [
    {
      id: 1,
      drCr: "Dr",
      description: "LABOUR CHARGES - CONSTRUCTION WORK",
      parentDescription: "CONSTRUCTION EXPENSES - LABOUR CHARGES",
      debitAmount: "2,57,43,088.80",
      creditAmount: "",
    },
    {
      id: 2,
      drCr: "Dr",
      description: "IGST credit Available",
      parentDescription: "",
      debitAmount: "46,33,755.98",
      creditAmount: "",
    },
    {
      id: 3,
      drCr: "Cr",
      description: "M/s Kamal & Associates Pvt Ltd",
      parentDescription: "SUNDRY CREDITORS - CONTRACTOR",
      debitAmount: "",
      creditAmount: "3,03,76,844.78",
    },
    {
      id: 4,
      drCr: "Dr",
      description: "M/s Kamal & Associates Pvt Ltd",
      parentDescription: "SUNDRY CREDITORS - CONTRACTOR",
      debitAmount: "7,72,292.66",
      creditAmount: "",
    },
    {
      id: 5,
      drCr: "Cr",
      description: "M/s Kamal & Associates Pvt Ltd",
      parentDescription: "RETENTION MONEY",
      debitAmount: "",
      creditAmount: "7,72,292.66",
    },
    {
      id: 6,
      drCr: "Cr",
      description: "TDS ON CONTRACTORS",
      parentDescription: "Tax deducted at source",
      debitAmount: "",
      creditAmount: "5,14,862.00",
    },
    {
      id: 7,
      drCr: "Dr",
      description: "M/s Kamal & Associates Pvt Ltd",
      parentDescription: "SUNDRY CREDITORS - CONTRACTOR",
      debitAmount: "5,14,862.00",
      creditAmount: "",
    },
  ];

  const attachmentData = [
    {
      id: 1,
      name: "Electrical - Agreement Copy.pdf",
      category: "",
      uploadedOn: "8/7/2025 12:32",
      size: "94.8 KB",
      remark: "",
    },
  ];

  const documentChainData = [
    {
      id: 1,
      entryType: "WORKS ORDER",
      documentNo: "DEMWQJ0000223-24",
      documentDate: "12/02/2024",
      name: "",
      uploadedOn: "",
      view: "",
      download: "",
      pr: "",
    },
    {
      id: 2,
      entryType: "WORK DONE",
      documentNo: "DEMWDNJ0000224-25",
      documentDate: "01/03/2025",
      name: "",
      uploadedOn: "",
      view: "",
      download: "",
      pr: "",
    },
    {
      id: 3,
      entryType: "WORK DONE",
      documentNo: "DEMWDNJ0000624-25",
      documentDate: "31/03/2025",
      name: "",
      uploadedOn: "",
      view: "",
      download: "",
      pr: "",
    },
  ];

  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearanceFile, setClearanceFile] = useState(null);

  useEffect(() => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      const newState = { ...prevState, [name]: value };

      if (name === "contractor_id") {
        const selected = contractors.find((c) => c.id === parseInt(value));
        if (selected) {
          newState.contractorName = selected.name;
        }
      }

      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = new FormData();

      const mapping = {
        businessUnit: "business_unit",
        documentType: "document_type",
        contractorName: "contractor_name",
        contractor_id: "contractor_id",
        workOrderNo: "work_order_no",
        workOrderAmount: "work_order_amount",
        invoiceNumber: "invoice_number",
        billAmount: "bill_amount",
        billingType: "billing_type",
        periodFrom: "period_from",
        periodTo: "period_to",
        narration: "narration",
        financialYear: "financial_year",
        documentDate: "document_date",
      };

      Object.entries(mapping).forEach(([localKey, apiKey]) => {
        if (formData[localKey]) {
          payload.append(apiKey, formData[localKey]);
        }
      });

      if (clearanceFile) {
        payload.append("clearance_document", clearanceFile);
      }

      await operationApi.createContractorCompliance(payload);
      Swal.fire(
        "Success!",
        "Contractor bill submitted successfully.",
        "success",
      );
      handleCancel();
    } catch (error) {
      console.error("Error submitting contractor bill:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to submit bill",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      businessUnit: "",
      documentType: "",
      documentNo: "",
      contractorName: "",
      contractor_id: "",
      workOrderNo: "",
      workOrderAmount: "",
      invoiceNumber: "",
      billAmount: "",
      billingType: "",
      periodFrom: "",
      narration: "",
      financialYear: "",
      documentDate: new Date().toISOString().split("T")[0],
      parentContractor: "",
      billInward: "",
      invoiceDate: "",
      dueDate: "",
      periodTo: "",
    });
    setClearanceFile(null);
  };

  const approvalHistory = [
    {
      id: 1,
      approvedBy: "John Doe",
      profile: "Manager",
      actionInformation: "Approved",
      status: "Completed",
      dateTime: "2024-01-15 10:30:45",
      remarks: "Document meets all requirements",
      createdBy: "System Admin",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Contractor Management
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 px-4 sm:px-6 lg:px-8">
            {navigationItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === item
                    ? "bg-white text-blue-700 border-t-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab}
              </h2>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            {activeTab === "Main Info" && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="businessUnit"
                      value={formData.businessUnit}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Business Unit</option>
                      <option value="unit1">Business Unit 1</option>
                      <option value="unit2">Business Unit 2</option>
                      <option value="unit3">Business Unit 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Document Type</option>
                      <option value="invoice">Invoice</option>
                      <option value="bill">Bill</option>
                      <option value="receipt">Receipt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="documentNo"
                      value={formData.documentNo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter document number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contractor Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="contractor_id"
                      value={formData.contractor_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Contractor</option>
                      {contractors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Order No
                    </label>
                    <input
                      type="text"
                      name="workOrderNo"
                      value={formData.workOrderNo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter work order number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Order Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="workOrderAmount"
                        value={formData.workOrderAmount}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter invoice number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="billAmount"
                        value={formData.billAmount}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Type
                    </label>
                    <select
                      name="billingType"
                      value={formData.billingType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Billing Type</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                      <option value="project">Project Based</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period From
                    </label>
                    <input
                      type="date"
                      name="periodFrom"
                      value={formData.periodFrom}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period To
                    </label>
                    <input
                      type="date"
                      name="periodTo"
                      value={formData.periodTo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 my-8"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financial Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="financialYear"
                      value={formData.financialYear}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Financial Year</option>
                      <option value="2024-25">2024-2025</option>
                      <option value="2025-26">2025-2026</option>
                      <option value="2026-27">2026-2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="documentDate"
                      value={formData.documentDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 my-8"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Contractor
                    </label>
                    <select
                      name="parentContractor"
                      value={formData.parentContractor}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Parent Contractor</option>
                      <option value="parent1">Parent Contractor 1</option>
                      <option value="parent2">Parent Contractor 2</option>
                      <option value="parent3">Parent Contractor 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Inward
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="billInward"
                        value={formData.billInward}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search Bill Inward"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaSearch className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-8"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      name="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Narration
                  </label>
                  <textarea
                    name="narration"
                    value={formData.narration}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter additional notes or comments"
                  />
                </div>
                <div className="border border-gray-300 rounded-lg p-4 w-[40vh] bg-white shadow-sm">
                  <label className="block text-gray-700 font-medium mb-2">
                    Clearance Document
                  </label>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setClearanceFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-700  border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    <span className="text-red-500">*</span> indicates required
                    fields
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaCheck className="w-4 h-4" />
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </form>
            )}
            {activeTab === "Compliances" && <Compliances />}
            {activeTab === "Attachment" && <AttachementContractor />}
            {activeTab === "Approval History" && <ApprovalHistoryContractor />}
            {activeTab === "Change History" && <ChangeHistoryContractor />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contractor;
