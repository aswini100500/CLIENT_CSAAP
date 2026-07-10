import axios from "axios";
import {
  CheckCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  Plus,
  Search,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import { usePermission } from "../../../hooks/usePermission";

const RecruitmentTablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { has } = usePermission();

  const company_id = user.company_id;

 

  const [recruitmentData, setRecruitmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPosition, setFilterPosition] = useState("All");


  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    interview_round: "",
    completed_round: "",
    status: "",
    interview_mode: "",
  });

  const [emailForm, setEmailForm] = useState({ subject: "", body: "" });
  const [reportData, setReportData] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");


  const API_BASE = `${import.meta.env.VITE_HRMS_BASE_URL}/api`;


  const processedData = useMemo(() => {

    return recruitmentData.map((item) => ({
      id: item.id,
      candidateName: item.candidate_name || item.candidateName || "N/A",
      jobTitle: item.position || item.job_title || "N/A",
      email: item.email || "",
      phone: item.phone || "",
      interviewDate: item.interview_date || null,
      interviewer: item.interviewer_name || "",
      status: item.status || "Pending",
      remarks: item.remarks || "",
      interview_round: item.interview_round ?? 0,
      completed_round: item.completed_round || 0,
      resume_url: item.resume_url || null,
      raw: item,
    }));
  }, [recruitmentData]);


  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData.filter((candidate) => {
      const matchesSearch =
        searchTerm === "" ||
        candidate.candidateName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" ||
        displayStatus.toLowerCase() === filterStatus.toLowerCase();
      const matchesPosition =
        filterPosition === "All" || candidate.jobTitle === filterPosition;

      return matchesSearch && matchesStatus && matchesPosition;
    });


    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";

        if (sortConfig.direction === "asc") {
          return aVal.localeCompare(bVal);
        }
        return bVal.localeCompare(aVal);
      });
    }

    return filtered;
  }, [processedData, searchTerm, filterStatus, filterPosition, sortConfig]);


  const uniquePositions = useMemo(() => {
    const positions = [...new Set(processedData.map((item) => item.jobTitle))];
    return positions.filter(Boolean);
  }, [processedData]);


  const fetchRecruitments = useCallback(async () => {
    if (!company_id) {
      console.warn("fetchRecruitments skipped: company_id not available yet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE}/applicant/getInterview/interview/${company_id}`;
      const response = await axios.get(url);



      let rows = [];

      if (Array.isArray(response.data)) {
        rows = response.data;
      } else if (Array.isArray(response.data.data)) {
        rows = response.data.data;
      } else if (Array.isArray(response.data.interviews)) {
        rows = response.data.interviews;
      }


      setRecruitmentData(rows);

      if (!rows.length) {
        setError("No interview candidates found for this company.");
      }
    } catch (err) {
      console.error("Error fetching recruitment data:", err);
      setError(
        err.response?.data?.message || "Failed to fetch interview candidates",
      );
    } finally {
      setLoading(false);
    }
  }, [company_id, API_BASE]);

  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);


  const getStatusColor = (status) => {
    const statusColors = {
      Approved: "bg-green-100 text-green-800 border border-green-200",
      Selected: "bg-green-100 text-green-800 border border-green-200",
      "Rounds Completed":
        "bg-purple-100 text-purple-800 border border-purple-200",
      Completed: "bg-purple-100 text-purple-800 border border-purple-200",
      Scheduled: "bg-blue-100 text-blue-800 border border-blue-200",
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Rejected: "bg-red-100 text-red-800 border border-red-200",
      "On Hold": "bg-orange-100 text-orange-800 border border-orange-200",
      Cancelled: "bg-gray-200 text-gray-800 border border-gray-300",
    };
    return (
      statusColors[status] || "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };


  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleCompleteRound = async (candidate) => {
    if (!has("hrms.job.interview.schedule")) {
      Swal.fire("Access Denied", "You do not have permission to schedule interviews.", "error");
      return;
    }
    const raw = candidate.raw;
    const isLastRound =
      candidate.completed_round + 1 >= candidate.interview_round;

    try {

      if (!isLastRound) {
        await axios.put(
          `${API_BASE}/applicant/complete-round/${raw.candidate_id}/${company_id}`,
        );
        fetchRecruitments();
        return;
      }


      const result = await Swal.fire({
        title: "All interview rounds completed",
        text: "What do you want to do next?",
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: "➕ Add More Rounds",
        cancelButtonText: "⏸ Put On Hold",
      });


      if (
        result.dismiss === Swal.DismissReason.close ||
        result.dismiss === Swal.DismissReason.esc ||
        result.dismiss === Swal.DismissReason.backdrop
      ) {
        return;
      }


      if (result.dismiss === Swal.DismissReason.cancel) {
        await axios.put(
          `${API_BASE}/applicant/hold/${raw.candidate_id}/${company_id}`,
        );
        fetchRecruitments();
        return;
      }


      if (result.isConfirmed) {
        const { value: rounds } = await Swal.fire({
          title: "Add More Rounds",
          input: "number",
          inputLabel: "Number of additional rounds",
          inputAttributes: { min: 1 },
          inputValidator: (v) => (!v || v < 1 ? "Enter valid number" : null),
        });

        if (!rounds) return;

        await axios.put(
          `${API_BASE}/applicant/add-rounds/${raw.candidate_id}/${company_id}`,
          { extraRounds: rounds },
        );

        fetchRecruitments();
        return;
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update round", "error");
    }
  };


  const handleView = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleEdit = (candidate) => {
    if (!has("hrms.job.interview.schedule")) {
      Swal.fire("Access Denied", "You do not have permission to schedule interviews.", "error");
      return;
    }
    const raw = candidate.raw || {};

    setEditForm({
      candidate_id: raw.candidate_id ?? raw.id,
      candidate_name: raw.candidate_name ?? candidate.candidateName,
      position: raw.position ?? candidate.jobTitle,
      email: raw.email ?? candidate.email,
      phone: raw.phone ?? candidate.phone,
      interview_date: raw.interview_date
        ? new Date(raw.interview_date).toISOString().slice(0, 10)
        : "",
      interviewer_name: raw.interviewer_name ?? candidate.interviewer,
      status: raw.status ?? candidate.status,
      remarks: raw.remarks ?? candidate.remarks,
      interview_round: raw.interview_round || 3,
      completed_round: raw.completed_round || 0,
      interview_mode: raw.interview_mode || "Online",
    });

    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const { candidate_id, status, ...rest } = editForm;


      if (status === "Rejected") {
        await axios.put(
          `${API_BASE}/applicant/reject/${candidate_id}/${company_id}`,
        );

        Swal.fire("Rejected", "Candidate rejected successfully", "success");
      }


      else {
        await axios.put(
          `${API_BASE}/applicant/approve/${candidate_id}/${company_id}`,
          {
            ...rest,
            status,
          },
        );

        Swal.fire("Success", "Candidate updated successfully", "success");
      }

      setIsEditModalOpen(false);
      fetchRecruitments();
    } catch (error) {
      console.error("Error updating candidate:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    }
  };

  const handleContact = (candidate) => {
    if (!has("hrms.job.interview.schedule")) {
      Swal.fire("Access Denied", "You do not have permission to schedule interviews.", "error");
      return;
    }
    setSelectedCandidate(candidate);

    setInterviewDate("");
    setInterviewTime("");

    setEmailForm({
      subject: `Interview Schedule – ${candidate.jobTitle}`,
      body: `Dear ${candidate.candidateName},

We are pleased to inform you that your interview for the position of ${candidate.jobTitle} has been scheduled.

📅 Date: 
⏰ Time: 

Please be available 10 minutes before the scheduled time.

Best regards,
HR Team`,
    });

    setIsEmailModalOpen(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (!interviewDate || !interviewTime) {
      Swal.fire(
        "Missing Info",
        "Please select interview date & time",
        "warning",
      );
      return;
    }

    const updatedBody = `${emailForm.body}

📅 Interview Date: ${interviewDate}
⏰ Interview Time: ${interviewTime}
`;

    const mailtoLink = `mailto:${selectedCandidate.email}
?subject=${encodeURIComponent(emailForm.subject)}
&body=${encodeURIComponent(updatedBody)}`;

    window.open(mailtoLink, "_blank");
    setIsEmailModalOpen(false);
  };

  const handleViewReport = async (candidateId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/recruitments/${candidateId}`,
      );


      setReportData(response.data);
      setIsViewReportOpen(true);
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("No report found for this candidate.");
    }
  };

  const handleDownload = (candidate) => {
    const data = JSON.stringify(candidate, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidate-${candidate.candidateName}-${candidate.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleResume = async (candidate) => {
    if (!has("hrms.job.interview.schedule")) {
      Swal.fire("Access Denied", "You do not have permission to schedule interviews.", "error");
      return;
    }
    const raw = candidate.raw;

    const confirm = await Swal.fire({
      title: "Resume Interview?",
      text: `Interview will resume from Round ${candidate.completed_round + 1}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Resume",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE}/applicant/resume/${raw.candidate_id}/${company_id}`,
      );

      Swal.fire("Resumed", "Interview has been scheduled again", "success");
      fetchRecruitments();
    } catch (err) {
      Swal.fire("Error", "Failed to resume interview", "error");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading recruitment data...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchRecruitments}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Recruitment Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and track all recruitment activities
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={() => navigate(`/interview-report/${company_id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-3 transition-all hover:shadow-lg"
              >
                <Plus size={20} />
                Add Interview Report
              </button>
            </div>
          </div>


          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4">

            <div className="lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>


            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>


            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                >
                  <option value="All">All Positions</option>
                  {uniquePositions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            <div className="lg:col-span-1 flex items-center justify-end">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-xl">
                Showing {filteredAndSortedData.length} of {processedData.length}{" "}
                candidates
              </span>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    { key: "candidateName", label: "Candidate" },
                    { key: "jobTitle", label: "Position" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    { key: "status", label: "Status" },
                    { key: "interviewRounds", label: "Interview Rounds" },
                    { key: "actions", label: "Actions" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => key !== "actions" && handleSort(key)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig.key === key && (
                          <span className="text-gray-400">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedData.map((candidate) => {


                  const isAllRoundsCompleted =
                    candidate.completed_round >= candidate.interview_round;
                  const nextRound = candidate.completed_round + 1;
                  const rawStatus = candidate.status || "";
                  const normalizedStatus = rawStatus.trim().toLowerCase();


                  const displayStatusMap = {
                    approved: "Selected",
                    selected: "Selected",
                    rejected: "Rejected",
                    pending: "Pending",
                    scheduled: "Scheduled",
                    "on hold": "On Hold",
                    completed: "Completed",
                    cancelled: "Cancelled",
                  };

                  const displayStatus =
                    displayStatusMap[normalizedStatus] || "Pending";

                  return (
                    <tr
                      key={candidate.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {candidate.candidateName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {candidate.jobTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`mailto:${candidate.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {candidate.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {candidate.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayStatus)}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">

                          {has("hrms.job.interview.schedule") && normalizedStatus === "on hold" && (
                            <button
                              onClick={() => handleResume(candidate)}
                              className="px-3 py-1 bg-orange-100 hover:bg-orange-200
               text-orange-800 text-sm rounded-lg
               border border-orange-300 transition"
                              title="Resume interview"
                            >
                              ▶ Resume from Round{" "}
                              {candidate.completed_round + 1}
                            </button>
                          )}


                          {has("hrms.job.interview.schedule") && normalizedStatus !== "on hold" &&
                            normalizedStatus !== "approved" &&
                            candidate.completed_round <
                              candidate.interview_round && (
                              <button
                                onClick={() => handleCompleteRound(candidate)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors shadow-sm hover:shadow"
                                title={`Complete Round ${candidate.completed_round + 1}`}
                              >
                                Complete Round {candidate.completed_round + 1}
                              </button>
                            )}


                          {normalizedStatus !== "on hold" &&
                            (candidate.completed_round >=
                              candidate.interview_round ||
                              normalizedStatus === "approved") &&
                            candidate.interview_round > 0 && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg border border-green-200">
                                <CheckCircle
                                  size={16}
                                  className="text-green-700"
                                />
                                <span>Completed</span>
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {candidate.resume_url && (
                            <a
                              href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/${candidate.resume_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="View Resume"
                            >
                              <Download size={16} />
                            </a>
                          )}
                          <button
                            onClick={() => handleView(candidate)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {has("hrms.job.interview.schedule") && (
                             <button
                               onClick={() => handleEdit(candidate)}
                               className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                               title="Edit Candidate"
                             >
                               <Edit size={16} />
                             </button>
                           )}
                           {has("hrms.job.interview.schedule") && (
                             <button
                               onClick={() => handleContact(candidate)}
                               className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                               title="Send Email"
                             >
                               <Mail size={16} />
                             </button>
                           )}
                           <button
                             onClick={() => handleViewReport(candidate.id)}
                             className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                             title="View Report"
                           >
                             View Report
                           </button>
                           <button
                             onClick={() => handleDownload(candidate)}
                             className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                             title="Download"
                           >
                             <Download size={16} />
                           </button>
                           {has("hrms.job.interview.schedule") && (
                             <button
                               onClick={() =>
                                 navigate(`/interview-report/${candidate.id}`)
                               }
                               className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                             >
                               Add Report
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>


          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No candidates found
              </h3>
              <p className="text-gray-600">
                {searchTerm ||
                filterStatus !== "All" ||
                filterPosition !== "All"
                  ? "Try adjusting your search or filters"
                  : "No recruitment data available"}
              </p>
            </div>
          )}
        </div>

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-center min-h-screen p-4">

              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Edit Candidate
                    </h2>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <EditCandidateForm
                    form={editForm}
                    onChange={setEditForm}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditModalOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}


        {isEmailModalOpen && selectedCandidate && (
          <Modal
            title={`Contact ${selectedCandidate.candidateName}`}
            onClose={() => setIsEmailModalOpen(false)}
          >
            <EmailForm
              candidate={selectedCandidate}
              form={emailForm}
              onChange={setEmailForm}
              onSubmit={handleEmailSubmit}
              onCancel={() => setIsEmailModalOpen(false)}
              interviewDate={interviewDate}
              setInterviewDate={setInterviewDate}
              interviewTime={interviewTime}
              setInterviewTime={setInterviewTime}
            />
          </Modal>
        )}


        {isViewReportOpen && reportData && (
          <Modal
            title="Interview Report"
            onClose={() => setIsViewReportOpen(false)}
          >
            <ReportView
              data={reportData}
              onClose={() => setIsViewReportOpen(false)}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};


const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);


const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-start">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-900 text-right">{value || "N/A"}</span>
  </div>
);


const EditCandidateForm = ({ form, onChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto pr-2 max-h-[70vh]">
      <div className="space-y-6 p-1">

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Candidate Name"
              name="candidate_name"
              value={form.candidate_name}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  candidate_name: e.target.value,
                }))
              }
              required
            />
            <FormField
              label="Position"
              name="position"
              value={form.position}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, position: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
            <FormField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>


        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Interview Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Interview Date"
              type="date"
              name="interview_date"
              value={form.interview_date}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  interview_date: e.target.value,
                }))
              }
            />
            <FormField
              label="Interviewer"
              name="interviewer_name"
              value={form.interviewer_name}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  interviewer_name: e.target.value,
                }))
              }
              placeholder="Name of interviewer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Interview Rounds <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.interview_round || ""}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    interview_round: parseInt(e.target.value) || 3,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                placeholder="Enter total rounds"
                required
              />
              <p className="text-xs text-gray-500">
                Total number of rounds for this position
              </p>
            </div>


            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Completed Rounds
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={form.interview_round || ""}
                  value={form.completed_round || "0"}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-sm">
                    / {form.interview_round || "—"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Automatically updated when completing rounds
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Interview Mode <span className="text-red-500">*</span>
              </label>

              <select
                value={form.interview_mode}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    interview_mode: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                required
              >
                <option value="">Select Interview Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Telephonic">Telephonic</option>
              </select>

              <p className="text-xs text-gray-500">
                Mode in which the interview will be conducted
              </p>
            </div>
          </div>
        </div>


        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Status & Remarks
          </h3>

          <FormField
            label="Status"
            as="select"
            name="status"
            value={form.status}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, status: e.target.value }))
            }
            options={[
              "Scheduled",
              "Completed",
              "Cancelled",
              "Selected",
              "Rejected",
              "On Hold",
            ]}
          />


          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={form.remarks || ""}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, remarks: e.target.value }))
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-none"
              placeholder="Add any additional notes or comments about the candidate..."
            />
            <p className="text-xs text-gray-500 text-right">
              {form.remarks ? form.remarks.length : 0} characters
            </p>
          </div>
        </div>
      </div>
    </div>


    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium min-w-30"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium min-w-30 shadow-sm hover:shadow"
        >
          Save Changes
        </button>
      </div>
    </div>
  </form>
);


const EmailForm = ({
  candidate,
  form,
  onChange,
  onSubmit,
  onCancel,
  interviewDate,
  setInterviewDate,
  interviewTime,
  setInterviewTime,
}) => {
  const [interviewMode, setInterviewMode] = useState("");
  const [roundDescription, setRoundDescription] = useState("");

  useEffect(() => {
    if (candidate?.raw?.interview_mode) {
      setInterviewMode(candidate.raw.interview_mode);
    } else if (candidate?.interview_mode) {
      setInterviewMode(candidate.interview_mode);
    }
  }, [candidate]);


  useEffect(() => {
    const generateEmailTemplate = () => {

      let formattedDate = "___";
      if (interviewDate) {
        const date = new Date(interviewDate);
        formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }


      const getModeIcon = () => {
        switch (interviewMode) {
          case "Online":
            return "🌐";
          case "Offline":
            return "🏢";
          case "Telephonic":
            return "📞";
          default:
            return "";
        }
      };


      const getModeDetails = () => {
        if (interviewMode === "Online") {
          return "Join the meeting using the link that will be shared 30 minutes before the interview.";
        } else if (interviewMode === "Offline") {
          return "Please arrive 15 minutes early at our office location.";
        } else if (interviewMode === "Telephonic") {
          return "We will call you at the scheduled time. Please ensure you are in a quiet environment.";
        }
        return "";
      };

      const modeIcon = getModeIcon();
      const modeDetails = getModeDetails();
      const roundText = roundDescription ? ` (${roundDescription})` : "";

      const template = `Dear ${candidate.candidateName},

I hope this email finds you well!

We were impressed with your application and would like to invite you for an interview${roundText} for the ${candidate.jobTitle} position.

**Interview Details:**
- 📅 **Date:** ${formattedDate}
- ⏰ **Time:** ${interviewTime || "___"}
- ${modeIcon} **Mode:** ${interviewMode || "___"}${modeDetails ? `\n  ${modeDetails}` : ""}

Please let us know if the proposed date and time work for you. If you need to reschedule or have any questions, feel free to reply to this email.

We look forward to speaking with you!

Best regards,
The Hiring Team
${candidate.company || "[Company Name]"}`;

      onChange((prev) => ({
        ...prev,
        subject: `Interview Invitation: ${candidate.jobTitle} - ${candidate.candidateName}`,
        body: template,
      }));
    };

    generateEmailTemplate();
  }, [
    interviewDate,
    interviewTime,
    interviewMode,
    roundDescription,
    candidate,
  ]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormField
        label="To"
        value={candidate.email}
        readOnly
        className="bg-gray-50"
      />


      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Interview Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Interview Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>


          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Interview Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Interview Mode <span className="text-red-500">*</span>
            </label>
            <select
              value={interviewMode}
              onChange={(e) => setInterviewMode(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Telephonic">Telephonic</option>
            </select>
          </div>
        </div>


        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Round Type / Description
          </label>
          <input
            type="text"
            placeholder="e.g., Technical Interview, HR Discussion, Final Round"
            value={roundDescription}
            onChange={(e) => setRoundDescription(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">
            Optional: This will be included in the email template
          </p>
        </div>


        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Auto-generated email:</span> The
              email template below updates automatically as you fill the details
              above.
            </p>
          </div>
        </div>
      </div>


      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Email Content
        </h3>

        <FormField
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, subject: e.target.value }))
          }
          required
        />

        <div className="space-y-2">
          <textarea
            name="body"
            value={form.body}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, body: e.target.value }))
            }
            rows={10}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="The email template will appear here..."
            required
          />
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Auto-filled:{" "}
                {interviewDate && interviewTime && interviewMode
                  ? "✓ Complete"
                  : "Waiting for details"}
              </span>
              <span>Editable: You can modify the text above</span>
            </div>
            <span>{form.body.length} characters</span>
          </div>
        </div>
      </div>


      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Mail size={18} />
          Send Email
        </button>
      </div>
    </form>
  );
};


const ReportView = ({ data, onClose }) => (
  <div className="space-y-4">
    <div className="bg-gray-50 rounded-lg p-4">
      <pre className="text-sm whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
    <div className="flex justify-end">
      <button
        onClick={onClose}
        className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
      >
        Close
      </button>
    </div>
  </div>
);


const FormField = ({ label, as = "input", options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {as === "select" ? (
      <select
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : as === "textarea" ? (
      <textarea
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    ) : (
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )}
  </div>
);

export default RecruitmentTablePage;
