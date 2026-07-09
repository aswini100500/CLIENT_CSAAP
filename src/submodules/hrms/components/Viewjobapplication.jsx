import {
  ArrowLeft,
  Download,
  FileText,
  User,
  Image,
  FileCheck,
  Eye,
  X,
  FileSearch,
  Aperture,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import useAuth from "../../../hooks/useAuth";

const API_URL = `${import.meta.env.VITE_HRMS_BASE_URL}`;

// Move getFileType function outside the main component to make it accessible
const getFileType = (fileUrl) => {
  if (!fileUrl) return null;

  // Check if it's an image URL
  if (fileUrl.includes('unsplash.com') || fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return 'image';
  } else if (fileUrl.match(/\.pdf$/i) || fileUrl.includes('pdf')) {
    return 'pdf';
  } else if (fileUrl.match(/\.(doc|docx)$/i)) {
    return 'document';
  }
  return 'unknown';
};

// Document Card Component
const DocumentCard = ({ document, onPreview, onDownload, showLabel, getFileName }) => {
  const fileType = document.file ? getFileType(document.file) : '';
  const fileName = getFileName ? getFileName(document.file, document.type) : 'document';

  const getFileExtension = (fileUrl) => {
    if (!fileUrl) return 'Unknown';
    if (fileUrl.includes('unsplash.com') || fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return 'IMAGE';
    } else if (fileUrl.match(/\.pdf$/i) || fileUrl.includes('pdf')) {
      return 'PDF';
    } else if (fileUrl.match(/\.(doc|docx)$/i)) {
      return 'DOC';
    }
    return 'FILE';
  };

  return (
    <div className="app-panel border border-(--border-soft) rounded-xl p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {document.icon}
          {showLabel && (
            <h4 className="font-medium text-(--text-strong)">{document.label}</h4>
          )}
        </div>
        <span className="text-xs bg-(--bg-subtle) text-(--text-soft) px-2 py-1 rounded-lg capitalize">
          {getFileExtension(document.file).toLowerCase()}
        </span>
      </div>

      <div className="text-xs text-(--text-soft) mb-3 truncate" title={fileName}>
        📄 {fileName}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPreview(document)}
          className="app-btn-primary flex-1 flex items-center justify-center gap-2 py-2! text-sm cursor-pointer"
        >
          <Eye size={14} />
          View
        </button>
        <button
          onClick={() => onDownload(
            document.file,
            `${document.label}_${fileName}`
          )}
          className="app-btn-secondary flex-1 flex items-center justify-center gap-2 py-2! text-sm cursor-pointer"
        >
          <Download size={14} />
          Download
        </button>
      </div>
    </div>
  );
};

