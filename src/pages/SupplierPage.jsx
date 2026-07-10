import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useSWR, { mutate } from "swr";
import { getAuthToken } from "../store/authSession";
import {
  Search,
  Plus,
  X,
  Download,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Building,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  IndianRupee,
  User,
  Loader2,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const fetcher = (url) => api.get(url).then((res) => res.data);

const SupplierPage = () => {
  const navigate = useNavigate();

  const {
    data: swrData,
    error: swrError,
    isLoading,
  } = useSWR("/api/tenant/supplier", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
    shouldRetryOnError: true,
    retryCount: 3,
  });

  const suppliers = swrData?.success ? swrData.data : [];
  const error = swrError ? "Failed to load suppliers. Please try again." : null;

  const [filters, setFilters] = useState({
    name: "",
    fromDate: "",
    toDate: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
    title: "",
  });

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    gst_number: "",
    address: "",
    contact_person: "",
  });

  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setNotification({ show: false, type: "", message: "", title: "" });
    }, 3000);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesName = supplier.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());

    const supplyDate = new Date(supplier.created_at);
    const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters.toDate ? new Date(filters.toDate) : null;

    const matchesFrom = !fromDate || supplyDate >= fromDate;
    const matchesTo = !toDate || supplyDate <= toDate;

    return matchesName && matchesFrom && matchesTo;
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "gst_number") {
      const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setNewSupplier({
        ...newSupplier,
        [name]: formattedValue,
      });
    } else if (name === "phone" || name === "alternate_phone") {
      const numericValue = value.replace(/\D/g, "");
      setNewSupplier({
        ...newSupplier,
        [name]: numericValue,
      });
    } else {
      setNewSupplier({
        ...newSupplier,
        [name]: value,
      });
    }
  };

  const optimisticUpdate = async (operation, data, optimisticData) => {
    mutate(
      "/api/tenant/supplier",
      async (currentData) => {
        if (!currentData) return currentData;

        let updatedData;
        if (operation === "create") {
          updatedData = {
            ...currentData,
            data: [...currentData.data, optimisticData],
          };
        } else if (operation === "update") {
          updatedData = {
            ...currentData,
            data: currentData.data.map((item) =>
              item.id === data.id ? { ...item, ...optimisticData } : item,
            ),
          };
        } else if (operation === "delete") {
          updatedData = {
            ...currentData,
            data: currentData.data.filter((item) => item.id !== data.id),
          };
        }

        return updatedData;
      },
      false,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (
        !newSupplier.name.trim() ||
        !newSupplier.email.trim() ||
        !newSupplier.phone.trim()
      ) {
        showNotification(
          "error",
          "Validation Error",
          "Please fill in all required fields before submitting.",
        );
        setIsSubmitting(false);
        return;
      }

      const supplierData = {
        name: newSupplier.name,
        email: newSupplier.email,
        phone: newSupplier.phone,
        alternate_phone: newSupplier.alternate_phone || "",
        gst_number: newSupplier.gst_number || "",
        address: newSupplier.address || "",
        contact_person: newSupplier.contact_person || "",
      };

      let response;

      if (editingSupplier) {
        const optimisticData = {
          ...editingSupplier,
          ...supplierData,
        };

        optimisticUpdate("update", { id: editingSupplier.id }, optimisticData);

        response = await api.put(
          `/api/tenant/supplier/${editingSupplier.id}`,
          supplierData,
        );

        if (response.data.success) {
          showNotification(
            "success",
            "Success!",
            "Supplier updated successfully!",
          );

          mutate("/api/tenant/supplier");
        } else {
          mutate("/api/tenant/supplier");
          throw new Error(response.data.message || "Update failed");
        }
      } else {
        const optimisticData = {
          id: Date.now(),
          ...supplierData,
          is_active: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        optimisticUpdate("create", null, optimisticData);

        response = await api.post("/api/tenant/supplier", supplierData);

        if (response.data.success) {
          showNotification(
            "success",
            "Success!",
            "Supplier created successfully!",
          );

          mutate("/api/tenant/supplier");
        } else {
          mutate("/api/tenant/supplier");
          throw new Error(response.data.message || "Creation failed");
        }
      }

      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving supplier:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save supplier. Please try again.";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supplier) => {
    setNewSupplier({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      alternate_phone: supplier.alternate_phone || "",
      gst_number: supplier.gst_number || "",
      address: supplier.address || "",
      contact_person: supplier.contact_person || "",
    });
    setEditingSupplier(supplier);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?"))
      return;

    setIsDeleting(true);
    try {
      optimisticUpdate("delete", { id });

      const response = await api.delete(`/api/tenant/supplier/${id}`);
      if (response.data.success) {
        showNotification(
          "success",
          "Deleted!",
          "Supplier deleted successfully!",
        );

        mutate("/api/tenant/supplier");
      } else {
        mutate("/api/tenant/supplier");
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete supplier.";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (supplier) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(supplier, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${supplier.name.replace(/\s+/g, "_")}_details.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const resetForm = () => {
    setNewSupplier({
      name: "",
      email: "",
      phone: "",
      alternate_phone: "",
      gst_number: "",
      address: "",
      contact_person: "",
    });
    setEditingSupplier(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetForm();
  };

  const [selectedSupplierForView, setSelectedSupplierForView] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleViewSupplier = (supplier) => {
    setSelectedSupplierForView(supplier);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateSummary = () => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s) => s.is_active === 1).length;

    const avgRating =
      suppliers.length > 0
        ? (
            suppliers.reduce(
              (total, supplier) => total + (supplier.rating || 0),
              0,
            ) / suppliers.length
          ).toFixed(1)
        : 0;

    return {
      totalSuppliers,
      activeSuppliers,
      avgRating,
      totalBillAmount: 0,
    };
  };

  const { totalSuppliers, activeSuppliers, avgRating, totalBillAmount } =
    calculateSummary();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <div className="text-gray-600">Loading suppliers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading suppliers: {error}
          <button
            onClick={() => mutate("/api/tenant/supplier")}
            className="ml-4 text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
            notification.type === "success"
              ? "bg-green-50 border-l-4 border-green-500"
              : notification.type === "error"
                ? "bg-red-50 border-l-4 border-red-500"
                : "bg-blue-50 border-l-4 border-blue-500"
          } p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}
        >
          <div className="flex items-start">
            <div
              className={`shrink-0 ${
                notification.type === "success"
                  ? "text-green-600"
                  : notification.type === "error"
                    ? "text-red-600"
                    : "text-blue-600"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle size={24} />
              ) : notification.type === "error" ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle size={24} />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                }`}
              >
                {notification.title}
              </p>
              <p
                className={`mt-1 text-sm ${
                  notification.type === "success"
                    ? "text-green-700"
                    : notification.type === "error"
                      ? "text-red-700"
                      : "text-blue-700"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Supplier Management
          </h1>
          <p className="text-gray-600 mt Chatp2">
            Manage all suppliers and their details
            <button
              onClick={() => mutate("/api/tenant/supplier")}
              className="ml-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Refresh Data
            </button>
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Building className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Suppliers
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {totalSuppliers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Active Suppliers
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {activeSuppliers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <IndianRupee className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Bill Amount
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalBillAmount)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 mr-4">
              <FileText className="text-orange-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Average Rating
              </h3>
              <p className="text-2xl font-bold text-gray-800">{avgRating}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative grow">
            <div className="flex items-center">
              <Search className="absolute left-3 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                placeholder="Search by supplier name..."
                value={filters.name}
                onChange={(e) => {
                  handleFilterChange(e);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {showDropdown && filters.name && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto mt-1">
                {suppliers
                  .filter((supplier) =>
                    supplier.name
                      .toLowerCase()
                      .includes(filters.name.toLowerCase()),
                  )
                  .map((supplier) => (
                    <li
                      key={supplier.id}
                      onMouseDown={() => {
                        setFilters({ ...filters, name: supplier.name });
                        setShowDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                    >
                      {supplier.name}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="To Date"
            />
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newSupplier.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newSupplier.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newSupplier.phone}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternate_phone"
                  value={newSupplier.alternate_phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter alternate phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gst_number"
                  value={newSupplier.gst_number}
                  onChange={handleInputChange}
                  maxLength={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 27AAACG1234D1Z5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={newSupplier.contact_person}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={newSupplier.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier address"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingSupplier
                    ? "Update Supplier"
                    : "Add Supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSuppliers.length > 0 ? (
                sortedSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div
                            className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            {supplier.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {supplier.id}
                          </div>
                          {supplier.contact_person && (
                            <div className="text-sm text-gray-600 mt-1">
                              👤 {supplier.contact_person}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {supplier.phone}
                          </span>
                        </div>
                        {supplier.alternate_phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Alt: {supplier.alternate_phone}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <a
                            href={`mailto:${supplier.email}`}
                            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            {supplier.email}
                          </a>
                        </div>
                        {supplier.gst_number && (
                          <div className="text-xs text-gray-500 mt-2">
                            GST: {supplier.gst_number}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 ${supplier.is_active === 1 ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <span
                            className={`text-xs font-medium ${supplier.is_active === 1 ? "text-green-700" : "text-red-700"}`}
                          >
                            {supplier.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(supplier.created_at)}
                        </div>
                        {supplier.updated_at && (
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(supplier.updated_at)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSupplier(supplier)}
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="flex items-center text-green-600 hover:text-green-800 transition-colors px-3 py-1 rounded-md hover:bg-green-50"
                          title="Edit Supplier"
                        >
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(supplier.id)}
                          disabled={isDeleting}
                          className="flex items-center text-red-600 hover:text-red-800 transition-colors px-3 py-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                          title="Delete Supplier"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-3 opacity-50" />
                      <div className="text-lg font-medium text-gray-500 mb-1">
                        {suppliers.length === 0
                          ? "No suppliers added yet"
                          : "No suppliers found"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {suppliers.length === 0
                          ? 'Try adding your first supplier using the "Add Supplier" button'
                          : filters.name
                            ? `No results for "${filters.name}"`
                            : "Try adjusting your filters"}
                      </div>
                      {filters.name && suppliers.length > 0 && (
                        <button
                          onClick={() => setFilters({ ...filters, name: "" })}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showViewModal && selectedSupplierForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Supplier Profile
                </h2>
                <p className="text-xs text-slate-450 mt-0.5">
                  Supplier ID: #{selectedSupplierForView.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSupplierForView(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {selectedSupplierForView.name}
                  </h3>
                  {selectedSupplierForView.contact_person && (
                    <p className="text-sm text-slate-500 mt-1">
                      Contact Person:{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedSupplierForView.contact_person}
                      </span>
                    </p>
                  )}
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedSupplierForView.is_active === 1
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {selectedSupplierForView.is_active === 1
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    GST IN
                  </span>
                  <span className="block font-mono font-semibold text-slate-800 mt-1 uppercase select-all bg-slate-50 border border-slate-100 px-2 py-0.5 rounded w-max">
                    {selectedSupplierForView.gst_number || "Not Provided"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email Address
                  </span>
                  {selectedSupplierForView.email ? (
                    <a
                      href={`mailto:${selectedSupplierForView.email}`}
                      className="block text-slate-700 hover:text-blue-600 font-medium mt-1 transition-colors"
                    >
                      {selectedSupplierForView.email}
                    </a>
                  ) : (
                    <span className="block text-slate-400 mt-1">—</span>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Primary Phone
                  </span>
                  {selectedSupplierForView.phone ? (
                    <a
                      href={`tel:${selectedSupplierForView.phone}`}
                      className="block text-slate-700 hover:text-blue-600 font-medium mt-1 transition-colors"
                    >
                      {selectedSupplierForView.phone}
                    </a>
                  ) : (
                    <span className="block text-slate-400 mt-1">—</span>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Alternate Phone
                  </span>
                  {selectedSupplierForView.alternate_phone ? (
                    <a
                      href={`tel:${selectedSupplierForView.alternate_phone}`}
                      className="block text-slate-700 hover:text-blue-600 font-medium mt-1 transition-colors"
                    >
                      {selectedSupplierForView.alternate_phone}
                    </a>
                  ) : (
                    <span className="block text-slate-400 mt-1">—</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Address / Location
                  </span>
                  <p className="text-slate-700 font-normal mt-1 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {selectedSupplierForView.address || "No address specified"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                <span>
                  Registered: {formatDate(selectedSupplierForView.created_at)}
                </span>
                {selectedSupplierForView.updated_at && (
                  <span>
                    Last Updated:{" "}
                    {formatDate(selectedSupplierForView.updated_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSupplierForView(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedSupplierForView);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
              >
                <Pencil size={15} />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPage;
