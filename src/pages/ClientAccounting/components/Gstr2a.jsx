import React from "react";

import { useState, useEffect } from "react";
import {
  HiSearch,
  HiPrinter,
  HiRefresh,
  HiFilter,
  HiDocumentAdd,
  HiEye,
  HiTrash,
  HiCheckCircle,
  HiPlus,
} from "react-icons/hi";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

const Gstr2a = () => {
  const [activeTab, setActiveTab] = useState("b2b");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("October 2023");
  const [expandedRows, setExpandedRows] = useState([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryType, setEntryType] = useState("b2b");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    b2b: [],
    b2bAmendments: [],
    creditDebitNotes: [],
    amendmentsToCreditDebitNotes: [],
  });

  const { companyId } = useAuth();

  const tabs = [
    { id: "b2b", label: "B2B Invoices", api: "b2b" },
    {
      id: "b2bAmendments",
      label: "Amendments to B2B Invoices",
      api: "b2b-amendments",
    },
    {
      id: "creditDebitNotes",
      label: "Credit/Debit Notes",
      api: "credit-debit-notes",
    },
    {
      id: "amendmentsToCreditDebitNotes",
      label: "Amendments to Credit/Debit Notes",
      api: "cdn-amendments",
    },
  ];

  const months = [
    "April 2023",
    "May 2023",
    "June 2023",
    "July 2023",
    "August 2023",
    "September 2023",
    "October 2023",
    "November 2023",
    "December 2023",
    "January 2024",
    "February 2024",
    "March 2024",
  ];

  const tabData = {
    b2b: {
      title: "B2B Invoices",
      description: "Auto-populated B2B invoices from suppliers",
      columns: [
        "Supplier Details",
        "Invoice Details",
        "Tax Amounts",
        "Status",
        "Actions",
      ],
    },
    b2bAmendments: {
      title: "Amendments to B2B Invoices",
      description: "Amended B2B invoices and corrections",
      columns: [
        "Supplier Details",
        "Amendment Details",
        "Value Changes",
        "Status",
        "Actions",
      ],
    },
    creditDebitNotes: {
      title: "Credit/Debit Notes",
      description: "Credit and debit notes received from suppliers",
      columns: [
        "Supplier Details",
        "Note Details",
        "Tax Amounts",
        "Status",
        "Actions",
      ],
    },
    amendmentsToCreditDebitNotes: {
      title: "Amendments to Credit/Debit Notes",
      description: "Amended credit and debit notes",
      columns: [
        "Supplier Details",
        "Amendment Details",
        "Value Changes",
        "Status",
        "Actions",
      ],
    },
  };

  const fetchData = async (tabId = activeTab) => {
    if (!companyId) {
      console.error("Company ID is not available");
      return;
    }

    setLoading(true);
    try {
      const tab = tabs.find((t) => t.id === tabId);
      const response = await axios.get(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gstr2a/${tab.api}/${companyId}`,
        {
          params: {
            month: selectedMonth,
          },
        },
      );

      setData((prev) => ({
        ...prev,
        [tabId]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching ${tabId} data:`, error);
      alert(`Failed to load ${tabData[tabId].title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [activeTab, selectedMonth, companyId]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setExpandedRows([]);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (type) => {
    const currentData = data[activeTab];
    if (type === "excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        currentData.map((row) => Object.values(row).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${activeTab}_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
    } else {
      alert(
        `Exporting ${tabData[activeTab].title} data as ${type.toUpperCase()}...`,
      );
    }
  };

  const handleAccept = async (entryId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gstr2a/b2b/${entryId}/status`,
        {
          status: "Accepted",
          match_status: "Fully Matched",
        },
      );
      alert("Invoice accepted successfully");
      fetchData();
    } catch (error) {
      alert("Failed to accept invoice");
    }
  };

  const handleReject = async (entryId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_ACCOUNTING_URL}/api/v1/gstr2a/b2b/${entryId}/status`,
        {
          status: "Rejected",
          match_status: "Unmatched",
        },
      );
      alert("Invoice rejected successfully");
      fetchData();
    } catch (error) {
      alert("Failed to reject invoice");
    }
  };

  const handleAddEntry = async (formData) => {
    if (!companyId) {
      alert("Company ID is required");
      return;
    }

    try {
      let endpoint = "";

      switch (entryType) {
        case "b2b":
          endpoint = `http://localhost:3000/api/v1/gstr2a/b2b/${companyId}`;
          break;
        case "b2bAmendments":
          endpoint = `http://localhost:3000/api/v1/gstr2a/b2b-amendments/${companyId}`;
          break;
        case "creditDebitNotes":
          endpoint = `http://localhost:3000/api/v1/gstr2a/credit-debit-notes/${companyId}`;
          break;
        case "amendmentsToCreditDebitNotes":
          endpoint = `http://localhost:3000/api/v1/gstr2a/cdn-amendments/${companyId}`;
          break;
        default:
          throw new Error("Invalid entry type");
      }

      await axios.post(endpoint, formData);
      alert("Entry added successfully!");
      setShowAddEntry(false);
      fetchData();
    } catch (error) {
      console.error("Error adding entry:", error);
      alert(
        `Failed to add entry: ${error.response?.data?.error || error.message}`,
      );
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderStatusBadge = (status) => {
    const config = {
      Matched: "bg-green-100 text-green-800",
      Accepted: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
      Available: "bg-blue-100 text-blue-800",
      "Partially Matched": "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs/5  font-semibold rounded-full ${config[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  const renderB2BTable = () => {
    const entries = data.b2b.filter(
      (entry) =>
        entry.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supplier_gstin?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tax Amounts
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <React.Fragment key={entry.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleRow(entry.id)}
                      className="mr-3 text-gray-400 hover:text-gray-600"
                    >
                      {expandedRows.includes(entry.id) ? (
                        <BiChevronUp className="w-5 h-5" />
                      ) : (
                        <BiChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.supplier_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        GSTIN: {entry.supplier_gstin}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {entry.invoice_no}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.invoice_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(entry.invoice_value)}
                  </div>
                  <div className="text-sm text-gray-500">
                    CGST: {formatCurrency(entry.cgst)} | SGST:{" "}
                    {formatCurrency(entry.sgst)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatusBadge(entry.status)}
                  <div className="text-xs text-gray-500 mt-1">
                    {entry.match_status}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {entry.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(entry.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Accept"
                        >
                          <HiCheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(entry.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                      onClick={() => toggleRow(entry.id)}
                    >
                      <HiEye className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRows.includes(entry.id) && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Invoice Details
                        </h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Invoice Number:</dt>
                            <dd className="font-medium">{entry.invoice_no}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Invoice Date:</dt>
                            <dd className="font-medium">
                              {new Date(
                                entry.invoice_date,
                              ).toLocaleDateString()}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Taxable Value:</dt>
                            <dd className="font-medium">
                              {formatCurrency(entry.taxable_value)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Tax Details
                        </h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">CGST:</dt>
                            <dd className="font-medium">
                              {formatCurrency(entry.cgst)}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">SGST:</dt>
                            <dd className="font-medium">
                              {formatCurrency(entry.sgst)}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">IGST:</dt>
                            <dd className="font-medium">
                              {formatCurrency(entry.igst)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {renderStatusBadge(entry.match_status)}
                          </div>
                          {entry.created_at && (
                            <p className="text-xs text-gray-600">
                              Added on:{" "}
                              {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };

  const renderOtherTables = () => {
    const entries = data[activeTab].filter(
      (entry) =>
        entry.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supplier_gstin?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const currentTab = tabData[activeTab];

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {currentTab.columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => {
            if (activeTab === "b2bAmendments") {
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.supplier_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        GSTIN: {entry.supplier_gstin}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Original: {entry.original_invoice_no}
                    </div>
                    <div className="text-sm text-gray-500">
                      Amended:{" "}
                      {new Date(entry.amendment_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Type: {entry.amendment_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 line-through">
                      {formatCurrency(entry.original_value)}
                    </div>
                    <div className="text-sm font-semibold text-green-700">
                      {formatCurrency(entry.amended_value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(entry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50">
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              );
            } else if (activeTab === "creditDebitNotes") {
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.supplier_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        GSTIN: {entry.supplier_gstin}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{entry.note_no}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.note_date).toLocaleDateString()}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        entry.note_type === "Credit Note"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {entry.note_type}
                    </div>
                    {entry.original_invoice_no && (
                      <div className="text-sm text-gray-500">
                        Original: {entry.original_invoice_no}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(entry.note_value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Tax:{" "}
                      {formatCurrency(
                        Number(entry.cgst) +
                          Number(entry.sgst) +
                          Number(entry.igst),
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Taxable: {formatCurrency(entry.taxable_value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(entry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50">
                        Process
                      </button>
                    </div>
                  </td>
                </tr>
              );
            } else if (activeTab === "amendmentsToCreditDebitNotes") {
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.supplier_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        GSTIN: {entry.supplier_gstin}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Original Note: {entry.original_note_no}
                    </div>
                    <div className="text-sm text-gray-500">
                      Amended:{" "}
                      {new Date(entry.amendment_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Type: {entry.amendment_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 line-through">
                      {formatCurrency(entry.original_value)}
                    </div>
                    <div className="text-sm font-semibold text-green-700">
                      {formatCurrency(entry.amended_value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(entry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50">
                        Verify
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (activeTab === "b2b") {
      return renderB2BTable();
    } else {
      return renderOtherTables();
    }
  };

  const AddEntryForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      month: selectedMonth,
      action_note: "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const renderFormFields = () => {
      switch (entryType) {
        case "b2b":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier GSTIN *
                </label>
                <input
                  type="text"
                  name="supplier_gstin"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_gstin || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_name || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  name="invoice_no"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.invoice_no || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  name="invoice_date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.invoice_date || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Value *
                </label>
                <input
                  type="number"
                  name="invoice_value"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.invoice_value || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxable Value *
                </label>
                <input
                  type="number"
                  name="taxable_value"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.taxable_value || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CGST
                </label>
                <input
                  type="number"
                  name="cgst"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.cgst || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SGST
                </label>
                <input
                  type="number"
                  name="sgst"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.sgst || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IGST
                </label>
                <input
                  type="number"
                  name="igst"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.igst || ""}
                />
              </div>
            </div>
          );

        case "b2bAmendments":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier GSTIN *
                </label>
                <input
                  type="text"
                  name="supplier_gstin"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_gstin || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_name || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Invoice Number *
                </label>
                <input
                  type="text"
                  name="original_invoice_no"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.original_invoice_no || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amendment Type *
                </label>
                <select
                  name="amendment_type"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.amendment_type || ""}
                >
                  <option value="">Select Type</option>
                  <option value="Value Correction">Value Correction</option>
                  <option value="Tax Correction">Tax Correction</option>
                  <option value="Details Update">Details Update</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amendment Date *
                </label>
                <input
                  type="date"
                  name="amendment_date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.amendment_date || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Value
                </label>
                <input
                  type="number"
                  name="original_value"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.original_value || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amended Value
                </label>
                <input
                  type="number"
                  name="amended_value"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.amended_value || ""}
                />
              </div>
            </div>
          );

        case "creditDebitNotes":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier GSTIN *
                </label>
                <input
                  type="text"
                  name="supplier_gstin"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_gstin || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_name || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note Number *
                </label>
                <input
                  type="text"
                  name="note_no"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.note_no || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note Date *
                </label>
                <input
                  type="date"
                  name="note_date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.note_date || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note Type *
                </label>
                <select
                  name="note_type"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.note_type || ""}
                >
                  <option value="">Select Type</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Debit Note">Debit Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Invoice Number
                </label>
                <input
                  type="text"
                  name="original_invoice_no"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.original_invoice_no || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note Value
                </label>
                <input
                  type="number"
                  name="note_value"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.note_value || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxable Value
                </label>
                <input
                  type="number"
                  name="taxable_value"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.taxable_value || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CGST
                </label>
                <input
                  type="number"
                  name="cgst"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.cgst || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SGST
                </label>
                <input
                  type="number"
                  name="sgst"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.sgst || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IGST
                </label>
                <input
                  type="number"
                  name="igst"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.igst || ""}
                />
              </div>
            </div>
          );

        case "amendmentsToCreditDebitNotes":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier GSTIN *
                </label>
                <input
                  type="text"
                  name="supplier_gstin"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_gstin || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.supplier_name || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Note Number *
                </label>
                <input
                  type="text"
                  name="original_note_no"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.original_note_no || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amendment Type *
                </label>
                <select
                  name="amendment_type"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.amendment_type || ""}
                >
                  <option value="">Select Type</option>
                  <option value="Value Adjustment">Value Adjustment</option>
                  <option value="Tax Adjustment">Tax Adjustment</option>
                  <option value="Details Correction">Details Correction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amendment Date *
                </label>
                <input
                  type="date"
                  name="amendment_date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.amendment_date || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Value
                </label>
                <input
                  type="number"
                  name="original_value"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.original_value || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amended Value
                </label>
                <input
                  type="number"
                  name="amended_value"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  onChange={handleChange}
                  value={formData.amended_value || ""}
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-bold text-gray-800">
              Add {tabs.find((t) => t.id === entryType)?.label}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            {renderFormFields()}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Note/Reason *
              </label>
              <textarea
                name="action_note"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                onChange={handleChange}
                value={formData.action_note || ""}
                placeholder="Explain why this entry needs to be manually added..."
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              GSTR-2A Auto-drafted Purchase Data
            </h2>
            <p className="text-gray-600">
              Auto-populated invoices from suppliers for ITC claims
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <BiChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg"
            >
              <HiRefresh className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 shrink-0 px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEntryType(tab.id);
                      setShowAddEntry(true);
                    }}
                    className="flex items-center space-x-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                    title={`Add ${tab.label}`}
                  >
                    <HiPlus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {tabData[activeTab].title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {tabData[activeTab].description}
                </p>
              </div>
              <button
                onClick={() => {
                  setEntryType(activeTab);
                  setShowAddEntry(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <HiPlus className="w-4 h-4" />
                <span>Add Entry</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="relative w-full md:w-96">
                <HiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${tabData[activeTab].title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                  <HiFilter className="w-5 h-5" />
                  <span>Filter</span>
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  <FaFilePdf className="w-5 h-5 text-red-600" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  <FaFileExcel className="w-5 h-5 text-green-600" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  <HiPrinter className="w-5 h-5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              {data[activeTab].length === 0 && !loading ? (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <HiDocumentAdd className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-800 mb-2">
                    No entries found
                  </h4>
                  <p className="text-gray-600 mb-4">
                    There are no {tabData[activeTab].title.toLowerCase()}{" "}
                    available for {selectedMonth}.
                  </p>
                  <button
                    onClick={() => {
                      setEntryType(activeTab);
                      setShowAddEntry(true);
                    }}
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    <HiPlus className="w-4 h-4" />
                    <span>Add Your First Entry</span>
                  </button>
                </div>
              ) : (
                renderTable()
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddEntry && (
        <AddEntryForm
          onClose={() => setShowAddEntry(false)}
          onSubmit={handleAddEntry}
        />
      )}

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body * {
            visibility: hidden;
          }

          #print-section,
          #print-section * {
            visibility: visible;
          }

          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Gstr2a;
