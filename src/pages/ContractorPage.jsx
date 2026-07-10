import {
  Eye,
  Plus,
  Search,
  X,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  DownloadIcon,
  MailIcon,
  MessageSquare,
  Phone,
  User,
  Calendar,
  Square,
  IndianRupee,
  CheckCircle,
  Edit,
  Verified,
  Clock,
  FileText,
  Edit2,
  Trash2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import React, { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io5";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { getAuthToken } from "../store/authSession";

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

const ContractorPage = () => {
  const { data, error, isLoading } = useSWR(
    "/api/tenant/contractors",
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const contractors = data?.contractors || [];

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [workOrderFile, setWorkOrderFile] = useState(null);

  const [showEquipmentEditModal, setShowEquipmentEditModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState("");
  const [editingField, setEditingField] = useState("");

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
    title: "",
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [editProfilePhoto, setEditProfilePhoto] = useState(null);
  const [editWorkOrderFile, setEditWorkOrderFile] = useState(null);

  const [newContractor, setNewContractor] = useState({
    name: "",
    email: "",
    phone: "",
    alt_phone: "",
    company: "",
    project_name: "",
    project_allotted: "",
    total_contracted_sqft: "",
    advance_amount: "",
    status: "Active",
    report: "",
    workmanship: "Verified",
    employees: "",
    representatives: [{ name: "", position: "", phone: "" }],
    equipment_owned: "",
    equipment_from_store: "",
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        "error",
        "File Size Error",
        "File size exceeds 5MB limit.",
      );
      return;
    }

    if (type === "profilePhoto") {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        showNotification(
          "error",
          "Invalid File Type",
          "Only JPG and PNG allowed for profile photo.",
        );
        return;
      }
      setProfilePhoto(file);
    } else if (type === "workOrder") {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        showNotification(
          "error",
          "Invalid File Type",
          "Only PDF and DOC files allowed for work order.",
        );
        return;
      }
      setWorkOrderFile(file);
    }
  };

  const handleEditFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        "error",
        "File Size Error",
        "File size exceeds 5MB limit.",
      );
      return;
    }

    if (type === "profilePhoto") {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        showNotification(
          "error",
          "Invalid File Type",
          "Only JPG and PNG allowed for profile photo.",
        );
        return;
      }
      setEditProfilePhoto(file);
    } else if (type === "workOrder") {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        showNotification(
          "error",
          "Invalid File Type",
          "Only PDF and DOC files allowed for work order.",
        );
        return;
      }
      setEditWorkOrderFile(file);
    }
  };

  const openEditModal = (contractor) => {
    setEditingContractor({
      ...contractor,
      representatives: contractor.representatives || [
        { name: "", position: "", phone: "" },
      ],
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("representative_")) {
      const [_, idx, field] = name.split("_");
      const index = parseInt(idx, 10);
      const updatedReps = [...editingContractor.representatives];
      updatedReps[index][field] = value;
      setEditingContractor({
        ...editingContractor,
        representatives: updatedReps,
      });
    } else {
      setEditingContractor({
        ...editingContractor,
        [name]: value,
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      Object.keys(editingContractor).forEach((key) => {
        if (key === "created_at" || key === "updated_at" || key === "id") {
          return;
        }

        if (key === "representatives") {
          formData.append(
            "representatives",
            JSON.stringify(editingContractor.representatives),
          );
        } else if (
          editingContractor[key] !== "" &&
          editingContractor[key] !== null &&
          editingContractor[key] !== undefined
        ) {
          if (key === "project_allotted" && editingContractor[key]) {
            const date = new Date(editingContractor[key]);
            if (!isNaN(date.getTime())) {
              formData.append(key, date.toISOString().split("T")[0]);
            }
          } else {
            formData.append(key, editingContractor[key]);
          }
        }
      });

      if (editProfilePhoto) {
        formData.append("profilePhoto", editProfilePhoto);
      }
      if (editWorkOrderFile) {
        formData.append("workOrder", editWorkOrderFile);
      }

      for (let pair of formData.entries()) {
      }

      const response = await api.put(
        `/api/tenant/contractors/${editingContractor.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        mutate("/api/tenant/contractors");

        setEditingContractor(null);
        setEditProfilePhoto(null);
        setEditWorkOrderFile(null);
        setShowEditModal(false);

        if (selectedContractor?.id === editingContractor.id) {
          setSelectedContractor(response.data.data);
        }

        showNotification(
          "success",
          "Success!",
          "Contractor updated successfully!",
        );
      }
    } catch (error) {
      console.error("Error updating contractor:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to update contractor. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      showNotification("error", "Update Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const searchContractors = async (query) => {
    try {
      const response = await api.get(
        `/api/tenant/contractors/search?name=${query}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Search error:", error);
      showNotification(
        "error",
        "Search Error",
        "Failed to search contractors.",
      );
      return contractors;
    }
  };

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.project_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || contractor.status === statusFilter;

    let matchesDate = true;
    if (fromDate && contractor.project_allotted) {
      matchesDate = new Date(contractor.project_allotted) >= new Date(fromDate);
    }
    if (toDate && contractor.project_allotted) {
      matchesDate =
        matchesDate &&
        new Date(contractor.project_allotted) <= new Date(toDate);
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedContractors = [...filteredContractors].sort((a, b) => {
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

    if (name.startsWith("representative_")) {
      const [_, idx, field] = name.split("_");
      const index = parseInt(idx, 10);
      const updatedReps = [...newContractor.representatives];
      updatedReps[index][field] = value;
      setNewContractor({
        ...newContractor,
        representatives: updatedReps,
      });
    } else {
      setNewContractor({
        ...newContractor,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      Object.keys(newContractor).forEach((key) => {
        if (key === "representatives") {
          formData.append(
            "representatives",
            JSON.stringify(newContractor.representatives),
          );
        } else if (newContractor[key] !== "" && newContractor[key] !== null) {
          formData.append(key, newContractor[key]);
        }
      });

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }
      if (workOrderFile) {
        formData.append("workOrder", workOrderFile);
      }

      const response = await api.post("/api/tenant/contractors", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.contractor) {
        mutate("/api/tenant/contractors");

        setNewContractor({
          name: "",
          email: "",
          phone: "",
          alt_phone: "",
          company: "",
          project_name: "",
          project_allotted: "null",
          total_contracted_sqft: "",
          advance_amount: "",
          status: "Active",
          report: "",
          workmanship: "Verified",
          employees: "",
          representatives: [{ name: "", position: "", phone: "" }],
          equipment_owned: "",
          equipment_from_store: "",
        });
        setProfilePhoto(null);
        setWorkOrderFile(null);
        setShowAddForm(false);

        showNotification(
          "success",
          "Success!",
          "Contractor created successfully!",
        );
      }
    } catch (error) {
      console.error("Error creating contractor:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create contractor. Please try again.";
      showNotification("error", "Creation Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContractor = async (id, updatedData) => {
    try {
      const formData = new FormData();

      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          if (typeof updatedData[key] === "object") {
            formData.append(key, JSON.stringify(updatedData[key]));
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      });

      const response = await api.put(
        `/api/tenant/contractors/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        mutate("/api/tenant/contractors");
        showNotification(
          "success",
          "Updated!",
          "Contractor updated successfully!",
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating contractor:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update contractor.";
      showNotification("error", "Update Failed", errorMessage);
      throw error;
    }
  };

  const handleDeleteContractor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contractor?"))
      return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/api/tenant/contractors/${id}`);

      if (response.data.success) {
        mutate("/api/tenant/contractors");

        showNotification(
          "success",
          "Deleted!",
          "Contractor deleted successfully!",
        );

        if (selectedContractor?.id === id) {
          setShowDetailModal(false);
          setSelectedContractor(null);
        }
        if (editingContractor?.id === id) {
          setShowEditModal(false);
          setEditingContractor(null);
        }
      }
    } catch (error) {
      console.error("Error deleting contractor:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete contractor.";
      showNotification("error", "Deletion Failed", errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatSqft = (sqft) => {
    if (!sqft) return "0";
    return new Intl.NumberFormat("en-US").format(sqft);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkmanshipClass = (workmanship) => {
    switch (workmanship) {
      case "Verified":
        return "bg-green-100 text-green-800";
      case "Excellent":
        return "bg-blue-100 text-blue-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(contractors, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "contractors.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const viewContractorDetails = (contractor) => {
    setSelectedContractor(contractor);
    setShowDetailModal(true);
  };

  const calculateTotals = () => {
    const totalContractors = contractors.length;
    const totalSqft = contractors.reduce(
      (total, contractor) => total + (contractor.total_contracted_sqft || 0),
      0,
    );
    const totalAdvance = contractors.reduce(
      (total, contractor) => total + (contractor.advance_amount || 0),
      0,
    );

    return { totalContractors, totalSqft, totalAdvance };
  };

  const { totalContractors, totalSqft, totalAdvance } = calculateTotals();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="text-gray-600">Loading contractors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading contractors: {error.message}
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
                <X size={24} />
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
            Contractor Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all contractors and their project details
          </p>
        </div>
        <button
          onClick={exportData}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download size={18} className="mr-2" />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Contractors
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {totalContractors}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Square className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Sq Ft</h3>
              <p className="text-2xl font-bold text-gray-800">
                {formatSqft(totalSqft)}
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
                Total Advance
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalAdvance)}
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
                Active Projects
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {contractors.filter((c) => c.status === "Active").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 items-center mb-2 md:mb-0">
            <label className="text-sm text-gray-700">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700 ml-2">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative grow">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, project or representative..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              {showAddForm ? "Close Form" : "Add Contractor"}
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Add New Contractor
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newContractor.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contractor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "profilePhoto")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {profilePhoto && (
                  <p className="text-sm text-green-600 mt-1">
                    {profilePhoto.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newContractor.email}
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
                  value={newContractor.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alt_phone"
                  value={newContractor.alt_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter alternate phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={newContractor.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="project_name"
                  value={newContractor.project_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Contracted Sq Ft
                </label>
                <input
                  type="number"
                  name="total_contracted_sqft"
                  value={newContractor.total_contracted_sqft}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter square footage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance Amount (₹)
                </label>
                <input
                  type="number"
                  name="advance_amount"
                  value={newContractor.advance_amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter advance amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={newContractor.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Employees
                </label>
                <input
                  type="number"
                  name="employees"
                  value={newContractor.employees}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of employees"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Representatives
                </label>
                {newContractor.representatives.map((rep, idx) => (
                  <div
                    key={idx}
                    className="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
                  >
                    <input
                      type="text"
                      name={`representative_${idx}_name`}
                      value={rep.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      name={`representative_${idx}_position`}
                      value={rep.position}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Position"
                    />
                    <input
                      type="tel"
                      name={`representative_${idx}_phone`}
                      value={rep.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm flex items-center"
                  onClick={() => {
                    setNewContractor({
                      ...newContractor,
                      representatives: [
                        ...newContractor.representatives,
                        { name: "", position: "", phone: "" },
                      ],
                    });
                  }}
                >
                  <Plus size={16} className="mr-1" /> Add Representative
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Report
                </label>
                <textarea
                  name="report"
                  value={newContractor.report}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project report details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workmanship Verification
                </label>
                <select
                  name="workmanship"
                  value={newContractor.workmanship}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Verified">Verified</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Excellent">Excellent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Owned
                </label>
                <textarea
                  name="equipment_owned"
                  value={newContractor.equipment_owned}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List equipment owned by contractor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment from Store
                </label>
                <textarea
                  name="equipment_from_store"
                  value={newContractor.equipment_from_store}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List equipment received from store"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Work Order
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, "workOrder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {workOrderFile && (
                <p className="text-sm text-green-600 mt-1">
                  {workOrderFile.name}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Add Contractor"}
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
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Contractor
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={16} className="ml-1" />
                      ) : (
                        <ChevronDown size={16} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("project_name")}
                >
                  <div className="flex items-center">
                    Project
                    {sortConfig.key === "project_name" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={16} className="ml-1" />
                      ) : (
                        <ChevronDown size={16} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("total_contracted_sqft")}
                >
                  <div className="flex items-center">
                    Area (Sq Ft)
                    {sortConfig.key === "total_contracted_sqft" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={16} className="ml-1" />
                      ) : (
                        <ChevronDown size={16} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("advance_amount")}
                >
                  <div className="flex items-center">
                    Advance (₹)
                    {sortConfig.key === "advance_amount" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={16} className="ml-1" />
                      ) : (
                        <ChevronDown size={16} className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedContractors.length > 0 ? (
                sortedContractors.map((contractor) => (
                  <tr
                    key={contractor.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          {contractor.profile_photo ? (
                            <img
                              src={`${API_BASE_URL}/${contractor.profile_photo}`}
                              alt={contractor.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="text-blue-600" size={20} />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contractor.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {contractor.id}
                          </div>
                          <div>
                            <button
                              onClick={() => viewContractorDetails(contractor)}
                              className="text-blue-600 cursor-pointer hover:bg-blue-700 hover:text-white hover:px-2 py-1 hover:rounded-md text-[13px]"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <MailIcon
                            size={16}
                            className="text-gray-400 shrink-0"
                          />
                          <a
                            href={`mailto:${contractor.email}`}
                            className="text-sm text-gray-700 hover:text-blue-600 transition-colors truncate max-w-45"
                            title={contractor.email}
                          >
                            {contractor.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400 shrink-0" />
                          <a
                            href={`tel:${contractor.phone}`}
                            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            {contractor.phone}
                          </a>
                          <a
                            href={`https://wa.me/${contractor.phone.replace(
                              /\D/g,
                              "",
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 transition-colors ml-2"
                            title="Send WhatsApp message"
                          >
                            <IoLogoWhatsapp size={18} />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm font-medium text-gray-900 max-w-50 truncate"
                        title={contractor.project_name}
                      >
                        {contractor.project_name}
                      </div>
                      {contractor.project_allotted && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(
                            contractor.project_allotted,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatSqft(contractor.total_contracted_sqft)}
                      </div>
                      <div className="text-xs text-gray-500">sq ft</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <IndianRupee size={14} className="text-gray-600 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(contractor.advance_amount)}
                        </span>
                      </div>
                      {contractor.advance_amount > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Advance Paid
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          contractor.status,
                        )}`}
                      >
                        {contractor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => viewContractorDetails(contractor)}
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(contractor)}
                          className="flex items-center text-green-600 hover:text-green-800 transition-colors px-3 py-1 rounded-md hover:bg-green-50"
                          title="Edit Contractor"
                        >
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContractor(contractor.id)}
                          disabled={isDeleting}
                          className="flex items-center text-red-600 hover:text-red-800 transition-colors px-3 py-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                          title="Delete Contractor"
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
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-3 opacity-50" />
                      <div className="text-lg font-medium text-gray-500 mb-1">
                        No contractors found
                      </div>
                      <div className="text-sm text-gray-400">
                        {searchTerm
                          ? `No results for "${searchTerm}"`
                          : "Try adding a new contractor"}
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
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

      {showEditModal && editingContractor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Contractor: {editingContractor.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingContractor.name || ""}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contractor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Profile Photo
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleEditFileChange(e, "profilePhoto")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {editProfilePhoto ? (
                      <p className="text-sm text-green-600 mt-1">
                        {editProfilePhoto.name}
                      </p>
                    ) : (
                      editingContractor.profile_photo && (
                        <p className="text-sm text-gray-500 mt-1">
                          Current:{" "}
                          {editingContractor.profile_photo.split("/").pop()}
                        </p>
                      )
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editingContractor.email || ""}
                      onChange={handleEditInputChange}
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
                      value={editingContractor.phone || ""}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alt_phone"
                      value={editingContractor.alt_phone || ""}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter alternate phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={editingContractor.company || ""}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      name="project_name"
                      value={editingContractor.project_name || ""}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Allotted Date
                    </label>
                    <input
                      type="date"
                      name="project_allotted"
                      value={
                        editingContractor.project_allotted
                          ? editingContractor.project_allotted.split("T")[0]
                          : ""
                      }
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Contracted Sq Ft
                    </label>
                    <input
                      type="number"
                      name="total_contracted_sqft"
                      value={editingContractor.total_contracted_sqft || ""}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter square footage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Advance Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="advance_amount"
                      value={editingContractor.advance_amount || ""}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter advance amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editingContractor.status || "Active"}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      name="employees"
                      value={editingContractor.employees || ""}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter number of employees"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Representatives
                    </label>
                    {editingContractor.representatives.map((rep, idx) => (
                      <div
                        key={idx}
                        className="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
                      >
                        <input
                          type="text"
                          name={`representative_${idx}_name`}
                          value={rep.name || ""}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          name={`representative_${idx}_position`}
                          value={rep.position || ""}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Position"
                        />
                        <input
                          type="tel"
                          name={`representative_${idx}_phone`}
                          value={rep.phone || ""}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Phone"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm flex items-center"
                      onClick={() => {
                        setEditingContractor({
                          ...editingContractor,
                          representatives: [
                            ...editingContractor.representatives,
                            { name: "", position: "", phone: "" },
                          ],
                        });
                      }}
                    >
                      <Plus size={16} className="mr-1" /> Add Representative
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Report
                    </label>
                    <textarea
                      name="report"
                      value={editingContractor.report || ""}
                      onChange={handleEditInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter project report details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Workmanship Verification
                    </label>
                    <select
                      name="workmanship"
                      value={editingContractor.workmanship || "Verified"}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Verified">Verified</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Excellent">Excellent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment Owned
                    </label>
                    <textarea
                      name="equipment_owned"
                      value={editingContractor.equipment_owned || ""}
                      onChange={handleEditInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List equipment owned by contractor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment from Store
                    </label>
                    <textarea
                      name="equipment_from_store"
                      value={editingContractor.equipment_from_store || ""}
                      onChange={handleEditInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List equipment received from store"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Work Order
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleEditFileChange(e, "workOrder")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {editWorkOrderFile ? (
                    <p className="text-sm text-green-600 mt-1">
                      {editWorkOrderFile.name}
                    </p>
                  ) : (
                    editingContractor.work_order_file && (
                      <p className="text-sm text-gray-500 mt-1">
                        Current:{" "}
                        {editingContractor.work_order_file.split("/").pop()}
                      </p>
                    )
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Contractor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedContractor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Contractor Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Work Order
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedContractor.work_order_file ? (
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        <span className="text-sm text-gray-700">
                          Work Order File
                        </span>
                        <a
                          href={`${API_BASE_URL}/${selectedContractor.work_order_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                        >
                          <DownloadIcon size={16} /> Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No work order uploaded.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Contractor Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {selectedContractor.profile_photo ? (
                          <img
                            src={`${API_BASE_URL}/${selectedContractor.profile_photo}`}
                            alt={selectedContractor.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="text-blue-600" size={24} />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-medium text-gray-900">
                          {selectedContractor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {selectedContractor.id}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MailIcon size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm">
                          {selectedContractor.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm">
                          {selectedContractor.phone}
                        </span>
                      </div>
                      {selectedContractor.alt_phone && (
                        <div className="flex items-center">
                          <Phone size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm">
                            Alt: {selectedContractor.alt_phone}
                          </span>
                        </div>
                      )}
                      {selectedContractor.company && (
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm">
                            Company: {selectedContractor.company}
                          </span>
                        </div>
                      )}
                      {selectedContractor.employees && (
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm">
                            {selectedContractor.employees} Employees
                          </span>
                        </div>
                      )}
                      {selectedContractor.representatives?.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            Representatives:
                          </div>
                          {selectedContractor.representatives.map(
                            (rep, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-600 ml-2"
                              >
                                {rep.name} ({rep.position}) - {rep.phone}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Project Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <div className="text-lg font-medium text-gray-900">
                        {selectedContractor.project_name}
                      </div>
                      {selectedContractor.project_allotted && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Allotted:{" "}
                          {new Date(
                            selectedContractor.project_allotted,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedContractor.total_contracted_sqft && (
                        <div className="flex justify-between">
                          <span className="text-sm">Contracted Area:</span>
                          <span className="text-sm font-medium">
                            {formatSqft(
                              selectedContractor.total_contracted_sqft,
                            )}{" "}
                            sq ft
                          </span>
                        </div>
                      )}
                      {selectedContractor.advance_amount && (
                        <div className="flex justify-between">
                          <span className="text-sm">Advance Amount:</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(selectedContractor.advance_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                            selectedContractor.status,
                          )}`}
                        >
                          {selectedContractor.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Workmanship:</span>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkmanshipClass(
                            selectedContractor.workmanship,
                          )}`}
                        >
                          {selectedContractor.workmanship}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Equipment Details
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Equipment Owned:
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        {selectedContractor.equipment_owned || "Not specified"}
                        <button
                          className="flex items-center border border-blue-700 px-2 py-1 text-sm rounded hover:bg-blue-100 transition-colors"
                          onClick={async () => {
                            try {
                              const updated = await handleUpdateContractor(
                                selectedContractor.id,
                                {
                                  equipment_verified: true,
                                },
                              );
                              if (updated) {
                                setSelectedContractor(updated);
                              }
                            } catch (error) {
                              console.error("Verification failed:", error);
                            }
                          }}
                        >
                          <CheckCircle size={16} className="mr-1" /> Verify
                        </button>
                        <button
                          className="flex items-center border border-gray-400 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setEditingEquipment(
                              selectedContractor.equipment_owned || "",
                            );
                            setShowEquipmentEditModal(true);
                            setEditingField("owned");
                          }}
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Equipment from Store:
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        {selectedContractor.equipment_from_store ||
                          "Not specified"}
                        <button
                          className="flex items-center border border-gray-400 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setEditingEquipment(
                              selectedContractor.equipment_from_store || "",
                            );
                            setShowEquipmentEditModal(true);
                            setEditingField("store");
                          }}
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedContractor.report && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Project Report
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">
                        {selectedContractor.report}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => openEditModal(selectedContractor)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Edit Contractor
              </button>
              <button
                onClick={() => handleDeleteContractor(selectedContractor.id)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Contractor"}
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEquipmentEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Equipment{" "}
                {editingField === "owned" ? "Owned" : "from Store"}
              </h3>
              <button
                onClick={() => setShowEquipmentEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={editingEquipment}
                onChange={(e) => setEditingEquipment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${editingField === "owned" ? "equipment owned" : "equipment from store"}...`}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEquipmentEditModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const updateData = {};
                    if (editingField === "owned") {
                      updateData.equipment_owned = editingEquipment;
                    } else {
                      updateData.equipment_from_store = editingEquipment;
                    }

                    const updated = await handleUpdateContractor(
                      selectedContractor.id,
                      updateData,
                    );
                    if (updated) {
                      setSelectedContractor(updated);
                      setShowEquipmentEditModal(false);
                    }
                  } catch (error) {
                    console.error("Update failed:", error);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorPage;
