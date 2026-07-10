import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Send,
  Download,
  Trash2,
  FilePlus2,
} from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const SelectedCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const id = user.company_id;

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getSelectedCandidatesByCompany/${id}`,
      );

      const data = Array.isArray(response.data.data)
        ? response.data.data.map((c) => ({
            id: c.id,
            candidate_id: c.candidate_id,
            name: c.name,
            mailId: c.email,
            contactNo: c.phone,
            status: c.status,
            appliedFor: c.position || "N/A",
            gender: c.gender || "N/A",
            resume_url: c.resume_url || null,
            selectedAt: c.selected_at,
          }))
        : [];
      setCandidates(data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to fetch candidates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.appliedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mailId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendOffer = async (candidate) => {
    const confirm = await Swal.fire({
      title: "Send Offer?",
      text: `Do you want to send an offer to ${candidate.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Yes, send it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/update/${id}/${candidate.candidate_id}`,
        { status: "offer_sent" },
      );

      Swal.fire("Offer Sent!", `Offer sent to ${candidate.name}`, "success");
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id ? { ...c, status: "offer_sent" } : c,
        ),
      );
    } catch (err) {
      Swal.fire("Error", "Failed to send offer.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Remove Candidate?",
      text: "This will remove the candidate from the list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, remove",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/remove/${id}`,
      );
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      Swal.fire("Removed!", "Candidate has been removed.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to delete candidate.", "error");
    }
  };

  const handleDownload = async (candidate) => {
    const content = `
Candidate Details
-------------------------
Name: ${candidate.name}
Position: ${candidate.appliedFor}
Email: ${candidate.mailId}
Phone: ${candidate.contactNo}
Gender: ${candidate.gender}
Status: ${candidate.status}
Selected Date: ${candidate.selectedAt || "N/A"}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name}_details.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddReport = (id) => {
    window.location.href = `/add-interview-report/${id}`;
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600 text-lg font-medium">
        Loading candidates...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600 text-lg font-medium">
        {error}
      </div>
    );

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Selected Candidates
          </h2>
          <p className="text-gray-500 mb-6">
            Manage candidates selected for various roles
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, position or email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select
                className="bg-transparent text-sm focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="selected">Selected</option>
                <option value="offer_sent">Offer Sent</option>
                <option value="offer accepted">Offer Accepted</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Applied For",
                    "Name",
                    "Contact",
                    "Email",
                    "Status",
                    "Resume",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{candidate.appliedFor}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {candidate.name}
                      </td>

                      <td className="px-6 py-3 text-gray-600">
                        <div className="flex items-center">
                          <Phone size={14} className="mr-2 text-gray-500" />
                          {candidate.contactNo}
                        </div>
                      </td>

                      <td className="px-6 py-3 text-gray-600">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-2 text-gray-500" />
                          {candidate.mailId}
                        </div>
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
    ${
      candidate.status === "selected"
        ? "bg-blue-100 text-blue-800"
        : candidate.status === "offer_sent"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800"
    }`}
                        >
                          {candidate.status && candidate.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-3">
                        {candidate.resume_url ? (
                          <a
                            href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/${candidate.resume_url}`}
                            download
                            className="inline-flex items-center justify-center text-green-600 hover:text-green-800"
                            title="Download Resume"
                          >
                            <Download size={18} />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>

                      <td className="px-6 py-3 flex space-x-3">
                        <button
                          onClick={() => handleSendOffer(candidate)}
                          className="text-green-600 hover:text-green-800"
                          title="Send Offer"
                        >
                          <Send size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(candidate)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download Details"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Candidate"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleAddReport(candidate.id)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Add Interview Report"
                        >
                          <FilePlus2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-6 text-center text-gray-500 text-sm"
                    >
                      No candidates found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
            Showing {filteredCandidates.length} of {candidates.length} total
            candidates
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedCandidate;
