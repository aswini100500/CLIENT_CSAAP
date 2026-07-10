import axios from "axios";
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import useAuth from "../../../hooks/useAuth";
import { usePermission } from "../../../hooks/usePermission";

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    purple: "bg-violet-50 text-violet-700 border border-violet-100",
    orange: "bg-amber-50 text-amber-700 border border-amber-100",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
      {label}
    </p>
    <p className="text-sm text-gray-800">{value || "—"}</p>
  </div>
);

const JobPosting = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { user } = useAuth();
  const { has } = usePermission();
  const [jobs, setJobs] = useState([]);

  const emptyForm = {
    noticeNo: "",
    noticeDate: "",
    vacancyDate: "",
    vacancyName: "",
    noOfVacancies: "",
    genderPreference: "Any",
    jobType: "In-office",
    employmentType: "Full-time",
    experienceRequired: "",
    qualificationRequired: "",
    jobLocation: "",
    location: "",
    salaryCtc: "",
    jobDescription: "",
    jobResponsibility: "",
    preferedSkills: "",
    openingDate: "",
    closingDate: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const API_URL = `${import.meta.env.VITE_HRMS_BASE_URL}/api/jobs`;

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/${user.company_id}`);
      const jobList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.jobs)
            ? res.data.jobs
            : [];
      setJobs(jobList);
    } catch (err) {
      console.error(err);
      swal("Error fetching jobs", "", "error");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      if (!has("hrms.job.posting.edit")) {
        swal("Access Denied", "You do not have permission to edit job postings.", "error");
        return;
      }
    } else {
      if (!has("hrms.job.posting.create")) {
        swal("Access Denied", "You do not have permission to create job postings.", "error");
        return;
      }
    }
    try {
      const jobData = { ...formData, company_id: user.company_id };
      if (isEditing) {
        await axios.put(`${API_URL}/${editingId}`, jobData);
        swal("Job Updated Successfully", "", "success");
      } else {
        await axios.post(API_URL, jobData);
        swal("Job Created Successfully", "", "success");
      }
      setFormData(emptyForm);
      setIsFormOpen(false);
      fetchJobs();
    } catch (err) {
      swal("Error saving job", "", "error");
    }
  };

  const handleEdit = (job) => {
    if (!has("hrms.job.posting.edit")) {
      swal("Access Denied", "You do not have permission to edit job postings.", "error");
      return;
    }
    setFormData({ ...job });
    setEditingId(job.id);
    setIsEditing(true);
    setIsFormOpen(true);
    setViewJob(null);
  };

  const handleDelete = async (id) => {
    if (!has("hrms.job.posting.edit")) {
      swal("Access Denied", "You do not have permission to delete job postings.", "error");
      return;
    }
    swal({
      title: "Are you sure?",
      text: "This job posting will be permanently deleted.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          swal("Deleted!", { icon: "success" });
          fetchJobs();
        } catch (err) {
          swal("Error deleting job", "", "error");
        }
      }
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  const jobTypeColor = {
    "In-office": "blue",
    Remote: "green",
    Hybrid: "purple",
    "Field job": "orange",
  };
  const employTypeColor = { "Full-time": "green", "Part-time": "orange" };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-gray-50 transition";
  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="font-sans">

      <div className="flex justify-between items-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {jobs.length} active posting{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
        {has("hrms.job.posting.create") && (
          <button
            onClick={() => {
              setIsFormOpen(true);
              setIsEditing(false);
              setFormData(emptyForm);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all shadow-sm"
          >
            <Plus size={16} />
            Post New Job
          </button>
        )}
      </div>


      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {[
                  "Notice No",
                  "Vacancy",
                  "Vacancies",
                  "Job Type",
                  "Employment",
                  "Location",
                  "Salary (CTC)",
                  "Closing Date",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                      {job.noticeNo}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-800">
                        {job.vacancyName}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {job.genderPreference !== "Any"
                          ? job.genderPreference
                          : "Any gender"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <Users size={13} className="text-gray-400" />
                        {job.noOfVacancies}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge color={jobTypeColor[job.jobType] || "gray"}>
                        {job.jobType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 ">
                      <Badge
                        color={employTypeColor[job.employmentType] || "gray"}
                      >
                        {job.employmentType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-gray-600 text-sm">
                        <MapPin size={13} className="text-gray-400" />
                        {job.location || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">
                      {job.salaryCtc || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-gray-600 text-xs">
                        <Calendar size={12} className="text-gray-400" />
                        {job.closingDate || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewJob(job)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        {has("hrms.job.posting.edit") && (
                          <button
                            onClick={() => handleEdit(job)}
                            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {has("hrms.job.posting.edit") && (
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Briefcase size={32} strokeWidth={1.5} />
                      <p className="font-medium text-gray-500">
                        No job postings yet
                      </p>
                      <p className="text-sm">
                        Click "Post New Job" to get started
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        {jobs.length > itemsPerPage && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {indexOfFirstItem + 1}–
              {Math.min(indexOfLastItem, jobs.length)} of {jobs.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-md text-xs font-medium transition ${currentPage === page ? "bg-slate-800 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>


      {viewJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewJob.vacancyName}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge color={jobTypeColor[viewJob.jobType] || "gray"}>
                    {viewJob.jobType}
                  </Badge>
                  <Badge
                    color={employTypeColor[viewJob.employmentType] || "gray"}
                  >
                    {viewJob.employmentType}
                  </Badge>
                  {viewJob.location && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} /> {viewJob.location}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewJob(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition ml-4 shrink-0"
              >
                <X size={18} />
              </button>
            </div>


            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Vacancies", value: viewJob.noOfVacancies },
                  { label: "Salary (CTC)", value: viewJob.salaryCtc },
                  { label: "Gender Pref.", value: viewJob.genderPreference },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-gray-50 rounded-xl p-3 text-center"
                  >
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>


              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Important Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Notice No." value={viewJob.noticeNo} />
                  <Field label="Notice Date" value={viewJob.noticeDate} />
                  <Field label="Vacancy Date" value={viewJob.vacancyDate} />
                  <Field label="Opening Date" value={viewJob.openingDate} />
                  <Field label="Closing Date" value={viewJob.closingDate} />
                </div>
              </div>


              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Requirements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Experience Required"
                    value={viewJob.experienceRequired}
                  />
                  <Field
                    label="Qualification"
                    value={viewJob.qualificationRequired}
                  />
                  <Field label="Job Location" value={viewJob.jobLocation} />
                </div>
              </div>


              {viewJob.jobDescription && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Job Description
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
                    {viewJob.jobDescription}
                  </p>
                </div>
              )}


              {viewJob.jobResponsibility && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Responsibilities
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
                    {viewJob.jobResponsibility}
                  </p>
                </div>
              )}


              {viewJob.preferedSkills && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Preferred Skills
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
                    {viewJob.preferedSkills}
                  </p>
                </div>
              )}


              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {viewJob.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail size={14} className="text-gray-400 shrink-0" />
                      {viewJob.contactEmail}
                    </div>
                  )}
                  {viewJob.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone
                        size={14}
                        className="text-gray-400 shrink-0"
                      />
                      {viewJob.contactPhone}
                    </div>
                  )}
                  {viewJob.contactAddress && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin
                        size={14}
                        className="text-gray-400 shrink-0 mt-0.5"
                      />
                      <span>{viewJob.contactAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setViewJob(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              {has("hrms.job.posting.edit") && (
                <button
                  onClick={() => handleEdit(viewJob)}
                  className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <Pencil size={14} /> Edit Posting
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {isEditing ? "Edit Job Posting" : "Post a New Job"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 px-6 py-5"
            >

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Basic Information
              </p>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>Notice No.</label>
                  <input
                    type="text"
                    name="noticeNo"
                    value={formData.noticeNo}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Notice Date</label>
                  <input
                    type="date"
                    name="noticeDate"
                    value={formData.noticeDate}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Vacancy Name</label>
                  <input
                    type="text"
                    name="vacancyName"
                    value={formData.vacancyName}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Vacancy Date</label>
                  <input
                    type="date"
                    name="vacancyDate"
                    value={formData.vacancyDate}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>No. of Vacancies</label>
                  <input
                    type="number"
                    name="noOfVacancies"
                    value={formData.noOfVacancies}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className={labelClass}>Gender Preference</label>
                  <select
                    name="genderPreference"
                    value={formData.genderPreference}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  >
                    <option value="Any">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>


              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Job Details
              </p>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>Job Type</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  >
                    <option value="In-office">In-office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Field job">Field job</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Experience Required</label>
                  <input
                    type="text"
                    name="experienceRequired"
                    value={formData.experienceRequired}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Qualification Required</label>
                  <input
                    type="text"
                    name="qualificationRequired"
                    value={formData.qualificationRequired}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Location (State/City)</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Job Location</label>
                  <input
                    type="text"
                    name="jobLocation"
                    value={formData.jobLocation}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Salary (CTC)</label>
                  <input
                    type="text"
                    name="salaryCtc"
                    value={formData.salaryCtc}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>


              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Application Dates
              </p>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>Opening Date</label>
                  <input
                    type="date"
                    name="openingDate"
                    value={formData.openingDate}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Closing Date</label>
                  <input
                    type="date"
                    name="closingDate"
                    value={formData.closingDate}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>


              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Job Content
              </p>
              <div className="space-y-4 mb-5">
                <div>
                  <label className={labelClass}>Job Description</label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Job Responsibilities</label>
                  <textarea
                    name="jobResponsibility"
                    value={formData.jobResponsibility}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Preferred Skills</label>
                  <textarea
                    name="preferedSkills"
                    value={formData.preferedSkills}
                    onChange={handleInputChange}
                    rows={2}
                    className={inputClass}
                    required
                  />
                </div>
              </div>


              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Contact Information
              </p>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Contact Address</label>
                  <textarea
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleInputChange}
                    rows={2}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                form="job-form"
                type="submit"
                onClick={handleSubmit}
                className="px-5 py-2 text-sm bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition"
              >
                {isEditing ? "Update Job" : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPosting;
