import React, { useState, useEffect } from "react";
import projectService from "./projectService";
import useAuth from "../../hooks/useAuth";
import {
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaList,
  FaBuilding,
  FaHome,
  FaRulerCombined,
  FaSpinner,
  FaInfoCircle,
  FaStar,
  FaSave,
  FaUser,
  FaTimes,
  FaBath,
  FaRuler,
  FaMoneyBill,
  FaUserTie,
  FaUsers,
  FaHardHat,
} from "react-icons/fa";

import {
  INITIAL_PRICE_DETAILS,
  INITIAL_PROPERTY_FEATURES,
  INITIAL_AREA_DETAILS,
  INITIAL_APPROVAL_STATUS,
  INITIAL_TRANSACTION_TYPE,
} from "../project/shared/initialStates";

import {
  FACILITIES,
  COMMERCIAL_TYPES,
} from "../project/shared/Constants";

const CommercialProject = ({
  projectName,
  setProjectName,
  onClose,
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
  onSaveProject,
  isSubtype = false,
  editingProjectId,
  selectedProject,
  PROJECT_TYPES = {
    APARTMENT: "Apartment",
    PLOTTING: "Plotting",
    DUPLEX: "Duplex",
    TRIPLEX: "Triplex",
    COMMERCIAL: "Commercial",
    CUSTOM: "Custom",
  },
}) => {
  const { user } = useAuth();

  const [numFloors, setNumFloors] = useState();
  const [totalUnits, setTotalUnits] = useState();
  const [floorConfigurations, setFloorConfigurations] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitPrefix, setUnitPrefix] = useState("");
  const [priceDetails, setPriceDetails] = useState(INITIAL_PRICE_DETAILS);
  const isEditMode = Boolean(editingProjectId);

  const [propertyFeatures, setPropertyFeatures] = useState(
    INITIAL_PROPERTY_FEATURES,
  );
  const [areaDetails, setAreaDetails] = useState(INITIAL_AREA_DETAILS);
  const [broker, setBroker] = useState("");
  const [purchaser, setPurchaser] = useState("");
  const [constructorName, setConstructor] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(INITIAL_APPROVAL_STATUS);
  const [transactionType, setTransactionType] = useState(
    INITIAL_TRANSACTION_TYPE,
  );
  const [unitCustomFacilities, setUnitCustomFacilities] = useState([]);
  const [staffEngaged, setStaffEngaged] = useState("");
  const [loanProvider, setLoanProvider] = useState("");
  const [loanDetails, setLoanDetails] = useState({ amount: "" });

  const [landArea, setLandArea] = useState();
  const [revenuePlots, setRevenuePlots] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [plotsData, setPlotsData] = useState([]);
  const [existingPlotNumbers, setExistingPlotNumbers] = useState(new Set());
  const [isSavingPlots, setIsSavingPlots] = useState(false);

  const [projectId, setProjectId] = useState(editingProjectId || null);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [customFacilities, setCustomFacilities] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [contractorsList, setContractorsList] = useState([]);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [brokersList, setBrokersList] = useState([]);
  const [loadingBrokers, setLoadingBrokers] = useState(false);

  useEffect(() => {
    if (editingProjectId) {
      setProjectId(editingProjectId);
    }
  }, [editingProjectId]);

  useEffect(() => {
    if (!selectedProject) return;

    setProjectId(selectedProject.id || editingProjectId || null);
    setProjectName(selectedProject.name || "");
    setCommercialSubType(selectedProject.commercial_sub_type || "");
    setCity(selectedProject.city || "");
    setLocality(selectedProject.locality || "");
    setLandZone(selectedProject.land_zone || "");
    setUnitPrefix(selectedProject.unit_prefix || "");

    if (selectedProject.units_data) {
      try {
        const parsedUnits =
          typeof selectedProject.units_data === "string"
            ? JSON.parse(selectedProject.units_data)
            : selectedProject.units_data;

        if (Array.isArray(parsedUnits)) {
          setUnits(parsedUnits);
        }
      } catch (e) {
        console.error("Failed to parse units_data", e);
      }
    }

    if (selectedProject.num_floors) {
      setNumFloors(selectedProject.num_floors);
    }

    if (selectedProject.total_units) {
      setTotalUnits(selectedProject.total_units);
    }

    setLandArea(
      selectedProject.land_area || selectedProject.total_land_area || "",
    );
    setRevenuePlots(Number(selectedProject.revenue_plots) || 0);

    const rawPlotsData =
      selectedProject.revenue_plots_data || selectedProject.plots_data;
    if (rawPlotsData) {
      try {
        const parsedPlots =
          typeof rawPlotsData === "string"
            ? JSON.parse(rawPlotsData)
            : rawPlotsData;

        setPlotsData(parsedPlots || []);
      } catch (e) {
        console.error("Failed to parse plots_data", e);
        setPlotsData([]);
      }
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoadingBrokers(true);
        const data = await projectService.getAllBrokers();
        setBrokersList(data || []);
      } catch (error) {
        console.error("Failed to fetch brokers:", error);
      } finally {
        setLoadingBrokers(false);
      }
    };

    const fetchContractors = async () => {
      try {
        setLoadingContractors(true);
        const data = await projectService.getAllContractors();
        setContractorsList(data || []);
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      } finally {
        setLoadingContractors(false);
      }
    };

    fetchBrokers();
    fetchContractors();
  }, []);

  useEffect(() => {
    const floorsCount = numFloors === "" ? 0 : parseInt(numFloors) || 0;
    if (floorsCount > 0) {
      const newConfigs = [];
      for (let i = 0; i < floorsCount; i++) {
        newConfigs.push(
          floorConfigurations[i] || {
            floorName: `Floor ${i + 1}`,
            units: 0,
            unitTypes: [],
          },
        );
      }
      setFloorConfigurations(newConfigs);
    } else {
      setFloorConfigurations([]);
    }
  }, [numFloors]);

  const handleNumFloorsChange = (e) => {
    const value = e.target.value;
    setNumFloors(value === "" ? "" : parseInt(value) || 0);
  };

  const handleTotalUnitsChange = (e) => {
    const value = e.target.value;
    setTotalUnits(value === "" ? "" : parseInt(value) || 0);
  };

  const generateUniquePlotNumber = (existingNumbers) => {
    let plotNumber = 1;
    const setToCheck =
      existingNumbers instanceof Set
        ? existingNumbers
        : new Set(existingNumbers || []);
    while (setToCheck.has(plotNumber)) plotNumber++;
    return plotNumber;
  };

  const handleSaveRevenuePlots = async () => {
    const filledPlots = plotsData.filter(
      (plot) =>
        plot &&
        (plot.area || plot.entryPlotNo || plot.khataNo || plot.fileName),
    );

    if (filledPlots.length === 0) {
      alert("No filled plots to save.");
      return;
    }

    setIsSavingPlots(true);

    try {
      const projectData = {
        name: projectName,
        type: projectType,
        commercialSubType,
        city,
        locality,
        landZone,
        total_land_area: landArea,
        revenue_plots: plotsData.length,
        units,
        revenuePlotsData: (plotsData || []).map(({ file, ...rest }) => ({
          ...rest,
          fileName: rest.fileName || (file ? file.name : ""),
        })),
        total_units: totalUnits,
        num_floors: numFloors,
        unitPrefix,
        slug: user?.slug || "",
        subdomain: user?.slug || "",
      };

      await projectService.updateCommercial(projectId, projectData);
      alert(`${filledPlots.length} plot(s) saved to project ${projectId}.`);
    } catch (error) {
      console.error("Error saving revenue plots:", error);
      alert("Failed to save plots.");
    } finally {
      setIsSavingPlots(false);
    }
  };

  const generateUnits = () => {
    if (units.length > 0) {
      const ok = window.confirm(
        "Units already exist. Generating again will overwrite them. Continue?",
      );
      if (!ok) return;
    }

    const unitsCount = totalUnits === "" ? 0 : parseInt(totalUnits) || 0;
    const floorsCount = numFloors === "" ? 0 : parseInt(numFloors) || 0;

    if (totalUnits <= 0) {
      alert("Please enter a valid number of commercial units");
      return;
    }

    if (!unitPrefix.trim()) {
      alert("Please enter a unit prefix");
      return;
    }

    const configuredUnits = floorConfigurations.reduce(
      (sum, floor) => sum + (floor?.units || 0),
      0,
    );
    if (configuredUnits !== totalUnits) {
      alert(
        `Please configure exactly ${totalUnits} commercial units across all floors. Currently configured: ${configuredUnits}`,
      );
      return;
    }

    const newUnits = [];
    let unitCounter = 1;

    for (const floor of floorConfigurations) {
      const floorUnits = floor.units || 0;
      const floorIndex = floorConfigurations.indexOf(floor) + 1;

      for (let i = 1; i <= floorUnits; i++) {
        const unitName = `${unitPrefix} ${unitCounter}`;
        const unitType =
          floor.unitTypes?.[i - 1] || commercialSubType || "Commercial";

        const {
          plotArea,
          plotLength,
          plotBreadth,
          availableFromMonth,
          availableFromYear,
          ...commercialAreaDetails
        } = INITIAL_AREA_DETAILS;
        const { availableFrom, ...commercialTransactionType } =
          INITIAL_TRANSACTION_TYPE;
        const {
          availableFromMonth: pfMonth,
          availableFromYear: pfYear,
          currentlyLeasedOut: pfLeased,
          assuredReturns: pfAssured,
          expectedPrice: pfPrice,
          tokenAmount: pfToken,
          ...commercialPropertyFeatures
        } = INITIAL_PROPERTY_FEATURES;

        const newUnit = {
          id: Date.now() + unitCounter,
          name: unitName,
          floor: floor.floorName,
          floorNumber: floorIndex,
          roomType: unitType,
          unit_prefix: unitPrefix,
          propertyFeatures: {
            ...commercialPropertyFeatures,
            bedrooms: 0,
            bathrooms: 0,
          },
          areaDetails: {
            ...commercialAreaDetails,
            carpetArea: "800",
            builtUpArea: "1000",
          },
          approvalStatus: JSON.parse(JSON.stringify(INITIAL_APPROVAL_STATUS)),
          transactionType: { ...commercialTransactionType },
          priceDetails: { ...INITIAL_PRICE_DETAILS },
          broker: "",
          purchaser: "",
          constructor: "",
          staffEngaged: "",
          loanProvider: "",
          loan: "",
          isComplete: false,
        };

        newUnits.push(newUnit);
        unitCounter++;
      }
    }

    setUnits(newUnits);
    alert(`${newUnits.length} units generated successfully!`);
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setPropertyFeatures(unit.propertyFeatures || INITIAL_PROPERTY_FEATURES);
    setAreaDetails(unit.areaDetails || INITIAL_AREA_DETAILS);
    setPriceDetails(unit.priceDetails || INITIAL_PRICE_DETAILS);
    setBroker(unit.broker || "");
    setPurchaser(unit.purchaser || "");
    setConstructor(unit.constructor || "");
    setStaffEngaged(unit.staffEngaged || "");
    setLoanProvider(unit.loanProvider || "");
    setLoanDetails(unit.loanDetails || { amount: "" });
    setApprovalStatus(
      unit.approvalStatus || unit.approval_status || INITIAL_APPROVAL_STATUS,
    );
    setTransactionType(unit.transactionType || INITIAL_TRANSACTION_TYPE);
  };

  const updateUnitDetails = () => {
    if (!selectedUnit) return;

    const updatedUnits = units.map((unit) => {
      if (unit.id === selectedUnit.id) {
        const {
          plotArea,
          plotLength,
          plotBreadth,
          availableFromMonth,
          availableFromYear,
          ...commercialAreaDetails
        } = areaDetails;
        const { availableFrom, ...commercialTransactionType } = transactionType;
        const {
          availableFromMonth: pfMonth,
          availableFromYear: pfYear,
          currentlyLeasedOut: pfLeased,
          assuredReturns: pfAssured,
          expectedPrice: pfPrice,
          tokenAmount: pfToken,
          ...commercialPropertyFeatures
        } = propertyFeatures;

        const updatedUnit = {
          ...unit,
          unit_prefix: unitPrefix || unit.unit_prefix,
          propertyFeatures: commercialPropertyFeatures,
          areaDetails: commercialAreaDetails,
          approvalStatus,
          approval_status: approvalStatus,
          transactionType: commercialTransactionType,
          priceDetails,
          broker,
          purchaser,
          constructor: constructorName,
          staffEngaged,
          loanProvider,
          possession_status: transactionType?.possessionStatus || "",
          leased_out: transactionType?.currentlyLeasedOut || "",
          assured_returns: transactionType?.assuredReturns || "",
        };
        updatedUnit.isComplete = !!(
          priceDetails.expectedPrice &&
          commercialAreaDetails.carpetArea &&
          purchaser &&
          constructorName
        );
        return updatedUnit;
      }
      return unit;
    });

    setUnits(updatedUnits);
    setSelectedUnit(updatedUnits.find((u) => u.id === selectedUnit.id));
    alert("Unit details updated successfully!");
  };

  const handleApprovalChange = (index, field, value) => {
    const updatedApprovals = [...approvalStatus];
    updatedApprovals[index][field] = value;
    setApprovalStatus(updatedApprovals);
  };

  const addApprovalAuthority = () => {
    setApprovalStatus([...approvalStatus, { authority: "", status: "" }]);
  };

  const removeApprovalAuthority = (index) => {
    setApprovalStatus(approvalStatus.filter((_, i) => i !== index));
  };

  const handlePropertyFeaturesArrayChange = (field, index, value) => {
    const currentArray = propertyFeatures[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    setPropertyFeatures({
      ...propertyFeatures,
      [field]: newArray,
    });
  };

  const renderDynamicFields = (count, label, icon, arrayKey) => {
    const numCount = parseInt(count) || 0;
    if (numCount === 0) return null;

    return (
      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-3 mt-1.5 mb-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            {icon}
            {label} Areas
          </label>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase">
            {numCount} {numCount === 1 ? "Unit" : "Units"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: numCount }).map((_, index) => (
            <div key={index} className="relative group">
              <div className="absolute -top-2 left-2 px-1 bg-white text-[8px] font-bold text-slate-400 z-10 rounded-sm border border-slate-100 group-focus-within:text-emerald-500 group-focus-within:border-emerald-200 transition-colors">
                {label} {index + 1}
              </div>
              <input
                type="number"
                value={
                  (propertyFeatures[arrayKey] &&
                    propertyFeatures[arrayKey][index]) ||
                  ""
                }
                onChange={(e) =>
                  handlePropertyFeaturesArrayChange(
                    arrayKey,
                    index,
                    e.target.value,
                  )
                }
                className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-7 py-1 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 outline-none transition-all text-xs font-semibold text-slate-800 placeholder:text-slate-300 shadow-sm"
                placeholder="0.00"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                SQFT
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getLatestUnits = () => {
    if (!selectedUnit) return units;
    return units.map((unit) => {
      if (unit.id === selectedUnit.id) {
        const {
          plotArea,
          plotLength,
          plotBreadth,
          availableFromMonth,
          availableFromYear,
          ...commercialAreaDetails
        } = areaDetails;
        const { availableFrom, ...commercialTransactionType } = transactionType;
        const {
          availableFromMonth: pfMonth,
          availableFromYear: pfYear,
          currentlyLeasedOut: pfLeased,
          assuredReturns: pfAssured,
          expectedPrice: pfPrice,
          tokenAmount: pfToken,
          ...commercialPropertyFeatures
        } = propertyFeatures;

        const updatedUnit = {
          ...unit,
          unit_prefix: unitPrefix || unit.unit_prefix,
          propertyFeatures: commercialPropertyFeatures,
          areaDetails: commercialAreaDetails,
          approvalStatus,
          approval_status: approvalStatus,
          transactionType: commercialTransactionType,
          priceDetails,
          broker,
          purchaser,
          constructor: constructorName,
          staffEngaged,
          loanProvider,
          possession_status: transactionType?.possessionStatus || "",
          leased_out: transactionType?.currentlyLeasedOut || "",
          assured_returns: transactionType?.assuredReturns || "",
        };
        updatedUnit.isComplete = !!(
          priceDetails.expectedPrice &&
          commercialAreaDetails.carpetArea &&
          purchaser &&
          constructorName
        );
        return updatedUnit;
      }
      return unit;
    });
  };

  const handleCreateProject = async () => {
    if (!projectName || !projectType) {
      alert("Project name and type are required");
      return;
    }

    setIsCreating(true);

    try {
      const latestUnits = getLatestUnits();
      const projectData = {
        name: projectName,
        type: projectType,
        commercialSubType,
        city,
        locality,
        slug: user?.slug || "",
        subdomain: user?.slug || "",
        landZone,
        total_land_area: landArea,
        revenue_plots: revenuePlots || 0,
        revenuePlotsData: (plotsData || []).map(({ file, ...rest }) => ({
          ...rest,
          fileName: rest.fileName || (file ? file.name : ""),
        })),
        units: latestUnits,
        total_units: totalUnits,
        num_floors: numFloors,
        unitPrefix,
      };

      const response = await projectService.createCommercial(projectData);
      setProjectId(response.id);
      setSuccessMessage(
        `Project "${projectName}" created successfully! ID: ${response.id}`,
      );

      if (onSaveProject) {
        onSaveProject({ ...projectData, id: response.id });
      }
    } catch (error) {
      console.error("Error creating commercial project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName || !projectType) {
      alert("Please enter project name and type");
      return;
    }

    try {
      const latestUnits = getLatestUnits();
      const projectData = {
        name: projectName,
        type: projectType,
        commercialSubType,
        city,
        locality,
        slug: user?.slug || "",
        subdomain: user?.slug || "",
        landZone,
        total_land_area: landArea,
        revenue_plots: revenuePlots || 0,
        units: latestUnits,
        revenuePlotsData: (plotsData || []).map(({ file, ...rest }) => ({
          ...rest,
          fileName: rest.fileName || (file ? file.name : ""),
        })),
        total_units: totalUnits,
        num_floors: numFloors,
        unitPrefix,
      };

      if (isSubtype) {
        onSaveProject?.({ ...projectData, id: projectId });
        return;
      }

      if (projectId) {
        await projectService.updateCommercial(projectId, projectData);
        alert("Commercial project updated successfully");
        if (onSaveProject) onSaveProject({ ...projectData, id: projectId });
      } else {
        const response = await projectService.createCommercial(projectData);
        setProjectId(response.id);
        alert(
          `Commercial project created successfully with ID: ${response.id}`,
        );
        if (onSaveProject) onSaveProject({ ...projectData, id: response.id });
      }
    } catch (error) {
      console.error("Error saving commercial project:", error);
      alert("Failed to save project.");
    }
  };

  const calculateTotalPlotsArea = () =>
    plotsData.reduce((total, plot) => total + (parseFloat(plot.area) || 0), 0);

  const getFilledPlotsCount = () =>
    plotsData.filter(
      (plot) =>
        plot &&
        (plot.area || plot.entryPlotNo || plot.khataNo || plot.fileName),
    ).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 relative antialiased text-slate-800">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50/30 transition-all"
        title="Back to Project List"
      >
        <FaTimes size={15} />
      </button>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FaBuilding className="text-emerald-600 text-lg" /> Commercial
            Project Panel
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure metadata, revenue plots, floor architectures, and store
            inventories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            Commercial Scope
          </span>
          {projectId && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              ID: {projectId}
            </span>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center text-sm text-emerald-800">
          <FaCheckCircle className="mr-2 text-emerald-600 shrink-0" />{" "}
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2.5">
          <FaInfoCircle className="text-slate-400" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-wide uppercase">
            Project Information
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all disabled:opacity-60"
                placeholder="e.g. Skyline Corporate Hub"
                disabled={isEditMode}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Project Type *
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select Category</option>
                {Object.values(PROJECT_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Commercial Sub-Type
              </label>
              <select
                value={commercialSubType}
                onChange={(e) => setCommercialSubType(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select Sub-Type</option>
                {COMMERCIAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Total Land Area (sq.ft)
              </label>
              <input
                type="number"
                value={landArea}
                onChange={(e) =>
                  setLandArea(
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  )
                }
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. Mumbai"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Locality
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. Andheri West"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Land Zone
              </label>
              <input
                type="text"
                value={landZone}
                onChange={(e) => setLandZone(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                placeholder="Zone Classification"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={handleCreateProject}
              disabled={isCreating || projectId}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-150 flex items-center gap-2 ${
                projectId
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              }`}
            >
              {isCreating ? (
                <>
                  <FaSpinner className="animate-spin" /> Initializing...
                </>
              ) : projectId ? (
                <>
                  <FaCheckCircle /> Saved & Linked
                </>
              ) : (
                <>
                  Initialize Project <FaSave />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FaList className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm tracking-wide uppercase">
              Revenue Plots Integration
            </h2>
          </div>
          {revenuePlots > 0 && (
            <button
              onClick={() => {
                setPlotsData([]);
                setRevenuePlots(0);
                setAttachment(null);
              }}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 transition"
            >
              Reset Configurations
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Total Revenue Plots
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={revenuePlots}
                onChange={(e) => {
                  const v = e.target.value;
                  const num = parseInt(v) || 0;
                  setRevenuePlots(num);
                  if (num > 0) {
                    const newPlots = [];
                    for (let i = 0; i < num; i++) {
                      newPlots.push(
                        plotsData[i] || {
                          area: "",
                          entryPlotNo: "",
                          khataNo: "",
                          fileName: "",
                          file: null,
                          plotNumber:
                            generateUniquePlotNumber(existingPlotNumbers),
                        },
                      );
                    }
                    setPlotsData(newPlots);
                  } else {
                    setPlotsData([]);
                  }
                }}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Master Plan/Attachment Document
              </label>
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files[0])}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition-all"
              />
              {attachment && (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
                  <FaCheckCircle size={12} /> {attachment.name}
                </p>
              )}
            </div>
          </div>

          {revenuePlots > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Individual Plots Catalog
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plotsData.map((plot, index) => (
                  <div
                    key={index}
                    className="bg-slate-50/50 border border-slate-200/80 rounded-lg p-4 relative group hover:bg-white hover:border-slate-300 transition-all duration-200"
                  >
                    <button
                      onClick={() => {
                        const updated = plotsData.filter((_, i) => i !== index);
                        setPlotsData(updated);
                        setRevenuePlots(updated.length);
                      }}
                      className="absolute top-3 right-3 bg-white text-slate-400 hover:text-rose-500 rounded-md w-6 h-6 border border-slate-200 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-2xs"
                      title="Remove plot"
                    >
                      <FaTrash size={10} />
                    </button>

                    <div className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-3.5 border-b border-slate-100 pb-2">
                      <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      Plot ID #{plot.plotNumber || index + 1}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Plot Area (sq. ft)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={plot?.area || ""}
                          onChange={(e) => {
                            const updated = [...plotsData];
                            updated[index] = {
                              ...updated[index],
                              area: e.target.value,
                            };
                            setPlotsData(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Entry Plot No.
                        </label>
                        <input
                          type="text"
                          value={plot?.entryPlotNo || ""}
                          onChange={(e) => {
                            const updated = [...plotsData];
                            updated[index] = {
                              ...updated[index],
                              entryPlotNo: e.target.value,
                            };
                            setPlotsData(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                          placeholder="Plot Number"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Khata No.
                        </label>
                        <input
                          type="text"
                          value={plot?.khataNo || ""}
                          onChange={(e) => {
                            const updated = [...plotsData];
                            updated[index] = {
                              ...updated[index],
                              khataNo: e.target.value,
                            };
                            setPlotsData(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                          placeholder="Registry No"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Plot Document
                        </label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            const updated = [...plotsData];
                            updated[index] = {
                              ...updated[index],
                              fileName: file ? file.name : "",
                              file: file || null,
                            };
                            setPlotsData(updated);
                          }}
                          className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition-all"
                        />
                        {plot?.fileName && (
                          <p className="text-[10px] text-emerald-600 mt-1 truncate font-medium">
                            ✓ {plot.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">
                    Aggregated Plots Area:{" "}
                    <span className="text-sm font-bold text-slate-900">
                      {calculateTotalPlotsArea().toLocaleString()}
                    </span>{" "}
                    sq. ft
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {getFilledPlotsCount()} of {revenuePlots} metrics resolved
                  </span>
                </div>

                <button
                  onClick={handleSaveRevenuePlots}
                  disabled={
                    isSavingPlots || getFilledPlotsCount() === 0 || !projectId
                  }
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                    isSavingPlots || getFilledPlotsCount() === 0 || !projectId
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isSavingPlots ? "Saving Changes..." : "Commit Plots Layout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2.5">
            <FaRulerCombined className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm tracking-wide uppercase">
              Commercial Grid Architect
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Total Units
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalUnits}
                  onChange={handleTotalUnitsChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Total count"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Number of Floors
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numFloors}
                  onChange={handleNumFloorsChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Max 20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {" "}
                  Prefix
                </label>
                <input
                  type="text"
                  value={unitPrefix}
                  onChange={(e) => setUnitPrefix(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. SHOP, SUITE"
                />
              </div>
            </div>

            {numFloors > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  Structural Floor Breakdown
                </h3>

                <div className="space-y-3">
                  {floorConfigurations.map((floor, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50/50 border border-slate-200 rounded-lg space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Custom Floor Alias
                          </label>
                          <input
                            type="text"
                            value={floor.floorName}
                            onChange={(e) => {
                              const updatedConfigs = [...floorConfigurations];
                              updatedConfigs[index].floorName = e.target.value;
                              setFloorConfigurations(updatedConfigs);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Units Allocation Count
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={floor.units}
                            onChange={(e) => {
                              const unitCount = parseInt(e.target.value) || 0;
                              const currentTotal = floorConfigurations.reduce(
                                (sum, f, i) =>
                                  i === index
                                    ? sum + unitCount
                                    : sum + (f?.units || 0),
                                0,
                              );

                              if (currentTotal > totalUnits) {
                                alert(
                                  `Limit overflow. Master budget capacity set to: ${totalUnits}`,
                                );
                                return;
                              }

                              const updatedConfigs = [...floorConfigurations];
                              updatedConfigs[index].units = unitCount;
                              const currentTypes =
                                updatedConfigs[index].unitTypes || [];
                              if (unitCount > currentTypes.length) {
                                updatedConfigs[index].unitTypes = [
                                  ...currentTypes,
                                  ...Array(
                                    unitCount - currentTypes.length,
                                  ).fill(commercialSubType || "1bhk"),
                                ];
                              } else {
                                updatedConfigs[index].unitTypes =
                                  currentTypes.slice(0, unitCount);
                              }
                              setFloorConfigurations(updatedConfigs);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      {floor.units > 0 && (
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                            Unit Type
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {Array.from(
                              { length: floor.units },
                              (_, unitIndex) => (
                                <select
                                  key={unitIndex}
                                  value={floor.unitTypes?.[unitIndex] || "1bhk"}
                                  onChange={(e) => {
                                    const updatedConfigs = [
                                      ...floorConfigurations,
                                    ];
                                    updatedConfigs[index].unitTypes[unitIndex] =
                                      e.target.value;
                                    setFloorConfigurations(updatedConfigs);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded p-1 text-[11px] text-slate-700 outline-none focus:border-slate-400"
                                >
                                  <option value="1bhk">1 BHK</option>
                                  <option value="2bhk">2 BHK</option>
                                  <option value="3bhk">3 BHK</option>
                                  <option value="4bhk">4 BHK</option>
                                  <option value="5bhk">5 BHK</option>
                                  <option value="6bhk">6 BHK</option>
                                  <option value="7bhk">7 BHK</option>
                                </select>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={generateUnits}
                  disabled={
                    floorConfigurations.reduce(
                      (sum, f) => sum + (f?.units || 0),
                      0,
                    ) !== (totalUnits === "" ? 0 : parseInt(totalUnits) || 0)
                  }
                  className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 ${
                    floorConfigurations.reduce(
                      (sum, f) => sum + (f?.units || 0),
                      0,
                    ) === (totalUnits === "" ? 0 : parseInt(totalUnits) || 0)
                      ? "bg-slate-900 text-white hover:bg-black shadow-xs"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <FaCheckCircle size={12} /> Compile Inventory (
                  {totalUnits || 0} Units)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col max-h-155">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2.5 shrink-0">
            <FaList className="text-slate-400" />
            <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase">
              Compiled Matrix ({units.length})
            </h3>
          </div>

          <div className="p-4 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
            {units.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center my-auto">
                <FaList className="text-slate-200 mb-2" size={24} />
                <p className="text-xs">No stores compiled yet.</p>
              </div>
            ) : (
              units.map((unit, idx) => (
                <div
                  key={unit.id}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    selectedUnit?.id === unit.id
                      ? "bg-emerald-50/60 border-emerald-400/80 shadow-2xs"
                      : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/70"
                  }`}
                  onClick={() => handleUnitClick(unit)}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded shrink-0 ${
                        selectedUnit?.id === unit.id
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <h4
                        className={`text-xs font-semibold truncate ${selectedUnit?.id === unit.id ? "text-emerald-900" : "text-slate-800"}`}
                      >
                        {unit.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {unit.floor} •{" "}
                        <span className="uppercase text-[9px] px-1 bg-slate-200/60 rounded text-slate-600">
                          {unit.roomType}
                        </span>
                      </p>
                    </div>
                  </div>
                  {unit.isComplete && (
                    <FaCheckCircle
                      className="text-emerald-600 shrink-0 ml-2"
                      size={13}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedUnit && (
        <div className="fixed bottom-24 right-6 bg-slate-900 text-white shadow-xl rounded-lg border border-slate-800 p-3 z-40 max-w-xs flex items-center gap-3 animate-fade-in">
          <div className="bg-emerald-500 rounded p-1.5 shrink-0">
            <FaHome size={14} className="text-slate-900" />
          </div>
          <div className="truncate pr-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Modifying Focus Slot
            </p>
            <p className="text-xs font-bold truncate text-white">
              {selectedUnit.name}
            </p>
          </div>
        </div>
      )}

      {selectedUnit && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-md overflow-hidden">
          <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-emerald-400">
                <FaBuilding size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight">
                  {selectedUnit.name} Specifications Profile
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium">
                    {selectedUnit.floor}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                    {selectedUnit.roomType}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={updateUnitDetails}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <FaCheckCircle /> Apply Profile Tweaks
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-slate-50/40 border border-slate-200/60 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <FaStar className="text-amber-500" /> Asset Meta Properties
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Floor No.
                    </label>
                    <select
                      value={propertyFeatures.bookTitle || ""}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          bookTitle: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900 shadow-sm"
                    >
                      <option value="">Select Floor No.</option>
                      <option value="Lower Basement">Lower Basement</option>
                      <option value="Upper Basement">Upper Basement</option>
                      <option value="Ground">Ground</option>
                      {Array.from({ length: 30 }).map((_, i) => {
                        const val = String(i + 1);
                        return (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Total Rooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={propertyFeatures.totalRooms || ""}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          totalRooms: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                      placeholder="Count"
                    />
                  </div>

                  {renderDynamicFields(
                    propertyFeatures.totalRooms,
                    "Room",
                    <FaHome size={10} className="text-emerald-500" />,
                    "roomAreas",
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Personal Washroom
                    </label>
                    <div className="flex gap-2">
                      {["Yes", "No"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setPropertyFeatures({
                              ...propertyFeatures,
                              personalWashroom: opt,
                            })
                          }
                          className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                            propertyFeatures.personalWashroom === opt
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {propertyFeatures.personalWashroom === "Yes" && (
                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-2 mt-1.5 mb-2">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <FaBath size={10} className="text-emerald-500" />
                        Personal Washroom Area
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={propertyFeatures.personalWashroomArea || ""}
                          onChange={(e) =>
                            setPropertyFeatures({
                              ...propertyFeatures,
                              personalWashroomArea: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-7 py-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 outline-none transition-all text-xs font-semibold text-slate-800 placeholder:text-slate-300 shadow-sm"
                          placeholder="0.00"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          SQFT
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Furnishing Status
                    </label>
                    <div className="flex gap-2">
                      {["Furnished", "Semifurnished", "Unfurnished"].map(
                        (opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              setPropertyFeatures({
                                ...propertyFeatures,
                                furnishedStatus: opt,
                              })
                            }
                            className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                              propertyFeatures.furnishedStatus === opt
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Pantry/Cafeteria
                    </label>
                    <div className="flex gap-2">
                      {["Dry", "Wet", "Not Available"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setPropertyFeatures({
                              ...propertyFeatures,
                              pantryCafeteria: opt,
                            })
                          }
                          className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                            propertyFeatures.pantryCafeteria === opt
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Washroom
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={propertyFeatures.washrooms || ""}
                      onChange={(e) =>
                        setPropertyFeatures({
                          ...propertyFeatures,
                          washrooms: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                      placeholder="Washrooms volume"
                    />
                  </div>

                  {renderDynamicFields(
                    propertyFeatures.washrooms,
                    "Washroom",
                    <FaBath size={10} className="text-emerald-500" />,
                    "washroomAreas",
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-600">
                        Amenities
                      </label>
                      <button
                        onClick={() => {
                          const facilityName = prompt(
                            "Enter new facility name:",
                          );
                          if (facilityName && facilityName.trim()) {
                            const trimmedName = facilityName.trim();
                            const newKey = trimmedName
                              .toLowerCase()
                              .replace(/\s+/g, "_");
                            setPropertyFeatures({
                              ...propertyFeatures,
                              [newKey]: true,
                            });
                            setCustomFacilities([
                              ...customFacilities,
                              { key: newKey, label: trimmedName },
                            ]);
                          }
                        }}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                      >
                        <FaPlus size={8} /> Append Custom
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {FACILITIES.slice(0, 6).map((facility) => (
                        <button
                          key={facility.key}
                          onClick={() =>
                            setPropertyFeatures({
                              ...propertyFeatures,
                              [facility.key]: !propertyFeatures[facility.key],
                            })
                          }
                          className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-all flex items-center gap-1 ${
                            propertyFeatures[facility.key]
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {facility.label}
                          {propertyFeatures[facility.key] && (
                            <FaCheckCircle size={9} />
                          )}
                        </button>
                      ))}

                      {customFacilities.map((facility) => (
                        <div key={facility.key} className="group relative">
                          <button
                            onClick={() =>
                              setPropertyFeatures({
                                ...propertyFeatures,
                                [facility.key]: !propertyFeatures[facility.key],
                              })
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-all flex items-center gap-1 pr-5 ${
                              propertyFeatures[facility.key]
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            {facility.label}
                            {propertyFeatures[facility.key] && (
                              <FaCheckCircle size={9} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomFacilities(
                                customFacilities.filter(
                                  (f) => f.key !== facility.key,
                                ),
                              );
                              if (propertyFeatures[facility.key]) {
                                const newFeatures = { ...propertyFeatures };
                                delete newFeatures[facility.key];
                                setPropertyFeatures(newFeatures);
                              }
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 font-bold text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/40 border border-slate-200/60 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <FaRulerCombined className="text-blue-500" /> Dimensional Volume
                Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Carpet Area",
                    key: "carpetArea",
                    icon: <FaRuler className="text-emerald-600" />,
                  },
                  {
                    label: "Built-up Area",
                    key: "builtUpArea",
                    icon: <FaRuler className="text-blue-600" />,
                  },
                  {
                    label: "Super Built-up",
                    key: "superBuiltUpArea",
                    icon: <FaRulerCombined className="text-purple-600" />,
                  },
                  {
                    label: "Construction Area",
                    key: "constructionArea",
                    icon: <FaHardHat className="text-amber-600" />,
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 items-center gap-1.5">
                      {item.icon} {item.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={areaDetails[item.key]}
                        onChange={(e) =>
                          setAreaDetails({
                            ...areaDetails,
                            [item.key]: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                        placeholder="0"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-slate-400">
                        Sq.Ft
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/40 border border-slate-200/60 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <FaHome className="text-emerald-500" /> Transaction Type &
                Property Availability
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Possession Status
                  </label>
                  <div className="flex gap-2">
                    {["Under Construction", "Ready to Move"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setTransactionType({
                            ...transactionType,
                            possessionStatus: opt,
                          })
                        }
                        className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                          transactionType.possessionStatus === opt
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {transactionType.possessionStatus === "Under Construction" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Available From
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={transactionType.availableFromMonth || ""}
                        onChange={(e) =>
                          setTransactionType({
                            ...transactionType,
                            availableFromMonth: e.target.value,
                          })
                        }
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                      >
                        <option value="">Month</option>
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <select
                        value={transactionType.availableFromYear || ""}
                        onChange={(e) =>
                          setTransactionType({
                            ...transactionType,
                            availableFromYear: e.target.value,
                          })
                        }
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 15 }).map((_, i) => {
                          const y = String(new Date().getFullYear() + i);
                          return (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Currently Leased out
                  </label>
                  <div className="flex gap-2">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setTransactionType({
                            ...transactionType,
                            currentlyLeasedOut: opt,
                          })
                        }
                        className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                          transactionType.currentlyLeasedOut === opt
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Assured Returns
                  </label>
                  <div className="flex gap-2">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setTransactionType({
                            ...transactionType,
                            assuredReturns: opt,
                          })
                        }
                        className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                          transactionType.assuredReturns === opt
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/40 border border-slate-200/60 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <FaMoneyBill className="text-emerald-500" /> Capital & Pricing
                Matrix
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Expected Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={priceDetails.expectedPrice}
                      onChange={(e) =>
                        setPriceDetails({
                          ...priceDetails,
                          expectedPrice: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Token Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={priceDetails.tokenAmount}
                      onChange={(e) =>
                        setPriceDetails({
                          ...priceDetails,
                          tokenAmount: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/40 border border-slate-200/60 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                <FaUserTie className="text-purple-500" /> Stakeholders &
                Personnel Allocation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 items-center gap-1">
                    <FaHardHat size={11} className="text-slate-400" />{" "}
                    Engineering Contractor
                  </label>
                  <select
                    value={constructorName || ""}
                    onChange={(e) => setConstructor(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                  >
                    <option value="">
                      {loadingContractors
                        ? "Synchronizing..."
                        : "Select General Contractor"}
                    </option>
                    {contractorsList.map((contractor) => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 items-center gap-1">
                    <FaUsers size={11} className="text-slate-400" /> Brokerage
                    Agency
                  </label>
                  <select
                    value={broker || ""}
                    onChange={(e) => setBroker(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                  >
                    <option value="">
                      {loadingBrokers
                        ? "Synchronizing..."
                        : "Select Broker Office"}
                    </option>
                    {brokersList.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 items-center gap-1">
                    <FaUserTie size={11} className="text-slate-400" /> Staff
                    Engaged
                  </label>
                  <input
                    type="text"
                    value={staffEngaged}
                    onChange={(e) => setStaffEngaged(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                    placeholder="Staff Alias ID"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 items-center gap-1">
                    <FaUser size={11} className="text-slate-400" /> Purchaser
                  </label>
                  <input
                    type="text"
                    value={purchaser}
                    onChange={(e) => setPurchaser(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                    placeholder="Purchaser Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 items-center gap-1">
                    <FaMoneyBill size={11} className="text-slate-400" /> Loan
                    Provider
                  </label>
                  <input
                    type="text"
                    value={loanProvider}
                    onChange={(e) => setLoanProvider(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
                    placeholder="Bank or Financial Institution"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/40 border border-slate-200/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500" /> Approval Status
                  Matrix
                </h3>
                <button
                  type="button"
                  onClick={addApprovalAuthority}
                  className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-1 shadow-sm"
                >
                  <FaPlus size={10} /> Add Authority
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {approvalStatus.map((approval, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-lg border border-slate-200 group relative shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">
                        Approval Authority
                      </label>
                      <input
                        type="text"
                        value={approval.authority}
                        onChange={(e) =>
                          handleApprovalChange(
                            index,
                            "authority",
                            e.target.value,
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500 outline-none text-xs font-bold text-slate-800"
                        placeholder="e.g. BBMP, BDA"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">
                        Current Status
                      </label>
                      <select
                        value={approval.status}
                        onChange={(e) =>
                          handleApprovalChange(index, "status", e.target.value)
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500 outline-none text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        <option value="">Select Status</option>
                        {[
                          "Applied",
                          "Under Review",
                          "Approved",
                          "Rejected",
                          "Pending Docs",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeApprovalAuthority(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 shadow border border-slate-200 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-4 bg-slate-900 text-white px-6 py-3.5 rounded-xl border border-slate-800 shadow-xl z-40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden shrink-0 hidden sm:block">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(units.length / (totalUnits || 1)) * 100}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            <span className="font-bold text-white text-sm">{units.length}</span>{" "}
            / {totalUnits || 0} Units Apportioned
          </div>
        </div>

        <button
          onClick={handleSaveProject}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 shadow-md"
        >
          <FaSave size={12} /> Persist Project File
        </button>
      </div>
    </div>
  );
};

export default CommercialProject;
