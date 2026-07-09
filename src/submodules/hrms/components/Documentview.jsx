import {
  Aperture,
  ArrowLeft,
  Download,
  Eye,
  FileCheck,
  FileSearch,
  FileText,
  Image,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";

// Move getFileType function outside the main component to make it accessible
const getFileType = (fileUrl) => {
  if (!fileUrl) return null;

  // Check if it's an image URL
  if (
    fileUrl.includes("unsplash.com") ||
    fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  ) {
    return "image";
  } else if (fileUrl.match(/\.pdf$/i) || fileUrl.includes("pdf")) {
    return "pdf";
  } else if (fileUrl.match(/\.(doc|docx)$/i)) {
    return "document";
  }
  return "unknown";
};

// Document Card Component - moved outside
const DocumentCard = ({
  document,
  onPreview,
  onDownload,
  showLabel,
  getFileName,
}) => {
  const fileType = document.file ? getFileType(document.file) : "";
  const fileName = getFileName
    ? getFileName(document.file, document.type)
    : "document";

  const getFileExtension = (fileUrl) => {
    if (!fileUrl) return "Unknown";
    if (
      fileUrl.includes("unsplash.com") ||
      fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      return "IMAGE";
    } else if (fileUrl.match(/\.pdf$/i) || fileUrl.includes("pdf")) {
      return "PDF";
    } else if (fileUrl.match(/\.(doc|docx)$/i)) {
      return "DOC";
    }
    return "FILE";
  };

  return (
    <div className="app-panel border border-(--border-soft) rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-(--brand)">{document.icon}</span>
          {showLabel && (
            <h4 className="font-bold text-[13px] text-(--text-strong)">{document.label}</h4>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase bg-(--bg-subtle) text-(--text-soft) px-2 py-0.5 rounded border border-(--border-soft)">
          {getFileExtension(document.file).toLowerCase()}
        </span>
      </div>

      <div className="text-[12px] text-(--text-soft) mb-3 truncate flex items-center gap-1.5 font-medium" title={fileName}>
        <span className="text-gray-400">📄</span> {fileName}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPreview(document)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-(--brand) hover:bg-(--brand-hover) text-white font-semibold rounded-lg transition-colors text-xs cursor-pointer shadow-sm shadow-(--brand-soft)"
        >
          <Eye size={13} />
          View
        </button>
        <button
          onClick={() =>
            onDownload(document.file, `${document.label}_${fileName}`)
          }
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-(--border-soft) text-(--text-strong) font-semibold rounded-lg hover:bg-(--bg-subtle) transition-colors text-xs cursor-pointer"
        >
          <Download size={13} />
          Download
        </button>
      </div>
    </div>
  );
};

const ViewEmployeeDocuments = ({ employee, onClose }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  if (!employee) return null;

  // Sample raw document data for testing
  const getSampleDocuments = () => {
    return {
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      aadhar:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      pan: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      cv: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      experienceCertificate:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      relievingLetter:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      educationalCertificates: [
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      ],
    };
  };

  // Use actual documents if available, otherwise use sample data
  const documents = employee.documents
    ? typeof employee.documents === "string"
      ? JSON.parse(employee.documents)
      : employee.documents
    : getSampleDocuments();

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
          acceptedTypes: ["image/jpeg", "image/png", "image/jpg"],
        },
        {
          type: "aadhar",
          label: "Aadhar Card",
          icon: <FileCheck size={20} />,
          file: documents.aadhar,
          acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
        },
        {
          type: "pan",
          label: "PAN Card",
          icon: <FileCheck size={20} />,
          file: documents.pan,
          acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
        },
      ],
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
          acceptedTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        },
        {
          type: "experienceCertificate",
          label: "Experience Certificate",
          icon: <FileCheck size={20} />,
          file: documents.experienceCertificate,
          acceptedTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
          ],
        },
        {
          type: "relievingLetter",
          label: "Relieving Letter",
          icon: <FileCheck size={20} />,
          file: documents.relievingLetter,
          acceptedTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
          ],
        },
      ],
    },
    {
      title: "Educational Documents",
      icon: <Aperture size={20} />,
      documents: [
        {
          type: "educationalCertificates",
          label: "Educational Certificates",
          icon: <FileSearch size={20} />,
          files: documents.educationalCertificates || [],
          isMultiple: true,
          acceptedTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
          ],
        },
      ],
    },
  ];

  const handleDownload = async (fileUrl, fileName) => {
    try {
      // For demo purposes, we'll simulate download
      console.log("Downloading:", fileUrl);

      // Create a temporary link for download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || fileUrl.split("/").pop();
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      alert(`Downloading ${fileName || "file"}...`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };

  const handlePreview = (document) => {
    if (document.isMultiple) {
      // For multiple files, preview the first one or show list
      if (document.files.length > 0) {
        setSelectedDocument(document);
        setPreviewUrl(document.files[0]);
        setPreviewType(getFileType(document.files[0]));
      }
    } else {
      setSelectedDocument(document);
      setPreviewUrl(document.file);
      setPreviewType(getFileType(document.file));
    }
  };

  const getFileIcon = (fileUrl) => {
    const type = getFileType(fileUrl);
    switch (type) {
      case "image":
        return <Image size={16} className="text-green-600" />;
      case "pdf":
        return <FileText size={16} className="text-red-600" />;
      case "document":
        return <FileText size={16} className="text-blue-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getFileName = (fileUrl, documentType) => {
    if (!fileUrl) return "No file";

    const baseName = fileUrl.split("/").pop();
    if (baseName.includes("dummy.pdf")) {
      return `${documentType.replace(/([A-Z])/g, " $1")}.pdf`;
    }
    return baseName;
  };

  const closePreview = () => {
    setSelectedDocument(null);
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const renderPreview = () => {
    if (!previewUrl) return null;

    switch (previewType) {
      case "image":
        return (
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );
      case "pdf":
        return (
          <div className="w-full h-96">
            <iframe
              src={previewUrl}
              className="w-full h-full border rounded-lg"
              title="PDF Preview"
            />
          </div>
        );
      case "document":
      case "unknown":
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
            <FileText size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Document Preview</p>
            <p className="text-sm text-gray-500 mb-4 text-center">
              {getFileName(previewUrl, selectedDocument?.type)}
            </p>
            <button
              onClick={() =>
                handleDownload(previewUrl, selectedDocument?.label)
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={16} />
              Download File
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const hasDocuments = documentCategories.some((category) =>
    category.documents.some((doc) =>
      doc.isMultiple ? doc.files.length > 0 : doc.file,
    ),
  );

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 overflow-auto p-4 md:p-6 flex items-start justify-center">
      <div className="app-modal max-w-6xl w-full my-10 border border-(--border-strong) shadow-xl bg-(--bg-panel-strong) flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-(--border-soft) bg-(--bg-subtle)/30 rounded-t-[22px]">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-(--text-soft) hover:text-(--text-strong) rounded-xl hover:bg-(--bg-subtle) border border-transparent hover:border-(--border-soft) transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span className="font-bold text-xs">Back</span>
            </button>
            <div>
              <h2 className="text-lg font-extrabold text-(--text-strong) tracking-tight">
                Employee Documents
              </h2>
              <p className="text-[11px] font-bold text-(--text-soft) mt-0.5">
                {employee.name} <span className="text-gray-300 mx-1.5">•</span> {employee.employeeId || employee.id}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 bg-(--bg-panel)">
          {!hasDocuments ? (
            <div className="text-center py-12 bg-white rounded-xl border border-(--border-soft) p-8 shadow-sm">
              <FileSearch size={44} className="mx-auto text-(--text-faint) mb-3" />
              <h3 className="text-base font-bold text-(--text-strong) mb-1.5">
                No Documents Available
              </h3>
              <p className="text-xs text-(--text-soft)">
                No documents have been uploaded for this employee yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {documentCategories.map((category, categoryIndex) => {
                const hasCategoryDocuments = category.documents.some((doc) =>
                  doc.isMultiple ? doc.files.length > 0 : doc.file,
                );

                if (!hasCategoryDocuments) return null;

                return (
                  <div
                    key={categoryIndex}
                    className="app-panel border border-(--border-soft) overflow-hidden shadow-sm bg-white"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-3 p-4 bg-(--bg-subtle)/40 border-b border-(--border-soft)">
                      <div className="text-(--brand) size-5 flex items-center justify-center">{category.icon}</div>
                      <h3 className="text-[14px] font-extrabold text-(--text-strong) tracking-tight">
                        {category.title}
                      </h3>
                    </div>

                    {/* Documents Grid */}
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.documents.map((doc, docIndex) => {
                          if (doc.isMultiple) {
                            if (doc.files.length === 0) return null;

                            return (
                              <div key={docIndex} className="col-span-full">
                                <h4 className="text-[13px] font-bold text-(--text-strong) mb-3 flex items-center gap-2">
                                  <span className="text-(--brand)">{doc.icon}</span>
                                  {doc.label} <span className="text-xs text-(--text-soft) font-normal">({doc.files.length} files)</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {doc.files.map((file, fileIndex) => (
                                    <DocumentCard
                                      key={fileIndex}
                                      document={{ ...doc, file }}
                                      onPreview={handlePreview}
                                      onDownload={handleDownload}
                                      showLabel={false}
                                      getFileName={getFileName}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          } else {
                            if (!doc.file) return null;

                            return (
                              <DocumentCard
                                key={docIndex}
                                document={doc}
                                onPreview={handlePreview}
                                onDownload={handleDownload}
                                showLabel={true}
                                getFileName={getFileName}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-(--border-soft) p-4 bg-(--bg-subtle)/35 rounded-b-[22px] flex justify-between items-center">
          <div className="text-xs text-(--text-soft) font-medium flex items-center gap-1.5">
            <span className="text-(--brand)">💡</span>
            <span>This is demo data. Real documents will appear when uploaded.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 border border-(--border-soft) text-(--text-strong) font-semibold rounded-xl hover:bg-(--bg-subtle) hover:border-(--border-strong) transition-colors text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="app-modal-backdrop fixed inset-0 z-70 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="app-modal max-w-4xl w-full max-h-[90vh] overflow-hidden border border-(--border-strong) bg-white shadow-2xl flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--border-soft) bg-(--bg-subtle)/30 rounded-t-[22px]">
              <div className="flex items-center gap-3">
                <div className="text-(--brand) size-5 flex items-center justify-center">
                  {selectedDocument.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-(--text-strong)">
                    {selectedDocument.label}
                  </h3>
                  <p className="text-[11px] font-bold text-(--text-soft) mt-0.5">
                    {employee.name} <span className="text-gray-300 mx-1.5">•</span> {getFileName(previewUrl, selectedDocument.type)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownload(
                      previewUrl,
                      `${selectedDocument.label}_${employee.name}.pdf`,
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-(--brand) hover:bg-(--brand-hover) text-white font-bold rounded-lg transition-colors text-xs cursor-pointer shadow-sm"
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  onClick={closePreview}
                  className="p-1.5 text-(--text-soft) hover:text-(--text-strong) rounded-lg hover:bg-(--bg-subtle) transition-all duration-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto bg-white custom-scrollbar flex-1">
              {renderPreview()}

              {/* Multiple files navigation */}
              {selectedDocument.isMultiple &&
                selectedDocument.files.length > 1 && (
                  <div className="mt-6 border-t border-(--border-soft) pt-4">
                    <h4 className="text-xs font-bold text-(--text-strong) mb-3 uppercase tracking-wider">
                      All Files
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedDocument.files.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setPreviewUrl(file);
                            setPreviewType(getFileType(file));
                          }}
                          className={`flex items-center gap-2 p-2 text-xs rounded-xl border transition-all duration-200 cursor-pointer font-bold ${
                            file === previewUrl
                              ? "border-(--brand) bg-(--brand-soft) text-(--brand)"
                              : "border-(--border-soft) hover:border-(--border-strong) bg-white text-(--text-soft) hover:text-(--text-strong)"
                          }`}
                        >
                          {getFileIcon(file)}
                          <span className="truncate">
                            Certificate {index + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEmployeeDocuments;
