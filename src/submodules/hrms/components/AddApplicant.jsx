import axios from "axios";
import { Plus, Save, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const AddApplicant = ({ basePath = "/superadmin/hrms" }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: "",
    aadharNo: "",
    panNo: "",
    phone: "",
    email: "",
    officeEmail: "",
    postApplied: "",
    gender: "",
    city: "",
    state: "",
    highestQualificationName: "",
    boardUniversity: "",
    totalExperience: "",
  });

  const [experienceList, setExperienceList] = useState([
    {
      id: 1,
      companyName: "",
      position: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
    },
  ]);

  const { user } = useAuth();
  const company_id = user.company_id;
  console.log(user);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);

  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "experience", label: "Experience Details" },
    { id: "documents", label: "Document Upload" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const addExperience = () => {
    setExperienceList((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        companyName: "",
        position: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
      },
    ]);
  };

  const removeExperience = (id) => {
    setExperienceList((prev) => prev.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id, field, value) => {
    setExperienceList((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    );
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedResume(file);
      Swal.fire({
        title: "Resume selected",
        text: file.name,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const removeResume = () => setUploadedResume(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const checkRes = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/ex-employee/check`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company_id: company_id,
        },
      );

      if (checkRes.data.exists) {
        const result = await Swal.fire({
          title: "Ex-Employee Found",
          text: `The employee ${formData.name} already exists as an ex-employee. Do you still want to proceed?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ff5200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Accept",
          cancelButtonText: "Reject",
        });

        if (!result.isConfirmed) {
          setLoading(false);
          return;
        }
      }


      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });
      data.append("company_id", company_id);

      data.append("experienceList", JSON.stringify(experienceList));
      if (uploadedResume) data.append("resume", uploadedResume);

      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/${company_id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      Swal.fire({
        icon: "success",
        title: "Applicant added!",
        text: res.data.message || "",
        confirmButtonColor: "#ff5200",
      }).then(() => navigate(`${basePath}/formApplied`));
    } catch (err) {
      console.error("❌ Error submitting applicant:", err);
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: err.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#ff5200",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhar Number
          </label>
          <input
            type="text"
            name="aadharNo"
            value={formData.aadharNo}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Number
          </label>
          <input
            type="text"
            name="panNo"
            value={formData.panNo}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Office Email
          </label>
          <input
            type="email"
            name="officeEmail"
            value={formData.officeEmail}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Applied For
          </label>
          <input
            type="text"
            name="postApplied"
            value={formData.postApplied}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Highest Qualification Name
          </label>
          <input
            type="text"
            name="highestQualificationName"
            value={formData.highestQualificationName}
            onChange={handleInputChange}
            placeholder="e.g., B.Tech, M.Sc"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Board / University
          </label>
          <input
            type="text"
            name="boardUniversity"
            value={formData.boardUniversity}
            onChange={handleInputChange}
            placeholder="e.g., CBSE, Delhi University"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Experience (years)
          </label>
          <input
            type="number"
            step="0.5"
            name="totalExperience"
            value={formData.totalExperience}
            onChange={handleInputChange}
            placeholder="e.g., 3.5"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Previous Employment
        </h3>
        <button
          type="button"
          onClick={addExperience}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} /> Add Experience
        </button>
      </div>
      {experienceList.map((exp, idx) => (
        <div
          key={exp.id}
          className="border border-gray-200 rounded-lg p-4 mb-4 relative"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-gray-800">Experience #{idx + 1}</h4>
            {experienceList.length > 1 && (
              <button
                type="button"
                onClick={() => removeExperience(exp.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={exp.companyName}
                onChange={(e) =>
                  updateExperience(exp.id, "companyName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Tech Solutions Ltd."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) =>
                  updateExperience(exp.id, "position", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Month
                </label>
                <select
                  value={exp.startMonth}
                  onChange={(e) =>
                    updateExperience(exp.id, "startMonth", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Month</option>
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Year
                </label>
                <input
                  type="number"
                  value={exp.startYear}
                  onChange={(e) =>
                    updateExperience(exp.id, "startYear", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="YYYY"
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Month
                </label>
                <select
                  value={exp.endMonth}
                  onChange={(e) =>
                    updateExperience(exp.id, "endMonth", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Month</option>
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Year
                </label>
                <input
                  type="number"
                  value={exp.endYear}
                  onChange={(e) =>
                    updateExperience(exp.id, "endYear", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="YYYY"
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">
        Upload Resume / CV
      </h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {!uploadedResume ? (
          <>
            <input
              type="file"
              id="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
            />
            <label
              htmlFor="resume"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition"
            >
              Choose Resume
            </label>
            <p className="text-sm text-gray-500 mt-3">
              PDF, DOC, DOCX (max 5MB)
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-800 font-medium truncate">
              {uploadedResume.name}
            </span>
            <button
              type="button"
              onClick={removeResume}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Add New Applicant
        </h2>

        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "bg-gray-50 text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "basic" && renderBasicInfo()}
          {activeTab === "experience" && renderExperience()}
          {activeTab === "documents" && renderDocuments()}

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/formApplied`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Applicant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplicant;
