import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  X
} from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_HRMS_BASE_URL;

const emptyForm = {
  employee_id: "",
  exemption_type: "wfh",
  start_date: "",
  end_date: "",
};

const buildFormFromRow = (row) => ({
  employee_id: row?.employee_id ? String(row.employee_id) : "",
  exemption_type: row?.exemption_type || "wfh",
  start_date: row?.start_date ? String(row.start_date).slice(0, 10) : "",
  end_date: row?.end_date ? String(row.end_date).slice(0, 10) : "",
});

const GeofenceExemptionFormModal = ({
  companySlug,
  currentUserId,
  currentUserName,
  employees,
  selectedRow,
  onBack,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(selectedRow ? buildFormFromRow(selectedRow) : { ...emptyForm });
    setError("");
  }, [selectedRow]);

  const approverName = currentUserName || "Current admin";
  const approverId = currentUserId ? String(currentUserId) : "";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event?.preventDefault?.();

    if (!companySlug) {
      setError("Company slug is missing.");
      return;
    }

    if (
      !form.employee_id ||
      !form.exemption_type.trim() ||
      !form.start_date ||
      !form.end_date
    ) {
      setError(
        "Employee, exemption type, start date, and end date are required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        employee_id: String(form.employee_id),
        exemption_type: form.exemption_type.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        approved_by: approverId,
      };

      const response = await axios[selectedRow ? "put" : "post"](
        `${API_BASE}/api/geofence-exemptions/company/${companySlug}${selectedRow ? `/${selectedRow.id}` : ""}`,
        payload,
      );

      onSaved?.(response.data?.data || null);
    } catch (saveError) {
      console.error("Failed to save geofence exemption", saveError);
      setError(
        saveError.response?.data?.message ||
          "Unable to save this geofence exemption.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="app-modal relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden">
        <div className="relative flex min-h-16 items-center justify-center border-b border-(--border-soft) bg-white px-5 py-3 text-(--text-strong)">
          <button
            type="button"
            onClick={onBack}
            className="app-btn-secondary absolute left-5 inline-flex h-9 min-h-0 items-center gap-2 px-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h2 className="modal-title text-center">
            {selectedRow ? "Edit Geofence Exemption" : "New Geofence Exemption"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="app-icon-button absolute right-5 flex h-9 w-9 items-center justify-center bg-(--bg-subtle) text-(--text-soft) hover:bg-white hover:text-(--text-strong)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto bg-(--bg-subtle)/45 p-3 sm:p-4 custom-scrollbar"
        >
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-4 py-3">
            <section className="app-panel p-4">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-(--border-soft) bg-(--brand-soft) text-(--brand)">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Exemption Target
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-[11px] font-bold text-slate-400">
                    Target Employee
                  </span>
                  <select
                    name="employee_id"
                    value={form.employee_id}
                    onChange={handleChange}
                    className="app-input mt-2 w-full px-4 py-2.5 text-sm font-semibold"
                  >
                    <option value="">Select individual from ledger</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}{" "}
                        {employee.department ? `· ${employee.department}` : ""}{" "}
                        (ID {employee.id})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="app-panel p-4">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-100">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Validity Parameters
                  </h3>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-bold text-slate-400">
                    Override Type
                  </span>
                  <select
                    name="exemption_type"
                    value={form.exemption_type}
                    onChange={handleChange}
                    className="app-input mt-2 w-full px-4 py-2.5 text-sm font-semibold"
                  >
                    <option value="wfh">WFH (Work From Home)</option>
                    <option value="remote">Remote (Off-site)</option>
                    <option value="field">Field Duty</option>
                    <option value="travel">Official Travel</option>
                    <option value="client_visit">Client Site Visit</option>
                  </select>
                </label>

                <div className="hidden sm:block" />

                <label className="block">
                  <span className="text-[11px] font-bold text-slate-400">
                    Effective From
                  </span>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="app-input mt-2 w-full px-4 py-2.5 text-sm font-semibold"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold text-slate-400">
                    Effective Until
                  </span>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="app-input mt-2 w-full px-4 py-2.5 text-sm font-semibold"
                  />
                </label>
              </div>
            </section>
          </div>
        </form>

        <div className="flex items-center justify-end border-t border-(--border-soft) bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="app-btn-primary inline-flex h-11 items-center gap-2 px-8 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="leading-none">Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 stroke-[3px]" />
                <span className="leading-none">
                  {selectedRow ? "Save changes" : "Create exemption"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeofenceExemptionFormModal;
