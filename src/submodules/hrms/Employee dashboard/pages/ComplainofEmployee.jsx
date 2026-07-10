

import React, { useState, useEffect } from 'react';
import useAuth from "../../../../hooks/useAuth";
import axios from "axios";
import Myservicerequest from './Myservicerequest';
import { usePermission } from '../../../../hooks/usePermission';

const ComplainOfEmployeeWrapper = () => {
  const { hasAccess } = usePermission();
  const showComplaints = hasAccess("hrms.self_service.complain");
  const showServiceRequests = hasAccess("hrms.self_service.service_request");

  const [activeTab, setActiveTab] = useState(() => {
    if (showComplaints) return 'complaints';
    if (showServiceRequests) return 'servicerequest';
    return 'complaints';
  });

  const [complaintCount, setComplaintCount] = useState(0);
  const [serviceRequestCount, setServiceRequestCount] = useState(0);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const company_id = user?.company_id;
        const emp_id = user?.employeeProfileId;
        const employeeId = user?.employee_id;
        const slug = user?.slug;

        if (!slug) return;


        if (emp_id && showComplaints) {
          const compRes = await axios.get(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/employee/${emp_id}/${slug}`
          );
          setComplaintCount(compRes.data?.data?.length || 0);
        }


        if (employeeId && showServiceRequests) {
          const srRes = await axios.get(
            `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/employee-search?employeeId=${employeeId}&company_id=${company_id}&slug=${slug}`,);
          setServiceRequestCount(srRes.data?.data?.length || 0);

        }

      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, [user, showComplaints, showServiceRequests]);

  useEffect(() => {
    const handleRefresh = () => {

      const triggerFetch = async () => {
        try {
          const company_id = user?.company_id;
          const emp_id = user?.employeeProfileId;
          const employeeId = user?.employee_id;
          const slug = user?.slug;
          if (!slug) return;
          if (emp_id && showComplaints) {
            const compRes = await axios.get(
              `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/employee/${emp_id}/${slug}`
            );
            setComplaintCount(compRes.data?.data?.length || 0);
          }
          if (employeeId && showServiceRequests) {
            const srRes = await axios.get(
              `${import.meta.env.VITE_HRMS_BASE_URL}/api/service-requests/employee-search?employeeId=${employeeId}&company_id=${company_id}&slug=${slug}`,);
            setServiceRequestCount(srRes.data?.data?.length || 0);
          }
        } catch (e) {
          console.error(e);
        }
      };
      triggerFetch();
    };

    window.addEventListener("refreshCounts", handleRefresh);

    return () => {
      window.removeEventListener("refreshCounts", handleRefresh);
    };
  }, [user, showComplaints, showServiceRequests]);


  const showTabBar = showComplaints && showServiceRequests;

  return (
    <div className="bg-gray-50  flex flex-col">
      {showTabBar && (
        <div className="px-4 sm:px-6 pt-4 pb-3  z-10 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={() => setActiveTab('complaints')}
                className={`
            px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
            flex items-center gap-2 shadow-sm
            ${activeTab === 'complaints'
                    ? 'bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-600/30 shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-md border border-gray-200'
                  }
          `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Complaints</span>
                <span className={`
            text-xs font-bold px-2 py-0.5 rounded-full ml-1
            ${activeTab === 'complaints' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}
          `}>{complaintCount}</span>
              </button>

              <button
                onClick={() => setActiveTab('servicerequest')}
                className={`
            px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
            flex items-center gap-2 shadow-sm
            ${activeTab === 'servicerequest'
                    ? 'bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-600/30 shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-md border border-gray-200'
                  }
          `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Service Request</span>
                <span className={`
            text-xs font-bold px-2 py-0.5 rounded-full ml-1
            ${activeTab === 'servicerequest' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}
          `}>{serviceRequestCount}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 w-full">
        {activeTab === 'complaints' && showComplaints && <ComplainOfEmployeeContent />}
        {activeTab === 'servicerequest' && showServiceRequests && <Myservicerequest />}
      </div>
    </div>
  );
};

const ComplainOfEmployeeContent = () => {
  const { has } = usePermission();
  const canRaise = has("hrms.self_service.complain.raise");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [complains, setComplains] = useState([]);
  const { user } = useAuth();

  const emp_id = user?.employeeProfileId;





  const [formData, setFormData] = useState({
    complainDetails: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canRaise) {
      alert("You do not have permission to submit a complaint");
      return;
    }

    try {
      const payload = {
        employee_id: emp_id,
        slug: user.slug,
        complain: formData.complainDetails
      };


      await axios.post(`${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints`, payload);


      fetchComplaints();

      setFormData({ complainDetails: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding complaint:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/${id}`);
      fetchComplaints();
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
  };



  const fetchComplaints = async () => {
    try {

      if (!emp_id) return;

      const response = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee-complaints/employee/${emp_id}/${user.slug}`
      );



      setComplains(response.data?.data || []);

    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };


  useEffect(() => {
    if (emp_id) {
      fetchComplaints();
    }
  }, [emp_id]);


  const handleCancel = () => {
    setFormData({ complainDetails: "" });
    setShowAddForm(false);
  };


  const filteredComplains = complains.filter(complain =>
    complain.complain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredComplains.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedComplains = filteredComplains.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">


        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {showAddForm ? "Add New Complain" : "Employee Complaints"}
              </h1>
              <p className="text-gray-600">
                {showAddForm ? "Submit a new complaint" : "Manage and track all employee complaints"}
              </p>
            </div>

            {!showAddForm && canRaise && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Complaint
              </button>
            )}
          </div>
        </div>


        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Complaint Details</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Describe your complaint *
                </label>
                <textarea
                  name="complainDetails"
                  value={formData.complainDetails}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  placeholder="Please provide detailed information about your complaint..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        )}


        {!showAddForm && (
          <div className="space-y-6">


            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">entries</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Search:</span>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                      placeholder="Search complaints..."
                    />
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">


              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">All Complaints</h3>
              </div>


              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Complaint
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedComplains.length > 0 ? (
                      paginatedComplains.map((complain) => (
                        <tr key={complain.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="max-w-md">
                              <p className="text-sm text-gray-900 line-clamp-2">
                                {complain.complain}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {complain.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              {complain.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">

                              <button
                                onClick={() => handleDelete(complain.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-500 mb-2">No complaints found</p>
                            <p className="text-sm text-gray-400">Start by submitting your first complaint</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>


              {paginatedComplains.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-medium">{paginatedComplains.length}</span> of{" "}
                      <span className="font-medium">{filteredComplains.length}</span> complaints
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ComplainOfEmployeeWrapper;