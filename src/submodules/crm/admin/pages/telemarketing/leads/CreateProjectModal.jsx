import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Building,
  Loader2,
  MapPin,
  FileText,
  Compass,
  ArrowRight
} from "lucide-react";
import Swal from "sweetalert2";

// Reusable project components from frontend src
import ApartmentProject from "../../../../../../components/project/ApartmentProject";
import CommercialProject from "../../../../../../components/project/CommercialProject";
import DuplexTriplexProject from "../../../../../../components/project/DuplexTriplexProject";
import PlottingProject from "../../../../../../components/project/PlottingProject";
import CustomizeSelect from "../../../../../../components/project/CustomizeSelect";
import projectService from "../../../../../../components/project/projectService";

import {
  PROJECT_TYPES,
  FACILITIES,
  FACING_OPTIONS,
  BROKER_LIST,
} from "../../../../../../components/project/shared/Constants";

const DUPLEX_TRIPLEX_CONSTANTS = {
  FACILITIES: FACILITIES || [],
  FACING_OPTIONS: FACING_OPTIONS || [
    "North",
    "South",
    "East",
    "West",
    "North-East",
    "North-West",
    "South-East",
    "South-West",
  ],
  BROKER_LIST: BROKER_LIST || [],
};

const inputClass = "app-input w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold text-(--text-body) focus:ring-(--brand-ring) border border-(--border-soft) bg-white transition-all";

