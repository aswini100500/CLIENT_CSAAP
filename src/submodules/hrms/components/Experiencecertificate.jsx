import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Building,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Mail,
  Plus,
  Search,
  Send,
  X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const ExperienceCertificateManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [newCertificate, setNewCertificate] = useState({
    employeeName: "",
    employeeId: "",
    position: "",
    department: "",
    startDate: "",
    endDate: "",
    workDuration: "",
    reasonForLeaving: "Resignation",
    performance: "Excellent",
    issuedDate: new Date().toISOString().split("T")[0],
  });
  const [toast, setToast] = useState(null);
  const entriesPerPage = 5;

  // Sample data for experience certificates
  const [certificateData, setCertificateData] = useState([]);

  const { user } = useAuth();
  console.log("Current user in ProjectAssignment:", user);
  const company_id = user.id;
  const todayLocal = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const fetchEligibleEmployees = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/eligible/employees/${company_id}`,
        );
        console.log(res);

        if (res.data?.data) {
          setEligibleEmployees(res.data.data);
        }
        console.log(eligibleEmployees);
      } catch (err) {
        console.error("Error fetching eligible employees:", err);
        Swal.fire("Error", "Failed to fetch eligible employees", "error");
      }
    };

    fetchEligibleEmployees();
  }, []);
  // Auto-calculate duration when editing certificate dates
  useEffect(() => {
    if (editForm.startDate && editForm.endDate) {
      const duration = calculateDuration(editForm.startDate, editForm.endDate);
      setEditForm((prev) => ({ ...prev, workDuration: duration }));
    }
  }, [editForm.startDate, editForm.endDate]);

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/eligible/employees/${company_id}`,
      );

      if (res.data?.data) {
        const mapped = res.data.data.map((emp) => ({
          employeeId: emp.id,
          employeeName: emp.name,
          position: emp.postApplied,
          department: emp.department,
          startDate: emp.joinDate,
          endDate: emp.resignDate || null,
          monthsWorked: emp.monthsWorked,
          email: emp.email,
          performance: emp.performance || "Excellent",
          status: emp.status || "Pending",
        }));

        setCertificateData(mapped);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };
  useEffect(() => {
    fetchCertificates();
  }, []);
  const filteredData = (certificateData || []).filter((certificate) => {
    const name = certificate.employeeName?.toLowerCase() || "";
    const empId = String(certificate.employeeId || "").toLowerCase();
    const position = certificate.position?.toLowerCase() || "";

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      empId.includes(searchTerm.toLowerCase()) ||
      position.includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !departmentFilter || certificate.department === departmentFilter;

    const matchesStatus = !statusFilter || certificate.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });
  // Pagination
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  // Get unique departments (defensive: certificateData may be undefined if API returns unexpected shape)
  const departments = [
    ...new Set((certificateData || []).map((cert) => cert.department)),
  ];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      draft: { label: "Draft", color: "bg-gray-50 text-gray-600 border border-gray-200" },
      pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border border-amber-100" },
      issued: { label: "Issued", color: "bg-green-50 text-green-700 border border-green-100" },
      revoked: { label: "Revoked", color: "bg-red-50 text-red-700 border border-red-100" },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return (
      <span
        className={`px-2 py-0.5 inline-flex text-[10px] font-extrabold leading-5 rounded-full border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Performance badge component
  const PerformanceBadge = ({ performance }) => {
    const performanceConfig = {
      Excellent: { color: "bg-green-50 text-green-700 border border-green-100" },
      Outstanding: { color: "bg-indigo-50 text-indigo-700 border border-indigo-100" },
      "Very Good": { color: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
      Good: { color: "bg-amber-50 text-amber-700 border border-amber-100" },
      Average: { color: "bg-orange-50 text-orange-700 border border-orange-100" },
    };
    const config = performanceConfig[performance] || performanceConfig.Good;
    return (
      <span
        className={`px-2 py-0.5 inline-flex text-[10px] font-extrabold leading-5 rounded-full border ${config.color}`}
      >
        {performance}
      </span>
    );
  };

  // Toast notification component
  const Toast = ({ message, type }) => {
    useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div
        className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
      >
        {message}
      </div>
    );
  };

  // View certificate
  const handleView = (certificate) => {
    const mappedCertificate = {
      employeeName: certificate.name || certificate.employeeName || "",
      employeeId: certificate.employeeId || certificate.id || "",
      position: certificate.postApplied || certificate.position || "",
      department: certificate.department || "",
      startDate: certificate.startDate || certificate.joinDate || "",
      endDate:
        certificate.endDate ||
        certificate.resignDate ||
        new Date().toISOString().split("T")[0],
      workDuration: certificate.monthsWorked
        ? `${certificate.monthsWorked} months`
        : "N/A",
      performance: certificate.performance || "Excellent",
      reasonForLeaving: certificate.reasonForLeaving || "Resignation",
      issuedDate:
        certificate.issuedDate || new Date().toISOString().split("T")[0],
      id: certificate.id,
    };

    setSelectedCertificate(mappedCertificate);
    setShowViewModal(true);
  };

  // Edit certificate
  const handleEdit = (certificate) => {
    const mappedCertificate = {
      id: certificate.id,
      employeeName: certificate.name || "",
      employeeId: certificate.id || "",
      position: certificate.postApplied || "",
      department: certificate.department || "",
      startDate: certificate.joinDate || "",
      endDate: certificate.resignDate || new Date().toISOString().split("T")[0],
      workDuration: certificate.monthsWorked
        ? `${certificate.monthsWorked} months`
        : "N/A",
      performance: certificate.performance || "",
      reasonForLeaving: certificate.reasonForLeaving || "",
      status: certificate.status || "Pending",
      issuedDate: certificate.issuedDate || "",
    };

    setSelectedCertificate(mappedCertificate);
    setEditForm(mappedCertificate);
    setShowEditModal(true);
  };
  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedCertificate?.id) {
        alert("No certificate selected");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/${selectedCertificate.id}`,
        editForm,
      );

      alert("✅ Certificate updated successfully!");
      setShowEditModal(false);
      fetchCertificates(); // refresh list
    } catch (error) {
      console.error(" Error updating certificate:", error);
      alert("Failed to update certificate");
    }
  };
  // Handle create form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates`,
        newCertificate,
      );

      if (response.status === 201) {
        setToast({
          message: "Certificate created successfully",
          type: "success",
        });
        setShowCreateModal(false);
        setNewCertificate({
          employeeName: "",
          employeeId: "",
          position: "",
          department: "",
          startDate: "",
          endDate: "",
          workDuration: "",
          reasonForLeaving: "Resignation",
          performance: "Excellent",
          issuedDate: new Date().toISOString().split("T")[0],
        }); // reset form
        fetchCertificates(); // refresh the list
      }
    } catch (err) {
      console.error("Error creating certificate:", err);
      setToast({ message: "Failed to create certificate", type: "error" });
    }
  };

  const generateAutoCertificates = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/generate`,
        {},
      );
      Swal.fire({
        title: "Success!",
        text:
          res.data.message || `${res.data.inserted} certificates generated.`,
        icon: "success",
      });
      fetchCertificates(); // refresh table
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    }
  };
  // Send certificate
  // const handleSend = async (certificate) => {
  //   try {
  //     const certificateElement = document.getElementById('certificate-content');

  //     if (!certificateElement) {
  //       setToast({ message: 'Please open the certificate first to send it', type: 'error' });
  //       return;
  //     }

  //     const canvas = await html2canvas(certificateElement, { scale: 2 });
  //     const imgData = canvas.toDataURL('image/png');

  //     const pdf = new jsPDF({
  //       orientation: 'portrait',
  //       unit: 'pt',
  //       format: 'a4'
  //     });
  //     const imgProps = pdf.getImageProperties(imgData);
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  //     const pdfBase64 = pdf.output('datauristring').split(',')[1];

  //     await axios.post('http://localhost:5000/api/experience-certificates/send-mail', {
  //       employeeEmail: certificate.email,
  //       employeeName: certificate.employeeName,
  //       certificateText: `Dear ${certificate.employeeName}, please find attached your experience certificate.`,
  //       pdfBuffer: pdfBase64
  //     });

  //     setToast({ message: `Experience certificate sent to ${certificate.employeeName}`, type: 'success' });
  //   } catch (err) {
  //     console.error(err);
  //     setToast({ message: 'Failed to send certificate', type: 'error' });
  //   }
  // };

  const handleSend = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/send/${selectedCertificate.id}`,
      );
      Swal.fire("Success", res.data.message, "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to send email",
        "error",
      );
    }
  };

  // Issue certificate
  const handleIssue = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/issue/${selectedEmployee.id}`,
        {
          startDate: selectedEmployee.joinDate,
          endDate: selectedEmployee.endDate, // or resignDate
          experience: calculatedMonths,
        },
      );

      Swal.fire("Success", res.data.message, "success");
    } catch (err) {
      Swal.fire("Error", "Failed to save certificate", "error");
    }
  };
  const generateCertificate = async (employeeId) => {
    const res = await axios.get(
      `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/generate-certificate/${employeeId}`,
    );

    setCertificateData(res.data.data);
    setCertificateId(res.data.certificateId);
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "ID,Employee Name,Employee ID,Position,Department,Start Date,End Date,Duration,Status,Performance",
    ];
    const rows = filteredData.map(
      (cert) =>
        `${cert.id},${cert.employeeName},${cert.employeeId},${cert.position},${cert.department},${cert.startDate},${cert.endDate},${cert.workDuration},${cert.status},${cert.performance}`,
    );
    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "experience_certificates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: "Data exported successfully", type: "success" });
  };

  const issueCertificate = async (id, startDate, endDate) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificate/issue/${id}`,
        {
          startDate,
          endDate,
        },
      );

      alert("Certificate issued successfully!");
      fetchCertificates();
    } catch (err) {
      console.error(err);
      alert("Failed to issue certificate!");
    }
  };

  const sendCertificate = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificate/send/${id}`,
      );
      alert("Certificate emailed to employee!");
      fetchCertificates();
    } catch (err) {
      console.error(err);
      alert("Failed to send certificate!");
    }
  };

  // Download experience certificate
  const handleDownloadCertificate = async () => {
    if (!selectedCertificate) return;

    const certificateElement = document.getElementById("certificate-content");

    const canvas = await html2canvas(certificateElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedCertificate.employeeName}_Experience_Certificate.pdf`);
  };

  const sendCertificateToEmail = async () => {
    const certificateDiv = document.getElementById("certificate-content");
    if (!certificateDiv) return alert("Certificate content not found");

    const canvas = await html2canvas(certificateDiv);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, width, height);

    const base64PDF = pdf.output("datauristring").split(",")[1];

    try {
      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/experience-certificates/store-and-send`,
        {
          certificateId: selectedCertificate.id,
          employeeEmail:
            selectedCertificate.personalEmail ||
            selectedCertificate.officeEmail,
          certificateBase64: base64PDF,
        },
      );

      alert("✅ Certificate emailed successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send email");
    }
  };

  // Calculate work duration
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;

    const yearsPart =
      totalMonths >= 12
        ? `${Math.floor(totalMonths / 12)} year${Math.floor(totalMonths / 12) > 1 ? "s" : ""}`
        : "";
    const monthsPart =
      totalMonths % 12 > 0
        ? `${totalMonths % 12} month${totalMonths % 12 > 1 ? "s" : ""}`
        : "";

    return yearsPart && monthsPart
      ? `${yearsPart} ${monthsPart}`
      : yearsPart || monthsPart || "0 months";
  };

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (newCertificate.startDate && newCertificate.endDate) {
      const duration = calculateDuration(
        newCertificate.startDate,
        newCertificate.endDate,
      );
      setNewCertificate((prev) => ({ ...prev, workDuration: duration }));
    }
  }, [newCertificate.startDate, newCertificate.endDate]);

  return (
    <div className="crm-module-root app-shell font-sans">
      <div className="mx-auto max-w-7xl px-3 py-4 lg:px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="app-title max-w-3xl">
              Experience Certificate Management
            </h1>
            <p className="app-subtitle mt-1">
              Manage and track all experience certificates
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleExport}
              className="app-btn-secondary flex items-center justify-center gap-2 cursor-pointer text-xs py-2 px-4"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer text-xs py-2 px-4"
            >
              <Plus size={14} />
              <span>Create New Certificate</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="app-panel p-4 md:p-5 mb-6 bg-white border border-(--border-soft)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-xs font-bold text-(--text-strong) mb-1"
              >
                Search
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-faint)"
                  size={14}
                />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, employee ID, or position..."
                  className="app-input w-full pl-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="department"
                className="block text-xs font-bold text-(--text-strong) mb-1"
              >
                Department
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-faint)"
                  size={14}
                />
                <select
                  id="department"
                  className="app-input w-full pl-9 text-xs cursor-pointer"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-xs font-bold text-(--text-strong) mb-1"
              >
                Status
              </label>
              <select
                id="status"
                className="app-input w-full text-xs cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="issued">Issued</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="app-panel overflow-hidden border border-(--border-soft) bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-(--border-soft)">
              <thead>
                <tr className="bg-(--bg-subtle)/50">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)"
                  >
                    Position & Department
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)"
                  >
                    Employment Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)"
                  >
                    Performance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-soft)">
                {currentData.length > 0 ? (
                  currentData.map((certificate) => (
                    <tr
                      key={certificate.employeeId}
                      className="hover:bg-(--bg-subtle)/40 transition-colors"
                    >
                      {/* Employee Name + ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-extrabold text-[13px] text-(--text-strong)">
                            {certificate.employeeName || "N/A"}
                          </div>
                          <div className="text-[10px] font-bold text-(--text-soft)">
                            {certificate.email || "No Email"}
                          </div>
                        </div>
                      </td>

                      {/* Position & Department */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs text-(--text-strong) font-semibold">
                            {certificate.position || "N/A"}
                          </div>
                          <div className="text-[10px] font-bold text-(--text-soft)">
                            {certificate.department || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Employment Period */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-(--text-strong) font-semibold">
                          <div>
                            {certificate.startDate
                              ? new Date(
                                  certificate.startDate,
                                ).toLocaleDateString("en-GB")
                              : "N/A"}
                          </div>
                          <div className="text-[10px] font-bold text-(--text-soft)">
                            to{" "}
                            {certificate.endDate
                              ? new Date(
                                  certificate.endDate,
                                ).toLocaleDateString("en-GB")
                              : "Present"}
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-(--text-strong) font-semibold">
                        <div>
                          {certificate.monthsWorked
                            ? `${certificate.monthsWorked} months`
                            : "N/A"}
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PerformanceBadge
                          performance={certificate.performance || "N/A"}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={certificate.status || "Pending"} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleView(certificate)}
                            className="text-(--brand) hover:text-(--brand-strong) p-1.5 rounded-lg hover:bg-(--brand-soft) transition-colors cursor-pointer"
                            title="View Certificate"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(certificate)}
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Certificate"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => sendCertificate(certificate.id)}
                            className="text-purple-600 hover:text-purple-900 p-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Send Certificate"
                          >
                            <Mail size={14} />
                          </button>

                          {certificate.status !== "issued" && (
                            <button
                              onClick={() => {
                                const startDate = prompt(
                                  "Enter Start Date (YYYY-MM-DD)",
                                );
                                const endDate = prompt(
                                  "Enter End Date (YYYY-MM-DD)",
                                );

                                if (startDate && endDate) {
                                  issueCertificate(
                                    certificate.id,
                                    startDate,
                                    endDate,
                                  );
                                }
                              }}
                              className="text-amber-600 hover:text-amber-900 p-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Issue Certificate"
                            >
                              <Send size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center bg-white">
                      <div className="text-(--text-soft) flex flex-col items-center justify-center">
                        <Search size={44} className="text-(--text-faint) mb-3" />
                        <p className="font-bold text-sm text-(--text-strong)">No experience certificates found</p>
                        <p className="text-xs text-(--text-soft) mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-(--bg-subtle)/35 border-t border-(--border-soft) flex flex-col sm:flex-row items-center justify-between">
            <div className="text-xs font-bold text-(--text-soft) mb-4 sm:mb-0">
              Showing <span className="text-(--text-strong)">{startIndex + 1}</span> to{" "}
              <span className="text-(--text-strong)">
                {Math.min(startIndex + entriesPerPage, filteredData.length)}
              </span>{" "}
              of <span className="text-(--text-strong)">{filteredData.length}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="p-2 rounded-xl border border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`w-9 h-9 rounded-xl border font-bold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      currentPage === page
                        ? "bg-(--brand) text-white border-(--brand) shadow-sm shadow-(--brand-soft)"
                        : "bg-white border-(--border-soft) text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong)"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                className="p-2 rounded-xl border border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* View Modal with Certificate Design */}
        {showViewModal && selectedCertificate && (
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="app-modal p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-(--border-soft)">
                <h2 className="modal-title">Experience Certificate</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="app-icon-button p-1.5 hover:bg-(--bg-subtle) text-(--text-soft) hover:text-(--text-strong) cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Certificate Content */}
              <div
                id="certificate-content"
                style={{
                  backgroundColor: "#ffffff",
                  color: "var(--text-body)",
                  padding: "32px",
                  boxShadow: "0 4px 20px rgba(0, 166, 81, 0.08)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-soft)",
                }}
              >
                {/* Certificate Header */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        backgroundColor: "var(--brand-soft)",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid var(--border-strong)",
                      }}
                    >
                      <Building style={{ color: "var(--brand)" }} size={32} />
                    </div>
                  </div>
                  <h1
                    style={{
                      fontSize: "2rem",
                      fontWeight: "800",
                      color: "var(--text-strong)",
                      marginBottom: "8px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    EXPERIENCE CERTIFICATE
                  </h1>
                  <div
                    style={{
                      width: "80px",
                      height: "4px",
                      backgroundColor: "var(--brand)",
                      margin: "0 auto",
                      borderRadius: "2px",
                    }}
                  ></div>
                </div>

                {/* Certificate Body */}
                <div
                  style={{
                    color: "var(--text-body)",
                    lineHeight: "1.8",
                    textAlign: "center",
                    marginBottom: "32px",
                  }}
                >
                  <p style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--text-soft)" }}>
                    This is to certify that
                  </p>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "800",
                      color: "var(--brand-strong)",
                      marginBottom: "8px",
                    }}
                  >
                    {selectedCertificate.employeeName}
                  </h2>
                  <p style={{ color: "var(--text-faint)", fontSize: "0.875rem", marginBottom: "20px" }}>
                    Employee ID: {selectedCertificate.employeeId}
                  </p>

                  <p style={{ marginBottom: "16px" }}>
                    was employed with <strong>Cloudsat Private Limited</strong>{" "}
                    from{" "}
                    <strong>
                      {new Date(
                        selectedCertificate.startDate,
                      ).toLocaleDateString("en-CA")}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {new Date(selectedCertificate.endDate).toLocaleDateString(
                        "en-CA",
                      )}
                    </strong>
                    .
                  </p>
                  <p style={{ marginBottom: "16px" }}>
                    as a <strong>{selectedCertificate.position}</strong> in the{" "}
                    <strong>{selectedCertificate.department}</strong>{" "}
                    Department.
                  </p>

                  <p style={{ marginBottom: "16px" }}>
                    During their tenure of{" "}
                    <strong>{selectedCertificate.workDuration}</strong>,
                  </p>
                  <p style={{ marginBottom: "16px" }}>
                    {(selectedCertificate?.employeeName || "").split(" ")[0]}{" "}
                    demonstrated{" "}
                    <strong style={{ color: "var(--brand-strong)" }}>
                      {(selectedCertificate?.performance || "").toLowerCase()}
                    </strong>{" "}
                    performance and made significant contributions to our
                    organization.
                  </p>

                  {selectedCertificate.certificateDetails && (
                    <p style={{ fontStyle: "italic", marginBottom: "16px", color: "var(--text-soft)", background: "var(--bg-subtle)", padding: "12px", borderRadius: "8px" }}>
                      "{selectedCertificate.certificateDetails}"
                    </p>
                  )}

                  <p style={{ marginBottom: "8px" }}>
                    {(selectedCertificate?.employeeName || "").split(" ")[0]}{" "}
                    left our organization due to{" "}
                    <strong>
                      {(
                        selectedCertificate?.reasonForLeaving || ""
                      ).toLowerCase()}
                    </strong>
                    .
                  </p>
                  <p>We wish them the very best in their future endeavors.</p>
                </div>

                {/* Certificate Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: "32px",
                    paddingTop: "20px",
                    borderTop: "1px solid var(--border-soft)",
                    fontSize: "0.9rem",
                  }}
                >
                  <div>
                    <p style={{ color: "var(--text-soft)" }}>
                      Date:{" "}
                      <strong>
                        {selectedCertificate.issuedDate
                          ? new Date(
                              selectedCertificate.issuedDate,
                            ).toLocaleDateString("en-CA")
                          : new Date().toLocaleDateString("en-CA")}
                      </strong>
                    </p>
                    <p style={{ color: "var(--text-faint)", fontSize: "0.8rem", marginTop: "4px" }}>
                      Certificate No: EC-{selectedCertificate.employeeId}-
                      {selectedCertificate.id}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: "700", color: "var(--text-strong)" }}>[Authorized Signatory]</p>
                    <p style={{ color: "var(--text-soft)", fontSize: "0.85rem" }}>Human Resources Department</p>
                    <p style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>Cloudsat PVT LTD</p>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "24px",
                    fontSize: "0.75rem",
                    color: "var(--text-faint)",
                  }}
                >
                  <p>This is a computer-generated certificate.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-(--border-soft)">
                <button
                  onClick={handleDownloadCertificate}
                  className="app-btn-primary flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Certificate</span>
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="app-btn-secondary cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedCertificate && (
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="app-modal p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-(--border-soft)">
                <h2 className="modal-title">Edit Experience Certificate</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="app-icon-button p-1.5 hover:bg-(--bg-subtle) text-(--text-soft) hover:text-(--text-strong) cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="app-label block mb-1.5">Employee Name</label>
                    <input
                      type="text"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={editForm.employeeName || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          employeeName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Employee ID</label>
                    <input
                      type="text"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={editForm.employeeId || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, employeeId: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Position</label>
                    <input
                      type="text"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={editForm.position || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, position: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Department</label>
                    <input
                      type="text"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={editForm.department || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, department: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Start Date</label>
                    <input
                      type="date"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={editForm.startDate || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">End Date</label>
                    <input
                      type="date"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={editForm.endDate || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Duration</label>
                    <input
                      type="text"
                      className="app-input w-full px-4 py-2 text-[13px] bg-(--bg-subtle)/50"
                      value={editForm.workDuration || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Reason for Leaving</label>
                    <input
                      type="text"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={editForm.reasonForLeaving || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          reasonForLeaving: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Performance</label>
                    <select
                      className="app-input w-full px-4 py-2 text-[13px] bg-white cursor-pointer"
                      value={editForm.performance || "Excellent"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          performance: e.target.value,
                        })
                      }
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Outstanding">Outstanding</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                    </select>
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Issued Date</label>
                    <input
                      type="date"
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={
                        editForm.issuedDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        setEditForm({ ...editForm, issuedDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="app-label block mb-1.5">Certificate Details</label>
                  <textarea
                    className="app-input w-full px-4 py-2 text-[13px]"
                    rows="4"
                    value={editForm.certificateDetails || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        certificateDetails: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-(--border-soft)">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="app-btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="app-btn-primary cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create New Certificate Modal */}
        {showCreateModal && (
          <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="app-modal p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-(--border-soft)">
                <h2 className="modal-title">Create New Experience Certificate</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="app-icon-button p-1.5 hover:bg-(--bg-subtle) text-(--text-soft) hover:text-(--text-strong) cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="app-label block mb-1.5">Employee Name *</label>
                    <input
                      type="text"
                      required
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={newCertificate.employeeName}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          employeeName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Employee ID *</label>
                    <input
                      type="text"
                      required
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={newCertificate.employeeId}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          employeeId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Position *</label>
                    <input
                      type="text"
                      required
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={newCertificate.position}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          position: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Department *</label>
                    <input
                      type="text"
                      required
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={newCertificate.department}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          department: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Start Date *</label>
                    <input
                      type="date"
                      required
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={newCertificate.startDate}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">End Date *</label>
                    <input
                      type="date"
                      required
                      className="app-input w-full px-4 py-2 text-[13px]"
                      value={newCertificate.endDate}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Work Duration</label>
                    <input
                      type="text"
                      className="app-input w-full px-4 py-2 text-[13px] bg-(--bg-subtle)/50"
                      value={newCertificate.workDuration}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="app-label block mb-1.5">Performance</label>
                    <select
                      className="app-input w-full px-4 py-2 text-[13px] bg-white cursor-pointer"
                      value={newCertificate.performance}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          performance: e.target.value,
                        })
                      }
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Outstanding">Outstanding</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="app-label block mb-1.5">Reason for Leaving</label>
                    <select
                      className="app-input w-full px-4 py-2 text-[13px] bg-white cursor-pointer"
                      value={newCertificate.reasonForLeaving}
                      onChange={(e) =>
                        setNewCertificate({
                          ...newCertificate,
                          reasonForLeaving: e.target.value,
                        })
                      }
                    >
                      <option value="Resignation">Resignation</option>
                      <option value="Career Growth">Career Growth</option>
                      <option value="Personal Reasons">Personal Reasons</option>
                      <option value="Relocation">Relocation</option>
                      <option value="Higher Education">Higher Education</option>
                      <option value="Better Opportunity">Better Opportunity</option>
                      <option value="Career Change">Career Change</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="app-label block mb-1.5">Certificate Details</label>
                  <textarea
                    className="app-input w-full px-4 py-2 text-[13px]"
                    rows="4"
                    placeholder="Describe the employee's contributions, achievements, and performance..."
                    value={newCertificate.certificateDetails}
                    onChange={(e) =>
                      setNewCertificate({
                        ...newCertificate,
                        certificateDetails: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-(--border-soft)">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="app-btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="app-btn-primary cursor-pointer"
                  >
                    Create Certificate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default ExperienceCertificateManagement;
