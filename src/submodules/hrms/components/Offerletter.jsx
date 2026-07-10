
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';
import { usePermission } from '../../../hooks/usePermission';
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
} from 'lucide-react';
import jsPDF from "jspdf";

const OfferLetterManagement = () => {
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0000-00-00") return "Not specified";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerLetterData, setOfferLetterData] = useState(null);
  const [offerLetterLoading, setOfferLetterLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const entriesPerPage = 5;
  const { user, token } = useAuth();
  const { has } = usePermission();
  console.log("Current user:", user);
  const id = user.company_id
  console.log(id);
  const company_id = user.company_id;
  const role = user.role;
  console.log(role);

  const csaapToken = user.csaapToken;

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getselectedCandidates/all/${id}`)

      .then((res) => setCandidates(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setToast({ message: 'Failed to fetch candidates', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = candidates.filter((offer) => {
    const matchesSearch =
      (offer.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.position ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !positionFilter || offer.position === positionFilter;
    const matchesStatus = !statusFilter || offer.status === statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + entriesPerPage);
  const positions = [...new Set(candidates.map((o) => o.position))];

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
      offer_sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
      declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const Toast = ({ message, type }) => {
    useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div
        className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
      >
        {message}
      </div>
    );
  };


  const handleView = async (offer) => {
    setSelectedOffer(offer);
    setOfferLetterLoading(true);
    setShowViewModal(true);
    console.log(offer);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getOfferLetter/${offer.selected_id}`
      );
      console.log(res);

      setOfferLetterData(res.data.data);
    } catch {
      setOfferLetterData(null);
      setToast({ message: 'Failed to fetch offer letter', type: 'error' });
    }
    setOfferLetterLoading(false);
  };


  const handleEdit = async (offer) => {
    if (!has("hrms.job.offer.create")) {
      Swal.fire("Access Denied", "You do not have permission to edit offer letters.", "error");
      return;
    }
    setSelectedOffer(offer);
    setOfferLetterLoading(true);
    setShowEditModal(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getOfferLetter/${offer.selected_id}`
      );

      const candidateData = res.data.data || {};

      setEditForm({
        ...candidateData,
        position: offer.postApplied || candidateData.position || '',
        salary: candidateData.salary || '',
        startDate: candidateData.start_date || ''
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setEditForm({
        position: offer.postApplied || '',
        salary: '',
        startDate: ''
      });
      setShowEditModal(false);
      setToast({ message: 'Failed to fetch offer letter', type: 'error' });
    }
    setOfferLetterLoading(false);
  };



  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!has("hrms.job.offer.create")) {
      Swal.fire("Access Denied", "You do not have permission to edit offer letters.", "error");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/update/${id}/${selectedOffer.candidate_id}`,
        {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.contact,
          gender: editForm.gender,
          position: editForm.position,
          salary: editForm.salary,
          startDate: editForm.startDate,
          status: editForm.status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      setCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === selectedOffer.candidate_id
            ? { ...c, salary: editForm.salary, start_date: editForm.startDate, position: editForm.position }
            : c
        )
      );

      setToast({ message: 'Offer updated successfully', type: 'success' });
      setShowEditModal(false);

    } catch (error) {
      console.error("ERROR:", error.response);
      setToast({
        message: error.response?.data?.message || 'Update failed',
        type: 'error'
      });
    }
  };



  const handleSend = async (offer) => {
    if (!has("hrms.job.offer.create")) {
      Swal.fire("Access Denied", "You do not have permission to send offer letters.", "error");
      return;
    }
    const confirm = await Swal.fire({
      title: "Send Offer?",
      text: `Do you want to send an offer to ${offer.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Yes, send it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/send-mail/${offer.candidate_id}/${offer.company_id}`,
        {
          salary: offer.salary,
          startDate: offer.start_date,
          position: offer.position || offer.postApplied
        }
      );

      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/update/${id}/${offer.candidate_id}`,
        { status: "offer_sent" }
      );

      setCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === offer.candidate_id
            ? { ...c, status: "offer_sent" }
            : c
        )
      );

      setToast({ message: `Offer letter sent to ${offer.email}`, type: 'success' });
      Swal.fire("Offer Sent!", `Offer sent to ${offer.name}`, "success");

    } catch (error) {
      console.error("Error sending mail:", error);
      setToast({
        message: `Failed to send mail to ${offer.email}`,
        type: 'error'
      });
    }
  };



  const handleAcceptOffer = async () => {
    if (!selectedOffer) return;
    if (!has("hrms.job.offer.create")) {
      Swal.fire("Access Denied", "You do not have permission to accept candidate offers.", "error");
      return;
    }

    try {
      const localToken = token;
      const resolvedCompanyId = user?.company_id ?? user?.id ?? company_id;
      const resolvedName = selectedOffer?.name?.trim?.() || "";
      const resolvedEmail = selectedOffer?.email?.trim?.() || "";
      const resolvedPhone =
        selectedOffer?.phone ||
        selectedOffer?.contact ||
        selectedOffer?.contactNo ||
        "";
      const resolvedPostApplied =
        selectedOffer?.postApplied ||
        selectedOffer?.position ||
        "";

      if (!resolvedCompanyId || !resolvedName || !resolvedEmail) {
        setToast({
          message: "Candidate name, email, or company is missing. Please refresh and try again.",
          type: "error"
        });
        return;
      }


      const submitFormData = new FormData();
      submitFormData.append("name", resolvedName);
      submitFormData.append("email", resolvedEmail);
      submitFormData.append("phone", resolvedPhone);
      submitFormData.append("gender", selectedOffer.gender || "");
      submitFormData.append("postApplied", resolvedPostApplied);
      if (selectedOffer.resume_url) {
        submitFormData.append("cv", selectedOffer.resume_url);
      }
      if (selectedOffer.aadharNo) {
        submitFormData.append("aadharNo", selectedOffer.aadharNo);
      }
      if (selectedOffer.panNo) {
        submitFormData.append("panNo", selectedOffer.panNo);
      }
      submitFormData.append("employeeStatus", "Probation");
      submitFormData.append("status", "Probation");
      submitFormData.append("password", "12345678");
      submitFormData.append("company_id", resolvedCompanyId);


      const cloudPayload = {
        company_id: resolvedCompanyId,
        name: resolvedName,
        email: resolvedEmail,
        password: "12345678",
        phone: resolvedPhone || null,
        postApplied: resolvedPostApplied || null,
        employeeShift: null,
        officeEmail: null,
        storeAssign: null,
        employeeStatus: "Probation",
        shift_start: null,
        shift_end: null
      };


      let csaapEmployeeId = null;
      try {
        const cloudResponse = await axios.post(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/add-employee`,
          cloudPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        csaapEmployeeId =
          cloudResponse?.data?.employeeId ||
          cloudResponse?.data?.data?.id ||
          cloudResponse?.data?.data?.employeeId ||
          null;
      } catch (err) {
        console.error("Cloud API Error:", err.response?.data);

        setToast({
          message: err.response?.data?.message || "Failed to create employee in Cloud",
          type: "error"
        });

        return;
      }

      if (!csaapEmployeeId) {
        setToast({
          message: "Cloud employee created but employee id was not returned.",
          type: "error"
        });
        return;
      }

      submitFormData.append("id", csaapEmployeeId);


      try {
        await axios.post(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee`,
          submitFormData,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localToken}`,
            },
          }
        );
      } catch (err) {
        console.error("Local API Error:", err.response?.data);

        setToast({
          message: err.response?.data?.message || "Failed to create employee locally",
          type: "error"
        });

        return;
      }


      const updatedCandidates = candidates.map(candidate =>
        candidate.selected_id === selectedOffer.selected_id
          ? { ...candidate, status: 'accepted' }
          : candidate
      );

      setCandidates(updatedCandidates);
      setShowAcceptModal(false);
      setShowViewModal(false);

      setToast({
        message: `Offer accepted & employee created for ${selectedOffer.name}`,
        type: 'success'
      });

    } catch (error) {
      console.error("LOCAL API FULL ERROR:", error.response);
      console.log("MESSAGE:", error.response?.data?.message);
      console.log("DATA:", error.response?.data);

      setToast({
        message: error.response?.data?.message || 'Failed to create employee',
        type: 'error'
      });
    }
  };


  const handleOpenAcceptModal = (offer) => {
    setSelectedOffer({
      ...offer,
      position: offer.postApplied
    });
    setShowAcceptModal(true);
  };



  const handleExport = () => {
    if (!has("hrms.job.offer.download")) {
      Swal.fire("Access Denied", "You do not have permission to export data.", "error");
      return;
    }
    const headers = ['ID,Position,Name,Contact,Email,Gender,Status'];
    const rows = filteredData.map(
      (offer) =>
        `${offer._id || offer.id},${offer.position},${offer.name},${offer.contact},${offer.email
        },${offer.gender},${offer.status}`
    );
    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'offer_letters.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: 'Data exported successfully', type: 'success' });
  };

  const handleDownloadOfferLetter = () => {
    if (!offerLetterData) return;
    if (!has("hrms.job.offer.download")) {
      Swal.fire("Access Denied", "You do not have permission to download offer letters.", "error");
      return;
    }

    const doc = new jsPDF();

    const content = `
Your Company Name
Devon Rd, Hampstead, NY 10001
info@yourcompany.com | (555) 123-4567
www.yourcompany.com

Job Offer Letter
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${offerLetterData.name}
${offerLetterData.email}

Dear Mr./Ms. ${offerLetterData.name?.split(' ')[0]},

We are thrilled to extend you an offer for the ${offerLetterData.position} position at Your Company Name. We believe your skills and experience will contribute to our team and company's future.

Your starting date will be ${offerLetterData.startDate || ''}, and your salary will be ${offerLetterData.salary || ''}, payable bi-weekly, along with any other benefits as per company policy. If you have any questions, please feel free to reach out. We're looking forward to having you!

Sincerely,

[Your Name]
Sophie Fadel
Human Resource Manager
hr@cloudsat.com
`;


    doc.setFont('Times', 'Normal');
    doc.setFontSize(12);
    doc.text(content, 10, 10);


    doc.save(`${offerLetterData.name}_Offer_Letter.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <p className="text-gray-600 mt-1">Manage and track all offer letters</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            {has("hrms.job.offer.download") && (
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            )}

          </div>
        </div>


        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, email, or position..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  id="position"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="">All Positions</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="offer_sent">Offer Sent</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading candidates...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied For</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.length > 0 ? (
                    currentData.map((offer) => (
                      <tr key={offer.selected_id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{offer.position || offer.postApplied}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{offer.name}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{offer.phone}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{offer.email}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={offer.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {offer.resume_url && (
                              <a
                                href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/${offer.resume_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                title="View Resume"
                              >
                                <Download size={16} />
                              </a>
                            )}
                            <button
                              onClick={() => handleView(offer)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="View Offer"
                            >
                              <Eye size={16} />
                            </button>
                            {has("hrms.job.offer.create") && (
                              <button
                                onClick={() => handleEdit(offer)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Edit Offer"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {has("hrms.job.offer.create") && (
                              <button
                                onClick={() => handleSend(offer)}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                title="Send Offer"
                              >
                                <Send size={16} />
                              </button>
                            )}
                            {has("hrms.job.offer.create") && offer.status !== 'accepted' && (
                              <button
                                onClick={() => handleOpenAcceptModal(offer)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Accept Offer"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-gray-400 mb-2">No offer letters found</div>
                          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(startIndex + entriesPerPage, filteredData.length)}</span> of{' '}
              <span className="font-medium">{filteredData.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded-lg border ${currentPage === page
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>


        {showViewModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              {offerLetterLoading ? (
                <div className="text-center py-8 text-gray-400">Loading offer letter...</div>
              ) : offerLetterData ? (
                <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-gray-800 font-bold text-2xl"></div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Devon Rd, Hampstead, NY 10001</p>
                      <p className="text-sm text-gray-600">info@yourcompany.com | (555) 123-4567</p>
                      <p className="text-sm text-gray-600">www.yourcompany.com</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-center mb-4">Job Offer Letter</h2>
                  <p className="text-center text-gray-600 mb-6">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="mb-6">
                    <p className="text-gray-800">{offerLetterData.name}</p>
                    <p className="text-gray-600">{offerLetterData.email}</p>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>Dear Mr./Ms. {offerLetterData.name?.split(' ')[0]},</p>
                    <p>
                      We are thrilled to extend you an offer for the{' '}
                      <span className="font-medium">{offerLetterData.postApplied}</span> position at Your Company Name.
                      We believe your skills and experience will contribute to our team and company's future.
                    </p>
                    <p>
                      Your starting date will be{' '}
                      <span className="font-medium">{offerLetterData.startDate || ''}</span>, and your salary will be{' '}
                      <span className="font-medium">{offerLetterData.salary || ''}</span>, payable bi-weekly, along
                      with any other benefits as per company policy. If you have any questions, please feel free to
                      reach out. We're looking forward to having you!
                    </p>
                  </div>
                  <div className="mt-8 text-gray-700">
                    <p>Sincerely,</p>
                    <p className="mt-4">[Your Name]</p>
                    <p className="font-medium">Sophie Fadel</p>
                    <p className="text-sm">Human Resource Manager</p>
                    <p className="text-sm">hr@yourcompany.com</p>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    {has("hrms.job.offer.download") && (
                      <button
                        onClick={handleDownloadOfferLetter}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download size={18} />
                        <span>Download Offer Letter</span>
                      </button>
                    )}
                    {has("hrms.job.offer.create") && selectedOffer.status !== 'accepted' && (
                      <button
                        onClick={() => handleOpenAcceptModal(selectedOffer)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={18} />
                        <span>Accept Offer</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No offer letter found.</div>
              )}
            </div>
          </div>
        )}


        {showAcceptModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Accept Offer Letter</h2>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to accept the offer letter for <strong>{selectedOffer.name} </strong>
                  as  <strong>{selectedOffer.position}</strong>?
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Offer Details:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li><strong>Position:</strong> {selectedOffer.position}</li>
                    <li><strong>Salary:</strong> {selectedOffer.salary}</li>
                    <li><strong>Joining Date:</strong> {formatDate(selectedOffer.start_date || selectedOffer.startDate)}</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptOffer}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={18} />
                  Accept As Employee
                </button>
              </div>
            </div>
          </div>
        )}


        {showEditModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Offer Letter</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              {offerLetterLoading ? (
                <div className="text-center py-8 text-gray-400">Loading offer letter...</div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.position || ''}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.contact || ''}
                      onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.gender || ''}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salary</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.salary || ''}
                      onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.startDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Benefits</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.benefits || ''}
                      onChange={(e) => setEditForm({ ...editForm, benefits: e.target.value })}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={editForm.additionalNotes || ''}
                      onChange={(e) => setEditForm({ ...editForm, additionalNotes: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}


        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
};

export default OfferLetterManagement;
