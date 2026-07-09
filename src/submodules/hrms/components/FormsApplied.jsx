import axios from "axios";
import { Eye, FileText, Trash } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const FormsApplied = ({ basePath = "/superadmin/hrms" }) => {
  const API_URL = `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant`;

  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [postFilter, setPostFilter] = useState("All"); // NEW: post/department filter
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    postApplied: "",
    name: "",
    phone: "",
    email: "",
    gender: "",
    status: "pending",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 5;
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = user.company_id || user.id;

  // Fetch applicants from backend
  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`${API_URL}/ap/${id}`);
      console.log("📦 API response:", res.data);
      setApplicants(res.data.data);
      setFilteredApplicants(res.data.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // Extract unique postApplied values for dropdown (case-sensitive, but you can normalize)
  const uniquePosts = useMemo(() => {
    if (!Array.isArray(applicants)) return [];
    const posts = applicants.map((a) => a?.postApplied).filter(Boolean);
    return ["All", ...new Set(posts)];
  }, [applicants]);

  // Search + Filter + Post logic
  useEffect(() => {
    if (!Array.isArray(applicants)) {
      setFilteredApplicants([]);
      return;
    }

    let filtered = applicants.filter((a) =>
      a?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (statusFilter !== "All") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (postFilter !== "All") {
      filtered = filtered.filter((a) => a.postApplied === postFilter);
    }

    setFilteredApplicants(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, postFilter, applicants]);

  // Pagination calculations
  const indexOfLastApplicant = currentPage * applicantsPerPage;
  const indexOfFirstApplicant = indexOfLastApplicant - applicantsPerPage;
  const validApplicants = Array.isArray(filteredApplicants)
    ? filteredApplicants
    : [];
  const currentApplicants = validApplicants.slice(
    indexOfFirstApplicant,
    indexOfLastApplicant,
  );
  const totalPages = Math.ceil(validApplicants.length / applicantsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handlePrev = () =>
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  const handleNext = () =>
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));

  const handleEdit = (applicant) => {
    setFormData(applicant);
    setIsEditing(true);
    setIsFormOpen(true);
    setEditingId(applicant.id);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`${API_URL}/select/${editingId}/${id}`, {
        status: newStatus,
      });
      Swal.fire(
        newStatus === "shortlisted" ? "Shortlisted!" : "Rejected!",
        `Applicant has been ${newStatus}.`,
        "success",
      );
      setIsFormOpen(false);
      setIsEditing(false);
      setEditingId(null);
      fetchApplicants();
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this applicant?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        Swal.fire("Deleted!", "Applicant removed successfully", "success");
        fetchApplicants();
      } catch (err) {
        Swal.fire("Error", "Failed to delete applicant", "error");
      }
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Header with filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`${basePath}/add-applicant`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Applicant
          </button>
          <input
            type="text"
            placeholder="Search by name..."
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* NEW: Post/Department filter dropdown */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
          >
            {uniquePosts.map((post) => (
              <option key={post} value={post}>
                {post === "All" ? "All Posts" : post}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full p-3 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Post Applied</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Resume</th>

              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentApplicants.map((applicant) => (
              <tr
                key={applicant.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-3 font-medium text-gray-800">
                  {applicant.name}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {applicant.postApplied}
                </td>
                <td className="px-6 py-3 text-gray-600">{applicant.email}</td>
                <td className="px-6 py-3 text-gray-600">{applicant.phone}</td>

                <td className="px-6 py-3">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        applicant.status === "shortlisted"
                          ? "bg-green-100 text-green-800"
                          : applicant.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {applicant.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  {applicant.resume ? (
                    <div className="flex justify-center space-x-2">
                      <a
                        href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/${applicant.resume}`}
                        download
                        className="text-green-600 hover:text-green-800"
                        title="Download Resume"
                      >
                        <FileText size={18} />
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-400">No Resume</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right flex justify-end space-x-3">
                  <button
                    onClick={() => handleEdit(applicant)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(applicant.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {validApplicants.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No applicants found.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 mb-3 space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Update Applicant Status
            </h3>
            <div className="space-y-4">
              <p>
                <strong>Name:</strong> {formData.name}
              </p>
              <p>
                <strong>Post:</strong> {formData.postApplied}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Phone:</strong> {formData.phone}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{formData.status}</span>
              </p>
              <p>
                <strong>Experience:</strong> {formData.totalExperience}
              </p>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate("rejected")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate("shortlisted")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsApplied;
