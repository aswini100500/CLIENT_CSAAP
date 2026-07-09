import React, { useCallback, useEffect, useState } from "react";
import {
  FaBuilding,
  FaCheck,
  FaCheckCircle,
  FaCheckSquare,
  FaDatabase,
  FaDoorClosed,
  FaEdit,
  FaExclamationCircle,
  FaEye,
  FaFileExcel,
  FaHome,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaPen,
  FaPlus, // Add this
  FaSquare,
  FaSync,
  FaTable,
  FaTimes,
  FaTimesCircle,
  FaTrash
} from "react-icons/fa";
import ApartmentProject from "./ApartmentProject";
import CommercialProject from "./CommercialProject";
import DuplexTriplexProject from "./DuplexTriplexProject";
import PlottingProject from "./PlottingProject";
import ProjectViewForm from "./ProjectViewForm";

import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import projectService from "./projectService";
import useAuth from "../../hooks/useAuth";

// Shared imports
import { getProjectOverallStatus } from "./shared/utils";
import CustomizeSelect from "./CustomizeSelect";
import {
  BROKER_LIST,
  FACILITIES,
  FACING_OPTIONS,
  PROJECT_TYPES,
} from "./shared/Constants";

// Create constants object for DuplexTriplexProject
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

const PABC = () => {
  const { token } = useAuth();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [viewProjectId, setViewProjectId] = useState(null);
  const [viewProjectData, setViewProjectData] = useState(null);
  const [showCustomizeSelect, setShowCustomizeSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    local: 0,
    server: 0,
    lastSynced: null,
  });

  // Plot Editing Overview state
  const [showPlotEditingOverview, setShowPlotEditingOverview] = useState(false);
  const [selectedProjectForEditing, setSelectedProjectForEditing] =
    useState(null);
  const [editingPlots, setEditingPlots] = useState([]);
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [showUnitOverview, setShowUnitOverview] = useState(false);

  const getPossessionStatus = (item) => {
    if (!item) return "-";
    let status = item.possessionStatus || item.possession_status;
    if (!status && item.propertyFeatures) {
      let features = item.propertyFeatures;
      if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch (e) { }
      }
      status = features?.possessionStatus;
    }
    return status || "-";
  };
  // Project Form State
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [landZone, setLandZone] = useState("");
  const [commercialSubType, setCommercialSubType] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Additional state for Duplex/Triplex projects
  const [landArea, setLandArea] = useState("");
  const [revenuePlots, setRevenuePlots] = useState("");
  const [addRevenuePlotNumber, setAddRevenuePlotNumber] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [parsedPlotsData, setParsedPlotsData] = useState([]); // Store parsed plots_data
  const [parsedRevenuePlotsData, setParsedRevenuePlotsData] = useState([]); // Store parsed revenue_plots_data

  const [selectedCustomTypes, setSelectedCustomTypes] = useState([]);
  const [currentCustomType, setCurrentCustomType] = useState("");
  const [openInOverview, setOpenInOverview] = useState(false);

  const [showUnitEditingOverview, setShowUnitEditingOverview] = useState(false);
  const [unitOverviewProject, setUnitOverviewProject] = useState(null);
  const [unitOverviewUnits, setUnitOverviewUnits] = useState([]);

  // Apartment Editing Overview
  const [showApartmentOverview, setShowApartmentOverview] = useState(false);
  const [apartmentOverviewProject, setApartmentOverviewProject] =
    useState(null);
  const [apartmentOverviewBlocks, setApartmentOverviewBlocks] = useState([]);

  // commercial
  const [showCommercialEditingOverview, setShowCommercialEditingOverview] =
    useState(false);
  const [commercialOverviewProject, setCommercialOverviewProject] =
    useState(null);
  const [commercialOverviewUnits, setCommercialOverviewUnits] = useState([]);

  // Multi-select state
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  // custom editing overview
  const [showCustomEditingOverview, setShowCustomEditingOverview] =
    useState(false);
  const [customOverviewProject, setCustomOverviewProject] = useState(null);
  const [customOverviewData, setCustomOverviewData] = useState({});

  // Add this useEffect to reset showUnitOverview
  useEffect(() => {
    if (showForm && editingProjectId) {
      // Check if this is a duplex/triplex project with units
      const project = projects.find((p) => p.id === editingProjectId);
      if (
        (project?.type === "duplex" || project?.type === "triplex") &&
        project?.units_data
      ) {
        try {
          const units =
            typeof project.units_data === "string"
              ? JSON.parse(project.units_data)
              : project.units_data;
          if (units && units.length > 0) {
            // Check if we should show unit overview
            const shouldShow =
              window.location.hash === "#unit-overview" ||
              localStorage.getItem(`show_unit_overview_${editingProjectId}`);
            if (shouldShow) {
              setShowUnitOverview(true);
              localStorage.removeItem(`show_unit_overview_${editingProjectId}`);
            }
          }
        } catch (e) {
          console.error("Error parsing units_data:", e);
        }
      }
    }
  }, [showForm, editingProjectId, projects]);

  // Load projects from localStorage on mount AND from API
  useEffect(() => {
    loadAllProjects();
  }, []);

  const parseUnits = (project) => {
    if (!project?.units_data) return [];

    try {
      return typeof project.units_data === "string"
        ? JSON.parse(project.units_data)
        : project.units_data;
    } catch (e) {
      console.error("Failed to parse units_data", e);
      return [];
    }
  };

  const openApartmentEditingOverview = (project) => {
    setApartmentOverviewProject(project);

    let blocks = [];
    try {
      if (project.blocks_data) {
        blocks =
          typeof project.blocks_data === "string"
            ? JSON.parse(project.blocks_data)
            : project.blocks_data;
      }
    } catch (e) {
      console.error("Failed to parse blocks_data", e);
      blocks = [];
    }

    setApartmentOverviewBlocks(blocks);
    setShowApartmentOverview(true);
  };

  // Function to load projects from both localStorage and API
  const loadAllProjects = async () => {
    try {
      setApiLoading(true);

      // Load from localStorage first
      const savedProjects = localStorage.getItem("local_projects");
      let localProjects = [];

      if (savedProjects) {
        try {
          localProjects = JSON.parse(savedProjects);
        } catch (err) {
          console.error("Failed to parse projects from localStorage", err);
        }
      }

      // Try to load from API
      let serverProjects = [];
      try {
        console.log("🚀 Fetching all projects from API...");

        // Fetch each project type with individual error handling to prevent one failure from breaking everything
        const fetchResults = await Promise.allSettled([
          projectService.getAllApartments(),
          projectService.getAllCommercials(),
          projectService.getAllPlottings(),
          projectService.getAllDuplexes(),
          projectService.getAllTriplexes(),
          projectService.getAllCustomProjects(),
        ]);

        const [
          apartmentsRes,
          commercialsRes,
          plottingsRes,
          duplexesRes,
          triplexesRes,
          customProjectsRes,
        ] = fetchResults;

        const processResult = (result, type, label) => {
          if (result.status === "fulfilled" && Array.isArray(result.value)) {
            console.log(`✅ Fetched ${result.value.length} ${label}`);
            return result.value.map((p) => ({ ...p, source: "server", type }));
          } else {
            if (result.status === "rejected") {
              console.warn(`❌ Failed to fetch ${label}:`, result.reason);
            } else if (result.status === "fulfilled") {
              console.warn(
                `⚠️ ${label} response is not an array:`,
                result.value,
              );
            }
            return [];
          }
        };

        serverProjects = [
          ...processResult(apartmentsRes, "apartment", "apartments"),
          ...processResult(commercialsRes, "commercial", "commercials"),
          ...processResult(plottingsRes, "plotting", "plottings"),
          ...processResult(duplexesRes, "duplex", "duplexes"),
          ...processResult(triplexesRes, "triplex", "triplexes"),
          ...processResult(
            customProjectsRes,
            PROJECT_TYPES.CUSTOM,
            "custom projects",
          ),
        ];

        console.log(
          `📊 Total server projects fetched: ${serverProjects.length}`,
        );
      } catch (apiError) {
        console.error("Critical error in loadAllProjects API fetch:", apiError);
      }

      // Merge local and server projects
      const allProjects = [...serverProjects];

      // Add local projects that don't exist on server
      localProjects.forEach((localProject) => {
        const existsOnServer = allProjects.some(
          (serverProject) => serverProject.id === localProject.id,
        );
        if (!existsOnServer) {
          allProjects.push({ ...localProject, source: "local" });
        }
      });

      // 🔥 SORT PROJECTS: newest → oldest
      allProjects.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });

      setProjects(allProjects);

      // Update sync status
      setSyncStatus({
        local: localProjects.length,
        server: serverProjects.length,
        lastSynced: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error loading projects:", error);
      setError("Failed to load projects. Please check your connection.");
    } finally {
      setApiLoading(false);
    }
  };

  //   const openEditingOverview = (project) => {
  //   let items = [];
  //   let type = project.type;

  //   try {
  //     if (type === "plotting") {
  //       items = typeof project.plots_data === "string"
  //         ? JSON.parse(project.plots_data)
  //         : project.plots_data || [];
  //     }

  //     if (type === "duplex" || type === "triplex") {
  //       items = typeof project.units_data === "string"
  //         ? JSON.parse(project.units_data)
  //         : project.units_data || [];
  //     }

  //     if (type === "apartment") {
  //       items = typeof project.blocks_data === "string"
  //         ? JSON.parse(project.blocks_data)
  //         : project.blocks_data || [];
  //     }
  //   } catch (e) {
  //     console.error("Failed to parse overview data", e);
  //   }

  //   setEditingOverview({
  //     open: true,
  //     type,
  //     project,
  //     items
  //   });
  // };

  // Save projects to localStorage whenever state changes
  useEffect(() => {
    // Filter only local projects (not from server)
    const localProjects = projects.filter(
      (p) => p.source === "local" || !p.source,
    );
    if (localProjects.length > 0) {
      localStorage.setItem("local_projects", JSON.stringify(localProjects));
    } else {
      localStorage.removeItem("local_projects"); // 🔥 REQUIRED
    }
  }, [projects]);

  // Clear editing plot flag when closing form
  useEffect(() => {
    if (!showForm && editingPlotId) {
      setEditingPlotId(null);
    }
  }, [showForm, editingPlotId]);

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
    setEditingProjectId(null);
    setEditingPlotId(null);
    setSelectedProject(null);
    setSelectedProjectForEditing(null);
    setParsedPlotsData([]);
    setParsedRevenuePlotsData([]);
    setShowCustomizeSelect(false);
    setSelectedCustomTypes([]);
    setCurrentCustomType("");
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  }, []);

  const handleSaveProject = useCallback(
    async (projectData) => {
      console.log("🔥 PABC handleSaveProject received:", projectData);
      console.log("🔥 All Units:");

      projectData?.blocks?.forEach((block, blockIndex) => {
        block.floors?.forEach((floor, floorIndex) => {
          floor.units?.forEach((unit, unitIndex) => {
            console.log(
              `Block ${blockIndex} → Floor ${floorIndex} → Unit ${unitIndex}:`,
              unit,
            );
          });
        });
      });

      {
        /* Apartment Unit Details Modal */
      }
      console.log("🔥 projectData.plots_data:", projectData.plots_data);

      // Force custom type if we are in custom project mode to prevent subtypes from overwriting it
      if (projectType === PROJECT_TYPES.CUSTOM) {
        projectData.type = PROJECT_TYPES.CUSTOM;
      }

      setLoading(true);

      try {
        let savedProject;

        if (projectData.id) {
          // When editing, preserve units from the existing project if not included in projectData
          let mergedData = { ...projectData };

          if (editingProjectId) {
            const existingProject = projects.find(
              (p) => p.id === editingProjectId,
            );

            // Handle units_data (new database field name)
            if (existingProject?.units_data) {
              let existingUnits = existingProject.units_data;
              // Parse if it's a JSON string
              if (typeof existingUnits === "string") {
                try {
                  existingUnits = JSON.parse(existingUnits);
                } catch (e) {
                  console.error("Failed to parse existing units_data:", e);
                  existingUnits = [];
                }
              }

              if (Array.isArray(existingUnits) && existingUnits.length > 0) {
                let incomingUnits =
                  projectData.units_data || projectData.units || [];
                // Parse if it's a JSON string
                if (typeof incomingUnits === "string") {
                  try {
                    incomingUnits = JSON.parse(incomingUnits);
                  } catch (e) {
                    incomingUnits = [];
                  }
                }

                if (Array.isArray(incomingUnits)) {
                  // Merge: keep existing units, update those that are in incoming
                  const mergedUnits = existingUnits.map((u) => {
                    const updated = incomingUnits.find((iu) => iu.id === u.id);
                    return updated ? { ...u, ...updated } : u;
                  });
                  // Add any new incoming units not in existing
                  incomingUnits.forEach((iu) => {
                    if (!mergedUnits.find((u) => u.id === iu.id)) {
                      mergedUnits.push(iu);
                    }
                  });
                  projectData.units_data = mergedUnits;
                }
              }
            }
            // Fallback for old units field
            else if (existingProject?.units?.length) {
              const incomingUnits = projectData.units || [];

              const mergedUnits = existingProject.units.map((u) => {
                const updated = incomingUnits.find((iu) => iu.id === u.id);
                return updated ? { ...u, ...updated } : u;
              });

              projectData.units = mergedUnits;
            }
          }

          savedProject = {
            ...mergedData,
            updatedAt: new Date().toISOString(),
            // Ensure source is set correctly
            source:
              mergedData.source ||
              (editingProjectId
                ? projects.find((p) => p.id === editingProjectId)?.source ||
                "local"
                : "server"),
          };

          if (editingProjectId) {
            // Check if it's a server project to use the update API
            if (savedProject.source === "server") {
              try {
                if (savedProject.type === PROJECT_TYPES.CUSTOM) {
                  // Gather all sub-project specific data into configuration
                  const subProjectKeys = [
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

                  const customConfiguration = {
                    ...(mergedData.configuration || {}),
                  };
                  subProjectKeys.forEach((key) => {
                    if (mergedData[key] !== undefined) {
                      customConfiguration[key] = mergedData[key];
                    }
                  });

                  await projectService.updateCustomProject(editingProjectId, {
                    ...mergedData,
                    subTypes: selectedCustomTypes,
                    configuration: customConfiguration,
                  });
                  alert("Custom project updated!");
                } else if (savedProject.type === "apartment" || savedProject.type === PROJECT_TYPES.APARTMENT) {
                  await projectService.updateApartment(editingProjectId, mergedData);
                } else if (savedProject.type === "commercial" || savedProject.type === PROJECT_TYPES.COMMERCIAL) {
                  await projectService.updateCommercial(editingProjectId, mergedData);
                } else if (savedProject.type === "plotting" || savedProject.type === PROJECT_TYPES.PLOTTING) {
                  await projectService.updatePlotting(editingProjectId, mergedData);
                } else if (savedProject.type === "duplex" || savedProject.type === PROJECT_TYPES.DUPLEX) {
                  await projectService.updateDuplex(editingProjectId, mergedData);
                } else if (savedProject.type === "triplex" || savedProject.type === PROJECT_TYPES.TRIPLEX) {
                  await projectService.updateTriplex(editingProjectId, mergedData);
                }
              } catch (apiError) {
                console.error(
                  "Failed to update project on server:",
                  apiError,
                );
                alert(
                  "Failed to update project on server. Updating locally.",
                );
              }
            }

            setProjects((prev) =>
              prev.map((p) => (p.id === editingProjectId ? savedProject : p)),
            );
            if (
              savedProject.source !== "server" ||
              savedProject.type !== PROJECT_TYPES.CUSTOM
            ) {
              alert("Project updated successfully!");
            }
          } else {
            setProjects((prev) => [savedProject, ...prev]);
            alert("Project saved successfully!");
          }
        } else {
          // Fallback for cases where ID is missing (should not happen with new child components)
          try {
            // Try to save to server first
            let serverResponse;
            switch (projectData.type) {
              case "apartment":
                serverResponse =
                  await projectService.createApartment(projectData);
                break;
              case "commercial":
                serverResponse =
                  await projectService.createCommercial(projectData);
                break;
              case "plotting":
                serverResponse =
                  await projectService.createPlotting(projectData);
                break;
              case "duplex":
                serverResponse = await projectService.createDuplex(projectData);
                break;
              case "triplex":
                serverResponse =
                  await projectService.createTriplex(projectData);
                break;
              case PROJECT_TYPES.CUSTOM:
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

                serverResponse = await projectService.createCustomProject({
                  ...projectData,
                  subTypes: selectedCustomTypes,
                  configuration: customConfigForCreate,
                });
                break;
              default:
                throw new Error("Unknown project type");
            }

            savedProject = {
              ...serverResponse,
              source: "server",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setProjects((prev) => [savedProject, ...prev]);
            alert("Project created and synced!");
          } catch (serverError) {
            console.warn(
              "Server not available or custom project:",
              serverError,
            );
            // Save locally if server fails or is custom
            savedProject = {
              ...projectData,
              id:
                projectData.id ||
                `PRJ-${Math.floor(100000 + Math.random() * 899999)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: "locally_saved",
              source: "local",
            };
            setProjects((prev) => [savedProject, ...prev]);
            alert("Project saved locally!");
          }
        }

        // Re-fetch projects to sync everything from the server instantly
        console.log("🔄 Save successful. Fetching latest projects...");
        loadAllProjects();
      } catch (error) {
        console.error("Error saving project:", error);
        alert(`Failed to save project: ${error.message}`);
      } finally {
        setLoading(false);
        resetForm();
        setShowForm(false);
        setOpenInOverview(false);
      }
    },
    [editingProjectId, resetForm, projects, loadAllProjects],
  );

  const deleteProject = useCallback(
    async (id, isBulkDelete = false) => {
      const projectToDelete = projects.find((p) => p.id === id);
      const isServerProject = projectToDelete?.source === "server";
      const projectName = projectToDelete?.name || "Unknown";

      const result = await Swal.fire({
        title: "Are you sure?",
        text: isBulkDelete
          ? "You won't be able to revert this bulk deletion!"
          : `Delete project "${projectName}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        background: "#fff",
        backdrop: "rgba(0,0,0,0.8)",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            if (isServerProject) {
              switch (projectToDelete.type) {
                case "apartment":
                  await projectService.deleteApartment(id);
                  break;
                case "commercial":
                  await projectService.deleteCommercial(id);
                  break;
                case "plotting":
                  await projectService.deletePlotting(id);
                  break;
                case "duplex":
                  await projectService.deleteDuplex(id);
                  break;
                case "triplex":
                  await projectService.deleteTriplex(id);
                  break;
                case PROJECT_TYPES.CUSTOM:
                  await projectService.deleteCustomProject(id);
                  break;
                default:
                  break;
              }
            }
            return true;
          } catch (error) {
            Swal.showValidationMessage(`Delete failed: ${error.message}`);
            throw error;
          }
        },
      });

      if (result.isConfirmed) {
        try {
          setProjects((prev) => {
            const updated = prev.filter((p) => String(p.id) !== String(id));
            console.log(
              `🗑️ Local state updated. Projects: ${prev.length} -> ${updated.length}`,
            );
            return updated;
          });

          if (expandedProject === id) setExpandedProject(null);
          if (selectedProjectForEditing?.id === id) {
            setSelectedProjectForEditing(null);
            setShowPlotEditingOverview(false);
          }

          // Remove from selected projects if present
          setSelectedProjects((prev) => prev.filter((pId) => pId !== id));

          await Swal.fire({
            title: "Deleted!",
            text: isServerProject
              ? "Project has been deleted "
              : "Project has been deleted locally.",
            icon: "success",
            confirmButtonColor: "#3085d6",
            timer: 2000,
            timerProgressBar: true,
          });
        } catch (error) {
          console.error("Error deleting project:", error);

          await Swal.fire({
            title: "Error!",
            text: "Failed to delete project. Removed from local view only.",
            icon: "error",
            confirmButtonColor: "#3085d6",
          });

          setProjects((prev) => {
            const updated = prev.filter((p) => String(p.id) !== String(id));
            console.log(
              `🗑️ Local state updated (retry). Projects: ${prev.length} -> ${updated.length}`,
            );
            return updated;
          });
        }
      }
    },
    [expandedProject, selectedProjectForEditing, projects],
  );

  const deleteMultipleProjects = useCallback(async () => {
    if (selectedProjects.length === 0) {
      Swal.fire({
        title: "No Selection",
        text: "Please select at least one project to delete.",
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete Multiple Projects?",
      html: `You are about to delete <strong>${selectedProjects.length}</strong> project(s).<br/><br/>
           This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: "rgba(0,0,0,0.8)",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const projectsToDelete = selectedProjects.map((id) => {
            const p = projects.find((proj) => String(proj.id) === String(id));
            return { id, type: p?.type, source: p?.source };
          });

          const serverProjects = projectsToDelete.filter(
            (p) => p.source === "server",
          );
          const localProjectsToDelete = projectsToDelete.filter(
            (p) => p.source !== "server",
          );

          const results = {
            success: localProjectsToDelete.map((p) => p.id),
            failed: [],
          };

          if (serverProjects.length > 0) {
            const response = await projectService.bulkDeleteProjects(
              serverProjects.map((p) => ({ id: p.id, type: p.type })),
            );

            if (response.success) {
              results.success.push(...response.data.deleted.map((p) => p.id));
              results.failed.push(...response.data.failed.map((p) => p.id));
            } else {
              throw new Error(response.message || "Bulk delete failed");
            }
          }

          return results;
        } catch (error) {
          Swal.showValidationMessage(`Bulk delete failed: ${error.message}`);
          throw error;
        }
      },
    });

    if (result.isConfirmed) {
      const { success, failed } = result.value;

      // Remove successful deletions from state
      setProjects((prev) => {
        const updated = prev.filter(
          (p) => !success.some((sId) => String(sId) === String(p.id)),
        );
        console.log(
          `🗑️ Bulk delete state updated. Projects: ${prev.length} -> ${updated.length}`,
        );
        return updated;
      });

      // Clear selections
      setSelectedProjects([]);
      setSelectAll(false);

      let message = "";
      if (failed.length === 0) {
        message = `Successfully deleted ${success.length} project(s).`;
      } else {
        message = `Deleted ${success.length} project(s). Failed to delete ${failed.length} project(s).`;
      }

      await Swal.fire({
        title: failed.length === 0 ? "Deleted!" : "Partial Success",
        html: message,
        icon: failed.length === 0 ? "success" : "warning",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  }, [projects, selectedProjects]);

  const toggleSelectProject = (projectId) => {
    setSelectedProjects((prev) => {
      const isSelected = prev.some((id) => String(id) === String(projectId));
      if (isSelected) {
        return prev.filter((id) => String(id) !== String(projectId));
      } else {
        return [...prev, String(projectId)];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => String(p.id)));
    }
    setSelectAll(!selectAll);
  };

  const editProject = useCallback(async (project, plotId = null) => {
    let projectToEdit = project;

    if (project.id) {
      try {
        Swal.fire({
          title: "Fetching project details...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        let freshProject = null;
        switch (project.type) {
          case "apartment":
            freshProject = await projectService.getApartmentById(project.id);
            break;
          case "commercial":
            freshProject = await projectService.getCommercialById(project.id);
            break;
          case "plotting":
            freshProject = await projectService.getPlottingById(project.id);
            break;
          case "duplex":
            freshProject = await projectService.getDuplexById(project.id);
            break;
          case "triplex":
            freshProject = await projectService.getTriplexById(project.id);
            break;
          case "custom":
            freshProject = await projectService.getCustomProjectById(project.id);
            break;
          default:
            break;
        }

        if (freshProject) {
          projectToEdit = { ...project, ...freshProject };
          setProjects(prev => prev.map(p => String(p.id) === String(project.id) ? projectToEdit : p));
        }
        Swal.close();
      } catch (error) {
        console.error("Error fetching project details from backend:", error);
        Swal.fire({
          icon: "error",
          title: "Fetch Failed",
          text: "Could not load latest project details. Using cached local data.",
          timer: 2000,
          showConfirmButton: false
        });
      }
    }

    console.log("Editing project data:", projectToEdit);
    console.log("Database fields received:");
    console.log("- revenue_plots:", projectToEdit.revenue_plots);
    console.log("- revenue_plots_data:", projectToEdit.revenue_plots_data);
    console.log("- plots_data:", projectToEdit.plots_data);
    console.log("- land_area:", projectToEdit.land_area);

    let updatedProject = { ...projectToEdit };

    // For custom projects, spread configuration back into the project object
    // so that sub-components can find their data (plots, units, etc.)
    if (updatedProject.type === PROJECT_TYPES.CUSTOM && updatedProject.configuration) {
      try {
        const config =
          typeof updatedProject.configuration === "string"
            ? JSON.parse(updatedProject.configuration)
            : updatedProject.configuration;
        updatedProject = { ...updatedProject, ...config };
        console.log("✅ Expanded custom project configuration:", config);
      } catch (e) {
        console.error("Failed to parse project configuration:", e);
      }
    }

    // 🔥 FIX: preserve existing units when editing
    if (updatedProject.units && Array.isArray(updatedProject.units)) {
      updatedProject = {
        ...updatedProject,
        units: updatedProject.units,
      };
    }

    setEditingProjectId(updatedProject.id);
    setProjectName(updatedProject.name || "");
    setProjectType(updatedProject.type || "");
    setCity(updatedProject.city || "");
    setLocality(updatedProject.locality || "");
    setLandZone(updatedProject.land_zone || "");

    // Set land area from database field
    setLandArea(updatedProject.land_area || updatedProject.landArea || "");

    // Set revenue plots from database field
    const revPlots = updatedProject.revenue_plots || updatedProject.revenuePlots || 0;
    setRevenuePlots(revPlots);

    // Parse plots_data from database (main plots array)
    let parsedPlots = [];
    const plotsToParse = updatedProject.plots_data || updatedProject.plots;
    if (plotsToParse) {
      try {
        if (typeof plotsToParse === "string") {
          parsedPlots = JSON.parse(plotsToParse);
        } else if (Array.isArray(plotsToParse)) {
          parsedPlots = plotsToParse;
        }
      } catch (error) {
        console.error("Error parsing plots_data:", error);
        parsedPlots = [];
      }
    }
    setParsedPlotsData(parsedPlots);

    // Parse revenue_plots_data from database (revenue plots array)
    let parsedRevenuePlots = [];
    const revPlotsToParse =
      updatedProject.revenue_plots_data ||
      updatedProject.plotsData ||
      updatedProject.revenuePlotsData;
    if (revPlotsToParse) {
      try {
        if (typeof revPlotsToParse === "string") {
          parsedRevenuePlots = JSON.parse(revPlotsToParse);
        } else if (Array.isArray(revPlotsToParse)) {
          parsedRevenuePlots = revPlotsToParse;
        }
      } catch (error) {
        console.error("Error parsing revenue_plots_data:", error);
        parsedRevenuePlots = [];
      }
    }
    setParsedRevenuePlotsData(parsedRevenuePlots);

    setAddRevenuePlotNumber(updatedProject.addRevenuePlotNumber || "");
    setAttachment(updatedProject.attachment || null);

    // Set plot ID if provided (for editing specific plot)
    if (plotId) {
      setEditingPlotId(plotId);
    }

    if (updatedProject.type === PROJECT_TYPES.CUSTOM) {
      // Ensure configuration is expanded if not already
      if (updatedProject.configuration && !updatedProject.subTypes && !updatedProject.sub_types) {
        try {
          const config =
            typeof updatedProject.configuration === "string"
              ? JSON.parse(updatedProject.configuration)
              : updatedProject.configuration;
          updatedProject = { ...updatedProject, ...config };
        } catch (e) {
          console.error("Failed to parse config in editProject:", e);
        }
      }

      let customTypes =
        updatedProject.subTypes ||
        updatedProject.sub_types ||
        updatedProject.custom_selected_types ||
        updatedProject.custom_types ||
        [];

      if (typeof customTypes === "string") {
        try {
          customTypes = JSON.parse(customTypes);
        } catch {
          customTypes = [];
        }
      }

      const finalCustomTypes = Array.isArray(customTypes) ? customTypes : [];
      setSelectedCustomTypes(finalCustomTypes);
      setCurrentCustomType(finalCustomTypes[0] || null);

      setProjectType(PROJECT_TYPES.CUSTOM);
      setShowCustomizeSelect(false);
    }

    // Apartment: open directly in units tab and load existing data
    if (updatedProject.type === PROJECT_TYPES.APARTMENT) {
      setSelectedProject(updatedProject); // Pass full project to ApartmentProject
      setOpenInOverview(true); // Ensures ApartmentProject opens in units tab
      setShowForm(true);
      return;
    }

    setSelectedProject(updatedProject); // Set selectedProject for other project types
    setOpenInOverview(true);
    setShowForm(true);
  }, []);

  const handleViewProject = useCallback((project) => {
    setViewProjectData(project);
    setViewProjectId(project.id);
    setEditingProjectId(project.id);
    setSelectedProject(project);
  }, []);

  const closeViewProject = useCallback(() => {
    setViewProjectId(null);
    setViewProjectData(null);
  }, []);

  const toggleProjectExpansion = useCallback(
    (id) => {
      setExpandedProject(expandedProject === id ? null : id);
    },
    [expandedProject],
  );

  const handleProjectTypeChange = (e) => {
    const newType = e.target.value;
    setProjectType(newType);
    setShowCustomizeSelect(newType === PROJECT_TYPES.CUSTOM);
  };

  const handleCustomizeTypeSelect = (payload) => {
    // payload = { projectType, customTypes, status }

    const typesArray = Array.isArray(payload.customTypes)
      ? payload.customTypes
      : [];
    setSelectedCustomTypes(typesArray);
    setCurrentCustomType(payload.activeType || typesArray[0] || null);
    setShowCustomizeSelect(false);
    setProjectType(PROJECT_TYPES.CUSTOM);
  };

  const exportAllProjectsToExcel = () => {
    if (projects.length === 0) {
      alert("No projects to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(projects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Projects");
    XLSX.writeFile(
      wb,
      `All_Projects_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Open Plot Editing Overview for a project
  const openPlotEditingOverview = (project) => {
    setSelectedProjectForEditing(project);

    // Get all plots from the project
    let projectPlots = [];
    if (project.plots_data) {
      try {
        if (typeof project.plots_data === "string") {
          projectPlots = JSON.parse(project.plots_data);
        } else if (Array.isArray(project.plots_data)) {
          projectPlots = project.plots_data;
        }
      } catch (error) {
        console.error("Error parsing plots_data for overview:", error);
        projectPlots = [];
      }
    }

    setEditingPlots(projectPlots);
    setShowPlotEditingOverview(true);
  };

  const openCommercialEditingOverview = (project) => {
    setCommercialOverviewProject(project);

    let units = [];
    if (project.units_data) {
      try {
        units =
          typeof project.units_data === "string"
            ? JSON.parse(project.units_data)
            : project.units_data;
      } catch (e) {
        console.error("Failed to parse commercial units_data", e);
        units = [];
      }
    }

    setCommercialOverviewUnits(units);
    setShowCommercialEditingOverview(true);
  };

  const openUnitEditingOverview = (project) => {
    setUnitOverviewProject(project);

    let units = [];
    if (project.units_data) {
      try {
        units =
          typeof project.units_data === "string"
            ? JSON.parse(project.units_data)
            : project.units_data;
      } catch (e) {
        units = [];
      }
    }

    setUnitOverviewUnits(units);
    setShowUnitEditingOverview(true);
  };

  const openCustomEditingOverview = (project) => {
    setCustomOverviewProject(project);

    // Expand configuration first if needed
    let expandedProject = { ...project };
    if (project.configuration) {
      try {
        const config =
          typeof project.configuration === "string"
            ? JSON.parse(project.configuration)
            : project.configuration;
        expandedProject = { ...project, ...config };
      } catch (e) {
        console.error("Failed to parse config in overview:", e);
      }
    }

    let customTypes =
      expandedProject.subTypes ||
      expandedProject.sub_types ||
      expandedProject.custom_selected_types ||
      expandedProject.custom_types ||
      [];

    if (typeof customTypes === "string") {
      try {
        customTypes = JSON.parse(customTypes);
      } catch {
        customTypes = [];
      }
    }

    const parse = (data) => {
      if (!data) return [];
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        return [];
      }
    };

    const customData = {};

    customTypes.forEach((type) => {
      let items = [];

      if (type === "plotting") {
        items = parse(expandedProject.plots_data || expandedProject.plots);
      }

      if (type === "duplex" || type === "triplex" || type === "commercial") {
        items = parse(
          expandedProject.units_data || expandedProject.units,
        ).filter((u) => u.projectType === type || u.type === type);
      }

      if (type === "apartment") {
        const blocks = parse(
          expandedProject.blocks_data || expandedProject.blocks,
        );
        items = blocks.flatMap((b) =>
          parse(b.units_data || b.units || []).flat(),
        );
      }

      customData[type] = {
        items,
        count: items.length,
        edited: items.filter((i) => i.lastSaved).length,
        complete: items.length > 0 && items.every((i) => i.isComplete),
      };
    });

    setCustomOverviewData(customData);
    setShowCustomEditingOverview(true);
  };

  // Navigate to edit a specific plot from overview
  const navigateToPlotEditFromOverview = (plotId) => {
    if (!selectedProjectForEditing) return;

    setShowPlotEditingOverview(false);
    editProject(selectedProjectForEditing, plotId);
  };

  // Complete editing for all plots in a project
  const completeAllPlotEditing = () => {
    if (!selectedProjectForEditing) return;

    const updatedProjects = projects.map((project) => {
      if (project.id === selectedProjectForEditing.id) {
        // Parse existing plots
        let existingPlots = [];
        if (project.plots_data) {
          try {
            if (typeof project.plots_data === "string") {
              existingPlots = JSON.parse(project.plots_data);
            } else if (Array.isArray(project.plots_data)) {
              existingPlots = project.plots_data;
            }
          } catch (error) {
            console.error("Error parsing plots_data:", error);
            existingPlots = [];
          }
        }

        // Mark all plots as not being edited
        const updatedPlots = existingPlots.map((plot) => ({
          ...plot,
          isBeingEdited: false,
        }));

        return {
          ...project,
          plots_data: JSON.stringify(updatedPlots),
          updated_at: new Date().toISOString(),
        };
      }
      return project;
    });

    setProjects(updatedProjects);
    setShowPlotEditingOverview(false);
    setSelectedProjectForEditing(null);
    alert("All plot editing completed!");
  };

  const completeAllUnitEditing = () => {
    if (!unitOverviewProject) return;

    const updatedProjects = projects.map((project) => {
      if (project.id === unitOverviewProject.id) {
        let existingUnits = [];
        if (project.units_data) {
          try {
            if (typeof project.units_data === "string") {
              existingUnits = JSON.parse(project.units_data);
            } else if (Array.isArray(project.units_data)) {
              existingUnits = project.units_data;
            }
          } catch (error) {
            existingUnits = [];
          }
        }

        const updatedUnits = existingUnits.map((unit) => ({
          ...unit,
          isBeingEdited: false,
        }));

        return {
          ...project,
          units_data: JSON.stringify(updatedUnits),
          updated_at: new Date().toISOString(),
        };
      }
      return project;
    });

    setProjects(updatedProjects);
    setShowUnitEditingOverview(false);
    setUnitOverviewProject(null);
    alert("All unit editing completed!");
  };

  const completeAllApartmentEditing = () => {
    if (!apartmentOverviewProject) return;

    const updatedProjects = projects.map((project) => {
      if (project.id === apartmentOverviewProject.id) {
        let existingBlocks = [];
        if (project.blocks_data) {
          try {
            if (typeof project.blocks_data === "string") {
              existingBlocks = JSON.parse(project.blocks_data);
            } else if (Array.isArray(project.blocks_data)) {
              existingBlocks = project.blocks_data;
            }
          } catch (error) {
            existingBlocks = [];
          }
        }

        const updatedBlocks = existingBlocks.map((block) => {
          const updatedFloors = Array.isArray(block.floors) ? block.floors.map(floor => {
            const updatedUnits = Array.isArray(floor.units) ? floor.units.map(unit => ({
              ...unit,
              isBeingEdited: false
            })) : [];
            return { ...floor, units: updatedUnits };
          }) : [];
          return { ...block, floors: updatedFloors };
        });

        return {
          ...project,
          blocks_data: JSON.stringify(updatedBlocks),
          updated_at: new Date().toISOString(),
        };
      }
      return project;
    });

    setProjects(updatedProjects);
    setShowApartmentOverview(false);
    setApartmentOverviewProject(null);
    alert("All apartment editing completed!");
  };

  // Render Plot Editing Overview
  const renderPlotEditingOverview = () => {
    if (!selectedProjectForEditing) return null;

    const project = selectedProjectForEditing;
    const projectPlots = editingPlots;

    // Calculate statistics
    const stats = {
      total: projectPlots.length,
      beingEdited: projectPlots.filter((p) => p.isBeingEdited).length,
      saved: projectPlots.filter((p) => p.lastSaved && !p.isBeingEdited).length,
      notEdited: projectPlots.filter((p) => !p.lastSaved && !p.isBeingEdited)
        .length,
      complete: projectPlots.filter((p) => p.isComplete).length,
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 z-10">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FaTable className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Plot Editing Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Project:{" "}
                      <span className="font-semibold">{project.name}</span>
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </div>
                    <div className="text-xs text-gray-500">Total Plots</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-blue-700">
                      {stats.beingEdited}
                    </div>
                    <div className="text-xs text-blue-600">Being Edited</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-emerald-700">
                      {stats.saved}
                    </div>
                    <div className="text-xs text-emerald-600">Saved</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-amber-700">
                      {stats.notEdited}
                    </div>
                    <div className="text-xs text-amber-600">Not Edited</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-purple-700">
                      {stats.complete}
                    </div>
                    <div className="text-xs text-purple-600">Complete</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={completeAllPlotEditing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <FaCheck className="mr-2" />
                  Complete All Editing
                </button>
                <button
                  onClick={() => setShowPlotEditingOverview(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Plots Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Plot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Area Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Saved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Completion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projectPlots.map((plot) => (
                      <tr
                        key={plot.id}
                        className={`hover:bg-gray-50 transition-colors ${plot.isBeingEdited
                            ? "bg-blue-50"
                            : plot.lastSaved
                              ? "bg-emerald-50"
                              : "bg-gray-50/30"
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${plot.isBeingEdited
                                    ? "bg-blue-100"
                                    : plot.lastSaved
                                      ? "bg-emerald-100"
                                      : "bg-gray-200"
                                  }`}
                              >
                                <FaTable
                                  className={`h-5 w-5 ${plot.isBeingEdited
                                      ? "text-blue-600"
                                      : plot.lastSaved
                                        ? "text-emerald-600"
                                        : "text-gray-400"
                                    }`}
                                />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div
                                className={`text-sm font-medium ${plot.isBeingEdited
                                    ? "text-blue-900 font-bold"
                                    : plot.lastSaved
                                      ? "text-gray-900"
                                      : "text-gray-500 italic"
                                  }`}
                              >
                                {plot.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {plot.isCornerPlot
                                  ? "Corner Plot"
                                  : "Regular Plot"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`text-sm ${plot.areaDetails?.plotArea
                                ? "text-gray-900"
                                : "text-gray-500 italic"
                              }`}
                          >
                            {plot.areaDetails?.plotArea
                              ? `${plot.areaDetails.plotArea} sq-yd`
                              : "Not set"}
                          </div>
                          {plot.areaDetails?.plotLength &&
                            plot.areaDetails?.plotBreadth && (
                              <div className="text-xs text-gray-500">
                                {plot.areaDetails.plotLength} ×{" "}
                                {plot.areaDetails.plotBreadth} yd
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`text-sm ${plot.priceDetails?.expectedPrice
                                ? "text-gray-900"
                                : "text-gray-500 italic"
                              }`}
                          >
                            {plot.priceDetails?.expectedPrice
                              ? `₹${parseInt(plot.priceDetails.expectedPrice).toLocaleString()}`
                              : "Not set"}
                          </div>
                          {plot.priceDetails?.tokenAmount && (
                            <div className="text-xs text-gray-500">
                              Token: ₹
                              {parseInt(
                                plot.priceDetails.tokenAmount,
                              ).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${plot.isBeingEdited
                                  ? "bg-blue-100 text-blue-800"
                                  : plot.lastSaved
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-500 italic"
                                }`}
                            >
                              {plot.isBeingEdited
                                ? "Being Edited"
                                : plot.lastSaved
                                  ? "Saved"
                                  : "Not Edited"}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {getPossessionStatus(plot)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {plot.lastSaved
                            ? new Date(plot.lastSaved).toLocaleDateString() +
                            " " +
                            new Date(plot.lastSaved).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "Never"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {plot.isComplete ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                                <FaCheckCircle className="mr-1" />
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                                <FaTimesCircle className="mr-1" />
                                In Progress
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                navigateToPlotEditFromOverview(plot.id)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit this plot"
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={() => {
                                alert(
                                  `Plot Details:\n\nName: ${plot.name}\nArea: ${plot.areaDetails?.plotArea || "N/A"} sq-yd\nPrice: ${plot.priceDetails?.expectedPrice || "N/A"}\nPurchaser: ${plot.purchaser || "N/A"}\nConstructor: ${plot.constructor || "N/A"}\nStatus: ${plot.isComplete ? "Complete" : "In Progress"}\nLast Edited: ${plot.lastSaved || "Never"}`,
                                );
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {projectPlots.length === 0 && (
                <div className="py-12 text-center">
                  <FaTable className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Plots Created
                  </h3>
                  <p className="text-gray-500">
                    This project doesn't have any plots yet.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {projectPlots.length} plot(s)
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPlotEditingOverview(false);
                    editProject(project);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Project
                </button>
                <button
                  onClick={completeAllPlotEditing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <FaCheck className="mr-2" />
                  Complete All Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUnitEditingOverview = () => {
    if (!unitOverviewProject) return null;

    const units = unitOverviewUnits || [];

    const stats = {
      total: units.length,
      beingEdited: units.filter((u) => u.isBeingEdited).length,
      saved: units.filter((u) => u.lastSaved && !u.isBeingEdited).length,
      notEdited: units.filter((u) => !u.lastSaved && !u.isBeingEdited).length,
      complete: units.filter((u) => getPossessionStatus(u) === "Completed").length,
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
          {/* HEADER */}
          <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 z-10">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FaHome className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Unit Editing Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Project: <span className="font-semibold">{unitOverviewProject.name}</span>
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-500">Total Units</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-blue-700">{stats.beingEdited}</div>
                    <div className="text-xs text-blue-600">Being Edited</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-emerald-700">{stats.saved}</div>
                    <div className="text-xs text-emerald-600">Saved</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-amber-700">{stats.notEdited}</div>
                    <div className="text-xs text-amber-600">Not Edited</div>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-indigo-700">{stats.complete}</div>
                    <div className="text-xs text-indigo-600">Complete</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={completeAllUnitEditing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <FaCheck className="mr-2" />
                  Complete All Editing
                </button>
                <button
                  onClick={() => setShowUnitEditingOverview(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="p-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Last Edited
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                              {unit.unitNo ? unit.unitNo.charAt(0) : unit.name ? unit.name.charAt(0) : "U"}
                            </div>
                            <div className="font-medium text-gray-900">
                              {unit.unitNo || unit.name || "Unnamed Unit"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${unit.isBeingEdited
                                  ? "bg-blue-100 text-blue-800"
                                  : unit.lastSaved
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-500 italic"
                                }`}
                            >
                              {unit.isBeingEdited
                                ? "Being Edited"
                                : unit.lastSaved
                                  ? "Saved"
                                  : "Not Edited"}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {getPossessionStatus(unit)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {unit.lastSaved
                            ? new Date(unit.lastSaved).toLocaleDateString() +
                            " " +
                            new Date(unit.lastSaved).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setShowUnitEditingOverview(false);
                              editProject(unitOverviewProject, unit.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Unit"
                          >
                            <FaPen />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {units.length === 0 && (
                <div className="py-12 text-center">
                  <FaTable className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Units Created
                  </h3>
                  <p className="text-gray-500">
                    This project doesn't have any units yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApartmentEditingOverview = () => {
    if (!apartmentOverviewProject) return null;

    const project = apartmentOverviewProject;
    const blocks = apartmentOverviewBlocks;

    // Calculate statistics
    const allUnits = blocks.flatMap((block) => {
      let units = [];
      if (block.units_data) {
        try {
          units =
            typeof block.units_data === "string"
              ? JSON.parse(block.units_data)
              : block.units_data;
        } catch {
          units = [];
        }
      } else if (Array.isArray(block.floors)) {
        units = block.floors.flatMap((floor) => floor.units || []);
      }
      return Array.isArray(units) ? units : [];
    });

    const stats = {
      totalBlocks: blocks.length,
      totalUnits: allUnits.length,
      beingEdited: allUnits.filter((u) => u.isBeingEdited).length,
      saved: allUnits.filter((u) => u.lastSaved && !u.isBeingEdited).length,
      notEdited: allUnits.filter((u) => !u.lastSaved && !u.isBeingEdited)
        .length,
      complete: allUnits.filter((u) => getPossessionStatus(u) === "Completed").length,
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 z-10">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FaBuilding className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Apartment Editing Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Project:{" "}
                      <span className="font-semibold">{project.name}</span>
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalBlocks}
                    </div>
                    <div className="text-xs text-gray-500">Total Blocks</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-purple-700">
                      {stats.totalUnits}
                    </div>
                    <div className="text-xs text-purple-600">Total Units</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-blue-700">
                      {stats.beingEdited}
                    </div>
                    <div className="text-xs text-blue-600">Being Edited</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-emerald-700">
                      {stats.saved}
                    </div>
                    <div className="text-xs text-emerald-600">Saved</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-amber-700">
                      {stats.notEdited}
                    </div>
                    <div className="text-xs text-amber-600">Not Edited</div>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-indigo-700">
                      {stats.complete}
                    </div>
                    <div className="text-xs text-indigo-600">Complete</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={completeAllApartmentEditing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <FaCheck className="mr-2" />
                  Complete All Editing
                </button>
                <button
                  onClick={() => setShowApartmentOverview(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Blocks & Units Grid */}
            <div className="space-y-6">
              {blocks.map((block) => {
                let blockUnits = [];

                // Extract units from block
                if (block.units_data) {
                  try {
                    blockUnits =
                      typeof block.units_data === "string"
                        ? JSON.parse(block.units_data)
                        : block.units_data;
                  } catch {
                    blockUnits = [];
                  }
                } else if (Array.isArray(block.floors)) {
                  blockUnits = block.floors.flatMap(
                    (floor) => floor.units || [],
                  );
                }

                if (!Array.isArray(blockUnits)) blockUnits = [];

                const blockStats = {
                  total: blockUnits.length,
                  beingEdited: blockUnits.filter((u) => u.isBeingEdited).length,
                  saved: blockUnits.filter(
                    (u) => u.lastSaved && !u.isBeingEdited,
                  ).length,
                  notEdited: blockUnits.filter(
                    (u) => !u.lastSaved && !u.isBeingEdited,
                  ).length,
                  complete: blockUnits.filter((u) => u.isComplete).length,
                };

                return (
                  <div
                    key={block.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                  >
                    {/* Block Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <FaBuilding className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              Block {block.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {block.floors?.length || 0} floors •{" "}
                              {blockStats.total} units
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {blockStats.beingEdited > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {blockStats.beingEdited} editing
                            </span>
                          )}
                          {blockStats.saved > 0 && (
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                              {blockStats.saved} saved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Units Grid */}
                    <div className="p-6">
                      {blockUnits.length === 0 ? (
                        <div className="text-center py-8">
                          <FaDoorClosed className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-gray-500">
                            No units in this block
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          {blockUnits.map((unit) => (
                            <div
                              key={unit.id}
                              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${unit.isBeingEdited
                                  ? "border-blue-300 bg-blue-50"
                                  : unit.lastSaved
                                    ? "border-emerald-200 bg-emerald-50"
                                    : "border-gray-200 bg-gray-50 opacity-70"
                                }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`p-2 rounded-lg ${unit.isBeingEdited
                                        ? "bg-blue-100"
                                        : unit.lastSaved
                                          ? "bg-emerald-100"
                                          : "bg-gray-100"
                                      }`}
                                  >
                                    <FaHome
                                      className={`h-4 w-4 ${unit.isBeingEdited
                                          ? "text-blue-600"
                                          : unit.lastSaved
                                            ? "text-emerald-600"
                                            : "text-gray-400"
                                        }`}
                                    />
                                  </div>
                                  <div>
                                    <div
                                      className={`font-medium ${unit.isBeingEdited
                                          ? "text-blue-900"
                                          : unit.lastSaved
                                            ? "text-gray-900"
                                            : "text-gray-500"
                                        }`}
                                    >
                                      {unit.unitNo || unit.name || "Unit"}
                                    </div>
                                    {unit.type && (
                                      <div className="text-xs text-gray-500">
                                        {unit.type}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${unit.isBeingEdited
                                      ? "bg-blue-100 text-blue-800"
                                      : unit.lastSaved
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-gray-100 text-gray-500 italic"
                                    }`}
                                >
                                  {unit.isBeingEdited
                                    ? "Editing"
                                    : unit.lastSaved
                                      ? "Saved"
                                      : "Not Edited"}
                                </span>
                              </div>

                              {/* Unit Details */}
                              <div className="space-y-2">
                                {(unit.area ||
                                  unit.area_details?.carpet_area) && (
                                    <div className="text-sm text-gray-600">
                                      Area:{" "}
                                      {unit.area ||
                                        unit.area_details?.carpet_area}{" "}
                                      sqft
                                    </div>
                                  )}
                                <div className="text-sm text-gray-600">
                                  Status: {getPossessionStatus(unit)}
                                </div>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${unit.isBeingEdited
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : unit.lastSaved
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                                  onClick={() => {
                                    setShowApartmentOverview(false);
                                    editProject(project, unit.id);
                                  }}
                                >
                                  {unit.isBeingEdited
                                    ? "Continue Editing"
                                    : "Edit Unit"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing {stats.totalUnits} unit(s) across {stats.totalBlocks}{" "}
                block(s)
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApartmentOverview(false);
                    editProject(project);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Project Details
                </button>
                <button
                  onClick={() => setShowApartmentOverview(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Close Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCommercialEditingOverview = () => {
    if (!commercialOverviewProject) return null;

    const units = commercialOverviewUnits;

    const stats = {
      total: units.length,
      beingEdited: units.filter((u) => u.isBeingEdited).length,
      saved: units.filter((u) => u.lastSaved && !u.isBeingEdited).length,
      notEdited: units.filter((u) => !u.lastSaved && !u.isBeingEdited).length,
      complete: units.filter((u) => getPossessionStatus(u) === "Completed").length,
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
          {/* HEADER */}
          <div className="sticky top-0 bg-white border-b p-6 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Commercial Editing Overview — {commercialOverviewProject.name}
              </h2>
              <button onClick={() => setShowCommercialEditingOverview(false)}>
                <FaTimes />
              </button>
            </div>

            {/* STATS */}
            {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <Stat label="Total Units" value={stats.total} />
            <Stat label="Being Edited" value={stats.beingEdited} color="blue" />
            <Stat label="Saved" value={stats.saved} color="emerald" />
            <Stat label="Not Edited" value={stats.notEdited} color="amber" />
            <Stat label="Complete" value={stats.complete} color="purple" />
          </div> */}
          </div>

          {/* TABLE */}
          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">
                    Floor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{unit.name}</td>
                    <td className="px-6 py-4">{unit.floor}</td>
                    <td className="px-6 py-4">{unit.roomType}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${unit.isBeingEdited
                              ? "bg-blue-100 text-blue-800"
                              : unit.lastSaved
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-500 italic"
                            }`}
                        >
                          {unit.isBeingEdited
                            ? "Being Edited"
                            : unit.lastSaved
                              ? "Saved"
                              : "Not Edited"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {getPossessionStatus(unit)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setShowCommercialEditingOverview(false);
                          editProject(commercialOverviewProject, unit.id);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FaPen />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomEditingOverview = () => {
    if (!customOverviewProject) return null;

    const project = customOverviewProject;
    const customTypes = project.custom_selected_types || [];

    // Calculate overall statistics
    const totalItems = Object.values(customOverviewData).reduce(
      (sum, type) => sum + type.count,
      0,
    );
    const totalEdited = Object.values(customOverviewData).reduce(
      (sum, type) => sum + type.edited,
      0,
    );

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 z-10">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaLayerGroup className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Custom Project Editing Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Project:{" "}
                      <span className="font-semibold">{project.name}</span>
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {customTypes.length}
                    </div>
                    <div className="text-xs text-gray-500">Types Selected</div>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-indigo-700">
                      {totalItems}
                    </div>
                    <div className="text-xs text-indigo-600">Total Items</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-emerald-700">
                      {totalEdited}
                    </div>
                    <div className="text-xs text-emerald-600">Items Edited</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-purple-700">
                      {totalItems > 0
                        ? Math.round((totalEdited / totalItems) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-purple-600">Progress</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCustomEditingOverview(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaExclamationCircle className="text-blue-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    About Custom Projects
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    This custom project contains multiple property types. You
                    can edit each type's items and track the editing progress
                    below.
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {customTypes.map((type) => (
                      <li key={type} className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></div>
                        <span className="capitalize">{type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Types Grid */}
            <div className="space-y-6">
              {customTypes.map((type) => {
                const typeData = customOverviewData[type] || {
                  items: [],
                  count: 0,
                  edited: 0,
                };
                const percentage =
                  typeData.count > 0
                    ? Math.round((typeData.edited / typeData.count) * 100)
                    : 0;

                return (
                  <div
                    key={type}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition"
                    onClick={() => {
                      setShowCustomEditingOverview(false);
                      editProject(project); // 🔥 loads everything correctly
                      setCurrentCustomType(type); // switch to clicked subtype
                    }}
                  >
                    {/* Type Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <FaBuilding className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 capitalize">
                              {type}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {typeData.count} item(s) •{" "}
                              <span className="font-semibold">
                                {typeData.edited}
                              </span>{" "}
                              edited
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Progress Bar */}
                          <div className="flex items-center gap-2 min-w-37.5">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-6">
                      {typeData.items.length === 0 ? (
                        <div className="text-center py-8">
                          <FaDatabase className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-gray-500">
                            No items added for this type yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {typeData.items.map((item) => (
                            <div
                              key={item.id}
                              className={`p-4 rounded-lg border transition-all flex items-center justify-between ${item.isBeingEdited || item.lastSaved
                                  ? "border-emerald-200 bg-emerald-50"
                                  : "border-gray-200 bg-gray-50 opacity-70"
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`p-2 rounded-lg ${item.isBeingEdited || item.lastSaved
                                      ? "bg-emerald-100"
                                      : "bg-gray-100"
                                    }`}
                                >
                                  <FaCheck
                                    className={`h-4 w-4 ${item.isBeingEdited || item.lastSaved
                                        ? "text-emerald-600"
                                        : "text-gray-400"
                                      }`}
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {item.name || item.id || `${type} Item`}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-gray-500">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full ${item.isBeingEdited || item.lastSaved
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-500"
                                  }`}
                              >
                                {item.isBeingEdited
                                  ? "Editing"
                                  : item.lastSaved
                                    ? "Saved"
                                    : "Not Started"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {totalItems} total items across {customTypes.length} type(s)
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCustomEditingOverview(false);
                    editProject(project);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center font-medium"
                >
                  <FaEdit className="mr-2" />
                  Edit Project
                </button>
                <button
                  onClick={() => setShowCustomEditingOverview(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center font-medium"
                >
                  <FaTimes className="mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //   const renderEditingOverview = () => {
  //   if (!editingOverview.open) return null;

  //   const { project, type, items } = editingOverview;

  //   return (
  //     <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start p-6 overflow-y-auto">
  //       <div className="bg-white w-full max-w-6xl rounded-xl shadow-xl">

  //         {/* Header */}
  //         <div className="flex justify-between items-center p-6 border-b">
  //           <h2 className="text-xl font-bold">
  //             {type.toUpperCase()} Editing Overview — {project.name}
  //           </h2>
  //           <button onClick={() => setEditingOverview({ open: false })}>
  //             <FaTimes />
  //           </button>
  //         </div>

  //         {/* Body */}
  //         <div className="p-6 space-y-4">

  //           {items.map(item => {
  //             const isEditing = item.isBeingEdited;
  //             const isSaved = item.lastSaved;

  //             return (
  //               <div
  //                 key={item.id}
  //                 className={`p-4 rounded-lg flex justify-between items-center
  //                   ${isEditing
  //                     ? "bg-blue-50"
  //                     : isSaved
  //                       ? "bg-emerald-50"
  //                       : "bg-slate-100 opacity-70 italic blur-[0.4px]"
  //                   }`}
  //               >
  //                 <div>
  //                   <div className="font-semibold">
  //                     {item.name || item.unitNo || item.blockName}
  //                   </div>
  //                   <div className="text-xs text-slate-500">
  //                     {isEditing ? "Being edited" : isSaved ? "Saved" : "Not edited"}
  //                   </div>
  //                 </div>

  //                 <button
  //                   className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
  //                   onClick={() => {
  //                     setEditingOverview({ open: false });
  //                     editProject(project, item.id);
  //                   }}
  //                 >
  //                   Edit
  //                 </button>
  //               </div>
  //             );
  //           })}

  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const renderProjectForm = () => {
    if (showCustomizeSelect) {
      return (
        <div className="p-8">
          {/* <CustomProject */}
          <CustomizeSelect
            initialSelected={selectedCustomTypes}
            onBack={() => setShowCustomizeSelect(false)}
            onSelectType={handleCustomizeTypeSelect}
            onClose={() => {
              resetForm();
              setShowForm(false);
            }}
            completionStatus={(() => {
              const editingProject = projects.find(
                (p) => p.id === editingProjectId,
              );
              if (!editingProject) return {};

              const parse = (data) => {
                if (!data) return [];
                try {
                  return typeof data === "string" ? JSON.parse(data) : data;
                } catch {
                  return [];
                }
              };

              const status = {};

              selectedCustomTypes.forEach((type) => {
                if (type === "plotting") {
                  const plots = parse(editingProject.plots_data);
                  status.plotting =
                    plots.length > 0 && plots.every((p) => p.isComplete);
                }

                if (
                  type === "duplex" ||
                  type === "triplex" ||
                  type === "commercial"
                ) {
                  const units = parse(editingProject.units_data).filter(
                    (u) => u.projectType === type || u.type === type,
                  );

                  status[type] =
                    units.length > 0 && units.every((u) => u.isComplete);
                }

                if (type === "apartment") {
                  const blocks = parse(editingProject.blocks_data);
                  const units = blocks.flatMap((b) =>
                    parse(b.units_data || []).flat(),
                  );

                  status.apartment =
                    units.length > 0 && units.every((u) => u.isComplete);
                }
              });

              return status;
            })()}
          />
        </div>
      );
    }

    let selectedProjectVal = editingProjectId
      ? projects.find((p) => p.id === editingProjectId)
      : null;

    // Expand configuration for custom projects so nested data is available to sub-components
    if (
      selectedProjectVal &&
      selectedProjectVal.type === PROJECT_TYPES.CUSTOM &&
      selectedProjectVal.configuration
    ) {
      try {
        const config =
          typeof selectedProjectVal.configuration === "string"
            ? JSON.parse(selectedProjectVal.configuration)
            : selectedProjectVal.configuration;
        selectedProjectVal = { ...selectedProjectVal, ...config };
      } catch (e) {
        console.error(
          "Failed to expand custom configuration in renderProjectForm:",
          e,
        );
      }
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
      editingProjectId,
      selectedProject: selectedProjectVal,
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
      selectedProject: selectedProjectVal,

      initialUnits: selectedProjectVal?.units_data
        ? typeof selectedProjectVal.units_data === "string"
          ? JSON.parse(selectedProjectVal.units_data)
          : selectedProjectVal.units_data
        : [],
      showUnitOverviewOnLoad: !!editingProjectId,

      // ✅ ADD THIS (THIS IS ALL YOU NEED)
      onClose: () => {
        resetForm();
        setShowForm(false);
        setEditingProjectId(null);
      },
    };

    // Pass all parsed data to PlottingProject
    const plottingProps = {
      ...commonProps,
      editingPlotId,
      selectedProject: selectedProjectVal,
      // Pass parsed database data
      initialLandArea: landArea,
      initialRevenuePlots: revenuePlots,
      initialParsedPlotsData: parsedPlotsData, // Main plots array
      initialParsedRevenuePlotsData: parsedRevenuePlotsData, // Revenue plots array
      initialTab: editingProjectId ? "plots" : "project-info",

      // ✅ ADD THIS
      onClose: () => {
        resetForm();
        setShowForm(false);
        setEditingProjectId(null);
      },
    };

    if (
      projectType === PROJECT_TYPES.CUSTOM &&
      selectedCustomTypes.length > 0
    ) {
      return (
        <div className="relative space-y-4 p-6">
          {/* ❌ Close Custom Editing */}
          {/* <button
            onClick={() => {
              resetForm();
              setShowForm(false);
            }}
            className="absolute top-4 right-4 z-50
                 w-10 h-10 rounded-full
                 bg-white shadow-md
                 flex items-center justify-center
                 text-slate-500 hover:text-rose-600
                 hover:bg-rose-50 transition"
            title="Back to Project List"
          >
            <FaTimes size={18} />
          </button> */}
          <div className="flex gap-2 flex-wrap">
            {selectedCustomTypes.map((type) => (
              <button
                key={type}
                onClick={() => setCurrentCustomType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currentCustomType === type
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
            {(() => {
              // In custom projects, we pass the expanded selectedProjectVal to the sub-component
              const subtypeProject = selectedProjectVal;

              if (currentCustomType === "plotting") {
                return (
                  <PlottingProject
                    {...plottingProps}
                    selectedProject={subtypeProject}
                    isSubtype={true}
                  />
                );
              } else if (
                currentCustomType === "duplex" ||
                currentCustomType === "triplex"
              ) {
                return (
                  <DuplexTriplexProject
                    {...duplexTriplexProps}
                    projectType={currentCustomType}
                    selectedProject={subtypeProject}
                    isSubtype={true}
                  />
                );
              } else if (currentCustomType === "apartment") {
                return (
                  <ApartmentProject
                    {...commonProps}
                    selectedProject={subtypeProject}
                    openInUnitsTab={!!editingProjectId}
                    openInOverview={openInOverview}
                    isSubtype={true}
                    onClose={() => {
                      resetForm();
                      setShowForm(false);
                      setEditingProjectId(null);
                    }}
                  />
                );
              } else if (currentCustomType === "commercial") {
                return (
                  <CommercialProject
                    {...commonProps}
                    selectedProject={subtypeProject}
                    isSubtype={true}
                  />
                );
              } else {
                return (
                  <CustomizeSelect
                    {...commonProps}
                    activeType={currentCustomType}
                  />
                );
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
        return (
          <DuplexTriplexProject {...duplexTriplexProps} projectType="duplex" />
        );
      case PROJECT_TYPES.TRIPLEX:
        return (
          <DuplexTriplexProject {...duplexTriplexProps} projectType="triplex" />
        );
      case PROJECT_TYPES.APARTMENT:
        return (
          <ApartmentProject
            {...commonProps}
            selectedProject={selectedProject}
            openInUnitsTab={!!editingProjectId}
            openInOverview={openInOverview}
            onClose={() => {
              resetForm();
              setShowForm(false);
              setEditingProjectId(null);
            }}
          />
        );

      case PROJECT_TYPES.COMMERCIAL:
        return (
          <CommercialProject
            {...commonProps}
            selectedProject={selectedProject}
            onClose={() => {
              resetForm();
              setShowForm(false);
              setEditingProjectId(null);
            }}
          />
        );

      case PROJECT_TYPES.CUSTOM:
        return (
          <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">
              Select custom project types to continue
            </p>
            <button
              onClick={() => setShowCustomizeSelect(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-md"
            >
              Choose Types
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto py-3">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight">
              Project Management
            </h1>
            <p className="text-slate-500 font-medium">
              Create and track your property projects
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={exportAllProjectsToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold"
            >
              <FaFileExcel /> Export
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 font-semibold"
            >
              <FaPlus /> New Project
            </button>
          </div>
        </header>

        {!showForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FaDatabase className="text-indigo-500" />
                  Active Projects ({projects.length})
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  {selectedProjects.length > 0 && (
                    <button
                      onClick={deleteMultipleProjects}
                      className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors font-medium border border-rose-200"
                    >
                      <FaTrash size={14} />
                      Delete Selected ({selectedProjects.length})
                    </button>
                  )}
                  {syncStatus.lastSynced && (
                    <span className="text-xs text-slate-400">
                      Synced: {formatDate(syncStatus.lastSynced)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {projects.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <FaBuilding className="text-slate-400 text-2xl" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-700">
                      No projects yet
                    </h3>
                    <p className="text-slate-500">
                      Create your first project to get started
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 w-10">
                        <button
                          onClick={toggleSelectAll}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                          title={selectAll ? "Deselect All" : "Select All"}
                        >
                          {selectAll ? (
                            <FaCheckSquare size={18} />
                          ) : (
                            <FaSquare size={18} />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((project) => {
                      // Parse plots_data to get plot information
                      let projectPlots = [];
                      let totalPlots = 0;
                      let editingPlotsCount = 0;
                      let savedPlotsCount = 0;

                      if (project.plots_data) {
                        try {
                          const parsedPlots =
                            typeof project.plots_data === "string"
                              ? JSON.parse(project.plots_data)
                              : project.plots_data;

                          if (Array.isArray(parsedPlots)) {
                            projectPlots = parsedPlots;
                            totalPlots = parsedPlots.length;
                            editingPlotsCount = parsedPlots.filter(
                              (p) => p.isBeingEdited,
                            ).length;
                            savedPlotsCount = parsedPlots.filter(
                              (p) => p.lastSaved && !p.isBeingEdited,
                            ).length;
                          }
                        } catch (error) {
                          console.error("Error parsing plots_data:", error);
                        }
                      }

                      return (
                        <React.Fragment key={project.id}>
                          <tr className="group hover:bg-indigo-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleSelectProject(project.id)}
                                className={`transition-colors ${selectedProjects.some(
                                  (id) => String(id) === String(project.id),
                                )
                                    ? "text-indigo-600"
                                    : "text-slate-300 hover:text-indigo-400"
                                  }`}
                              >
                                {selectedProjects.some(
                                  (id) => String(id) === String(project.id),
                                ) ? (
                                  <FaCheckSquare size={18} />
                                ) : (
                                  <FaSquare size={18} />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                  {project.name?.charAt(0) || "P"}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {project.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="text-xs text-slate-400 font-mono">
                                      {project.id}
                                    </div>
                                    <div
                                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${project.source === "server" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}
                                    >
                                      {project.source === "server"
                                        ? "SERVER"
                                        : "LOCAL"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                {project.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                <FaMapMarkerAlt className="text-rose-500 text-xs" />
                                {project.city || "Not set"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {(() => {
                                const status = getProjectOverallStatus(project);
                                return status ? (
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                                      status === "Pending" ? "bg-amber-100 text-amber-700" :
                                        status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                          status === "Ready to Move" ? "bg-indigo-100 text-indigo-700" :
                                            "bg-slate-100 text-slate-600"
                                    }`}>
                                    {status}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">-</span>
                                );
                              })()}
                            </td>
                            {/* <td className="px-6 py-4">
  {(() => {
    // DUPLEX/TRIPLEX
    if (project.type === "duplex" || project.type === "triplex") {
      let units = [];
      if (project.units_data) {
        try {
          units = typeof project.units_data === "string"
            ? JSON.parse(project.units_data)
            : project.units_data;
        } catch (e) {
          units = [];
        }
      }
      
      const total = units.length;
      const completed = units.filter(u => u.isComplete === true).length;
      const draft = total - completed;
      
      return total > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {total} unit(s)
          </span>
          {completed > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {completed} completed
            </span>
          )}
          {draft > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {draft} draft
            </span>
          )}
        </div>
      ) : (
        <span className="text-sm text-slate-400">No units</span>
      );
    }
    
    // PLOTTING
    else if (project.type === "plotting") {
      let plots = [];
      if (project.plots_data) {
        try {
          plots = typeof project.plots_data === "string"
            ? JSON.parse(project.plots_data)
            : project.plots_data;
        } catch (e) {
          plots = [];
        }
      }
      
      const total = plots.length;
      const completed = plots.filter(p => p.isComplete === true).length;
      const draft = total - completed;
      
      return total > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {total} plot(s)
          </span>
          {completed > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {completed} completed
            </span>
          )}
          {draft > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {draft} draft
            </span>
          )}
        </div>
      ) : (
        <span className="text-sm text-slate-400">No plots</span>
      );
    }
    
    // APARTMENT
    else if (project.type === "apartment") {
      let allUnits = [];
      if (project.blocks_data) {
        try {
          const blocks = typeof project.blocks_data === "string"
            ? JSON.parse(project.blocks_data)
            : project.blocks_data;
          
          blocks.forEach(block => {
            block.floors?.forEach(floor => {
              floor.units?.forEach(unit => {
                allUnits.push(unit);
              });
            });
          });
        } catch (e) {
          allUnits = [];
        }
      }
      
      const total = allUnits.length;
      const completed = allUnits.filter(u => u.isComplete === true).length;
      const draft = total - completed;
      
      return total > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {total} unit(s)
          </span>
          {completed > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {completed} completed
            </span>
          )}
          {draft > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {draft} draft
            </span>
          )}
        </div>
      ) : (
        <span className="text-sm text-slate-400">No units</span>
      );
    }
    
    // COMMERCIAL
    else if (project.type === "commercial") {
      let units = [];
      if (project.units_data) {
        try {
          units = typeof project.units_data === "string"
            ? JSON.parse(project.units_data)
            : project.units_data;
        } catch (e) {
          units = [];
        }
      }
      
      const total = units.length;
      const completed = units.filter(u => u.isComplete === true).length;
      const draft = total - completed;
      
      return total > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {total} unit(s)
          </span>
          {completed > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {completed} completed
            </span>
          )}
          {draft > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {draft} draft
            </span>
          )}
        </div>
      ) : (
        <span className="text-sm text-slate-400">No units</span>
      );
    }
    
    // CUSTOM
    else if (project.type === "custom") {
      let totalItems = 0;
      let completedItems = 0;
      
      // Check plots_data
      if (project.plots_data) {
        try {
          const plots = typeof project.plots_data === "string"
            ? JSON.parse(project.plots_data)
            : project.plots_data;
          totalItems += plots.length;
          completedItems += plots.filter(p => p.isComplete === true).length;
        } catch (e) {}
      }
      
      // Check units_data
      if (project.units_data) {
        try {
          const units = typeof project.units_data === "string"
            ? JSON.parse(project.units_data)
            : project.units_data;
          totalItems += units.length;
          completedItems += units.filter(u => u.isComplete === true).length;
        } catch (e) {}
      }
      
      // Check blocks_data
      if (project.blocks_data) {
        try {
          const blocks = typeof project.blocks_data === "string"
            ? JSON.parse(project.blocks_data)
            : project.blocks_data;
          
          blocks.forEach(block => {
            block.floors?.forEach(floor => {
              floor.units?.forEach(unit => {
                totalItems++;
                if (unit.isComplete === true) completedItems++;
              });
            });
          });
        } catch (e) {}
      }
      
      const draft = totalItems - completedItems;
      
      return totalItems > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {totalItems} item(s)
          </span>
          {completedItems > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {completedItems} completed
            </span>
          )}
          {draft > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {draft} draft
            </span>
          )}
        </div>
      ) : (
        <span className="text-sm text-slate-400">No items</span>
      );
    }
    
    else {
      return <span className="text-sm text-slate-400">-</span>;
    }
  })()}
</td> */}
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {formatDate(
                                project.created_at || project.createdAt,
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Unit Editing Overview button for duplex/triplex projects */}
                                {(project.type === "duplex" ||
                                  project.type === "triplex") &&
                                  (() => {
                                    let units = [];

                                    if (project.units_data) {
                                      try {
                                        units =
                                          typeof project.units_data === "string"
                                            ? JSON.parse(project.units_data)
                                            : project.units_data;
                                      } catch (e) {
                                        units = [];
                                      }
                                    }

                                    return units.length > 0 ? (
                                      <button
                                        onClick={() => {
                                          openUnitEditingOverview(project);
                                        }}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="View Unit Editing Overview"
                                      >
                                        <FaTable />
                                      </button>
                                    ) : null;
                                  })()}

                                {/* Apartment Block & Unit Editing Overview */}
                                {project.type === "apartment" && (
                                  <button
                                    onClick={() => {
                                      // Open apartment project
                                      openApartmentEditingOverview(project);

                                      // Trigger block & unit overview inside ApartmentProject
                                      setTimeout(() => {
                                        window.dispatchEvent(
                                          new CustomEvent(
                                            "OPEN_BLOCK_UNIT_OVERVIEW",
                                          ),
                                        );
                                      }, 100);
                                    }}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                    title="Block & Unit Editing Overview"
                                  >
                                    <FaTable />
                                  </button>
                                )}

                                {/* Commercial Editing Overview */}
                                {project.type === "commercial" && (
                                  <button
                                    onClick={() =>
                                      openCommercialEditingOverview(project)
                                    }
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    title="Commercial Editing Overview"
                                  >
                                    <FaTable />
                                  </button>
                                )}

                                {/* Plot Editing Overview button for plotting projects */}
                                {project.type === "plotting" && (
                                  <button
                                    onClick={() =>
                                      openPlotEditingOverview(project)
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Plot Editing Overview"
                                  >
                                    <FaTable />
                                  </button>
                                )}

                                {/* Custom Project Editing Overview */}
                                {project.type === "custom" && (
                                  <button
                                    onClick={() =>
                                      openCustomEditingOverview(project)
                                    }
                                    className="p-2 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="View Custom Project Editing Overview"
                                  >
                                    <FaTable />
                                  </button>
                                )}

                                {/* Apartment Block & Unit Editing Overview */}
                                {/* {project.type === "apartment" && (
  <button
    onClick={() => {
      // 1️⃣ Open Apartment project normally
      setEditingProjectId(project.id);
      setProjectType("apartment");

      // 2️⃣ Trigger Block & Unit overview INSIDE ApartmentProject
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("OPEN_BLOCK_UNIT_OVERVIEW")
        );
      }, 100);
    }}
    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
    title="Block & Unit Editing Overview"
  >
    <FaTable />
  </button>
)} */}

                                {/* <button
  onClick={() => openEditingOverview(project)}
  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
>
  <FaEdit />
</button> */}

                                <button
                                  onClick={() => handleViewProject(project)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                  title="View Project"
                                >
                                  <FaEye />
                                </button>

                                <button
                                  onClick={() => editProject(project)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Edit Project"
                                >
                                  <FaEdit />
                                </button>

                                {/* Delete Project button */}
                                <button
                                  onClick={() => deleteProject(project.id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>

                                {/* Expand/Collapse button */}
                                <button
                                  onClick={() =>
                                    toggleProjectExpansion(project.id)
                                  }
                                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                                  title={
                                    expandedProject === project.id
                                      ? "Collapse"
                                      : "Expand"
                                  }
                                >
                                  {expandedProject === project.id ? (
                                    <FaTimes />
                                  ) : (
                                    <FaSync className="text-xs" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedProject === project.id && (
                            <tr className="bg-slate-50/80">
                              <td
                                colSpan="6"
                                className="px-6 py-6 border-b border-indigo-100"
                              >
                                <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-slate-800">
                                      Project Details
                                    </h4>
                                    <span className="text-sm text-slate-500">
                                      ID: {project.id}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Basic Information Column */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                          <FaBuilding />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-slate-800">
                                            Basic Information
                                          </h5>
                                          <p className="text-sm text-slate-500">
                                            Core project details
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Project Type
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.type}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Status
                                          </label>
                                          <p
                                            className={`font-semibold ${project.status === "active" ? "text-emerald-600" : "text-amber-600"}`}
                                          >
                                            {project.status || "draft"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Created
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {formatDate(
                                              project.created_at ||
                                              project.createdAt,
                                            )}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Last Updated
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {formatDate(
                                              project.updated_at ||
                                              project.updatedAt,
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Location Information Column */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                          <FaMapMarkerAlt />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-slate-800">
                                            Location Details
                                          </h5>
                                          <p className="text-sm text-slate-500">
                                            Geographic information
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            City
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.city || "Not specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Locality
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.locality ||
                                              "Not specified"}
                                          </p>
                                        </div>
                                        {project.land_zone && (
                                          <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">
                                              Land Zone
                                            </label>
                                            <p className="font-semibold text-slate-700">
                                              {project.land_zone}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Project Type Specific Details */}
                                  <div className="mt-6 pt-6 border-t border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                        {project.type === "plotting" && (
                                          <FaTable />
                                        )}
                                        {project.type === "duplex" && (
                                          <FaHome />
                                        )}
                                        {project.type === "triplex" && (
                                          <FaBuilding />
                                        )}
                                        {project.type === "apartment" && (
                                          <FaHome />
                                        )}
                                        {project.type === "commercial" && (
                                          <FaBuilding />
                                        )}
                                        {project.type === "custom" && (
                                          <FaHome />
                                        )}
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-slate-800">
                                          {project.type?.toUpperCase()} Specific
                                          Details
                                        </h5>
                                        <p className="text-sm text-slate-500">
                                          Type-specific saved data
                                        </p>
                                      </div>
                                    </div>

                                    {/* Plotting Project Details */}
                                    {project.type === "plotting" && (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Land Area
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.land_area
                                              ? `${project.land_area} sq.ft`
                                              : "Not specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Revenue Plots
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.revenue_plots || 0}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Total Plots
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {(() => {
                                              try {
                                                const plots = project.plots_data
                                                  ? typeof project.plots_data ===
                                                    "string"
                                                    ? JSON.parse(
                                                      project.plots_data,
                                                    )
                                                    : project.plots_data
                                                  : [];
                                                return plots.length || 0;
                                              } catch {
                                                return 0;
                                              }
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Duplex/Triplex Project Details */}
                                    {(project.type === "duplex" ||
                                      project.type === "triplex") && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">
                                              Land Area
                                            </label>
                                            <p className="font-semibold text-slate-700">
                                              {project.land_area
                                                ? `${project.land_area} sq.ft`
                                                : "Not specified"}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">
                                              Total Units
                                            </label>
                                            <p className="font-semibold text-slate-700">
                                              {(() => {
                                                try {
                                                  const units = project.units_data
                                                    ? typeof project.units_data ===
                                                      "string"
                                                      ? JSON.parse(
                                                        project.units_data,
                                                      )
                                                      : project.units_data
                                                    : [];
                                                  return units.length || 0;
                                                } catch {
                                                  return project.num_units || 0;
                                                }
                                              })()}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">
                                              Unit Prefix
                                            </label>
                                            <p className="font-semibold text-slate-700">
                                              {project.unit_prefix ||
                                                "Not specified"}
                                            </p>
                                          </div>
                                          {project.facilities && (
                                            <div className="col-span-3">
                                              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                                                Facilities
                                              </label>
                                              <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                  try {
                                                    const facilities =
                                                      project.facilities
                                                        ? typeof project.facilities ===
                                                          "string"
                                                          ? JSON.parse(
                                                            project.facilities,
                                                          )
                                                          : project.facilities
                                                        : {};
                                                    return Object.entries(
                                                      facilities,
                                                    )
                                                      .filter(
                                                        ([key, value]) =>
                                                          value === true,
                                                      )
                                                      .map(([key]) => (
                                                        <span
                                                          key={key}
                                                          className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium"
                                                        >
                                                          {key.replace(/_/g, " ")}
                                                        </span>
                                                      ));
                                                  } catch {
                                                    return (
                                                      <span className="text-slate-500 text-sm">
                                                        No facilities
                                                      </span>
                                                    );
                                                  }
                                                })()}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                    {/* Apartment Project Details */}
                                    {project.type === "apartment" && (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Total Floors
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.total_floors ||
                                              "Not specified"}
                                          </p>
                                        </div>

                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Total Units
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {(project.total_floors || 0) *
                                              (project.units_per_floor || 0) ||
                                              "Not specified"}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Commercial Project Details */}
                                    {project.type === "commercial" && (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Commercial Type
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.commercial_sub_type ||
                                              "Not specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Built-up Area
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.built_up_area
                                              ? `${project.built_up_area} sq.ft`
                                              : "Not specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">
                                            Shops/Offices
                                          </label>
                                          <p className="font-semibold text-slate-700">
                                            {project.total_shops ||
                                              project.total_offices ||
                                              "Not specified"}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Custom Project Details */}
                                    {project.type === "custom" && (
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase">
                                              Custom Types
                                            </label>
                                            <p className="font-semibold text-slate-700">
                                              {project.custom_selected_types?.join(
                                                ", ",
                                              ) || "Not specified"}
                                            </p>
                                          </div>
                                        </div>
                                        {project.custom_details && (
                                          <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                                              Custom Details
                                            </label>
                                            <pre className="text-xs bg-slate-50 p-3 rounded-lg overflow-x-auto text-slate-700">
                                              {JSON.stringify(
                                                project.custom_details,
                                                null,
                                                2,
                                              )}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Data Summary */}
                                  <div className="mt-6 pt-6 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h6 className="text-sm font-semibold text-slate-700 mb-2">
                                          Data Summary
                                        </h6>
                                        <p className="text-xs text-slate-500">
                                          Last saved:{" "}
                                          {formatDate(
                                            project.updated_at ||
                                            project.updatedAt,
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex gap-3">
                                        <button
                                          onClick={() =>
                                            handleViewProject(project)
                                          }
                                          className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold hover:underline"
                                        >
                                          View Full Details →
                                        </button>
                                        <button
                                          onClick={() => editProject(project)}
                                          className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                                        >
                                          Edit Project
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="">
              {!projectType && !showCustomizeSelect ? (
                <div className="max-w-2xl mx-auto p-8 relative">
                  {/* ❌ Close Button */}
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full 
               flex items-center justify-center 
               text-slate-500 hover:text-slate-700 
               hover:bg-slate-100 transition"
                    title="Cancel project creation"
                  >
                    <FaTimes size={18} />
                  </button>
                  <div className="space-y-2 text-center mb-8">
                    <h3 className="text-2xl font-bold text-indigo-900">
                      Let's get started
                    </h3>
                    <p className="text-slate-500">
                      Enter the basic details to build your project
                      configuration
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="e.g. Skyline Heights"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Project Type
                      </label>
                      <select
                        value={projectType}
                        onChange={handleProjectTypeChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
                      >
                        <option value="">Select a category</option>
                        <option value={PROJECT_TYPES.PLOTTING}>Plotting</option>
                        <option value={PROJECT_TYPES.DUPLEX}>Duplex</option>
                        <option value={PROJECT_TYPES.TRIPLEX}>Triplex</option>
                        <option value={PROJECT_TYPES.APARTMENT}>
                          Apartment
                        </option>
                        <option value={PROJECT_TYPES.COMMERCIAL}>
                          Commercial
                        </option>
                        <option value={PROJECT_TYPES.CUSTOM}>
                          Custom / Multiple
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => {
                        resetForm();
                        setShowForm(false);
                      }}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all font-medium flex items-center gap-2"
                    >
                      <FaTimes className="text-slate-400" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                renderProjectForm()
              )}
            </div>
          </div>
        )}

        {showPlotEditingOverview && renderPlotEditingOverview()}
        {/* {editingOverview.open && renderEditingOverview()} */}
        {showUnitEditingOverview && renderUnitEditingOverview()}
        {showApartmentOverview && renderApartmentEditingOverview()}
        {showCommercialEditingOverview && renderCommercialEditingOverview()}
        {showCustomEditingOverview && renderCustomEditingOverview()}

        {viewProjectId && viewProjectData && (
          <ProjectViewForm
            project={viewProjectData}
            onClose={closeViewProject}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default PABC;
