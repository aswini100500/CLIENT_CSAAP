import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function LeaveApplicationList() {
  const [search, setSearch] = useState("");
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HRMS_BASE_URL}/api/employee`,
        );



        const formatted = res.data?.data?.map((emp) => ({
          id: emp.id,
          employeeName: emp.name || "---",
          employeeCode: `EMP${emp.id}`,
          department: emp.department || "---",
          leaveType: emp.leaveType || "Casual Leave",
          fromDate: emp.fromDate || emp.joinDate,
          toDate: emp.toDate || emp.resignDate,
          appliedOn: emp.joinDate,
          days: 1,
          reason: emp.reason || "Not Provided",
          status: emp.status || "pending",
          statusColor:
            emp.status === "approved"
              ? "green"
              : emp.status === "rejected"
                ? "red"
                : "yellow",
        }));

        setApplications(formatted);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed to fetch data",
          text: "Unable to load leave applications.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const term = search.toLowerCase();
    const matchesSearch =
      app.employeeName.toLowerCase().includes(term) ||
      app.employeeCode.toLowerCase().includes(term) ||
      app.department.toLowerCase().includes(term) ||
      app.leaveType.toLowerCase().includes(term);

    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApplications(filteredApplications.map((app) => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (id) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(
        selectedApplications.filter((item) => item !== id),
      );
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  const isAllSelected =
    filteredApplications.length > 0 &&
    selectedApplications.length === filteredApplications.length;


  const handleApprove = () => {
    if (selectedApplications.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select applications to approve.",
      });
      return;
    }

    Swal.fire({
      title: "Approve Applications?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Approve",
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = applications.map((app) =>
          selectedApplications.includes(app.id)
            ? { ...app, status: "approved", statusColor: "green" }
            : app,
        );
        setApplications(updated);
        setSelectedApplications([]);
        Swal.fire("Approved!", "", "success");
      }
    });
  };


  const handleDelete = () => {
    if (selectedApplications.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Select applications to delete.",
      });
      return;
    }

    Swal.fire({
      title: "Delete Applications?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = applications.filter(
          (app) => !selectedApplications.includes(app.id),
        );
        setApplications(updated);
        setSelectedApplications([]);
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  const getStatusBadge = (status, color) => {
    const classes = {
      green: "bg-green-100 text-green-800 border-green-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${classes[color]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "---";




  if (loading)
    return (
      <div className="text-center py-20 text-xl font-semibold text-gray-600">
        Loading leave applications...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-lg shadow">
        📋 Leave Application List
      </div>


      <div className="bg-white shadow p-4 rounded-md m-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search employee, code, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-60 text-sm"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="text-sm text-gray-500">
            {filteredApplications.length} record(s) found
          </div>
        </div>
      </div>


      <div className="bg-white shadow rounded-md m-4 overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-blue-50 text-blue-600">
            <tr>
              <th className="p-3 border">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={isAllSelected}
                />
              </th>
              <th className="p-3 border text-left">Employee</th>
              <th className="p-3 border text-left">Code</th>
              <th className="p-3 border text-left">Department</th>
              <th className="p-3 border text-left">From</th>
              <th className="p-3 border text-left">To</th>
              <th className="p-3 border text-left">Applied</th>
              <th className="p-3 border text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr
                key={app.id}
                className={`hover:bg-gray-50 ${
                  selectedApplications.includes(app.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="p-3 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(app.id)}
                    onChange={() => handleSelectApplication(app.id)}
                  />
                </td>
                <td className="p-3 border">{app.employeeName}</td>
                <td className="p-3 border">{app.employeeCode}</td>
                <td className="p-3 border">{app.department}</td>
                <td className="p-3 border">{formatDate(app.fromDate)}</td>
                <td className="p-3 border">{formatDate(app.toDate)}</td>
                <td className="p-3 border">{formatDate(app.appliedOn)}</td>
                <td className="p-3 border">
                  {getStatusBadge(app.status, app.statusColor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="flex justify-center gap-4 my-6">
        <button
          onClick={handleApprove}
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          Approve ({selectedApplications.length})
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-6 py-2 rounded"
        >
          Delete ({selectedApplications.length})
        </button>
      </div>
    </div>
  );
}
