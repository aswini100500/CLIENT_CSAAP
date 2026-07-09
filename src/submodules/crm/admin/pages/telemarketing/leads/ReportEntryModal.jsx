import { createPortal } from "react-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { CalendarClock, MessageSquareText, PhoneCall, X, Search, User, UserPlus, Loader2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api";
import { formatStatus, getOutcomesForStage, getOutcomesForTab, getStatusColor } from "./leadUtils";
import useAuth from "../../../../../../hooks/useAuth";

const inputClass = "app-input w-full rounded-2xl px-4 py-3 text-[14px] font-medium";

const ReportEntryModal = ({
  lead,
  reportData,
  setReportData,
  onClose,
  onSave,
  activeTab,
}) => {
  const outcomes = useMemo(() => {
    if (activeTab) {
      return getOutcomesForTab(activeTab, lead.status);
    }
    return getOutcomesForStage(lead.stage, lead.status);
  }, [activeTab, lead.stage, lead.status]);

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const anchorRef = useRef(null);
  const portalDropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const { user, companyId } = useAuth();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      const response = await api.get("/api/employees/company", {
        params: { company_id: companyId },
      });
      return response.data.data || [];
    },
    enabled: !!companyId,
  });

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const term = search.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.designation?.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term),
    );
  }, [employees, search]);

  const selectedEmployee = useMemo(
    () => employees.find((emp) => String(emp.user_id) === reportData.siteVisitAssignedTo),
    [employees, reportData.siteVisitAssignedTo],
  );

  useEffect(() => {
    if (reportData.siteVisitAssignedTo) {
      const emp = employees.find(
        (e) => String(e.user_id) === reportData.siteVisitAssignedTo
      );
      if (emp) {
        setSearch(emp.name);
      }
    } else {
      setSearch("");
    }
  }, [reportData.siteVisitAssignedTo, employees]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideAnchor =
        dropdownRef.current && dropdownRef.current.contains(event.target);
      const clickedInsidePortal =
        portalDropdownRef.current &&
        portalDropdownRef.current.contains(event.target);

      if (!clickedInsideAnchor && !clickedInsidePortal) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showDropdown) return undefined;

    const updateDropdownPosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const viewportPadding = 12;
      const availableWidth = window.innerWidth - viewportPadding * 2;
      const width = Math.min(rect.width, availableWidth);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - viewportPadding - width,
      );

      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left,
        width,
        maxHeight: Math.max(180, window.innerHeight - rect.bottom - 24),
        zIndex: 10050,
      });
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showDropdown]);

  const handleSelect = (emp) => {
    setReportData((prev) => ({
      ...prev,
      siteVisitAssignedTo: emp.user_id.toString(),
    }));
    setSearch(emp.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setReportData((prev) => ({
      ...prev,
      siteVisitAssignedTo: "",
    }));
    setSearch("");
    setShowDropdown(false);
  };

  useEffect(() => {
    if (scheduleDate && scheduleTime) {
      setReportData((prev) => ({
        ...prev,
        siteVisitScheduledAt: `${scheduleDate}T${scheduleTime}`,
      }));
    } else {
      setReportData((prev) => ({
        ...prev,
        siteVisitScheduledAt: "",
      }));
    }
  }, [scheduleDate, scheduleTime, setReportData]);

  const needsFollowUp = ["NO_RESPONSE", "CALL_BACK"].includes(
    reportData.outcome,
  );
  const isTerminal = [
    "INTERESTED",
    "REJECTED",
    "SITE_VISIT_SCHEDULED",
    "SITE_VISIT_COMPLETE",
    "ACCEPTED",
  ].includes(reportData.outcome);

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
      <div className="app-modal w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="pr-4">
            <h3 className="modal-title">
              Log interaction
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[13px] font-medium text-(--text-soft)">
                {lead.name}
              </span>
              <span className="text-(--text-faint)">&middot;</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor( lead.status, )}`}
              >
                {formatStatus(lead.status)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button mt-0.5 p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 pb-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="modal-label mb-2 block">Outcome *</label>
              <div className="relative">
                <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                <select
                  value={reportData.outcome}
                  onChange={(event) => {
                    const nextOutcome = event.target.value;
                    if (nextOutcome !== "SITE_VISIT_SCHEDULED") {
                      setScheduleDate("");
                      setScheduleTime("");
                    }
                    setReportData({
                      ...reportData,
                      outcome: nextOutcome,
                      siteVisitAssignedTo: nextOutcome === "SITE_VISIT_SCHEDULED" ? reportData.siteVisitAssignedTo : "",
                      nextFollowUpAt: [
                        "INTERESTED",
                        "REJECTED",
                        "SITE_VISIT_SCHEDULED",
                        "SITE_VISIT_COMPLETE",
                        "ACCEPTED",
                      ].includes(nextOutcome)
                        ? ""
                        : reportData.nextFollowUpAt,
                    });
                  }}
                  className={`${inputClass} pl-10 appearance-none cursor-pointer`}
                >
                  {outcomes.map((outcome) => (
                    <option key={outcome.value} value={outcome.value}>
                      {outcome.label}
                    </option>
                  ))}
                  {outcomes.length === 0 && (
                    <option value="" disabled>
                      No actions available
                    </option>
                  )}
                </select>
              </div>
            </div>

            {reportData.outcome === "SITE_VISIT_SCHEDULED" && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="modal-label mb-2 block">
                      Schedule Date *
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label mb-2 block">
                      Schedule Time *
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="modal-label mb-2 block">
                    Assign Employee for Visit *
                  </label>
                  <p className="modal-helper mb-3">
                    Search by name, email, or role and choose exactly one assignee.
                  </p>
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative" ref={anchorRef}>
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className={`${inputClass} pl-11 pr-20`}
                        placeholder="Search by name, email, department or designation..."
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {search || reportData.siteVisitAssignedTo ? (
                          <button
                            type="button"
                            onClick={clearSelection}
                            className="p-1 text-(--text-faint) hover:text-(--text-body)"
                            aria-label="Clear employee selection"
                          >
                            <X className="size-4" />
                          </button>
                        ) : null}
                        {isLoading ? (
                          <Loader2 className="size-4 text-(--text-faint) animate-spin" />
                        ) : null}
                      </div>
                    </div>

                    {/* Dropdown Suggestions */}
                    {showDropdown && dropdownStyle
                      ? createPortal(
                      <div
                        ref={portalDropdownRef}
                        style={dropdownStyle}
                        className="app-floating bg-white rounded-2xl max-h-50 overflow-y-auto custom-scrollbar py-1"
                      >
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={() => handleSelect(emp)}
                              className="w-full px-3.5 py-2 flex items-center gap-3 hover:bg-(--bg-subtle) transition-colors text-left group"
                              type="button"
                            >
                              <div className="size-8 rounded-xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center shrink-0 overflow-hidden">
                                {emp.profile_photo ? (
                                  <img
                                    src={emp.profile_photo}
                                    alt={emp.name}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <User className="size-3.5 text-(--brand)" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-(--text-strong) truncate">
                                  {emp.name}
                                </div>
                                <div className="text-[11px] text-(--text-faint) truncate">
                                  {emp.designation || "No designation"}{emp.department ? ` • ${emp.department}` : ""}
                                </div>
                              </div>
                              {selectedEmployee?.user_id === emp.user_id && (
                                <Check className="size-3.5 text-(--brand) shrink-0" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <p className="text-[12px] text-(--text-faint)">No employees found</p>
                          </div>
                        )}
                      </div>,
                      document.body,
                    )
                      : null}
                  </div>

                  {/* Selected Employee Preview */}
                  {selectedEmployee && !showDropdown && (
                    <div className="mt-4 app-panel overflow-hidden">
                      <div className="app-section-bar px-4 py-2.5">
                        <h4 className="modal-section-title">
                          Selected Assignee for Visit
                        </h4>
                      </div>
                      <div className="p-4 flex items-center gap-3.5">
                        <div className="size-11 rounded-2xl bg-white border border-(--border-soft) flex items-center justify-center shrink-0 overflow-hidden">
                           {selectedEmployee.profile_photo ? (
                              <img
                                src={selectedEmployee.profile_photo}
                                alt={selectedEmployee.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <User className="size-5 text-(--brand)" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[15px] font-bold tracking-[-0.02em] text-(--text-strong) truncate">
                            {selectedEmployee.name}
                          </div>
                          <div className="text-[12px] font-medium text-(--text-faint) truncate mt-0.5">
                            {selectedEmployee.designation || "No designation"}{selectedEmployee.department ? ` • ${selectedEmployee.department}` : ""}
                          </div>
                          <div className="text-[11px] text-(--text-faint) truncate mt-0.5">
                            {selectedEmployee.email}
                          </div>
                        </div>
                        <div className="p-1.5 bg-(--brand-soft) rounded-xl border border-(--border-soft)">
                          <UserPlus className="size-3.5 text-(--brand)" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isTerminal && (
              <div>
                <label className="modal-label mb-2 block">
                  Next Follow-up {needsFollowUp ? "*" : ""}
                </label>
                <div className="relative">
                  <CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                  <input
                    type="datetime-local"
                    value={reportData.nextFollowUpAt}
                    onChange={(event) =>
                      setReportData({
                        ...reportData,
                        nextFollowUpAt: event.target.value,
                      })
                    }
                    className={`${inputClass} pl-10`}
                    required={needsFollowUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="modal-label mb-2 block">Note</label>
              <div className="relative">
                <MessageSquareText className="absolute left-4 top-4 size-4 text-(--text-faint)" />
                <textarea
                  value={reportData.note}
                  onChange={(event) =>
                    setReportData({ ...reportData, note: event.target.value })
                  }
                  className={`${inputClass} min-h-32 pl-10`}
                  placeholder="Add a short note about this interaction"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-(--border-soft) flex justify-end items-center bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="app-btn-secondary text-[14px] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="app-btn-primary text-[14px] active:scale-[0.98]"
            >
              Save interaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReportEntryModal;
