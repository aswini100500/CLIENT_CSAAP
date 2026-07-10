import React, { useState, useEffect } from "react";
import projectService from "./projectService";
import useAuth from "../../hooks/useAuth";

const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "error"
      ? "bg-red-600"
      : type === "success"
        ? "bg-emerald-600"
        : "bg-indigo-600";
  const icon = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";

  return (
    <div className="fixed top-6 right-6 z-99999 max-w-sm">
      <div
        className={`${bgColor} text-white px-5 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3.5 border border-white/10`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold">{icon}</span>
          <span className="text-sm font-semibold tracking-wide">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/10 rounded-full p-1 transition-all text-xs font-bold w-5 h-5 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
import {
  FaHome,
  FaArrowRight,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaSync,
  FaSave,
  FaList,
  FaInfoCircle,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTimes,
  FaMoneyBill,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaEye,
  FaPen,
  FaArrowLeft,
  FaTimesCircle,
  FaUsers,
  FaBuilding,
  FaPlus,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUpload,
  FaPrint,
  FaCopy,
  FaEllipsisH,
  FaBars,
  FaCog,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaQuestionCircle,
  FaChartBar,
  FaFileAlt,
  FaImage,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaLink,
  FaLock,
  FaUnlock,
  FaStar,
  FaHeart,
  FaShare,
  FaExternalLinkAlt,
  FaWindowClose,
  FaAngleDown,
  FaAngleUp,
  FaAngleRight,
  FaAngleLeft,
  FaFolder,
  FaFolderOpen,
  FaClock,
  FaCalendar,
  FaCalculator,
  FaChartLine,
  FaDatabase,
  FaKey,
  FaWrench,
  FaCubes,
  FaLayerGroup,
  FaMap,
  FaTable,
  FaColumns,
  FaSlidersH,
  FaTag,
  FaTags,
  FaCloud,
  FaMobile,
  FaDesktop,
  FaLaptop,
  FaServer,
  FaNetworkWired,
  FaGlobe,
  FaLanguage,
  FaPalette,
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaCode,
  FaTerminal,
  FaBug,
  FaShieldAlt,
  FaRocket,
  FaHandPointer,
  FaMousePointer,
  FaRegCircle,
  FaRegSquare,
  FaMinus,
  FaEquals,
  FaDivide,
  FaPercentage,
  FaHashtag,
  FaAt,
  FaDollarSign,
  FaEuroSign,
  FaPoundSign,
  FaRupeeSign,
  FaYenSign,
  FaBitcoin,
  FaCreditCard,
  FaReceipt,
  FaShoppingCart,
  FaBox,
  FaTruck,
  FaWarehouse,
} from "react-icons/fa";

import { HomeSection } from "./DuplexTriplex/HomeSection";
import { ProjectTabs } from "./DuplexTriplex/ProjectTabs";
import { MainInfoSection } from "./DuplexTriplex/MainInfoSection";
import { FloorSection } from "./DuplexTriplex/FloorSection";

const DuplexTriplexProject = ({
  projectName,
  setProjectName,
  projectType,
  setProjectType,
  city,
  setCity,
  locality,
  setLocality,
  landArea,
  setLandArea,
  revenuePlots,
  setRevenuePlots,
  addRevenuePlotNumber,
  setAddRevenuePlotNumber,
  attachment,
  setAttachment,
  onSaveProject,
  isSubtype = false,
  constants,
  PROJECT_TYPES,
  landZone,
  setLandZone,
  commercialSubType,
  setCommercialSubType,
  selectedProject = null,
  editingProjectId = null,
  initialUnits = [],
  onClose,
  showUnitOverviewOnLoad = false,
}) => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(selectedProject ? 1 : 0);
  const [numUnits, setNumUnits] = useState("");
  const [unitPrefix, setUnitPrefix] = useState("");
  const [facilities, setFacilities] = useState({});
  const [customFacilities, setCustomFacilities] = useState([]);
  const [mainInfo, setMainInfo] = useState(constants?.INITIAL_MAIN_INFO || {});
  const [groundFloor, setGroundFloor] = useState(
    constants?.INITIAL_FLOOR_DETAILS || {},
  );
  const [firstFloor, setFirstFloor] = useState(
    constants?.INITIAL_FLOOR_DETAILS || {},
  );
  const [secondFloor, setSecondFloor] = useState(
    constants?.INITIAL_FLOOR_DETAILS || {},
  );
  const [showUnitEditingOverview, setShowUnitEditingOverview] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [units, setUnits] = useState([]);
  const [deletedUnitIds, setDeletedUnitIds] = useState([]);
  const [revenuePlotsData, setRevenuePlotsData] = useState([]);
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlertConfig({ message, type });
  };

  useEffect(() => {
    if (showUnitOverviewOnLoad) {
      setShowUnitEditingOverview(true);
    }
  }, [showUnitOverviewOnLoad]);

  useEffect(() => {
    if (initialUnits && initialUnits.length > 0) {
      setUnits(initialUnits);
    }
  }, [initialUnits]);

  useEffect(() => {
    const handleOpenUnitOverview = () => {
      setShowUnitEditingOverview(true);
    };

    window.addEventListener("OPEN_UNIT_OVERVIEW", handleOpenUnitOverview);

    return () => {
      window.removeEventListener("OPEN_UNIT_OVERVIEW", handleOpenUnitOverview);
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setProjectId(selectedProject.id);
      setProjectName(selectedProject.name || "");
      setProjectType(selectedProject.type || "");
      setCity(selectedProject.city || "");
      setLocality(selectedProject.locality || "");
      setLandArea(selectedProject.land_area || selectedProject.landArea || "");
      setRevenuePlots(
        selectedProject.revenue_plots || selectedProject.revenuePlots || 0,
      );

      try {
        const parsedPlots = selectedProject.revenue_plots_data
          ? typeof selectedProject.revenue_plots_data === "string"
            ? JSON.parse(selectedProject.revenue_plots_data)
            : selectedProject.revenue_plots_data
          : [];
        setRevenuePlotsData(parsedPlots);
      } catch (e) {
        console.error("Failed to parse revenue_plots_data:", e);
        setRevenuePlotsData([]);
      }

      try {
        const parsedFacilities = selectedProject.facilities
          ? typeof selectedProject.facilities === "string"
            ? JSON.parse(selectedProject.facilities)
            : selectedProject.facilities
          : {};
        setFacilities(parsedFacilities);
      } catch (e) {
        console.error("Failed to parse facilities:", e);
        setFacilities({});
      }

      try {
        const parsedCustomFacilities = selectedProject.custom_facilities
          ? typeof selectedProject.custom_facilities === "string"
            ? JSON.parse(selectedProject.custom_facilities)
            : selectedProject.custom_facilities
          : [];
        setCustomFacilities(parsedCustomFacilities);
      } catch (e) {
        console.error("Failed to parse custom_facilities:", e);
        setCustomFacilities([]);
      }

      let unitsData = [];

      if (selectedProject.units_data) {
        try {
          unitsData =
            typeof selectedProject.units_data === "string"
              ? JSON.parse(selectedProject.units_data)
              : selectedProject.units_data;
        } catch (e) {
          console.error("❌ Failed to parse units_data:", e);
          unitsData = [];
        }
      } else if (selectedProject.units) {
        unitsData = Array.isArray(selectedProject.units)
          ? selectedProject.units
          : [];
      }

      setUnits(unitsData);
      setDeletedUnitIds([]);
      setNumUnits(unitsData.length || "");

      if (selectedProject.unit_prefix) {
        setUnitPrefix(selectedProject.unit_prefix);
      } else if (unitsData && unitsData.length > 0 && unitsData[0].name) {
        const nameParts = unitsData[0].name.split("-");
        if (nameParts.length > 1) {
          setUnitPrefix(nameParts[0]);
        }
      }

      if (unitsData && unitsData.length > 0) {
        setSelectedUnit(unitsData[0]);
        if (unitsData[0].mainInfo) setMainInfo(unitsData[0].mainInfo);
        if (unitsData[0].floors) {
          setGroundFloor(
            unitsData[0].floors.groundFloor ||
              constants?.INITIAL_FLOOR_DETAILS ||
              {},
          );
          setFirstFloor(
            unitsData[0].floors.firstFloor ||
              constants?.INITIAL_FLOOR_DETAILS ||
              {},
          );
          if (selectedProject.type === "triplex") {
            setSecondFloor(
              unitsData[0].floors.secondFloor ||
                constants?.INITIAL_FLOOR_DETAILS ||
                {},
            );
          }
        }
      }

      setCurrentTab(1);
    }
  }, [selectedProject, constants]);

  const handleUnitEditFromOverview = (unitId) => {
    const unitToEdit = units.find((u) => u.id === unitId);
    if (unitToEdit) {
      setEditingUnitId(unitId);
      setSelectedUnit(unitToEdit);
      setShowUnitEditingOverview(false);

      if (!unitToEdit.mainInfo?.facing) {
        setCurrentTab(1);
      } else if (!unitToEdit.floors?.groundFloor) {
        setCurrentTab(2);
      } else if (projectType === "duplex" && !unitToEdit.floors?.firstFloor) {
        setCurrentTab(3);
      } else if (projectType === "triplex" && !unitToEdit.floors?.firstFloor) {
        setCurrentTab(3);
      } else if (projectType === "triplex" && !unitToEdit.floors?.secondFloor) {
        setCurrentTab(4);
      } else {
        setCurrentTab(1);
      }
    }
  };

  const markUnitAsSaved = (unitId) => {
    const updatedUnits = units.map((unit) => {
      if (unit.id === unitId) {
        return {
          ...unit,
          lastSaved: new Date().toISOString(),
          isBeingEdited: false,
        };
      }
      return unit;
    });
    setUnits(updatedUnits);
  };

  const markUnitAsBeingEdited = (unitId) => {
    const updatedUnits = units.map((unit) => ({
      ...unit,
      isBeingEdited: unit.id === unitId,
    }));
    setUnits(updatedUnits);
  };

  useEffect(() => {
    if (selectedUnit && editingUnitId === selectedUnit.id) {
      markUnitAsBeingEdited(selectedUnit.id);
    }
  }, [selectedUnit, editingUnitId]);

  const completeUnitEditing = (unitId) => {
    const updatedUnits = units.map((unit) => {
      if (unit.id === unitId) {
        return {
          ...unit,
          isBeingEdited: false,
          isComplete: true,
          lastSaved: new Date().toISOString(),
        };
      }
      return unit;
    });
    setUnits(updatedUnits);
  };

  const handleGenerateProject = (projectData) => {
    if (projectData.id) {
      setProjectId(projectData.id);
      if (projectData.plots) {
        setRevenuePlotsData(projectData.plots);
      }
    }

    if (projectName && projectType) {
      setCurrentTab(1);
      showAlert(`Project "${projectName}" generated successfully!`, "success");
    } else {
      showAlert("Please enter project name and select project type", "error");
    }
  };

  const checkUnitCompletion = (unit) => {
    return !!(
      unit.mainInfo?.landArea &&
      unit.mainInfo?.totalBuiltUpArea &&
      unit.priceDetails?.expectedPrice
    );
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    if (unit.mainInfo) {
      setMainInfo(unit.mainInfo);
    } else {
      setMainInfo(constants?.INITIAL_MAIN_INFO || {});
    }

    if (unit.floors) {
      setGroundFloor(
        unit.floors.groundFloor || constants?.INITIAL_FLOOR_DETAILS || {},
      );
      setFirstFloor(
        unit.floors.firstFloor || constants?.INITIAL_FLOOR_DETAILS || {},
      );
      if (projectType === "triplex") {
        setSecondFloor(
          unit.floors.secondFloor || constants?.INITIAL_FLOOR_DETAILS || {},
        );
      }
    }
  };

  const handleSaveMainInfo = () => {
    if (selectedUnit) {
      const updatedUnits = units.map((unit) => {
        if (unit.id === selectedUnit.id) {
          const updatedUnit = {
            ...unit,
            mainInfo: { ...mainInfo },
          };
          updatedUnit.isComplete = checkUnitCompletion(updatedUnit);
          return updatedUnit;
        }
        return unit;
      });
      setUnits(updatedUnits);
      setSelectedUnit(updatedUnits.find((u) => u.id === selectedUnit.id));
      showAlert(
        `Project specifications saved for ${selectedUnit.name}`,
        "success",
      );
    }
    setCurrentTab(2);
  };

  const handleSaveGroundFloor = () => {
    if (selectedUnit) {
      const updatedUnits = units.map((unit) => {
        if (unit.id === selectedUnit.id) {
          const updatedUnit = {
            ...unit,
            floors: {
              ...unit.floors,
              groundFloor: { ...groundFloor },
            },
          };
          updatedUnit.isComplete = checkUnitCompletion(updatedUnit);
          return updatedUnit;
        }
        return unit;
      });
      setUnits(updatedUnits);
      setSelectedUnit(updatedUnits.find((u) => u.id === selectedUnit.id));
      showAlert(
        `Ground floor details saved for ${selectedUnit.name}`,
        "success",
      );
    }

    if (projectType === "duplex") {
      setCurrentTab(3);
    } else if (projectType === "triplex") {
      setCurrentTab(3);
    }
  };

  const handleSaveFirstFloor = () => {
    let currentUnits = units;
    if (selectedUnit) {
      currentUnits = units.map((unit) => {
        if (unit.id === selectedUnit.id) {
          const updatedUnit = {
            ...unit,
            floors: {
              ...unit.floors,
              firstFloor: { ...firstFloor },
            },
          };
          updatedUnit.isComplete = checkUnitCompletion(updatedUnit);
          return updatedUnit;
        }
        return unit;
      });
      setUnits(currentUnits);
      setSelectedUnit(currentUnits.find((u) => u.id === selectedUnit.id));
      showAlert(
        `First floor details saved for ${selectedUnit.name}`,
        "success",
      );
    }

    if (projectType === "triplex") {
      setCurrentTab(4);
    } else {
      handleSaveDuplexTriplexProject(currentUnits);
    }
  };

  const handleSaveSecondFloor = () => {
    let currentUnits = units;
    if (selectedUnit) {
      currentUnits = units.map((unit) => {
        if (unit.id === selectedUnit.id) {
          const updatedUnit = {
            ...unit,
            floors: {
              ...unit.floors,
              secondFloor: { ...secondFloor },
            },
          };
          updatedUnit.isComplete = checkUnitCompletion(updatedUnit);
          return updatedUnit;
        }
        return unit;
      });
      setUnits(currentUnits);
      setSelectedUnit(currentUnits.find((u) => u.id === selectedUnit.id));
      showAlert(
        `Second floor details saved for ${selectedUnit.name}`,
        "success",
      );
    }
    handleSaveDuplexTriplexProject(currentUnits);
  };

  const handleSaveDuplexTriplexProject = async (unitsToSave = units) => {
    const existingProject = selectedProject || {};

    let existingUnits = [];
    if (existingProject.units_data) {
      try {
        existingUnits =
          typeof existingProject.units_data === "string"
            ? JSON.parse(existingProject.units_data)
            : existingProject.units_data;
      } catch (error) {
        console.error("❌ Error parsing existing units_data:", error);
      }
    }

    const currentUnitsMap = new Map();
    const finalUnits = unitsToSave.map((unit) => {
      const isCurrentlyEditing = selectedUnit && unit.id === selectedUnit.id;

      const updatedUnit = {
        ...unit,
        lastSaved: isCurrentlyEditing
          ? new Date().toISOString()
          : unit.lastSaved,
        isComplete: isCurrentlyEditing ? true : unit.isComplete,
      };

      if (isCurrentlyEditing) {
        updatedUnit.isBeingEdited = false;
      }

      currentUnitsMap.set(unit.id, updatedUnit);
      return updatedUnit;
    });

    existingUnits.forEach((existingUnit) => {
      if (
        !currentUnitsMap.has(existingUnit.id) &&
        !deletedUnitIds.includes(existingUnit.id)
      ) {
        finalUnits.push(existingUnit);
      }
    });

    const projectData = {
      name: projectName,
      type: projectType,
      city,
      locality,
      slug: user?.slug || "",
      unitPrefix,
      numUnits: finalUnits.length,
      units: finalUnits,
      facilities: facilities,
      customFacilities: customFacilities,
      landArea: landArea,
      revenuePlots: revenuePlots,
      revenuePlotsData: (revenuePlotsData || [])
        .filter(
          (plot) =>
            plot.plot_no ||
            plot.plot_area_sqft ||
            plot.khata_no ||
            plot.fileName,
        )
        .map((plot) => {
          const { file, ...rest } = plot;
          return rest;
        }),

      ...(selectedProject && {
        id: selectedProject.id,
        created_at: selectedProject.created_at,
        source: selectedProject.source,
      }),
    };

    try {
      if (isSubtype) {
        onSaveProject?.({ ...projectData, id: projectId });
        return;
      }

      if (projectType.toLowerCase() === "duplex") {
        if (projectId) {
          await projectService.updateDuplex(projectId, projectData);
          showAlert("Duplex project updated successfully!", "success");
          onSaveProject?.({ ...projectData, id: projectId });
        } else {
          const response = await projectService.createDuplex(projectData);
          setProjectId(response.id);
          showAlert(
            `Duplex project created successfully with ID: ${response.id}`,
            "success",
          );
          onSaveProject?.({ ...projectData, id: response.id });
        }
      } else if (projectType.toLowerCase() === "triplex") {
        if (projectId) {
          await projectService.updateTriplex(projectId, projectData);
          showAlert("Triplex project updated successfully!", "success");
          onSaveProject?.({ ...projectData, id: projectId });
        } else {
          const response = await projectService.createTriplex(projectData);
          setProjectId(response.id);
          showAlert(
            `Triplex project created successfully with ID: ${response.id}`,
            "success",
          );
          onSaveProject?.({ ...projectData, id: response.id });
        }
      }
    } catch (error) {
      console.error("❌ Error saving project:", error);
      showAlert("Something went wrong while saving the project.", "error");
    }
  };

  const renderUnitEditingOverview = () => {
    const stats = {
      total: units.length,
      beingEdited: units.filter((u) => u.isBeingEdited).length,
      saved: units.filter((u) => u.lastSaved && !u.isBeingEdited).length,
      notEdited: units.filter((u) => !u.lastSaved && !u.isBeingEdited).length,
      complete: units.filter((u) => u.isComplete).length,
    };

    return (
      <div className="fixed inset-0 z-9999 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => {
            if (showUnitOverviewOnLoad && onClose) {
              onClose();
            } else {
              setShowUnitEditingOverview(false);
            }
          }}
        />

        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (showUnitOverviewOnLoad && onClose) {
                        onClose();
                      } else {
                        setShowUnitEditingOverview(false);
                        setEditingUnitId(null);
                      }
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <FaArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Unit Editing Dashboard
                    </h2>
                    <p className="text-slate-300 mt-1">
                      <span className="font-medium">{projectName}</span> •{" "}
                      {units.length} unit{units.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const updatedUnits = units.map((unit) => ({
                        ...unit,
                        isBeingEdited: false,
                      }));
                      setUnits(updatedUnits);
                      setShowUnitEditingOverview(false);
                      setEditingUnitId(null);

                      const notification = document.createElement("div");
                      notification.className =
                        "fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg z-[10000]";
                      notification.textContent =
                        "✅ All unit editing completed!";
                      document.body.appendChild(notification);
                      setTimeout(() => notification.remove(), 3000);
                    }}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <FaCheck />
                    Complete All Editing
                  </button>

                  <button
                    onClick={handleSaveDuplexTriplexProject}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <FaSave className="w-4 h-4" />
                    Save All Changes
                  </button>

                  <button
                    onClick={() => {
                      if (showUnitOverviewOnLoad && onClose) {
                        onClose();
                      } else {
                        setShowUnitEditingOverview(false);
                        setEditingUnitId(null);
                      }
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    {showUnitOverviewOnLoad ? "Close Overview" : "Close"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    label: "Total Units",
                    value: stats.total,
                    color: "bg-slate-50",
                    iconColor: "text-slate-600",
                    ringColor: "border-slate-100",
                  },
                  {
                    label: "Being Edited",
                    value: stats.beingEdited,
                    color: "bg-blue-50/50",
                    iconColor: "text-blue-600",
                    ringColor: "border-blue-100/50",
                  },
                  {
                    label: "Saved",
                    value: stats.saved,
                    color: "bg-emerald-50/50",
                    iconColor: "text-emerald-600",
                    ringColor: "border-emerald-100/50",
                  },
                  {
                    label: "Not Edited",
                    value: stats.notEdited,
                    color: "bg-amber-50/50",
                    iconColor: "text-amber-600",
                    ringColor: "border-amber-100/50",
                  },
                  {
                    label: "Complete",
                    value: stats.complete,
                    color: "bg-purple-50/50",
                    iconColor: "text-purple-600",
                    ringColor: "border-purple-100/50",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="app-panel p-4 bg-white border border-(--border-soft) rounded-2xl shadow-xs"
                  >
                    <p className="text-[11px] font-bold text-(--text-soft) uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[26px] font-extrabold leading-none text-(--text-strong)">
                        {stat.value}
                      </span>
                      <span
                        className={`size-8 rounded-lg ${stat.color} border ${stat.ringColor} flex items-center justify-center`}
                      >
                        <span
                          className={`text-[10px] font-extrabold ${stat.iconColor}`}
                        >
                          #
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-(--border-soft) overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {[
                          "Unit",
                          "Details",
                          "Price",
                          "Status",
                          "Last Saved",
                          "Completion",
                          "Actions",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-(--border-soft)"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((unit) => (
                        <tr
                          key={unit.id}
                          className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors ${
                            unit.isBeingEdited
                              ? "bg-blue-50/30"
                              : unit.lastSaved
                                ? "bg-emerald-50/10"
                                : "bg-slate-50/10"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-xl ${
                                  unit.isBeingEdited
                                    ? "bg-blue-100"
                                    : unit.lastSaved
                                      ? "bg-emerald-100"
                                      : "bg-slate-100"
                                }`}
                              >
                                <FaHome
                                  className={`w-6 h-6 ${
                                    unit.isBeingEdited
                                      ? "text-blue-600"
                                      : unit.lastSaved
                                        ? "text-emerald-600"
                                        : "text-slate-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <div
                                  className={`font-medium ${
                                    unit.isBeingEdited
                                      ? "text-blue-900"
                                      : unit.lastSaved
                                        ? "text-slate-900"
                                        : "text-slate-500"
                                  }`}
                                >
                                  {unit.name}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-slate-900">
                                {unit.area_details?.carpet_area ? (
                                  `${unit.area_details.carpet_area} sqft`
                                ) : (
                                  <span className="text-slate-400 italic">
                                    Not set
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-medium text-slate-900">
                                {unit.priceDetails?.expectedPrice ? (
                                  `₹${parseInt(unit.priceDetails.expectedPrice).toLocaleString()}`
                                ) : (
                                  <span className="text-slate-400 italic">
                                    Not set
                                  </span>
                                )}
                              </div>
                              {unit.priceDetails?.tokenAmount && (
                                <div className="text-sm text-slate-500">
                                  Token: ₹
                                  {parseInt(
                                    unit.priceDetails.tokenAmount,
                                  ).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                unit.isBeingEdited
                                  ? "bg-blue-100 text-blue-800"
                                  : unit.lastSaved
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {unit.isBeingEdited
                                ? "Being Edited"
                                : unit.lastSaved
                                  ? "Saved"
                                  : "Not Edited"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-slate-700">
                              {unit.lastSaved ? (
                                new Date(unit.lastSaved).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  },
                                )
                              ) : (
                                <span className="text-slate-400 italic">
                                  Never
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {unit.isComplete ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                                <FaCheckCircle className="w-4 h-4" />
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                                <FaTimesCircle className="w-4 h-4" />
                                In Progress
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleUnitEditFromOverview(unit.id)
                                }
                                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Edit this unit"
                              >
                                <FaPen className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const modal = document.createElement("div");
                                  modal.className =
                                    "fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4";
                                  modal.innerHTML = `
                              <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                                <div class="p-6 border-b border-(--border-soft)">
                                  <h3 class="text-xl font-bold text-slate-900">Unit Details</h3>
                                </div>
                                <div class="p-6 space-y-3">
                                  ${[
                                    ["Name", unit.name],
                                    [
                                      "Area",
                                      unit.area_details?.carpet_area
                                        ? `${unit.area_details.carpet_area} sqft`
                                        : "N/A",
                                    ],
                                    [
                                      "Bedrooms",
                                      unit.propertyFeatures?.bedrooms || "N/A",
                                    ],
                                    [
                                      "Bathrooms",
                                      unit.propertyFeatures?.bathrooms || "N/A",
                                    ],
                                    [
                                      "Price",
                                      unit.priceDetails?.expectedPrice
                                        ? `₹${parseInt(unit.priceDetails.expectedPrice).toLocaleString()}`
                                        : "N/A",
                                    ],
                                    [
                                      "Status",
                                      unit.isComplete
                                        ? "Complete"
                                        : "In Progress",
                                    ],
                                    ["Last Edited", unit.lastSaved || "Never"],
                                  ]
                                    .map(
                                      ([label, value]) => `
                                    <div class="flex justify-between">
                                      <span class="text-slate-600">${label}:</span>
                                      <span class="font-medium text-slate-900">${value}</span>
                                    </div>
                                  `,
                                    )
                                    .join("")}
                                </div>
                                <div class="p-6 border-t border-(--border-soft) flex justify-end">
                                  <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors">
                                    Close
                                  </button>
                                </div>
                              </div>
                            `;
                                  document.body.appendChild(modal);
                                }}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                                title="View details"
                              >
                                <FaEye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {units.length === 0 && (
                  <div className="py-12 text-center">
                    <FaHome className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No Units Created
                    </h3>
                    <p className="text-slate-500">
                      This project doesn't have any units yet.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-slate-500">
                  Showing {units.length} unit(s)
                </div>
              </div>
            </div>
          </div>
        </div>
        {alertConfig && (
          <CustomAlert
            message={alertConfig.message}
            type={alertConfig.type}
            onClose={() => setAlertConfig(null)}
          />
        )}
      </div>
    );
  };

  const isEditMode = !!selectedProject;

  if (showUnitEditingOverview) {
    return renderUnitEditingOverview();
  }

  return (
    <div className="space-y-6 ">
      <ProjectTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        projectType={projectType}
        projectName={projectName}
        units={units}
        selectedUnit={selectedUnit}
        onUnitChange={handleUnitClick}
        isEditMode={!!selectedProject}
        projectId={projectId}
        onClose={onClose}
      />

      {currentTab === 0 && (
        <HomeSection
          projectName={projectName}
          setProjectName={setProjectName}
          projectType={projectType}
          setProjectType={setProjectType}
          city={city}
          setCity={setCity}
          locality={locality}
          setLocality={setLocality}
          landArea={landArea}
          setLandArea={setLandArea}
          revenuePlots={revenuePlots}
          setRevenuePlots={setRevenuePlots}
          revenuePlotsData={revenuePlotsData}
          setRevenuePlotsData={setRevenuePlotsData}
          addRevenuePlotNumber={addRevenuePlotNumber}
          setAddRevenuePlotNumber={setAddRevenuePlotNumber}
          attachment={attachment}
          setAttachment={setAttachment}
          onGenerate={handleGenerateProject}
          constants={constants}
          PROJECT_TYPES={PROJECT_TYPES}
          isEditMode={isEditMode}
          onProceedToMainInfo={() => setCurrentTab(1)}
          editingProjectId={editingProjectId}
        />
      )}

      {currentTab === 1 && (
        <MainInfoSection
          mainInfo={mainInfo}
          setMainInfo={setMainInfo}
          onSave={handleSaveMainInfo}
          unitPrefix={unitPrefix}
          setUnitPrefix={setUnitPrefix}
          numUnits={numUnits}
          setNumUnits={setNumUnits}
          facilities={facilities}
          setFacilities={setFacilities}
          customFacilities={customFacilities}
          setCustomFacilities={setCustomFacilities}
          projectType={projectType}
          PROJECT_TYPES={PROJECT_TYPES}
          projectName={projectName}
          units={units}
          setUnits={setUnits}
          onUnitClick={handleUnitClick}
          selectedUnit={selectedUnit}
          showSpecifications={showSpecifications}
          setShowSpecifications={setShowSpecifications}
          setSelectedUnit={setSelectedUnit}
          checkUnitCompletion={checkUnitCompletion}
          projectId={projectId}
          onContinueToFloors={handleSaveMainInfo}
          FACILITIES={constants?.FACILITIES || []}
          FACING_OPTIONS={constants?.FACING_OPTIONS || []}
          BROKER_LIST={constants?.BROKER_LIST || []}
          INITIAL_MAIN_INFO={constants?.INITIAL_MAIN_INFO || {}}
          INITIAL_FLOOR_DETAILS={constants?.INITIAL_FLOOR_DETAILS || {}}
          INITIAL_PROPERTY_FEATURES={constants?.INITIAL_PROPERTY_FEATURES || {}}
          INITIAL_AREA_DETAILS={constants?.INITIAL_AREA_DETAILS || {}}
          INITIAL_APPROVAL_STATUS={constants?.INITIAL_APPROVAL_STATUS || []}
          INITIAL_TRANSACTION_TYPE={constants?.INITIAL_TRANSACTION_TYPE || {}}
          INITIAL_PRICE_DETAILS={constants?.INITIAL_PRICE_DETAILS || {}}
          isEditMode={isEditMode}
          selectedProject={selectedProject}
          onDeleteUnit={(unitId) => {
            setDeletedUnitIds((prev) => [...prev, unitId]);
          }}
        />
      )}

      {currentTab === 2 && (
        <FloorSection
          floorData={groundFloor}
          setFloorData={setGroundFloor}
          floorName="Ground Floor"
          selectedUnit={selectedUnit}
          floorKey="groundFloor"
          units={units}
          onUnitChange={handleUnitClick}
          onNext={handleSaveGroundFloor}
          isLastFloor={false}
        />
      )}

      {currentTab === 3 && projectType === "duplex" && (
        <FloorSection
          floorData={firstFloor}
          setFloorData={setFirstFloor}
          floorName="1st Floor"
          selectedUnit={selectedUnit}
          floorKey="firstFloor"
          units={units}
          onUnitChange={handleUnitClick}
          onNext={handleSaveFirstFloor}
          isLastFloor={true}
        />
      )}

      {currentTab === 3 && projectType === "triplex" && (
        <FloorSection
          floorData={firstFloor}
          setFloorData={setFirstFloor}
          floorName="1st Floor"
          selectedUnit={selectedUnit}
          floorKey="firstFloor"
          units={units}
          onUnitChange={handleUnitClick}
          onNext={handleSaveFirstFloor}
          isLastFloor={false}
        />
      )}

      {currentTab === 4 && projectType === "triplex" && (
        <FloorSection
          floorData={secondFloor}
          setFloorData={setSecondFloor}
          floorName="2nd Floor"
          selectedUnit={selectedUnit}
          floorKey="secondFloor"
          units={units}
          onUnitChange={handleUnitClick}
          onNext={handleSaveSecondFloor}
          isLastFloor={true}
        />
      )}
      {alertConfig && (
        <CustomAlert
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig(null)}
        />
      )}
    </div>
  );
};

export default DuplexTriplexProject;
