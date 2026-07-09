import axios from "axios";
import { Calendar, ChevronDown, RefreshCw, Search, Users } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../../../../hooks/useAuth";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatDuration = (value) => {
  if (!value) return "-";
  if (typeof value === "string" && value.includes(":")) {
    const [hours = "0", minutes = "0"] = value.split(":");
    return `${Number(hours)}h ${Number(minutes)}m`;
  }
  return String(value);
};

export default function TimesheetReport() {
  const { user } = useAuth();
  const slug = user?.slug;
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const [timesheetData, setTimesheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");
  const [currentPage, setCurrentPage] = useState(1);

  const years = [currentYear - 1, currentYear, currentYear + 1];
  const employeeOptions = useMemo(() => {
    const employees = Array.from(
      new Set(timesheetData.map((entry) => entry.employeeName).filter(Boolean)),
    );
    return ["All Employees", ...employees];
  }, [timesheetData]);

  const loadTimesheets = async () => {
    try {
      setLoading(true);

      if (!slug) {
        setTimesheetData([]);
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/timesheets`,
        {
          params: {
            slug,
          },
        },
      );

      const records = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.timesheets)
            ? res.data.timesheets
            : [];

      setTimesheetData(
        records.map((record) => ({
          id: record.id,
          employeeName:
            record.employee_name ||
            `Employee ${record.employeeId || record.employee_id || ""}`,
          date: record.date || record.attendance_date || "",
          details:
            record.taskDescription ||
            record.timesheet_details ||
            record.notes ||
            "-",
          duration:
            record.hoursWorked ||
            record.hours_worked ||
            record.total_hours ||
            "0",
          status: record.status || record.timesheet_status || "Pending",
          entryDate: record.created_at ? formatDate(record.created_at) : "-",
          approveDate: record.updated_at ? formatDate(record.updated_at) : "-",
          monthIndex: new Date(
            record.date ||
              record.attendance_date ||
              record.created_at ||
              Date.now(),
          ).getMonth(),
          year: new Date(
            record.date ||
              record.attendance_date ||
              record.created_at ||
              Date.now(),
          ).getFullYear(),
        })),
      );
    } catch (err) {
      console.error("Failed to fetch timesheets:", err);
      setTimesheetData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheets();
  }, [slug]);

  const filteredTimesheets = useMemo(() => {
    const selectedMonthIndex = MONTHS.indexOf(selectedMonth);

    return timesheetData.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(entry.details || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesMonth =
        selectedMonth === "All Months" ||
        (selectedMonthIndex >= 0 && entry.monthIndex === selectedMonthIndex);

      const matchesYear = Number(entry.year) === Number(selectedYear);

      const matchesEmployee =
        selectedEmployee === "All Employees" ||
        entry.employeeName === selectedEmployee;

      return matchesSearch && matchesMonth && matchesYear && matchesEmployee;
    });
  }, [
    timesheetData,
    searchTerm,
    selectedMonth,
    selectedYear,
    selectedEmployee,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, selectedYear, selectedEmployee]);

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentEntries = filteredTimesheets.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTimesheets.length / entriesPerPage),
  );

  const statusStyles = {
    Approved: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl bg-white shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-blue-800 px-8 py-6 text-white">
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Calendar className="h-8 w-8" />
              Timesheet Report
            </h1>
            <p className="mt-2 text-blue-100">
              View and filter employee timesheets from attendance records
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="All Months">All Months</option>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  {employeeOptions.map((employee) => (
                    <option key={employee} value={employee}>
                      {employee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search timesheets"
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{filteredTimesheets.length} entries found</span>
              </div>
              <button
                onClick={loadTimesheets}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Entry Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Approve Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center text-gray-500"
                      >
                        Loading timesheets...
                      </td>
                    </tr>
                  ) : currentEntries.length > 0 ? (
                    currentEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {entry.employeeName}
                        </td>
                        <td className="px-6 py-4 text-sm">{entry.details}</td>
                        <td className="px-6 py-4 text-sm">
                          {formatDuration(entry.duration)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[entry.status] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{entry.entryDate}</td>
                        <td className="px-6 py-4 text-sm">
                          {entry.approveDate}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center text-gray-500"
                      >
                        <div className="text-lg font-medium">
                          No timesheet entries found
                        </div>
                        <p className="mt-2 text-sm">
                          Try adjusting the filters or refresh the list.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {currentEntries.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
                to {Math.min(indexOfLastItem, filteredTimesheets.length)} of{" "}
                {filteredTimesheets.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-4 w-4 rotate-90 text-gray-400" />
                  <span>
                    {currentPage} / {totalPages}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