const CreateProjectModal = ({
  lead,
  onClose,
  onSaveSuccess
}) => {
  const [saving, setSaving] = useState(false);

  // Form States
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [landZone, setLandZone] = useState("");
  const [commercialSubType, setCommercialSubType] = useState("");

  // Additional states for sub-components
  const [landArea, setLandArea] = useState("");
  const [revenuePlots, setRevenuePlots] = useState("");
  const [addRevenuePlotNumber, setAddRevenuePlotNumber] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [parsedPlotsData, setParsedPlotsData] = useState([]);
  const [parsedRevenuePlotsData, setParsedRevenuePlotsData] = useState([]);

  const [selectedCustomTypes, setSelectedCustomTypes] = useState([]);
  const [currentCustomType, setCurrentCustomType] = useState("");
  const [showCustomizeSelect, setShowCustomizeSelect] = useState(false);

  // Prefill city/locality if lead location exists
  useEffect(() => {
    if (lead?.location) {
      const parts = lead.location.split(",").map(p => p.trim());
      if (parts.length > 0) {
        setLocality(parts[0]);
        if (parts.length > 1) {
          setCity(parts[1]);
        } else {
          setCity(parts[0]);
        }
      }
    }
  }, [lead]);

  const handleProjectTypeChange = (e) => {
    const newType = e.target.value;
    setProjectType(newType);
    setShowCustomizeSelect(newType === PROJECT_TYPES.CUSTOM);
  };

  const handleCustomizeTypeSelect = (payload) => {
    const typesArray = Array.isArray(payload.customTypes) ? payload.customTypes : [];
    setSelectedCustomTypes(typesArray);
    setCurrentCustomType(payload.activeType || typesArray[0] || null);
    setShowCustomizeSelect(false);
    setProjectType(PROJECT_TYPES.CUSTOM);
  };

  const resetForm = useCallback(() => {
    setProjectName("");
    setProjectType("");
    setCity("");
    setLocality("");
    setLandZone("");
    setCommercialSubType("");
    setLandArea("");
    setRevenuePlots("");
    setAddRevenuePlotNumber("");
    setAttachment(null);
    setParsedPlotsData([]);
    setParsedRevenuePlotsData([]);
    setShowCustomizeSelect(false);
    setSelectedCustomTypes([]);
    setCurrentCustomType("");
  }, []);

  const handleSaveProject = async (projectData) => {
    console.log("🔥 CreateProjectModal handleSaveProject received:", projectData);

    // Force custom type if we are in custom project mode
    if (projectType === PROJECT_TYPES.CUSTOM) {
      projectData.type = PROJECT_TYPES.CUSTOM;
    }

    setSaving(true);

    try {
      let savedProject;

      // Try to save to server first
      switch (projectData.type) {
        case "apartment":
          savedProject = await projectService.createApartment(projectData);
          break;
        case "commercial":
          savedProject = await projectService.createCommercial(projectData);
          break;
        case "plotting":
          savedProject = await projectService.createPlotting(projectData);
          break;
        case "duplex":
          savedProject = await projectService.createDuplex(projectData);
          break;
        case "triplex":
          savedProject = await projectService.createTriplex(projectData);
          break;
        case PROJECT_TYPES.CUSTOM: {
          // Gather all sub-project specific data into configuration
          const subProjectKeysForCreate = [
            "plots",
            "plots_data",
            "plotsData",
            "revenue_plots_data",
            "revenuePlots",
            "revenue_plots",
            "landZone",
            "land_zone",
            "landArea",
            "land_area",
            "units",
            "units_data",
            "blocks",
            "blocks_data",
            "unitPrefix",
            "numUnits",
            "total_units",
            "total_land_area",
            "num_floors",
            "approvalStatus",
            "broker",
            "constructor",
          ];

          const customConfigForCreate = {
            ...(projectData.configuration || {}),
          };
          subProjectKeysForCreate.forEach((key) => {
            if (projectData[key] !== undefined) {
              customConfigForCreate[key] = projectData[key];
            }
          });

          savedProject = await projectService.createCustomProject({
            ...projectData,
            subTypes: selectedCustomTypes,
            configuration: customConfigForCreate,
          });
          break;
        }
        default:
          throw new Error("Unknown project type");
      }


      await Swal.fire({
        title: "Success!",
        text: "Project created successfully! You can now assign it from project setup.",
        icon: "success",
        confirmButtonColor: "#00a651",
      });

      if (onSaveSuccess) {
        onSaveSuccess(savedProject);
      }
      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      Swal.fire({
        title: "Error!",
        text: `Failed to create project: ${error.response?.data?.message || error.message}`,
        icon: "error",
        confirmButtonColor: "#00a651",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderProjectForm = () => {
    if (showCustomizeSelect) {
      return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100">
          <CustomizeSelect
            initialSelected={selectedCustomTypes}
            onBack={() => setShowCustomizeSelect(false)}
            onSelectType={handleCustomizeTypeSelect}
            onClose={() => {
              resetForm();
              onClose();
            }}
            completionStatus={{}}
          />
        </div>
      );
    }

    const commonProps = {
      projectName,
      setProjectName,
      projectType,
      setProjectType,
      city,
      setCity,
      locality,
      setLocality,
      landZone,
      setLandZone,
      commercialSubType,
      setCommercialSubType,
      onSaveProject: handleSaveProject,
      PROJECT_TYPES,
      editingProjectId: null,
      selectedProject: null,
    };

    const duplexTriplexProps = {
      ...commonProps,
      landArea,
      setLandArea,
      revenuePlots,
      setRevenuePlots,
      addRevenuePlotNumber,
      setAddRevenuePlotNumber,
      attachment,
      setAttachment,
      constants: DUPLEX_TRIPLEX_CONSTANTS,
      selectedProject: null,
      initialUnits: [],
      showUnitOverviewOnLoad: false,
      onClose: () => {
        resetForm();
        onClose();
      },
    };

    const plottingProps = {
      ...commonProps,
      editingPlotId: null,
      selectedProject: null,
      initialLandArea: landArea,
      initialRevenuePlots: revenuePlots,
      initialParsedPlotsData: parsedPlotsData,
      initialParsedRevenuePlotsData: parsedRevenuePlotsData,
      initialTab: "project-info",
      onClose: () => {
        resetForm();
        onClose();
      },
    };

    if (projectType === PROJECT_TYPES.CUSTOM && selectedCustomTypes.length > 0) {
      return (
        <div className="relative space-y-4 p-4 bg-white rounded-2xl border border-slate-100/80 shadow-xs">
          <div className="flex gap-2 flex-wrap">
            {selectedCustomTypes.map((type) => (
              <button
                key={type}
                onClick={() => setCurrentCustomType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${ currentCustomType === type ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200" }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/30">
            {(() => {
              if (currentCustomType === "plotting") {
                return <PlottingProject {...plottingProps} isSubtype={true} />;
              } else if (currentCustomType === "duplex" || currentCustomType === "triplex") {
                return (
                  <DuplexTriplexProject
                    {...duplexTriplexProps}
                    projectType={currentCustomType}
                    isSubtype={true}
                  />
                );
              } else if (currentCustomType === "apartment") {
                return (
                  <ApartmentProject
                    {...commonProps}
                    openInUnitsTab={false}
                    openInOverview={false}
                    isSubtype={true}
                    onClose={() => {
                      resetForm();
                      onClose();
                    }}
                  />
                );
              } else if (currentCustomType === "commercial") {
                return <CommercialProject {...commonProps} isSubtype={true} />;
              } else {
                return <CustomizeSelect {...commonProps} activeType={currentCustomType} />;
              }
            })()}
          </div>
        </div>
      );
    }

    switch (projectType) {
      case PROJECT_TYPES.PLOTTING:
        return <PlottingProject {...plottingProps} />;
      case PROJECT_TYPES.DUPLEX:
        return <DuplexTriplexProject {...duplexTriplexProps} projectType="duplex" />;
      case PROJECT_TYPES.TRIPLEX:
        return <DuplexTriplexProject {...duplexTriplexProps} projectType="triplex" />;
      case PROJECT_TYPES.APARTMENT:
        return (
          <ApartmentProject
            {...commonProps}
            openInUnitsTab={false}
            openInOverview={false}
            onClose={() => {
              resetForm();
              onClose();
            }}
          />
        );
      case PROJECT_TYPES.COMMERCIAL:
        return (
          <CommercialProject
            {...commonProps}
            onClose={() => {
              resetForm();
              onClose();
            }}
          />
        );
      case PROJECT_TYPES.CUSTOM:
        return (
          <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-bold mb-4">
              Select custom project types to continue
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const modalContent = (
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999 backdrop-blur-xs bg-slate-900/60">
      <div className="app-modal w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white border border-(--border-soft) rounded-2xl shadow-xl">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-(--border-soft) flex justify-between items-start bg-white shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shrink-0">
              <Building className="size-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="modal-title flex items-center gap-2">
                Create Project Wizard
              </h3>
              <p className="modal-subtitle mt-0.5">
                Configure a new project profile for accepted lead: <strong className="text-(--text-strong)">{lead.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="app-icon-button mt-0.5 p-2 text-(--text-faint) hover:text-(--text-body) hover:bg-(--bg-subtle) active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-[#fcfdfd] space-y-6">
          {saving ? (
            <div className="p-16 text-center">
              <Loader2 className="size-12 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-[14px] font-extrabold text-(--text-strong)">Deploying construction project schema...</p>
              <p className="text-[12px] text-slate-400 mt-1">Please hold on while backend databases are updated</p>
            </div>
          ) : (
            <>
              {/* Form Category Selector or Configuration */}
              {!projectType && !showCustomizeSelect ? (
                <div className="max-w-2xl mx-auto p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-6">
                  <div className="space-y-1 text-center">
                    <h3 className="text-xl font-bold text-slate-800">
                      Configure Project Basics
                    </h3>
                    <p className="text-xs text-slate-400">
                      Set up the naming and category constraints to configure details
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Project Name */}
                    <div>
                      <label className="modal-label mb-1.5 block">
                        Project Name *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                        <input
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className={`${inputClass} pl-10`}
                          placeholder="e.g. Skyline Residency"
                          required
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="modal-label mb-1.5 block">
                        Project Category *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint) pointer-events-none" />
                        <select
                          value={projectType}
                          onChange={handleProjectTypeChange}
                          className={`${inputClass} pl-10 appearance-none`}
                        >
                          <option value="">Select a category</option>
                          <option value={PROJECT_TYPES.PLOTTING}>Plotting (Land & Sub-division)</option>
                          <option value={PROJECT_TYPES.DUPLEX}>Duplex Home Project</option>
                          <option value={PROJECT_TYPES.TRIPLEX}>Triplex Home Project</option>
                          <option value={PROJECT_TYPES.APARTMENT}>Apartment Building</option>
                          <option value={PROJECT_TYPES.COMMERCIAL}>Commercial Hub</option>
                          <option value={PROJECT_TYPES.CUSTOM}>Custom / Multiple Types</option>
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

                    {/* Location fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label mb-1.5 block">
                          Locality / Suburb
                        </label>
                        <div className="relative">
                          <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                          <input
                            type="text"
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. Patia"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="modal-label mb-1.5 block">
                          City *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-faint)" />
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. Bhubaneswar"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={!projectName.trim() || !city.trim() || !projectType}
                      onClick={() => {
                        if (projectType === PROJECT_TYPES.CUSTOM) {
                          setShowCustomizeSelect(true);
                        }
                      }}
                      className="app-btn-primary flex items-center gap-2 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Continue Setup</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="">
                  {renderProjectForm()}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer (only visible when selecting project type) */}
        {!projectType && !showCustomizeSelect && !saving && (
          <div className="px-5 py-3 border-t border-(--border-soft) flex justify-end items-center bg-white shrink-0">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="app-btn-secondary text-[13px] active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateProjectModal;
