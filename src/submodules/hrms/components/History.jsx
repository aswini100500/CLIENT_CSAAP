import React, { useState } from "react";

const History = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "John Doe",
      position: "Senior Developer",
      currentCompany: "Tech Corp Inc.",
      currentSalary: "$85,000",
      employmentHistory: [
        {
          company: "Web Solutions LLC",
          position: "Frontend Developer",
          startDate: "2018-03-15",
          endDate: "2020-06-20",
          salary: "$65,000",
          reasonForLeaving: "Better career opportunity",
        },
        {
          company: "Digital Innovations",
          position: "Junior Developer",
          startDate: "2016-01-10",
          endDate: "2018-03-10",
          salary: "$45,000",
          reasonForLeaving: "Career growth",
        },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Project Manager",
      currentCompany: "BuildRight Constructions",
      currentSalary: "$92,000",
      employmentHistory: [
        {
          company: "Quality Builders",
          position: "Assistant Manager",
          startDate: "2019-08-01",
          endDate: "2021-12-15",
          salary: "$78,000",
          reasonForLeaving: "Higher position offered",
        },
        {
          company: "City Developers",
          position: "Site Supervisor",
          startDate: "2017-05-20",
          endDate: "2019-07-30",
          salary: "$58,000",
          reasonForLeaving: "Seeking management role",
        },
      ],
    },
    {
      id: 3,
      name: "Mike Johnson",
      position: "UX Designer",
      currentCompany: "Creative Designs Co.",
      currentSalary: "$75,000",
      employmentHistory: [
        {
          company: "Design Studio Pro",
          position: "UI Designer",
          startDate: "2020-02-10",
          endDate: "2022-05-15",
          salary: "$62,000",
          reasonForLeaving: "Better work environment",
        },
        {
          company: "Freelance Projects",
          position: "Graphic Designer",
          startDate: "2018-01-01",
          endDate: "2020-01-31",
          salary: "$48,000",
          reasonForLeaving: "Seeking stable employment",
        },
      ],
    },
    {
      id: 4,
      name: "Sarah Williams",
      position: "DevOps Engineer",
      currentCompany: "Cloud Systems Ltd",
      currentSalary: "$110,000",
      employmentHistory: [
        {
          company: "Server Solutions Inc",
          position: "System Administrator",
          startDate: "2019-11-01",
          endDate: "2022-08-20",
          salary: "$85,000",
          reasonForLeaving: "Career advancement",
        },
      ],
    },
    {
      id: 5,
      name: "Robert Brown",
      position: "Data Analyst",
      currentCompany: "Analytics Pro",
      currentSalary: "$78,000",
      employmentHistory: [
        {
          company: "Data Insights Co",
          position: "Junior Analyst",
          startDate: "2018-07-15",
          endDate: "2021-03-30",
          salary: "$55,000",
          reasonForLeaving: "Higher salary offer",
        },
        {
          company: "Market Research Ltd",
          position: "Research Assistant",
          startDate: "2016-09-01",
          endDate: "2018-06-30",
          salary: "$42,000",
          reasonForLeaving: "Career change",
        },
      ],
    },
  ]);

  const [filters, setFilters] = useState({
    name: "",
    position: "",
    currentCompany: "",
    minSalary: "",
    maxSalary: "",
  });

  const [expandedEmployee, setExpandedEmployee] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      position: "",
      currentCompany: "",
      minSalary: "",
      maxSalary: "",
    });
  };

  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  // Filter employees based on filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesName =
      !filters.name ||
      employee.name.toLowerCase().includes(filters.name.toLowerCase());

    const matchesPosition =
      !filters.position ||
      employee.position.toLowerCase().includes(filters.position.toLowerCase());

    const matchesCompany =
      !filters.currentCompany ||
      employee.currentCompany
        .toLowerCase()
        .includes(filters.currentCompany.toLowerCase());

    const currentSalaryNum = parseFloat(
      employee.currentSalary.replace("$", "").replace(",", ""),
    );
    const matchesMinSalary =
      !filters.minSalary || currentSalaryNum >= parseFloat(filters.minSalary);
    const matchesMaxSalary =
      !filters.maxSalary || currentSalaryNum <= parseFloat(filters.maxSalary);

    return (
      matchesName &&
      matchesPosition &&
      matchesCompany &&
      matchesMinSalary &&
      matchesMaxSalary
    );
  });

  const calculateExperience = (
    startDate,
    endDate = new Date().toISOString().split("T")[0],
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    if (months < 0) {
      return `${years - 1} years ${months + 12} months`;
    }
    return `${years} years ${months} months`;
  };

  const getTotalExperience = (employmentHistory) => {
    let totalMonths = 0;

    employmentHistory.forEach((job) => {
      const start = new Date(job.startDate);
      const end = new Date(job.endDate);
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += months;
    });

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    return `${years} years ${remainingMonths} months`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 p-7">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Employee Work History
            </h2>
            <p className="text-gray-500 mt-1">
              View employment history and previous companies
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Filter Employees
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="name"
              >
                Employee Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="position"
              >
                Current Position
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={filters.position}
                onChange={handleFilterChange}
                placeholder="Search by position"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            {/* <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="currentCompany">
                Current Company
              </label>
              <input
                type="text"
                id="currentCompany"
                name="currentCompany"
                value={filters.currentCompany}
                onChange={handleFilterChange}
                placeholder="Search by company"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div> */}
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="minSalary"
              >
                Min Salary ($)
              </label>
              <input
                type="number"
                id="minSalary"
                name="minSalary"
                value={filters.minSalary}
                onChange={handleFilterChange}
                placeholder="Minimum salary"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="maxSalary"
              >
                Max Salary ($)
              </label>
              <input
                type="number"
                id="maxSalary"
                name="maxSalary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                placeholder="Maximum salary"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-5">
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">
                Total Employees
              </h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-3">
              {employees.length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">
                Avg. Experience
              </h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-3">
              {(() => {
                const totalExp = employees.reduce((total, emp) => {
                  return (
                    total +
                    emp.employmentHistory.reduce((empTotal, job) => {
                      const start = new Date(job.startDate);
                      const end = new Date(job.endDate);
                      return (
                        empTotal +
                        (end.getFullYear() - start.getFullYear()) * 12 +
                        (end.getMonth() - start.getMonth())
                      );
                    }, 0)
                  );
                }, 0);
                const avgMonths = totalExp / employees.length;
                const years = Math.floor(avgMonths / 12);
                const months = Math.round(avgMonths % 12);
                return `${years}y ${months}m`;
              })()}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">Avg. Salary</h3>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-3">
              $
              {(
                employees.reduce(
                  (sum, emp) =>
                    sum +
                    parseFloat(
                      emp.currentSalary.replace("$", "").replace(",", ""),
                    ),
                  0,
                ) / employees.length
              ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 text-sm font-medium">
                Previous Companies
              </h3>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-3">
              {employees.reduce(
                (total, emp) => total + emp.employmentHistory.length,
                0,
              )}
            </p>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Position
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Company</th> */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previous Companies
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.id}>
                    <tr className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {employee.position}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{employee.currentCompany}</div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {employee.currentSalary}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getTotalExperience(employee.employmentHistory)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {employee.employmentHistory.length} companies
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleEmployeeDetails(employee.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          {expandedEmployee === employee.id
                            ? "Hide Details"
                            : "View History"}
                        </button>
                      </td>
                    </tr>
                    {expandedEmployee === employee.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">
                              Employment History for {employee.name}
                            </h4>
                            <div className="space-y-4">
                              {employee.employmentHistory.map((job, index) => (
                                <div
                                  key={index}
                                  className="border-l-4 border-blue-500 pl-4 py-2"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-medium text-gray-900">
                                        {job.company}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        {job.position}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {job.startDate} to {job.endDate} •{" "}
                                        {calculateExperience(
                                          job.startDate,
                                          job.endDate,
                                        )}
                                      </p>
                                      <p className="text-sm text-gray-500 mt-1">
                                        <span className="font-medium">
                                          Salary:
                                        </span>{" "}
                                        {job.salary}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500">
                                        <span className="font-medium">
                                          Reason for leaving:
                                        </span>
                                        <br />
                                        {job.reasonForLeaving}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-10">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="mt-4 text-gray-500">
                No employees found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
