import React, { useState } from "react";

export default function MonthlySalaryProcess() {
  const [month, setMonth] = useState("");
  const [searchEmp, setSearchEmp] = useState("");
  const [processType, setProcessType] = useState("monthly");

  const companies = [
    "Cloudsart Pvt Ltd",
    "TechCorp Solutions",
    "Global Enterprises",
  ];
  const branches = ["DEMO", "Head Office", "North Branch", "South Branch"];
  const departments = ["DEMO", "HR", "Finance", "IT", "Sales", "Operations"];
  const designations = [
    "DEMO",
    "Manager",
    "Developer",
    "Analyst",
    "Executive",
    "Trainee",
  ];
  const employees = [
    "John Smith",
    "Sarah Johnson",
    "Mike Chen",
    "Emily Davis",
    "Robert Wilson",
    "Lisa Brown",
    "David Miller",
    "Maria Garcia",
    "James Wilson",
    "Priya Sharma",
    "Alex Thompson",
    "Emma Roberts",
  ];

  return (
    <div className="w-full p-4 bg-gray-100 min-h-screen">
      <div className="bg-blue-600 text-white font-semibold p-3 rounded flex items-center">
        <span className="mr-2 text-lg">🧾</span> Monthly Salary Process
      </div>

      <div className="bg-white shadow-lg p-6 mt-4 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex gap-6 font-medium text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="process"
                checked={processType === "monthly"}
                onChange={() => setProcessType("monthly")}
                className="text-blue-500"
              />
              Monthly Process
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="process"
                checked={processType === "periodic"}
                onChange={() => setProcessType("periodic")}
                className="text-blue-500"
              />
              Periodic Process
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium whitespace-nowrap">
              For Month
            </label>
            <input
              type="month"
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>

        <p className="font-semibold text-blue-600 mb-4 text-base border-l-4 border-blue-500 pl-2">
          Selection By
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SelectionCard title="Company" options={companies} />

          <SelectionCard title="Branch" options={branches} />

          <SelectionCard title="Department" options={departments} />

          <SelectionCard title="Designation" options={designations} />

          <div className="space-y-2">
            <div className="font-semibold text-gray-700 mb-2">Employee</div>

            <RadioGroup />

            <div className="flex items-center gap-2 text-sm mb-3 p-1">
              <input type="checkbox" className="rounded text-blue-500" />
              Select All / De-Select All
            </div>

            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="Search employee..."
              value={searchEmp}
              onChange={(e) => setSearchEmp(e.target.value)}
            />

            <div className="border border-gray-300 rounded h-40 overflow-auto p-3 text-sm space-y-1">
              {employees.map((employee, index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input type="checkbox" className="text-blue-500" />
                  {employee}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded font-medium transition-colors duration-200">
            Process
          </button>

          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded font-medium transition-colors duration-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectionCard({ title, options }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState("all");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <div className="font-semibold text-gray-700 mb-2">{title}</div>

      <div className="text-sm space-y-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${title}-radio`}
            checked={selectedOption === "all"}
            onChange={() => setSelectedOption("all")}
            className="text-blue-500"
          />
          All
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${title}-radio`}
            checked={selectedOption === "few"}
            onChange={() => setSelectedOption("few")}
            className="text-blue-500"
          />
          Few
        </label>
      </div>

      <div className="flex items-center gap-2 text-sm mb-3 p-1">
        <input type="checkbox" className="rounded text-blue-500" />
        Select All / De-Select All
      </div>

      <input
        type="text"
        className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        placeholder={`Search ${title.toLowerCase()}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="border border-gray-300 rounded h-40 overflow-auto p-3 text-sm space-y-1">
        {filteredOptions.map((option, index) => (
          <label
            key={index}
            className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input type="checkbox" className="text-blue-500" />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function RadioGroup() {
  const [selectedOption, setSelectedOption] = useState("all");

  return (
    <div className="text-sm space-y-1 mb-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={selectedOption === "all"}
          onChange={() => setSelectedOption("all")}
          className="text-blue-500"
        />
        All
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={selectedOption === "few"}
          onChange={() => setSelectedOption("few")}
          className="text-blue-500"
        />
        Few
      </label>
    </div>
  );
}
