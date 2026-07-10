import { useQuery } from "@tanstack/react-query";
import api from "../../../../api";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import useAuth from "../../../../../../hooks/useAuth";
import { createPortal } from "react-dom";
import {
  Check,
  Info,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
  X,
  Building,
  ChevronDown,
} from "lucide-react";

import { LEAD_SOURCES, normalizeUnits } from "./leadUtils";

const inputClass = "app-input w-full rounded-xl px-4 py-2.5 text-[14px]";

const checkIfBooked = (responseData, targetItemId) => {
  if (!responseData) return false;

  if (typeof responseData === "boolean") return responseData;

  const data =
    responseData.data !== undefined ? responseData.data : responseData;
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.some((item) => {
      if (item === null || item === undefined) return false;
      if (String(item) === String(targetItemId)) return true;

      const itemId =
        item.itemId ?? item.item_id ?? item.id ?? item.unitId ?? item.unit_id;
      if (itemId !== undefined && String(itemId) === String(targetItemId)) {
        const isBooked = item.isBooked ?? item.is_booked ?? item.booked;
        if (isBooked !== undefined) {
          return typeof isBooked === "boolean"
            ? isBooked
            : String(isBooked).toLowerCase() === "booked";
        }
        const status = String(
          item.booking_status ?? item.status ?? "",
        ).toLowerCase();
        return status === "booked" || status === "sold";
      }
      return false;
    });
  }

  if (typeof data === "object") {
    if (data.items && Array.isArray(data.items)) {
      return checkIfBooked(data.items, targetItemId);
    }

    if (data[targetItemId] !== undefined) {
      const val = data[targetItemId];
      if (typeof val === "boolean") return val;
      if (typeof val === "string")
        return val.toLowerCase() === "booked" || val.toLowerCase() === "sold";
      if (typeof val === "object" && val !== null) {
        return !!(
          val.isBooked ??
          val.is_booked ??
          val.booked ??
          String(val.booking_status ?? val.status ?? "").toLowerCase() ===
            "booked"
        );
      }
    }

    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        const found = checkIfBooked(data[key], targetItemId);
        if (found) return true;
      }
    }
  }

  return false;
};

const getUnitStatusChip = (status, isBooked) => {
  if (isBooked) {
    return {
      label: "Booked",
      style: "text-amber-700 bg-amber-50 border-amber-200",
    };
  }
  const s = (status || "Pending").toLowerCase().trim();
  if (s === "ready to move" || s === "completed") {
    return {
      label: s === "completed" ? "Completed" : "Ready to Move",
      style: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  }
  if (s === "in progress") {
    return {
      label: "In Progress",
      style: "text-sky-700 bg-sky-50 border-sky-200",
    };
  }
  return {
    label: "Pending",
    style: "text-slate-500 bg-slate-50 border-slate-200",
  };
};

const LeadFormModal = ({
  editingLead,
  leadForm,
  setLeadForm,
  onClose,
  onSave,
}) => {
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const projectDropdownRef = useRef(null);
  const projectAnchorRef = useRef(null);
  const projectPortalDropdownRef = useRef(null);
  const [projectDropdownStyle, setProjectDropdownStyle] = useState(null);
  const { token, companyId } = useAuth();

  const [brokerSearch, setBrokerSearch] = useState("");
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const brokerDropdownRef = useRef(null);
  const brokerAnchorRef = useRef(null);
  const brokerPortalDropdownRef = useRef(null);
  const [brokerDropdownStyle, setBrokerDropdownStyle] = useState(null);

  const [unitSearch, setUnitSearch] = useState("");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const unitDropdownRef = useRef(null);
  const unitAnchorRef = useRef(null);
  const unitPortalDropdownRef = useRef(null);
  const [unitDropdownStyle, setUnitDropdownStyle] = useState(null);

  const { data: projectOptions = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["project-options", token, companyId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/clprojects`,
        {
          params: { company_id: companyId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const projects = response.data?.data || [];
      return projects.map((p) => ({
        project_id: p.id,
        composite_key: p.id,
        name: p.project_name,
        display_type: p.project_code || p.status || "",
        location: p.client_company_name
          ? `Client: ${p.client_company_name}`
          : "",
      }));
    },
    enabled: !!token && !!companyId,
  });

  const { data: brokerOptions = [], isLoading: isLoadingBrokers } = useQuery({
    queryKey: ["broker-options", token],
    queryFn: async () => {
      const response = await axios.get(
        "https://csaapnodeapi.csaap.com/api/tenant/broker",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data.data || [];
    },
    enabled: !!token,
  });

  const selectedProject = useMemo(
    () =>
      projectOptions.find(
        (project) => project.project_id === leadForm.project_id,
      ) || null,
    [projectOptions, leadForm.project_id],
  );

  const { data: projectDetails, isLoading: isLoadingProjectDetails } = useQuery(
    {
      queryKey: ["project-details", leadForm.project_id, token],
      queryFn: async () => {
        if (!leadForm.project_id || !token) return [];
        let projectType = "apartment";
        let projectId = leadForm.project_id;
        if (
          typeof leadForm.project_id === "string" &&
          leadForm.project_id.includes(":")
        ) {
          const parts = leadForm.project_id.split(":");
          projectType = parts[0];
          projectId = parts[1];
        }
        const response = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return response.data?.data || [];
      },
      enabled: !!leadForm.project_id && !!token,
    },
  );

  const { data: bookingStatuses = [] } = useQuery({
    queryKey: ["project-booking-status", leadForm.project_id, token],
    queryFn: async () => {
      if (!leadForm.project_id || !token) return [];
      let projectType = "apartment";
      let projectId = leadForm.project_id;
      if (
        typeof leadForm.project_id === "string" &&
        leadForm.project_id.includes(":")
      ) {
        const parts = leadForm.project_id.split(":");
        projectType = parts[0];
        projectId = parts[1];
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_CSAAP_URL}/api/tenant/type/${projectType}/${projectId}/booking-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return response.data?.data || [];
      } catch (err) {
        console.warn("Failed fetching project booking status:", err);
        return [];
      }
    },
    enabled: !!leadForm.project_id && !!token,
  });

  const availableUnits = useMemo(() => {
    if (!projectDetails || !selectedProject) return [];
    const normalized = normalizeUnits(
      projectDetails,
      selectedProject.property_type,
    );
    return normalized.map((unit) => ({
      ...unit,
      isBooked: checkIfBooked(bookingStatuses, unit.unit_id),
    }));
  }, [projectDetails, selectedProject, bookingStatuses]);

  const filteredUnits = useMemo(() => {
    const term = unitSearch.trim().toLowerCase();

    const selectedDisplay = leadForm.unit_name
      ? leadForm.unit_name.trim().toLowerCase()
      : "";

    if (!term || term === selectedDisplay) return availableUnits;

    return availableUnits.filter((unit) =>
      String(unit.unit_name).toLowerCase().includes(term),
    );
  }, [availableUnits, unitSearch, leadForm.unit_name]);

  const selectedBroker = useMemo(
    () =>
      brokerOptions.find(
        (broker) => String(broker.id) === String(leadForm.broker_id),
      ) || null,
    [brokerOptions, leadForm.broker_id],
  );

  const filteredProjects = useMemo(() => {
    const term = projectSearch.trim().toLowerCase();

    const selectedDisplay = selectedProject
      ? `${selectedProject.name}${selectedProject.location ? ` - ${selectedProject.location}` : ""}`
          .trim()
          .toLowerCase()
      : "";

    if (!term || term === selectedDisplay) return projectOptions;

    return projectOptions.filter((project) =>
      [project.name, project.location, project.display_type, project.project_id]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [projectOptions, projectSearch, selectedProject]);

  const filteredBrokers = useMemo(() => {
    const term = brokerSearch.trim().toLowerCase();

    const selectedDisplay = selectedBroker
      ? selectedBroker.name.trim().toLowerCase()
      : "";

    if (!term || term === selectedDisplay) return brokerOptions;

    return brokerOptions.filter((broker) =>
      [broker.name, broker.email, broker.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [brokerOptions, brokerSearch, selectedBroker]);

  const projectDisplayValue = useMemo(() => {
    return selectedProject
      ? `${selectedProject.name}${selectedProject.location ? ` - ${selectedProject.location}` : ""}`
      : leadForm.project_id || "";
  }, [selectedProject, leadForm.project_id]);

  const handleInputFocus = () => {
    setProjectSearch(projectDisplayValue);
    setShowProjectDropdown(true);
  };

  const handleBrokerInputFocus = () => {
    setBrokerSearch(selectedBroker ? selectedBroker.name : "");
    setShowBrokerDropdown(true);
  };

  const handleUnitInputFocus = () => {
    setUnitSearch(leadForm.unit_name || "");
    setShowUnitDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideAnchor =
        projectDropdownRef.current &&
        projectDropdownRef.current.contains(event.target);
      const clickedInsidePortal =
        projectPortalDropdownRef.current &&
        projectPortalDropdownRef.current.contains(event.target);

      if (!clickedInsideAnchor && !clickedInsidePortal) {
        setShowProjectDropdown(false);
      }

      const clickedInsideBrokerAnchor =
        brokerDropdownRef.current &&
        brokerDropdownRef.current.contains(event.target);
      const clickedInsideBrokerPortal =
        brokerPortalDropdownRef.current &&
        brokerPortalDropdownRef.current.contains(event.target);

      if (!clickedInsideBrokerAnchor && !clickedInsideBrokerPortal) {
        setShowBrokerDropdown(false);
      }

      const clickedInsideUnitAnchor =
        unitDropdownRef.current &&
        unitDropdownRef.current.contains(event.target);
      const clickedInsideUnitPortal =
        unitPortalDropdownRef.current &&
        unitPortalDropdownRef.current.contains(event.target);

      if (!clickedInsideUnitAnchor && !clickedInsideUnitPortal) {
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showProjectDropdown) return undefined;

    const updateDropdownPosition = () => {
      if (!projectAnchorRef.current) return;
      const rect = projectAnchorRef.current.getBoundingClientRect();
      const viewportPadding = 12;
      const availableWidth = window.innerWidth - viewportPadding * 2;
      const width = Math.min(rect.width, availableWidth);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - viewportPadding - width,
      );

      setProjectDropdownStyle({
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
  }, [showProjectDropdown]);

  useEffect(() => {
    if (!showBrokerDropdown) return undefined;

    const updateDropdownPosition = () => {
      if (!brokerAnchorRef.current) return;
      const rect = brokerAnchorRef.current.getBoundingClientRect();
      const viewportPadding = 12;
      const availableWidth = window.innerWidth - viewportPadding * 2;
      const width = Math.min(rect.width, availableWidth);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - viewportPadding - width,
      );

      setBrokerDropdownStyle({
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
  }, [showBrokerDropdown]);

  useEffect(() => {
    if (!showUnitDropdown) return undefined;

    const updateDropdownPosition = () => {
      if (!unitAnchorRef.current) return;
      const rect = unitAnchorRef.current.getBoundingClientRect();
      const viewportPadding = 12;
      const availableWidth = window.innerWidth - viewportPadding * 2;
      const width = Math.min(rect.width, availableWidth);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - viewportPadding - width,
      );

      setUnitDropdownStyle({
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
  }, [showUnitDropdown]);

  const handleProjectSelect = (project) => {
    setLeadForm({
      ...leadForm,
      project_id: project.project_id,
      unit_id: "",
      unit_name: "",
    });
    setProjectSearch(
      `${project.name}${project.location ? ` - ${project.location}` : ""}`,
    );
    setShowProjectDropdown(false);
    setUnitSearch("");
  };

  const clearProjectSelection = () => {
    setLeadForm({ ...leadForm, project_id: "", unit_id: "", unit_name: "" });
    setProjectSearch("");
    setShowProjectDropdown(false);
    setUnitSearch("");
  };

  const handleUnitSelect = (unit) => {
    setLeadForm({
      ...leadForm,
      unit_id: unit.unit_id,
      unit_name: unit.unit_name,
    });
    setUnitSearch(unit.unit_name);
    setShowUnitDropdown(false);
  };

  const clearUnitSelection = () => {
    setLeadForm({
      ...leadForm,
      unit_id: "",
      unit_name: "",
    });
    setUnitSearch("");
    setShowUnitDropdown(false);
  };

  const handleBrokerSelect = (broker) => {
    setLeadForm({
      ...leadForm,
      broker_id: broker.id,
      commission: broker.commission || "",
    });
    setBrokerSearch(broker.name);
    setShowBrokerDropdown(false);
  };

  const clearBrokerSelection = () => {
    setLeadForm({
      ...leadForm,
      broker_id: "",
      commission: "",
    });
    setBrokerSearch("");
    setShowBrokerDropdown(false);
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
      <div className="app-modal w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-(--border-soft) flex justify-between items-center bg-white">
          <h3 className="modal-title">
            {editingLead ? "Edit lead" : "Create new lead"}
          </h3>
          <button
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) active:scale-95"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="modal-label mb-1.5 block">Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                  <input
                    type="text"
                    value={leadForm.name}
                    onChange={(event) =>
                      setLeadForm({ ...leadForm, name: event.target.value })
                    }
                    className={`${inputClass} pl-10`}
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="modal-label mb-1.5 block">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(event) =>
                      setLeadForm({ ...leadForm, phone: event.target.value })
                    }
                    className={`${inputClass} pl-10`}
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="modal-label mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={(event) =>
                    setLeadForm({ ...leadForm, email: event.target.value })
                  }
                  className={`${inputClass} pl-10`}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="modal-label mb-1.5 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                  <input
                    type="text"
                    value={leadForm.location}
                    onChange={(event) =>
                      setLeadForm({ ...leadForm, location: event.target.value })
                    }
                    className={`${inputClass} pl-10`}
                    placeholder="Lead location"
                  />
                </div>
              </div>

              <div>
                <label className="modal-label mb-1.5 block">Source</label>
                <div className="relative">
                  <Info className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) pointer-events-none" />
                  <select
                    value={leadForm.source}
                    onChange={(event) =>
                      setLeadForm({ ...leadForm, source: event.target.value })
                    }
                    className={`${inputClass} pl-10 appearance-none`}
                  >
                    <option value="">Select Source</option>
                    {LEAD_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="size-4 text-(--text-faint)"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {leadForm.source === "BROKER" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label mb-1.5 block">Broker *</label>
                  <div className="relative" ref={brokerDropdownRef}>
                    <div className="relative" ref={brokerAnchorRef}>
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                      <input
                        type="text"
                        value={
                          showBrokerDropdown
                            ? brokerSearch
                            : selectedBroker
                              ? selectedBroker.name
                              : ""
                        }
                        onChange={(event) => {
                          setBrokerSearch(event.target.value);
                          setShowBrokerDropdown(true);
                          if (leadForm.broker_id) {
                            setLeadForm({
                              ...leadForm,
                              broker_id: "",
                              commission: "",
                            });
                          }
                        }}
                        onFocus={handleBrokerInputFocus}
                        className={`${inputClass} pl-10 pr-20`}
                        placeholder="Search broker by name or phone"
                        required
                      />
                      {isLoadingBrokers ? (
                        <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) animate-spin" />
                      ) : null}
                      {(
                        showBrokerDropdown
                          ? brokerSearch
                          : selectedBroker
                            ? selectedBroker.name
                            : ""
                      ) ? (
                        <button
                          type="button"
                          onClick={clearBrokerSelection}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--text-faint) hover:text-(--text-body)"
                          aria-label="Clear broker selection"
                        >
                          <X className="size-4" />
                        </button>
                      ) : (
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) pointer-events-none" />
                      )}
                    </div>

                    {showBrokerDropdown && brokerDropdownStyle
                      ? createPortal(
                          <div
                            ref={brokerPortalDropdownRef}
                            style={brokerDropdownStyle}
                            className="app-floating bg-white rounded-2xl max-h-64 overflow-y-auto custom-scrollbar py-1 shadow-lg border border-(--border-soft)"
                          >
                            {filteredBrokers.length > 0 ? (
                              filteredBrokers.map((broker) => (
                                <button
                                  key={broker.id}
                                  type="button"
                                  onClick={() => handleBrokerSelect(broker)}
                                  className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-(--bg-subtle) transition-colors text-left"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="text-[13px] font-medium text-(--text-strong) truncate">
                                        {broker.name}
                                      </div>
                                      {broker.commission && (
                                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-(--brand) bg-(--brand-soft) px-2 py-0.5 rounded-lg">
                                          {broker.commission}%
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-(--text-faint) truncate mt-0.5">
                                      {broker.phone ||
                                        broker.email ||
                                        "No contact info"}
                                    </div>
                                  </div>
                                  {String(leadForm.broker_id) ===
                                  String(broker.id) ? (
                                    <Check className="size-4 text-(--brand) shrink-0 mt-0.5" />
                                  ) : null}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-center text-[12px] text-(--text-faint)">
                                No brokers found
                              </div>
                            )}
                          </div>,
                          document.body,
                        )
                      : null}
                  </div>
                </div>

                {leadForm.broker_id ? (
                  <div className="">
                    <label className="modal-label mb-1.5 block">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={leadForm.commission}
                      onChange={(event) =>
                        setLeadForm({
                          ...leadForm,
                          commission: event.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Commission percentage (e.g. 2.50)"
                    />
                  </div>
                ) : null}
              </div>
            )}

            <div>
              <label className="modal-label mb-1.5 block">Project</label>
              <div className="relative" ref={projectDropdownRef}>
                <div className="relative" ref={projectAnchorRef}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                  <input
                    type="text"
                    value={
                      showProjectDropdown ? projectSearch : projectDisplayValue
                    }
                    onChange={(event) => {
                      setProjectSearch(event.target.value);
                      setShowProjectDropdown(true);
                      if (leadForm.project_id) {
                        setLeadForm({
                          ...leadForm,
                          project_id: "",
                          unit_id: "",
                          unit_name: "",
                        });
                        setUnitSearch("");
                      }
                    }}
                    onFocus={handleInputFocus}
                    className={`${inputClass} pl-10 pr-20`}
                    placeholder="Search by project name or location"
                  />
                  {isLoadingProjects ? (
                    <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) animate-spin" />
                  ) : null}
                  {(
                    showProjectDropdown ? projectSearch : projectDisplayValue
                  ) ? (
                    <button
                      type="button"
                      onClick={clearProjectSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--text-faint) hover:text-(--text-body)"
                      aria-label="Clear project selection"
                    >
                      <X className="size-4" />
                    </button>
                  ) : (
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) pointer-events-none" />
                  )}
                </div>

                {showProjectDropdown && projectDropdownStyle
                  ? createPortal(
                      <div
                        ref={projectPortalDropdownRef}
                        style={projectDropdownStyle}
                        className="app-floating bg-white rounded-2xl max-h-64 overflow-y-auto custom-scrollbar py-1 shadow-lg border border-(--border-soft)"
                      >
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((project) => (
                            <button
                              key={project.composite_key}
                              type="button"
                              onClick={() => handleProjectSelect(project)}
                              className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-(--bg-subtle) transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="text-[13px] font-medium text-(--text-strong) truncate">
                                    {project.name}
                                  </div>
                                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-(--text-soft) bg-(--bg-subtle) px-2 py-0.5 rounded-lg">
                                    {project.display_type}
                                  </span>
                                </div>
                                <div className="text-[11px] text-(--text-faint) truncate mt-0.5">
                                  {project.location || "Location unavailable"}
                                </div>
                              </div>
                              {leadForm.project_id === project.project_id ? (
                                <Check className="size-4 text-(--brand) shrink-0 mt-0.5" />
                              ) : null}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-[12px] text-(--text-faint)">
                            No projects found
                          </div>
                        )}
                      </div>,
                      document.body,
                    )
                  : null}
              </div>
            </div>

            {leadForm.project_id && (
              <div>
                <label className="modal-label mb-1.5 block">Select Unit</label>
                <div className="relative" ref={unitDropdownRef}>
                  <div className="relative" ref={unitAnchorRef}>
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                    <input
                      type="text"
                      value={
                        showUnitDropdown ? unitSearch : leadForm.unit_name || ""
                      }
                      onChange={(event) => {
                        setUnitSearch(event.target.value);
                        setShowUnitDropdown(true);
                        if (leadForm.unit_id) {
                          setLeadForm({
                            ...leadForm,
                            unit_id: "",
                            unit_name: "",
                          });
                        }
                      }}
                      onFocus={handleUnitInputFocus}
                      className={`${inputClass} pl-10 pr-28`}
                      placeholder={
                        isLoadingProjectDetails
                          ? "Loading units..."
                          : "Search by unit name"
                      }
                      disabled={isLoadingProjectDetails}
                    />
                    {isLoadingProjectDetails ? (
                      <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) animate-spin" />
                    ) : null}
                    {leadForm.unit_id &&
                      !showUnitDropdown &&
                      (() => {
                        const matched = availableUnits.find(
                          (u) => u.unit_id === leadForm.unit_id,
                        );
                        if (!matched) return null;
                        const chipData = getUnitStatusChip(
                          matched.possession_status,
                          matched.isBooked,
                        );
                        return (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${chipData.style}`}
                            >
                              {chipData.label}
                            </span>
                          </div>
                        );
                      })()}
                    {(showUnitDropdown ? unitSearch : leadForm.unit_name) ? (
                      <button
                        type="button"
                        onClick={clearUnitSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--text-faint) hover:text-(--text-body)"
                        aria-label="Clear unit selection"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) pointer-events-none" />
                    )}
                  </div>

                  {showUnitDropdown && unitDropdownStyle
                    ? createPortal(
                        <div
                          ref={unitPortalDropdownRef}
                          style={unitDropdownStyle}
                          className="app-floating bg-white rounded-2xl max-h-64 overflow-y-auto custom-scrollbar py-1 shadow-lg border border-(--border-soft)"
                        >
                          {filteredUnits.length > 0 ? (
                            filteredUnits.map((unit) => {
                              const chipData = getUnitStatusChip(
                                unit.possession_status,
                                unit.isBooked,
                              );
                              const isSelected =
                                leadForm.unit_id === unit.unit_id;
                              return (
                                <button
                                  key={unit.unit_id}
                                  type="button"
                                  disabled={unit.isBooked && !isSelected}
                                  onClick={() => handleUnitSelect(unit)}
                                  className={`w-full px-4 py-2 flex items-center justify-between gap-3 hover:bg-(--bg-subtle) transition-colors text-left ${unit.isBooked && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  <span className="text-[13px] font-medium text-(--text-strong) truncate">
                                    {unit.unit_name}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${chipData.style}`}
                                    >
                                      {chipData.label}
                                    </span>
                                    {isSelected ? (
                                      <Check className="size-4 text-(--brand) shrink-0" />
                                    ) : null}
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-6 text-center text-[12px] text-(--text-faint)">
                              No units found
                            </div>
                          )}
                        </div>,
                        document.body,
                      )
                    : null}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-(--border-soft) flex justify-end items-center bg-(--bg-subtle)/50">
          <button
            onClick={onSave}
            className="app-btn-primary text-[14px] active:scale-[0.98]"
          >
            {editingLead ? "Update lead" : "Create lead"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LeadFormModal;
