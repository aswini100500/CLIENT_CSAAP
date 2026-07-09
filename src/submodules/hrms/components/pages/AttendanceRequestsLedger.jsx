import axios from "axios";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import useAuth from "../../../../hooks/useAuth";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;
const panelClass =
  "app-panel overflow-hidden transition-all hover:border-(--border-strong)";

const formatDateLabel = (dateValue) => {
  if (!dateValue) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
  }).format(new Date(`${dateValue}T12:00:00+05:30`));
};

const formatTimeOnly = (dateTimeValue) => {
  if (!dateTimeValue) return "-";
  const timePart = String(dateTimeValue).includes(" ")
    ? String(dateTimeValue).split(" ")[1]
    : String(dateTimeValue);
  return timePart.slice(0, 5);
};

const AttendanceRequestsLedger = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/attendance/requests`, {
        params: {
          slug: user?.slug || "",
          company_id: user?.company_id || user?.id || "",
          status: statusFilter,
        },
      });

      setRequests(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching attendance requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.slug, user?.company_id, user?.id, statusFilter]);

  const filteredRequests = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return requests.filter((item) => {
      if (!searchValue) return true;

      return (
        String(item.employee_name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(item.employee_id || "").includes(searchValue) ||
        String(item.timesheet_details || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(item.attendance_date || "").includes(searchValue)
      );
    });
  }, [requests, searchTerm]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((item) => item.approval_status === "Pending")
        .length,
      rejected: requests.filter((item) => item.approval_status === "Rejected")
        .length,
    }),
    [requests],
  );

  const approveRequest = async (request) => {
    const confirmed = window.confirm(
      `Approve the attendance request for ${request.employee_name} on ${request.attendance_date}?`,
    );
    if (!confirmed) return;

    try {
      setActionId(request.id);
      const response = await axios.post(
        `${API_BASE}/api/attendance/requests/${request.id}/approve`,
      );

      Swal.fire({
        icon: "success",
        title: "Request processed",
        text: response.data?.message || "Attendance request approved.",
        confirmButtonColor: "#00a651",
      });

      setRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Approval failed",
        text:
          error?.response?.data?.message ||
          "Unable to approve this request right now.",
        confirmButtonColor: "#00a651",
      });
    } finally {
      setActionId(null);
    }
  };

  const rejectRequest = async (request) => {
    const confirmed = window.confirm(
      `Reject the attendance request for ${request.employee_name} on ${request.attendance_date}?`,
    );
    if (!confirmed) return;

    try {
      setActionId(request.id);
      const response = await axios.put(
        `${API_BASE}/api/attendance/requests/${request.id}/reject`,
      );

      setRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? response.data?.data || { ...item, approval_status: "Rejected" }
            : item,
        ),
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Reject failed",
        text:
          error?.response?.data?.message ||
          "Unable to reject this request right now.",
        confirmButtonColor: "#00a651",
      });
    } finally {
      setActionId(null);
    }
  };

  const deleteRequest = async (request) => {
    const confirmed = window.confirm(
      `Delete the attendance request for ${request.employee_name} on ${request.attendance_date}?`,
    );
    if (!confirmed) return;

    try {
      setActionId(request.id);
      await axios.delete(`${API_BASE}/api/attendance/requests/${request.id}`);
      setRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error?.response?.data?.message ||
          "Unable to delete this request right now.",
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center py-10">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-(--brand)" />
          <p className="text-sm font-medium text-(--text-soft)">
            Loading attendance requests
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell p-4 font-sans md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-lg lg:w-160">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search employee, date, or work summary"
                className="app-input h-9 w-full pl-11 pr-4 text-[13px]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="app-input h-9 px-3 text-[13px]"
            >
              <option value="all">All status</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="app-panel p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-soft)">
              Total Requests
            </p>
            <p className="mt-2 text-2xl font-black text-(--text-strong)">
              {stats.total}
            </p>
          </div>
          <div className="app-panel p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-soft)">
              Pending
            </p>
            <p className="mt-2 text-2xl font-black text-amber-600">
              {stats.pending}
            </p>
          </div>
          <div className="app-panel p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-soft)">
              Rejected
            </p>
            <p className="mt-2 text-2xl font-black text-rose-600">
              {stats.rejected}
            </p>
          </div>
        </div>

        <div className={panelClass}>
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No requests found
              </h3>
              <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
                There are no attendance requests matching the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Employee
                    </th>
                    <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Date
                    </th>
                    <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Times
                    </th>
                    <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Status
                    </th>
                    <th className="border-b border-(--border-soft) px-5 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Work Summary
                    </th>
                    <th className="border-b border-(--border-soft) px-5 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-(--bg-subtle) hover:bg-(--bg-subtle)/70"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border-soft) bg-(--bg-subtle) text-sm font-bold text-(--brand)">
                            {String(request.employee_name || "?").charAt(0)}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-(--text-strong)">
                              {request.employee_name || "Unknown"}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-faint)">
                              ID {request.employee_id} -{" "}
                              {request.company || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatDateLabel(request.attendance_date)}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1 text-sm font-medium text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="font-mono">
                              {formatTimeOnly(request.mispunch_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-rose-500" />
                            <span className="font-mono">
                              {formatTimeOnly(request.leave_time)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                            request.approval_status === "Approved"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : request.approval_status === "Rejected"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {request.approval_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="max-w-md whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
                          {request.timesheet_details || "No work summary"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => approveRequest(request)}
                            disabled={actionId === request.id}
                            className="app-btn-primary inline-flex h-9 min-h-0 items-center gap-2 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectRequest(request)}
                            disabled={actionId === request.id}
                            className="app-btn-secondary inline-flex h-9 min-h-0 items-center gap-2 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRequest(request)}
                            disabled={actionId === request.id}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceRequestsLedger;
