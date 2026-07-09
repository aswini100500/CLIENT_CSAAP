import { Edit, Trash2, X } from "lucide-react";
import React, { useState } from "react";

const Reports = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [reports, setReports] = useState([
    {
      id: 1,
      reportName: "Monthly Construction Report",
      engineer: "John Doe",
      status: "Approved",
      description: "Monthly progress report for Building A construction",
      date: "2023-10-15",
    },
    {
      id: 2,
      reportName: "Structural Analysis",
      engineer: "Jane Smith",
      status: "Pending",
      description: "Structural integrity analysis for Project X",
      date: "2023-10-18",
    },
    {
      id: 3,
      reportName: "Budget Review",
      engineer: "Mike Johnson",
      status: "Rejected",
      description: "Q3 budget review and adjustments",
      date: "2023-10-05",
    },
  ]);

  const [formData, setFormData] = useState({
    engineer: "",
    reportName: "",
    description: "",
    file: null,
  });

  const engineers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mike Johnson" },
    { id: 4, name: "Sarah Williams" },
    { id: 5, name: "Robert Brown" },
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };

  // Submit form (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit && editingReportId) {
      // Update existing report
      setReports(
        reports.map((report) =>
          report.id === editingReportId
            ? {
                ...report,
                reportName: formData.reportName,
                engineer:
                  engineers.find(
                    (eng) => eng.id === parseInt(formData.engineer)
                  )?.name || "",
                description: formData.description,
              }
            : report
        )
      );
    } else {
      // Add new report
      const newReport = {
        id: reports.length + 1,
        reportName: formData.reportName,
        engineer:
          engineers.find((eng) => eng.id === parseInt(formData.engineer))
            ?.name || "",
        status: "Pending",
        description: formData.description,
        date: new Date().toISOString().split("T")[0],
      };
      setReports([...reports, newReport]);
    }

    // Reset form
    setFormData({
      engineer: "",
      reportName: "",
      description: "",
      file: null,
    });
    setIsFormOpen(false);
    setIsEdit(false);
    setEditingReportId(null);
  };

  const handleDelete = (id) => {
    setReports(reports.filter((report) => report.id !== id));
  };

  const handleEdit = (report) => {
    // Pre-fill form with existing data
    const engineerObj = engineers.find((eng) => eng.name === report.engineer);
    setFormData({
      engineer: engineerObj ? engineerObj.id.toString() : "",
      reportName: report.reportName,
      description: report.description,
      file: null,
    });
    setEditingReportId(report.id);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-7">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reports</h2>
          <button
            onClick={() => {
              setIsEdit(false);
              setIsFormOpen(true);
              setFormData({ engineer: "", reportName: "", description: "", file: null });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Submit Report
          </button>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left w-[5%]">#</th>
                  <th className="px-4 py-3 text-left w-[30%]">Report Name</th>
                  <th className="px-4 py-3 text-left w-[15%]">Date</th>
                  <th className="px-4 py-3 text-left w-[15%]">Status</th>
                  <th className="px-4 py-3 text-left w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {report.reportName}
                    </td>
                    <td className="px-4 py-2">{report.date}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex space-x-2 ">
                      <button
                        // onClick={() => handleDelete(report.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => handleEdit(report)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {isEdit ? "Edit Report" : "Submit New Report"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4">
              {/* Engineer */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Engineer
                </label>
                <select
                  name="engineer"
                  value={formData.engineer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">-- Select Engineer --</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Report Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  name="reportName"
                  value={formData.reportName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEdit ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
