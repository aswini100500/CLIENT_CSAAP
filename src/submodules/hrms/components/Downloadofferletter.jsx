import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ChevronLeft, Download, Mail, Printer } from "lucide-react";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DownloadOfferLetter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  const employee = location.state?.employee || {
    name: "ADMIN ADMIN",
    position: "",
    department: "",
    joinDate: "Date of Joining",
    refNumber: "January, 1970",
  };

  const [formData, setFormData] = useState({
    position: employee.position,
    department: employee.department,
    joinDate: employee.joinDate,
    refNumber: employee.refNumber,
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    if (imgHeight > pageHeight) {
      let heightLeft = imgHeight - pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save(`${employee.name.replace(/\s+/g, "_")}_Offer_Letter.pdf`);
  };

  const handleSendEmail = () => {
    alert("Email functionality would be implemented here");
  };

  // Get salutation based on name
  const getSalutation = (name) => {
    if (name.includes("Miss.")) return "Miss.";
    if (name.includes("Mrs.")) return "Mrs.";
    if (name.includes("Ms.")) return "Ms.";
    return "Mr.";
  };

  const getNameWithoutTitle = (name) => {
    return name.replace(/^(Miss\.|Mrs\.|Ms\.|Mr\.)\s*/i, "");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronLeft size={20} />
            <span>Back to List</span>
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer Letter</h1>
              <p className="text-gray-600 mt-1">
                Generate and manage employment offer letters
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer size={18} />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail size={18} />
                <span>Send via Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customize Offer Letter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                name="refNumber"
                value={formData.refNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., January, 1970"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Join Date
              </label>
              <input
                type="text"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Date of Joining"
              />
            </div>
          </div>
        </div>

        {/* Offer Letter Content */}
        <div
          ref={printRef}
          style={{
            backgroundColor: "#ffffff", // white background
            width: "800px",
            margin: "0 auto",
          }}
        >
          {/* Letterhead */}
          <div
            style={{
              backgroundColor: "#2563eb", // blue background
              color: "#ffffff", // white text
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              Embedded Design Solutions
            </h1>
            <p style={{ color: "#bfdbfe" }}>
              Innovating Tomorrow's Technology Today
            </p>
          </div>

          {/* Letter Content */}
          <div style={{ padding: "2rem", color: "#374151", lineHeight: "1.6" }}>
            {/* Reference Number */}
            <div style={{ textAlign: "right", marginBottom: "2rem" }}>
              Ref:{" "}
              <span style={{ fontWeight: "600" }}>{formData.refNumber}</span>
            </div>

            {/* Salutation */}
            <p>{getSalutation(employee.name)}</p>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
              {getNameWithoutTitle(employee.name)}
            </h2>

            {/* Letter Title */}
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                textAlign: "center",
                margin: "1rem 0 2rem",
              }}
            >
              Letter of Offer for Employment
            </h3>

            {/* Letter Body */}
            <p>
              Dear {getSalutation(employee.name)}{" "}
              {getNameWithoutTitle(employee.name)},
            </p>
            <p>
              Further to our recent discussions regarding employment with
              Embedded Design Solutions, we are pleased to make a formal offer
              of employment to you. You will be required to join the services of
              our organization on or before{" "}
              <span style={{ fontWeight: "600" }}>{formData.joinDate}</span>
              failing which this offer shall stand null and void. Following are
              the details of this offer of employment:
            </p>

            {/* Details Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                margin: "1.5rem 0",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "0.5rem",
                      fontWeight: "600",
                      width: "30%",
                    }}
                  >
                    Position:
                  </td>
                  <td
                    style={{ border: "1px solid #d1d5db", padding: "0.5rem" }}
                  >
                    {formData.position || "________________"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    Department:
                  </td>
                  <td
                    style={{ border: "1px solid #d1d5db", padding: "0.5rem" }}
                  >
                    {formData.department || "________________"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    Location:
                  </td>
                  <td
                    style={{ border: "1px solid #d1d5db", padding: "0.5rem" }}
                  >
                    1911A/18, Govindpuri Extension, Kalkaji, New Delhi - 110019
                  </td>
                </tr>
              </tbody>
            </table>

            <p>
              <span style={{ fontWeight: "600" }}>Gross Salary:</span> As per
              mutual discussion, it will be mentioned on your appointment letter
              which will be given on your joining. An appointment letter will be
              issued to you on your joining date with necessary terms and
              conditions of employment.
            </p>

            <p>
              You will be required to undergo medical tests which are essential
              for the pre-employment formalities. In case you are declared
              medically unfit, the Offer Letter issued to you will become null
              and void. Please submit below mentioned documents before Joining.
            </p>

            <p>
              We thank you for your interest in working with us. You are
              requested to send us your acceptance of this offer by signing the
              original and returning it to us at the earliest.
            </p>

            <p>
              We look forward to a mutually fulfilling professional association.
            </p>

            {/* Signature Area */}
            <div style={{ marginTop: "4rem" }}>
              <p>Thanking You</p>
              <p style={{ fontWeight: "600", marginTop: "1rem" }}>
                For{" "}
                <span style={{ color: "#2563eb" }}>
                  Embedded Design Solutions
                </span>
              </p>
              <div
                style={{
                  marginTop: "4rem",
                  borderTop: "1px solid #d1d5db",
                  width: "200px",
                }}
              ></div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>

        {/* Document Checklist */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Required Documents Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Educational Certificates</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Identity Proof (Aadhar/PAN)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Address Proof</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Passport Size Photographs</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">
                Previous Employment Experience Letters
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Medical Fitness Certificate</span>
            </label>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:p-0 {
              padding: 0 !important;
            }
            .bg-gradient-to-r {
              background: #2563eb !important;
            }
            button, .bg-gray-50 {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DownloadOfferLetter;
