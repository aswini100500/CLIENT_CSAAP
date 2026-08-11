import React, { useState, useEffect } from "react";
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  X,
} from "lucide-react";
import axios from "axios";

const TerminationFormModal = ({ employee, onClose, onTerminate }) => {
  const [terminationType, setTerminationType] = useState("Terminated");
  const [date, setDate] = useState("");
  const [remark, setRemark] = useState("");
  const [noticePeriod, setNoticePeriod] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      alert("Please select a termination date.");
      return;
    }
    if (!remark.trim()) {
      alert("Please enter a remark.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to terminate ${employee.name}? This action cannot be undone.`,
      )
    ) {
      onTerminate({
        employeeId: employee.employeeId || employee.id,
        terminationType,
        date,
        remark,
        noticePeriod,
        employee: {
          id: employee.employeeId || employee.id,
          name: employee.name,
          email: employee.email || employee.officeEmail || "",
          phone: employee.phone || employee.contact || "",
          designation:
            employee.designation ||
            employee.postApplied ||
            employee.position ||
            "N/A",
        },
      });
      onClose();
    }
  };

  return (
    <div
      className="app-modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="app-modal max-w-md w-full p-6 border border-(--border-strong) bg-white shadow-2xl rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-(--border-soft) pb-4 mb-4">
          <h2 className="text-base font-extrabold text-(--text-strong) tracking-tight">
            Terminate Employee
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-(--text-soft) hover:text-(--text-strong) rounded-lg hover:bg-(--bg-subtle) transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-(--text-strong) mb-1">
              Termination Type
            </label>
            <select
              value={terminationType}
              onChange={(e) => setTerminationType(e.target.value)}
              className="app-input w-full cursor-pointer"
            >
              <option value="Terminated">Terminated</option>
              <option value="Resigned">Resigned</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-(--text-strong) mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="app-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-(--text-strong) mb-1">
              Remark
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="app-input w-full min-h-17.5 resize-none"
              rows="2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-(--text-strong) mb-1">
              Notice Period (Days)
            </label>
            <input
              type="number"
              min="0"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              className="app-input w-full"
              required
            />
            <p className="text-[10px] font-medium text-(--text-soft) mt-1 flex items-center gap-1">
              <span className="text-(--brand)">💡</span>
              <span>
                Enter 0 for immediate termination (marks as Ex-Employee).
              </span>
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-(--border-soft) text-(--text-strong) font-bold rounded-xl hover:bg-(--bg-subtle) transition-all text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-sm shadow-red-100"
            >
              Terminate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TerminateEmployeePage() {
  const [search, setSearch] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [showTerminationForm, setShowTerminationForm] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/terminate`,
      );
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  }

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentEmployees = filtered.slice(startIndex, endIndex);

  async function handleTerminate(data) {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/terminate/terminate`,
        data,
      );
      const updatedEmployee = res.data.employee;

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === updatedEmployee.id ? updatedEmployee : emp,
        ),
      );

      alert("Employee terminated successfully!");
    } catch (err) {
      console.error("Error terminating employee:", err);
      alert(err.response?.data?.message || "Failed to terminate employee");
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  return (
    <div className="erp-root app-shell font-sans">
      <div className="mx-auto max-w-7xl px-3 py-4 lg:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <div>
            <h1 className="app-title max-w-3xl">Terminate Employee</h1>
            <p className="app-subtitle mt-1">
              Manage and track company separations and terminations
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-(--brand-soft) text-(--brand) border border-(--border-soft) px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5">
              <UserCheck size={14} />
              {employees.length} Employees
            </span>
          </div>
        </div>

        <div className="app-panel p-6 border border-(--border-soft) bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="entries"
                className="text-xs font-bold text-(--text-soft)"
              >
                Show
              </label>
              <select
                id="entries"
                value={entriesToShow}
                onChange={(e) => {
                  setEntriesToShow(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="app-input py-1 px-3 text-xs w-20 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs font-bold text-(--text-soft)">
                entries
              </span>
            </div>

            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-faint)"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="app-input pl-10 w-full text-xs"
                placeholder="Search employees..."
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-(--border-soft)">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-(--bg-subtle)/50 border-b border-(--border-soft)">
                  <th className="px-6 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                    Employee Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                    Designation
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-soft)">
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-(--bg-subtle)/40 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 shrink-0 bg-(--brand-soft) border border-(--border-strong) rounded-full flex items-center justify-center shadow-sm">
                            <span className="font-bold text-xs text-(--brand)">
                              {emp.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="font-extrabold text-[13px] text-(--text-strong)">
                              {emp.name}
                            </div>
                            <div className="text-[10px] font-bold text-(--text-soft)">
                              ID: {emp.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-(--text-strong) font-semibold">
                        {emp.designation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-[10px] font-extrabold leading-5 rounded-full border ${
                            emp.status === "Terminated"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-green-50 text-green-700 border-green-100"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {emp.status === "Active" ? (
                          <button
                            onClick={() => setShowTerminationForm(emp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-xs font-bold border border-red-100 cursor-pointer shadow-sm shadow-red-50"
                          >
                            <Trash2 size={13} /> Terminate
                          </button>
                        ) : (
                          <span className="text-red-600 font-extrabold text-xs">
                            Terminated
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center bg-white">
                      <div className="text-(--text-soft) flex flex-col items-center justify-center">
                        <Search
                          size={44}
                          className="text-(--text-faint) mb-3"
                        />
                        <p className="font-bold text-sm text-(--text-strong)">
                          No employees found
                        </p>
                        <p className="text-xs text-(--text-soft) mt-1">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-(--border-soft)">
            <div className="text-xs font-bold text-(--text-soft) mb-4 md:mb-0">
              Showing{" "}
              <span className="text-(--text-strong)">{startIndex + 1}</span> to{" "}
              <span className="text-(--text-strong)">
                {Math.min(endIndex, filtered.length)}
              </span>{" "}
              of <span className="text-(--text-strong)">{filtered.length}</span>{" "}
              results
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-9 h-9 rounded-xl border font-bold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      currentPage === page
                        ? "bg-(--brand) text-white border-(--brand) shadow-sm shadow-(--brand-soft)"
                        : "bg-white border-(--border-soft) text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong)"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-(--border-soft) bg-white text-(--text-soft) hover:bg-(--bg-subtle) hover:text-(--text-strong) disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTerminationForm && (
        <TerminationFormModal
          employee={showTerminationForm}
          onClose={() => setShowTerminationForm(null)}
          onTerminate={handleTerminate}
        />
      )}
    </div>
  );
}