const ViewJobApplication = ({ employeeId, employeeData, onClose }) => {
  const [employee, setEmployee] = useState(employeeData || null);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [dailyWorkReports, setDailyWorkReports] = useState([]);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [viewText, setViewText] = useState(null);
  const [viewTitle, setViewTitle] = useState("");

  const { user } = useAuth();
  const slug = user?.slug || employeeData?.company_slug || "";

  useEffect(() => {
    setEmployee(employeeData || null);
    setError(employeeData || employeeId ? null : "Employee data could not be found.");
  }, [employeeData, employeeId]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!employeeId || !slug) return;

      try {
        setLoadingReports(true);

        const currentMonth = new Date().toISOString().slice(0, 7);

        // Daily reports
        const dailyRes = await axios.get(
          `${API_URL}/api/attendance/${slug}?month=${currentMonth}`
        );

        if (dailyRes.data?.success) {
          const filtered = dailyRes.data.data.filter(
            (item) => item.employee_id === employeeId
          );
          setDailyWorkReports(filtered);
        }

        // Monthly reports
        const monthlyRes = await axios.get(
          `${API_URL}/api/monthly-reports/${slug}/employee/${employeeId}`
        );

        setMonthlyReports(
          Array.isArray(monthlyRes.data) ? monthlyRes.data : []
        );

      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoadingReports(false);
      }
    };

    if (activeSection === "daily" || activeSection === "monthly") {
      fetchReports();
    }
  }, [employeeId, activeSection, slug]);

  const parseJSON = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleViewText = (title, text) => {
    setViewTitle(title);
    setViewText(text);
  };

  const closeViewText = () => {
    setViewText(null);
    setViewTitle("");
  };

  // Parse documents from database
  const parseDocuments = () => {
    try {
      if (!employee) return {};

      const directFiles = {
        photo: employee.photo || employee.profile_photo,
        aadhar: employee.aadhar,
        pan: employee.pan,
        cv: employee.cv || employee.resume || employee.resume_url,
        experienceCertificate: employee.experienceCertificate,
        relievingLetter: employee.relievingLetter,
        educationalCertificates: employee.educationalCertificates ?
          (Array.isArray(employee.educationalCertificates)
            ? employee.educationalCertificates
            : employee.educationalCertificates.split(',').filter(Boolean)
          ) : [],
        termsAndConditions: employee.termandconditionCertificates
      };

      let jsonDocuments = {};
      if (employee.documents) {
        try {
          jsonDocuments = typeof employee.documents === "string"
            ? JSON.parse(employee.documents)
            : employee.documents;
        } catch (e) {
          console.error("Invalid documents JSON:", e);
        }
      }

      return { ...directFiles, ...jsonDocuments };
    } catch (e) {
      console.error("Error parsing documents:", e);
      return {};
    }
  };

  const documents = parseDocuments();

  const documentCategories = [
    {
      title: "Personal Documents",
      icon: <User size={20} />,
      documents: [
        {
          type: "photo",
          label: "Photograph",
          icon: <Image size={20} />,
          file: documents.photo,
          acceptedTypes: ["image/jpeg", "image/png", "image/jpg"]
        },
        {
          type: "aadhar",
          label: "Aadhar Card",
          icon: <FileCheck size={20} />,
          file: documents.aadhar,
          acceptedTypes: ["application/pdf", "image/jpeg", "image/png"]
        },
        {
          type: "pan",
          label: "PAN Card",
          icon: <FileCheck size={20} />,
          file: documents.pan,
          acceptedTypes: ["application/pdf", "image/jpeg", "image/png"]
        }
      ]
    },
    {
      title: "Professional Documents",
      icon: <FileText size={20} />,
      documents: [
        {
          type: "cv",
          label: "CV/Resume",
          icon: <FileText size={20} />,
          file: documents.cv,
          acceptedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        },
        {
          type: "experienceCertificate",
          label: "Experience Certificate",
          icon: <FileCheck size={20} />,
          file: documents.experienceCertificate,
          acceptedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"]
        },
        {
          type: "relievingLetter",
          label: "Relieving Letter",
          icon: <FileCheck size={20} />,
          file: documents.relievingLetter,
          acceptedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"]
        }
      ]
    },
    {
      title: "Educational Documents",
      icon: <Aperture size={20} />,
      documents: [
        {
          type: "educationalCertificates",
          label: "Educational Certificates",
          icon: <FileSearch size={20} />,
          files: Array.isArray(documents.educationalCertificates)
            ? documents.educationalCertificates
            : (documents.educationalCertificates ? [documents.educationalCertificates] : []),
          isMultiple: true,
          acceptedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"]
        }
      ]
    },
    {
      title: "HR Documents",
      icon: <FileCheck size={20} />,
      documents: [
        {
          type: "termsAndConditions",
          label: "Terms & Conditions",
          icon: <FileCheck size={20} />,
          file: documents.termsAndConditions,
          acceptedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"]
        }
      ]
    }
  ];

  const applicationData = {
    id: employee.id,
    name: employee.name,
     phone: employee.phone,
         email: employee.email,
    officeEmail: employee.officeEmail,
        gender: employee.gender,
    aadharNo: employee.aadharNo,
    panNo: employee.panNo,
    // company: employee.company,
    postApplied: employee.postApplied,
    storeAssign: employee.storeAssign,
    employeeStatus: employee.employeeStatus,

    maritalStatus: employee.maritalStatus || "N/A",
    dob: employee.dob ? new Date(employee.dob).toLocaleDateString() : "N/A",
    marriageDate: employee.marriageDate
      ? new Date(employee.marriageDate).toLocaleDateString()
      : "N/A",
    joinDate: employee.joinDate
      ? new Date(employee.joinDate).toLocaleDateString()
      : "N/A",
    employeeShift: employee.employeeShift || "N/A",
    salary: employee.salary || "N/A",
    bloodGroup: employee.blood_group || "N/A",
    epfoId: employee.epfo_id || "N/A",
    status: employee.status || "N/A"
  };

  const handleDownload = async (fileUrl, fileName) => {
    const url = fileUrl.startsWith("http")
      ? fileUrl
      : `${API_URL}/uploads/${fileUrl}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || url.split("/").pop();
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (document) => {
    if (document.isMultiple) {
      if (document.files.length > 0) {
        setSelectedDocument(document);
        setPreviewUrl(document.files[0]);
        setPreviewType(getFileType(document.files[0]));
      }
    } else {
      setSelectedDocument(document);
      setPreviewUrl(
        document.file?.startsWith("http")
          ? document.file
          : document.file ? `${API_URL}/uploads/${document.file}` : null
      );
      setPreviewType(getFileType(document.file));
    }
  };

  const getFileIcon = (fileUrl) => {
    const type = getFileType(fileUrl);
    switch (type) {
      case 'image': return <Image size={16} className="text-green-600" />;
      case 'pdf': return <FileText size={16} className="text-red-600" />;
      case 'document': return <FileText size={16} className="text-blue-600" />;
      default: return <FileText size={16} className="text-(--text-soft)" />;
    }
  };

  const getFileName = (fileUrl, documentType) => {
    if (!fileUrl) return 'No file';
    const baseName = fileUrl.split('/').pop();
    if (baseName.includes('dummy.pdf')) {
      return `${documentType.replace(/([A-Z])/g, ' $1').trim()}.pdf`;
    }
    return baseName;
  };

  const closePreview = () => {
    setSelectedDocument(null);
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const renderPreview = () => {
    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-(--bg-subtle) rounded-xl">
          <FileText size={48} className="text-(--text-soft) mb-4" />
          <p className="text-(--text-soft)">No preview available</p>
        </div>
      );
    }

    switch (previewType) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-96 object-contain rounded-xl" />
          </div>
        );
      case 'pdf':
        return (
          <div className="w-full h-96">
            <iframe src={previewUrl} className="w-full h-full border border-(--border-soft) rounded-xl" title="PDF Preview" />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-(--bg-subtle) rounded-xl">
            <FileText size={48} className="text-(--text-soft) mb-4" />
            <button onClick={() => handleDownload(previewUrl)} className="app-btn-primary mt-4 cursor-pointer">
              Download File
            </button>
          </div>
        );
    }
  };

  const hasDocuments = documentCategories.some(cat =>
    cat.documents.some(doc => doc.isMultiple ? doc.files.length > 0 : doc.file)
  );

  const Info = ({ label, value }) => (
    <div className="app-panel border border-(--border-soft) rounded-xl p-4 hover:shadow-sm transition-all duration-200">
      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft) mb-1">{label}</label>
      <p className="text-sm text-(--text-strong) font-medium">{value || "N/A"}</p>
    </div>
  );

  const Th = ({ children }) => (
    <th className="px-5 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">{children}</th>
  );

  const Td = ({ children }) => (
    <td className="px-5 py-4 text-sm text-(--text-strong)">{children}</td>
  );

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center app-modal-backdrop">
        <div className="app-modal p-8 max-w-md w-full mx-4 text-center">
          <X size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="modal-title mb-2">Error Loading Data</h3>
          <p className="text-(--text-soft) mb-6">{error}</p>
          <button onClick={onClose} className="app-btn-primary px-6 cursor-pointer">Go Back</button>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto p-4 md:p-6 app-modal-backdrop">
      <div className="app-modal max-w-6xl w-full mx-auto my-10 p-0! overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-(--border-soft) bg-linear-to-r from-white to-(--bg-subtle)">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-(--text-soft) hover:bg-(--bg-subtle) rounded-xl transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-xl font-semibold text-(--text-strong)">Employee Details - {employee.name}</h2>
            <p className="text-sm text-(--text-soft) mt-1">ID: {employee.id} • Status: {employee.status || "Active"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-(--border-soft)">
          <nav className="flex overflow-x-auto">
            {[
              { id: "basic", label: "Basic Information" },
              { id: "education", label: "Education" },
              { id: "experience", label: "Experience" },
              { id: "documents", label: "Documents" },
              { id: "monthly", label: "Monthly Report" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 min-w-max px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                  activeSection === tab.id
                    ? "border-(--brand) text-(--brand) bg-(--bg-subtle)"
                    : "border-transparent text-(--text-soft) hover:text-(--text-strong) hover:bg-(--bg-subtle)/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {activeSection === "basic" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(applicationData).map(([key, val]) => (
                <Info key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={val} />
              ))}
            </div>
          )}

          {activeSection === "education" && (
            <div className="p-6">
              <div className="app-panel overflow-hidden border border-(--border-soft) rounded-xl">
                <table className="min-w-full divide-y divide-(--border-soft)">
                  <thead className="bg-(--bg-subtle)">
                    <tr><Th>Course</Th><Th>Board</Th><Th>Passing Year</Th><Th>Institute</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-(--border-soft)">
                    {parseJSON(employee.education).map((edu, i) => (
                      <tr key={i} className="hover:bg-(--bg-subtle)/70 transition-all duration-200"><Td>{edu.course}</Td><Td>{edu.board}</Td><Td>{edu.passingYear}</Td><Td>{edu.institute}</Td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "experience" && (
            <div className="p-6">
              <div className="app-panel overflow-hidden border border-(--border-soft) rounded-xl">
                <table className="min-w-full divide-y divide-(--border-soft)">
                  <thead className="bg-(--bg-subtle)">
                    <tr><Th>Job Title</Th><Th>Company</Th><Th>Start Date</Th><Th>End Date</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-(--border-soft)">
                    {parseJSON(employee.experience).map((exp, i) => (
                      <tr key={i} className="hover:bg-(--bg-subtle)/70 transition-all duration-200"><Td>{exp.jobTitle}</Td><Td>{exp.company}</Td><Td>{exp.startDate}</Td><Td>{exp.endDate}</Td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "documents" && (
            <div className="p-6">
              {!hasDocuments ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-(--bg-subtle) rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSearch size={32} className="text-(--text-soft)" />
                  </div>
                  <p className="text-(--text-soft) font-medium">No documents uploaded.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {documentCategories.map((cat, i) => {
                    const docs = cat.documents.filter(d => d.isMultiple ? d.files.length > 0 : d.file);
                    if (docs.length === 0) return null;
                    return (
                      <div key={i} className="app-panel border border-(--border-soft) rounded-xl overflow-hidden">
                        <div className="bg-(--bg-subtle) p-4 border-b border-(--border-soft) font-semibold flex items-center gap-2 text-(--text-strong)">
                          {cat.icon}{cat.title}
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {docs.map((doc, j) => (
                            doc.isMultiple ? doc.files.map((f, k) => (
                              <DocumentCard key={`${j}-${k}`} document={{ ...doc, file: f }} onPreview={handlePreview} onDownload={handleDownload} showLabel={false} getFileName={getFileName} />
                            )) : <DocumentCard key={j} document={doc} onPreview={handlePreview} onDownload={handleDownload} showLabel={true} getFileName={getFileName} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )}

          {/* REDESIGNED MONTHLY REPORT SECTION */}
          {activeSection === "monthly" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-(--text-strong)">Monthly Performance Summaries</h2>
                  <p className="text-sm text-(--text-soft) mt-1">Monthly reports and performance reviews</p>
                </div>
                {loadingReports && (
                  <div className="flex items-center gap-2 text-(--brand) bg-(--bg-subtle) px-3 py-1.5 rounded-full border border-(--border-soft)">
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>

              {monthlyReports.length === 0 && !loadingReports ? (
                <div className="text-center py-16 bg-(--bg-subtle) rounded-xl border border-dashed border-(--border-soft)">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <FileSearch size={32} className="text-(--text-soft)" />
                  </div>
                  <p className="text-(--text-soft) font-medium">No monthly reports found</p>
                  <p className="text-sm text-(--text-soft)/70 mt-1">No submissions for this employee</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {monthlyReports.map((report, i) => (
                    <div key={i} className="group app-panel border border-(--border-soft) rounded-xl hover:shadow-lg hover:border-(--brand)/30 transition-all duration-200 overflow-hidden">
                      {/* Month Header with Status */}
                      <div className="relative">
                        <div className="absolute top-0 right-0 m-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm capitalize ${report.status?.toLowerCase() === "approved" ? "bg-green-100 text-green-700 border border-green-200" :
                              report.status?.toLowerCase() === "rejected" ? "bg-red-100 text-red-700 border border-red-200" :
                                "bg-amber-100 text-amber-700 border border-amber-200"
                            }`}>
                            {report.status?.toLowerCase() === "approved" ? <CheckCircle size={12} /> :
                              report.status?.toLowerCase() === "rejected" ? <XCircle size={12} /> : <AlertCircle size={12} />}
                            {report.status || "Pending"}
                          </span>
                        </div>
                        <div className="px-5 pt-5 pb-3" style={{ background: 'linear-gradient(135deg, hsl(var(--bg-subtle)), hsl(var(--brand) / 0.08))' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-(--border-soft)">
                              <Calendar size={24} className="text-(--brand)" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-(--text-strong)">
                                {report.month}/{report.year}
                              </div>
                              <div className="text-xs text-(--text-soft) mt-0.5">
                                Submitted: {report.submitted_on ? new Date(report.submitted_on).toLocaleDateString() : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description Section */}
                      <div className="p-5">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-(--text-strong) mb-2">
                            <FileText size={14} className="text-(--text-soft)" />
                            <span>Report Description</span>
                          </div>
                          <div className="bg-(--bg-subtle) rounded-xl p-3">
                            {report.description ? (
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm text-(--text-strong) leading-relaxed line-clamp-3 flex-1">
                                  {report.description}
                                </p>
                                <button
                                  onClick={() => handleViewText(`Monthly Report - ${report.month}/${report.year}`, report.description)}
                                  className="shrink-0 text-(--brand) hover:opacity-80 text-xs flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-(--border-soft) cursor-pointer transition-all duration-200"
                                >
                                  <Eye size={12} />
                                  View Full
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-(--text-soft) italic">No description provided</p>
                            )}
                          </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="flex items-center justify-between pt-2 text-xs text-(--text-soft) border-t border-(--border-soft) mt-2">
                          <span>Report ID: {report.id || '—'}</span>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Generated on {report.submitted_on ? new Date(report.submitted_on).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-(--border-soft) p-6 bg-(--bg-subtle) flex justify-end">
          <button onClick={onClose} className="app-btn-secondary px-6 cursor-pointer">Close</button>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 app-modal-backdrop">
          <div className="app-modal max-w-4xl w-full p-0! overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-(--border-soft)">
              <h3 className="modal-title">{selectedDocument.label}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(previewUrl)} className="app-btn-primary p-2! cursor-pointer"><Download size={20} /></button>
                <button onClick={closePreview} className="text-(--text-soft) hover:text-(--text-strong) transition-colors cursor-pointer p-2"><X size={20} /></button>
              </div>
            </div>
            <div className="p-6 overflow-auto">{renderPreview()}</div>
          </div>
        </div>
      )}
      {viewText && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 app-modal-backdrop">
          <div className="app-modal max-w-2xl w-full p-0! overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--border-soft)">
              <h3 className="modal-title">{viewTitle}</h3>
              <button
                onClick={closeViewText}
                className="text-(--text-soft) hover:text-(--text-strong) transition-colors cursor-pointer p-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-(--text-strong) whitespace-pre-wrap custom-scrollbar">
              {viewText}
            </div>

            {/* Footer */}
            <div className="border-t border-(--border-soft) p-4 flex justify-end bg-(--bg-subtle)">
              <button
                onClick={closeViewText}
                className="app-btn-secondary px-4 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobApplication;