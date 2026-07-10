import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useAuth from "../../../../hooks/useAuth";

const MessageToEmployee = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [activeTab, setActiveTab] = useState("designation");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { user, token: authToken } = useAuth();


  const token = authToken || user?.token;

  const [messages, setMessages] = useState([]);

  const [formData, setFormData] = useState({
    designation: "",
    heading: "",
    message: "",
    attachment: null,
    sendToAll: false,
    selectedEmployees: [],
    searchEmployee: "",
    company_id: user?.company_id,
  });


  const fetchMessages = async () => {
    const companyId = user?.company_id;
    if (!companyId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/messages/company/all?company_id=${user.company_id}&slug=${user.slug}`);
       
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const companyId = user?.company_id;
      setFormData((prev) => ({ ...prev, company_id: companyId }));
      fetchMessages();
    }
  }, [user?.id, user?.company_id]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const csaapToken = token;

        if (!csaapToken) {
          console.error("CSAAP token not found");
          return;
        }
        const res = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/all-employees`,
          {
            headers: {
              Authorization: `Bearer ${csaapToken}`,
            },
          },
        );


        if (res.data.success && Array.isArray(res.data.data)) {
          const grouped = res.data.data.reduce((acc, emp) => {
            const designation = emp.postApplied || "Others";

            if (!acc[designation]) acc[designation] = [];

            acc[designation].push({
              id: emp.id,
              name: emp.name,
              email: emp.email,
              avatar: emp.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase(),
              online: true,
            });

            return acc;
          }, {});

          setEmployees(grouped);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setEmployees({});
      }
    };

    fetchEmployees();
  }, [user?.token]);


  const [employees, setEmployees] = useState({});

  const designations = Object.keys(employees).map((name) => ({
    name,
    icon: "👤",
    count: employees[name]?.length || 0,
  }));


  const getAllEmployees = () => {
    return Object.values(employees).flat();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Unsupported file format. Please upload PDF, DOC, DOCX, JPG, or PNG.",
      );
      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 10MB.");
      e.target.value = "";
      return;
    }

    setFormData({
      ...formData,
      attachment: file,
    });
  };

  const handleDesignationClick = (designation) => {
    if (selectedDesignation === designation) {
      setSelectedDesignation(null);
      setFormData((prev) => ({ ...prev, selectedEmployees: [] }));
    } else {
      setSelectedDesignation(designation);
      setFormData((prev) => ({
        ...prev,
        sendToAll: false,
        selectedEmployees: employees[designation] || [],
      }));
    }
  };

  const handleSendToAll = () => {
    setSelectedDesignation("All");
    setFormData((prev) => ({
      ...prev,
      sendToAll: true,
      selectedEmployees: getAllEmployees(),
    }));
  };

  const handleEmployeeSelection = (employeeId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedEmployees.some(
        (emp) => emp.id === employeeId,
      );
      let updatedEmployees;

      if (isSelected) {
        updatedEmployees = prev.selectedEmployees.filter(
          (emp) => emp.id !== employeeId,
        );
      } else {
        const employeeToAdd = getAllEmployees().find(
          (emp) => emp.id === employeeId,
        );
        updatedEmployees = [...prev.selectedEmployees, employeeToAdd];
      }

      return {
        ...prev,
        selectedEmployees: updatedEmployees,
      };
    });
  };

  const handleSelectAllEmployees = () => {
    const currentEmployees =
      selectedDesignation === "All"
        ? getAllEmployees()
        : employees[selectedDesignation] || [];

    setFormData((prev) => ({
      ...prev,
      selectedEmployees: currentEmployees,
    }));
  };

  const getEmployeeName = (id) => {
    const allEmps = getAllEmployees();
    const emp = allEmps.find((e) => e.id === id);
    return emp ? emp.name : "Unknown";
  };

  const handleDeselectAllEmployees = () => {
    setFormData((prev) => ({
      ...prev,
      selectedEmployees: [],
    }));
  };

  const handleSave = async () => {
    const company_id = user?.company_id || user?.id;


    if (!company_id) {
      alert("Company ID is missing. Please log in again.");
      return;
    }

    if (!formData.heading || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.selectedEmployees.length === 0 && !formData.sendToAll) {
      alert("Please select at least one employee");
      return;
    }

    try {
      const sent_by = user?.name || "Admin";
      const recipients = formData.sendToAll
        ? getAllEmployees()
        : formData.selectedEmployees;

      for (let emp of recipients) {
        if (!emp || !emp.id) {
          console.warn("Skipping recipient without ID:", emp);
          continue;
        }
        const form = new FormData();
        form.append("slug", user.slug || "");
        form.append("company_id", company_id);
        form.append("employee_id", emp.id.toString());
        form.append("subject", formData.heading);
        form.append("message", formData.message);
        form.append("sent_by", sent_by);
        if (formData.attachment) form.append("attachment", formData.attachment);

        await axios.post(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/messages/send`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      alert("Message sent successfully!");


      await fetchMessages();

      handleCancel();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Check console for details.");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/messages/${id}`,
      );
      alert("Message deleted successfully!");
      fetchMessages();
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message.");
    }
  };

  const handleCancel = () => {
    setFormData({
      designation: "",
      heading: "",
      message: "",
      attachment: null,
      sendToAll: false,
      selectedEmployees: [],
      searchEmployee: "",
    });
    setSelectedDesignation(null);
    setActiveTab("designation");
    setShowAddForm(false);
  };

  const handleBackToList = () => {
    setShowAddForm(false);
    setSelectedDesignation(null);
    setActiveTab("designation");
  };

  const getCurrentEmployees = () => {
    if (selectedDesignation === "All") {
      return getAllEmployees();
    }
    return employees[selectedDesignation] || [];
  };

  const filteredEmployees = getCurrentEmployees().filter(
    (employee) =>
      employee.name
        .toLowerCase()
        .includes(formData.searchEmployee.toLowerCase()) ||
      employee.email
        .toLowerCase()
        .includes(formData.searchEmployee.toLowerCase()),
  );

  return (
    <div className=" ">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          {showAddForm ? (
            <button
              onClick={handleBackToList}
              className="bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full lg:w-auto justify-center"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to Messages
            </button>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full lg:w-auto justify-center"
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
              New Message
            </button>
          )}
        </div>


        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 mb-8 transform transition-all duration-300">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-1">
                  <div className="bg-linear-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100 sticky top-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      Select Recipients
                    </h2>


                    <div className="mb-6">
                      <label className="flex items-start space-x-3 p-4 bg-white rounded-xl border-2 border-emerald-200 hover:border-emerald-300 cursor-pointer transition-all duration-200 shadow-sm">
                        <input
                          type="checkbox"
                          checked={selectedDesignation === "All"}
                          onChange={handleSendToAll}
                          className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">
                              Send to All Employees
                            </span>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              {getAllEmployees().length} people
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Send this message to all employees across all
                            departments
                          </p>
                        </div>
                      </label>
                    </div>


                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        By Designation
                      </h3>
                      {designations.map((dept) => (
                        <div
                          key={dept.name}
                          onClick={() => handleDesignationClick(dept.name)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                            selectedDesignation === dept.name
                              ? "border-emerald-500 bg-emerald-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{dept.icon}</span>
                              <div>
                                <div className="text-sm font-semibold text-gray-800">
                                  {dept.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dept.count} employees
                                </div>
                              </div>
                            </div>
                            {selectedDesignation === dept.name && (
                              <svg
                                className="w-5 h-5 text-emerald-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>


                    {selectedDesignation && (
                      <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            {formData.selectedEmployees.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            employees selected
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                <div className="lg:col-span-2">
                  <div className="space-y-6">

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Message Heading <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
                        placeholder="Enter a clear and concise heading..."
                        required
                      />
                    </div>


                    {selectedDesignation && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-700">
                            {selectedDesignation === "All"
                              ? "All Employees"
                              : selectedDesignation}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={handleSelectAllEmployees}
                              className="px-3 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={handleDeselectAllEmployees}
                              className="px-3 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>


                        <div className="mb-3">
                          <input
                            type="text"
                            name="searchEmployee"
                            value={formData.searchEmployee}
                            onChange={handleInputChange}
                            placeholder="Search employees..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>


                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                          {filteredEmployees.map((employee) => (
                            <label
                              key={employee.id}
                              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 cursor-pointer transition-all duration-200"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedEmployees.some(
                                  (emp) => emp.id === employee.id,
                                )}
                                onChange={() =>
                                  handleEmployeeSelection(employee.id)
                                }
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="relative">
                                  <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {employee.avatar}
                                  </div>
                                  {employee.online && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {employee.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {employee.email}
                                  </p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}


                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Message Content
                      </h3>


                      <div className="flex flex-wrap gap-1 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {[
                          "B",
                          "I",
                          "U",
                          "S",
                          "Link",
                          "Image",
                          "List",
                          "Numbered",
                          "Quote",
                        ].map((tool) => (
                          <button
                            key={tool}
                            type="button"
                            className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                            onClick={() => {
                              switch (tool) {
                                case "B":
                                  document.execCommand("bold");
                                  break;
                                case "I":
                                  document.execCommand("italic");
                                  break;
                                case "U":
                                  document.execCommand("underline");
                                  break;
                                case "S":
                                  document.execCommand("strikeThrough");
                                  break;
                                case "Link":
                                  const url = prompt("Enter URL");
                                  if (url)
                                    document.execCommand(
                                      "createLink",
                                      false,
                                      url,
                                    );
                                  break;
                                case "Image":
                                  const img = prompt("Enter image URL");
                                  if (img)
                                    document.execCommand(
                                      "insertImage",
                                      false,
                                      img,
                                    );
                                  break;
                                case "List":
                                  document.execCommand("insertUnorderedList");
                                  break;
                                case "Numbered":
                                  document.execCommand("insertOrderedList");
                                  break;
                                case "Quote":
                                  document.execCommand(
                                    "formatBlock",
                                    false,
                                    "blockquote",
                                  );
                                  break;
                                default:
                                  break;
                              }
                            }}
                          >
                            {tool}
                          </button>
                        ))}
                      </div>


                      <div
                        contentEditable
                        onInput={(e) =>
                          setFormData({
                            ...formData,
                            message: e.currentTarget.innerHTML,
                          })
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-h-37.5 overflow-auto"
                        placeholder="Write your message here... Be clear and specific about what you want to communicate."
                      />
                    </div>


                    <div className="bg-linear-to-br from-emerald-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-emerald-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Add Attachment
                        </h3>
                        {formData.attachment && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            ✓ File Selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className="px-6 py-3 border-2 border-emerald-500 rounded-xl text-sm font-semibold bg-white text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            ></path>
                          </svg>
                          Choose File
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </label>
                        <span className="text-sm text-gray-600">
                          {formData.attachment ? (
                            <span className="text-green-600 font-medium">
                              {formData.attachment.name}
                            </span>
                          ) : (
                            "No file chosen"
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </div>


                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-8 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await handleSave();

                        }}
                        disabled={
                          formData.selectedEmployees.length === 0 &&
                          !formData.sendToAll
                        }
                        className="px-8 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Send Message ({formData.selectedEmployees.length})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {!showAddForm && (
          <>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Show
                    </span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) =>
                        setEntriesPerPage(Number(e.target.value))
                      }
                      className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm font-medium text-gray-700">
                      entries
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Search:
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 border-2 border-gray-200 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        placeholder="Search messages..."
                      />
                      <svg
                        className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>


              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Sent Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Heading
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Recipients
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(messages)
                      ? messages.map((message) => (
                          <tr
                            key={message.id}
                            className="hover:bg-gray-50 transition-colors duration-150 group"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(message.created_at).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {message.subject}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className="text-sm text-gray-600 max-w-xs line-clamp-1 overflow-hidden"
                                dangerouslySetInnerHTML={{
                                  __html: message.message,
                                }}
                              />
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    message.designation === "All Employees"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {getEmployeeName(message.employee_id)}{" "}

                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {message.attachment ? (
                                <a
                                  href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/messages/${message.attachment}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm font-medium"
                                >
                                  View File
                                </a>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Sent
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    setShowViewModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Message"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteMessage(message.id)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Message"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>


              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">1</span> to{" "}
                    <span className="font-semibold">{messages.length}</span> of{" "}
                    <span className="font-semibold">{messages.length}</span>{" "}
                    entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </button>
                    <button className="px-4 py-2 text-sm border border-emerald-500 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">
                      1
                    </button>
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      Next
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>


      {showViewModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden transform animate-fade-in">

            <div className="bg-linear-to-r from-emerald-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Message Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMessage(null);
                }}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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


            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                      Subject
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {selectedMessage.subject}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                      Sent To
                    </p>
                    <p className="text-blue-600 font-medium">
                      {getEmployeeName(selectedMessage.employee_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                      Sent Date
                    </p>
                    <p className="text-gray-700">
                      {new Date(selectedMessage.created_at).toLocaleString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                      Sent By
                    </p>
                    <p className="text-gray-700">
                      {selectedMessage.sent_by || "Admin"}
                    </p>
                  </div>
                </div>


                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">
                    Message Body
                  </p>
                  <div
                    className="bg-white border border-gray-200 rounded-xl p-6 text-gray-800 prose prose-blue max-w-none shadow-inner min-h-37.5"
                    dangerouslySetInnerHTML={{
                      __html: selectedMessage.message,
                    }}
                  />
                </div>


                {selectedMessage.attachment && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Attachment Available
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-50">
                          {selectedMessage.attachment}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/messages/${selectedMessage.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>


            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMessage(null);
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageToEmployee;
