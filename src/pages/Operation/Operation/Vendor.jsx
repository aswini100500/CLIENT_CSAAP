import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaShareAlt,
  FaHardHat,
  FaHistory,
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaPaperclip,
  FaEye,
  FaEdit,
  FaSearch,
  FaSync,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";

import operationApi from "../../../api/operation";

const Vendor = () => {
  const [activeTab, setActiveTab] = useState("main");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [viewMode, setViewMode] = useState("form");
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    bankDetails: true,
    experience: true,
    infrastructure: true,
    workHistory: true,
    attachments: true,
  });

  const [vendorData, setVendorData] = useState({
    vendor_code: "",
    vendor_name: "",
    email: "",
    phone: "",
    address: "",
    bank_accounts: [
      {
        id: 1,
        account_number: "",
        account_name: "",
        bank_name: "",
        branch: "",
        ifsc_code: "",
        account_type: "savings",
      },
    ],
    experience: {
      years_in_business: "",
      similar_projects_completed: "",
      annual_turnover: "",
      certifications: [""],
    },
    infrastructure: {
      equipment: [""],
      manpower: {
        technical: "",
        non_technical: "",
        skilled: "",
        unskilled: "",
      },
    },
    workHistory: [
      {
        id: 1,
        project_name: "",
        client: "",
        project_value: "",
        start_date: "",
        end_date: "",
        status: "completed",
      },
    ],
    attachments: [],
    reference_type: "person",
    reference_text: "",
    reference_source: "",
    reference_url: "",
  });

  const [machines, setMachines] = useState([
    {
      id: 1,
      name: "",
      type: "",
      model: "",
      quantity: "",
      ownership: "own",
      remarks: "",
    },
  ]);

  const [tabCompletion, setTabCompletion] = useState({
    main: false,
    infrastructure: false,
    machines: false,
    workHistory: false,
    attachments: false,
  });

  const [remark, setRemark] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [dragActive, setDragActive] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const fileInputRef = React.useRef(null);

  const fileIcons = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "📽️",
    pptx: "📽️",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    txt: "📃",
    zip: "📦",
    default: "📎",
  };

  const tabs = [
    { id: "main", label: "Main Info", icon: FaBuilding },
    { id: "infrastructure", label: "Man Power", icon: FaHardHat },
    { id: "machines", label: "Machinaries", icon: FaHardHat },
    { id: "workHistory", label: "Work History", icon: FaHistory },
    { id: "attachments", label: "Attachments", icon: FaPaperclip },
  ];

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  useEffect(() => {
    fetchVendors();
    const prefix = "Cloud";
    const timestamp = Date.now().toString().slice(-6);
    setVendorData((prev) => ({
      ...prev,
      vendor_code: `${prefix}-${timestamp}`,
    }));
  }, []);

  useEffect(() => {
    checkTabCompletion();
  }, [vendorData, machines]);

  const checkTabCompletion = () => {
    const completion = { ...tabCompletion };

    completion.main = !!(
      vendorData.vendor_name &&
      vendorData.email &&
      vendorData.phone
    );

    const manpower = vendorData.infrastructure.manpower;
    completion.infrastructure = !!(
      manpower.technical ||
      manpower.non_technical ||
      manpower.skilled ||
      manpower.unskilled
    );

    completion.machines = machines.some((m) => m.name && m.quantity);

    completion.workHistory = vendorData.workHistory.some(
      (w) => w.project_name && w.client,
    );

    completion.attachments = vendorData.attachments.length > 0;

    setTabCompletion(completion);
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getVendors();
      setVendors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSelect = async (vendorId) => {
    setSelectedVendorId(vendorId);
    if (vendorId) {
      try {
        setLoading(true);
        const response = await operationApi.getVendor(vendorId);
        const vendor = response.data.data;

        setVendorData({
          ...vendorData,
          vendor_name: vendor.vendor_name || "",
          email: vendor.email || "",
          phone: vendor.phone || "",
          address: vendor.address || "",
          bank_accounts: vendor.bank_accounts || vendorData.bank_accounts,
          experience: {
            years_in_business: vendor.years_in_business || "",
            similar_projects_completed: vendor.similar_projects_completed || "",
            annual_turnover: vendor.annual_turnover || "",
            certifications: vendor.certifications || [""],
          },
          infrastructure: {
            equipment: [""],
            manpower: {
              technical: vendor.technical_staff || "",
              non_technical: vendor.non_technical_staff || "",
              skilled: vendor.skilled_workers || "",
              unskilled: vendor.unskilled_workers || "",
            },
          },
          workHistory: vendor.work_history || vendorData.workHistory,
          attachments: vendor.attachments || vendorData.attachments,
          reference_type: vendor.reference_type || "person",
          reference_text: vendor.reference_text || "",
          reference_source: vendor.reference_source || "",
        });

        if (vendor.machines) {
          setMachines(vendor.machines);
        }

        Swal.fire({
          title: "Vendor Loaded",
          text: `${vendor.vendor_name} data has been loaded successfully.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error loading vendor:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load vendor data.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMachineChange = (id, field, value) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const addMachine = () => {
    setMachines((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        type: "",
        model: "",
        quantity: "",
        ownership: "own",
        remarks: "",
      },
    ]);
  };

  const removeMachine = (id) => {
    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleInputChange = (path, value) => {
    setVendorData((prev) => {
      const keys = path.split(".");
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++)
        current = current[keys[i]] = { ...current[keys[i]] };
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setVendorData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addArrayItem = (arrayName, template) => {
    setVendorData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...template, id: Date.now() }],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    if (vendorData[arrayName].length > 1) {
      setVendorData((prev) => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      }));
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return fileIcons[extension] || fileIcons.default;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      Swal.fire({
        title: "File too large",
        text: "Maximum size is 10MB.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/zip",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      Swal.fire({
        title: "Unsupported file type",
        text: "Please upload images, PDFs, documents, or text files.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleUpload = () => {
    if (!file) {
      Swal.fire({
        title: "No file selected",
        text: "Please select a file to upload.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!remark.trim()) {
      Swal.fire({
        title: "Remark required",
        text: "Please add a remark for the file.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    simulateUpload();

    setTimeout(() => {
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedOn: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        remark: remark.trim(),
        url: URL.createObjectURL(file),
      };

      setVendorData((prev) => ({
        ...prev,
        attachments: [newAttachment, ...prev.attachments],
      }));
      setFile(null);
      setRemark("");
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      Swal.fire({
        title: "Success!",
        text: "File uploaded successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    }, 1200);
  };

  const handleDeleteAttachment = (attachmentId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setVendorData((prev) => ({
          ...prev,
          attachments: prev.attachments.filter(
            (att) => att.id !== attachmentId,
          ),
        }));
        Swal.fire("Deleted!", "File has been deleted.", "success");
      }
    });
  };

  const filteredAttachments = vendorData.attachments
    .filter(
      (att) =>
        att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.remark.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return a.size - b.size;
        case "date":
        default:
          return new Date(b.uploadedOn) - new Date(a.uploadedOn);
      }
    });

  const totalSize = vendorData.attachments.reduce(
    (sum, att) => sum + att.size,
    0,
  );

  const validateTabData = (tabId) => {
    switch (tabId) {
      case "main":
        if (!vendorData.vendor_name) {
          Swal.fire({
            title: "Required Field",
            text: "Please enter vendor name.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return false;
        }
        if (!vendorData.email) {
          Swal.fire({
            title: "Required Field",
            text: "Please enter email address.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return false;
        }
        if (!vendorData.phone) {
          Swal.fire({
            title: "Required Field",
            text: "Please enter phone number.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return false;
        }
        return true;

      case "infrastructure":
        return true;

      case "machines":
        return true;

      case "workHistory":
        return true;

      case "attachments":
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateTabData(activeTab)) {
      return;
    }

    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!vendorData.vendor_name || !vendorData.email || !vendorData.phone) {
        Swal.fire({
          title: "Incomplete Information",
          text: "Please ensure vendor name, email, and phone are filled in the Main Info tab.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        setActiveTab("main");
        return;
      }

      const dataToSave = {
        ...vendorData,
        work_history: vendorData.workHistory,
        technical_staff: vendorData.infrastructure.manpower.technical,
        non_technical_staff: vendorData.infrastructure.manpower.non_technical,
        skilled_workers: vendorData.infrastructure.manpower.skilled,
        unskilled_workers: vendorData.infrastructure.manpower.unskilled,
        years_in_business: vendorData.experience?.years_in_business,
        similar_projects_completed:
          vendorData.experience?.similar_projects_completed,
        annual_turnover: vendorData.experience?.annual_turnover,
        certifications: vendorData.experience?.certifications,
        machines: machines.filter((m) => m.name || m.model || m.quantity),
      };

      if (selectedVendorId) {
        await operationApi.updateVendor(selectedVendorId, dataToSave);

        await Promise.all([
          operationApi.updateVendorManpower(selectedVendorId, dataToSave),
          operationApi.updateVendorMachines(selectedVendorId, {
            machines: dataToSave.machines,
          }),
          operationApi.updateVendorWorkHistory(selectedVendorId, {
            work_history: dataToSave.work_history,
          }),
        ]);

        Swal.fire({
          title: "Success!",
          text: "Vendor information has been updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3B82F6",
        });
      } else {
        await operationApi.createVendor(dataToSave);
        Swal.fire({
          title: "Success!",
          text: "Vendor has been onboarded successfully.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3B82F6",
        });
      }

      fetchVendors();

      resetForm();
    } catch (error) {
      console.error("Error saving vendor:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to save vendor information.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setVendorData({
      vendor_code: `Cloud-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      vendor_name: "",
      email: "",
      phone: "",
      address: "",
      bank_accounts: [
        {
          id: 1,
          account_number: "",
          account_name: "",
          bank_name: "",
          branch: "",
          ifsc_code: "",
          account_type: "savings",
        },
      ],
      experience: {
        years_in_business: "",
        similar_projects_completed: "",
        annual_turnover: "",
        certifications: [""],
      },
      infrastructure: {
        equipment: [""],
        manpower: {
          technical: "",
          non_technical: "",
          skilled: "",
          unskilled: "",
        },
      },
      workHistory: [
        {
          id: 1,
          project_name: "",
          client: "",
          project_value: "",
          start_date: "",
          end_date: "",
          status: "completed",
        },
      ],
      attachments: [],
      reference_type: "person",
      reference_text: "",
      reference_source: "",
      reference_url: "",
    });
    setMachines([
      { id: 1, name: "", type: "", model: "", quantity: "", remarks: "" },
    ]);
    setSelectedVendorId("");
    setActiveTab("main");
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will lose all unsaved changes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3B82F6",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, cancel!",
      cancelButtonText: "No, keep editing",
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
        Swal.fire("Cancelled!", "Your changes have been discarded.", "info");
      }
    });
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendorId(vendor.id);
    handleVendorSelect(vendor.id);
    setViewMode("form");
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.vendor_name
        ?.toLowerCase()
        .includes(vendorSearchTerm.toLowerCase()) ||
      vendor.vendor_code
        ?.toLowerCase()
        .includes(vendorSearchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(vendorSearchTerm.toLowerCase());

    if (vendorFilter === "all") return matchesSearch;
    if (vendorFilter === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && new Date(vendor.created_at) >= sevenDaysAgo;
    }
    return matchesSearch;
  });

  const VendorSelector = ({ showForTabs = [] }) => {
    if (!showForTabs.includes(activeTab)) return null;

    return (
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Select Vendor:
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => handleVendorSelect(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- Select a vendor --</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.vendor_name} ({vendor.vendor_code})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setViewMode(viewMode === "form" ? "list" : "form")}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FaEye />
            <span>{viewMode === "form" ? "View List" : "View Form"}</span>
          </button>
        </div>
        {selectedVendorId && (
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            <FaCheckCircle className="inline mr-1" />
            Editing:{" "}
            {vendors.find((v) => v.id === selectedVendorId)?.vendor_name}
          </div>
        )}
      </div>
    );
  };

  const TabProgress = () => (
    <div className="mb-4 flex items-center justify-between px-4">
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentTabIndex
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
            >
              {tabCompletion[tab.id] && index <= currentTabIndex ? (
                <FaCheckCircle className="text-white" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`ml-2 text-sm hidden sm:inline ${index === currentTabIndex
                  ? "text-green-800 font-semibold"
                  : "text-gray-600 dark:text-gray-400"
                }`}
            >
              {tab.label}
            </span>
          </div>
          {index < tabs.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${index < currentTabIndex
                  ? "bg-green-600"
                  : "bg-gray-200 dark:bg-gray-700"
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const VendorListView = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Vendors List
        </h2>
        <div className="erp-root">
          <button
            type="button"
            onClick={() => setViewMode("form")}
            className="app-btn-primary flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add New Vendor</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={vendorSearchTerm}
            onChange={(e) => setVendorSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Vendors</option>
          <option value="recent">Recent (Last 7 days)</option>
        </select>
        <button
          onClick={fetchVendors}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading vendors...
          </p>
        </div>
      ) : filteredVendors.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vendor Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {vendor.vendor_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {vendor.vendor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {vendor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {vendor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditVendor(vendor)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVendorId(vendor.id);
                          handleVendorSelect(vendor.id);
                          setViewMode("form");
                        }}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No vendors
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {vendorSearchTerm
              ? "No vendors match your search"
              : "Get started by creating a new vendor."}
          </p>
          {!vendorSearchTerm && (
            <div className="mt-6 erp-root">
              <button
                onClick={() => setViewMode("form")}
                className="app-btn-primary inline-flex items-center"
              >
                <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                New Vendor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Vendor Onboarding
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage vendor information
          </p>
        </div>
      </div>

      {viewMode === "list" ? (
        <VendorListView />
      ) : (
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 pb-0">
            <TabProgress />
          </div>

          <VendorSelector
            showForTabs={[
              "infrastructure",
              "machines",
              "workHistory",
              "attachments",
            ]}
          />

          <div className="border-b border-gray-200 dark:border-gray-700 flex px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? "border-green-600 text-green-800 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
                {tabCompletion[tab.id] && (
                  <FaCheckCircle className="text-green-500 ml-1" size={12} />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-8">
            {activeTab === "main" && (
              <div>
                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-4"
                    onClick={() => toggleSection("basicInfo")}
                  >
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Basic Information
                    </h2>
                    <button>
                      {expandedSections.basicInfo ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                  </div>
                  {expandedSections.basicInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Vendor Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={vendorData.vendor_name}
                          onChange={(e) =>
                            handleInputChange("vendor_name", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter vendor name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Vendor Code
                        </label>
                        <input
                          type="text"
                          value={vendorData.vendor_code}
                          readOnly
                          className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={vendorData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={vendorData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={vendorData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <FaShareAlt className="text-blue-500" />
                    Reference Information
                  </h3>

                  <div className="mb-5">
                    <label
                      htmlFor="reference_text"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      How did you hear about us?
                    </label>
                    <textarea
                      id="reference_text"
                      value={vendorData.reference_text || ""}
                      onChange={(e) =>
                        handleInputChange("reference_text", e.target.value)
                      }
                      placeholder="e.g., Through a friend, social media, web search, etc."
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="3"
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="reference_type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Source Type
                    </label>
                    <select
                      id="reference_type"
                      value={vendorData.reference_type || ""}
                      onChange={(e) =>
                        handleInputChange("reference_type", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select source type</option>
                      <option value="person">Person</option>
                      <option value="social_media">Social Media</option>
                      <option value="website">Website/Blog</option>
                      <option value="event">Event/Conference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="reference_source"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Source Name / Platform
                    </label>
                    <input
                      type="text"
                      id="reference_source"
                      value={vendorData.reference_source || ""}
                      onChange={(e) =>
                        handleInputChange("reference_source", e.target.value)
                      }
                      placeholder="e.g., John Doe, Instagram, Google, LinkedIn"
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {vendorData.reference_type === "social_media" && (
                    <div className="mb-5">
                      <label
                        htmlFor="reference_url"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Social Media URL (optional)
                      </label>
                      <input
                        type="url"
                        id="reference_url"
                        value={vendorData.reference_url || ""}
                        onChange={(e) =>
                          handleInputChange("reference_url", e.target.value)
                        }
                        placeholder="e.g., https://instagram.com/yourprofile"
                        className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-4"
                    onClick={() => toggleSection("bankDetails")}
                  >
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-5">
                      Bank Details
                    </h2>
                    <button>
                      {expandedSections.bankDetails ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                  </div>
                  {expandedSections.bankDetails && (
                    <div className="space-y-4">
                      {vendorData.bank_accounts.map((acc, i) => (
                        <div
                          key={acc.id}
                          className="p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Account {i + 1}</h3>
                            {vendorData.bank_accounts.length > 1 && (
                              <button
                                onClick={() =>
                                  removeArrayItem("bank_accounts", i)
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={acc.account_number}
                              onChange={(e) =>
                                handleArrayChange(
                                  "bank_accounts",
                                  i,
                                  "account_number",
                                  e.target.value,
                                )
                              }
                              placeholder="Account Number"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={acc.account_name}
                              onChange={(e) =>
                                handleArrayChange(
                                  "bank_accounts",
                                  i,
                                  "account_name",
                                  e.target.value,
                                )
                              }
                              placeholder="Account Name"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={acc.bank_name}
                              onChange={(e) =>
                                handleArrayChange(
                                  "bank_accounts",
                                  i,
                                  "bank_name",
                                  e.target.value,
                                )
                              }
                              placeholder="Bank Name"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={acc.branch}
                              onChange={(e) =>
                                handleArrayChange(
                                  "bank_accounts",
                                  i,
                                  "branch",
                                  e.target.value,
                                )
                              }
                              placeholder="Branch"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={acc.ifsc_code}
                              onChange={(e) =>
                                handleArrayChange(
                                  "bank_accounts",
                                  i,
                                  "ifsc_code",
                                  e.target.value,
                                )
                              }
                              placeholder="IFSC Code"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                              value={acc.account_type}
                              onChange={(e) =>
                                handleArrayChange(
                                  "bank_accounts",
                                  i,
                                  "account_type",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="savings">Savings</option>
                              <option value="current">Current</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          addArrayItem("bank_accounts", {
                            account_number: "",
                            account_name: "",
                            bank_name: "",
                            branch: "",
                            ifsc_code: "",
                            account_type: "savings",
                          })
                        }
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <FaPlus />
                        <span>Add Account</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "infrastructure" && (
              <div>
                <div
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() => toggleSection("infrastructure")}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Man Power
                  </h2>
                  <button>
                    {expandedSections.infrastructure ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                </div>
                {expandedSections.infrastructure && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Technical Staff
                      </label>
                      <input
                        type="number"
                        value={vendorData.infrastructure.manpower.technical}
                        onChange={(e) =>
                          handleInputChange(
                            "infrastructure.manpower.technical",
                            e.target.value,
                          )
                        }
                        placeholder="Technical Staff"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Non-Technical Staff
                      </label>
                      <input
                        type="number"
                        value={vendorData.infrastructure.manpower.non_technical}
                        onChange={(e) =>
                          handleInputChange(
                            "infrastructure.manpower.non_technical",
                            e.target.value,
                          )
                        }
                        placeholder="Non-Technical Staff"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Skilled Worker
                      </label>
                      <input
                        type="number"
                        value={vendorData.infrastructure.manpower.skilled}
                        onChange={(e) =>
                          handleInputChange(
                            "infrastructure.manpower.skilled",
                            e.target.value,
                          )
                        }
                        placeholder="Skilled Workers"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        UnSkilled Worker
                      </label>
                      <input
                        type="number"
                        value={vendorData.infrastructure.manpower.unskilled}
                        onChange={(e) =>
                          handleInputChange(
                            "infrastructure.manpower.unskilled",
                            e.target.value,
                          )
                        }
                        placeholder="Unskilled Workers"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "machines" && (
              <div className="space-y-6">
                <table className="w-full border border-gray-300 text-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="border p-2 text-left">S.No</th>
                      <th className="border p-2 text-left">Machine Name</th>
                      <th className="border p-2 text-left">
                        Model / Specification
                      </th>
                      <th className="border p-2 text-left">Quantity</th>
                      <th className="border p-2 text-left">Rent / Own</th>
                      <th className="border p-2 text-left">Remarks</th>
                      <th className="border p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.map((machine, index) => (
                      <tr
                        key={machine.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={machine.name}
                            onChange={(e) =>
                              handleMachineChange(
                                machine.id,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Excavator"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={machine.model}
                            onChange={(e) =>
                              handleMachineChange(
                                machine.id,
                                "model",
                                e.target.value,
                              )
                            }
                            className="w-full border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. CAT 320D"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={machine.quantity}
                            onChange={(e) =>
                              handleMachineChange(
                                machine.id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-full border p-1 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </td>
                        <td className="border p-2">
                          <select
                            value={machine.type || ""}
                            onChange={(e) =>
                              handleMachineChange(
                                machine.id,
                                "type",
                                e.target.value,
                              )
                            }
                            className="w-full border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="rented">Rented</option>
                            <option value="own">Own</option>
                          </select>
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={machine.remarks}
                            onChange={(e) =>
                              handleMachineChange(
                                machine.id,
                                "remarks",
                                e.target.value,
                              )
                            }
                            className="w-full border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Rented"
                          />
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeMachine(machine.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="erp-root">
                  <button
                    type="button"
                    onClick={addMachine}
                    className="app-btn-primary flex items-center gap-2 mt-3"
                  >
                    <FaPlus /> Add Machine
                  </button>
                </div>

                <hr className="my-6 border-gray-300 dark:border-gray-600" />

                {machines.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      Added Machines
                    </h3>
                    <table className="w-full border border-gray-300 text-sm rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="border p-2 text-left">S.No</th>
                          <th className="border p-2 text-left">Machine Name</th>
                          <th className="border p-2 text-left">
                            Model / Specification
                          </th>
                          <th className="border p-2 text-left">Quantity</th>
                          <th className="border p-2 text-left">Type</th>
                          <th className="border p-2 text-left">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machines.map((machine, index) => (
                          <tr
                            key={machine.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="border p-2">{index + 1}</td>
                            <td className="border p-2">
                              {machine.name || "-"}
                            </td>
                            <td className="border p-2">
                              {machine.model || "-"}
                            </td>
                            <td className="border p-2 text-center">
                              {machine.quantity || "-"}
                            </td>
                            <td className="border p-2">
                              {machine.type || "-"}
                            </td>
                            <td className="border p-2">
                              {machine.remarks || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "workHistory" && (
              <div>
                <div
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() => toggleSection("workHistory")}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Work History
                  </h2>
                  <button>
                    {expandedSections.workHistory ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                </div>
                {expandedSections.workHistory && (
                  <div className="space-y-4">
                    {vendorData.workHistory.map((work, i) => (
                      <div key={work.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">Project {i + 1}</h3>
                          {vendorData.workHistory.length > 1 && (
                            <button
                              onClick={() => removeArrayItem("workHistory", i)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Project Name
                            </label>
                            <input
                              type="text"
                              value={work.project_name}
                              onChange={(e) =>
                                handleArrayChange(
                                  "workHistory",
                                  i,
                                  "project_name",
                                  e.target.value,
                                )
                              }
                              placeholder="Project Name"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Client
                            </label>
                            <input
                              type="text"
                              value={work.client}
                              onChange={(e) =>
                                handleArrayChange(
                                  "workHistory",
                                  i,
                                  "client",
                                  e.target.value,
                                )
                              }
                              placeholder="Client"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Project Value
                            </label>
                            <input
                              type="text"
                              value={work.project_value}
                              onChange={(e) =>
                                handleArrayChange(
                                  "workHistory",
                                  i,
                                  "project_value",
                                  e.target.value,
                                )
                              }
                              placeholder="Project Value"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Status
                            </label>
                            <select
                              value={work.status}
                              onChange={(e) =>
                                handleArrayChange(
                                  "workHistory",
                                  i,
                                  "status",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="completed">Completed</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={work.start_date}
                              onChange={(e) =>
                                handleArrayChange(
                                  "workHistory",
                                  i,
                                  "start_date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={work.end_date}
                              onChange={(e) =>
                                handleArrayChange(
                                  "workHistory",
                                  i,
                                  "end_date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        addArrayItem("workHistory", {
                          project_name: "",
                          client: "",
                          project_value: "",
                          start_date: "",
                          end_date: "",
                          status: "completed",
                        })
                      }
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaPlus />
                      <span>Add Project</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "attachments" && (
              <div>
                <div
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() => toggleSection("attachments")}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Attachments
                  </h2>
                  <button>
                    {expandedSections.attachments ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                </div>

                {expandedSections.attachments && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="max-w-md mx-auto">
                          <div className="text-4xl mb-4">📁</div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Drag and drop your files here
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            or click to browse (Max: 10MB, Supported: Images,
                            PDF, Documents)
                          </p>

                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                          />
                          <div className="erp-root">
                            <label
                              htmlFor="file-upload"
                              className="app-btn-primary cursor-pointer inline-block"
                            >
                              Choose File
                            </label>
                          </div>
                        </div>
                      </div>

                      {(file || isUploading) && (
                        <div className="mt-6 p-4 bg-white dark:bg-gray-600 rounded-lg">
                          {file && (
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">
                                  {getFileIcon(file.name)}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white">
                                    {file.name}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-300">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setFile(null);
                                  if (fileInputRef.current)
                                    fileInputRef.current.value = "";
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {isUploading && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-4">
                            <input
                              type="text"
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                              placeholder="Add a remark or description..."
                              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              disabled={isUploading}
                            />
                            <div className="erp-root">
                              <button
                                onClick={handleUpload}
                                disabled={isUploading || !file || !remark.trim()}
                                className="app-btn-primary"
                              >
                                {isUploading ? "Uploading..." : "Upload"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {vendorData.attachments.length} files •{" "}
                        {formatFileSize(totalSize)} total
                      </div>

                      <div className="flex space-x-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="date">Sort by Date</option>
                          <option value="name">Sort by Name</option>
                          <option value="size">Sort by Size</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                      {filteredAttachments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-500">
                              <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                  File
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Size
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Uploaded On
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Remark
                                </th>
                                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
                              {filteredAttachments.map((att) => (
                                <tr
                                  key={att.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-xl">
                                        {getFileIcon(att.name)}
                                      </span>
                                      <span className="font-medium text-gray-800 dark:text-white">
                                        {att.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {formatFileSize(att.size)}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {att.uploadedOn}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                    {att.remark}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                      <a
                                        href={att.url}
                                        download={att.name}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        title="Download"
                                      >
                                        ⬇️
                                      </a>
                                      <button
                                        onClick={() =>
                                          handleDeleteAttachment(att.id)
                                        }
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                        title="Delete"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📁</div>
                          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                            {vendorData.attachments.length === 0
                              ? "No attachments yet"
                              : "No files match your search"}
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm">
                            {vendorData.attachments.length === 0
                              ? "Upload your first file to get started"
                              : "Try adjusting your search terms"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <button
                  onClick={handlePrevious}
                  disabled={currentTabIndex === 0}
                  className={`px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center space-x-2 ${currentTabIndex === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  <FaArrowLeft />
                  <span>Previous</span>
                </button>
              </div>

              <div className="erp-root flex space-x-4">
                <button
                  onClick={handleCancel}
                  className="app-btn-secondary"
                >
                  <FaTimes className="inline mr-2" />
                  Cancel
                </button>

                {currentTabIndex === tabs.length - 1 ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="app-btn-primary disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="inline mr-2" />
                        Save Vendor
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="app-btn-primary"
                  >
                    <span>Next</span>
                    <FaArrowRight className="inline ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
