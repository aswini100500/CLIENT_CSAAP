import React, { useState } from 'react';

const PromotionPage = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "John Doe",
      currentPosition: "Senior Developer",
      department: "Engineering",
      currentSalary: "$85,000",
      joinDate: "2020-06-15",
      performance: "Excellent",
      skills: ["React", "Node.js", "TypeScript", "AWS"]
    },
    {
      id: 2,
      name: "Jane Smith",
      currentPosition: "Project Manager",
      department: "Operations",
      currentSalary: "$92,000",
      joinDate: "2019-08-01",
      performance: "Outstanding",
      skills: ["Project Management", "Agile", "Budgeting", "Team Leadership"]
    },
    {
      id: 3,
      name: "Mike Johnson",
      currentPosition: "UX Designer",
      department: "Design",
      currentSalary: "$75,000",
      joinDate: "2021-02-10",
      performance: "Very Good",
      skills: ["Figma", "User Research", "Prototyping", "UI/UX"]
    },
    {
      id: 4,
      name: "Sarah Williams",
      currentPosition: "DevOps Engineer",
      department: "Engineering",
      currentSalary: "$110,000",
      joinDate: "2020-11-01",
      performance: "Excellent",
      skills: ["Docker", "Kubernetes", "AWS", "CI/CD"]
    },
    {
      id: 5,
      name: "Robert Brown",
      currentPosition: "Data Analyst",
      department: "Analytics",
      currentSalary: "$78,000",
      joinDate: "2019-07-15",
      performance: "Good",
      skills: ["SQL", "Python", "Tableau", "Data Visualization"]
    }
  ]);

  const [promotionPositions] = useState([
    { value: "tech_lead", label: "Tech Lead", department: "Engineering", salaryRange: "$100,000 - $130,000" },
    { value: "senior_project_manager", label: "Senior Project Manager", department: "Operations", salaryRange: "$110,000 - $140,000" },
    { value: "lead_designer", label: "Lead Designer", department: "Design", salaryRange: "$95,000 - $120,000" },
    { value: "devops_lead", label: "DevOps Lead", department: "Engineering", salaryRange: "$130,000 - $160,000" },
    { value: "senior_data_scientist", label: "Senior Data Scientist", department: "Analytics", salaryRange: "$100,000 - $125,000" },
    { value: "engineering_manager", label: "Engineering Manager", department: "Engineering", salaryRange: "$120,000 - $150,000" },
    { value: "product_manager", label: "Product Manager", department: "Product", salaryRange: "$105,000 - $135,000" }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [promotionForm, setPromotionForm] = useState({
    newPosition: "",
    newSalary: "",
    effectiveDate: "",
    promotionReason: "",
    additionalBenefits: "",
    reportingManager: "",
    probationPeriod: "3 months"
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setPromotionForm({
      newPosition: "",
      newSalary: "",
      effectiveDate: "",
      promotionReason: "",
      additionalBenefits: "",
      reportingManager: "",
      probationPeriod: "3 months"
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPromotionForm(prev => ({
      ...prev,
      [name]: value
    }));


    if (name === "newPosition") {
      const selectedPos = promotionPositions.find(pos => pos.value === value);
      if (selectedPos) {
        setPromotionForm(prev => ({
          ...prev,
          newSalary: selectedPos.salaryRange.split(" - ")[0]
        }));
      }
    }
  };

  const handlePromotionSubmit = (e) => {
    e.preventDefault();


    setShowSuccessModal(true);
  };

  const getPerformanceColor = (performance) => {
    switch(performance) {
      case "Outstanding": return "bg-purple-100 text-purple-800";
      case "Excellent": return "bg-green-100 text-green-800";
      case "Very Good": return "bg-blue-100 text-blue-800";
      case "Good": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTenure = (joinDate) => {
    const join = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    const months = now.getMonth() - join.getMonth();
    
    if (months < 0) {
      return `${years - 1} years ${months + 12} months`;
    }
    return `${years} years ${months} months`;
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setPromotionForm({
      newPosition: "",
      newSalary: "",
      effectiveDate: "",
      promotionReason: "",
      additionalBenefits: "",
      reportingManager: "",
      probationPeriod: "3 months"
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Promotion Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Promotion request for {selectedEmployee?.name} has been submitted successfully and sent for approval.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  New Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-7">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Employee Promotion</h2>
              <p className="text-gray-500 mt-1">Promote employees to new positions with updated compensation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Employee</h3>
              <div className="space-y-4">
                {employees.map(employee => (
                  <div
                    key={employee.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedEmployee?.id === employee.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="shrink-0 h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                          <p className="text-sm text-gray-600">{employee.currentPosition}</p>
                          <p className="text-xs text-gray-500">{employee.department}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(employee.performance)}`}>
                        {employee.performance}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Salary:</span>
                        <span className="font-medium ml-1">{employee.currentSalary}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tenure:</span>
                        <span className="font-medium ml-1">{calculateTenure(employee.joinDate)}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {employee.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {employee.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{employee.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedEmployee ? `Promote ${selectedEmployee.name}` : 'Promotion Details'}
              </h3>

              {!selectedEmployee ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <p className="text-gray-500 mt-4">Please select an employee to proceed with promotion.</p>
                </div>
              ) : (
                <form onSubmit={handlePromotionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Current Position
                      </label>
                      <input
                        type="text"
                        value={selectedEmployee.currentPosition}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        New Position *
                      </label>
                      <select
                        name="newPosition"
                        value={promotionForm.newPosition}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select new position</option>
                        {promotionPositions
                          .filter(pos => pos.department === selectedEmployee.department)
                          .map(position => (
                            <option key={position.value} value={position.value}>
                              {position.label} ({position.salaryRange})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Current Salary
                      </label>
                      <input
                        type="text"
                        value={selectedEmployee.currentSalary}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        New Salary *
                      </label>
                      <input
                        type="text"
                        name="newSalary"
                        value={promotionForm.newSalary}
                        onChange={handleFormChange}
                        required
                        placeholder="$"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Effective Date *
                      </label>
                      <input
                        type="date"
                        name="effectiveDate"
                        value={promotionForm.effectiveDate}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Probation Period
                      </label>
                      <select
                        name="probationPeriod"
                        value={promotionForm.probationPeriod}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="No probation">No probation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Reporting Manager *
                    </label>
                    <input
                      type="text"
                      name="reportingManager"
                      value={promotionForm.reportingManager}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter manager's name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Promotion Reason *
                    </label>
                    <textarea
                      name="promotionReason"
                      value={promotionForm.promotionReason}
                      onChange={handleFormChange}
                      required
                      rows="3"
                      placeholder="Explain the reason for promotion..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Additional Benefits
                    </label>
                    <textarea
                      name="additionalBenefits"
                      value={promotionForm.additionalBenefits}
                      onChange={handleFormChange}
                      rows="2"
                      placeholder="Stock options, bonus, additional leave, etc."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Submit Promotion
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Promotion Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Performance</h4>
                  <p className="text-sm text-gray-600 mt-1">Employee should have consistent "Good" or better performance ratings for the last 2 review cycles.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tenure</h4>
                  <p className="text-sm text-gray-600 mt-1">Minimum 1 year in current position, or exceptional performance with 6+ months tenure.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Skills</h4>
                  <p className="text-sm text-gray-600 mt-1">Should demonstrate required skills for the new position through projects or certifications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionPage;