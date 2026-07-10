import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  User,
  Building,
  CheckCircle,
  X
} from "lucide-react";
import ReactDOM from "react-dom";

const TransferPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [transferData, setTransferData] = useState({
    currentDepartment: "",
    newDepartment: "",
    currentLocation: "",
    newLocation: "",
    transferDate: "",
    reason: "",
    remarks: "",
    effectiveDate: "",
    salaryAdjustment: "",
    reportingManager: ""
  });
  const [loading, setLoading] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);


  const mockEmployees = [
    {
      id: 1,
      name: "John Doe",
      position: "Software Engineer",
      department: "Engineering",
      currentLocation: "New York",
      email: "john.doe@company.com",
      phone: "9876543210",
      joinDate: "2023-01-15",
      status: "Active"
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "UI/UX Designer",
      department: "Design",
      currentLocation: "San Francisco",
      email: "jane.smith@company.com",
      phone: "9123456780",
      joinDate: "2023-03-10",
      status: "Active"
    },
    {
      id: 3,
      name: "Michael Johnson",
      position: "Project Manager",
      department: "Management",
      currentLocation: "Chicago",
      email: "michael.j@company.com",
      phone: "9988776655",
      joinDate: "2022-11-20",
      status: "Active"
    },
    {
      id: 4,
      name: "Sarah Wilson",
      position: "Data Analyst",
      department: "Analytics",
      currentLocation: "Boston",
      email: "sarah.wilson@company.com",
      phone: "9456781230",
      joinDate: "2023-06-18",
      status: "Active"
    },
    {
      id: 5,
      name: "Robert Brown",
      position: "DevOps Engineer",
      department: "Engineering",
      currentLocation: "Austin",
      email: "robert.b@company.com",
      phone: "9678904321",
      joinDate: "2023-02-12",
      status: "Active"
    }
  ];


  const mockTransferHistory = [
    {
      id: 1,
      employeeName: "John Doe",
      fromDepartment: "Engineering",
      toDepartment: "Research & Development",
      fromLocation: "New York",
      toLocation: "Boston",
      transferDate: "2024-01-15",
      effectiveDate: "2024-02-01",
      reason: "Project Requirements",
      status: "Completed"
    },
    {
      id: 2,
      employeeName: "Jane Smith",
      fromDepartment: "Design",
      toDepartment: "Product Design",
      fromLocation: "San Francisco",
      toLocation: "New York",
      transferDate: "2024-02-20",
      effectiveDate: "2024-03-01",
      reason: "Team Restructuring",
      status: "Pending"
    }
  ];

  useEffect(() => {

    setLoading(true);
    setTimeout(() => {
      setEmployees(mockEmployees);
      setFilteredEmployees(mockEmployees);
      setTransferHistory(mockTransferHistory);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(emp => emp.currentLocation === locationFilter);
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, departmentFilter, locationFilter, employees]);

  const departments = [...new Set(employees.map(emp => emp.department))];
  const locations = [...new Set(employees.map(emp => emp.currentLocation))];

  const handleInitiateTransfer = (employee) => {
    setSelectedEmployee(employee);
    setTransferData({
      currentDepartment: employee.department,
      newDepartment: "",
      currentLocation: employee.currentLocation,
      newLocation: "",
      transferDate: new Date().toISOString().split('T')[0],
      reason: "",
      remarks: "",
      effectiveDate: "",
      salaryAdjustment: "",
      reportingManager: ""
    });
    setShowTransferModal(true);
    setShowActionMenu(null);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    setTimeout(() => {
      const newTransfer = {
        id: transferHistory.length + 1,
        employeeName: selectedEmployee.name,
        fromDepartment: transferData.currentDepartment,
        toDepartment: transferData.newDepartment,
        fromLocation: transferData.currentLocation,
        toLocation: transferData.newLocation,
        transferDate: transferData.transferDate,
        effectiveDate: transferData.effectiveDate,
        reason: transferData.reason,
        status: "Pending Approval"
      };

      setTransferHistory(prev => [newTransfer, ...prev]);


      setEmployees(prev => prev.map(emp =>
        emp.id === selectedEmployee.id
          ? {
            ...emp,
            department: transferData.newDepartment,
            currentLocation: transferData.newLocation
          }
          : emp
      ));

      setLoading(false);
      setShowTransferModal(false);
      setSelectedEmployee(null);


      alert(`Transfer initiated successfully for ${selectedEmployee.name}`);
    }, 2000);
  };

  const downloadTransferReport = () => {
    const headers = ["Employee Name", "From Department", "To Department", "From Location", "To Location", "Transfer Date", "Effective Date", "Reason", "Status"];
    const rows = transferHistory.map(transfer => [
      transfer.employeeName,
      transfer.fromDepartment,
      transfer.toDepartment,
      transfer.fromLocation,
      transfer.toLocation,
      transfer.transferDate,
      transfer.effectiveDate,
      transfer.reason,
      transfer.status
    ]);

    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employee_transfer_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatusBadge = ({ status }) => {
    const config = {
      "Completed": "bg-green-100 text-green-800 border-green-200",
      "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Pending Approval": "bg-blue-100 text-blue-800 border-blue-200",
      "Rejected": "bg-red-100 text-red-800 border-red-200"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Employee Transfer Management</h1>
          <p className="text-gray-600 mt-1">Manage employee transfers between departments and locations</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{employees.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Transfers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {transferHistory.filter(t => t.status === "Pending" || t.status === "Pending Approval").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Transfers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {transferHistory.filter(t => t.status === "Completed").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{departments.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Employees List</h2>

              <div className="flex gap-3">
                <button
                  onClick={downloadTransferReport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>


            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>


            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.position}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <MapPin size={14} />
                          {employee.currentLocation}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setShowActionMenu(showActionMenu?.id === employee.id ? null : {
                                id: employee.id,
                                top: rect.bottom + window.scrollY,
                                left: rect.left + window.scrollX
                              });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Actions
                            {showActionMenu?.id === employee.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {showActionMenu?.id === employee.id && ReactDOM.createPortal(
                            <div
                              className="absolute z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                              style={{
                                top: showActionMenu.top,
                                left: Math.max(showActionMenu.left - 100, 10),
                              }}
                            >
                              <button
                                onClick={() => handleInitiateTransfer(employee)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Initiate Transfer
                              </button>
                              <button
                                onClick={() => navigate(`/employee-details/${employee.id}`)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                View Details
                              </button>
                            </div>,
                            document.body
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg">No employees found</div>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Transfer History</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transferHistory.map((transfer) => (
                <div key={transfer.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{transfer.employeeName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transfer.transferDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={transfer.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">From:</span>
                      <p className="font-medium">{transfer.fromDepartment}</p>
                      <p className="text-gray-500">{transfer.fromLocation}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">To:</span>
                      <p className="font-medium">{transfer.toDepartment}</p>
                      <p className="text-gray-500">{transfer.toLocation}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Reason:</span>
                    <p className="text-sm text-gray-700">{transfer.reason}</p>
                  </div>
                </div>
              ))}

              {transferHistory.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg">No transfer history</div>
                  <p className="text-gray-500">Initiate transfers to see history</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {showTransferModal && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Initiate Employee Transfer
                </h2>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>


              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Employee Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Name:</span> {selectedEmployee.name}
                  </div>
                  <div>
                    <span className="text-blue-700">Position:</span> {selectedEmployee.position}
                  </div>
                  <div>
                    <span className="text-blue-700">Current Dept:</span> {selectedEmployee.department}
                  </div>
                  <div>
                    <span className="text-blue-700">Current Location:</span> {selectedEmployee.currentLocation}
                  </div>
                </div>
              </div>

              <form onSubmit={handleTransferSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Department *
                    </label>
                    <select
                      required
                      value={transferData.newDepartment}
                      onChange={(e) => setTransferData(prev => ({ ...prev, newDepartment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.filter(dept => dept !== selectedEmployee.department).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Location *
                    </label>
                    <select
                      required
                      value={transferData.newLocation}
                      onChange={(e) => setTransferData(prev => ({ ...prev, newLocation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Location</option>
                      {locations.filter(loc => loc !== selectedEmployee.currentLocation).map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={transferData.transferDate}
                      onChange={(e) => setTransferData(prev => ({ ...prev, transferDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effective Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={transferData.effectiveDate}
                      onChange={(e) => setTransferData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Transfer *
                  </label>
                  <select
                    required
                    value={transferData.reason}
                    onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Reason</option>
                    <option value="Project Requirements">Project Requirements</option>
                    <option value="Team Restructuring">Team Restructuring</option>
                    <option value="Career Growth">Career Growth</option>
                    <option value="Performance">Performance</option>
                    <option value="Employee Request">Employee Request</option>
                    <option value="Organizational Needs">Organizational Needs</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Remarks
                  </label>
                  <textarea
                    value={transferData.remarks}
                    onChange={(e) => setTransferData(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Add any additional remarks or notes..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Initiate Transfer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferPage;