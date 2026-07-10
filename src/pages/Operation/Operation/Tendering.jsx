import React, { useState } from "react";
import {
  FaPlus,
  FaFileAlt,
  FaDownload,
  FaShare,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaTrash,
  FaPaperclip,
  FaUser,
  FaDollarSign,
  FaListAlt,
} from "react-icons/fa";
import { HiDocumentText, HiCheckCircle } from "react-icons/hi";

import operationApi from "../../../api/operation";

const Tendering = () => {
  const [loading, setLoading] = useState(false);
  const [tenders, setTenders] = useState([]);
  const [currentTender, setCurrentTender] = useState({
    item: "",
    description: "",
    applicants: [],
    start_date: "",
    end_date: "",
  });
  const [newApplicant, setNewApplicant] = useState({
    name: "",
    email: "",
  });
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [workOrderForm, setWorkOrderForm] = useState({
    subject: "",
    note: "",
    completionDate: "",
    scopeOfWork: [
      { id: 1, description: "", unit: "", quantity: "", rate: "", amount: "" },
    ],
    signature: null,
    terms: false,
    paymentTerms: false,
  });
  const [issuedWorkOrders, setIssuedWorkOrders] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [recentWorkOrder, setRecentWorkOrder] = useState(null);

  React.useEffect(() => {
    fetchTenders();
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const res = await operationApi.getTenderWorkOrders();

      const normalizedWorkOrders = (res.data.data || []).map((workOrder) => ({
        ...workOrder,
        applicant: workOrder.applicant?.name || "Unknown",
        email: workOrder.applicant?.email || "N/A",
        tender: workOrder.tender?.item || "Unknown",
        subject: workOrder.subject || "Unknown",
        completionDate: workOrder.completion_date
          ? new Date(workOrder.completion_date).toLocaleDateString()
          : "Unknown",
        issueDate: workOrder.issue_date
          ? new Date(workOrder.issue_date).toLocaleDateString()
          : "Unknown",
        note: workOrder.note || "Unknown",
        totalAmount: parseFloat(workOrder.total_amount) || 0,
        scopeOfWork: workOrder.items || [],
      }));
      setIssuedWorkOrders(normalizedWorkOrders);
    } catch (err) {
      console.error("Error fetching work orders:", err);
    }
  };

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getTenders();

      const normalizedTenders = response.data.data.map((tender) => ({
        ...tender,
        applicants: (tender.applicants || []).map((applicant) => ({
          ...applicant,
          name: typeof applicant.name === "string" ? applicant.name : "Unknown",
          email:
            typeof applicant.email === "string" ? applicant.email : "Unknown",
          status:
            typeof applicant.status === "string" ? applicant.status : "Applied",
        })),
      }));
      setTenders(normalizedTenders || []);
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTenderChange = (e) => {
    const { name, value } = e.target;
    setCurrentTender((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplicantChange = (e) => {
    const { name, value } = e.target;
    setNewApplicant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkOrderChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWorkOrderForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleScopeOfWorkChange = (id, field, value) => {
    setWorkOrderForm((prev) => ({
      ...prev,
      scopeOfWork: prev.scopeOfWork.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === "quantity" || field === "rate") {
            const quantity = field === "quantity" ? value : item.quantity;
            const rate = field === "rate" ? value : item.rate;
            updatedItem.amount =
              quantity && rate
                ? (parseFloat(quantity) * parseFloat(rate)).toFixed(2)
                : "";
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const addScopeOfWork = () => {
    setWorkOrderForm((prev) => ({
      ...prev,
      scopeOfWork: [
        ...prev.scopeOfWork,
        {
          id: Date.now(),
          description: "",
          unit: "",
          quantity: "",
          rate: "",
          amount: "",
        },
      ],
    }));
  };

  const removeScopeOfWork = (id) => {
    if (workOrderForm.scopeOfWork.length > 1) {
      setWorkOrderForm((prev) => ({
        ...prev,
        scopeOfWork: prev.scopeOfWork.filter((item) => item.id !== id),
      }));
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWorkOrderForm((prev) => ({
        ...prev,
        signature: URL.createObjectURL(file),
      }));
    }
  };

  const addApplicant = () => {
    if (newApplicant.name && newApplicant.email) {
      const applicant = {
        ...newApplicant,
        id: Date.now(),
        status: "Applied",
        appliedDate: new Date().toLocaleDateString(),
      };

      setCurrentTender((prev) => ({
        ...prev,
        applicants: [...prev.applicants, applicant],
      }));

      setNewApplicant({
        name: "",
        email: "",
      });
    }
  };

  const saveTender = async () => {
    if (
      currentTender.item &&
      currentTender.start_date &&
      currentTender.end_date
    ) {
      try {
        setLoading(true);

        await operationApi.createTender(currentTender);
        setCurrentTender({
          item: "",
          description: "",
          applicants: [],
          start_date: "",
          end_date: "",
        });
        setActiveTab("view");
        fetchTenders();
      } catch (error) {
        console.error("Error saving tender:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const shortlistApplicant = (tenderId, applicantId) => {
    setTenders((prev) =>
      prev.map((tender) => {
        if (tender.id === tenderId) {
          const updatedApplicants = tender.applicants.map((applicant) => {
            if (applicant.id === applicantId) {
              return { ...applicant, status: "Shortlisted" };
            }
            return applicant;
          });
          return { ...tender, applicants: updatedApplicants };
        }
        return tender;
      }),
    );
  };

  const issueWorkOrder = (tenderId, applicantId) => {
    const tender = tenders.find((t) => t.id === tenderId);
    const applicant = tender?.applicants.find((a) => a.id === applicantId);

    if (tender && applicant) {
      setSelectedApplicant({
        tender: tender.item,
        applicant: applicant.name,
        email: applicant.email,
        tenderId,
        applicantId,
      });

      setWorkOrderForm({
        subject: "",
        note: "",
        completionDate: "",
        scopeOfWork: [
          {
            id: 1,
            description: "",
            unit: "",
            quantity: "",
            rate: "",
            amount: "",
          },
        ],
        signature: null,
        terms: false,
        paymentTerms: false,
      });

      setShowWorkOrderModal(true);
    }
  };

  const submitWorkOrder = async () => {
    if (!workOrderForm.terms || !workOrderForm.paymentTerms) {
      alert("Please accept both terms and conditions and payment terms");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        tender_id: selectedApplicant.tenderId,
        applicant_id: selectedApplicant.applicantId,
        subject: workOrderForm.subject,
        note: workOrderForm.note,
        completion_date: workOrderForm.completionDate,
        terms_accepted: workOrderForm.terms,
        payment_terms_accepted: workOrderForm.paymentTerms,
        items: workOrderForm.scopeOfWork.map((item) => ({
          description: item.description,
          unit: item.unit,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
        })),
      };
      const res = await operationApi.createTenderWorkOrder(payload);
      const workOrder = res.data.data;
      setRecentWorkOrder(workOrder);
      setShowWorkOrderModal(false);
      setShowSuccessModal(true);
      fetchTenders();
      fetchWorkOrders();
    } catch (err) {
      console.error("Error submitting work order:", err);
      alert(err.response?.data?.message || "Failed to create work order.");
    } finally {
      setLoading(false);
    }
  };

  const downloadWorkOrder = () => {
    if (!recentWorkOrder) return;

    const workOrderContent = generateWorkOrderContent(recentWorkOrder);
    const blob = new Blob([workOrderContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Work-Order-${recentWorkOrder.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareWorkOrder = () => {
    if (!recentWorkOrder) return;

    const workOrderContent = generateWorkOrderContent(recentWorkOrder);

    if (navigator.share) {
      navigator
        .share({
          title: `Work Order ${recentWorkOrder.id}`,
          text: workOrderContent,
          url: window.location.href,
        })
        .catch((error) => {});
    } else {
      navigator.clipboard
        .writeText(workOrderContent)
        .then(() => alert("Work order copied to clipboard!"))
        .catch(() => alert("Failed to copy work order to clipboard"));
    }
  };

  const generateWorkOrderContent = (workOrder) => {
    return `
WORK ORDER
===========

Reference No: ${workOrder.id}
Issue Date: ${workOrder.issueDate}

TO: ${workOrder.applicant}
Email: ${workOrder.email || "N/A"}

TENDER: ${workOrder.tender}
SUBJECT: ${workOrder.subject}

TIMELINE:
- Work Completion Date: ${workOrder.completionDate}

SCOPE OF WORK:
${
  workOrder.scopeOfWork
    ? workOrder.scopeOfWork
        .map(
          (item, index) => `
${index + 1}. ${item.description}
   Unit: ${item.unit}
   Quantity: ${item.quantity}
   Rate: $${item.rate}
   Amount: $${item.amount}
`,
        )
        .join("")
    : "No items specified"
}

TOTAL AMOUNT: $${(workOrder.totalAmount || 0).toFixed(2)}

NOTES:
${workOrder.note}

TERMS & CONDITIONS:
- Work must be completed by specified completion date
- Quality standards must be maintained
- All safety regulations must be followed
- Regular progress updates required

PAYMENT TERMS:
- 30% advance payment upon work order issuance
- 40% payment upon 50% work completion
- 20% payment upon substantial completion
- 10% retention amount after final inspection

This work order is issued electronically and is legally binding.

---
Tender Management System
    `;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shortlisted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Work Order Issued":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const removeApplicant = (applicantId) => {
    setCurrentTender((prev) => ({
      ...prev,
      applicants: prev.applicants.filter((app) => app.id !== applicantId),
    }));
  };

  const totalAmount = workOrderForm.scopeOfWork.reduce((sum, item) => {
    return sum + (parseFloat(item.amount) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Tender Management System
          </h1>
          <p className="text-gray-600">
            Create and manage tender applications efficiently
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "create"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Tender
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "view"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              View Tenders ({tenders.length})
            </button>
            <button
              onClick={() => setActiveTab("work-orders")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "work-orders"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Work Orders ({issuedWorkOrders.length})
            </button>
          </div>
        </div>

        {activeTab === "create" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Create New Tender
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tender Item *
                  </label>
                  <input
                    type="text"
                    name="item"
                    value={currentTender.item}
                    onChange={handleTenderChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter tender item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={currentTender.description}
                    onChange={handleTenderChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={currentTender.start_date}
                    onChange={handleTenderChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={currentTender.end_date}
                    onChange={handleTenderChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Add Applicants
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="name"
                    value={newApplicant.name}
                    onChange={handleApplicantChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Applicant Name"
                  />

                  <input
                    type="email"
                    name="email"
                    value={newApplicant.email}
                    onChange={handleApplicantChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Email Address"
                  />
                </div>

                <button
                  onClick={addApplicant}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200 font-medium flex items-center gap-2"
                >
                  <FaPlus className="w-5 h-5" />
                  <span>Add Applicant</span>
                </button>
              </div>

              {currentTender.applicants.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Applicants ({currentTender.applicants.length})
                  </h3>
                  <div className="space-y-3">
                    {currentTender.applicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {applicant.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {applicant.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied: {applicant.appliedDate}
                          </p>
                        </div>
                        <button
                          onClick={() => removeApplicant(applicant.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={saveTender}
                  disabled={
                    !currentTender.item ||
                    !currentTender.start_date ||
                    !currentTender.end_date
                  }
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Tender
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "view" && (
          <div className="space-y-6">
            {tenders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <HiDocumentText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Tenders Created
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first tender
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Create Tender
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {tenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6 border-b">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {tender.item}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {tender.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {(tender.applicants || []).length} Applicants
                          </span>
                          <span className="text-sm text-gray-500">
                            {tender.start_date} to {tender.end_date}
                          </span>
                          {(tender.applicants || []).length > 0 && (
                            <button
                              onClick={() => {
                                const shortlisted = tender.applicants.filter(
                                  (a) => a.status === "Shortlisted",
                                );
                                if (shortlisted.length > 0) {
                                  issueWorkOrder(tender.id, shortlisted[0].id);
                                } else {
                                  alert(
                                    "Please shortlist an applicant first before issuing a work order.",
                                  );
                                }
                              }}
                              className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition duration-200"
                            >
                              Issue Work Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="font-medium text-gray-700 mb-4">
                        Applicants
                      </h4>
                      {!tender.applicants || tender.applicants.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No applicants yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {tender.applicants.map((applicant) => (
                            <div
                              key={applicant.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {typeof applicant.name === "string" &&
                                    applicant.name
                                      ? applicant.name.charAt(0).toUpperCase()
                                      : "?"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {typeof applicant.name === "string"
                                      ? applicant.name
                                      : "Unknown"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {typeof applicant.email === "string"
                                      ? applicant.email
                                      : "Unknown"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(typeof applicant.status === "string" ? applicant.status : "Unknown")}`}
                                >
                                  {typeof applicant.status === "string"
                                    ? applicant.status
                                    : "Unknown"}
                                </span>
                                {applicant.status !== "Shortlisted" &&
                                  applicant.status !== "Work Order Issued" && (
                                    <button
                                      onClick={() =>
                                        shortlistApplicant(
                                          tender.id,
                                          applicant.id,
                                        )
                                      }
                                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition duration-200"
                                    >
                                      Shortlist
                                    </button>
                                  )}
                                {applicant.status === "Shortlisted" && (
                                  <button
                                    onClick={() =>
                                      issueWorkOrder(tender.id, applicant.id)
                                    }
                                    className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition duration-200"
                                  >
                                    Issue Work Order
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "work-orders" && (
          <div className="space-y-6">
            {issuedWorkOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <HiDocumentText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Work Orders Issued
                </h3>
                <p className="text-gray-500 mb-4">
                  Work orders will appear here after issuance
                </p>
                <button
                  onClick={() => setActiveTab("view")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  View Tenders
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {issuedWorkOrders.map((workOrder) => (
                  <div
                    key={workOrder.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6 border-b">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {workOrder.id}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {workOrder.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Issued: {workOrder.issueDate}
                          </span>
                          <span className="text-sm text-gray-500">
                            Amount: ${(workOrder.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Applicant</p>
                          <p className="font-medium text-gray-800">
                            {workOrder.applicant}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tender</p>
                          <p className="font-medium text-gray-800">
                            {workOrder.tender}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Completion Date
                          </p>
                          <p className="font-medium text-gray-800">
                            {workOrder.completionDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Items</p>
                          <p className="font-medium text-gray-800">
                            {workOrder.scopeOfWork
                              ? workOrder.scopeOfWork.length
                              : 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setRecentWorkOrder(workOrder);
                            downloadWorkOrder();
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                        >
                          <FaDownload className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => {
                            setRecentWorkOrder(workOrder);
                            shareWorkOrder();
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
                        >
                          <FaShare className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showWorkOrderModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="bg-linear-to-r from-blue-600 to-purple-700 px-3 py-3 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">WORK ORDER FORM</h3>
                  <p className="text-blue-100 mt-1 text-sm">
                    Official Work Order Application
                  </p>
                </div>
                <button
                  onClick={() => setShowWorkOrderModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">1</span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800">
                        Recipient Information
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            TO
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {selectedApplicant.applicant}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedApplicant.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            TENDER ITEM
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {selectedApplicant.tender}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">2</span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800">
                        Work Order Details
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <span className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-green-500" />
                            Today's Date
                          </span>
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium">
                          {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <span className="flex items-center gap-2">
                            <FaClock className="w-4 h-4 text-blue-500" />
                            Work Completion Date *
                          </span>
                        </label>
                        <input
                          type="date"
                          name="completionDate"
                          value={workOrderForm.completionDate}
                          onChange={handleWorkOrderChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <FaEdit className="w-4 h-4 text-purple-500" />
                          Subject *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={workOrderForm.subject}
                        onChange={handleWorkOrderChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter work order subject"
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <FaListAlt className="w-4 h-4 text-orange-500" />
                          Additional Notes
                        </span>
                      </label>
                      <textarea
                        name="note"
                        value={workOrderForm.note}
                        onChange={handleWorkOrderChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter any additional notes or special instructions..."
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">3</span>
                        </div>
                        <h4 className="text-xl font-semibold text-gray-800">
                          Scope of Work
                        </h4>
                      </div>
                      <button
                        onClick={addScopeOfWork}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              SL No
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Scope of Work Description
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Unit Rate ($)
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Amount ($)
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {workOrderForm.scopeOfWork.map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleScopeOfWorkChange(
                                      item.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Describe the work item..."
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) =>
                                    handleScopeOfWorkChange(
                                      item.id,
                                      "rate",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="p-2 bg-gray-50 border border-gray-300 rounded text-gray-700">
                                  ${item.amount || "0.00"}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => removeScopeOfWork(item.id)}
                                  disabled={
                                    workOrderForm.scopeOfWork.length === 1
                                  }
                                  className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <FaTrash className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 border-t">
                            <td
                              colSpan="3"
                              className="px-6 py-4 text-right text-sm font-semibold text-gray-700"
                            >
                              TOTAL AMOUNT:
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                              ${totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="mb-8 gap-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">4</span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800">
                        Authorization
                      </h4>
                    </div>

                    <div className=" gap-8">
                      <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Digital Signature Upload
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors h-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            className="hidden"
                            id="signature-upload"
                          />
                          <label
                            htmlFor="signature-upload"
                            className="cursor-pointer flex flex-col items-center justify-center h-full"
                          >
                            <FaPaperclip className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600">
                              {workOrderForm.signature
                                ? "Signature uploaded"
                                : "Click to upload signature"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, PDF up to 5MB
                            </p>
                          </label>
                        </div>
                      </div>

                      <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Terms & Conditions
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-48 overflow-y-auto">
                          <div className="text-sm text-gray-600 space-y-2">
                            <p className="font-semibold">
                              By issuing this work order, you agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>
                                Complete all work by the specified completion
                                date
                              </li>
                              <li>
                                Maintain quality standards as per tender
                                requirements
                              </li>
                              <li>
                                Comply with all safety regulations and local
                                laws
                              </li>
                              <li>Provide regular progress updates</li>
                              <li>
                                Submit all required documentation upon
                                completion
                              </li>
                              <li>Obtain necessary permits and approvals</li>
                              <li>Carry adequate insurance coverage</li>
                              <li>
                                Rectify any defects during warranty period
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              name="terms"
                              checked={workOrderForm.terms}
                              onChange={handleWorkOrderChange}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              I accept all terms and conditions
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-2 lg:col-span-1">
                        <label className="block font-bold text-sm  text-gray-700 mb-3">
                          Payment Terms
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-48 overflow-y-auto">
                          <div className="text-sm text-gray-600 space-y-2">
                            <p className="font-semibold">
                              Payment Schedule & Terms:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>
                                30% advance payment upon work order issuance
                              </li>
                              <li>40% payment upon 50% work completion</li>
                              <li>20% payment upon substantial completion</li>
                              <li>
                                10% retention amount after final inspection
                              </li>
                              <li>
                                All payments subject to 30 days from invoice
                              </li>
                              <li>
                                Retention period: 12 months from completion
                              </li>
                              <li>
                                Late payments subject to 1.5% monthly interest
                              </li>
                              <li>All taxes and duties extra as applicable</li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              name="paymentTerms"
                              checked={workOrderForm.paymentTerms}
                              onChange={handleWorkOrderChange}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              I agree to the payment terms
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      onClick={() => setShowWorkOrderModal(false)}
                      className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitWorkOrder}
                      disabled={
                        !workOrderForm.subject ||
                        !workOrderForm.completionDate ||
                        !workOrderForm.terms ||
                        !workOrderForm.paymentTerms
                      }
                      className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-700 text-white rounded-lg hover:from-blue-700 hover:to-purple-800 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <span className="flex items-center gap-2">
                        <HiCheckCircle className="w-5 h-5" />
                        Issue Work Order
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && recentWorkOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Work Order Issued!
              </h3>
              <p className="text-gray-600 mb-6">
                Work order{" "}
                <span className="font-semibold">{recentWorkOrder.id}</span> has
                been successfully issued to {recentWorkOrder.applicant}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={downloadWorkOrder}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
                >
                  <FaDownload className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={shareWorkOrder}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2"
                >
                  <FaShare className="w-5 h-5" />
                  Share
                </button>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab("work-orders");
                }}
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                View All Work Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tendering;
