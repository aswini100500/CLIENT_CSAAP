import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Calculator,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  DollarSign,
  Download,
  FileText,
  Filter,
  Mail,
  Phone,
  Save,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";

const AcceptedEmployees = () => {
  const { has } = usePermission();
  const canSetup = has("hrms.employee.onboarding.setup");
  const canExport = has("hrms.employee.export");
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [payrollData, setPayrollData] = useState({});
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  const entriesPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcceptedEmployees = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/employees/accepted`,
        );
        if (res.data.success) {
          setEmployees(res.data.data || getSampleAcceptedEmployees());

          const uniqueDepts = [
            ...new Set(
              (res.data.data || getSampleAcceptedEmployees()).map(
                (emp) => emp.department,
              ),
            ),
          ];
          setDepartments(uniqueDepts);
        }
      } catch (err) {
        console.error("Error fetching accepted employees:", err);

        setEmployees(getSampleAcceptedEmployees());
        const uniqueDepts = [
          ...new Set(getSampleAcceptedEmployees().map((emp) => emp.department)),
        ];
        setDepartments(uniqueDepts);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedEmployees();
  }, []);

  const getSampleAcceptedEmployees = () => [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Developer",
      department: "Engineering",
      joinDate: "2024-01-15",
      employeeId: "EMP001",
      status: "Accepted",
      salary: 75000,
      payrollSetup: false,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      phone: "+1 (555) 987-6543",
      position: "Product Manager",
      department: "Product",
      joinDate: "2024-02-01",
      employeeId: "EMP002",
      status: "Accepted",
      salary: 85000,
      payrollSetup: true,
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@company.com",
      phone: "+1 (555) 456-7890",
      position: "UX Designer",
      department: "Design",
      joinDate: "2024-01-20",
      employeeId: "EMP003",
      status: "Accepted",
      salary: 65000,
      payrollSetup: false,
    },
  ];

  const filteredData = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter
      ? employee.department === departmentFilter
      : true;

    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  const calculatePayrollComponents = (basicSalary) => {
    const basic = basicSalary * 0.5;
    const hra = basicSalary * 0.25;
    const conveyance = 1600;
    const medical = 1250;
    const specialAllowance = basicSalary - (basic + hra + conveyance + medical);

    const pf = basic * 0.12;
    const esi = basicSalary * 0.0075;
    const professionalTax = 200;

    const grossSalary = basic + hra + conveyance + medical + specialAllowance;
    const totalDeductions = pf + esi + professionalTax;
    const netSalary = grossSalary - totalDeductions;

    return {
      basic: Math.round(basic),
      hra: Math.round(hra),
      conveyance: Math.round(conveyance),
      medical: Math.round(medical),
      specialAllowance: Math.round(specialAllowance),
      pf: Math.round(pf),
      esi: Math.round(esi),
      professionalTax: Math.round(professionalTax),
      grossSalary: Math.round(grossSalary),
      totalDeductions: Math.round(totalDeductions),
      netSalary: Math.round(netSalary),
    };
  };

  const recalculatePayroll = (currentPayroll, field, value) => {
    let updatedPayroll = { ...currentPayroll, [field]: parseFloat(value) || 0 };

    updatedPayroll.grossSalary =
      updatedPayroll.basic +
      updatedPayroll.hra +
      updatedPayroll.conveyance +
      updatedPayroll.medical +
      updatedPayroll.specialAllowance;

    updatedPayroll.pf = updatedPayroll.basic * 0.12;

    updatedPayroll.totalDeductions =
      updatedPayroll.pf + updatedPayroll.esi + updatedPayroll.professionalTax;

    updatedPayroll.netSalary =
      updatedPayroll.grossSalary - updatedPayroll.totalDeductions;

    return updatedPayroll;
  };

  const initializePayrollData = (employee) => {
    const components = calculatePayrollComponents(employee.salary);
    return {
      employeeId: employee.id,
      basicSalary: employee.salary,
      ...components,
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      panNumber: "",
      uanNumber: "",
    };
  };

  const handleEditPayroll = (employee) => {
    if (!canSetup) {
      alert("You do not have permission to setup candidate payroll");
      return;
    }
    const payroll = payrollData[employee.id] || initializePayrollData(employee);
    setPayrollData((prev) => ({ ...prev, [employee.id]: payroll }));
    setEditingPayroll(employee.id);
  };

  const handleSavePayroll = async (employeeId) => {
    if (!canSetup) {
      alert("You do not have permission to setup candidate payroll");
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employees/${employeeId}/payroll`,
        {
          payroll: payrollData[employeeId],
        },
      );

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, payrollSetup: true } : emp,
        ),
      );

      setEditingPayroll(null);
    } catch (error) {
      console.error("Error saving payroll:", error);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, payrollSetup: true } : emp,
        ),
      );
      setEditingPayroll(null);
    }
  };

  const handlePayrollChange = (employeeId, field, value) => {
    setPayrollData((prev) => ({
      ...prev,
      [employeeId]: recalculatePayroll(prev[employeeId], field, value),
    }));
  };

  const downloadPayslip = (employee) => {
    const payroll = payrollData[employee.id];
    if (!payroll) {
      alert("Please set up payroll first");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("PAYSLIP", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `For the month of ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
      105,
      28,
      { align: "center" },
    );

    doc.setFontSize(8);
    doc.text("Company Name: Your Company Inc.", 14, 40);
    doc.text("Address: 123 Business Street, City, State - 12345", 14, 46);

    doc.text(`Employee Name: ${employee.name}`, 14, 58);
    doc.text(`Employee ID: ${employee.employeeId}`, 14, 64);
    doc.text(`Department: ${employee.department}`, 14, 70);
    doc.text(`Designation: ${employee.position}`, 14, 76);

    autoTable(doc, {
      startY: 85,
      head: [["Earnings", "Amount (₹)"]],
      body: [
        ["Basic Salary", payroll.basic.toLocaleString()],
        ["House Rent Allowance", payroll.hra.toLocaleString()],
        ["Conveyance Allowance", payroll.conveyance.toLocaleString()],
        ["Medical Allowance", payroll.medical.toLocaleString()],
        ["Special Allowance", payroll.specialAllowance.toLocaleString()],
      ],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Deductions", "Amount (₹)"]],
      body: [
        ["Provident Fund (PF)", payroll.pf.toLocaleString()],
        ["ESI", payroll.esi.toLocaleString()],
        ["Professional Tax", payroll.professionalTax.toLocaleString()],
      ],
      theme: "grid",
      headStyles: { fillColor: [239, 68, 68] },
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(243, 244, 246);
    doc.rect(14, finalY, 182, 20, "F");

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Gross Salary: ₹${payroll.grossSalary.toLocaleString()}`,
      20,
      finalY + 8,
    );
    doc.text(
      `Total Deductions: ₹${payroll.totalDeductions.toLocaleString()}`,
      20,
      finalY + 15,
    );

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(
      `Net Salary: ₹${payroll.netSalary.toLocaleString()}`,
      120,
      finalY + 12,
    );

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "This is a computer generated payslip and does not require signature.",
      105,
      280,
      { align: "center" },
    );

    doc.save(
      `payslip-${employee.employeeId}-${new Date().getMonth() + 1}-${new Date().getFullYear()}.pdf`,
    );
  };

  const StatusBadge = ({ status }) => (
    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
      <UserCheck size={12} />
      {status}
    </span>
  );

  const PayrollBadge = ({ isSetup }) => (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        isSetup
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {isSetup ? "Payroll Set" : "Setup Required"}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Accepted Employees
          </h1>
          <p className="text-gray-600 mt-1">
            Manage payroll and employee details for accepted candidates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Accepted
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {employees.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payroll Set</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {employees.filter((e) => e.payrollSetup).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Setup
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {employees.filter((e) => !e.payrollSetup).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    employees.filter((e) => {
                      const joinDate = new Date(e.joinDate);
                      const now = new Date();
                      return (
                        joinDate.getMonth() === now.getMonth() &&
                        joinDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={18} />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position & Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payroll
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
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
                            <div className="text-sm text-gray-500">
                              {employee.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.position}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Mail size={14} />
                          {employee.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={14} />
                          {employee.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={employee.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PayrollBadge isSetup={employee.payrollSetup} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="relative inline-block">
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              onClick={(e) => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                if (showActionMenu?.id === employee.id) {
                                  setShowActionMenu(null);
                                } else {
                                  setShowActionMenu({
                                    id: employee.id,
                                    top: rect.bottom + window.scrollY,
                                    left: rect.left + window.scrollX - 150,
                                  });
                                }
                              }}
                            >
                              Action{" "}
                              {showActionMenu?.id === employee.id ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>

                            {showActionMenu?.id === employee.id &&
                              ReactDOM.createPortal(
                                <div
                                  className="absolute z-50 w-56 bg-white rounded-md shadow-lg border border-gray-200"
                                  style={{
                                    position: "absolute",
                                    top: showActionMenu.top,
                                    left: Math.max(showActionMenu.left, 10),
                                  }}
                                >
                                  <div className="py-1">
                                    {canSetup && (
                                      <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                        onClick={() => {
                                          handleEditPayroll(employee);
                                          setShowActionMenu(null);
                                        }}
                                      >
                                        <DollarSign size={16} />
                                        {employee.payrollSetup
                                          ? "Edit Payroll"
                                          : "Setup Payroll"}
                                      </button>
                                    )}

                                    {canExport && (
                                      <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                        onClick={() => {
                                          downloadPayslip(employee);
                                          setShowActionMenu(null);
                                        }}
                                      >
                                        <Download size={16} />
                                        Download Payslip
                                      </button>
                                    )}

                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={() => {
                                        setSelectedEmployee(employee);
                                        setShowActionMenu(null);
                                      }}
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>,
                                document.body,
                              )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 mb-2 text-lg">
                          No accepted employees found
                        </div>
                        <p className="text-gray-500">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + entriesPerPage, filteredData.length)}
              </span>{" "}
              of <span className="font-medium">{filteredData.length}</span>{" "}
              entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
                {currentPage}
              </span>

              <button
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {editingPayroll && payrollData[editingPayroll] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-semibold text-gray-900">
                  Payroll Setup -{" "}
                  {employees.find((e) => e.id === editingPayroll)?.name}
                </h2>
                <button
                  onClick={() => setEditingPayroll(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <PayrollForm
                  payroll={payrollData[editingPayroll]}
                  employee={employees.find((e) => e.id === editingPayroll)}
                  onChange={(field, value) =>
                    handlePayrollChange(editingPayroll, field, value)
                  }
                  onSave={() => handleSavePayroll(editingPayroll)}
                  onCancel={() => setEditingPayroll(null)}
                />
              </div>
            </div>
          </div>
        )}

        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Employee Details
                </h2>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <EmployeeDetails employee={selectedEmployee} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PayrollForm = ({ payroll, employee, onChange, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState("salary");

  const salaryComponents = [
    { label: "Basic Salary", key: "basic", editable: true },
    { label: "House Rent Allowance (HRA)", key: "hra", editable: true },
    { label: "Conveyance Allowance", key: "conveyance", editable: true },
    { label: "Medical Allowance", key: "medical", editable: true },
    { label: "Special Allowance", key: "specialAllowance", editable: true },
  ];

  const deductions = [
    { label: "Provident Fund (PF) - 12% of Basic", key: "pf", editable: false },
    { label: "ESI", key: "esi", editable: true },
    { label: "Professional Tax", key: "professionalTax", editable: true },
  ];

  const summary = [
    { label: "Gross Salary", key: "grossSalary", editable: false },
    { label: "Total Deductions", key: "totalDeductions", editable: false },
    { label: "Net Salary", key: "netSalary", editable: false },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("salary")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "salary"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Salary Components
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "bank"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Bank Details
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "preview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Preview
          </button>
        </nav>
      </div>

      {activeTab === "salary" && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-blue-900">
                Salary Calculator
              </h3>
            </div>
            <p className="text-sm text-blue-700">
              All fields are editable. PF is automatically calculated as 12% of
              Basic Salary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {salaryComponents.map((component) => (
              <div key={component.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {component.label}
                </label>
                <input
                  type="number"
                  value={payroll[component.key]}
                  onChange={(e) => onChange(component.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!component.editable}
                />
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Salary Breakdown
            </h3>

            <div className="space-y-3">
              {salaryComponents.map((component) => (
                <div
                  key={component.key}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-600">
                    {component.label}
                  </span>
                  <span className="font-medium">
                    ₹{payroll[component.key]?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Deductions
              </h4>
              <div className="space-y-3">
                {deductions.map((deduction) => (
                  <div
                    key={deduction.key}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">
                      {deduction.label}
                    </span>
                    <span className="font-medium text-red-600">
                      -₹{payroll[deduction.key]?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="space-y-3">
                {summary.map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between items-center"
                  >
                    <span
                      className={`text-sm font-medium ${
                        item.key === "netSalary"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`font-bold ${
                        item.key === "netSalary"
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {item.key === "netSalary" ? "₹" : "₹"}
                      {payroll[item.key]?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bank" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              value={payroll.bankName}
              onChange={(e) => onChange("bankName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={payroll.accountNumber}
              onChange={(e) => onChange("accountNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              value={payroll.ifscCode}
              onChange={(e) => onChange("ifscCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number
            </label>
            <input
              type="text"
              value={payroll.panNumber}
              onChange={(e) => onChange("panNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UAN Number
            </label>
            <input
              type="text"
              value={payroll.uanNumber}
              onChange={(e) => onChange("uanNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Salary Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{payroll.grossSalary?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Gross Salary</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-red-600">
                  ₹{payroll.totalDeductions?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Deductions</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  ₹{payroll.netSalary?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Net Salary</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Preview Only
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a preview of the payroll setup. Click "Save Payroll"
                    to finalize the configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          Save Payroll
        </button>
      </div>
    </div>
  );
};

const EmployeeDetails = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium text-lg">
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {employee.name}
          </h3>
          <p className="text-gray-600">
            {employee.position} • {employee.department}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Employee ID
            </label>
            <p className="text-sm text-gray-900">{employee.employeeId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-sm text-gray-900">{employee.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-sm text-gray-900">{employee.phone}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Department
            </label>
            <p className="text-sm text-gray-900">{employee.department}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Position
            </label>
            <p className="text-sm text-gray-900">{employee.position}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Join Date
            </label>
            <p className="text-sm text-gray-900">
              {new Date(employee.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {employee.salary && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">
            Salary Information
          </h4>
          <p className="text-2xl font-bold text-green-600">
            ₹{employee.salary.toLocaleString()}
            <span className="text-sm font-normal text-gray-600">/year</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AcceptedEmployees;
