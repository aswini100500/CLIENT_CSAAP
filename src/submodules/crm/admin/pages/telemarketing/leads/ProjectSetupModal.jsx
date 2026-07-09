import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Building,
  User,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Paperclip,
  Eye,
  Download,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Search,
  Check
} from "lucide-react";
import api from "../../../../api";
import operationApi from "../../../../../../api/operation";

const inputClass = "app-input w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold text-(--text-body) focus:ring-(--brand-ring) border border-(--border-soft) bg-white";

const PROJECT_TYPE_LABELS = {
  apartment: "Apartment",
  commercial: "Commercial",
  plotting: "Plotting",
  duplex: "Duplex",
  triplex: "Triplex",
  custom_project: "Custom",
};

const normalizeProjectTypeKey = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return normalized === "custom" ? "custom_project" : normalized;
};

const buildCompositeProjectId = (project) => {
  if (!project?.id || !project?.type) return "";
  return `${normalizeProjectTypeKey(project.type)}:${project.id}`;
};

const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ProjectSetupModal = ({
  lead,
  onClose,
  onSaveSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [existingSetupId, setExistingSetupId] = useState(null);

  // Core setup states
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [contractor, setContractor] = useState("");
  const [contractorSearchTerm, setContractorSearchTerm] = useState("");
  const [showContractorDropdown, setShowContractorDropdown] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [units, setUnits] = useState([]);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [plans, setPlans] = useState({});
  const [stages, setStages] = useState([
    { id: generateUUID(), name: "Stage 1", description: "", start: "", end: "", status: "planned", budget: "", subStages: [] }
  ]);

  // Lists loaded from backend
  const [projectsList, setProjectsList] = useState([]);
  const [contractorsList, setContractorsList] = useState([]);

  const getArrayData = (res) => {
    if (!res || !res.data) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data.contractors)) return res.data.contractors;
    return [];
  };

  const parseLeadProjectId = (leadProjId) => {
    if (!leadProjId) return "";
    const parts = String(leadProjId).trim().toLowerCase().split(":");
    if (parts.length >= 2) {
      const type = PROJECT_TYPE_LABELS[parts[0]] || parts[0];
      const id = parts[1];
      return `${type}-${id}`;
    }
    return "";
  };

  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("T")) {
      return dateStr.split("T")[0];
    }
    return dateStr;
  };

  useEffect(() => {
    let active = true;
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [apartments, commercials, plottings, duplexes, triplexes, custom, contractorsRes] = await Promise.all([
          operationApi.getApartments(),
          operationApi.getCommercials(),
          operationApi.getPlottings(),
          operationApi.getDuplexes(),
          operationApi.getTriplexes(),
          operationApi.getCustomProjects(),
          operationApi.getContractors()
        ]);

        if (!active) return;

        const allProjects = [
          ...getArrayData(apartments).map(p => ({ ...p, type: 'Apartment', uid: `Apartment-${p.id}` })),
          ...getArrayData(commercials).map(p => ({ ...p, type: 'Commercial', uid: `Commercial-${p.id}` })),
          ...getArrayData(plottings).map(p => ({ ...p, type: 'Plotting', uid: `Plotting-${p.id}` })),
          ...getArrayData(duplexes).map(p => ({ ...p, type: 'Duplex', uid: `Duplex-${p.id}` })),
          ...getArrayData(triplexes).map(p => ({ ...p, type: 'Triplex', uid: `Triplex-${p.id}` })),
          ...getArrayData(custom).map(p => ({ ...p, type: 'Custom', uid: `Custom-${p.id}` }))
        ];

        setProjectsList(allProjects);
        const contractors = getArrayData(contractorsRes);
        setContractorsList(contractors);

        // Auto-select project matching lead's project_id
        const parsedLeadProjUid = parseLeadProjectId(lead.project_id);
        const matchedProj = allProjects.find(p => p.uid === parsedLeadProjUid || String(p.id) === String(lead.project_id));
        
        if (matchedProj) {
          setSelectedProject(matchedProj);
          setProjectSearchTerm(matchedProj.name || matchedProj.project_name || "");
          let currentUnits = matchedProj.units_data || matchedProj.units || [];
          if (typeof currentUnits === 'string') {
            try { currentUnits = JSON.parse(currentUnits); } catch { currentUnits = []; }
          }
          setUnits(currentUnits);

          // Check if setup already exists for this project
          try {
            const setupsRes = await operationApi.getProjectSetups();
            const setups = getArrayData(setupsRes);
            const existingSetup = setups.find(s => 
              s.project_id === matchedProj.id && 
              String(s.project_type).toLowerCase() === String(matchedProj.type).toLowerCase()
            );
            
            if (existingSetup) {
              setExistingSetupId(existingSetup.id);
              setContractor(existingSetup.contractor_id);
              const selectedCont = contractors.find(c => c.id === existingSetup.contractor_id);
              if (selectedCont) {
                setContractorSearchTerm(selectedCont.name || selectedCont.contractor_name);
              }
              setDates({ 
                start: formatDateToYYYYMMDD(existingSetup.start_date), 
                end: formatDateToYYYYMMDD(existingSetup.end_date) 
              });
              
              let loadedStages = existingSetup.stages;
              if (typeof loadedStages === 'string') {
                try { loadedStages = JSON.parse(loadedStages); } catch { loadedStages = []; }
              }
              const formattedStages = (loadedStages || []).map((s) => ({
                ...s,
                id: s.id || generateUUID(),
                start: formatDateToYYYYMMDD(s.start_date || s.start),
                end: formatDateToYYYYMMDD(s.end_date || s.end),
                subStages: (s.subStages || s.sub_stages || []).map((ss) => ({
                  ...ss,
                  id: ss.id || generateUUID()
                }))
              }));
              setStages(formattedStages);
            }
          } catch (err) {
            console.error("Error fetching existing project setup:", err);
          }
        }
      } catch (error) {
        console.error("Error loading project setup data:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInitialData();
    return () => {
      active = false;
    };
  }, [lead.project_id]);

  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setProjectSearchTerm(project.name || project.project_name || "");
    setShowProjectDropdown(false);
    
    let currentUnits = project.units_data || project.units || [];
    if (typeof currentUnits === 'string') {
      try { currentUnits = JSON.parse(currentUnits); } catch { currentUnits = []; }
    }
    setUnits(currentUnits);
    setValidationError("");

    // Check if setup already exists for this project
    try {
      const setupsRes = await operationApi.getProjectSetups();
      const setups = getArrayData(setupsRes);
      const existingSetup = setups.find(s => 
        s.project_id === project.id && 
        String(s.project_type).toLowerCase() === String(project.type).toLowerCase()
      );
      
      if (existingSetup) {
        setExistingSetupId(existingSetup.id);
        setContractor(existingSetup.contractor_id);
        const selectedCont = contractorsList.find(c => c.id === existingSetup.contractor_id);
        if (selectedCont) {
          setContractorSearchTerm(selectedCont.name || selectedCont.contractor_name);
        }
        setDates({ 
          start: formatDateToYYYYMMDD(existingSetup.start_date), 
          end: formatDateToYYYYMMDD(existingSetup.end_date) 
        });
        
        let loadedStages = existingSetup.stages;
        if (typeof loadedStages === 'string') {
          try { loadedStages = JSON.parse(loadedStages); } catch { loadedStages = []; }
        }
        const formattedStages = (loadedStages || []).map((s) => ({
          ...s,
          id: s.id || generateUUID(),
          start: formatDateToYYYYMMDD(s.start_date || s.start),
          end: formatDateToYYYYMMDD(s.end_date || s.end),
          subStages: (s.subStages || s.sub_stages || []).map((ss) => ({
            ...ss,
            id: ss.id || generateUUID()
          }))
        }));
        setStages(formattedStages);
      } else {
        // Reset states for fresh setup
        setExistingSetupId(null);
        setContractor("");
        setContractorSearchTerm("");
        setDates({ start: "", end: "" });
        setStages([
          { id: generateUUID(), name: "Stage 1", description: "", start: "", end: "", status: "planned", budget: "", subStages: [] }
        ]);
      }
    } catch (err) {
      console.error("Error fetching existing project setup:", err);
    }
  };

  const filteredProjects = (projectsList || []).filter(p =>
    (p.name || p.project_name || "").toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
    (p.type || "").toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
    (p.location || p.site_location || "").toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const handleContractorSelect = (c) => {
    setContractor(c.id);
    setContractorSearchTerm(c.name || c.contractor_name);
    setShowContractorDropdown(false);
    setValidationError("");
  };

  const filteredContractors = (contractorsList || []).filter(c =>
    (c.name || c.contractor_name || "").toLowerCase().includes(contractorSearchTerm.toLowerCase()) ||
    (c.phone || "").toLowerCase().includes(contractorSearchTerm.toLowerCase())
  );

  const handlePlanUpload = (unitId, e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file =>
      ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) &&
      file.size <= 10 * 1024 * 1024
    );

    setPlans(prev => ({
      ...prev,
      [unitId]: prev[unitId] ? [...prev[unitId], ...validFiles] : validFiles,
    }));
  };

  const removePlan = (unitId, index) => {
    setPlans(prev => ({
      ...prev,
      [unitId]: prev[unitId].filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredUnits = units.filter(unit =>
    (unit.name || unit.type || "").toLowerCase().includes(unitSearchTerm.toLowerCase())
  );

  const addStage = () => {
    const newStage = {
      id: generateUUID(),
      name: `Stage ${stages.length + 1}`,
      description: "",
      start: "",
      end: "",
      status: "planned",
      budget: "",
      subStages: []
    };
    setStages(prev => [...prev, newStage]);
  };

  const removeStage = (id) => {
    if (stages.length > 1) {
      setStages(prev => prev.filter(s => s.id !== id));
    }
  };

  const updateStage = (id, field, value) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSubStage = (stageId) => {
    const newSub = {
      id: generateUUID(),
      name: `Sub-stage `,
      description: "",
      status: "planned"
    };
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, subStages: [...(s.subStages || []), newSub] } : s));
  };

  const removeSubStage = (stageId, subId) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, subStages: (s.subStages || []).filter(ss => ss.id !== subId) } : s));
  };

  const updateSubStage = (stageId, subId, field, value) => {
    setStages(prev => prev.map(s => {
      if (s.id !== stageId) return s;
      return { ...s, subStages: (s.subStages || []).map(ss => ss.id === subId ? { ...ss, [field]: value } : ss) };
    }));
  };

  const handleSave = async () => {
    if (!selectedProject) {
      setValidationError("Project data not loaded.");
      return;
    }
    if (!contractor) {
      setValidationError("Please select a contractor.");
      return;
    }
    if (!dates.start || !dates.end) {
      setValidationError("Please configure both Start Date and End Date.");
      return;
    }

    try {
      setSaving(true);
      setValidationError("");

      const submissionData = {
        project_id: selectedProject.id,
        project_type: selectedProject.type.toLowerCase(),
        contractor_id: parseInt(contractor),
        start_date: formatDateToYYYYMMDD(dates.start),
        end_date: formatDateToYYYYMMDD(dates.end),
        status: "draft",
        stages: stages.map((s) => ({
          id: s.id || generateUUID(),
          name: s.name,
          description: s.description,
          start: formatDateToYYYYMMDD(s.start_date || s.start),
          end: formatDateToYYYYMMDD(s.end_date || s.end),
          status: s.status,
          sub_stages: (s.subStages || s.sub_stages || []).map((ss) => ({
            ...ss,
            id: ss.id || generateUUID()
          }))
        })),
        units_data: units
      };

      let res;
      if (existingSetupId) {
        res = await operationApi.updateProjectSetup(existingSetupId, submissionData);
      } else {
        res = await operationApi.createProjectSetup(submissionData);
      }

      const compositeProjectId = buildCompositeProjectId(selectedProject);
      if (!lead?.id || !lead?.company_id || !compositeProjectId) {
        throw new Error("Project setup saved, but CRM lead assignment data is incomplete.");
      }

      await api.put(`/api/leads/${lead.id}`, {
        company_id: lead.company_id,
        project_id: compositeProjectId,
      });

      alert("Project setup configuration saved successfully!");
      if (onSaveSuccess) {
        onSaveSuccess(res.data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving project setup:", error);
      setValidationError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit project setup.",
      );
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-xs">
      <div className="app-modal w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shrink-0">
              <Building className="size-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="modal-title">Project Setup Wizard</h3>
              <p className="modal-subtitle mt-0.5">
                Configure timeline, contractors, and stages for accepted lead: <strong className="text-(--text-strong)">{lead.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-icon-button mt-0.5 p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-[#fcfdfd]">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="size-10 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-[13.5px] font-semibold text-(--text-soft)">Loading construction metadata...</p>
            </div>
          ) : (
            <>
              {/* Top Section: Project & Contractor & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Premium Project Detail Panel */}
                <div className="space-y-4">
                  {selectedProject ? (
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 flex items-start justify-between gap-3.5 relative overflow-hidden">
                      <div className="flex items-start gap-3.5">
                        <div className="bg-emerald-100/40 p-2.5 rounded-xl shrink-0">
                          <Building className="size-5.5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-widest block">Project Assignment</span>
                          <h4 className="text-[15px] font-extrabold text-(--text-strong) mt-1">
                            {selectedProject.name || selectedProject.project_name}
                          </h4>
                          <p className="text-[12px] font-semibold text-(--text-soft) mt-1.5 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-100 font-bold text-[10px] text-emerald-700">
                              {selectedProject.type || "Unknown"}
                            </span>
                            &bull; {selectedProject.location || selectedProject.site_location || "No site location listed"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(null);
                          setProjectSearchTerm("");
                          setContractor("");
                          setContractorSearchTerm("");
                          setDates({ start: "", end: "" });
                          setStages([
                            { id: `stage-${Date.now()}`, name: "Stage 1", description: "", start: "", end: "", status: "planned", budget: "", subStages: [] }
                          ]);
                          setExistingSetupId(null);
                        }}
                        className="px-2.5 py-1 text-[10.5px] font-bold text-emerald-700 bg-white hover:bg-emerald-100/50 rounded-lg border border-emerald-200 transition-colors shrink-0 cursor-pointer self-start"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="app-panel p-4 bg-white space-y-3.5 relative" style={{ overflow: 'visible' }}>
                      <div>
                        <span className="text-[11.5px] font-extrabold text-(--text-faint) uppercase tracking-wider block">Project Assignment</span>
                        <p className="text-[11.5px] text-amber-600 font-semibold mt-1">
                          No project selected on lead. Please search and select a project below:
                        </p>
                      </div>
                      <div className="relative">
                        <label className="modal-label mb-1.5 block font-bold text-[11px] text-(--text-soft)">Select Project *</label>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-faint) size-4" />
                          <input
                            type="text"
                            placeholder="Search project name, type or location..."
                            value={projectSearchTerm}
                            onChange={(e) => {
                              setProjectSearchTerm(e.target.value);
                              setShowProjectDropdown(true);
                            }}
                            onFocus={() => setShowProjectDropdown(true)}
                            className={`${inputClass} pl-10`}
                          />
                        </div>

                        {showProjectDropdown && (
                          <div className="absolute z-50 w-full mt-1.5 bg-white border border-(--border-soft) rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {filteredProjects.length > 0 ? (
                              filteredProjects.map((p) => (
                                <div
                                  key={p.uid || p.id}
                                  onClick={() => handleProjectSelect(p)}
                                  className="p-2.5 hover:bg-emerald-50/50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="bg-emerald-50 p-1.5 rounded-full">
                                      <Building className="size-3.5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <div className="text-[12.5px] font-bold text-(--text-strong)">
                                        {p.name || p.project_name}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {p.type} &bull; {p.location || p.site_location || "No location"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-center text-slate-400 text-xs">
                                No projects found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline Dates Container */}
                  {selectedProject && (
                    <div className="app-panel p-4 bg-white space-y-3.5">
                      <span className="text-[11.5px] font-extrabold text-(--text-faint) uppercase tracking-wider block">Project Timeline Dates</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="modal-label mb-1.5 block font-bold text-[11px] text-(--text-soft)">
                            <Calendar className="inline size-3.5 mr-1 text-emerald-500" /> Start Date *
                          </label>
                          <input
                            type="date"
                            value={dates.start}
                            onChange={(e) => {
                              setDates(prev => ({ ...prev, start: e.target.value }));
                              setValidationError("");
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="modal-label mb-1.5 block font-bold text-[11px] text-(--text-soft)">
                            <Calendar className="inline size-3.5 mr-1 text-emerald-500" /> End Date *
                          </label>
                          <input
                            type="date"
                            value={dates.end}
                            onChange={(e) => {
                              setDates(prev => ({ ...prev, end: e.target.value }));
                              setValidationError("");
                            }}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Contractor Select Autocomplete */}
                {selectedProject ? (
                  <div className="app-panel p-4 bg-white flex flex-col justify-between relative" style={{ overflow: 'visible' }}>
                    <div className="space-y-3">
                      <span className="text-[11.5px] font-extrabold text-(--text-faint) uppercase tracking-wider block">Contractor Allocation</span>
                      <div className="relative">
                        <label className="modal-label mb-1.5 block font-bold text-[11px] text-(--text-soft)">Select Contractor *</label>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-faint) size-4" />
                          <input
                            type="text"
                            placeholder="Search contractor name or phone..."
                            value={contractorSearchTerm}
                            onChange={(e) => {
                              setContractorSearchTerm(e.target.value);
                              setShowContractorDropdown(true);
                              if (!e.target.value) setContractor("");
                            }}
                            onFocus={() => setShowContractorDropdown(true)}
                            className={`${inputClass} pl-10`}
                          />
                        </div>

                        {showContractorDropdown && (
                          <div className="absolute z-50 w-full mt-1.5 bg-white border border-(--border-soft) rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {filteredContractors.length > 0 ? (
                              filteredContractors.map((c) => (
                                <div
                                  key={c.id}
                                  onClick={() => handleContractorSelect(c)}
                                  className="p-2.5 hover:bg-emerald-50/50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="bg-emerald-50 p-1.5 rounded-full">
                                      <User className="size-3.5 text-emerald-600" />
                                    </div>
                                    <div>
                                      <div className="text-[12.5px] font-bold text-(--text-strong)">
                                        {c.name || c.contractor_name}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {c.phone || "No phone"} &bull; {c.email || "No email"}
                                      </div>
                                    </div>
                                  </div>
                                  {String(contractor) === String(c.id) && (
                                    <Check className="size-4 text-emerald-600" />
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-center text-slate-400 text-xs">
                                No contractors found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Contractor Badge preview */}
                    {contractor && (
                      <div className="mt-4 p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center gap-3">
                        <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <User className="size-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Contractor</span>
                          <span className="text-[13px] font-bold text-(--text-strong) truncate block">
                            {contractorSearchTerm}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="app-panel p-6 bg-white flex flex-col items-center justify-center text-center space-y-3.5 border border-dashed border-emerald-200 rounded-2xl min-h-55">
                    <div className="size-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Building className="size-5 text-emerald-600" />
                    </div>
                    <div>
                      <h5 className="text-[13.5px] font-bold text-(--text-strong)">Configure Project Details</h5>
                      <p className="text-[12px] text-(--text-soft) mt-1 max-w-70">
                        Select a project from the left panel to begin setting up the timeline, assigning contractors, and creating stages.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Alert */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 shake">
                  <AlertTriangle className="size-4.5 text-red-500 mt-0.5 shrink-0" />
                  <div className="text-[12.5px] font-medium text-red-800">{validationError}</div>
                </div>
              )}

              {/* Units & Unit Plans Section */}
              {selectedProject && units.length > 0 && (
                <div className="app-panel overflow-hidden border border-(--border-soft) bg-white">
                  <div className="app-section-bar px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--border-soft)">
                    <h4 className="app-heading flex items-center gap-2">
                      <Building className="size-4 text-emerald-600" />
                      <span>Unit Blueprint Plans & Drawings</span>
                    </h4>
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) size-3.5" />
                      <input
                        type="text"
                        placeholder="Search units..."
                        value={unitSearchTerm}
                        onChange={(e) => setUnitSearchTerm(e.target.value)}
                        className="app-input w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 max-h-72 overflow-y-auto custom-scrollbar space-y-3.5 bg-slate-50/30">
                    {filteredUnits.length > 0 ? (
                      filteredUnits.map((unit) => (
                        <div key={unit.id} className="border border-slate-200/60 bg-white rounded-xl p-3.5 hover:shadow-sm transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-2.5">
                            <div>
                              <h5 className="text-[13.5px] font-extrabold text-(--text-strong)">{unit.name}</h5>
                              <p className="text-[11.5px] font-medium text-(--text-soft) mt-0.5">
                                Type: {unit.type} &bull; Size: {unit.size} &bull; Floor: {unit.floor}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold shrink-0 ${ plans[unit.id]?.length ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200/50' }`}>
                              {plans[unit.id]?.length || 0} drawing files
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type="file"
                              multiple
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handlePlanUpload(unit.id, e)}
                              className="text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100/80 cursor-pointer"
                            />
                          </div>

                          {plans[unit.id]?.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {plans[unit.id].map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded-xl">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Paperclip className="size-3.5 text-emerald-600 shrink-0" />
                                    <div className="min-w-0">
                                      <div className="text-[11.5px] font-bold text-(--text-strong) truncate">{file.name}</div>
                                      <div className="text-[9.5px] text-slate-400">{formatFileSize(file.size)}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button className="text-slate-400 hover:text-emerald-600 p-1 transition-colors">
                                      <Eye size={13} />
                                    </button>
                                    <button className="text-slate-400 hover:text-emerald-600 p-1 transition-colors">
                                      <Download size={13} />
                                    </button>
                                    <button
                                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                      onClick={() => removePlan(unit.id, index)}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No units match your search query.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Stages & Timeline Section */}
              {selectedProject && (
                <div className="app-panel overflow-hidden border border-(--border-soft) bg-white">
                <div className="app-section-bar px-4 py-3.5 flex items-center justify-between border-b border-(--border-soft)">
                  <h4 className="app-heading flex items-center gap-2">
                    <Layers className="size-4 text-emerald-600" />
                    <span>Project Milestone Stages & Timelines</span>
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={addStage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="size-3.5" /> Add Stage
                    </button>
                    <span className="text-xs font-bold text-slate-400">{stages.length} milestones</span>
                  </div>
                </div>

                <div className="p-4 space-y-4 max-h-120 overflow-y-auto custom-scrollbar bg-slate-50/20">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-xs relative hover:border-slate-300 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        {/* Stage details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="size-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10.5px] font-bold text-emerald-700">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                              className="text-[14.5px] font-extrabold text-(--text-strong) bg-transparent border-none p-0 focus:ring-0 w-full placeholder-slate-300"
                              placeholder={`Stage ${index + 1} Title`}
                            />
                          </div>

                          <textarea
                            placeholder="Describe stage goals, targets, and expected deliverables..."
                            rows="2"
                            value={stage.description}
                            onChange={(e) => updateStage(stage.id, 'description', e.target.value)}
                            className={`${inputClass} font-medium py-2 placeholder-slate-400 bg-slate-50/30 resize-none`}
                          />

                          {/* Nested Sub-stages */}
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide block mb-2">Sub-milestones</span>
                            
                            <div className="space-y-2">
                              {(stage.subStages || []).map((sub) => (
                                <div key={sub.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                  <input
                                    type="text"
                                    value={sub.name}
                                    onChange={(e) => updateSubStage(stage.id, sub.id, 'name', e.target.value)}
                                    placeholder="Sub-milestone name"
                                    className="flex-1 text-[12px] font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500/20"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeSubStage(stage.id, sub.id)}
                                    className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => addSubStage(stage.id)}
                              className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              <Plus className="size-3.5" /> Add Sub-milestone
                            </button>
                          </div>
                        </div>

                        {/* Dates & Actions Column */}
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="flex gap-2">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Start Date</span>
                              <input
                                type="date"
                                value={stage.start}
                                onChange={(e) => updateStage(stage.id, 'start', e.target.value)}
                                className="text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">End Date</span>
                              <input
                                type="date"
                                value={stage.end}
                                onChange={(e) => updateStage(stage.id, 'end', e.target.value)}
                                className="text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500/20"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeStage(stage.id)}
                            disabled={stages.length === 1}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all self-end"
                            title="Remove Stage"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-(--border-soft) flex justify-between items-center bg-white">
          <div className="text-[12.5px] font-medium text-(--text-faint)">
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="app-btn-secondary text-[13px] active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading || !selectedProject || !contractor || !dates.start || !dates.end}
              className="app-btn-primary text-[13px] active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer shadow-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="size-4" />
                  Submit Setup
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectSetupModal;
