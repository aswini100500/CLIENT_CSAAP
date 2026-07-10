import React, { useState,useEffect } from "react";
import { Trash2, Search, User, ChevronLeft, ChevronRight, FileText, Download, Eye, X } from "lucide-react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

const NoticeFormModal = ({ employee, onClose }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [remark, setRemark] = useState("");
const [employees, setEmployees] = useState([]);


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post(`${import.meta.env.VITE_HRMS_BASE_URL}/api/noticeletters/add`, {
employeeId: employee.id,


      fromDate,
      toDate,
      remark,
    });

    alert("Notice added successfully!");
    onClose();

  } catch (err) {
    console.error("Failed to add notice:", err);
    alert("Failed to add notice.");
  }
};



  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Notice To Employee</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-400 rounded-md py-1.5 focus:ring-blue-500 focus:border-blue-500"
            required
           />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 p-2 block w-full   border border-gray-400 rounded-md py-1.5 focus:ring-blue-500 focus:border-blue-500"
             required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Remark</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-400 rounded-md py-1.5 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
               required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function NoticeLetterPage() {
  const [search, setSearch] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showNoticeForm, setShowNoticeForm] = useState(null);
  const [employees, setEmployees] = useState([]); 
const [loading, setLoading] = useState(true);

const { user } = useAuth();
    console.log("Current user:", user);
    const id = user?.id 
    console.log(id);
    const slug=user.slug;

useEffect(() => {
  if (!id) return; 

  const fetchNotices = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee/${slug}`
      );

      const mapped = (res.data.data || []).map(e => ({
        id: e.id,
        name: e.name,
        designation: e.postApplied || "",
        department: e.department || "",
        status: e.noticeStatus || "No Notice",
        fromDate: e.fromDate,
        toDate: e.toDate,
        remark: e.remark
      }));

      setEmployees(mapped);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch notice letters:", err);
      setLoading(false);
    }
  };

  fetchNotices();
}, [id]);










const filtered = Array.isArray(employees)
  ? employees.filter((e) =>
(e.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (e.postApplied || e.designation || "").toLowerCase()

        .includes(search.toLowerCase()) ||
      (e.department || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  : [];



  const totalPages = Math.ceil(filtered.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentEmployees = filtered.slice(startIndex, endIndex);

  function handleSendNotice(id) {
    if (window.confirm("Are you sure you want to send a notice to this employee?")) {
      const employee = employees.find((emp) => emp.id === id);
      setShowNoticeForm(employee);
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }


  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
  };


const handleDownload = (employee) => {
  const employeeData = `
Employee: ${employee.name}
  Designation: ${employee.designation}
  Department: ${employee.department}
  From Date: ${employee.fromDate || "N/A"}
  To Date: ${employee.toDate || "N/A"}
  Remark: ${employee.remark || "N/A"}
`;

  const blob = new Blob([employeeData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
a.download = `notice_${employee.name.replace(/\s+/g, "_")}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notice To Employee</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and send notices to employees</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center">
              <User size={16} className="mr-1" />
              {employees.length} Employees
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="entries" className="text-sm text-gray-600">
                Show
              </label>
              <select
                id="entries"
                value={entriesToShow}
                onChange={(e) => {
                  setEntriesToShow(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                placeholder="Search employees..."
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
             <tbody className="bg-white divide-y divide-gray-200">
  {currentEmployees.length > 0 ? (
    currentEmployees.map((emp) => (
      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
<td className="px-6 py-4 whitespace-nowrap">{emp.name}</td>
<td className="px-6 py-4 whitespace-nowrap">{emp.designation}</td>
<td className="px-6 py-4 whitespace-nowrap">{emp.email}</td>

<td className="px-6 py-4 whitespace-nowrap">
  <span
    className={`px-3 py-1 text-xs font-semibold rounded-full ${
      emp.status === "Sent"
        ? "bg-yellow-100 text-yellow-800"
        : emp.status === "No Notice"
        ? "bg-gray-200 text-gray-700"
        : "bg-green-100 text-green-800"
    }`}
  >
    {emp.status}
  </span>
</td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendNotice(emp.id)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              <FileText size={16} /> Notice
            </button>
            <button
              onClick={() => handleDownload(emp)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download size={16} />
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="px-6 py-8 text-center">
        <div className="text-gray-500 flex flex-col items-center">
          <Search size={48} className="text-gray-300 mb-2" />
          <p className="font-medium">No notice letters found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>


          <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700 mb-4 md:mb-0">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, filtered.length)}</span> of{" "}
              <span className="font-medium">{filtered.length}</span> results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>


      {selectedEmployee && (
        <EmployeeDetailsModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}


      {showNoticeForm && (
        <NoticeFormModal employee={showNoticeForm} onClose={() => setShowNoticeForm(null)} />
      )}
    </div>
  );
}


const EmployeeDetailsModal = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 shrink-0 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="font-medium text-blue-800 text-xl">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
              <p className="text-gray-600">ID: {employee.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Designation</h4>
              <p className="text-gray-900">{employee.designation}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Department</h4>
              <p className="text-gray-900">{employee.department}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Status</h4>
              <p className="text-gray-900">{employee.status}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Employment Date</h4>
              <p className="text-gray-900">January 15, 2023</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Notice History</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">No notices issued yet.</p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};