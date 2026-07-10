import { createPortal } from "react-dom";
import { Search, User, UserPlus, X, Loader2, Check, ArrowRightLeft } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api";
import useAuth from "../../../../../../hooks/useAuth";

const inputClass =
  "app-input w-full rounded-2xl px-4 py-3 text-[14px] font-medium";

const TransferLeadModal = ({
  lead,
  assignedTo,
  setAssignedTo,
  onClose,
  onSave,
  isSaving,
}) => {
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

    const list = employees.filter(emp => emp.user_id !== lead.assigned_to);
    
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.designation?.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term),
    );
  }, [employees, search, lead.assigned_to]);

  const selectedEmployee = useMemo(
    () => employees.find((emp) => String(emp.user_id) === assignedTo),
    [employees, assignedTo],
  );

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
    setAssignedTo(emp.user_id.toString());
    setSearch(emp.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setAssignedTo("");
    setSearch("");
    setShowDropdown(false);
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
      <div className="app-modal w-full max-w-md overflow-hidden flex flex-col">

        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="pr-4">
            <h3 className="modal-title">
              Transfer Lead
            </h3>
            <p className="modal-subtitle mt-1.5">
              Move <span className="font-semibold text-(--text-strong)">{lead.name}</span> to another team member.
            </p>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) transition-all active:scale-95"
            aria-label="Close"
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>


        <div className="p-5 pb-4">

          <div className="mb-5 p-3.5 bg-(--bg-subtle) border border-(--border-soft) rounded-2xl flex items-center gap-3">
            <div className="size-9 rounded-xl bg-white border border-(--border-soft) flex items-center justify-center shrink-0">
               {lead.assignee?.profile_photo ? (
                  <img src={lead.assignee.profile_photo} alt="" className="size-full rounded-full object-cover" />
                ) : (
                  <User className="size-4 text-(--brand)" />
                )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="modal-section-title mb-0.5">
                Currently assigned to
              </div>
              <div className="text-[15px] font-bold tracking-[-0.02em] text-(--text-strong) truncate">
                {lead.assignee?.name || "Unknown User"}
              </div>
              {(lead.assignee?.designation || lead.assignee?.department) && (
                <div className="text-[11px] text-(--text-faint) truncate mt-0.5">
                  {lead.assignee.designation || "No designation"}{lead.assignee.department ? ` • ${lead.assignee.department}` : ""}
                </div>
              )}
            </div>
            <ArrowRightLeft className="size-4 text-(--text-faint)" />
          </div>

          <label className="modal-label mb-2 block">
            Select New Assignee *
          </label>
          <p className="modal-helper mb-3">
            Reassign this lead by choosing a different team member below.
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
                {search || assignedTo ? (
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


            {showDropdown && dropdownStyle
              ? createPortal(
              <div
                ref={portalDropdownRef}
                style={dropdownStyle}
                className="app-floating bg-white rounded-2xl max-h-45 overflow-y-auto custom-scrollbar py-1"
              >
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp.user_id}
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
                    <p className="text-[12px] text-(--text-faint)">No other employees found</p>
                  </div>
                )}
              </div>,
              document.body,
            )
              : null}
          </div>


          {selectedEmployee && !showDropdown && (
            <div className="mt-4 app-panel overflow-hidden">
              <div className="app-section-bar px-4 py-2.5">
                <h4 className="modal-section-title mb-0.5">
                  New Assignee
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


        <div className="px-5 py-3 border-t border-(--border-soft) flex justify-end items-center gap-2.5 bg-white">
          <button
            onClick={onClose}
            className="app-btn-secondary text-[13px] active:scale-[0.98]"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !assignedTo}
            className="app-btn-primary text-[13px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            type="button"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer Lead"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TransferLeadModal;
