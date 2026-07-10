import React, { useEffect, useState } from "react";

export default function ConveyanceList() {
  const [employee, setEmployee] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [conveyanceData, setConveyanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);


  const employees = [
    {
      id: "1",
      name: "John Doe",
      code: "EMP001",
      department: "Engineering",
      designation: "Senior Software Engineer",
    },
    {
      id: "2",
      name: "Jane Smith",
      code: "EMP002",
      department: "Design",
      designation: "UI/UX Designer",
    },
    {
      id: "3",
      name: "Mike Johnson",
      code: "EMP003",
      department: "Sales",
      designation: "Sales Executive",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      code: "EMP004",
      department: "Marketing",
      designation: "Marketing Manager",
    },
    {
      id: "5",
      name: "David Brown",
      code: "EMP005",
      department: "Engineering",
      designation: "Frontend Developer",
    },
  ];


  const rawConveyanceData = [
    {
      id: 1,
      employeeId: "1",
      employeeName: "John Doe",
      employeeCode: "EMP001",
      department: "Engineering",
      designation: "Senior Software Engineer",
      conveyanceHead: "Local Travel",
      amount: 1250.0,
      conveyanceDate: "2024-01-15",
      approvalStatus: "Pending",
      purpose: "Client meeting at downtown office",
      vehicleType: "Car",
    },
    {
      id: 2,
      employeeId: "1",
      employeeName: "John Doe",
      employeeCode: "EMP001",
      department: "Engineering",
      designation: "Senior Software Engineer",
      conveyanceHead: "Intercity Travel",
      amount: 2850.0,
      conveyanceDate: "2024-01-18",
      approvalStatus: "Approved",
      purpose: "Conference attendance in neighboring city",
      vehicleType: "Train",
    },
    {
      id: 3,
      employeeId: "2",
      employeeName: "Jane Smith",
      employeeCode: "EMP002",
      department: "Design",
      designation: "UI/UX Designer",
      conveyanceHead: "Local Travel",
      amount: 850.0,
      conveyanceDate: "2024-01-20",
      approvalStatus: "Pending",
      purpose: "User research interviews",
      vehicleType: "Taxi",
    },
    {
      id: 4,
      employeeId: "2",
      employeeName: "Jane Smith",
      employeeCode: "EMP002",
      department: "Design",
      designation: "UI/UX Designer",
      conveyanceHead: "Local Travel",
      amount: 620.0,
      conveyanceDate: "2024-01-22",
      approvalStatus: "Rejected",
      purpose: "Team lunch coordination",
      vehicleType: "Bus",
    },
    {
      id: 5,
      employeeId: "3",
      employeeName: "Mike Johnson",
      employeeCode: "EMP003",
      department: "Sales",
      designation: "Sales Executive",
      conveyanceHead: "Intercity Travel",
      amount: 4200.0,
      conveyanceDate: "2024-01-25",
      approvalStatus: "Approved",
      purpose: "Client visit in another city",
      vehicleType: "Flight",
    },
    {
      id: 6,
      employeeId: "3",
      employeeName: "Mike Johnson",
      employeeCode: "EMP003",
      department: "Sales",
      designation: "Sales Executive",
      conveyanceHead: "Local Travel",
      amount: 1560.0,
      conveyanceDate: "2024-01-28",
      approvalStatus: "Pending",
      purpose: "Multiple client meetings",
      vehicleType: "Car",
    },
    {
      id: 7,
      employeeId: "4",
      employeeName: "Sarah Wilson",
      employeeCode: "EMP004",
      department: "Marketing",
      designation: "Marketing Manager",
      conveyanceHead: "Local Travel",
      amount: 980.0,
      conveyanceDate: "2024-02-01",
      approvalStatus: "Approved",
      purpose: "Event venue inspection",
      vehicleType: "Taxi",
    },
    {
      id: 8,
      employeeId: "5",
      employeeName: "David Brown",
      employeeCode: "EMP005",
      department: "Engineering",
      designation: "Frontend Developer",
      conveyanceHead: "Local Travel",
      amount: 740.0,
      conveyanceDate: "2024-02-03",
      approvalStatus: "Pending",
      purpose: "Team building activity",
      vehicleType: "Bus",
    },
    {
      id: 9,
      employeeId: "1",
      employeeName: "John Doe",
      employeeCode: "EMP001",
      department: "Engineering",
      designation: "Senior Software Engineer",
      conveyanceHead: "Local Travel",
      amount: 1100.0,
      conveyanceDate: "2024-02-05",
      approvalStatus: "Pending",
      purpose: "Technical workshop attendance",
      vehicleType: "Car",
    },
    {
      id: 10,
      employeeId: "4",
      employeeName: "Sarah Wilson",
      employeeCode: "EMP004",
      department: "Marketing",
      designation: "Marketing Manager",
      conveyanceHead: "Intercity Travel",
      amount: 3200.0,
      conveyanceDate: "2024-02-08",
      approvalStatus: "Pending",
      purpose: "Regional marketing conference",
      vehicleType: "Train",
    },
  ];


  useEffect(() => {
    setConveyanceData(rawConveyanceData);
    setFilteredData(rawConveyanceData);
  }, []);

  const handleShowData = () => {
    let filtered = rawConveyanceData;


    if (employee) {
      filtered = filtered.filter((item) => item.employeeId === employee);
    }


    if (fromDate) {
      filtered = filtered.filter((item) => item.conveyanceDate >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter((item) => item.conveyanceDate <= toDate);
    }

    setFilteredData(filtered);
    setSelectedRows(new Set());
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredData.map((item) => item.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleApprove = () => {
    const updatedData = conveyanceData.map((item) =>
      selectedRows.has(item.id) && item.approvalStatus === "Pending"
        ? { ...item, approvalStatus: "Approved" }
        : item,
    );

    setConveyanceData(updatedData);
    setFilteredData(
      updatedData.filter((item) =>
        filteredData.some((filteredItem) => filteredItem.id === item.id),
      ),
    );
    setSelectedRows(new Set());
  };

  const handleDelete = () => {
    if (
      selectedRows.size > 0 &&
      window.confirm(
        `Are you sure you want to delete ${selectedRows.size} record(s)?`,
      )
    ) {
      const updatedData = conveyanceData.filter(
        (item) => !selectedRows.has(item.id),
      );
      setConveyanceData(updatedData);
      setFilteredData(
        updatedData.filter((item) =>
          filteredData.some((filteredItem) => filteredItem.id === item.id),
        ),
      );
      setSelectedRows(new Set());
    }
  };

  const handleReject = () => {
    const updatedData = conveyanceData.map((item) =>
      selectedRows.has(item.id) && item.approvalStatus === "Pending"
        ? { ...item, approvalStatus: "Rejected" }
        : item,
    );

    setConveyanceData(updatedData);
    setFilteredData(
      updatedData.filter((item) =>
        filteredData.some((filteredItem) => filteredItem.id === item.id),
      ),
    );
    setSelectedRows(new Set());
  };

  const calculateApprovedAmount = () => {
    return filteredData
      .filter((item) => selectedRows.has(item.id))
      .reduce((sum, item) => sum + item.amount, 0)
      .toFixed(2);
  };

  const calculateTotalAmount = () => {
    return filteredData.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Approved: "bg-green-100 text-green-800 border border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Rejected: "bg-red-100 text-red-800 border border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status] || "bg-gray-100"}`}
      >
        {status}
      </span>
    );
  };

  const getSelectedEmployeeName = () => {
    const employeeObj = employees.find((emp) => emp.id === employee);
    return employeeObj ? employeeObj.name : "All Employees";
  };

  const isFormValid = fromDate && toDate;

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">

      <header className="bg-blue-600 text-white font-semibold p-4 rounded-lg flex items-center shadow-sm">
        <span className="mr-3 text-xl">📋</span>
        Conveyance List of Employee
      </header>


      <section className="bg-white shadow-sm p-6 mt-4 rounded-lg border">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Select Employee
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.department}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              From Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>


          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              To Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
            />
          </div>


          <div className="lg:col-span-2 flex items-end gap-2">
            <button
              className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                isFormValid
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleShowData}
              disabled={!isFormValid}
            >
              Show Records
            </button>
            <button
              className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setEmployee("");
                setFromDate("");
                setToDate("");
                setFilteredData(rawConveyanceData);
              }}
            >
              Clear
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-600 text-sm font-medium">
              Total Records
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {filteredData.length}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 text-sm font-medium">Approved</div>
            <div className="text-2xl font-bold text-green-700">
              {
                filteredData.filter(
                  (item) => item.approvalStatus === "Approved",
                ).length
              }
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-600 text-sm font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-700">
              {
                filteredData.filter((item) => item.approvalStatus === "Pending")
                  .length
              }
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-red-600 text-sm font-medium">Rejected</div>
            <div className="text-2xl font-bold text-red-700">
              {
                filteredData.filter(
                  (item) => item.approvalStatus === "Rejected",
                ).length
              }
            </div>
          </div>
        </div>


        <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-700">
                <th className="p-3 border-r border-gray-200 w-12">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedRows.size === filteredData.length &&
                      filteredData.length > 0
                    }
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                </th>
                <th className="p-3 border-r border-gray-200 text-left font-semibold">
                  Emp. Name
                </th>
                <th className="p-3 border-r border-gray-200 text-left font-semibold">
                  Emp. Code
                </th>
                <th className="p-3 border-r border-gray-200 text-left font-semibold">
                  Department
                </th>
                <th className="p-3 border-r border-gray-200 text-left font-semibold">
                  Conveyance Head
                </th>
                <th className="p-3 border-r border-gray-200 text-right font-semibold">
                  Amount (₹)
                </th>
                <th className="p-3 border-r border-gray-200 text-left font-semibold">
                  Date
                </th>
                <th className="p-3 text-left font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 transition-colors ${
                      selectedRows.has(item.id)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3 border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={() => handleRowSelect(item.id)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                      />
                    </td>
                    <td className="p-3 border-r border-gray-200 font-medium">
                      {item.employeeName}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {item.employeeCode}
                    </td>
                    <td className="p-3 border-r border-gray-200">
                      {item.department}
                    </td>
                    <td className="p-3 border-r border-gray-200">
                      <div>
                        <div className="font-medium">{item.conveyanceHead}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.purpose}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-200 text-right font-mono font-medium">
                      ₹
                      {item.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 border-r border-gray-200">
                      {new Date(item.conveyanceDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(item.approvalStatus)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-2">📊</span>
                      <p className="text-lg font-medium">No data available</p>
                      <p className="text-sm mt-1">
                        {isFormValid
                          ? "No records found for the selected criteria"
                          : "Please select date range and click 'Show Records'"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                selectedRows.size > 0
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleApprove}
              disabled={selectedRows.size === 0}
            >
              Approve Selected
            </button>

            <button
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                selectedRows.size > 0
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleReject}
              disabled={selectedRows.size === 0}
            >
              Reject Selected
            </button>

            <button
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                selectedRows.size > 0
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleDelete}
              disabled={selectedRows.size === 0}
            >
              Delete Selected
            </button>

            <button className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm">
              Close
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 font-semibold bg-gray-50 px-4 py-2 rounded-lg">
              <span className="text-gray-700">Selected Amount:</span>
              <input
                disabled
                className="border border-gray-300 rounded-lg p-2 w-32 text-right font-mono bg-white"
                value={`₹${calculateApprovedAmount()}`}
              />
            </div>
            <div className="flex items-center gap-3 font-semibold bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700">Total Amount:</span>
              <input
                disabled
                className="border border-blue-200 rounded-lg p-2 w-32 text-right font-mono bg-white"
                value={`₹${calculateTotalAmount()}`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
