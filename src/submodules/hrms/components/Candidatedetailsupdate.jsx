import React, { useState } from "react";

const CandidateDetailsUpdate = ({ employee, onClose }) => {

  const [formData, setFormData] = useState({
    employeeDepartment: "",
    employeeDesignation: "",
    reportingAuthority: "",
    officeMailId: "",
    employeeWorkType: "",
    targetAmount: "",
    pfRequired: "Not Required",
    basicSalary: "",
    employeeStatus: "",
    modeOfPayment: "",
    bankName: "",
    branchName: "",
    accountNo: "",
    ifscCode: "",
    allowance: "",
    comment: "",
    photo: null,
    joiningDate: "1970-01-01",
    bloodGroup: "",
    probationPeriod: "",
    hrSignatory: "",
  });


  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Candidate details updated successfully!");
  };


  const departments = [
    "Select Department",
    "Human Resources",
    "Information Technology",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
    "Research & Development",
  ];


  const designations = [
    "Select Designation",
    "Software Engineer",
    "Senior Software Engineer",
    "Team Lead",
    "Project Manager",
    "HR Manager",
    "Finance Analyst",
    "Sales Executive",
    "Marketing Specialist",
  ];


  const workTypes = ["Full-time", "Part-time", "Contract", "Remote", "Hybrid"];


  const employeeStatuses = ["Active", "Inactive", "On Leave", "Probation"];


  const paymentModes = ["Bank Transfer", "Cash", "Cheque", "Online Transfer"];


  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="crm-module-root font-sans">
      <div className="max-w-5xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="app-panel bg-white shadow-sm border border-(--border-soft) rounded-2xl overflow-hidden"
        >

          <div className="p-6 space-y-8">

            <div>
              <h2 className="text-[14px] font-bold text-(--text-strong) mb-4 pb-2 border-b border-(--border-soft) uppercase tracking-wider">
                Personal & Job Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="app-label block mb-1.5">
                    Employee Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employeeDepartment"
                    value={formData.employeeDepartment}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px] bg-white cursor-pointer"
                    required
                  >
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Employee Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employeeDesignation"
                    value={formData.employeeDesignation}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px] bg-white cursor-pointer"
                    required
                  >
                    {designations.map((designation, index) => (
                      <option key={index} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Reporting Authority
                  </label>
                  <select
                    name="reportingAuthority"
                    value={formData.reportingAuthority}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px] bg-white cursor-pointer"
                  >
                    <option value="">Select Reporting Authority</option>
                    <option value="Manager">Manager</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Department Head">Department Head</option>
                  </select>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Office Mail ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="officeMailId"
                    value={formData.officeMailId}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                    placeholder="employee@company.com"
                    required
                  />
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Employee Work Type
                  </label>
                  <select
                    name="employeeWorkType"
                    value={formData.employeeWorkType}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px] bg-white cursor-pointer"
                  >
                    <option value="">Select Work Type</option>
                    {workTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Target Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-(--text-faint) text-xs">₹</span>
                    </div>
                    <input
                      type="number"
                      name="targetAmount"
                      value={formData.targetAmount}
                      onChange={handleInputChange}
                      className="app-input w-full pl-8 pr-4 py-2.5 text-[13px]"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    PF Required/NOT
                  </label>
                  <div className="flex space-x-6 py-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="pfRequired"
                        value="Required"
                        checked={formData.pfRequired === "Required"}
                        onChange={handleInputChange}
                        className="text-(--brand) focus:ring-(--brand-ring) h-4 w-4 border-(--border-strong)"
                      />
                      <span className="ml-2 text-sm text-(--text-body) font-medium">Required</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="pfRequired"
                        value="Not Required"
                        checked={formData.pfRequired === "Not Required"}
                        onChange={handleInputChange}
                        className="text-(--brand) focus:ring-(--brand-ring) h-4 w-4 border-(--border-strong)"
                      />
                      <span className="ml-2 text-sm text-(--text-body) font-medium">Not Required</span>
                    </label>
                  </div>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Basic Salary
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-(--text-faint) text-xs">₹</span>
                    </div>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleInputChange}
                      className="app-input w-full pl-8 pr-4 py-2.5 text-[13px]"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div>
              <h2 className="text-[14px] font-bold text-(--text-strong) mb-4 pb-2 border-b border-(--border-soft) uppercase tracking-wider">
                Employment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="app-label block mb-1.5">
                    Employee Status
                  </label>
                  <select
                    name="employeeStatus"
                    value={formData.employeeStatus}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px] bg-white cursor-pointer"
                  >
                    <option value="">Select Status</option>
                    {employeeStatuses.map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                  />
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px] bg-white cursor-pointer"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((group, index) => (
                      <option key={index} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Probation Period
                  </label>
                  <input
                    type="text"
                    name="probationPeriod"
                    value={formData.probationPeriod}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                    placeholder="e.g., 3 months"
                  />
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    HR Signatory
                  </label>
                  <input
                    type="text"
                    name="hrSignatory"
                    value={formData.hrSignatory}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                    placeholder="HR Manager Name"
                  />
                </div>


                <div className="md:col-span-2">
                  <label className="app-label block mb-1.5">
                    Photo Upload
                  </label>
                  <div className="flex items-center">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-(--border-strong) bg-(--bg-subtle)/20 hover:bg-(--bg-subtle)/40 rounded-xl cursor-pointer hover:border-(--brand) transition-all duration-200">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-3 text-(--brand)"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mb-1 text-sm text-(--text-strong) font-bold">
                          Click to upload
                        </p>
                        <p className="text-xs text-(--text-faint)">
                          PNG, JPG, JPEG (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        name="photo"
                        onChange={handleInputChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                  {formData.photo && (
                    <p className="mt-2 text-xs text-(--brand) font-semibold flex items-center gap-1">
                      ✓ File selected: {formData.photo.name}
                    </p>
                  )}
                </div>
              </div>
            </div>


            <div>
              <h2 className="text-[14px] font-bold text-(--text-strong) mb-4 pb-2 border-b border-(--border-soft) uppercase tracking-wider">
                Payment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="app-label block mb-1.5">
                    Mode Of Payment
                  </label>
                  <select
                    name="modeOfPayment"
                    value={formData.modeOfPayment}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px] bg-white cursor-pointer"
                  >
                    <option value="">Select Payment Mode</option>
                    {paymentModes.map((mode, index) => (
                      <option key={index} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                    placeholder="Bank Name"
                  />
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                    placeholder="Branch Name"
                  />
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    A/C No
                  </label>
                  <input
                    type="text"
                    name="accountNo"
                    value={formData.accountNo}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                    placeholder="Account Number"
                  />
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    className="app-input w-full px-4 py-2.5 text-[13px]"
                    placeholder="IFSC Code"
                  />
                </div>


                <div>
                  <label className="app-label block mb-1.5">
                    Allowance
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-(--text-faint) text-xs">₹</span>
                    </div>
                    <input
                      type="number"
                      name="allowance"
                      value={formData.allowance}
                      onChange={handleInputChange}
                      className="app-input w-full pl-8 pr-4 py-2.5 text-[13px]"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div>
              <label className="app-label block mb-1.5">
                Comment
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows="4"
                className="app-input w-full px-4 py-2.5 text-[13px]"
                placeholder="Additional comments or notes..."
              />
            </div>
          </div>


          <div className="bg-(--bg-subtle)/30 px-6 py-4 border-t border-(--border-soft)">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="app-btn-secondary cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="app-btn-primary cursor-pointer"
              >
                Update Candidate Details
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateDetailsUpdate;
