import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  User,
  X,
  CheckCircle,
} from "lucide-react";

const ViewTermsConditions = ({ employee, onClose }) => {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultEmployee = {
    id: 1,
    name: "John Doe",
    position: "Software Engineer",
    email: "john.doe@company.com",
  };

  const currentEmployee = employee || defaultEmployee;

  useEffect(() => {
    if (currentEmployee && currentEmployee.id) {
      fetchTermsData();
    }
  }, [currentEmployee]);

  const fetchTermsData = () => {
    if (!currentEmployee || !currentEmployee.id) return;

    setLoading(true);

    setTimeout(() => {
      const storedTerms = JSON.parse(
        localStorage.getItem("employeeTerms") || "{}",
      );
      const employeeTerms = storedTerms[currentEmployee.id];

      setTermsData(employeeTerms || null);
      setLoading(false);
    }, 500);
  };

  const handleDownload = () => {
    if (termsData && currentEmployee) {
      const element = document.createElement("a");
      const file = new Blob(
        [
          `TERMS AND CONDITIONS ACCEPTANCE CERTIFICATE

Employee Information:
-------------------
Name: ${currentEmployee.name}
Position: ${currentEmployee.position}
Employee ID: ${currentEmployee.id}
Email: ${currentEmployee.email}

Acceptance Details:
------------------
Declaration: ${termsData.declaration}
Status: ${termsData.status}
Uploaded By: ${termsData.uploadedBy}
Uploaded At: ${new Date(termsData.uploadedAt).toLocaleString()}
Document: ${termsData.fileName}
File Size: ${termsData.fileSize}

HR Remarks:
-----------
${termsData.remarks || "No remarks provided"}

This certifies that the above-mentioned employee has accepted 
all terms and conditions of employment.

Generated on: ${new Date().toLocaleString()}
`,
        ],
        { type: "text/plain" },
      );

      element.href = URL.createObjectURL(file);
      const fileName = `terms_acceptance_${currentEmployee.name.replace(/\s+/g, "_")}_${currentEmployee.id}.txt`;
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📎";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    return "📎";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading terms data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Terms & Conditions Acceptance
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">
            Employee Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{currentEmployee.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Position:</span>
              <p className="font-medium">{currentEmployee.position}</p>
            </div>
            <div>
              <span className="text-gray-600">Employee ID:</span>
              <p className="font-medium">{currentEmployee.id}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p
                className={`font-medium ${termsData ? "text-green-600" : "text-yellow-600"}`}
              >
                {termsData ? "Accepted" : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {termsData ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Terms & Conditions Accepted
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Accepted Document
                </h3>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download Certificate
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl">
                  {getFileIcon(termsData.fileType)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">
                    {termsData.fileName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-700 mt-1">
                    <span>{termsData.fileSize}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(termsData.uploadedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      Uploaded by: {termsData.uploadedBy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Accepted Declaration
              </h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-gray-700 italic">
                  "{termsData.declaration}"
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Accepted on {new Date(termsData.uploadedAt).toLocaleString()}
              </p>
            </div>

            {termsData.remarks && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">HR Remarks</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {termsData.remarks}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Terms & Conditions Uploaded
            </h3>
            <p className="text-gray-500 mb-4">
              Terms and conditions acceptance document has not been uploaded for
              this employee.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Status:</strong> Pending acceptance
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Use the "Upload Terms Acceptance" action to record the
                employee's acceptance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTermsConditions;
