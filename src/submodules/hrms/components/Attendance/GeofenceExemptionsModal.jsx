import axios from "axios";
import {
  Edit3,
  Loader2,
  Plus,
  ShieldAlert,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import GeofenceExemptionFormModal from "./GeofenceExemptionFormModal";
import React from "react";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;

function formatDateLabel(value) {
  if (!value) return "N/A";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
}

function formatLongDate(value) {
  if (!value) return "Not available";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
}

const normalizeEmployee = (employee) => ({
  id: employee.id ? String(employee.id) : "",
  name: employee.name || employee.employee_name || `Employee #${employee.id}`,
  department: employee.department || "",
});

const GeofenceExemptionsModal = ({
  isOpen,
  onClose,
  companySlug,
  companyName,
  currentUserId,
  currentUserName,
}) => {
  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const formattedEmployees = useMemo(
    () =>
      employees
        .map(normalizeEmployee)
        .filter((employee) => employee.id),
    [employees],
  );

  const filteredRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return rows;

    return rows.filter((row) => {
      return (
        String(row.employee_id).includes(search) ||
        row.employee_name?.toLowerCase().includes(search) ||
        row.exemption_type?.toLowerCase().includes(search) ||
        row.approved_by_name?.toLowerCase().includes(search)
      );
    });
  }, [rows, searchTerm]);

  const refreshData = async () => {
    if (!companySlug) return;

    try {
      setLoading(true);
      setError("");

      const [employeeResult, exemptionResult] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/employee/${companySlug}`),
        axios.get(`${API_BASE}/api/geofence-exemptions/company/${companySlug}`),
      ]);

      if (employeeResult.status === "fulfilled") {
        setEmployees(employeeResult.value.data?.data || []);
      } else {
        setEmployees([]);
      }

      if (exemptionResult.status === "fulfilled") {
        setRows(exemptionResult.value.data?.data || []);
      } else {
        setRows([]);
      }

      if (
        employeeResult.status === "rejected" ||
        exemptionResult.status === "rejected"
      ) {
        const fetchError =
          employeeResult.status === "rejected"
            ? employeeResult.reason
            : exemptionResult.reason;
        setError(
          fetchError?.response?.data?.message ||
            "Unable to load geofence exemptions.",
        );
      }
    } catch (fetchError) {
      console.error("Failed to load geofence exemptions", fetchError);
      setError(
        fetchError.response?.data?.message ||
          "Unable to load geofence exemptions.",
      );
      setEmployees([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setShowForm(false);
    setSelectedRow(null);
    setSearchTerm("");
    refreshData();
  }, [isOpen, companySlug]);

  const openCreate = () => {
    setSelectedRow(null);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setSelectedRow(row);
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      `Delete the ${row.exemption_type} exemption for ${row.employee_name}?`,
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await axios.delete(
        `${API_BASE}/api/geofence-exemptions/company/${companySlug}/${row.id}`,
      );

      setRows((current) => current.filter((item) => item.id !== row.id));
      if (selectedRow?.id === row.id) {
        setSelectedRow(null);
      }
    } catch (deleteError) {
      console.error("Failed to delete geofence exemption", deleteError);
      setError(
        deleteError.response?.data?.message ||
          "Unable to delete this geofence exemption.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaved = (nextRow) => {
    if (nextRow) {
      setRows((current) =>
        selectedRow
          ? current.map((row) => (row.id === nextRow.id ? nextRow : row))
          : [nextRow, ...current],
      );
    } else {
      refreshData();
    }

    setSelectedRow(null);
    setShowForm(false);
  };

  if (!isOpen) return null;

  if (showForm) {
    return (
      <GeofenceExemptionFormModal
        companySlug={companySlug}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        employees={formattedEmployees}
        selectedRow={selectedRow}
        onBack={() => setShowForm(false)}
        onClose={onClose}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="app-modal relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden">
        <div className="flex items-start justify-between border-b border-(--border-soft) bg-white px-5 py-3 sm:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-(--border-soft) bg-(--brand-soft) text-(--brand) transition-transform hover:scale-105">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="modal-title">
                Geofence Exemptions
              </h2>
              <p className="modal-subtitle mt-1">
                Manage attendance overrides for off-site and remote personnel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="app-icon-button group flex h-10 w-10 items-center justify-center bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-(--bg-subtle)/45 p-4 sm:p-5 custom-scrollbar">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee or type..."
                className="app-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            {canCreate && (
              <button
                type="button"
                onClick={openCreate}
                className="app-btn-primary inline-flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 stroke-[3px]" />
                <span className="leading-none">Add</span>
              </button>
            )}
          </div>

          <div className="app-panel overflow-hidden">
            {loading ? (
              <div className="flex min-h-75 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-(--brand)" />
              </div>
            ) : filteredRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-5 py-3 text-left text-[12px] font-semibold text-slate-600">
                        Employee
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-semibold text-slate-600">
                        Exemption Type
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-semibold text-slate-600">
                        Valid Period
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-semibold text-slate-600">
                        Approved By
                      </th>
                      <th className="px-5 py-3 text-right text-[12px] font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border-soft) bg-(--bg-subtle) text-sm font-black text-(--brand)">
                              {(row.employee_name || "E").charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {row.employee_name ||
                                  `Employee #${row.employee_id}`}
                              </p>
                              <p className="text-[11px] font-medium text-slate-400">
                                ID {row.employee_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="inline-flex rounded-lg border border-(--border-soft) bg-(--brand-soft) px-3 py-1 text-xs font-semibold text-(--brand)">
                            {row.exemption_type}
                          </span>
                        </td>
                        <td className="px-5 py-2.5">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {formatDateLabel(row.start_date)} -{" "}
                              {formatDateLabel(row.end_date)}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">
                              {formatLongDate(row.start_date)}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <p className="text-sm font-semibold text-slate-700">
                            {row.approved_by_name || "Unknown"}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400">
                            #{row.approved_by}
                          </p>
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => openEdit(row)}
                                className="app-btn-secondary inline-flex h-9 min-h-0 items-center gap-2 px-3 text-xs"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(row)}
                                disabled={saving}
                                className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-75 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                  <ShieldAlert className="h-10 w-10" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  No Exemptions Found
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  No active geofence exemptions found for this organization.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <GeofenceExemptionFormModal
          companySlug={companySlug}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          employees={formattedEmployees}
          selectedRow={selectedRow}
          onBack={() => setShowForm(false)}
          onClose={onClose}
          onSaved={(nextRow) => {
            if (nextRow) {
              setRows((current) =>
                selectedRow
                  ? current.map((row) =>
                      row.id === nextRow.id ? nextRow : row,
                    )
                  : [nextRow, ...current],
              );
            } else {
              refreshData();
            }

            setSelectedRow(null);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default GeofenceExemptionsModal;
