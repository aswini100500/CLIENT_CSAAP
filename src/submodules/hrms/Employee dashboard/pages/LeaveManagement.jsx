
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../hooks/useAuth';
import Swal from 'sweetalert2';
import { Calendar, FileText, CheckCircle, Hourglass } from 'lucide-react';
import { usePermission } from '../../../../hooks/usePermission';

const LeaveManagement = () => {
  const { has } = usePermission();
  const canApply = has("hrms.self_service.leave.apply");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveSummary, setLeaveSummary] = useState({
    totalAnnualLeaves: 0,
    leavesTaken: 0,
    remainingLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,

    types: {
      CL: { carryForward: 0, monthlyCredit: 0, monthlyRemaining: 0, totalAvailable: 0, yearlyUsed: 0, yearlyRemaining: 0 },
      EL: { carryForward: 0, monthlyCredit: 0, monthlyRemaining: 0, totalAvailable: 0, yearlyUsed: 0, yearlyRemaining: 0 },
      ML: { carryForward: 0, monthlyCredit: 0, monthlyRemaining: 0, totalAvailable: 0, yearlyUsed: 0, yearlyRemaining: 0 }
    }
  });

  const { user } = useAuth();
  const slug = user?.slug;
  const emp_id = user?.employeeProfileId;
  console.log(emp_id);
  console.log(slug);
  console.log(user);


  const fetchLeaves = async () => {
    try {

      const balanceRes = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/getRemainingLeave/${slug}/${emp_id}`);
      console.log('Balance API Response:', balanceRes.data);
      const balanceData = balanceRes.data?.data;
      const source = balanceRes.data?.source;

      setLeaveBalance(balanceData);


      const requestsRes = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/${slug}/${emp_id}`);
      console.log('Requests API Response:', requestsRes.data);
      const requestsData = requestsRes.data?.data || [];


      const formattedLeaves = requestsData.map(leave => ({
        ...leave,
        appliedDate: leave.appliedDate || (leave.created_at
          ? new Date(leave.created_at).toLocaleDateString('en-GB')
          : ''),
        fromDate: leave.fromDate || (leave.start_date
          ? new Date(leave.start_date).toLocaleDateString('en-GB')
          : ''),
        toDate: leave.toDate || (leave.end_date
          ? new Date(leave.end_date).toLocaleDateString('en-GB')
          : ''),
        leaveType: leave.leave_type || leave.leaveType,
        leaveAllowed: leave.leave_allowed || leave.leaveAllowed,
        leave_days: leave.leave_days || leave.days || 0,
        status: leave.status || 'Pending'
      }));

      setLeaveRequests(formattedLeaves);


      let totalVal = 0;
      let takenVal = 0;
      let remainingVal = 0;

      const types = {
        CL: { carryForward: 0, monthlyCredit: 0, monthlyRemaining: 0, totalAvailable: 0, yearlyUsed: 0, yearlyRemaining: 0 },
        EL: { carryForward: 0, monthlyCredit: 0, monthlyRemaining: 0, totalAvailable: 0, yearlyUsed: 0, yearlyRemaining: 0 },
        ML: { carryForward: 0, monthlyCredit: 0, monthlyRemaining: 0, totalAvailable: 0, yearlyUsed: 0, yearlyRemaining: 0 }
      };

      if (balanceData) {
        if (source === 'policy') {

          totalVal = parseFloat(balanceData.yearly_CL || 0) +
            parseFloat(balanceData.yearly_EL || 0) +
            parseFloat(balanceData.yearly_ML || 0);
          takenVal = 0;
          remainingVal = totalVal;

          ['CL', 'EL', 'ML'].forEach(t => {
            types[t].monthlyCredit = parseFloat(balanceData[`monthly_${t}`] || 0);
            types[t].monthlyRemaining = parseFloat(balanceData[`monthly_${t}`] || 0);
            types[t].totalAvailable = parseFloat(balanceData[`monthly_${t}`] || 0);
            types[t].yearlyRemaining = parseFloat(balanceData[`yearly_${t}`] || 0);
          });
        } else {

          ['CL', 'EL', 'ML'].forEach(t => {
            const cf = parseFloat(balanceData[`carried_forward_${t}`] || 0);
            const monthlyRem = parseFloat(balanceData[`monthly_remaining_${t}`] || 0);
            const monthlyCredit = parseFloat(balanceData[`policy_monthly_${t}`] || 0);
            const yearlyUsed = parseFloat(balanceData[`yearly_used_${t}`] || 0);
            const yearlyRem = parseFloat(balanceData[`yearly_remaining_${t}`] || 0);

            types[t].carryForward = cf;
            types[t].monthlyCredit = monthlyCredit;
            types[t].monthlyRemaining = monthlyRem;
            types[t].totalAvailable = monthlyRem + cf;
            types[t].yearlyUsed = yearlyUsed;
            types[t].yearlyRemaining = yearlyRem;
          });

          totalVal = parseFloat(balanceData.policy_yearly_CL || 0) +
            parseFloat(balanceData.policy_yearly_EL || 0) +
            parseFloat(balanceData.policy_yearly_ML || 0);
          takenVal = types.CL.yearlyUsed + types.EL.yearlyUsed + types.ML.yearlyUsed;
          remainingVal = types.CL.totalAvailable + types.EL.totalAvailable + types.ML.totalAvailable;
        }
      }

      const pendingCount = formattedLeaves.filter(l => l.status === 'Pending').length;
      const approvedCount = formattedLeaves.filter(l => l.status === 'Approved').length;
      const rejectedCount = formattedLeaves.filter(l => l.status === 'Rejected').length;

      setLeaveSummary({
        totalAnnualLeaves: totalVal,
        leavesTaken: takenVal,
        remainingLeaves: remainingVal,
        pendingLeaves: pendingCount,
        approvedLeaves: approvedCount,
        rejectedLeaves: rejectedCount,
        types
      });

    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  useEffect(() => {
    if (slug && emp_id) {
      fetchLeaves();
    }
  }, [slug, emp_id]);












































  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    leaveAllowed: ""
  });

  const [editFormData, setEditFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    leaveAllowed: ""
  });

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const leaveTypes = [
    { label: "Casual Leave (CL)", value: "CL" },
    { label: "Earned Leave (EL)", value: "EL" },
    { label: "Medical Leave (ML)", value: "ML" }
  ];

  const leaveAllowedOptions = [
    "Full Day",
    "Half Day"
  ];


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
    if (editErrors[name]) {
      setEditErrors({
        ...editErrors,
        [name]: ""
      });
    }
  };

  const validateForm = (data, isEdit = false) => {
    const newErrors = {};
    if (!data.leaveType) newErrors.leaveType = "Please select leave type";
    if (!data.fromDate) newErrors.fromDate = "Please select from date";
    if (!data.toDate) newErrors.toDate = "Please select to date";
    if (!data.reason) newErrors.reason = "Please fill out this field";
    if (!data.leaveAllowed) newErrors.leaveAllowed = "Please select leave allowed";

    if (isEdit) {
      setEditErrors(newErrors);
    } else {
      setErrors(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const timeDiff = to.getTime() - from.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return dayDiff > 0 ? dayDiff : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canApply) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You do not have permission to apply for leaves.",
      });
      return;
    }
    if (!validateForm(formData)) return;

    try {
      const leave_days = calculateDays(formData.fromDate, formData.toDate);

      const leaveData = {
        employee_id: user.employee_id,
        employee_name: user.name,
        leave_type: formData.leaveType,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        reason: formData.reason,
        leave_allowed: formData.leaveAllowed,
        leave_days: leave_days
      };

      console.log("Sending leave data:", leaveData);
      console.log("URL:", `${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/${slug}/${user.employee_id || user.company_id}`);

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/leaves/${slug}/${user.employee_id || user.company_id}`,
        leaveData
      );

      console.log("Response:", res.data);

      setFormData({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
        leaveAllowed: "",
        leave_days: "",
        employee_name: user.name
      });
      setShowAddForm(false);

      Swal.fire('Success', 'Leave request submitted successfully', 'success');


      fetchLeaves();
    } catch (err) {
      console.error("Error submitting leave:", err);

      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to submit leave request';
      Swal.fire('Error', errorMessage, 'error');
    }
  };


  const handleEdit = (leave) => {
    setSelectedLeave(leave);
    setEditFormData({
      leaveType: leave.leaveType,
      fromDate: formatDateForInput(leave.fromDate),
      toDate: formatDateForInput(leave.toDate),
      reason: leave.reason,
      leaveAllowed: leave.leaveAllowed
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateForm(editFormData, true)) return;

    const API_BASE = import.meta.env.VITE_HRMS_BASE_URL || `${import.meta.env.VITE_HRMS_BASE_URL}`;

    try {
      const res = await axios.put(`${API_BASE}/api/leaves/${selectedLeave.id}`, {
        ...editFormData,
        employee_id: selectedLeave.employee_id || user.company_id,
        company_id: selectedLeave.company_id || user.company_id || user.company_id,
      });

      let updatedLeave;
      if (res && res.data && typeof res.data === 'object' && (res.data.id || res.data.employee_id)) {
        updatedLeave = res.data;
      } else {
        updatedLeave = {
          ...selectedLeave,
          fromDate: formatDate(editFormData.fromDate),
          toDate: formatDate(editFormData.toDate),
          days: calculateDays(editFormData.fromDate, editFormData.toDate),
          leaveType: editFormData.leaveType,
          reason: editFormData.reason,
          leaveAllowed: editFormData.leaveAllowed,
        };
      }

      setLeaveRequests(prev => prev.map(leave => leave.id === selectedLeave.id ? updatedLeave : leave));
      setEditModalOpen(false);
      setSelectedLeave(null);
      setEditFormData({ leaveType: "", fromDate: "", toDate: "", reason: "", leaveAllowed: "" });
      Swal.fire('Success', 'Leave updated successfully', 'success');
    } catch (err) {
      console.error('Edit leave error:', err);
      Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to update leave', 'error');
    }
  };


  const handleDelete = (leave) => {
    setSelectedLeave(leave);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const API_BASE = import.meta.env.VITE_HRMS_BASE_URL || `${import.meta.env.VITE_HRMS_BASE_URL}`;

      try {
        await axios.delete(`${API_BASE}/api/leaves/${selectedLeave.id}`);
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            await axios.delete(`${API_BASE}/api/leaves/delete/${selectedLeave.id}`);
          } catch (err2) {
            try {
              await axios.post(`${API_BASE}/api/leaves/delete`, { id: selectedLeave.id });
            } catch (err3) {
              throw err3 || err2 || err;
            }
          }
        } else {
          throw err;
        }
      }

      setLeaveRequests(leaveRequests.filter(leave => leave.id !== selectedLeave.id));
      setDeleteModalOpen(false);
      setSelectedLeave(null);
      Swal.fire('Deleted', 'Leave request deleted successfully', 'success');
    } catch (err) {
      console.error('Delete leave error:', err);
      const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete leave';
      Swal.fire('Error', String(message), 'error');
    }
  };

  const handleCancel = () => {
    setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "", leaveAllowed: "" });
    setErrors({});
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setSelectedLeave(null);
    setEditFormData({ leaveType: "", fromDate: "", toDate: "", reason: "", leaveAllowed: "" });
    setEditErrors({});
  };


  const filteredLeaves = leaveRequests.filter((leave) => {
    const type = leave.leaveType ? leave.leaveType.toLowerCase() : "";
    const reason = leave.reason ? leave.reason.toLowerCase() : "";
    const status = leave.status ? leave.status.toLowerCase() : "";

    return (
      type.includes(searchTerm.toLowerCase()) ||
      reason.includes(searchTerm.toLowerCase()) ||
      status.includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredLeaves.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedLeaves = filteredLeaves.slice(startIndex, startIndex + entriesPerPage);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return '📋';
    switch (status.toLowerCase()) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };


  const ProgressBar = ({ value, max, color }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="">
      <div className=" mx-auto p-4 md:p-6">

        <div className=" p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                {showAddForm ? (
                  "Add Leave"
                ) : (
                  <>
                    <Calendar className="w-6 h-6 text-emerald-600" />
                    My Leave
                  </>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                {showAddForm ? "Submit a new leave request" : "Manage your leave requests"}
              </p>
            </div>

            {showAddForm ? (
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
              </button>
            ) : canApply ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded flex items-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Leave
              </button>
            ) : null}
          </div>
        </div>


        {!showAddForm && (
          <>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

              <div className="bg-white rounded-2xl shadow-sm p-3 border border-blue-200">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[15px] text-gray-500 font-bold ">Total Annual Leaves</p>
                    <p className="text-sm font-bold text-gray-900 mt-2">{Number(leaveSummary.totalAnnualLeaves).toFixed(1)}</p>
                    <p className="text-[11px] text-gray-400 mt-1">days per year</p>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl shadow-sm p-3 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[15px] text-gray-500 font-bold ">Leaves Taken</p>
                    <p className="text-sm font-bold text-gray-900 mt-2">{Number(leaveSummary.leavesTaken).toFixed(1)}</p>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl shadow-sm p-3 border border-amber-200">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[15px] text-gray-500 font-bold ">Total Available</p>
                    <p className="text-sm font-bold text-gray-900 mt-2">{Number(leaveSummary.remainingLeaves).toFixed(1)}</p>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl shadow-sm p-3 border border-purple-200">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <Hourglass className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[15px] text-gray-500 font-bold ">Pending Requests</p>
                    <p className="text-sm font-bold text-gray-900 mt-2">{leaveSummary.pendingLeaves}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-gray-500">
                      <span className="text-green-600">✓ {leaveSummary.approvedLeaves} approved</span>
                      <span className="text-red-600">✗ {leaveSummary.rejectedLeaves} rejected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Leave Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b">Leave Type</th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b">Carry Forward (Prev)</th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b"></th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b">This Month Credit</th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b"></th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b">Total Available</th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b">Yearly Used</th>
                      <th className="px-4 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-b">Yearly Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {['CL', 'EL', 'ML'].map(type => {
                      const t = leaveSummary.types[type];
                      const label = type === 'CL' ? 'Casual Leave' : type === 'EL' ? 'Earned Leave' : 'Medical Leave';
                      const badgeColor = type === 'CL' ? 'bg-blue-100 text-blue-800' : type === 'EL' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
                      return (
                        <tr key={type} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 text-xs">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                              {type}
                            </span>
                            <span className="ml-2 text-gray-700">{label}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-medium text-amber-600">{t.carryForward.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-gray-400 font-bold text-base">+</td>
                          <td className="px-4 py-3 text-center text-xs font-medium text-blue-600">{t.monthlyRemaining.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-gray-400 font-bold text-base">=</td>
                          <td className="px-4 py-3 text-center text-xs font-bold text-green-700">{t.totalAvailable.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-xs font-medium text-red-500">{t.yearlyUsed.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-800">{t.yearlyRemaining.toFixed(1)}</td>
                        </tr>
                      );
                    })}

                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-sm text-gray-800">Total</td>
                      <td className="px-4 py-3 text-center text-sm text-amber-700">
                        {(leaveSummary.types.CL.carryForward + leaveSummary.types.EL.carryForward + leaveSummary.types.ML.carryForward).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400 font-bold text-lg">+</td>
                      <td className="px-4 py-3 text-center text-sm text-blue-700">
                        {(leaveSummary.types.CL.monthlyRemaining + leaveSummary.types.EL.monthlyRemaining + leaveSummary.types.ML.monthlyRemaining).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400 font-bold text-lg">=</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-green-800">
                        {(leaveSummary.types.CL.totalAvailable + leaveSummary.types.EL.totalAvailable + leaveSummary.types.ML.totalAvailable).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-red-600">
                        {(leaveSummary.types.CL.yearlyUsed + leaveSummary.types.EL.yearlyUsed + leaveSummary.types.ML.yearlyUsed).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-800">
                        {(leaveSummary.types.CL.yearlyRemaining + leaveSummary.types.EL.yearlyRemaining + leaveSummary.types.ML.yearlyRemaining).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}


        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">

            {leaveSummary.remainingLeaves > 0 && leaveSummary.remainingLeaves < 5 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center">
                  <span className="mr-2">⚠️</span>
                  You only have <strong className="mx-1">{Number(leaveSummary.remainingLeaves).toFixed(1)} days</strong> of leave remaining.
                </p>
              </div>
            )}

            {leaveSummary.remainingLeaves <= 0 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  You have no leave balance remaining, but you can still submit a request. It will be reviewed by your admin.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type *
                    </label>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.leaveType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {errors.leaveType && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.leaveType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date *
                    </label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.fromDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {errors.fromDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.fromDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason *
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter reason for leave"
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-200 ${errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {errors.reason && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.reason}
                      </p>
                    )}
                  </div>
                </div>


                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Allowed *
                    </label>
                    <select
                      name="leaveAllowed"
                      value={formData.leaveAllowed}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.leaveAllowed ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select Leave Duration</option>
                      {leaveAllowedOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.leaveAllowed && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.leaveAllowed}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date *
                    </label>
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.toDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {errors.toDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.toDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Days
                    </label>
                    <div className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-blue-50 text-blue-700 font-medium">
                      {calculateDays(formData.fromDate, formData.toDate)} days
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Calculated automatically based on selected dates
                    </p>
                  </div>


                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Leave Balance</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">Available:</span>
                      <span className={`text-sm font-bold ${leaveSummary.remainingLeaves < 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {Number(leaveSummary.remainingLeaves).toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-600">After this request:</span>
                      <span className={`text-sm font-bold ${leaveSummary.remainingLeaves - calculateDays(formData.fromDate, formData.toDate) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {(Number(leaveSummary.remainingLeaves) - calculateDays(formData.fromDate, formData.toDate)).toFixed(1)} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-medium rounded transition-colors duration-200 flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}


        {!showAddForm && (
          <>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 w-48"
                    placeholder="Search leaves..."
                  />
                </div>
              </div>
            </div>


            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        From - To Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedLeaves.length > 0 ? (
                      paginatedLeaves.map((leave) => (
                        <tr key={leave.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {leave.appliedDate || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="font-medium">{leave.fromDate}</div>
                            <div className="text-gray-500">to {leave.toDate}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {leave.leave_days} day{leave.leave_days !== 1 ? 's' : ''}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {leave.leaveType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={leave.reason}>
                              {leave.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                                <span className="mr-1">{getStatusIcon(leave.status)}</span>
                                {leave.status}
                              </span>
                              {leave.status === 'Rejected' && leave.rejectReason && leave.rejectReason !== '-' && (
                                <div className="text-xs text-red-600 mt-1" title={leave.rejectReason}>
                                  {leave.rejectReason.length > 30
                                    ? leave.rejectReason.substring(0, 30) + '...'
                                    : leave.rejectReason
                                  }
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <div className="text-gray-500 text-lg font-medium">No leave requests found</div>
                            <div className="text-gray-400 text-sm mt-1">
                              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new leave request'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>


              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {paginatedLeaves.length > 0 ? startIndex + 1 : 0} to {startIndex + paginatedLeaves.length} of {filteredLeaves.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-4 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;